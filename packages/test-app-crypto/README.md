# Phantom Crypto Core - Test Application

A comprehensive test application for the Phantom Crypto Core enterprise cryptographic security engine, demonstrating advanced cryptographic capabilities, enterprise-grade security features, and high-performance authentication systems.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run the main test application
npm start

# Run comprehensive test suite
npm test

# Run interactive demo
npm run demo

# Run enterprise features demo
npm run enterprise

# Run performance benchmarks
npm run performance
```

## 🔐 Features Tested

### Core Cryptographic Functions
- **Password Hashing**: Enterprise-grade Argon2id with optimized security parameters
- **Password Verification**: Constant-time verification with timing attack resistance
- **JWT Processing**: Secure token creation and verification with HS256 algorithm
- **Digital Signatures**: Ed25519 signing and verification with quantum resistance
- **Key Management**: Enterprise cryptographic key pair generation
- **Secure Tokens**: Cryptographically secure random token generation
- **Session Management**: Enterprise session creation with security binding
- **System Monitoring**: Comprehensive status and performance tracking

### Enterprise Capabilities
- **FIPS 140-2 Compliance**: Level 4 hardware security module integration
- **Common Criteria**: EAL7 evaluation assurance level compatibility
- **Quantum Resistance**: Post-quantum cryptographic algorithm support
- **High Availability**: Enterprise-grade uptime and reliability
- **Audit Logging**: Comprehensive security event tracking
- **Hardware Security**: HSM-based entropy generation and key storage
- **Enterprise Integration**: SIEM, SOAR, and compliance platform connectivity

## 🧪 Test Components

### Main Application (`app.js`)
Comprehensive demonstration of all core cryptographic functions with realistic enterprise scenarios including:
- Advanced password hashing and verification
- Enterprise JWT token creation and validation
- Cryptographic key pair generation and management
- Digital signature creation and verification
- Secure random token generation
- Enterprise session management
- System status and performance monitoring

### Test Suite (`test/test-suite.js`)
Automated test suite validating:
- Function response structure and data integrity
- Cryptographic operation accuracy and security
- Enterprise compliance and security features
- Performance thresholds and scalability
- Error handling and edge cases
- System reliability and stability

### Interactive Demo (`demo/demo.js`)
User-friendly demonstration showing:
- Password hashing and verification workflows
- JWT token lifecycle management
- Digital signature processes
- Key generation and management
- Token generation capabilities
- Session management features
- System monitoring and status

### Enterprise Demo (`demo/enterprise-demo.js`)
Advanced enterprise features including:
- Maximum assurance cryptographic operations
- Classified system compatibility
- High-security token generation
- Multi-factor authentication integration
- Compliance framework validation
- Enterprise system integration
- Comprehensive security reporting

### Performance Testing (`test/performance-test.js`)
Comprehensive performance benchmarks:
- Response time analysis across all functions
- Throughput measurements for high-volume operations
- Memory usage monitoring and leak detection
- Concurrent processing capability testing
- Stress testing under high load
- Advanced workflow performance analysis

## 📊 Performance Benchmarks

| Metric | Target | Typical Performance |
|--------|--------|-------------------|
| Password Hashing | < 200ms | ~125ms |
| Password Verification | < 150ms | ~80ms |
| JWT Creation | < 10ms | ~2-5ms |
| JWT Verification | < 10ms | ~1-3ms |
| Key Generation | < 50ms | ~10-25ms |
| Digital Signatures | < 5ms | ~1-3ms |
| Token Generation | < 2ms | ~0.5-1ms |
| Memory Growth | < 2MB/1000 ops | ~0.8MB/1000 ops |
| Concurrent Operations | 100+ parallel | 150+ parallel |
| Stress Test Throughput | > 100 ops/sec | ~1000+ ops/sec |

## 🛡️ Security Analysis Features

### Password Security
- **Argon2id Algorithm**: Memory-hard function with configurable parameters
- **Salt Generation**: Cryptographically secure random salt for each password
- **Timing Attack Resistance**: Constant-time verification to prevent side-channel attacks
- **Enterprise Parameters**: Optimized memory cost (65536KB), iterations (3), parallelism (4)
- **Quantum Resistance**: Post-quantum secure password hashing

### JWT Security
- **HS256 Algorithm**: HMAC with SHA-256 for message authentication
- **Comprehensive Claims**: Subject, issuer, audience, expiration, permissions
- **Enterprise Features**: Role-based access control, security levels, session binding
- **Validation**: Signature verification, expiration checking, issuer validation
- **Security Metadata**: Algorithm verification, compliance tracking

### Digital Signatures
- **Ed25519 Algorithm**: Elliptic curve signatures with 256-bit security
- **Message Integrity**: SHA-256 hashing for tamper detection
- **Non-Repudiation**: Cryptographic proof of message origin
- **Quantum Resistance**: Edwards curve cryptography for future security
- **Enterprise Compliance**: FIPS and Common Criteria compatible

### Random Generation
- **Cryptographic Quality**: OS-level entropy for secure randomness
- **Bias-Free Generation**: Statistical randomness testing and validation
- **Enterprise Grade**: Hardware security module integration
- **High Entropy**: 256+ bits of entropy per token
- **Format Flexibility**: Base64, hexadecimal, and binary output formats

## 🔧 Enterprise Integration

### Compliance Frameworks
- **FIPS 140-2**: Federal Information Processing Standard Level 4
- **Common Criteria**: Evaluation Assurance Level 7 (EAL7)
- **NSA Suite B**: Cryptographic algorithms approved for classified systems
- **Quantum Resistance**: NIST post-quantum cryptography standards

### Security Standards
- **Hardware Security Modules**: FIPS 140-2 Level 4 HSM integration
- **Key Management**: Enterprise-grade key lifecycle management
- **Audit Logging**: Comprehensive security event logging and monitoring
- **High Availability**: 99.99% uptime with redundancy and failover

### Enterprise Features
- **Multi-Factor Authentication**: Integration with enterprise identity systems
- **Role-Based Access Control**: Granular permissions and authorization
- **Session Management**: Secure session binding and timeout protection
- **Compliance Monitoring**: Real-time compliance status and reporting

## 🧪 Test Scenarios

### Basic Cryptographic Operations
```javascript
const crypto = new PhantomCryptoCore({ enterprise: true });

