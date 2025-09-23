# @phantom-core/ml-core

Enterprise machine learning services for threat detection and security analytics - Part of the Phantom Spire CTI Platform.

## Overview

This is a Node.js module that provides Rust-powered machine learning capabilities through NAPI-RS v3.x. The module includes both the native `.node` binary and JavaScript/TypeScript bindings for easy integration.

## Installation

### Local Installation

You can install this module locally from the current directory:

```bash
npm install
npm run build
```

### As a Dependency

Add to your `package.json`:

```json
{
  "dependencies": {
    "@phantom-core/ml-core": "file:./path/to/this/directory"
  }
}
```

Or install directly:

```bash
npm install ./path/to/this/directory
```

## Usage

### JavaScript/CommonJS

```javascript
const phantomML = require('@phantom-core/ml-core');

// Test basic functionality
console.log(phantomML.testNapi());

// Get system information
console.log(phantomML.getSystemInfo());

// Get version
console.log(phantomML.getVersion());

// Create ML Core instance
const core = new phantomML.PhantomMLCore();
console.log('Version:', core.getVersion());

// Initialize the core
core.initialize();
console.log('Initialized:', core.isInitialized());

// Train a simple model
const config = {
  model_type: 'linear_regression',
  parameters: '{"learning_rate": 0.01}'
};
const trainingResult = phantomML.trainSimpleModel(config);
console.log('Training result:', trainingResult);

// Make predictions
phantomML.predictSimple('model_001', [1.0, 2.0, 3.0])
  .then(result => console.log('Prediction:', result))
  .catch(err => console.error('Prediction error:', err));
```

### TypeScript/ESM

```typescript
import {
  PhantomMLCore,
  testNapi,
  getSystemInfo,
  getVersion,
  trainSimpleModel,
  predictSimple,
  SimpleMLConfig
} from '@phantom-core/ml-core';

// Test basic functionality
console.log(testNapi());

// Get system information
console.log(getSystemInfo());

// Create ML Core instance
const core = new PhantomMLCore();
console.log('Version:', core.getVersion());

// Train a model with proper typing
const config: SimpleMLConfig = {
  model_type: 'random_forest',
  parameters: JSON.stringify({
    n_estimators: 100,
    max_depth: 10
  })
};

const result = trainSimpleModel(config);
console.log('Training result:', result);

// Async prediction
const prediction = await predictSimple('model_001', [1.5, 2.5, 3.5]);
console.log('Prediction:', prediction);
```

## API Reference

### Classes

#### `PhantomMLCore`

Main class for machine learning operations.

```typescript
class PhantomMLCore {
  constructor();
  getVersion(): string;
  initialize(): boolean;
  isInitialized(): boolean;
}
```

### Functions

#### `testNapi(): string`

Tests that the NAPI binding is working correctly.

#### `getVersion(): string`

Returns version information as JSON string.

#### `getSystemInfo(): string`

Returns system information including platform, architecture, and version.

#### `trainSimpleModel(config: SimpleMLConfig): string`

Trains a simple model with the given configuration.

#### `predictSimple(modelId: string, features: number[]): Promise<string>`

Makes predictions using a trained model (async function).

### Interfaces

```typescript
interface SimpleMLConfig {
  model_type: string;
  parameters: string; // JSON string
}

interface FeatureConfig {
  normalize: boolean;
  scale: boolean;
  handleMissing: string;
  categoricalEncoding: string;
}

interface TrainingConfig {
  epochs: number;
  batchSize: number;
  validationSplit: number;
  crossValidation: boolean;
  crossValidationFolds: number;
}
```

## Development

### Building

```bash
# Build in development mode
npm run build:dev

# Build in release mode
npm run build

# Build for debugging
npm run build:debug
```

### Testing

```bash
# Run JavaScript tests
npm test

# Run native Rust tests
npm run test:native

# Run development server
npm run dev
```

### Formatting

```bash
# Format all code
npm run format

# Format specific languages
npm run format:rs      # Rust
npm run format:prettier # JS/TS
npm run format:toml    # TOML files
```

## File Structure

```
.
├── package.json          # Node.js package configuration
├── index.js              # Main JavaScript entry point
├── index.d.ts            # TypeScript definitions
├── phantom_ml_core.node  # Native binary (generated)
├── src/                  # Rust source code
│   ├── lib.rs           # Main library
│   └── napi_simple.rs   # NAPI bindings
├── Cargo.toml           # Rust package configuration
└── README.md            # This file
```

## Platform Support

This module supports the following platforms:

- **Windows**: x64, ia32, arm64
- **macOS**: x64, arm64 (Apple Silicon)
- **Linux**: x64, arm64, arm (GNU and musl)
- **FreeBSD**: x64, arm64
- **Android**: arm64, arm
- **OpenHarmony**: x64, arm64, arm

## Enterprise Features

- Advanced memory-aligned SIMD operations
- Enterprise-grade rate limiting and security
- Comprehensive input validation and sanitization
- Multi-database support for federated queries
- HuggingFace integration for modern ML workflows

## Troubleshooting

### Module Loading Issues

If you encounter segmentation faults or loading issues:

1. **Rebuild the module**: `npm run build`
2. **Check Node.js version**: Requires Node.js 8.9.0+
3. **Platform compatibility**: Ensure your platform is supported
4. **Clean rebuild**: `npm run clean && npm run build`

### Common Issues

- **Missing .node file**: Run `npm run build` to generate it
- **Version mismatch**: Ensure all dependencies are compatible
- **Platform-specific binaries**: The correct .node file will be loaded automatically

## License

MIT License - see LICENSE file for details.

## Contributing

This module is part of the Phantom Spire CTI Platform. For issues and contributions, please refer to the main repository.

---

**Note**: This module contains native code and requires Node.js 8.9.0 or later. The `.node` file is platform-specific and will be automatically selected based on your system.
