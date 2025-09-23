//! Capacity Planning and Forecasting System
//!
//! This module provides enterprise-grade capacity planning:
//! - Resource usage trend analysis and forecasting
//! - Predictive scaling recommendations
//! - Cost optimization analysis
//! - SLA compliance monitoring
//! - Multi-dimensional capacity modeling
//! - Automated threshold and alert management

use super::*;
use std::sync::Arc;
use std::collections::HashMap;
use parking_lot::RwLock;
use dashmap::DashMap;
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc, Duration};
use tokio::sync::mpsc;

/// Capacity planner for resource forecasting and optimization
pub struct CapacityPlanner {
    /// Forecasting models
    forecasting_models: DashMap<String, Box<dyn ForecastingModel>>,
    /// Historical data storage
    historical_data: Arc<RwLock<HistoricalDataStore>>,
    /// Capacity recommendations
    recommendations: Arc<RwLock<Vec<CapacityRecommendation>>>,
    /// Cost analyzer
    cost_analyzer: Arc<CostAnalyzer>,
    /// Scaling predictor
    scaling_predictor: Arc<ScalingPredictor>,
    /// Threshold manager
    threshold_manager: Arc<ThresholdManager>,
    /// Configuration
    config: CapacityPlanningConfig,
    /// Event sender for async processing
    event_sender: mpsc::Sender<CapacityEvent>,
    /// Background processor handle
    _processor_handle: tokio::task::JoinHandle<()>,
}

/// Capacity planning configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CapacityPlanningConfig {
    /// Historical data retention period (days)
    pub retention_days: u32,
    /// Forecasting horizon (days)
    pub forecast_horizon_days: u32,
    /// Update frequency for forecasts (hours)
    pub forecast_update_frequency_hours: u32,
    /// Minimum confidence threshold for recommendations
    pub min_confidence_threshold: f64,
    /// Cost optimization enabled
    pub enable_cost_optimization: bool,
    /// Auto-scaling recommendations
    pub enable_auto_scaling_recommendations: bool,
    /// Alert thresholds
    pub alert_thresholds: AlertThresholds,
}

/// Alert thresholds for capacity planning
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AlertThresholds {
    /// Resource utilization alert threshold (%)
    pub resource_utilization_threshold: f64,
    /// Forecast confidence alert threshold
    pub forecast_confidence_threshold: f64,
    /// Cost increase alert threshold (%)
    pub cost_increase_threshold: f64,
    /// SLA violation risk threshold
    pub sla_violation_risk_threshold: f64,
}

/// Capacity event for async processing
#[derive(Debug, Clone)]
pub enum CapacityEvent {
    DataPointCollected(CapacityDataPoint),
    ForecastGenerated(CapacityForecast),
    RecommendationGenerated(CapacityRecommendation),
    ThresholdViolation(ThresholdViolation),
    CostOptimizationOpportunity(CostOptimization),
}

/// Forecasting model trait
pub trait ForecastingModel: Send + Sync {
    fn train(&mut self, historical_data: &[CapacityDataPoint]) -> Result<(), CapacityError>;
    fn predict(&self, horizon_points: usize) -> Result<Vec<ForecastPoint>, CapacityError>;
    fn get_model_name(&self) -> &str;
    fn get_confidence_interval(&self) -> f64;
    fn get_accuracy_metrics(&self) -> ModelAccuracyMetrics;
}

/// Historical data storage
pub struct HistoricalDataStore {
    /// Resource usage data
    resource_data: HashMap<String, Vec<CapacityDataPoint>>,
    /// Performance metrics data
    performance_data: HashMap<String, Vec<PerformanceDataPoint>>,
    /// Cost data
    cost_data: HashMap<String, Vec<CostDataPoint>>,
    /// Aggregated views
    aggregated_views: HashMap<String, AggregatedView>,
}

/// Capacity data point
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CapacityDataPoint {
    pub timestamp: DateTime<Utc>,
    pub resource_type: ResourceType,
    pub resource_id: String,
    pub utilization: ResourceUtilization,
    pub performance_metrics: PerformanceMetrics,
    pub cost_metrics: Option<CostMetrics>,
    pub tenant_id: Option<String>,
    pub tags: HashMap<String, String>,
}

/// Resource type enumeration
#[derive(Debug, Clone, Serialize, Deserialize, Hash, PartialEq, Eq)]
pub enum ResourceType {
    CPU,
    Memory,
    Storage,
    Network,
    GPU,
    Database,
    Cache,
    MessageQueue,
    LoadBalancer,
    Custom(String),
}

/// Resource utilization metrics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourceUtilization {
    pub current_usage: f64,
    pub capacity: f64,
    pub utilization_percent: f64,
    pub peak_usage: f64,
    pub average_usage: f64,
    pub growth_rate: f64,
    pub seasonal_patterns: Vec<SeasonalPattern>,
}

/// Performance metrics for capacity planning
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceMetrics {
    pub response_time_ms: f64,
    pub throughput: f64,
    pub error_rate: f64,
    pub availability: f64,
    pub saturation_point: Option<f64>,
    pub efficiency_score: f64,
}

/// Cost metrics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CostMetrics {
    pub hourly_cost: f64,
    pub daily_cost: f64,
    pub monthly_cost: f64,
    pub cost_per_unit: f64,
    pub cost_trend: CostTrend,
    pub optimization_potential: f64,
}

/// Cost trend enumeration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CostTrend {
    Increasing,
    Stable,
    Decreasing,
    Volatile,
}

/// Seasonal pattern
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SeasonalPattern {
    pub pattern_type: PatternType,
    pub amplitude: f64,
    pub frequency: f64,
    pub phase_offset: f64,
    pub confidence: f64,
}

/// Pattern type enumeration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PatternType {
    Hourly,
    Daily,
    Weekly,
    Monthly,
    Yearly,
    Custom,
}

