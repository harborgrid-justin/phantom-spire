//! Enterprise-grade rate limiting and resource protection for NAPI-RS
//! Prevents DoS attacks and resource exhaustion in ML operations
//! Modernized for NAPI-RS v3.x with enhanced security features

use std::sync::atomic::{AtomicU64, AtomicUsize, Ordering};
use std::sync::Arc;
use std::time::{Duration, Instant};
use dashmap::DashMap;
use tokio::sync::Semaphore;
use serde::{Deserialize, Serialize};

/// Rate limiting configuration for enterprise deployment
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RateLimitConfig {
    pub max_requests_per_minute: u32,
    pub max_concurrent_requests: u32,
    pub max_memory_usage_mb: u32,
    pub max_cpu_usage_percent: f32,
    pub ban_duration_minutes: u32,
    pub enable_adaptive_limits: bool,
    pub enable_priority_queuing: bool,
}

impl Default for RateLimitConfig {
    fn default() -> Self {
        Self {
            max_requests_per_minute: 1000,
            max_concurrent_requests: 50,
            max_memory_usage_mb: 512,
            max_cpu_usage_percent: 80.0,
            ban_duration_minutes: 10,
            enable_adaptive_limits: true,
            enable_priority_queuing: false,
        }
    }
}

impl RateLimitConfig {
    /// Create enterprise configuration with higher limits
    pub fn enterprise() -> Self {
        Self {
            max_requests_per_minute: 5000,
            max_concurrent_requests: 200,
            max_memory_usage_mb: 2048,
            max_cpu_usage_percent: 90.0,
            ban_duration_minutes: 5,
            enable_adaptive_limits: true,
            enable_priority_queuing: true,
        }
    }

    /// Create development configuration with relaxed limits
    pub fn development() -> Self {
        Self {
            max_requests_per_minute: 10000,
            max_concurrent_requests: 100,
            max_memory_usage_mb: 1024,
            max_cpu_usage_percent: 95.0,
            ban_duration_minutes: 1,
            enable_adaptive_limits: false,
            enable_priority_queuing: false,
        }
    }

    /// Validate configuration parameters
    pub fn validate(&self) -> Result<(), RateLimitError> {
        if self.max_requests_per_minute == 0 {
            return Err(RateLimitError::InvalidConfiguration("max_requests_per_minute cannot be 0".to_string()));
        }
        if self.max_concurrent_requests == 0 {
            return Err(RateLimitError::InvalidConfiguration("max_concurrent_requests cannot be 0".to_string()));
        }
        if self.max_cpu_usage_percent <= 0.0 || self.max_cpu_usage_percent > 100.0 {
            return Err(RateLimitError::InvalidConfiguration("max_cpu_usage_percent must be between 0 and 100".to_string()));
        }
        Ok(())
    }
}

/// Client priority levels for enterprise queuing
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
pub enum ClientPriority {
    Low = 0,
    Normal = 1,
    High = 2,
    Critical = 3,
}

impl Default for ClientPriority {
    fn default() -> Self {
        ClientPriority::Normal
    }
}

/// Per-client rate limiting state with enterprise features
#[derive(Debug)]
struct ClientState {
    request_count: AtomicU64,
    last_reset: parking_lot::Mutex<Instant>,
    banned_until: parking_lot::Mutex<Option<Instant>>,
    active_requests: AtomicUsize,
    priority: ClientPriority,
    total_requests: AtomicU64,
    total_violations: AtomicU64,
    last_request_time: parking_lot::Mutex<Instant>,
}

