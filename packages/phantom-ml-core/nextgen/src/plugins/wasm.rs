//! WebAssembly Plugin Runtime and Sandboxing
//!
//! Provides secure WebAssembly plugin execution with comprehensive sandboxing,
//! resource limits, and WASI (WebAssembly System Interface) support.

use super::*;
use anyhow::{Context as AnyhowContext, Result as AnyhowResult};
use parking_lot::RwLock;
use std::collections::HashMap;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::time::timeout;
use tracing::{debug, error, info, instrument, warn};
use wasmtime::*;
use wasmtime_wasi::{WasiCtx, WasiCtxBuilder};

/// WebAssembly runtime configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WasmRuntimeConfig {
    /// Maximum WASM module compilation time in seconds
    pub max_compilation_time_secs: u64,
    /// Maximum WASM module memory pages (64KB per page)
    pub max_memory_pages: u32,
    /// Enable WASI support
    pub wasi_enabled: bool,
    /// Enable fuel-based execution limits
    pub fuel_enabled: bool,
    /// Initial fuel amount for execution
    pub initial_fuel: u64,
    /// Maximum number of concurrent WASM instances
    pub max_instances: usize,
    /// Enable debugging support
    pub debug_enabled: bool,
    /// Allowed host functions
    pub allowed_host_functions: Vec<String>,
    /// File system sandbox directory
    pub sandbox_directory: Option<String>,
    /// Network access whitelist
    pub network_whitelist: Vec<String>,
    /// Environment variables whitelist
    pub env_whitelist: Vec<String>,
}

impl Default for WasmRuntimeConfig {
    fn default() -> Self {
        Self {
            max_compilation_time_secs: 30,
            max_memory_pages: 256, // 16MB
            wasi_enabled: true,
            fuel_enabled: true,
            initial_fuel: 10_000_000, // Adjust based on needs
            max_instances: 10,
            debug_enabled: false,
            allowed_host_functions: Vec::new(),
            sandbox_directory: None,
            network_whitelist: Vec::new(),
            env_whitelist: Vec::new(),
        }
    }
}

/// WebAssembly plugin instance with comprehensive sandboxing
pub struct WasmPluginInstance {
    pub metadata: PluginMetadata,
    pub module: Module,
    pub engine: Engine,
    pub store: Store<WasmPluginContext>,
    pub instance: Instance,
    pub memory: Option<Memory>,
    pub execution_count: AtomicU64,
    pub total_execution_time: AtomicU64,
    pub fuel_consumed: AtomicU64,
    pub created_at: Instant,
    pub config: WasmRuntimeConfig,
}

/// WebAssembly plugin execution context
#[derive(Debug)]
pub struct WasmPluginContext {
    pub plugin_id: String,
    pub permissions: Vec<Permission>,
    pub resource_limits: ResourceLimits,
    pub wasi_ctx: Option<WasiCtx>,
    pub start_time: Instant,
    pub fuel_limit: u64,
    pub memory_usage: AtomicU64,
    pub file_handles: AtomicU64,
    pub network_connections: AtomicU64,
    pub custom_data: HashMap<String, serde_json::Value>,
}

/// WebAssembly runtime for executing WASM plugins
pub struct WasmRuntime {
    config: WasmRuntimeConfig,
    engine: Engine,
    instances: Arc<RwLock<HashMap<String, Arc<RwLock<WasmPluginInstance>>>>>,
    instance_counter: AtomicU64,
}

impl WasmRuntime {
    /// Create a new WebAssembly runtime
    pub fn new(config: WasmRuntimeConfig) -> PluginResult<Self> {
        let mut wasmtime_config = Config::new();

        // Enable basic features
        wasmtime_config.wasm_simd(true);
        wasmtime_config.wasm_multi_value(true);
        wasmtime_config.wasm_bulk_memory(true);
        wasmtime_config.wasm_reference_types(true);

        // Configure memory settings
        wasmtime_config.static_memory_maximum_size(
            (config.max_memory_pages as u64) * 65536
        );

        // Enable fuel if configured
        if config.fuel_enabled {
            wasmtime_config.consume_fuel(true);
        }

        // Enable debugging if configured
        if config.debug_enabled {
            wasmtime_config.debug_info(true);
            wasmtime_config.cranelift_debug_verifier(true);
        }

        // Security hardening
        wasmtime_config.cranelift_opt_level(OptLevel::Speed);
        wasmtime_config.epoch_interruption(true);
        wasmtime_config.max_wasm_stack(1024 * 1024); // 1MB max stack

        let engine = Engine::new(&wasmtime_config)
            .map_err(|e| PluginError::WasmError {
                message: format!("Failed to create WASM engine: {}", e),
            })?;

        Ok(Self {
            config,
            engine,
            instances: Arc::new(RwLock::new(HashMap::new())),
            instance_counter: AtomicU64::new(0),
        })
    }

