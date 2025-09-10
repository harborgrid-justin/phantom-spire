// Security Awareness Engine
use async_trait::async_trait;
use dashmap::DashMap;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrainingModule {
    pub module_id: String,
    pub title: String,
    pub content_type: String,
    pub difficulty_level: String,
    pub estimated_duration: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserProgress {
    pub user_id: String,
    pub completed_modules: Vec<String>,
    pub current_score: f64,
    pub last_activity: i64,
}

#[async_trait]
pub trait SecurityAwarenessTrait {
    async fn create_training(&self, module: TrainingModule) -> Result<String, String>;
    async fn track_progress(&self, progress: UserProgress) -> Result<(), String>;
    async fn get_awareness_status(&self) -> String;
}

#[derive(Clone)]
pub struct SecurityAwarenessEngine {
    training_modules: Arc<DashMap<String, TrainingModule>>,
    user_progress: Arc<DashMap<String, UserProgress>>,
    completed_trainings: Arc<RwLock<u64>>,
    active_users: Arc<RwLock<u32>>,
    last_error: Arc<RwLock<Option<String>>>,
}

impl SecurityAwarenessEngine {
    pub fn new() -> Self {
        Self {
            training_modules: Arc::new(DashMap::new()),
            user_progress: Arc::new(DashMap::new()),
            completed_trainings: Arc::new(RwLock::new(0)),
            active_users: Arc::new(RwLock::new(0)),
            last_error: Arc::new(RwLock::new(None)),
        }
    }
}

#[async_trait]
impl SecurityAwarenessTrait for SecurityAwarenessEngine {
    async fn create_training(&self, module: TrainingModule) -> Result<String, String> {
        let module_id = module.module_id.clone();
        self.training_modules.insert(module_id.clone(), module);
        Ok(module_id)
    }

    async fn track_progress(&self, progress: UserProgress) -> Result<(), String> {
        self.user_progress.insert(progress.user_id.clone(), progress);
        Ok(())
    }

    async fn get_awareness_status(&self) -> String {
        let completed = *self.completed_trainings.read().await;
        let active = *self.active_users.read().await;
        format!("Security Awareness Engine: {} trainings completed, {} active users", completed, active)
    }
}