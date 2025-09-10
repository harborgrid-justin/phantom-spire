# Workspace Setup Guide for Phantom-*-Core Packages

## Complete Workspace Duplication Process

This guide provides step-by-step instructions to create new workspaces for testing phantom-*-core packages, based on the successful workspace-3 and workspace-4 implementations.

## Prerequisites

### System Requirements
- Windows 10/11
- Node.js v22.19.0 or later
- Rust toolchain (latest stable)
- PowerShell 5.1 or PowerShell Core
- Git

### Development Tools
- Visual Studio Code (recommended)
- Windows Build Tools (`npm install -g windows-build-tools`)
- Node-gyp (`npm install -g node-gyp`)

## Part 1: Environment Setup (One-time)

### 1.1 Install Node.js Development Headers

```powershell
# Install node-gyp globally
npm install node-gyp -g

# Download and install Node.js development headers
node-gyp install
```

### 1.2 Fix Windows NAPI Build Environment

```powershell
# Set environment variables for current session
$env:PATH = "C:\Users\$env:USERNAME\AppData\Local\node-gyp\Cache\22.19.0\x64;$env:PATH"
$env:NODE_LIB_FILE = "C:\Users\$env:USERNAME\AppData\Local\node-gyp\Cache\22.19.0\x64\node.lib"
$env:LIB = "C:\Users\$env:USERNAME\AppData\Local\node-gyp\Cache\22.19.0\x64;$env:LIB"

# Fix libnode.dll issue (copy node.lib as libnode.dll)
$nodeLibPath = "C:\Users\$env:USERNAME\AppData\Local\node-gyp\Cache\22.19.0\x64"
if (-not (Test-Path "$nodeLibPath\libnode.dll")) {
    Copy-Item "$nodeLibPath\node.lib" "$nodeLibPath\libnode.dll"
}
```

### 1.3 Persist Environment Variables (Optional but Recommended)

```powershell
# Add to system PATH permanently
[Environment]::SetEnvironmentVariable("PATH", $env:PATH, "User")

# Set Node library environment variables
[Environment]::SetEnvironmentVariable("NODE_LIB_FILE", $env:NODE_LIB_FILE, "User")
[Environment]::SetEnvironmentVariable("LIB", $env:LIB, "User")
```

## Part 2: Create New Phantom-*-Core Package

### 2.1 Directory Structure

```text
C:\phantom-spire\packages\phantom-{name}-core\
├── Cargo.toml
├── build.rs
├── package.json
├── src\
│   └── lib.rs
├── .cargo\
│   └── config.toml
└── README.md
```

### 2.2 Cargo.toml Template

```toml
[package]
name = "phantom-{name}-core"
version = "1.0.0"
edition = "2021"

[lib]
crate-type = ["cdylib"]

[dependencies]
napi = { version = "2.16", default-features = false, features = ["napi8"] }
napi-derive = "2.16"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
uuid = { version = "1.10", features = ["v4"] }
semver = "1.0"

[build-dependencies]
napi-build = "2.2"
```

### 2.3 Package.json Template

```json
{
  "name": "phantom-{name}-core",
  "version": "1.0.0",
  "description": "Native core module for {name} functionality",
  "main": "index.js",
  "scripts": {
    "build": "napi build --platform --release",
    "build:debug": "napi build --platform",
    "prepare": "napi build --platform --release"
  },
  "napi": {
    "name": "phantom-{name}-core",
    "targets": ["x86_64-pc-windows-msvc"]
  },
  "devDependencies": {
    "@napi-rs/cli": "^2.18.0"
  }
}
```

### 2.4 Build Configuration (.cargo/config.toml)

```toml
[build]
target = "x86_64-pc-windows-msvc"

[target.x86_64-pc-windows-msvc]
linker = "link.exe"
rustflags = [
  "-L", "C:\\Users\\{USERNAME}\\AppData\\Local\\node-gyp\\Cache\\22.19.0\\x64",
]
```

### 2.5 Build Script (build.rs)

```rust
extern crate napi_build;

fn main() {
  napi_build::setup();
}
```

## Part 3: Create New Workspace

### 3.1 Workspace Directory Structure

```text
C:\phantom-spire\sandbox\packages\workspace-{number}\
├── package.json
├── index.js
├── db.js
├── FIX.md
├── phantom-{name}-core\
│   └── index.js
└── {database_name}.db (created at runtime)
```

### 3.2 Workspace Package.json Template

