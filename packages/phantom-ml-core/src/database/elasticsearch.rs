//! Elasticsearch adapter for phantom-ml-core
//! 
//! Provides Elasticsearch-based search, indexing, and analytics for ML data.

use async_trait::async_trait;
use elasticsearch::{
    Elasticsearch, 
    http::transport::{Transport, SingleNodeConnectionPool, TransportBuilder},
    http::{request::JsonBody, response::Response, Url},
    indices::{IndicesCreateParts, IndicesDeleteParts},
    SearchParts, IndexParts, GetParts, DeleteParts, BulkParts
};
use serde_json::{json, Value};
use std::collections::HashMap;

use super::interfaces::{
    SearchStorage, DatabaseConfig, DatabaseError, DatabaseResult,
    SearchQuery, SearchResults, SearchHit, AggregationQuery, AggregationResults,
    BulkOperation, BulkResults, BulkItemResult, SortOrder
};

/// Elasticsearch adapter for search and analytics
#[derive(Clone)]
pub struct ElasticsearchAdapter {
    client: Elasticsearch,
    config: DatabaseConfig,
}

impl ElasticsearchAdapter {
    /// Create a new Elasticsearch adapter
    pub async fn new(config: DatabaseConfig) -> DatabaseResult<Self> {
        let url = Url::parse(&config.connection_string)
            .map_err(|e| DatabaseError::ConnectionFailed(format!("Invalid Elasticsearch URL: {}", e)))?;
        
        let conn_pool = SingleNodeConnectionPool::new(url);
        let transport = TransportBuilder::new(conn_pool)
            .timeout(std::time::Duration::from_secs(config.timeout_seconds.unwrap_or(30)))
            .build()
            .map_err(|e| DatabaseError::ConnectionFailed(format!("Failed to build transport: {}", e)))?;
            
        let client = Elasticsearch::new(transport);

        let adapter = Self {
            client,
            config,
        };

        // Test connection
        adapter.test_connection().await?;
        
        // Initialize indexes
        adapter.initialize_indexes().await?;
        
        Ok(adapter)
    }

    /// Test Elasticsearch connection
    async fn test_connection(&self) -> DatabaseResult<()> {
        let response = self.client
            .ping()
            .send()
            .await
            .map_err(|e| DatabaseError::ConnectionFailed(format!("Elasticsearch ping failed: {}", e)))?;

        if !response.status_code().is_success() {
            return Err(DatabaseError::ConnectionFailed(
                format!("Elasticsearch ping returned status: {}", response.status_code())
            ));
        }

        Ok(())
    }

