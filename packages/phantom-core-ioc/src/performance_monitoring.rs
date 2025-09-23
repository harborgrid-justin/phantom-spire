// phantom-ioc-core/src/performance_monitoring.rs
// System health, performance metrics, and monitoring

use crate::types::*;
use chrono::{DateTime, Utc, Duration};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;

/// Performance monitoring engine for system health and metrics
pub struct PerformanceMonitoringEngine {
    metric_collectors: Arc<RwLock<HashMap<String, MetricCollector>>>,
    performance_metrics: Arc<RwLock<HashMap<String, PerformanceMetric>>>,
    alerts_config: Arc<RwLock<HashMap<String, AlertConfiguration>>>,
    system_components: Arc<RwLock<HashMap<String, SystemComponent>>>,
    statistics: Arc<RwLock<MonitoringStats>>,
}

impl PerformanceMonitoringEngine {
    /// Create a new performance monitoring engine
    pub async fn new() -> Result<Self, IOCError> {
        let engine = Self {
            metric_collectors: Arc::new(RwLock::new(HashMap::new())),
            performance_metrics: Arc::new(RwLock::new(HashMap::new())),
            alerts_config: Arc::new(RwLock::new(HashMap::new())),
            system_components: Arc::new(RwLock::new(HashMap::new())),
            statistics: Arc::new(RwLock::new(MonitoringStats::default())),
        };

        // Initialize with default monitoring configuration
        engine.initialize_default_monitoring().await?;

        Ok(engine)
    }

