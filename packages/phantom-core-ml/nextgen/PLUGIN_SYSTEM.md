# Phantom ML Core Plugin System

A comprehensive, enterprise-grade plugin system for the Phantom ML Core agent architecture, providing extensibility, dynamic loading, and secure sandboxing capabilities.

## Features

### Core Capabilities
- **Dynamic Plugin Loading**: Load and unload plugins without system restart
- **Hot Reloading**: Automatic plugin reloading when files change
- **Multi-Runtime Support**: Native Rust plugins and WebAssembly sandboxed plugins
- **Security & Sandboxing**: Comprehensive permission system with WebAssembly isolation
- **Agent Integration**: Seamless integration with existing agent system
- **Marketplace**: Plugin discovery, installation, and management
- **Configuration Management**: Environment-specific configuration with validation
- **Monitoring & Observability**: Real-time metrics, health monitoring, and alerting

### Plugin Types Supported
1. **Native Rust Plugins**: High-performance plugins with full system access
2. **WebAssembly Plugins**: Sandboxed plugins with resource limits and security isolation
3. **JavaScript Plugins**: Future support for Node.js-based plugins

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Plugin System API                         │
├─────────────────────────────────────────────────────────────┤
│  Plugin Registry  │  Config Manager  │  Marketplace Client  │
├─────────────────────────────────────────────────────────────┤
│  Plugin Loader    │  WASM Runtime    │  Security Manager    │
├─────────────────────────────────────────────────────────────┤
│  Discovery System │  Monitoring      │  Message Router      │
├─────────────────────────────────────────────────────────────┤
│                   Core Plugin Traits                        │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

### 1. Initialize Plugin System (Node.js/TypeScript)

```javascript
import { create_plugin_system } from '@phantom-ml/core';

const pluginSystem = await create_plugin_system(
    './plugins',      // Plugin directory
    'development'     // Environment
);

// List available plugins
const plugins = await pluginSystem.list_plugins();
console.log('Available plugins:', plugins);
```

### 2. Execute a Plugin

```javascript
// Execute log analyzer plugin
const result = await pluginSystem.execute_plugin(
    'log_analyzer',
    'analyze_file',
    {
        file_path: './logs/application.log'
    }
);

console.log('Analysis result:', result);
```

### 3. Agent Integration

```javascript
// Execute plugin as part of agent workflow
const agentResult = await pluginSystem.execute_agent_plugin(
    'security_scanner',
    {
        project_path: './src',
        target_files: ['**/*.js', '**/*.ts'],
        config: { recursive: true },
        metadata: {},
        dry_run: false,
        verbose: true
    }
);

console.log('Security scan:', agentResult);
```

## Plugin Development

### Creating a Rust Plugin

```rust
use phantom_ml_core::plugins::*;

pub struct MyCustomPlugin {
    base: BasePlugin,
}

impl MyCustomPlugin {
    pub fn new(metadata: PluginMetadata) -> Self {
        Self {
            base: BasePlugin::new(metadata),
        }
    }
}

impl_plugin_base!(MyCustomPlugin);

#[async_trait]
impl Plugin for MyCustomPlugin {
    async fn execute(&self, input: PluginExecutionInput) -> PluginResult<PluginExecutionResult> {
        // Plugin implementation
        let result = serde_json::json!({
            "message": "Hello from custom plugin!",
            "input_received": input.data
        });

        Ok(PluginExecutionResult {
            plugin_id: self.base.metadata.id.clone(),
            execution_id: input.context.execution_id,
            success: true,
            result: Some(result),
            error: None,
            warnings: Vec::new(),
            logs: Vec::new(),
            execution_time_ms: 10,
            memory_used_bytes: 1024,
            cpu_time_ms: 5,
            created_files: Vec::new(),
            network_requests: 0,
            metadata: HashMap::new(),
        })
    }

    fn capabilities(&self) -> Vec<PluginCapability> {
        vec![
            PluginCapability::DataProcessing {
                input_formats: vec!["json".to_string()],
                output_formats: vec!["json".to_string()],
            }
        ]
    }
}
```

### Plugin Manifest (plugin.toml)

```toml
[plugin]
id = "my_custom_plugin"
name = "My Custom Plugin"
version = "1.0.0"
type = "native"
author = "Your Name"
description = "A custom plugin for data processing"
entry_point = "main"

[dependencies]
serde = "^1.0.0"

[permissions]
permissions = ["fs_read:./data", "fs_write:./output"]

[resource_limits]
max_memory_mb = 100
max_cpu_time_ms = 30000
max_execution_time_ms = 10000

[[tags]]
tags = ["data-processing", "custom"]

[configuration]
type = "object"
properties = {
    enabled = { type = "boolean", default = true },
    batch_size = { type = "number", default = 100 }
}
required = ["enabled"]
```

## Built-in Example Plugins

### 1. Log Analyzer Plugin
Analyzes log files for errors, warnings, and performance metrics.

```javascript
const logAnalysis = await pluginSystem.execute_plugin(
    'log_analyzer',
    'analyze_directory',
    {
        directory_path: './logs',
        recursive: true
    }
);
```

### 2. Security Scanner Plugin
Scans code for security vulnerabilities and generates reports.

```javascript
const securityScan = await pluginSystem.execute_plugin(
    'security_scanner',
    'scan_directory',
    {
        directory_path: './src',
        recursive: true
    }
);
```

### 3. Data Processor Plugin
Processes structured data with transformations, filters, and analytics.

