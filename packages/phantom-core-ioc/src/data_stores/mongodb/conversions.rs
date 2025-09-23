//! Document Conversion Utilities
//!
//! Utilities for converting between IOC objects and MongoDB documents.

use mongodb::bson::{doc, Document};
use serde_json;
use uuid::Uuid;
use chrono::{DateTime, Utc};

use crate::data_stores::types::*;

/// Convert IOC to MongoDB document
pub fn ioc_to_document(ioc: &IOC) -> Document {
    doc! {
        "_id": ioc.id.to_string(),
        "indicator_type": &ioc.indicator_type,
        "value": &ioc.value,
        "confidence": ioc.confidence,
        "severity": &ioc.severity,
        "source": ioc.source.as_ref().unwrap_or(&"".to_string()),
        "timestamp": ioc.timestamp.to_rfc3339(),
        "tags": &ioc.tags,
        "context": bson::to_bson(&ioc.context).unwrap_or(bson::Bson::Document(doc! {})),
        "raw_data": ioc.raw_data,
    }
}

/// Convert MongoDB document to IOC
pub fn document_to_ioc(doc: Document) -> DataStoreResult<IOC> {
    let id_str: String = doc.get_str("_id")
        .map_err(|e| DataStoreError::Serialization(format!("Missing _id field: {}", e)))?;
    let id = Uuid::parse_str(&id_str)
        .map_err(|e| DataStoreError::Serialization(format!("Invalid UUID: {}", e)))?;

    Ok(IOC {
        id,
        indicator_type: serde_json::from_value(doc.get("indicator_type").cloned().unwrap_or(serde_json::Value::Null))
            .map_err(|e| DataStoreError::Serialization(format!("Failed to deserialize indicator_type: {}", e)))?,
        value: doc.get_str("value")
            .map_err(|e| DataStoreError::Serialization(format!("Missing value: {}", e)))?
            .to_string(),
        confidence: doc.get_f64("confidence")
            .map_err(|e| DataStoreError::Serialization(format!("Missing confidence: {}", e)))?,
        severity: serde_json::from_value(doc.get("severity").cloned().unwrap_or(serde_json::Value::Null))
            .map_err(|e| DataStoreError::Serialization(format!("Failed to deserialize severity: {}", e)))?,
        source: Some(doc.get_str("source")
            .map_err(|e| DataStoreError::Serialization(format!("Missing source: {}", e)))?
            .to_string()),
        timestamp: doc.get_str("timestamp")
            .and_then(|s| DateTime::parse_from_rfc3339(s).ok())
            .map(|dt| dt.with_timezone(&Utc))
            .unwrap_or_else(|| Utc::now()),
        tags: doc.get_array("tags")
            .map_err(|e| DataStoreError::Serialization(format!("Missing tags: {}", e)))?
            .iter()
            .filter_map(|tag| tag.as_str().map(|s| s.to_string()))
            .collect(),
        context: serde_json::from_value(doc.get("context").cloned().unwrap_or(serde_json::Value::Null))
            .map_err(|e| DataStoreError::Serialization(format!("Failed to deserialize context: {}", e)))?,
        raw_data: doc.get_str("raw_data").map(|s| s.to_string()),
    })
}