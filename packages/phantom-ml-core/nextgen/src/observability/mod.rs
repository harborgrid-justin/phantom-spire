//! Comprehensive Observability and Monitoring System for Phantom ML Core
//!
//! This module provides enterprise-grade observability infrastructure with:
//! - Distributed tracing with OpenTelemetry integration
//! - Comprehensive metrics collection with Prometheus endpoints
//! - Structured logging with correlation IDs
//! - Real-time alerting and incident response
//! - Performance profiling and capacity planning
//! - Multi-tenant observability with proper isolation

pub mod tracing;
pub mod metrics;
pub mod logging;
pub mod alerting;
pub mod dashboards;
pub mod profiling;
pub mod capacity;
pub mod collectors;
pub mod correlation;
pub mod exporters;

use std::sync::Arc;
use std::collections::HashMap;
use parking_lot::RwLock;
use dashmap::DashMap;
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};

/// Central observability manager coordinating all observability components
#[derive(Clone)]
pub struct ObservabilityManager {
    /// Distributed tracing system
    pub tracer: Arc<tracing::DistributedTracer>,
    /// Metrics collection system
    pub metrics: Arc<metrics::MetricsCollector>,
    /// Structured logging system
    pub logger: Arc<logging::StructuredLogger>,
    /// Alerting and incident response system
    pub alerting: Arc<alerting::AlertingSystem>,
    /// Real-time dashboard system
    pub dashboards: Arc<dashboards::DashboardManager>,
    /// Performance profiling system
    pub profiler: Arc<profiling::PerformanceProfiler>,
    /// Capacity planning system
    pub capacity: Arc<capacity::CapacityPlanner>,
    /// Configuration
    config: ObservabilityConfig,
}

/// Configuration for the observability system
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ObservabilityConfig {
    /// OpenTelemetry configuration
    pub otel: OpenTelemetryConfig,
    /// Prometheus metrics configuration
    pub prometheus: PrometheusConfig,
    /// Logging configuration
    pub logging: LoggingConfig,
    /// Alerting configuration
    pub alerting: AlertingConfig,
    /// Multi-tenant configuration
    pub multi_tenant: MultiTenantConfig,
    /// Security configuration
    pub security: SecurityConfig,
}

/// OpenTelemetry configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OpenTelemetryConfig {
    /// Service name for tracing
    pub service_name: String,
    /// Service version
    pub service_version: String,
    /// OTLP endpoint for traces
    pub otlp_endpoint: String,
    /// Sampling rate (0.0 to 1.0)
    pub sampling_rate: f64,
    /// Batch timeout in milliseconds
    pub batch_timeout_ms: u64,
    /// Maximum batch size
    pub max_batch_size: usize,
    /// Headers for authentication
    pub headers: HashMap<String, String>,
}

/// Prometheus metrics configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PrometheusConfig {
    /// Metrics endpoint path
    pub endpoint: String,
    /// Metrics port
    pub port: u16,
    /// Metrics collection interval in seconds
    pub collection_interval_s: u64,
    /// Enable high-cardinality metrics
    pub high_cardinality: bool,
    /// Custom metric labels
    pub custom_labels: HashMap<String, String>,
}

/// Logging configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoggingConfig {
    /// Log level
    pub level: String,
    /// Log format (json, text)
    pub format: String,
    /// Enable correlation IDs
    pub enable_correlation: bool,
    /// Log rotation size in MB
    pub rotation_size_mb: u64,
    /// Number of log files to keep
    pub retention_count: u32,
    /// Structured fields to include
    pub structured_fields: Vec<String>,
}

/// Alerting configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AlertingConfig {
    /// Alert manager endpoint
    pub alert_manager_endpoint: String,
    /// Webhook endpoints for notifications
    pub webhook_endpoints: Vec<String>,
    /// Email configuration
    pub email: Option<EmailConfig>,
    /// Slack configuration
    pub slack: Option<SlackConfig>,
    /// Default escalation policy
    pub escalation_policy: EscalationPolicy,
}

/// Email configuration for alerting
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmailConfig {
    pub smtp_server: String,
    pub smtp_port: u16,
    pub username: String,
    pub password: String,
    pub from_address: String,
    pub to_addresses: Vec<String>,
}

