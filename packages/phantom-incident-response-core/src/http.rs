//! HTTP Client Integration
//! 
//! Provides HTTP client capabilities using reqwest for API communication
//! Supports async requests, JSON serialization/deserialization, and comprehensive error handling

use reqwest::{Client, Method, Request, Response, StatusCode, Url};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::time::Duration;
use thiserror::Error;
use tokio::time::timeout;

/// HTTP client configuration
#[derive(Debug, Clone)]
pub struct HttpClientConfig {
    pub timeout_seconds: u64,
    pub connect_timeout_seconds: u64,
    pub max_redirects: usize,
    pub user_agent: String,
    pub default_headers: HashMap<String, String>,
    pub proxy_url: Option<String>,
    pub accept_invalid_certs: bool,
    pub cookie_store: bool,
    pub gzip: bool,
    pub brotli: bool,
    pub deflate: bool,
}

impl Default for HttpClientConfig {
    fn default() -> Self {
        let mut default_headers = HashMap::new();
        default_headers.insert("Content-Type".to_string(), "application/json".to_string());
        default_headers.insert("Accept".to_string(), "application/json".to_string());
        
        Self {
            timeout_seconds: 30,
            connect_timeout_seconds: 10,
            max_redirects: 10,
            user_agent: "phantom-incident-response-core/0.1.0".to_string(),
            default_headers,
            proxy_url: None,
            accept_invalid_certs: false,
            cookie_store: true,
            gzip: true,
            brotli: true,
            deflate: true,
        }
    }
}

/// HTTP client errors
#[derive(Error, Debug)]
pub enum HttpError {
    #[error("Request error: {0}")]
    RequestError(String),
    
    #[error("Response error: {0}")]
    ResponseError(String),
    
    #[error("Timeout error: {0}")]
    TimeoutError(String),
    
    #[error("Serialization error: {0}")]
    SerializationError(String),
    
    #[error("Deserialization error: {0}")]
    DeserializationError(String),
    
    #[error("URL parsing error: {0}")]
    UrlParseError(String),
    
    #[error("Authentication error: {0}")]
    AuthenticationError(String),
    
    #[error("Client configuration error: {0}")]
    ConfigurationError(String),
    
    #[error("Network error: {0}")]
    NetworkError(String),
}

/// HTTP authentication methods
#[derive(Debug, Clone)]
pub enum Authentication {
    None,
    Bearer(String),
    Basic { username: String, password: String },
    ApiKey { key: String, value: String, location: ApiKeyLocation },
    Custom { header: String, value: String },
}

#[derive(Debug, Clone)]
pub enum ApiKeyLocation {
    Header,
    Query,
}

/// HTTP request builder
#[derive(Debug)]
pub struct HttpRequestBuilder {
    method: Method,
    url: String,
    headers: HashMap<String, String>,
    query_params: HashMap<String, String>,
    body: Option<String>,
    authentication: Authentication,
    timeout: Option<Duration>,
}

impl HttpRequestBuilder {
    pub fn new(method: Method, url: &str) -> Self {
        Self {
            method,
            url: url.to_string(),
            headers: HashMap::new(),
            query_params: HashMap::new(),
            body: None,
            authentication: Authentication::None,
            timeout: None,
        }
    }
    
    pub fn header(mut self, key: &str, value: &str) -> Self {
        self.headers.insert(key.to_string(), value.to_string());
        self
    }
    
    pub fn headers(mut self, headers: HashMap<String, String>) -> Self {
        self.headers.extend(headers);
        self
    }
    
    pub fn query(mut self, key: &str, value: &str) -> Self {
        self.query_params.insert(key.to_string(), value.to_string());
        self
    }
    
    pub fn query_params(mut self, params: HashMap<String, String>) -> Self {
        self.query_params.extend(params);
        self
    }
    
    pub fn json<T: Serialize>(mut self, body: &T) -> Result<Self, HttpError> {
        let json_body = serde_json::to_string(body)
            .map_err(|e| HttpError::SerializationError(e.to_string()))?;
        self.body = Some(json_body);
        self.headers.insert("Content-Type".to_string(), "application/json".to_string());
        Ok(self)
    }
    
    pub fn body(mut self, body: String) -> Self {
        self.body = Some(body);
        self
    }
    
    pub fn auth(mut self, authentication: Authentication) -> Self {
        self.authentication = authentication;
        self
    }
    
    pub fn timeout(mut self, timeout: Duration) -> Self {
        self.timeout = Some(timeout);
        self
    }
    