    /// Initialize default monitoring configuration
    async fn initialize_default_monitoring(&self) -> Result<(), IOCError> {
        // Define system components to monitor
        let default_components = vec![
            SystemComponent {
                id: "threat_hunting_engine".to_string(),
                name: "Threat Hunting Engine".to_string(),
                component_type: ComponentType::Service,
                status: ComponentStatus::Running,
                health_score: 100.0,
                dependencies: vec!["database".to_string(), "threat_intel_feeds".to_string()],
                resource_usage: ResourceMetrics {
                    cpu_usage_percent: 15.2,
                    memory_usage_bytes: 256 * 1024 * 1024, // 256 MB
                    disk_usage_bytes: 512 * 1024 * 1024,   // 512 MB
                    network_in_bytes_per_sec: 1024 * 100,  // 100 KB/s
                    network_out_bytes_per_sec: 1024 * 50,  // 50 KB/s
                },
                performance_metrics: HashMap::from([
                    ("queries_per_minute".to_string(), 25.0),
                    ("average_response_time_ms".to_string(), 850.0),
                    ("cache_hit_ratio".to_string(), 0.92),
                ]),
                last_health_check: Utc::now(),
                created_at: Utc::now(),
            },
            SystemComponent {
                id: "incident_response_engine".to_string(),
                name: "Incident Response Engine".to_string(),
                component_type: ComponentType::Service,
                status: ComponentStatus::Running,
                health_score: 98.5,
                dependencies: vec!["database".to_string(), "notification_system".to_string()],
                resource_usage: ResourceMetrics {
                    cpu_usage_percent: 8.7,
                    memory_usage_bytes: 128 * 1024 * 1024, // 128 MB
                    disk_usage_bytes: 256 * 1024 * 1024,   // 256 MB
                    network_in_bytes_per_sec: 1024 * 25,   // 25 KB/s
                    network_out_bytes_per_sec: 1024 * 75,  // 75 KB/s
                },
                performance_metrics: HashMap::from([
                    ("incidents_processed_per_hour".to_string(), 12.0),
                    ("average_resolution_time_minutes".to_string(), 45.0),
                    ("automation_success_rate".to_string(), 0.89),
                ]),
                last_health_check: Utc::now(),
                created_at: Utc::now(),
            },
            SystemComponent {
                id: "analytics_engine".to_string(),
                name: "Analytics Engine".to_string(),
                component_type: ComponentType::Service,
                status: ComponentStatus::Running,
                health_score: 95.8,
                dependencies: vec!["database".to_string(), "ml_models".to_string()],
                resource_usage: ResourceMetrics {
                    cpu_usage_percent: 45.3,
                    memory_usage_bytes: 1024 * 1024 * 1024, // 1 GB
                    disk_usage_bytes: 2048 * 1024 * 1024,   // 2 GB
                    network_in_bytes_per_sec: 1024 * 200,   // 200 KB/s
                    network_out_bytes_per_sec: 1024 * 150,  // 150 KB/s
                },
                performance_metrics: HashMap::from([
                    ("predictions_per_minute".to_string(), 50.0),
                    ("model_accuracy".to_string(), 0.923),
                    ("training_time_hours".to_string(), 2.5),
                ]),
                last_health_check: Utc::now(),
                created_at: Utc::now(),
            },
            SystemComponent {
                id: "database".to_string(),
                name: "Primary Database".to_string(),
                component_type: ComponentType::Database,
                status: ComponentStatus::Running,
                health_score: 99.2,
                dependencies: vec![],
                resource_usage: ResourceMetrics {
                    cpu_usage_percent: 22.1,
                    memory_usage_bytes: 2048 * 1024 * 1024, // 2 GB
                    disk_usage_bytes: 50 * 1024 * 1024 * 1024, // 50 GB
                    network_in_bytes_per_sec: 1024 * 500,   // 500 KB/s
                    network_out_bytes_per_sec: 1024 * 800,  // 800 KB/s
                },
                performance_metrics: HashMap::from([
                    ("connections_active".to_string(), 45.0),
                    ("queries_per_second".to_string(), 235.0),
                    ("average_query_time_ms".to_string(), 12.5),
                    ("cache_hit_ratio".to_string(), 0.96),
                ]),
                last_health_check: Utc::now(),
                created_at: Utc::now(),
            },
            SystemComponent {
                id: "notification_system".to_string(),
                name: "Notification System".to_string(),
                component_type: ComponentType::Service,
                status: ComponentStatus::Running,
                health_score: 97.3,
                dependencies: vec!["external_apis".to_string()],
                resource_usage: ResourceMetrics {
                    cpu_usage_percent: 5.8,
                    memory_usage_bytes: 64 * 1024 * 1024,  // 64 MB
                    disk_usage_bytes: 128 * 1024 * 1024,   // 128 MB
                    network_in_bytes_per_sec: 1024 * 10,   // 10 KB/s
                    network_out_bytes_per_sec: 1024 * 100, // 100 KB/s
                },
                performance_metrics: HashMap::from([
                    ("notifications_sent_per_minute".to_string(), 8.0),
                    ("delivery_success_rate".to_string(), 0.982),
                    ("average_delivery_time_ms".to_string(), 1250.0),
                ]),
                last_health_check: Utc::now(),
                created_at: Utc::now(),
            },
        ];

        let mut components = self.system_components.write().await;
        for component in default_components {
            components.insert(component.id.clone(), component);
        }
        drop(components);

        // Define metric collectors
        let default_collectors = vec![
            MetricCollector {
                id: "system_metrics".to_string(),
                name: "System Resource Metrics".to_string(),
                collector_type: CollectorType::System,
                collection_interval: Duration::seconds(30),
                enabled: true,
                targets: vec![
                    "threat_hunting_engine".to_string(),
                    "incident_response_engine".to_string(),
                    "analytics_engine".to_string(),
                    "database".to_string(),
                    "notification_system".to_string(),
                ],
                metrics_collected: vec![
                    "cpu_usage_percent".to_string(),
                    "memory_usage_bytes".to_string(),
                    "disk_usage_bytes".to_string(),
                    "network_in_bytes_per_sec".to_string(),
                    "network_out_bytes_per_sec".to_string(),
                ],
                last_collection: Utc::now(),
                configuration: CollectorConfiguration {
                    timeout: Duration::seconds(10),
                    retry_attempts: 3,
                    aggregation_method: AggregationMethod::Average,
                    sampling_rate: 1.0,
                },
            },
            MetricCollector {
                id: "performance_metrics".to_string(),
                name: "Application Performance Metrics".to_string(),
                collector_type: CollectorType::Application,
                collection_interval: Duration::minutes(1),
                enabled: true,
                targets: vec![
                    "threat_hunting_engine".to_string(),
                    "incident_response_engine".to_string(),
                    "analytics_engine".to_string(),
                ],
                metrics_collected: vec![
                    "response_time_ms".to_string(),
                    "throughput".to_string(),
                    "error_rate".to_string(),
                    "success_rate".to_string(),
                ],
                last_collection: Utc::now(),
                configuration: CollectorConfiguration {
                    timeout: Duration::seconds(5),
                    retry_attempts: 2,
                    aggregation_method: AggregationMethod::Average,
                    sampling_rate: 1.0,
                },
            },
            MetricCollector {
                id: "business_metrics".to_string(),
                name: "Business Process Metrics".to_string(),
                collector_type: CollectorType::Business,
                collection_interval: Duration::minutes(5),
                enabled: true,
                targets: vec![
                    "threat_hunting_engine".to_string(),
                    "incident_response_engine".to_string(),
                    "analytics_engine".to_string(),
                ],
                metrics_collected: vec![
                    "threats_detected_per_hour".to_string(),
                    "incidents_resolved_per_hour".to_string(),
                    "predictions_accuracy".to_string(),
                    "automation_rate".to_string(),
                ],
                last_collection: Utc::now(),
                configuration: CollectorConfiguration {
                    timeout: Duration::seconds(15),
                    retry_attempts: 1,
                    aggregation_method: AggregationMethod::Sum,
                    sampling_rate: 1.0,
                },
            },
        ];

        let mut collectors = self.metric_collectors.write().await;
        for collector in default_collectors {
            collectors.insert(collector.id.clone(), collector);
        }
        drop(collectors);

        // Define alert configurations
        let default_alerts = vec![
            AlertConfiguration {
                id: "high_cpu_usage".to_string(),
                name: "High CPU Usage Alert".to_string(),
                description: "Alert when CPU usage exceeds threshold".to_string(),
                metric_name: "cpu_usage_percent".to_string(),
                condition: AlertCondition {
                    operator: AlertOperator::GreaterThan,
                    threshold: 80.0,
                    duration: Duration::minutes(5),
                },
                severity: AlertSeverity::Warning,
                targets: vec![
                    "threat_hunting_engine".to_string(),
                    "analytics_engine".to_string(),
                    "database".to_string(),
                ],
                notification_channels: vec!["email".to_string(), "slack".to_string()],
                escalation_policy: Some(EscalationPolicy {
                    levels: vec![
                        EscalationLevel {
                            delay: Duration::minutes(0),
                            recipients: vec!["ops-team@company.com".to_string()],
                        },
                        EscalationLevel {
                            delay: Duration::minutes(15),
                            recipients: vec!["ops-manager@company.com".to_string()],
                        },
                    ],
                }),
                suppression_duration: Duration::minutes(30),
                enabled: true,
                created_at: Utc::now(),
            },
            AlertConfiguration {
                id: "memory_usage_critical".to_string(),
                name: "Critical Memory Usage".to_string(),
                description: "Alert when memory usage is critically high".to_string(),
                metric_name: "memory_usage_bytes".to_string(),
                condition: AlertCondition {
                    operator: AlertOperator::GreaterThan,
                    threshold: 3.5 * 1024.0 * 1024.0 * 1024.0, // 3.5 GB
                    duration: Duration::minutes(2),
                },
                severity: AlertSeverity::Critical,
                targets: vec![
                    "analytics_engine".to_string(),
                    "database".to_string(),
                ],
                notification_channels: vec!["email".to_string(), "sms".to_string(), "pagerduty".to_string()],
                escalation_policy: Some(EscalationPolicy {
                    levels: vec![
                        EscalationLevel {
                            delay: Duration::minutes(0),
                            recipients: vec!["ops-team@company.com".to_string(), "on-call@company.com".to_string()],
                        },
                    ],
                }),
                suppression_duration: Duration::minutes(15),
                enabled: true,
                created_at: Utc::now(),
            },
            AlertConfiguration {
                id: "low_success_rate".to_string(),
                name: "Low Success Rate Alert".to_string(),
                description: "Alert when operation success rate drops".to_string(),
                metric_name: "success_rate".to_string(),
                condition: AlertCondition {
                    operator: AlertOperator::LessThan,
                    threshold: 0.95,
                    duration: Duration::minutes(10),
                },
                severity: AlertSeverity::Warning,
                targets: vec![
                    "threat_hunting_engine".to_string(),
                    "incident_response_engine".to_string(),
                    "notification_system".to_string(),
                ],
                notification_channels: vec!["slack".to_string()],
                escalation_policy: None,
                suppression_duration: Duration::hours(1),
                enabled: true,
                created_at: Utc::now(),
            },
            AlertConfiguration {
                id: "component_down".to_string(),
                name: "Component Down Alert".to_string(),
                description: "Alert when a critical component goes down".to_string(),
                metric_name: "health_score".to_string(),
                condition: AlertCondition {
                    operator: AlertOperator::LessThan,
                    threshold: 50.0,
                    duration: Duration::seconds(30),
                },
                severity: AlertSeverity::Critical,
                targets: vec![
                    "threat_hunting_engine".to_string(),
                    "incident_response_engine".to_string(),
                    "database".to_string(),
                ],
                notification_channels: vec!["email".to_string(), "sms".to_string(), "pagerduty".to_string()],
                escalation_policy: Some(EscalationPolicy {
                    levels: vec![
                        EscalationLevel {
                            delay: Duration::minutes(0),
                            recipients: vec!["ops-team@company.com".to_string(), "cto@company.com".to_string()],
                        },
                    ],
                }),
                suppression_duration: Duration::minutes(5),
                enabled: true,
                created_at: Utc::now(),
            },
        ];

        let mut alerts = self.alerts_config.write().await;
        for alert in default_alerts {
            alerts.insert(alert.id.clone(), alert);
        }

        Ok(())
    }

