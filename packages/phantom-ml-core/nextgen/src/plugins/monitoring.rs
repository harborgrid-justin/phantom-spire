//! Plugin Monitoring and Observability
//!
//! Provides comprehensive monitoring, logging, metrics collection, and observability
//! features for the plugin system with real-time dashboards and alerting.

use super::*;
use std::collections::{HashMap, VecDeque};
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::{mpsc, RwLock};
use tokio::time::interval;
use tracing::{debug, error, info, instrument, warn};

/// Monitoring configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MonitoringConfig {
    /// Enable metrics collection
    pub metrics_enabled: bool,
    /// Metrics collection interval in seconds
    pub metrics_interval_secs: u64,
    /// Maximum number of metric points to retain
    pub max_metric_points: usize,
    /// Enable performance tracking
    pub performance_tracking: bool,
    /// Enable resource usage monitoring
    pub resource_monitoring: bool,
    /// Enable error tracking
    pub error_tracking: bool,
    /// Maximum number of errors to retain
    pub max_error_entries: usize,
    /// Enable distributed tracing
    pub tracing_enabled: bool,
    /// Tracing sampling rate (0.0 to 1.0)
    pub tracing_sample_rate: f64,
    /// Enable real-time monitoring
    pub realtime_monitoring: bool,
    /// Alert thresholds
    pub alert_thresholds: AlertThresholds,
    /// Export configuration
    pub export_config: ExportConfig,
}

/// Alert threshold configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AlertThresholds {
    /// Maximum execution time in milliseconds before alert
    pub max_execution_time_ms: u64,
    /// Maximum memory usage in bytes before alert
    pub max_memory_usage_bytes: u64,
    /// Maximum error rate (0.0 to 1.0) before alert
    pub max_error_rate: f64,
    /// Minimum success rate (0.0 to 1.0) before alert
    pub min_success_rate: f64,
    /// Maximum CPU usage percentage before alert
    pub max_cpu_usage_percent: f64,
    /// Custom alert thresholds
    pub custom_thresholds: HashMap<String, f64>,
}

/// Export configuration for metrics and logs
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExportConfig {
    /// Enable Prometheus metrics export
    pub prometheus_enabled: bool,
    /// Prometheus metrics endpoint
    pub prometheus_endpoint: String,
    /// Enable OpenTelemetry export
    pub opentelemetry_enabled: bool,
    /// OpenTelemetry endpoint
    pub opentelemetry_endpoint: String,
    /// Enable JSON log export
    pub json_logs_enabled: bool,
    /// Log export directory
    pub log_export_directory: Option<String>,
    /// Custom export endpoints
    pub custom_endpoints: HashMap<String, String>,
}

impl Default for MonitoringConfig {
    fn default() -> Self {
        Self {
            metrics_enabled: true,
            metrics_interval_secs: 10,
            max_metric_points: 1000,
            performance_tracking: true,
            resource_monitoring: true,
            error_tracking: true,
            max_error_entries: 500,
            tracing_enabled: true,
            tracing_sample_rate: 1.0,
            realtime_monitoring: true,
            alert_thresholds: AlertThresholds {
                max_execution_time_ms: 30_000,
                max_memory_usage_bytes: 1024 * 1024 * 1024, // 1GB
                max_error_rate: 0.1,
                min_success_rate: 0.95,
                max_cpu_usage_percent: 80.0,
                custom_thresholds: HashMap::new(),
            },
            export_config: ExportConfig {
                prometheus_enabled: false,
                prometheus_endpoint: "0.0.0.0:9090".to_string(),
                opentelemetry_enabled: false,
                opentelemetry_endpoint: "http://localhost:4317".to_string(),
                json_logs_enabled: true,
                log_export_directory: None,
                custom_endpoints: HashMap::new(),
            },
        }
    }
}

