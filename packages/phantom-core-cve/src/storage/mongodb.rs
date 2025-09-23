// MongoDB storage implementation with database engineering best practices
#[cfg(feature = "mongodb")]
use mongodb::{
    Client, Collection, Database,
    bson::{doc, Document, to_bson},
    options::{ClientOptions, IndexOptions, InsertManyOptions, FindOptions, UpdateOptions},
    IndexModel,
};
use async_trait::async_trait;
use crate::config::MongoDbConfig;
use crate::models::{CVE, CVEAnalysisResult, SearchCriteria};
use super::traits::{Storage, StorageStatistics, HealthStatus};
use super::StorageError;
use chrono::Utc;
use std::time::Duration;

/// MongoDB storage implementation with connection pooling and best practices
pub struct MongoDbStorage {
    #[cfg(feature = "mongodb")]
    client: Client,
    #[cfg(feature = "mongodb")]
    database: Database,
    config: MongoDbConfig,
    cve_collection_name: String,
    analysis_collection_name: String,
}

impl MongoDbStorage {
    pub async fn new(config: &MongoDbConfig) -> Result<Self, StorageError> {
        #[cfg(feature = "mongodb")]
        {
            // Parse connection string and configure client options with best practices
            let mut client_options = ClientOptions::parse(&config.connection_string).await
                .map_err(|e| StorageError::ConnectionError(format!("Failed to parse MongoDB connection string: {}", e)))?;
            
            // Connection pooling best practices
            client_options.max_pool_size = Some(config.max_pool_size);
            client_options.min_pool_size = Some(1);
            client_options.max_idle_time = Some(Duration::from_secs(300)); // 5 minutes
            client_options.server_selection_timeout = Some(Duration::from_secs(config.timeout_seconds));
            client_options.connect_timeout = Some(Duration::from_secs(10));
            
            // Reliability best practices
            client_options.retry_writes = Some(true);
            client_options.retry_reads = Some(true);
            client_options.heartbeat_freq = Some(Duration::from_secs(10));
            
            // Create client with optimized settings
            let client = Client::with_options(client_options)
                .map_err(|e| StorageError::ConnectionError(format!("Failed to create MongoDB client: {}", e)))?;

            let database = client.database(&config.database);
            
            let storage = MongoDbStorage {
                client,
                database,
                config: config.clone(),
                cve_collection_name: format!("{}_cves", config.collection_prefix),
                analysis_collection_name: format!("{}_analyses", config.collection_prefix),
            };

            // Test connection
            storage.test_connection().await?;
            
            Ok(storage)
        }
        
        #[cfg(not(feature = "mongodb"))]
        {
            Err(StorageError::DatabaseError("MongoDB feature not enabled".to_string()))
        }
    }

    #[cfg(feature = "mongodb")]
    async fn test_connection(&self) -> Result<(), StorageError> {
        self.database.run_command(doc! {"ping": 1}, None).await
            .map_err(|e| StorageError::ConnectionError(format!("MongoDB connection test failed: {}", e)))?;
        Ok(())
    }

    #[cfg(feature = "mongodb")]
    fn cve_collection(&self) -> Collection<CVE> {
        self.database.collection(&self.cve_collection_name)
    }

    #[cfg(feature = "mongodb")]
    fn analysis_collection(&self) -> Collection<CVEAnalysisResult> {
        self.database.collection(&self.analysis_collection_name)
    }

