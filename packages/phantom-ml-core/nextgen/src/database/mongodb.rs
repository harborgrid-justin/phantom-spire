//! MongoDB adapter for phantom-ml-core
//! 
//! Provides MongoDB-based document storage for ML experiments, datasets, and flexible data.

use async_trait::async_trait;
use mongodb::{Client, Database, Collection, Cursor};
use mongodb::bson::{doc, Document, DateTime, oid::ObjectId};
use mongodb::options::{ClientOptions, FindOptions, UpdateOptions, IndexOptions};
use std::collections::HashMap;
use serde::{Serialize, Deserialize};

use super::interfaces::{
    InferenceStorage, TrainingStorage, DatabaseConfig, DatabaseError, DatabaseResult,
    InferenceResult, TrainingResult, TrainingDataset, MLExperiment,
    SearchCriteria, AnalyticsFilters, ExperimentFilters,
    InferenceAnalytics, TimeSeriesPoint, ExperimentStatus
};

/// MongoDB document wrapper for ML models
#[derive(Debug, Clone, Serialize, Deserialize)]
struct ModelDocument {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub model_id: String,
    pub name: String,
    pub model_type: String,
    pub algorithm: String,
    pub version: String,
    pub created_at: DateTime,
    pub updated_at: DateTime,
    pub metadata: Document,
}

/// MongoDB document for inference results
#[derive(Debug, Clone, Serialize, Deserialize)]
struct InferenceDocument {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub model_id: String,
    pub prediction: mongodb::bson::Bson,
    pub confidence: f64,
    pub probability_distribution: Vec<f64>,
    pub feature_importance: Document,
    pub inference_time_ms: u64,
    pub timestamp: DateTime,
    pub input_features: Option<Document>,
    pub session_id: Option<String>,
    pub metadata: Option<Document>,
}

/// MongoDB document for training results
#[derive(Debug, Clone, Serialize, Deserialize)]
struct TrainingDocument {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub model_id: String,
    pub training_accuracy: f64,
    pub validation_accuracy: f64,
    pub training_loss: f64,
    pub validation_loss: f64,
    pub epochs_completed: u32,
    pub training_time_ms: u64,
    pub convergence_achieved: bool,
    pub timestamp: DateTime,
    pub hyperparameters: Document,
    pub metrics: Document,
    pub experiment_id: Option<String>,
}

/// MongoDB document for experiments
#[derive(Debug, Clone, Serialize, Deserialize)]
struct ExperimentDocument {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub experiment_id: String,
    pub name: String,
    pub model_id: String,
    pub dataset_id: String,
    pub parameters: Document,
    pub metrics: Document,
    pub status: String,
    pub start_time: DateTime,
    pub end_time: Option<DateTime>,
    pub notes: Option<String>,
    pub tags: Vec<String>,
    pub metadata: Document,
}

/// MongoDB adapter for document-based ML data storage
#[derive(Clone)]
pub struct MongoDBAdapter {
    client: Client,
    database: Database,
    config: DatabaseConfig,
}

impl MongoDBAdapter {
    /// Create a new MongoDB adapter
    pub async fn new(config: DatabaseConfig) -> DatabaseResult<Self> {
        let client_options = ClientOptions::parse(&config.connection_string).await
            .map_err(|e| DatabaseError::ConnectionFailed(format!("Failed to parse MongoDB connection string: {}", e)))?;

        let client = Client::with_options(client_options)
            .map_err(|e| DatabaseError::ConnectionFailed(format!("Failed to create MongoDB client: {}", e)))?;

        // Extract database name from connection string or use default
        let database_name = Self::extract_database_name(&config.connection_string)
            .unwrap_or_else(|| "phantom_ml_core".to_string());

        let database = client.database(&database_name);

        let adapter = Self {
            client,
            database,
            config,
        };

        // Test connection
        adapter.test_connection().await?;
        
        // Initialize indexes
        adapter.create_indexes().await?;
        
        Ok(adapter)
    }

    /// Extract database name from MongoDB connection string
    fn extract_database_name(connection_string: &str) -> Option<String> {
        if let Some(start) = connection_string.rfind('/') {
            if let Some(end) = connection_string[start + 1..].find('?') {
                Some(connection_string[start + 1..start + 1 + end].to_string())
            } else {
                Some(connection_string[start + 1..].to_string())
            }
        } else {
            None
        }
    }