/// Performance data point
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceDataPoint {
    pub timestamp: DateTime<Utc>,
    pub resource_id: String,
    pub metrics: PerformanceMetrics,
    pub workload_characteristics: WorkloadCharacteristics,
}

/// Workload characteristics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkloadCharacteristics {
    pub request_rate: f64,
    pub request_size_bytes: f64,
    pub complexity_score: f64,
    pub concurrency_level: u32,
    pub batch_size: u32,
    pub data_access_patterns: DataAccessPattern,
}

/// Data access pattern enumeration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DataAccessPattern {
    Sequential,
    Random,
    Temporal,
    Spatial,
    Mixed,
}

/// Cost data point
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CostDataPoint {
    pub timestamp: DateTime<Utc>,
    pub resource_id: String,
    pub cost_components: CostComponents,
    pub billing_period: BillingPeriod,
    pub optimization_opportunities: Vec<CostOptimizationOpportunity>,
}

/// Cost components
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CostComponents {
    pub compute_cost: f64,
    pub storage_cost: f64,
    pub network_cost: f64,
    pub licensing_cost: f64,
    pub operational_cost: f64,
    pub total_cost: f64,
}

/// Billing period enumeration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum BillingPeriod {
    Hourly,
    Daily,
    Monthly,
    Yearly,
}

/// Cost optimization opportunity
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CostOptimizationOpportunity {
    pub opportunity_type: OptimizationType,
    pub potential_savings: f64,
    pub confidence: f64,
    pub implementation_complexity: ComplexityLevel,
    pub description: String,
}

/// Optimization type enumeration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum OptimizationType {
    RightSizing,
    ReservedInstances,
    Spot Instances,
    Auto Scaling,
    Load Balancing,
    Caching,
    Compression,
    Archival,
}

/// Complexity level enumeration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ComplexityLevel {
    Low,
    Medium,
    High,
    Expert,
}

/// Aggregated view of capacity data
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AggregatedView {
    pub view_name: String,
    pub aggregation_level: AggregationLevel,
    pub time_range: TimeRange,
    pub metrics: AggregatedMetrics,
    pub trends: Vec<TrendAnalysis>,
}

/// Aggregation level enumeration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AggregationLevel {
    Minute,
    Hour,
    Day,
    Week,
    Month,
    Quarter,
    Year,
}

/// Aggregated metrics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AggregatedMetrics {
    pub average_utilization: f64,
    pub peak_utilization: f64,
    pub min_utilization: f64,
    pub utilization_variance: f64,
    pub growth_rate: f64,
    pub capacity_remaining: f64,
    pub time_to_saturation: Option<Duration>,
}

/// Trend analysis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrendAnalysis {
    pub metric_name: String,
    pub trend_direction: TrendDirection,
    pub slope: f64,
    pub correlation_coefficient: f64,
    pub confidence_level: f64,
    pub statistical_significance: f64,
}

/// Trend direction enumeration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TrendDirection {
    Increasing,
    Decreasing,
    Stable,
    Cyclical,
    Unknown,
}

/// Capacity forecast
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CapacityForecast {
    pub forecast_id: String,
    pub resource_type: ResourceType,
    pub resource_id: String,
    pub generated_at: DateTime<Utc>,
    pub forecast_horizon: Duration,
    pub predictions: Vec<ForecastPoint>,
    pub model_used: String,
    pub confidence_interval: f64,
    pub accuracy_metrics: ModelAccuracyMetrics,
    pub assumptions: Vec<ForecastAssumption>,
    pub scenarios: Vec<ForecastScenario>,
}

/// Forecast point
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ForecastPoint {
    pub timestamp: DateTime<Utc>,
    pub predicted_value: f64,
    pub confidence_lower: f64,
    pub confidence_upper: f64,
    pub prediction_interval_lower: f64,
    pub prediction_interval_upper: f64,
    pub contributing_factors: Vec<ContributingFactor>,
}

/// Model accuracy metrics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelAccuracyMetrics {
    pub mean_absolute_error: f64,
    pub mean_squared_error: f64,
    pub root_mean_squared_error: f64,
    pub mean_absolute_percentage_error: f64,
    pub r_squared: f64,
    pub akaike_information_criterion: f64,
    pub bayesian_information_criterion: f64,
}

/// Forecast assumption
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ForecastAssumption {
    pub assumption_name: String,
    pub description: String,
    pub impact_if_violated: ImpactLevel,
    pub probability_of_violation: f64,
}

/// Impact level enumeration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ImpactLevel {
    Low,
    Medium,
    High,
    Critical,
}

/// Forecast scenario
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ForecastScenario {
    pub scenario_name: String,
    pub description: String,
    pub probability: f64,
    pub adjustments: Vec<ScenarioAdjustment>,
    pub forecast_points: Vec<ForecastPoint>,
}

/// Scenario adjustment
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScenarioAdjustment {
    pub parameter_name: String,
    pub adjustment_factor: f64,
    pub justification: String,
}

/// Contributing factor to predictions
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContributingFactor {
    pub factor_name: String,
    pub contribution_weight: f64,
    pub factor_value: f64,
    pub factor_type: FactorType,
}

/// Factor type enumeration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FactorType {
    Trend,
    Seasonal,
    External,
    Historical,
    Predictive,
}

/// Capacity recommendation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CapacityRecommendation {
    pub recommendation_id: String,
    pub resource_type: ResourceType,
    pub resource_id: String,
    pub generated_at: DateTime<Utc>,
    pub recommendation_type: RecommendationType,
    pub priority: RecommendationPriority,
    pub action_required_by: DateTime<Utc>,
    pub description: String,
    pub rationale: String,
    pub expected_impact: ExpectedImpact,
    pub implementation_steps: Vec<ImplementationStep>,
    pub cost_implications: CostImplication,
    pub risk_assessment: RiskAssessment,
}

