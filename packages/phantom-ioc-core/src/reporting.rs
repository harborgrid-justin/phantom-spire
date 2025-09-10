// phantom-ioc-core/src/reporting.rs
// Executive dashboards, business intelligence, and custom reports

use crate::types::*;
use chrono::{DateTime, Utc, Duration};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;

/// Reporting engine for business intelligence and executive dashboards
pub struct ReportingEngine {
    report_templates: Arc<RwLock<HashMap<String, ReportTemplate>>>,
    generated_reports: Arc<RwLock<HashMap<String, GeneratedReport>>>,
    dashboards: Arc<RwLock<HashMap<String, Dashboard>>>,
    data_sources: Arc<RwLock<HashMap<String, DataSource>>>,
    statistics: Arc<RwLock<ReportingStats>>,
}

impl ReportingEngine {
    /// Create a new reporting engine
    pub async fn new() -> Result<Self, IOCError> {
        let engine = Self {
            report_templates: Arc::new(RwLock::new(HashMap::new())),
            generated_reports: Arc::new(RwLock::new(HashMap::new())),
            dashboards: Arc::new(RwLock::new(HashMap::new())),
            data_sources: Arc::new(RwLock::new(HashMap::new())),
            statistics: Arc::new(RwLock::new(ReportingStats::default())),
        };

        // Initialize with default templates and dashboards
        engine.initialize_default_templates().await?;

        Ok(engine)
    }