    /// Load a WebAssembly plugin from bytes
    #[instrument(skip(self, wasm_bytes))]
    pub async fn load_plugin(
        &self,
        metadata: PluginMetadata,
        wasm_bytes: &[u8],
    ) -> PluginResult<String> {
        info!("Loading WASM plugin: {} v{}", metadata.name, metadata.version);

        // Check instance limit
        let current_instances = self.instances.read().len();
        if current_instances >= self.config.max_instances {
            return Err(PluginError::ResourceLimitExceeded {
                resource: "wasm_instances".to_string(),
                limit: self.config.max_instances.to_string(),
            });
        }

        // Compile WASM module with timeout
        let compilation_start = Instant::now();
        let module = timeout(
            Duration::from_secs(self.config.max_compilation_time_secs),
            self.compile_module(wasm_bytes),
        )
        .await
        .map_err(|_| PluginError::WasmError {
            message: "WASM module compilation timed out".to_string(),
        })?
        .map_err(|e| PluginError::WasmError {
            message: format!("WASM module compilation failed: {}", e),
        })?;

        debug!(
            "WASM module compiled in {:?}",
            compilation_start.elapsed()
        );

        // Create plugin context
        let plugin_context = WasmPluginContext {
            plugin_id: metadata.id.clone(),
            permissions: metadata.permissions.clone(),
            resource_limits: metadata.resource_limits.clone(),
            wasi_ctx: None,
            start_time: Instant::now(),
            fuel_limit: self.config.initial_fuel,
            memory_usage: AtomicU64::new(0),
            file_handles: AtomicU64::new(0),
            network_connections: AtomicU64::new(0),
            custom_data: HashMap::new(),
        };

        // Create WASM store
        let mut store = Store::new(&self.engine, plugin_context);

        // Configure fuel if enabled
        if self.config.fuel_enabled {
            store.add_fuel(self.config.initial_fuel)
                .map_err(|e| PluginError::WasmError {
                    message: format!("Failed to add fuel: {}", e),
                })?;
        }

        // Set up WASI if enabled
        if self.config.wasi_enabled {
            let wasi_ctx = self.create_wasi_context(&metadata)?;
            store.data_mut().wasi_ctx = Some(wasi_ctx);
        }

        // Create linker with host functions
        let mut linker = Linker::new(&self.engine);

        // Add WASI functions if enabled
        if self.config.wasi_enabled {
            wasmtime_wasi::add_to_linker(&mut linker, |ctx: &mut WasmPluginContext| {
                ctx.wasi_ctx.as_mut().unwrap()
            })
            .map_err(|e| PluginError::WasmError {
                message: format!("Failed to add WASI to linker: {}", e),
            })?;
        }

        // Add custom host functions
        self.add_host_functions(&mut linker)?;

        // Instantiate WASM module
        let instance = linker
            .instantiate_async(&mut store, &module)
            .await
            .map_err(|e| PluginError::WasmError {
                message: format!("Failed to instantiate WASM module: {}", e),
            })?;

        // Get memory export if available
        let memory = instance.get_memory(&mut store, "memory");

        // Initialize plugin if it has an init function
        if let Some(init_func) = instance.get_func(&mut store, "_initialize") {
            self.call_wasm_function(&mut store, init_func, &[]).await?;
        }

        // Create plugin instance
        let plugin_instance = WasmPluginInstance {
            metadata: metadata.clone(),
            module,
            engine: self.engine.clone(),
            store,
            instance,
            memory,
            execution_count: AtomicU64::new(0),
            total_execution_time: AtomicU64::new(0),
            fuel_consumed: AtomicU64::new(0),
            created_at: Instant::now(),
            config: self.config.clone(),
        };

        let instance_id = format!(
            "{}:{}",
            metadata.id,
            self.instance_counter.fetch_add(1, Ordering::SeqCst)
        );

        // Store instance
        self.instances
            .write()
            .insert(instance_id.clone(), Arc::new(RwLock::new(plugin_instance)));

        info!(
            "Successfully loaded WASM plugin: {} (instance: {})",
            metadata.name, instance_id
        );

        Ok(instance_id)
    }