    #[cfg(feature = "mongodb")]
    async fn ensure_indexes(&self) -> Result<(), StorageError> {
        // CVE collection indexes for optimal query performance
        let cve_indexes = vec![
            IndexModel::builder()
                .keys(doc! {"id": 1})
                .options(IndexOptions::builder().unique(true).build())
                .build(),
            IndexModel::builder()
                .keys(doc! {"published_date": -1})
                .build(),
            IndexModel::builder()
                .keys(doc! {"last_modified_date": -1})
                .build(),
            IndexModel::builder()
                .keys(doc! {"cvss_metrics.base_score": -1})
                .build(),
            IndexModel::builder()
                .keys(doc! {"status": 1})
                .build(),
            // Compound index for common queries
            IndexModel::builder()
                .keys(doc! {"status": 1, "published_date": -1})
                .build(),
            // Text index for full-text search
            IndexModel::builder()
                .keys(doc! {"$**": "text"})
                .build(),
        ];

        // Analysis collection indexes
        let analysis_indexes = vec![
            IndexModel::builder()
                .keys(doc! {"cve_id": 1})
                .options(IndexOptions::builder().unique(true).build())
                .build(),
            IndexModel::builder()
                .keys(doc! {"analysis_date": -1})
                .build(),
            IndexModel::builder()
                .keys(doc! {"vulnerability_score": -1})
                .build(),
            IndexModel::builder()
                .keys(doc! {"exploit_likelihood": -1})
                .build(),
        ];

        // Create indexes with error handling
        self.cve_collection().create_indexes(cve_indexes, None).await
            .map_err(|e| StorageError::DatabaseError(format!("Failed to create CVE indexes: {}", e)))?;

        self.analysis_collection().create_indexes(analysis_indexes, None).await
            .map_err(|e| StorageError::DatabaseError(format!("Failed to create analysis indexes: {}", e)))?;

        Ok(())
    }

    #[cfg(not(feature = "mongodb"))]
    fn unimplemented<T>() -> Result<T, StorageError> {
        Err(StorageError::DatabaseError("MongoDB feature not enabled".to_string()))
    }
}

#[async_trait]
impl Storage for MongoDbStorage {
    async fn store_analysis(&self, result: &CVEAnalysisResult) -> Result<(), StorageError> {
        #[cfg(feature = "mongodb")]
        {
            let collection = self.analysis_collection();
            
            // Use upsert with retry logic for reliability
            let filter = doc! {"cve.id": &result.cve.id()};
            let update = doc! {"$set": to_bson(result).map_err(|e| 
                StorageError::SerializationError(format!("Failed to serialize analysis result: {}", e)))?};
            
            let options = UpdateOptions::builder().upsert(true).build();
            
            collection.update_one(filter, update, options).await
                .map_err(|e| StorageError::DatabaseError(format!("Failed to store analysis: {}", e)))?;
            
            Ok(())
        }
        
        #[cfg(not(feature = "mongodb"))]
        MongoDbStorage::unimplemented()
    }

    async fn store_analysis_batch(&self, results: &[CVEAnalysisResult]) -> Result<(), StorageError> {
        #[cfg(feature = "mongodb")]
        {
            if results.is_empty() {
                return Ok(());
            }

            let collection = self.analysis_collection();
            
            // Use ordered=false for better performance and partial success handling
            let options = InsertManyOptions::builder().ordered(false).build();
            
            // Convert to documents for bulk insert
            let documents: Vec<CVEAnalysisResult> = results.iter().cloned().collect();
            
            match collection.insert_many(documents, options).await {
                Ok(_) => Ok(()),
                Err(e) => {
                    // Handle bulk write errors gracefully
                    if e.to_string().contains("duplicate key") {
                        // Try upsert for duplicates
                        for result in results {
                            let _ = self.store_analysis(result).await; // Individual upserts
                        }
                        Ok(())
                    } else {
                        Err(StorageError::DatabaseError(format!("Batch insert failed: {}", e)))
                    }
                }
            }
        }
        
        #[cfg(not(feature = "mongodb"))]
        MongoDbStorage::unimplemented()
    }

    async fn get_analysis(&self, cve_id: &str) -> Result<Option<CVEAnalysisResult>, StorageError> {
        #[cfg(feature = "mongodb")]
        {
            let collection = self.analysis_collection();
            let filter = doc! {"cve.id": cve_id};
            
            let result = collection.find_one(filter, None).await
                .map_err(|e| StorageError::DatabaseError(format!("Failed to get analysis: {}", e)))?;
            
            Ok(result)
        }
        
        #[cfg(not(feature = "mongodb"))]
        MongoDbStorage::unimplemented()
    }

