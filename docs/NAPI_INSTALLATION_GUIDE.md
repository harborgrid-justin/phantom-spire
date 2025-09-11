# NAPI-RS Modules Installation Guide

## 🎯 Overview

This guide provides step-by-step instructions for installing and setting up all 19 Phantom Spire NAPI-RS modules across different environments and platforms.

## 📋 Prerequisites

### System Requirements

#### Minimum Requirements
- **CPU**: x64 or ARM64 architecture
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space for all modules

#### Operating System Support
- **Linux**: Ubuntu 18.04+, CentOS 7+, Debian 10+, RHEL 7+
- **macOS**: 10.15+ (Catalina), supports both Intel and Apple Silicon
- **Windows**: Windows 10/11, Windows Server 2019+

### Software Dependencies

#### Required Dependencies
```bash
# Node.js (Required)
Node.js >= 16.0.0 (Recommended: 18+ LTS)
npm >= 8.0.0 or yarn >= 1.22.0

# For building from source (Optional)
Rust >= 1.70.0
```

#### Platform-Specific Requirements

##### Linux
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install build-essential curl

# CentOS/RHEL/Fedora
sudo yum install gcc gcc-c++ make curl
# OR for newer versions
sudo dnf install gcc gcc-c++ make curl
```

##### macOS
```bash
# Install Xcode Command Line Tools
xcode-select --install

# Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

##### Windows
```powershell
# Install Visual Studio Build Tools 2019 or later
# Download from: https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2019

# Or install via chocolatey
choco install visualstudio2019buildtools --package-parameters "--add Microsoft.VisualStudio.Workload.VCTools"
```

## 🚀 Installation Methods

### Method 1: NPM Package Installation (Recommended)

This is the fastest and easiest method using pre-built binaries.

#### Install All Modules
```bash
npm install phantom-attribution-core phantom-compliance-core phantom-crypto-core \
            phantom-cve-core phantom-feeds-core phantom-forensics-core \
            phantom-hunting-core phantom-incident-response-core phantom-intel-core \
            phantom-ioc-core phantom-malware-core phantom-mitre-core \
            phantom-reputation-core phantom-risk-core phantom-sandbox-core \
            phantom-secop-core phantom-threat-actor-core phantom-vulnerability-core \
            phantom-xdr-core
```

#### Install Core Security Bundle
```bash
# Essential security intelligence modules
npm install phantom-cve-core phantom-intel-core phantom-ioc-core phantom-xdr-core
```

#### Install by Category
```bash
# Vulnerability Management
npm install phantom-cve-core phantom-vulnerability-core phantom-risk-core

# Threat Intelligence
npm install phantom-intel-core phantom-attribution-core phantom-threat-actor-core

# Incident Response
npm install phantom-incident-response-core phantom-forensics-core phantom-malware-core

# Advanced Analysis
npm install phantom-mitre-core phantom-hunting-core phantom-sandbox-core

# Operations
npm install phantom-secop-core phantom-crypto-core phantom-feeds-core phantom-reputation-core
```

#### Install Individual Modules
```bash
# Example: Install CVE processing module
npm install phantom-cve-core

# Example: Install threat intelligence module
npm install phantom-intel-core
```

### Method 2: Yarn Installation
```bash
# Install all modules with Yarn
yarn add phantom-attribution-core phantom-compliance-core phantom-crypto-core \
         phantom-cve-core phantom-feeds-core phantom-forensics-core \
         phantom-hunting-core phantom-incident-response-core phantom-intel-core \
         phantom-ioc-core phantom-malware-core phantom-mitre-core \
         phantom-reputation-core phantom-risk-core phantom-sandbox-core \
         phantom-secop-core phantom-threat-actor-core phantom-vulnerability-core \
         phantom-xdr-core
```

### Method 3: Build from Source

This method compiles the modules from source, useful for development or custom builds.

#### Step 1: Install Rust
```bash
# Install Rust via rustup
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# Verify installation
rustc --version
cargo --version
```

#### Step 2: Clone Repository
```bash
git clone https://github.com/harborgrid-justin/phantom-spire.git
cd phantom-spire
```

