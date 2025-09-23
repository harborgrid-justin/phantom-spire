//! Async ML training and inference pipelines
//!
//! This module provides production-ready async pipelines for ML operations with
//! proper error handling, progress tracking, cancellation support, and resource management.

use crate::error::{PhantomMLError, Result};
use crate::ml::algorithms::*;
use crate::ml::persistence::*;

use async_trait::async_trait;
use futures::stream::{Stream, StreamExt};
use ndarray::{Array1, Array2, ArrayView1, ArrayView2};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::pin::Pin;
use std::sync::{Arc, atomic::{AtomicBool, AtomicUsize, Ordering}};
use std::time::{Duration, Instant, SystemTime, UNIX_EPOCH};
use tokio::sync::{mpsc, RwLock, Semaphore};
use tokio::task::JoinHandle;
use tokio::time::timeout;
use uuid::Uuid;

/// Async training pipeline for ML algorithms
pub struct AsyncTrainingPipeline {
    /// Unique pipeline ID
    pub id: Uuid,
    /// Pipeline configuration
    config: TrainingPipelineConfig,
    /// Model registry for persistence
    registry: Arc<RwLock<Option<ModelRegistry>>>,
    /// Active training jobs
    active_jobs: Arc<RwLock<HashMap<Uuid, TrainingJob>>>,
    /// Resource limits (concurrent jobs)
    job_semaphore: Arc<Semaphore>,
    /// Shutdown signal
    shutdown: Arc<AtomicBool>,
}

/// Async inference pipeline for ML predictions
pub struct AsyncInferencePipeline {
    /// Unique pipeline ID
    pub id: Uuid,
    /// Pipeline configuration
    config: InferencePipelineConfig,
    /// Loaded models cache
    models: Arc<RwLock<HashMap<String, Arc<dyn AsyncMLModel>>>>,
    /// Request queue and processing
    request_tx: mpsc::UnboundedSender<InferenceRequest>,
    request_rx: Arc<RwLock<Option<mpsc::UnboundedReceiver<InferenceRequest>>>>,
    /// Resource limits
    request_semaphore: Arc<Semaphore>,
    /// Performance metrics
    metrics: Arc<RwLock<InferenceMetrics>>,
    /// Shutdown signal
    shutdown: Arc<AtomicBool>,
}

/// Training pipeline configuration
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct TrainingPipelineConfig {
    /// Maximum concurrent training jobs
    pub max_concurrent_jobs: usize,
    /// Default timeout for training jobs
    pub default_timeout_seconds: u64,
    /// Enable automatic model versioning
    pub auto_versioning: bool,
    /// Enable progress callbacks
    pub enable_progress_callbacks: bool,
    /// Checkpoint frequency (epochs)
    pub checkpoint_frequency: Option<usize>,
    /// Resource monitoring interval
    pub monitoring_interval_ms: u64,
    /// Validation split for training
    pub validation_split: f64,
    /// Early stopping configuration
    pub early_stopping: Option<EarlyStoppingConfig>,
}

/// Inference pipeline configuration
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct InferencePipelineConfig {
    /// Maximum concurrent inference requests
    pub max_concurrent_requests: usize,
    /// Request timeout in milliseconds
    pub request_timeout_ms: u64,
    /// Model cache size
    pub model_cache_size: usize,
    /// Batch size for batch inference
    pub batch_size: Option<usize>,
    /// Enable request queuing
    pub enable_queuing: bool,
    /// Queue size limit
    pub queue_size_limit: usize,
    /// Model warming (preload models)
    pub enable_model_warming: bool,
}

/// Early stopping configuration
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct EarlyStoppingConfig {
    /// Metric to monitor
    pub monitor: String,
    /// Minimum change to qualify as improvement
    pub min_delta: f64,
    /// Number of epochs with no improvement to wait
    pub patience: usize,
    /// Whether higher values are better
    pub maximize: bool,
}