impl ClientState {
    fn new(priority: ClientPriority) -> Self {
        let now = Instant::now();
        Self {
            request_count: AtomicU64::new(0),
            last_reset: parking_lot::Mutex::new(now),
            banned_until: parking_lot::Mutex::new(None),
            active_requests: AtomicUsize::new(0),
            priority,
            total_requests: AtomicU64::new(0),
            total_violations: AtomicU64::new(0),
            last_request_time: parking_lot::Mutex::new(now),
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
        self.total_violations.fetch_add(1, Ordering::Relaxed);
    }

    fn reset_if_needed(&self) {
        let mut last_reset = self.last_reset.lock();
        let now = Instant::now();

        if now.duration_since(*last_reset) >= Duration::from_secs(60) {
            self.request_count.store(0, Ordering::Relaxed);
            *last_reset = now;
        }
    }

    fn update_request_time(&self) {
        *self.last_request_time.lock() = Instant::now();
        self.total_requests.fetch_add(1, Ordering::Relaxed);
    }

    fn get_violation_ratio(&self) -> f64 {
        let total = self.total_requests.load(Ordering::Relaxed);
        let violations = self.total_violations.load(Ordering::Relaxed);
        
        if total == 0 {
            0.0
        } else {
            violations as f64 / total as f64
        }
    }
}

/// Advanced rate limiter with multiple protection mechanisms
pub struct AdvancedRateLimiter {
    config: RateLimitConfig,
    client_states: DashMap<String, Arc<ClientState>>,
    global_semaphore: Arc<Semaphore>,
    system_monitor: SystemMonitor,
    adaptive_controller: AdaptiveController,
    metrics: RateLimiterMetrics,
}

impl AdvancedRateLimiter {
    pub fn new(config: RateLimitConfig) -> Result<Self, RateLimitError> {
        config.validate()?;
        
        let semaphore = Arc::new(Semaphore::new(config.max_concurrent_requests as usize));

        Ok(Self {
            config,
            client_states: DashMap::new(),
            global_semaphore: semaphore,
            system_monitor: SystemMonitor::new(),
            adaptive_controller: AdaptiveController::new(),
            metrics: RateLimiterMetrics::new(),
        })
    }

    /// Register a client with specific priority level
    pub fn register_client(&self, client_id: &str, priority: ClientPriority) {
        self.client_states.insert(
            client_id.to_string(),
            Arc::new(ClientState::new(priority))
        );
    }

    /// Check if request should be allowed with enterprise features
    pub async fn check_request(&self, client_id: &str, operation: &str) -> Result<RequestPermit, RateLimitError> {
        self.metrics.increment_total_requests();

        // Get or create client state
        let client_state = self.client_states
            .entry(client_id.to_string())
            .or_insert_with(|| Arc::new(ClientState::new(ClientPriority::Normal)))
            .clone();

        // Update request tracking
        client_state.update_request_time();

        // Check if client is banned
        if client_state.is_banned() {
            self.metrics.increment_banned_requests();
            return Err(RateLimitError::ClientBanned);
        }

        // Reset rate limit window if needed
        client_state.reset_if_needed();

        // Get current limits (may be adaptive)
        let current_limits = if self.config.enable_adaptive_limits {
            self.adaptive_controller.get_adaptive_limits(&self.config, &self.system_monitor).await
        } else {
            self.config.clone()
        };

        // Check rate limit with priority consideration
        let rate_limit = if client_state.priority >= ClientPriority::High {
            current_limits.max_requests_per_minute * 2 // Higher priority gets 2x limit
        } else {
            current_limits.max_requests_per_minute
        };

        let current_count = client_state.request_count.load(Ordering::Relaxed);
        if current_count >= rate_limit as u64 {
            // Progressive ban duration based on violation history
            let violation_ratio = client_state.get_violation_ratio();
            let ban_multiplier = (1.0 + violation_ratio * 2.0).min(5.0); // Max 5x multiplier
            let ban_duration = Duration::from_secs(
                (current_limits.ban_duration_minutes as f64 * 60.0 * ban_multiplier) as u64
            );
            
            client_state.ban_client(ban_duration);
            self.metrics.increment_rate_limited();
            return Err(RateLimitError::RateLimitExceeded);
        }

        // Check concurrent requests per client
        let concurrent_limit = if client_state.priority >= ClientPriority::High {
            (current_limits.max_concurrent_requests / 2) as usize
        } else {
            (current_limits.max_concurrent_requests / 4) as usize
        };

        let active_requests = client_state.active_requests.load(Ordering::Relaxed);
        if active_requests >= concurrent_limit {
            self.metrics.increment_concurrent_limited();
            return Err(RateLimitError::TooManyConcurrentRequests);
        }

        // Check global system resources
        if let Err(e) = self.system_monitor.check_system_resources(&current_limits).await {
            self.metrics.increment_resource_limited();
            return Err(e);
        }

        // Priority-based semaphore acquisition
        let permit = if self.config.enable_priority_queuing && client_state.priority >= ClientPriority::High {
            // High priority clients get preference
            match self.global_semaphore.clone().try_acquire_owned() {
                Ok(permit) => permit,
                Err(_) => {
                    // If no immediate permit available, wait with timeout
                    tokio::time::timeout(
                        Duration::from_millis(100),
                        self.global_semaphore.clone().acquire_owned()
                    ).await
                    .map_err(|_| RateLimitError::GlobalLimitReached)?
                    .map_err(|_| RateLimitError::GlobalLimitReached)?
                }
            }
        } else {
            self.global_semaphore.clone()
                .acquire_owned()
                .await
                .map_err(|_| RateLimitError::GlobalLimitReached)?
        };

        // Increment counters
        client_state.request_count.fetch_add(1, Ordering::Relaxed);
        client_state.active_requests.fetch_add(1, Ordering::Relaxed);
        self.metrics.increment_allowed_requests();

        Ok(RequestPermit {
            _permit: permit,
            client_state,
            operation: operation.to_string(),
            start_time: Instant::now(),
            metrics: Arc::clone(&self.metrics),
        })
    }