/// Plugin performance metrics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginMetrics {
    /// Plugin identifier
    pub plugin_id: String,
    /// Timestamp of the metric
    pub timestamp: DateTime<Utc>,
    /// Execution count
    pub execution_count: u64,
    /// Success count
    pub success_count: u64,
    /// Error count
    pub error_count: u64,
    /// Total execution time in milliseconds
    pub total_execution_time_ms: u64,
    /// Average execution time in milliseconds
    pub average_execution_time_ms: f64,
    /// Memory usage in bytes
    pub memory_usage_bytes: u64,
    /// CPU usage percentage
    pub cpu_usage_percent: f64,
    /// Network requests count
    pub network_requests: u64,
    /// File operations count
    pub file_operations: u64,
    /// Custom metrics
    pub custom_metrics: HashMap<String, f64>,
}

/// System-wide metrics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemMetrics {
    /// Timestamp
    pub timestamp: DateTime<Utc>,
    /// Total number of plugins
    pub total_plugins: u64,
    /// Number of active plugins
    pub active_plugins: u64,
    /// Number of failed plugins
    pub failed_plugins: u64,
    /// Total system memory usage
    pub total_memory_usage_bytes: u64,
    /// Total system CPU usage
    pub total_cpu_usage_percent: f64,
    /// Total executions
    pub total_executions: u64,
    /// System uptime in seconds
    pub uptime_seconds: u64,
    /// Plugin-specific metrics
    pub plugin_metrics: HashMap<String, PluginMetrics>,
}

/// Error tracking entry
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ErrorEntry {
    /// Error identifier
    pub id: String,
    /// Plugin that generated the error
    pub plugin_id: String,
    /// Error timestamp
    pub timestamp: DateTime<Utc>,
    /// Error type/category
    pub error_type: String,
    /// Error message
    pub message: String,
    /// Stack trace if available
    pub stack_trace: Option<String>,
    /// Error severity
    pub severity: ErrorSeverity,
    /// Additional context
    pub context: HashMap<String, serde_json::Value>,
    /// Error count (if this is an aggregated error)
    pub count: u64,
}

/// Error severity levels
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum ErrorSeverity {
    /// Low severity - informational
    Low,
    /// Medium severity - warning
    Medium,
    /// High severity - error that affects functionality
    High,
    /// Critical severity - system-threatening error
    Critical,
}

/// Performance trace for detailed execution analysis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceTrace {
    /// Trace identifier
    pub trace_id: String,
    /// Plugin execution that this trace belongs to
    pub execution_id: Uuid,
    /// Plugin identifier
    pub plugin_id: String,
    /// Trace start time
    pub start_time: DateTime<Utc>,
    /// Trace end time
    pub end_time: Option<DateTime<Utc>>,
    /// Duration in milliseconds
    pub duration_ms: Option<u64>,
    /// Trace spans (sub-operations)
    pub spans: Vec<TraceSpan>,
    /// Trace metadata
    pub metadata: HashMap<String, serde_json::Value>,
}

/// Individual span within a performance trace
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TraceSpan {
    /// Span identifier
    pub span_id: String,
    /// Parent span ID (if this is a nested span)
    pub parent_span_id: Option<String>,
    /// Operation name
    pub operation: String,
    /// Span start time
    pub start_time: DateTime<Utc>,
    /// Span end time
    pub end_time: Option<DateTime<Utc>>,
    /// Span duration in milliseconds
    pub duration_ms: Option<u64>,
    /// Span tags/attributes
    pub tags: HashMap<String, String>,
    /// Span logs/events
    pub logs: Vec<SpanLog>,
}

/// Log entry within a trace span
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SpanLog {
    /// Log timestamp
    pub timestamp: DateTime<Utc>,
    /// Log level
    pub level: String,
    /// Log message
    pub message: String,
    /// Log fields
    pub fields: HashMap<String, serde_json::Value>,
}

/// Alert triggered by monitoring system
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Alert {
    /// Alert identifier
    pub id: String,
    /// Alert type
    pub alert_type: AlertType,
    /// Plugin that triggered the alert
    pub plugin_id: String,
    /// Alert severity
    pub severity: AlertSeverity,
    /// Alert message
    pub message: String,
    /// Alert timestamp
    pub timestamp: DateTime<Utc>,
    /// Threshold that was exceeded
    pub threshold: Option<f64>,
    /// Actual value that triggered the alert
    pub actual_value: Option<f64>,
    /// Alert metadata
    pub metadata: HashMap<String, serde_json::Value>,
    /// Whether the alert is resolved
    pub resolved: bool,
    /// Resolution timestamp
    pub resolved_at: Option<DateTime<Utc>>,
}