#### Step 3: Build All Modules
```bash
# Install Node.js dependencies
npm install

# Build all native modules
npm run build

# Verify build
npm test
```

#### Step 4: Build Individual Module
```bash
# Navigate to specific module
cd packages/phantom-cve-core

# Install dependencies
npm install

# Build the module
npm run build

# Test the module
npm test
```

## 🔧 Installation Verification

### Quick Verification Script

Create a verification script to test all installed modules:

```javascript
// verify-installation.js
const modules = [
  'phantom-attribution-core',
  'phantom-compliance-core', 
  'phantom-crypto-core',
  'phantom-cve-core',
  'phantom-feeds-core',
  'phantom-forensics-core',
  'phantom-hunting-core',
  'phantom-incident-response-core',
  'phantom-intel-core',
  'phantom-ioc-core',
  'phantom-malware-core',
  'phantom-mitre-core',
  'phantom-reputation-core',
  'phantom-risk-core',
  'phantom-sandbox-core',
  'phantom-secop-core',
  'phantom-threat-actor-core',
  'phantom-vulnerability-core',
  'phantom-xdr-core'
];

async function verifyInstallation() {
  console.log('🔍 Verifying NAPI-RS Module Installation...\n');
  
  const results = {
    installed: [],
    missing: [],
    errors: []
  };

  for (const moduleName of modules) {
    try {
      const module = require(moduleName);
      console.log(`✅ ${moduleName}: Installed and loadable`);
      results.installed.push(moduleName);
      
      // Try to create instance if constructor is available
      const mainClass = Object.values(module)[0];
      if (typeof mainClass === 'function') {
        try {
          new mainClass();
          console.log(`   📦 Constructor test: Passed`);
        } catch (e) {
          console.log(`   ⚠️  Constructor test: Failed (${e.message})`);
        }
      }
    } catch (error) {
      if (error.code === 'MODULE_NOT_FOUND') {
        console.log(`❌ ${moduleName}: Not installed`);
        results.missing.push(moduleName);
      } else {
        console.log(`🚨 ${moduleName}: Error loading (${error.message})`);
        results.errors.push({ module: moduleName, error: error.message });
      }
    }
  }

  console.log('\n📊 Installation Summary:');
  console.log(`✅ Installed: ${results.installed.length}/${modules.length}`);
  console.log(`❌ Missing: ${results.missing.length}`);
  console.log(`🚨 Errors: ${results.errors.length}`);

  if (results.missing.length > 0) {
    console.log('\n📦 To install missing modules:');
    console.log(`npm install ${results.missing.join(' ')}`);
  }

  if (results.errors.length > 0) {
    console.log('\n🔧 Modules with errors may need rebuilding:');
    results.errors.forEach(({ module, error }) => {
      console.log(`   ${module}: ${error}`);
    });
  }
}

verifyInstallation().catch(console.error);
```

Run the verification:
```bash
node verify-installation.js
```

### Individual Module Testing

Test each module individually:

```javascript
// test-individual-module.js
const { CveCoreNapi } = require('phantom-cve-core');

async function testModule() {
  try {
    console.log('Testing phantom-cve-core...');
    
    // Create instance
    const cveCore = new CveCoreNapi();
    console.log('✅ Module instance created successfully');
    
    // Test health check
    const health = cveCore.getHealthStatus();
    console.log('✅ Health check passed:', JSON.parse(health));
    
    // Test basic functionality
    const testData = JSON.stringify({
      cveId: 'CVE-2023-12345',
      description: 'Test vulnerability'
    });
    
    const result = cveCore.processCve(testData);
    console.log('✅ Basic processing test passed');
    
  } catch (error) {
    console.error('❌ Module test failed:', error.message);
  }
}

testModule();
```

## 🐛 Troubleshooting

### Common Installation Issues

#### Issue 1: "Module not found" errors
```bash
# Solution: Ensure Node.js and npm are properly installed
node --version
npm --version

# Reinstall modules
npm install phantom-cve-core --force
```

