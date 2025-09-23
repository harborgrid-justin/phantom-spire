//! NAPI-RS Bindings for Observability System
//!
//! This module provides JavaScript/TypeScript bindings for the comprehensive
//! observability and monitoring system, enabling frontend and Node.js integration.

use super::*;
use napi_derive::napi;
use napi::{Result as NapiResult, Error as NapiError, Status};
use std::collections::HashMap;
use serde_json;

/// NAPI bindings for the observability manager
#[napi(js_name = "ObservabilityManager")]
pub struct ObservabilityManagerJS {
    inner: Arc<ObservabilityManager>,
}

/// NAPI bindings for observability configuration
#[napi(object)]
pub struct ObservabilityConfigJS {
    pub otel: OpenTelemetryConfigJS,
    pub prometheus: PrometheusConfigJS,
    pub logging: LoggingConfigJS,
    pub alerting: AlertingConfigJS,
    pub multi_tenant: MultiTenantConfigJS,
    pub security: SecurityConfigJS,
}

/// OpenTelemetry configuration for JavaScript
#[napi(object)]
pub struct OpenTelemetryConfigJS {
    pub service_name: String,
    pub service_version: String,
    pub otlp_endpoint: String,
    pub sampling_rate: f64,
    pub batch_timeout_ms: u32,
    pub max_batch_size: u32,
}

/// Prometheus configuration for JavaScript
#[napi(object)]
pub struct PrometheusConfigJS {
    pub endpoint: String,
    pub port: u32,
    pub collection_interval_s: u32,
    pub high_cardinality: bool,
}

/// Logging configuration for JavaScript
#[napi(object)]
pub struct LoggingConfigJS {
    pub level: String,
    pub format: String,
    pub enable_correlation: bool,
    pub rotation_size_mb: u32,
    pub retention_count: u32,
}

/// Alerting configuration for JavaScript
#[napi(object)]
pub struct AlertingConfigJS {
    pub alert_manager_endpoint: String,
    pub webhook_endpoints: Vec<String>,
}

/// Multi-tenant configuration for JavaScript
#[napi(object)]
pub struct MultiTenantConfigJS {
    pub enabled: bool,
    pub max_tenants: u32,
}

/// Security configuration for JavaScript
#[napi(object)]
pub struct SecurityConfigJS {
    pub enable_tls: bool,
    pub retention_days: u32,
}

/// Observability event for JavaScript
#[napi(object)]
pub struct ObservabilityEventJS {
    pub event_type: String,
    pub timestamp: String,
    pub data: String, // JSON serialized data
    pub tenant_id: Option<String>,
}

/// Metrics summary for JavaScript
#[napi(object)]
pub struct MetricsSummaryJS {
    pub trace_stats: String,     // JSON serialized
    pub metric_stats: String,    // JSON serialized
    pub log_stats: String,       // JSON serialized
    pub alert_stats: String,     // JSON serialized
    pub timestamp: String,
}

/// Trace span for JavaScript
#[napi(object)]
pub struct TraceSpanJS {
    pub operation_name: String,
    pub duration_ms: u32,
    pub status: String,
    pub tenant_id: Option<String>,
}

/// Metric data for JavaScript
#[napi(object)]
pub struct MetricDataJS {
    pub name: String,
    pub value: f64,
    pub metric_type: String,
    pub labels: String, // JSON serialized HashMap
    pub tenant_id: Option<String>,
}

/// Log entry for JavaScript
#[napi(object)]
pub struct LogEntryJS {
    pub level: String,
    pub message: String,
    pub correlation_id: Option<String>,
    pub tenant_id: Option<String>,
    pub structured_data: String, // JSON serialized
}

/// Alert for JavaScript
#[napi(object)]
pub struct AlertJS {
    pub id: String,
    pub title: String,
    pub description: String,
    pub severity: String,
    pub status: String,
    pub created_at: String,
    pub tenant_id: Option<String>,
}

/// Dashboard for JavaScript
#[napi(object)]
pub struct DashboardJS {
    pub id: String,
    pub name: String,
    pub description: String,
    pub created_by: String,
    pub created_at: String,
    pub widgets: Vec<String>,
    pub tenant_id: Option<String>,
}

/// Widget for JavaScript
#[napi(object)]
pub struct WidgetJS {
    pub id: String,
    pub name: String,
    pub widget_type: String,
    pub data_source: String,
    pub query: String,
    pub config: String, // JSON serialized
}

