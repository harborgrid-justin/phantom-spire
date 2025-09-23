# Installation Guide for phantom-attribution-core

## Prerequisites

- Node.js >= 16.0.0
- npm >= 8.0.0
- Rust toolchain (for building from source)

## Installation

### From npm (when published)

```bash
npm install phantom-attribution-core
```

### From source

1. Clone the repository:
```bash
git clone https://github.com/harborgrid-justin/phantom-spire.git
cd phantom-spire/packages/phantom-attribution-core
```

2. Install dependencies:
```bash
npm install
```

3. Build the native module:
```bash
npm run build
```

## Usage

### Basic Usage

```javascript
const { AttributionCoreNapi } = require('phantom-attribution-core');

// Create a new instance
const attributionCore = new AttributionCoreNapi();

// Check health status
const healthStatus = attributionCore.get_health_status();
console.log(JSON.parse(healthStatus));

// Analyze threat indicators
const indicators = ['192.168.1.100', 'malware.exe', 'suspicious-domain.com'];
const result = attributionCore.analyze_attribution(indicators);
console.log(JSON.parse(result));
```

### ES Modules

```javascript
import AttributionCoreNapi from 'phantom-attribution-core';

const core = new AttributionCoreNapi();
```

### TypeScript

```typescript
import { AttributionCoreNapi } from 'phantom-attribution-core';

const core = new AttributionCoreNapi();
const result: string = core.analyze_attribution(['indicator1', 'indicator2']);
```

## Available Scripts

- `npm run build` - Build the native module in release mode
- `npm run build:debug` - Build the native module in debug mode
- `npm run build:enterprise` - Build with enterprise features
- `npm run test` - Run Rust tests
- `npm run test:node` - Test Node.js package loading
- `npm run clean` - Clean build artifacts
- `npm run lint` - Lint Rust code
- `npm run fmt` - Format Rust code

## Example

Run the included example:

```bash
node example.js
```

Or use the installed binary:

```bash
npx phantom-attribution-example
```

## Troubleshooting

### Build Issues

If you encounter build issues:

1. Ensure you have the Rust toolchain installed
2. Install napi-rs CLI: `npm install -g @napi-rs/cli`
3. Clean and rebuild: `npm run clean && npm run build`

### Platform Support

The package supports:
- Windows (x64, arm64)
- macOS (x64, arm64)
- Linux (x64, arm64, with glibc and musl)

### Mock Implementation

If the native module fails to load, the package will fall back to a mock implementation that provides the same API for development and testing purposes.