    async fn get_analysis_batch(&self, cve_ids: &[String]) -> Result<Vec<CVEAnalysisResult>, StorageError> {
        #[cfg(feature = "mongodb")]
        {
            let collection = self.analysis_collection();
            let filter = doc! {"cve.id": {"$in": cve_ids}};
            
            let mut cursor = collection.find(filter, None).await
                .map_err(|e| StorageError::DatabaseError(format!("Failed to get analysis batch: {}", e)))?;
            
            let mut results = Vec::new();
            while cursor.advance().await.map_err(|e| StorageError::DatabaseError(e.to_string()))? {
                let doc = cursor.deserialize_current()
                    .map_err(|e| StorageError::SerializationError(format!("Failed to deserialize analysis: {}", e)))?;
                results.push(doc);
            }
            
            Ok(results)
        }
        
        #[cfg(not(feature = "mongodb"))]
        MongoDbStorage::unimplemented()
    }

    async fn search_analyses(&self, criteria: &SearchCriteria) -> Result<Vec<CVEAnalysisResult>, StorageError> {
        #[cfg(feature = "mongodb")]
        {
            let collection = self.analysis_collection();
            let mut filter = Document::new();
            
            // Build search filter based on criteria
            if let Some(ref cve_id) = criteria.cve_id {
                filter.insert("cve.id", cve_id);
            }
            
            if let Some(score_min) = criteria.severity_min {
                filter.insert("assessment.impact_score", doc! {"$gte": score_min});
            }
            
            if let Some(score_max) = criteria.severity_max {
                filter.insert("assessment.impact_score", doc! {"$lte": score_max});
            }
            
            if let Some(exploit_available) = criteria.exploit_available {
                filter.insert("assessment.exploit_available", exploit_available);
            }
            
            if let Some(in_the_wild) = criteria.in_the_wild {
                filter.insert("assessment.in_the_wild", in_the_wild);
            }

            let options = FindOptions::builder()
                .sort(doc! {"processing_timestamp": -1})
                .build();
            
            let mut cursor = collection.find(filter, options).await
                .map_err(|e| StorageError::DatabaseError(format!("Failed to search analyses: {}", e)))?;
            
            let mut results = Vec::new();
            while cursor.advance().await.map_err(|e| StorageError::DatabaseError(e.to_string()))? {
                let doc = cursor.deserialize_current()
                    .map_err(|e| StorageError::SerializationError(format!("Failed to deserialize analysis: {}", e)))?;
                results.push(doc);
            }
            
            Ok(results)
        }
        
        #[cfg(not(feature = "mongodb"))]
        MongoDbStorage::unimplemented()
    }

    async fn store_cve(&self, cve: &CVE) -> Result<(), StorageError> {
        #[cfg(feature = "mongodb")]
        {
            let collection = self.cve_collection();
            
            let filter = doc! {"id": &cve.id()};
            let update = doc! {"$set": to_bson(cve).map_err(|e| 
                StorageError::SerializationError(format!("Failed to serialize CVE: {}", e)))?};
            
            let options = UpdateOptions::builder().upsert(true).build();
            
            collection.update_one(filter, update, options).await
                .map_err(|e| StorageError::DatabaseError(format!("Failed to store CVE: {}", e)))?;
            
            Ok(())
        }
        
        #[cfg(not(feature = "mongodb"))]
        MongoDbStorage::unimplemented()
    }

    async fn store_cve_batch(&self, cves: &[CVE]) -> Result<(), StorageError> {
        #[cfg(feature = "mongodb")]
        {
            if cves.is_empty() {
                return Ok(());
            }

            let collection = self.cve_collection();
            let options = InsertManyOptions::builder().ordered(false).build();
            
            let documents: Vec<CVE> = cves.iter().cloned().collect();
            
            match collection.insert_many(documents, options).await {
                Ok(_) => Ok(()),
                Err(e) => {
                    if e.to_string().contains("duplicate key") {
                        for cve in cves {
                            let _ = self.store_cve(cve).await;
                        }
                        Ok(())
                    } else {
                        Err(StorageError::DatabaseError(format!("CVE batch insert failed: {}", e)))
                    }
                }
            }
        }
        
        #[cfg(not(feature = "mongodb"))]
        MongoDbStorage::unimplemented()
    }