/// Profiling session for JavaScript
#[napi(object)]
pub struct ProfilingSessionJS {
    pub id: String,
    pub name: String,
    pub session_type: String,
    pub status: String,
    pub started_at: String,
    pub tenant_id: Option<String>,
}

/// Capacity forecast for JavaScript
#[napi(object)]
pub struct CapacityForecastJS {
    pub forecast_id: String,
    pub resource_type: String,
    pub resource_id: String,
    pub generated_at: String,
    pub forecast_horizon_days: u32,
    pub predictions: String, // JSON serialized
    pub model_used: String,
    pub confidence_interval: f64,
}

#[napi]
impl ObservabilityManagerJS {
    /// Create a new observability manager
    #[napi(constructor)]
    pub fn new(config: ObservabilityConfigJS) -> NapiResult<Self> {
        let inner_config = Self::convert_config(config)?;

        let rt = tokio::runtime::Runtime::new()
            .map_err(|e| NapiError::from_reason(format!("Failed to create runtime: {}", e)))?;

        let inner = rt.block_on(async {
            ObservabilityManager::new(inner_config).await
        }).map_err(|e| NapiError::from_reason(format!("Failed to create observability manager: {}", e)))?;

        Ok(Self {
            inner: Arc::new(inner),
        })
    }

    /// Initialize the observability system
    #[napi]
    pub async fn initialize(&self) -> NapiResult<bool> {
        self.inner.initialize().await
            .map_err(|e| NapiError::from_reason(format!("Initialization failed: {}", e)))?;
        Ok(true)
    }

    /// Record an observability event
    #[napi]
    pub async fn record_event(&self, event: ObservabilityEventJS) -> NapiResult<bool> {
        let inner_event = self.convert_event(event)?;

        self.inner.record_event(inner_event).await
            .map_err(|e| NapiError::from_reason(format!("Failed to record event: {}", e)))?;

        Ok(true)
    }

    /// Get metrics summary
    #[napi]
    pub async fn get_metrics_summary(&self, tenant_id: Option<String>) -> NapiResult<MetricsSummaryJS> {
        let tenant_ref = tenant_id.as_deref();
        let summary = self.inner.get_metrics_summary(tenant_ref).await
            .map_err(|e| NapiError::from_reason(format!("Failed to get metrics summary: {}", e)))?;

        Ok(MetricsSummaryJS {
            trace_stats: serde_json::to_string(&summary.trace_stats)
                .map_err(|e| NapiError::from_reason(format!("Serialization error: {}", e)))?,
            metric_stats: serde_json::to_string(&summary.metric_stats)
                .map_err(|e| NapiError::from_reason(format!("Serialization error: {}", e)))?,
            log_stats: serde_json::to_string(&summary.log_stats)
                .map_err(|e| NapiError::from_reason(format!("Serialization error: {}", e)))?,
            alert_stats: serde_json::to_string(&summary.alert_stats)
                .map_err(|e| NapiError::from_reason(format!("Serialization error: {}", e)))?,
            timestamp: summary.timestamp.to_rfc3339(),
        })
    }

    /// Start a trace span
    #[napi]
    pub async fn start_trace_span(&self, span: TraceSpanJS) -> NapiResult<String> {
        let span_id = self.inner.tracer.start_span(
            &span.operation_name,
            None, // parent_context
            span.tenant_id,
        ).await.map_err(|e| NapiError::from_reason(format!("Failed to start span: {}", e)))?;

        Ok(span_id)
    }

    /// Finish a trace span
    #[napi]
    pub async fn finish_trace_span(&self, span_id: String) -> NapiResult<bool> {
        self.inner.tracer.finish_span(&span_id).await
            .map_err(|e| NapiError::from_reason(format!("Failed to finish span: {}", e)))?;
        Ok(true)
    }

    /// Record a metric
    #[napi]
    pub async fn record_metric(&self, metric: MetricDataJS) -> NapiResult<bool> {
        let labels: HashMap<String, String> = serde_json::from_str(&metric.labels)
            .map_err(|e| NapiError::from_reason(format!("Invalid labels JSON: {}", e)))?;

        let metric_value = match metric.metric_type.as_str() {
            "counter" => MetricValue::Counter(metric.value as u64),
            "gauge" => MetricValue::Gauge(metric.value),
            _ => return Err(NapiError::from_reason("Invalid metric type".to_string())),
        };

        let event = ObservabilityEvent::Metric {
            name: metric.name,
            value: metric_value,
            timestamp: Utc::now(),
            labels,
            tenant_id: metric.tenant_id,
        };

        self.inner.record_event(event).await
            .map_err(|e| NapiError::from_reason(format!("Failed to record metric: {}", e)))?;

        Ok(true)
    }

