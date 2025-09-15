# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**phantom-ml-core** is a high-performance NAPI-RS package providing enterprise machine learning services for threat detection and security analytics. It's part of the larger Phantom Spire CTI Platform that competes with Palantir Foundry and other enterprise security platforms.

## Commands

### Build Commands
```bash
# Build native Rust module with NAPI bindings
npm run build
npm run build:debug      # Debug build with features
npm run build:enterprise # Enterprise features build
npm run build:full       # Full feature set

# Clean build artifacts
npm run clean
```

### Testing Commands
```bash
# Run Rust tests with enterprise features
npm run test
npm run test:native      # Native Rust tests
cargo test --features enterprise --all-features

# Linting and formatting
npm run lint            # Cargo clippy
npm run fmt             # Cargo format
```

### Development Commands
```bash
# NAPI-RS specific commands
npm run artifacts       # Generate NAPI artifacts
npm run universal       # Create universal binaries
npm run prepublishOnly  # Prepare for publishing
```

## Architecture

### High-Level Structure

This is a **hybrid Rust/Node.js project** using NAPI-RS to expose high-performance Rust ML capabilities to JavaScript/TypeScript:

- **`src/`**: Rust source code with ML implementations
- **`src-ts/`**: TypeScript definitions and Node.js wrappers
- **`index.js`** & **`ml-core.js`**: Generated NAPI bindings
- **`index.d.ts`** & **`ml-core.d.ts`**: TypeScript definitions

### Core Architecture Components

1. **NAPI Bindings Layer** (`src/napi_bindings.rs`): Exposes Rust functions to Node.js
2. **Core ML Engine** (`src/core.rs`): Main PhantomMLCore struct with ML operations
3. **Database Integration** (`src/database/`): Multi-database support (PostgreSQL, MongoDB, Redis, Elasticsearch)
4. **ML Operations Modules**:
   - `src/training.rs`: Model training operations
   - `src/inference.rs`: Prediction and inference
   - `src/analytics.rs`: ML analytics and insights
   - `src/management.rs`: Model lifecycle management
   - `src/automl.rs`: Automated ML operations
   - `src/enterprise.rs`: Enterprise features and multi-tenancy

### Database Architecture

The package supports a **multi-database architecture** for optimal data storage:
- **PostgreSQL**: Structured model metadata, ACID-compliant operations
- **MongoDB**: Document-based ML experiments, flexible inference data
- **Redis**: High-performance caching, real-time data streams
- **Elasticsearch**: Full-text search, advanced analytics, model discovery

### Feature Flags

Extensive Cargo feature system for flexible deployments:
```toml
default = ["local"]
enterprise = ["all-databases", "messaging", "caching", "monitoring", "crypto"]
full = ["enterprise", "web-full", "diesel-orm", "compression", "advanced-config"]
napi = ["dep:napi", "dep:napi-derive"]
```

## Key Dependencies

### Rust Dependencies
- **NAPI-RS**: Node.js binding generation (`napi`, `napi-derive`)
- **ML Libraries**: `linfa`, `smartcore`, `ndarray` for machine learning
- **Database Clients**: `tokio-postgres`, `mongodb`, `redis`, `elasticsearch`
- **Async Runtime**: `tokio` with full features
- **Serialization**: `serde`, `serde_json` for data handling

### Build Dependencies
- **`napi-build`**: NAPI-RS build system
- **`build.rs`**: Custom build script for native compilation

## Development Workflow

### 1. Rust Development
```bash
# Check code with all features
cargo check --all-features

# Test with enterprise features (most comprehensive)
cargo test --features enterprise

# Build debug version
cargo build --features napi
```

### 2. NAPI Binding Generation
```bash
# Build native module (this generates index.js and index.d.ts)
napi build --platform --release --features napi

# For development with debug symbols
napi build --platform --features napi
```

### 3. Integration Testing
```bash
# Test Node.js integration
npm test

# Verify NAPI module loads correctly
node -e "const { PhantomMLCore } = require('./'); console.log('✅ Module loaded');"
```

## Enterprise Features

### Multi-Database Configuration
The package can be initialized with multiple database backends:
```javascript
const config = {
  postgresql_uri: 'postgresql://user:pass@localhost:5432/phantom_ml',
  mongodb_uri: 'mongodb://localhost:27017/phantom_ml',
  redis_url: 'redis://localhost:6379',
  elasticsearch_url: 'http://localhost:9200'
};
await mlCore.initialize_databases(JSON.stringify(config));
```

### Performance Characteristics
- **Single Inference**: ~1-5ms average latency
- **Batch Processing**: 1000+ predictions/second
- **Feature Engineering**: 500+ transformations/second
- **Concurrent Models**: Up to 100 active models

## Common Issues and Solutions

### Native Build Failures
- Ensure Rust toolchain is installed: `rustup default stable`
- Windows requires MSVC build tools
- Check that `napi-build` dependencies are available

### Database Connection Issues
- Start databases before testing: `docker-compose up -d postgres mongo redis elasticsearch`
- Check database URIs in configuration
- Verify network connectivity and authentication

### Memory Issues
- Node.js may need increased memory: `--max-old-space-size=8192`
- Rust debug builds use more memory than release builds
- Monitor memory usage with performance stats endpoint

### NAPI Module Loading
- Rebuild native module after Rust changes: `npm run build`
- Clear Node.js module cache if needed
- Check that the correct binary is being loaded for your platform

## Integration with Main Platform

This package is designed to work both **independently** and as part of the larger Phantom Spire platform:

- **Standalone**: Can be installed and used independently (`npm install @phantom-spire/ml-core`)
- **Platform Integration**: Leverages unified data layer for cross-plugin ML operations
- **Enterprise Features**: Integrates with workflow orchestration and service mesh when available

## Performance Monitoring

The package includes comprehensive performance monitoring:
```javascript
// Get performance statistics
const stats = await mlCore.get_performance_stats();
const metrics = JSON.parse(stats);
console.log("Inference latency:", metrics.average_inference_time_ms);
```

## Security Considerations

- All input data is validated and sanitized
- Model weights are stored securely in memory
- No sensitive data is logged by default
- Resource limits prevent DoS attacks
- Database connections use TLS/SSL encryption

## NAPI-RS PhD-Level Best Practices

This repository now implements PhD-level NAPI-RS best practices:

### Advanced Features Implemented
- **Structured Error Handling**: Type-safe error conversion with detailed context
- **Performance Monitoring**: Comprehensive metrics collection and reporting
- **Memory Optimization**: Thread-safe core instances, memory pools, and SIMD operations
- **Multi-Target Support**: Optimized builds for Windows, macOS (Intel/ARM), and Linux
- **Advanced Testing**: Performance regression detection and memory leak testing

### Key Performance Optimizations
- **SIMD Operations**: AVX2-optimized vector operations for ML computations
- **Memory Pools**: Reduced allocations through object reuse
- **Thread-Local Storage**: Efficient buffer management
- **Link-Time Optimization**: Smaller, faster binaries with LTO and dead code elimination

### Build System Enhancements
- **Cross-Platform Optimization**: Platform-specific compiler flags and optimizations
- **Advanced Cargo Configuration**: Profile-based optimization with target-specific settings
- **Comprehensive Testing**: Integration tests with performance monitoring and memory validation

### Development Tools
- **Rust Toolchain**: Pinned stable toolchain with all necessary components
- **Vitest Configuration**: Advanced testing with coverage thresholds and performance monitoring
- **CI/CD Integration**: Multi-platform builds with caching and artifact management

See `docs/NAPI_BEST_PRACTICES.md` for comprehensive implementation details.