    async fn get_cve(&self, cve_id: &str) -> Result<Option<CVE>, StorageError> {
        #[cfg(feature = "mongodb")]
        {
            let collection = self.cve_collection();
            let filter = doc! {"id": cve_id};
            
            let result = collection.find_one(filter, None).await
                .map_err(|e| StorageError::DatabaseError(format!("Failed to get CVE: {}", e)))?;
            
            Ok(result)
        }
        
        #[cfg(not(feature = "mongodb"))]
        MongoDbStorage::unimplemented()
    }

    async fn get_cve_batch(&self, cve_ids: &[String]) -> Result<Vec<CVE>, StorageError> {
        #[cfg(feature = "mongodb")]
        {
            let collection = self.cve_collection();
            let filter = doc! {"id": {"$in": cve_ids}};
            
            let mut cursor = collection.find(filter, None).await
                .map_err(|e| StorageError::DatabaseError(format!("Failed to get CVE batch: {}", e)))?;
            
            let mut results = Vec::new();
            while cursor.advance().await.map_err(|e| StorageError::DatabaseError(e.to_string()))? {
                let doc = cursor.deserialize_current()
                    .map_err(|e| StorageError::SerializationError(format!("Failed to deserialize CVE: {}", e)))?;
                results.push(doc);
            }
            
            Ok(results)
        }
        
        #[cfg(not(feature = "mongodb"))]
        MongoDbStorage::unimplemented()
    }

    async fn search_cves(&self, criteria: &SearchCriteria) -> Result<Vec<CVE>, StorageError> {
        #[cfg(feature = "mongodb")]
        {
            let collection = self.cve_collection();
            let mut filter = Document::new();
            
            if let Some(ref cve_id) = criteria.cve_id {
                filter.insert("id", cve_id);
            }
            
            if let Some(ref vendor) = criteria.vendor {
                filter.insert("affected_products.vendor", vendor);
            }
            
            if let Some(ref product) = criteria.product {
                filter.insert("affected_products.product", product);
            }
            
            if let Some(score_min) = criteria.severity_min {
                filter.insert("cvss_metrics.base_score", doc! {"$gte": score_min});
            }
            
            if let Some(score_max) = criteria.severity_max {
                filter.insert("cvss_metrics.base_score", doc! {"$lte": score_max});
            }

            let options = FindOptions::builder()
                .sort(doc! {"published_date": -1})
                .build();
            
            let mut cursor = collection.find(filter, options).await
                .map_err(|e| StorageError::DatabaseError(format!("Failed to search CVEs: {}", e)))?;
            
            let mut results = Vec::new();
            while cursor.advance().await.map_err(|e| StorageError::DatabaseError(e.to_string()))? {
                let doc = cursor.deserialize_current()
                    .map_err(|e| StorageError::SerializationError(format!("Failed to deserialize CVE: {}", e)))?;
                results.push(doc);
            }
            
            Ok(results)
        }
        
        #[cfg(not(feature = "mongodb"))]
        MongoDbStorage::unimplemented()
    }

    async fn list_cve_ids(&self) -> Result<Vec<String>, StorageError> {
        #[cfg(feature = "mongodb")]
        {
            let collection: Collection<Document> = self.database.collection(&self.cve_collection_name);
            let options = FindOptions::builder()
                .projection(doc! {"id": 1, "_id": 0})
                .build();
            
            let mut cursor = collection.find(None, options).await
                .map_err(|e| StorageError::DatabaseError(format!("Failed to list CVE IDs: {}", e)))?;
            
            let mut ids = Vec::new();
            while cursor.advance().await.map_err(|e| StorageError::DatabaseError(e.to_string()))? {
                let doc: Document = cursor.deserialize_current()
                    .map_err(|e| StorageError::SerializationError(format!("Failed to deserialize document: {}", e)))?;
                if let Some(id) = doc.get_str("id").ok() {
                    ids.push(id.to_string());
                }
            }
            
            Ok(ids)
        }
        
        #[cfg(not(feature = "mongodb"))]
        MongoDbStorage::unimplemented()
    }

