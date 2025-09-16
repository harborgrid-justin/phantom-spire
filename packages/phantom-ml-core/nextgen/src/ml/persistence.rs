//! Model Persistence and Versioning
//!
//! Production-ready model serialization, versioning, and persistence layer
//! with support for multiple storage backends and model registry capabilities.

use crate::error::{PhantomMLError, Result};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use chrono::{DateTime, Utc};
use sha2::{Sha256, Digest};
use memmap2::Mmap;
use std::fs::{File, OpenOptions};
use std::io::{Read, Write, BufReader, BufWriter};

/// Model metadata for versioning and registry
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ModelMetadata {
    pub id: String,
    pub name: String,
    pub version: String,
    pub algorithm: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub author: Option<String>,
    pub description: Option<String>,
    pub tags: Vec<String>,
    pub metrics: HashMap<String, f64>,
    pub hyperparameters: HashMap<String, serde_json::Value>,
    pub training_data_hash: Option<String>,
    pub model_size_bytes: u64,
    pub checksum: String,
    pub schema_version: String,
}

/// Model artifact containing serialized model and metadata
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ModelArtifact<T> {
    pub metadata: ModelMetadata,
    pub model: T,
    pub preprocessing: Option<PreprocessingArtifact>,
    pub evaluation: Option<EvaluationArtifact>,
}

/// Preprocessing pipeline artifact
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct PreprocessingArtifact {
    pub pipeline: serde_json::Value, // Serialized preprocessing pipeline
    pub feature_names: Vec<String>,
    pub target_names: Option<Vec<String>>,
    pub data_schema: DataSchema,
}

/// Data schema for validation
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct DataSchema {
    pub feature_types: HashMap<String, DataType>,
    pub feature_ranges: HashMap<String, (f64, f64)>,
    pub required_features: Vec<String>,
    pub nullable_features: Vec<String>,
}

/// Supported data types
#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum DataType {
    Numeric,
    Categorical,
    Boolean,
    Text,
    DateTime,
}

/// Model evaluation artifact
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct EvaluationArtifact {
    pub metrics: HashMap<String, f64>,
    pub confusion_matrix: Option<Vec<Vec<usize>>>,
    pub feature_importance: Option<Vec<(String, f64)>>,
    pub validation_data_hash: Option<String>,
    pub cross_validation_scores: Option<Vec<f64>>,
}

/// Serialization formats
#[derive(Clone, Debug)]
pub enum SerializationFormat {
    Bincode,
    MessagePack,
    JSON,
    Custom(Box<dyn SerializationBackend>),
}

/// Trait for custom serialization backends
pub trait SerializationBackend: Send + Sync {
    fn serialize<T: Serialize>(&self, value: &T) -> Result<Vec<u8>>;
    fn deserialize<T: for<'de> Deserialize<'de>>(&self, data: &[u8]) -> Result<T>;
}

/// Storage backends for model persistence
pub trait StorageBackend: Send + Sync {
    fn save(&self, path: &str, data: &[u8]) -> Result<()>;
    fn load(&self, path: &str) -> Result<Vec<u8>>;
    fn exists(&self, path: &str) -> Result<bool>;
    fn delete(&self, path: &str) -> Result<()>;
    fn list(&self, prefix: &str) -> Result<Vec<String>>;
}

/// File system storage backend
pub struct FileSystemStorage {
    base_path: PathBuf,
}

impl FileSystemStorage {
    pub fn new<P: AsRef<Path>>(base_path: P) -> Self {
        Self {
            base_path: base_path.as_ref().to_path_buf(),
        }
    }
}

impl StorageBackend for FileSystemStorage {
    fn save(&self, path: &str, data: &[u8]) -> Result<()> {
        let full_path = self.base_path.join(path);

        if let Some(parent) = full_path.parent() {
            std::fs::create_dir_all(parent)
                .map_err(|e| PhantomMLError::IO(format!("Failed to create directories: {}", e)))?;
        }

        let mut file = BufWriter::new(
            OpenOptions::new()
                .create(true)
                .write(true)
                .truncate(true)
                .open(&full_path)
                .map_err(|e| PhantomMLError::IO(format!("Failed to create file: {}", e)))?
        );

        file.write_all(data)
            .map_err(|e| PhantomMLError::IO(format!("Failed to write file: {}", e)))?;

        file.flush()
            .map_err(|e| PhantomMLError::IO(format!("Failed to flush file: {}", e)))?;

        Ok(())
    }

