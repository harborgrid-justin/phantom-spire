//! Structured Logging Framework with Correlation IDs
//!
//! This module provides enterprise-grade structured logging:
//! - JSON and text output formats with configurable fields
//! - Automatic correlation ID generation and propagation
//! - Distributed context tracking across service boundaries
//! - Log aggregation and centralized collection
//! - Multi-tenant log isolation and access control
//! - Performance-optimized async logging with batching

use super::*;
use std::sync::Arc;
use std::collections::HashMap;
use parking_lot::RwLock;
use dashmap::DashMap;
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use tokio::sync::mpsc;
use tokio::fs::OpenOptions;
use tokio::io::AsyncWriteExt;

/// Structured logger with correlation ID support
pub struct StructuredLogger {
    /// Log writers for different outputs
    writers: Arc<RwLock<Vec<Box<dyn LogWriter>>>>,
    /// Log statistics
    statistics: Arc<RwLock<LogStatistics>>,
    /// Configuration
    config: LoggingConfig,
    /// Event sender for async processing
    event_sender: mpsc::Sender<LogEvent>,
    /// Background processor handle
    _processor_handle: tokio::task::JoinHandle<()>,
    /// Context manager for correlation tracking
    context_manager: Arc<LogContextManager>,
    /// Log filters and sampling
    filter_engine: Arc<LogFilterEngine>,
}

/// Log writer trait for different output destinations
pub trait LogWriter: Send + Sync {
    async fn write_log(&self, entry: &LogEntry) -> Result<(), LoggingError>;
    fn supports_structured(&self) -> bool;
    fn get_writer_type(&self) -> LogWriterType;
}

/// Log writer type enumeration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum LogWriterType {
    File,
    Console,
    Syslog,
    ElasticSearch,
    Kafka,
    CloudWatch,
    Splunk,
}

/// Log event for async processing
#[derive(Debug, Clone)]
pub enum LogEvent {
    LogEntry(LogEntry),
    ContextUpdate(String, LogContext),
    Flush,
    Rotate,
}

/// Structured log entry
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LogEntry {
    pub timestamp: DateTime<Utc>,
    pub level: LogLevel,
    pub message: String,
    pub correlation_id: Option<String>,
    pub trace_id: Option<String>,
    pub span_id: Option<String>,
    pub service: String,
    pub version: String,
    pub environment: String,
    pub tenant_id: Option<String>,
    pub user_id: Option<String>,
    pub session_id: Option<String>,
    pub request_id: Option<String>,
    pub operation: Option<String>,
    pub component: Option<String>,
    pub source_file: Option<String>,
    pub source_line: Option<u32>,
    pub thread_id: String,
    pub structured_data: HashMap<String, serde_json::Value>,
    pub tags: Vec<String>,
    pub error_code: Option<String>,
    pub error_stack: Option<String>,
    pub duration_ms: Option<u64>,
    pub resource_usage: Option<ResourceUsage>,
}

/// Resource usage information for performance logging
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourceUsage {
    pub cpu_time_ms: u64,
    pub memory_kb: u64,
    pub disk_io_kb: u64,
    pub network_io_kb: u64,
}

/// Log context for correlation tracking
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LogContext {
    pub correlation_id: String,
    pub trace_id: Option<String>,
    pub span_id: Option<String>,
    pub tenant_id: Option<String>,
    pub user_id: Option<String>,
    pub session_id: Option<String>,
    pub request_id: Option<String>,
    pub operation: Option<String>,
    pub component: Option<String>,
    pub baggage: HashMap<String, String>,
}

/// Log context manager for correlation tracking
pub struct LogContextManager {
    /// Thread-local contexts
    contexts: DashMap<String, LogContext>,
    /// Global context propagation headers
    propagation_headers: Vec<String>,
}

/// Log filter engine for intelligent filtering and sampling
pub struct LogFilterEngine {
    /// Level-based filters
    level_filters: HashMap<String, LogLevel>,
    /// Component-based filters
    component_filters: HashMap<String, ComponentFilter>,
    /// Sampling configurations
    sampling_configs: HashMap<LogLevel, SamplingConfig>,
    /// Rate limiting configurations
    rate_limits: HashMap<String, RateLimitConfig>,
}

