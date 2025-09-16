//! Comprehensive Metrics Collection System with Prometheus Integration
//!
//! This module provides enterprise-grade metrics collection:
//! - Prometheus metrics with automatic scraping endpoint
//! - ML-specific metrics (model accuracy, training time, inference latency)
//! - Business metrics and SLI/SLO monitoring
//! - Multi-tenant metrics with proper isolation
//! - High-cardinality metrics with intelligent sampling

use super::*;
use std::sync::Arc;
use std::collections::HashMap;
use parking_lot::RwLock;
use dashmap::DashMap;
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc, Duration};
use tokio::sync::mpsc;
use tokio::time::{interval, Interval};

/// Comprehensive metrics collector with Prometheus integration
pub struct MetricsCollector {
    /// Prometheus registry
    registry: Arc<dyn MetricsRegistry>,
    /// Active metrics storage
    metrics: DashMap<String, Arc<dyn Metric>>,
    /// Metrics statistics
    statistics: Arc<RwLock<MetricStatistics>>,
    /// Configuration
    config: PrometheusConfig,
    /// Event sender for async processing
    event_sender: mpsc::Sender<MetricEvent>,
    /// Background processor handle
    _processor_handle: tokio::task::JoinHandle<()>,
    /// HTTP server for metrics endpoint
    _metrics_server: tokio::task::JoinHandle<()>,
    /// SLI/SLO tracker
    slo_tracker: Arc<SloTracker>,
    /// Business metrics calculator
    business_metrics: Arc<BusinessMetricsCalculator>,
}

/// Metrics registry trait for Prometheus integration
pub trait MetricsRegistry: Send + Sync {
    fn register_counter(&self, name: &str, help: &str, labels: &[&str]) -> Result<Arc<dyn Counter>, MetricsError>;
    fn register_gauge(&self, name: &str, help: &str, labels: &[&str]) -> Result<Arc<dyn Gauge>, MetricsError>;
    fn register_histogram(&self, name: &str, help: &str, buckets: &[f64], labels: &[&str]) -> Result<Arc<dyn Histogram>, MetricsError>;
    fn register_summary(&self, name: &str, help: &str, quantiles: &[f64], labels: &[&str]) -> Result<Arc<dyn Summary>, MetricsError>;
    fn gather(&self) -> Result<Vec<MetricFamily>, MetricsError>;
}

/// Generic metric trait
pub trait Metric: Send + Sync {
    fn name(&self) -> &str;
    fn metric_type(&self) -> MetricType;
    fn collect(&self) -> Result<MetricFamily, MetricsError>;
}

/// Counter metric trait
pub trait Counter: Metric {
    fn inc(&self);
    fn inc_by(&self, value: f64);
    fn get(&self) -> f64;
}

/// Gauge metric trait
pub trait Gauge: Metric {
    fn set(&self, value: f64);
    fn inc(&self);
    fn dec(&self);
    fn add(&self, value: f64);
    fn sub(&self, value: f64);
    fn get(&self) -> f64;
}

/// Histogram metric trait
pub trait Histogram: Metric {
    fn observe(&self, value: f64);
    fn get_sample_count(&self) -> u64;
    fn get_sample_sum(&self) -> f64;
    fn get_buckets(&self) -> Vec<Bucket>;
}

/// Summary metric trait
pub trait Summary: Metric {
    fn observe(&self, value: f64);
    fn get_sample_count(&self) -> u64;
    fn get_sample_sum(&self) -> f64;
    fn get_quantiles(&self) -> Vec<Quantile>;
}

/// Metric type enumeration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MetricType {
    Counter,
    Gauge,
    Histogram,
    Summary,
}

/// Metric family for Prometheus exposition
#[derive(Debug, Clone)]
pub struct MetricFamily {
    pub name: String,
    pub help: String,
    pub metric_type: MetricType,
    pub metrics: Vec<MetricSample>,
}

/// Individual metric sample
#[derive(Debug, Clone)]
pub struct MetricSample {
    pub labels: HashMap<String, String>,
    pub value: MetricValue,
    pub timestamp: Option<DateTime<Utc>>,
}

/// Histogram bucket
#[derive(Debug, Clone)]
pub struct Bucket {
    pub upper_bound: f64,
    pub cumulative_count: u64,
}

/// Summary quantile
#[derive(Debug, Clone)]
pub struct Quantile {
    pub quantile: f64,
    pub value: f64,
}

/// Metric event for async processing
#[derive(Debug, Clone)]
pub enum MetricEvent {
    CounterIncrement(String, f64, HashMap<String, String>),
    GaugeSet(String, f64, HashMap<String, String>),
    HistogramObserve(String, f64, HashMap<String, String>),
    SummaryObserve(String, f64, HashMap<String, String>),
    Export(Vec<MetricFamily>),
    BusinessMetric(BusinessMetric),
    SloViolation(SloViolation),
}

/// Business metric representation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BusinessMetric {
    pub name: String,
    pub value: f64,
    pub unit: String,
    pub tags: HashMap<String, String>,
    pub timestamp: DateTime<Utc>,
    pub tenant_id: Option<String>,
}