    /// Compile WASM module
    async fn compile_module(&self, wasm_bytes: &[u8]) -> AnyhowResult<Module> {
        // Validate WASM module before compilation
        self.validate_wasm_module(wasm_bytes)?;

        // Compile module
        Module::from_binary(&self.engine, wasm_bytes)
            .context("Failed to compile WASM module")
    }

    /// Validate WASM module for security and compatibility
    fn validate_wasm_module(&self, wasm_bytes: &[u8]) -> AnyhowResult<()> {
        use wasmparser::{Parser, Payload, TypeRef, ValType};

        let parser = Parser::new(0);
        let mut has_memory = false;
        let mut imports = Vec::new();
        let mut exports = Vec::new();

        for payload in parser.parse_all(wasm_bytes) {
            match payload? {
                Payload::ImportSection(reader) => {
                    for import in reader {
                        let import = import?;
                        imports.push((import.module.to_string(), import.name.to_string()));

                        // Check memory imports
                        if let TypeRef::Memory(_) = import.ty {
                            has_memory = true;
                        }
                    }
                }
                Payload::ExportSection(reader) => {
                    for export in reader {
                        let export = export?;
                        exports.push(export.name.to_string());

                        // Check memory exports
                        if export.name == "memory" {
                            has_memory = true;
                        }
                    }
                }
                Payload::MemorySection(reader) => {
                    for memory in reader {
                        let memory = memory?;
                        has_memory = true;

                        // Check memory limits
                        if memory.initial > self.config.max_memory_pages {
                            return Err(anyhow::anyhow!(
                                "WASM module requests too much initial memory: {} pages (max: {})",
                                memory.initial,
                                self.config.max_memory_pages
                            ));
                        }

                        if let Some(maximum) = memory.maximum {
                            if maximum > self.config.max_memory_pages {
                                return Err(anyhow::anyhow!(
                                    "WASM module requests too much maximum memory: {} pages (max: {})",
                                    maximum,
                                    self.config.max_memory_pages
                                ));
                            }
                        }
                    }
                }
                _ => {}
            }
        }

        // Validate required exports
        if !exports.contains(&"execute".to_string()) {
            return Err(anyhow::anyhow!(
                "WASM module must export an 'execute' function"
            ));
        }

        info!(
            "WASM module validation passed. Memory: {}, Imports: {}, Exports: {}",
            has_memory,
            imports.len(),
            exports.len()
        );

        Ok(())
    }

    /// Create WASI context with sandbox restrictions
    fn create_wasi_context(&self, metadata: &PluginMetadata) -> PluginResult<WasiCtx> {
        let mut builder = WasiCtxBuilder::new();

        // Configure environment variables based on permissions
        for permission in &metadata.permissions {
            match permission {
                Permission::Environment { variables } => {
                    for var in variables {
                        if var == "*" {
                            // Allow all whitelisted env vars
                            for whitelisted_var in &self.config.env_whitelist {
                                if let Ok(value) = std::env::var(whitelisted_var) {
                                    builder.env(whitelisted_var, &value)?;
                                }
                            }
                        } else if self.config.env_whitelist.contains(var) {
                            if let Ok(value) = std::env::var(var) {
                                builder.env(var, &value)?;
                            }
                        }
                    }
                }
                _ => {}
            }
        }

        // Configure file system access
        if let Some(sandbox_dir) = &self.config.sandbox_directory {
            for permission in &metadata.permissions {
                match permission {
                    Permission::FileSystemRead { paths } => {
                        for path in paths {
                            if path == "*" {
                                builder.preopened_dir(
                                    sandbox_dir,
                                    ".",
                                    wasmtime_wasi::DirPerms::READ,
                                    wasmtime_wasi::FilePerms::READ,
                                )?;
                            } else {
                                let full_path = format!("{}/{}", sandbox_dir, path);
                                builder.preopened_dir(
                                    &full_path,
                                    path,
                                    wasmtime_wasi::DirPerms::READ,
                                    wasmtime_wasi::FilePerms::READ,
                                )?;
                            }
                        }
                    }
                    Permission::FileSystemWrite { paths } => {
                        for path in paths {
                            if path == "*" {
                                builder.preopened_dir(
                                    sandbox_dir,
                                    ".",
                                    wasmtime_wasi::DirPerms::all(),
                                    wasmtime_wasi::FilePerms::all(),
                                )?;
                            } else {
                                let full_path = format!("{}/{}", sandbox_dir, path);
                                builder.preopened_dir(
                                    &full_path,
                                    path,
                                    wasmtime_wasi::DirPerms::all(),
                                    wasmtime_wasi::FilePerms::all(),
                                )?;
                            }
                        }
                    }
                    _ => {}
                }
            }
        }

        // Build context
        let ctx = builder
            .build()
            .map_err(|e| PluginError::WasmError {
                message: format!("Failed to create WASI context: {}", e),
            })?;

        Ok(ctx)
    }