/// Recommendation type enumeration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RecommendationType {
    ScaleUp,
    ScaleDown,
    Optimize,
    Migrate,
    Archive,
    Monitor,
    Alert,
}

/// Recommendation priority enumeration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RecommendationPriority {
    Low,
    Medium,
    High,
    Critical,
    Emergency,
}

/// Expected impact of recommendation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExpectedImpact {
    pub performance_improvement: f64,
    pub cost_change: f64,
    pub capacity_increase: f64,
    pub availability_impact: f64,
    pub implementation_time_hours: u32,
}

/// Implementation step
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImplementationStep {
    pub step_number: u32,
    pub description: String,
    pub estimated_time_minutes: u32,
    pub prerequisites: Vec<String>,
    pub validation_criteria: Vec<String>,
    pub rollback_procedure: Option<String>,
}

/// Cost implication of recommendation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CostImplication {
    pub immediate_cost_change: f64,
    pub monthly_cost_change: f64,
    pub annual_cost_change: f64,
    pub roi_timeline_months: u32,
    pub break_even_point: Option<DateTime<Utc>>,
}

/// Risk assessment for recommendation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RiskAssessment {
    pub overall_risk_level: RiskLevel,
    pub risks: Vec<IdentifiedRisk>,
    pub mitigation_strategies: Vec<MitigationStrategy>,
    pub confidence_level: f64,
}

/// Risk level enumeration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RiskLevel {
    Low,
    Medium,
    High,
    VeryHigh,
}

/// Identified risk
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IdentifiedRisk {
    pub risk_type: RiskType,
    pub description: String,
    pub probability: f64,
    pub impact: ImpactLevel,
    pub mitigation_required: bool,
}

/// Risk type enumeration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RiskType {
    Performance,
    Availability,
    Security,
    Cost,
    Compliance,
    Operational,
}

/// Mitigation strategy
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MitigationStrategy {
    pub strategy_name: String,
    pub description: String,
    pub implementation_effort: ComplexityLevel,
    pub effectiveness: f64,
}

/// Cost analyzer for optimization opportunities
pub struct CostAnalyzer {
    /// Cost models
    cost_models: HashMap<ResourceType, Box<dyn CostModel>>,
    /// Optimization strategies
    optimization_strategies: Vec<Box<dyn CostOptimizationStrategy>>,
    /// Historical cost data
    cost_history: Arc<RwLock<HashMap<String, Vec<CostDataPoint>>>>,
}

/// Cost model trait
pub trait CostModel: Send + Sync {
    fn calculate_cost(&self, usage: &ResourceUtilization, time_period: Duration) -> f64;
    fn get_cost_breakdown(&self, usage: &ResourceUtilization, time_period: Duration) -> CostComponents;
    fn predict_cost(&self, forecast: &[ForecastPoint]) -> Vec<CostPrediction>;
}

/// Cost optimization strategy trait
pub trait CostOptimizationStrategy: Send + Sync {
    fn analyze(&self, cost_data: &[CostDataPoint]) -> Vec<CostOptimizationOpportunity>;
    fn get_strategy_name(&self) -> &str;
    fn get_potential_savings(&self, current_cost: f64) -> f64;
}

/// Cost prediction
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CostPrediction {
    pub timestamp: DateTime<Utc>,
    pub predicted_cost: f64,
    pub confidence_interval_lower: f64,
    pub confidence_interval_upper: f64,
    pub cost_components: CostComponents,
}

/// Scaling predictor for auto-scaling recommendations
pub struct ScalingPredictor {
    /// Scaling models
    scaling_models: HashMap<ResourceType, Box<dyn ScalingModel>>,
    /// Scaling history
    scaling_history: Arc<RwLock<HashMap<String, Vec<ScalingEvent>>>>,
}

/// Scaling model trait
pub trait ScalingModel: Send + Sync {
    fn predict_scaling_needs(&self, forecast: &CapacityForecast) -> ScalingRecommendation;
    fn optimize_scaling_parameters(&self, historical_data: &[CapacityDataPoint]) -> ScalingParameters;
}

/// Scaling recommendation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScalingRecommendation {
    pub resource_id: String,
    pub scaling_actions: Vec<ScalingAction>,
    pub optimal_configuration: ResourceConfiguration,
    pub performance_projection: PerformanceProjection,
    pub cost_impact: CostImpact,
}

/// Scaling action
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScalingAction {
    pub action_type: ScalingActionType,
    pub trigger_time: DateTime<Utc>,
    pub target_capacity: f64,
    pub scaling_factor: f64,
    pub cooldown_period: Duration,
}

/// Scaling action type enumeration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ScalingActionType {
    ScaleOut,
    ScaleIn,
    ScaleUp,
    ScaleDown,
    Maintain,
}

/// Resource configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourceConfiguration {
    pub min_capacity: f64,
    pub max_capacity: f64,
    pub target_utilization: f64,
    pub scaling_policy: ScalingPolicy,
    pub performance_targets: PerformanceTargets,
}

/// Scaling policy
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScalingPolicy {
    pub scale_out_threshold: f64,
    pub scale_in_threshold: f64,
    pub scale_out_cooldown: Duration,
    pub scale_in_cooldown: Duration,
    pub scaling_increment: f64,
}

/// Performance targets
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceTargets {
    pub target_response_time_ms: f64,
    pub target_throughput: f64,
    pub target_availability: f64,
    pub maximum_error_rate: f64,
}

/// Performance projection
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceProjection {
    pub projected_response_time: f64,
    pub projected_throughput: f64,
    pub projected_availability: f64,
    pub projected_error_rate: f64,
    pub confidence_level: f64,
}

