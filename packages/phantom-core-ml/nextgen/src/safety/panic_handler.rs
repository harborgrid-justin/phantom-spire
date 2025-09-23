//! Production-grade panic handling for NAPI-RS
//! Prevents Rust panics from crashing the entire Node.js process

use std::sync::atomic::{AtomicBool, AtomicUsize, Ordering};
use std::sync::Arc;
use std::panic;
use std::thread;
use parking_lot::Mutex;
use napi::{Error as NapiError, Status};

/// Global panic statistics
static PANIC_COUNT: AtomicUsize = AtomicUsize::new(0);
static RECOVERY_MODE: AtomicBool = AtomicBool::new(false);

/// Panic information for debugging
#[derive(Debug, Clone)]
pub struct PanicInfo {
    pub message: String,
    pub location: Option<String>,
    pub thread_id: String,
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub operation: Option<String>,
}

/// Thread-safe panic log
static PANIC_LOG: once_cell::sync::Lazy<Arc<Mutex<Vec<PanicInfo>>>> =
    once_cell::sync::Lazy::new(|| Arc::new(Mutex::new(Vec::new())));

/// Initialize panic handler for production safety
pub fn init_panic_handler() {
    panic::set_hook(Box::new(|panic_info| {
        let panic_count = PANIC_COUNT.fetch_add(1, Ordering::Relaxed);

        // Extract panic information
        let message = if let Some(s) = panic_info.payload().downcast_ref::<&str>() {
            s.to_string()
        } else if let Some(s) = panic_info.payload().downcast_ref::<String>() {
            s.clone()
        } else {
            "Unknown panic".to_string()
        };

        let location = panic_info.location().map(|loc| {
            format!("{}:{}:{}", loc.file(), loc.line(), loc.column())
        });

        let thread_id = format!("{:?}", thread::current().id());

        let panic_info_struct = PanicInfo {
            message: message.clone(),
            location,
            thread_id,
            timestamp: chrono::Utc::now(),
            operation: get_current_operation(),
        };

        // Log panic information
        {
            let mut log = PANIC_LOG.lock();
            log.push(panic_info_struct.clone());

            // Keep only last 100 panics to prevent memory leaks
            if log.len() > 100 {
                log.drain(0..50); // Remove oldest 50 entries
            }
        }

        // Log to system logger
        log::error!(
            "NAPI Panic #{}: {} at {:?} in thread {}",
            panic_count + 1,
            message,
            panic_info_struct.location.as_deref().unwrap_or("unknown"),
            panic_info_struct.thread_id
        );

        // Enable recovery mode if too many panics
        if panic_count >= 10 {
            RECOVERY_MODE.store(true, Ordering::Relaxed);
            log::error!("Too many panics detected, enabling recovery mode");
        }

        // In production, try to gracefully handle the panic
        // instead of aborting the entire process
        if cfg!(not(debug_assertions)) {
            // Log additional context for debugging
            if let Ok(backtrace) = std::env::var("RUST_BACKTRACE") {
                if backtrace == "1" || backtrace == "full" {
                    log::error!("Backtrace: {:?}", std::backtrace::Backtrace::capture());
                }
            }
        }
    }));

    log::info!("Panic handler initialized for production safety");
}

/// Thread-local storage for current operation context
thread_local! {
    static CURRENT_OPERATION: std::cell::RefCell<Option<String>> = std::cell::RefCell::new(None);
}

/// Set current operation for panic context
pub fn set_current_operation(operation: &str) {
    CURRENT_OPERATION.with(|op| {
        *op.borrow_mut() = Some(operation.to_string());
    });
}

/// Clear current operation context
pub fn clear_current_operation() {
    CURRENT_OPERATION.with(|op| {
        *op.borrow_mut() = None;
    });
}

/// Get current operation for panic reporting
fn get_current_operation() -> Option<String> {
    CURRENT_OPERATION.with(|op| op.borrow().clone())
}

/// Safe execution wrapper that catches panics
pub fn catch_panic<F, R>(operation_name: &str, f: F) -> Result<R, NapiError>
where
    F: FnOnce() -> R + panic::UnwindSafe,
{
    // Set operation context
    set_current_operation(operation_name);

    // Check if we're in recovery mode
    if RECOVERY_MODE.load(Ordering::Relaxed) {
        clear_current_operation();
        return Err(NapiError::new(
            Status::GenericFailure,
            "System in recovery mode due to previous panics"
        ));
    }

    // Execute with panic catching
    let result = panic::catch_unwind(f);
    clear_current_operation();

    match result {
        Ok(value) => Ok(value),
        Err(panic_payload) => {
            let panic_message = if let Some(s) = panic_payload.downcast_ref::<&str>() {
                s.to_string()
            } else if let Some(s) = panic_payload.downcast_ref::<String>() {
                s.clone()
            } else {
                "Unknown panic occurred".to_string()
            };

            Err(NapiError::new(
                Status::GenericFailure,
                format!("Operation '{}' panicked: {}", operation_name, panic_message)
            ))
        }
    }
}