    /// Add custom host functions to the linker
    fn add_host_functions(&self, linker: &mut Linker<WasmPluginContext>) -> PluginResult<()> {
        // Add logging function
        linker
            .func_wrap(
                "phantom",
                "log",
                |mut caller: Caller<'_, WasmPluginContext>, level: i32, message_ptr: i32, message_len: i32| -> Result<(), Trap> {
                    let memory = match caller.get_export("memory") {
                        Some(Extern::Memory(mem)) => mem,
                        _ => return Err(Trap::new("Failed to get memory")),
                    };

                    let message = match memory.read(&mut caller, message_ptr as usize, message_len as usize) {
                        Ok(data) => String::from_utf8_lossy(&data).to_string(),
                        Err(_) => return Err(Trap::new("Failed to read message from memory")),
                    };

                    let plugin_id = &caller.data().plugin_id;

                    match level {
                        0 => tracing::trace!("[WASM:{}] {}", plugin_id, message),
                        1 => tracing::debug!("[WASM:{}] {}", plugin_id, message),
                        2 => tracing::info!("[WASM:{}] {}", plugin_id, message),
                        3 => tracing::warn!("[WASM:{}] {}", plugin_id, message),
                        4 => tracing::error!("[WASM:{}] {}", plugin_id, message),
                        _ => tracing::info!("[WASM:{}] {}", plugin_id, message),
                    }

                    Ok(())
                },
            )
            .map_err(|e| PluginError::WasmError {
                message: format!("Failed to add log host function: {}", e),
            })?;

