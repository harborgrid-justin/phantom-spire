//! Serialization Utilities
//!
//! Utility functions for serialization operations

use serde_json::Value;

use crate::data_stores::types::DataStoreResult;
use crate::data_stores::serialization_types::{SerializationFormat, SerializationConfig, SerializationMetadata, CompressionAlgorithm};
use crate::data_stores::serialization_traits::IOCSerializer;
use crate::data_stores::serialization_factory::SerializerFactory;

/// Serialize data with automatic format detection and compression
pub fn auto_serialize(
    data: &Value,
    config: Option<SerializationConfig>
) -> DataStoreResult<(Vec<u8>, SerializationMetadata)> {
    let config = config.unwrap_or_default();
    let serializer = SerializerFactory::create_serializer(&config.format)?;

    let serialized = serializer.serialize(data, &config)?;
    let original_size = serializer.estimate_size(data)?;

    let metadata = SerializationMetadata {
        format: config.format,
        compression: config.compression,
        original_size,
        compressed_size: serialized.len(),
        timestamp: chrono::Utc::now(),
        schema_version: "1.0".to_string(),
        checksum: calculate_checksum(&serialized),
    };

    Ok((serialized, metadata))
}

/// Deserialize data with metadata validation
pub fn auto_deserialize(
    data: &[u8],
    metadata: &SerializationMetadata
) -> DataStoreResult<Value> {
    let config = SerializationConfig {
        format: metadata.format.clone(),
        compression: metadata.compression,
        compression_level: None,
        pretty_print: false,
        include_metadata: true,
        max_size: None,
    };

    let serializer = SerializerFactory::create_serializer(&metadata.format)?;

    // Validate data integrity
    if !serializer.validate(data, metadata)? {
        return Err(crate::data_stores::DataStoreError::Validation("Data integrity check failed".to_string()));
    }

    serializer.deserialize(data, &config)
}

/// Calculate SHA-256 checksum for data
pub fn calculate_checksum(data: &[u8]) -> String {
    use sha2::{Sha256, Digest};
    let mut hasher = Sha256::new();
    hasher.update(data);
    format!("{:x}", hasher.finalize())
}

/// Compress data using the specified algorithm
pub fn compress(data: &[u8], algorithm: CompressionAlgorithm) -> DataStoreResult<Vec<u8>> {
    match algorithm {
        CompressionAlgorithm::None => Ok(data.to_vec()),
        CompressionAlgorithm::Gzip => {
            use flate2::{Compression, write::GzEncoder};
            let mut encoder = GzEncoder::new(Vec::new(), Compression::default());
            encoder.write_all(data)
                .map_err(|e| crate::data_stores::DataStoreError::Internal(format!("Gzip compression failed: {}", e)))?;
            encoder.finish()
                .map_err(|e| crate::data_stores::DataStoreError::Internal(format!("Gzip finalization failed: {}", e)))
        }
        _ => Err(crate::data_stores::DataStoreError::Internal(format!("Unsupported compression algorithm: {}", algorithm))),
    }
}

/// Decompress data using the specified algorithm
pub fn decompress(data: &[u8], algorithm: CompressionAlgorithm) -> DataStoreResult<Vec<u8>> {
    match algorithm {
        CompressionAlgorithm::None => Ok(data.to_vec()),
        CompressionAlgorithm::Gzip => {
            use flate2::read::GzDecoder;
            let mut decoder = GzDecoder::new(data);
            let mut decompressed = Vec::new();
            decoder.read_to_end(&mut decompressed)
                .map_err(|e| crate::data_stores::DataStoreError::Internal(format!("Gzip decompression failed: {}", e)))?;
            Ok(decompressed)
        }
        _ => Err(crate::data_stores::DataStoreError::Internal(format!("Unsupported compression algorithm: {}", algorithm))),
    }
}