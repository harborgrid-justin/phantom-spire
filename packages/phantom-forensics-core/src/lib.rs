// phantom-forensics-core/src/lib.rs
// Enterprise digital forensics and incident investigation library with comprehensive capabilities

mod models;
mod data_stores;
mod config;
mod core;
mod analysis;
mod evidence_processor;
#[cfg(feature = "napi")]
mod napi_bindings;
#[cfg(any(feature = "actix-web", feature = "rocket"))]
pub mod web;
#[cfg(feature = "diesel")]
pub mod database;
#[cfg(feature = "reqwest")]
pub mod http;
#[cfg(feature = "monitoring")]
pub mod monitoring;
#[cfg(feature = "crypto")]
pub mod crypto;

// Re-export public types and components from modules
pub use models::*;
pub use config::Config;
pub use core::ForensicsCore;
pub use analysis::*;
pub use evidence_processor::*;
pub use data_stores::*;
#[cfg(feature = "napi")]
pub use napi_bindings::ForensicsCoreNapi;