    fn load(&self, path: &str) -> Result<Vec<u8>> {
        let full_path = self.base_path.join(path);

        let mut file = BufReader::new(
            File::open(&full_path)
                .map_err(|e| PhantomMLError::IO(format!("Failed to open file: {}", e)))?
        );

        let mut data = Vec::new();
        file.read_to_end(&mut data)
            .map_err(|e| PhantomMLError::IO(format!("Failed to read file: {}", e)))?;

        Ok(data)
    }

    fn exists(&self, path: &str) -> Result<bool> {
        let full_path = self.base_path.join(path);
        Ok(full_path.exists())
    }

    fn delete(&self, path: &str) -> Result<()> {
        let full_path = self.base_path.join(path);

        if full_path.is_file() {
            std::fs::remove_file(&full_path)
                .map_err(|e| PhantomMLError::IO(format!("Failed to delete file: {}", e)))?;
        } else if full_path.is_dir() {
            std::fs::remove_dir_all(&full_path)
                .map_err(|e| PhantomMLError::IO(format!("Failed to delete directory: {}", e)))?;
        }

        Ok(())
    }

    fn list(&self, prefix: &str) -> Result<Vec<String>> {
        let search_path = self.base_path.join(prefix);
        let mut results = Vec::new();

        if search_path.is_dir() {
            let entries = std::fs::read_dir(&search_path)
                .map_err(|e| PhantomMLError::IO(format!("Failed to read directory: {}", e)))?;

            for entry in entries {
                let entry = entry
                    .map_err(|e| PhantomMLError::IO(format!("Failed to read directory entry: {}", e)))?;

                if let Some(name) = entry.file_name().to_str() {
                    results.push(format!("{}/{}", prefix, name));
                }
            }
        }

        Ok(results)
    }
}

/// In-memory storage backend (for testing)
pub struct MemoryStorage {
    data: std::sync::Arc<std::sync::Mutex<HashMap<String, Vec<u8>>>>,
}

impl MemoryStorage {
    pub fn new() -> Self {
        Self {
            data: std::sync::Arc::new(std::sync::Mutex::new(HashMap::new())),
        }
    }
}

impl StorageBackend for MemoryStorage {
    fn save(&self, path: &str, data: &[u8]) -> Result<()> {
        let mut storage = self.data.lock()
            .map_err(|_| PhantomMLError::Internal("Failed to acquire storage lock".to_string()))?;

        storage.insert(path.to_string(), data.to_vec());
        Ok(())
    }

    fn load(&self, path: &str) -> Result<Vec<u8>> {
        let storage = self.data.lock()
            .map_err(|_| PhantomMLError::Internal("Failed to acquire storage lock".to_string()))?;

        storage.get(path)
            .cloned()
            .ok_or_else(|| PhantomMLError::IO(format!("Path not found: {}", path)))
    }

    fn exists(&self, path: &str) -> Result<bool> {
        let storage = self.data.lock()
            .map_err(|_| PhantomMLError::Internal("Failed to acquire storage lock".to_string()))?;

        Ok(storage.contains_key(path))
    }

    fn delete(&self, path: &str) -> Result<()> {
        let mut storage = self.data.lock()
            .map_err(|_| PhantomMLError::Internal("Failed to acquire storage lock".to_string()))?;

        storage.remove(path);
        Ok(())
    }

    fn list(&self, prefix: &str) -> Result<Vec<String>> {
        let storage = self.data.lock()
            .map_err(|_| PhantomMLError::Internal("Failed to acquire storage lock".to_string()))?;

        Ok(storage.keys()
            .filter(|key| key.starts_with(prefix))
            .cloned()
            .collect())
    }
}

/// Model registry for managing model lifecycle
pub struct ModelRegistry {
    storage: Box<dyn StorageBackend>,
    serialization_format: SerializationFormat,
    registry_path: String,
}