    pub fn build(self, client: &HttpClient) -> Result<Request, HttpError> {
        let mut url = Url::parse(&self.url)
            .map_err(|e| HttpError::UrlParseError(e.to_string()))?;
        
        // Add query parameters
        for (key, value) in &self.query_params {
            url.query_pairs_mut().append_pair(key, value);
        }
        
        // Add API key to query if needed
        if let Authentication::ApiKey { key, value, location: ApiKeyLocation::Query } = &self.authentication {
            url.query_pairs_mut().append_pair(key, value);
        }
        
        let mut request = client.inner.request(self.method, url);
        
        // Add headers
        for (key, value) in &self.headers {
            request = request.header(key, value);
        }
        
        // Add authentication headers
        match &self.authentication {
            Authentication::Bearer(token) => {
                request = request.bearer_auth(token);
            }
            Authentication::Basic { username, password } => {
                request = request.basic_auth(username, Some(password));
            }
            Authentication::ApiKey { key, value, location: ApiKeyLocation::Header } => {
                request = request.header(key, value);
            }
            Authentication::Custom { header, value } => {
                request = request.header(header, value);
            }
            _ => {}
        }
        
        // Add body
        if let Some(body) = self.body {
            request = request.body(body);
        }
        
        // Add timeout
        if let Some(timeout) = self.timeout {
            request = request.timeout(timeout);
        }
        
        request.build().map_err(|e| HttpError::RequestError(e.to_string()))
    }
}

/// HTTP response wrapper
#[derive(Debug)]
pub struct HttpResponse {
    inner: Response,
}

impl HttpResponse {
    pub fn new(response: Response) -> Self {
        Self { inner: response }
    }
    
    pub fn status(&self) -> StatusCode {
        self.inner.status()
    }
    
    pub fn headers(&self) -> &reqwest::header::HeaderMap {
        self.inner.headers()
    }
    
    pub fn is_success(&self) -> bool {
        self.inner.status().is_success()
    }
    
    pub fn is_client_error(&self) -> bool {
        self.inner.status().is_client_error()
    }
    
    pub fn is_server_error(&self) -> bool {
        self.inner.status().is_server_error()
    }
    
    pub async fn text(self) -> Result<String, HttpError> {
        self.inner
            .text()
            .await
            .map_err(|e| HttpError::ResponseError(e.to_string()))
    }
    
    pub async fn json<T: for<'de> Deserialize<'de>>(self) -> Result<T, HttpError> {
        self.inner
            .json::<T>()
            .await
            .map_err(|e| HttpError::DeserializationError(e.to_string()))
    }
    
    pub async fn bytes(self) -> Result<bytes::Bytes, HttpError> {
        self.inner
            .bytes()
            .await
            .map_err(|e| HttpError::ResponseError(e.to_string()))
    }
}

/// Main HTTP client
pub struct HttpClient {
    inner: Client,
    config: HttpClientConfig,
}

impl HttpClient {
    /// Create a new HTTP client with configuration
    pub fn new(config: HttpClientConfig) -> Result<Self, HttpError> {
        let mut client_builder = Client::builder()
            .timeout(Duration::from_secs(config.timeout_seconds))
            .connect_timeout(Duration::from_secs(config.connect_timeout_seconds))
            .redirect(reqwest::redirect::Policy::limited(config.max_redirects))
            .user_agent(&config.user_agent)
            .cookie_store(config.cookie_store)
            .gzip(config.gzip)
            .brotli(config.brotli)
            .deflate(config.deflate);
        
        // Add proxy if configured
        if let Some(proxy_url) = &config.proxy_url {
            let proxy = reqwest::Proxy::all(proxy_url)
                .map_err(|e| HttpError::ConfigurationError(e.to_string()))?;
            client_builder = client_builder.proxy(proxy);
        }
        
        // Configure TLS
        if config.accept_invalid_certs {
            client_builder = client_builder.danger_accept_invalid_certs(true);
        }
        
        let client = client_builder
            .build()
            .map_err(|e| HttpError::ConfigurationError(e.to_string()))?;
        
        Ok(Self { inner: client, config })
    }
    
    /// Create a new HTTP client with default configuration
    pub fn with_defaults() -> Result<Self, HttpError> {
        Self::new(HttpClientConfig::default())
    }
    
    /// Create a GET request builder
    pub fn get(&self, url: &str) -> HttpRequestBuilder {
        HttpRequestBuilder::new(Method::GET, url)
    }
    
    /// Create a POST request builder
    pub fn post(&self, url: &str) -> HttpRequestBuilder {
        HttpRequestBuilder::new(Method::POST, url)
    }
    
    /// Create a PUT request builder
    pub fn put(&self, url: &str) -> HttpRequestBuilder {
        HttpRequestBuilder::new(Method::PUT, url)
    }
    
    /// Create a PATCH request builder
    pub fn patch(&self, url: &str) -> HttpRequestBuilder {
        HttpRequestBuilder::new(Method::PATCH, url)
    }
    
    /// Create a DELETE request builder
    pub fn delete(&self, url: &str) -> HttpRequestBuilder {
        HttpRequestBuilder::new(Method::DELETE, url)
    }
    
    /// Create a HEAD request builder
    pub fn head(&self, url: &str) -> HttpRequestBuilder {
        HttpRequestBuilder::new(Method::HEAD, url)
    }
    
    /// Execute a request
    pub async fn execute(&self, request: Request) -> Result<HttpResponse, HttpError> {
        let response = self.inner
            .execute(request)
            .await
            .map_err(|e| HttpError::NetworkError(e.to_string()))?;
        
        Ok(HttpResponse::new(response))
    }
    
