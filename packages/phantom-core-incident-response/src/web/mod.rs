//! Web Framework Integration
//! 
//! Provides web server and API capabilities using Actix-Web and Rocket frameworks
//! Supports REST APIs, WebSocket connections, and web-based incident response interfaces

pub mod actix;
pub mod rocket;
pub mod handlers;
pub mod middleware;
pub mod auth;
pub mod websocket;

use crate::config::Config;
use crate::core::IncidentResponseCore;
use crate::data_stores::*;
use std::sync::Arc;

/// Web server configuration
#[derive(Debug, Clone)]
pub struct WebConfig {
    pub host: String,
    pub port: u16,
    pub tls_enabled: bool,
    pub tls_cert_path: Option<String>,
    pub tls_key_path: Option<String>,
    pub cors_enabled: bool,
    pub cors_origins: Vec<String>,
    pub rate_limit_enabled: bool,
    pub rate_limit_requests_per_minute: u32,
    pub api_key_required: bool,
    pub jwt_secret: Option<String>,
    pub session_timeout_minutes: u32,
}

impl Default for WebConfig {
    fn default() -> Self {
        Self {
            host: "0.0.0.0".to_string(),
            port: 8080,
            tls_enabled: false,
            tls_cert_path: None,
            tls_key_path: None,
            cors_enabled: true,
            cors_origins: vec!["*".to_string()],
            rate_limit_enabled: true,
            rate_limit_requests_per_minute: 100,
            api_key_required: false,
            jwt_secret: None,
            session_timeout_minutes: 60,
        }
    }
}

/// Web server error types
#[derive(Debug, thiserror::Error)]
pub enum WebError {
    #[error("Server startup error: {0}")]
    StartupError(String),
    
    #[error("Authentication error: {0}")]
    AuthenticationError(String),
    
    #[error("Authorization error: {0}")]
    AuthorizationError(String),
    
    #[error("Validation error: {0}")]
    ValidationError(String),
    
    #[error("Internal server error: {0}")]
    InternalError(String),
    
    #[error("Bad request: {0}")]
    BadRequest(String),
    
    #[error("Not found: {0}")]
    NotFound(String),
}

/// Common web server interface
pub trait WebServer: Send + Sync {
    /// Start the web server
    async fn start(&self, config: WebConfig) -> Result<(), WebError>;
    
    /// Stop the web server
    async fn stop(&self) -> Result<(), WebError>;
    
    /// Get server status
    fn is_running(&self) -> bool;
    
    /// Get server configuration
    fn get_config(&self) -> &WebConfig;
}

/// Web application state shared across handlers
#[derive(Clone)]
pub struct AppState {
    pub core: Arc<IncidentResponseCore>,
    pub data_store: Arc<dyn ComprehensiveIncidentResponseStore + Send + Sync>,
    pub config: Config,
    pub web_config: WebConfig,
}

impl AppState {
    pub fn new(
        core: Arc<IncidentResponseCore>,
        data_store: Arc<dyn ComprehensiveIncidentResponseStore + Send + Sync>,
        config: Config,
        web_config: WebConfig,
    ) -> Self {
        Self {
            core,
            data_store,
            config,
            web_config,
        }
    }
}

/// Common response structure for API endpoints
#[derive(Debug, serde::Serialize, serde::Deserialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<String>,
    pub message: Option<String>,
    pub timestamp: i64,
}

impl<T> ApiResponse<T> {
    pub fn success(data: T) -> Self {
        Self {
            success: true,
            data: Some(data),
            error: None,
            message: None,
            timestamp: chrono::Utc::now().timestamp(),
        }
    }
    
    pub fn error(error: String) -> Self {
        Self {
            success: false,
            data: None,
            error: Some(error),
            message: None,
            timestamp: chrono::Utc::now().timestamp(),
        }
    }
    
    pub fn error_with_message(error: String, message: String) -> Self {
        Self {
            success: false,
            data: None,
            error: Some(error),
            message: Some(message),
            timestamp: chrono::Utc::now().timestamp(),
        }
    }
}