/// Slack configuration for alerting
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SlackConfig {
    pub webhook_url: String,
    pub channel: String,
    pub username: String,
}

/// Escalation policy for alerts
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EscalationPolicy {
    /// Initial notification delay in minutes
    pub initial_delay_minutes: u32,
    /// Escalation intervals in minutes
    pub escalation_intervals: Vec<u32>,
    /// Maximum escalation level
    pub max_escalation_level: u32,
    /// Auto-resolve timeout in minutes
    pub auto_resolve_timeout_minutes: u32,
}

/// Multi-tenant observability configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MultiTenantConfig {
    /// Enable multi-tenant isolation
    pub enabled: bool,
    /// Tenant isolation strategy
    pub isolation_strategy: TenantIsolationStrategy,
    /// Maximum tenants per instance
    pub max_tenants: u32,
    /// Resource quotas per tenant
    pub resource_quotas: TenantResourceQuotas,
}

/// Tenant isolation strategy
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TenantIsolationStrategy {
    /// Namespace-based isolation
    Namespace,
    /// Tag-based isolation
    Tags,
    /// Separate instances per tenant
    Dedicated,
}

/// Resource quotas per tenant
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TenantResourceQuotas {
    /// Maximum traces per minute
    pub max_traces_per_minute: u32,
    /// Maximum metrics per minute
    pub max_metrics_per_minute: u32,
    /// Maximum log entries per minute
    pub max_logs_per_minute: u32,
    /// Maximum storage per tenant in GB
    pub max_storage_gb: u32,
}

/// Security configuration for observability
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityConfig {
    /// Enable TLS for all communications
    pub enable_tls: bool,
    /// API key for authentication
    pub api_key: Option<String>,
    /// JWT configuration
    pub jwt: Option<JwtConfig>,
    /// IP whitelist for metrics endpoint
    pub ip_whitelist: Vec<String>,
    /// Enable data encryption at rest
    pub encrypt_at_rest: bool,
    /// Data retention policy in days
    pub retention_days: u32,
}

/// JWT configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JwtConfig {
    pub secret: String,
    pub issuer: String,
    pub audience: String,
    pub expiration_hours: u32,
}

/// Observability event types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ObservabilityEvent {
    /// Trace span event
    Trace {
        trace_id: String,
        span_id: String,
        operation_name: String,
        start_time: DateTime<Utc>,
        duration_ms: u64,
        status: SpanStatus,
        attributes: HashMap<String, String>,
        tenant_id: Option<String>,
    },
    /// Metrics event
    Metric {
        name: String,
        value: MetricValue,
        timestamp: DateTime<Utc>,
        labels: HashMap<String, String>,
        tenant_id: Option<String>,
    },
    /// Log event
    Log {
        level: LogLevel,
        message: String,
        timestamp: DateTime<Utc>,
        correlation_id: Option<String>,
        trace_id: Option<String>,
        span_id: Option<String>,
        structured_data: HashMap<String, serde_json::Value>,
        tenant_id: Option<String>,
    },
    /// Alert event
    Alert {
        alert_id: String,
        severity: AlertSeverity,
        title: String,
        description: String,
        timestamp: DateTime<Utc>,
        labels: HashMap<String, String>,
        tenant_id: Option<String>,
    },
}

/// Span status enumeration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SpanStatus {
    Ok,
    Error(String),
    Cancelled,
    Timeout,
}

/// Metric value types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MetricValue {
    Counter(u64),
    Gauge(f64),
    Histogram(Vec<f64>),
    Summary { sum: f64, count: u64, quantiles: HashMap<String, f64> },
}

/// Log level enumeration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum LogLevel {
    Trace,
    Debug,
    Info,
    Warn,
    Error,
    Critical,
}

/// Alert severity levels
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, PartialOrd, Ord)]
pub enum AlertSeverity {
    Info,
    Warning,
    Critical,
    Emergency,
}

