# Distributed Transaction Patterns for Phantom ML Core

## Saga Pattern Implementation

### ML Model Training Saga
The ML model training process involves multiple services and requires coordination between training service, model service, and audit service.

```rust
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use uuid::Uuid;
use tokio::time::{sleep, Duration};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SagaEvent {
    TrainingRequested {
        saga_id: Uuid,
        model_id: Uuid,
        tenant_id: String,
        config: TrainingConfig,
    },
    ModelReserved {
        saga_id: Uuid,
        model_id: Uuid,
        reservation_id: Uuid,
    },
    ResourcesAllocated {
        saga_id: Uuid,
        resource_allocation_id: Uuid,
        compute_nodes: Vec<String>,
    },
    TrainingStarted {
        saga_id: Uuid,
        training_job_id: Uuid,
        started_at: chrono::DateTime<chrono::Utc>,
    },
    TrainingCompleted {
        saga_id: Uuid,
        training_job_id: Uuid,
        model_artifacts: ModelArtifacts,
        metrics: TrainingMetrics,
    },
    ModelUpdated {
        saga_id: Uuid,
        model_id: Uuid,
        new_version: String,
    },
    AuditLogged {
        saga_id: Uuid,
        audit_id: Uuid,
    },
    SagaCompleted {
        saga_id: Uuid,
    },
    // Compensation events
    TrainingCancelled {
        saga_id: Uuid,
        reason: String,
    },
    ResourcesReleased {
        saga_id: Uuid,
        resource_allocation_id: Uuid,
    },
    ModelReservationReleased {
        saga_id: Uuid,
        model_id: Uuid,
        reservation_id: Uuid,
    },
}

#[derive(Debug, Clone)]
pub struct SagaStep {
    pub step_id: String,
    pub service_name: String,
    pub action: String,
    pub compensation_action: Option<String>,
    pub timeout_ms: u64,
    pub retry_count: u32,
    pub idempotency_key: String,
}

pub struct TrainingModelSaga {
    saga_id: Uuid,
    steps: Vec<SagaStep>,
    completed_steps: Vec<String>,
    current_step: usize,
    saga_state: SagaState,
    event_store: Arc<dyn EventStore>,
    compensation_stack: Vec<SagaStep>,
}

#[derive(Debug, Clone, PartialEq)]
pub enum SagaState {
    NotStarted,
    InProgress,
    Completed,
    Failed,
    Compensating,
    Compensated,
}

impl TrainingModelSaga {
    pub fn new(saga_id: Uuid, event_store: Arc<dyn EventStore>) -> Self {
        let steps = vec![
            SagaStep {
                step_id: "reserve_model".to_string(),
                service_name: "model_service".to_string(),
                action: "reserve_for_training".to_string(),
                compensation_action: Some("release_reservation".to_string()),
                timeout_ms: 5000,
                retry_count: 3,
                idempotency_key: format!("{}-reserve-model", saga_id),
            },
            SagaStep {
                step_id: "allocate_resources".to_string(),
                service_name: "resource_service".to_string(),
                action: "allocate_training_resources".to_string(),
                compensation_action: Some("release_resources".to_string()),
                timeout_ms: 30000,
                retry_count: 2,
                idempotency_key: format!("{}-allocate-resources", saga_id),
            },
            SagaStep {
                step_id: "start_training".to_string(),
                service_name: "training_service".to_string(),
                action: "start_training_job".to_string(),
                compensation_action: Some("cancel_training_job".to_string()),
                timeout_ms: 3600000, // 1 hour
                retry_count: 1,
                idempotency_key: format!("{}-start-training", saga_id),
            },
            SagaStep {
                step_id: "update_model".to_string(),
                service_name: "model_service".to_string(),
                action: "update_model_with_artifacts".to_string(),
                compensation_action: Some("revert_model_update".to_string()),
                timeout_ms: 10000,
                retry_count: 3,
                idempotency_key: format!("{}-update-model", saga_id),
            },
            SagaStep {
                step_id: "log_audit".to_string(),
                service_name: "audit_service".to_string(),
                action: "log_training_completion".to_string(),
                compensation_action: None, // Audit logs are immutable
                timeout_ms: 5000,
                retry_count: 3,
                idempotency_key: format!("{}-log-audit", saga_id),
            },
        ];

        Self {
            saga_id,
            steps,
            completed_steps: Vec::new(),
            current_step: 0,
            saga_state: SagaState::NotStarted,
            event_store,
            compensation_stack: Vec::new(),
        }
    }

    pub async fn execute(&mut self, context: SagaExecutionContext) -> Result<SagaResult, SagaError> {
        self.saga_state = SagaState::InProgress;

        // Persist saga start event
        self.event_store.append_event(SagaEvent::TrainingRequested {
            saga_id: self.saga_id,
            model_id: context.model_id,
            tenant_id: context.tenant_id,
            config: context.training_config,
        }).await?;

        // Execute saga steps
        while self.current_step < self.steps.len() {
            let step = &self.steps[self.current_step].clone();

            match self.execute_step(step, &context).await {
                Ok(step_result) => {
                    self.completed_steps.push(step.step_id.clone());
                    self.compensation_stack.push(step.clone());
                    self.current_step += 1;

                    // Persist step completion
                    self.persist_step_completion(&step, &step_result).await?;
                }
                Err(step_error) => {
                    // Start compensation
                    self.saga_state = SagaState::Compensating;
                    self.compensate().await?;
                    self.saga_state = SagaState::Compensated;

                    return Err(SagaError::StepFailed {
                        step_id: step.step_id.clone(),
                        error: step_error.to_string(),
                    });
                }
            }
        }

        self.saga_state = SagaState::Completed;

        // Persist saga completion
        self.event_store.append_event(SagaEvent::SagaCompleted {
            saga_id: self.saga_id,
        }).await?;

        Ok(SagaResult {
            saga_id: self.saga_id,
            status: SagaState::Completed,
            completed_steps: self.completed_steps.clone(),
            execution_time_ms: 0, // Calculate actual time
        })
    }

    async fn execute_step(
        &self,
        step: &SagaStep,
        context: &SagaExecutionContext,
    ) -> Result<StepResult, StepError> {
        let mut retry_count = 0;

        while retry_count <= step.retry_count {
            match self.call_service_step(step, context).await {
                Ok(result) => return Ok(result),
                Err(error) => {
                    retry_count += 1;
                    if retry_count <= step.retry_count {
                        let backoff_ms = 1000 * retry_count as u64; // Exponential backoff
                        sleep(Duration::from_millis(backoff_ms)).await;
                    } else {
                        return Err(error);
                    }
                }
            }
        }

        unreachable!()
    }

    async fn call_service_step(
        &self,
        step: &SagaStep,
        context: &SagaExecutionContext,
    ) -> Result<StepResult, StepError> {
        match step.service_name.as_str() {
            "model_service" => {
                match step.action.as_str() {
                    "reserve_for_training" => {
                        // Call model service to reserve model for training
                        let reservation_result = ModelServiceClient::new()
                            .reserve_model_for_training(
                                &context.model_id.to_string(),
                                &context.tenant_id,
                                &step.idempotency_key,
                            ).await?;

                        Ok(StepResult {
                            step_id: step.step_id.clone(),
                            data: serde_json::to_value(reservation_result)?,
                        })
                    }
                    "update_model_with_artifacts" => {
                        // Update model with training artifacts
                        let update_result = ModelServiceClient::new()
                            .update_model_artifacts(
                                &context.model_id.to_string(),
                                &context.tenant_id,
                                &context.training_artifacts,
                                &step.idempotency_key,
                            ).await?;

                        Ok(StepResult {
                            step_id: step.step_id.clone(),
                            data: serde_json::to_value(update_result)?,
                        })
                    }
                    _ => Err(StepError::UnsupportedAction(step.action.clone())),
                }
            }
            "training_service" => {
                match step.action.as_str() {
                    "start_training_job" => {
                        let training_result = TrainingServiceClient::new()
                            .start_training_job(
                                &context.training_config,
                                &context.tenant_id,
                                &step.idempotency_key,
                            ).await?;

                        Ok(StepResult {
                            step_id: step.step_id.clone(),
                            data: serde_json::to_value(training_result)?,
                        })
                    }
                    _ => Err(StepError::UnsupportedAction(step.action.clone())),
                }
            }
            "resource_service" => {
                match step.action.as_str() {
                    "allocate_training_resources" => {
                        let allocation_result = ResourceServiceClient::new()
                            .allocate_resources(
                                &context.resource_requirements,
                                &context.tenant_id,
                                &step.idempotency_key,
                            ).await?;

                        Ok(StepResult {
                            step_id: step.step_id.clone(),
                            data: serde_json::to_value(allocation_result)?,
                        })
                    }
                    _ => Err(StepError::UnsupportedAction(step.action.clone())),
                }
            }
            "audit_service" => {
                match step.action.as_str() {
                    "log_training_completion" => {
                        let audit_result = AuditServiceClient::new()
                            .log_training_completion(
                                &self.saga_id.to_string(),
                                &context.model_id.to_string(),
                                &context.tenant_id,
                                &step.idempotency_key,
                            ).await?;

                        Ok(StepResult {
                            step_id: step.step_id.clone(),
                            data: serde_json::to_value(audit_result)?,
                        })
                    }
                    _ => Err(StepError::UnsupportedAction(step.action.clone())),
                }
            }
            _ => Err(StepError::UnsupportedService(step.service_name.clone())),
        }
    }

    async fn compensate(&mut self) -> Result<(), SagaError> {
        // Execute compensation actions in reverse order
        while let Some(step) = self.compensation_stack.pop() {
            if let Some(compensation_action) = step.compensation_action {
                let compensation_step = SagaStep {
                    step_id: format!("{}_compensation", step.step_id),
                    service_name: step.service_name.clone(),
                    action: compensation_action,
                    compensation_action: None,
                    timeout_ms: step.timeout_ms,
                    retry_count: step.retry_count,
                    idempotency_key: format!("{}_comp", step.idempotency_key),
                };

                // Execute compensation with retries
                match self.execute_compensation_step(&compensation_step).await {
                    Ok(_) => {
                        // Persist compensation completion
                        self.persist_compensation_completion(&compensation_step).await?;
                    }
                    Err(error) => {
                        // Log compensation failure but continue with other compensations
                        log::error!(
                            "Compensation failed for step {}: {}",
                            step.step_id,
                            error
                        );

                        // In a real system, you might want to trigger alerts
                        // or manual intervention for failed compensations
                    }
                }
            }
        }

        Ok(())
    }

    async fn execute_compensation_step(
        &self,
        step: &SagaStep,
    ) -> Result<(), StepError> {
        match step.service_name.as_str() {
            "model_service" => {
                match step.action.as_str() {
                    "release_reservation" => {
                        ModelServiceClient::new()
                            .release_model_reservation(&step.idempotency_key)
                            .await?;
                    }
                    "revert_model_update" => {
                        ModelServiceClient::new()
                            .revert_model_update(&step.idempotency_key)
                            .await?;
                    }
                    _ => return Err(StepError::UnsupportedAction(step.action.clone())),
                }
            }
            "training_service" => {
                match step.action.as_str() {
                    "cancel_training_job" => {
                        TrainingServiceClient::new()
                            .cancel_training_job(&step.idempotency_key)
                            .await?;
                    }
                    _ => return Err(StepError::UnsupportedAction(step.action.clone())),
                }
            }
            "resource_service" => {
                match step.action.as_str() {
                    "release_resources" => {
                        ResourceServiceClient::new()
                            .release_resources(&step.idempotency_key)
                            .await?;
                    }
                    _ => return Err(StepError::UnsupportedAction(step.action.clone())),
                }
            }
            _ => return Err(StepError::UnsupportedService(step.service_name.clone())),
        }

        Ok(())
    }

    async fn persist_step_completion(
        &self,
        step: &SagaStep,
        result: &StepResult,
    ) -> Result<(), SagaError> {
        // Persist step completion to event store
        match step.step_id.as_str() {
            "reserve_model" => {
                self.event_store.append_event(SagaEvent::ModelReserved {
                    saga_id: self.saga_id,
                    model_id: Uuid::new_v4(), // Extract from result
                    reservation_id: Uuid::new_v4(), // Extract from result
                }).await?;
            }
            "allocate_resources" => {
                self.event_store.append_event(SagaEvent::ResourcesAllocated {
                    saga_id: self.saga_id,
                    resource_allocation_id: Uuid::new_v4(), // Extract from result
                    compute_nodes: vec![], // Extract from result
                }).await?;
            }
            "start_training" => {
                self.event_store.append_event(SagaEvent::TrainingStarted {
                    saga_id: self.saga_id,
                    training_job_id: Uuid::new_v4(), // Extract from result
                    started_at: chrono::Utc::now(),
                }).await?;
            }
            "update_model" => {
                self.event_store.append_event(SagaEvent::ModelUpdated {
                    saga_id: self.saga_id,
                    model_id: Uuid::new_v4(), // Extract from result
                    new_version: "1.1.0".to_string(), // Extract from result
                }).await?;
            }
            "log_audit" => {
                self.event_store.append_event(SagaEvent::AuditLogged {
                    saga_id: self.saga_id,
                    audit_id: Uuid::new_v4(), // Extract from result
                }).await?;
            }
            _ => {}
        }

        Ok(())
    }

    async fn persist_compensation_completion(
        &self,
        step: &SagaStep,
    ) -> Result<(), SagaError> {
        // Log compensation completion for audit purposes
        log::info!(
            "Compensation completed for saga {} step {}",
            self.saga_id,
            step.step_id
        );
        Ok(())
    }
}

// Supporting types and traits
#[derive(Debug, Clone)]
pub struct SagaExecutionContext {
    pub model_id: Uuid,
    pub tenant_id: String,
    pub training_config: TrainingConfig,
    pub resource_requirements: ResourceRequirements,
    pub training_artifacts: TrainingArtifacts,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrainingConfig {
    pub algorithm: String,
    pub hyperparameters: HashMap<String, serde_json::Value>,
    pub dataset_uri: String,
    pub validation_split: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourceRequirements {
    pub cpu_cores: u32,
    pub memory_gb: u32,
    pub gpu_count: u32,
    pub storage_gb: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrainingArtifacts {
    pub model_binary_uri: String,
    pub metadata: HashMap<String, String>,
    pub metrics: HashMap<String, f64>,
}

#[derive(Debug)]
pub struct StepResult {
    pub step_id: String,
    pub data: serde_json::Value,
}

#[derive(Debug)]
pub struct SagaResult {
    pub saga_id: Uuid,
    pub status: SagaState,
    pub completed_steps: Vec<String>,
    pub execution_time_ms: u64,
}

#[derive(Debug, thiserror::Error)]
pub enum SagaError {
    #[error("Step {step_id} failed: {error}")]
    StepFailed { step_id: String, error: String },

    #[error("Event store error: {0}")]
    EventStoreError(String),

    #[error("Serialization error: {0}")]
    SerializationError(#[from] serde_json::Error),
}

#[derive(Debug, thiserror::Error)]
pub enum StepError {
    #[error("Unsupported service: {0}")]
    UnsupportedService(String),

    #[error("Unsupported action: {0}")]
    UnsupportedAction(String),

    #[error("Service call failed: {0}")]
    ServiceCallFailed(String),

    #[error("Timeout occurred")]
    Timeout,

    #[error("Serialization error: {0}")]
    SerializationError(#[from] serde_json::Error),
}

// Event Store trait for persistence
#[async_trait::async_trait]
pub trait EventStore: Send + Sync {
    async fn append_event(&self, event: SagaEvent) -> Result<(), String>;
    async fn get_events_for_saga(&self, saga_id: Uuid) -> Result<Vec<SagaEvent>, String>;
}
```