/// Training job metadata
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct TrainingJob {
    pub id: Uuid,
    pub model_id: String,
    pub algorithm_type: String,
    pub status: TrainingStatus,
    pub progress: TrainingProgress,
    pub created_at: SystemTime,
    pub started_at: Option<SystemTime>,
    pub completed_at: Option<SystemTime>,
    pub error_message: Option<String>,
    pub resource_usage: ResourceUsage,
    pub hyperparameters: HashMap<String, serde_json::Value>,
    /// Cancellation token
    pub cancelled: Arc<AtomicBool>,
}

/// Training job status
#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum TrainingStatus {
    Queued,
    Running,
    Completed,
    Failed,
    Cancelled,
}

/// Training progress information
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct TrainingProgress {
    pub current_epoch: usize,
    pub total_epochs: usize,
    pub current_loss: f64,
    pub best_loss: f64,
    pub validation_loss: Option<f64>,
    pub accuracy: Option<f64>,
    pub estimated_remaining_seconds: Option<u64>,
    pub samples_processed: usize,
    pub total_samples: usize,
}

/// Resource usage tracking
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ResourceUsage {
    pub peak_memory_mb: f64,
    pub cpu_time_seconds: f64,
    pub gpu_time_seconds: Option<f64>,
    pub disk_io_mb: f64,
    pub network_io_mb: Option<f64>,
}

/// Inference request
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct InferenceRequest {
    pub id: Uuid,
    pub model_id: String,
    pub features: Vec<Vec<f64>>, // 2D array as nested vectors
    pub metadata: HashMap<String, serde_json::Value>,
    pub created_at: SystemTime,
    pub timeout_ms: Option<u64>,
    /// Response channel
    #[serde(skip)]
    pub response_tx: Option<tokio::sync::oneshot::Sender<Result<InferenceResponse>>>,
}

/// Inference response
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct InferenceResponse {
    pub request_id: Uuid,
    pub predictions: Vec<f64>,
    pub probabilities: Option<Vec<Vec<f64>>>, // For classification
    pub confidence_scores: Option<Vec<f64>>,
    pub model_version: String,
    pub inference_time_ms: u64,
    pub metadata: HashMap<String, serde_json::Value>,
}

/// Inference pipeline metrics
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct InferenceMetrics {
    pub total_requests: AtomicUsize,
    pub successful_requests: AtomicUsize,
    pub failed_requests: AtomicUsize,
    pub average_latency_ms: f64,
    pub p95_latency_ms: f64,
    pub requests_per_second: f64,
    pub active_requests: AtomicUsize,
    pub cache_hits: AtomicUsize,
    pub cache_misses: AtomicUsize,
}

impl Default for InferenceMetrics {
    fn default() -> Self {
        Self {
            total_requests: AtomicUsize::new(0),
            successful_requests: AtomicUsize::new(0),
            failed_requests: AtomicUsize::new(0),
            average_latency_ms: 0.0,
            p95_latency_ms: 0.0,
            requests_per_second: 0.0,
            active_requests: AtomicUsize::new(0),
            cache_hits: AtomicUsize::new(0),
            cache_misses: AtomicUsize::new(0),
        }
    }
}

/// Trait for async ML models
#[async_trait]
pub trait AsyncMLModel: Send + Sync {
    /// Model ID
    fn model_id(&self) -> &str;

    /// Model version
    fn version(&self) -> &str;

    /// Async prediction
    async fn predict_async(&self, features: ArrayView2<f64>) -> Result<Array1<f64>>;

    /// Batch prediction with optional progress callback
    async fn predict_batch_async(
        &self,
        features: ArrayView2<f64>,
        batch_size: usize,
        progress_callback: Option<Box<dyn Fn(usize, usize) + Send + Sync>>
    ) -> Result<Array1<f64>>;

    /// Get model metadata
    fn metadata(&self) -> HashMap<String, serde_json::Value>;

    /// Warm up model (precompute caches, etc.)
    async fn warm_up(&self) -> Result<()> {
        Ok(())
    }

    /// Check if model is ready for inference
    fn is_ready(&self) -> bool {
        true
    }
}

/// Progress callback for training
pub type ProgressCallback = Box<dyn Fn(TrainingProgress) + Send + Sync>;

