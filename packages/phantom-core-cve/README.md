# @phantom-core/cve

Advanced CVE processing core with vulnerability intelligence and threat analysis.

## Installation

```bash
npm install @phantom-core/cve
```

## Usage

```javascript
const { CveCoreNapi } = require('@phantom-core/cve');

// Create an instance
const cveCore = new CveCoreNapi();

// Use the CVE processing functionality
console.log('CVE Core initialized successfully');
```

## Features

- 🚀 **High Performance**: Native Rust implementation with N-API bindings
- 🛡️ **Advanced Threat Intelligence**: Comprehensive vulnerability analysis and correlation
- 🔍 **Intelligent Search**: Advanced CVE search with multiple criteria
- 📊 **Exploit Prediction**: Timeline analysis and exploit status assessment
- 🛠️ **Remediation Strategies**: Automated remediation planning and prioritization
- 🔄 **Batch Processing**: Efficient processing of multiple CVEs
- 📈 **Risk Assessment**: Multi-factor risk scoring and impact analysis
- 🌐 **Cross-Platform**: Supports Windows, macOS, and Linux
- 📦 **Independent**: Can be used as a standalone package

## API Documentation

### CveCoreNapi

The main class for CVE processing and analysis.

```javascript
const { CveCoreNapi } = require('@phantom-core/cve');
const cveCore = new CveCoreNapi();
```

See the TypeScript definitions in `index.d.ts` for the complete API reference.

## Building from Source

### Prerequisites
- Node.js 16+
- Rust 1.70+
- Windows: Visual Studio Build Tools (for N-API)

### Build Commands
```bash
# Clone the repository
git clone https://github.com/harborgrid-justin/phantom-core.git
cd phantom-core/packages/phantom-core-cve

# Install dependencies
npm install

# Build native addon (production)
npm run build

# Build debug version
npm run build:debug

# Run tests
npm test
```

## Configuration

### Environment Variables
- `DEBUG`: Enable debug logging
- `NAPI_FORCE_BUILD`: Force rebuild of native addon

## Performance

- **Native Performance**: 10-100x faster than pure JavaScript implementations
- **Memory Efficient**: Low memory footprint with Rust's ownership system
- **Concurrent Processing**: Efficient batch processing capabilities
- **Scalable**: Handles large CVE datasets without performance degradation

## Architecture

### Native Implementation (Production)
- **Rust Core**: High-performance vulnerability processing engine
- **N-API Bindings**: Direct native integration with Node.js
- **Advanced Algorithms**: Sophisticated threat intelligence correlation
- **Memory Safety**: Rust's memory safety guarantees

### Cross-Platform Support
The package includes pre-built binaries for:
- Linux x64
- macOS x64 and ARM64
- Windows x64

## License

MIT License. See [LICENSE](./LICENSE) file for details.

## Contributing

See the main repository's [contributing guidelines](https://github.com/harborgrid-justin/phantom-core/blob/main/CONTRIBUTING.md).

## Support

For issues and feature requests, please visit the [GitHub repository](https://github.com/harborgrid-justin/phantom-core/issues).

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history.