/// Cost impact of scaling
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CostImpact {
    pub current_monthly_cost: f64,
    pub projected_monthly_cost: f64,
    pub cost_change_percent: f64,
    pub cost_per_performance_unit: f64,
}

/// Scaling parameters
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScalingParameters {
    pub optimal_min_capacity: f64,
    pub optimal_max_capacity: f64,
    pub optimal_target_utilization: f64,
    pub recommended_scaling_policy: ScalingPolicy,
}

/// Scaling event for history tracking
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScalingEvent {
    pub event_id: String,
    pub timestamp: DateTime<Utc>,
    pub resource_id: String,
    pub action_type: ScalingActionType,
    pub previous_capacity: f64,
    pub new_capacity: f64,
    pub trigger_reason: String,
    pub success: bool,
    pub performance_impact: Option<PerformanceImpact>,
}

/// Performance impact of scaling
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceImpact {
    pub response_time_change: f64,
    pub throughput_change: f64,
    pub availability_change: f64,
    pub error_rate_change: f64,
}

/// Threshold manager for dynamic threshold adjustment
pub struct ThresholdManager {
    /// Current thresholds
    thresholds: DashMap<String, DynamicThreshold>,
    /// Threshold adjustment history
    adjustment_history: Arc<RwLock<Vec<ThresholdAdjustment>>>,
}

/// Dynamic threshold
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DynamicThreshold {
    pub resource_id: String,
    pub metric_name: String,
    pub current_value: f64,
    pub adjustment_factor: f64,
    pub min_value: f64,
    pub max_value: f64,
    pub last_updated: DateTime<Utc>,
    pub update_frequency: Duration,
}

/// Threshold adjustment event
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThresholdAdjustment {
    pub adjustment_id: String,
    pub resource_id: String,
    pub metric_name: String,
    pub previous_value: f64,
    pub new_value: f64,
    pub reason: String,
    pub timestamp: DateTime<Utc>,
}

/// Threshold violation event
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThresholdViolation {
    pub violation_id: String,
    pub resource_id: String,
    pub metric_name: String,
    pub threshold_value: f64,
    pub actual_value: f64,
    pub severity: ViolationSeverity,
    pub timestamp: DateTime<Utc>,
    pub recommended_actions: Vec<String>,
}

/// Violation severity enumeration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ViolationSeverity {
    Warning,
    Minor,
    Major,
    Critical,
}

/// Cost optimization result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CostOptimization {
    pub optimization_id: String,
    pub resource_id: String,
    pub optimization_type: OptimizationType,
    pub current_cost: f64,
    pub optimized_cost: f64,
    pub savings_amount: f64,
    pub savings_percent: f64,
    pub implementation_timeline: Duration,
    pub confidence_level: f64,
}

impl CapacityPlanner {
    /// Create a new capacity planner
    pub async fn new() -> Result<Self, CapacityError> {
        let config = CapacityPlanningConfig {
            retention_days: 365,
            forecast_horizon_days: 30,
            forecast_update_frequency_hours: 6,
            min_confidence_threshold: 0.8,
            enable_cost_optimization: true,
            enable_auto_scaling_recommendations: true,
            alert_thresholds: AlertThresholds {
                resource_utilization_threshold: 80.0,
                forecast_confidence_threshold: 0.7,
                cost_increase_threshold: 20.0,
                sla_violation_risk_threshold: 0.1,
            },
        };

        let (event_sender, event_receiver) = mpsc::channel(10000);

        // Create components
        let cost_analyzer = Arc::new(CostAnalyzer::new());
        let scaling_predictor = Arc::new(ScalingPredictor::new());
        let threshold_manager = Arc::new(ThresholdManager::new());

        // Start background processor
        let historical_data = Arc::new(RwLock::new(HistoricalDataStore::new()));
        let recommendations = Arc::new(RwLock::new(Vec::new()));
        let processor_handle = tokio::spawn(
            Self::background_processor(
                event_receiver,
                historical_data.clone(),
                recommendations.clone(),
            )
        );

        // Create forecasting models
        let mut forecasting_models = DashMap::new();
        forecasting_models.insert("linear_regression".to_string(), Box::new(LinearRegressionModel::new()) as Box<dyn ForecastingModel>);
        forecasting_models.insert("arima".to_string(), Box::new(ARIMAModel::new()) as Box<dyn ForecastingModel>);
        forecasting_models.insert("lstm".to_string(), Box::new(LSTMModel::new()) as Box<dyn ForecastingModel>);

        Ok(Self {
            forecasting_models,
            historical_data,
            recommendations,
            cost_analyzer,
            scaling_predictor,
            threshold_manager,
            config,
            event_sender,
            _processor_handle: processor_handle,
        })
    }

    /// Initialize the capacity planning system
    pub async fn initialize(&self) -> Result<(), CapacityError> {
        // Start periodic forecasting
        self.start_periodic_forecasting().await?;

        // Start cost analysis
        self.start_cost_analysis().await?;

        // Start threshold monitoring
        self.start_threshold_monitoring().await?;

        Ok(())
    }

    /// Add capacity data point
    pub async fn add_capacity_data_point(&self, data_point: CapacityDataPoint) -> Result<(), CapacityError> {
        // Send event for processing
        let _ = self.event_sender.send(CapacityEvent::DataPointCollected(data_point)).await;
        Ok(())
    }