    /// Collect metrics from all enabled collectors
    pub async fn collect_all_metrics(&self) -> Result<MetricCollectionResult, IOCError> {
        let collectors = self.metric_collectors.read().await;
        let enabled_collectors: Vec<_> = collectors.values()
            .filter(|c| c.enabled)
            .cloned()
            .collect();
        drop(collectors);

        let mut collection_results = Vec::new();
        let mut total_metrics_collected = 0;
        let mut successful_collections = 0;

        for collector in enabled_collectors {
            match self.collect_metrics_for_collector(&collector).await {
                Ok(metrics) => {
                    total_metrics_collected += metrics.len();
                    successful_collections += 1;
                    collection_results.push(CollectorResult {
                        collector_id: collector.id.clone(),
                        success: true,
                        metrics_collected: metrics.len() as u32,
                        error_message: None,
                        collection_time: Utc::now(),
                    });

                    // Store collected metrics
                    self.store_collected_metrics(&collector.id, metrics).await?;
                }
                Err(e) => {
                    collection_results.push(CollectorResult {
                        collector_id: collector.id.clone(),
                        success: false,
                        metrics_collected: 0,
                        error_message: Some(e.to_string()),
                        collection_time: Utc::now(),
                    });
                }
            }

            // Update collector's last collection time
            let mut collectors = self.metric_collectors.write().await;
            if let Some(collector_mut) = collectors.get_mut(&collector.id) {
                collector_mut.last_collection = Utc::now();
            }
            drop(collectors);
        }

        // Check for alerts
        let triggered_alerts = self.check_alert_conditions().await?;

        // Update statistics
        {
            let mut stats = self.statistics.write().await;
            stats.total_collections += 1;
            stats.successful_collections += successful_collections;
            stats.total_metrics_collected += total_metrics_collected as u64;
            stats.last_collection_time = Some(Utc::now());
        }

        Ok(MetricCollectionResult {
            total_collectors: collection_results.len() as u32,
            successful_collectors: successful_collections,
            total_metrics_collected: total_metrics_collected as u32,
            collection_results,
            triggered_alerts,
            collection_time: Utc::now(),
        })
    }

