//! High-Performance Data Integrity and Forensics Module
//!
//! This module provides ultra-fast data integrity checking and forensics capabilities:
//! - CRC32 SIMD-accelerated checksumming for fast data verification
//! - xxHash for lightning-fast file and log fingerprinting
//! - Reed-Solomon erasure coding for backup and evidence recovery
//! - LZ4 ultra-fast compression for efficient storage
//! - Snappy compression for balanced speed/ratio
//! - Memory-mapped file I/O for high-performance processing
//! - Binary serialization with bincode for speed
//! - High-precision timestamps with nanosecond accuracy
//! - Optimized for high-throughput XDR data processing

use napi::bindgen_prelude::*;
use napi_derive::napi;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::Path;
use std::fs::File;
use chrono::{DateTime, Utc};
use once_cell::sync::Lazy;
use crc32fast::Hasher as CrcHasher;
use xxhash_rust::xxh3::{xxh3_64, xxh3_128};
use reed_solomon_erasure::galois_8::ReedSolomon;
use lz4_flex::{compress_prepend_size, decompress_size_prepended};
use snap::{raw::Encoder as SnapEncoder, raw::Decoder as SnapDecoder};
use memmap2::Mmap;
use time::{OffsetDateTime, PrimitiveDateTime};

/// Global Reed-Solomon encoder for evidence protection
static RS_ENCODER: Lazy<std::sync::Mutex<ReedSolomon>> = Lazy::new(|| {
    // Create RS encoder with 10 data shards and 3 parity shards for recovery
    std::sync::Mutex::new(ReedSolomon::new(10, 3).unwrap())
});

/// Fast data integrity checker using SIMD-accelerated CRC32
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataIntegrityCheck {
    pub id: String,
    pub data_hash: String,
    pub crc32_checksum: u32,
    pub xxhash_64: u64,
    pub xxhash_128: u128,
    pub data_size: u64,
    pub timestamp: DateTime<Utc>,
    pub precise_timestamp: i64, // Nanosecond precision timestamp using time crate
    pub integrity_score: f32,
    pub compression_ratio: Option<f32>, // LZ4/Snappy compression efficiency
    pub processing_time_ns: u64, // Processing time in nanoseconds
}

/// Enhanced compression result with multiple algorithms
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompressionResult {
    pub original_size: usize,
    pub lz4_compressed_size: usize,
    pub snappy_compressed_size: usize,
    pub lz4_compression_ratio: f32,
    pub snappy_compression_ratio: f32,
    pub recommended_algorithm: CompressionAlgorithm,
    pub compression_time_ns: u64,
}

/// Supported compression algorithms
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum CompressionAlgorithm {
    LZ4,
    Snappy,
    None,
}

/// Memory-mapped file processing result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryMappedProcessingResult {
    pub file_path: String,
    pub file_size: u64,
    pub processing_speed_mbps: f64,
    pub chunks_processed: u32,
    pub integrity_check: DataIntegrityCheck,
    pub compression_result: Option<CompressionResult>,
}

/// Evidence protection using Reed-Solomon encoding
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvidenceProtection {
    pub evidence_id: String,
    pub original_size: usize,
    pub data_shards: u8,
    pub parity_shards: u8,
    pub recovery_metadata: HashMap<String, String>,
    pub protection_timestamp: DateTime<Utc>,
}

/// High-performance XDR data processor
#[derive(Debug)]
pub struct HighPerformanceXDRProcessor {
    pub processed_bytes: u64,
    pub integrity_checks: HashMap<String, DataIntegrityCheck>,
    pub protected_evidence: HashMap<String, EvidenceProtection>,
    pub performance_metrics: ProcessingMetrics,
}

/// Performance metrics for monitoring
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProcessingMetrics {
    pub total_files_processed: u64,
    pub total_bytes_processed: u64,
    pub average_processing_speed_mbps: f64,
    pub integrity_checks_performed: u64,
    pub evidence_items_protected: u64,
    pub last_updated: DateTime<Utc>,
}