/// Alert types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AlertType {
    /// High execution time
    HighExecutionTime,
    /// High memory usage
    HighMemoryUsage,
    /// High error rate
    HighErrorRate,
    /// Low success rate
    LowSuccessRate,
    /// High CPU usage
    HighCpuUsage,
    /// Plugin failure
    PluginFailure,
    /// Resource exhaustion
    ResourceExhaustion,
    /// Custom alert
    Custom(String),
}

/// Alert severity levels
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, PartialOrd, Ord)]
pub enum AlertSeverity {
    /// Informational alert
    Info,
    /// Warning alert
    Warning,
    /// Error alert
    Error,
    /// Critical alert
    Critical,
}

/// Plugin monitoring system
pub struct PluginMonitor {
    config: MonitoringConfig,
    system_metrics: Arc<RwLock<SystemMetrics>>,
    plugin_metrics: Arc<RwLock<HashMap<String, VecDeque<PluginMetrics>>>>,
    error_entries: Arc<RwLock<VecDeque<ErrorEntry>>>,
    performance_traces: Arc<RwLock<HashMap<String, PerformanceTrace>>>,
    active_alerts: Arc<RwLock<HashMap<String, Alert>>>,
    alert_handlers: Arc<RwLock<Vec<Arc<dyn AlertHandler>>>>,
    metric_collectors: Arc<RwLock<Vec<Arc<dyn MetricCollector>>>>,
    start_time: Instant,
    execution_counter: Arc<AtomicU64>,
    monitoring_handle: Option<tokio::task::JoinHandle<()>>,
}

/// Alert handler trait for custom alert processing
#[async_trait]
pub trait AlertHandler: Send + Sync {
    /// Handle an alert
    async fn handle_alert(&self, alert: &Alert) -> PluginResult<()>;

    /// Get handler name
    fn name(&self) -> &str;

    /// Get supported alert types
    fn supported_alert_types(&self) -> Vec<AlertType>;
}

/// Metric collector trait for custom metrics
#[async_trait]
pub trait MetricCollector: Send + Sync {
    /// Collect metrics for a plugin
    async fn collect_plugin_metrics(&self, plugin_id: &str) -> PluginResult<HashMap<String, f64>>;

    /// Collect system metrics
    async fn collect_system_metrics(&self) -> PluginResult<HashMap<String, f64>>;

    /// Get collector name
    fn name(&self) -> &str;
}

impl PluginMonitor {
    /// Create a new plugin monitor
    pub fn new(config: MonitoringConfig) -> Self {
        Self {
            config,
            system_metrics: Arc::new(RwLock::new(SystemMetrics {
                timestamp: Utc::now(),
                total_plugins: 0,
                active_plugins: 0,
                failed_plugins: 0,
                total_memory_usage_bytes: 0,
                total_cpu_usage_percent: 0.0,
                total_executions: 0,
                uptime_seconds: 0,
                plugin_metrics: HashMap::new(),
            })),
            plugin_metrics: Arc::new(RwLock::new(HashMap::new())),
            error_entries: Arc::new(RwLock::new(VecDeque::new())),
            performance_traces: Arc::new(RwLock::new(HashMap::new())),
            active_alerts: Arc::new(RwLock::new(HashMap::new())),
            alert_handlers: Arc::new(RwLock::new(Vec::new())),
            metric_collectors: Arc::new(RwLock::new(Vec::new())),
            start_time: Instant::now(),
            execution_counter: Arc::new(AtomicU64::new(0)),
            monitoring_handle: None,
        }
    }

    /// Start the monitoring system
    #[instrument(skip(self))]
    pub async fn start(&mut self) -> PluginResult<()> {
        info!("Starting plugin monitoring system");

        if self.config.metrics_enabled {
            let monitor = self.clone_for_background();
            let interval_secs = self.config.metrics_interval_secs;

            let handle = tokio::spawn(async move {
                let mut interval = interval(Duration::from_secs(interval_secs));

                loop {
                    interval.tick().await;

                    if let Err(e) = monitor.collect_metrics().await {
                        error!("Failed to collect metrics: {}", e);
                    }

                    if let Err(e) = monitor.check_alerts().await {
                        error!("Failed to check alerts: {}", e);
                    }
                }
            });

            self.monitoring_handle = Some(handle);
        }

        info!("Plugin monitoring system started");
        Ok(())
    }