    /// Initialize default report templates and dashboards
    async fn initialize_default_templates(&self) -> Result<(), IOCError> {
        // Define default data sources
        let default_data_sources = vec![
            DataSource {
                id: "ioc_database".to_string(),
                name: "IOC Database".to_string(),
                source_type: DataSourceType::Database,
                connection_string: "internal://ioc_db".to_string(),
                refresh_interval: Duration::minutes(5),
                enabled: true,
                last_refresh: Utc::now(),
                schema: DataSchema {
                    tables: vec![
                        DataTable {
                            name: "iocs".to_string(),
                            fields: vec![
                                DataField { name: "id".to_string(), field_type: "string".to_string(), nullable: false },
                                DataField { name: "type".to_string(), field_type: "string".to_string(), nullable: false },
                                DataField { name: "value".to_string(), field_type: "string".to_string(), nullable: false },
                                DataField { name: "confidence".to_string(), field_type: "number".to_string(), nullable: false },
                                DataField { name: "severity".to_string(), field_type: "string".to_string(), nullable: false },
                                DataField { name: "created_at".to_string(), field_type: "datetime".to_string(), nullable: false },
                            ],
                        },
                    ],
                },
            },
            DataSource {
                id: "threat_intelligence".to_string(),
                name: "Threat Intelligence Feeds".to_string(),
                source_type: DataSourceType::API,
                connection_string: "internal://threat_intel".to_string(),
                refresh_interval: Duration::hours(1),
                enabled: true,
                last_refresh: Utc::now(),
                schema: DataSchema {
                    tables: vec![
                        DataTable {
                            name: "threat_feeds".to_string(),
                            fields: vec![
                                DataField { name: "feed_id".to_string(), field_type: "string".to_string(), nullable: false },
                                DataField { name: "indicators_count".to_string(), field_type: "number".to_string(), nullable: false },
                                DataField { name: "last_sync".to_string(), field_type: "datetime".to_string(), nullable: false },
                            ],
                        },
                    ],
                },
            },
        ];

        let mut data_sources = self.data_sources.write().await;
        for source in default_data_sources {
            data_sources.insert(source.id.clone(), source);
        }
        drop(data_sources);

        // Define default report templates
        let default_templates = vec![
            ReportTemplate {
                id: "executive_summary".to_string(),
                name: "Executive Security Summary".to_string(),
                description: "High-level security metrics for executive leadership".to_string(),
                category: ReportCategory::Executive,
                template_type: ReportType::Summary,
                data_sources: vec!["ioc_database".to_string(), "threat_intelligence".to_string()],
                sections: vec![
                    ReportSection {
                        id: "threat_overview".to_string(),
                        title: "Threat Landscape Overview".to_string(),
                        section_type: SectionType::Summary,
                        data_query: DataQuery {
                            source_id: "ioc_database".to_string(),
                            query: "SELECT severity, COUNT(*) as count FROM iocs WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) GROUP BY severity".to_string(),
                            parameters: HashMap::new(),
                        },
                        visualizations: vec![
                            Visualization {
                                id: "threat_severity_chart".to_string(),
                                chart_type: ChartType::PieChart,
                                title: "Threats by Severity (Last 30 Days)".to_string(),
                                data_mapping: DataMapping {
                                    x_axis: "severity".to_string(),
                                    y_axis: "count".to_string(),
                                    series: None,
                                    filters: vec![],
                                },
                                formatting: ChartFormatting {
                                    colors: vec!["#ff4444".to_string(), "#ff8800".to_string(), "#ffbb33".to_string(), "#00C851".to_string()],
                                    show_legend: true,
                                    show_labels: true,
                                },
                            },
                        ],
                        kpis: vec![
                            KPI {
                                id: "critical_threats".to_string(),
                                name: "Critical Threats".to_string(),
                                description: "Number of critical threats detected".to_string(),
                                value_query: DataQuery {
                                    source_id: "ioc_database".to_string(),
                                    query: "SELECT COUNT(*) FROM iocs WHERE severity = 'critical' AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)".to_string(),
                                    parameters: HashMap::new(),
                                },
                                target_value: Some(0.0),
                                trend_direction: TrendDirection::Down,
                                format: KPIFormat::Number,
                            },
                            KPI {
                                id: "response_time".to_string(),
                                name: "Average Response Time".to_string(),
                                description: "Average time to respond to threats".to_string(),
                                value_query: DataQuery {
                                    source_id: "ioc_database".to_string(),
                                    query: "SELECT AVG(response_time_minutes) FROM incidents WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)".to_string(),
                                    parameters: HashMap::new(),
                                },
                                target_value: Some(30.0),
                                trend_direction: TrendDirection::Down,
                                format: KPIFormat::Duration,
                            },
                        ],
                        text_content: "This section provides an overview of the current threat landscape and our organization's security posture.".to_string(),
                    },
                    ReportSection {
                        id: "threat_intelligence_feeds".to_string(),
                        title: "Threat Intelligence Performance".to_string(),
                        section_type: SectionType::Analysis,
                        data_query: DataQuery {
                            source_id: "threat_intelligence".to_string(),
                            query: "SELECT feed_id, indicators_count, last_sync FROM threat_feeds ORDER BY last_sync DESC".to_string(),
                            parameters: HashMap::new(),
                        },
                        visualizations: vec![
                            Visualization {
                                id: "feed_performance".to_string(),
                                chart_type: ChartType::BarChart,
                                title: "Indicators by Feed Source".to_string(),
                                data_mapping: DataMapping {
                                    x_axis: "feed_id".to_string(),
                                    y_axis: "indicators_count".to_string(),
                                    series: None,
                                    filters: vec![],
                                },
                                formatting: ChartFormatting {
                                    colors: vec!["#4285f4".to_string()],
                                    show_legend: false,
                                    show_labels: true,
                                },
                            },
                        ],
                        kpis: vec![
                            KPI {
                                id: "active_feeds".to_string(),
                                name: "Active Feeds".to_string(),
                                description: "Number of active threat intelligence feeds".to_string(),
                                value_query: DataQuery {
                                    source_id: "threat_intelligence".to_string(),
                                    query: "SELECT COUNT(*) FROM threat_feeds WHERE last_sync >= DATE_SUB(NOW(), INTERVAL 24 HOUR)".to_string(),
                                    parameters: HashMap::new(),
                                },
                                target_value: Some(5.0),
                                trend_direction: TrendDirection::Up,
                                format: KPIFormat::Number,
                            },
                        ],
                        text_content: "Performance metrics for threat intelligence feeds and data quality indicators.".to_string(),
                    },
                ],
                parameters: vec![
                    ReportParameter {
                        name: "time_period".to_string(),
                        parameter_type: "select".to_string(),
                        default_value: "30_days".to_string(),
                        options: vec!["7_days".to_string(), "30_days".to_string(), "90_days".to_string()],
                        required: true,
                    },
                ],
                schedule: Some(ReportSchedule {
                    frequency: ScheduleFrequency::Weekly,
                    day_of_week: Some(1), // Monday
                    time_of_day: "09:00".to_string(),
                    timezone: "UTC".to_string(),
                }),
                output_formats: vec![OutputFormat::PDF, OutputFormat::HTML, OutputFormat::Email],
                recipients: vec![
                    "ciso@company.com".to_string(),
                    "security-leadership@company.com".to_string(),
                ],
                created_at: Utc::now(),
                updated_at: Utc::now(),
                enabled: true,
            },
            ReportTemplate {
                id: "technical_analysis".to_string(),
                name: "Technical Security Analysis".to_string(),
                description: "Detailed technical analysis for security operations team".to_string(),
                category: ReportCategory::Technical,
                template_type: ReportType::Detailed,
                data_sources: vec!["ioc_database".to_string()],
                sections: vec![
                    ReportSection {
                        id: "ioc_analysis".to_string(),
                        title: "IOC Analysis".to_string(),
                        section_type: SectionType::Analysis,
                        data_query: DataQuery {
                            source_id: "ioc_database".to_string(),
                            query: "SELECT type, COUNT(*) as count, AVG(confidence) as avg_confidence FROM iocs WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) GROUP BY type".to_string(),
                            parameters: HashMap::new(),
                        },
                        visualizations: vec![
                            Visualization {
                                id: "ioc_types_chart".to_string(),
                                chart_type: ChartType::BarChart,
                                title: "IOC Types Distribution".to_string(),
                                data_mapping: DataMapping {
                                    x_axis: "type".to_string(),
                                    y_axis: "count".to_string(),
                                    series: None,
                                    filters: vec![],
                                },
                                formatting: ChartFormatting {
                                    colors: vec!["#1f77b4".to_string(), "#ff7f0e".to_string(), "#2ca02c".to_string()],
                                    show_legend: true,
                                    show_labels: true,
                                },
                            },
                            Visualization {
                                id: "confidence_trend".to_string(),
                                chart_type: ChartType::LineChart,
                                title: "Average Confidence Over Time".to_string(),
                                data_mapping: DataMapping {
                                    x_axis: "created_at".to_string(),
                                    y_axis: "avg_confidence".to_string(),
                                    series: Some("type".to_string()),
                                    filters: vec![],
                                },
                                formatting: ChartFormatting {
                                    colors: vec!["#d62728".to_string(), "#9467bd".to_string()],
                                    show_legend: true,
                                    show_labels: false,
                                },
                            },
                        ],
                        kpis: vec![
                            KPI {
                                id: "total_iocs".to_string(),
                                name: "Total IOCs Processed".to_string(),
                                description: "Total number of IOCs processed this week".to_string(),
                                value_query: DataQuery {
                                    source_id: "ioc_database".to_string(),
                                    query: "SELECT COUNT(*) FROM iocs WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)".to_string(),
                                    parameters: HashMap::new(),
                                },
                                target_value: None,
                                trend_direction: TrendDirection::Up,
                                format: KPIFormat::Number,
                            },
                        ],
                        text_content: "Detailed analysis of IOC processing and classification metrics.".to_string(),
                    },
                ],
                parameters: vec![],
                schedule: Some(ReportSchedule {
                    frequency: ScheduleFrequency::Daily,
                    day_of_week: None,
                    time_of_day: "08:00".to_string(),
                    timezone: "UTC".to_string(),
                }),
                output_formats: vec![OutputFormat::PDF, OutputFormat::JSON],
                recipients: vec![
                    "soc@company.com".to_string(),
                    "threat-analysts@company.com".to_string(),
                ],
                created_at: Utc::now(),
                updated_at: Utc::now(),
                enabled: true,
            },
        ];

        let mut templates = self.report_templates.write().await;
        for template in default_templates {
            templates.insert(template.id.clone(), template);
        }
        drop(templates);

        // Define default dashboards
        let default_dashboards = vec![
            Dashboard {
                id: "security_overview".to_string(),
                name: "Security Overview Dashboard".to_string(),
                description: "Real-time security metrics and key indicators".to_string(),
                layout: DashboardLayout {
                    columns: 3,
                    rows: 4,
                    responsive: true,
                },
                widgets: vec![
                    DashboardWidget {
                        id: "threat_count".to_string(),
                        title: "Active Threats".to_string(),
                        widget_type: WidgetType::KPI,
                        position: WidgetPosition { x: 0, y: 0, width: 1, height: 1 },
                        data_source: "ioc_database".to_string(),
                        configuration: WidgetConfiguration {
                            query: "SELECT COUNT(*) FROM iocs WHERE severity IN ('high', 'critical') AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)".to_string(),
                            refresh_interval: Duration::minutes(5),
                            parameters: HashMap::new(),
                            formatting: serde_json::json!({
                                "color": "#ff4444",
                                "icon": "warning",
                                "trend": "down"
                            }),
                        },
                    },
                    DashboardWidget {
                        id: "ioc_trend".to_string(),
                        title: "IOC Trend (7 Days)".to_string(),
                        widget_type: WidgetType::Chart,
                        position: WidgetPosition { x: 1, y: 0, width: 2, height: 2 },
                        data_source: "ioc_database".to_string(),
                        configuration: WidgetConfiguration {
                            query: "SELECT DATE(created_at) as date, COUNT(*) as count FROM iocs WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) GROUP BY DATE(created_at) ORDER BY date".to_string(),
                            refresh_interval: Duration::minutes(15),
                            parameters: HashMap::new(),
                            formatting: serde_json::json!({
                                "chart_type": "line",
                                "x_axis": "date",
                                "y_axis": "count"
                            }),
                        },
                    },
                    DashboardWidget {
                        id: "severity_distribution".to_string(),
                        title: "Threat Severity Distribution".to_string(),
                        widget_type: WidgetType::Chart,
                        position: WidgetPosition { x: 0, y: 1, width: 1, height: 1 },
                        data_source: "ioc_database".to_string(),
                        configuration: WidgetConfiguration {
                            query: "SELECT severity, COUNT(*) as count FROM iocs WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) GROUP BY severity".to_string(),
                            refresh_interval: Duration::minutes(10),
                            parameters: HashMap::new(),
                            formatting: serde_json::json!({
                                "chart_type": "donut",
                                "colors": ["#00C851", "#ffbb33", "#ff8800", "#ff4444"]
                            }),
                        },
                    },
                ],
                filters: vec![
                    DashboardFilter {
                        id: "time_range".to_string(),
                        name: "Time Range".to_string(),
                        filter_type: FilterType::DateRange,
                        default_value: "7_days".to_string(),
                        options: vec!["1_day".to_string(), "7_days".to_string(), "30_days".to_string()],
                    },
                ],
                refresh_interval: Duration::minutes(5),
                auto_refresh: true,
                created_at: Utc::now(),
                updated_at: Utc::now(),
                enabled: true,
            },
        ];

        let mut dashboards = self.dashboards.write().await;
        for dashboard in default_dashboards {
            dashboards.insert(dashboard.id.clone(), dashboard);
        }

        Ok(())
    }