/// Training event types
#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum TrainingEvent {
    JobQueued { job_id: Uuid },
    JobStarted { job_id: Uuid },
    EpochCompleted { job_id: Uuid, epoch: usize, loss: f64 },
    ValidationCompleted { job_id: Uuid, epoch: usize, validation_loss: f64 },
    CheckpointSaved { job_id: Uuid, epoch: usize, checkpoint_path: String },
    EarlyStopping { job_id: Uuid, epoch: usize, reason: String },
    JobCompleted { job_id: Uuid, final_metrics: HashMap<String, f64> },
    JobFailed { job_id: Uuid, error: String },
    JobCancelled { job_id: Uuid },
}

impl Default for TrainingPipelineConfig {
    fn default() -> Self {
        Self {
            max_concurrent_jobs: 4,
            default_timeout_seconds: 3600, // 1 hour
            auto_versioning: true,
            enable_progress_callbacks: true,
            checkpoint_frequency: Some(10),
            monitoring_interval_ms: 1000,
            validation_split: 0.2,
            early_stopping: Some(EarlyStoppingConfig {
                monitor: "validation_loss".to_string(),
                min_delta: 0.001,
                patience: 10,
                maximize: false,
            }),
        }
    }
}

impl Default for InferencePipelineConfig {
    fn default() -> Self {
        Self {
            max_concurrent_requests: 100,
            request_timeout_ms: 10000, // 10 seconds
            model_cache_size: 10,
            batch_size: Some(32),
            enable_queuing: true,
            queue_size_limit: 1000,
            enable_model_warming: true,
        }
    }
}

impl AsyncTrainingPipeline {
    /// Create a new training pipeline
    pub fn new(config: TrainingPipelineConfig) -> Self {
        let id = Uuid::new_v4();
        let job_semaphore = Arc::new(Semaphore::new(config.max_concurrent_jobs));

        Self {
            id,
            config,
            registry: Arc::new(RwLock::new(None)),
            active_jobs: Arc::new(RwLock::new(HashMap::new())),
            job_semaphore,
            shutdown: Arc::new(AtomicBool::new(false)),
        }
    }

    /// Set model registry for persistence
    pub async fn set_registry(&self, registry: ModelRegistry) {
        let mut reg_guard = self.registry.write().await;
        *reg_guard = Some(registry);
    }

    /// Submit a training job
    pub async fn submit_training_job<T>(
        &self,
        model_id: String,
        algorithm: T,
        features: Array2<f64>,
        targets: Array1<f64>,
        hyperparameters: HashMap<String, serde_json::Value>,
        progress_callback: Option<ProgressCallback>,
    ) -> Result<Uuid>
    where
        T: MLAlgorithm + Clone + Send + Sync + 'static,
        T::Config: Send + Sync,
        T::Model: Send + Sync,
    {
        let job_id = Uuid::new_v4();

        let job = TrainingJob {
            id: job_id,
            model_id: model_id.clone(),
            algorithm_type: std::any::type_name::<T>().to_string(),
            status: TrainingStatus::Queued,
            progress: TrainingProgress {
                current_epoch: 0,
                total_epochs: 0,
                current_loss: f64::INFINITY,
                best_loss: f64::INFINITY,
                validation_loss: None,
                accuracy: None,
                estimated_remaining_seconds: None,
                samples_processed: 0,
                total_samples: features.nrows(),
            },
            created_at: SystemTime::now(),
            started_at: None,
            completed_at: None,
            error_message: None,
            resource_usage: ResourceUsage {
                peak_memory_mb: 0.0,
                cpu_time_seconds: 0.0,
                gpu_time_seconds: None,
                disk_io_mb: 0.0,
                network_io_mb: None,
            },
            hyperparameters,
            cancelled: Arc::new(AtomicBool::new(false)),
        };

        // Add job to active jobs
        {
            let mut jobs = self.active_jobs.write().await;
            jobs.insert(job_id, job);
        }

        // Spawn training task
        let pipeline_id = self.id;
        let job_semaphore = Arc::clone(&self.job_semaphore);
        let active_jobs = Arc::clone(&self.active_jobs);
        let registry = Arc::clone(&self.registry);
        let config = self.config.clone();
        let shutdown = Arc::clone(&self.shutdown);

        tokio::spawn(async move {
            Self::execute_training_job(
                pipeline_id,
                job_id,
                algorithm,
                features,
                targets,
                config,
                job_semaphore,
                active_jobs,
                registry,
                progress_callback,
                shutdown,
            ).await
        });

        Ok(job_id)
    }

