//! Serialization Traits
//!
//! Traits for data serialization and deserialization

use serde_json::Value;

use crate::data_stores::types::DataStoreResult;
use crate::data_stores::serialization_types::{SerializationFormat, SerializationConfig, SerializationMetadata};

/// IOC serializer trait for different data formats
pub trait IOCSerializer: Send + Sync {
    /// Serialize data to bytes
    fn serialize(&self, data: &Value, config: &SerializationConfig) -> DataStoreResult<Vec<u8>>;

    /// Deserialize data from bytes
    fn deserialize(&self, data: &[u8], config: &SerializationConfig) -> DataStoreResult<Value>;

    /// Get format identifier
    fn format(&self) -> SerializationFormat;

    /// Estimate serialized size without actually serializing
    fn estimate_size(&self, data: &Value) -> DataStoreResult<usize>;

    /// Validate serialized data integrity
    fn validate(&self, data: &[u8], metadata: &SerializationMetadata) -> DataStoreResult<bool>;
}