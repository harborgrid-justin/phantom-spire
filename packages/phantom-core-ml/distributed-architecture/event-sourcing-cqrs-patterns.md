# Event Sourcing and CQRS Patterns for Phantom ML Core

## Event Sourcing Architecture

### Core Event Store Design

```rust
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use std::collections::HashMap;
use async_trait::async_trait;

/// Base event trait that all domain events must implement
#[async_trait]
pub trait DomainEvent: Send + Sync + Clone {
    fn event_type(&self) -> &str;
    fn aggregate_id(&self) -> &str;
    fn aggregate_version(&self) -> u64;
    fn event_data(&self) -> serde_json::Value;
    fn metadata(&self) -> &HashMap<String, String>;
    fn occurred_at(&self) -> DateTime<Utc>;
}

/// Event envelope for storage
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EventEnvelope {
    pub event_id: Uuid,
    pub aggregate_id: String,
    pub aggregate_type: String,
    pub event_type: String,
    pub event_version: u32,
    pub aggregate_version: u64,
    pub event_data: serde_json::Value,
    pub metadata: HashMap<String, String>,
    pub occurred_at: DateTime<Utc>,
    pub recorded_at: DateTime<Utc>,
    pub tenant_id: String,
    pub causation_id: Option<Uuid>, // What caused this event
    pub correlation_id: Option<Uuid>, // Groups related events
}

/// Event store interface
#[async_trait]
pub trait EventStore: Send + Sync {
    async fn append_events(
        &self,
        aggregate_id: &str,
        expected_version: u64,
        events: Vec<EventEnvelope>,
    ) -> Result<u64, EventStoreError>;

    async fn load_events(
        &self,
        aggregate_id: &str,
        from_version: Option<u64>,
        to_version: Option<u64>,
    ) -> Result<Vec<EventEnvelope>, EventStoreError>;

    async fn load_events_by_type(
        &self,
        event_type: &str,
        from_time: Option<DateTime<Utc>>,
        to_time: Option<DateTime<Utc>>,
    ) -> Result<Vec<EventEnvelope>, EventStoreError>;

    async fn subscribe_to_events(
        &self,
        subscription_name: &str,
        event_types: Vec<String>,
    ) -> Result<Box<dyn EventSubscription>, EventStoreError>;

    async fn create_snapshot(
        &self,
        aggregate_id: &str,
        aggregate_version: u64,
        snapshot_data: serde_json::Value,
    ) -> Result<(), EventStoreError>;

    async fn load_snapshot(
        &self,
        aggregate_id: &str,
    ) -> Result<Option<SnapshotEnvelope>, EventStoreError>;
}

/// PostgreSQL Event Store Implementation
pub struct PostgreSqlEventStore {
    pool: Arc<PgPool>,
    tenant_id: String,
}

impl PostgreSqlEventStore {
    pub fn new(pool: Arc<PgPool>, tenant_id: String) -> Self {
        Self { pool, tenant_id }
    }

    /// Initialize event store tables
    pub async fn initialize(&self) -> Result<(), EventStoreError> {
        sqlx::query(r#"
            CREATE TABLE IF NOT EXISTS event_store (
                event_id UUID PRIMARY KEY,
                tenant_id VARCHAR(255) NOT NULL,
                aggregate_id VARCHAR(255) NOT NULL,
                aggregate_type VARCHAR(255) NOT NULL,
                event_type VARCHAR(255) NOT NULL,
                event_version INTEGER NOT NULL,
                aggregate_version BIGINT NOT NULL,
                event_data JSONB NOT NULL,
                metadata JSONB NOT NULL DEFAULT '{}',
                occurred_at TIMESTAMPTZ NOT NULL,
                recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                causation_id UUID,
                correlation_id UUID,
                UNIQUE(tenant_id, aggregate_id, aggregate_version)
            ) PARTITION BY HASH (tenant_id);

            CREATE INDEX IF NOT EXISTS idx_event_store_aggregate
            ON event_store (tenant_id, aggregate_id, aggregate_version);

            CREATE INDEX IF NOT EXISTS idx_event_store_type_time
            ON event_store (tenant_id, event_type, occurred_at);

            CREATE INDEX IF NOT EXISTS idx_event_store_correlation
            ON event_store (tenant_id, correlation_id)
            WHERE correlation_id IS NOT NULL;

            -- Snapshots table
            CREATE TABLE IF NOT EXISTS event_snapshots (
                aggregate_id VARCHAR(255),
                tenant_id VARCHAR(255),
                aggregate_version BIGINT NOT NULL,
                snapshot_data JSONB NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                PRIMARY KEY (tenant_id, aggregate_id)
            ) PARTITION BY HASH (tenant_id);
        "#).execute(&*self.pool).await
          .map_err(|e| EventStoreError::StorageError(e.to_string()))?;

        Ok(())
    }
}

#[async_trait]
impl EventStore for PostgreSqlEventStore {
    async fn append_events(
        &self,
        aggregate_id: &str,
        expected_version: u64,
        events: Vec<EventEnvelope>,
    ) -> Result<u64, EventStoreError> {
        let mut tx = self.pool.begin().await
            .map_err(|e| EventStoreError::StorageError(e.to_string()))?;

        // Check current version for optimistic concurrency control
        let current_version: Option<i64> = sqlx::query_scalar(
            "SELECT MAX(aggregate_version) FROM event_store
             WHERE tenant_id = $1 AND aggregate_id = $2"
        )
        .bind(&self.tenant_id)
        .bind(aggregate_id)
        .fetch_optional(&mut tx)
        .await
        .map_err(|e| EventStoreError::StorageError(e.to_string()))?;

        let current_version = current_version.unwrap_or(-1) as u64;

        if current_version != expected_version {
            return Err(EventStoreError::ConcurrencyConflict {
                expected: expected_version,
                actual: current_version,
            });
        }

        let mut new_version = expected_version;

        // Insert events
        for event in events {
            new_version += 1;

            sqlx::query(
                "INSERT INTO event_store (
                    event_id, tenant_id, aggregate_id, aggregate_type,
                    event_type, event_version, aggregate_version,
                    event_data, metadata, occurred_at,
                    causation_id, correlation_id
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)"
            )
            .bind(event.event_id)
            .bind(&self.tenant_id)
            .bind(aggregate_id)
            .bind(&event.aggregate_type)
            .bind(&event.event_type)
            .bind(event.event_version as i32)
            .bind(new_version as i64)
            .bind(&event.event_data)
            .bind(&event.metadata)
            .bind(event.occurred_at)
            .bind(event.causation_id)
            .bind(event.correlation_id)
            .execute(&mut tx)
            .await
            .map_err(|e| EventStoreError::StorageError(e.to_string()))?;
        }

        tx.commit().await
            .map_err(|e| EventStoreError::StorageError(e.to_string()))?;

        Ok(new_version)
    }

    async fn load_events(
        &self,
        aggregate_id: &str,
        from_version: Option<u64>,
        to_version: Option<u64>,
    ) -> Result<Vec<EventEnvelope>, EventStoreError> {
        let from_version = from_version.unwrap_or(0) as i64;
        let to_version = to_version.unwrap_or(i64::MAX);

        let events = sqlx::query_as!(
            EventEnvelope,
            r#"
            SELECT
                event_id, aggregate_id, aggregate_type, event_type,
                event_version as "event_version: u32",
                aggregate_version as "aggregate_version: u64",
                event_data, metadata as "metadata: HashMap<String, String>",
                occurred_at, recorded_at, tenant_id,
                causation_id, correlation_id
            FROM event_store
            WHERE tenant_id = $1 AND aggregate_id = $2
              AND aggregate_version > $3 AND aggregate_version <= $4
            ORDER BY aggregate_version ASC
            "#,
            self.tenant_id,
            aggregate_id,
            from_version,
            to_version
        )
        .fetch_all(&*self.pool)
        .await
        .map_err(|e| EventStoreError::StorageError(e.to_string()))?;

        Ok(events)
    }

    async fn load_events_by_type(
        &self,
        event_type: &str,
        from_time: Option<DateTime<Utc>>,
        to_time: Option<DateTime<Utc>>,
    ) -> Result<Vec<EventEnvelope>, EventStoreError> {
        let from_time = from_time.unwrap_or(DateTime::<Utc>::MIN_UTC);
        let to_time = to_time.unwrap_or(Utc::now());

        let events = sqlx::query_as!(
            EventEnvelope,
            r#"
            SELECT
                event_id, aggregate_id, aggregate_type, event_type,
                event_version as "event_version: u32",
                aggregate_version as "aggregate_version: u64",
                event_data, metadata as "metadata: HashMap<String, String>",
                occurred_at, recorded_at, tenant_id,
                causation_id, correlation_id
            FROM event_store
            WHERE tenant_id = $1 AND event_type = $2
              AND occurred_at >= $3 AND occurred_at <= $4
            ORDER BY occurred_at ASC
            "#,
            self.tenant_id,
            event_type,
            from_time,
            to_time
        )
        .fetch_all(&*self.pool)
        .await
        .map_err(|e| EventStoreError::StorageError(e.to_string()))?;

        Ok(events)
    }

    async fn subscribe_to_events(
        &self,
        subscription_name: &str,
        event_types: Vec<String>,
    ) -> Result<Box<dyn EventSubscription>, EventStoreError> {
        Ok(Box::new(PostgreSqlEventSubscription::new(
            Arc::clone(&self.pool),
            subscription_name.to_string(),
            self.tenant_id.clone(),
            event_types,
        )))
    }

    async fn create_snapshot(
        &self,
        aggregate_id: &str,
        aggregate_version: u64,
        snapshot_data: serde_json::Value,
    ) -> Result<(), EventStoreError> {
        sqlx::query(
            "INSERT INTO event_snapshots (aggregate_id, tenant_id, aggregate_version, snapshot_data)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (tenant_id, aggregate_id)
             DO UPDATE SET aggregate_version = $3, snapshot_data = $4, created_at = NOW()"
        )
        .bind(aggregate_id)
        .bind(&self.tenant_id)
        .bind(aggregate_version as i64)
        .bind(&snapshot_data)
        .execute(&*self.pool)
        .await
        .map_err(|e| EventStoreError::StorageError(e.to_string()))?;

        Ok(())
    }

    async fn load_snapshot(
        &self,
        aggregate_id: &str,
    ) -> Result<Option<SnapshotEnvelope>, EventStoreError> {
        let snapshot = sqlx::query_as!(
            SnapshotEnvelope,
            "SELECT aggregate_id, aggregate_version as \"aggregate_version: u64\",
                    snapshot_data, created_at
             FROM event_snapshots
             WHERE tenant_id = $1 AND aggregate_id = $2",
            self.tenant_id,
            aggregate_id
        )
        .fetch_optional(&*self.pool)
        .await
        .map_err(|e| EventStoreError::StorageError(e.to_string()))?;

        Ok(snapshot)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SnapshotEnvelope {
    pub aggregate_id: String,
    pub aggregate_version: u64,
    pub snapshot_data: serde_json::Value,
    pub created_at: DateTime<Utc>,
}
```