```json
{
  "name": "workspace-{number}",
  "version": "1.0.0",
  "description": "Testing workspace for phantom-{name}-core",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "sqlite3": "^5.1.6",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

### 3.3 Database Setup (db.js) Template

```javascript
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '{database_name}.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  // Add your table creation statements here
  // Example:
  db.run(`CREATE TABLE IF NOT EXISTS main_entities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_id TEXT UNIQUE NOT NULL,
    data TEXT NOT NULL,
    result TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Add more tables as needed for your specific use case
});

module.exports = db;
```

### 3.4 Express Server Template (index.js)

```javascript
const express = require('express');
const cors = require('cors');
const db = require('./db');

// Import phantom-*-core with fallback
let phantomCore;
try {
  phantomCore = require('./phantom-{name}-core');
  console.log('✅ Native phantom-{name}-core module loaded successfully');
} catch (error) {
  console.log('⚠️ Failed to load native module, using fallback:', error.message);
  phantomCore = require('./phantom-{name}-core/index.js');
}

const app = express();
const PORT = 300{X}; // Use unique port for each workspace

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    workspace: 'workspace-{number}',
    module: 'phantom-{name}-core'
  });
});

// Add your specific CRUD endpoints here
// Example pattern:
// app.post('/api/{entities}/process', async (req, res) => { ... });
// app.get('/api/{entities}', (req, res) => { ... });
// app.get('/api/{entities}/:id', (req, res) => { ... });
// app.put('/api/{entities}/:id', async (req, res) => { ... });
// app.delete('/api/{entities}/:id', (req, res) => { ... });

app.listen(PORT, () => {
  console.log(`🚀 Workspace-{number} server running on http://localhost:${PORT}`);
  console.log(`📊 Database: {database_name}.db`);
  console.log(`🔧 Module: phantom-{name}-core`);
});
```

### 3.5 Native Module Wrapper Template (phantom-{name}-core/index.js)

```javascript
let nativeModule = null;

try {
  // Try to load the native module
  nativeModule = require('./phantom-{name}-core.win32-x64-msvc.node');
  console.log('✅ Native phantom-{name}-core module loaded');
} catch (error) {
  console.log('⚠️ Native module not available, using mock implementation:', error.message);
}

// Mock implementations for fallback
const mockImplementations = {
  // Add your mock functions here
  processEntity: (data) => {
    return {
      id: data.id || `MOCK-${Date.now()}`,
      analysis: 'Mock analysis result',
      score: Math.random() * 10,
      timestamp: new Date().toISOString()
    };
  }
  // Add more mock functions as needed
};

// Export either native or mock implementations
module.exports = nativeModule || mockImplementations;
```

## Part 4: Build and Deploy Process

### 4.1 Build Native Module

```powershell
# Navigate to phantom-*-core package
cd C:\phantom-spire\packages\phantom-{name}-core

# Build the native module
npm run build

# Copy built module to workspace
copy target\release\phantom_{name}_core.dll phantom-{name}-core.win32-x64-msvc.node
copy phantom-{name}-core.win32-x64-msvc.node C:\phantom-spire\sandbox\packages\workspace-{number}\phantom-{name}-core\
```

### 4.2 Setup and Start Workspace

```powershell
# Navigate to workspace
cd C:\phantom-spire\sandbox\packages\workspace-{number}

# Install dependencies
npm install

# Start the server
npm start
```

## Part 5: Testing Framework

### 5.1 Basic Health Check

```powershell
Invoke-RestMethod -Uri "http://localhost:300{X}/api/health" -Method GET
```

### 5.2 CRUD Testing Template

```powershell
# CREATE test
$createData = @{
  # Add your test data here
} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:300{X}/api/{entities}/process" -Method POST -Headers @{"Content-Type"="application/json"} -Body $createData

# READ test
Invoke-RestMethod -Uri "http://localhost:300{X}/api/{entities}" -Method GET

# UPDATE test
$updateData = @{
  # Add your update data here
} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:300{X}/api/{entities}/{id}" -Method PUT -Headers @{"Content-Type"="application/json"} -Body $updateData

# DELETE test
Invoke-RestMethod -Uri "http://localhost:300{X}/api/{entities}/{id}" -Method DELETE
```

## Part 6: Documentation Template

Create a FIX.md file in each workspace documenting:

1. **Problem Description** - What was being built
2. **Root Cause** - Any issues encountered
3. **Solution Steps** - How they were resolved
4. **Files Created/Modified** - What was changed
5. **API Endpoints Available** - Complete endpoint list
6. **Testing Results** - CRUD operation verification
7. **Troubleshooting** - Common issues and solutions

## Workspace Index

| Workspace | Port | Core Module | Purpose |
|-----------|------|-------------|---------|
| workspace-3 | 3000 | phantom-attribution-core | Threat attribution and actor profiling |
| workspace-4 | 3001 | phantom-cve-core | CVE analysis and vulnerability management |
| workspace-5 | 3002 | phantom-{name}-core | {Your new functionality} |

## Quick Start Checklist

For creating a new workspace:

- [ ] Set up Windows build environment (Part 1)
- [ ] Create phantom-*-core package structure (Part 2)
- [ ] Implement Rust core functionality
- [ ] Create workspace directory structure (Part 3)
- [ ] Copy and customize templates
- [ ] Build native module (Part 4.1)
- [ ] Setup workspace dependencies (Part 4.2)
- [ ] Test all CRUD operations (Part 5)
- [ ] Document in FIX.md (Part 6)
- [ ] Update workspace index

## Troubleshooting Common Issues

### Build Errors
- Ensure libnode.dll exists in node-gyp cache
- Verify environment variables are set
- Check Rust toolchain installation

### Runtime Errors
- Verify native module path is correct
- Check database permissions
- Ensure port is not in use

### Module Loading Issues
- Confirm .node file exists and is accessible
- Check file permissions
- Verify module exports match expectations

This template provides a complete foundation for rapidly creating and testing new phantom-*-core packages with full CRUD functionality.