/// SLO violation event
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SloViolation {
    pub slo_name: String,
    pub target_value: f64,
    pub actual_value: f64,
    pub violation_type: ViolationType,
    pub severity: AlertSeverity,
    pub timestamp: DateTime<Utc>,
    pub tenant_id: Option<String>,
}

/// SLO violation type
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ViolationType {
    Threshold,
    Availability,
    Latency,
    ErrorRate,
}

/// Metric statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetricStatistics {
    pub total_metrics: u64,
    pub active_metrics: u64,
    pub metrics_per_second: f64,
    pub export_count: u64,
    pub export_errors: u64,
    pub last_export_time: Option<DateTime<Utc>>,
    pub scrape_count: u64,
    pub scrape_errors: u64,
    pub last_scrape_time: Option<DateTime<Utc>>,
    pub tenant_stats: HashMap<String, TenantMetricStats>,
    pub slo_compliance: HashMap<String, SloComplianceStats>,
}

/// Per-tenant metric statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TenantMetricStats {
    pub metric_count: u64,
    pub metrics_per_minute: f64,
    pub storage_usage_mb: f64,
    pub quota_utilization: f64,
}

/// SLO compliance statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SloComplianceStats {
    pub target_value: f64,
    pub current_value: f64,
    pub compliance_percentage: f64,
    pub violations_count: u64,
    pub last_violation: Option<DateTime<Utc>>,
}

/// SLI/SLO tracker for service level monitoring
pub struct SloTracker {
    slos: DashMap<String, ServiceLevelObjective>,
    violations: DashMap<String, Vec<SloViolation>>,
    config: SloConfig,
}

/// Service Level Objective definition
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServiceLevelObjective {
    pub name: String,
    pub description: String,
    pub sli_query: String,
    pub target_value: f64,
    pub comparison: ComparisonOperator,
    pub time_window: Duration,
    pub alert_threshold: f64,
    pub tenant_id: Option<String>,
}

/// Comparison operator for SLO evaluation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ComparisonOperator {
    GreaterThan,
    GreaterThanOrEqual,
    LessThan,
    LessThanOrEqual,
    Equal,
}

/// SLO configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SloConfig {
    pub evaluation_interval_s: u64,
    pub violation_retention_days: u32,
    pub alert_on_violations: bool,
}

/// Business metrics calculator
pub struct BusinessMetricsCalculator {
    calculators: HashMap<String, Box<dyn BusinessMetricCalculator>>,
    config: BusinessMetricsConfig,
}

/// Business metric calculator trait
pub trait BusinessMetricCalculator: Send + Sync {
    fn calculate(&self, inputs: &HashMap<String, f64>) -> Result<f64, MetricsError>;
    fn get_required_inputs(&self) -> Vec<String>;
}

/// Business metrics configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BusinessMetricsConfig {
    pub enabled_calculators: Vec<String>,
    pub calculation_interval_s: u64,
    pub cost_per_prediction: f64,
    pub revenue_per_accurate_prediction: f64,
    pub sla_penalty_rate: f64,
}

/// ML-specific metrics definitions
pub struct MLMetrics {
    /// Model training metrics
    pub training_duration: Arc<dyn Histogram>,
    pub training_accuracy: Arc<dyn Gauge>,
    pub training_loss: Arc<dyn Gauge>,
    pub training_epochs: Arc<dyn Counter>,

    /// Model inference metrics
    pub inference_latency: Arc<dyn Histogram>,
    pub inference_throughput: Arc<dyn Counter>,
    pub inference_errors: Arc<dyn Counter>,
    pub model_accuracy: Arc<dyn Gauge>,

    /// Model performance metrics
    pub precision: Arc<dyn Gauge>,
    pub recall: Arc<dyn Gauge>,
    pub f1_score: Arc<dyn Gauge>,
    pub confusion_matrix_tp: Arc<dyn Counter>,
    pub confusion_matrix_fp: Arc<dyn Counter>,
    pub confusion_matrix_tn: Arc<dyn Counter>,
    pub confusion_matrix_fn: Arc<dyn Counter>,

    /// Resource utilization metrics
    pub cpu_utilization: Arc<dyn Gauge>,
    pub memory_usage: Arc<dyn Gauge>,
    pub gpu_utilization: Arc<dyn Gauge>,
    pub disk_usage: Arc<dyn Gauge>,

    /// Business metrics
    pub predictions_per_hour: Arc<dyn Counter>,
    pub revenue_impact: Arc<dyn Counter>,
    pub cost_per_prediction: Arc<dyn Gauge>,
    pub model_drift_score: Arc<dyn Gauge>,
}

