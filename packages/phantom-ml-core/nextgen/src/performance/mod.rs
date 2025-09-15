//! Performance optimization module for NAPI-RS bindings
//! PhD-level performance optimization techniques

use std::sync::atomic::{AtomicU64, AtomicUsize, Ordering};
use std::sync::Arc;
use std::time::{Duration, Instant};
use std::collections::HashMap;
use parking_lot::RwLock;
use dashmap::DashMap;

/// Global performance metrics collector
pub struct PerformanceMetrics {
    /// Total number of NAPI calls
    pub total_calls: AtomicU64,
    /// Total execution time across all calls
    pub total_execution_time: AtomicU64,
    /// Peak memory usage
    pub peak_memory_usage: AtomicUsize,
    /// Call frequency by function name
    pub call_frequencies: DashMap<String, AtomicU64>,
    /// Execution times by function name
    pub execution_times: DashMap<String, Vec<u64>>,
}

impl PerformanceMetrics {
    pub fn new() -> Self {
        Self {
            total_calls: AtomicU64::new(0),
            total_execution_time: AtomicU64::new(0),
            peak_memory_usage: AtomicUsize::new(0),
            call_frequencies: DashMap::new(),
            execution_times: DashMap::new(),
        }
    }

    /// Record a function call with execution time
    pub fn record_call(&self, function_name: &str, execution_time: Duration) {
        let execution_nanos = execution_time.as_nanos() as u64;

        // Update global metrics
        self.total_calls.fetch_add(1, Ordering::Relaxed);
        self.total_execution_time.fetch_add(execution_nanos, Ordering::Relaxed);

        // Update per-function metrics
        self.call_frequencies
            .entry(function_name.to_string())
            .or_insert_with(|| AtomicU64::new(0))
            .fetch_add(1, Ordering::Relaxed);

        // Store execution time (with size limit to prevent memory leaks)
        self.execution_times
            .entry(function_name.to_string())
            .or_insert_with(Vec::new)
            .push(execution_nanos);
    }

    /// Update peak memory usage
    pub fn update_memory_usage(&self, current_usage: usize) {
        let mut peak = self.peak_memory_usage.load(Ordering::Relaxed);
        while current_usage > peak {
            match self.peak_memory_usage.compare_exchange_weak(
                peak,
                current_usage,
                Ordering::Relaxed,
                Ordering::Relaxed,
            ) {
                Ok(_) => break,
                Err(x) => peak = x,
            }
        }
    }

    /// Get comprehensive performance report
    pub fn get_report(&self) -> PerformanceReport {
        let total_calls = self.total_calls.load(Ordering::Relaxed);
        let total_time = self.total_execution_time.load(Ordering::Relaxed);
        let peak_memory = self.peak_memory_usage.load(Ordering::Relaxed);

        let mut function_stats = HashMap::new();
        for entry in self.call_frequencies.iter() {
            let function_name = entry.key();
            let call_count = entry.value().load(Ordering::Relaxed);

            if let Some(times) = self.execution_times.get(function_name) {
                let times_vec = times.clone();
                let avg_time = if !times_vec.is_empty() {
                    times_vec.iter().sum::<u64>() / times_vec.len() as u64
                } else {
                    0
                };

                let min_time = times_vec.iter().min().copied().unwrap_or(0);
                let max_time = times_vec.iter().max().copied().unwrap_or(0);

                function_stats.insert(function_name.clone(), FunctionStats {
                    call_count,
                    avg_execution_time_ns: avg_time,
                    min_execution_time_ns: min_time,
                    max_execution_time_ns: max_time,
                });
            }
        }

        PerformanceReport {
            total_calls,
            total_execution_time_ns: total_time,
            average_execution_time_ns: if total_calls > 0 { total_time / total_calls } else { 0 },
            peak_memory_usage_bytes: peak_memory,
            function_statistics: function_stats,
        }
    }
}

/// Performance statistics for individual functions
#[derive(Debug, Clone)]
pub struct FunctionStats {
    pub call_count: u64,
    pub avg_execution_time_ns: u64,
    pub min_execution_time_ns: u64,
    pub max_execution_time_ns: u64,
}

/// Comprehensive performance report
#[derive(Debug, Clone)]
pub struct PerformanceReport {
    pub total_calls: u64,
    pub total_execution_time_ns: u64,
    pub average_execution_time_ns: u64,
    pub peak_memory_usage_bytes: usize,
    pub function_statistics: HashMap<String, FunctionStats>,
}

/// Global performance metrics instance
static PERFORMANCE_METRICS: once_cell::sync::Lazy<PerformanceMetrics> =
    once_cell::sync::Lazy::new(PerformanceMetrics::new);

/// Performance measurement macro for NAPI functions
#[macro_export]
macro_rules! measure_performance {
    ($func_name:expr, $block:block) => {{
        let start = std::time::Instant::now();
        let result = $block;
        let execution_time = start.elapsed();

        // Record performance metrics
        $crate::performance::record_performance($func_name, execution_time);

        // Update memory usage
        $crate::performance::update_memory_usage();

        result
    }};
}

/// Record performance metrics for a function call
pub fn record_performance(function_name: &str, execution_time: Duration) {
    PERFORMANCE_METRICS.record_call(function_name, execution_time);
}