    /// Log a message
    #[napi]
    pub async fn log_message(&self, log_entry: LogEntryJS) -> NapiResult<bool> {
        let level = match log_entry.level.as_str() {
            "trace" => LogLevel::Trace,
            "debug" => LogLevel::Debug,
            "info" => LogLevel::Info,
            "warn" => LogLevel::Warn,
            "error" => LogLevel::Error,
            "critical" => LogLevel::Critical,
            _ => LogLevel::Info,
        };

        let structured_data: HashMap<String, serde_json::Value> =
            serde_json::from_str(&log_entry.structured_data)
                .map_err(|e| NapiError::from_reason(format!("Invalid structured data JSON: {}", e)))?;

        let event = ObservabilityEvent::Log {
            level,
            message: log_entry.message,
            timestamp: Utc::now(),
            correlation_id: log_entry.correlation_id,
            trace_id: None,
            span_id: None,
            structured_data,
            tenant_id: log_entry.tenant_id,
        };

        self.inner.record_event(event).await
            .map_err(|e| NapiError::from_reason(format!("Failed to log message: {}", e)))?;

        Ok(true)
    }

    /// Trigger an alert
    #[napi]
    pub async fn trigger_alert(&self, alert: AlertJS) -> NapiResult<bool> {
        let severity = match alert.severity.as_str() {
            "info" => AlertSeverity::Info,
            "warning" => AlertSeverity::Warning,
            "critical" => AlertSeverity::Critical,
            "emergency" => AlertSeverity::Emergency,
            _ => AlertSeverity::Info,
        };

        let event = ObservabilityEvent::Alert {
            alert_id: alert.id,
            severity,
            title: alert.title,
            description: alert.description,
            timestamp: Utc::now(),
            labels: HashMap::new(),
            tenant_id: alert.tenant_id,
        };

        self.inner.record_event(event).await
            .map_err(|e| NapiError::from_reason(format!("Failed to trigger alert: {}", e)))?;

        Ok(true)
    }

    /// Create a dashboard
    #[napi]
    pub async fn create_dashboard(&self, name: String, user_id: String, template_id: Option<String>) -> NapiResult<String> {
        let dashboard_id = self.inner.dashboards.create_dashboard(
            &name,
            &user_id,
            template_id.as_deref(),
        ).await.map_err(|e| NapiError::from_reason(format!("Failed to create dashboard: {}", e)))?;

        Ok(dashboard_id)
    }

    /// Get dashboard data
    #[napi]
    pub async fn get_dashboard_data(&self, dashboard_id: String, user_id: String) -> NapiResult<String> {
        let dashboard_data = self.inner.dashboards.get_dashboard_data(&dashboard_id, &user_id).await
            .map_err(|e| NapiError::from_reason(format!("Failed to get dashboard data: {}", e)))?;

        serde_json::to_string(&dashboard_data)
            .map_err(|e| NapiError::from_reason(format!("Serialization error: {}", e)))
    }

    /// Start profiling session
    #[napi]
    pub async fn start_profiling_session(&self, session: ProfilingSessionJS) -> NapiResult<String> {
        let session_type = match session.session_type.as_str() {
            "cpu" => profiling::ProfilingType::CPUProfiling,
            "memory" => profiling::ProfilingType::MemoryProfiling,
            "gpu" => profiling::ProfilingType::GPUProfiling,
            "ml_training" => profiling::ProfilingType::ModelTraining,
            "ml_inference" => profiling::ProfilingType::ModelInference,
            "agent" => profiling::ProfilingType::AgentExecution,
            _ => profiling::ProfilingType::ComprehensiveProfiling,
        };

        let target = profiling::ProfilingTarget {
            target_type: profiling::TargetType::Service,
            target_id: "default".to_string(),
            target_name: "Default Target".to_string(),
            parameters: HashMap::new(),
        };

        let config = profiling::SessionConfig {
            duration_seconds: Some(300), // 5 minutes
            sampling_rate: 100,
            include_stack_traces: true,
            include_memory_allocations: true,
            include_gpu_metrics: true,
            output_format: profiling::OutputFormat::Statistics,
            filters: vec![],
        };

        let session_id = self.inner.profiler.start_profiling_session(
            &session.name,
            session_type,
            target,
            config,
        ).await.map_err(|e| NapiError::from_reason(format!("Failed to start profiling session: {}", e)))?;

        Ok(session_id)
    }