    async fn list_analysis_ids(&self) -> Result<Vec<String>, StorageError> {
        #[cfg(feature = "mongodb")]
        {
            let collection: Collection<Document> = self.database.collection(&self.analysis_collection_name);
            let options = FindOptions::builder()
                .projection(doc! {"cve.id": 1, "_id": 0})
                .build();
            
            let mut cursor = collection.find(None, options).await
                .map_err(|e| StorageError::DatabaseError(format!("Failed to list analysis IDs: {}", e)))?;
            
            let mut ids = Vec::new();
            while cursor.advance().await.map_err(|e| StorageError::DatabaseError(e.to_string()))? {
                let doc: Document = cursor.deserialize_current()
                    .map_err(|e| StorageError::SerializationError(format!("Failed to deserialize document: {}", e)))?;
                if let Some(cve_doc) = doc.get_document("cve").ok() {
                    if let Some(id) = cve_doc.get_str("id").ok() {
                        ids.push(id.to_string());
                    }
                }
            }
            
            Ok(ids)
        }
        
        #[cfg(not(feature = "mongodb"))]
        MongoDbStorage::unimplemented()
    }

    async fn delete_analysis(&self, cve_id: &str) -> Result<bool, StorageError> {
        #[cfg(feature = "mongodb")]
        {
            let collection = self.analysis_collection();
            let filter = doc! {"cve.id": cve_id};
            
            let result = collection.delete_one(filter, None).await
                .map_err(|e| StorageError::DatabaseError(format!("Failed to delete analysis: {}", e)))?;
            
            Ok(result.deleted_count > 0)
        }
        
        #[cfg(not(feature = "mongodb"))]
        MongoDbStorage::unimplemented()
    }

    async fn delete_cve(&self, cve_id: &str) -> Result<bool, StorageError> {
        #[cfg(feature = "mongodb")]
        {
            let collection = self.cve_collection();
            let filter = doc! {"id": cve_id};
            
            let result = collection.delete_one(filter, None).await
                .map_err(|e| StorageError::DatabaseError(format!("Failed to delete CVE: {}", e)))?;
            
            Ok(result.deleted_count > 0)
        }
        
        #[cfg(not(feature = "mongodb"))]
        MongoDbStorage::unimplemented()
    }

    async fn get_statistics(&self) -> Result<StorageStatistics, StorageError> {
        #[cfg(feature = "mongodb")]
        {
            let cve_count = self.cve_collection().estimated_document_count(None).await
                .map_err(|e| StorageError::DatabaseError(format!("Failed to count CVEs: {}", e)))?;
            
            let analysis_count = self.analysis_collection().estimated_document_count(None).await
                .map_err(|e| StorageError::DatabaseError(format!("Failed to count analyses: {}", e)))?;
            
            // Estimate storage size using database stats
            let stats_command = doc! {"dbStats": 1};
            let db_stats = self.database.run_command(stats_command, None).await
                .map_err(|e| StorageError::DatabaseError(format!("Failed to get database stats: {}", e)))?;
            
            let storage_size = db_stats.get_f64("storageSize").unwrap_or(0.0) as u64;
            
            Ok(StorageStatistics {
                total_cves: cve_count,
                total_analyses: analysis_count,
                storage_size_bytes: storage_size,
                last_updated: Utc::now(),
            })
        }
        
        #[cfg(not(feature = "mongodb"))]
        MongoDbStorage::unimplemented()
    }

    async fn health_check(&self) -> Result<HealthStatus, StorageError> {
        #[cfg(feature = "mongodb")]
        {
            match self.test_connection().await {
                Ok(_) => Ok(HealthStatus::Healthy),
                Err(e) => Ok(HealthStatus::Unhealthy { 
                    reason: format!("MongoDB connection failed: {}", e) 
                }),
            }
        }
        
        #[cfg(not(feature = "mongodb"))]
        Ok(HealthStatus::Unhealthy { 
            reason: "MongoDB feature not enabled".to_string() 
        })
    }

    async fn initialize(&self) -> Result<(), StorageError> {
        #[cfg(feature = "mongodb")]
        {
            // Ensure indexes are created for optimal performance
            self.ensure_indexes().await?;
            Ok(())
        }
        
        #[cfg(not(feature = "mongodb"))]
        MongoDbStorage::unimplemented()
    }

    async fn close(&self) -> Result<(), StorageError> {
        // MongoDB client handles connection cleanup automatically
        // Connection pool will be closed when the client is dropped
        Ok(())
    }
}