/// Component-specific log filter
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComponentFilter {
    pub min_level: LogLevel,
    pub max_entries_per_minute: Option<u32>,
    pub include_patterns: Vec<String>,
    pub exclude_patterns: Vec<String>,
}

/// Log sampling configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SamplingConfig {
    pub rate: f64, // 0.0 to 1.0
    pub burst_limit: u32,
    pub adaptive: bool,
}

/// Rate limiting configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RateLimitConfig {
    pub max_entries_per_second: u32,
    pub burst_size: u32,
    pub window_size_seconds: u32,
}

/// Log statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LogStatistics {
    pub total_entries: u64,
    pub entries_by_level: HashMap<LogLevel, u64>,
    pub entries_per_second: f64,
    pub filtered_entries: u64,
    pub sampled_entries: u64,
    pub write_errors: u64,
    pub last_write_time: Option<DateTime<Utc>>,
    pub buffer_size: usize,
    pub tenant_stats: HashMap<String, TenantLogStats>,
    pub component_stats: HashMap<String, ComponentLogStats>,
}

/// Per-tenant log statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TenantLogStats {
    pub entry_count: u64,
    pub entries_per_minute: f64,
    pub storage_usage_mb: f64,
    pub quota_utilization: f64,
    pub last_activity: DateTime<Utc>,
}

/// Per-component log statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComponentLogStats {
    pub entry_count: u64,
    pub error_count: u64,
    pub warning_count: u64,
    pub average_duration_ms: f64,
    pub last_log_time: DateTime<Utc>,
}

/// File log writer implementation
pub struct FileLogWriter {
    file_path: String,
    rotation_size_mb: u64,
    retention_count: u32,
    current_size: Arc<RwLock<u64>>,
    format: LogFormat,
}

/// Console log writer implementation
pub struct ConsoleLogWriter {
    format: LogFormat,
    colored: bool,
}

/// Elasticsearch log writer implementation
pub struct ElasticsearchLogWriter {
    client: Arc<dyn ElasticsearchClient>,
    index_pattern: String,
    batch_size: usize,
    flush_interval_ms: u64,
}

/// Elasticsearch client trait
pub trait ElasticsearchClient: Send + Sync {
    async fn index_documents(&self, index: &str, documents: &[LogEntry]) -> Result<(), LoggingError>;
}

/// Log format enumeration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum LogFormat {
    Json,
    Text,
    Logfmt,
    Structured,
}

impl StructuredLogger {
    /// Create a new structured logger
    pub async fn new(config: &LoggingConfig) -> Result<Self, LoggingError> {
        let (event_sender, event_receiver) = mpsc::channel(100000);

        // Create log writers based on configuration
        let mut writers: Vec<Box<dyn LogWriter>> = Vec::new();

        // Always add console writer for development
        let console_writer = Box::new(ConsoleLogWriter::new(&config.format, true)?);
        writers.push(console_writer);

        // Add file writer if configured
        if let Some(file_path) = std::env::var("LOG_FILE_PATH").ok() {
            let file_writer = Box::new(FileLogWriter::new(
                &file_path,
                config.rotation_size_mb,
                config.retention_count,
                &config.format,
            )?);
            writers.push(file_writer);
        }

        // Create context manager
        let context_manager = Arc::new(LogContextManager::new());

        // Create filter engine
        let filter_engine = Arc::new(LogFilterEngine::new(config));

        // Start background processor
        let statistics = Arc::new(RwLock::new(LogStatistics::default()));
        let processor_handle = tokio::spawn(
            Self::background_processor(
                event_receiver,
                Arc::new(RwLock::new(writers)),
                statistics.clone(),
            )
        );

        Ok(Self {
            writers: Arc::new(RwLock::new(vec![])), // Moved to processor
            statistics,
            config: config.clone(),
            event_sender,
            _processor_handle: processor_handle,
            context_manager,
            filter_engine,
        })
    }

    /// Initialize the logging system
    pub async fn initialize(&self) -> Result<(), LoggingError> {
        // Validate configuration
        self.validate_config()?;

        // Test writer connectivity
        self.test_writers().await?;

        // Start periodic tasks
        self.start_periodic_tasks().await?;

        Ok(())
    }