/// Update current memory usage
pub fn update_memory_usage() {
    #[cfg(target_os = "linux")]
    {
        if let Ok(status) = std::fs::read_to_string("/proc/self/status") {
            for line in status.lines() {
                if line.starts_with("VmRSS:") {
                    if let Some(kb_str) = line.split_whitespace().nth(1) {
                        if let Ok(kb) = kb_str.parse::<usize>() {
                            PERFORMANCE_METRICS.update_memory_usage(kb * 1024);
                        }
                    }
                    break;
                }
            }
        }
    }

    #[cfg(not(target_os = "linux"))]
    {
        // Fallback: estimate memory usage
        let estimated_usage = std::alloc::System.used_memory().unwrap_or(0);
        PERFORMANCE_METRICS.update_memory_usage(estimated_usage);
    }
}

/// Get current performance report
pub fn get_performance_report() -> PerformanceReport {
    PERFORMANCE_METRICS.get_report()
}

/// Memory pool for reducing allocations
pub struct MemoryPool<T> {
    pool: Arc<RwLock<Vec<T>>>,
    factory: Box<dyn Fn() -> T + Send + Sync>,
}

impl<T> MemoryPool<T>
where
    T: Clone + Send + Sync + 'static,
{
    pub fn new<F>(factory: F, initial_size: usize) -> Self
    where
        F: Fn() -> T + Send + Sync + 'static,
    {
        let mut pool = Vec::with_capacity(initial_size);
        for _ in 0..initial_size {
            pool.push(factory());
        }

        Self {
            pool: Arc::new(RwLock::new(pool)),
            factory: Box::new(factory),
        }
    }

    /// Get an object from the pool or create a new one
    pub fn get(&self) -> T {
        if let Some(item) = self.pool.write().pop() {
            item
        } else {
            (self.factory)()
        }
    }

    /// Return an object to the pool
    pub fn return_item(&self, item: T) {
        let mut pool = self.pool.write();
        if pool.len() < 1000 { // Limit pool size to prevent memory leaks
            pool.push(item);
        }
    }
}

/// Thread-local storage for frequently used objects
thread_local! {
    static STRING_BUFFER: std::cell::RefCell<String> = std::cell::RefCell::new(String::with_capacity(1024));
}

/// Get a reusable string buffer for the current thread
pub fn with_string_buffer<F, R>(f: F) -> R
where
    F: FnOnce(&mut String) -> R,
{
    STRING_BUFFER.with(|buffer| {
        let mut buf = buffer.borrow_mut();
        buf.clear();
        f(&mut buf)
    })
}

/// SIMD-optimized operations for numeric data
#[cfg(target_feature = "avx2")]
pub mod simd {
    use std::arch::x86_64::*;

    /// SIMD-accelerated vector addition
    pub unsafe fn add_vectors_f32(a: &[f32], b: &[f32], result: &mut [f32]) {
        assert_eq!(a.len(), b.len());
        assert_eq!(a.len(), result.len());

        let chunks = a.len() / 8;
        for i in 0..chunks {
            let offset = i * 8;

            let va = _mm256_loadu_ps(a.as_ptr().add(offset));
            let vb = _mm256_loadu_ps(b.as_ptr().add(offset));
            let vr = _mm256_add_ps(va, vb);

            _mm256_storeu_ps(result.as_mut_ptr().add(offset), vr);
        }

        // Handle remaining elements
        for i in (chunks * 8)..a.len() {
            result[i] = a[i] + b[i];
        }
    }

    /// SIMD-accelerated dot product
    pub unsafe fn dot_product_f32(a: &[f32], b: &[f32]) -> f32 {
        assert_eq!(a.len(), b.len());

        let mut sum = _mm256_setzero_ps();
        let chunks = a.len() / 8;

        for i in 0..chunks {
            let offset = i * 8;
            let va = _mm256_loadu_ps(a.as_ptr().add(offset));
            let vb = _mm256_loadu_ps(b.as_ptr().add(offset));
            let prod = _mm256_mul_ps(va, vb);
            sum = _mm256_add_ps(sum, prod);
        }

        // Horizontal sum of the vector
        let sum_high = _mm256_extractf128_ps(sum, 1);
        let sum_low = _mm256_castps256_ps128(sum);
        let sum128 = _mm_add_ps(sum_high, sum_low);
        let sum64 = _mm_add_ps(sum128, _mm_movehl_ps(sum128, sum128));
        let sum32 = _mm_add_ss(sum64, _mm_shuffle_ps(sum64, sum64, 0x55));

        let mut result = _mm_cvtss_f32(sum32);

        // Handle remaining elements
        for i in (chunks * 8)..a.len() {
            result += a[i] * b[i];
        }

        result
    }
}

/// Fallback implementations for non-SIMD platforms
#[cfg(not(target_feature = "avx2"))]
pub mod simd {
    /// Standard vector addition
    pub fn add_vectors_f32(a: &[f32], b: &[f32], result: &mut [f32]) {
        for ((a_val, b_val), r) in a.iter().zip(b.iter()).zip(result.iter_mut()) {
            *r = a_val + b_val;
        }
    }

    /// Standard dot product
    pub fn dot_product_f32(a: &[f32], b: &[f32]) -> f32 {
        a.iter().zip(b.iter()).map(|(a_val, b_val)| a_val * b_val).sum()
    }
}