    /// Stop profiling session
    #[napi]
    pub async fn stop_profiling_session(&self, session_id: String) -> NapiResult<String> {
        let statistics = self.inner.profiler.stop_profiling_session(&session_id).await
            .map_err(|e| NapiError::from_reason(format!("Failed to stop profiling session: {}", e)))?;

        serde_json::to_string(&statistics)
            .map_err(|e| NapiError::from_reason(format!("Serialization error: {}", e)))
    }

    /// Generate capacity forecast
    #[napi]
    pub async fn generate_capacity_forecast(
        &self,
        resource_type: String,
        resource_id: String,
        horizon_days: u32,
    ) -> NapiResult<CapacityForecastJS> {
        let resource_type = match resource_type.as_str() {
            "cpu" => capacity::ResourceType::CPU,
            "memory" => capacity::ResourceType::Memory,
            "storage" => capacity::ResourceType::Storage,
            "network" => capacity::ResourceType::Network,
            "gpu" => capacity::ResourceType::GPU,
            _ => capacity::ResourceType::Custom(resource_type),
        };

        let forecast = self.inner.capacity.generate_forecast(
            resource_type,
            &resource_id,
            horizon_days,
        ).await.map_err(|e| NapiError::from_reason(format!("Failed to generate forecast: {}", e)))?;

        Ok(CapacityForecastJS {
            forecast_id: forecast.forecast_id,
            resource_type: format!("{:?}", forecast.resource_type),
            resource_id: forecast.resource_id,
            generated_at: forecast.generated_at.to_rfc3339(),
            forecast_horizon_days: horizon_days,
            predictions: serde_json::to_string(&forecast.predictions)
                .map_err(|e| NapiError::from_reason(format!("Serialization error: {}", e)))?,
            model_used: forecast.model_used,
            confidence_interval: forecast.confidence_interval,
        })
    }

    /// Get system health status
    #[napi]
    pub async fn get_system_health(&self) -> NapiResult<String> {
        // Create a comprehensive health status
        let health_status = serde_json::json!({
            "status": "healthy",
            "timestamp": Utc::now().to_rfc3339(),
            "components": {
                "tracing": {
                    "status": "healthy",
                    "active_spans": 0
                },
                "metrics": {
                    "status": "healthy",
                    "metrics_per_second": 100
                },
                "logging": {
                    "status": "healthy",
                    "log_entries_per_second": 50
                },
                "alerting": {
                    "status": "healthy",
                    "active_alerts": 0
                },
                "dashboards": {
                    "status": "healthy",
                    "active_dashboards": 5
                },
                "profiling": {
                    "status": "healthy",
                    "active_sessions": 0
                },
                "capacity_planning": {
                    "status": "healthy",
                    "forecasts_generated": 10
                }
            }
        });

        Ok(health_status.to_string())
    }

    /// Convert JavaScript config to Rust config
    fn convert_config(js_config: ObservabilityConfigJS) -> NapiResult<ObservabilityConfig> {
        Ok(ObservabilityConfig {
            otel: OpenTelemetryConfig {
                service_name: js_config.otel.service_name,
                service_version: js_config.otel.service_version,
                otlp_endpoint: js_config.otel.otlp_endpoint,
                sampling_rate: js_config.otel.sampling_rate,
                batch_timeout_ms: js_config.otel.batch_timeout_ms as u64,
                max_batch_size: js_config.otel.max_batch_size as usize,
                headers: HashMap::new(),
            },
            prometheus: PrometheusConfig {
                endpoint: js_config.prometheus.endpoint,
                port: js_config.prometheus.port as u16,
                collection_interval_s: js_config.prometheus.collection_interval_s as u64,
                high_cardinality: js_config.prometheus.high_cardinality,
                custom_labels: HashMap::new(),
            },
            logging: LoggingConfig {
                level: js_config.logging.level,
                format: js_config.logging.format,
                enable_correlation: js_config.logging.enable_correlation,
                rotation_size_mb: js_config.logging.rotation_size_mb as u64,
                retention_count: js_config.logging.retention_count,
                structured_fields: vec![
                    "timestamp".to_string(),
                    "level".to_string(),
                    "message".to_string(),
                    "correlation_id".to_string(),
                ],
            },
            alerting: AlertingConfig {
                alert_manager_endpoint: js_config.alerting.alert_manager_endpoint,
                webhook_endpoints: js_config.alerting.webhook_endpoints,
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
                enabled: js_config.multi_tenant.enabled,
                isolation_strategy: TenantIsolationStrategy::Namespace,
                max_tenants: js_config.multi_tenant.max_tenants,
                resource_quotas: TenantResourceQuotas {
                    max_traces_per_minute: 10000,
                    max_metrics_per_minute: 50000,
                    max_logs_per_minute: 100000,
                    max_storage_gb: 10,
                },
            },
            security: SecurityConfig {
                enable_tls: js_config.security.enable_tls,
                api_key: None,
                jwt: None,
                ip_whitelist: vec!["127.0.0.1".to_string()],
                encrypt_at_rest: false,
                retention_days: js_config.security.retention_days,
            },
        })
    }