    /// Test MongoDB connection
    async fn test_connection(&self) -> DatabaseResult<()> {
        self.database
            .run_command(doc! { "ping": 1 }, None)
            .await
            .map_err(|e| DatabaseError::ConnectionFailed(format!("MongoDB connection test failed: {}", e)))?;
        
        Ok(())
    }

    /// Create necessary indexes for performance
    async fn create_indexes(&self) -> DatabaseResult<()> {
        // Inference collection indexes
        let inferences_collection = self.database.collection::<InferenceDocument>("inferences");
        let inference_indexes = vec![
            doc! { "model_id": 1 },
            doc! { "timestamp": -1 },
            doc! { "confidence": -1 },
            doc! { "model_id": 1, "timestamp": -1 },
        ];

        for index in inference_indexes {
            inferences_collection
                .create_index(index, None)
                .await
                .map_err(|e| DatabaseError::QueryFailed(format!("Failed to create inference index: {}", e)))?;
        }

        // Training collection indexes
        let training_collection = self.database.collection::<TrainingDocument>("training_results");
        let training_indexes = vec![
            doc! { "model_id": 1 },
            doc! { "timestamp": -1 },
            doc! { "experiment_id": 1 },
            doc! { "model_id": 1, "timestamp": -1 },
        ];

        for index in training_indexes {
            training_collection
                .create_index(index, None)
                .await
                .map_err(|e| DatabaseError::QueryFailed(format!("Failed to create training index: {}", e)))?;
        }

        // Experiments collection indexes
        let experiments_collection = self.database.collection::<ExperimentDocument>("experiments");
        let experiment_indexes = vec![
            doc! { "experiment_id": 1 },
            doc! { "model_id": 1 },
            doc! { "status": 1 },
            doc! { "start_time": -1 },
            doc! { "tags": 1 },
        ];

        for index in experiment_indexes {
            experiments_collection
                .create_index(index, None)
                .await
                .map_err(|e| DatabaseError::QueryFailed(format!("Failed to create experiment index: {}", e)))?;
        }

        // Training datasets collection indexes
        let datasets_collection = self.database.collection::<Document>("training_datasets");
        let dataset_indexes = vec![
            doc! { "dataset_id": 1 },
            doc! { "created_at": -1 },
            doc! { "name": "text" }, // Text index for searching
        ];

        for index in dataset_indexes {
            datasets_collection
                .create_index(index, None)
                .await
                .map_err(|e| DatabaseError::QueryFailed(format!("Failed to create dataset index: {}", e)))?;
        }

        Ok(())
    }

    /// Convert DateTime to chrono::DateTime<Utc>
    fn bson_datetime_to_chrono(dt: DateTime) -> chrono::DateTime<chrono::Utc> {
        chrono::DateTime::from_timestamp(dt.timestamp_millis() / 1000, 0)
            .unwrap_or_else(|| chrono::Utc::now())
    }

    /// Convert chrono::DateTime<Utc> to BSON DateTime
    fn chrono_to_bson_datetime(dt: chrono::DateTime<chrono::Utc>) -> DateTime {
        DateTime::from_millis(dt.timestamp_millis())
    }

    /// Convert HashMap to BSON Document
    fn hashmap_to_document(&self, map: &HashMap<String, serde_json::Value>) -> DatabaseResult<Document> {
        let json_value = serde_json::Value::Object(map.clone().into_iter().collect());
        mongodb::bson::to_document(&json_value)
            .map_err(|e| DatabaseError::SerializationError(format!("Failed to convert to document: {}", e)))
    }

    /// Convert BSON Document to HashMap
    fn document_to_hashmap(&self, doc: &Document) -> DatabaseResult<HashMap<String, serde_json::Value>> {
        let json_value = mongodb::bson::to_serde_json_value(doc)
            .map_err(|e| DatabaseError::SerializationError(format!("Failed to convert from document: {}", e)))?;
        
        if let serde_json::Value::Object(map) = json_value {
            Ok(map.into_iter().collect())
        } else {
            Ok(HashMap::new())
        }
    }
}