    /// Get comprehensive rate limiting statistics
    pub fn get_stats(&self) -> RateLimitStats {
        let total_clients = self.client_states.len();
        let banned_clients = self.client_states.iter()
            .filter(|entry| entry.value().is_banned())
            .count();

        let total_active_requests: usize = self.client_states.iter()
            .map(|entry| entry.value().active_requests.load(Ordering::Relaxed))
            .sum();

        let priority_breakdown = self.get_priority_breakdown();
        let metrics = self.metrics.get_current_metrics();

        RateLimitStats {
            total_clients,
            banned_clients,
            active_requests: total_active_requests,
            available_permits: self.global_semaphore.available_permits(),
            memory_usage_mb: self.system_monitor.get_memory_usage_mb(),
            cpu_usage_percent: self.system_monitor.get_cpu_usage_percent(),
            priority_breakdown,
            metrics,
        }
    }

    /// Get client priority breakdown
    fn get_priority_breakdown(&self) -> PriorityBreakdown {
        let mut breakdown = PriorityBreakdown::default();

        for entry in self.client_states.iter() {
            match entry.value().priority {
                ClientPriority::Low => breakdown.low_priority += 1,
                ClientPriority::Normal => breakdown.normal_priority += 1,
                ClientPriority::High => breakdown.high_priority += 1,
                ClientPriority::Critical => breakdown.critical_priority += 1,
            }
        }

        breakdown
    }

    /// Update configuration dynamically
    pub fn update_config(&mut self, new_config: RateLimitConfig) -> Result<(), RateLimitError> {
        new_config.validate()?;
        
        // Update semaphore if concurrent limit changed
        if new_config.max_concurrent_requests != self.config.max_concurrent_requests {
            self.global_semaphore = Arc::new(Semaphore::new(new_config.max_concurrent_requests as usize));
        }
        
        self.config = new_config;
        Ok(())
    }
}

/// System resource monitor with enhanced capabilities
struct SystemMonitor {
    last_cpu_check: parking_lot::Mutex<Instant>,
    cpu_usage: AtomicU64, // Stored as percentage * 100
    memory_usage: AtomicU64, // Stored in MB
}

impl SystemMonitor {
    fn new() -> Self {
        Self {
            last_cpu_check: parking_lot::Mutex::new(Instant::now()),
            cpu_usage: AtomicU64::new(0),
            memory_usage: AtomicU64::new(0),
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
            self.memory_usage.store(memory_usage_mb as u64, Ordering::Relaxed);
        }

        let current_cpu = self.cpu_usage.load(Ordering::Relaxed) as f32 / 100.0;
        if current_cpu > config.max_cpu_usage_percent {
            return Err(RateLimitError::CpuLimitExceeded);
        }

        Ok(())
    }

