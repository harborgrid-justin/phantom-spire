// Dashboard Analytics Module
// Provides business intelligence, metrics, and analytics for security operations

use napi::bindgen_prelude::*;
use napi_derive::napi;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc, Duration};
use uuid::Uuid;
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityMetrics {
    pub threats_detected: u32,
    pub threats_blocked: u32,
    pub incidents_resolved: u32,
    pub vulnerabilities_found: u32,
    pub compliance_score: f64,
    pub risk_score: f64,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceMetrics {
    pub avg_response_time_ms: f64,
    pub system_uptime_percentage: f64,
    pub alert_processing_rate: f64,
    pub data_ingestion_rate_mb_per_second: f64,
    pub error_rate_percentage: f64,
    pub cpu_utilization_percentage: f64,
    pub memory_utilization_percentage: f64,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThreatTrend {
    pub date: DateTime<Utc>,
    pub threat_count: u32,
    pub threat_types: HashMap<String, u32>,
    pub severity_distribution: HashMap<String, u32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserActivityMetrics {
    pub total_users: u32,
    pub active_users_last_24h: u32,
    pub failed_login_attempts: u32,
    pub successful_logins: u32,
    pub privilege_escalations: u32,
    pub suspicious_activities: u32,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AssetMetrics {
    pub total_assets: u32,
    pub monitored_assets: u32,
    pub vulnerable_assets: u32,
    pub critical_assets: u32,
    pub asset_coverage_percentage: f64,
    pub new_assets_discovered: u32,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DashboardWidget {
    pub id: Uuid,
    pub name: String,
    pub widget_type: String,
    pub data_source: String,
    pub refresh_interval_seconds: u32,
    pub position_x: u32,
    pub position_y: u32,
    pub width: u32,
    pub height: u32,
    pub configuration: HashMap<String, String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Dashboard {
    pub id: Uuid,
    pub name: String,
    pub description: String,
    pub owner: String,
    pub is_public: bool,
    pub widgets: Vec<Uuid>,
    pub layout: String,
    pub theme: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnalyticsReport {
    pub id: Uuid,
    pub name: String,
    pub report_type: String,
    pub period_start: DateTime<Utc>,
    pub period_end: DateTime<Utc>,
    pub security_metrics: SecurityMetrics,
    pub performance_metrics: PerformanceMetrics,
    pub user_metrics: UserActivityMetrics,
    pub asset_metrics: AssetMetrics,
    pub trends: Vec<ThreatTrend>,
    pub insights: Vec<String>,
    pub recommendations: Vec<String>,
    pub generated_at: DateTime<Utc>,
}

#[napi]
pub struct DashboardAnalytics {
    security_metrics_history: Vec<SecurityMetrics>,
    performance_metrics_history: Vec<PerformanceMetrics>,
    user_metrics_history: Vec<UserActivityMetrics>,
    asset_metrics_history: Vec<AssetMetrics>,
    widgets: Vec<DashboardWidget>,
    dashboards: Vec<Dashboard>,
    reports: Vec<AnalyticsReport>,
}

#[napi]
impl DashboardAnalytics {
    #[napi(constructor)]
    pub fn new() -> Result<Self> {
        Ok(Self {
            security_metrics_history: Vec::new(),
            performance_metrics_history: Vec::new(),
            user_metrics_history: Vec::new(),
            asset_metrics_history: Vec::new(),
            widgets: Vec::new(),
            dashboards: Vec::new(),
            reports: Vec::new(),
        })
    }

    #[napi]
    pub fn record_security_metrics(&mut self, metrics_json: String) -> Result<()> {
        let mut metrics: SecurityMetrics = serde_json::from_str(&metrics_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to parse security metrics: {}", e)))?;
        
        metrics.timestamp = Utc::now();
        self.security_metrics_history.push(metrics);
        
        // Keep only last 1000 entries to prevent memory issues
        if self.security_metrics_history.len() > 1000 {
            self.security_metrics_history.remove(0);
        }
        
        Ok(())
    }

    #[napi]
    pub fn record_performance_metrics(&mut self, metrics_json: String) -> Result<()> {
        let mut metrics: PerformanceMetrics = serde_json::from_str(&metrics_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to parse performance metrics: {}", e)))?;
        
        metrics.timestamp = Utc::now();
        self.performance_metrics_history.push(metrics);
        
        if self.performance_metrics_history.len() > 1000 {
            self.performance_metrics_history.remove(0);
        }
        
        Ok(())
    }

    #[napi]
    pub fn get_current_security_summary(&self) -> Result<String> {
        if let Some(latest_metrics) = self.security_metrics_history.last() {
            let summary = serde_json::json!({
                "threats_detected": latest_metrics.threats_detected,
                "threats_blocked": latest_metrics.threats_blocked,
                "block_rate_percentage": if latest_metrics.threats_detected > 0 {
                    (latest_metrics.threats_blocked as f64 / latest_metrics.threats_detected as f64) * 100.0
                } else {
                    0.0
                },
                "incidents_resolved": latest_metrics.incidents_resolved,
                "compliance_score": latest_metrics.compliance_score,
                "risk_score": latest_metrics.risk_score,
                "status": if latest_metrics.risk_score < 0.3 { "Low Risk" } 
                         else if latest_metrics.risk_score < 0.7 { "Medium Risk" } 
                         else { "High Risk" },
                "last_updated": latest_metrics.timestamp.to_rfc3339()
            });
            
            Ok(summary.to_string())
        } else {
            Ok(serde_json::json!({
                "status": "No data available",
                "message": "No security metrics recorded yet"
            }).to_string())
        }
    }

    #[napi]
    pub fn get_threat_trends(&self, days: u32) -> Result<String> {
        let cutoff_date = Utc::now() - Duration::days(days as i64);
        
        let recent_metrics: Vec<&SecurityMetrics> = self.security_metrics_history.iter()
            .filter(|m| m.timestamp >= cutoff_date)
            .collect();
        
        if recent_metrics.is_empty() {
            return Ok(serde_json::json!({
                "trends": [],
                "message": "No threat data available for the specified period"
            }).to_string());
        }
        
        // Group metrics by day
        let mut daily_threats: HashMap<String, u32> = HashMap::new();
        
        for metrics in recent_metrics {
            let date_key = metrics.timestamp.format("%Y-%m-%d").to_string();
            *daily_threats.entry(date_key).or_insert(0) += metrics.threats_detected;
        }
        
        let mut trends: Vec<_> = daily_threats.into_iter()
            .map(|(date, count)| {
                serde_json::json!({
                    "date": date,
                    "threat_count": count
                })
            })
            .collect();
        
        trends.sort_by(|a, b| a["date"].as_str().cmp(&b["date"].as_str()));
        
        Ok(serde_json::json!({
            "trends": trends,
            "period_days": days,
            "total_threats": trends.iter().map(|t| t["threat_count"].as_u64().unwrap_or(0)).sum::<u64>()
        }).to_string())
    }

    #[napi]
    pub fn create_dashboard(&mut self, dashboard_json: String) -> Result<String> {
        let mut dashboard: Dashboard = serde_json::from_str(&dashboard_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to parse dashboard: {}", e)))?;
        
        dashboard.id = Uuid::new_v4();
        dashboard.created_at = Utc::now();
        dashboard.updated_at = Utc::now();
        
        let dashboard_id = dashboard.id.to_string();
        self.dashboards.push(dashboard);
        
        Ok(dashboard_id)
    }

    #[napi]
    pub fn create_widget(&mut self, widget_json: String) -> Result<String> {
        let mut widget: DashboardWidget = serde_json::from_str(&widget_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to parse widget: {}", e)))?;
        
        widget.id = Uuid::new_v4();
        widget.created_at = Utc::now();
        widget.updated_at = Utc::now();
        
        let widget_id = widget.id.to_string();
        self.widgets.push(widget);
        
        Ok(widget_id)
    }

    #[napi]
    pub fn get_dashboard(&self, dashboard_id: String) -> Result<String> {
        let id = Uuid::parse_str(&dashboard_id)
            .map_err(|e| napi::Error::from_reason(format!("Invalid dashboard ID: {}", e)))?;
        
        let dashboard = self.dashboards.iter()
            .find(|d| d.id == id)
            .ok_or_else(|| napi::Error::from_reason("Dashboard not found"))?;
        
        // Include widgets data
        let dashboard_widgets: Vec<&DashboardWidget> = dashboard.widgets.iter()
            .filter_map(|widget_id| self.widgets.iter().find(|w| &w.id == widget_id))
            .collect();
        
        let response = serde_json::json!({
            "dashboard": dashboard,
            "widgets": dashboard_widgets
        });
        
        Ok(response.to_string())
    }

    #[napi]
    pub fn generate_analytics_report(&mut self, start_date: String, end_date: String) -> Result<String> {
        let start_date = DateTime::parse_from_rfc3339(&start_date)
            .map_err(|e| napi::Error::from_reason(format!("Invalid start date: {}", e)))?
            .with_timezone(&Utc);
        
        let end_date = DateTime::parse_from_rfc3339(&end_date)
            .map_err(|e| napi::Error::from_reason(format!("Invalid end date: {}", e)))?
            .with_timezone(&Utc);
        
        // Get metrics for the specified period
        let security_metrics = self.security_metrics_history.iter()
            .filter(|m| m.timestamp >= start_date && m.timestamp <= end_date)
            .last()
            .cloned()
            .unwrap_or_else(|| SecurityMetrics {
                threats_detected: 0,
                threats_blocked: 0,
                incidents_resolved: 0,
                vulnerabilities_found: 0,
                compliance_score: 0.0,
                risk_score: 0.0,
                timestamp: Utc::now(),
            });
        
        let performance_metrics = self.performance_metrics_history.iter()
            .filter(|m| m.timestamp >= start_date && m.timestamp <= end_date)
            .last()
            .cloned()
            .unwrap_or_else(|| PerformanceMetrics {
                avg_response_time_ms: 0.0,
                system_uptime_percentage: 0.0,
                alert_processing_rate: 0.0,
                data_ingestion_rate_mb_per_second: 0.0,
                error_rate_percentage: 0.0,
                cpu_utilization_percentage: 0.0,
                memory_utilization_percentage: 0.0,
                timestamp: Utc::now(),
            });
        
        // Generate insights and recommendations
        let mut insights = Vec::new();
        let mut recommendations = Vec::new();
        
        if security_metrics.threats_detected > 0 {
            let block_rate = (security_metrics.threats_blocked as f64 / security_metrics.threats_detected as f64) * 100.0;
            insights.push(format!("Threat detection effectiveness: {:.1}%", block_rate));
            
            if block_rate < 90.0 {
                recommendations.push("Consider improving threat blocking mechanisms".to_string());
            }
        }
        
        if performance_metrics.system_uptime_percentage < 99.5 {
            insights.push("System uptime below target threshold".to_string());
            recommendations.push("Investigate system reliability issues".to_string());
        }
        
        if security_metrics.risk_score > 0.7 {
            insights.push("High risk score detected".to_string());
            recommendations.push("Prioritize risk mitigation activities".to_string());
        }
        
        let report = AnalyticsReport {
            id: Uuid::new_v4(),
            name: format!("Analytics Report {}", Utc::now().format("%Y-%m-%d")),
            report_type: "Comprehensive".to_string(),
            period_start: start_date,
            period_end: end_date,
            security_metrics,
            performance_metrics,
            user_metrics: UserActivityMetrics {
                total_users: 0,
                active_users_last_24h: 0,
                failed_login_attempts: 0,
                successful_logins: 0,
                privilege_escalations: 0,
                suspicious_activities: 0,
                timestamp: Utc::now(),
            },
            asset_metrics: AssetMetrics {
                total_assets: 0,
                monitored_assets: 0,
                vulnerable_assets: 0,
                critical_assets: 0,
                asset_coverage_percentage: 0.0,
                new_assets_discovered: 0,
                timestamp: Utc::now(),
            },
            trends: Vec::new(),
            insights,
            recommendations,
            generated_at: Utc::now(),
        };
        
        self.reports.push(report.clone());
        
        serde_json::to_string(&report)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize report: {}", e)))
    }

    #[napi]
    pub fn health_check(&self) -> Result<String> {
        let health_info = serde_json::json!({
            "status": "healthy",
            "security_metrics_count": self.security_metrics_history.len(),
            "performance_metrics_count": self.performance_metrics_history.len(),
            "dashboards_count": self.dashboards.len(),
            "widgets_count": self.widgets.len(),
            "reports_count": self.reports.len(),
            "timestamp": Utc::now().to_rfc3339()
        });
        
        Ok(health_info.to_string())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_dashboard_analytics_creation() {
        let analytics = DashboardAnalytics::new();
        assert!(analytics.is_ok());
    }

    #[test]
    fn test_record_and_get_security_metrics() {
        let mut analytics = DashboardAnalytics::new().unwrap();
        
        let metrics = SecurityMetrics {
            threats_detected: 100,
            threats_blocked: 95,
            incidents_resolved: 10,
            vulnerabilities_found: 5,
            compliance_score: 0.85,
            risk_score: 0.25,
            timestamp: Utc::now(),
        };
        
        let metrics_json = serde_json::to_string(&metrics).unwrap();
        let result = analytics.record_security_metrics(metrics_json);
        
        assert!(result.is_ok());
        
        let summary = analytics.get_current_security_summary().unwrap();
        let summary_data: serde_json::Value = serde_json::from_str(&summary).unwrap();
        
        assert_eq!(summary_data["threats_detected"], 100);
        assert_eq!(summary_data["threats_blocked"], 95);
    }
}