impl ModelRegistry {
    pub fn new(
        storage: Box<dyn StorageBackend>,
        serialization_format: SerializationFormat,
    ) -> Self {
        Self {
            storage,
            serialization_format,
            registry_path: "registry".to_string(),
        }
    }

    /// Save a model with automatic versioning
    pub fn save_model<T: Serialize + Clone>(
        &self,
        artifact: &ModelArtifact<T>,
    ) -> Result<String> {
        // Calculate model checksum
        let serialized_model = self.serialize(&artifact.model)?;
        let checksum = self.calculate_checksum(&serialized_model);

        // Create updated metadata with checksum
        let mut metadata = artifact.metadata.clone();
        metadata.checksum = checksum;
        metadata.model_size_bytes = serialized_model.len() as u64;
        metadata.updated_at = Utc::now();

        // Create versioned artifact
        let versioned_artifact = ModelArtifact {
            metadata: metadata.clone(),
            model: artifact.model.clone(),
            preprocessing: artifact.preprocessing.clone(),
            evaluation: artifact.evaluation.clone(),
        };

        // Serialize full artifact
        let artifact_data = self.serialize(&versioned_artifact)?;

        // Save model artifact
        let model_path = format!("{}/{}/{}/model.bin",
            self.registry_path, metadata.name, metadata.version);
        self.storage.save(&model_path, &artifact_data)?;

        // Update registry index
        self.update_registry_index(&metadata)?;

        Ok(metadata.id)
    }

    /// Load a model by name and version
    pub fn load_model<T: for<'de> Deserialize<'de>>(
        &self,
        name: &str,
        version: Option<&str>,
    ) -> Result<ModelArtifact<T>> {
        let version = version.unwrap_or("latest");

        let model_path = if version == "latest" {
            let latest_version = self.get_latest_version(name)?;
            format!("{}/{}/{}/model.bin", self.registry_path, name, latest_version)
        } else {
            format!("{}/{}/{}/model.bin", self.registry_path, name, version)
        };

        let data = self.storage.load(&model_path)?;
        let artifact: ModelArtifact<T> = self.deserialize(&data)?;

        // Verify checksum
        let model_data = self.serialize(&artifact.model)?;
        let calculated_checksum = self.calculate_checksum(&model_data);

        if calculated_checksum != artifact.metadata.checksum {
            return Err(PhantomMLError::DataIntegrity(
                "Model checksum verification failed".to_string()
            ));
        }

        Ok(artifact)
    }

    /// List all models in the registry
    pub fn list_models(&self) -> Result<Vec<ModelMetadata>> {
        let index_path = format!("{}/index.json", self.registry_path);

        if !self.storage.exists(&index_path)? {
            return Ok(Vec::new());
        }

        let index_data = self.storage.load(&index_path)?;
        let index: HashMap<String, Vec<ModelMetadata>> = serde_json::from_slice(&index_data)
            .map_err(|e| PhantomMLError::Configuration(format!("Failed to parse registry index: {}", e)))?;

        Ok(index.values().flatten().cloned().collect())
    }

    /// Get model versions for a given model name
    pub fn get_model_versions(&self, name: &str) -> Result<Vec<String>> {
        let models = self.list_models()?;
        let mut versions: Vec<String> = models
            .into_iter()
            .filter(|m| m.name == name)
            .map(|m| m.version)
            .collect();

        versions.sort_by(|a, b| {
            // Try to parse as semantic versions, fall back to string comparison
            match (semver::Version::parse(a), semver::Version::parse(b)) {
                (Ok(va), Ok(vb)) => va.cmp(&vb),
                _ => a.cmp(b),
            }
        });

        Ok(versions)
    }

    /// Delete a model version
    pub fn delete_model(&self, name: &str, version: &str) -> Result<()> {
        let model_path = format!("{}/{}/{}", self.registry_path, name, version);
        self.storage.delete(&model_path)?;

        // Update registry index
        self.remove_from_registry_index(name, version)?;

        Ok(())
    }