    fn get_memory_usage_mb(&self) -> u32 {
        // Return cached value if available and recent
        let cached = self.memory_usage.load(Ordering::Relaxed) as u32;
        if cached > 0 {
            return cached;
        }

        #[cfg(target_os = "linux")]
        {
            if let Ok(status) = std::fs::read_to_string("/proc/self/status") {
                for line in status.lines() {
                    if line.starts_with("VmRSS:") {
                        if let Some(kb_str) = line.split_whitespace().nth(1) {
                            if let Ok(kb) = kb_str.parse::<u32>() {
                                let mb = kb / 1024;
                                self.memory_usage.store(mb as u64, Ordering::Relaxed);
                                return mb;
                            }
                        }
                    }
                }
            }
        }

        #[cfg(target_os = "windows")]
        {
            // For Windows, we'll use a conservative estimate
            // In production, consider using windows-specific APIs
            return 100; // Conservative default
        }

        #[cfg(target_os = "macos")]
        {
            // For macOS, we'll use a conservative estimate
            // In production, consider using macOS-specific APIs
            return 100; // Conservative default
        }

        0
    }

    fn get_cpu_usage_percent(&self) -> f32 {
        self.cpu_usage.load(Ordering::Relaxed) as f32 / 100.0
    }

    async fn get_cpu_usage(&self) -> f32 {
        // Enhanced CPU usage estimation
        tokio::task::spawn_blocking(|| {
            let start = std::time::Instant::now();
            let mut counter = 0u64;

            // Busy wait for 10ms to measure CPU availability
            while start.elapsed() < Duration::from_millis(10) {
                counter = counter.wrapping_add(1);
            }

            // More sophisticated CPU usage estimation
            // This is still a rough approximation for demonstration
            let baseline = 1_000_000u64; // Baseline counter value
            
            if counter > baseline * 2 {
                10.0 // Very low usage
            } else if counter > baseline {
                30.0 // Low usage
            } else if counter > baseline / 2 {
                60.0 // Medium usage
            } else {
                85.0 // High usage
            }
        }).await.unwrap_or(50.0)
    }
}

/// Adaptive controller for dynamic limit adjustment
struct AdaptiveController {
    adjustment_history: parking_lot::Mutex<Vec<(Instant, f64)>>,
}

impl AdaptiveController {
    fn new() -> Self {
        Self {
            adjustment_history: parking_lot::Mutex::new(Vec::new()),
        }
    }

    async fn get_adaptive_limits(&self, base_config: &RateLimitConfig, monitor: &SystemMonitor) -> RateLimitConfig {
        let cpu_usage = monitor.get_cpu_usage_percent();
        let memory_usage = monitor.get_memory_usage_mb();
        
        // Calculate adjustment factor based on system load
        let cpu_factor = if cpu_usage > base_config.max_cpu_usage_percent * 0.8 {
            0.5 // Reduce limits when CPU is high
        } else if cpu_usage < base_config.max_cpu_usage_percent * 0.3 {
            1.5 // Increase limits when CPU is low
        } else {
            1.0 // Keep current limits
        };

        let memory_factor = if memory_usage > base_config.max_memory_usage_mb * 4 / 5 {
            0.7 // Reduce limits when memory is high
        } else if memory_usage < base_config.max_memory_usage_mb / 3 {
            1.3 // Increase limits when memory is low
        } else {
            1.0
        };

        let adjustment_factor = (cpu_factor * memory_factor).clamp(0.2, 2.0);

        // Record adjustment for analysis
        let mut history = self.adjustment_history.lock();
        history.push((Instant::now(), adjustment_factor));
        
        // Keep only last hour of history
        let cutoff = Instant::now() - Duration::from_secs(3600);
        history.retain(|(time, _)| *time > cutoff);

        // Apply adjustment
        let mut adjusted_config = base_config.clone();
        adjusted_config.max_requests_per_minute = 
            ((base_config.max_requests_per_minute as f64) * adjustment_factor) as u32;
        adjusted_config.max_concurrent_requests = 
            ((base_config.max_concurrent_requests as f64) * adjustment_factor) as u32;

        // Ensure minimum values
        adjusted_config.max_requests_per_minute = adjusted_config.max_requests_per_minute.max(10);
        adjusted_config.max_concurrent_requests = adjusted_config.max_concurrent_requests.max(5);

        adjusted_config
    }
}

/// Rate limiter metrics collection
#[derive(Debug)]
struct RateLimiterMetrics {
    total_requests: AtomicU64,
    allowed_requests: AtomicU64,
    rate_limited: AtomicU64,
    concurrent_limited: AtomicU64,
    resource_limited: AtomicU64,
    banned_requests: AtomicU64,
}

impl RateLimiterMetrics {
    fn new() -> Arc<Self> {
        Arc::new(Self {
            total_requests: AtomicU64::new(0),
            allowed_requests: AtomicU64::new(0),
            rate_limited: AtomicU64::new(0),
            concurrent_limited: AtomicU64::new(0),
            resource_limited: AtomicU64::new(0),
            banned_requests: AtomicU64::new(0),
        })
    }