impl HighPerformanceXDRProcessor {
    /// Create a new high-performance XDR processor
    pub fn new() -> Self {
        Self {
            processed_bytes: 0,
            integrity_checks: HashMap::new(),
            protected_evidence: HashMap::new(),
            performance_metrics: ProcessingMetrics {
                total_files_processed: 0,
                total_bytes_processed: 0,
                average_processing_speed_mbps: 0.0,
                integrity_checks_performed: 0,
                evidence_items_protected: 0,
                last_updated: Utc::now(),
            },
        }
    }

    /// Ultra-fast data integrity check using SIMD CRC32 + xxHash with enhanced features
    /// This provides both error detection (CRC32) and fingerprinting (xxHash)
    pub fn fast_integrity_check(&mut self, data: &[u8], file_id: String) -> DataIntegrityCheck {
        let start_time = std::time::Instant::now();
        let precise_start = time::OffsetDateTime::now_utc();

        // SIMD-accelerated CRC32 calculation
        let mut crc_hasher = CrcHasher::new();
        crc_hasher.update(data);
        let crc32_checksum = crc_hasher.finalize();

        // Ultra-fast xxHash calculation (faster than SHA for fingerprinting)
        let xxhash_64 = xxh3_64(data);
        let xxhash_128 = xxh3_128(data);

        // Create SHA256 hash for cryptographic integrity (slower but secure)
        let data_hash = format!("{:x}", sha2::Sha256::digest(data));

        // Test compression ratios for storage optimization
        let compression_ratio = self.test_compression_efficiency(data);

        // Calculate integrity score based on multiple factors
        let integrity_score = self.calculate_integrity_score(data, crc32_checksum);

        let processing_time = start_time.elapsed();
        let processing_time_ns = processing_time.as_nanos() as u64;

        let check = DataIntegrityCheck {
            id: file_id.clone(),
            data_hash,
            crc32_checksum,
            xxhash_64,
            xxhash_128,
            data_size: data.len() as u64,
            timestamp: Utc::now(),
            precise_timestamp: precise_start.unix_timestamp_nanos(),
            integrity_score,
            compression_ratio,
            processing_time_ns,
        };

        // Update metrics
        self.processed_bytes += data.len() as u64;
        self.performance_metrics.integrity_checks_performed += 1;
        self.performance_metrics.total_bytes_processed += data.len() as u64;
        
        let speed_mbps = (data.len() as f64 / processing_time.as_secs_f64()) / (1024.0 * 1024.0);
        self.update_processing_speed(speed_mbps);

        // Cache the integrity check
        self.integrity_checks.insert(file_id, check.clone());

        check
    }

    /// Ultra-fast LZ4 compression for data storage optimization
    pub fn compress_data_lz4(&self, data: &[u8]) -> Result<Vec<u8>, String> {
        compress_prepend_size(data).map_err(|e| format!("LZ4 compression failed: {}", e))
    }

    /// Ultra-fast LZ4 decompression
    pub fn decompress_data_lz4(&self, compressed_data: &[u8]) -> Result<Vec<u8>, String> {
        decompress_size_prepended(compressed_data).map_err(|e| format!("LZ4 decompression failed: {}", e))
    }

    /// Snappy compression for balanced speed/ratio
    pub fn compress_data_snappy(&self, data: &[u8]) -> Result<Vec<u8>, String> {
        let mut encoder = SnapEncoder::new();
        encoder.compress_vec(data).map_err(|e| format!("Snappy compression failed: {}", e))
    }

    /// Snappy decompression
    pub fn decompress_data_snappy(&self, compressed_data: &[u8]) -> Result<Vec<u8>, String> {
        let mut decoder = SnapDecoder::new();
        decoder.decompress_vec(compressed_data).map_err(|e| format!("Snappy decompression failed: {}", e))
    }