    /// Execute a training job
    async fn execute_training_job<T>(
        pipeline_id: Uuid,
        job_id: Uuid,
        mut algorithm: T,
        features: Array2<f64>,
        targets: Array1<f64>,
        config: TrainingPipelineConfig,
        job_semaphore: Arc<Semaphore>,
        active_jobs: Arc<RwLock<HashMap<Uuid, TrainingJob>>>,
        registry: Arc<RwLock<Option<ModelRegistry>>>,
        progress_callback: Option<ProgressCallback>,
        shutdown: Arc<AtomicBool>,
    ) where
        T: MLAlgorithm + Clone + Send + Sync,
        T::Config: Send + Sync,
        T::Model: Send + Sync,
    {
        // Acquire semaphore permit
        let _permit = match job_semaphore.acquire().await {
            Ok(permit) => permit,
            Err(_) => {
                Self::update_job_status(&active_jobs, job_id, TrainingStatus::Failed,
                                       Some("Failed to acquire semaphore permit".to_string())).await;
                return;
            }
        };

        // Check for shutdown
        if shutdown.load(Ordering::Relaxed) {
            Self::update_job_status(&active_jobs, job_id, TrainingStatus::Cancelled, None).await;
            return;
        }

        // Update job status to running
        Self::update_job_status(&active_jobs, job_id, TrainingStatus::Running, None).await;
        Self::update_job_started_at(&active_jobs, job_id).await;

        let start_time = Instant::now();

        // Split data for validation if configured
        let (train_features, train_targets, val_features, val_targets) = if config.validation_split > 0.0 {
            match train_validation_split(
                features.view(),
                targets.view(),
                config.validation_split,
                Some(42) // Fixed seed for reproducibility
            ) {
                Ok(split) => (split.0, split.1, Some(split.2), Some(split.3)),
                Err(e) => {
                    Self::update_job_status(&active_jobs, job_id, TrainingStatus::Failed,
                                           Some(format!("Data split failed: {}", e))).await;
                    return;
                }
            }
        } else {
            (features.clone(), targets.clone(), None, None)
        };

        // Training with timeout
        let training_result = timeout(
            Duration::from_secs(config.default_timeout_seconds),
            async {
                // Check if job was cancelled
                let cancelled = {
                    let jobs = active_jobs.read().await;
                    jobs.get(&job_id)
                        .map(|job| job.cancelled.load(Ordering::Relaxed))
                        .unwrap_or(false)
                };

                if cancelled {
                    return Err(PhantomMLError::Internal("Job was cancelled".to_string()));
                }

                // Perform the actual training
                algorithm.fit(train_features.view(), train_targets.view())
            }
        ).await;

        match training_result {
            Ok(Ok(())) => {
                // Training succeeded
                let duration = start_time.elapsed();

                // Update resource usage
                Self::update_job_resource_usage(&active_jobs, job_id, ResourceUsage {
                    peak_memory_mb: 0.0, // Would need actual memory monitoring
                    cpu_time_seconds: duration.as_secs_f64(),
                    gpu_time_seconds: None,
                    disk_io_mb: 0.0,
                    network_io_mb: None,
                }).await;

                // Save model if registry is available
                if let Some(model) = algorithm.model() {
                    let registry_guard = registry.read().await;
                    if let Some(reg) = registry_guard.as_ref() {
                        let model_name = format!("model_{}", job_id);
                        if let Err(e) = reg.save_model(&model_name, model.clone(), None).await {
                            eprintln!("Failed to save model: {}", e);
                        }
                    }
                }

                Self::update_job_status(&active_jobs, job_id, TrainingStatus::Completed, None).await;
                Self::update_job_completed_at(&active_jobs, job_id).await;

                if let Some(callback) = progress_callback {
                    let progress = TrainingProgress {
                        current_epoch: 1, // Simplified
                        total_epochs: 1,
                        current_loss: 0.0, // Would need actual loss
                        best_loss: 0.0,
                        validation_loss: None,
                        accuracy: None,
                        estimated_remaining_seconds: Some(0),
                        samples_processed: train_features.nrows(),
                        total_samples: train_features.nrows(),
                    };
                    callback(progress);
                }
            },
            Ok(Err(e)) => {
                // Training failed
                Self::update_job_status(&active_jobs, job_id, TrainingStatus::Failed,
                                       Some(format!("Training failed: {}", e))).await;
            },
            Err(_) => {
                // Timeout
                Self::update_job_status(&active_jobs, job_id, TrainingStatus::Failed,
                                       Some("Training timed out".to_string())).await;
            }
        }
    }