    fn increment_total_requests(&self) {
        self.total_requests.fetch_add(1, Ordering::Relaxed);
    }

    fn increment_allowed_requests(&self) {
        self.allowed_requests.fetch_add(1, Ordering::Relaxed);
    }

    fn increment_rate_limited(&self) {
        self.rate_limited.fetch_add(1, Ordering::Relaxed);
    }

    fn increment_concurrent_limited(&self) {
        self.concurrent_limited.fetch_add(1, Ordering::Relaxed);
    }

    fn increment_resource_limited(&self) {
        self.resource_limited.fetch_add(1, Ordering::Relaxed);
    }

    fn increment_banned_requests(&self) {
        self.banned_requests.fetch_add(1, Ordering::Relaxed);
    }

    fn get_current_metrics(&self) -> MetricsSnapshot {
        MetricsSnapshot {
            total_requests: self.total_requests.load(Ordering::Relaxed),
            allowed_requests: self.allowed_requests.load(Ordering::Relaxed),
            rate_limited: self.rate_limited.load(Ordering::Relaxed),
            concurrent_limited: self.concurrent_limited.load(Ordering::Relaxed),
            resource_limited: self.resource_limited.load(Ordering::Relaxed),
            banned_requests: self.banned_requests.load(Ordering::Relaxed),
        }
    }
}

/// Request permit with enhanced tracking
pub struct RequestPermit {
    _permit: tokio::sync::OwnedSemaphorePermit,
    client_state: Arc<ClientState>,
    operation: String,
    start_time: Instant,
    metrics: Arc<RateLimiterMetrics>,
}

impl Drop for RequestPermit {
    fn drop(&mut self) {
        // Decrement active request count
        self.client_state.active_requests.fetch_sub(1, Ordering::Relaxed);

        // Log slow operations with priority context
        let duration = self.start_time.elapsed();
        let priority = self.client_state.priority;
        
        if duration > Duration::from_millis(1000) {
            log::warn!(
                "Slow NAPI operation '{}' (priority: {:?}) took {:?}", 
                self.operation, priority, duration
            );
        }

        // Log extremely slow operations as errors
        if duration > Duration::from_secs(10) {
            log::error!(
                "Very slow NAPI operation '{}' (priority: {:?}) took {:?} - possible performance issue", 
                self.operation, priority, duration
            );
        }
    }
}

/// Enhanced rate limiting errors
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RateLimitError {
    RateLimitExceeded,
    TooManyConcurrentRequests,
    ClientBanned,
    GlobalLimitReached,
    MemoryLimitExceeded,
    CpuLimitExceeded,
    InvalidConfiguration(String),
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
            RateLimitError::InvalidConfiguration(msg) => write!(f, "Invalid configuration: {}", msg),
        }
    }
}

impl std::error::Error for RateLimitError {}

/// Priority breakdown statistics
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct PriorityBreakdown {
    pub low_priority: usize,
    pub normal_priority: usize,
    pub high_priority: usize,
    pub critical_priority: usize,
}

/// Metrics snapshot
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetricsSnapshot {
    pub total_requests: u64,
    pub allowed_requests: u64,
    pub rate_limited: u64,
    pub concurrent_limited: u64,
    pub resource_limited: u64,
    pub banned_requests: u64,
}

impl MetricsSnapshot {
    pub fn rejection_rate(&self) -> f64 {
        if self.total_requests == 0 {
            0.0
        } else {
            let rejected = self.rate_limited + self.concurrent_limited + self.resource_limited + self.banned_requests;
            rejected as f64 / self.total_requests as f64
        }
    }

    pub fn success_rate(&self) -> f64 {
        if self.total_requests == 0 {
            0.0
        } else {
            self.allowed_requests as f64 / self.total_requests as f64
        }
    }
}

/// Enhanced rate limiting statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RateLimitStats {
    pub total_clients: usize,
    pub banned_clients: usize,
    pub active_requests: usize,
    pub available_permits: usize,
    pub memory_usage_mb: u32,
    pub cpu_usage_percent: f32,
    pub priority_breakdown: PriorityBreakdown,
    pub metrics: MetricsSnapshot,
}