        // Add time function
        linker
            .func_wrap(
                "phantom",
                "now_millis",
                |_caller: Caller<'_, WasmPluginContext>| -> i64 {
                    std::time::SystemTime::now()
                        .duration_since(std::time::UNIX_EPOCH)
                        .unwrap_or_default()
                        .as_millis() as i64
                },
            )
            .map_err(|e| PluginError::WasmError {
                message: format!("Failed to add time host function: {}", e),
            })?;

        // Add memory info function
        linker
            .func_wrap(
                "phantom",
                "memory_usage",
                |caller: Caller<'_, WasmPluginContext>| -> i64 {
                    caller.data().memory_usage.load(Ordering::SeqCst) as i64
                },
            )
            .map_err(|e| PluginError::WasmError {
                message: format!("Failed to add memory usage host function: {}", e),
            })?;

        // Add resource limit check function
        linker
            .func_wrap(
                "phantom",
                "check_resource_limit",
                |caller: Caller<'_, WasmPluginContext>, resource_type: i32| -> i32 {
                    let ctx = caller.data();
                    match resource_type {
                        0 => { // Memory
                            let current = ctx.memory_usage.load(Ordering::SeqCst);
                            if current > ctx.resource_limits.max_memory_bytes {
                                0 // Limit exceeded
                            } else {
                                1 // OK
                            }
                        }
                        1 => { // File handles
                            let current = ctx.file_handles.load(Ordering::SeqCst);
                            if current > ctx.resource_limits.max_file_handles as u64 {
                                0 // Limit exceeded
                            } else {
                                1 // OK
                            }
                        }
                        2 => { // Network connections
                            let current = ctx.network_connections.load(Ordering::SeqCst);
                            if current > ctx.resource_limits.max_network_connections as u64 {
                                0 // Limit exceeded
                            } else {
                                1 // OK
                            }
                        }
                        _ => 1, // Unknown resource, assume OK
                    }
                },
            )
            .map_err(|e| PluginError::WasmError {
                message: format!("Failed to add resource limit check function: {}", e),
            })?;

        Ok(())
    }

    /// Execute a WASM plugin with the given input
    #[instrument(skip(self, input))]
    pub async fn execute_plugin(
        &self,
        instance_id: &str,
        input: PluginExecutionInput,
    ) -> PluginResult<PluginExecutionResult> {
        let start_time = Instant::now();
        let execution_id = input.context.execution_id;

        info!(
            "Executing WASM plugin instance: {} (execution: {})",
            instance_id, execution_id
        );

        // Get plugin instance
        let instance_arc = self
            .instances
            .read()
            .get(instance_id)
            .cloned()
            .ok_or_else(|| PluginError::PluginNotFound {
                plugin_id: instance_id.to_string(),
            })?;

        let mut instance = instance_arc.write();

        // Update execution context
        instance.store.data_mut().start_time = start_time;
        instance.store.data_mut().fuel_limit = self.config.initial_fuel;

        // Add fresh fuel for this execution
        if self.config.fuel_enabled {
            instance.store.add_fuel(self.config.initial_fuel)
                .map_err(|e| PluginError::WasmError {
                    message: format!("Failed to add fuel: {}", e),
                })?;
        }

        // Serialize input data
        let input_json = serde_json::to_string(&input)
            .map_err(|e| PluginError::SerializationError {
                error: e.to_string(),
            })?;

        // Get execute function
        let execute_func = instance
            .instance
            .get_func(&mut instance.store, "execute")
            .ok_or_else(|| PluginError::WasmError {
                message: "WASM module does not export 'execute' function".to_string(),
            })?;

        // Allocate memory for input data
        let (input_ptr, input_len) = self.write_string_to_memory(
            &mut instance.store,
            instance.memory.as_ref(),
            &input_json,
        )?;

        // Execute plugin with timeout
        let timeout_duration = Duration::from_millis(
            input.timeout_ms.unwrap_or(instance.config.max_compilation_time_secs * 1000)
        );

        let result = timeout(
            timeout_duration,
            self.call_wasm_function(
                &mut instance.store,
                execute_func,
                &[Val::I32(input_ptr), Val::I32(input_len)],
            ),
        )
        .await;

        let execution_time = start_time.elapsed();
        instance.execution_count.fetch_add(1, Ordering::SeqCst);
        instance.total_execution_time.fetch_add(execution_time.as_millis() as u64, Ordering::SeqCst);

        // Handle execution result
        match result {
            Ok(Ok(results)) => {
                // Get result pointer and length from WASM return values
                let (result_ptr, result_len) = match results.as_slice() {
                    [Val::I32(ptr), Val::I32(len)] => (*ptr, *len),
                    _ => {
                        return Err(PluginError::WasmError {
                            message: "Invalid return values from WASM execute function".to_string(),
                        });
                    }
                };

                // Read result data from memory
                let result_json = self.read_string_from_memory(
                    &mut instance.store,
                    instance.memory.as_ref(),
                    result_ptr,
                    result_len,
                )?;

                // Parse result
                let plugin_result: serde_json::Value = serde_json::from_str(&result_json)
                    .unwrap_or_else(|_| serde_json::json!({ "data": result_json }));

                // Get fuel consumption
                let fuel_consumed = if self.config.fuel_enabled {
                    let remaining_fuel = instance.store.fuel_consumed().unwrap_or(0);
                    self.config.initial_fuel.saturating_sub(remaining_fuel)
                } else {
                    0
                };

                instance.fuel_consumed.fetch_add(fuel_consumed, Ordering::SeqCst);

                Ok(PluginExecutionResult {
                    plugin_id: instance.metadata.id.clone(),
                    execution_id,
                    success: true,
                    result: Some(plugin_result),
                    error: None,
                    warnings: Vec::new(),
                    logs: Vec::new(),
                    execution_time_ms: execution_time.as_millis() as u64,
                    memory_used_bytes: instance.store.data().memory_usage.load(Ordering::SeqCst),
                    cpu_time_ms: fuel_consumed / 1000, // Rough estimate
                    created_files: Vec::new(),
                    network_requests: instance.store.data().network_connections.load(Ordering::SeqCst) as u32,
                    metadata: HashMap::new(),
                })
            }
            Ok(Err(e)) => {
                error!("WASM execution failed: {}", e);
                Ok(PluginExecutionResult {
                    plugin_id: instance.metadata.id.clone(),
                    execution_id,
                    success: false,
                    result: None,
                    error: Some(e.to_string()),
                    warnings: Vec::new(),
                    logs: Vec::new(),
                    execution_time_ms: execution_time.as_millis() as u64,
                    memory_used_bytes: instance.store.data().memory_usage.load(Ordering::SeqCst),
                    cpu_time_ms: 0,
                    created_files: Vec::new(),
                    network_requests: 0,
                    metadata: HashMap::new(),
                })
            }
            Err(_) => {
                error!("WASM execution timed out");
                Err(PluginError::ExecutionFailed {
                    error: "Plugin execution timed out".to_string(),
                })
            }
        }
    }

    /// Call a WASM function safely
    async fn call_wasm_function(
        &self,
        store: &mut Store<WasmPluginContext>,
        func: Func,
        args: &[Val],
    ) -> PluginResult<Vec<Val>> {
        func.call_async(store, args).await
            .map_err(|e| PluginError::WasmError {
                message: format!("WASM function call failed: {}", e),
            })
    }

    /// Write a string to WASM memory
    fn write_string_to_memory(
        &self,
        store: &mut Store<WasmPluginContext>,
        memory: Option<&Memory>,
        data: &str,
    ) -> PluginResult<(i32, i32)> {
        let memory = memory.ok_or_else(|| PluginError::WasmError {
            message: "WASM module does not export memory".to_string(),
        })?;

        let data_bytes = data.as_bytes();
        let data_len = data_bytes.len() as i32;

        // Allocate memory (simplified - in practice, you'd call a WASM allocator function)
        let data_ptr = 1024; // Start after some reserved space

        memory
            .write(store, data_ptr as usize, data_bytes)
            .map_err(|e| PluginError::WasmError {
                message: format!("Failed to write to WASM memory: {}", e),
            })?;

        Ok((data_ptr, data_len))
    }

    /// Read a string from WASM memory
    fn read_string_from_memory(
        &self,
        store: &mut Store<WasmPluginContext>,
        memory: Option<&Memory>,
        ptr: i32,
        len: i32,
    ) -> PluginResult<String> {
        let memory = memory.ok_or_else(|| PluginError::WasmError {
            message: "WASM module does not export memory".to_string(),
        })?;

        let mut buffer = vec![0u8; len as usize];
        memory
            .read(store, ptr as usize, &mut buffer)
            .map_err(|e| PluginError::WasmError {
                message: format!("Failed to read from WASM memory: {}", e),
            })?;

        String::from_utf8(buffer).map_err(|e| PluginError::WasmError {
            message: format!("Invalid UTF-8 data in WASM memory: {}", e),
        })
    }

    /// Unload a WASM plugin instance
    pub fn unload_plugin(&self, instance_id: &str) -> PluginResult<()> {
        info!("Unloading WASM plugin instance: {}", instance_id);

        self.instances.write().remove(instance_id);

        info!("Successfully unloaded WASM plugin instance: {}", instance_id);
        Ok(())
    }

    /// Get plugin instance statistics
    pub fn get_instance_stats(&self, instance_id: &str) -> Option<HashMap<String, serde_json::Value>> {
        let instances = self.instances.read();
        if let Some(instance_arc) = instances.get(instance_id) {
            let instance = instance_arc.read();
            let mut stats = HashMap::new();

            stats.insert("plugin_id".to_string(), serde_json::json!(instance.metadata.id));
            stats.insert("execution_count".to_string(), serde_json::json!(instance.execution_count.load(Ordering::SeqCst)));
            stats.insert("total_execution_time_ms".to_string(), serde_json::json!(instance.total_execution_time.load(Ordering::SeqCst)));
            stats.insert("fuel_consumed".to_string(), serde_json::json!(instance.fuel_consumed.load(Ordering::SeqCst)));
            stats.insert("uptime_seconds".to_string(), serde_json::json!(instance.created_at.elapsed().as_secs()));

            let avg_execution_time = if instance.execution_count.load(Ordering::SeqCst) > 0 {
                instance.total_execution_time.load(Ordering::SeqCst) / instance.execution_count.load(Ordering::SeqCst)
            } else {
                0
            };
            stats.insert("average_execution_time_ms".to_string(), serde_json::json!(avg_execution_time));

            Some(stats)
        } else {
            None
        }
    }

    /// List all loaded plugin instances
    pub fn list_instances(&self) -> Vec<String> {
        self.instances.read().keys().cloned().collect()
    }
}

impl std::fmt::Debug for WasmRuntime {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("WasmRuntime")
            .field("config", &self.config)
            .field("instance_count", &self.instances.read().len())
            .field("instance_counter", &self.instance_counter.load(Ordering::SeqCst))
            .finish()
    }
}