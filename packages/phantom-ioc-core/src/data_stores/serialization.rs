//! Data Store Serialization
//! 
//! Serialization and deserialization utilities for IOC data stores
//! Enhanced with phantom-cve-core architectural patterns

use serde::{Serialize, Deserialize};
use std::io::{Read, Write};
use crate::data_stores::{DataStoreResult, DataStoreError};

/// Serialization format enumeration
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum SerializationFormat {
    /// JSON format (human-readable)
    Json,
    /// MessagePack format (compact binary)
    MessagePack,
    /// Bincode format (fast binary)
    Bincode,
    /// CBOR format (compact binary object representation)
    Cbor,
    /// BSON format (Binary JSON, MongoDB-compatible)
    Bson,
    /// Custom format
    Custom(String),
}

impl std::fmt::Display for SerializationFormat {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            SerializationFormat::Json => write!(f, "json"),
            SerializationFormat::MessagePack => write!(f, "msgpack"),
            SerializationFormat::Bincode => write!(f, "bincode"),
            SerializationFormat::Cbor => write!(f, "cbor"),
            SerializationFormat::Bson => write!(f, "bson"),
            SerializationFormat::Custom(name) => write!(f, "{}", name),
        }
    }
}

impl std::str::FromStr for SerializationFormat {
    type Err = String;
    
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().as_str() {
            "json" => Ok(SerializationFormat::Json),
            "msgpack" | "messagepack" => Ok(SerializationFormat::MessagePack),
            "bincode" => Ok(SerializationFormat::Bincode),
            "cbor" => Ok(SerializationFormat::Cbor),
            "bson" => Ok(SerializationFormat::Bson),
            custom => Ok(SerializationFormat::Custom(custom.to_string())),
        }
    }
}

/// Compression algorithm enumeration
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum CompressionAlgorithm {
    /// No compression
    None,
    /// Gzip compression
    Gzip,
    /// LZ4 compression (fast)
    Lz4,
    /// Zstd compression (balanced)
    Zstd,
    /// Brotli compression (high compression)
    Brotli,
}

impl std::fmt::Display for CompressionAlgorithm {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            CompressionAlgorithm::None => write!(f, "none"),
            CompressionAlgorithm::Gzip => write!(f, "gzip"),
            CompressionAlgorithm::Lz4 => write!(f, "lz4"),
            CompressionAlgorithm::Zstd => write!(f, "zstd"),
            CompressionAlgorithm::Brotli => write!(f, "brotli"),
        }
    }
}

/// Serialization configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SerializationConfig {
    /// Serialization format
    pub format: SerializationFormat,
    /// Compression algorithm
    pub compression: CompressionAlgorithm,
    /// Compression level (algorithm-specific)
    pub compression_level: Option<u32>,
    /// Pretty-print for human-readable formats
    pub pretty_print: bool,
    /// Include metadata in serialized data
    pub include_metadata: bool,
    /// Maximum serialized size (bytes)
    pub max_size: Option<usize>,
}

impl Default for SerializationConfig {
    fn default() -> Self {
        Self {
            format: SerializationFormat::Json,
            compression: CompressionAlgorithm::None,
            compression_level: None,
            pretty_print: false,
            include_metadata: true,
            max_size: Some(10 * 1024 * 1024), // 10 MB
        }
    }
}

/// Serialization metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SerializationMetadata {
    /// Format used for serialization
    pub format: SerializationFormat,
    /// Compression algorithm used
    pub compression: CompressionAlgorithm,
    /// Original size before compression
    pub original_size: usize,
    /// Compressed size
    pub compressed_size: usize,
    /// Serialization timestamp
    pub timestamp: chrono::DateTime<chrono::Utc>,
    /// Version of the serialization schema
    pub schema_version: String,
    /// Checksum for data integrity
    pub checksum: String,
}

/// IOC serializer trait for different data formats
pub trait IOCSerializer: Send + Sync {
    /// Serialize data to bytes
    fn serialize<T: Serialize>(&self, data: &T, config: &SerializationConfig) -> DataStoreResult<Vec<u8>>;
    
    /// Deserialize data from bytes
    fn deserialize<T: for<'de> Deserialize<'de>>(&self, data: &[u8], config: &SerializationConfig) -> DataStoreResult<T>;
    