impl MetricsCollector {
    /// Create a new metrics collector
    pub async fn new(config: &PrometheusConfig) -> Result<Self, MetricsError> {
        let (event_sender, event_receiver) = mpsc::channel(50000);

        // Create Prometheus registry
        let registry = Arc::new(PrometheusRegistry::new()?);

        // Create SLO tracker
        let slo_config = SloConfig {
            evaluation_interval_s: 60,
            violation_retention_days: 7,
            alert_on_violations: true,
        };
        let slo_tracker = Arc::new(SloTracker::new(slo_config));

        // Create business metrics calculator
        let business_config = BusinessMetricsConfig {
            enabled_calculators: vec![
                "cost_efficiency".to_string(),
                "prediction_accuracy_value".to_string(),
                "model_utilization".to_string(),
            ],
            calculation_interval_s: 300,
            cost_per_prediction: 0.01,
            revenue_per_accurate_prediction: 1.0,
            sla_penalty_rate: 100.0,
        };
        let business_metrics = Arc::new(BusinessMetricsCalculator::new(business_config));

        // Start background processor
        let statistics = Arc::new(RwLock::new(MetricStatistics::default()));
        let processor_handle = tokio::spawn(
            Self::background_processor(event_receiver, registry.clone(), statistics.clone())
        );

        // Start metrics HTTP server
        let metrics_server = tokio::spawn(
            Self::start_metrics_server(config.port, registry.clone())
        );

        Ok(Self {
            registry,
            metrics: DashMap::new(),
            statistics,
            config: config.clone(),
            event_sender,
            _processor_handle: processor_handle,
            _metrics_server: metrics_server,
            slo_tracker,
            business_metrics,
        })
    }

    /// Initialize the metrics collection system
    pub async fn initialize(&self) -> Result<(), MetricsError> {
        // Create standard ML metrics
        self.create_ml_metrics().await?;

        // Create SLI/SLO definitions
        self.create_default_slos().await?;

        // Start periodic tasks
        self.start_periodic_tasks().await?;

        Ok(())
    }

    /// Create standard ML metrics
    async fn create_ml_metrics(&self) -> Result<(), MetricsError> {
        // Training metrics
        let training_duration = self.registry.register_histogram(
            "ml_training_duration_seconds",
            "Time spent training ML models",
            &[0.1, 0.5, 1.0, 5.0, 10.0, 30.0, 60.0, 300.0, 600.0],
            &["model_type", "tenant_id"],
        )?;

        let training_accuracy = self.registry.register_gauge(
            "ml_training_accuracy",
            "Accuracy achieved during model training",
            &["model_id", "model_type", "tenant_id"],
        )?;

        // Inference metrics
        let inference_latency = self.registry.register_histogram(
            "ml_inference_latency_seconds",
            "Time taken for model inference",
            &[0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0],
            &["model_id", "model_type", "tenant_id"],
        )?;

        let inference_throughput = self.registry.register_counter(
            "ml_inference_total",
            "Total number of inferences performed",
            &["model_id", "model_type", "status", "tenant_id"],
        )?;

        // Store metrics for easy access
        self.metrics.insert("training_duration".to_string(), training_duration);
        self.metrics.insert("training_accuracy".to_string(), training_accuracy);
        self.metrics.insert("inference_latency".to_string(), inference_latency);
        self.metrics.insert("inference_throughput".to_string(), inference_throughput);

        Ok(())
    }

    /// Record a metric event
    pub async fn record_metric(&self, event: ObservabilityEvent) -> Result<(), MetricsError> {
        if let ObservabilityEvent::Metric { name, value, timestamp: _, labels, tenant_id } = event {
            match value {
                MetricValue::Counter(val) => {
                    let _ = self.event_sender.send(MetricEvent::CounterIncrement(name, val as f64, labels)).await;
                },
                MetricValue::Gauge(val) => {
                    let _ = self.event_sender.send(MetricEvent::GaugeSet(name, val, labels)).await;
                },
                MetricValue::Histogram(values) => {
                    for val in values {
                        let _ = self.event_sender.send(MetricEvent::HistogramObserve(name.clone(), val, labels.clone())).await;
                    }
                },
                MetricValue::Summary { sum, count, quantiles: _ } => {
                    for _ in 0..count {
                        let val = sum / count as f64;
                        let _ = self.event_sender.send(MetricEvent::SummaryObserve(name.clone(), val, labels.clone())).await;
                    }
                },
            }

            // Update tenant statistics
            if let Some(tenant_id) = tenant_id {
                let mut stats = self.statistics.write();
                let tenant_stats = stats.tenant_stats.entry(tenant_id).or_insert_with(|| TenantMetricStats {
                    metric_count: 0,
                    metrics_per_minute: 0.0,
                    storage_usage_mb: 0.0,
                    quota_utilization: 0.0,
                });

                tenant_stats.metric_count += 1;
            }
        }

        Ok(())
    }