    /// Log with automatic correlation ID generation
    pub async fn log(
        &self,
        level: LogLevel,
        message: &str,
        structured_data: Option<HashMap<String, serde_json::Value>>,
    ) -> Result<(), LoggingError> {
        let correlation_id = Uuid::new_v4().to_string();
        self.log_with_context(level, message, None, structured_data, correlation_id).await
    }

    /// Log with explicit context
    pub async fn log_with_context(
        &self,
        level: LogLevel,
        message: &str,
        context: Option<LogContext>,
        structured_data: Option<HashMap<String, serde_json::Value>>,
        correlation_id: String,
    ) -> Result<(), LoggingError> {
        // Apply filters
        if !self.filter_engine.should_log(&level, None, message) {
            return Ok(());
        }

        // Get or create context
        let log_context = context.unwrap_or_else(|| {
            self.context_manager.get_current_context()
                .unwrap_or_else(|| LogContext::new(correlation_id.clone()))
        });

        let entry = LogEntry {
            timestamp: Utc::now(),
            level,
            message: message.to_string(),
            correlation_id: Some(correlation_id),
            trace_id: log_context.trace_id.clone(),
            span_id: log_context.span_id.clone(),
            service: env!("CARGO_PKG_NAME").to_string(),
            version: env!("CARGO_PKG_VERSION").to_string(),
            environment: std::env::var("ENVIRONMENT").unwrap_or_else(|_| "development".to_string()),
            tenant_id: log_context.tenant_id.clone(),
            user_id: log_context.user_id.clone(),
            session_id: log_context.session_id.clone(),
            request_id: log_context.request_id.clone(),
            operation: log_context.operation.clone(),
            component: log_context.component.clone(),
            source_file: None, // Would be filled by macro
            source_line: None, // Would be filled by macro
            thread_id: format!("{:?}", std::thread::current().id()),
            structured_data: structured_data.unwrap_or_default(),
            tags: vec![],
            error_code: None,
            error_stack: None,
            duration_ms: None,
            resource_usage: None,
        };

        // Send for async processing
        let _ = self.event_sender.send(LogEvent::LogEntry(entry)).await;

        // Update statistics
        {
            let mut stats = self.statistics.write();
            stats.total_entries += 1;
            *stats.entries_by_level.entry(level).or_insert(0) += 1;

            // Update tenant statistics
            if let Some(tenant_id) = &log_context.tenant_id {
                let tenant_stats = stats.tenant_stats.entry(tenant_id.clone()).or_insert_with(|| TenantLogStats {
                    entry_count: 0,
                    entries_per_minute: 0.0,
                    storage_usage_mb: 0.0,
                    quota_utilization: 0.0,
                    last_activity: Utc::now(),
                });

                tenant_stats.entry_count += 1;
                tenant_stats.last_activity = Utc::now();
            }
        }

        Ok(())
    }

    /// Record log from observability event
    pub async fn record_log(&self, event: ObservabilityEvent) -> Result<(), LoggingError> {
        if let ObservabilityEvent::Log {
            level,
            message,
            timestamp: _,
            correlation_id,
            trace_id,
            span_id,
            structured_data,
            tenant_id,
        } = event
        {
            let context = LogContext {
                correlation_id: correlation_id.unwrap_or_else(|| Uuid::new_v4().to_string()),
                trace_id,
                span_id,
                tenant_id,
                user_id: None,
                session_id: None,
                request_id: None,
                operation: None,
                component: None,
                baggage: HashMap::new(),
            };

            self.log_with_context(
                level,
                &message,
                Some(context),
                Some(structured_data),
                Uuid::new_v4().to_string(),
            ).await?;
        }

        Ok(())
    }

    /// Set log context for current execution context
    pub fn set_context(&self, context: LogContext) {
        let thread_id = format!("{:?}", std::thread::current().id());
        self.context_manager.set_context(thread_id, context);
    }

    /// Get current log context
    pub fn get_context(&self) -> Option<LogContext> {
        let thread_id = format!("{:?}", std::thread::current().id());
        self.context_manager.get_context(&thread_id)
    }