## ML Model Domain Events

```rust
/// ML Model domain events
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "event_type", content = "data")]
pub enum MLModelEvent {
    ModelCreated {
        model_id: String,
        tenant_id: String,
        name: String,
        model_type: String,
        algorithm: String,
        created_by: String,
        initial_config: serde_json::Value,
    },
    ModelConfigurationUpdated {
        model_id: String,
        previous_config: serde_json::Value,
        new_config: serde_json::Value,
        updated_by: String,
        change_reason: String,
    },
    TrainingStarted {
        model_id: String,
        training_job_id: String,
        training_config: serde_json::Value,
        dataset_info: DatasetInfo,
        started_by: String,
    },
    TrainingProgressUpdated {
        model_id: String,
        training_job_id: String,
        epoch: u32,
        metrics: HashMap<String, f64>,
        progress_percentage: f32,
    },
    TrainingCompleted {
        model_id: String,
        training_job_id: String,
        final_metrics: HashMap<String, f64>,
        artifacts_location: String,
        training_duration_ms: u64,
    },
    TrainingFailed {
        model_id: String,
        training_job_id: String,
        failure_reason: String,
        error_details: serde_json::Value,
    },
    ModelVersionCreated {
        model_id: String,
        version: String,
        previous_version: Option<String>,
        artifacts_location: String,
        performance_metrics: HashMap<String, f64>,
        created_by: String,
    },
    ModelDeployed {
        model_id: String,
        version: String,
        deployment_target: String,
        deployment_config: serde_json::Value,
        deployed_by: String,
    },
    ModelUndeployed {
        model_id: String,
        version: String,
        deployment_target: String,
        undeployed_by: String,
        reason: String,
    },
    InferenceMade {
        model_id: String,
        version: String,
        inference_id: String,
        input_features: serde_json::Value,
        prediction: serde_json::Value,
        confidence: f64,
        inference_time_ms: u64,
        requested_by: String,
    },
    ModelArchived {
        model_id: String,
        archived_by: String,
        archive_reason: String,
    },
    ModelDeleted {
        model_id: String,
        deleted_by: String,
        deletion_reason: String,
        data_retention_policy: String,
    },
}

impl DomainEvent for MLModelEvent {
    fn event_type(&self) -> &str {
        match self {
            MLModelEvent::ModelCreated { .. } => "ModelCreated",
            MLModelEvent::ModelConfigurationUpdated { .. } => "ModelConfigurationUpdated",
            MLModelEvent::TrainingStarted { .. } => "TrainingStarted",
            MLModelEvent::TrainingProgressUpdated { .. } => "TrainingProgressUpdated",
            MLModelEvent::TrainingCompleted { .. } => "TrainingCompleted",
            MLModelEvent::TrainingFailed { .. } => "TrainingFailed",
            MLModelEvent::ModelVersionCreated { .. } => "ModelVersionCreated",
            MLModelEvent::ModelDeployed { .. } => "ModelDeployed",
            MLModelEvent::ModelUndeployed { .. } => "ModelUndeployed",
            MLModelEvent::InferenceMade { .. } => "InferenceMade",
            MLModelEvent::ModelArchived { .. } => "ModelArchived",
            MLModelEvent::ModelDeleted { .. } => "ModelDeleted",
        }
    }

    fn aggregate_id(&self) -> &str {
        match self {
            MLModelEvent::ModelCreated { model_id, .. } |
            MLModelEvent::ModelConfigurationUpdated { model_id, .. } |
            MLModelEvent::TrainingStarted { model_id, .. } |
            MLModelEvent::TrainingProgressUpdated { model_id, .. } |
            MLModelEvent::TrainingCompleted { model_id, .. } |
            MLModelEvent::TrainingFailed { model_id, .. } |
            MLModelEvent::ModelVersionCreated { model_id, .. } |
            MLModelEvent::ModelDeployed { model_id, .. } |
            MLModelEvent::ModelUndeployed { model_id, .. } |
            MLModelEvent::InferenceMade { model_id, .. } |
            MLModelEvent::ModelArchived { model_id, .. } |
            MLModelEvent::ModelDeleted { model_id, .. } => model_id,
        }
    }

    fn aggregate_version(&self) -> u64 {
        // Version is managed by the aggregate
        0
    }

    fn event_data(&self) -> serde_json::Value {
        serde_json::to_value(self).unwrap()
    }

    fn metadata(&self) -> &HashMap<String, String> {
        // Metadata is typically added at the envelope level
        &HashMap::new()
    }

    fn occurred_at(&self) -> DateTime<Utc> {
        Utc::now()
    }
}
```