    /// Initialize ML-related indexes
    async fn initialize_indexes(&self) -> DatabaseResult<()> {
        // Model metadata index
        let model_mapping = json!({
            "mappings": {
                "properties": {
                    "model_id": { "type": "keyword" },
                    "name": { "type": "text", "analyzer": "standard" },
                    "model_type": { "type": "keyword" },
                    "algorithm": { "type": "keyword" },
                    "version": { "type": "keyword" },
                    "accuracy": { "type": "float" },
                    "precision": { "type": "float" },
                    "recall": { "type": "float" },
                    "f1_score": { "type": "float" },
                    "created_at": { "type": "date" },
                    "last_trained": { "type": "date" },
                    "last_used": { "type": "date" },
                    "training_samples": { "type": "long" },
                    "feature_count": { "type": "integer" },
                    "status": { "type": "keyword" },
                    "tags": { "type": "keyword" },
                    "performance_metrics": { "type": "object", "enabled": false },
                    "description": { "type": "text", "analyzer": "standard" }
                }
            },
            "settings": {
                "number_of_shards": 1,
                "number_of_replicas": 0,
                "index.max_result_window": 50000
            }
        });

        self.create_index("ml-models", Some(&model_mapping)).await?;

        // Inference results index
        let inference_mapping = json!({
            "mappings": {
                "properties": {
                    "model_id": { "type": "keyword" },
                    "prediction": { "type": "object", "enabled": false },
                    "confidence": { "type": "float" },
                    "probability_distribution": { "type": "float" },
                    "feature_importance": { "type": "object", "enabled": false },
                    "inference_time_ms": { "type": "long" },
                    "timestamp": { "type": "date" },
                    "input_features": { "type": "object", "enabled": false },
                    "session_id": { "type": "keyword" },
                    "user_id": { "type": "keyword" },
                    "prediction_type": { "type": "keyword" },
                    "result_category": { "type": "keyword" }
                }
            },
            "settings": {
                "number_of_shards": 2,
                "number_of_replicas": 0,
                "index.max_result_window": 50000
            }
        });

        self.create_index("ml-inferences", Some(&inference_mapping)).await?;

        // Training results index
        let training_mapping = json!({
            "mappings": {
                "properties": {
                    "model_id": { "type": "keyword" },
                    "training_accuracy": { "type": "float" },
                    "validation_accuracy": { "type": "float" },
                    "training_loss": { "type": "float" },
                    "validation_loss": { "type": "float" },
                    "epochs_completed": { "type": "integer" },
                    "training_time_ms": { "type": "long" },
                    "convergence_achieved": { "type": "boolean" },
                    "timestamp": { "type": "date" },
                    "hyperparameters": { "type": "object", "enabled": false },
                    "metrics": { "type": "object", "enabled": false },
                    "experiment_id": { "type": "keyword" },
                    "dataset_id": { "type": "keyword" }
                }
            },
            "settings": {
                "number_of_shards": 1,
                "number_of_replicas": 0
            }
        });

        self.create_index("ml-training", Some(&training_mapping)).await?;

        // ML experiments index
        let experiment_mapping = json!({
            "mappings": {
                "properties": {
                    "experiment_id": { "type": "keyword" },
                    "name": { "type": "text", "analyzer": "standard" },
                    "model_id": { "type": "keyword" },
                    "dataset_id": { "type": "keyword" },
                    "parameters": { "type": "object", "enabled": false },
                    "metrics": { "type": "object", "enabled": false },
                    "status": { "type": "keyword" },
                    "start_time": { "type": "date" },
                    "end_time": { "type": "date" },
                    "duration_ms": { "type": "long" },
                    "notes": { "type": "text", "analyzer": "standard" },
                    "tags": { "type": "keyword" },
                    "user_id": { "type": "keyword" },
                    "success": { "type": "boolean" }
                }
            },
            "settings": {
                "number_of_shards": 1,
                "number_of_replicas": 0
            }
        });

        self.create_index("ml-experiments", Some(&experiment_mapping)).await?;

        // Analytics index for aggregated metrics
        let analytics_mapping = json!({
            "mappings": {
                "properties": {
                    "metric_type": { "type": "keyword" },
                    "model_id": { "type": "keyword" },
                    "timestamp": { "type": "date" },
                    "time_bucket": { "type": "keyword" },
                    "value": { "type": "float" },
                    "count": { "type": "long" },
                    "metadata": { "type": "object", "enabled": false }
                }
            },
            "settings": {
                "number_of_shards": 1,
                "number_of_replicas": 0
            }
        });

        self.create_index("ml-analytics", Some(&analytics_mapping)).await?;

        Ok(())
    }

    /// Convert search response to SearchResults
    async fn parse_search_response(&self, response: Response) -> DatabaseResult<SearchResults> {
        let response_body: Value = response
            .json()
            .await
            .map_err(|e| DatabaseError::SerializationError(format!("Failed to parse search response: {}", e)))?;

        let hits_data = response_body["hits"].as_object()
            .ok_or_else(|| DatabaseError::SerializationError("Invalid search response format".to_string()))?;

        let total = hits_data["total"]["value"].as_u64().unwrap_or(0);
        let took = response_body["took"].as_u64().unwrap_or(0);
        let timed_out = response_body["timed_out"].as_bool().unwrap_or(false);

        let hits_array = hits_data["hits"].as_array()
            .ok_or_else(|| DatabaseError::SerializationError("Invalid hits format in search response".to_string()))?;

        let mut hits = Vec::new();
        for hit in hits_array {
            let id = hit["_id"].as_str().unwrap_or("").to_string();
            let score = hit["_score"].as_f64().unwrap_or(0.0);
            let source = hit["_source"].clone();
            
            let highlight = hit["highlight"].as_object()
                .map(|h| {
                    h.iter()
                        .map(|(k, v)| (
                            k.clone(),
                            v.as_array()
                                .map(|arr| arr.iter().filter_map(|v| v.as_str().map(|s| s.to_string())).collect())
                                .unwrap_or_default()
                        ))
                        .collect()
                });

            hits.push(SearchHit {
                id,
                score,
                source,
                highlight,
            });
        }

        Ok(SearchResults {
            total,
            hits,
            took,
            timed_out,
        })
    }