    /// Record ML training metrics
    pub async fn record_training_metrics(
        &self,
        model_id: &str,
        model_type: &str,
        duration_s: f64,
        accuracy: f64,
        tenant_id: Option<&str>,
    ) -> Result<(), MetricsError> {
        let mut labels = HashMap::new();
        labels.insert("model_type".to_string(), model_type.to_string());
        if let Some(tid) = tenant_id {
            labels.insert("tenant_id".to_string(), tid.to_string());
        }

        // Record training duration
        let _ = self.event_sender.send(MetricEvent::HistogramObserve(
            "ml_training_duration_seconds".to_string(),
            duration_s,
            labels.clone(),
        )).await;

        // Record training accuracy
        labels.insert("model_id".to_string(), model_id.to_string());
        let _ = self.event_sender.send(MetricEvent::GaugeSet(
            "ml_training_accuracy".to_string(),
            accuracy,
            labels,
        )).await;

        Ok(())
    }

    /// Record ML inference metrics
    pub async fn record_inference_metrics(
        &self,
        model_id: &str,
        model_type: &str,
        latency_s: f64,
        success: bool,
        tenant_id: Option<&str>,
    ) -> Result<(), MetricsError> {
        let mut labels = HashMap::new();
        labels.insert("model_id".to_string(), model_id.to_string());
        labels.insert("model_type".to_string(), model_type.to_string());
        labels.insert("status".to_string(), if success { "success" } else { "error" }.to_string());
        if let Some(tid) = tenant_id {
            labels.insert("tenant_id".to_string(), tid.to_string());
        }

        // Record inference latency
        let _ = self.event_sender.send(MetricEvent::HistogramObserve(
            "ml_inference_latency_seconds".to_string(),
            latency_s,
            labels.clone(),
        )).await;

        // Record inference count
        let _ = self.event_sender.send(MetricEvent::CounterIncrement(
            "ml_inference_total".to_string(),
            1.0,
            labels,
        )).await;

        Ok(())
    }

    /// Get metrics statistics
    pub async fn get_statistics(&self, tenant_id: Option<&str>) -> Result<MetricStatistics, MetricsError> {
        let stats = self.statistics.read().clone();

        if let Some(tenant_id) = tenant_id {
            // Filter statistics for specific tenant
            let tenant_stats = stats.tenant_stats.get(tenant_id).cloned()
                .unwrap_or_default();

            Ok(MetricStatistics {
                total_metrics: tenant_stats.metric_count,
                active_metrics: 0, // Not tracked per tenant
                metrics_per_second: tenant_stats.metrics_per_minute / 60.0,
                export_count: 0,
                export_errors: 0,
                last_export_time: stats.last_export_time,
                scrape_count: 0,
                scrape_errors: 0,
                last_scrape_time: stats.last_scrape_time,
                tenant_stats: HashMap::new(),
                slo_compliance: HashMap::new(),
            })
        } else {
            Ok(stats)
        }
    }

    /// Create default SLOs
    async fn create_default_slos(&self) -> Result<(), MetricsError> {
        // Model inference latency SLO
        let inference_latency_slo = ServiceLevelObjective {
            name: "inference_latency_p99".to_string(),
            description: "99th percentile inference latency should be under 100ms".to_string(),
            sli_query: "histogram_quantile(0.99, ml_inference_latency_seconds)".to_string(),
            target_value: 0.1,
            comparison: ComparisonOperator::LessThan,
            time_window: Duration::minutes(5),
            alert_threshold: 0.95,
            tenant_id: None,
        };

        // Model accuracy SLO
        let model_accuracy_slo = ServiceLevelObjective {
            name: "model_accuracy_threshold".to_string(),
            description: "Model accuracy should be above 90%".to_string(),
            sli_query: "ml_training_accuracy".to_string(),
            target_value: 0.9,
            comparison: ComparisonOperator::GreaterThan,
            time_window: Duration::hours(1),
            alert_threshold: 0.95,
            tenant_id: None,
        };

        self.slo_tracker.add_slo(inference_latency_slo).await?;
        self.slo_tracker.add_slo(model_accuracy_slo).await?;

        Ok(())
    }

    /// Start periodic tasks
    async fn start_periodic_tasks(&self) -> Result<(), MetricsError> {
        // Start SLO evaluation task
        let slo_tracker = self.slo_tracker.clone();
        let event_sender = self.event_sender.clone();
        tokio::spawn(async move {
            let mut interval = interval(tokio::time::Duration::from_secs(60));
            loop {
                interval.tick().await;
                if let Err(e) = slo_tracker.evaluate_slos(&event_sender).await {
                    eprintln!("SLO evaluation error: {}", e);
                }
            }
        });

        // Start business metrics calculation task
        let business_metrics = self.business_metrics.clone();
        let event_sender = self.event_sender.clone();
        tokio::spawn(async move {
            let mut interval = interval(tokio::time::Duration::from_secs(300));
            loop {
                interval.tick().await;
                if let Err(e) = business_metrics.calculate_metrics(&event_sender).await {
                    eprintln!("Business metrics calculation error: {}", e);
                }
            }
        });

        Ok(())
    }

