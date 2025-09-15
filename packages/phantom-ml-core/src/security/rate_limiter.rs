//! Rate limiting and resource protection for NAPI-RS
//! Prevents DoS attacks and resource exhaustion

use std::sync::atomic::{AtomicU64, AtomicUsize, Ordering};
use std::sync::Arc;
use std::time::{Duration, Instant};
use dashmap::DashMap;
use tokio::sync::Semaphore;

/// Rate limiting configuration
#[derive(Debug, Clone)]
pub struct RateLimitConfig {
    pub max_requests_per_minute: u32,
    pub max_concurrent_requests: u32,
    pub max_memory_usage_mb: u32,
    pub max_cpu_usage_percent: f32,
    pub ban_duration_minutes: u32,
}

impl Default for RateLimitConfig {
    fn default() -> Self {
        Self {
            max_requests_per_minute: 1000,
            max_concurrent_requests: 50,
            max_memory_usage_mb: 512,
            max_cpu_usage_percent: 80.0,
            ban_duration_minutes: 10,
        }
    }
}

/// Per-client rate limiting state
#[derive(Debug)]
struct ClientState {
    request_count: AtomicU64,
    last_reset: parking_lot::Mutex<Instant>,
    banned_until: parking_lot::Mutex<Option<Instant>>,
    active_requests: AtomicUsize,
}

impl ClientState {
    fn new() -> Self {
        Self {
            request_count: AtomicU64::new(0),
            last_reset: parking_lot::Mutex::new(Instant::now()),
            banned_until: parking_lot::Mutex::new(None),
            active_requests: AtomicUsize::new(0),
        }
    }

    fn is_banned(&self) -> bool {
        if let Some(banned_until) = *self.banned_until.lock() {
            Instant::now() < banned_until
        } else {
            false
        }
    }

    fn ban_client(&self, duration: Duration) {
        *self.banned_until.lock() = Some(Instant::now() + duration);
    }

    fn reset_if_needed(&self) {
        let mut last_reset = self.last_reset.lock();
        let now = Instant::now();

        if now.duration_since(*last_reset) >= Duration::from_secs(60) {
            self.request_count.store(0, Ordering::Relaxed);
            *last_reset = now;
        }
    }
}

/// Advanced rate limiter with multiple protection mechanisms
pub struct AdvancedRateLimiter {
    config: RateLimitConfig,
    client_states: DashMap<String, Arc<ClientState>>,
    global_semaphore: Arc<Semaphore>,
    system_monitor: SystemMonitor,
}

impl AdvancedRateLimiter {
    pub fn new(config: RateLimitConfig) -> Self {
        let semaphore = Arc::new(Semaphore::new(config.max_concurrent_requests as usize));

        Self {
            config,
            client_states: DashMap::new(),
            global_semaphore: semaphore,
            system_monitor: SystemMonitor::new(),
        }
    }

    /// Check if request should be allowed
    pub async fn check_request(&self, client_id: &str, operation: &str) -> Result<RequestPermit, RateLimitError> {
        // Get or create client state
        let client_state = self.client_states
            .entry(client_id.to_string())
            .or_insert_with(|| Arc::new(ClientState::new()))
            .clone();

        // Check if client is banned
        if client_state.is_banned() {
            return Err(RateLimitError::ClientBanned);
        }

        // Reset rate limit window if needed
        client_state.reset_if_needed();

        // Check rate limit
        let current_count = client_state.request_count.load(Ordering::Relaxed);
        if current_count >= self.config.max_requests_per_minute as u64 {
            // Ban client for repeated violations
            client_state.ban_client(Duration::from_secs(self.config.ban_duration_minutes as u64 * 60));
            return Err(RateLimitError::RateLimitExceeded);
        }

        // Check concurrent requests per client
        let active_requests = client_state.active_requests.load(Ordering::Relaxed);
        if active_requests >= (self.config.max_concurrent_requests / 4) as usize {
            return Err(RateLimitError::TooManyConcurrentRequests);
        }

        // Check global system resources
        if let Err(e) = self.system_monitor.check_system_resources(&self.config).await {
            return Err(e);
        }

        // Acquire global semaphore
        let permit = self.global_semaphore.clone()
            .acquire_owned()
            .await
            .map_err(|_| RateLimitError::GlobalLimitReached)?;

        // Increment counters
        client_state.request_count.fetch_add(1, Ordering::Relaxed);
        client_state.active_requests.fetch_add(1, Ordering::Relaxed);

        Ok(RequestPermit {
            _permit: permit,
            client_state,
            operation: operation.to_string(),
            start_time: Instant::now(),
        })
    }

    /// Get rate limiting statistics
    pub fn get_stats(&self) -> RateLimitStats {
        let total_clients = self.client_states.len();
        let banned_clients = self.client_states.iter()
            .filter(|entry| entry.value().is_banned())
            .count();

        let total_active_requests: usize = self.client_states.iter()
            .map(|entry| entry.value().active_requests.load(Ordering::Relaxed))
            .sum();

        RateLimitStats {
            total_clients,
            banned_clients,
            active_requests: total_active_requests,
            available_permits: self.global_semaphore.available_permits(),
            memory_usage_mb: self.system_monitor.get_memory_usage_mb(),
        }
    }
}

/// System resource monitor
struct SystemMonitor {
    last_cpu_check: parking_lot::Mutex<Instant>,
    cpu_usage: AtomicU64, // Stored as percentage * 100
}

