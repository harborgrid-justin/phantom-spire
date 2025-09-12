//! JSON Serializer Implementation
//!
//! JSON-based serialization for IOC data

use serde_json::Value;

use crate::data_stores::types::DataStoreResult;
use crate::data_stores::serialization_types::{SerializationFormat, SerializationConfig, SerializationMetadata, CompressionAlgorithm};
use crate::data_stores::serialization_traits::IOCSerializer;

/// JSON serializer implementation
pub struct JsonSerializer;

impl IOCSerializer for JsonSerializer {
    fn serialize(&self, data: &Value, config: &SerializationConfig) -> DataStoreResult<Vec<u8>> {
        let json_bytes = if config.pretty_print {
            serde_json::to_vec_pretty(data)
        } else {
            serde_json::to_vec(data)
        }.map_err(|e| crate::data_stores::DataStoreError::Serialization(format!("JSON serialization failed: {}", e)))?;

        self.apply_compression(&json_bytes, config)
    }

    fn deserialize(&self, data: &[u8], config: &SerializationConfig) -> DataStoreResult<Value> {
        let decompressed = self.decompress(data, config)?;
        serde_json::from_slice(&decompressed)
            .map_err(|e| crate::data_stores::DataStoreError::Serialization(format!("JSON deserialization failed: {}", e)))
    }

    fn format(&self) -> SerializationFormat {
        SerializationFormat::Json
    }

    fn estimate_size(&self, data: &Value) -> DataStoreResult<usize> {
        let json_bytes = serde_json::to_vec(data)
            .map_err(|e| crate::data_stores::DataStoreError::Serialization(format!("Size estimation failed: {}", e)))?;
        Ok(json_bytes.len())
    }

    fn validate(&self, data: &[u8], metadata: &SerializationMetadata) -> DataStoreResult<bool> {
        let checksum = self.calculate_checksum(data);
        Ok(checksum == metadata.checksum && data.len() == metadata.compressed_size)
    }
}

impl JsonSerializer {
    fn apply_compression(&self, data: &[u8], config: &SerializationConfig) -> DataStoreResult<Vec<u8>> {
        match config.compression {
            CompressionAlgorithm::None => Ok(data.to_vec()),
            CompressionAlgorithm::Gzip => {
                use flate2::{Compression, write::GzEncoder};
                let mut encoder = GzEncoder::new(Vec::new(), Compression::default());
                encoder.write_all(data)
                    .map_err(|e| crate::data_stores::DataStoreError::Internal(format!("Gzip compression failed: {}", e)))?;
                encoder.finish()
                    .map_err(|e| crate::data_stores::DataStoreError::Internal(format!("Gzip finalization failed: {}", e)))
            }
            _ => Err(crate::data_stores::DataStoreError::Internal(format!("Unsupported compression: {}", config.compression))),
        }
    }

    fn decompress(&self, data: &[u8], config: &SerializationConfig) -> DataStoreResult<Vec<u8>> {
        match config.compression {
            CompressionAlgorithm::None => Ok(data.to_vec()),
            CompressionAlgorithm::Gzip => {
                use flate2::read::GzDecoder;
                let mut decoder = GzDecoder::new(data);
                let mut decompressed = Vec::new();
                decoder.read_to_end(&mut decompressed)
                    .map_err(|e| crate::data_stores::DataStoreError::Internal(format!("Gzip decompression failed: {}", e)))?;
                Ok(decompressed)
            }
            _ => Err(crate::data_stores::DataStoreError::Internal(format!("Unsupported compression: {}", config.compression))),
        }
    }

    fn calculate_checksum(&self, data: &[u8]) -> String {
        use sha2::{Sha256, Digest};
        let mut hasher = Sha256::new();
        hasher.update(data);
        format!("{:x}", hasher.finalize())
    }
}