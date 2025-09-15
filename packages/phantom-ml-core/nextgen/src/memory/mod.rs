//! Memory optimization module for high-performance ML operations
//!
//! Provides memory-aligned operations including:
//! - SIMD-optimized vector operations (SSE, AVX, AVX2, AVX512)
//! - Memory-aligned buffer pools for reduced allocations
//! - Cross-platform SIMD detection and fallback
//! - Enterprise-grade performance monitoring

pub mod aligned_simd;

pub use aligned_simd::*;