    /// Create a new model version
    pub fn create_version<T: Serialize + Clone>(
        &self,
        name: &str,
        base_version: Option<&str>,
        new_version: &str,
        model: T,
        description: Option<String>,
    ) -> Result<String> {
        // Load base model if specified
        let base_artifact: Option<ModelArtifact<T>> = if let Some(base_ver) = base_version {
            Some(self.load_model(name, Some(base_ver))?)
        } else {
            None
        };

        // Create new metadata
        let metadata = ModelMetadata {
            id: uuid::Uuid::new_v4().to_string(),
            name: name.to_string(),
            version: new_version.to_string(),
            algorithm: base_artifact.as_ref()
                .map(|a| a.metadata.algorithm.clone())
                .unwrap_or_else(|| "unknown".to_string()),
            created_at: Utc::now(),
            updated_at: Utc::now(),
            author: None,
            description,
            tags: base_artifact.as_ref()
                .map(|a| a.metadata.tags.clone())
                .unwrap_or_default(),
            metrics: HashMap::new(),
            hyperparameters: HashMap::new(),
            training_data_hash: None,
            model_size_bytes: 0,
            checksum: String::new(),
            schema_version: env!("CARGO_PKG_VERSION").to_string(),
        };

        let artifact = ModelArtifact {
            metadata,
            model,
            preprocessing: base_artifact.as_ref().and_then(|a| a.preprocessing.clone()),
            evaluation: None,
        };

        self.save_model(&artifact)
    }

    /// Compare two model versions
    pub fn compare_models<T: for<'de> Deserialize<'de>>(
        &self,
        name: &str,
        version1: &str,
        version2: &str,
    ) -> Result<ModelComparison> {
        let model1: ModelArtifact<T> = self.load_model(name, Some(version1))?;
        let model2: ModelArtifact<T> = self.load_model(name, Some(version2))?;

        let metrics_diff = self.compare_metrics(&model1.metadata.metrics, &model2.metadata.metrics);
        let size_diff = model2.metadata.model_size_bytes as i64 - model1.metadata.model_size_bytes as i64;

        Ok(ModelComparison {
            model1_version: version1.to_string(),
            model2_version: version2.to_string(),
            metrics_comparison: metrics_diff,
            size_difference_bytes: size_diff,
            created_at_diff: model2.metadata.created_at - model1.metadata.created_at,
        })
    }

    // Private helper methods

    fn serialize<T: Serialize>(&self, value: &T) -> Result<Vec<u8>> {
        match &self.serialization_format {
            SerializationFormat::Bincode => {
                bincode::serialize(value)
                    .map_err(|e| PhantomMLError::Configuration(format!("Bincode serialization failed: {}", e)))
            },
            SerializationFormat::MessagePack => {
                rmp_serde::to_vec(value)
                    .map_err(|e| PhantomMLError::Configuration(format!("MessagePack serialization failed: {}", e)))
            },
            SerializationFormat::JSON => {
                serde_json::to_vec(value)
                    .map_err(|e| PhantomMLError::Configuration(format!("JSON serialization failed: {}", e)))
            },
            SerializationFormat::Custom(backend) => {
                backend.serialize(value)
            },
        }
    }

    fn deserialize<T: for<'de> Deserialize<'de>>(&self, data: &[u8]) -> Result<T> {
        match &self.serialization_format {
            SerializationFormat::Bincode => {
                bincode::deserialize(data)
                    .map_err(|e| PhantomMLError::Configuration(format!("Bincode deserialization failed: {}", e)))
            },
            SerializationFormat::MessagePack => {
                rmp_serde::from_slice(data)
                    .map_err(|e| PhantomMLError::Configuration(format!("MessagePack deserialization failed: {}", e)))
            },
            SerializationFormat::JSON => {
                serde_json::from_slice(data)
                    .map_err(|e| PhantomMLError::Configuration(format!("JSON deserialization failed: {}", e)))
            },
            SerializationFormat::Custom(backend) => {
                backend.deserialize(data)
            },
        }
    }

    fn calculate_checksum(&self, data: &[u8]) -> String {
        let mut hasher = Sha256::new();
        hasher.update(data);
        format!("{:x}", hasher.finalize())
    }