## CQRS Implementation

### Command Side (Write Model)

```rust
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use uuid::Uuid;

/// Command trait
#[async_trait]
pub trait Command: Send + Sync {
    type Result;
    type Error;

    fn command_id(&self) -> Uuid;
    fn aggregate_id(&self) -> &str;
    fn tenant_id(&self) -> &str;
    fn requested_by(&self) -> &str;
}

/// ML Model commands
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MLModelCommand {
    CreateModel {
        command_id: Uuid,
        model_id: String,
        tenant_id: String,
        name: String,
        model_type: String,
        algorithm: String,
        initial_config: serde_json::Value,
        requested_by: String,
    },
    UpdateModelConfiguration {
        command_id: Uuid,
        model_id: String,
        tenant_id: String,
        new_config: serde_json::Value,
        change_reason: String,
        requested_by: String,
    },
    StartTraining {
        command_id: Uuid,
        model_id: String,
        tenant_id: String,
        training_config: serde_json::Value,
        dataset_info: DatasetInfo,
        requested_by: String,
    },
    CreateModelVersion {
        command_id: Uuid,
        model_id: String,
        tenant_id: String,
        version: String,
        artifacts_location: String,
        performance_metrics: HashMap<String, f64>,
        requested_by: String,
    },
    DeployModel {
        command_id: Uuid,
        model_id: String,
        tenant_id: String,
        version: String,
        deployment_target: String,
        deployment_config: serde_json::Value,
        requested_by: String,
    },
}

impl Command for MLModelCommand {
    type Result = MLModelCommandResult;
    type Error = MLModelCommandError;

    fn command_id(&self) -> Uuid {
        match self {
            MLModelCommand::CreateModel { command_id, .. } |
            MLModelCommand::UpdateModelConfiguration { command_id, .. } |
            MLModelCommand::StartTraining { command_id, .. } |
            MLModelCommand::CreateModelVersion { command_id, .. } |
            MLModelCommand::DeployModel { command_id, .. } => *command_id,
        }
    }

    fn aggregate_id(&self) -> &str {
        match self {
            MLModelCommand::CreateModel { model_id, .. } |
            MLModelCommand::UpdateModelConfiguration { model_id, .. } |
            MLModelCommand::StartTraining { model_id, .. } |
            MLModelCommand::CreateModelVersion { model_id, .. } |
            MLModelCommand::DeployModel { model_id, .. } => model_id,
        }
    }

    fn tenant_id(&self) -> &str {
        match self {
            MLModelCommand::CreateModel { tenant_id, .. } |
            MLModelCommand::UpdateModelConfiguration { tenant_id, .. } |
            MLModelCommand::StartTraining { tenant_id, .. } |
            MLModelCommand::CreateModelVersion { tenant_id, .. } |
            MLModelCommand::DeployModel { tenant_id, .. } => tenant_id,
        }
    }

    fn requested_by(&self) -> &str {
        match self {
            MLModelCommand::CreateModel { requested_by, .. } |
            MLModelCommand::UpdateModelConfiguration { requested_by, .. } |
            MLModelCommand::StartTraining { requested_by, .. } |
            MLModelCommand::CreateModelVersion { requested_by, .. } |
            MLModelCommand::DeployModel { requested_by, .. } => requested_by,
        }
    }
}

/// ML Model Aggregate
#[derive(Debug, Clone)]
pub struct MLModelAggregate {
    pub id: String,
    pub tenant_id: String,
    pub version: u64,
    pub name: String,
    pub model_type: String,
    pub algorithm: String,
    pub config: serde_json::Value,
    pub status: ModelStatus,
    pub versions: HashMap<String, ModelVersionInfo>,
    pub deployments: HashMap<String, ModelDeploymentInfo>,
    pub training_history: Vec<TrainingInfo>,
    pub created_at: DateTime<Utc>,
    pub created_by: String,
    pub updated_at: DateTime<Utc>,
    pub updated_by: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ModelStatus {
    Created,
    Training,
    Trained,
    Deployed,
    Archived,
    Deleted,
}

impl MLModelAggregate {
    pub fn new() -> Self {
        Self {
            id: String::new(),
            tenant_id: String::new(),
            version: 0,
            name: String::new(),
            model_type: String::new(),
            algorithm: String::new(),
            config: serde_json::Value::Null,
            status: ModelStatus::Created,
            versions: HashMap::new(),
            deployments: HashMap::new(),
            training_history: Vec::new(),
            created_at: Utc::now(),
            created_by: String::new(),
            updated_at: Utc::now(),
            updated_by: String::new(),
        }
    }

    /// Load aggregate from events
    pub fn from_events(events: Vec<EventEnvelope>) -> Result<Self, MLModelError> {
        let mut aggregate = Self::new();

        for event in events {
            aggregate.apply_event(&event)?;
            aggregate.version = event.aggregate_version;
        }

        Ok(aggregate)
    }

    /// Apply an event to update aggregate state
    pub fn apply_event(&mut self, event: &EventEnvelope) -> Result<(), MLModelError> {
        let ml_event: MLModelEvent = serde_json::from_value(event.event_data.clone())
            .map_err(|e| MLModelError::EventDeserializationError(e.to_string()))?;

        match ml_event {
            MLModelEvent::ModelCreated {
                model_id,
                tenant_id,
                name,
                model_type,
                algorithm,
                created_by,
                initial_config,
            } => {
                self.id = model_id;
                self.tenant_id = tenant_id;
                self.name = name;
                self.model_type = model_type;
                self.algorithm = algorithm;
                self.config = initial_config;
                self.created_by = created_by.clone();
                self.updated_by = created_by;
                self.status = ModelStatus::Created;
            }
            MLModelEvent::ModelConfigurationUpdated {
                new_config,
                updated_by,
                ..
            } => {
                self.config = new_config;
                self.updated_by = updated_by;
                self.updated_at = Utc::now();
            }
            MLModelEvent::TrainingStarted {
                training_job_id,
                training_config,
                dataset_info,
                started_by,
            } => {
                self.status = ModelStatus::Training;
                self.training_history.push(TrainingInfo {
                    job_id: training_job_id,
                    status: TrainingStatus::Running,
                    config: training_config,
                    dataset_info,
                    started_at: Utc::now(),
                    started_by,
                    completed_at: None,
                    final_metrics: None,
                });
                self.updated_at = Utc::now();
            }
            MLModelEvent::TrainingCompleted {
                training_job_id,
                final_metrics,
                training_duration_ms,
            } => {
                if let Some(training) = self.training_history.iter_mut()
                    .find(|t| t.job_id == training_job_id) {
                    training.status = TrainingStatus::Completed;
                    training.final_metrics = Some(final_metrics);
                    training.completed_at = Some(Utc::now());
                }
                self.status = ModelStatus::Trained;
                self.updated_at = Utc::now();
            }
            MLModelEvent::ModelVersionCreated {
                version,
                artifacts_location,
                performance_metrics,
                created_by,
                previous_version,
            } => {
                self.versions.insert(version.clone(), ModelVersionInfo {
                    version: version.clone(),
                    previous_version,
                    artifacts_location,
                    performance_metrics,
                    created_at: Utc::now(),
                    created_by,
                    is_active: false,
                });
                self.updated_at = Utc::now();
            }
            MLModelEvent::ModelDeployed {
                version,
                deployment_target,
                deployment_config,
                deployed_by,
            } => {
                self.deployments.insert(deployment_target.clone(), ModelDeploymentInfo {
                    target: deployment_target,
                    version: version.clone(),
                    config: deployment_config,
                    deployed_at: Utc::now(),
                    deployed_by,
                    status: DeploymentStatus::Active,
                });

                // Mark version as active
                if let Some(version_info) = self.versions.get_mut(&version) {
                    version_info.is_active = true;
                }

                self.status = ModelStatus::Deployed;
                self.updated_at = Utc::now();
            }
            MLModelEvent::ModelArchived { archived_by, .. } => {
                self.status = ModelStatus::Archived;
                self.updated_by = archived_by;
                self.updated_at = Utc::now();
            }
            MLModelEvent::ModelDeleted { deleted_by, .. } => {
                self.status = ModelStatus::Deleted;
                self.updated_by = deleted_by;
                self.updated_at = Utc::now();
            }
            // Handle other events...
            _ => {}
        }

        Ok(())
    }

    /// Handle command and return events
    pub fn handle_command(
        &self,
        command: MLModelCommand,
    ) -> Result<Vec<MLModelEvent>, MLModelCommandError> {
        match command {
            MLModelCommand::CreateModel {
                model_id,
                tenant_id,
                name,
                model_type,
                algorithm,
                initial_config,
                requested_by,
                ..
            } => {
                // Validate command
                if !self.id.is_empty() {
                    return Err(MLModelCommandError::AggregateAlreadyExists(model_id));
                }

                Ok(vec![MLModelEvent::ModelCreated {
                    model_id,
                    tenant_id,
                    name,
                    model_type,
                    algorithm,
                    created_by: requested_by,
                    initial_config,
                }])
            }
            MLModelCommand::StartTraining {
                model_id,
                tenant_id,
                training_config,
                dataset_info,
                requested_by,
                ..
            } => {
                // Validate model can be trained
                if self.id.is_empty() {
                    return Err(MLModelCommandError::AggregateNotFound(model_id));
                }

                if matches!(self.status, ModelStatus::Training | ModelStatus::Deleted) {
                    return Err(MLModelCommandError::InvalidState {
                        current_state: format!("{:?}", self.status),
                        required_state: "Created, Trained, or Deployed".to_string(),
                    });
                }

                let training_job_id = Uuid::new_v4().to_string();

                Ok(vec![MLModelEvent::TrainingStarted {
                    model_id,
                    training_job_id,
                    training_config,
                    dataset_info,
                    started_by: requested_by,
                }])
            }
            // Handle other commands...
            _ => Ok(vec![]),
        }
    }
}

/// Command Handler
#[derive(Clone)]
pub struct MLModelCommandHandler {
    event_store: Arc<dyn EventStore>,
    tenant_id: String,
}

impl MLModelCommandHandler {
    pub fn new(event_store: Arc<dyn EventStore>, tenant_id: String) -> Self {
        Self { event_store, tenant_id }
    }

    pub async fn handle(
        &self,
        command: MLModelCommand,
    ) -> Result<MLModelCommandResult, MLModelCommandError> {
        let aggregate_id = command.aggregate_id().to_string();

        // Load current aggregate state
        let events = self.event_store
            .load_events(&aggregate_id, None, None)
            .await
            .map_err(|e| MLModelCommandError::EventStoreError(e.to_string()))?;

        let mut aggregate = if events.is_empty() {
            MLModelAggregate::new()
        } else {
            MLModelAggregate::from_events(events)?
        };

        let expected_version = aggregate.version;

        // Handle command
        let new_events = aggregate.handle_command(command)?;

        if new_events.is_empty() {
            return Ok(MLModelCommandResult::NoChanges);
        }

        // Convert domain events to event envelopes
        let event_envelopes: Vec<EventEnvelope> = new_events
            .into_iter()
            .map(|event| EventEnvelope {
                event_id: Uuid::new_v4(),
                aggregate_id: aggregate_id.clone(),
                aggregate_type: "MLModel".to_string(),
                event_type: event.event_type().to_string(),
                event_version: 1,
                aggregate_version: 0, // Will be set by event store
                event_data: event.event_data(),
                metadata: HashMap::new(),
                occurred_at: event.occurred_at(),
                recorded_at: Utc::now(),
                tenant_id: self.tenant_id.clone(),
                causation_id: None,
                correlation_id: None,
            })
            .collect();

        // Append events to store
        let new_version = self.event_store
            .append_events(&aggregate_id, expected_version, event_envelopes)
            .await
            .map_err(|e| MLModelCommandError::EventStoreError(e.to_string()))?;

        Ok(MLModelCommandResult::Success {
            aggregate_id,
            new_version,
            events_count: new_events.len(),
        })
    }
}
```