## Two-Phase Commit (2PC) for Critical Operations

For operations requiring strong consistency across multiple services, we implement a 2PC coordinator:

```rust
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;
use uuid::Uuid;

pub struct TwoPhaseCommitCoordinator {
    participants: Vec<Arc<dyn TransactionParticipant>>,
    transaction_log: Arc<Mutex<HashMap<Uuid, TransactionState>>>,
    timeout_ms: u64,
}

#[derive(Debug, Clone, PartialEq)]
pub enum TransactionState {
    Preparing,
    Prepared,
    Committed,
    Aborted,
    Unknown,
}

#[derive(Debug, Clone)]
pub struct TransactionContext {
    pub transaction_id: Uuid,
    pub tenant_id: String,
    pub operation_type: String,
    pub data: serde_json::Value,
    pub timeout_ms: u64,
}

#[async_trait::async_trait]
pub trait TransactionParticipant: Send + Sync {
    fn service_name(&self) -> &str;

    async fn prepare(&self, context: &TransactionContext) -> Result<PrepareResponse, TransactionError>;
    async fn commit(&self, context: &TransactionContext) -> Result<CommitResponse, TransactionError>;
    async fn abort(&self, context: &TransactionContext) -> Result<AbortResponse, TransactionError>;
}

impl TwoPhaseCommitCoordinator {
    pub fn new(participants: Vec<Arc<dyn TransactionParticipant>>, timeout_ms: u64) -> Self {
        Self {
            participants,
            transaction_log: Arc::new(Mutex::new(HashMap::new())),
            timeout_ms,
        }
    }

    pub async fn execute_transaction(
        &self,
        context: TransactionContext,
    ) -> Result<TransactionResult, TransactionError> {
        let transaction_id = context.transaction_id;

        // Phase 1: Prepare
        {
            let mut log = self.transaction_log.lock().await;
            log.insert(transaction_id, TransactionState::Preparing);
        }

        let prepare_results = self.prepare_phase(&context).await;

        // Check if all participants voted YES
        let all_prepared = prepare_results.iter().all(|result| result.is_ok());

        if all_prepared {
            // Phase 2: Commit
            {
                let mut log = self.transaction_log.lock().await;
                log.insert(transaction_id, TransactionState::Prepared);
            }

            let commit_results = self.commit_phase(&context).await;

            {
                let mut log = self.transaction_log.lock().await;
                log.insert(transaction_id, TransactionState::Committed);
            }

            Ok(TransactionResult {
                transaction_id,
                state: TransactionState::Committed,
                participant_results: commit_results,
            })
        } else {
            // Phase 2: Abort
            {
                let mut log = self.transaction_log.lock().await;
                log.insert(transaction_id, TransactionState::Aborted);
            }

            let abort_results = self.abort_phase(&context).await;

            Err(TransactionError::TransactionAborted {
                transaction_id,
                prepare_failures: prepare_results
                    .into_iter()
                    .filter_map(|r| r.err())
                    .collect(),
            })
        }
    }

    async fn prepare_phase(
        &self,
        context: &TransactionContext,
    ) -> Vec<Result<PrepareResponse, TransactionError>> {
        let mut handles = Vec::new();

        for participant in &self.participants {
            let participant = Arc::clone(participant);
            let context = context.clone();

            handles.push(tokio::spawn(async move {
                tokio::time::timeout(
                    Duration::from_millis(context.timeout_ms),
                    participant.prepare(&context),
                ).await
                .unwrap_or(Err(TransactionError::Timeout {
                    service: participant.service_name().to_string(),
                    transaction_id: context.transaction_id,
                }))
            }));
        }

        let mut results = Vec::new();
        for handle in handles {
            match handle.await {
                Ok(result) => results.push(result),
                Err(_) => results.push(Err(TransactionError::ParticipantUnavailable)),
            }
        }

        results
    }

    async fn commit_phase(
        &self,
        context: &TransactionContext,
    ) -> Vec<Result<CommitResponse, TransactionError>> {
        let mut handles = Vec::new();

        for participant in &self.participants {
            let participant = Arc::clone(participant);
            let context = context.clone();

            handles.push(tokio::spawn(async move {
                participant.commit(&context).await
            }));
        }

        let mut results = Vec::new();
        for handle in handles {
            match handle.await {
                Ok(result) => results.push(result),
                Err(_) => results.push(Err(TransactionError::ParticipantUnavailable)),
            }
        }

        results
    }

    async fn abort_phase(
        &self,
        context: &TransactionContext,
    ) -> Vec<Result<AbortResponse, TransactionError>> {
        let mut handles = Vec::new();

        for participant in &self.participants {
            let participant = Arc::clone(participant);
            let context = context.clone();

            handles.push(tokio::spawn(async move {
                participant.abort(&context).await
            }));
        }

        let mut results = Vec::new();
        for handle in handles {
            match handle.await {
                Ok(result) => results.push(result),
                Err(_) => results.push(Err(TransactionError::ParticipantUnavailable)),
            }
        }

        results
    }
}

// Example participant implementation for Model Service
pub struct ModelServiceParticipant {
    service_name: String,
    database_pool: Arc<PgPool>,
}

#[async_trait::async_trait]
impl TransactionParticipant for ModelServiceParticipant {
    fn service_name(&self) -> &str {
        &self.service_name
    }

    async fn prepare(&self, context: &TransactionContext) -> Result<PrepareResponse, TransactionError> {
        // Acquire locks and validate transaction can be committed
        let mut tx = self.database_pool.begin().await
            .map_err(|e| TransactionError::DatabaseError(e.to_string()))?;

        // Example: Prepare model update
        match context.operation_type.as_str() {
            "update_model" => {
                let model_id = context.data["model_id"].as_str()
                    .ok_or(TransactionError::InvalidData("Missing model_id".to_string()))?;

                // Lock the model record
                sqlx::query!(
                    "SELECT id FROM models WHERE id = $1 AND tenant_id = $2 FOR UPDATE",
                    model_id,
                    context.tenant_id
                ).fetch_one(&mut tx).await
                .map_err(|e| TransactionError::DatabaseError(e.to_string()))?;

                // Validate business rules
                if !self.validate_model_update_rules(&context.data).await? {
                    return Ok(PrepareResponse::Abort {
                        reason: "Business rule validation failed".to_string(),
                    });
                }

                // Keep transaction open but don't commit yet
                // Store transaction handle for commit/abort phase
                self.store_prepared_transaction(context.transaction_id, tx).await?;

                Ok(PrepareResponse::Prepared {
                    participant: self.service_name.clone(),
                    resource_locks: vec![format!("model:{}", model_id)],
                })
            }
            _ => Err(TransactionError::UnsupportedOperation(context.operation_type.clone())),
        }
    }

    async fn commit(&self, context: &TransactionContext) -> Result<CommitResponse, TransactionError> {
        // Retrieve stored transaction and commit
        let tx = self.get_prepared_transaction(context.transaction_id).await?;

        match context.operation_type.as_str() {
            "update_model" => {
                let model_id = context.data["model_id"].as_str().unwrap();
                let new_version = context.data["version"].as_str().unwrap();

                sqlx::query!(
                    "UPDATE models SET version = $1, updated_at = NOW() WHERE id = $2",
                    new_version,
                    model_id
                ).execute(&tx).await
                .map_err(|e| TransactionError::DatabaseError(e.to_string()))?;

                tx.commit().await
                    .map_err(|e| TransactionError::DatabaseError(e.to_string()))?;

                Ok(CommitResponse::Committed {
                    participant: self.service_name.clone(),
                    resources_updated: vec![format!("model:{}", model_id)],
                })
            }
            _ => Err(TransactionError::UnsupportedOperation(context.operation_type.clone())),
        }
    }

    async fn abort(&self, context: &TransactionContext) -> Result<AbortResponse, TransactionError> {
        // Retrieve stored transaction and rollback
        let tx = self.get_prepared_transaction(context.transaction_id).await?;

        tx.rollback().await
            .map_err(|e| TransactionError::DatabaseError(e.to_string()))?;

        Ok(AbortResponse::Aborted {
            participant: self.service_name.clone(),
            resources_released: vec!["model locks".to_string()],
        })
    }
}

impl ModelServiceParticipant {
    async fn validate_model_update_rules(&self, data: &serde_json::Value) -> Result<bool, TransactionError> {
        // Implement business rule validation
        // For example: Check if model is not currently being trained
        // Check version compatibility, etc.
        Ok(true)
    }

    async fn store_prepared_transaction(&self, transaction_id: Uuid, tx: sqlx::Transaction<'_, sqlx::Postgres>) -> Result<(), TransactionError> {
        // Store transaction handle for later commit/abort
        // In a real implementation, you'd need a proper transaction manager
        Ok(())
    }

    async fn get_prepared_transaction(&self, transaction_id: Uuid) -> Result<sqlx::Transaction<'_, sqlx::Postgres>, TransactionError> {
        // Retrieve stored transaction handle
        // This is simplified - in practice you'd need proper transaction state management
        todo!("Implement transaction handle storage/retrieval")
    }
}

// Supporting types
#[derive(Debug, Clone)]
pub enum PrepareResponse {
    Prepared {
        participant: String,
        resource_locks: Vec<String>,
    },
    Abort {
        reason: String,
    },
}

#[derive(Debug, Clone)]
pub struct CommitResponse {
    participant: String,
    resources_updated: Vec<String>,
}

#[derive(Debug, Clone)]
pub struct AbortResponse {
    participant: String,
    resources_released: Vec<String>,
}

#[derive(Debug)]
pub struct TransactionResult {
    pub transaction_id: Uuid,
    pub state: TransactionState,
    pub participant_results: Vec<Result<CommitResponse, TransactionError>>,
}

#[derive(Debug, thiserror::Error)]
pub enum TransactionError {
    #[error("Transaction {transaction_id} aborted due to prepare failures")]
    TransactionAborted {
        transaction_id: Uuid,
        prepare_failures: Vec<TransactionError>,
    },

    #[error("Timeout in service {service} for transaction {transaction_id}")]
    Timeout {
        service: String,
        transaction_id: Uuid,
    },

    #[error("Participant unavailable")]
    ParticipantUnavailable,

    #[error("Database error: {0}")]
    DatabaseError(String),

    #[error("Invalid data: {0}")]
    InvalidData(String),

    #[error("Unsupported operation: {0}")]
    UnsupportedOperation(String),
}
```