    /// Test both compression algorithms and recommend the best one
    pub fn analyze_compression_efficiency(&self, data: &[u8]) -> CompressionResult {
        let start_time = std::time::Instant::now();
        let original_size = data.len();

        // Test LZ4 compression
        let lz4_compressed = self.compress_data_lz4(data).unwrap_or_else(|_| data.to_vec());
        let lz4_compressed_size = lz4_compressed.len();
        let lz4_compression_ratio = lz4_compressed_size as f32 / original_size as f32;

        // Test Snappy compression
        let snappy_compressed = self.compress_data_snappy(data).unwrap_or_else(|_| data.to_vec());
        let snappy_compressed_size = snappy_compressed.len();
        let snappy_compression_ratio = snappy_compressed_size as f32 / original_size as f32;

        // Recommend best algorithm (LZ4 is generally faster, Snappy has better ratio)
        let recommended_algorithm = if lz4_compression_ratio < snappy_compression_ratio {
            CompressionAlgorithm::LZ4
        } else if snappy_compression_ratio < 0.9 { // If Snappy provides good compression
            CompressionAlgorithm::Snappy
        } else {
            CompressionAlgorithm::None // Don't compress if ratio is poor
        };

        let compression_time_ns = start_time.elapsed().as_nanos() as u64;

        CompressionResult {
            original_size,
            lz4_compressed_size,
            snappy_compressed_size,
            lz4_compression_ratio,
            snappy_compression_ratio,
            recommended_algorithm,
            compression_time_ns,
        }
    }

    /// Memory-mapped file processing for huge files
    pub fn process_file_memory_mapped<P: AsRef<Path>>(&mut self, file_path: P) -> Result<MemoryMappedProcessingResult, String> {
        let file_path_str = file_path.as_ref().to_string_lossy().to_string();
        let start_time = std::time::Instant::now();

        // Open file and create memory map
        let file = File::open(&file_path).map_err(|e| format!("Failed to open file: {}", e))?;
        let mmap = unsafe { Mmap::map(&file).map_err(|e| format!("Failed to memory map file: {}", e))? };
        
        let file_size = mmap.len() as u64;
        let chunk_size = 1024 * 1024; // 1MB chunks
        let mut chunks_processed = 0;

        // Process file in chunks for better performance monitoring
        let mut combined_integrity = DataIntegrityCheck {
            id: file_path_str.clone(),
            data_hash: String::new(),
            crc32_checksum: 0,
            xxhash_64: 0,
            xxhash_128: 0,
            data_size: file_size,
            timestamp: Utc::now(),
            precise_timestamp: time::OffsetDateTime::now_utc().unix_timestamp_nanos(),
            integrity_score: 1.0,
            compression_ratio: None,
            processing_time_ns: 0,
        };

        // Process entire memory mapped data for integrity check
        let integrity_check = self.fast_integrity_check(&mmap[..], file_path_str.clone());
        combined_integrity = integrity_check;

        // Test compression on a sample of the data (first 64KB for efficiency)
        let sample_size = std::cmp::min(65536, mmap.len());
        let compression_result = if sample_size > 0 {
            Some(self.analyze_compression_efficiency(&mmap[..sample_size]))
        } else {
            None
        };

        chunks_processed = ((file_size as f64) / (chunk_size as f64)).ceil() as u32;

        let processing_time = start_time.elapsed();
        let processing_speed_mbps = (file_size as f64 / processing_time.as_secs_f64()) / (1024.0 * 1024.0);

        Ok(MemoryMappedProcessingResult {
            file_path: file_path_str,
            file_size,
            processing_speed_mbps,
            chunks_processed,
            integrity_check: combined_integrity,
            compression_result,
        })
    }

    /// Test compression efficiency for a given data sample
    fn test_compression_efficiency(&self, data: &[u8]) -> Option<f32> {
        if data.len() < 1024 { // Skip compression test for small data
            return None;
        }

        // Test on a sample to avoid performance impact
        let sample_size = std::cmp::min(8192, data.len()); // 8KB sample
        let sample = &data[..sample_size];
        
        if let Ok(compressed) = self.compress_data_lz4(sample) {
            Some(compressed.len() as f32 / sample.len() as f32)
        } else {
            None
        }
    }

    /// Calculate integrity score based on data characteristics
    fn calculate_integrity_score(&self, data: &[u8], crc32: u32) -> f32 {
        let mut score = 1.0f32;

        // Check for common corruption patterns
        if data.is_empty() {
            return 0.0;
        }

        // Check entropy (low entropy might indicate corruption or tampering)
        let entropy = self.calculate_entropy(data);
        if entropy < 0.5 {
            score *= 0.8; // Reduce score for low entropy
        }

        // Check for null byte patterns that might indicate corruption
        let null_ratio = data.iter().filter(|&&b| b == 0).count() as f32 / data.len() as f32;
        if null_ratio > 0.5 {
            score *= 0.6;
        }

        // Additional heuristics can be added here
        score.max(0.0).min(1.0)
    }