#[async_trait]
impl InferenceStorage for MongoDBAdapter {
    async fn save_inference(&self, result: &InferenceResult) -> DatabaseResult<String> {
        let collection = self.database.collection::<InferenceDocument>("inferences");
        
        let prediction_bson = mongodb::bson::to_bson(&result.prediction)
            .map_err(|e| DatabaseError::SerializationError(format!("Failed to serialize prediction: {}", e)))?;
        
        let feature_importance_doc = self.hashmap_to_document(&result.feature_importance)?;
        
        let inference_doc = InferenceDocument {
            id: None,
            model_id: result.model_id.clone(),
            prediction: prediction_bson,
            confidence: result.confidence,
            probability_distribution: result.probability_distribution.clone(),
            feature_importance: feature_importance_doc,
            inference_time_ms: result.inference_time_ms,
            timestamp: Self::chrono_to_bson_datetime(result.timestamp),
            input_features: None,
            session_id: None,
            metadata: None,
        };

        let insert_result = collection
            .insert_one(inference_doc, None)
            .await
            .map_err(|e| DatabaseError::QueryFailed(format!("Failed to save inference: {}", e)))?;

        Ok(insert_result.inserted_id.as_object_id()
            .map(|oid| oid.to_hex())
            .unwrap_or_else(|| uuid::Uuid::new_v4().to_string()))
    }

    async fn get_inference_history(&self, model_id: &str, limit: Option<u32>) -> DatabaseResult<Vec<InferenceResult>> {
        let collection = self.database.collection::<InferenceDocument>("inferences");
        
        let filter = doc! { "model_id": model_id };
        let find_options = FindOptions::builder()
            .sort(doc! { "timestamp": -1 })
            .limit(limit.map(|l| l as i64))
            .build();

        let mut cursor = collection
            .find(filter, find_options)
            .await
            .map_err(|e| DatabaseError::QueryFailed(format!("Failed to query inference history: {}", e)))?;

        let mut results = Vec::new();
        while cursor.advance().await.map_err(|e| DatabaseError::QueryFailed(format!("Failed to iterate cursor: {}", e)))? {
            let doc = cursor.deserialize_current()
                .map_err(|e| DatabaseError::SerializationError(format!("Failed to deserialize inference document: {}", e)))?;
            
            let prediction: serde_json::Value = mongodb::bson::from_bson(doc.prediction)
                .map_err(|e| DatabaseError::SerializationError(format!("Failed to deserialize prediction: {}", e)))?;
            
            let feature_importance = self.document_to_hashmap(&doc.feature_importance)?;

            results.push(InferenceResult {
                model_id: doc.model_id,
                prediction,
                confidence: doc.confidence,
                probability_distribution: doc.probability_distribution,
                feature_importance,
                inference_time_ms: doc.inference_time_ms,
                timestamp: Self::bson_datetime_to_chrono(doc.timestamp),
            });
        }

        Ok(results)
    }