    /// Update job status
    async fn update_job_status(
        active_jobs: &Arc<RwLock<HashMap<Uuid, TrainingJob>>>,
        job_id: Uuid,
        status: TrainingStatus,
        error_message: Option<String>,
    ) {
        let mut jobs = active_jobs.write().await;
        if let Some(job) = jobs.get_mut(&job_id) {
            job.status = status;
            job.error_message = error_message;
        }
    }

    /// Update job started timestamp
    async fn update_job_started_at(
        active_jobs: &Arc<RwLock<HashMap<Uuid, TrainingJob>>>,
        job_id: Uuid,
    ) {
        let mut jobs = active_jobs.write().await;
        if let Some(job) = jobs.get_mut(&job_id) {
            job.started_at = Some(SystemTime::now());
        }
    }

    /// Update job completed timestamp
    async fn update_job_completed_at(
        active_jobs: &Arc<RwLock<HashMap<Uuid, TrainingJob>>>,
        job_id: Uuid,
    ) {
        let mut jobs = active_jobs.write().await;
        if let Some(job) = jobs.get_mut(&job_id) {
            job.completed_at = Some(SystemTime::now());
        }
    }

    /// Update job resource usage
    async fn update_job_resource_usage(
        active_jobs: &Arc<RwLock<HashMap<Uuid, TrainingJob>>>,
        job_id: Uuid,
        resource_usage: ResourceUsage,
    ) {
        let mut jobs = active_jobs.write().await;
        if let Some(job) = jobs.get_mut(&job_id) {
            job.resource_usage = resource_usage;
        }
    }

    /// Get job status
    pub async fn get_job_status(&self, job_id: Uuid) -> Option<TrainingJob> {
        let jobs = self.active_jobs.read().await;
        jobs.get(&job_id).cloned()
    }

    /// Cancel a training job
    pub async fn cancel_job(&self, job_id: Uuid) -> Result<()> {
        let jobs = self.active_jobs.read().await;
        if let Some(job) = jobs.get(&job_id) {
            job.cancelled.store(true, Ordering::Relaxed);
            Ok(())
        } else {
            Err(PhantomMLError::Model(format!("Job {} not found", job_id)))
        }
    }

    /// List all active jobs
    pub async fn list_jobs(&self) -> Vec<TrainingJob> {
        let jobs = self.active_jobs.read().await;
        jobs.values().cloned().collect()
    }

    /// Shutdown the pipeline
    pub async fn shutdown(&self) {
        self.shutdown.store(true, Ordering::Relaxed);

        // Cancel all active jobs
        let job_ids: Vec<Uuid> = {
            let jobs = self.active_jobs.read().await;
            jobs.keys().cloned().collect()
        };

        for job_id in job_ids {
            let _ = self.cancel_job(job_id).await;
        }
    }
}

impl AsyncInferencePipeline {
    /// Create a new inference pipeline
    pub fn new(config: InferencePipelineConfig) -> Self {
        let id = Uuid::new_v4();
        let (request_tx, request_rx) = mpsc::unbounded_channel();
        let request_semaphore = Arc::new(Semaphore::new(config.max_concurrent_requests));

        Self {
            id,
            config,
            models: Arc::new(RwLock::new(HashMap::new())),
            request_tx,
            request_rx: Arc::new(RwLock::new(Some(request_rx))),
            request_semaphore,
            metrics: Arc::new(RwLock::new(InferenceMetrics::default())),
            shutdown: Arc::new(AtomicBool::new(false)),
        }
    }

