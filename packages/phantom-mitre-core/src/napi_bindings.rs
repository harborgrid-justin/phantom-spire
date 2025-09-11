//! Phantom MITRE Core - N-API Bindings
//! 
//! This module provides JavaScript/Node.js bindings for the MITRE Core functionality
//! using N-API (Node.js API).

// Note: N-API bindings currently disabled due to async/await compatibility issues
// with the current napi version. Can be re-enabled once upgraded to napi v3.

// Re-export the core for now without N-API wrapper
pub use crate::core::MitreCore as MitreCoreNapi;