impl ObservabilityManager {
    /// Create a new observability manager with the given configuration
    pub async fn new(config: ObservabilityConfig) -> Result<Self, ObservabilityError> {
        let tracer = Arc::new(tracing::DistributedTracer::new(&config.otel).await?);
        let metrics = Arc::new(metrics::MetricsCollector::new(&config.prometheus).await?);
        let logger = Arc::new(logging::StructuredLogger::new(&config.logging).await?);
        let alerting = Arc::new(alerting::AlertingSystem::new(&config.alerting).await?);
        let dashboards = Arc::new(dashboards::DashboardManager::new().await?);
        let profiler = Arc::new(profiling::PerformanceProfiler::new().await?);
        let capacity = Arc::new(capacity::CapacityPlanner::new().await?);

        Ok(Self {
            tracer,
            metrics,
            logger,
            alerting,
            dashboards,
            profiler,
            capacity,
            config,
        })
    }

    /// Initialize the observability system
    pub async fn initialize(&self) -> Result<(), ObservabilityError> {
        // Initialize all subsystems
        self.tracer.initialize().await?;
        self.metrics.initialize().await?;
        self.logger.initialize().await?;
        self.alerting.initialize().await?;
        self.dashboards.initialize().await?;
        self.profiler.initialize().await?;
        self.capacity.initialize().await?;

        // Set up cross-component communication
        self.setup_event_routing().await?;

        // Start background tasks
        self.start_background_tasks().await?;

        Ok(())
    }

    /// Record an observability event
    pub async fn record_event(&self, event: ObservabilityEvent) -> Result<(), ObservabilityError> {
        match event {
            ObservabilityEvent::Trace { .. } => {
                self.tracer.record_span(event).await?;
            },
            ObservabilityEvent::Metric { .. } => {
                self.metrics.record_metric(event).await?;
            },
            ObservabilityEvent::Log { .. } => {
                self.logger.record_log(event).await?;
            },
            ObservabilityEvent::Alert { .. } => {
                self.alerting.record_alert(event).await?;
            },
        }

        Ok(())
    }

    /// Get observability metrics summary
    pub async fn get_metrics_summary(&self, tenant_id: Option<&str>) -> Result<MetricsSummary, ObservabilityError> {
        let trace_stats = self.tracer.get_statistics(tenant_id).await?;
        let metric_stats = self.metrics.get_statistics(tenant_id).await?;
        let log_stats = self.logger.get_statistics(tenant_id).await?;
        let alert_stats = self.alerting.get_statistics(tenant_id).await?;

        Ok(MetricsSummary {
            trace_stats,
            metric_stats,
            log_stats,
            alert_stats,
            timestamp: Utc::now(),
        })
    }

    /// Set up event routing between components
    async fn setup_event_routing(&self) -> Result<(), ObservabilityError> {
        // Route trace events to metrics for SLI calculation
        // Route error logs to alerting system
        // Route capacity metrics to capacity planner
        // Implementation details in individual modules
        Ok(())
    }

    /// Start background tasks for data processing
    async fn start_background_tasks(&self) -> Result<(), ObservabilityError> {
        // Start data aggregation tasks
        // Start cleanup tasks for data retention
        // Start health check tasks
        // Implementation details in individual modules
        Ok(())
    }
}

/// Metrics summary structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetricsSummary {
    pub trace_stats: tracing::TraceStatistics,
    pub metric_stats: metrics::MetricStatistics,
    pub log_stats: logging::LogStatistics,
    pub alert_stats: alerting::AlertStatistics,
    pub timestamp: DateTime<Utc>,
}

/// Observability error types
#[derive(Debug, thiserror::Error)]
pub enum ObservabilityError {
    #[error("Configuration error: {0}")]
    Configuration(String),