    /// Record plugin execution
    #[instrument(skip(self, result))]
    pub async fn record_execution(
        &self,
        plugin_id: &str,
        result: &PluginExecutionResult,
    ) -> PluginResult<()> {
        if !self.config.performance_tracking {
            return Ok(());
        }

        debug!("Recording execution for plugin: {}", plugin_id);

        // Update execution counter
        self.execution_counter.fetch_add(1, Ordering::SeqCst);

        // Get or create plugin metrics
        let mut plugin_metrics_map = self.plugin_metrics.write().await;
        let plugin_metrics_queue = plugin_metrics_map
            .entry(plugin_id.to_string())
            .or_insert_with(VecDeque::new);

        // Calculate metrics
        let existing_metrics = plugin_metrics_queue.back().cloned();
        let mut new_metrics = if let Some(existing) = existing_metrics {
            PluginMetrics {
                plugin_id: plugin_id.to_string(),
                timestamp: Utc::now(),
                execution_count: existing.execution_count + 1,
                success_count: if result.success {
                    existing.success_count + 1
                } else {
                    existing.success_count
                },
                error_count: if !result.success {
                    existing.error_count + 1
                } else {
                    existing.error_count
                },
                total_execution_time_ms: existing.total_execution_time_ms + result.execution_time_ms,
                average_execution_time_ms: 0.0, // Will be calculated below
                memory_usage_bytes: result.memory_used_bytes,
                cpu_usage_percent: 0.0, // TODO: Calculate actual CPU usage
                network_requests: existing.network_requests + result.network_requests as u64,
                file_operations: existing.file_operations, // TODO: Track file operations
                custom_metrics: existing.custom_metrics.clone(),
            }
        } else {
            PluginMetrics {
                plugin_id: plugin_id.to_string(),
                timestamp: Utc::now(),
                execution_count: 1,
                success_count: if result.success { 1 } else { 0 },
                error_count: if !result.success { 1 } else { 0 },
                total_execution_time_ms: result.execution_time_ms,
                average_execution_time_ms: 0.0,
                memory_usage_bytes: result.memory_used_bytes,
                cpu_usage_percent: 0.0,
                network_requests: result.network_requests as u64,
                file_operations: 0,
                custom_metrics: HashMap::new(),
            }
        };

        // Calculate average execution time
        if new_metrics.execution_count > 0 {
            new_metrics.average_execution_time_ms =
                new_metrics.total_execution_time_ms as f64 / new_metrics.execution_count as f64;
        }

        // Add to queue and maintain size limit
        plugin_metrics_queue.push_back(new_metrics);
        while plugin_metrics_queue.len() > self.config.max_metric_points {
            plugin_metrics_queue.pop_front();
        }

        // Record errors if execution failed
        if !result.success && self.config.error_tracking {
            if let Some(error_message) = &result.error {
                self.record_error(
                    plugin_id,
                    "ExecutionError",
                    error_message,
                    ErrorSeverity::High,
                    HashMap::new(),
                ).await?;
            }
        }

        Ok(())
    }

    /// Record an error
    #[instrument(skip(self, context))]
    pub async fn record_error(
        &self,
        plugin_id: &str,
        error_type: &str,
        message: &str,
        severity: ErrorSeverity,
        context: HashMap<String, serde_json::Value>,
    ) -> PluginResult<()> {
        if !self.config.error_tracking {
            return Ok(());
        }

        let error_entry = ErrorEntry {
            id: Uuid::new_v4().to_string(),
            plugin_id: plugin_id.to_string(),
            timestamp: Utc::now(),
            error_type: error_type.to_string(),
            message: message.to_string(),
            stack_trace: None, // TODO: Capture stack trace
            severity,
            context,
            count: 1,
        };

        let mut errors = self.error_entries.write().await;
        errors.push_back(error_entry);

        // Maintain size limit
        while errors.len() > self.config.max_error_entries {
            errors.pop_front();
        }

        debug!("Recorded error for plugin {}: {}", plugin_id, message);
        Ok(())
    }

