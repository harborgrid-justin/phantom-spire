//! Elasticsearch document conversion utilities
//!
//! This module provides utilities for converting between IOC data structures
//! and Elasticsearch documents.

use serde_json::Value;
use uuid::Uuid;
use chrono::{DateTime, Utc};

use crate::models::*;
use crate::data_stores::types::{DataStoreResult, DataStoreError};

/// Convert IOC to Elasticsearch document
pub fn ioc_to_document(ioc: &IOC, tenant_id: &str) -> Value {
    serde_json::json!({
        "tenant_id": tenant_id,
        "id": ioc.id.to_string(),
        "indicator_type": ioc.indicator_type,
        "value": ioc.value,
        "confidence": ioc.confidence,
        "severity": ioc.severity,
        "source": ioc.source,
        "timestamp": ioc.timestamp.to_rfc3339(),
        "tags": ioc.tags,
        "context": ioc.context,
        "raw_data": ioc.raw_data
    })
}

/// Convert Elasticsearch document to IOC
pub fn document_to_ioc(doc: &Value) -> DataStoreResult<IOC> {
    let id_str = doc.get("id")
        .and_then(|v| v.as_str())
        .ok_or_else(|| DataStoreError::Serialization("Missing id field".to_string()))?;
    let id = Uuid::parse_str(id_str)
        .map_err(|e| DataStoreError::Serialization(format!("Invalid UUID: {}", e)))?;

    Ok(IOC {
        id,
        indicator_type: serde_json::from_value(doc.get("indicator_type").cloned().unwrap_or(Value::Null))
            .map_err(|e| DataStoreError::Serialization(format!("Failed to deserialize indicator_type: {}", e)))?,
        value: doc.get("value")
            .and_then(|v| v.as_str())
            .ok_or_else(|| DataStoreError::Serialization("Missing value field".to_string()))?
            .to_string(),
        confidence: doc.get("confidence")
            .and_then(|v| v.as_f64())
            .ok_or_else(|| DataStoreError::Serialization("Missing confidence field".to_string()))?,
        severity: serde_json::from_value(doc.get("severity").cloned().unwrap_or(Value::Null))
            .map_err(|e| DataStoreError::Serialization(format!("Failed to deserialize severity: {}", e)))?,
        source: doc.get("source")
            .and_then(|v| v.as_str())
            .ok_or_else(|| DataStoreError::Serialization("Missing source field".to_string()))?
            .to_string(),
        timestamp: doc.get("timestamp")
            .and_then(|v| v.as_str())
            .and_then(|s| DateTime::parse_from_rfc3339(s).ok())
            .map(|dt| dt.with_timezone(&Utc))
            .unwrap_or_else(|| Utc::now()),
        tags: doc.get("tags")
            .and_then(|v| v.as_array())
            .map(|arr| arr.iter().filter_map(|v| v.as_str().map(|s| s.to_string())).collect())
            .unwrap_or_default(),
        context: serde_json::from_value(doc.get("context").cloned().unwrap_or(Value::Null))
            .map_err(|e| DataStoreError::Serialization(format!("Failed to deserialize context: {}", e)))?,
        raw_data: doc.get("raw_data").and_then(|v| v.as_str()).map(|s| s.to_string()),
    })
}

/// Convert IOCResult to Elasticsearch document
pub fn result_to_document(result: &IOCResult, tenant_id: &str) -> Value {
    serde_json::json!({
        "ioc": result.ioc,
        "detection_result": result.detection_result,
        "intelligence": result.intelligence,
        "correlations": result.correlations,
        "analysis": result.analysis,
        "processing_timestamp": result.processing_timestamp.to_rfc3339(),
        "tenant_id": tenant_id
    })
}