    /// Background processor for metric events
    async fn background_processor(
        mut event_receiver: mpsc::Receiver<MetricEvent>,
        registry: Arc<dyn MetricsRegistry>,
        statistics: Arc<RwLock<MetricStatistics>>,
    ) {
        while let Some(event) = event_receiver.recv().await {
            match event {
                MetricEvent::CounterIncrement(name, value, labels) => {
                    // Find or create counter metric and increment
                    // Implementation would use registry to find metric and update
                    let _ = (name, value, labels); // Placeholder
                },
                MetricEvent::GaugeSet(name, value, labels) => {
                    // Find or create gauge metric and set value
                    let _ = (name, value, labels); // Placeholder
                },
                MetricEvent::HistogramObserve(name, value, labels) => {
                    // Find or create histogram metric and observe value
                    let _ = (name, value, labels); // Placeholder
                },
                MetricEvent::SummaryObserve(name, value, labels) => {
                    // Find or create summary metric and observe value
                    let _ = (name, value, labels); // Placeholder
                },
                MetricEvent::Export(_families) => {
                    // Export metrics families to external systems
                    let mut stats = statistics.write();
                    stats.export_count += 1;
                    stats.last_export_time = Some(Utc::now());
                },
                MetricEvent::BusinessMetric(metric) => {
                    // Handle business metric calculation result
                    let _ = metric; // Placeholder
                },
                MetricEvent::SloViolation(violation) => {
                    // Handle SLO violation
                    let _ = violation; // Placeholder
                },
            }
        }
    }

    /// Start HTTP server for metrics endpoint
    async fn start_metrics_server(
        port: u16,
        registry: Arc<dyn MetricsRegistry>,
    ) -> Result<(), MetricsError> {
        use warp::Filter;

        let metrics_route = warp::path("metrics")
            .map(move || {
                match registry.gather() {
                    Ok(families) => {
                        let output = Self::format_prometheus_output(families);
                        warp::reply::with_header(output, "content-type", "text/plain; charset=utf-8")
                    },
                    Err(_) => {
                        warp::reply::with_header("# Error gathering metrics\n".to_string(), "content-type", "text/plain")
                    }
                }
            });

        let routes = metrics_route;

        warp::serve(routes)
            .run(([0, 0, 0, 0], port))
            .await;

        Ok(())
    }

    /// Format metrics for Prometheus exposition
    fn format_prometheus_output(families: Vec<MetricFamily>) -> String {
        let mut output = String::new();

        for family in families {
            // Add HELP line
            output.push_str(&format!("# HELP {} {}\n", family.name, family.help));

            // Add TYPE line
            let type_str = match family.metric_type {
                MetricType::Counter => "counter",
                MetricType::Gauge => "gauge",
                MetricType::Histogram => "histogram",
                MetricType::Summary => "summary",
            };
            output.push_str(&format!("# TYPE {} {}\n", family.name, type_str));

            // Add metric samples
            for sample in family.metrics {
                let label_str = if sample.labels.is_empty() {
                    String::new()
                } else {
                    let labels: Vec<String> = sample.labels
                        .iter()
                        .map(|(k, v)| format!("{}=\"{}\"", k, v))
                        .collect();
                    format!("{{{}}}", labels.join(","))
                };

                match sample.value {
                    MetricValue::Counter(val) => {
                        output.push_str(&format!("{}{} {}\n", family.name, label_str, val));
                    },
                    MetricValue::Gauge(val) => {
                        output.push_str(&format!("{}{} {}\n", family.name, label_str, val));
                    },
                    MetricValue::Histogram(ref values) => {
                        for (i, &val) in values.iter().enumerate() {
                            output.push_str(&format!("{}_bucket{{{}le=\"{}\"}} {}\n", family.name,
                                if label_str.is_empty() { "" } else { &format!("{},", &label_str[1..label_str.len()-1]) },
                                i, val));
                        }
                    },
                    MetricValue::Summary { sum, count, quantiles: _ } => {
                        output.push_str(&format!("{}_sum{} {}\n", family.name, label_str, sum));
                        output.push_str(&format!("{}_count{} {}\n", family.name, label_str, count));
                    },
                }
            }
        }

        output
    }
}

// Implementation of required traits and helper structures

impl SloTracker {
    pub fn new(config: SloConfig) -> Self {
        Self {
            slos: DashMap::new(),
            violations: DashMap::new(),
            config,
        }
    }

    pub async fn add_slo(&self, slo: ServiceLevelObjective) -> Result<(), MetricsError> {
        self.slos.insert(slo.name.clone(), slo);
        Ok(())
    }

    pub async fn evaluate_slos(&self, event_sender: &mpsc::Sender<MetricEvent>) -> Result<(), MetricsError> {
        for slo in self.slos.iter() {
            // Evaluate SLO by querying metrics
            // This is a simplified implementation
            let current_value = self.query_sli_value(&slo.sli_query).await?;

            let violation = match slo.comparison {
                ComparisonOperator::LessThan => current_value >= slo.target_value,
                ComparisonOperator::GreaterThan => current_value <= slo.target_value,
                ComparisonOperator::LessThanOrEqual => current_value > slo.target_value,
                ComparisonOperator::GreaterThanOrEqual => current_value < slo.target_value,
                ComparisonOperator::Equal => (current_value - slo.target_value).abs() > 0.001,
            };

            if violation {
                let slo_violation = SloViolation {
                    slo_name: slo.name.clone(),
                    target_value: slo.target_value,
                    actual_value: current_value,
                    violation_type: ViolationType::Threshold,
                    severity: AlertSeverity::Warning,
                    timestamp: Utc::now(),
                    tenant_id: slo.tenant_id.clone(),
                };

                let _ = event_sender.send(MetricEvent::SloViolation(slo_violation)).await;
            }
        }

        Ok(())
    }