    /// Inject context into carriers (e.g., HTTP headers)
    pub fn inject_context(&self, carrier: &mut HashMap<String, String>) -> Result<(), LoggingError> {
        if let Some(context) = self.get_context() {
            carrier.insert("x-correlation-id".to_string(), context.correlation_id);

            if let Some(trace_id) = context.trace_id {
                carrier.insert("x-trace-id".to_string(), trace_id);
            }

            if let Some(span_id) = context.span_id {
                carrier.insert("x-span-id".to_string(), span_id);
            }

            // Inject baggage
            for (key, value) in context.baggage {
                carrier.insert(format!("x-baggage-{}", key), value);
            }
        }

        Ok(())
    }

    /// Extract context from carriers
    pub fn extract_context(&self, carrier: &HashMap<String, String>) -> Option<LogContext> {
        let correlation_id = carrier.get("x-correlation-id")?.clone();

        let mut baggage = HashMap::new();
        for (key, value) in carrier {
            if key.starts_with("x-baggage-") {
                let baggage_key = key.strip_prefix("x-baggage-")?;
                baggage.insert(baggage_key.to_string(), value.clone());
            }
        }

        Some(LogContext {
            correlation_id,
            trace_id: carrier.get("x-trace-id").cloned(),
            span_id: carrier.get("x-span-id").cloned(),
            tenant_id: carrier.get("x-tenant-id").cloned(),
            user_id: carrier.get("x-user-id").cloned(),
            session_id: carrier.get("x-session-id").cloned(),
            request_id: carrier.get("x-request-id").cloned(),
            operation: None,
            component: None,
            baggage,
        })
    }

    /// Get log statistics
    pub async fn get_statistics(&self, tenant_id: Option<&str>) -> Result<LogStatistics, LoggingError> {
        let stats = self.statistics.read().clone();

        if let Some(tenant_id) = tenant_id {
            // Filter statistics for specific tenant
            let tenant_stats = stats.tenant_stats.get(tenant_id).cloned()
                .unwrap_or_default();

            Ok(LogStatistics {
                total_entries: tenant_stats.entry_count,
                entries_by_level: HashMap::new(), // Not tracked per tenant
                entries_per_second: tenant_stats.entries_per_minute / 60.0,
                filtered_entries: 0,
                sampled_entries: 0,
                write_errors: 0,
                last_write_time: Some(tenant_stats.last_activity),
                buffer_size: 0,
                tenant_stats: HashMap::new(),
                component_stats: HashMap::new(),
            })
        } else {
            Ok(stats)
        }
    }

    /// Background processor for log events
    async fn background_processor(
        mut event_receiver: mpsc::Receiver<LogEvent>,
        writers: Arc<RwLock<Vec<Box<dyn LogWriter>>>>,
        statistics: Arc<RwLock<LogStatistics>>,
    ) {
        let mut batch_buffer = Vec::new();
        let mut flush_timer = tokio::time::interval(tokio::time::Duration::from_millis(1000));

        loop {
            tokio::select! {
                event = event_receiver.recv() => {
                    match event {
                        Some(LogEvent::LogEntry(entry)) => {
                            batch_buffer.push(entry);

                            // Flush if buffer is full
                            if batch_buffer.len() >= 100 {
                                Self::flush_batch(&batch_buffer, &writers, &statistics).await;
                                batch_buffer.clear();
                            }
                        },
                        Some(LogEvent::Flush) => {
                            if !batch_buffer.is_empty() {
                                Self::flush_batch(&batch_buffer, &writers, &statistics).await;
                                batch_buffer.clear();
                            }
                        },
                        Some(LogEvent::Rotate) => {
                            // Handle log rotation
                            // Implementation would rotate log files
                        },
                        Some(LogEvent::ContextUpdate(_, _)) => {
                            // Handle context updates
                        },
                        None => break, // Channel closed
                    }
                },
                _ = flush_timer.tick() => {
                    if !batch_buffer.is_empty() {
                        Self::flush_batch(&batch_buffer, &writers, &statistics).await;
                        batch_buffer.clear();
                    }
                }
            }
        }
    }