    /// Generate capacity forecast
    pub async fn generate_forecast(
        &self,
        resource_type: ResourceType,
        resource_id: &str,
        horizon_days: u32,
    ) -> Result<CapacityForecast, CapacityError> {
        // Get historical data
        let historical_data = self.historical_data.read();
        let resource_data = historical_data.resource_data.get(resource_id)
            .ok_or_else(|| CapacityError::NoHistoricalData(resource_id.to_string()))?;

        // Select best forecasting model
        let model_name = self.select_best_model(resource_data)?;
        let model = self.forecasting_models.get(&model_name)
            .ok_or_else(|| CapacityError::ModelNotFound(model_name.clone()))?;

        // Generate forecast
        let horizon_points = (horizon_days * 24) as usize; // Hourly predictions
        let predictions = model.predict(horizon_points)?;

        let forecast = CapacityForecast {
            forecast_id: Uuid::new_v4().to_string(),
            resource_type,
            resource_id: resource_id.to_string(),
            generated_at: Utc::now(),
            forecast_horizon: Duration::days(horizon_days as i64),
            predictions,
            model_used: model_name,
            confidence_interval: model.get_confidence_interval(),
            accuracy_metrics: model.get_accuracy_metrics(),
            assumptions: self.generate_forecast_assumptions(),
            scenarios: self.generate_forecast_scenarios(&model_name, horizon_points)?,
        };

        // Send event
        let _ = self.event_sender.send(CapacityEvent::ForecastGenerated(forecast.clone())).await;

        Ok(forecast)
    }

    /// Generate capacity recommendations
    pub async fn generate_recommendations(
        &self,
        resource_id: &str,
        forecast: &CapacityForecast,
    ) -> Result<Vec<CapacityRecommendation>, CapacityError> {
        let mut recommendations = Vec::new();

        // Analyze forecast for capacity issues
        for prediction in &forecast.predictions {
            if prediction.predicted_value > 0.8 { // 80% utilization threshold
                let recommendation = CapacityRecommendation {
                    recommendation_id: Uuid::new_v4().to_string(),
                    resource_type: forecast.resource_type.clone(),
                    resource_id: resource_id.to_string(),
                    generated_at: Utc::now(),
                    recommendation_type: RecommendationType::ScaleUp,
                    priority: if prediction.predicted_value > 0.9 {
                        RecommendationPriority::High
                    } else {
                        RecommendationPriority::Medium
                    },
                    action_required_by: prediction.timestamp - Duration::hours(6),
                    description: format!("Scale up resources before reaching {}% utilization",
                                        (prediction.predicted_value * 100.0) as u32),
                    rationale: "Predicted utilization will exceed safe thresholds".to_string(),
                    expected_impact: ExpectedImpact {
                        performance_improvement: 20.0,
                        cost_change: 15.0,
                        capacity_increase: 50.0,
                        availability_impact: 5.0,
                        implementation_time_hours: 2,
                    },
                    implementation_steps: self.generate_implementation_steps(&RecommendationType::ScaleUp),
                    cost_implications: CostImplication {
                        immediate_cost_change: 100.0,
                        monthly_cost_change: 3000.0,
                        annual_cost_change: 36000.0,
                        roi_timeline_months: 6,
                        break_even_point: Some(Utc::now() + Duration::days(180)),
                    },
                    risk_assessment: self.assess_recommendation_risk(&RecommendationType::ScaleUp),
                };

                recommendations.push(recommendation);
                break; // Only one scaling recommendation per forecast
            }
        }

        // Send events for generated recommendations
        for recommendation in &recommendations {
            let _ = self.event_sender.send(CapacityEvent::RecommendationGenerated(recommendation.clone())).await;
        }

        Ok(recommendations)
    }

    /// Get cost optimization opportunities
    pub async fn get_cost_optimization_opportunities(
        &self,
        resource_id: &str,
    ) -> Result<Vec<CostOptimizationOpportunity>, CapacityError> {
        let cost_data = self.historical_data.read()
            .cost_data.get(resource_id)
            .cloned()
            .unwrap_or_default();

        let opportunities = self.cost_analyzer.analyze_optimization_opportunities(&cost_data).await?;
        Ok(opportunities)
    }

    /// Get scaling recommendations
    pub async fn get_scaling_recommendations(
        &self,
        resource_id: &str,
        forecast: &CapacityForecast,
    ) -> Result<ScalingRecommendation, CapacityError> {
        let scaling_recommendation = self.scaling_predictor.predict_scaling_needs(forecast).await?;
        Ok(scaling_recommendation)
    }

    /// Select best forecasting model for the data
    fn select_best_model(&self, data: &[CapacityDataPoint]) -> Result<String, CapacityError> {
        // Simple model selection based on data characteristics
        let data_size = data.len();
        let has_seasonality = self.detect_seasonality(data);

        if data_size < 100 {
            Ok("linear_regression".to_string())
        } else if has_seasonality && data_size > 1000 {
            Ok("lstm".to_string())
        } else {
            Ok("arima".to_string())
        }
    }

    /// Detect seasonality in data
    fn detect_seasonality(&self, _data: &[CapacityDataPoint]) -> bool {
        // Simplified seasonality detection
        // Real implementation would use statistical tests
        true
    }

    /// Generate forecast assumptions
    fn generate_forecast_assumptions(&self) -> Vec<ForecastAssumption> {
        vec![
            ForecastAssumption {
                assumption_name: "Stable Workload Pattern".to_string(),
                description: "Assumes current workload patterns will continue".to_string(),
                impact_if_violated: ImpactLevel::Medium,
                probability_of_violation: 0.2,
            },
            ForecastAssumption {
                assumption_name: "No Major Architecture Changes".to_string(),
                description: "Assumes no significant changes to system architecture".to_string(),
                impact_if_violated: ImpactLevel::High,
                probability_of_violation: 0.1,
            },
        ]
    }