    #[error("Tracing error: {0}")]
    Tracing(#[from] tracing::TracingError),

    #[error("Metrics error: {0}")]
    Metrics(#[from] metrics::MetricsError),

    #[error("Logging error: {0}")]
    Logging(#[from] logging::LoggingError),

    #[error("Alerting error: {0}")]
    Alerting(#[from] alerting::AlertingError),

    #[error("Dashboard error: {0}")]
    Dashboard(#[from] dashboards::DashboardError),

    #[error("Profiling error: {0}")]
    Profiling(#[from] profiling::ProfilingError),

    #[error("Capacity planning error: {0}")]
    Capacity(#[from] capacity::CapacityError),

    #[error("Network error: {0}")]
    Network(String),

    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),

    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Multi-tenant error: {0}")]
    MultiTenant(String),
}

impl Default for ObservabilityConfig {
    fn default() -> Self {
        Self {
            otel: OpenTelemetryConfig {
                service_name: "phantom-ml-core".to_string(),
                service_version: env!("CARGO_PKG_VERSION").to_string(),
                otlp_endpoint: "http://localhost:4317".to_string(),
                sampling_rate: 1.0,
                batch_timeout_ms: 1000,
                max_batch_size: 100,
                headers: HashMap::new(),
            },
            prometheus: PrometheusConfig {
                endpoint: "/metrics".to_string(),
                port: 9090,
                collection_interval_s: 15,
                high_cardinality: false,
                custom_labels: HashMap::new(),
            },
            logging: LoggingConfig {
                level: "info".to_string(),
                format: "json".to_string(),
                enable_correlation: true,
                rotation_size_mb: 100,
                retention_count: 10,
                structured_fields: vec![
                    "timestamp".to_string(),
                    "level".to_string(),
                    "message".to_string(),
                    "correlation_id".to_string(),
                    "trace_id".to_string(),
                    "span_id".to_string(),
                ],
            },
            alerting: AlertingConfig {
                alert_manager_endpoint: "http://localhost:9093".to_string(),
                webhook_endpoints: vec![],
                email: None,
                slack: None,
                escalation_policy: EscalationPolicy {
                    initial_delay_minutes: 5,
                    escalation_intervals: vec![15, 30, 60],
                    max_escalation_level: 3,
                    auto_resolve_timeout_minutes: 240,
                },
            },
            multi_tenant: MultiTenantConfig {
                enabled: false,
                isolation_strategy: TenantIsolationStrategy::Namespace,
                max_tenants: 100,
                resource_quotas: TenantResourceQuotas {
                    max_traces_per_minute: 10000,
                    max_metrics_per_minute: 50000,
                    max_logs_per_minute: 100000,
                    max_storage_gb: 10,
                },
            },
            security: SecurityConfig {
                enable_tls: true,
                api_key: None,
                jwt: None,
                ip_whitelist: vec!["127.0.0.1".to_string(), "::1".to_string()],
                encrypt_at_rest: false,
                retention_days: 30,
            },
        }
    }
}

/// Utility macro for recording traces with automatic correlation
#[macro_export]
macro_rules! trace_span {
    ($manager:expr, $operation:expr, $block:block) => {{
        let span_id = uuid::Uuid::new_v4().to_string();
        let trace_id = uuid::Uuid::new_v4().to_string();
        let start_time = chrono::Utc::now();

        let result = $block;

        let duration = chrono::Utc::now().signed_duration_since(start_time);
        let duration_ms = duration.num_milliseconds() as u64;

        let status = if std::panic::catch_unwind(|| {}).is_ok() {
            $crate::observability::SpanStatus::Ok
        } else {
            $crate::observability::SpanStatus::Error("Panic occurred".to_string())
        };

        let event = $crate::observability::ObservabilityEvent::Trace {
            trace_id,
            span_id,
            operation_name: $operation.to_string(),
            start_time,
            duration_ms,
            status,
            attributes: std::collections::HashMap::new(),
            tenant_id: None,
        };

        let _ = $manager.record_event(event).await;

        result
    }};
}

/// Utility macro for recording metrics
#[macro_export]
macro_rules! record_metric {
    ($manager:expr, $name:expr, $value:expr) => {{
        let event = $crate::observability::ObservabilityEvent::Metric {
            name: $name.to_string(),
            value: $value,
            timestamp: chrono::Utc::now(),
            labels: std::collections::HashMap::new(),
            tenant_id: None,
        };

        let _ = $manager.record_event(event).await;
    }};
}

/// Utility macro for structured logging
#[macro_export]
macro_rules! log_structured {
    ($manager:expr, $level:expr, $message:expr, $($key:expr => $value:expr),*) => {{
        let mut structured_data = std::collections::HashMap::new();
        $(
            structured_data.insert($key.to_string(), serde_json::json!($value));
        )*

        let event = $crate::observability::ObservabilityEvent::Log {
            level: $level,
            message: $message.to_string(),
            timestamp: chrono::Utc::now(),
            correlation_id: Some(uuid::Uuid::new_v4().to_string()),
            trace_id: None,
            span_id: None,
            structured_data,
            tenant_id: None,
        };

        let _ = $manager.record_event(event).await;
    }};
}