    /// Generate a report from a template
    pub async fn generate_report(&self, template_id: &str, parameters: &HashMap<String, String>) -> Result<GeneratedReport, IOCError> {
        let template = {
            let templates = self.report_templates.read().await;
            templates.get(template_id)
                .ok_or_else(|| IOCError::Configuration(format!("Report template not found: {}", template_id)))?
                .clone()
        };

        if !template.enabled {
            return Err(IOCError::Configuration(format!("Report template is disabled: {}", template_id)));
        }

        let report_id = Uuid::new_v4().to_string();
        let generation_start = Utc::now();

        // Generate report sections
        let mut sections = Vec::new();
        for section_template in &template.sections {
            let section = self.generate_report_section(section_template, parameters).await?;
            sections.push(section);
        }

        let generation_end = Utc::now();
        let generation_duration = generation_end - generation_start;

        // Generate report content in different formats
        let mut output_files = HashMap::new();
        for format in &template.output_formats {
            let content = self.render_report_format(&template, &sections, format).await?;
            output_files.insert(format.clone(), content);
        }

        let report = GeneratedReport {
            id: report_id.clone(),
            template_id: template.id.clone(),
            title: template.name.clone(),
            generated_at: generation_start,
            generation_duration_ms: generation_duration.num_milliseconds(),
            parameters: parameters.clone(),
            sections,
            output_files,
            metadata: ReportMetadata {
                data_freshness: self.calculate_data_freshness(&template.data_sources).await,
                record_count: self.calculate_total_records(&template.data_sources).await,
                quality_score: 0.95, // Would be calculated based on data quality metrics
                generation_method: "automated".to_string(),
            },
            status: ReportStatus::Generated,
        };

        // Store generated report
        {
            let mut reports = self.generated_reports.write().await;
            reports.insert(report_id, report.clone());
        }

        // Update statistics
        {
            let mut stats = self.statistics.write().await;
            stats.total_reports_generated += 1;
            stats.total_generation_time_ms += generation_duration.num_milliseconds();
            stats.last_report_generated = Some(generation_end);
        }

        Ok(report)
    }