    /// Convert aggregation response to AggregationResults
    async fn parse_aggregation_response(&self, response: Response) -> DatabaseResult<AggregationResults> {
        let response_body: Value = response
            .json()
            .await
            .map_err(|e| DatabaseError::SerializationError(format!("Failed to parse aggregation response: {}", e)))?;

        let took = response_body["took"].as_u64().unwrap_or(0);
        let aggregations = response_body["aggregations"].as_object()
            .map(|agg| agg.iter().map(|(k, v)| (k.clone(), v.clone())).collect())
            .unwrap_or_default();

        Ok(AggregationResults {
            aggregations,
            took,
        })
    }
}

#[async_trait]
impl SearchStorage for ElasticsearchAdapter {
    async fn index_document(&self, index: &str, id: &str, document: &Value) -> DatabaseResult<()> {
        let response = self.client
            .index(IndexParts::IndexId(index, id))
            .body(document)
            .refresh(elasticsearch::params::Refresh::WaitFor)
            .send()
            .await
            .map_err(|e| DatabaseError::QueryFailed(format!("Failed to index document: {}", e)))?;

        if !response.status_code().is_success() {
            return Err(DatabaseError::QueryFailed(
                format!("Index operation failed with status: {}", response.status_code())
            ));
        }

        Ok(())
    }

    async fn search(&self, query: &SearchQuery) -> DatabaseResult<SearchResults> {
        let mut search_body = json!({
            "query": query.query
        });

        // Add size and from parameters
        if let Some(size) = query.size {
            search_body["size"] = json!(size);
        }
        if let Some(from) = query.from {
            search_body["from"] = json!(from);
        }

        // Add sorting
        if let Some(sort) = &query.sort {
            let sort_array: Vec<Value> = sort.iter().map(|sort_field| {
                let order = match sort_field.order {
                    SortOrder::Asc => "asc",
                    SortOrder::Desc => "desc",
                };
                json!({ sort_field.field: { "order": order } })
            }).collect();
            search_body["sort"] = json!(sort_array);
        }

        // Add highlighting
        if let Some(highlight) = &query.highlight {
            let mut highlight_config = json!({
                "fields": {}
            });
            
            for field in &highlight.fields {
                highlight_config["fields"][field] = json!({});
            }
            
            if let Some(fragment_size) = highlight.fragment_size {
                highlight_config["fragment_size"] = json!(fragment_size);
            }
            
            if let Some(number_of_fragments) = highlight.number_of_fragments {
                highlight_config["number_of_fragments"] = json!(number_of_fragments);
            }
            
            search_body["highlight"] = highlight_config;
        }

        let response = self.client
            .search(SearchParts::Index(&[&query.index]))
            .body(search_body)
            .send()
            .await
            .map_err(|e| DatabaseError::QueryFailed(format!("Search request failed: {}", e)))?;

        if !response.status_code().is_success() {
            return Err(DatabaseError::QueryFailed(
                format!("Search failed with status: {}", response.status_code())
            ));
        }

        self.parse_search_response(response).await
    }

    async fn create_index(&self, index: &str, mapping: Option<&Value>) -> DatabaseResult<()> {
        // Check if index already exists
        let exists_response = self.client
            .indices()
            .exists(IndicesCreateParts::Index(index))
            .send()
            .await
            .map_err(|e| DatabaseError::QueryFailed(format!("Failed to check index existence: {}", e)))?;

        if exists_response.status_code().is_success() {
            // Index already exists
            return Ok(());
        }

        let mut create_request = self.client
            .indices()
            .create(IndicesCreateParts::Index(index));

        if let Some(mapping) = mapping {
            create_request = create_request.body(mapping);
        }

        let response = create_request
            .send()
            .await
            .map_err(|e| DatabaseError::QueryFailed(format!("Failed to create index: {}", e)))?;

        if !response.status_code().is_success() {
            return Err(DatabaseError::QueryFailed(
                format!("Create index failed with status: {}", response.status_code())
            ));
        }

        Ok(())
    }

    async fn delete_index(&self, index: &str) -> DatabaseResult<()> {
        let response = self.client
            .indices()
            .delete(IndicesDeleteParts::Index(&[index]))
            .send()
            .await
            .map_err(|e| DatabaseError::QueryFailed(format!("Failed to delete index: {}", e)))?;

        if !response.status_code().is_success() && response.status_code().as_u16() != 404 {
            return Err(DatabaseError::QueryFailed(
                format!("Delete index failed with status: {}", response.status_code())
            ));
        }

        Ok(())
    }