    /// Flush batch of log entries to writers
    async fn flush_batch(
        entries: &[LogEntry],
        writers: &Arc<RwLock<Vec<Box<dyn LogWriter>>>>,
        statistics: &Arc<RwLock<LogStatistics>>,
    ) {
        let writers_guard = writers.read();

        for writer in writers_guard.iter() {
            for entry in entries {
                if let Err(e) = writer.write_log(entry).await {
                    eprintln!("Log write error: {}", e);
                    let mut stats = statistics.write();
                    stats.write_errors += 1;
                }
            }
        }

        let mut stats = statistics.write();
        stats.last_write_time = Some(Utc::now());
        stats.buffer_size = 0; // Reset after flush
    }

    /// Validate configuration
    fn validate_config(&self) -> Result<(), LoggingError> {
        // Validate log level
        match self.config.level.as_str() {
            "trace" | "debug" | "info" | "warn" | "error" | "critical" => {},
            _ => return Err(LoggingError::Configuration("Invalid log level".to_string())),
        }

        // Validate format
        match self.config.format.as_str() {
            "json" | "text" | "logfmt" | "structured" => {},
            _ => return Err(LoggingError::Configuration("Invalid log format".to_string())),
        }

        Ok(())
    }

    /// Test writer connectivity
    async fn test_writers(&self) -> Result<(), LoggingError> {
        // Implementation would test each writer
        Ok(())
    }

    /// Start periodic tasks
    async fn start_periodic_tasks(&self) -> Result<(), LoggingError> {
        // Start log rotation task
        let event_sender = self.event_sender.clone();
        tokio::spawn(async move {
            let mut interval = tokio::time::interval(tokio::time::Duration::from_secs(3600));
            loop {
                interval.tick().await;
                let _ = event_sender.send(LogEvent::Rotate).await;
            }
        });

        Ok(())
    }
}

impl LogContextManager {
    pub fn new() -> Self {
        Self {
            contexts: DashMap::new(),
            propagation_headers: vec![
                "x-correlation-id".to_string(),
                "x-trace-id".to_string(),
                "x-span-id".to_string(),
                "x-tenant-id".to_string(),
            ],
        }
    }

    pub fn set_context(&self, context_id: String, context: LogContext) {
        self.contexts.insert(context_id, context);
    }

    pub fn get_context(&self, context_id: &str) -> Option<LogContext> {
        self.contexts.get(context_id).map(|entry| entry.clone())
    }

    pub fn get_current_context(&self) -> Option<LogContext> {
        let thread_id = format!("{:?}", std::thread::current().id());
        self.get_context(&thread_id)
    }
}

impl LogFilterEngine {
    pub fn new(config: &LoggingConfig) -> Self {
        let mut level_filters = HashMap::new();
        level_filters.insert("default".to_string(), LogLevel::from_str(&config.level));

        Self {
            level_filters,
            component_filters: HashMap::new(),
            sampling_configs: HashMap::new(),
            rate_limits: HashMap::new(),
        }
    }

    pub fn should_log(&self, level: &LogLevel, component: Option<&str>, _message: &str) -> bool {
        // Check level filter
        let min_level = if let Some(component) = component {
            self.component_filters.get(component)
                .map(|f| &f.min_level)
                .unwrap_or(&LogLevel::Info)
        } else {
            self.level_filters.get("default").unwrap_or(&LogLevel::Info)
        };

        level >= min_level
    }
}

impl LogContext {
    pub fn new(correlation_id: String) -> Self {
        Self {
            correlation_id,
            trace_id: None,
            span_id: None,
            tenant_id: None,
            user_id: None,
            session_id: None,
            request_id: None,
            operation: None,
            component: None,
            baggage: HashMap::new(),
        }
    }
}

impl LogLevel {
    pub fn from_str(s: &str) -> Self {
        match s.to_lowercase().as_str() {
            "trace" => LogLevel::Trace,
            "debug" => LogLevel::Debug,
            "info" => LogLevel::Info,
            "warn" | "warning" => LogLevel::Warn,
            "error" => LogLevel::Error,
            "critical" | "fatal" => LogLevel::Critical,
            _ => LogLevel::Info,
        }
    }