    /// Generate a single report section
    async fn generate_report_section(&self, section_template: &ReportSection, parameters: &HashMap<String, String>) -> Result<GeneratedSection, IOCError> {
        let start_time = Utc::now();

        // Execute data query
        let data = self.execute_data_query(&section_template.data_query).await?;

        // Generate visualizations
        let mut visualizations = Vec::new();
        for viz_template in &section_template.visualizations {
            let visualization = self.generate_visualization(viz_template, &data).await?;
            visualizations.push(visualization);
        }

        // Calculate KPIs
        let mut kpis = Vec::new();
        for kpi_template in &section_template.kpis {
            let kpi = self.calculate_kpi(kpi_template).await?;
            kpis.push(kpi);
        }

        let end_time = Utc::now();

        Ok(GeneratedSection {
            id: section_template.id.clone(),
            title: section_template.title.clone(),
            section_type: section_template.section_type.clone(),
            content: section_template.text_content.clone(),
            data_summary: DataSummary {
                record_count: data.len(),
                columns: if let Some(first_row) = data.first() {
                    first_row.keys().cloned().collect()
                } else {
                    vec![]
                },
                data_range: (start_time, end_time),
            },
            visualizations,
            kpis,
            raw_data: if data.len() < 1000 { Some(data) } else { None }, // Include raw data only for small datasets
        })
    }

