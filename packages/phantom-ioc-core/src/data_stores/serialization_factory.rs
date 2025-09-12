//! Serializer Factory
//!
//! Factory for creating serializer instances

use std::sync::Arc;

use crate::data_stores::types::DataStoreResult;
use crate::data_stores::serialization_types::SerializationFormat;
use crate::data_stores::serialization_traits::IOCSerializer;
use crate::data_stores::serializers::{JsonSerializer, MessagePackSerializer};

/// Serializer factory for creating appropriate serializers
pub struct SerializerFactory;

impl SerializerFactory {
    /// Create a serializer for the specified format
    pub fn create_serializer(format: &SerializationFormat) -> DataStoreResult<Box<dyn IOCSerializer>> {
        match format {
            SerializationFormat::Json => Ok(Box::new(JsonSerializer)),
            SerializationFormat::MessagePack => Ok(Box::new(MessagePackSerializer)),
            _ => Err(crate::data_stores::DataStoreError::Internal(format!("Unsupported serialization format: {}", format))),
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
    pub fn is_format_supported(format: &SerializationFormat) -> bool {
        matches!(format, SerializationFormat::Json | SerializationFormat::MessagePack)
    }
}