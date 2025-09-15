//! Advanced request cancellation system for NAPI-RS
//! Prevents hung operations and provides graceful shutdown
//! Modernized for NAPI-RS v3.x

use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::{broadcast, watch};
use tokio_util::sync::CancellationToken;
use std::collections::HashMap;
use napi::{Error as NapiError, Status, JsObject, Env};
use serde::{Deserialize, Serialize};

/// Unique identifier for cancellable operations
pub type OperationId = u64;

/// Operation metadata for tracking and cancellation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OperationMetadata {
    pub id: OperationId,
    pub name: String,
    pub start_time: String, // Serialized timestamp
    pub timeout_ms: Option<u64>,
    pub client_id: String,
}

impl OperationMetadata {
    pub fn new(id: OperationId, name: String, timeout: Option<Duration>, client_id: String) -> Self {
        Self {
            id,
            name,
            start_time: chrono::Utc::now().to_rfc3339(),
            timeout_ms: timeout.map(|d| d.as_millis() as u64),
            client_id,
        }
    }
}

/// Cancellation reason for debugging and monitoring
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CancellationReason {
    UserRequested,
    Timeout,
    SystemShutdown,
    ResourceExhaustion,
    SecurityViolation,
}

impl std::fmt::Display for CancellationReason {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            CancellationReason::UserRequested => write!(f, "User requested cancellation"),
            CancellationReason::Timeout => write!(f, "Operation timed out"),
            CancellationReason::SystemShutdown => write!(f, "System shutdown"),
            CancellationReason::ResourceExhaustion => write!(f, "Resource exhaustion"),
            CancellationReason::SecurityViolation => write!(f, "Security violation"),
        }
    }
}

/// Cancellable operation handle
pub struct CancellableOperation {
    pub metadata: OperationMetadata,
    pub token: CancellationToken,
    pub start_time: Instant,
    completion_sender: Option<broadcast::Sender<Result<String, CancellationReason>>>,
}

impl CancellableOperation {
    pub fn new(metadata: OperationMetadata, token: CancellationToken) -> Self {
        let (completion_sender, _) = broadcast::channel(1);
        Self {
            metadata,
            token,
            start_time: Instant::now(),
            completion_sender: Some(completion_sender),
        }
    }

    /// Check if operation should be cancelled
    pub fn is_cancelled(&self) -> bool {
        self.token.is_cancelled()
    }

    /// Wait for cancellation with timeout
    pub async fn cancelled(&self) -> Result<(), tokio::time::error::Elapsed> {
        if let Some(timeout_ms) = self.metadata.timeout_ms {
            let timeout = Duration::from_millis(timeout_ms);
            tokio::time::timeout(timeout, self.token.cancelled()).await
        } else {
            self.token.cancelled().await;
            Ok(())
        }
    }

    /// Check cancellation periodically during long operations
    pub async fn check_cancellation(&self) -> Result<(), NapiError> {
        if self.is_cancelled() {
            return Err(NapiError::new(
                Status::Cancelled,
                format!("Operation '{}' was cancelled", self.metadata.name)
            ));
        }

        // Check timeout
        if let Some(timeout_ms) = self.metadata.timeout_ms {
            let timeout = Duration::from_millis(timeout_ms);
            if self.start_time.elapsed() > timeout {
                return Err(NapiError::new(
                    Status::Cancelled,
                    format!("Operation '{}' timed out after {:?}", self.metadata.name, timeout)
                ));
            }
        }

        Ok(())
    }

    /// Complete the operation successfully
    pub fn complete(self, result: String) {
        if let Some(sender) = self.completion_sender {
            let _ = sender.send(Ok(result));
        }
    }

    /// Complete the operation with cancellation
    pub fn cancel(self, reason: CancellationReason) {
        self.token.cancel();
        if let Some(sender) = self.completion_sender {
            let _ = sender.send(Err(reason));
        }
    }
}

/// Thread-safe operation storage using standard HashMap with RwLock
use std::sync::RwLock;

/// Global operation manager for tracking and cancellation
pub struct OperationManager {
    next_id: AtomicU64,
    active_operations: Arc<RwLock<HashMap<OperationId, Arc<CancellableOperation>>>>,
    shutdown_token: CancellationToken,
    cleanup_task: Option<tokio::task::JoinHandle<()>>,
}