    /// Generate forecast scenarios
    fn generate_forecast_scenarios(
        &self,
        _model_name: &str,
        horizon_points: usize,
    ) -> Result<Vec<ForecastScenario>, CapacityError> {
        let mut scenarios = Vec::new();

        // Optimistic scenario
        scenarios.push(ForecastScenario {
            scenario_name: "Optimistic Growth".to_string(),
            description: "Lower than expected growth rate".to_string(),
            probability: 0.25,
            adjustments: vec![ScenarioAdjustment {
                parameter_name: "growth_rate".to_string(),
                adjustment_factor: 0.8,
                justification: "Economic conditions favor slower growth".to_string(),
            }],
            forecast_points: self.generate_scenario_points(horizon_points, 0.8)?,
        });

        // Pessimistic scenario
        scenarios.push(ForecastScenario {
            scenario_name: "Aggressive Growth".to_string(),
            description: "Higher than expected growth rate".to_string(),
            probability: 0.25,
            adjustments: vec![ScenarioAdjustment {
                parameter_name: "growth_rate".to_string(),
                adjustment_factor: 1.3,
                justification: "Market expansion or viral growth".to_string(),
            }],
            forecast_points: self.generate_scenario_points(horizon_points, 1.3)?,
        });

        Ok(scenarios)
    }

    /// Generate scenario forecast points
    fn generate_scenario_points(&self, horizon_points: usize, factor: f64) -> Result<Vec<ForecastPoint>, CapacityError> {
        let mut points = Vec::new();
        let base_time = Utc::now();

        for i in 0..horizon_points {
            let timestamp = base_time + Duration::hours(i as i64);
            let base_value = 0.5 + (i as f64 / horizon_points as f64) * 0.3; // Growing from 50% to 80%
            let adjusted_value = base_value * factor;

            points.push(ForecastPoint {
                timestamp,
                predicted_value: adjusted_value,
                confidence_lower: adjusted_value * 0.9,
                confidence_upper: adjusted_value * 1.1,
                prediction_interval_lower: adjusted_value * 0.8,
                prediction_interval_upper: adjusted_value * 1.2,
                contributing_factors: vec![],
            });
        }

        Ok(points)
    }

    /// Generate implementation steps for recommendation
    fn generate_implementation_steps(&self, recommendation_type: &RecommendationType) -> Vec<ImplementationStep> {
        match recommendation_type {
            RecommendationType::ScaleUp => vec![
                ImplementationStep {
                    step_number: 1,
                    description: "Review current resource utilization".to_string(),
                    estimated_time_minutes: 15,
                    prerequisites: vec!["Access to monitoring dashboard".to_string()],
                    validation_criteria: vec!["Confirm high utilization trend".to_string()],
                    rollback_procedure: None,
                },
                ImplementationStep {
                    step_number: 2,
                    description: "Plan capacity increase".to_string(),
                    estimated_time_minutes: 30,
                    prerequisites: vec!["Current utilization analysis".to_string()],
                    validation_criteria: vec!["Capacity plan approved".to_string()],
                    rollback_procedure: None,
                },
                ImplementationStep {
                    step_number: 3,
                    description: "Execute scaling operation".to_string(),
                    estimated_time_minutes: 60,
                    prerequisites: vec!["Approved capacity plan".to_string()],
                    validation_criteria: vec!["New resources online and healthy".to_string()],
                    rollback_procedure: Some("Scale back to previous configuration".to_string()),
                },
            ],
            _ => vec![],
        }
    }

    /// Assess risk for recommendation
    fn assess_recommendation_risk(&self, recommendation_type: &RecommendationType) -> RiskAssessment {
        match recommendation_type {
            RecommendationType::ScaleUp => RiskAssessment {
                overall_risk_level: RiskLevel::Low,
                risks: vec![
                    IdentifiedRisk {
                        risk_type: RiskType::Cost,
                        description: "Increased operational costs".to_string(),
                        probability: 1.0,
                        impact: ImpactLevel::Medium,
                        mitigation_required: false,
                    },
                    IdentifiedRisk {
                        risk_type: RiskType::Performance,
                        description: "Temporary performance impact during scaling".to_string(),
                        probability: 0.3,
                        impact: ImpactLevel::Low,
                        mitigation_required: true,
                    },
                ],
                mitigation_strategies: vec![
                    MitigationStrategy {
                        strategy_name: "Gradual Scaling".to_string(),
                        description: "Scale resources incrementally to minimize impact".to_string(),
                        implementation_effort: ComplexityLevel::Low,
                        effectiveness: 0.8,
                    },
                ],
                confidence_level: 0.9,
            },
            _ => RiskAssessment {
                overall_risk_level: RiskLevel::Medium,
                risks: vec![],
                mitigation_strategies: vec![],
                confidence_level: 0.7,
            },
        }
    }

    /// Start periodic forecasting
    async fn start_periodic_forecasting(&self) -> Result<(), CapacityError> {
        let event_sender = self.event_sender.clone();
        let forecasting_models = self.forecasting_models.clone();
        let historical_data = self.historical_data.clone();

        tokio::spawn(async move {
            let mut interval = tokio::time::interval(tokio::time::Duration::from_secs(3600 * 6)); // Every 6 hours

            loop {
                interval.tick().await;

                // Generate forecasts for all resources
                let data = historical_data.read();
                for resource_id in data.resource_data.keys() {
                    // Generate forecast for each resource
                    // Implementation would call generate_forecast method
                }
            }
        });

        Ok(())
    }

    /// Start cost analysis
    async fn start_cost_analysis(&self) -> Result<(), CapacityError> {
        let cost_analyzer = self.cost_analyzer.clone();
        let event_sender = self.event_sender.clone();

        tokio::spawn(async move {
            let mut interval = tokio::time::interval(tokio::time::Duration::from_secs(3600 * 24)); // Daily

            loop {
                interval.tick().await;

                // Analyze cost optimization opportunities
                if let Ok(opportunities) = cost_analyzer.analyze_all_resources().await {
                    for opportunity in opportunities {
                        let cost_optimization = CostOptimization {
                            optimization_id: Uuid::new_v4().to_string(),
                            resource_id: "resource_1".to_string(), // Would be actual resource ID
                            optimization_type: opportunity.opportunity_type,
                            current_cost: 1000.0, // Would be actual current cost
                            optimized_cost: 800.0, // Would be calculated optimized cost
                            savings_amount: 200.0,
                            savings_percent: 20.0,
                            implementation_timeline: Duration::hours(24),
                            confidence_level: opportunity.confidence,
                        };

                        let _ = event_sender.send(CapacityEvent::CostOptimizationOpportunity(cost_optimization)).await;
                    }
                }
            }
        });

        Ok(())
    }

