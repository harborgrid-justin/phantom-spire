//! Web API Module
//! 
//! Actix-web based HTTP server implementation for CVE processing APIs

#[cfg(feature = "actix-web")]
pub mod actix_server;

#[cfg(feature = "rocket")]
pub mod rocket_server;

pub mod handlers;
pub mod middleware;
pub mod responses;

// Re-export commonly used types
#[cfg(feature = "actix-web")]
pub use actix_server::*;

#[cfg(feature = "rocket")]
pub use rocket_server::*;

pub use handlers::*;
pub use responses::*;