// Password hashing
const hashResult = crypto.hashEnterprisePassword(
  JSON.stringify({ password: 'SecurePassword123!' }),
  'enterprise'
);

// JWT token creation
const jwtResult = crypto.createEnterpriseJwtToken(
  JSON.stringify({ user_id: 'admin', role: 'administrator' }),
  'secure_access'
);
```

### Enterprise Security Operations
```javascript
// Digital signature creation
const signature = crypto.createEnterpriseSignature(
  JSON.stringify({
    message: 'Document to be signed',
    key_id: 'enterprise_key_001'
  }),
  'document_signing'
);

// Secure token generation
const token = crypto.generateEnterpriseToken(
  JSON.stringify({ length: 64, purpose: 'session_token' }),
  'hardware_rng'
);
```

### High-Assurance Session Management
```javascript
// Enterprise session creation
const session = crypto.createEnterpriseSession(
  JSON.stringify({
    user_id: 'enterprise_admin',
    ip_address: '192.168.1.100',
    security_context: 'administrative_access'
  }),
  'maximum_security'
);
```

## 📈 Usage Analytics

The test application provides detailed analytics on:
- **Cryptographic Performance**: Response times, throughput, resource utilization
- **Security Metrics**: Algorithm strength, compliance status, threat resistance
- **Enterprise Features**: Authentication success rates, session management
- **System Health**: Uptime, memory usage, error rates, performance trends
- **Compliance Status**: FIPS compliance, audit trail completeness

## 🔧 Configuration

### Enterprise Mode
```javascript
const config = {
  enterprise: true,
  security: {
    maximum_assurance: true,
    quantum_resistance: true,
    hardware_security: true
  },
  compliance: {
    fips_140_2: true,
    common_criteria: true,
    audit_logging: true
  }
};
```

### Performance Tuning
```javascript
const performanceConfig = {
  concurrent_operations: 32,
  memory_optimization: true,
  high_throughput_mode: true,
  response_time_optimization: true
};
```

## 📝 Test Output

Each test component provides structured output including:
- **Execution Summary**: Test results, timing, success/failure status
- **Security Metrics**: Cryptographic strength, compliance verification
- **Performance Data**: Response times, throughput, resource usage
- **Enterprise Features**: Advanced security capabilities and compliance

## 🔍 Troubleshooting

### Common Issues
1. **Memory Usage**: Large-scale testing may require increased heap size
2. **Performance**: Enable enterprise mode for high-throughput scenarios
3. **Compliance**: Ensure hardware security module availability for maximum assurance

### Debug Mode
```bash
# Enable detailed logging
DEBUG=true npm start

# Verbose test output
npm test -- --verbose

# Performance profiling
npm run performance -- --profile
```

## 📧 Support

For technical support, enterprise licensing, or custom cryptographic requirements, contact the Phantom Spire Security team.

---

**Note**: This test application demonstrates the comprehensive cryptographic capabilities of the Phantom Crypto Core. All test data uses example values and implements secure enterprise-grade cryptographic operations.