    /// Calculate Shannon entropy of data
    fn calculate_entropy(&self, data: &[u8]) -> f32 {
        let mut counts = [0u32; 256];
        for &byte in data {
            counts[byte as usize] += 1;
        }

        let len = data.len() as f32;
        let mut entropy = 0.0f32;

        for &count in &counts {
            if count > 0 {
                let p = count as f32 / len;
                entropy -= p * p.log2();
            }
        }

        entropy / 8.0 // Normalize to 0-1 range
    }

    /// Protect evidence using Reed-Solomon encoding for recovery
    pub fn protect_evidence(&mut self, evidence_data: &[u8], evidence_id: String) -> Result<Vec<Vec<u8>>, String> {
        let mut encoder = RS_ENCODER.lock()
            .map_err(|e| format!("Failed to acquire RS encoder: {}", e))?;

        // Split data into chunks for encoding
        let chunk_size = (evidence_data.len() + 9) / 10; // Split into 10 data shards
        let mut data_shards: Vec<Vec<u8>> = Vec::new();

        for i in 0..10 {
            let start = i * chunk_size;
            let end = std::cmp::min(start + chunk_size, evidence_data.len());
            
            if start < evidence_data.len() {
                let mut shard = evidence_data[start..end].to_vec();
                // Pad to consistent size
                shard.resize(chunk_size, 0);
                data_shards.push(shard);
            } else {
                // Create empty shard if we run out of data
                data_shards.push(vec![0; chunk_size]);
            }
        }

        // Add parity shards (initially empty)
        for _ in 0..3 {
            data_shards.push(vec![0; chunk_size]);
        }

        // Encode with Reed-Solomon
        encoder.encode(&mut data_shards)
            .map_err(|e| format!("Reed-Solomon encoding failed: {:?}", e))?;

        // Create protection metadata
        let protection = EvidenceProtection {
            evidence_id: evidence_id.clone(),
            original_size: evidence_data.len(),
            data_shards: 10,
            parity_shards: 3,
            recovery_metadata: HashMap::new(),
            protection_timestamp: Utc::now(),
        };

        self.protected_evidence.insert(evidence_id, protection);
        self.performance_metrics.evidence_items_protected += 1;

        Ok(data_shards)
    }

    /// Recover evidence from Reed-Solomon shards (can handle up to 3 missing shards)
    pub fn recover_evidence(&self, mut shards: Vec<Option<Vec<u8>>>, original_size: usize) -> Result<Vec<u8>, String> {
        let mut encoder = RS_ENCODER.lock()
            .map_err(|e| format!("Failed to acquire RS encoder: {}", e))?;

        // Convert to format expected by reed-solomon-erasure
        let mut data_shards: Vec<Vec<u8>> = Vec::new();
        let mut present = vec![true; 13]; // 10 data + 3 parity

        for (i, shard_opt) in shards.iter().enumerate() {
            if let Some(shard) = shard_opt {
                data_shards.push(shard.clone());
            } else {
                present[i] = false;
                data_shards.push(vec![0; shard_opt.as_ref().map_or(0, |s| s.len())]);
            }
        }

        // Attempt recovery
        encoder.reconstruct(&mut data_shards, &present)
            .map_err(|e| format!("Reed-Solomon recovery failed: {:?}", e))?;

        // Reconstruct original data from recovered shards
        let mut recovered_data = Vec::new();
        for i in 0..10 {
            recovered_data.extend_from_slice(&data_shards[i]);
        }

        // Trim to original size
        recovered_data.truncate(original_size);
        Ok(recovered_data)
    }