```javascript
const processedData = await pluginSystem.execute_plugin(
    'data_processor',
    'process_pipeline',
    {
        data: userData,
        pipeline: [
            {
                operation_type: "Filter",
                operation_name: "range",
                parameters: { field: "age", min: 18, max: 65 }
            },
            {
                operation_type: "Transform",
                operation_name: "normalize",
                parameters: { field: "score" }
            },
            {
                operation_type: "Analyze",
                operation_name: "statistics",
                parameters: { field: "score" }
            }
        ]
    }
);
```

## Configuration Management

### Environment-Specific Configuration

```javascript
// Update plugin configuration
await pluginSystem.update_plugin_config('my_plugin', {
    enabled: true,
    log_level: 'debug',
    batch_size: 50
});

// Create configuration for different environments
const config = create_sample_plugin_config('my_plugin');
config.environments.production = {
    debug: false,
    batch_size: 1000
};
```

## Security Features

### Permission System
Plugins must declare required permissions:

- `fs_read:path` - File system read access
- `fs_write:path` - File system write access
- `network:hosts` - Network access to specific hosts
- `env:variables` - Environment variable access
- `process` - Process execution permission

### WebAssembly Sandboxing
WASM plugins run in isolated environments with:
- Memory limits
- CPU time limits
- File system restrictions
- Network access controls

### Security Scanning
Built-in security scanning detects:
- Hardcoded secrets
- SQL injection patterns
- XSS vulnerabilities
- Path traversal attempts
- Command injection risks

## Monitoring & Observability

### Real-time Metrics

```javascript
const metrics = await pluginSystem.get_metrics();
console.log('System metrics:', metrics);

// Get plugin health
const health = await pluginSystem.get_plugin_health('my_plugin');
console.log('Plugin health:', health);
```

### Plugin Health Monitoring
- Execution success rates
- Average execution times
- Memory usage tracking
- Error rate monitoring
- Uptime statistics

## Marketplace Integration

### Search and Install Plugins

```javascript
// Search marketplace
const searchResults = await pluginSystem.search_marketplace(
    'data processing',
    { limit: 10 }
);

// Install plugin
const installation = await pluginSystem.install_plugin(
    'advanced_analytics',
    '2.1.0',
    './plugins'
);
```

## API Reference

### Core Classes

#### PluginSystemApi
Main interface for plugin system operations.

**Methods:**
- `initialize(config_directory?, environment?)` - Initialize the system
- `list_plugins()` - Get all available plugins
- `execute_plugin(id, operation, input)` - Execute plugin operation
- `get_plugin_info(id)` - Get plugin metadata
- `get_plugin_health(id)` - Get plugin health status
- `update_plugin_config(id, updates)` - Update plugin configuration
- `search_marketplace(query, limit?)` - Search plugin marketplace
- `install_plugin(id, version?, target)` - Install plugin from marketplace
- `send_plugin_message(sender, recipient, type, payload)` - Inter-plugin messaging
- `shutdown()` - Shutdown the plugin system

### Plugin Development Traits

#### Plugin (Core Trait)
All plugins must implement this trait.

**Required Methods:**
- `metadata()` - Get plugin metadata
- `initialize(context)` - Initialize plugin
- `execute(input)` - Execute plugin operation
- `shutdown()` - Cleanup resources
- `validate_config(config)` - Validate configuration
- `health()` - Get health status

#### AgentPlugin (Optional)
For agent system integration.

**Methods:**
- `execute_agent(context)` - Execute as agent
- `agent_compatibility()` - Get compatible agent types

## Performance Considerations

### Memory Management
- Plugins run in separate memory spaces
- Automatic cleanup on plugin unload
- Memory usage monitoring and limits

### CPU Usage
- Configurable CPU time limits
- Priority-based execution queuing
- Resource monitoring and throttling

### I/O Operations
- File handle limits
- Network connection pooling
- Async I/O for non-blocking operations

## Best Practices

### Plugin Development
1. **Error Handling**: Always use comprehensive error handling
2. **Resource Cleanup**: Implement proper cleanup in shutdown()
3. **Configuration Validation**: Validate all configuration parameters
4. **Security**: Request minimal required permissions
5. **Testing**: Include unit tests and integration tests
6. **Documentation**: Provide clear documentation and examples

### System Administration
1. **Monitoring**: Set up health monitoring and alerting
2. **Security**: Regularly update plugins and review permissions
3. **Performance**: Monitor resource usage and optimize
4. **Backup**: Backup plugin configurations and data
5. **Updates**: Keep plugins and system updated

## Troubleshooting

### Common Issues

**Plugin Not Loading**
- Check plugin manifest syntax
- Verify dependencies are available
- Check file permissions
- Review security permissions

**Performance Issues**
- Monitor resource usage
- Check for memory leaks
- Optimize plugin code
- Adjust resource limits

**Security Violations**
- Review permission requirements
- Check for policy violations
- Verify plugin signatures
- Monitor security audit logs

### Debug Mode

```javascript
// Enable debug logging
const pluginSystem = await create_plugin_system('./plugins', 'development');
await pluginSystem.update_plugin_config('my_plugin', {
    log_level: 'debug',
    verbose: true
});
```

## Contributing

We welcome contributions to the plugin system! Please see our contributing guidelines and submit pull requests for:

- New built-in plugins
- Performance improvements
- Security enhancements
- Documentation updates
- Bug fixes

## License

MIT License - see LICENSE file for details.