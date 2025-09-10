#!/bin/bash

# Standardization script for phantom-*-core packages

# Plugin configurations: name, description, extra_keywords
declare -A PLUGINS=(
    ["phantom-incident-response-core"]="Advanced incident response management system with comprehensive forensic analysis, response automation, and recovery coordination capabilities|incident-response,forensics,security-automation,incident-management"
    ["phantom-intel-core"]="Advanced threat intelligence core with comprehensive intelligence gathering, analysis, and correlation engine|threat-intelligence,indicators,threat-actors,campaigns,intelligence-feeds"
    ["phantom-ioc-core"]="Advanced IOC processing core with threat intelligence and indicator correlation|ioc,indicators,threat-intelligence"
    ["phantom-mitre-core"]="Advanced MITRE ATT&CK framework integration and threat analysis system with comprehensive technique mapping|mitre-attack,attack-framework,technique-mapping,threat-analysis"
    ["phantom-secop-core"]="Advanced Security Operations (SecOps) engine for comprehensive incident response, automation, and security orchestration|secops,incident-response,security-automation,security-orchestration"
    ["phantom-threat-actor-core"]="Advanced threat actor intelligence and analysis system with comprehensive attribution capabilities|threat-actor,attribution,apt,behavioral-analysis,campaign-tracking"
    ["phantom-xdr-core"]="Advanced XDR (Extended Detection and Response) core with threat detection, behavioral analytics, and automated response capabilities|xdr,threat-detection,behavioral-analytics,automated-response"
)

cd "$(dirname "$0")"

for plugin in "${!PLUGINS[@]}"; do
    echo "Standardizing $plugin..."
    
    IFS='|' read -r description extra_keywords <<< "${PLUGINS[$plugin]}"
    
    # Create standardized package.json
    cat > "$plugin/package.json" << EOF
{
  "name": "$plugin",
  "version": "1.0.0",
  "description": "$description",
  "main": "index.js",
  "types": "index.d.ts",
  "homepage": "https://github.com/harborgrid-justin/phantom-spire#readme",
  "repository": {
    "type": "git",
    "url": "https://github.com/harborgrid-justin/phantom-spire.git",
    "directory": "packages/$plugin"
  },
  "bugs": {
    "url": "https://github.com/harborgrid-justin/phantom-spire/issues"
  },
  "napi": {
    "name": "$plugin",
    "triples": {
      "additional": [
        "aarch64-apple-darwin",
        "aarch64-unknown-linux-gnu",
        "aarch64-pc-windows-msvc",
        "x86_64-unknown-linux-musl"
      ]
    }
  },
  "files": [
    "index.js",
    "index.d.ts",
    "*.node",
    "README.md",
    "LICENSE",
    "CHANGELOG.md"
  ],
  "scripts": {
    "artifacts": "napi artifacts",
    "build": "napi build --platform --release",
    "build:debug": "napi build --platform",
    "clean": "rimraf dist",
    "prepublishOnly": "napi prepublish -t npm",
    "test": "cargo test",
    "universal": "napi universal",
    "version": "napi version",
    "lint": "cargo clippy",
    "fmt": "cargo fmt"
  },
  "keywords": [
$(IFS=','; for keyword in $extra_keywords; do echo "    \"$keyword\","; done)
    "cybersecurity",
    "phantom-spire",
    "napi",
    "rust",
    "security"
  ],
  "author": "Phantom Spire Security Team",
  "license": "MIT",
  "engines": {
    "node": ">=16.0.0",
    "npm": ">=8.0.0"
  },
  "devDependencies": {
    "@napi-rs/cli": "^2.18.0",
    "rimraf": "^5.0.0"
  },
  "publishConfig": {
    "access": "public"
  }
}
EOF

    # Create/update README.md
    if [ ! -f "$plugin/README.md" ]; then
        cat > "$plugin/README.md" << EOF
# $plugin

$description

## Installation

\`\`\`bash
npm install $plugin
\`\`\`

## Usage

\`\`\`javascript
const $plugin = require('$plugin');

// Use the package functionality
\`\`\`

## Features

- High-performance native Rust implementation
- Cross-platform support (Windows, macOS, Linux)
- TypeScript definitions included
- Enterprise-ready architecture

## Building from Source

\`\`\`bash
# Clone the repository
git clone https://github.com/harborgrid-justin/phantom-spire.git
cd phantom-spire/packages/$plugin

# Install dependencies
npm install

# Build the native addon
npm run build

# Run tests
npm test
\`\`\`

## API Documentation

See the TypeScript definitions in \`index.d.ts\` for the complete API.

## License

MIT License. See LICENSE file for details.

## Contributing

See the main repository's contributing guidelines.
EOF
    fi

    # Create LICENSE if it doesn't exist
    if [ ! -f "$plugin/LICENSE" ]; then
        cat > "$plugin/LICENSE" << EOF
MIT License

Copyright (c) 2024 Phantom Spire Security Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
EOF
    fi

    # Create CHANGELOG.md if it doesn't exist
    if [ ! -f "$plugin/CHANGELOG.md" ]; then
        cat > "$plugin/CHANGELOG.md" << EOF
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-$(date +%m-%d)

### Added
- Initial release
- Native Rust implementation with NAPI bindings
- Cross-platform support
- TypeScript definitions
- Comprehensive API

### Security
- Memory-safe Rust implementation
- Input validation and sanitization
EOF
    fi

    echo "✓ Standardized $plugin"
done

echo "All packages standardized successfully!"