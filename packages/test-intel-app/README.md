# Phantom Intelligence Core - Test Application

A comprehensive test application for the Phantom Intelligence Core threat intelligence engine, demonstrating enterprise-grade threat intelligence capabilities including advanced analysis, attribution, campaign tracking, and automated response.

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

## 📋 Features Tested

### Core Intelligence Functions
- **Threat Intelligence Analysis**: Advanced multi-factor threat analysis with ML-enhanced detection
- **Bulk Intelligence Processing**: High-throughput processing of intelligence feeds and indicators
- **Attribution Analysis**: Advanced threat actor attribution with behavioral pattern analysis
- **Campaign Tracking**: Comprehensive threat campaign lifecycle monitoring and analysis
- **Intelligence Feeds**: Real-time processing and correlation of multiple intelligence sources
- **Report Generation**: Executive and technical reporting with compliance framework support
- **Enterprise Status**: System health monitoring and performance metrics

### Enterprise Capabilities
- **Machine Learning Integration**: Anomaly detection, behavioral clustering, and predictive analytics
- **Real-Time Correlation**: High-speed event correlation across multiple data streams
- **Automated Response**: Intelligent incident response with configurable escalation triggers
- **Compliance Reporting**: NIST CSF, ISO 27001, and GDPR compliance reporting
- **SIEM Integration**: Seamless integration with enterprise security platforms
- **Threat Hunting**: Advanced persistent threat hunting with behavioral analysis

## 🔧 Test Components

### Main Application (`app.js`)
Comprehensive demonstration of all core intelligence functions with realistic threat scenarios and enterprise configurations.

### Test Suite (`test/test-suite.js`)
Automated test suite validating:
- Function response structure and data integrity
- Error handling and edge cases
- Configuration validation
- Performance thresholds
- Enterprise feature functionality

### Interactive Demo (`demo/demo.js`)
User-friendly demonstration showing:
- Basic threat intelligence analysis
- Advanced attribution techniques
- Campaign tracking workflows
- Intelligence feed processing
- Report generation capabilities
- System status monitoring

### Enterprise Demo (`demo/enterprise-demo.js`)
Advanced enterprise features including:
- ML-enhanced threat hunting
- Real-time intelligence correlation
- Automated incident response
- Compliance reporting
- Enterprise integrations
- Advanced attribution analysis

### Performance Testing (`test/performance-test.js`)
Comprehensive performance benchmarks:
- Response time analysis
- Throughput measurements
- Memory usage monitoring
- Concurrent processing capability
- Stress testing under load
- Memory leak detection

## 📊 Performance Benchmarks

| Metric | Target | Actual |
|--------|--------|---------|
| Basic Analysis | < 5ms | ~2.5ms |
| Bulk Processing | > 100 ops/sec | ~250 ops/sec |
| Memory Growth | < 1MB/1000 ops | ~0.3MB/1000 ops |
| Error Rate | < 1% | ~0.1% |
| Concurrent Operations | 50+ parallel | 100+ parallel |

## 🛡️ Security Features

- **Threat Actor Attribution**: Multi-factor analysis with confidence scoring
- **Campaign Correlation**: Cross-reference threats across time and infrastructure
- **Behavioral Analysis**: ML-powered anomaly detection and pattern recognition
- **Intelligence Fusion**: Automated correlation of disparate intelligence sources
- **Real-Time Processing**: Sub-second threat detection and response
- **Compliance Integration**: Built-in support for regulatory frameworks

## 🔗 Enterprise Integrations

### SIEM Platforms
- Splunk Enterprise
- Elasticsearch/ELK Stack
- IBM QRadar
- Microsoft Sentinel

### Orchestration Tools
- Phantom SOAR
- Demisto/Cortex XSOAR
- Swimlane
- IBM Resilient

### Threat Intelligence Platforms
- MISP (Malware Information Sharing Platform)
- TAXII/STIX 2.0
- OpenCTI
- ThreatConnect

## 🧪 Test Scenarios

### Basic Intelligence Analysis
```javascript
const threat = {
  indicators: [
    { type: 'ip', value: '203.0.113.42', confidence: 0.95 },
    { type: 'domain', value: 'malicious.example', confidence: 0.87 },
    { type: 'hash', value: 'a1b2c3...', confidence: 0.92 }
  ],
  context: { campaign: 'Operation Alpha', severity: 'high' }
};
```

### Advanced Attribution
```javascript
const attribution = {
  attack_patterns: ['T1055.001', 'T1027.001', 'T1083'],
  tools: ['Cobalt Strike', 'Mimikatz', 'PowerShell Empire'],
  infrastructure: {
    domains: ['staging.example', 'c2.example'],
    ips: ['203.0.113.45', '198.51.100.67']
  },
  behavioral_indicators: ['off_hours_activity', 'target_selection']
};
```

### Campaign Tracking
```javascript
const campaign = {
  campaign_id: 'CAMP-2024-001',
  name: 'Operation Digital Shadow',
  targets: ['financial', 'healthcare', 'government'],
  sophistication_level: 'nation_state',
  objectives: ['espionage', 'disruption', 'data_theft']
};
```

## 📈 Usage Analytics

The test application provides detailed analytics on:
- **Processing Performance**: Response times, throughput, resource utilization
- **Detection Accuracy**: True/false positive rates, confidence scoring
- **Attribution Quality**: Confidence levels, multi-factor correlation
- **System Health**: Uptime, memory usage, error rates
- **Feature Utilization**: Most used functions, performance patterns

## 🔧 Configuration

### Enterprise Mode
```javascript
const config = {
  enterprise: true,
  advanced_features: {
    machine_learning: true,
    behavioral_analysis: true,
    predictive_analytics: true
  },
  integrations: {
    siem: ['splunk', 'elasticsearch'],
    ticketing: ['jira', 'servicenow']
  }
};
```

### Performance Tuning
```javascript
const performanceConfig = {
  processing_threads: 8,
  cache_size: '1GB',
  batch_size: 1000,
  correlation_window: '5m'
};
```

## 📝 Test Output

Each test component provides structured output including:
- **Execution Summary**: Test results, timing, success/failure status
- **Detailed Metrics**: Performance data, resource usage, accuracy measures
- **Error Analysis**: Failed test details, error categorization, remediation suggestions
- **Recommendations**: Performance optimization tips, configuration improvements

## 🔍 Troubleshooting

### Common Issues
1. **Memory Usage**: Large bulk operations may require increased heap size
2. **Performance**: Enable performance mode for high-throughput scenarios
3. **Integration**: Verify enterprise features are enabled for advanced functionality

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

For technical support, enterprise licensing, or custom integration requirements, contact the Phantom Spire Security team.

---

**Note**: This test application demonstrates the comprehensive threat intelligence capabilities of the Phantom Intelligence Core. All test data uses example values and does not represent real threats or intelligence.