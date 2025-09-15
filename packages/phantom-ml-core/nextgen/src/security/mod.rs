//! Security module for enterprise-grade protection
//! 
//! Provides comprehensive security features including:
//! - Advanced rate limiting with priority queuing
//! - Resource monitoring and adaptive limits
//! - Client banning and violation tracking
//! - Enterprise metrics and audit trails

pub mod rate_limiter;

pub use rate_limiter::*;