/// Global rate limiter instance with lazy initialization
static RATE_LIMITER: once_cell::sync::Lazy<AdvancedRateLimiter> =
    once_cell::sync::Lazy::new(|| {
        AdvancedRateLimiter::new(RateLimitConfig::default())
            .expect("Failed to initialize rate limiter with default configuration")
    });

/// Check if a request should be allowed (for use in NAPI functions)
pub async fn check_request_allowed(client_id: &str, operation: &str) -> Result<RequestPermit, RateLimitError> {
    RATE_LIMITER.check_request(client_id, operation).await
}

/// Register a client with specific priority level
pub fn register_client_with_priority(client_id: &str, priority: ClientPriority) {
    RATE_LIMITER.register_client(client_id, priority);
}

/// Get current rate limiting statistics
pub fn get_rate_limit_stats() -> RateLimitStats {
    RATE_LIMITER.get_stats()
}

/// Initialize rate limiter with custom configuration
pub fn initialize_rate_limiter(config: RateLimitConfig) -> Result<(), RateLimitError> {
    config.validate()?;
    // Note: This is a placeholder for custom initialization
    // In practice, you might want to use a different approach for global state management
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use tokio::time::{sleep, Duration};

    #[tokio::test]
    async fn test_rate_limiter_basic() {
        let config = RateLimitConfig {
            max_requests_per_minute: 10,
            max_concurrent_requests: 2,
            ..Default::default()
        };
        
        let limiter = AdvancedRateLimiter::new(config).unwrap();
        
        // First request should succeed
        let permit1 = limiter.check_request("client1", "test_op").await;
        assert!(permit1.is_ok());
        
        // Second request should succeed
        let permit2 = limiter.check_request("client1", "test_op").await;
        assert!(permit2.is_ok());
        
        drop(permit1);
        drop(permit2);
    }

    #[tokio::test]
    async fn test_rate_limit_exceeded() {
        let config = RateLimitConfig {
            max_requests_per_minute: 2,
            max_concurrent_requests: 10,
            ..Default::default()
        };
        
        let limiter = AdvancedRateLimiter::new(config).unwrap();
        
        // Use up the rate limit
        let _permit1 = limiter.check_request("client1", "test_op").await.unwrap();
        let _permit2 = limiter.check_request("client1", "test_op").await.unwrap();
        
        // Third request should fail
        let result = limiter.check_request("client1", "test_op").await;
        assert!(matches!(result, Err(RateLimitError::RateLimitExceeded)));
    }

    #[tokio::test]
    async fn test_client_priority() {
        let config = RateLimitConfig {
            max_requests_per_minute: 2,
            max_concurrent_requests: 10,
            enable_priority_queuing: true,
            ..Default::default()
        };
        
        let limiter = AdvancedRateLimiter::new(config).unwrap();
        
        // Register high priority client
        limiter.register_client("high_client", ClientPriority::High);
        limiter.register_client("normal_client", ClientPriority::Normal);
        
        // High priority client should get 2x rate limit (4 requests vs 2)
        let _p1 = limiter.check_request("high_client", "test").await.unwrap();
        let _p2 = limiter.check_request("high_client", "test").await.unwrap();
        let _p3 = limiter.check_request("high_client", "test").await.unwrap();
        let _p4 = limiter.check_request("high_client", "test").await.unwrap();
        
        // 5th request should fail
        let result = limiter.check_request("high_client", "test").await;
        assert!(matches!(result, Err(RateLimitError::RateLimitExceeded)));
    }

    #[test]
    fn test_config_validation() {
        let invalid_config = RateLimitConfig {
            max_requests_per_minute: 0,
            ..Default::default()
        };
        
        assert!(invalid_config.validate().is_err());
        
        let valid_config = RateLimitConfig::default();
        assert!(valid_config.validate().is_ok());
    }

    #[test]
    fn test_metrics_calculation() {
        let metrics = MetricsSnapshot {
            total_requests: 100,
            allowed_requests: 80,
            rate_limited: 15,
            concurrent_limited: 3,
            resource_limited: 1,
            banned_requests: 1,
        };
        
        assert_eq!(metrics.success_rate(), 0.8);
        assert_eq!(metrics.rejection_rate(), 0.2);
    }
}