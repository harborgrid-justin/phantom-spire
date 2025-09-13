//! Common type definitions and aliases for Phantom ML Core
//!
//! This module contains type aliases and common types used throughout
//! the ML system to improve code readability and maintainability.

// Re-export submodule types for backward compatibility
pub mod cache;
pub mod storage;
pub mod filters;
pub mod analytics;
pub mod constants;
pub mod common_types;

pub mod models;

// Re-export all types for backward compatibility
pub use cache::*;
pub use storage::*;
pub use filters::*;
pub use analytics::*;
pub use constants::*;
pub use common_types::*;