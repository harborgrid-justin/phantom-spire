//! Advanced request cancellation system for NAPI-RS
//! Prevents hung operations and provides graceful shutdown

use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::{broadcast, watch};
use tokio_util::sync::CancellationToken;
use dashmap::DashMap;
use napi::{Error as NapiError, Status, JsObject, Env};

/// Unique identifier for cancellable operations
pub type OperationId = u64;

/// Operation metadata for tracking and cancellation
#[derive(Debug, Clone)]
pub struct OperationMetadata {
    pub id: OperationId,
    pub name: String,
    pub start_time: Instant,
    pub timeout: Option<Duration>,
    pub client_id: String,
}

/// Cancellation reason for debugging and monitoring
#[derive(Debug, Clone)]
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
    completion_sender: Option<broadcast::Sender<Result<String, CancellationReason>>>,
}

impl CancellableOperation {
    /// Check if operation should be cancelled
    pub fn is_cancelled(&self) -> bool {
        self.token.is_cancelled()
    }

    /// Wait for cancellation with timeout
    pub async fn cancelled(&self) -> Result<(), tokio::time::error::Elapsed> {
        if let Some(timeout) = self.metadata.timeout {
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
        if let Some(timeout) = self.metadata.timeout {
            if self.metadata.start_time.elapsed() > timeout {
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

/// Global operation manager for tracking and cancellation
pub struct OperationManager {
    next_id: AtomicU64,
    active_operations: DashMap<OperationId, Arc<CancellableOperation>>,
    shutdown_token: CancellationToken,
    cleanup_task: tokio::task::JoinHandle<()>,
}

impl OperationManager {
    pub fn new() -> Self {
        let shutdown_token = CancellationToken::new();
        let cleanup_task = Self::start_cleanup_task(shutdown_token.clone());

        Self {
            next_id: AtomicU64::new(1),
            active_operations: DashMap::new(),
            shutdown_token,
            cleanup_task,
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

        let (completion_sender, _) = broadcast::channel(1);

        let metadata = OperationMetadata {
            id,
            name,
            start_time: Instant::now(),
            timeout,
            client_id,
        };

        let operation = Arc::new(CancellableOperation {
            metadata,
            token: combined_token,
            completion_sender: Some(completion_sender),
        });

        self.active_operations.insert(id, operation.clone());

        // Set up timeout if specified
        if let Some(timeout_duration) = timeout {
            let manager_ref = unsafe { std::ptr::addr_of!(*self) };
            tokio::spawn(async move {
                tokio::time::sleep(timeout_duration).await;

                // Safety: This is safe because the operation manager is static
                let manager = unsafe { &*manager_ref };
                if let Some(op) = manager.active_operations.get(&id) {
                    op.cancel(CancellationReason::Timeout);
                    manager.active_operations.remove(&id);
                }
            });
        }

        (id, operation)
    }

    /// Cancel a specific operation
    pub fn cancel_operation(&self, id: OperationId, reason: CancellationReason) -> bool {
        if let Some((_, operation)) = self.active_operations.remove(&id) {
            operation.cancel(reason);
            true
        } else {
            false
        }
    }

    /// Cancel all operations for a specific client
    pub fn cancel_client_operations(&self, client_id: &str, reason: CancellationReason) -> usize {
        let mut cancelled_count = 0;
        let to_cancel: Vec<_> = self.active_operations
            .iter()
            .filter(|entry| entry.value().metadata.client_id == client_id)
            .map(|entry| *entry.key())
            .collect();

        for id in to_cancel {
            if self.cancel_operation(id, reason.clone()) {
                cancelled_count += 1;
            }
        }

        cancelled_count
    }

    /// Get statistics about active operations
    pub fn get_stats(&self) -> OperationStats {
        let mut by_client: std::collections::HashMap<String, usize> = std::collections::HashMap::new();
        let mut by_operation: std::collections::HashMap<String, usize> = std::collections::HashMap::new();
        let mut long_running_count = 0;
        let now = Instant::now();

        for entry in self.active_operations.iter() {
            let metadata = &entry.value().metadata;

            *by_client.entry(metadata.client_id.clone()).or_insert(0) += 1;
            *by_operation.entry(metadata.name.clone()).or_insert(0) += 1;

            if now.duration_since(metadata.start_time) > Duration::from_secs(30) {
                long_running_count += 1;
            }
        }

        OperationStats {
            total_active: self.active_operations.len(),
            by_client,
            by_operation,
            long_running_count,
        }
    }

    /// Shutdown all operations gracefully
    pub async fn shutdown(&self, timeout: Duration) -> usize {
        log::info!("Shutting down operation manager...");

        // Cancel all active operations
        let active_count = self.active_operations.len();
        self.shutdown_token.cancel();

        // Wait for operations to complete or timeout
        let start = Instant::now();
        while !self.active_operations.is_empty() && start.elapsed() < timeout {
            tokio::time::sleep(Duration::from_millis(100)).await;
        }

        let remaining = self.active_operations.len();
        if remaining > 0 {
            log::warn!("Forced shutdown with {} operations still active", remaining);
        }

        self.cleanup_task.abort();
        active_count
    }

    /// Background task to clean up completed operations
    fn start_cleanup_task(shutdown_token: CancellationToken) -> tokio::task::JoinHandle<()> {
        tokio::spawn(async move {
            let mut cleanup_interval = tokio::time::interval(Duration::from_secs(30));

            loop {
                tokio::select! {
                    _ = cleanup_interval.tick() => {
                        // Cleanup logic would go here
                        // For now, we rely on operations removing themselves
                    }
                    _ = shutdown_token.cancelled() => {
                        log::info!("Cleanup task shutting down");
                        break;
                    }
                }
            }
        })
    }
}

/// Global operation manager instance
static OPERATION_MANAGER: once_cell::sync::Lazy<OperationManager> =
    once_cell::sync::Lazy::new(OperationManager::new);

/// Create a cancellable operation
pub fn create_cancellable_operation(
    name: &str,
    timeout: Option<Duration>,
    client_id: &str,
) -> (OperationId, Arc<CancellableOperation>) {
    OPERATION_MANAGER.create_operation(
        name.to_string(),
        timeout,
        client_id.to_string(),
    )
}

/// Cancel an operation by ID
pub fn cancel_operation(id: OperationId, reason: CancellationReason) -> bool {
    OPERATION_MANAGER.cancel_operation(id, reason)
}

/// Cancel all operations for a client
pub fn cancel_client_operations(client_id: &str, reason: CancellationReason) -> usize {
    OPERATION_MANAGER.cancel_client_operations(client_id, reason)
}

/// Get operation statistics
pub fn get_operation_stats() -> OperationStats {
    OPERATION_MANAGER.get_stats()
}

/// Graceful shutdown of all operations
pub async fn shutdown_operations(timeout: Duration) -> usize {
    OPERATION_MANAGER.shutdown(timeout).await
}

/// Operation statistics
#[derive(Debug)]
pub struct OperationStats {
    pub total_active: usize,
    pub by_client: std::collections::HashMap<String, usize>,
    pub by_operation: std::collections::HashMap<String, usize>,
    pub long_running_count: usize,
}

/// NAPI wrapper for AbortSignal integration
pub struct AbortSignalWrapper {
    aborted: Arc<AtomicBool>,
    _event_listener: Option<napi::JsFunction>,
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
        $crate::cancellation::OPERATION_MANAGER.active_operations.remove(&operation_id);

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