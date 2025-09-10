// phantom-risk-core/src/lib.rs
// Enterprise-grade risk assessment and management engine

use napi::bindgen_prelude::*;
use napi_derive::napi;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use chrono::{DateTime, Utc};

// --- Existing Data Models ---

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RiskAssessment {
    pub asset_id: String,
    pub threat_score: f64,
    pub vulnerability_score: f64,
    pub impact_score: f64,
    pub overall_risk_score: f64,
    pub risk_level: RiskLevel,
    pub assessment_date: DateTime<Utc>,
    pub factors: Vec<RiskFactor>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum RiskLevel {
    Low,
    Medium,
    High,
    Critical,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RiskFactor {
    pub factor_type: String,
    pub value: f64,
    pub weight: f64,
    pub description: String,
}

// --- New Competitive Feature Data Models ---

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RiskForecast {
    pub forecast_id: String,
    pub time_horizon_months: u32,
    pub predicted_risk_score: f64,
    pub confidence: f64,
    pub trend: String, // "increasing", "decreasing", "stable"
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ControlStatus {
    pub control_id: String,
    pub is_effective: bool,
    pub last_checked: DateTime<Utc>,
    pub details: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VendorRisk {
    pub vendor_id: String,
    pub vendor_name: String,
    pub risk_score: f64,
    pub risk_level: RiskLevel,
    pub summary: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KRIStatus {
    pub kri_id: String,
    pub name: String,
    pub current_value: f64,
    pub status: String, // "green", "amber", "red"
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BowtieModel {
    pub bowtie_id: String,
    pub risk_event: String,
    pub threats_causes: Vec<String>,
    pub preventive_controls: Vec<String>,
    pub consequences: Vec<String>,
    pub recovery_controls: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PredictiveAnalysisResult {
    pub analysis_id: String,
    pub risk_category: String,
    pub predicted_impact: f64,
    pub prediction_probability: f64,
    pub recommended_actions: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RiskCorrelation {
    pub correlation_id: String,
    pub risk_a_id: String,
    pub risk_b_id: String,
    pub correlation_coefficient: f64,
    pub description: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GeopoliticalRisk {
    pub country_code: String,
    pub risk_index: f64,
    pub factors: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RiskTreatmentWorkflow {
    pub workflow_id: String,
    pub risk_id: String,
    pub status: String, // "pending", "in_progress", "completed"
    pub assigned_to: String,
    pub due_date: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ControlGap {
    pub gap_id: String,
    pub control_framework: String,
    pub missing_control: String,
    pub recommended_control: String,
    pub risk_rating: RiskLevel,
}

// --- Core Logic ---

pub struct RiskCore {
    risk_models: HashMap<String, RiskModel>,
    geo_risk_data: HashMap<String, GeopoliticalRisk>,
}

#[derive(Debug, Clone)]
pub struct RiskModel {
    pub name: String,
    pub factors: Vec<String>,
    pub weights: HashMap<String, f64>,
}

impl RiskCore {
    pub fn new() -> Result<Self, String> {
        let mut risk_models = HashMap::new();
        let mut weights = HashMap::new();
        weights.insert("threat_probability".to_string(), 0.3);
        weights.insert("vulnerability_severity".to_string(), 0.4);
        weights.insert("asset_value".to_string(), 0.3);
        risk_models.insert("standard".to_string(), RiskModel {
            name: "Standard Risk Model".to_string(),
            factors: vec!["threat_probability".to_string(), "vulnerability_severity".to_string(), "asset_value".to_string()],
            weights,
        });

        let mut geo_risk_data = HashMap::new();
        geo_risk_data.insert("US".to_string(), GeopoliticalRisk {
            country_code: "US".to_string(),
            risk_index: 3.5,
            factors: vec!["Stable political climate".to_string(), "Strong regulatory environment".to_string()],
        });
        geo_risk_data.insert("CN".to_string(), GeopoliticalRisk {
            country_code: "CN".to_string(),
            risk_index: 6.8,
            factors: vec!["Trade tensions".to_string(), "Regulatory uncertainty".to_string()],
        });

        Ok(Self { risk_models, geo_risk_data })
    }

    // phantom-risk-core/src/lib.rs
// Enterprise-grade risk assessment and management engine

use napi::bindgen_prelude::*;
use napi_derive::napi;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use chrono::{DateTime, Utc};

// --- Existing Data Models ---

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RiskAssessment {
    pub asset_id: String,
    pub threat_score: f64,
    pub vulnerability_score: f64,
    pub impact_score: f64,
    pub overall_risk_score: f64,
    pub risk_level: RiskLevel,
    pub assessment_date: DateTime<Utc>,
    pub factors: Vec<RiskFactor>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum RiskLevel {
    Low,
    Medium,
    High,
    Critical,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RiskFactor {
    pub factor_type: String,
    pub value: f64,
    pub weight: f64,
    pub description: String,
}

// --- New Competitive Feature Data Models ---

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RiskForecast {
    pub forecast_id: String,
    pub time_horizon_months: u32,
    pub predicted_risk_score: f64,
    pub confidence: f64,
    pub trend: String, // "increasing", "decreasing", "stable"
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ControlStatus {
    pub control_id: String,
    pub is_effective: bool,
    pub last_checked: DateTime<Utc>,
    pub details: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VendorRisk {
    pub vendor_id: String,
    pub vendor_name: String,
    pub risk_score: f64,
    pub risk_level: RiskLevel,
    pub summary: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KRIStatus {
    pub kri_id: String,
    pub name: String,
    pub current_value: f64,
    pub status: String, // "green", "amber", "red"
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BowtieModel {
    pub bowtie_id: String,
    pub risk_event: String,
    pub threats_causes: Vec<String>,
    pub preventive_controls: Vec<String>,
    pub consequences: Vec<String>,
    pub recovery_controls: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PredictiveAnalysisResult {
    pub analysis_id: String,
    pub risk_category: String,
    pub predicted_impact: f64,
    pub prediction_probability: f64,
    pub recommended_actions: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RiskCorrelation {
    pub correlation_id: String,
    pub risk_a_id: String,
    pub risk_b_id: String,
    pub correlation_coefficient: f64,
    pub description: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GeopoliticalRisk {
    pub country_code: String,
    pub risk_index: f64,
    pub factors: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RiskTreatmentWorkflow {
    pub workflow_id: String,
    pub risk_id: String,
    pub status: String, // "pending", "in_progress", "completed"
    pub assigned_to: String,
    pub due_date: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ControlGap {
    pub gap_id: String,
    pub control_framework: String,
    pub missing_control: String,
    pub recommended_control: String,
    pub risk_rating: RiskLevel,
}

// --- Core Logic ---

pub struct RiskCore {
    risk_models: HashMap<String, RiskModel>,
    geo_risk_data: HashMap<String, GeopoliticalRisk>,
}

#[derive(Debug, Clone)]
pub struct RiskModel {
    pub name: String,
    pub factors: Vec<String>,
    pub weights: HashMap<String, f64>,
}

impl RiskCore {
    pub fn new() -> Result<Self, String> {
        let mut risk_models = HashMap::new();
        let mut weights = HashMap::new();
        weights.insert("threat_probability".to_string(), 0.3);
        weights.insert("vulnerability_severity".to_string(), 0.4);
        weights.insert("asset_value".to_string(), 0.3);
        risk_models.insert("standard".to_string(), RiskModel {
            name: "Standard Risk Model".to_string(),
            factors: vec!["threat_probability".to_string(), "vulnerability_severity".to_string(), "asset_value".to_string()],
            weights,
        });

        let mut geo_risk_data = HashMap::new();
        geo_risk_data.insert("US".to_string(), GeopoliticalRisk {
            country_code: "US".to_string(),
            risk_index: 3.5,
            factors: vec!["Stable political climate".to_string(), "Strong regulatory environment".to_string()],
        });
        geo_risk_data.insert("CN".to_string(), GeopoliticalRisk {
            country_code: "CN".to_string(),
            risk_index: 6.8,
            factors: vec!["Trade tensions".to_string(), "Regulatory uncertainty".to_string()],
        });

        Ok(Self { risk_models, geo_risk_data })
    }

    pub fn assess_risk(&self, asset_id: &str, factors: HashMap<String, f64>) -> Result<RiskAssessment, String> {
        let threat_score = factors.get("threat_probability").unwrap_or(&0.5) * 10.0;
        let vulnerability_score = factors.get("vulnerability_severity").unwrap_or(&0.5) * 10.0;
        let impact_score = factors.get("asset_value".unwrap_or(&0.5) * 10.0;
        
        let overall_risk_score = (threat_score + vulnerability_score + impact_score) / 3.0;
        
        let risk_level = self.calculate_risk_level(overall_risk_score);

        let risk_factors = factors.into_iter().map(|(key, value)| {
            RiskFactor {
                factor_type: key.clone(),
                value,
                weight: 1.0,
                description: format!("Risk factor: {}", key),
            }
        }).collect();

        Ok(RiskAssessment {
            asset_id: asset_id.to_string(),
            threat_score,
            vulnerability_score,
            impact_score,
            overall_risk_score,
            risk_level,
            assessment_date: Utc::now(),
            factors: risk_factors,
        })
    }

    // --- New Competitive Feature Implementations ---

    pub fn forecast_risk(&self, request_json: &str) -> Result<RiskForecast, String> {
        let request: HashMap<String, serde_json::Value> = serde_json::from_str(request_json).map_err(|e| e.to_string())?;
        let forecast_id = request.get("forecast_id").and_then(|v| v.as_str()).unwrap_or("").to_string();
        let historical_data = request.get("historical_data").and_then(|v| v.as_array()).ok_or("Missing historical_data".to_string())?;
        
        let scores: Vec<f64> = historical_data.iter().map(|v| v.as_f64().unwrap_or(0.0)).collect();
        let (slope, intercept) = self.linear_regression(&scores);
        
        let next_score = slope * (scores.len() as f64 + 1.0) + intercept;
        let trend = if slope > 0.1 { "increasing" } else if slope < -0.1 { "decreasing" } else { "stable" };

        Ok(RiskForecast {
            forecast_id,
            time_horizon_months: 6,
            predicted_risk_score: next_score.max(0.0).min(10.0),
            confidence: 0.85, // Simplified confidence
            trend: trend.to_string(),
        })
    }

    pub fn monitor_control(&self, request_json: &str) -> Result<ControlStatus, String> {
        let request: HashMap<String, serde_json::Value> = serde_json::from_str(request_json).map_err(|e| e.to_string())?;
        let control_id = request.get("control_id").and_then(|v| v.as_str()).unwrap_or("").to_string();
        let metric = request.get("metric").and_then(|v| v.as_f64()).ok_or("Missing metric".to_string())?;
        let threshold = request.get("threshold").and_then(|v| v.as_f64()).ok_or("Missing threshold".to_string())?;
        
        let is_effective = metric < threshold;
        let details = if is_effective { "Control is operating within defined parameters." } else { "Control has exceeded its operational threshold." };

        Ok(ControlStatus {
            control_id,
            is_effective,
            last_checked: Utc::now(),
            details: details.to_string(),
        })
    }

    pub fn assess_vendor_risk(&self, request_json: &str) -> Result<VendorRisk, String> {
        let request: HashMap<String, serde_json::Value> = serde_json::from_str(request_json).map_err(|e| e.to_string())?;
        let vendor_id = request.get("vendor_id").and_then(|v| v.as_str()).unwrap_or("").to_string();
        let vendor_name = request.get("vendor_name").and_then(|v| v.as_str()).unwrap_or("").to_string();
        let score = request.get("score").and_then(|v| v.as_f64()).ok_or("Missing score".to_string())?;

        let risk_level = self.calculate_risk_level(score);
        let summary = format!("Vendor risk assessed at a {} level.", serde_json::to_string(&risk_level).unwrap());

        Ok(VendorRisk {
            vendor_id,
            vendor_name,
            risk_score: score,
            risk_level,
            summary,
        })
    }

    pub fn monitor_kri(&self, request_json: &str) -> Result<KRIStatus, String> {
        let request: HashMap<String, serde_json::Value> = serde_json::from_str(request_json).map_err(|e| e.to_string())?;
        let kri_id = request.get("kri_id").and_then(|v| v.as_str()).unwrap_or("").to_string();
        let name = request.get("name").and_then(|v| v.as_str()).unwrap_or("").to_string();
        let current_value = request.get("current_value").and_then(|v| v.as_f64()).ok_or("Missing current_value".to_string())?;
        let thresholds = request.get("thresholds").and_then(|v| v.as_object()).ok_or("Missing thresholds".to_string())?;
        
        let green = thresholds.get("green").and_then(|v| v.as_f64()).ok_or("Missing green threshold".to_string())?;
        let amber = thresholds.get("amber").and_then(|v| v.as_f64()).ok_or("Missing amber threshold".to_string())?;

        let status = if current_value <= green { "green" } else if current_value <= amber { "amber" } else { "red" };

        Ok(KRIStatus {
            kri_id,
            name,
            current_value,
            status: status.to_string(),
        })
    }

    pub fn create_bowtie_model(&self, request_json: &str) -> Result<BowtieModel, String> {
        serde_json::from_str(request_json).map_err(|e| e.to_string())
    }

    pub fn predictive_risk_analytics(&self, request_json: &str) -> Result<PredictiveAnalysisResult, String> {
        let request: HashMap<String, serde_json::Value> = serde_json::from_str(request_json).map_err(|e| e.to_string())?;
        let analysis_id = request.get("analysis_id").and_then(|v| v.as_str()).unwrap_or("").to_string();
        let risk_category = request.get("risk_category").and_then(|v| v.as_str()).unwrap_or("").to_string();
        let factors = request.get("factors").and_then(|v| v.as_object()).ok_or("Missing factors".to_string())?;

        let mut score = 0.0;
        for (_, value) in factors.iter() {
            score += value.as_f64().unwrap_or(0.0);
        }
        
        let predicted_impact = score * 10000.0;
        let prediction_probability = (score / (factors.len() as f64 * 10.0)).min(1.0);

        Ok(PredictiveAnalysisResult {
            analysis_id,
            risk_category,
            predicted_impact,
            prediction_probability,
            recommended_actions: vec!["Review security controls".to_string(), "Increase monitoring".to_string()],
        })
    }

    pub fn analyze_risk_correlation(&self, request_json: &str) -> Result<RiskCorrelation, String> {
        let request: HashMap<String, serde_json::Value> = serde_json::from_str(request_json).map_err(|e| e.to_string())?;
        let correlation_id = request.get("correlation_id").and_then(|v| v.as_str()).unwrap_or("").to_string();
        let risk_a_id = request.get("risk_a_id").and_then(|v| v.as_str()).unwrap_or("").to_string();
        let risk_b_id = request.get("risk_b_id").and_then(|v| v.as_str()).unwrap_or("").to_string();
        let data_a: Vec<f64> = request.get("data_a").and_then(|v| v.as_array()).ok_or("Missing data_a".to_string())?.iter().map(|v| v.as_f64().unwrap_or(0.0)).collect();
        let data_b: Vec<f64> = request.get("data_b").and_then(|v| v.as_array()).ok_or("Missing data_b".to_string())?.iter().map(|v| v.as_f64().unwrap_or(0.0)).collect();

        let correlation_coefficient = self.pearson_correlation(&data_a, &data_b).ok_or("Invalid data for correlation".to_string())?;
        let description = format!("Correlation between {} and {} is {}", risk_a_id, risk_b_id, correlation_coefficient);

        Ok(RiskCorrelation {
            correlation_id,
            risk_a_id,
            risk_b_id,
            correlation_coefficient,
            description,
        })
    }

    pub fn integrate_geopolitical_risk(&self, request_json: &str) -> Result<GeopoliticalRisk, String> {
        let request: HashMap<String, serde_json::Value> = serde_json::from_str(request_json).map_err(|e| e.to_string())?;
        let country_code = request.get("country_code").and_then(|v| v.as_str()).unwrap_or("").to_string();
        
        self.geo_risk_data.get(&country_code).cloned().ok_or(format!("No data for country code: {}", country_code))
    }

    pub fn automate_risk_treatment(&self, request_json: &str) -> Result<RiskTreatmentWorkflow, String> {
        let request: HashMap<String, serde_json::Value> = serde_json::from_str(request_json).map_err(|e| e.to_string())?;
        let workflow_id = request.get("workflow_id").and_then(|v| v.as_str()).unwrap_or("").to_string();
        let risk_id = request.get("risk_id").and_then(|v| v.as_str()).unwrap_or("").to_string();
        
        Ok(RiskTreatmentWorkflow {
            workflow_id,
            risk_id,
            status: "pending".to_string(),
            assigned_to: "risk_team".to_string(),
            due_date: Utc::now() + chrono::Duration::days(30),
        })
    }

    pub fn analyze_control_gaps(&self, request_json: &str) -> Result<ControlGap, String> {
        let request: HashMap<String, serde_json::Value> = serde_json::from_str(request_json).map_err(|e| e.to_string())?;
        let gap_id = request.get("gap_id").and_then(|v| v.as_str()).unwrap_or("").to_string();
        let control_framework = request.get("control_framework").and_then(|v| v.as_str()).unwrap_or("").to_string();
        let existing_controls: Vec<String> = request.get("existing_controls").and_then(|v| v.as_array()).ok_or("Missing existing_controls".to_string())?.iter().map(|v| v.as_str().unwrap_or("").to_string()).collect();
        
        let framework_controls = self.get_framework_controls(&control_framework);
        let missing_control = framework_controls.iter().find(|c| !existing_controls.contains(c)).unwrap_or(&"None".to_string()).clone();

        Ok(ControlGap {
            gap_id,
            control_framework,
            missing_control: missing_control.clone(),
            recommended_control: format!("Implement control {}", missing_control),
            risk_rating: if missing_control == "None" { RiskLevel::Low } else { RiskLevel::High },
        })
    }

    // --- Helper Functions ---

    fn calculate_risk_level(&self, score: f64) -> RiskLevel {
        match score {
            0.0..=3.0 => RiskLevel::Low,
            3.0..=6.0 => RiskLevel::Medium,
            6.0..=8.0 => RiskLevel::High,
            _ => RiskLevel::Critical,
        }
    }

    fn linear_regression(&self, data: &[f64]) -> (f64, f64) {
        let n = data.len() as f64;
        let sum_x = (0..data.len()).map(|i| i as f64).sum::<f64>();
        let sum_y = data.iter().sum::<f64>();
        let sum_xy = data.iter().enumerate().map(|(i, &y)| i as f64 * y).sum::<f64>();
        let sum_xx = (0..data.len()).map(|i| (i as f64).powi(2)).sum::<f64>();

        let slope = (n * sum_xy - sum_x * sum_y) / (n * sum_xx - sum_x.powi(2));
        let intercept = (sum_y - slope * sum_x) / n;
        (slope, intercept)
    }

    fn pearson_correlation(&self, data_a: &[f64], data_b: &[f64]) -> Option<f64> {
        if data_a.len() != data_b.len() { return None; }
        let n = data_a.len() as f64;
        let mean_a = data_a.iter().sum::<f64>() / n;
        let mean_b = data_b.iter().sum::<f64>() / n;
        
        let cov = data_a.iter().zip(data_b.iter()).map(|(&a, &b)| (a - mean_a) * (b - mean_b)).sum::<f64>();
        let std_dev_a = data_a.iter().map(|&a| (a - mean_a).powi(2)).sum::<f64>().sqrt();
        let std_dev_b = data_b.iter().map(|&b| (b - mean_b).powi(2)).sum::<f64>().sqrt();

        if std_dev_a * std_dev_b == 0.0 { None } else { Some(cov / (std_dev_a * std_dev_b)) }
    }

    fn get_framework_controls(&self, framework: &str) -> Vec<String> {
        match framework {
            "nist" => vec!["AC-1".to_string(), "AC-2".to_string(), "AU-1".to_string(), "AU-2".to_string()],
            "iso27001" => vec!["A.5.1".to_string(), "A.5.2".to_string(), "A.6.1".to_string(), "A.6.2".to_string()],
            _ => vec![],
        }
    }
}

// --- N-API Bindings ---

#[napi]
pub struct RiskCoreNapi {
    inner: RiskCore,
}

#[napi]
impl RiskCoreNapi {
    #[napi(constructor)]
    pub fn new() -> Result<Self> {
        let core = RiskCore::new()
            .map_err(|e| napi::Error::from_reason(format!("Failed to create Risk Core: {}", e)))?;
        Ok(RiskCoreNapi { inner: core })
    }

    #[napi]
    pub fn assess_risk(&self, asset_id: String, factors_json: String) -> Result<String> {
        let factors: HashMap<String, f64> = serde_json::from_str(&factors_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to parse factors: {}", e)))?;

        let assessment = self.inner.assess_risk(&asset_id, factors)
            .map_err(|e| napi::Error::from_reason(format!("Failed to assess risk: {}", e)))?;

        serde_json::to_string(&assessment)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize assessment: {}", e)))
    }

    // --- New Competitive Feature N-API Bindings ---

    #[napi]
    pub fn forecast_risk(&self, request_json: String) -> Result<String> {
        let forecast = self.inner.forecast_risk(&request_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to forecast risk: {}", e)))?;
        serde_json::to_string(&forecast)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize forecast: {}", e)))
    }

    #[napi]
    pub fn monitor_control(&self, request_json: String) -> Result<String> {
        let status = self.inner.monitor_control(&request_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to monitor control: {}", e)))?;
        serde_json::to_string(&status)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize control status: {}", e)))
    }

    #[napi]
    pub fn assess_vendor_risk(&self, request_json: String) -> Result<String> {
        let vendor_risk = self.inner.assess_vendor_risk(&request_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to assess vendor risk: {}", e)))?;
        serde_json::to_string(&vendor_risk)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize vendor risk: {}", e)))
    }

    #[napi]
    pub fn monitor_kri(&self, request_json: String) -> Result<String> {
        let kri_status = self.inner.monitor_kri(&request_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to monitor KRI: {}", e)))?;
        serde_json::to_string(&kri_status)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize KRI status: {}", e)))
    }

    #[napi]
    pub fn create_bowtie_model(&self, request_json: String) -> Result<String> {
        let bowtie_model = self.inner.create_bowtie_model(&request_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to create Bowtie model: {}", e)))?;
        serde_json::to_string(&bowtie_model)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize Bowtie model: {}", e)))
    }

    #[napi]
    pub fn predictive_risk_analytics(&self, request_json: String) -> Result<String> {
        let result = self.inner.predictive_risk_analytics(&request_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to perform predictive analytics: {}", e)))?;
        serde_json::to_string(&result)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize predictive analytics result: {}", e)))
    }

    #[napi]
    pub fn analyze_risk_correlation(&self, request_json: String) -> Result<String> {
        let result = self.inner.analyze_risk_correlation(&request_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to analyze risk correlation: {}", e)))?;
        serde_json::to_string(&result)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize risk correlation result: {}", e)))
    }

    #[napi]
    pub fn integrate_geopolitical_risk(&self, request_json: String) -> Result<String> {
        let result = self.inner.integrate_geopolitical_risk(&request_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to integrate geopolitical risk: {}", e)))?;
        serde_json::to_string(&result)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize geopolitical risk result: {}", e)))
    }

    #[napi]
    pub fn automate_risk_treatment(&self, request_json: String) -> Result<String> {
        let result = self.inner.automate_risk_treatment(&request_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to automate risk treatment: {}", e)))?;
        serde_json::to_string(&result)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize risk treatment workflow: {}", e)))
    }

    #[napi]
    pub fn analyze_control_gaps(&self, request_json: String) -> Result<String> {
        let result = self.inner.analyze_control_gaps(&request_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to analyze control gaps: {}", e)))?;
        serde_json::to_string(&result)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize control gap analysis: {}", e)))
    }

    #[napi]
    pub fn get_health_status(&self) -> Result<String> {
        let status = serde_json::json!({
            "status": "healthy",
            "timestamp": chrono::Utc::now().to_rfc3339(),
            "version": env!("CARGO_PKG_VERSION")
        });

        serde_json::to_string(&status)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize health status: {}", e)))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_risk_core_creation() {
        let core = RiskCore::new();
        assert!(core.is_ok());
    }

    #[test]
    fn test_calculate_risk_level() {
        let core = RiskCore::new().unwrap();
        assert_eq!(core.calculate_risk_level(1.0), RiskLevel::Low);
        assert_eq!(core.calculate_risk_level(4.5), RiskLevel::Medium);
        assert_eq!(core.calculate_risk_level(7.0), RiskLevel::High);
        assert_eq!(core.calculate_risk_level(9.0), RiskLevel::Critical);
    }

    #[test]
    fn test_forecast_risk() {
        let core = RiskCore::new().unwrap();
        let request = r#"{"forecast_id": "f1", "historical_data": [5.0, 5.2, 5.3, 5.5]}"#;
        let forecast = core.forecast_risk(request).unwrap();
        assert_eq!(forecast.forecast_id, "f1");
        assert!(forecast.predicted_risk_score > 5.5);
        assert_eq!(forecast.trend, "increasing");
    }

    #[test]
    fn test_monitor_control_effective() {
        let core = RiskCore::new().unwrap();
        let request = r#"{"control_id": "c1", "metric": 5, "threshold": 10}"#;
        let status = core.monitor_control(request).unwrap();
        assert!(status.is_effective);
    }

    #[test]
    fn test_monitor_control_ineffective() {
        let core = RiskCore::new().unwrap();
        let request = r#"{"control_id": "c1", "metric": 15, "threshold": 10}"#;
        let status = core.monitor_control(request).unwrap();
        assert!(!status.is_effective);
    }

    #[test]
    fn test_assess_vendor_risk() {
        let core = RiskCore::new().unwrap();
        let request = r#"{"vendor_id": "v1", "vendor_name": "Test Vendor", "score": 7.5}"#;
        let risk = core.assess_vendor_risk(request).unwrap();
        assert_eq!(risk.risk_level, RiskLevel::High);
    }

    #[test]
    fn test_monitor_kri() {
        let core = RiskCore::new().unwrap();
        let request = r#"{"kri_id": "k1", "name": "Phishing Attempts", "current_value": 12, "thresholds": {"green": 5, "amber": 10, "red": 15}}"#;
        let kri = core.monitor_kri(request).unwrap();
        assert_eq!(kri.status, "red");
    }

    #[test]
    fn test_analyze_risk_correlation() {
        let core = RiskCore::new().unwrap();
        let request = r#"{"correlation_id": "corr1", "risk_a_id": "a", "risk_b_id": "b", "data_a": [1.0, 2.0, 3.0], "data_b": [2.0, 4.0, 6.0]}"#;
        let correlation = core.analyze_risk_correlation(request).unwrap();
        assert!((correlation.correlation_coefficient - 1.0).abs() < 1e-9);
    }

    #[test]
    fn test_integrate_geopolitical_risk() {
        let core = RiskCore::new().unwrap();
        let request = r#"{"country_code": "US"}"#;
        let risk = core.integrate_geopolitical_risk(request).unwrap();
        assert_eq!(risk.risk_index, 3.5);
    }

    #[test]
    fn test_analyze_control_gaps() {
        let core = RiskCore::new().unwrap();
        let request = r#"{"gap_id": "g1", "control_framework": "nist", "existing_controls": ["AC-1", "AU-1"]}"#;
        let gap = core.analyze_control_gaps(request).unwrap();
        assert_eq!(gap.missing_control, "AC-2");
        assert_eq!(gap.risk_rating, RiskLevel::High);
    }
}


    // --- New Competitive Feature Implementations ---

    pub fn forecast_risk(&self, request_json: &str) -> Result<RiskForecast, String> {
        let request: HashMap<String, serde_json::Value> = serde_json::from_str(request_json).map_err(|e| e.to_string())?;
        let forecast_id = request.get("forecast_id").and_then(|v| v.as_str()).unwrap_or("").to_string();
        let historical_data = request.get("historical_data").and_then(|v| v.as_array()).ok_or("Missing historical_data".to_string())?;
        
        let scores: Vec<f64> = historical_data.iter().map(|v| v.as_f64().unwrap_or(0.0)).collect();
        let (slope, intercept) = self.linear_regression(&scores);
        
        let next_score = slope * (scores.len() as f64 + 1.0) + intercept;
        let trend = if slope > 0.1 { "increasing" } else if slope < -0.1 { "decreasing" } else { "stable" };

        Ok(RiskForecast {
            forecast_id,
            time_horizon_months: 6,
            predicted_risk_score: next_score.max(0.0).min(10.0),
            confidence: 0.85, // Simplified confidence
            trend: trend.to_string(),
        })
    }

    pub fn monitor_control(&self, request_json: &str) -> Result<ControlStatus, String> {
        let request: HashMap<String, serde_json::Value> = serde_json::from_str(request_json).map_err(|e| e.to_string())?;
        let control_id = request.get("control_id").and_then(|v| v.as_str()).unwrap_or("").to_string();
        let metric = request.get("metric").and_then(|v| v.as_f64()).ok_or("Missing metric".to_string())?;
        let threshold = request.get("threshold").and_then(|v| v.as_f64()).ok_or("Missing threshold".to_string())?;
        
        let is_effective = metric < threshold;
        let details = if is_effective { "Control is operating within defined parameters." } else { "Control has exceeded its operational threshold." };

        Ok(ControlStatus {
            control_id,
            is_effective,
            last_checked: Utc::now(),
            details: details.to_string(),
        })
    }

    pub fn assess_vendor_risk(&self, request_json: &str) -> Result<VendorRisk, String> {
        let request: HashMap<String, serde_json::Value> = serde_json::from_str(request_json).map_err(|e| e.to_string())?;
        let vendor_id = request.get("vendor_id").and_then(|v| v.as_str()).unwrap_or("").to_string();
        let vendor_name = request.get("vendor_name").and_then(|v| v.as_str()).unwrap_or("").to_string();
        let score = request.get("score").and_then(|v| v.as_f64()).ok_or("Missing score".to_string())?;

        let risk_level = self.calculate_risk_level(score);
        let summary = format!("Vendor risk assessed at a {} level.", serde_json::to_string(&risk_level).unwrap());

        Ok(VendorRisk {
            vendor_id,
            vendor_name,
            risk_score: score,
            risk_level,
            summary,
        })
    }

    pub fn monitor_kri(&self, request_json: &str) -> Result<KRIStatus, String> {
        let request: HashMap<String, serde_json::Value> = serde_json::from_str(request_json).map_err(|e| e.to_string())?;
        let kri_id = request.get("kri_id").and_then(|v| v.as_str()).unwrap_or("").to_string();
        let name = request.get("name").and_then(|v| v.as_str()).unwrap_or("").to_string();
        let current_value = request.get("current_value").and_then(|v| v.as_f64()).ok_or("Missing current_value".to_string())?;
        let thresholds = request.get("thresholds").and_then(|v| v.as_object()).ok_or("Missing thresholds".to_string())?;
        
        let green = thresholds.get("green").and_then(|v| v.as_f64()).ok_or("Missing green threshold".to_string())?;
        let amber = thresholds.get("amber").and_then(|v| v.as_f64()).ok_or("Missing amber threshold".to_string())?;

        let status = if current_value <= green { "green" } else if current_value <= amber { "amber" } else { "red" };

        Ok(KRIStatus {
            kri_id,
            name,
            current_value,
            status: status.to_string(),
        })
    }

    pub fn create_bowtie_model(&self, request_json: &str) -> Result<BowtieModel, String> {
        serde_json::from_str(request_json).map_err(|e| e.to_string())
    }

    pub fn predictive_risk_analytics(&self, request_json: &str) -> Result<PredictiveAnalysisResult, String> {
        let request: HashMap<String, serde_json::Value> = serde_json::from_str(request_json).map_err(|e| e.to_string())?;
        let analysis_id = request.get("analysis_id").and_then(|v| v.as_str()).unwrap_or("").to_string();
        let risk_category = request.get("risk_category").and_then(|v| v.as_str()).unwrap_or("").to_string();
        let factors = request.get("factors").and_then(|v| v.as_object()).ok_or("Missing factors".to_string())?;

        let mut score = 0.0;
        for (_, value) in factors.iter() {
            score += value.as_f64().unwrap_or(0.0);
        }
        
        let predicted_impact = score * 10000.0;
        let prediction_probability = (score / (factors.len() as f64 * 10.0)).min(1.0);

        Ok(PredictiveAnalysisResult {
            analysis_id,
            risk_category,
            predicted_impact,
            prediction_probability,
            recommended_actions: vec!["Review security controls".to_string(), "Increase monitoring".to_string()],
        })
    }

    pub fn analyze_risk_correlation(&self, request_json: &str) -> Result<RiskCorrelation, String> {
        let request: HashMap<String, serde_json::Value> = serde_json::from_str(request_json).map_err(|e| e.to_string())?;
        let correlation_id = request.get("correlation_id").and_then(|v| v.as_str()).unwrap_or("").to_string();
        let risk_a_id = request.get("risk_a_id").and_then(|v| v.as_str()).unwrap_or("").to_string();
        let risk_b_id = request.get("risk_b_id").and_then(|v| v.as_str()).unwrap_or("").to_string();
        let data_a: Vec<f64> = request.get("data_a").and_then(|v| v.as_array()).ok_or("Missing data_a".to_string())?.iter().map(|v| v.as_f64().unwrap_or(0.0)).collect();
        let data_b: Vec<f64> = request.get("data_b").and_then(|v| v.as_array()).ok_or("Missing data_b".to_string())?.iter().map(|v| v.as_f64().unwrap_or(0.0)).collect();

        let correlation_coefficient = self.pearson_correlation(&data_a, &data_b).ok_or("Invalid data for correlation".to_string())?;
        let description = format!("Correlation between {} and {} is {}", risk_a_id, risk_b_id, correlation_coefficient);

        Ok(RiskCorrelation {
            correlation_id,
            risk_a_id,
            risk_b_id,
            correlation_coefficient,
            description,
        })
    }

    pub fn integrate_geopolitical_risk(&self, request_json: &str) -> Result<GeopoliticalRisk, String> {
        let request: HashMap<String, serde_json::Value> = serde_json::from_str(request_json).map_err(|e| e.to_string())?;
        let country_code = request.get("country_code").and_then(|v| v.as_str()).unwrap_or("").to_string();
        
        self.geo_risk_data.get(&country_code).cloned().ok_or(format!("No data for country code: {}", country_code))
    }

    pub fn automate_risk_treatment(&self, request_json: &str) -> Result<RiskTreatmentWorkflow, String> {
        let request: HashMap<String, serde_json::Value> = serde_json::from_str(request_json).map_err(|e| e.to_string())?;
        let workflow_id = request.get("workflow_id").and_then(|v| v.as_str()).unwrap_or("").to_string();
        let risk_id = request.get("risk_id").and_then(|v| v.as_str()).unwrap_or("").to_string();
        
        Ok(RiskTreatmentWorkflow {
            workflow_id,
            risk_id,
            status: "pending".to_string(),
            assigned_to: "risk_team".to_string(),
            due_date: Utc::now() + chrono::Duration::days(30),
        })
    }

    pub fn analyze_control_gaps(&self, request_json: &str) -> Result<ControlGap, String> {
        let request: HashMap<String, serde_json::Value> = serde_json::from_str(request_json).map_err(|e| e.to_string())?;
        let gap_id = request.get("gap_id").and_then(|v| v.as_str()).unwrap_or("").to_string();
        let control_framework = request.get("control_framework").and_then(|v| v.as_str()).unwrap_or("").to_string();
        let existing_controls: Vec<String> = request.get("existing_controls").and_then(|v| v.as_array()).ok_or("Missing existing_controls".to_string())?.iter().map(|v| v.as_str().unwrap_or("").to_string()).collect();
        
        let framework_controls = self.get_framework_controls(&control_framework);
        let missing_control = framework_controls.iter().find(|c| !existing_controls.contains(c)).unwrap_or(&"None".to_string()).clone();

        Ok(ControlGap {
            gap_id,
            control_framework,
            missing_control: missing_control.clone(),
            recommended_control: format!("Implement control {}", missing_control),
            risk_rating: if missing_control == "None" { RiskLevel::Low } else { RiskLevel::High },
        })
    }

    // --- Helper Functions ---

    fn calculate_risk_level(&self, score: f64) -> RiskLevel {
        match score {
            0.0..=3.0 => RiskLevel::Low,
            3.0..=6.0 => RiskLevel::Medium,
            6.0..=8.0 => RiskLevel::High,
            _ => RiskLevel::Critical,
        }
    }

    fn linear_regression(&self, data: &[f64]) -> (f64, f64) {
        let n = data.len() as f64;
        let sum_x = (0..data.len()).map(|i| i as f64).sum::<f64>();
        let sum_y = data.iter().sum::<f64>();
        let sum_xy = data.iter().enumerate().map(|(i, &y)| i as f64 * y).sum::<f64>();
        let sum_xx = (0..data.len()).map(|i| (i as f64).powi(2)).sum::<f64>();

        let slope = (n * sum_xy - sum_x * sum_y) / (n * sum_xx - sum_x.powi(2));
        let intercept = (sum_y - slope * sum_x) / n;
        (slope, intercept)
    }

    fn pearson_correlation(&self, data_a: &[f64], data_b: &[f64]) -> Option<f64> {
        if data_a.len() != data_b.len() { return None; }
        let n = data_a.len() as f64;
        let mean_a = data_a.iter().sum::<f64>() / n;
        let mean_b = data_b.iter().sum::<f64>() / n;
        
        let cov = data_a.iter().zip(data_b.iter()).map(|(&a, &b)| (a - mean_a) * (b - mean_b)).sum::<f64>();
        let std_dev_a = data_a.iter().map(|&a| (a - mean_a).powi(2)).sum::<f64>().sqrt();
        let std_dev_b = data_b.iter().map(|&b| (b - mean_b).powi(2)).sum::<f64>().sqrt();

        if std_dev_a * std_dev_b == 0.0 { None } else { Some(cov / (std_dev_a * std_dev_b)) }
    }

    fn get_framework_controls(&self, framework: &str) -> Vec<String> {
        match framework {
            "nist" => vec!["AC-1".to_string(), "AC-2".to_string(), "AU-1".to_string(), "AU-2".to_string()],
            "iso27001" => vec!["A.5.1".to_string(), "A.5.2".to_string(), "A.6.1".to_string(), "A.6.2".to_string()],
            _ => vec![],
        }
    }
}

// --- N-API Bindings ---

#[napi]
pub struct RiskCoreNapi {
    inner: RiskCore,
}

#[napi]
impl RiskCoreNapi {
    #[napi(constructor)]
    pub fn new() -> Result<Self> {
        let core = RiskCore::new()
            .map_err(|e| napi::Error::from_reason(format!("Failed to create Risk Core: {}", e)))?;
        Ok(RiskCoreNapi { inner: core })
    }

    #[napi]
    pub fn assess_risk(&self, asset_id: String, factors_json: String) -> Result<String> {
        let factors: HashMap<String, f64> = serde_json::from_str(&factors_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to parse factors: {}", e)))?;

        let assessment = self.inner.assess_risk(&asset_id, factors)
            .map_err(|e| napi::Error::from_reason(format!("Failed to assess risk: {}", e)))?;

        serde_json::to_string(&assessment)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize assessment: {}", e)))
    }

    // --- New Competitive Feature N-API Bindings ---

    #[napi]
    pub fn forecast_risk(&self, request_json: String) -> Result<String> {
        let forecast = self.inner.forecast_risk(&request_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to forecast risk: {}", e)))?;
        serde_json::to_string(&forecast)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize forecast: {}", e)))
    }

    #[napi]
    pub fn monitor_control(&self, request_json: String) -> Result<String> {
        let status = self.inner.monitor_control(&request_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to monitor control: {}", e)))?;
        serde_json::to_string(&status)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize control status: {}", e)))
    }

    #[napi]
    pub fn assess_vendor_risk(&self, request_json: String) -> Result<String> {
        let vendor_risk = self.inner.assess_vendor_risk(&request_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to assess vendor risk: {}", e)))?;
        serde_json::to_string(&vendor_risk)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize vendor risk: {}", e)))
    }

    #[napi]
    pub fn monitor_kri(&self, request_json: String) -> Result<String> {
        let kri_status = self.inner.monitor_kri(&request_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to monitor KRI: {}", e)))?;
        serde_json::to_string(&kri_status)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize KRI status: {}", e)))
    }

    #[napi]
    pub fn create_bowtie_model(&self, request_json: String) -> Result<String> {
        let bowtie_model = self.inner.create_bowtie_model(&request_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to create Bowtie model: {}", e)))?;
        serde_json::to_string(&bowtie_model)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize Bowtie model: {}", e)))
    }

    #[napi]
    pub fn predictive_risk_analytics(&self, request_json: String) -> Result<String> {
        let result = self.inner.predictive_risk_analytics(&request_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to perform predictive analytics: {}", e)))?;
        serde_json::to_string(&result)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize predictive analytics result: {}", e)))
    }

    #[napi]
    pub fn analyze_risk_correlation(&self, request_json: String) -> Result<String> {
        let result = self.inner.analyze_risk_correlation(&request_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to analyze risk correlation: {}", e)))?;
        serde_json::to_string(&result)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize risk correlation result: {}", e)))
    }

    #[napi]
    pub fn integrate_geopolitical_risk(&self, request_json: String) -> Result<String> {
        let result = self.inner.integrate_geopolitical_risk(&request_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to integrate geopolitical risk: {}", e)))?;
        serde_json::to_string(&result)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize geopolitical risk result: {}", e)))
    }

    #[napi]
    pub fn automate_risk_treatment(&self, request_json: String) -> Result<String> {
        let result = self.inner.automate_risk_treatment(&request_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to automate risk treatment: {}", e)))?;
        serde_json::to_string(&result)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize risk treatment workflow: {}", e)))
    }

    #[napi]
    pub fn analyze_control_gaps(&self, request_json: String) -> Result<String> {
        let result = self.inner.analyze_control_gaps(&request_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to analyze control gaps: {}", e)))?;
        serde_json::to_string(&result)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize control gap analysis: {}", e)))
    }

    #[napi]
    pub fn get_health_status(&self) -> Result<String> {
        let status = serde_json::json!({
            "status": "healthy",
            "timestamp": chrono::Utc::now().to_rfc3339(),
            "version": env!("CARGO_PKG_VERSION")
        });

        serde_json::to_string(&status)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize health status: {}", e)))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_risk_core_creation() {
        let core = RiskCore::new();
        assert!(core.is_ok());
    }

    #[test]
    fn test_calculate_risk_level() {
        let core = RiskCore::new().unwrap();
        assert_eq!(core.calculate_risk_level(1.0), RiskLevel::Low);
        assert_eq!(core.calculate_risk_level(4.5), RiskLevel::Medium);
        assert_eq!(core.calculate_risk_level(7.0), RiskLevel::High);
        assert_eq!(core.calculate_risk_level(9.0), RiskLevel::Critical);
    }

    #[test]
    fn test_forecast_risk() {
        let core = RiskCore::new().unwrap();
        let request = r#"{"forecast_id": "f1", "historical_data": [5.0, 5.2, 5.3, 5.5]}"#;
        let forecast = core.forecast_risk(request).unwrap();
        assert_eq!(forecast.forecast_id, "f1");
        assert!(forecast.predicted_risk_score > 5.5);
        assert_eq!(forecast.trend, "increasing");
    }

    #[test]
    fn test_monitor_control_effective() {
        let core = RiskCore::new().unwrap();
        let request = r#"{"control_id": "c1", "metric": 5, "threshold": 10}"#;
        let status = core.monitor_control(request).unwrap();
        assert!(status.is_effective);
    }

    #[test]
    fn test_monitor_control_ineffective() {
        let core = RiskCore::new().unwrap();
        let request = r#"{"control_id": "c1", "metric": 15, "threshold": 10}"#;
        let status = core.monitor_control(request).unwrap();
        assert!(!status.is_effective);
    }

    #[test]
    fn test_assess_vendor_risk() {
        let core = RiskCore::new().unwrap();
        let request = r#"{"vendor_id": "v1", "vendor_name": "Test Vendor", "score": 7.5}"#;
        let risk = core.assess_vendor_risk(request).unwrap();
        assert_eq!(risk.risk_level, RiskLevel::High);
    }

    #[test]
    fn test_monitor_kri() {
        let core = RiskCore::new().unwrap();
        let request = r#"{"kri_id": "k1", "name": "Phishing Attempts", "current_value": 12, "thresholds": {"green": 5, "amber": 10, "red": 15}}"#;
        let kri = core.monitor_kri(request).unwrap();
        assert_eq!(kri.status, "red");
    }

    #[test]
    fn test_analyze_risk_correlation() {
        let core = RiskCore::new().unwrap();
        let request = r#"{"correlation_id": "corr1", "risk_a_id": "a", "risk_b_id": "b", "data_a": [1.0, 2.0, 3.0], "data_b": [2.0, 4.0, 6.0]}"#;
        let correlation = core.analyze_risk_correlation(request).unwrap();
        assert!((correlation.correlation_coefficient - 1.0).abs() < 1e-9);
    }

    #[test]
    fn test_integrate_geopolitical_risk() {
        let core = RiskCore::new().unwrap();
        let request = r#"{"country_code": "US"}"#;
        let risk = core.integrate_geopolitical_risk(request).unwrap();
        assert_eq!(risk.risk_index, 3.5);
    }

    #[test]
    fn test_analyze_control_gaps() {
        let core = RiskCore::new().unwrap();
        let request = r#"{"gap_id": "g1", "control_framework": "nist", "existing_controls": ["AC-1", "AU-1"]}"#;
        let gap = core.analyze_control_gaps(request).unwrap();
        assert_eq!(gap.missing_control, "AC-2");
        assert_eq!(gap.risk_rating, RiskLevel::High);
    }
}
"#;
        let forecast = core.forecast_risk(request).unwrap();
        assert_eq!(forecast.forecast_id, "f1");
        assert!(forecast.predicted_risk_score > 5.5);
        assert_eq!(forecast.trend, "increasing");
    }

    #[test]
    fn test_monitor_control_effective() {
        let core = RiskCore::new().unwrap();
        let request = r#"{"control_id": "c1", "metric": 5, "threshold": 10}"#;
        let status = core.monitor_control(request).unwrap();
        assert!(status.is_effective);
    }

    #[test]
    fn test_monitor_control_ineffective() {
        let core = RiskCore::new().unwrap();
        let request = r#"{"control_id": "c1", "metric": 15, "threshold": 10}"#;
        let status = core.monitor_control(request).unwrap();
        assert!(!status.is_effective);
    }

    #[test]
    fn test_assess_vendor_risk() {
        let core = RiskCore::new().unwrap();
        let request = r#"{"vendor_id": "v1", "vendor_name": "Test Vendor", "score": 7.5}"#;
        let risk = core.assess_vendor_risk(request).unwrap();
        assert_eq!(risk.risk_level, RiskLevel::High);
    }

    #[test]
    fn test_monitor_kri() {
        let core = RiskCore::new().unwrap();
        let request = r#"{"kri_id": "k1", "name": "Phishing Attempts", "current_value": 12, "thresholds": {"green": 5, "amber": 10, "red": 15}}"#;
        let kri = core.monitor_kri(request).unwrap();
        assert_eq!(kri.status, "red");
    }

    #[test]
    fn test_analyze_risk_correlation() {
        let core = RiskCore::new().unwrap();
        let request = r#"{"correlation_id": "corr1", "risk_a_id": "a", "risk_b_id": "b", "data_a": [1.0, 2.0, 3.0], "data_b": [2.0, 4.0, 6.0]}"#;
        let correlation = core.analyze_risk_correlation(request).unwrap();
        assert!((correlation.correlation_coefficient - 1.0).abs() < 1e-9);
    }

    #[test]
    fn test_integrate_geopolitical_risk() {
        let core = RiskCore::new().unwrap();
        let request = r#"{"country_code": "US"}"#;
        let risk = core.integrate_geopolitical_risk(request).unwrap();
        assert_eq!(risk.risk_index, 3.5);
    }

    #[test]
    fn test_analyze_control_gaps() {
        let core = RiskCore::new().unwrap();
        let request = r#"{"gap_id": "g1", "control_framework": "nist", "existing_controls": ["AC-1", "AU-1"]}"#;
        let gap = core.analyze_control_gaps(request).unwrap();
        assert_eq!(gap.missing_control, "AC-2");
        assert_eq!(gap.risk_rating, RiskLevel::High);
    }
}
