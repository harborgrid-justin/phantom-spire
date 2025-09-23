//! HTTP Client Module
//! 
//! Request-based HTTP client for API communication and data exchange

#[cfg(feature = "request")]
pub mod client;
#[cfg(feature = "request")]
pub mod feeds;
#[cfg(feature = "request")]
pub mod external_apis;

#[cfg(feature = "request")]
pub use client::*;
#[cfg(feature = "request")]
pub use feeds::*;
#[cfg(feature = "request")]
pub use external_apis::*;

#[cfg(feature = "request")]
use reqwest::{Client, Error as RequestError};
use serde::{Deserialize, Serialize};
use std::time::Duration;
use std::collections::HashMap;

/// HTTP client configuration
#[cfg(feature = "request")]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HttpConfig {
    pub timeout_seconds: u64,
    pub max_redirects: usize,
    pub user_agent: String,
    pub default_headers: HashMap<String, String>,
    pub retry_attempts: usize,
    pub retry_delay_ms: u64,
    pub enable_compression: bool,
    pub verify_ssl: bool,
    pub proxy_url: Option<String>,
}

#[cfg(feature = "request")]
impl Default for HttpConfig {
    fn default() -> Self {
        let mut default_headers = HashMap::new();
        default_headers.insert("Content-Type".to_string(), "application/json".to_string());
        default_headers.insert("Accept".to_string(), "application/json".to_string());
        
        Self {
            timeout_seconds: 30,
            max_redirects: 10,
            user_agent: "phantom-cve-core/0.1.0".to_string(),
            default_headers,
            retry_attempts: 3,
            retry_delay_ms: 1000,
            enable_compression: true,
            verify_ssl: true,
            proxy_url: None,
        }
    }
}

/// HTTP client wrapper with enhanced functionality
#[cfg(feature = "request")]
pub struct HttpClient {
    client: Client,
    config: HttpConfig,
}

#[cfg(feature = "request")]
impl HttpClient {
    /// Create a new HTTP client with configuration
    pub fn new(config: HttpConfig) -> Result<Self, ReqwestError> {
        let mut client_builder = Client::builder()
            .timeout(Duration::from_secs(config.timeout_seconds))
            .redirect(reqwest::redirect::Policy::limited(config.max_redirects))
            .user_agent(&config.user_agent)
            .gzip(config.enable_compression)
            .brotli(config.enable_compression)
            .deflate(config.enable_compression);
            
        // SSL verification
        if !config.verify_ssl {
            client_builder = client_builder.danger_accept_invalid_certs(true);
        }
        
        // Proxy configuration
        if let Some(proxy_url) = &config.proxy_url {
            let proxy = reqwest::Proxy::all(proxy_url)?;
            client_builder = client_builder.proxy(proxy);
        }
        
        let client = client_builder.build()?;
        
        Ok(Self {
            client,
            config,
        })
    }
    
    /// Create a default HTTP client
    pub fn default() -> Result<Self, ReqwestError> {
        Self::new(HttpConfig::default())
    }
    
    /// Perform GET request with retry logic
    pub async fn get<T>(&self, url: &str) -> Result<T, HttpError>
    where
        T: for<'de> Deserialize<'de>,
    {
        self.request_with_retry("GET", url, None::<&()>).await
    }
    
    /// Perform POST request with retry logic
    pub async fn post<T, B>(&self, url: &str, body: &B) -> Result<T, HttpError>
    where
        T: for<'de> Deserialize<'de>,
        B: Serialize,
    {
        self.request_with_retry("POST", url, Some(body)).await
    }
    
    /// Perform PUT request with retry logic
    pub async fn put<T, B>(&self, url: &str, body: &B) -> Result<T, HttpError>
    where
        T: for<'de> Deserialize<'de>,
        B: Serialize,
    {
        self.request_with_retry("PUT", url, Some(body)).await
    }
    
    /// Perform DELETE request with retry logic
    pub async fn delete<T>(&self, url: &str) -> Result<T, HttpError>
    where
        T: for<'de> Deserialize<'de>,
    {
        self.request_with_retry("DELETE", url, None::<&()>).await
    }
    
    /// Generic request method with retry logic
    async fn request_with_retry<T, B>(
        &self,
        method: &str,
        url: &str,
        body: Option<&B>,
    ) -> Result<T, HttpError>
    where
        T: for<'de> Deserialize<'de>,
        B: Serialize,
    {
        let mut last_error = None;
        
        for attempt in 0..=self.config.retry_attempts {
            match self.make_request(method, url, body).await {
                Ok(response) => return Ok(response),
                Err(e) => {
                    last_error = Some(e);
                    
                    if attempt < self.config.retry_attempts {
                        tokio::time::sleep(Duration::from_millis(
                            self.config.retry_delay_ms * (attempt as u64 + 1)
                        )).await;
                    }
                }
            }
        }
        
        Err(last_error.unwrap_or(HttpError::Unknown("No error captured".to_string())))
    }
    