    async fn aggregate(&self, aggregation_query: &AggregationQuery) -> DatabaseResult<AggregationResults> {
        let mut search_body = json!({
            "size": 0,
            "aggs": aggregation_query.aggregations
        });

        if let Some(query) = &aggregation_query.query {
            search_body["query"] = query.clone();
        }

        let response = self.client
            .search(SearchParts::Index(&[&aggregation_query.index]))
            .body(search_body)
            .send()
            .await
            .map_err(|e| DatabaseError::QueryFailed(format!("Aggregation request failed: {}", e)))?;

        if !response.status_code().is_success() {
            return Err(DatabaseError::QueryFailed(
                format!("Aggregation failed with status: {}", response.status_code())
            ));
        }

        self.parse_aggregation_response(response).await
    }

    async fn get_document(&self, index: &str, id: &str) -> DatabaseResult<Option<Value>> {
        let response = self.client
            .get(GetParts::IndexId(index, id))
            .send()
            .await
            .map_err(|e| DatabaseError::QueryFailed(format!("Get document request failed: {}", e)))?;

        match response.status_code().as_u16() {
            200 => {
                let response_body: Value = response
                    .json()
                    .await
                    .map_err(|e| DatabaseError::SerializationError(format!("Failed to parse get response: {}", e)))?;
                
                Ok(Some(response_body["_source"].clone()))
            },
            404 => Ok(None),
            _ => Err(DatabaseError::QueryFailed(
                format!("Get document failed with status: {}", response.status_code())
            ))
        }
    }

    async fn bulk_index(&self, operations: &[BulkOperation]) -> DatabaseResult<BulkResults> {
        let mut body_lines = Vec::new();

        for operation in operations {
            match operation {
                BulkOperation::Index { index, id, document } => {
                    body_lines.push(json!({
                        "index": {
                            "_index": index,
                            "_id": id
                        }
                    }));
                    body_lines.push(document.clone());
                },
                BulkOperation::Update { index, id, document } => {
                    body_lines.push(json!({
                        "update": {
                            "_index": index,
                            "_id": id
                        }
                    }));
                    body_lines.push(json!({
                        "doc": document
                    }));
                },
                BulkOperation::Delete { index, id } => {
                    body_lines.push(json!({
                        "delete": {
                            "_index": index,
                            "_id": id
                        }
                    }));
                }
            }
        }

        let body: Vec<JsonBody<_>> = body_lines
            .into_iter()
            .map(|line| JsonBody::new(line))
            .collect();

        let response = self.client
            .bulk(BulkParts::None)
            .body(body)
            .refresh(elasticsearch::params::Refresh::WaitFor)
            .send()
            .await
            .map_err(|e| DatabaseError::QueryFailed(format!("Bulk request failed: {}", e)))?;

        if !response.status_code().is_success() {
            return Err(DatabaseError::QueryFailed(
                format!("Bulk operation failed with status: {}", response.status_code())
            ));
        }

        let response_body: Value = response
            .json()
            .await
            .map_err(|e| DatabaseError::SerializationError(format!("Failed to parse bulk response: {}", e)))?;

        let took = response_body["took"].as_u64().unwrap_or(0);
        let errors = response_body["errors"].as_bool().unwrap_or(false);
        
        let mut items = Vec::new();
        if let Some(items_array) = response_body["items"].as_array() {
            for item in items_array {
                // Extract the first operation from the item
                if let Some((operation, details)) = item.as_object().and_then(|obj| obj.iter().next()) {
                    let id = details["_id"].as_str().unwrap_or("").to_string();
                    let status = details["status"].as_u64().unwrap_or(500) as u16;
                    let error = details["error"]["reason"].as_str().map(|s| s.to_string());

                    items.push(BulkItemResult {
                        operation: operation.clone(),
                        id,
                        status,
                        error,
                    });
                }
            }
        }

        Ok(BulkResults {
            took,
            errors,
            items,
        })
    }
}

/// Extended Elasticsearch operations for ML use cases
impl ElasticsearchAdapter {
    /// Index a model for search
    pub async fn index_model(&self, model_id: &str, model_data: &Value) -> DatabaseResult<()> {
        let mut enhanced_data = model_data.clone();
        enhanced_data["indexed_at"] = json!(chrono::Utc::now().to_rfc3339());
        
        self.index_document("ml-models", model_id, &enhanced_data).await
    }