    /// Start threshold monitoring
    async fn start_threshold_monitoring(&self) -> Result<(), CapacityError> {
        let threshold_manager = self.threshold_manager.clone();
        let event_sender = self.event_sender.clone();

        tokio::spawn(async move {
            let mut interval = tokio::time::interval(tokio::time::Duration::from_secs(60)); // Every minute

            loop {
                interval.tick().await;

                // Check for threshold violations
                if let Ok(violations) = threshold_manager.check_violations().await {
                    for violation in violations {
                        let _ = event_sender.send(CapacityEvent::ThresholdViolation(violation)).await;
                    }
                }
            }
        });

        Ok(())
    }

    /// Background processor for capacity events
    async fn background_processor(
        mut event_receiver: mpsc::Receiver<CapacityEvent>,
        historical_data: Arc<RwLock<HistoricalDataStore>>,
        recommendations: Arc<RwLock<Vec<CapacityRecommendation>>>,
    ) {
        while let Some(event) = event_receiver.recv().await {
            match event {
                CapacityEvent::DataPointCollected(data_point) => {
                    // Store data point
                    let mut data = historical_data.write();
                    data.resource_data.entry(data_point.resource_id.clone())
                        .or_insert_with(Vec::new)
                        .push(data_point);
                },
                CapacityEvent::ForecastGenerated(forecast) => {
                    // Store forecast results
                    println!("Forecast generated for {}: {} predictions",
                            forecast.resource_id, forecast.predictions.len());
                },
                CapacityEvent::RecommendationGenerated(recommendation) => {
                    // Store recommendation
                    recommendations.write().push(recommendation);
                },
                CapacityEvent::ThresholdViolation(violation) => {
                    // Handle threshold violation
                    println!("Threshold violation: {} exceeded {} (actual: {})",
                            violation.metric_name, violation.threshold_value, violation.actual_value);
                },
                CapacityEvent::CostOptimizationOpportunity(optimization) => {
                    // Handle cost optimization opportunity
                    println!("Cost optimization opportunity: {} savings of ${:.2}",
                            optimization.optimization_type, optimization.savings_amount);
                },
            }
        }
    }
}

// Implementation of helper structures

impl HistoricalDataStore {
    fn new() -> Self {
        Self {
            resource_data: HashMap::new(),
            performance_data: HashMap::new(),
            cost_data: HashMap::new(),
            aggregated_views: HashMap::new(),
        }
    }
}