    /// Make a single HTTP request
    async fn make_request<T, B>(
        &self,
        method: &str,
        url: &str,
        body: Option<&B>,
    ) -> Result<T, HttpError>
    where
        T: for<'de> Deserialize<'de>,
        B: Serialize,
    {
        let mut request = match method {
            "GET" => self.client.get(url),
            "POST" => self.client.post(url),
            "PUT" => self.client.put(url),
            "DELETE" => self.client.delete(url),
            _ => return Err(HttpError::UnsupportedMethod(method.to_string())),
        };
        
        // Add default headers
        for (key, value) in &self.config.default_headers {
            request = request.header(key, value);
        }
        
        // Add body if provided
        if let Some(body_data) = body {
            request = request.json(body_data);
        }
        
        let response = request.send().await?;
        let status = response.status();
        
        if status.is_success() {
            let data = response.json::<T>().await?;
            Ok(data)
        } else {
            let error_text = response.text().await.unwrap_or_default();
            Err(HttpError::HttpStatus {
                status: status.as_u16(),
                message: error_text,
            })
        }
    }
    
    /// Download file from URL
    pub async fn download_file(&self, url: &str) -> Result<Vec<u8>, HttpError> {
        let response = self.client.get(url).send().await?;
        
        if response.status().is_success() {
            let bytes = response.bytes().await?;
            Ok(bytes.to_vec())
        } else {
            Err(HttpError::HttpStatus {
                status: response.status().as_u16(),
                message: "Failed to download file".to_string(),
            })
        }
    }
    
    /// Stream response as text
    pub async fn get_text(&self, url: &str) -> Result<String, HttpError> {
        let response = self.client.get(url).send().await?;
        
        if response.status().is_success() {
            let text = response.text().await?;
            Ok(text)
        } else {
            Err(HttpError::HttpStatus {
                status: response.status().as_u16(),
                message: "Failed to get text response".to_string(),
            })
        }
    }
    
    /// Get the underlying request client
    pub fn inner_client(&self) -> &Client {
        &self.client
    }
    
    /// Get the configuration
    pub fn config(&self) -> &HttpConfig {
        &self.config
    }
}

/// HTTP error types
#[cfg(feature = "request")]
#[derive(Debug, thiserror::Error)]
pub enum HttpError {
    #[error("Request error: {0}")]
    Request(#[from] ReqwestError),
    
    #[error("HTTP status error: {status} - {message}")]
    HttpStatus {
        status: u16,
        message: String,
    },
    
    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),
    
    #[error("Timeout error")]
    Timeout,
    
    #[error("Unsupported method: {0}")]
    UnsupportedMethod(String),
    
    #[error("Configuration error: {0}")]
    Configuration(String),
    
    #[error("Unknown error: {0}")]
    Unknown(String),
}

/// HTTP response wrapper
#[cfg(feature = "request")]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HttpResponse<T> {
    pub data: T,
    pub status: u16,
    pub headers: HashMap<String, String>,
    pub timestamp: chrono::DateTime<chrono::Utc>,
}

#[cfg(feature = "request")]
impl<T> HttpResponse<T> {
    pub fn new(data: T, status: u16, headers: HashMap<String, String>) -> Self {
        Self {
            data,
            status,
            headers,
            timestamp: chrono::Utc::now(),
        }
    }
}

#[cfg(test)]
#[cfg(feature = "request")]
mod tests {
    use super::*;
    
    #[test]
    fn test_http_config_default() {
        let config = HttpConfig::default();
        assert_eq!(config.timeout_seconds, 30);
        assert_eq!(config.user_agent, "phantom-cve-core/0.1.0");
        assert!(config.verify_ssl);
    }
    
    #[tokio::test]
    async fn test_http_client_creation() {
        let client = HttpClient::default();
        assert!(client.is_ok());
    }
    
    #[test]
    fn test_http_config_serialization() {
        let config = HttpConfig::default();
        let serialized = serde_json::to_string(&config).unwrap();
        let deserialized: HttpConfig = serde_json::from_str(&serialized).unwrap();
        assert_eq!(config.timeout_seconds, deserialized.timeout_seconds);
    }
}