    /// Execute a data query against a data source
    async fn execute_data_query(&self, query: &DataQuery) -> Result<Vec<HashMap<String, serde_json::Value>>, IOCError> {
        // Simulate database query execution
        // In real implementation, this would connect to actual data sources
        match query.source_id.as_str() {
            "ioc_database" => {
                // Simulate IOC database results
                Ok(vec![
                    HashMap::from([
                        ("severity".to_string(), serde_json::Value::String("critical".to_string())),
                        ("count".to_string(), serde_json::Value::Number(serde_json::Number::from(15))),
                    ]),
                    HashMap::from([
                        ("severity".to_string(), serde_json::Value::String("high".to_string())),
                        ("count".to_string(), serde_json::Value::Number(serde_json::Number::from(42))),
                    ]),
                    HashMap::from([
                        ("severity".to_string(), serde_json::Value::String("medium".to_string())),
                        ("count".to_string(), serde_json::Value::Number(serde_json::Number::from(128))),
                    ]),
                    HashMap::from([
                        ("severity".to_string(), serde_json::Value::String("low".to_string())),
                        ("count".to_string(), serde_json::Value::Number(serde_json::Number::from(256))),
                    ]),
                ])
            }
            "threat_intelligence" => {
                // Simulate threat intelligence results
                Ok(vec![
                    HashMap::from([
                        ("feed_id".to_string(), serde_json::Value::String("misp_primary".to_string())),
                        ("indicators_count".to_string(), serde_json::Value::Number(serde_json::Number::from(1250))),
                        ("last_sync".to_string(), serde_json::Value::String(Utc::now().to_rfc3339())),
                    ]),
                    HashMap::from([
                        ("feed_id".to_string(), serde_json::Value::String("commercial_feed".to_string())),
                        ("indicators_count".to_string(), serde_json::Value::Number(serde_json::Number::from(850))),
                        ("last_sync".to_string(), serde_json::Value::String((Utc::now() - Duration::minutes(30)).to_rfc3339())),
                    ]),
                ])
            }
            _ => Ok(vec![])
        }
    }

    /// Generate a visualization from template and data
    async fn generate_visualization(&self, template: &Visualization, data: &[HashMap<String, serde_json::Value>]) -> Result<GeneratedVisualization, IOCError> {
        // Generate visualization data structure
        let chart_data = ChartData {
            labels: data.iter()
                .filter_map(|row| row.get(&template.data_mapping.x_axis))
                .filter_map(|v| v.as_str().map(|s| s.to_string()))
                .collect(),
            datasets: vec![
                Dataset {
                    label: template.title.clone(),
                    data: data.iter()
                        .filter_map(|row| row.get(&template.data_mapping.y_axis))
                        .filter_map(|v| v.as_f64())
                        .collect(),
                    background_color: template.formatting.colors.clone(),
                    border_color: template.formatting.colors.clone(),
                },
            ],
        };

        Ok(GeneratedVisualization {
            id: template.id.clone(),
            title: template.title.clone(),
            chart_type: template.chart_type.clone(),
            data: chart_data,
            options: ChartOptions {
                responsive: true,
                show_legend: template.formatting.show_legend,
                show_labels: template.formatting.show_labels,
                animation: true,
            },
        })
    }

    /// Calculate KPI value
    async fn calculate_kpi(&self, template: &KPI) -> Result<CalculatedKPI, IOCError> {
        let data = self.execute_data_query(&template.value_query).await?;
        
        let value = if let Some(row) = data.first() {
            if let Some(first_value) = row.values().next() {
                first_value.as_f64().unwrap_or(0.0)
            } else {
                0.0
            }
        } else {
            0.0
        };

        let trend = if let Some(target) = template.target_value {
            if value > target {
                match template.trend_direction {
                    TrendDirection::Up => KPITrend::Good,
                    TrendDirection::Down => KPITrend::Bad,
                    TrendDirection::Stable => KPITrend::Neutral,
                }
            } else {
                match template.trend_direction {
                    TrendDirection::Up => KPITrend::Bad,
                    TrendDirection::Down => KPITrend::Good,
                    TrendDirection::Stable => KPITrend::Neutral,
                }
            }
        } else {
            KPITrend::Neutral
        };

        Ok(CalculatedKPI {
            id: template.id.clone(),
            name: template.name.clone(),
            description: template.description.clone(),
            value,
            formatted_value: self.format_kpi_value(value, &template.format),
            target_value: template.target_value,
            trend,
            change_percentage: None, // Would calculate from historical data
        })
    }

    /// Format KPI value according to its format type
    fn format_kpi_value(&self, value: f64, format: &KPIFormat) -> String {
        match format {
            KPIFormat::Number => {
                if value >= 1_000_000.0 {
                    format!("{:.1}M", value / 1_000_000.0)
                } else if value >= 1_000.0 {
                    format!("{:.1}K", value / 1_000.0)
                } else {
                    format!("{:.0}", value)
                }
            }
            KPIFormat::Percentage => format!("{:.1}%", value),
            KPIFormat::Currency => format!("${:.2}", value),
            KPIFormat::Duration => {
                if value >= 60.0 {
                    format!("{:.0}h {:.0}m", value / 60.0, value % 60.0)
                } else {
                    format!("{:.0}m", value)
                }
            }
        }
    }