### Query Side (Read Model)

```rust
/// Read model for ML Model queries
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MLModelReadModel {
    pub id: String,
    pub tenant_id: String,
    pub name: String,
    pub model_type: String,
    pub algorithm: String,
    pub status: String,
    pub current_version: Option<String>,
    pub accuracy: Option<f64>,
    pub precision: Option<f64>,
    pub recall: Option<f64>,
    pub f1_score: Option<f64>,
    pub created_at: DateTime<Utc>,
    pub created_by: String,
    pub updated_at: DateTime<Utc>,
    pub training_count: i32,
    pub deployment_count: i32,
    pub last_inference_at: Option<DateTime<Utc>>,
    pub tags: Vec<String>,
    pub metadata: serde_json::Value,
}

/// Query interface
#[async_trait]
pub trait MLModelQueries: Send + Sync {
    async fn get_model(&self, model_id: &str) -> Result<Option<MLModelReadModel>, QueryError>;
    async fn list_models(&self, filters: ModelFilters) -> Result<Vec<MLModelReadModel>, QueryError>;
    async fn get_model_versions(&self, model_id: &str) -> Result<Vec<ModelVersionReadModel>, QueryError>;
    async fn get_model_deployments(&self, model_id: &str) -> Result<Vec<ModelDeploymentReadModel>, QueryError>;
    async fn get_training_history(&self, model_id: &str) -> Result<Vec<TrainingHistoryReadModel>, QueryError>;
    async fn search_models(&self, query: &str, filters: ModelFilters) -> Result<ModelSearchResult, QueryError>;
    async fn get_model_analytics(&self, model_id: &str, time_range: TimeRange) -> Result<ModelAnalytics, QueryError>;
}

/// PostgreSQL Query Implementation
pub struct PostgreSqlMLModelQueries {
    pool: Arc<PgPool>,
    tenant_id: String,
}

impl PostgreSqlMLModelQueries {
    pub fn new(pool: Arc<PgPool>, tenant_id: String) -> Self {
        Self { pool, tenant_id }
    }

    /// Initialize read model tables
    pub async fn initialize(&self) -> Result<(), QueryError> {
        sqlx::query(r#"
            CREATE TABLE IF NOT EXISTS ml_models_read_model (
                id VARCHAR(255) PRIMARY KEY,
                tenant_id VARCHAR(255) NOT NULL,
                name VARCHAR(255) NOT NULL,
                model_type VARCHAR(100) NOT NULL,
                algorithm VARCHAR(100) NOT NULL,
                status VARCHAR(50) NOT NULL,
                current_version VARCHAR(50),
                accuracy DECIMAL(5,4),
                precision_score DECIMAL(5,4),
                recall_score DECIMAL(5,4),
                f1_score DECIMAL(5,4),
                created_at TIMESTAMPTZ NOT NULL,
                created_by VARCHAR(255) NOT NULL,
                updated_at TIMESTAMPTZ NOT NULL,
                training_count INTEGER DEFAULT 0,
                deployment_count INTEGER DEFAULT 0,
                last_inference_at TIMESTAMPTZ,
                tags TEXT[],
                metadata JSONB DEFAULT '{}'
            ) PARTITION BY HASH (tenant_id);

            CREATE TABLE IF NOT EXISTS model_versions_read_model (
                id VARCHAR(255),
                model_id VARCHAR(255) NOT NULL,
                tenant_id VARCHAR(255) NOT NULL,
                version VARCHAR(50) NOT NULL,
                previous_version VARCHAR(50),
                artifacts_location TEXT NOT NULL,
                performance_metrics JSONB,
                created_at TIMESTAMPTZ NOT NULL,
                created_by VARCHAR(255) NOT NULL,
                is_active BOOLEAN DEFAULT FALSE,
                PRIMARY KEY (tenant_id, model_id, version)
            ) PARTITION BY HASH (tenant_id);

            -- Indexes for read models
            CREATE INDEX IF NOT EXISTS idx_ml_models_tenant_status
            ON ml_models_read_model (tenant_id, status);

            CREATE INDEX IF NOT EXISTS idx_ml_models_type_algorithm
            ON ml_models_read_model (tenant_id, model_type, algorithm);

            CREATE INDEX IF NOT EXISTS idx_model_versions_model
            ON model_versions_read_model (tenant_id, model_id, created_at DESC);
        "#).execute(&*self.pool).await
          .map_err(|e| QueryError::DatabaseError(e.to_string()))?;

        Ok(())
    }
}

#[async_trait]
impl MLModelQueries for PostgreSqlMLModelQueries {
    async fn get_model(&self, model_id: &str) -> Result<Option<MLModelReadModel>, QueryError> {
        let model = sqlx::query_as!(
            MLModelReadModel,
            r#"
            SELECT
                id, tenant_id, name, model_type, algorithm, status,
                current_version, accuracy, precision_score as precision,
                recall_score as recall, f1_score, created_at, created_by,
                updated_at, training_count, deployment_count, last_inference_at,
                tags, metadata
            FROM ml_models_read_model
            WHERE tenant_id = $1 AND id = $2
            "#,
            self.tenant_id,
            model_id
        )
        .fetch_optional(&*self.pool)
        .await
        .map_err(|e| QueryError::DatabaseError(e.to_string()))?;

        Ok(model)
    }

    async fn list_models(&self, filters: ModelFilters) -> Result<Vec<MLModelReadModel>, QueryError> {
        let mut query = "SELECT id, tenant_id, name, model_type, algorithm, status, current_version, accuracy, precision_score as precision, recall_score as recall, f1_score, created_at, created_by, updated_at, training_count, deployment_count, last_inference_at, tags, metadata FROM ml_models_read_model WHERE tenant_id = $1".to_string();
        let mut params: Vec<Box<dyn sqlx::encode::Encode<sqlx::Postgres> + Send + Sync>> = vec![Box::new(self.tenant_id.clone())];
        let mut param_count = 2;

        if let Some(model_type) = &filters.model_type {
            query.push_str(&format!(" AND model_type = ${}", param_count));
            params.push(Box::new(model_type.clone()));
            param_count += 1;
        }

        if let Some(status) = &filters.status {
            query.push_str(&format!(" AND status = ${}", param_count));
            params.push(Box::new(status.clone()));
            param_count += 1;
        }

        query.push_str(" ORDER BY updated_at DESC");

        if let Some(limit) = filters.limit {
            query.push_str(&format!(" LIMIT {}", limit));
        }

        // Note: In a real implementation, you'd use a query builder or prepared statements
        // This is simplified for demonstration

        let models = sqlx::query_as::<_, MLModelReadModel>(&query)
            .bind(&self.tenant_id)
            .fetch_all(&*self.pool)
            .await
            .map_err(|e| QueryError::DatabaseError(e.to_string()))?;

        Ok(models)
    }

    async fn search_models(&self, query: &str, filters: ModelFilters) -> Result<ModelSearchResult, QueryError> {
        // Implement full-text search using PostgreSQL or Elasticsearch
        // This is a simplified version using ILIKE
        let search_query = format!("%{}%", query);

        let models = sqlx::query_as!(
            MLModelReadModel,
            r#"
            SELECT
                id, tenant_id, name, model_type, algorithm, status,
                current_version, accuracy, precision_score as precision,
                recall_score as recall, f1_score, created_at, created_by,
                updated_at, training_count, deployment_count, last_inference_at,
                tags, metadata
            FROM ml_models_read_model
            WHERE tenant_id = $1 AND (name ILIKE $2 OR model_type ILIKE $2 OR algorithm ILIKE $2)
            ORDER BY
                CASE WHEN name ILIKE $2 THEN 1
                     WHEN model_type ILIKE $2 THEN 2
                     ELSE 3 END,
                updated_at DESC
            LIMIT $3
            "#,
            self.tenant_id,
            search_query,
            filters.limit.unwrap_or(50) as i64
        )
        .fetch_all(&*self.pool)
        .await
        .map_err(|e| QueryError::DatabaseError(e.to_string()))?;

        Ok(ModelSearchResult {
            models,
            total_count: models.len(),
            query: query.to_string(),
            search_time_ms: 0, // Calculate actual search time
        })
    }

    // Implement other query methods...
    async fn get_model_versions(&self, model_id: &str) -> Result<Vec<ModelVersionReadModel>, QueryError> {
        todo!("Implement get_model_versions")
    }

    async fn get_model_deployments(&self, model_id: &str) -> Result<Vec<ModelDeploymentReadModel>, QueryError> {
        todo!("Implement get_model_deployments")
    }

    async fn get_training_history(&self, model_id: &str) -> Result<Vec<TrainingHistoryReadModel>, QueryError> {
        todo!("Implement get_training_history")
    }

    async fn get_model_analytics(&self, model_id: &str, time_range: TimeRange) -> Result<ModelAnalytics, QueryError> {
        todo!("Implement get_model_analytics")
    }
}

/// Event Projection Handler
pub struct MLModelProjectionHandler {
    query_store: Arc<dyn MLModelQueries>,
    pool: Arc<PgPool>,
    tenant_id: String,
}

impl MLModelProjectionHandler {
    pub fn new(
        query_store: Arc<dyn MLModelQueries>,
        pool: Arc<PgPool>,
        tenant_id: String,
    ) -> Self {
        Self {
            query_store,
            pool,
            tenant_id,
        }
    }

    /// Handle event and update read models
    pub async fn handle_event(&self, event: &EventEnvelope) -> Result<(), ProjectionError> {
        let ml_event: MLModelEvent = serde_json::from_value(event.event_data.clone())
            .map_err(|e| ProjectionError::EventDeserializationError(e.to_string()))?;

        match ml_event {
            MLModelEvent::ModelCreated {
                model_id,
                tenant_id,
                name,
                model_type,
                algorithm,
                created_by,
                ..
            } => {
                sqlx::query(
                    "INSERT INTO ml_models_read_model (
                        id, tenant_id, name, model_type, algorithm, status,
                        created_at, created_by, updated_at, training_count, deployment_count
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)"
                )
                .bind(&model_id)
                .bind(&tenant_id)
                .bind(&name)
                .bind(&model_type)
                .bind(&algorithm)
                .bind("created")
                .bind(event.occurred_at)
                .bind(&created_by)
                .bind(event.occurred_at)
                .bind(0i32)
                .bind(0i32)
                .execute(&*self.pool)
                .await
                .map_err(|e| ProjectionError::DatabaseError(e.to_string()))?;
            }
            MLModelEvent::ModelVersionCreated {
                model_id,
                version,
                previous_version,
                artifacts_location,
                performance_metrics,
                created_by,
            } => {
                // Insert new version
                sqlx::query(
                    "INSERT INTO model_versions_read_model (
                        id, model_id, tenant_id, version, previous_version,
                        artifacts_location, performance_metrics, created_at, created_by
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)"
                )
                .bind(Uuid::new_v4().to_string())
                .bind(&model_id)
                .bind(&self.tenant_id)
                .bind(&version)
                .bind(&previous_version)
                .bind(&artifacts_location)
                .bind(&performance_metrics)
                .bind(event.occurred_at)
                .bind(&created_by)
                .execute(&*self.pool)
                .await
                .map_err(|e| ProjectionError::DatabaseError(e.to_string()))?;

                // Update model's current version
                sqlx::query(
                    "UPDATE ml_models_read_model
                     SET current_version = $1, updated_at = $2
                     WHERE tenant_id = $3 AND id = $4"
                )
                .bind(&version)
                .bind(event.occurred_at)
                .bind(&self.tenant_id)
                .bind(&model_id)
                .execute(&*self.pool)
                .await
                .map_err(|e| ProjectionError::DatabaseError(e.to_string()))?;
            }
            MLModelEvent::TrainingStarted { model_id, .. } => {
                sqlx::query(
                    "UPDATE ml_models_read_model
                     SET status = 'training', training_count = training_count + 1, updated_at = $1
                     WHERE tenant_id = $2 AND id = $3"
                )
                .bind(event.occurred_at)
                .bind(&self.tenant_id)
                .bind(&model_id)
                .execute(&*self.pool)
                .await
                .map_err(|e| ProjectionError::DatabaseError(e.to_string()))?;
            }
            MLModelEvent::TrainingCompleted { model_id, .. } => {
                sqlx::query(
                    "UPDATE ml_models_read_model
                     SET status = 'trained', updated_at = $1
                     WHERE tenant_id = $2 AND id = $3"
                )
                .bind(event.occurred_at)
                .bind(&self.tenant_id)
                .bind(&model_id)
                .execute(&*self.pool)
                .await
                .map_err(|e| ProjectionError::DatabaseError(e.to_string()))?;
            }
            MLModelEvent::ModelDeployed { model_id, .. } => {
                sqlx::query(
                    "UPDATE ml_models_read_model
                     SET status = 'deployed', deployment_count = deployment_count + 1, updated_at = $1
                     WHERE tenant_id = $2 AND id = $3"
                )
                .bind(event.occurred_at)
                .bind(&self.tenant_id)
                .bind(&model_id)
                .execute(&*self.pool)
                .await
                .map_err(|e| ProjectionError::DatabaseError(e.to_string()))?;
            }
            MLModelEvent::InferenceMade { model_id, .. } => {
                sqlx::query(
                    "UPDATE ml_models_read_model
                     SET last_inference_at = $1, updated_at = $2
                     WHERE tenant_id = $3 AND id = $4"
                )
                .bind(event.occurred_at)
                .bind(event.occurred_at)
                .bind(&self.tenant_id)
                .bind(&model_id)
                .execute(&*self.pool)
                .await
                .map_err(|e| ProjectionError::DatabaseError(e.to_string()))?;
            }
            // Handle other events...
            _ => {}
        }

        Ok(())
    }
}
```

This comprehensive Event Sourcing and CQRS implementation provides:

1. **Event Store** with PostgreSQL backend, optimistic concurrency control, and snapshotting
2. **Domain Events** for ML models with complete lifecycle tracking
3. **Command Side** with aggregate pattern and business rule validation
4. **Query Side** with optimized read models and projections
5. **Event Projections** that automatically update read models
6. **Multi-tenant support** with proper data isolation

The system ensures audit trail completeness, supports time-travel queries, and provides excellent scalability for read-heavy workloads typical in ML platforms.