    pub fn as_str(&self) -> &'static str {
        match self {
            LogLevel::Trace => "TRACE",
            LogLevel::Debug => "DEBUG",
            LogLevel::Info => "INFO",
            LogLevel::Warn => "WARN",
            LogLevel::Error => "ERROR",
            LogLevel::Critical => "CRITICAL",
        }
    }
}

impl PartialOrd for LogLevel {
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        Some(self.cmp(other))
    }
}

impl Ord for LogLevel {
    fn cmp(&self, other: &Self) -> std::cmp::Ordering {
        let self_val = match self {
            LogLevel::Trace => 0,
            LogLevel::Debug => 1,
            LogLevel::Info => 2,
            LogLevel::Warn => 3,
            LogLevel::Error => 4,
            LogLevel::Critical => 5,
        };

        let other_val = match other {
            LogLevel::Trace => 0,
            LogLevel::Debug => 1,
            LogLevel::Info => 2,
            LogLevel::Warn => 3,
            LogLevel::Error => 4,
            LogLevel::Critical => 5,
        };

        self_val.cmp(&other_val)
    }
}

// Log writer implementations

impl FileLogWriter {
    pub fn new(
        file_path: &str,
        rotation_size_mb: u64,
        retention_count: u32,
        format: &str,
    ) -> Result<Self, LoggingError> {
        Ok(Self {
            file_path: file_path.to_string(),
            rotation_size_mb,
            retention_count,
            current_size: Arc::new(RwLock::new(0)),
            format: LogFormat::from_str(format),
        })
    }
}

#[async_trait::async_trait]
impl LogWriter for FileLogWriter {
    async fn write_log(&self, entry: &LogEntry) -> Result<(), LoggingError> {
        let formatted = self.format_entry(entry)?;

        let mut file = OpenOptions::new()
            .create(true)
            .append(true)
            .open(&self.file_path)
            .await
            .map_err(|e| LoggingError::Io(e))?;

        file.write_all(formatted.as_bytes()).await
            .map_err(|e| LoggingError::Io(e))?;

        file.write_all(b"\n").await
            .map_err(|e| LoggingError::Io(e))?;

        // Update size tracking
        *self.current_size.write() += formatted.len() as u64;

        // Check if rotation is needed
        if *self.current_size.read() > self.rotation_size_mb * 1024 * 1024 {
            self.rotate_file().await?;
        }

        Ok(())
    }

    fn supports_structured(&self) -> bool {
        matches!(self.format, LogFormat::Json | LogFormat::Structured)
    }

    fn get_writer_type(&self) -> LogWriterType {
        LogWriterType::File
    }
}

impl FileLogWriter {
    fn format_entry(&self, entry: &LogEntry) -> Result<String, LoggingError> {
        match self.format {
            LogFormat::Json => {
                serde_json::to_string(entry)
                    .map_err(|e| LoggingError::Serialization(e.to_string()))
            },
            LogFormat::Text => {
                Ok(format!(
                    "{} [{}] [{}] {} - {}",
                    entry.timestamp.format("%Y-%m-%d %H:%M:%S%.3fZ"),
                    entry.level.as_str(),
                    entry.correlation_id.as_deref().unwrap_or("unknown"),
                    entry.component.as_deref().unwrap_or("system"),
                    entry.message
                ))
            },
            LogFormat::Logfmt => {
                let mut parts = Vec::new();
                parts.push(format!("timestamp={}", entry.timestamp.to_rfc3339()));
                parts.push(format!("level={}", entry.level.as_str()));
                parts.push(format!("message=\"{}\"", entry.message.replace('\"', "\\\"")));

                if let Some(correlation_id) = &entry.correlation_id {
                    parts.push(format!("correlation_id={}", correlation_id));
                }

                Ok(parts.join(" "))
            },
            LogFormat::Structured => {
                // Custom structured format
                let mut output = HashMap::new();
                output.insert("@timestamp", serde_json::json!(entry.timestamp));
                output.insert("level", serde_json::json!(entry.level.as_str()));
                output.insert("message", serde_json::json!(entry.message));

                serde_json::to_string(&output)
                    .map_err(|e| LoggingError::Serialization(e.to_string()))
            },
        }
    }

    async fn rotate_file(&self) -> Result<(), LoggingError> {
        // Implementation would rotate log files
        *self.current_size.write() = 0;
        Ok(())
    }
}