/// Async-safe panic catcher for async operations
pub async fn catch_panic_async<F, Fut, R>(operation_name: &str, f: F) -> Result<R, NapiError>
where
    F: FnOnce() -> Fut + Send + 'static,
    Fut: std::future::Future<Output = R> + Send + 'static,
    R: Send + 'static,
{
    // Check recovery mode
    if RECOVERY_MODE.load(Ordering::Relaxed) {
        return Err(NapiError::new(
            Status::GenericFailure,
            "System in recovery mode due to previous panics"
        ));
    }

    // Spawn task with panic handling
    let operation_name = operation_name.to_string();
    let result = tokio::task::spawn(async move {
        let result = panic::AssertUnwindSafe(f()).await;
        result
    }).await;

    match result {
        Ok(value) => Ok(value),
        Err(join_error) => {
            if join_error.is_panic() {
                Err(NapiError::new(
                    Status::GenericFailure,
                    format!("Async operation '{}' panicked: {:?}", operation_name, join_error)
                ))
            } else {
                Err(NapiError::new(
                    Status::Cancelled,
                    format!("Async operation '{}' was cancelled", operation_name)
                ))
            }
        }
    }
}

/// Resource guard that ensures cleanup even on panics
pub struct ResourceGuard<T, F>
where
    F: FnOnce(T),
{
    resource: Option<T>,
    cleanup: Option<F>,
}

impl<T, F> ResourceGuard<T, F>
where
    F: FnOnce(T),
{
    pub fn new(resource: T, cleanup: F) -> Self {
        Self {
            resource: Some(resource),
            cleanup: Some(cleanup),
        }
    }

    pub fn get(&self) -> &T {
        self.resource.as_ref().unwrap()
    }

    pub fn get_mut(&mut self) -> &mut T {
        self.resource.as_mut().unwrap()
    }

    /// Release the resource without cleanup (successful path)
    pub fn release(mut self) -> T {
        let resource = self.resource.take().unwrap();
        self.cleanup.take(); // Prevent cleanup on drop
        resource
    }
}

impl<T, F> Drop for ResourceGuard<T, F>
where
    F: FnOnce(T),
{
    fn drop(&mut self) {
        if let (Some(resource), Some(cleanup)) = (self.resource.take(), self.cleanup.take()) {
            cleanup(resource);
        }
    }
}

/// Memory pool with panic safety
pub struct SafeMemoryPool<T> {
    pool: Arc<Mutex<Vec<T>>>,
    factory: Box<dyn Fn() -> T + Send + Sync>,
    max_size: usize,
}

impl<T> SafeMemoryPool<T>
where
    T: Send + 'static,
{
    pub fn new<F>(factory: F, max_size: usize) -> Self
    where
        F: Fn() -> T + Send + Sync + 'static,
    {
        Self {
            pool: Arc::new(Mutex::new(Vec::with_capacity(max_size))),
            factory: Box::new(factory),
            max_size,
        }
    }

    /// Get resource with automatic cleanup on panic
    pub fn get(&self) -> ResourceGuard<T, impl FnOnce(T)> {
        let resource = {
            let mut pool = self.pool.lock();
            pool.pop().unwrap_or_else(|| (self.factory)())
        };

        let pool_clone = self.pool.clone();
        let max_size = self.max_size;

        ResourceGuard::new(resource, move |resource| {
            let mut pool = pool_clone.lock();
            if pool.len() < max_size {
                pool.push(resource);
            }
            // If pool is full, resource is dropped automatically
        })
    }
}

/// Get panic statistics for monitoring
pub fn get_panic_stats() -> PanicStats {
    let panic_count = PANIC_COUNT.load(Ordering::Relaxed);
    let recovery_mode = RECOVERY_MODE.load(Ordering::Relaxed);

    let recent_panics = {
        let log = PANIC_LOG.lock();
        log.iter()
            .rev()
            .take(10)
            .cloned()
            .collect::<Vec<_>>()
    };

    PanicStats {
        total_panics: panic_count,
        recovery_mode,
        recent_panics,
    }
}

/// Reset recovery mode (use with caution)
pub fn reset_recovery_mode() {
    RECOVERY_MODE.store(false, Ordering::Relaxed);
    log::info!("Recovery mode reset");
}

/// Panic statistics for monitoring
#[derive(Debug)]
pub struct PanicStats {
    pub total_panics: usize,
    pub recovery_mode: bool,
    pub recent_panics: Vec<PanicInfo>,
}

/// Macro for safe NAPI function wrapping
#[macro_export]
macro_rules! safe_napi {
    ($operation:expr, $body:expr) => {
        $crate::safety::panic_handler::catch_panic($operation, || $body)
    };
}

/// Macro for safe async NAPI function wrapping
#[macro_export]
macro_rules! safe_napi_async {
    ($operation:expr, $body:expr) => {
        $crate::safety::panic_handler::catch_panic_async($operation, || async { $body }).await
    };
}