    async fn get_inference_analytics(&self, model_id: &str, filters: Option<AnalyticsFilters>) -> DatabaseResult<InferenceAnalytics> {
        let collection = self.database.collection::<InferenceDocument>("inferences");
        
        let mut match_stage = doc! { "model_id": model_id };
        
        // Apply date filters if provided
        if let Some(filters) = filters {
            if let Some(start_date) = filters.start_date {
                if let Some(end_date) = filters.end_date {
                    match_stage.insert("timestamp", doc! {
                        "$gte": Self::chrono_to_bson_datetime(start_date),
                        "$lte": Self::chrono_to_bson_datetime(end_date)
                    });
                } else {
                    match_stage.insert("timestamp", doc! {
                        "$gte": Self::chrono_to_bson_datetime(start_date)
                    });
                }
            } else if let Some(end_date) = filters.end_date {
                match_stage.insert("timestamp", doc! {
                    "$lte": Self::chrono_to_bson_datetime(end_date)
                });
            }
        }

        // Aggregate analytics data
        let pipeline = vec![
            doc! { "$match": match_stage },
            doc! {
                "$group": {
                    "_id": null,
                    "total_inferences": { "$sum": 1 },
                    "avg_confidence": { "$avg": "$confidence" },
                    "confidence_buckets": {
                        "$push": {
                            "$cond": {
                                "if": { "$gte": ["$confidence", 0.8] },
                                "then": "high",
                                "else": {
                                    "$cond": {
                                        "if": { "$gte": ["$confidence", 0.6] },
                                        "then": "medium",
                                        "else": "low"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        ];

        let mut cursor = collection
            .aggregate(pipeline, None)
            .await
            .map_err(|e| DatabaseError::QueryFailed(format!("Failed to aggregate inference analytics: {}", e)))?;

        let mut total_inferences = 0u64;
        let mut average_confidence = 0.0f64;
        let mut confidence_distribution = HashMap::new();

        if cursor.advance().await.map_err(|e| DatabaseError::QueryFailed(format!("Failed to advance cursor: {}", e)))? {
            let result_doc = cursor.deserialize_current()
                .map_err(|e| DatabaseError::SerializationError(format!("Failed to deserialize analytics result: {}", e)))?;

            if let Ok(total) = result_doc.get_i64("total_inferences") {
                total_inferences = total as u64;
            }
            
            if let Ok(avg_conf) = result_doc.get_f64("avg_confidence") {
                average_confidence = avg_conf;
            }

            // Process confidence buckets
            if let Ok(buckets) = result_doc.get_array("confidence_buckets") {
                for bucket in buckets {
                    if let Ok(bucket_str) = bucket.as_str() {
                        *confidence_distribution.entry(bucket_str.to_string()).or_insert(0u64) += 1;
                    }
                }
            }
        }

        Ok(InferenceAnalytics {
            total_inferences,
            average_confidence,
            confidence_distribution,
            prediction_distribution: HashMap::new(), // Would implement similar aggregation
            accuracy_over_time: Vec::new(), // Would implement time series aggregation
            performance_metrics: HashMap::new(), // Would calculate additional metrics
        })
    }

    async fn search_inferences(&self, criteria: SearchCriteria) -> DatabaseResult<Vec<InferenceResult>> {
        let collection = self.database.collection::<InferenceDocument>("inferences");
        let mut filter = Document::new();

        // Build search filter
        if let Some(model_id) = criteria.model_id {
            filter.insert("model_id", model_id);
        }

        if let Some((min_conf, max_conf)) = criteria.confidence_range {
            filter.insert("confidence", doc! {
                "$gte": min_conf,
                "$lte": max_conf
            });
        }

        if let Some((start_date, end_date)) = criteria.date_range {
            filter.insert("timestamp", doc! {
                "$gte": Self::chrono_to_bson_datetime(start_date),
                "$lte": Self::chrono_to_bson_datetime(end_date)
            });
        }

        let find_options = FindOptions::builder()
            .limit(criteria.limit.map(|l| l as i64))
            .skip(criteria.offset.map(|o| o as u64))
            .sort(doc! { "timestamp": -1 })
            .build();

        let mut cursor = collection
            .find(filter, find_options)
            .await
            .map_err(|e| DatabaseError::QueryFailed(format!("Failed to search inferences: {}", e)))?;

        let mut results = Vec::new();
        while cursor.advance().await.map_err(|e| DatabaseError::QueryFailed(format!("Failed to iterate search results: {}", e)))? {
            let doc = cursor.deserialize_current()
                .map_err(|e| DatabaseError::SerializationError(format!("Failed to deserialize search result: {}", e)))?;
            
            let prediction: serde_json::Value = mongodb::bson::from_bson(doc.prediction)
                .map_err(|e| DatabaseError::SerializationError(format!("Failed to deserialize prediction: {}", e)))?;
            
            let feature_importance = self.document_to_hashmap(&doc.feature_importance)?;

            results.push(InferenceResult {
                model_id: doc.model_id,
                prediction,
                confidence: doc.confidence,
                probability_distribution: doc.probability_distribution,
                feature_importance,
                inference_time_ms: doc.inference_time_ms,
                timestamp: Self::bson_datetime_to_chrono(doc.timestamp),
            });
        }

        Ok(results)
    }
}

#[async_trait]
impl TrainingStorage for MongoDBAdapter {
    async fn save_training_result(&self, result: &TrainingResult) -> DatabaseResult<String> {
        let collection = self.database.collection::<TrainingDocument>("training_results");
        
        let training_doc = TrainingDocument {
            id: None,
            model_id: result.model_id.clone(),
            training_accuracy: result.training_accuracy,
            validation_accuracy: result.validation_accuracy,
            training_loss: result.training_loss,
            validation_loss: result.validation_loss,
            epochs_completed: result.epochs_completed,
            training_time_ms: result.training_time_ms,
            convergence_achieved: result.convergence_achieved,
            timestamp: Self::chrono_to_bson_datetime(chrono::Utc::now()),
            hyperparameters: Document::new(),
            metrics: Document::new(),
            experiment_id: None,
        };

        let insert_result = collection
            .insert_one(training_doc, None)
            .await
            .map_err(|e| DatabaseError::QueryFailed(format!("Failed to save training result: {}", e)))?;

        Ok(insert_result.inserted_id.as_object_id()
            .map(|oid| oid.to_hex())
            .unwrap_or_else(|| uuid::Uuid::new_v4().to_string()))
    }

    async fn get_training_history(&self, model_id: &str, limit: Option<u32>) -> DatabaseResult<Vec<TrainingResult>> {
        let collection = self.database.collection::<TrainingDocument>("training_results");
        
        let filter = doc! { "model_id": model_id };
        let find_options = FindOptions::builder()
            .sort(doc! { "timestamp": -1 })
            .limit(limit.map(|l| l as i64))
            .build();

        let mut cursor = collection
            .find(filter, find_options)
            .await
            .map_err(|e| DatabaseError::QueryFailed(format!("Failed to query training history: {}", e)))?;

        let mut results = Vec::new();
        while cursor.advance().await.map_err(|e| DatabaseError::QueryFailed(format!("Failed to iterate cursor: {}", e)))? {
            let doc = cursor.deserialize_current()
                .map_err(|e| DatabaseError::SerializationError(format!("Failed to deserialize training document: {}", e)))?;
            
            results.push(TrainingResult {
                model_id: doc.model_id,
                training_accuracy: doc.training_accuracy,
                validation_accuracy: doc.validation_accuracy,
                training_loss: doc.training_loss,
                validation_loss: doc.validation_loss,
                epochs_completed: doc.epochs_completed,
                training_time_ms: doc.training_time_ms,
                convergence_achieved: doc.convergence_achieved,
            });
        }

        Ok(results)
    }

    async fn save_training_dataset(&self, dataset: &TrainingDataset) -> DatabaseResult<String> {
        let collection = self.database.collection::<Document>("training_datasets");
        
        let metadata_doc = self.hashmap_to_document(&dataset.metadata)?;
        
        let dataset_doc = doc! {
            "dataset_id": &dataset.id,
            "name": &dataset.name,
            "description": &dataset.description,
            "features": &dataset.features,
            "target": &dataset.target,
            "size": dataset.size as i64,
            "created_at": Self::chrono_to_bson_datetime(dataset.created_at),
            "updated_at": Self::chrono_to_bson_datetime(dataset.updated_at),
            "metadata": metadata_doc
        };

        let update_options = UpdateOptions::builder()
            .upsert(true)
            .build();

        let _update_result = collection
            .update_one(
                doc! { "dataset_id": &dataset.id },
                doc! { "$set": dataset_doc },
                update_options
            )
            .await
            .map_err(|e| DatabaseError::QueryFailed(format!("Failed to save training dataset: {}", e)))?;

        Ok(dataset.id.clone())
    }

    async fn load_training_dataset(&self, dataset_id: &str) -> DatabaseResult<TrainingDataset> {
        let collection = self.database.collection::<Document>("training_datasets");
        
        let filter = doc! { "dataset_id": dataset_id };
        let result = collection
            .find_one(filter, None)
            .await
            .map_err(|e| DatabaseError::QueryFailed(format!("Failed to load training dataset: {}", e)))?;

        match result {
            Some(doc) => {
                let metadata_doc = doc.get_document("metadata")
                    .map_err(|e| DatabaseError::SerializationError(format!("Failed to get metadata: {}", e)))?;
                let metadata = self.document_to_hashmap(metadata_doc)?;

                Ok(TrainingDataset {
                    id: doc.get_str("dataset_id")
                        .map_err(|e| DatabaseError::SerializationError(e.to_string()))?
                        .to_string(),
                    name: doc.get_str("name")
                        .map_err(|e| DatabaseError::SerializationError(e.to_string()))?
                        .to_string(),
                    description: doc.get_str("description").ok().map(|s| s.to_string()),
                    features: doc.get_array("features")
                        .map_err(|e| DatabaseError::SerializationError(e.to_string()))?
                        .iter()
                        .filter_map(|v| v.as_str().map(|s| s.to_string()))
                        .collect(),
                    target: doc.get_str("target")
                        .map_err(|e| DatabaseError::SerializationError(e.to_string()))?
                        .to_string(),
                    size: doc.get_i64("size")
                        .map_err(|e| DatabaseError::SerializationError(e.to_string()))?
                        as u64,
                    created_at: Self::bson_datetime_to_chrono(
                        doc.get_datetime("created_at")
                            .map_err(|e| DatabaseError::SerializationError(e.to_string()))?
                            .clone()
                    ),
                    updated_at: Self::bson_datetime_to_chrono(
                        doc.get_datetime("updated_at")
                            .map_err(|e| DatabaseError::SerializationError(e.to_string()))?
                            .clone()
                    ),
                    metadata,
                })
            },
            None => Err(DatabaseError::NotFound(format!("Training dataset {} not found", dataset_id))),
        }
    }

    async fn save_experiment(&self, experiment: &MLExperiment) -> DatabaseResult<String> {
        let collection = self.database.collection::<ExperimentDocument>("experiments");
        
        let parameters_doc = self.hashmap_to_document(&experiment.parameters)?;
        let metrics_doc = mongodb::bson::to_document(&experiment.metrics)
            .map_err(|e| DatabaseError::SerializationError(format!("Failed to serialize metrics: {}", e)))?;

        let status_str = match experiment.status {
            ExperimentStatus::Running => "running",
            ExperimentStatus::Completed => "completed", 
            ExperimentStatus::Failed => "failed",
            ExperimentStatus::Cancelled => "cancelled",
        };

        let experiment_doc = ExperimentDocument {
            id: None,
            experiment_id: experiment.id.clone(),
            name: experiment.name.clone(),
            model_id: experiment.model_id.clone(),
            dataset_id: experiment.dataset_id.clone(),
            parameters: parameters_doc,
            metrics: metrics_doc,
            status: status_str.to_string(),
            start_time: Self::chrono_to_bson_datetime(experiment.start_time),
            end_time: experiment.end_time.map(Self::chrono_to_bson_datetime),
            notes: experiment.notes.clone(),
            tags: experiment.tags.clone(),
            metadata: Document::new(),
        };

        let update_options = UpdateOptions::builder()
            .upsert(true)
            .build();

        let _update_result = collection
            .update_one(
                doc! { "experiment_id": &experiment.id },
                doc! { "$set": mongodb::bson::to_document(&experiment_doc)
                    .map_err(|e| DatabaseError::SerializationError(format!("Failed to serialize experiment: {}", e)))? },
                update_options
            )
            .await
            .map_err(|e| DatabaseError::QueryFailed(format!("Failed to save experiment: {}", e)))?;

        Ok(experiment.id.clone())
    }

    async fn get_experiments(&self, filters: Option<ExperimentFilters>) -> DatabaseResult<Vec<MLExperiment>> {
        let collection = self.database.collection::<ExperimentDocument>("experiments");
        let mut filter = Document::new();

        // Apply filters
        if let Some(filters) = filters {
            if let Some(model_id) = filters.model_id {
                filter.insert("model_id", model_id);
            }

            if let Some(status) = filters.status {
                let status_str = match status {
                    ExperimentStatus::Running => "running",
                    ExperimentStatus::Completed => "completed",
                    ExperimentStatus::Failed => "failed",
                    ExperimentStatus::Cancelled => "cancelled",
                };
                filter.insert("status", status_str);
            }

            if let Some(start_date) = filters.start_date {
                if let Some(end_date) = filters.end_date {
                    filter.insert("start_time", doc! {
                        "$gte": Self::chrono_to_bson_datetime(start_date),
                        "$lte": Self::chrono_to_bson_datetime(end_date)
                    });
                } else {
                    filter.insert("start_time", doc! {
                        "$gte": Self::chrono_to_bson_datetime(start_date)
                    });
                }
            } else if let Some(end_date) = filters.end_date {
                filter.insert("start_time", doc! {
                    "$lte": Self::chrono_to_bson_datetime(end_date)
                });
            }

            if let Some(tags) = filters.tags {
                if !tags.is_empty() {
                    filter.insert("tags", doc! { "$in": tags });
                }
            }
        }

        let find_options = FindOptions::builder()
            .sort(doc! { "start_time": -1 })
            .build();

        let mut cursor = collection
            .find(filter, find_options)
            .await
            .map_err(|e| DatabaseError::QueryFailed(format!("Failed to query experiments: {}", e)))?;

        let mut results = Vec::new();
        while cursor.advance().await.map_err(|e| DatabaseError::QueryFailed(format!("Failed to iterate experiments: {}", e)))? {
            let doc = cursor.deserialize_current()
                .map_err(|e| DatabaseError::SerializationError(format!("Failed to deserialize experiment: {}", e)))?;
            
            let parameters = self.document_to_hashmap(&doc.parameters)?;
            let metrics: HashMap<String, f64> = mongodb::bson::from_document(doc.metrics)
                .map_err(|e| DatabaseError::SerializationError(format!("Failed to deserialize metrics: {}", e)))?;

            let status = match doc.status.as_str() {
                "running" => ExperimentStatus::Running,
                "completed" => ExperimentStatus::Completed,
                "failed" => ExperimentStatus::Failed,
                "cancelled" => ExperimentStatus::Cancelled,
                _ => ExperimentStatus::Failed,
            };

            results.push(MLExperiment {
                id: doc.experiment_id,
                name: doc.name,
                model_id: doc.model_id,
                dataset_id: doc.dataset_id,
                parameters,
                metrics,
                status,
                start_time: Self::bson_datetime_to_chrono(doc.start_time),
                end_time: doc.end_time.map(Self::bson_datetime_to_chrono),
                notes: doc.notes,
                tags: doc.tags,
            });
        }

        Ok(results)
    }
}

/// Extended MongoDB operations for ML use cases
impl MongoDBAdapter {
    /// Save model experiment data
    pub async fn save_model_experiment_data(&self, model_id: &str, experiment_data: &serde_json::Value) -> DatabaseResult<String> {
        let collection = self.database.collection::<Document>("model_experiments");
        
        let doc = doc! {
            "model_id": model_id,
            "experiment_data": mongodb::bson::to_bson(experiment_data)
                .map_err(|e| DatabaseError::SerializationError(format!("Failed to serialize experiment data: {}", e)))?,
            "timestamp": Self::chrono_to_bson_datetime(chrono::Utc::now())
        };

        let insert_result = collection
            .insert_one(doc, None)
            .await
            .map_err(|e| DatabaseError::QueryFailed(format!("Failed to save experiment data: {}", e)))?;

        Ok(insert_result.inserted_id.as_object_id()
            .map(|oid| oid.to_hex())
            .unwrap_or_else(|| uuid::Uuid::new_v4().to_string()))
    }

    /// Get collection statistics
    pub async fn get_collection_stats(&self) -> DatabaseResult<serde_json::Value> {
        let collections = vec!["inferences", "training_results", "experiments", "training_datasets"];
        let mut stats = serde_json::Map::new();

        for collection_name in collections {
            let collection = self.database.collection::<Document>(collection_name);
            
            let count = collection.estimated_document_count(None).await
                .map_err(|e| DatabaseError::QueryFailed(format!("Failed to count documents in {}: {}", collection_name, e)))?;
            
            stats.insert(format!("{}_count", collection_name), serde_json::Value::Number(count.into()));
        }

        Ok(serde_json::Value::Object(stats))
    }

    /// Health check
    pub async fn health_check(&self) -> DatabaseResult<serde_json::Value> {
        let start_time = std::time::Instant::now();
        
        // Test basic operations
        let test_collection = self.database.collection::<Document>("health_check");
        let test_doc = doc! {
            "test": "health_check",
            "timestamp": Self::chrono_to_bson_datetime(chrono::Utc::now())
        };
        
        let insert_result = test_collection
            .insert_one(test_doc.clone(), None)
            .await
            .map_err(|e| DatabaseError::QueryFailed(format!("Health check insert failed: {}", e)))?;

        let find_result = test_collection
            .find_one(doc! { "_id": insert_result.inserted_id }, None)
            .await
            .map_err(|e| DatabaseError::QueryFailed(format!("Health check find failed: {}", e)))?;

        let _delete_result = test_collection
            .delete_one(doc! { "_id": insert_result.inserted_id }, None)
            .await
            .map_err(|e| DatabaseError::QueryFailed(format!("Health check delete failed: {}", e)))?;
        
        let response_time = start_time.elapsed().as_millis();
        let is_healthy = find_result.is_some();
        
        Ok(serde_json::json!({
            "status": if is_healthy { "healthy" } else { "unhealthy" },
            "response_time_ms": response_time,
            "timestamp": chrono::Utc::now().to_rfc3339(),
            "operations_tested": ["insert", "find", "delete"],
            "database": self.database.name()
        }))
    }
}