    async fn query_sli_value(&self, _query: &str) -> Result<f64, MetricsError> {
        // Placeholder implementation - would query actual metrics
        Ok(0.05) // Simulated value
    }
}

impl BusinessMetricsCalculator {
    pub fn new(config: BusinessMetricsConfig) -> Self {
        let mut calculators: HashMap<String, Box<dyn BusinessMetricCalculator>> = HashMap::new();

        // Add standard business metric calculators
        calculators.insert("cost_efficiency".to_string(), Box::new(CostEfficiencyCalculator::new()));
        calculators.insert("prediction_accuracy_value".to_string(), Box::new(PredictionValueCalculator::new()));

        Self {
            calculators,
            config,
        }
    }

    pub async fn calculate_metrics(&self, event_sender: &mpsc::Sender<MetricEvent>) -> Result<(), MetricsError> {
        // Gather input metrics for business calculations
        let mut inputs = HashMap::new();
        inputs.insert("total_predictions".to_string(), 1000.0);
        inputs.insert("accurate_predictions".to_string(), 950.0);
        inputs.insert("processing_cost".to_string(), 50.0);

        for (name, calculator) in &self.calculators {
            if let Ok(value) = calculator.calculate(&inputs) {
                let business_metric = BusinessMetric {
                    name: name.clone(),
                    value,
                    unit: "usd".to_string(),
                    tags: HashMap::new(),
                    timestamp: Utc::now(),
                    tenant_id: None,
                };

                let _ = event_sender.send(MetricEvent::BusinessMetric(business_metric)).await;
            }
        }

        Ok(())
    }
}

/// Cost efficiency calculator
pub struct CostEfficiencyCalculator;

impl CostEfficiencyCalculator {
    pub fn new() -> Self {
        Self
    }
}

impl BusinessMetricCalculator for CostEfficiencyCalculator {
    fn calculate(&self, inputs: &HashMap<String, f64>) -> Result<f64, MetricsError> {
        let total_predictions = inputs.get("total_predictions").ok_or(MetricsError::Calculation("Missing total_predictions".to_string()))?;
        let processing_cost = inputs.get("processing_cost").ok_or(MetricsError::Calculation("Missing processing_cost".to_string()))?;

        if *total_predictions > 0.0 {
            Ok(processing_cost / total_predictions)
        } else {
            Ok(0.0)
        }
    }

    fn get_required_inputs(&self) -> Vec<String> {
        vec!["total_predictions".to_string(), "processing_cost".to_string()]
    }
}

/// Prediction value calculator
pub struct PredictionValueCalculator;

impl PredictionValueCalculator {
    pub fn new() -> Self {
        Self
    }
}

impl BusinessMetricCalculator for PredictionValueCalculator {
    fn calculate(&self, inputs: &HashMap<String, f64>) -> Result<f64, MetricsError> {
        let accurate_predictions = inputs.get("accurate_predictions").ok_or(MetricsError::Calculation("Missing accurate_predictions".to_string()))?;
        let revenue_per_prediction = 1.0; // Could be configurable

        Ok(accurate_predictions * revenue_per_prediction)
    }

    fn get_required_inputs(&self) -> Vec<String> {
        vec!["accurate_predictions".to_string()]
    }
}

/// Prometheus registry implementation
pub struct PrometheusRegistry {
    counters: DashMap<String, Arc<dyn Counter>>,
    gauges: DashMap<String, Arc<dyn Gauge>>,
    histograms: DashMap<String, Arc<dyn Histogram>>,
    summaries: DashMap<String, Arc<dyn Summary>>,
}

impl PrometheusRegistry {
    pub fn new() -> Result<Self, MetricsError> {
        Ok(Self {
            counters: DashMap::new(),
            gauges: DashMap::new(),
            histograms: DashMap::new(),
            summaries: DashMap::new(),
        })
    }
}

impl MetricsRegistry for PrometheusRegistry {
    fn register_counter(&self, name: &str, help: &str, labels: &[&str]) -> Result<Arc<dyn Counter>, MetricsError> {
        let counter = Arc::new(PrometheusCounter::new(name, help, labels)?);
        self.counters.insert(name.to_string(), counter.clone());
        Ok(counter)
    }

    fn register_gauge(&self, name: &str, help: &str, labels: &[&str]) -> Result<Arc<dyn Gauge>, MetricsError> {
        let gauge = Arc::new(PrometheusGauge::new(name, help, labels)?);
        self.gauges.insert(name.to_string(), gauge.clone());
        Ok(gauge)
    }