    /// Batch process multiple files for integrity checking
    pub fn batch_integrity_check(&mut self, files: Vec<(String, Vec<u8>)>) -> BatchIntegrityResult {
        let start_time = std::time::Instant::now();
        let mut results = Vec::new();
        let mut total_bytes = 0u64;
        let mut failed_checks = 0;

        for (file_id, data) in files {
            total_bytes += data.len() as u64;
            
            match std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
                self.fast_integrity_check(&data, file_id.clone())
            })) {
                Ok(check) => results.push(check),
                Err(_) => {
                    failed_checks += 1;
                    // Create a failed check entry
                    results.push(DataIntegrityCheck {
                        id: file_id,
                        data_hash: "FAILED".to_string(),
                        crc32_checksum: 0,
                        xxhash_64: 0,
                        xxhash_128: 0,
                        data_size: data.len() as u64,
                        timestamp: Utc::now(),
                        integrity_score: 0.0,
                    });
                }
            }
        }

        let processing_time = start_time.elapsed();
        let throughput_mbps = (total_bytes as f64 / processing_time.as_secs_f64()) / (1024.0 * 1024.0);

        BatchIntegrityResult {
            processed_files: results.len(),
            failed_checks,
            total_bytes_processed: total_bytes,
            processing_time_ms: processing_time.as_millis() as u64,
            throughput_mbps,
            integrity_checks: results,
        }
    }

    /// Fast duplicate detection using xxHash
    pub fn detect_duplicates(&self, data_list: Vec<&[u8]>) -> Vec<(usize, usize)> {
        let mut hash_map: HashMap<u64, usize> = HashMap::new();
        let mut duplicates = Vec::new();

        for (index, data) in data_list.iter().enumerate() {
            let hash = xxh3_64(data);
            
            if let Some(original_index) = hash_map.get(&hash) {
                duplicates.push((*original_index, index));
            } else {
                hash_map.insert(hash, index);
            }
        }

        duplicates
    }

    /// Update processing speed metrics
    fn update_processing_speed(&mut self, current_speed_mbps: f64) {
        let current_avg = self.performance_metrics.average_processing_speed_mbps;
        let processed_files = self.performance_metrics.total_files_processed as f64;
        
        // Exponential moving average for smoothing
        if processed_files > 0.0 {
            self.performance_metrics.average_processing_speed_mbps = 
                (current_avg * 0.9) + (current_speed_mbps * 0.1);
        } else {
            self.performance_metrics.average_processing_speed_mbps = current_speed_mbps;
        }
        
        self.performance_metrics.total_files_processed += 1;
        self.performance_metrics.last_updated = Utc::now();
    }

    /// Get comprehensive performance metrics
    pub fn get_performance_metrics(&self) -> &ProcessingMetrics {
        &self.performance_metrics
    }

    /// Verify file integrity against stored checksum
    pub fn verify_integrity(&self, data: &[u8], expected_check: &DataIntegrityCheck) -> IntegrityVerificationResult {
        let current_crc = {
            let mut crc_hasher = CrcHasher::new();
            crc_hasher.update(data);
            crc_hasher.finalize()
        };
        
        let current_xxhash = xxh3_64(data);
        
        IntegrityVerificationResult {
            is_valid: current_crc == expected_check.crc32_checksum && 
                     current_xxhash == expected_check.xxhash_64,
            current_crc32: current_crc,
            expected_crc32: expected_check.crc32_checksum,
            current_xxhash: current_xxhash,
            expected_xxhash: expected_check.xxhash_64,
            size_match: data.len() as u64 == expected_check.data_size,
        }
    }
}

/// Result of batch integrity checking
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BatchIntegrityResult {
    pub processed_files: usize,
    pub failed_checks: usize,
    pub total_bytes_processed: u64,
    pub processing_time_ms: u64,
    pub throughput_mbps: f64,
    pub integrity_checks: Vec<DataIntegrityCheck>,
}

/// Result of integrity verification
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IntegrityVerificationResult {
    pub is_valid: bool,
    pub current_crc32: u32,
    pub expected_crc32: u32,
    pub current_xxhash: u64,
    pub expected_xxhash: u64,
    pub size_match: bool,
}

impl Default for HighPerformanceXDRProcessor {
    fn default() -> Self {
        Self::new()
    }
}

// NAPI bindings for JavaScript
#[napi]
pub struct HighPerformanceXDRProcessorNapi {
    inner: HighPerformanceXDRProcessor,
}

#[napi]
impl HighPerformanceXDRProcessorNapi {
    #[napi(constructor)]
    pub fn new() -> Self {
        Self {
            inner: HighPerformanceXDRProcessor::new(),
        }
    }