    /// Collect metrics for a specific collector
    async fn collect_metrics_for_collector(&self, collector: &MetricCollector) -> Result<Vec<PerformanceMetric>, IOCError> {
        let mut metrics = Vec::new();
        let collection_time = Utc::now();

        match collector.collector_type {
            CollectorType::System => {
                metrics.extend(self.collect_system_metrics(&collector.targets, collection_time).await?);
            }
            CollectorType::Application => {
                metrics.extend(self.collect_application_metrics(&collector.targets, collection_time).await?);
            }
            CollectorType::Business => {
                metrics.extend(self.collect_business_metrics(&collector.targets, collection_time).await?);
            }
            CollectorType::Network => {
                metrics.extend(self.collect_network_metrics(&collector.targets, collection_time).await?);
            }
        }

        // Filter metrics based on what this collector is configured to collect
        let filtered_metrics: Vec<_> = metrics.into_iter()
            .filter(|m| collector.metrics_collected.contains(&m.metric_name))
            .collect();

        Ok(filtered_metrics)
    }

    /// Collect system metrics
    async fn collect_system_metrics(&self, targets: &[String], timestamp: DateTime<Utc>) -> Result<Vec<PerformanceMetric>, IOCError> {
        let components = self.system_components.read().await;
        let mut metrics = Vec::new();

        for target in targets {
            if let Some(component) = components.get(target) {
                metrics.push(PerformanceMetric {
                    id: Uuid::new_v4().to_string(),
                    component_id: target.clone(),
                    metric_name: "cpu_usage_percent".to_string(),
                    value: component.resource_usage.cpu_usage_percent,
                    unit: "percent".to_string(),
                    timestamp,
                    tags: HashMap::from([
                        ("component_type".to_string(), format!("{:?}", component.component_type)),
                        ("metric_type".to_string(), "system".to_string()),
                    ]),
                });

                metrics.push(PerformanceMetric {
                    id: Uuid::new_v4().to_string(),
                    component_id: target.clone(),
                    metric_name: "memory_usage_bytes".to_string(),
                    value: component.resource_usage.memory_usage_bytes as f64,
                    unit: "bytes".to_string(),
                    timestamp,
                    tags: HashMap::from([
                        ("component_type".to_string(), format!("{:?}", component.component_type)),
                        ("metric_type".to_string(), "system".to_string()),
                    ]),
                });

                metrics.push(PerformanceMetric {
                    id: Uuid::new_v4().to_string(),
                    component_id: target.clone(),
                    metric_name: "health_score".to_string(),
                    value: component.health_score,
                    unit: "score".to_string(),
                    timestamp,
                    tags: HashMap::from([
                        ("component_type".to_string(), format!("{:?}", component.component_type)),
                        ("metric_type".to_string(), "health".to_string()),
                    ]),
                });
            }
        }

        Ok(metrics)
    }