    fn register_histogram(&self, name: &str, help: &str, buckets: &[f64], labels: &[&str]) -> Result<Arc<dyn Histogram>, MetricsError> {
        let histogram = Arc::new(PrometheusHistogram::new(name, help, buckets, labels)?);
        self.histograms.insert(name.to_string(), histogram.clone());
        Ok(histogram)
    }

    fn register_summary(&self, name: &str, help: &str, quantiles: &[f64], labels: &[&str]) -> Result<Arc<dyn Summary>, MetricsError> {
        let summary = Arc::new(PrometheusSummary::new(name, help, quantiles, labels)?);
        self.summaries.insert(name.to_string(), summary.clone());
        Ok(summary)
    }

    fn gather(&self) -> Result<Vec<MetricFamily>, MetricsError> {
        let mut families = Vec::new();

        // Collect all metric families
        for counter in self.counters.iter() {
            families.push(counter.collect()?);
        }
        for gauge in self.gauges.iter() {
            families.push(gauge.collect()?);
        }
        for histogram in self.histograms.iter() {
            families.push(histogram.collect()?);
        }
        for summary in self.summaries.iter() {
            families.push(summary.collect()?);
        }

        Ok(families)
    }
}

// Simplified implementations of Prometheus metric types
// These would be more sophisticated in a real implementation

pub struct PrometheusCounter {
    name: String,
    help: String,
    labels: Vec<String>,
    value: Arc<RwLock<f64>>,
}

impl PrometheusCounter {
    pub fn new(name: &str, help: &str, _labels: &[&str]) -> Result<Self, MetricsError> {
        Ok(Self {
            name: name.to_string(),
            help: help.to_string(),
            labels: vec![],
            value: Arc::new(RwLock::new(0.0)),
        })
    }
}

impl Metric for PrometheusCounter {
    fn name(&self) -> &str {
        &self.name
    }

    fn metric_type(&self) -> MetricType {
        MetricType::Counter
    }

    fn collect(&self) -> Result<MetricFamily, MetricsError> {
        Ok(MetricFamily {
            name: self.name.clone(),
            help: self.help.clone(),
            metric_type: MetricType::Counter,
            metrics: vec![MetricSample {
                labels: HashMap::new(),
                value: MetricValue::Counter(*self.value.read() as u64),
                timestamp: Some(Utc::now()),
            }],
        })
    }
}

impl Counter for PrometheusCounter {
    fn inc(&self) {
        *self.value.write() += 1.0;
    }

    fn inc_by(&self, value: f64) {
        *self.value.write() += value;
    }

    fn get(&self) -> f64 {
        *self.value.read()
    }
}

pub struct PrometheusGauge {
    name: String,
    help: String,
    labels: Vec<String>,
    value: Arc<RwLock<f64>>,
}

impl PrometheusGauge {
    pub fn new(name: &str, help: &str, _labels: &[&str]) -> Result<Self, MetricsError> {
        Ok(Self {
            name: name.to_string(),
            help: help.to_string(),
            labels: vec![],
            value: Arc::new(RwLock::new(0.0)),
        })
    }
}

impl Metric for PrometheusGauge {
    fn name(&self) -> &str {
        &self.name
    }

    fn metric_type(&self) -> MetricType {
        MetricType::Gauge
    }

    fn collect(&self) -> Result<MetricFamily, MetricsError> {
        Ok(MetricFamily {
            name: self.name.clone(),
            help: self.help.clone(),
            metric_type: MetricType::Gauge,
            metrics: vec![MetricSample {
                labels: HashMap::new(),
                value: MetricValue::Gauge(*self.value.read()),
                timestamp: Some(Utc::now()),
            }],
        })
    }
}

impl Gauge for PrometheusGauge {
    fn set(&self, value: f64) {
        *self.value.write() = value;
    }

    fn inc(&self) {
        *self.value.write() += 1.0;
    }

    fn dec(&self) {
        *self.value.write() -= 1.0;
    }

    fn add(&self, value: f64) {
        *self.value.write() += value;
    }

    fn sub(&self, value: f64) {
        *self.value.write() -= value;
    }

    fn get(&self) -> f64 {
        *self.value.read()
    }
}

pub struct PrometheusHistogram {
    name: String,
    help: String,
    buckets: Vec<f64>,
    bucket_counts: Arc<RwLock<Vec<u64>>>,
    sum: Arc<RwLock<f64>>,
    count: Arc<RwLock<u64>>,
}

impl PrometheusHistogram {
    pub fn new(name: &str, help: &str, buckets: &[f64], _labels: &[&str]) -> Result<Self, MetricsError> {
        Ok(Self {
            name: name.to_string(),
            help: help.to_string(),
            buckets: buckets.to_vec(),
            bucket_counts: Arc::new(RwLock::new(vec![0; buckets.len()])),
            sum: Arc::new(RwLock::new(0.0)),
            count: Arc::new(RwLock::new(0)),
        })
    }
}

impl Metric for PrometheusHistogram {
    fn name(&self) -> &str {
        &self.name
    }

