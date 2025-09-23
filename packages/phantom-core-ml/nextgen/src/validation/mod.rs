//! Validation module for secure input processing
//!
//! Provides comprehensive input validation including:
//! - JSON structure validation with depth limits
//! - Suspicious pattern detection and sanitization
//! - Type constraints and business rule validation
//! - Enterprise-grade audit trails and metadata

pub mod secure_input;

pub use secure_input::*;