    /// Serialize data to writer
    fn serialize_to_writer<T: Serialize, W: Write>(
        &self, 
        data: &T, 
        writer: W, 
        config: &SerializationConfig
    ) -> DataStoreResult<SerializationMetadata>;
    
    /// Deserialize data from reader
    fn deserialize_from_reader<T: for<'de> Deserialize<'de>, R: Read>(
        &self, 
        reader: R, 
        config: &SerializationConfig
    ) -> DataStoreResult<T>;
    
    /// Get format identifier
    fn format(&self) -> SerializationFormat;
    
    /// Estimate serialized size without actually serializing
    fn estimate_size<T: Serialize>(&self, data: &T) -> DataStoreResult<usize>;
    
    /// Validate serialized data integrity
    fn validate(&self, data: &[u8], metadata: &SerializationMetadata) -> DataStoreResult<bool>;
}

/// JSON serializer implementation
pub struct JsonSerializer;

impl IOCSerializer for JsonSerializer {
    fn serialize<T: Serialize>(&self, data: &T, config: &SerializationConfig) -> DataStoreResult<Vec<u8>> {
        let json_bytes = if config.pretty_print {
            serde_json::to_vec_pretty(data)
        } else {
            serde_json::to_vec(data)
        }.map_err(|e| DataStoreError::Serialization(format!("JSON serialization failed: {}", e)))?;
        
        self.apply_compression(&json_bytes, config)
    }
    
    fn deserialize<T: for<'de> Deserialize<'de>>(&self, data: &[u8], config: &SerializationConfig) -> DataStoreResult<T> {
        let decompressed = self.decompress(data, config)?;
        serde_json::from_slice(&decompressed)
            .map_err(|e| DataStoreError::Serialization(format!("JSON deserialization failed: {}", e)))
    }
    
    fn serialize_to_writer<T: Serialize, W: Write>(
        &self, 
        data: &T, 
        mut writer: W, 
        config: &SerializationConfig
    ) -> DataStoreResult<SerializationMetadata> {
        let serialized = self.serialize(data, config)?;
        let original_size = self.estimate_size(data)?;
        
        writer.write_all(&serialized)
            .map_err(|e| DataStoreError::Internal(format!("Write failed: {}", e)))?;
        
        Ok(SerializationMetadata {
            format: SerializationFormat::Json,
            compression: config.compression,
            original_size,
            compressed_size: serialized.len(),
            timestamp: chrono::Utc::now(),
            schema_version: "1.0".to_string(),
            checksum: self.calculate_checksum(&serialized),
        })
    }
    
    fn deserialize_from_reader<T: for<'de> Deserialize<'de>, R: Read>(
        &self, 
        mut reader: R, 
        config: &SerializationConfig
    ) -> DataStoreResult<T> {
        let mut buffer = Vec::new();
        reader.read_to_end(&mut buffer)
            .map_err(|e| DataStoreError::Internal(format!("Read failed: {}", e)))?;
        
        self.deserialize(&buffer, config)
    }
    
    fn format(&self) -> SerializationFormat {
        SerializationFormat::Json
    }
    
    fn estimate_size<T: Serialize>(&self, data: &T) -> DataStoreResult<usize> {
        let json_bytes = serde_json::to_vec(data)
            .map_err(|e| DataStoreError::Serialization(format!("Size estimation failed: {}", e)))?;
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
                    .map_err(|e| DataStoreError::Internal(format!("Gzip compression failed: {}", e)))?;
                encoder.finish()
                    .map_err(|e| DataStoreError::Internal(format!("Gzip finalization failed: {}", e)))
            }
            _ => Err(DataStoreError::Internal(format!("Unsupported compression: {}", config.compression))),
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
                    .map_err(|e| DataStoreError::Internal(format!("Gzip decompression failed: {}", e)))?;
                Ok(decompressed)
            }
            _ => Err(DataStoreError::Internal(format!("Unsupported compression: {}", config.compression))),
        }
    }
    
    fn calculate_checksum(&self, data: &[u8]) -> String {
        use sha2::{Sha256, Digest};
        let mut hasher = Sha256::new();
        hasher.update(data);
        format!("{:x}", hasher.finalize())
    }
}

/// MessagePack serializer implementation (placeholder for future implementation)
pub struct MessagePackSerializer;