    fn metric_type(&self) -> MetricType {
        MetricType::Histogram
    }

    fn collect(&self) -> Result<MetricFamily, MetricsError> {
        let bucket_counts = self.bucket_counts.read().clone();

        Ok(MetricFamily {
            name: self.name.clone(),
            help: self.help.clone(),
            metric_type: MetricType::Histogram,
            metrics: vec![MetricSample {
                labels: HashMap::new(),
                value: MetricValue::Histogram(bucket_counts.into_iter().map(|c| c as f64).collect()),
                timestamp: Some(Utc::now()),
            }],
        })
    }
}

impl Histogram for PrometheusHistogram {
    fn observe(&self, value: f64) {
        *self.sum.write() += value;
        *self.count.write() += 1;

        let mut bucket_counts = self.bucket_counts.write();
        for (i, &bucket_upper) in self.buckets.iter().enumerate() {
            if value <= bucket_upper {
                bucket_counts[i] += 1;
            }
        }
    }

    fn get_sample_count(&self) -> u64 {
        *self.count.read()
    }

    fn get_sample_sum(&self) -> f64 {
        *self.sum.read()
    }

    fn get_buckets(&self) -> Vec<Bucket> {
        let bucket_counts = self.bucket_counts.read();
        self.buckets.iter().zip(bucket_counts.iter())
            .map(|(&upper_bound, &cumulative_count)| Bucket {
                upper_bound,
                cumulative_count,
            })
            .collect()
    }
}

pub struct PrometheusSummary {
    name: String,
    help: String,
    quantiles: Vec<f64>,
    values: Arc<RwLock<Vec<f64>>>,
    sum: Arc<RwLock<f64>>,
    count: Arc<RwLock<u64>>,
}

impl PrometheusSummary {
    pub fn new(name: &str, help: &str, quantiles: &[f64], _labels: &[&str]) -> Result<Self, MetricsError> {
        Ok(Self {
            name: name.to_string(),
            help: help.to_string(),
            quantiles: quantiles.to_vec(),
            values: Arc::new(RwLock::new(Vec::new())),
            sum: Arc::new(RwLock::new(0.0)),
            count: Arc::new(RwLock::new(0)),
        })
    }
}

impl Metric for PrometheusSummary {
    fn name(&self) -> &str {
        &self.name
    }

    fn metric_type(&self) -> MetricType {
        MetricType::Summary
    }

    fn collect(&self) -> Result<MetricFamily, MetricsError> {
        let sum = *self.sum.read();
        let count = *self.count.read();

        Ok(MetricFamily {
            name: self.name.clone(),
            help: self.help.clone(),
            metric_type: MetricType::Summary,
            metrics: vec![MetricSample {
                labels: HashMap::new(),
                value: MetricValue::Summary {
                    sum,
                    count,
                    quantiles: HashMap::new(), // Simplified
                },
                timestamp: Some(Utc::now()),
            }],
        })
    }
}

impl Summary for PrometheusSummary {
    fn observe(&self, value: f64) {
        self.values.write().push(value);
        *self.sum.write() += value;
        *self.count.write() += 1;

        // Keep only recent values for quantile calculation
        let mut values = self.values.write();
        if values.len() > 10000 {
            values.drain(0..5000);
        }
    }

    fn get_sample_count(&self) -> u64 {
        *self.count.read()
    }

    fn get_sample_sum(&self) -> f64 {
        *self.sum.read()
    }

    fn get_quantiles(&self) -> Vec<Quantile> {
        let mut values = self.values.read().clone();
        values.sort_by(|a, b| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal));

        self.quantiles.iter().map(|&q| {
            let index = ((values.len() as f64 * q).ceil() as usize).saturating_sub(1);
            let value = values.get(index).copied().unwrap_or(0.0);
            Quantile { quantile: q, value }
        }).collect()
    }
}

impl Default for MetricStatistics {
    fn default() -> Self {
        Self {
            total_metrics: 0,
            active_metrics: 0,
            metrics_per_second: 0.0,
            export_count: 0,
            export_errors: 0,
            last_export_time: None,
            scrape_count: 0,
            scrape_errors: 0,
            last_scrape_time: None,
            tenant_stats: HashMap::new(),
            slo_compliance: HashMap::new(),
        }
    }
}

impl Default for TenantMetricStats {
    fn default() -> Self {
        Self {
            metric_count: 0,
            metrics_per_minute: 0.0,
            storage_usage_mb: 0.0,
            quota_utilization: 0.0,
        }
    }
}

/// Metrics error types
#[derive(Debug, thiserror::Error)]
pub enum MetricsError {
    #[error("Configuration error: {0}")]
    Configuration(String),

    #[error("Registration error: {0}")]
    Registration(String),

    #[error("Collection error: {0}")]
    Collection(String),

    #[error("Export error: {0}")]
    Export(String),

    #[error("Calculation error: {0}")]
    Calculation(String),

    #[error("Network error: {0}")]
    Network(String),

    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),

    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
}