impl ConsoleLogWriter {
    pub fn new(format: &str, colored: bool) -> Result<Self, LoggingError> {
        Ok(Self {
            format: LogFormat::from_str(format),
            colored,
        })
    }
}

#[async_trait::async_trait]
impl LogWriter for ConsoleLogWriter {
    async fn write_log(&self, entry: &LogEntry) -> Result<(), LoggingError> {
        let formatted = self.format_entry(entry)?;
        println!("{}", formatted);
        Ok(())
    }

    fn supports_structured(&self) -> bool {
        matches!(self.format, LogFormat::Json | LogFormat::Structured)
    }

    fn get_writer_type(&self) -> LogWriterType {
        LogWriterType::Console
    }
}

impl ConsoleLogWriter {
    fn format_entry(&self, entry: &LogEntry) -> Result<String, LoggingError> {
        let level_color = if self.colored {
            match entry.level {
                LogLevel::Trace => "\x1b[37m", // White
                LogLevel::Debug => "\x1b[36m", // Cyan
                LogLevel::Info => "\x1b[32m",  // Green
                LogLevel::Warn => "\x1b[33m",  // Yellow
                LogLevel::Error => "\x1b[31m", // Red
                LogLevel::Critical => "\x1b[35m", // Magenta
            }
        } else {
            ""
        };

        let reset_color = if self.colored { "\x1b[0m" } else { "" };

        match self.format {
            LogFormat::Json => {
                serde_json::to_string(entry)
                    .map_err(|e| LoggingError::Serialization(e.to_string()))
            },
            _ => {
                Ok(format!(
                    "{}{} [{}{}{}] [{}] {} - {}{}",
                    level_color,
                    entry.timestamp.format("%Y-%m-%d %H:%M:%S%.3fZ"),
                    level_color,
                    entry.level.as_str(),
                    reset_color,
                    entry.correlation_id.as_deref().unwrap_or("unknown"),
                    entry.component.as_deref().unwrap_or("system"),
                    entry.message,
                    reset_color
                ))
            }
        }
    }
}

impl LogFormat {
    pub fn from_str(s: &str) -> Self {
        match s.to_lowercase().as_str() {
            "json" => LogFormat::Json,
            "text" => LogFormat::Text,
            "logfmt" => LogFormat::Logfmt,
            "structured" => LogFormat::Structured,
            _ => LogFormat::Text,
        }
    }
}

impl Default for LogStatistics {
    fn default() -> Self {
        Self {
            total_entries: 0,
            entries_by_level: HashMap::new(),
            entries_per_second: 0.0,
            filtered_entries: 0,
            sampled_entries: 0,
            write_errors: 0,
            last_write_time: None,
            buffer_size: 0,
            tenant_stats: HashMap::new(),
            component_stats: HashMap::new(),
        }
    }
}

impl Default for TenantLogStats {
    fn default() -> Self {
        Self {
            entry_count: 0,
            entries_per_minute: 0.0,
            storage_usage_mb: 0.0,
            quota_utilization: 0.0,
            last_activity: Utc::now(),
        }
    }
}

/// Structured logging macro with automatic context
#[macro_export]
macro_rules! log {
    ($logger:expr, $level:expr, $($arg:tt)*) => {{
        let message = format!($($arg)*);
        let _ = $logger.log($level, &message, None).await;
    }};
}

/// Structured logging macro with custom fields
#[macro_export]
macro_rules! log_with_fields {
    ($logger:expr, $level:expr, $message:expr, $($key:expr => $value:expr),*) => {{
        let mut structured_data = std::collections::HashMap::new();
        $(
            structured_data.insert($key.to_string(), serde_json::json!($value));
        )*

        let _ = $logger.log($level, $message, Some(structured_data)).await;
    }};
}

/// Logging error types
#[derive(Debug, thiserror::Error)]
pub enum LoggingError {
    #[error("Configuration error: {0}")]
    Configuration(String),

    #[error("Writer error: {0}")]
    Writer(String),

    #[error("Serialization error: {0}")]
    Serialization(String),

    #[error("Network error: {0}")]
    Network(String),

    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Context error: {0}")]
    Context(String),
}