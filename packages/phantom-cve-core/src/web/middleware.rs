//! HTTP Middleware
//! 
//! Common middleware components for web frameworks

use std::collections::HashMap;
use std::future::{Ready, ready};
use std::rc::Rc;
use std::task::{Context, Poll};
use chrono::Utc;
use serde_json::json;

#[cfg(feature = "actix-web")]
use actix_web::{
    dev::{forward_ready, Service, ServiceRequest, ServiceResponse, Transform},
    Error as ActixError, HttpResponse, Result as ActixResult,
    http::header::{HeaderName, HeaderValue},
};

#[cfg(feature = "actix-web")]
use futures_util::future::LocalBoxFuture;

use crate::web::responses::{ApiResponse, ErrorResponse};
use crate::web::handlers::RequestUtils;

/// Request logging middleware
pub struct RequestLogger {
    pub include_headers: bool,
    pub include_body: bool,
}

impl RequestLogger {
    pub fn new() -> Self {
        Self {
            include_headers: false,
            include_body: false,
        }
    }
    
    pub fn with_headers(mut self) -> Self {
        self.include_headers = true;
        self
    }
    
    pub fn with_body(mut self) -> Self {
        self.include_body = true;
        self
    }
}

impl Default for RequestLogger {
    fn default() -> Self {
        Self::new()
    }
}

/// CORS middleware configuration
#[derive(Clone)]
pub struct CorsConfig {
    pub allowed_origins: Vec<String>,
    pub allowed_methods: Vec<String>,
    pub allowed_headers: Vec<String>,
    pub max_age: usize,
    pub allow_credentials: bool,
}

impl Default for CorsConfig {
    fn default() -> Self {
        Self {
            allowed_origins: vec!["*".to_string()],
            allowed_methods: vec![
                "GET".to_string(),
                "POST".to_string(),
                "PUT".to_string(),
                "DELETE".to_string(),
                "PATCH".to_string(),
                "OPTIONS".to_string(),
            ],
            allowed_headers: vec![
                "Content-Type".to_string(),
                "Authorization".to_string(),
                "X-API-Key".to_string(),
                "X-Tenant-ID".to_string(),
                "X-User-ID".to_string(),
            ],
            max_age: 3600,
            allow_credentials: false,
        }
    }
}

/// API key authentication middleware
#[derive(Clone)]
pub struct ApiKeyAuth {
    pub required_keys: Vec<String>,
    pub header_name: String,
}

impl ApiKeyAuth {
    pub fn new(keys: Vec<String>) -> Self {
        Self {
            required_keys: keys,
            header_name: "X-API-Key".to_string(),
        }
    }
    
    pub fn with_header(mut self, header: String) -> Self {
        self.header_name = header;
        self
    }
}

/// Rate limiting middleware
pub struct RateLimiter {
    pub requests_per_minute: usize,
    pub window_size_minutes: usize,
}

impl RateLimiter {
    pub fn new(requests_per_minute: usize) -> Self {
        Self {
            requests_per_minute,
            window_size_minutes: 1,
        }
    }
    
    pub fn with_window(mut self, window_minutes: usize) -> Self {
        self.window_size_minutes = window_minutes;
        self
    }
}

impl Default for RateLimiter {
    fn default() -> Self {
        Self::new(60) // 60 requests per minute
    }
}

/// Request ID middleware for tracing
pub struct RequestId {
    pub header_name: String,
}

impl RequestId {
    pub fn new() -> Self {
        Self {
            header_name: "X-Request-ID".to_string(),
        }
    }
}

impl Default for RequestId {
    fn default() -> Self {
        Self::new()
    }
}

// Actix-web-specific middleware implementations
#[cfg(feature = "actix-web")]
impl<S, B> Transform<S, ServiceRequest> for RequestLogger
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = ActixError>,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = ActixError;
    type InitError = ();
    type Transform = RequestLoggerMiddleware<S>;
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ready(Ok(RequestLoggerMiddleware {
            service,
            include_headers: self.include_headers,
            include_body: self.include_body,
        }))
    }
}

#[cfg(feature = "actix-web")]
pub struct RequestLoggerMiddleware<S> {
    service: S,
    include_headers: bool,
    include_body: bool,
}

#[cfg(feature = "actix-web")]
impl<S, B> Service<ServiceRequest> for RequestLoggerMiddleware<S>
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = ActixError>,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = ActixError;
    type Future = LocalBoxFuture<'static, Result<Self::Response, Self::Error>>;

    forward_ready!(service);

    fn call(&self, req: ServiceRequest) -> Self::Future {
        let start_time = std::time::Instant::now();
        let method = req.method().to_string();
        let path = req.path().to_string();
        let remote_addr = req.peer_addr().map(|addr| addr.to_string());
        
        // Log request start
        println!(
            "[{}] Started {} {} from {:?}",
            Utc::now().format("%Y-%m-%d %H:%M:%S UTC"),
            method,
            path,
            remote_addr.unwrap_or_else(|| "unknown".to_string())
        );

        let fut = self.service.call(req);
        
        Box::pin(async move {
            let res = fut.await?;
            let elapsed = start_time.elapsed();
            let status = res.status().as_u16();
            
            // Log request completion
            println!(
                "[{}] Completed {} {} {} in {}ms",
                Utc::now().format("%Y-%m-%d %H:%M:%S UTC"),
                method,
                path,
                status,
                elapsed.as_millis()
            );
            
            Ok(res)
        })
    }
}

