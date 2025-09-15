//! # Phantom ML Core - NAPI-RS v3.x Enterprise Edition
//!
//! Enterprise machine learning services for threat detection and security analytics.
//! Part of the Phantom Spire CTI Platform that competes with Palantir Foundry.
//! 
//! This is the next-generation implementation modernized for NAPI-RS v3.x with:
//! - Advanced memory-aligned SIMD operations
//! - Enterprise-grade rate limiting and security
//! - Comprehensive input validation and sanitization
//! - Multi-database support for federated queries
//! - HuggingFace integration for modern ML workflows

#![deny(clippy::all)]
#![allow(clippy::unused_unit)]

// Core ML functionality
mod core;
mod error;
mod types;

// Machine learning modules
pub mod ml;

// Enterprise features
pub mod enterprise;

// Multi-database support
pub mod database;

// Security and validation
pub mod security;
pub mod validation;
pub mod safety;

// Performance optimizations
pub mod memory;

// Legacy modules for compatibility
mod automl;
mod huggingface_integration;
mod management;
mod cancellation;

// Public API exports
pub use core::*;
pub use error::*;
pub use types::*;

// Re-export key modules for easier access
pub use ml::*;
pub use database::*;

// NAPI bindings - only compile when napi feature is enabled
#[cfg(feature = "napi")]
mod napi_bindings;

#[cfg(feature = "napi")]
pub use napi_bindings::*;

// Export specific high-level functionality
pub use security::rate_limiter::{
    AdvancedRateLimiter, RateLimitConfig, ClientPriority,
    check_request_allowed, get_rate_limit_stats
};
pub use validation::secure_input::{
    SecureJsonValidator, ValidationResult, validate_model_config,
    validate_training_data, validate_huggingface_config
};
pub use memory::aligned_simd::{
    AlignedBuffer, SafeSIMDOperations, SIMDInstructionSet,
    AlignedMemoryError, AlignedBufferPool
};

// Legacy API compatibility
pub use huggingface_integration::*;
pub use management::*;

/// Module version information
pub const VERSION: &str = env!("CARGO_PKG_VERSION");
pub const NAPI_VERSION: &str = "3.x";
pub const ENTERPRISE_FEATURES: bool = true;

/// Initialize the ML core with enterprise configuration
pub fn init_enterprise() -> crate::error::Result<()> {
    // Initialize logging
    env_logger::init();

    // Initialize panic handler
    safety::panic_handler::init_panic_handler();

    // Initialize rate limiter with enterprise config - ignore errors for now
    let rate_config = security::rate_limiter::RateLimitConfig::enterprise();
    let _ = security::rate_limiter::initialize_rate_limiter(rate_config);

    log::info!("Phantom ML Core v{} initialized with enterprise features", VERSION);
    Ok(())
}

/// Get comprehensive system information
pub fn get_system_info() -> std::collections::HashMap<String, String> {
    let mut info = std::collections::HashMap::new();

    info.insert("version".to_string(), VERSION.to_string());
    info.insert("napi_version".to_string(), NAPI_VERSION.to_string());
    info.insert("enterprise_features".to_string(), ENTERPRISE_FEATURES.to_string());
    info.insert("simd_support".to_string(),
        format!("{:?}", memory::aligned_simd::SafeSIMDOperations::detect_simd_support()));
    info.insert("rate_limiter_stats".to_string(),
        format!("{:?}", security::rate_limiter::get_rate_limit_stats()));
    info.insert("panic_stats".to_string(),
        format!("{:?}", safety::panic_handler::get_panic_stats()));

    info
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_version_info() {
        assert!(!VERSION.is_empty());
        assert_eq!(NAPI_VERSION, "3.x");
        assert!(ENTERPRISE_FEATURES);
    }

    #[test] 
    fn test_system_info() {
        let info = get_system_info();
        assert!(info.contains_key("version"));
        assert!(info.contains_key("napi_version"));
        assert!(info.contains_key("enterprise_features"));
        assert!(info.contains_key("simd_support"));
    }
}