    fn update_registry_index(&self, metadata: &ModelMetadata) -> Result<()> {
        let index_path = format!("{}/index.json", self.registry_path);

        let mut index: HashMap<String, Vec<ModelMetadata>> = if self.storage.exists(&index_path)? {
            let data = self.storage.load(&index_path)?;
            serde_json::from_slice(&data).unwrap_or_default()
        } else {
            HashMap::new()
        };

        let model_versions = index.entry(metadata.name.clone()).or_insert_with(Vec::new);

        // Remove existing version if present
        model_versions.retain(|m| m.version != metadata.version);

        // Add new version
        model_versions.push(metadata.clone());

        // Sort versions
        model_versions.sort_by(|a, b| b.created_at.cmp(&a.created_at));

        let index_data = serde_json::to_vec_pretty(&index)
            .map_err(|e| PhantomMLError::Configuration(format!("Failed to serialize registry index: {}", e)))?;

        self.storage.save(&index_path, &index_data)?;

        Ok(())
    }

    fn remove_from_registry_index(&self, name: &str, version: &str) -> Result<()> {
        let index_path = format!("{}/index.json", self.registry_path);

        if !self.storage.exists(&index_path)? {
            return Ok(());
        }

        let data = self.storage.load(&index_path)?;
        let mut index: HashMap<String, Vec<ModelMetadata>> = serde_json::from_slice(&data)
            .map_err(|e| PhantomMLError::Configuration(format!("Failed to parse registry index: {}", e)))?;

        if let Some(model_versions) = index.get_mut(name) {
            model_versions.retain(|m| m.version != version);

            // Remove model entry if no versions left
            if model_versions.is_empty() {
                index.remove(name);
            }
        }

        let index_data = serde_json::to_vec_pretty(&index)
            .map_err(|e| PhantomMLError::Configuration(format!("Failed to serialize registry index: {}", e)))?;

        self.storage.save(&index_path, &index_data)?;

        Ok(())
    }

    fn get_latest_version(&self, name: &str) -> Result<String> {
        let versions = self.get_model_versions(name)?;

        if versions.is_empty() {
            return Err(PhantomMLError::Model(format!("No versions found for model: {}", name)));
        }

        Ok(versions.into_iter().last().unwrap())
    }

    fn compare_metrics(&self, metrics1: &HashMap<String, f64>, metrics2: &HashMap<String, f64>) -> HashMap<String, MetricComparison> {
        let mut comparison = HashMap::new();

        let all_keys: std::collections::HashSet<String> = metrics1.keys()
            .chain(metrics2.keys())
            .cloned()
            .collect();

        for key in all_keys {
            let value1 = metrics1.get(&key).copied();
            let value2 = metrics2.get(&key).copied();

            let diff = match (value1, value2) {
                (Some(v1), Some(v2)) => Some(v2 - v1),
                _ => None,
            };

            comparison.insert(key, MetricComparison {
                value1,
                value2,
                difference: diff,
                percentage_change: match (value1, value2) {
                    (Some(v1), Some(v2)) if v1.abs() > 1e-10 => Some((v2 - v1) / v1 * 100.0),
                    _ => None,
                },
            });
        }

        comparison
    }
}

/// Model comparison result
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ModelComparison {
    pub model1_version: String,
    pub model2_version: String,
    pub metrics_comparison: HashMap<String, MetricComparison>,
    pub size_difference_bytes: i64,
    pub created_at_diff: chrono::Duration,
}

/// Metric comparison details
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct MetricComparison {
    pub value1: Option<f64>,
    pub value2: Option<f64>,
    pub difference: Option<f64>,
    pub percentage_change: Option<f64>,
}

/// Memory-mapped model loader for large models
pub struct MmapModelLoader {
    file: File,
    mmap: Mmap,
}

impl MmapModelLoader {
    pub fn new<P: AsRef<Path>>(path: P) -> Result<Self> {
        let file = File::open(path.as_ref())
            .map_err(|e| PhantomMLError::IO(format!("Failed to open model file: {}", e)))?;

        let mmap = unsafe {
            Mmap::map(&file)
                .map_err(|e| PhantomMLError::IO(format!("Failed to memory map file: {}", e)))?
        };

        Ok(Self { file, mmap })
    }