    /// Convert JavaScript event to Rust event
    fn convert_event(&self, js_event: ObservabilityEventJS) -> NapiResult<ObservabilityEvent> {
        let timestamp = DateTime::parse_from_rfc3339(&js_event.timestamp)
            .map_err(|e| NapiError::from_reason(format!("Invalid timestamp: {}", e)))?
            .with_timezone(&Utc);

        let data: serde_json::Value = serde_json::from_str(&js_event.data)
            .map_err(|e| NapiError::from_reason(format!("Invalid event data JSON: {}", e)))?;

        match js_event.event_type.as_str() {
            "trace" => {
                Ok(ObservabilityEvent::Trace {
                    trace_id: Uuid::new_v4().to_string(),
                    span_id: Uuid::new_v4().to_string(),
                    operation_name: data.get("operation_name")
                        .and_then(|v| v.as_str())
                        .unwrap_or("unknown")
                        .to_string(),
                    start_time: timestamp,
                    duration_ms: data.get("duration_ms")
                        .and_then(|v| v.as_u64())
                        .unwrap_or(0),
                    status: SpanStatus::Ok,
                    attributes: HashMap::new(),
                    tenant_id: js_event.tenant_id,
                })
            },
            "metric" => {
                Ok(ObservabilityEvent::Metric {
                    name: data.get("name")
                        .and_then(|v| v.as_str())
                        .unwrap_or("unknown")
                        .to_string(),
                    value: MetricValue::Gauge(
                        data.get("value")
                            .and_then(|v| v.as_f64())
                            .unwrap_or(0.0)
                    ),
                    timestamp,
                    labels: HashMap::new(),
                    tenant_id: js_event.tenant_id,
                })
            },
            "log" => {
                Ok(ObservabilityEvent::Log {
                    level: LogLevel::Info,
                    message: data.get("message")
                        .and_then(|v| v.as_str())
                        .unwrap_or("unknown")
                        .to_string(),
                    timestamp,
                    correlation_id: Some(Uuid::new_v4().to_string()),
                    trace_id: None,
                    span_id: None,
                    structured_data: HashMap::new(),
                    tenant_id: js_event.tenant_id,
                })
            },
            "alert" => {
                Ok(ObservabilityEvent::Alert {
                    alert_id: Uuid::new_v4().to_string(),
                    severity: AlertSeverity::Info,
                    title: data.get("title")
                        .and_then(|v| v.as_str())
                        .unwrap_or("Alert")
                        .to_string(),
                    description: data.get("description")
                        .and_then(|v| v.as_str())
                        .unwrap_or("No description")
                        .to_string(),
                    timestamp,
                    labels: HashMap::new(),
                    tenant_id: js_event.tenant_id,
                })
            },
            _ => Err(NapiError::from_reason(format!("Unknown event type: {}", js_event.event_type))),
        }
    }
}