impl OperationManager {
    pub fn new() -> Self {
        let shutdown_token = CancellationToken::new();
        let active_operations = Arc::new(RwLock::new(HashMap::new()));
        let cleanup_task = Self::start_cleanup_task(shutdown_token.clone(), active_operations.clone());

        Self {
            next_id: AtomicU64::new(1),
            active_operations,
            shutdown_token,
            cleanup_task: Some(cleanup_task),
        }
    }

    /// Create a new cancellable operation
    pub fn create_operation(
        &self,
        name: String,
        timeout: Option<Duration>,
        client_id: String,
    ) -> (OperationId, Arc<CancellableOperation>) {
        let id = self.next_id.fetch_add(1, Ordering::Relaxed);
        let token = CancellationToken::new();

        // Create child token that cancels if global shutdown occurs
        let operation_token = self.shutdown_token.child_token();
        let combined_token = CancellationToken::new();

        // Link tokens so either can trigger cancellation
        let combined_clone = combined_token.clone();
        let token_clone = token.clone();
        let operation_clone = operation_token.clone();

        tokio::spawn(async move {
            tokio::select! {
                _ = token_clone.cancelled() => combined_clone.cancel(),
                _ = operation_clone.cancelled() => combined_clone.cancel(),
            }
        });

        let metadata = OperationMetadata::new(id, name, timeout, client_id);
        let operation = Arc::new(CancellableOperation::new(metadata, combined_token));

        // Store operation
        {
            let mut ops = self.active_operations.write().unwrap();
            ops.insert(id, operation.clone());
        }

        // Set up timeout if specified
        if let Some(timeout_duration) = timeout {
            let ops_clone = self.active_operations.clone();
            let id_clone = id;
            tokio::spawn(async move {
                tokio::time::sleep(timeout_duration).await;

                if let Ok(mut ops) = ops_clone.write() {
                    if let Some(op) = ops.remove(&id_clone) {
                        op.cancel(CancellationReason::Timeout);
                    }
                }
            });
        }

        (id, operation)
    }

    /// Cancel a specific operation
    pub fn cancel_operation(&self, id: OperationId, reason: CancellationReason) -> bool {
        let mut ops = self.active_operations.write().unwrap();
        if let Some(operation) = ops.remove(&id) {
            operation.cancel(reason);
            true
        } else {
            false
        }
    }

    /// Cancel all operations for a specific client
    pub fn cancel_client_operations(&self, client_id: &str, reason: CancellationReason) -> usize {
        let mut cancelled_count = 0;
        let mut ops = self.active_operations.write().unwrap();
        
        let to_cancel: Vec<OperationId> = ops
            .iter()
            .filter(|(_, op)| op.metadata.client_id == client_id)
            .map(|(id, _)| *id)
            .collect();

        for id in to_cancel {
            if let Some(operation) = ops.remove(&id) {
                operation.cancel(reason.clone());
                cancelled_count += 1;
            }
        }

        cancelled_count
    }

    /// Get statistics about active operations
    pub fn get_stats(&self) -> OperationStats {
        let ops = self.active_operations.read().unwrap();
        let mut by_client: HashMap<String, usize> = HashMap::new();
        let mut by_operation: HashMap<String, usize> = HashMap::new();
        let mut long_running_count = 0;
        let now = Instant::now();

        for (_, operation) in ops.iter() {
            let metadata = &operation.metadata;

            *by_client.entry(metadata.client_id.clone()).or_insert(0) += 1;
            *by_operation.entry(metadata.name.clone()).or_insert(0) += 1;

            if now.duration_since(operation.start_time) > Duration::from_secs(30) {
                long_running_count += 1;
            }
        }

        OperationStats {
            total_active: ops.len(),
            by_client,
            by_operation,
            long_running_count,
        }
    }

    /// Get all active operations metadata
    pub fn get_active_operations(&self) -> Vec<OperationMetadata> {
        let ops = self.active_operations.read().unwrap();
        ops.values().map(|op| op.metadata.clone()).collect()
    }