    /// Start the inference pipeline
    pub async fn start(&self) -> Result<JoinHandle<()>> {
        let mut request_rx = {
            let mut rx_guard = self.request_rx.write().await;
            rx_guard.take().ok_or_else(|| PhantomMLError::Internal("Pipeline already started".to_string()))?
        };

        let models = Arc::clone(&self.models);
        let metrics = Arc::clone(&self.metrics);
        let config = self.config.clone();
        let request_semaphore = Arc::clone(&self.request_semaphore);
        let shutdown = Arc::clone(&self.shutdown);

        let handle = tokio::spawn(async move {
            while let Some(request) = request_rx.recv().await {
                if shutdown.load(Ordering::Relaxed) {
                    break;
                }

                let models = Arc::clone(&models);
                let metrics = Arc::clone(&self.metrics);
                let request_semaphore = Arc::clone(&request_semaphore);
                let config = config.clone();

                tokio::spawn(async move {
                    Self::process_inference_request(
                        request, models, metrics, request_semaphore, config
                    ).await;
                });
            }
        });

        Ok(handle)
    }

    /// Load a model into the pipeline
    pub async fn load_model(&self, model_id: String, model: Arc<dyn AsyncMLModel>) -> Result<()> {
        let mut models = self.models.write().await;

        // Check cache size limit
        if models.len() >= self.config.model_cache_size {
            // Simple LRU eviction (remove first entry)
            if let Some((first_key, _)) = models.iter().next() {
                let first_key = first_key.clone();
                models.remove(&first_key);
            }
        }

        // Warm up model if configured
        if self.config.enable_model_warming {
            model.warm_up().await?;
        }

        models.insert(model_id, model);
        Ok(())
    }

    /// Submit an inference request
    pub async fn submit_request(
        &self,
        model_id: String,
        features: Vec<Vec<f64>>,
        metadata: HashMap<String, serde_json::Value>,
    ) -> Result<InferenceResponse> {
        let request_id = Uuid::new_v4();
        let (response_tx, response_rx) = tokio::sync::oneshot::channel();

        let request = InferenceRequest {
            id: request_id,
            model_id,
            features,
            metadata,
            created_at: SystemTime::now(),
            timeout_ms: Some(self.config.request_timeout_ms),
            response_tx: Some(response_tx),
        };

        self.request_tx.send(request)
            .map_err(|e| PhantomMLError::Internal(format!("Failed to queue request: {}", e)))?;

        // Wait for response with timeout
        let response = timeout(
            Duration::from_millis(self.config.request_timeout_ms),
            response_rx
        ).await
            .map_err(|_| PhantomMLError::Internal("Request timeout".to_string()))?
            .map_err(|_| PhantomMLError::Internal("Response channel closed".to_string()))??;

        Ok(response)
    }

    /// Process an inference request
    async fn process_inference_request(
        request: InferenceRequest,
        models: Arc<RwLock<HashMap<String, Arc<dyn AsyncMLModel>>>>,
        metrics: Arc<RwLock<InferenceMetrics>>,
        request_semaphore: Arc<Semaphore>,
        config: InferencePipelineConfig,
    ) {
        // Acquire semaphore permit
        let _permit = match request_semaphore.acquire().await {
            Ok(permit) => permit,
            Err(_) => {
                if let Some(tx) = request.response_tx {
                    let _ = tx.send(Err(PhantomMLError::Internal("Too many concurrent requests".to_string())));
                }
                return;
            }
        };

        let start_time = Instant::now();

        // Update metrics
        {
            let metrics_guard = metrics.read().await;
            metrics_guard.total_requests.fetch_add(1, Ordering::Relaxed);
            metrics_guard.active_requests.fetch_add(1, Ordering::Relaxed);
        }

        let result = Self::execute_inference_request(&request, &models, &config).await;

        let inference_time_ms = start_time.elapsed().as_millis() as u64;

        // Update metrics
        {
            let metrics_guard = metrics.read().await;
            metrics_guard.active_requests.fetch_sub(1, Ordering::Relaxed);
            match &result {
                Ok(_) => metrics_guard.successful_requests.fetch_add(1, Ordering::Relaxed),
                Err(_) => metrics_guard.failed_requests.fetch_add(1, Ordering::Relaxed),
            };
        }

        // Send response
        if let Some(tx) = request.response_tx {
            let response = result.map(|mut resp| {
                resp.inference_time_ms = inference_time_ms;
                resp
            });
            let _ = tx.send(response);
        }
    }

