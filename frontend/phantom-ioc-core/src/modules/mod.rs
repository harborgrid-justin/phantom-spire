// Core business modules for phantom-ioc-core
// Each module provides business-ready functionality with napi bindings

pub mod alert_management;
pub mod compliance;
pub mod dashboard_analytics;
pub mod incident_response;
pub mod threat_hunting;
pub mod asset_management;
pub mod user_activity;
pub mod network_security;
pub mod forensics;
pub mod risk_assessment;
pub mod reporting;
pub mod integration;

// Re-export all modules for easy access
pub use alert_management::*;
pub use compliance::*;
pub use dashboard_analytics::*;
pub use incident_response::*;
pub use threat_hunting::*;
pub use asset_management::*;
pub use user_activity::*;
pub use network_security::*;
pub use forensics::*;
pub use risk_assessment::*;
pub use reporting::*;
pub use integration::*;