    /// Shutdown all operations gracefully
    pub async fn shutdown(&self, timeout: Duration) -> usize {
        println!("Shutting down operation manager...");

        // Cancel all active operations
        let active_count = {
            let ops = self.active_operations.read().unwrap();
            ops.len()
        };

        self.shutdown_token.cancel();

        // Wait for operations to complete or timeout
        let start = Instant::now();
        while start.elapsed() < timeout {
            let remaining = {
                let ops = self.active_operations.read().unwrap();
                ops.len()
            };

            if remaining == 0 {
                break;
            }

            tokio::time::sleep(Duration::from_millis(100)).await;
        }

        let remaining = {
            let ops = self.active_operations.read().unwrap();
            ops.len()
        };

        if remaining > 0 {
            println!("Forced shutdown with {} operations still active", remaining);
        }

        active_count
    }

    /// Background task to clean up completed operations
    fn start_cleanup_task(
        shutdown_token: CancellationToken,
        active_operations: Arc<RwLock<HashMap<OperationId, Arc<CancellableOperation>>>>
    ) -> tokio::task::JoinHandle<()> {
        tokio::spawn(async move {
            let mut cleanup_interval = tokio::time::interval(Duration::from_secs(30));

            loop {
                tokio::select! {
                    _ = cleanup_interval.tick() => {
                        // Clean up cancelled or completed operations
                        if let Ok(mut ops) = active_operations.write() {
                            let before_count = ops.len();
                            ops.retain(|_, op| !op.is_cancelled());
                            let after_count = ops.len();
                            
                            if before_count != after_count {
                                println!("Cleaned up {} completed operations", before_count - after_count);
                            }
                        }
                    }
                    _ = shutdown_token.cancelled() => {
                        println!("Cleanup task shutting down");
                        break;
                    }
                }
            }
        })
    }
}

impl Drop for OperationManager {
    fn drop(&mut self) {
        if let Some(cleanup_task) = &self.cleanup_task {
            cleanup_task.abort();
        }
    }
}

/// Global operation manager instance
use std::sync::OnceLock;

static OPERATION_MANAGER: OnceLock<OperationManager> = OnceLock::new();

fn get_operation_manager() -> &'static OperationManager {
    OPERATION_MANAGER.get_or_init(OperationManager::new)
}

/// Create a cancellable operation
pub fn create_cancellable_operation(
    name: &str,
    timeout: Option<Duration>,
    client_id: &str,
) -> (OperationId, Arc<CancellableOperation>) {
    get_operation_manager().create_operation(
        name.to_string(),
        timeout,
        client_id.to_string(),
    )
}

/// Cancel an operation by ID
pub fn cancel_operation(id: OperationId, reason: CancellationReason) -> bool {
    get_operation_manager().cancel_operation(id, reason)
}

/// Cancel all operations for a client
pub fn cancel_client_operations(client_id: &str, reason: CancellationReason) -> usize {
    get_operation_manager().cancel_client_operations(client_id, reason)
}

/// Get operation statistics
pub fn get_operation_stats() -> OperationStats {
    get_operation_manager().get_stats()
}

/// Get all active operations
pub fn get_active_operations() -> Vec<OperationMetadata> {
    get_operation_manager().get_active_operations()
}

/// Graceful shutdown of all operations
pub async fn shutdown_operations(timeout: Duration) -> usize {
    get_operation_manager().shutdown(timeout).await
}

/// Operation statistics
#[derive(Debug, Serialize, Deserialize)]
pub struct OperationStats {
    pub total_active: usize,
    pub by_client: HashMap<String, usize>,
    pub by_operation: HashMap<String, usize>,
    pub long_running_count: usize,
}

/// NAPI wrapper for AbortSignal integration
pub struct AbortSignalWrapper {
    aborted: Arc<AtomicBool>,
    _event_listener: Option<String>, // Simplified for now
}

impl AbortSignalWrapper {
    /// Create wrapper from JavaScript AbortSignal
    pub fn from_js_signal(env: Env, signal: JsObject) -> Result<Self, NapiError> {
        let aborted = Arc::new(AtomicBool::new(false));

        // Check if already aborted
        let aborted_property: bool = signal.get_named_property("aborted")?;
        aborted.store(aborted_property, Ordering::Relaxed);

        // TODO: Set up event listener for 'abort' event
        // This would require more complex NAPI integration

        Ok(Self {
            aborted,
            _event_listener: None,
        })
    }

    /// Check if signal is aborted
    pub fn is_aborted(&self) -> bool {
        self.aborted.load(Ordering::Relaxed)
    }