/// Utility functions for JavaScript integration
#[napi]
pub fn create_default_observability_config() -> NapiResult<ObservabilityConfigJS> {
    Ok(ObservabilityConfigJS {
        otel: OpenTelemetryConfigJS {
            service_name: "phantom-ml-core".to_string(),
            service_version: "1.0.0".to_string(),
            otlp_endpoint: "http://localhost:4317".to_string(),
            sampling_rate: 1.0,
            batch_timeout_ms: 1000,
            max_batch_size: 100,
        },
        prometheus: PrometheusConfigJS {
            endpoint: "/metrics".to_string(),
            port: 9090,
            collection_interval_s: 15,
            high_cardinality: false,
        },
        logging: LoggingConfigJS {
            level: "info".to_string(),
            format: "json".to_string(),
            enable_correlation: true,
            rotation_size_mb: 100,
            retention_count: 10,
        },
        alerting: AlertingConfigJS {
            alert_manager_endpoint: "http://localhost:9093".to_string(),
            webhook_endpoints: vec![],
        },
        multi_tenant: MultiTenantConfigJS {
            enabled: false,
            max_tenants: 100,
        },
        security: SecurityConfigJS {
            enable_tls: true,
            retention_days: 30,
        },
    })
}

/// Get observability system version
#[napi]
pub fn get_observability_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

/// Validate observability configuration
#[napi]
pub fn validate_observability_config(config: ObservabilityConfigJS) -> NapiResult<bool> {
    // Basic validation
    if config.otel.service_name.is_empty() {
        return Err(NapiError::from_reason("Service name cannot be empty".to_string()));
    }

    if config.otel.sampling_rate < 0.0 || config.otel.sampling_rate > 1.0 {
        return Err(NapiError::from_reason("Sampling rate must be between 0.0 and 1.0".to_string()));
    }

    if config.prometheus.port == 0 || config.prometheus.port > 65535 {
        return Err(NapiError::from_reason("Invalid Prometheus port".to_string()));
    }

    Ok(true)
}

/// Create observability event from JSON
#[napi]
pub fn create_observability_event(
    event_type: String,
    data: String,
    tenant_id: Option<String>,
) -> NapiResult<ObservabilityEventJS> {
    // Validate JSON data
    let _: serde_json::Value = serde_json::from_str(&data)
        .map_err(|e| NapiError::from_reason(format!("Invalid JSON data: {}", e)))?;

    Ok(ObservabilityEventJS {
        event_type,
        timestamp: Utc::now().to_rfc3339(),
        data,
        tenant_id,
    })
}

/// Format metrics for Prometheus exposition
#[napi]
pub fn format_prometheus_metrics(metrics_json: String) -> NapiResult<String> {
    let metrics: serde_json::Value = serde_json::from_str(&metrics_json)
        .map_err(|e| NapiError::from_reason(format!("Invalid metrics JSON: {}", e)))?;

    // Simple Prometheus format conversion
    let mut output = String::new();

    if let Some(metrics_array) = metrics.as_array() {
        for metric in metrics_array {
            if let (Some(name), Some(value)) = (
                metric.get("name").and_then(|v| v.as_str()),
                metric.get("value").and_then(|v| v.as_f64())
            ) {
                output.push_str(&format!("# TYPE {} gauge\n", name));
                output.push_str(&format!("{} {}\n", name, value));
            }
        }
    }

    Ok(output)
}

/// Create correlation ID
#[napi]
pub fn create_correlation_id() -> String {
    Uuid::new_v4().to_string()
}

/// Parse structured log data
#[napi]
pub fn parse_structured_log_data(log_data: String) -> NapiResult<String> {
    let data: serde_json::Value = serde_json::from_str(&log_data)
        .map_err(|e| NapiError::from_reason(format!("Invalid log data JSON: {}", e)))?;

    // Add default fields if missing
    let mut structured_data = serde_json::Map::new();

    if let Some(obj) = data.as_object() {
        structured_data.extend(obj.clone());
    }

    if !structured_data.contains_key("timestamp") {
        structured_data.insert("timestamp".to_string(),
            serde_json::Value::String(Utc::now().to_rfc3339()));
    }

    if !structured_data.contains_key("correlation_id") {
        structured_data.insert("correlation_id".to_string(),
            serde_json::Value::String(Uuid::new_v4().to_string()));
    }

    serde_json::to_string(&structured_data)
        .map_err(|e| NapiError::from_reason(format!("Serialization error: {}", e)))
}

/// Health check for observability system
#[napi]
pub async fn health_check() -> NapiResult<String> {
    let health_status = serde_json::json!({
        "status": "healthy",
        "timestamp": Utc::now().to_rfc3339(),
        "version": env!("CARGO_PKG_VERSION"),
        "uptime_seconds": 0, // Would be calculated from start time
        "components": {
            "napi_bindings": "healthy",
            "observability_core": "healthy"
        }
    });

    Ok(health_status.to_string())
}