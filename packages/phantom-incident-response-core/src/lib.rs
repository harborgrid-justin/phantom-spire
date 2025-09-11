//! Phantom Incident Response Core
//! 
//! Advanced incident response engine providing comprehensive incident management,
//! response automation, forensic analysis, and recovery coordination capabilities.

// phantom-incident-response-core/src/lib.rs
// Enterprise incident response core with comprehensive capabilities

mod models;
mod data_stores;
mod config;
mod core;
mod playbook_engine;
mod evidence_manager;
mod analysis;
mod incident_models;
mod evidence_models;
mod response_actions;
mod playbook_models;
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
#[cfg(feature = "messaging")]
pub mod messaging;
#[cfg(feature = "notifications")]
pub mod notifications;

// Re-export public types and components from modules
pub use models::*;
pub use config::Config;
pub use core::IncidentResponseCore;
pub use playbook_engine::*;
pub use evidence_manager::*;
pub use analysis::*;
pub use data_stores::*;
pub use incident_models::*;
pub use evidence_models::*;
pub use response_actions::*;
pub use playbook_models::*;
#[cfg(feature = "napi")]
pub use napi_bindings::IncidentResponseCoreNapi;