    /// Execute a request with timeout
    pub async fn execute_with_timeout(
        &self,
        request: Request,
        timeout_duration: Duration,
    ) -> Result<HttpResponse, HttpError> {
        let future = self.inner.execute(request);
        
        match timeout(timeout_duration, future).await {
            Ok(Ok(response)) => Ok(HttpResponse::new(response)),
            Ok(Err(e)) => Err(HttpError::NetworkError(e.to_string())),
            Err(_) => Err(HttpError::TimeoutError(
                format!("Request timed out after {:?}", timeout_duration)
            )),
        }
    }
    
    /// Convenient method for GET requests with JSON response
    pub async fn get_json<T>(&self, url: &str) -> Result<T, HttpError>
    where
        T: for<'de> Deserialize<'de>,
    {
        let request = self.get(url).build(self)?;
        let response = self.execute(request).await?;
        
        if !response.is_success() {
            return Err(HttpError::ResponseError(format!(
                "HTTP error: {}",
                response.status()
            )));
        }
        
        response.json().await
    }
    
    /// Convenient method for POST requests with JSON body and response
    pub async fn post_json<T, R>(&self, url: &str, body: &T) -> Result<R, HttpError>
    where
        T: Serialize,
        R: for<'de> Deserialize<'de>,
    {
        let request = self.post(url).json(body)?.build(self)?;
        let response = self.execute(request).await?;
        
        if !response.is_success() {
            return Err(HttpError::ResponseError(format!(
                "HTTP error: {}",
                response.status()
            )));
        }
        
        response.json().await
    }
    
    /// Get the client configuration
    pub fn config(&self) -> &HttpClientConfig {
        &self.config
    }
}

/// HTTP client pool for managing multiple clients
pub struct HttpClientPool {
    clients: Vec<HttpClient>,
    current_index: std::sync::atomic::AtomicUsize,
}

impl HttpClientPool {
    /// Create a new client pool
    pub fn new(configs: Vec<HttpClientConfig>) -> Result<Self, HttpError> {
        let mut clients = Vec::new();
        
        for config in configs {
            clients.push(HttpClient::new(config)?);
        }
        
        if clients.is_empty() {
            return Err(HttpError::ConfigurationError(
                "At least one client configuration is required".to_string()
            ));
        }
        
        Ok(Self {
            clients,
            current_index: std::sync::atomic::AtomicUsize::new(0),
        })
    }
    
    /// Get the next client in round-robin fashion
    pub fn get_client(&self) -> &HttpClient {
        let index = self.current_index
            .fetch_add(1, std::sync::atomic::Ordering::Relaxed) % self.clients.len();
        &self.clients[index]
    }
    
    /// Get a specific client by index
    pub fn get_client_by_index(&self, index: usize) -> Option<&HttpClient> {
        self.clients.get(index)
    }
    
    /// Get the number of clients in the pool
    pub fn len(&self) -> usize {
        self.clients.len()
    }
    
    /// Check if the pool is empty
    pub fn is_empty(&self) -> bool {
        self.clients.is_empty()
    }
}

/// Utility functions for common HTTP operations
pub mod utils {
    use super::*;
    
    /// Check if a URL is reachable
    pub async fn check_url_reachable(client: &HttpClient, url: &str) -> Result<bool, HttpError> {
        let request = client.head(url).build(client)?;
        match client.execute(request).await {
            Ok(response) => Ok(response.is_success()),
            Err(_) => Ok(false),
        }
    }
    
    /// Download a file from a URL
    pub async fn download_file(
        client: &HttpClient,
        url: &str,
        file_path: &std::path::Path,
    ) -> Result<(), HttpError> {
        let request = client.get(url).build(client)?;
        let response = client.execute(request).await?;
        
        if !response.is_success() {
            return Err(HttpError::ResponseError(format!(
                "HTTP error: {}",
                response.status()
            )));
        }
        
        let bytes = response.bytes().await?;
        
        tokio::fs::write(file_path, &bytes)
            .await
            .map_err(|e| HttpError::ResponseError(format!("Failed to write file: {}", e)))?;
        
        Ok(())
    }
    
    /// Upload a file to a URL
    pub async fn upload_file<T>(
        client: &HttpClient,
        url: &str,
        file_path: &std::path::Path,
        auth: Authentication,
    ) -> Result<T, HttpError>
    where
        T: for<'de> Deserialize<'de>,
    {
        let file_content = tokio::fs::read(file_path)
            .await
            .map_err(|e| HttpError::RequestError(format!("Failed to read file: {}", e)))?;
        
        let request = client
            .post(url)
            .header("Content-Type", "application/octet-stream")
            .body(String::from_utf8_lossy(&file_content).to_string())
            .auth(auth)
            .build(client)?;
        
        let response = client.execute(request).await?;
        
        if !response.is_success() {
            return Err(HttpError::ResponseError(format!(
                "HTTP error: {}",
                response.status()
            )));
        }
        
        response.json().await
    }
}

/// Re-export commonly used reqwest types
pub use reqwest::{
    header::{HeaderMap, HeaderName, HeaderValue},
    Method,
    StatusCode,
    Url,
};