    /// Collect application metrics
    async fn collect_application_metrics(&self, targets: &[String], timestamp: DateTime<Utc>) -> Result<Vec<PerformanceMetric>, IOCError> {
        let components = self.system_components.read().await;
        let mut metrics = Vec::new();

        for target in targets {
            if let Some(component) = components.get(target) {
                // Simulate application-specific metrics
                for (metric_name, value) in &component.performance_metrics {
                    metrics.push(PerformanceMetric {
                        id: Uuid::new_v4().to_string(),
                        component_id: target.clone(),
                        metric_name: metric_name.clone(),
                        value: *value,
                        unit: self.get_metric_unit(metric_name),
                        timestamp,
                        tags: HashMap::from([
                            ("component_type".to_string(), format!("{:?}", component.component_type)),
                            ("metric_type".to_string(), "application".to_string()),
                        ]),
                    });
                }

                // Add derived metrics
                if let Some(queries_per_minute) = component.performance_metrics.get("queries_per_minute") {
                    metrics.push(PerformanceMetric {
                        id: Uuid::new_v4().to_string(),
                        component_id: target.clone(),
                        metric_name: "success_rate".to_string(),
                        value: 0.96, // Simulated success rate
                        unit: "ratio".to_string(),
                        timestamp,
                        tags: HashMap::from([
                            ("derived".to_string(), "true".to_string()),
                            ("metric_type".to_string(), "application".to_string()),
                        ]),
                    });
                }
            }
        }

        Ok(metrics)
    }

    /// Collect business metrics
    async fn collect_business_metrics(&self, targets: &[String], timestamp: DateTime<Utc>) -> Result<Vec<PerformanceMetric>, IOCError> {
        let mut metrics = Vec::new();

        for target in targets {
            // Simulate business KPIs
            match target.as_str() {
                "threat_hunting_engine" => {
                    metrics.push(PerformanceMetric {
                        id: Uuid::new_v4().to_string(),
                        component_id: target.clone(),
                        metric_name: "threats_detected_per_hour".to_string(),
                        value: 15.0,
                        unit: "count/hour".to_string(),
                        timestamp,
                        tags: HashMap::from([
                            ("metric_type".to_string(), "business".to_string()),
                            ("kpi".to_string(), "true".to_string()),
                        ]),
                    });
                }
                "incident_response_engine" => {
                    metrics.push(PerformanceMetric {
                        id: Uuid::new_v4().to_string(),
                        component_id: target.clone(),
                        metric_name: "incidents_resolved_per_hour".to_string(),
                        value: 8.0,
                        unit: "count/hour".to_string(),
                        timestamp,
                        tags: HashMap::from([
                            ("metric_type".to_string(), "business".to_string()),
                            ("kpi".to_string(), "true".to_string()),
                        ]),
                    });

                    metrics.push(PerformanceMetric {
                        id: Uuid::new_v4().to_string(),
                        component_id: target.clone(),
                        metric_name: "automation_rate".to_string(),
                        value: 0.89,
                        unit: "ratio".to_string(),
                        timestamp,
                        tags: HashMap::from([
                            ("metric_type".to_string(), "business".to_string()),
                            ("kpi".to_string(), "true".to_string()),
                        ]),
                    });
                }
                "analytics_engine" => {
                    metrics.push(PerformanceMetric {
                        id: Uuid::new_v4().to_string(),
                        component_id: target.clone(),
                        metric_name: "predictions_accuracy".to_string(),
                        value: 0.923,
                        unit: "ratio".to_string(),
                        timestamp,
                        tags: HashMap::from([
                            ("metric_type".to_string(), "business".to_string()),
                            ("kpi".to_string(), "true".to_string()),
                        ]),
                    });
                }
                _ => {}
            }
        }

        Ok(metrics)
    }