    pub fn data(&self) -> &[u8] {
        &self.mmap
    }

    pub fn deserialize<T: for<'de> Deserialize<'de>>(&self, format: &SerializationFormat) -> Result<T> {
        match format {
            SerializationFormat::Bincode => {
                bincode::deserialize(self.data())
                    .map_err(|e| PhantomMLError::Configuration(format!("Bincode deserialization failed: {}", e)))
            },
            SerializationFormat::MessagePack => {
                rmp_serde::from_slice(self.data())
                    .map_err(|e| PhantomMLError::Configuration(format!("MessagePack deserialization failed: {}", e)))
            },
            SerializationFormat::JSON => {
                serde_json::from_slice(self.data())
                    .map_err(|e| PhantomMLError::Configuration(format!("JSON deserialization failed: {}", e)))
            },
            SerializationFormat::Custom(backend) => {
                backend.deserialize(self.data())
            },
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    #[derive(Serialize, Deserialize, Clone, PartialEq, Debug)]
    struct TestModel {
        weights: Vec<f64>,
        bias: f64,
    }

    #[test]
    fn test_filesystem_storage() {
        let temp_dir = TempDir::new().unwrap();
        let storage = FileSystemStorage::new(temp_dir.path());

        let data = b"test data";
        let path = "test/model.bin";

        // Test save
        assert!(storage.save(path, data).is_ok());

        // Test exists
        assert!(storage.exists(path).unwrap());

        // Test load
        let loaded = storage.load(path).unwrap();
        assert_eq!(loaded, data);

        // Test list
        let files = storage.list("test").unwrap();
        assert!(files.contains(&"test/model.bin".to_string()));

        // Test delete
        assert!(storage.delete(path).is_ok());
        assert!(!storage.exists(path).unwrap());
    }

    #[test]
    fn test_memory_storage() {
        let storage = MemoryStorage::new();

        let data = b"test data";
        let path = "test/model.bin";

        // Test save
        assert!(storage.save(path, data).is_ok());

        // Test exists
        assert!(storage.exists(path).unwrap());

        // Test load
        let loaded = storage.load(path).unwrap();
        assert_eq!(loaded, data);

        // Test list
        let files = storage.list("test").unwrap();
        assert!(files.contains(&path.to_string()));

        // Test delete
        assert!(storage.delete(path).is_ok());
        assert!(!storage.exists(path).unwrap());
    }

    #[test]
    fn test_model_registry() {
        let storage = Box::new(MemoryStorage::new());
        let registry = ModelRegistry::new(storage, SerializationFormat::JSON);

        let model = TestModel {
            weights: vec![1.0, 2.0, 3.0],
            bias: 0.5,
        };

        let metadata = ModelMetadata {
            id: "test-model-1".to_string(),
            name: "test-model".to_string(),
            version: "1.0.0".to_string(),
            algorithm: "linear_regression".to_string(),
            created_at: Utc::now(),
            updated_at: Utc::now(),
            author: Some("test-author".to_string()),
            description: Some("Test model".to_string()),
            tags: vec!["test".to_string()],
            metrics: [("accuracy".to_string(), 0.95)].into(),
            hyperparameters: HashMap::new(),
            training_data_hash: None,
            model_size_bytes: 0,
            checksum: String::new(),
            schema_version: "1.0.0".to_string(),
        };

        let artifact = ModelArtifact {
            metadata: metadata.clone(),
            model: model.clone(),
            preprocessing: None,
            evaluation: None,
        };

        // Test save
        let model_id = registry.save_model(&artifact).unwrap();
        assert_eq!(model_id, metadata.id);

        // Test load
        let loaded_artifact: ModelArtifact<TestModel> = registry
            .load_model("test-model", Some("1.0.0"))
            .unwrap();

        assert_eq!(loaded_artifact.model, model);
        assert_eq!(loaded_artifact.metadata.name, "test-model");

        // Test list models
        let models = registry.list_models().unwrap();
        assert_eq!(models.len(), 1);
        assert_eq!(models[0].name, "test-model");

        // Test get versions
        let versions = registry.get_model_versions("test-model").unwrap();
        assert_eq!(versions, vec!["1.0.0"]);

        // Test create new version
        let new_model = TestModel {
            weights: vec![2.0, 3.0, 4.0],
            bias: 1.0,
        };

        registry.create_version(
            "test-model",
            Some("1.0.0"),
            "2.0.0",
            new_model.clone(),
            Some("Updated model".to_string()),
        ).unwrap();

        let versions = registry.get_model_versions("test-model").unwrap();
        assert_eq!(versions.len(), 2);

        // Test load latest
        let latest_artifact: ModelArtifact<TestModel> = registry
            .load_model("test-model", None)
            .unwrap();

        assert_eq!(latest_artifact.model, new_model);
    }

    #[test]
    fn test_model_comparison() {
        let storage = Box::new(MemoryStorage::new());
        let registry = ModelRegistry::new(storage, SerializationFormat::JSON);

        // Create two versions with different metrics
        let model1 = TestModel {
            weights: vec![1.0, 2.0],
            bias: 0.5,
        };

        let model2 = TestModel {
            weights: vec![1.5, 2.5],
            bias: 0.7,
        };

        let mut metadata1 = ModelMetadata {
            id: "model-1".to_string(),
            name: "test-model".to_string(),
            version: "1.0.0".to_string(),
            algorithm: "linear_regression".to_string(),
            created_at: Utc::now(),
            updated_at: Utc::now(),
            author: None,
            description: None,
            tags: Vec::new(),
            metrics: [("accuracy".to_string(), 0.85)].into(),
            hyperparameters: HashMap::new(),
            training_data_hash: None,
            model_size_bytes: 0,
            checksum: String::new(),
            schema_version: "1.0.0".to_string(),
        };

        let mut metadata2 = metadata1.clone();
        metadata2.id = "model-2".to_string();
        metadata2.version = "2.0.0".to_string();
        metadata2.metrics = [("accuracy".to_string(), 0.92)].into();

        let artifact1 = ModelArtifact {
            metadata: metadata1,
            model: model1,
            preprocessing: None,
            evaluation: None,
        };

        let artifact2 = ModelArtifact {
            metadata: metadata2,
            model: model2,
            preprocessing: None,
            evaluation: None,
        };

        registry.save_model(&artifact1).unwrap();
        registry.save_model(&artifact2).unwrap();

        let comparison: ModelComparison = registry
            .compare_models("test-model", "1.0.0", "2.0.0")
            .unwrap();

        assert_eq!(comparison.model1_version, "1.0.0");
        assert_eq!(comparison.model2_version, "2.0.0");

        let accuracy_comparison = comparison.metrics_comparison.get("accuracy").unwrap();
        assert_eq!(accuracy_comparison.value1, Some(0.85));
        assert_eq!(accuracy_comparison.value2, Some(0.92));
        assert!((accuracy_comparison.difference.unwrap() - 0.07).abs() < 1e-10);
    }

    #[test]
    fn test_serialization_formats() {
        let model = TestModel {
            weights: vec![1.0, 2.0, 3.0],
            bias: 0.5,
        };

        // Test Bincode
        let storage = Box::new(MemoryStorage::new());
        let registry = ModelRegistry::new(storage, SerializationFormat::Bincode);

        let serialized = registry.serialize(&model).unwrap();
        let deserialized: TestModel = registry.deserialize(&serialized).unwrap();
        assert_eq!(model, deserialized);

        // Test MessagePack
        let storage = Box::new(MemoryStorage::new());
        let registry = ModelRegistry::new(storage, SerializationFormat::MessagePack);

        let serialized = registry.serialize(&model).unwrap();
        let deserialized: TestModel = registry.deserialize(&serialized).unwrap();
        assert_eq!(model, deserialized);

        // Test JSON
        let storage = Box::new(MemoryStorage::new());
        let registry = ModelRegistry::new(storage, SerializationFormat::JSON);

        let serialized = registry.serialize(&model).unwrap();
        let deserialized: TestModel = registry.deserialize(&serialized).unwrap();
        assert_eq!(model, deserialized);
    }
}