    /// Start a performance trace
    #[instrument(skip(self))]
    pub async fn start_trace(
        &self,
        plugin_id: &str,
        execution_id: Uuid,
        operation: &str,
    ) -> PluginResult<String> {
        if !self.config.tracing_enabled {
            return Ok(String::new());
        }

        let trace_id = Uuid::new_v4().to_string();
        let trace = PerformanceTrace {
            trace_id: trace_id.clone(),
            execution_id,
            plugin_id: plugin_id.to_string(),
            start_time: Utc::now(),
            end_time: None,
            duration_ms: None,
            spans: Vec::new(),
            metadata: HashMap::new(),
        };

        self.performance_traces.write().await.insert(trace_id.clone(), trace);
        debug!("Started trace for plugin {}: {}", plugin_id, trace_id);

        Ok(trace_id)
    }

    /// End a performance trace
    #[instrument(skip(self))]
    pub async fn end_trace(&self, trace_id: &str) -> PluginResult<()> {
        if !self.config.tracing_enabled || trace_id.is_empty() {
            return Ok(());
        }

        let mut traces = self.performance_traces.write().await;
        if let Some(trace) = traces.get_mut(trace_id) {
            let end_time = Utc::now();
            trace.end_time = Some(end_time);
            trace.duration_ms = Some(
                (end_time - trace.start_time).num_milliseconds() as u64
            );
        }

        debug!("Ended trace: {}", trace_id);
        Ok(())
    }

    /// Add alert handler
    pub async fn add_alert_handler(&self, handler: Arc<dyn AlertHandler>) {
        self.alert_handlers.write().await.push(handler);
    }

    /// Add metric collector
    pub async fn add_metric_collector(&self, collector: Arc<dyn MetricCollector>) {
        self.metric_collectors.write().await.push(collector);
    }

    /// Collect metrics from all sources
    async fn collect_metrics(&self) -> PluginResult<()> {
        debug!("Collecting system and plugin metrics");

        // Update system metrics
        let mut system_metrics = self.system_metrics.write().await;
        system_metrics.timestamp = Utc::now();
        system_metrics.uptime_seconds = self.start_time.elapsed().as_secs();
        system_metrics.total_executions = self.execution_counter.load(Ordering::SeqCst);

        // Collect from custom collectors
        let collectors = self.metric_collectors.read().await.clone();
        for collector in collectors {
            match collector.collect_system_metrics().await {
                Ok(metrics) => {
                    // TODO: Merge collected metrics into system metrics
                    debug!("Collected metrics from {}: {:?}", collector.name(), metrics);
                }
                Err(e) => {
                    warn!("Metric collector {} failed: {}", collector.name(), e);
                }
            }
        }

        Ok(())
    }

    /// Check alert conditions
    async fn check_alerts(&self) -> PluginResult<()> {
        debug!("Checking alert conditions");

        let plugin_metrics = self.plugin_metrics.read().await;

        for (plugin_id, metrics_queue) in plugin_metrics.iter() {
            if let Some(latest_metrics) = metrics_queue.back() {
                self.check_plugin_alerts(plugin_id, latest_metrics).await?;
            }
        }

        Ok(())
    }