    /// Render report in specified format
    async fn render_report_format(&self, template: &ReportTemplate, sections: &[GeneratedSection], format: &OutputFormat) -> Result<String, IOCError> {
        match format {
            OutputFormat::HTML => self.render_html_report(template, sections).await,
            OutputFormat::PDF => self.render_pdf_report(template, sections).await,
            OutputFormat::JSON => self.render_json_report(template, sections).await,
            OutputFormat::CSV => self.render_csv_report(template, sections).await,
            OutputFormat::Email => self.render_email_report(template, sections).await,
        }
    }

    async fn render_html_report(&self, template: &ReportTemplate, sections: &[GeneratedSection]) -> Result<String, IOCError> {
        let mut html = String::new();
        
        // HTML header
        html.push_str("<!DOCTYPE html>\n<html>\n<head>\n");
        html.push_str(&format!("<title>{}</title>\n", template.name));
        html.push_str("<style>\n");
        html.push_str("body { font-family: Arial, sans-serif; margin: 20px; }\n");
        html.push_str("h1 { color: #333; border-bottom: 2px solid #4CAF50; }\n");
        html.push_str("h2 { color: #666; margin-top: 30px; }\n");
        html.push_str(".kpi { display: inline-block; margin: 10px; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }\n");
        html.push_str(".kpi-value { font-size: 24px; font-weight: bold; color: #4CAF50; }\n");
        html.push_str("</style>\n");
        html.push_str("</head>\n<body>\n");
        
        // Report title
        html.push_str(&format!("<h1>{}</h1>\n", template.name));
        html.push_str(&format!("<p><em>{}</em></p>\n", template.description));
        html.push_str(&format!("<p>Generated: {}</p>\n", Utc::now().format("%Y-%m-%d %H:%M:%S UTC")));
        
        // Report sections
        for section in sections {
            html.push_str(&format!("<h2>{}</h2>\n", section.title));
            html.push_str(&format!("<p>{}</p>\n", section.content));
            
            // KPIs
            if !section.kpis.is_empty() {
                html.push_str("<div class='kpis'>\n");
                for kpi in &section.kpis {
                    html.push_str("<div class='kpi'>\n");
                    html.push_str(&format!("<div class='kpi-name'>{}</div>\n", kpi.name));
                    html.push_str(&format!("<div class='kpi-value'>{}</div>\n", kpi.formatted_value));
                    html.push_str(&format!("<div class='kpi-description'>{}</div>\n", kpi.description));
                    html.push_str("</div>\n");
                }
                html.push_str("</div>\n");
            }
            
            // Data summary
            html.push_str(&format!("<p><strong>Data Summary:</strong> {} records processed</p>\n", section.data_summary.record_count));
        }
        
        html.push_str("</body>\n</html>");
        Ok(html)
    }

    async fn render_pdf_report(&self, template: &ReportTemplate, sections: &[GeneratedSection]) -> Result<String, IOCError> {
        // In real implementation, would generate actual PDF
        // For now, return a placeholder
        Ok(format!("PDF Report: {} - Generated at {}", template.name, Utc::now()))
    }

    async fn render_json_report(&self, template: &ReportTemplate, sections: &[GeneratedSection]) -> Result<String, IOCError> {
        let report_data = serde_json::json!({
            "template_id": template.id,
            "name": template.name,
            "description": template.description,
            "generated_at": Utc::now(),
            "sections": sections
        });
        
        serde_json::to_string_pretty(&report_data)
            .map_err(|e| IOCError::Processing(format!("JSON serialization error: {}", e)))
    }

    async fn render_csv_report(&self, template: &ReportTemplate, sections: &[GeneratedSection]) -> Result<String, IOCError> {
        let mut csv = String::from("Section,KPI,Value,Description\n");
        
        for section in sections {
            for kpi in &section.kpis {
                csv.push_str(&format!("{},{},{},{}\n", 
                    section.title, kpi.name, kpi.formatted_value, kpi.description));
            }
        }
        
        Ok(csv)
    }

    async fn render_email_report(&self, template: &ReportTemplate, sections: &[GeneratedSection]) -> Result<String, IOCError> {
        let mut email = String::new();
        
        email.push_str(&format!("Subject: {}\n\n", template.name));
        email.push_str(&format!("{}\n\n", template.description));
        email.push_str(&format!("Generated: {}\n\n", Utc::now().format("%Y-%m-%d %H:%M:%S UTC")));
        
        for section in sections {
            email.push_str(&format!("## {}\n", section.title));
            email.push_str(&format!("{}\n\n", section.content));
            
            for kpi in &section.kpis {
                email.push_str(&format!("• {}: {}\n", kpi.name, kpi.formatted_value));
            }
            email.push_str("\n");
        }
        
        Ok(email)
    }