#[cfg(feature = "actix-web")]
impl<S, B> Transform<S, ServiceRequest> for CorsConfig
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = ActixError>,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = ActixError;
    type InitError = ();
    type Transform = CorsMiddleware<S>;
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ready(Ok(CorsMiddleware {
            service,
            config: self.clone(),
        }))
    }
}

#[cfg(feature = "actix-web")]
pub struct CorsMiddleware<S> {
    service: S,
    config: CorsConfig,
}

#[cfg(feature = "actix-web")]
impl<S, B> Service<ServiceRequest> for CorsMiddleware<S>
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = ActixError>,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = ActixError;
    type Future = LocalBoxFuture<'static, Result<Self::Response, Self::Error>>;

    forward_ready!(service);

    fn call(&self, req: ServiceRequest) -> Self::Future {
        let config = self.config.clone();
        
        // Handle preflight OPTIONS request
        if req.method() == actix_web::http::Method::OPTIONS {
            let response = HttpResponse::Ok()
                .insert_header(("Access-Control-Allow-Origin", config.allowed_origins.join(", ")))
                .insert_header(("Access-Control-Allow-Methods", config.allowed_methods.join(", ")))
                .insert_header(("Access-Control-Allow-Headers", config.allowed_headers.join(", ")))
                .insert_header(("Access-Control-Max-Age", config.max_age.to_string()))
                .finish();
                
            return Box::pin(async move {
                Ok(req.into_response(response))
            });
        }

        let fut = self.service.call(req);
        
        Box::pin(async move {
            let mut res = fut.await?;
            
            // Add CORS headers to response
            let headers = res.headers_mut();
            headers.insert(
                HeaderName::from_static("access-control-allow-origin"),
                HeaderValue::from_str(&config.allowed_origins.join(", ")).unwrap(),
            );
            
            if config.allow_credentials {
                headers.insert(
                    HeaderName::from_static("access-control-allow-credentials"),
                    HeaderValue::from_static("true"),
                );
            }
            
            Ok(res)
        })
    }
}

/// Middleware utilities
pub struct MiddlewareUtils;

impl MiddlewareUtils {
    /// Extract headers from request as HashMap
    pub fn extract_headers_actix(req: &actix_web::HttpRequest) -> HashMap<String, String> {
        let mut headers = HashMap::new();
        
        for (name, value) in req.headers().iter() {
            if let Ok(value_str) = value.to_str() {
                headers.insert(name.as_str().to_lowercase(), value_str.to_string());
            }
        }
        
        headers
    }
    
    /// Validate API key from headers
    pub fn validate_api_key_middleware(
        headers: &HashMap<String, String>,
        required_keys: &[String],
        header_name: &str,
    ) -> bool {
        if let Some(provided_key) = headers.get(&header_name.to_lowercase()) {
            required_keys.iter().any(|key| key == provided_key)
        } else {
            false
        }
    }
    
    /// Generate CORS headers
    pub fn generate_cors_headers(config: &CorsConfig) -> HashMap<String, String> {
        let mut headers = HashMap::new();
        
        headers.insert(
            "Access-Control-Allow-Origin".to_string(),
            config.allowed_origins.join(", "),
        );
        headers.insert(
            "Access-Control-Allow-Methods".to_string(),
            config.allowed_methods.join(", "),
        );
        headers.insert(
            "Access-Control-Allow-Headers".to_string(),
            config.allowed_headers.join(", "),
        );
        headers.insert(
            "Access-Control-Max-Age".to_string(),
            config.max_age.to_string(),
        );
        
        if config.allow_credentials {
            headers.insert(
                "Access-Control-Allow-Credentials".to_string(),
                "true".to_string(),
            );
        }
        
        headers
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_cors_config_default() {
        let config = CorsConfig::default();
        assert_eq!(config.allowed_origins, vec!["*"]);
        assert!(config.allowed_methods.contains(&"GET".to_string()));
        assert!(config.allowed_headers.contains(&"Content-Type".to_string()));
    }
    
    #[test]
    fn test_api_key_auth() {
        let auth = ApiKeyAuth::new(vec!["secret123".to_string()]);
        assert_eq!(auth.header_name, "X-API-Key");
        assert!(auth.required_keys.contains(&"secret123".to_string()));
    }
    
    #[test]
    fn test_rate_limiter_config() {
        let limiter = RateLimiter::new(100).with_window(5);
        assert_eq!(limiter.requests_per_minute, 100);
        assert_eq!(limiter.window_size_minutes, 5);
    }
}