    /// Collect network metrics
    async fn collect_network_metrics(&self, targets: &[String], timestamp: DateTime<Utc>) -> Result<Vec<PerformanceMetric>, IOCError> {
        let components = self.system_components.read().await;
        let mut metrics = Vec::new();

        for target in targets {
            if let Some(component) = components.get(target) {
                metrics.push(PerformanceMetric {
                    id: Uuid::new_v4().to_string(),
                    component_id: target.clone(),
                    metric_name: "network_in_bytes_per_sec".to_string(),
                    value: component.resource_usage.network_in_bytes_per_sec as f64,
                    unit: "bytes/sec".to_string(),
                    timestamp,
                    tags: HashMap::from([
                        ("metric_type".to_string(), "network".to_string()),
                        ("direction".to_string(), "inbound".to_string()),
                    ]),
                });

                metrics.push(PerformanceMetric {
                    id: Uuid::new_v4().to_string(),
                    component_id: target.clone(),
                    metric_name: "network_out_bytes_per_sec".to_string(),
                    value: component.resource_usage.network_out_bytes_per_sec as f64,
                    unit: "bytes/sec".to_string(),
                    timestamp,
                    tags: HashMap::from([
                        ("metric_type".to_string(), "network".to_string()),
                        ("direction".to_string(), "outbound".to_string()),
                    ]),
                });
            }
        }

        Ok(metrics)
    }

    /// Get appropriate unit for a metric
    fn get_metric_unit(&self, metric_name: &str) -> String {
        match metric_name {
            s if s.contains("time_ms") => "milliseconds".to_string(),
            s if s.contains("time_minutes") => "minutes".to_string(),
            s if s.contains("time_hours") => "hours".to_string(),
            s if s.contains("_rate") => "ratio".to_string(),
            s if s.contains("_ratio") => "ratio".to_string(),
            s if s.contains("_percent") => "percent".to_string(),
            s if s.contains("per_minute") => "count/minute".to_string(),
            s if s.contains("per_hour") => "count/hour".to_string(),
            s if s.contains("per_second") => "count/second".to_string(),
            s if s.contains("connections") => "count".to_string(),
            s if s.contains("queries") => "count".to_string(),
            _ => "value".to_string(),
        }
    }

    /// Store collected metrics
    async fn store_collected_metrics(&self, collector_id: &str, metrics: Vec<PerformanceMetric>) -> Result<(), IOCError> {
        let mut stored_metrics = self.performance_metrics.write().await;
        
        for metric in metrics {
            stored_metrics.insert(metric.id.clone(), metric);
        }

        // Keep only last 10,000 metrics in memory
        if stored_metrics.len() > 10_000 {
            let mut sorted_metrics: Vec<_> = stored_metrics.values().cloned().collect();
            sorted_metrics.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));
            