    /// Calculate data freshness for data sources
    async fn calculate_data_freshness(&self, source_ids: &[String]) -> Duration {
        let data_sources = self.data_sources.read().await;
        let mut oldest_refresh = Utc::now();
        
        for source_id in source_ids {
            if let Some(source) = data_sources.get(source_id) {
                if source.last_refresh < oldest_refresh {
                    oldest_refresh = source.last_refresh;
                }
            }
        }
        
        Utc::now() - oldest_refresh
    }

    /// Calculate total records across data sources
    async fn calculate_total_records(&self, source_ids: &[String]) -> u64 {
        // Simplified calculation - would query actual data sources
        source_ids.len() as u64 * 1000 // Placeholder
    }

    /// Get dashboard data
    pub async fn get_dashboard_data(&self, dashboard_id: &str) -> Result<DashboardData, IOCError> {
        let dashboard = {
            let dashboards = self.dashboards.read().await;
            dashboards.get(dashboard_id)
                .ok_or_else(|| IOCError::Configuration(format!("Dashboard not found: {}", dashboard_id)))?
                .clone()
        };

        let mut widget_data = HashMap::new();
        
        for widget in &dashboard.widgets {
            let data = self.execute_data_query(&DataQuery {
                source_id: widget.data_source.clone(),
                query: widget.configuration.query.clone(),
                parameters: widget.configuration.parameters.clone(),
            }).await?;
            
            widget_data.insert(widget.id.clone(), WidgetData {
                data,
                last_updated: Utc::now(),
                status: WidgetStatus::Ready,
            });
        }

        Ok(DashboardData {
            dashboard_id: dashboard.id,
            name: dashboard.name,
            layout: dashboard.layout,
            widget_data,
            last_updated: Utc::now(),
            auto_refresh: dashboard.auto_refresh,
            refresh_interval: dashboard.refresh_interval,
        })
    }

    /// Get reporting statistics
    pub async fn get_statistics(&self) -> ReportingStats {
        self.statistics.read().await.clone()
    }

    /// Get health status
    pub async fn get_health(&self) -> ComponentHealth {
        let stats = self.statistics.read().await;
        let templates = self.report_templates.read().await;
        let dashboards = self.dashboards.read().await;

        ComponentHealth {
            status: HealthStatus::Healthy,
            message: format!("Reporting engine operational with {} templates and {} dashboards", templates.len(), dashboards.len()),
            last_check: Utc::now(),
            metrics: HashMap::from([
                ("report_templates".to_string(), templates.len() as f64),
                ("dashboards".to_string(), dashboards.len() as f64),
                ("total_reports_generated".to_string(), stats.total_reports_generated as f64),
                ("average_generation_time_ms".to_string(), if stats.total_reports_generated > 0 {
                    stats.total_generation_time_ms as f64 / stats.total_reports_generated as f64
                } else { 0.0 }),
            ]),
        }
    }
}