impl IOCSerializer for MessagePackSerializer {
    fn serialize<T: Serialize>(&self, _data: &T, _config: &SerializationConfig) -> DataStoreResult<Vec<u8>> {
        Err(DataStoreError::Internal("MessagePack serialization not yet implemented".to_string()))
    }
    
    fn deserialize<T: for<'de> Deserialize<'de>>(&self, _data: &[u8], _config: &SerializationConfig) -> DataStoreResult<T> {
        Err(DataStoreError::Internal("MessagePack deserialization not yet implemented".to_string()))
    }
    
    fn serialize_to_writer<T: Serialize, W: Write>(
        &self, 
        _data: &T, 
        _writer: W, 
        _config: &SerializationConfig
    ) -> DataStoreResult<SerializationMetadata> {
        Err(DataStoreError::Internal("MessagePack writer serialization not yet implemented".to_string()))
    }
    
    fn deserialize_from_reader<T: for<'de> Deserialize<'de>, R: Read>(
        &self, 
        _reader: R, 
        _config: &SerializationConfig
    ) -> DataStoreResult<T> {
        Err(DataStoreError::Internal("MessagePack reader deserialization not yet implemented".to_string()))
    }
    
    fn format(&self) -> SerializationFormat {
        SerializationFormat::MessagePack
    }
    
    fn estimate_size<T: Serialize>(&self, _data: &T) -> DataStoreResult<usize> {
        Err(DataStoreError::Internal("MessagePack size estimation not yet implemented".to_string()))
    }
    
    fn validate(&self, _data: &[u8], _metadata: &SerializationMetadata) -> DataStoreResult<bool> {
        Err(DataStoreError::Internal("MessagePack validation not yet implemented".to_string()))
    }
}

/// Serializer factory for creating appropriate serializers
pub struct SerializerFactory;

impl SerializerFactory {
    /// Create a serializer for the specified format
    pub fn create_serializer(format: SerializationFormat) -> DataStoreResult<Box<dyn IOCSerializer>> {
        match format {
            SerializationFormat::Json => Ok(Box::new(JsonSerializer)),
            SerializationFormat::MessagePack => Ok(Box::new(MessagePackSerializer)),
            _ => Err(DataStoreError::Internal(format!("Unsupported serialization format: {}", format))),
        }
    }
    
    /// Get available serialization formats
    pub fn available_formats() -> Vec<SerializationFormat> {
        vec![
            SerializationFormat::Json,
            SerializationFormat::MessagePack,
        ]
    }
    
    /// Check if a format is supported
    pub fn is_format_supported(format: SerializationFormat) -> bool {
        matches!(format, SerializationFormat::Json | SerializationFormat::MessagePack)
    }
}

/// Utility functions for serialization operations
pub mod utils {
    use super::*;
    
    /// Serialize data with automatic format detection and compression
    pub fn auto_serialize<T: Serialize>(
        data: &T, 
        config: Option<SerializationConfig>
    ) -> DataStoreResult<(Vec<u8>, SerializationMetadata)> {
        let config = config.unwrap_or_default();
        let serializer = SerializerFactory::create_serializer(config.format)?;
        
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
    pub fn auto_deserialize<T: for<'de> Deserialize<'de>>(
        data: &[u8], 
        metadata: &SerializationMetadata
    ) -> DataStoreResult<T> {
        let config = SerializationConfig {
            format: metadata.format,
            compression: metadata.compression,
            compression_level: None,
            pretty_print: false,
            include_metadata: true,
            max_size: None,
        };
        
        let serializer = SerializerFactory::create_serializer(metadata.format)?;
        
        // Validate data integrity
        if !serializer.validate(data, metadata)? {
            return Err(DataStoreError::Validation("Data integrity check failed".to_string()));
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
                    .map_err(|e| DataStoreError::Internal(format!("Gzip compression failed: {}", e)))?;
                encoder.finish()
                    .map_err(|e| DataStoreError::Internal(format!("Gzip finalization failed: {}", e)))
            }
            _ => Err(DataStoreError::Internal(format!("Unsupported compression algorithm: {}", algorithm))),
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
                    .map_err(|e| DataStoreError::Internal(format!("Gzip decompression failed: {}", e)))?;
                Ok(decompressed)
            }
            _ => Err(DataStoreError::Internal(format!("Unsupported compression algorithm: {}", algorithm))),
        }
    }
}