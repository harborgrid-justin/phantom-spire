//! Serialization Types
//!
//! Common types for data serialization and compression

use serde::{Serialize, Deserialize};

/// Serialization format enumeration
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
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