#### Issue 2: Native compilation failures
```bash
# On Linux: Install build tools
sudo apt install build-essential

# On macOS: Install Xcode tools
xcode-select --install

# On Windows: Install Visual Studio Build Tools
# Download from Microsoft website
```

#### Issue 3: Permission errors
```bash
# Fix npm permissions (Linux/macOS)
sudo chown -R $(whoami) ~/.npm
npm config set prefix ~/.npm-global

# Add to PATH
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

#### Issue 4: Pre-built binary not available
```bash
# Force rebuild from source
npm install phantom-cve-core --build-from-source

# Or set environment variable
NAPI_FORCE_BUILD=1 npm install phantom-cve-core
```

#### Issue 5: Rust compilation errors
```bash
# Update Rust to latest stable
rustup update stable

# Install required targets
rustup target add x86_64-unknown-linux-gnu
rustup target add aarch64-apple-darwin  # For Apple Silicon
```

### Platform-Specific Issues

#### Linux Issues
```bash
# Missing dependencies
sudo apt install pkg-config libssl-dev

# For CentOS/RHEL
sudo yum install pkgconfig openssl-devel
```

#### macOS Issues
```bash
# Apple Silicon compatibility
arch -arm64 npm install phantom-cve-core

# Intel Mac with Rosetta
arch -x86_64 npm install phantom-cve-core
```

#### Windows Issues
```powershell
# PowerShell execution policy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Visual Studio Build Tools path
npm config set msvs_version 2019
```

## 🚀 Performance Optimization

### Environment Variables
```bash
# Enable debug mode
export DEBUG=phantom:*

# Force specific architecture
export npm_config_target_arch=x64

# Optimize for production
export NODE_ENV=production
```

### NPM Configuration
```bash
# Optimize npm for faster installs
npm config set fetch-retry-mintimeout 20000
npm config set fetch-retry-maxtimeout 120000
npm config set fetch-timeout 300000
```

## 📦 Package Management

### Update All Modules
```bash
# Check for updates
npm outdated

# Update all modules
npm update phantom-attribution-core phantom-compliance-core phantom-crypto-core \
          phantom-cve-core phantom-feeds-core phantom-forensics-core \
          phantom-hunting-core phantom-incident-response-core phantom-intel-core \
          phantom-ioc-core phantom-malware-core phantom-mitre-core \
          phantom-reputation-core phantom-risk-core phantom-sandbox-core \
          phantom-secop-core phantom-threat-actor-core phantom-vulnerability-core \
          phantom-xdr-core
```

### Version Management
```bash
# Check installed versions
npm list --depth=0 | grep phantom

# Install specific version
npm install phantom-cve-core@1.0.0

# Install latest beta
npm install phantom-cve-core@beta
```

## 🔒 Security Considerations

### Dependency Auditing
```bash
# Audit installed packages
npm audit

# Fix vulnerabilities
npm audit fix

# Force fix (use with caution)
npm audit fix --force
```

### Integrity Verification
```bash
# Verify package integrity
npm ls phantom-cve-core

# Check package signatures
npm verify phantom-cve-core
```

## 🎯 Next Steps

After successful installation:

1. **Read Module Documentation**: Review individual module README files
2. **Explore API Reference**: Check [NAPI_API_REFERENCE.md](./NAPI_API_REFERENCE.md)
3. **Try Examples**: Run the provided usage examples
4. **Integration**: Integrate with your application using [NAPI_INTEGRATION_PATTERNS.md](./NAPI_INTEGRATION_PATTERNS.md)
5. **Performance**: Review [NAPI_PERFORMANCE_GUIDE.md](./NAPI_PERFORMANCE_GUIDE.md)

## 📞 Support

If you encounter issues during installation:

1. **Check Documentation**: Review this guide and module-specific documentation
2. **Search Issues**: Check [GitHub Issues](https://github.com/harborgrid-justin/phantom-spire/issues)
3. **Create Issue**: Report new issues with detailed environment information
4. **Community**: Ask questions in GitHub Discussions

---

*Installation Guide Version: 1.0.0*
*Last Updated: {{ current_date }}*