            stored_metrics.clear();
            for metric in sorted_metrics.into_iter().take(7_500) {
                stored_metrics.insert(metric.id.clone(), metric);
            }
        }

        Ok(())
    }

    /// Check alert conditions
    async fn check_alert_conditions(&self) -> Result<Vec<TriggeredAlert>, IOCError> {
        let alerts_config = self.alerts_config.read().await;
        let metrics = self.performance_metrics.read().await;
        let mut triggered_alerts = Vec::new();

        for alert in alerts_config.values() {
            if !alert.enabled {
                continue;
            }

            for target in &alert.targets {
                // Get recent metrics for this target and metric name
                let recent_metrics: Vec<_> = metrics.values()
                    .filter(|m| m.component_id == *target && m.metric_name == alert.metric_name)
                    .filter(|m| m.timestamp > Utc::now() - alert.condition.duration)
                    .cloned()
                    .collect();

                if recent_metrics.is_empty() {
                    continue;
                }

                // Calculate aggregated value
                let aggregated_value = match recent_metrics.len() {
                    0 => continue,
                    1 => recent_metrics[0].value,
                    _ => {
                        let sum: f64 = recent_metrics.iter().map(|m| m.value).sum();
                        sum / recent_metrics.len() as f64
                    }
                };

                // Check if condition is met
                let condition_met = match alert.condition.operator {
                    AlertOperator::GreaterThan => aggregated_value > alert.condition.threshold,
                    AlertOperator::LessThan => aggregated_value < alert.condition.threshold,
                    AlertOperator::Equals => (aggregated_value - alert.condition.threshold).abs() < 0.001,
                    AlertOperator::NotEquals => (aggregated_value - alert.condition.threshold).abs() >= 0.001,
                };

                if condition_met {
                    triggered_alerts.push(TriggeredAlert {
                        id: Uuid::new_v4().to_string(),
                        alert_config_id: alert.id.clone(),
                        component_id: target.clone(),
                        metric_name: alert.metric_name.clone(),
                        current_value: aggregated_value,
                        threshold_value: alert.condition.threshold,
                        severity: alert.severity.clone(),
                        triggered_at: Utc::now(),
                        message: format!(
                            "Alert: {} for component {} - Current value: {:.2}, Threshold: {:.2}",
                            alert.name, target, aggregated_value, alert.condition.threshold
                        ),
                    });
                }
            }
        }

        Ok(triggered_alerts)
    }

    /// Get system health overview
    pub async fn get_system_health(&self) -> SystemHealthOverview {
        let components = self.system_components.read().await;
        let metrics = self.performance_metrics.read().await;
        
        let total_components = components.len() as u32;
        let healthy_components = components.values()
            .filter(|c| c.health_score >= 90.0)
            .count() as u32;
        let degraded_components = components.values()
            .filter(|c| c.health_score >= 70.0 && c.health_score < 90.0)
            .count() as u32;
        let unhealthy_components = components.values()
            .filter(|c| c.health_score < 70.0)
            .count() as u32;

        let overall_health_score = if total_components > 0 {
            components.values().map(|c| c.health_score).sum::<f64>() / total_components as f64
        } else {
            0.0
        };

        let status = if overall_health_score >= 95.0 {
            SystemHealthStatus::Healthy
        } else if overall_health_score >= 80.0 {
            SystemHealthStatus::Degraded
        } else if overall_health_score >= 50.0 {
            SystemHealthStatus::Critical
        } else {
            SystemHealthStatus::Down
        };

        // Calculate resource utilization
        let total_cpu_usage = components.values()
            .map(|c| c.resource_usage.cpu_usage_percent)
            .sum::<f64>() / components.len() as f64;

        let total_memory_usage = components.values()
            .map(|c| c.resource_usage.memory_usage_bytes)
            .sum::<u64>();

        SystemHealthOverview {
            overall_status: status,
            overall_health_score,
            total_components,
            healthy_components,
            degraded_components,
            unhealthy_components,
            resource_utilization: SystemResourceUtilization {
                average_cpu_usage: total_cpu_usage,
                total_memory_usage_bytes: total_memory_usage,
                total_disk_usage_bytes: components.values()
                    .map(|c| c.resource_usage.disk_usage_bytes)
                    .sum(),
                total_network_in_bytes_per_sec: components.values()
                    .map(|c| c.resource_usage.network_in_bytes_per_sec)
                    .sum(),
                total_network_out_bytes_per_sec: components.values()
                    .map(|c| c.resource_usage.network_out_bytes_per_sec)
                    .sum(),
            },
            component_statuses: components.values()
                .map(|c| ComponentHealthSummary {
                    component_id: c.id.clone(),
                    name: c.name.clone(),
                    status: c.status.clone(),
                    health_score: c.health_score,
                    last_check: c.last_health_check,
                })
                .collect(),
            recent_alerts_count: 0, // Would count recent alerts in production
            last_updated: Utc::now(),
        }
    }

    /// Get performance metrics for a component
    pub async fn get_component_metrics(&self, component_id: &str, time_range: Option<(DateTime<Utc>, DateTime<Utc>)>) -> Result<Vec<PerformanceMetric>, IOCError> {
        let metrics = self.performance_metrics.read().await;
        
        let filtered_metrics: Vec<_> = metrics.values()
            .filter(|m| m.component_id == component_id)
            .filter(|m| {
                if let Some((start, end)) = time_range {
                    m.timestamp >= start && m.timestamp <= end
                } else {
                    // Default to last 24 hours
                    m.timestamp > Utc::now() - Duration::hours(24)
                }
            })
            .cloned()
            .collect();

        Ok(filtered_metrics)
    }

    /// Get monitoring statistics
    pub async fn get_statistics(&self) -> MonitoringStats {
        self.statistics.read().await.clone()
    }

    /// Get health status
    pub async fn get_health(&self) -> ComponentHealth {
        let stats = self.statistics.read().await;
        let collectors = self.metric_collectors.read().await;
        let components = self.system_components.read().await;

        ComponentHealth {
            status: HealthStatus::Healthy,
            message: format!("Performance monitoring operational with {} collectors and {} components", collectors.len(), components.len()),
            last_check: Utc::now(),
            metrics: HashMap::from([
                ("total_collectors".to_string(), collectors.len() as f64),
                ("total_components".to_string(), components.len() as f64),
                ("total_collections".to_string(), stats.total_collections as f64),
                ("success_rate".to_string(), if stats.total_collections > 0 {
                    stats.successful_collections as f64 / stats.total_collections as f64 * 100.0
                } else { 100.0 }),
                ("total_metrics_collected".to_string(), stats.total_metrics_collected as f64),
            ]),
        }
    }
}

