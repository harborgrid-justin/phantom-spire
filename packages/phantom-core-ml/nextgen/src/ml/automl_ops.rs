use crate::error::Result;
use async_trait::async_trait;

/// AutoML operations trait for PhantomMLCore
#[async_trait]
pub trait AutoMLOperations {
    /// Automatically train and optimize ML models using AutoML
    async fn auto_train_model(&self, config_json: String) -> Result<String>;
    
    /// Get model leaderboard for AutoML experiments  
    async fn get_model_leaderboard(&self, experiment_id: String) -> Result<String>;
    
    /// Automatic feature engineering for datasets
    async fn auto_feature_engineering(&self, data_json: String, config_json: String) -> Result<String>;
    
    /// Explain model predictions with feature importance
    async fn explain_model(&self, model_id: String, instance_json: String) -> Result<String>;
    
    /// Optimize hyperparameters for a specific model
    async fn optimize_hyperparameters(&self, model_id: String, optimization_config_json: String) -> Result<String>;
    
    /// Automated model selection based on data characteristics
    async fn select_best_algorithm(&self, data_json: String, task_type: String) -> Result<String>;
    
    /// Generate automated insights from data
    async fn auto_generate_insights(&self, data_json: String, config_json: String) -> Result<String>;
    
    /// Cross-validate model performance
    async fn cross_validate_model(&self, model_id: String, data_json: String, folds: u32) -> Result<String>;
    
    /// Ensemble multiple models for improved performance
    async fn create_ensemble(&self, model_ids: Vec<String>, ensemble_config_json: String) -> Result<String>;
    
    /// Security-specific feature extraction
    async fn extract_security_features(&self, data_json: String, config_json: String) -> Result<String>;
}