    #[napi]
    pub fn fast_integrity_check(&mut self, data: Buffer, file_id: String) -> Result<String> {
        let check = self.inner.fast_integrity_check(data.as_ref(), file_id);
        serde_json::to_string(&check)
            .map_err(|e| napi::Error::from_reason(format!("Serialization error: {}", e)))
    }

    #[napi]
    pub fn protect_evidence(&mut self, evidence_data: Buffer, evidence_id: String) -> Result<Vec<Buffer>> {
        let shards = self.inner.protect_evidence(evidence_data.as_ref(), evidence_id)
            .map_err(|e| napi::Error::from_reason(e))?;
        
        Ok(shards.into_iter().map(Buffer::from).collect())
    }

    #[napi]
    pub fn verify_integrity(&self, data: Buffer, expected_check_json: String) -> Result<String> {
        let expected_check: DataIntegrityCheck = serde_json::from_str(&expected_check_json)
            .map_err(|e| napi::Error::from_reason(format!("Parse error: {}", e)))?;
        
        let result = self.inner.verify_integrity(data.as_ref(), &expected_check);
        serde_json::to_string(&result)
            .map_err(|e| napi::Error::from_reason(format!("Serialization error: {}", e)))
    }

    #[napi]
    pub fn get_performance_metrics(&self) -> Result<String> {
        let metrics = self.inner.get_performance_metrics();
        serde_json::to_string(metrics)
            .map_err(|e| napi::Error::from_reason(format!("Serialization error: {}", e)))
    }

    #[napi]
    pub fn detect_duplicates(&self, data_buffers: Vec<Buffer>) -> Result<String> {
        let data_refs: Vec<&[u8]> = data_buffers.iter().map(|b| b.as_ref()).collect();
        let duplicates = self.inner.detect_duplicates(data_refs);
        serde_json::to_string(&duplicates)
            .map_err(|e| napi::Error::from_reason(format!("Serialization error: {}", e)))
    }

    /// Compress data using LZ4 algorithm for ultra-fast compression
    #[napi]
    pub fn compress_lz4(&self, data: Buffer) -> Result<Buffer> {
        let compressed = self.inner.compress_data_lz4(data.as_ref())
            .map_err(|e| napi::Error::from_reason(e))?;
        Ok(Buffer::from(compressed))
    }

    /// Decompress LZ4 compressed data
    #[napi]
    pub fn decompress_lz4(&self, compressed_data: Buffer) -> Result<Buffer> {
        let decompressed = self.inner.decompress_data_lz4(compressed_data.as_ref())
            .map_err(|e| napi::Error::from_reason(e))?;
        Ok(Buffer::from(decompressed))
    }

    /// Compress data using Snappy algorithm for balanced speed/ratio
    #[napi]
    pub fn compress_snappy(&self, data: Buffer) -> Result<Buffer> {
        let compressed = self.inner.compress_data_snappy(data.as_ref())
            .map_err(|e| napi::Error::from_reason(e))?;
        Ok(Buffer::from(compressed))
    }

    /// Decompress Snappy compressed data
    #[napi]
    pub fn decompress_snappy(&self, compressed_data: Buffer) -> Result<Buffer> {
        let decompressed = self.inner.decompress_data_snappy(compressed_data.as_ref())
            .map_err(|e| napi::Error::from_reason(e))?;
        Ok(Buffer::from(decompressed))
    }

    /// Analyze compression efficiency of data with both LZ4 and Snappy
    #[napi]
    pub fn analyze_compression_efficiency(&self, data: Buffer) -> Result<String> {
        let result = self.inner.analyze_compression_efficiency(data.as_ref());
        serde_json::to_string(&result)
            .map_err(|e| napi::Error::from_reason(format!("Serialization error: {}", e)))
    }

    /// Process a file using memory mapping for high-performance I/O
    #[napi]
    pub fn process_file_memory_mapped(&mut self, file_path: String) -> Result<String> {
        let result = self.inner.process_file_memory_mapped(&file_path)
            .map_err(|e| napi::Error::from_reason(e))?;
        serde_json::to_string(&result)
            .map_err(|e| napi::Error::from_reason(format!("Serialization error: {}", e)))
    }
}