impl SystemMonitor {
    fn new() -> Self {
        Self {
            last_cpu_check: parking_lot::Mutex::new(Instant::now()),
            cpu_usage: AtomicU64::new(0),
        }
    }

    async fn check_system_resources(&self, config: &RateLimitConfig) -> Result<(), RateLimitError> {
        // Check memory usage
        let memory_usage_mb = self.get_memory_usage_mb();
        if memory_usage_mb > config.max_memory_usage_mb {
            return Err(RateLimitError::MemoryLimitExceeded);
        }

        // Check CPU usage (updated every 5 seconds to reduce overhead)
        let mut last_check = self.last_cpu_check.lock();
        let now = Instant::now();

        if now.duration_since(*last_check) >= Duration::from_secs(5) {
            *last_check = now;
            drop(last_check);

            // Async CPU check to avoid blocking
            let cpu_usage = self.get_cpu_usage().await;
            self.cpu_usage.store((cpu_usage * 100.0) as u64, Ordering::Relaxed);
        }

        let current_cpu = self.cpu_usage.load(Ordering::Relaxed) as f32 / 100.0;
        if current_cpu > config.max_cpu_usage_percent {
            return Err(RateLimitError::CpuLimitExceeded);
        }

        Ok(())
    }

    fn get_memory_usage_mb(&self) -> u32 {
        #[cfg(target_os = "linux")]
        {
            if let Ok(status) = std::fs::read_to_string("/proc/self/status") {
                for line in status.lines() {
                    if line.starts_with("VmRSS:") {
                        if let Some(kb_str) = line.split_whitespace().nth(1) {
                            if let Ok(kb) = kb_str.parse::<u32>() {
                                return kb / 1024; // Convert to MB
                            }
                        }
                    }
                }
            }
        }

        #[cfg(target_os = "windows")]
        {
            // Windows memory checking would require additional dependencies
            // For now, return 0 to disable memory checking on Windows
            return 0;
        }

        #[cfg(target_os = "macos")]
        {
            // macOS memory checking would require additional dependencies
            // For now, return 0 to disable memory checking on macOS
            return 0;
        }

        0
    }

    async fn get_cpu_usage(&self) -> f32 {
        // Simple CPU usage estimation
        // In production, consider using a proper system monitoring library
        tokio::task::spawn_blocking(|| {
            let start = std::time::Instant::now();
            let mut counter = 0u64;

            // Busy wait for 10ms to measure CPU
            while start.elapsed() < Duration::from_millis(10) {
                counter = counter.wrapping_add(1);
            }

            // This is a very rough estimation
            // Real CPU monitoring would require system-specific APIs
            if counter > 1_000_000 {
                20.0 // Low usage
            } else if counter > 500_000 {
                50.0 // Medium usage
            } else {
                80.0 // High usage
            }
        }).await.unwrap_or(0.0)
    }
}

/// Request permit that automatically cleans up on drop
pub struct RequestPermit {
    _permit: tokio::sync::OwnedSemaphorePermit,
    client_state: Arc<ClientState>,
    operation: String,
    start_time: Instant,
}

impl Drop for RequestPermit {
    fn drop(&mut self) {
        // Decrement active request count
        self.client_state.active_requests.fetch_sub(1, Ordering::Relaxed);

        // Log slow operations
        let duration = self.start_time.elapsed();
        if duration > Duration::from_millis(1000) {
            log::warn!("Slow NAPI operation '{}' took {:?}", self.operation, duration);
        }
    }
}

/// Rate limiting errors
#[derive(Debug, Clone)]
pub enum RateLimitError {
    RateLimitExceeded,
    TooManyConcurrentRequests,
    ClientBanned,
    GlobalLimitReached,
    MemoryLimitExceeded,
    CpuLimitExceeded,
}

impl std::fmt::Display for RateLimitError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            RateLimitError::RateLimitExceeded => write!(f, "Rate limit exceeded"),
            RateLimitError::TooManyConcurrentRequests => write!(f, "Too many concurrent requests"),
            RateLimitError::ClientBanned => write!(f, "Client is banned"),
            RateLimitError::GlobalLimitReached => write!(f, "Global request limit reached"),
            RateLimitError::MemoryLimitExceeded => write!(f, "Memory usage limit exceeded"),
            RateLimitError::CpuLimitExceeded => write!(f, "CPU usage limit exceeded"),
        }
    }
}

impl std::error::Error for RateLimitError {}

/// Rate limiting statistics
#[derive(Debug, Clone)]
pub struct RateLimitStats {
    pub total_clients: usize,
    pub banned_clients: usize,
    pub active_requests: usize,
    pub available_permits: usize,
    pub memory_usage_mb: u32,
}

/// Global rate limiter instance
static RATE_LIMITER: once_cell::sync::Lazy<AdvancedRateLimiter> =
    once_cell::sync::Lazy::new(|| AdvancedRateLimiter::new(RateLimitConfig::default()));

/// Check if a request should be allowed (for use in NAPI functions)
pub async fn check_request_allowed(client_id: &str, operation: &str) -> Result<RequestPermit, RateLimitError> {
    RATE_LIMITER.check_request(client_id, operation).await
}

/// Get current rate limiting statistics
pub fn get_rate_limit_stats() -> RateLimitStats {
    RATE_LIMITER.get_stats()
}