// Reporting data structures

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReportTemplate {
    pub id: String,
    pub name: String,
    pub description: String,
    pub category: ReportCategory,
    pub template_type: ReportType,
    pub data_sources: Vec<String>,
    pub sections: Vec<ReportSection>,
    pub parameters: Vec<ReportParameter>,
    pub schedule: Option<ReportSchedule>,
    pub output_formats: Vec<OutputFormat>,
    pub recipients: Vec<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ReportCategory {
    Executive,
    Technical,
    Compliance,
    Operations,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ReportType {
    Summary,
    Detailed,
    Analytical,
    Dashboard,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReportSection {
    pub id: String,
    pub title: String,
    pub section_type: SectionType,
    pub data_query: DataQuery,
    pub visualizations: Vec<Visualization>,
    pub kpis: Vec<KPI>,
    pub text_content: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SectionType {
    Summary,
    Analysis,
    Visualization,
    Table,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataQuery {
    pub source_id: String,
    pub query: String,
    pub parameters: HashMap<String, serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Visualization {
    pub id: String,
    pub chart_type: ChartType,
    pub title: String,
    pub data_mapping: DataMapping,
    pub formatting: ChartFormatting,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ChartType {
    LineChart,
    BarChart,
    PieChart,
    DonutChart,
    AreaChart,
    ScatterPlot,
    Heatmap,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataMapping {
    pub x_axis: String,
    pub y_axis: String,
    pub series: Option<String>,
    pub filters: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChartFormatting {
    pub colors: Vec<String>,
    pub show_legend: bool,
    pub show_labels: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KPI {
    pub id: String,
    pub name: String,
    pub description: String,
    pub value_query: DataQuery,
    pub target_value: Option<f64>,
    pub trend_direction: TrendDirection,
    pub format: KPIFormat,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TrendDirection {
    Up,
    Down,
    Stable,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum KPIFormat {
    Number,
    Percentage,
    Currency,
    Duration,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReportParameter {
    pub name: String,
    pub parameter_type: String,
    pub default_value: String,
    pub options: Vec<String>,
    pub required: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReportSchedule {
    pub frequency: ScheduleFrequency,
    pub day_of_week: Option<u8>,
    pub time_of_day: String,
    pub timezone: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ScheduleFrequency {
    Daily,
    Weekly,
    Monthly,
    Quarterly,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum OutputFormat {
    PDF,
    HTML,
    JSON,
    CSV,
    Email,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataSource {
    pub id: String,
    pub name: String,
    pub source_type: DataSourceType,
    pub connection_string: String,
    pub refresh_interval: Duration,
    pub enabled: bool,
    pub last_refresh: DateTime<Utc>,
    pub schema: DataSchema,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DataSourceType {
    Database,
    API,
    File,
    Stream,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataSchema {
    pub tables: Vec<DataTable>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataTable {
    pub name: String,
    pub fields: Vec<DataField>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataField {
    pub name: String,
    pub field_type: String,
    pub nullable: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GeneratedReport {
    pub id: String,
    pub template_id: String,
    pub title: String,
    pub generated_at: DateTime<Utc>,
    pub generation_duration_ms: i64,
    pub parameters: HashMap<String, String>,
    pub sections: Vec<GeneratedSection>,
    pub output_files: HashMap<OutputFormat, String>,
    pub metadata: ReportMetadata,
    pub status: ReportStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GeneratedSection {
    pub id: String,
    pub title: String,
    pub section_type: SectionType,
    pub content: String,
    pub data_summary: DataSummary,
    pub visualizations: Vec<GeneratedVisualization>,
    pub kpis: Vec<CalculatedKPI>,
    pub raw_data: Option<Vec<HashMap<String, serde_json::Value>>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataSummary {
    pub record_count: usize,
    pub columns: Vec<String>,
    pub data_range: (DateTime<Utc>, DateTime<Utc>),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GeneratedVisualization {
    pub id: String,
    pub title: String,
    pub chart_type: ChartType,
    pub data: ChartData,
    pub options: ChartOptions,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChartData {
    pub labels: Vec<String>,
    pub datasets: Vec<Dataset>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Dataset {
    pub label: String,
    pub data: Vec<f64>,
    pub background_color: Vec<String>,
    pub border_color: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChartOptions {
    pub responsive: bool,
    pub show_legend: bool,
    pub show_labels: bool,
    pub animation: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CalculatedKPI {
    pub id: String,
    pub name: String,
    pub description: String,
    pub value: f64,
    pub formatted_value: String,
    pub target_value: Option<f64>,
    pub trend: KPITrend,
    pub change_percentage: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum KPITrend {
    Good,
    Bad,
    Neutral,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReportMetadata {
    pub data_freshness: Duration,
    pub record_count: u64,
    pub quality_score: f64,
    pub generation_method: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ReportStatus {
    Generated,
    Failed,
    Pending,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Dashboard {
    pub id: String,
    pub name: String,
    pub description: String,
    pub layout: DashboardLayout,
    pub widgets: Vec<DashboardWidget>,
    pub filters: Vec<DashboardFilter>,
    pub refresh_interval: Duration,
    pub auto_refresh: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DashboardLayout {
    pub columns: u32,
    pub rows: u32,
    pub responsive: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DashboardWidget {
    pub id: String,
    pub title: String,
    pub widget_type: WidgetType,
    pub position: WidgetPosition,
    pub data_source: String,
    pub configuration: WidgetConfiguration,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum WidgetType {
    KPI,
    Chart,
    Table,
    Text,
    Gauge,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WidgetPosition {
    pub x: u32,
    pub y: u32,
    pub width: u32,
    pub height: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WidgetConfiguration {
    pub query: String,
    pub refresh_interval: Duration,
    pub parameters: HashMap<String, serde_json::Value>,
    pub formatting: serde_json::Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DashboardFilter {
    pub id: String,
    pub name: String,
    pub filter_type: FilterType,
    pub default_value: String,
    pub options: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FilterType {
    Select,
    DateRange,
    MultiSelect,
    Text,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DashboardData {
    pub dashboard_id: String,
    pub name: String,
    pub layout: DashboardLayout,
    pub widget_data: HashMap<String, WidgetData>,
    pub last_updated: DateTime<Utc>,
    pub auto_refresh: bool,
    pub refresh_interval: Duration,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WidgetData {
    pub data: Vec<HashMap<String, serde_json::Value>>,
    pub last_updated: DateTime<Utc>,
    pub status: WidgetStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum WidgetStatus {
    Ready,
    Loading,
    Error,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct ReportingStats {
    pub total_reports_generated: u64,
    pub total_generation_time_ms: i64,
    pub active_dashboards: u64,
    pub scheduled_reports: u64,
    pub data_sources_connected: u64,
    pub last_report_generated: Option<DateTime<Utc>>,
}