    /// Search models with advanced filtering
    pub async fn search_models(&self, search_text: Option<&str>, filters: HashMap<String, Value>) -> DatabaseResult<SearchResults> {
        let mut query = json!({
            "bool": {
                "must": [],
                "filter": []
            }
        });

        // Add text search
        if let Some(text) = search_text {
            query["bool"]["must"].as_array_mut().unwrap().push(json!({
                "multi_match": {
                    "query": text,
                    "fields": ["name^2", "description", "tags"],
                    "type": "best_fields",
                    "fuzziness": "AUTO"
                }
            }));
        } else {
            query["bool"]["must"].as_array_mut().unwrap().push(json!({
                "match_all": {}
            }));
        }

        // Add filters
        for (field, value) in filters {
            match field.as_str() {
                "accuracy_min" => {
                    query["bool"]["filter"].as_array_mut().unwrap().push(json!({
                        "range": {
                            "accuracy": { "gte": value }
                        }
                    }));
                },
                "model_type" => {
                    query["bool"]["filter"].as_array_mut().unwrap().push(json!({
                        "term": { "model_type": value }
                    }));
                },
                "algorithm" => {
                    query["bool"]["filter"].as_array_mut().unwrap().push(json!({
                        "term": { "algorithm": value }
                    }));
                },
                "status" => {
                    query["bool"]["filter"].as_array_mut().unwrap().push(json!({
                        "term": { "status": value }
                    }));
                },
                "created_after" => {
                    query["bool"]["filter"].as_array_mut().unwrap().push(json!({
                        "range": {
                            "created_at": { "gte": value }
                        }
                    }));
                },
                _ => {} // Ignore unknown filters
            }
        }

        let search_query = SearchQuery {
            index: "ml-models".to_string(),
            query,
            size: Some(50),
            from: None,
            sort: Some(vec![super::interfaces::SortField {
                field: "_score".to_string(),
                order: SortOrder::Desc,
            }]),
            highlight: Some(super::interfaces::HighlightConfig {
                fields: vec!["name".to_string(), "description".to_string()],
                fragment_size: Some(100),
                number_of_fragments: Some(1),
            }),
        };

        self.search(&search_query).await
    }

    /// Get model performance analytics
    pub async fn get_model_performance_analytics(&self, model_id: Option<&str>) -> DatabaseResult<AggregationResults> {
        let mut aggregations = json!({
            "accuracy_stats": {
                "stats": { "field": "accuracy" }
            },
            "model_types": {
                "terms": { "field": "model_type", "size": 10 }
            },
            "algorithms": {
                "terms": { "field": "algorithm", "size": 10 }
            },
            "performance_histogram": {
                "histogram": {
                    "field": "f1_score",
                    "interval": 0.1
                }
            },
            "created_over_time": {
                "date_histogram": {
                    "field": "created_at",
                    "calendar_interval": "1d"
                }
            }
        });

        let query = if let Some(model_id) = model_id {
            Some(json!({
                "term": { "model_id": model_id }
            }))
        } else {
            None
        };

        let agg_query = AggregationQuery {
            index: "ml-models".to_string(),
            aggregations: aggregations.as_object().unwrap().clone().into_iter().collect(),
            query,
        };

        self.aggregate(&agg_query).await
    }

    /// Index inference result with enhanced metadata
    pub async fn index_inference(&self, model_id: &str, inference_data: &Value) -> DatabaseResult<String> {
        let inference_id = uuid::Uuid::new_v4().to_string();
        let mut enhanced_data = inference_data.clone();
        
        enhanced_data["indexed_at"] = json!(chrono::Utc::now().to_rfc3339());
        enhanced_data["model_id"] = json!(model_id);
        
        // Add categorization based on confidence
        if let Some(confidence) = inference_data["confidence"].as_f64() {
            enhanced_data["confidence_category"] = if confidence > 0.8 {
                json!("high")
            } else if confidence > 0.6 {
                json!("medium")
            } else {
                json!("low")
            };
        }

        self.index_document("ml-inferences", &inference_id, &enhanced_data).await?;
        Ok(inference_id)
    }

    /// Search inferences with complex queries
    pub async fn search_inferences(&self, model_id: Option<&str>, confidence_range: Option<(f64, f64)>, limit: Option<u32>) -> DatabaseResult<SearchResults> {
        let mut query = json!({
            "bool": {
                "must": [],
                "filter": []
            }
        });

        // Add model filter
        if let Some(model_id) = model_id {
            query["bool"]["filter"].as_array_mut().unwrap().push(json!({
                "term": { "model_id": model_id }
            }));
        }

        // Add confidence range filter
        if let Some((min_conf, max_conf)) = confidence_range {
            query["bool"]["filter"].as_array_mut().unwrap().push(json!({
                "range": {
                    "confidence": {
                        "gte": min_conf,
                        "lte": max_conf
                    }
                }
            }));
        }

        if query["bool"]["filter"].as_array().unwrap().is_empty() {
            query = json!({ "match_all": {} });
        }

        let search_query = SearchQuery {
            index: "ml-inferences".to_string(),
            query,
            size: limit,
            from: None,
            sort: Some(vec![super::interfaces::SortField {
                field: "timestamp".to_string(),
                order: SortOrder::Desc,
            }]),
            highlight: None,
        };

        self.search(&search_query).await
    }