impl CostAnalyzer {
    fn new() -> Self {
        Self {
            cost_models: HashMap::new(),
            optimization_strategies: Vec::new(),
            cost_history: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    async fn analyze_optimization_opportunities(
        &self,
        _cost_data: &[CostDataPoint],
    ) -> Result<Vec<CostOptimizationOpportunity>, CapacityError> {
        // Implementation would analyze cost data for optimization opportunities
        Ok(vec![])
    }

    async fn analyze_all_resources(&self) -> Result<Vec<CostOptimizationOpportunity>, CapacityError> {
        // Implementation would analyze all resources for cost optimization
        Ok(vec![])
    }
}

impl ScalingPredictor {
    fn new() -> Self {
        Self {
            scaling_models: HashMap::new(),
            scaling_history: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    async fn predict_scaling_needs(&self, _forecast: &CapacityForecast) -> Result<ScalingRecommendation, CapacityError> {
        // Implementation would predict scaling needs based on forecast
        Ok(ScalingRecommendation {
            resource_id: "resource_1".to_string(),
            scaling_actions: vec![],
            optimal_configuration: ResourceConfiguration {
                min_capacity: 1.0,
                max_capacity: 10.0,
                target_utilization: 70.0,
                scaling_policy: ScalingPolicy {
                    scale_out_threshold: 80.0,
                    scale_in_threshold: 50.0,
                    scale_out_cooldown: Duration::minutes(5),
                    scale_in_cooldown: Duration::minutes(10),
                    scaling_increment: 1.0,
                },
                performance_targets: PerformanceTargets {
                    target_response_time_ms: 100.0,
                    target_throughput: 1000.0,
                    target_availability: 99.9,
                    maximum_error_rate: 0.1,
                },
            },
            performance_projection: PerformanceProjection {
                projected_response_time: 95.0,
                projected_throughput: 1100.0,
                projected_availability: 99.95,
                projected_error_rate: 0.05,
                confidence_level: 0.85,
            },
            cost_impact: CostImpact {
                current_monthly_cost: 5000.0,
                projected_monthly_cost: 6500.0,
                cost_change_percent: 30.0,
                cost_per_performance_unit: 5.0,
            },
        })
    }
}

impl ThresholdManager {
    fn new() -> Self {
        Self {
            thresholds: DashMap::new(),
            adjustment_history: Arc::new(RwLock::new(Vec::new())),
        }
    }

    async fn check_violations(&self) -> Result<Vec<ThresholdViolation>, CapacityError> {
        // Implementation would check for threshold violations
        Ok(vec![])
    }
}

// Mock forecasting model implementations

struct LinearRegressionModel;
struct ARIMAModel;
struct LSTMModel;

impl LinearRegressionModel {
    fn new() -> Self { Self }
}

impl ARIMAModel {
    fn new() -> Self { Self }
}

impl LSTMModel {
    fn new() -> Self { Self }
}

impl ForecastingModel for LinearRegressionModel {
    fn train(&mut self, _historical_data: &[CapacityDataPoint]) -> Result<(), CapacityError> {
        Ok(())
    }

    fn predict(&self, horizon_points: usize) -> Result<Vec<ForecastPoint>, CapacityError> {
        let mut points = Vec::new();
        let base_time = Utc::now();

        for i in 0..horizon_points {
            points.push(ForecastPoint {
                timestamp: base_time + Duration::hours(i as i64),
                predicted_value: 0.5 + (i as f64 / horizon_points as f64) * 0.3,
                confidence_lower: 0.4 + (i as f64 / horizon_points as f64) * 0.25,
                confidence_upper: 0.6 + (i as f64 / horizon_points as f64) * 0.35,
                prediction_interval_lower: 0.3 + (i as f64 / horizon_points as f64) * 0.2,
                prediction_interval_upper: 0.7 + (i as f64 / horizon_points as f64) * 0.4,
                contributing_factors: vec![],
            });
        }

        Ok(points)
    }

    fn get_model_name(&self) -> &str {
        "Linear Regression"
    }

    fn get_confidence_interval(&self) -> f64 {
        0.95
    }

    fn get_accuracy_metrics(&self) -> ModelAccuracyMetrics {
        ModelAccuracyMetrics {
            mean_absolute_error: 0.05,
            mean_squared_error: 0.003,
            root_mean_squared_error: 0.055,
            mean_absolute_percentage_error: 8.5,
            r_squared: 0.85,
            akaike_information_criterion: -150.0,
            bayesian_information_criterion: -145.0,
        }
    }
}

impl ForecastingModel for ARIMAModel {
    fn train(&mut self, _historical_data: &[CapacityDataPoint]) -> Result<(), CapacityError> {
        Ok(())
    }

    fn predict(&self, horizon_points: usize) -> Result<Vec<ForecastPoint>, CapacityError> {
        // Similar implementation to LinearRegressionModel but with ARIMA characteristics
        let mut points = Vec::new();
        let base_time = Utc::now();

        for i in 0..horizon_points {
            points.push(ForecastPoint {
                timestamp: base_time + Duration::hours(i as i64),
                predicted_value: 0.55 + (i as f64 / horizon_points as f64) * 0.25,
                confidence_lower: 0.45 + (i as f64 / horizon_points as f64) * 0.2,
                confidence_upper: 0.65 + (i as f64 / horizon_points as f64) * 0.3,
                prediction_interval_lower: 0.35 + (i as f64 / horizon_points as f64) * 0.15,
                prediction_interval_upper: 0.75 + (i as f64 / horizon_points as f64) * 0.35,
                contributing_factors: vec![],
            });
        }

        Ok(points)
    }

    fn get_model_name(&self) -> &str {
        "ARIMA"
    }

    fn get_confidence_interval(&self) -> f64 {
        0.90
    }

    fn get_accuracy_metrics(&self) -> ModelAccuracyMetrics {
        ModelAccuracyMetrics {
            mean_absolute_error: 0.04,
            mean_squared_error: 0.002,
            root_mean_squared_error: 0.045,
            mean_absolute_percentage_error: 7.2,
            r_squared: 0.88,
            akaike_information_criterion: -160.0,
            bayesian_information_criterion: -152.0,
        }
    }
}

impl ForecastingModel for LSTMModel {
    fn train(&mut self, _historical_data: &[CapacityDataPoint]) -> Result<(), CapacityError> {
        Ok(())
    }

    fn predict(&self, horizon_points: usize) -> Result<Vec<ForecastPoint>, CapacityError> {
        // LSTM model with better accuracy for complex patterns
        let mut points = Vec::new();
        let base_time = Utc::now();

        for i in 0..horizon_points {
            points.push(ForecastPoint {
                timestamp: base_time + Duration::hours(i as i64),
                predicted_value: 0.52 + (i as f64 / horizon_points as f64) * 0.28,
                confidence_lower: 0.47 + (i as f64 / horizon_points as f64) * 0.23,
                confidence_upper: 0.57 + (i as f64 / horizon_points as f64) * 0.33,
                prediction_interval_lower: 0.42 + (i as f64 / horizon_points as f64) * 0.18,
                prediction_interval_upper: 0.62 + (i as f64 / horizon_points as f64) * 0.38,
                contributing_factors: vec![],
            });
        }

        Ok(points)
    }

    fn get_model_name(&self) -> &str {
        "LSTM Neural Network"
    }

    fn get_confidence_interval(&self) -> f64 {
        0.92
    }

    fn get_accuracy_metrics(&self) -> ModelAccuracyMetrics {
        ModelAccuracyMetrics {
            mean_absolute_error: 0.035,
            mean_squared_error: 0.0015,
            root_mean_squared_error: 0.039,
            mean_absolute_percentage_error: 6.8,
            r_squared: 0.92,
            akaike_information_criterion: -170.0,
            bayesian_information_criterion: -160.0,
        }
    }
}

/// Capacity planning error types
#[derive(Debug, thiserror::Error)]
pub enum CapacityError {
    #[error("Configuration error: {0}")]
    Configuration(String),

    #[error("No historical data available for resource: {0}")]
    NoHistoricalData(String),

    #[error("Forecasting model not found: {0}")]
    ModelNotFound(String),

    #[error("Model training error: {0}")]
    ModelTraining(String),

    #[error("Prediction error: {0}")]
    Prediction(String),

    #[error("Cost analysis error: {0}")]
    CostAnalysis(String),

    #[error("Scaling prediction error: {0}")]
    ScalingPrediction(String),

    #[error("Threshold management error: {0}")]
    ThresholdManagement(String),

    #[error("Network error: {0}")]
    Network(String),

    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),

    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
}