    /// Convert to cancellation token
    pub fn to_cancellation_token(&self) -> CancellationToken {
        let token = CancellationToken::new();

        if self.is_aborted() {
            token.cancel();
        }

        // TODO: Set up polling or event-based cancellation

        token
    }
}

/// Utility for creating timeout-based cancellation tokens
pub fn create_timeout_token(duration: Duration) -> CancellationToken {
    let token = CancellationToken::new();
    let token_clone = token.clone();
    
    tokio::spawn(async move {
        tokio::time::sleep(duration).await;
        token_clone.cancel();
    });
    
    token
}

/// Utility for creating combined cancellation tokens
pub fn combine_tokens(tokens: Vec<CancellationToken>) -> CancellationToken {
    let combined = CancellationToken::new();
    let combined_clone = combined.clone();
    
    tokio::spawn(async move {
        let mut futures = Vec::new();
        for token in tokens {
            futures.push(Box::pin(token.cancelled()));
        }
        
        if !futures.is_empty() {
            // Wait for any token to be cancelled
            futures::future::select_all(futures).await;
            combined_clone.cancel();
        }
    });
    
    combined
}

/// Macro for creating cancellable NAPI operations
#[macro_export]
macro_rules! with_cancellation {
    ($name:expr, $timeout:expr, $client_id:expr, $body:expr) => {{
        let (operation_id, operation) = $crate::cancellation::create_cancellable_operation(
            $name,
            $timeout,
            $client_id,
        );

        let result = async move {
            let result = $body;

            // Check for cancellation one final time
            operation.check_cancellation().await?;

            Ok(result)
        }.await;

        // Clean up operation
        $crate::cancellation::cancel_operation(operation_id, 
            $crate::cancellation::CancellationReason::UserRequested);

        result
    }};
}

/// Macro for periodic cancellation checks in loops
#[macro_export]
macro_rules! check_cancellation {
    ($operation:expr) => {
        $operation.check_cancellation().await?;
    };
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_operation_creation() {
        let (id, operation) = create_cancellable_operation(
            "test_operation",
            Some(Duration::from_secs(10)),
            "test_client"
        );

        assert!(id > 0);
        assert!(!operation.is_cancelled());
        assert_eq!(operation.metadata.name, "test_operation");
        assert_eq!(operation.metadata.client_id, "test_client");
    }

    #[tokio::test]
    async fn test_operation_cancellation() {
        let (id, operation) = create_cancellable_operation(
            "test_operation",
            None,
            "test_client"
        );

        assert!(!operation.is_cancelled());

        let cancelled = cancel_operation(id, CancellationReason::UserRequested);
        assert!(cancelled);

        // Give a moment for cancellation to propagate
        tokio::time::sleep(Duration::from_millis(10)).await;
        assert!(operation.is_cancelled());
    }

    #[tokio::test]
    async fn test_client_cancellation() {
        let (id1, _op1) = create_cancellable_operation("op1", None, "client1");
        let (id2, _op2) = create_cancellable_operation("op2", None, "client1");
        let (_id3, _op3) = create_cancellable_operation("op3", None, "client2");

        let cancelled_count = cancel_client_operations("client1", CancellationReason::UserRequested);
        assert_eq!(cancelled_count, 2);
    }

    #[tokio::test]
    async fn test_operation_stats() {
        let (_id1, _op1) = create_cancellable_operation("op1", None, "client1");
        let (_id2, _op2) = create_cancellable_operation("op2", None, "client1");
        let (_id3, _op3) = create_cancellable_operation("op1", None, "client2");

        let stats = get_operation_stats();
        assert!(stats.total_active >= 3);
        assert_eq!(stats.by_client.get("client1"), Some(&2));
        assert_eq!(stats.by_client.get("client2"), Some(&1));
        assert_eq!(stats.by_operation.get("op1"), Some(&2));
        assert_eq!(stats.by_operation.get("op2"), Some(&1));
    }

    #[test]
    fn test_timeout_token() {
        let token = create_timeout_token(Duration::from_millis(50));
        assert!(!token.is_cancelled());
        
        // Would need async test to verify timeout cancellation
    }

    #[test]
    fn test_combine_tokens() {
        let token1 = CancellationToken::new();
        let token2 = CancellationToken::new();
        let combined = combine_tokens(vec![token1.clone(), token2]);
        
        assert!(!combined.is_cancelled());
        token1.cancel();
        
        // Would need async test to verify combined cancellation
    }
}