    /// Get inference analytics
    pub async fn get_inference_analytics(&self, model_id: Option<&str>, time_range: Option<&str>) -> DatabaseResult<AggregationResults> {
        let mut query_filter = json!({ "match_all": {} });
        
        if let Some(model_id) = model_id {
            query_filter = json!({
                "bool": {
                    "must": [
                        { "term": { "model_id": model_id } }
                    ]
                }
            });
            
            if let Some(time_range) = time_range {
                query_filter["bool"]["must"].as_array_mut().unwrap().push(json!({
                    "range": {
                        "timestamp": {
                            "gte": format!("now-{}", time_range)
                        }
                    }
                }));
            }
        }

        let aggregations = json!({
            "confidence_distribution": {
                "histogram": {
                    "field": "confidence",
                    "interval": 0.1
                }
            },
            "confidence_stats": {
                "stats": { "field": "confidence" }
            },
            "inference_time_stats": {
                "stats": { "field": "inference_time_ms" }
            },
            "predictions_over_time": {
                "date_histogram": {
                    "field": "timestamp",
                    "calendar_interval": "1h"
                }
            },
            "model_usage": {
                "terms": {
                    "field": "model_id",
                    "size": 10
                }
            }
        });

        let agg_query = AggregationQuery {
            index: "ml-inferences".to_string(),
            aggregations: aggregations.as_object().unwrap().clone().into_iter().collect(),
            query: Some(query_filter),
        };

        self.aggregate(&agg_query).await
    }

    /// Index training result
    pub async fn index_training_result(&self, model_id: &str, training_data: &Value) -> DatabaseResult<String> {
        let training_id = uuid::Uuid::new_v4().to_string();
        let mut enhanced_data = training_data.clone();
        
        enhanced_data["indexed_at"] = json!(chrono::Utc::now().to_rfc3339());
        enhanced_data["model_id"] = json!(model_id);

        self.index_document("ml-training", &training_id, &enhanced_data).await?;
        Ok(training_id)
    }

    /// Index ML experiment
    pub async fn index_experiment(&self, experiment_data: &Value) -> DatabaseResult<String> {
        let experiment_id = experiment_data["experiment_id"]
            .as_str()
            .unwrap_or(&uuid::Uuid::new_v4().to_string())
            .to_string();
            
        let mut enhanced_data = experiment_data.clone();
        enhanced_data["indexed_at"] = json!(chrono::Utc::now().to_rfc3339());

        self.index_document("ml-experiments", &experiment_id, &enhanced_data).await?;
        Ok(experiment_id)
    }

    /// Health check
    pub async fn health_check(&self) -> DatabaseResult<Value> {
        let start_time = std::time::Instant::now();
        
        // Test cluster health
        let health_response = self.client
            .cluster()
            .health(elasticsearch::cluster::ClusterHealthParts::None)
            .send()
            .await
            .map_err(|e| DatabaseError::QueryFailed(format!("Health check failed: {}", e)))?;

        let response_time = start_time.elapsed().as_millis();
        
        if health_response.status_code().is_success() {
            let health_data: Value = health_response
                .json()
                .await
                .map_err(|e| DatabaseError::SerializationError(format!("Failed to parse health response: {}", e)))?;

            Ok(json!({
                "status": "healthy",
                "response_time_ms": response_time,
                "cluster_status": health_data["status"],
                "number_of_nodes": health_data["number_of_nodes"],
                "number_of_data_nodes": health_data["number_of_data_nodes"],
                "active_primary_shards": health_data["active_primary_shards"],
                "active_shards": health_data["active_shards"],
                "timestamp": chrono::Utc::now().to_rfc3339()
            }))
        } else {
            Ok(json!({
                "status": "unhealthy",
                "response_time_ms": response_time,
                "error": format!("Health check returned status: {}", health_response.status_code()),
                "timestamp": chrono::Utc::now().to_rfc3339()
            }))
        }
    }
}