/// Convert Elasticsearch document to IOCResult
pub fn document_to_result(doc: &Value) -> DataStoreResult<IOCResult> {
    Ok(IOCResult {
        ioc: serde_json::from_value(doc.get("ioc").cloned().unwrap_or(Value::Null))
            .map_err(|e| DataStoreError::Serialization(format!("Failed to deserialize IOC: {}", e)))?,
        detection_result: serde_json::from_value(doc.get("detection_result").cloned().unwrap_or(Value::Null))
            .map_err(|e| DataStoreError::Serialization(format!("Failed to deserialize detection_result: {}", e)))?,
        intelligence: serde_json::from_value(doc.get("intelligence").cloned().unwrap_or(Value::Null))
            .map_err(|e| DataStoreError::Serialization(format!("Failed to deserialize intelligence: {}", e)))?,
        correlations: serde_json::from_value(doc.get("correlations").cloned().unwrap_or(Value::Null))
            .map_err(|e| DataStoreError::Serialization(format!("Failed to deserialize correlations: {}", e)))?,
        analysis: serde_json::from_value(doc.get("analysis").cloned().unwrap_or(Value::Null))
            .map_err(|e| DataStoreError::Serialization(format!("Failed to deserialize analysis: {}", e)))?,
        processing_timestamp: doc.get("processing_timestamp")
            .and_then(|v| v.as_str())
            .and_then(|s| DateTime::parse_from_rfc3339(s).ok())
            .map(|dt| dt.with_timezone(&Utc))
            .unwrap_or_else(|| Utc::now()),
    })
}

/// Convert EnrichedIOC to Elasticsearch document
pub fn enriched_to_document(enriched: &EnrichedIOC, tenant_id: &str) -> Value {
    serde_json::json!({
        "base_ioc": enriched.base_ioc,
        "enrichment_data": enriched.enrichment_data,
        "sources": enriched.sources,
        "enrichment_timestamp": enriched.enrichment_timestamp.to_rfc3339(),
        "tenant_id": tenant_id
    })
}

/// Convert Elasticsearch document to EnrichedIOC
pub fn document_to_enriched(doc: &Value) -> DataStoreResult<EnrichedIOC> {
    Ok(EnrichedIOC {
        base_ioc: serde_json::from_value(doc.get("base_ioc").cloned().unwrap_or(Value::Null))
            .map_err(|e| DataStoreError::Serialization(format!("Failed to deserialize base_ioc: {}", e)))?,
        enrichment_data: serde_json::from_value(doc.get("enrichment_data").cloned().unwrap_or(Value::Null))
            .map_err(|e| DataStoreError::Serialization(format!("Failed to deserialize enrichment_data: {}", e)))?,
        sources: serde_json::from_value(doc.get("sources").cloned().unwrap_or(Value::Null))
            .map_err(|e| DataStoreError::Serialization(format!("Failed to deserialize sources: {}", e)))?,
        enrichment_timestamp: doc.get("enrichment_timestamp")
            .and_then(|v| v.as_str())
            .and_then(|s| DateTime::parse_from_rfc3339(s).ok())
            .map(|dt| dt.with_timezone(&Utc))
            .unwrap_or_else(|| Utc::now()),
    })
}

/// Convert Correlation to Elasticsearch document
pub fn correlation_to_document(correlation: &Correlation, tenant_id: &str) -> Value {
    let correlated_iocs: Vec<String> = correlation.correlated_iocs.iter()
        .map(|uuid| uuid.to_string())
        .collect();

    serde_json::json!({
        "id": correlation.id.to_string(),
        "correlated_iocs": correlated_iocs,
        "correlation_type": correlation.correlation_type,
        "strength": correlation.strength,
        "evidence": correlation.evidence,
        "timestamp": correlation.timestamp.to_rfc3339(),
        "tenant_id": tenant_id
    })
}

/// Convert Elasticsearch document to Correlation
pub fn document_to_correlation(doc: &Value) -> DataStoreResult<Correlation> {
    Ok(Correlation {
        id: Uuid::parse_str(doc.get("id").and_then(|v| v.as_str()).unwrap_or(""))
            .unwrap_or(Uuid::new_v4()),
        correlated_iocs: doc.get("correlated_iocs")
            .and_then(|v| v.as_array())
            .map(|arr| arr.iter().filter_map(|v| v.as_str()).filter_map(|s| Uuid::parse_str(s).ok()).collect())
            .unwrap_or_default(),
        correlation_type: doc.get("correlation_type")
            .and_then(|v| v.as_str())
            .unwrap_or("unknown")
            .to_string(),
        strength: doc.get("strength")
            .and_then(|v| v.as_f64())
            .unwrap_or(0.0),
        evidence: doc.get("evidence")
            .and_then(|v| v.as_array())
            .map(|arr| arr.iter().filter_map(|v| v.as_str().map(|s| s.to_string())).collect())
            .unwrap_or_default(),
        timestamp: doc.get("timestamp")
            .and_then(|v| v.as_str())
            .and_then(|s| DateTime::parse_from_rfc3339(s).ok())
            .map(|dt| dt.with_timezone(&Utc))
            .unwrap_or_else(|| Utc::now()),
    })
}