// Performance monitoring data structures

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemComponent {
    pub id: String,
    pub name: String,
    pub component_type: ComponentType,
    pub status: ComponentStatus,
    pub health_score: f64,
    pub dependencies: Vec<String>,
    pub resource_usage: ResourceMetrics,
    pub performance_metrics: HashMap<String, f64>,
    pub last_health_check: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ComponentType {
    Service,
    Database,
    Queue,
    Cache,
    LoadBalancer,
    External,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ComponentStatus {
    Running,
    Stopped,
    Starting,
    Stopping,
    Failed,
    Unknown,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourceMetrics {
    pub cpu_usage_percent: f64,
    pub memory_usage_bytes: u64,
    pub disk_usage_bytes: u64,
    pub network_in_bytes_per_sec: u64,
    pub network_out_bytes_per_sec: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetricCollector {
    pub id: String,
    pub name: String,
    pub collector_type: CollectorType,
    pub collection_interval: Duration,
    pub enabled: bool,
    pub targets: Vec<String>,
    pub metrics_collected: Vec<String>,
    pub last_collection: DateTime<Utc>,
    pub configuration: CollectorConfiguration,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CollectorType {
    System,
    Application,
    Business,
    Network,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CollectorConfiguration {
    pub timeout: Duration,
    pub retry_attempts: u32,
    pub aggregation_method: AggregationMethod,
    pub sampling_rate: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AggregationMethod {
    Average,
    Sum,
    Max,
    Min,
    Count,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceMetric {
    pub id: String,
    pub component_id: String,
    pub metric_name: String,
    pub value: f64,
    pub unit: String,
    pub timestamp: DateTime<Utc>,
    pub tags: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AlertConfiguration {
    pub id: String,
    pub name: String,
    pub description: String,
    pub metric_name: String,
    pub condition: AlertCondition,
    pub severity: AlertSeverity,
    pub targets: Vec<String>,
    pub notification_channels: Vec<String>,
    pub escalation_policy: Option<EscalationPolicy>,
    pub suppression_duration: Duration,
    pub enabled: bool,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AlertCondition {
    pub operator: AlertOperator,
    pub threshold: f64,
    pub duration: Duration,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AlertOperator {
    GreaterThan,
    LessThan,
    Equals,
    NotEquals,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AlertSeverity {
    Info,
    Warning,
    Critical,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EscalationPolicy {
    pub levels: Vec<EscalationLevel>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EscalationLevel {
    pub delay: Duration,
    pub recipients: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TriggeredAlert {
    pub id: String,
    pub alert_config_id: String,
    pub component_id: String,
    pub metric_name: String,
    pub current_value: f64,
    pub threshold_value: f64,
    pub severity: AlertSeverity,
    pub triggered_at: DateTime<Utc>,
    pub message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetricCollectionResult {
    pub total_collectors: u32,
    pub successful_collectors: u32,
    pub total_metrics_collected: u32,
    pub collection_results: Vec<CollectorResult>,
    pub triggered_alerts: Vec<TriggeredAlert>,
    pub collection_time: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CollectorResult {
    pub collector_id: String,
    pub success: bool,
    pub metrics_collected: u32,
    pub error_message: Option<String>,
    pub collection_time: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemHealthOverview {
    pub overall_status: SystemHealthStatus,
    pub overall_health_score: f64,
    pub total_components: u32,
    pub healthy_components: u32,
    pub degraded_components: u32,
    pub unhealthy_components: u32,
    pub resource_utilization: SystemResourceUtilization,
    pub component_statuses: Vec<ComponentHealthSummary>,
    pub recent_alerts_count: u32,
    pub last_updated: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SystemHealthStatus {
    Healthy,
    Degraded,
    Critical,
    Down,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemResourceUtilization {
    pub average_cpu_usage: f64,
    pub total_memory_usage_bytes: u64,
    pub total_disk_usage_bytes: u64,
    pub total_network_in_bytes_per_sec: u64,
    pub total_network_out_bytes_per_sec: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComponentHealthSummary {
    pub component_id: String,
    pub name: String,
    pub status: ComponentStatus,
    pub health_score: f64,
    pub last_check: DateTime<Utc>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct MonitoringStats {
    pub total_collections: u64,
    pub successful_collections: u32,
    pub failed_collections: u32,
    pub total_metrics_collected: u64,
    pub alerts_triggered: u64,
    pub average_collection_time_ms: f64,
    pub last_collection_time: Option<DateTime<Utc>>,
}