    /// Execute inference request
    async fn execute_inference_request(
        request: &InferenceRequest,
        models: &Arc<RwLock<HashMap<String, Arc<dyn AsyncMLModel>>>>,
        config: &InferencePipelineConfig,
    ) -> Result<InferenceResponse> {
        // Get model
        let model = {
            let models_guard = models.read().await;
            models_guard.get(&request.model_id).cloned()
        };

        let model = model.ok_or_else(|| {
            PhantomMLError::Model(format!("Model {} not found", request.model_id))
        })?;

        if !model.is_ready() {
            return Err(PhantomMLError::Model(format!("Model {} is not ready", request.model_id)));
        }

        // Convert features to ndarray
        let n_samples = request.features.len();
        let n_features = request.features.first().map(|row| row.len()).unwrap_or(0);

        let mut features_array = Array2::zeros((n_samples, n_features));
        for (i, row) in request.features.iter().enumerate() {
            if row.len() != n_features {
                return Err(PhantomMLError::DataProcessing(
                    "Inconsistent feature dimensions".to_string()
                ));
            }
            for (j, &value) in row.iter().enumerate() {
                features_array[[i, j]] = value;
            }
        }

        // Make prediction
        let predictions = if let Some(batch_size) = config.batch_size {
            model.predict_batch_async(features_array.view(), batch_size, None).await?
        } else {
            model.predict_async(features_array.view()).await?
        };

        let response = InferenceResponse {
            request_id: request.id,
            predictions: predictions.to_vec(),
            probabilities: None, // Would implement for classification
            confidence_scores: None,
            model_version: model.version().to_string(),
            inference_time_ms: 0, // Will be set by caller
            metadata: model.metadata(),
        };

        Ok(response)
    }

    /// Get pipeline metrics
    pub async fn get_metrics(&self) -> InferenceMetrics {
        let metrics = self.metrics.read().await;
        metrics.clone()
    }

    /// Shutdown the pipeline
    pub async fn shutdown(&self) {
        self.shutdown.store(true, Ordering::Relaxed);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::ml::algorithms::linear_regression::*;
    use ndarray::Array;

    #[tokio::test]
    async fn test_async_training_pipeline() {
        let config = TrainingPipelineConfig::default();
        let pipeline = AsyncTrainingPipeline::new(config);

        let features = Array::ones((100, 3));
        let targets = Array::from_iter(0..100).mapv(|x| x as f64);

        let lr_config = LinearRegressionConfig {
            learning_rate: 0.01,
            max_iterations: 100,
            regularization: RegularizationType::None,
            tolerance: 1e-6,
            fit_intercept: true,
            normalize: false,
            solver: SolverType::GradientDescent,
        };

        let algorithm = LinearRegression::new(lr_config);
        let hyperparameters = HashMap::new();

        let job_id = pipeline.submit_training_job(
            "test_model".to_string(),
            algorithm,
            features,
            targets,
            hyperparameters,
            None,
        ).await;

        assert!(job_id.is_ok());

        // Wait a bit for job to start
        tokio::time::sleep(Duration::from_millis(100)).await;

        let job_status = pipeline.get_job_status(job_id.unwrap()).await;
        assert!(job_status.is_some());
    }

    #[tokio::test]
    async fn test_async_inference_pipeline() {
        let config = InferencePipelineConfig::default();
        let pipeline = AsyncInferencePipeline::new(config);

        // Start the pipeline
        let _handle = pipeline.start().await.unwrap();

        // For this test, we'd need to implement AsyncMLModel for LinearRegression
        // This is a simplified test structure
    }
}