    /// Check alerts for a specific plugin
    async fn check_plugin_alerts(
        &self,
        plugin_id: &str,
        metrics: &PluginMetrics,
    ) -> PluginResult<()> {
        let thresholds = &self.config.alert_thresholds;

        // Check execution time threshold
        if metrics.average_execution_time_ms > thresholds.max_execution_time_ms as f64 {
            self.trigger_alert(
                plugin_id,
                AlertType::HighExecutionTime,
                AlertSeverity::Warning,
                format!(
                    "Plugin {} has high execution time: {:.2}ms (threshold: {}ms)",
                    plugin_id, metrics.average_execution_time_ms, thresholds.max_execution_time_ms
                ),
                Some(thresholds.max_execution_time_ms as f64),
                Some(metrics.average_execution_time_ms),
            ).await?;
        }

        // Check memory usage threshold
        if metrics.memory_usage_bytes > thresholds.max_memory_usage_bytes {
            self.trigger_alert(
                plugin_id,
                AlertType::HighMemoryUsage,
                AlertSeverity::Error,
                format!(
                    "Plugin {} has high memory usage: {} bytes (threshold: {} bytes)",
                    plugin_id, metrics.memory_usage_bytes, thresholds.max_memory_usage_bytes
                ),
                Some(thresholds.max_memory_usage_bytes as f64),
                Some(metrics.memory_usage_bytes as f64),
            ).await?;
        }

        // Check error rate threshold
        if metrics.execution_count > 0 {
            let error_rate = metrics.error_count as f64 / metrics.execution_count as f64;
            if error_rate > thresholds.max_error_rate {
                self.trigger_alert(
                    plugin_id,
                    AlertType::HighErrorRate,
                    AlertSeverity::Error,
                    format!(
                        "Plugin {} has high error rate: {:.2}% (threshold: {:.2}%)",
                        plugin_id, error_rate * 100.0, thresholds.max_error_rate * 100.0
                    ),
                    Some(thresholds.max_error_rate),
                    Some(error_rate),
                ).await?;
            }

            let success_rate = metrics.success_count as f64 / metrics.execution_count as f64;
            if success_rate < thresholds.min_success_rate {
                self.trigger_alert(
                    plugin_id,
                    AlertType::LowSuccessRate,
                    AlertSeverity::Warning,
                    format!(
                        "Plugin {} has low success rate: {:.2}% (threshold: {:.2}%)",
                        plugin_id, success_rate * 100.0, thresholds.min_success_rate * 100.0
                    ),
                    Some(thresholds.min_success_rate),
                    Some(success_rate),
                ).await?;
            }
        }

        Ok(())
    }

    /// Trigger an alert
    async fn trigger_alert(
        &self,
        plugin_id: &str,
        alert_type: AlertType,
        severity: AlertSeverity,
        message: String,
        threshold: Option<f64>,
        actual_value: Option<f64>,
    ) -> PluginResult<()> {
        let alert_id = format!("{}:{:?}:{}", plugin_id, alert_type, Utc::now().timestamp());

        // Check if similar alert is already active
        {
            let active_alerts = self.active_alerts.read().await;
            for (_, existing_alert) in active_alerts.iter() {
                if existing_alert.plugin_id == plugin_id &&
                   std::mem::discriminant(&existing_alert.alert_type) == std::mem::discriminant(&alert_type) &&
                   !existing_alert.resolved {
                    // Similar alert already active, don't create duplicate
                    return Ok(());
                }
            }
        }

        let alert = Alert {
            id: alert_id.clone(),
            alert_type,
            plugin_id: plugin_id.to_string(),
            severity,
            message: message.clone(),
            timestamp: Utc::now(),
            threshold,
            actual_value,
            metadata: HashMap::new(),
            resolved: false,
            resolved_at: None,
        };

        // Store alert
        self.active_alerts.write().await.insert(alert_id, alert.clone());

        // Process alert with handlers
        let handlers = self.alert_handlers.read().await.clone();
        for handler in handlers {
            if let Err(e) = handler.handle_alert(&alert).await {
                warn!("Alert handler {} failed: {}", handler.name(), e);
            }
        }

        warn!("Alert triggered: {}", message);
        Ok(())
    }

    /// Get current system metrics
    pub async fn get_system_metrics(&self) -> SystemMetrics {
        self.system_metrics.read().await.clone()
    }

    /// Get plugin metrics for a specific plugin
    pub async fn get_plugin_metrics(&self, plugin_id: &str) -> Option<Vec<PluginMetrics>> {
        let metrics = self.plugin_metrics.read().await;
        metrics.get(plugin_id).map(|queue| queue.iter().cloned().collect())
    }

    /// Get recent errors
    pub async fn get_recent_errors(&self, limit: Option<usize>) -> Vec<ErrorEntry> {
        let errors = self.error_entries.read().await;
        let limit = limit.unwrap_or(100);
        errors.iter().rev().take(limit).cloned().collect()
    }