## Transaction Pattern Selection Guidelines

### Use Saga Pattern When:
- **Long-running transactions** (model training, batch processing)
- **Multiple autonomous services** involved
- **Business process** spans multiple bounded contexts
- **Eventual consistency** is acceptable
- **Compensation logic** can be implemented

### Use 2PC Pattern When:
- **Strong consistency** is required
- **Short-duration transactions** (seconds, not minutes/hours)
- **ACID properties** are critical
- **Small number of participants** (2-4 services)
- **All participants support XA transactions**

### Hybrid Approach:
```rust
pub enum TransactionPattern {
    Saga {
        saga_type: SagaType,
        compensation_strategy: CompensationStrategy,
    },
    TwoPhaseCommit {
        participants: Vec<String>,
        timeout_ms: u64,
    },
    EventualConsistency {
        reconciliation_interval_ms: u64,
        conflict_resolution_strategy: ConflictResolution,
    },
}

impl TransactionCoordinator {
    pub fn select_pattern(
        &self,
        operation_type: &str,
        participants: &[String],
        consistency_requirements: ConsistencyLevel,
        duration_estimate_ms: u64,
    ) -> TransactionPattern {
        match (consistency_requirements, duration_estimate_ms, participants.len()) {
            (ConsistencyLevel::Strong, duration_ms, participant_count)
                if duration_ms < 10000 && participant_count <= 4 => {
                TransactionPattern::TwoPhaseCommit {
                    participants: participants.to_vec(),
                    timeout_ms: duration_ms * 2, // 2x estimated duration
                }
            }
            (ConsistencyLevel::Eventual, _, _) => {
                TransactionPattern::Saga {
                    saga_type: self.determine_saga_type(operation_type),
                    compensation_strategy: CompensationStrategy::Automatic,
                }
            }
            _ => {
                TransactionPattern::EventualConsistency {
                    reconciliation_interval_ms: 60000, // 1 minute
                    conflict_resolution_strategy: ConflictResolution::LastWriteWins,
                }
            }
        }
    }
}
```

This comprehensive distributed transaction implementation provides the foundation for maintaining data consistency across the microservices architecture while balancing performance and reliability requirements.