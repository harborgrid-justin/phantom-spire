//! Enhanced Cryptographic Operations
//! 
//! High-performance cryptographic operations using multiple crates for optimal performance:
//! - hex for efficient encoding/decoding
//! - time for precise timestamp handling

use napi::bindgen_prelude::*;
use napi_derive::napi;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use time::OffsetDateTime;
use hex;

/// Enhanced cryptographic result with performance metrics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CryptoResult {
    pub operation: String,
    pub result: String,
    pub processing_time_ns: u64,
    pub precise_timestamp: i64,
    pub algorithm: String,
    pub key_size: Option<usize>,
    pub success: bool,
}

/// High-performance cryptographic processor
#[derive(Debug)]
pub struct EnhancedCryptoProcessor {
    pub operations_count: u64,
    pub total_processing_time_ns: u64,
    pub performance_metrics: CryptoMetrics,
}

/// Cryptographic performance metrics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CryptoMetrics {
    pub hash_operations: u64,
    pub signature_operations: u64,
    pub encryption_operations: u64,
    pub total_bytes_processed: u64,
    pub average_processing_speed_mbps: f64,
    pub last_updated: DateTime<Utc>,
}

impl EnhancedCryptoProcessor {
    /// Create a new enhanced crypto processor
    pub fn new() -> Self {
        Self {
            operations_count: 0,
            total_processing_time_ns: 0,
            performance_metrics: CryptoMetrics {
                hash_operations: 0,
                signature_operations: 0,
                encryption_operations: 0,
                total_bytes_processed: 0,
                average_processing_speed_mbps: 0.0,
                last_updated: Utc::now(),
            },
        }
    }

    /// High-precision timestamp with nanosecond accuracy
    pub fn get_precise_timestamp(&self) -> i64 {
        OffsetDateTime::now_utc().unix_timestamp_nanos() as i64
    }

    /// Encode binary data to hex with timing information
    pub fn encode_hex_timed(&mut self, data: &[u8]) -> CryptoResult {
        let start_time = std::time::Instant::now();
        let precise_start = OffsetDateTime::now_utc();

        let encoded = hex::encode(data);

        let processing_time_ns = start_time.elapsed().as_nanos() as u64;

        CryptoResult {
            operation: "hex_encode".to_string(),
            result: encoded,
            processing_time_ns,
            precise_timestamp: precise_start.unix_timestamp_nanos() as i64,
            algorithm: "hex".to_string(),
            key_size: None,
            success: true,
        }
    }

    /// Decode hex to binary with timing information
    pub fn decode_hex_timed(&mut self, hex_data: &str) -> Result<CryptoResult, String> {
        let start_time = std::time::Instant::now();
        let precise_start = OffsetDateTime::now_utc();

        let decoded = hex::decode(hex_data)
            .map_err(|e| format!("Hex decode failed: {}", e))?;

        let processing_time_ns = start_time.elapsed().as_nanos() as u64;

        Ok(CryptoResult {
            operation: "hex_decode".to_string(),
            result: hex::encode(&decoded), // Re-encode for consistent result format
            processing_time_ns,
            precise_timestamp: precise_start.unix_timestamp_nanos() as i64,
            algorithm: "hex".to_string(),
            key_size: None,
            success: true,
        })
    }

    /// Get comprehensive performance metrics
    pub fn get_performance_metrics(&self) -> &CryptoMetrics {
        &self.performance_metrics
    }
}

impl Default for EnhancedCryptoProcessor {
    fn default() -> Self {
        Self::new()
    }
}

// NAPI bindings for JavaScript integration
#[napi]
pub struct EnhancedCryptoProcessorNapi {
    inner: EnhancedCryptoProcessor,
}

#[napi]
impl EnhancedCryptoProcessorNapi {
    #[napi(constructor)]
    pub fn new() -> Self {
        Self {
            inner: EnhancedCryptoProcessor::new(),
        }
    }

    /// Encode to hex with timing
    #[napi]
    pub fn encode_hex_timed(&mut self, data: Buffer) -> Result<String> {
        let result = self.inner.encode_hex_timed(data.as_ref());
        serde_json::to_string(&result)
            .map_err(|e| napi::Error::from_reason(format!("Serialization error: {}", e)))
    }

    /// Decode from hex with timing
    #[napi]
    pub fn decode_hex_timed(&mut self, hex_data: String) -> Result<String> {
        let result = self.inner.decode_hex_timed(&hex_data)
            .map_err(|e| napi::Error::from_reason(format!("Decode error: {}", e)))?;
        serde_json::to_string(&result)
            .map_err(|e| napi::Error::from_reason(format!("Serialization error: {}", e)))
    }

    /// Get performance metrics
    #[napi]
    pub fn get_performance_metrics(&self) -> Result<String> {
        let metrics = self.inner.get_performance_metrics();
        serde_json::to_string(metrics)
            .map_err(|e| napi::Error::from_reason(format!("Serialization error: {}", e)))
    }

    /// Get precise timestamp with nanosecond accuracy
    #[napi]
    pub fn get_precise_timestamp(&self) -> i64 {
        self.inner.get_precise_timestamp()
    }
}