    /// Get active alerts
    pub async fn get_active_alerts(&self) -> Vec<Alert> {
        let alerts = self.active_alerts.read().await;
        alerts.values().filter(|a| !a.resolved).cloned().collect()
    }

    /// Resolve an alert
    pub async fn resolve_alert(&self, alert_id: &str) -> PluginResult<()> {
        let mut alerts = self.active_alerts.write().await;
        if let Some(alert) = alerts.get_mut(alert_id) {
            alert.resolved = true;
            alert.resolved_at = Some(Utc::now());
            info!("Resolved alert: {}", alert_id);
        }
        Ok(())
    }

    /// Get monitoring dashboard data
    pub async fn get_dashboard_data(&self) -> HashMap<String, serde_json::Value> {
        let mut dashboard = HashMap::new();

        // System metrics
        dashboard.insert("system_metrics".to_string(),
            serde_json::to_value(self.get_system_metrics().await).unwrap_or_default());

        // Active alerts count
        let active_alerts = self.get_active_alerts().await;
        dashboard.insert("active_alerts_count".to_string(),
            serde_json::json!(active_alerts.len()));

        // Recent errors count
        let recent_errors = self.get_recent_errors(Some(10)).await;
        dashboard.insert("recent_errors_count".to_string(),
            serde_json::json!(recent_errors.len()));

        // Plugin health summary
        let plugin_metrics = self.plugin_metrics.read().await;
        let mut plugin_health = HashMap::new();
        for (plugin_id, metrics_queue) in plugin_metrics.iter() {
            if let Some(latest) = metrics_queue.back() {
                let success_rate = if latest.execution_count > 0 {
                    latest.success_count as f64 / latest.execution_count as f64
                } else {
                    0.0
                };
                plugin_health.insert(plugin_id.clone(), serde_json::json!({
                    "success_rate": success_rate,
                    "avg_execution_time": latest.average_execution_time_ms,
                    "memory_usage": latest.memory_usage_bytes,
                    "error_count": latest.error_count
                }));
            }
        }
        dashboard.insert("plugin_health".to_string(), serde_json::json!(plugin_health));

        dashboard
    }

    /// Stop monitoring
    pub async fn stop(&mut self) -> PluginResult<()> {
        info!("Stopping plugin monitoring system");

        if let Some(handle) = self.monitoring_handle.take() {
            handle.abort();
        }

        info!("Plugin monitoring system stopped");
        Ok(())
    }

    /// Clone for background task (simplified clone)
    fn clone_for_background(&self) -> Self {
        Self {
            config: self.config.clone(),
            system_metrics: self.system_metrics.clone(),
            plugin_metrics: self.plugin_metrics.clone(),
            error_entries: self.error_entries.clone(),
            performance_traces: self.performance_traces.clone(),
            active_alerts: self.active_alerts.clone(),
            alert_handlers: self.alert_handlers.clone(),
            metric_collectors: self.metric_collectors.clone(),
            start_time: self.start_time,
            execution_counter: self.execution_counter.clone(),
            monitoring_handle: None,
        }
    }
}

/// Default console alert handler
pub struct ConsoleAlertHandler {
    name: String,
}

impl ConsoleAlertHandler {
    pub fn new() -> Self {
        Self {
            name: "ConsoleAlertHandler".to_string(),
        }
    }
}

#[async_trait]
impl AlertHandler for ConsoleAlertHandler {
    async fn handle_alert(&self, alert: &Alert) -> PluginResult<()> {
        match alert.severity {
            AlertSeverity::Info => info!("ALERT [INFO]: {}", alert.message),
            AlertSeverity::Warning => warn!("ALERT [WARNING]: {}", alert.message),
            AlertSeverity::Error => error!("ALERT [ERROR]: {}", alert.message),
            AlertSeverity::Critical => error!("ALERT [CRITICAL]: {}", alert.message),
        }
        Ok(())
    }

    fn name(&self) -> &str {
        &self.name
    }

    fn supported_alert_types(&self) -> Vec<AlertType> {
        vec![
            AlertType::HighExecutionTime,
            AlertType::HighMemoryUsage,
            AlertType::HighErrorRate,
            AlertType::LowSuccessRate,
            AlertType::HighCpuUsage,
            AlertType::PluginFailure,
        ]
    }
}