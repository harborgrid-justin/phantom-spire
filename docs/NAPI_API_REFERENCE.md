# NAPI-RS Modules API Reference

## 📖 Overview

This comprehensive API reference covers all 19 NAPI-RS modules in the Phantom Spire platform. Each module provides high-performance native Rust implementations with TypeScript-compatible Node.js bindings.

## 🏗️ Common Patterns

All NAPI modules follow consistent patterns for maximum usability and reliability.

### Standard Constructor Pattern
```typescript
import { ModuleNameNapi } from 'phantom-module-core';

const instance = new ModuleNameNapi();
```

### Standard Method Pattern
```typescript
// Synchronous methods return Results directly
const result: string = instance.getInfo();

// Asynchronous methods return Promises
const result: Promise<string> = instance.processAsync(data);

// All complex data is JSON serialized
const jsonResult: string = instance.process(JSON.stringify(inputData));
const parsedResult = JSON.parse(jsonResult);
```

### Error Handling Pattern
```typescript
try {
  const result = instance.process(data);
  console.log('Success:', JSON.parse(result));
} catch (error) {
  console.error('NAPI Error:', error.message);
}
```

## 📦 Module APIs

### 1. phantom-cve-core

Advanced CVE vulnerability processing and threat analysis.

```typescript
import { CveCoreNapi } from 'phantom-cve-core';
```

#### Constructor
```typescript
const cveCore = new CveCoreNapi();
```

#### Core Methods

##### `processCve(cveData: string): string`
Process a single CVE record.

```typescript
const cveData = JSON.stringify({
  cveId: 'CVE-2023-12345',
  description: 'Buffer overflow vulnerability',
  cvssScore: 7.5,
  affectedProducts: ['Product A', 'Product B']
});

const result = cveCore.processCve(cveData);
const processed = JSON.parse(result);
// Returns: { processed: true, riskScore: number, recommendations: string[] }
```

##### `batchProcessCves(cvesData: string): string`
Process multiple CVEs efficiently.

```typescript
const cvesData = JSON.stringify([
  { cveId: 'CVE-2023-12345', description: '...', cvssScore: 7.5 },
  { cveId: 'CVE-2023-12346', description: '...', cvssScore: 9.0 }
]);

const results = cveCore.batchProcessCves(cvesData);
const processed = JSON.parse(results);
// Returns: { processed: CVE[], failed: CVE[], summary: ProcessingSummary }
```

##### `searchVulnerabilities(criteria: string): string`
Search vulnerabilities with advanced criteria.

```typescript
const criteria = JSON.stringify({
  severityMin: 7.0,
  affectedProducts: ['nginx', 'apache'],
  dateRange: { start: '2023-01-01', end: '2023-12-31' },
  keywords: ['buffer overflow', 'remote execution']
});

const results = cveCore.searchVulnerabilities(criteria);
```

##### `getExploitTimeline(cveId: string): string`
Get exploit timeline and prediction analysis.

```typescript
const timeline = cveCore.getExploitTimeline('CVE-2023-12345');
const analysis = JSON.parse(timeline);
// Returns: { timeline: Event[], exploitProbability: number, recommendedActions: string[] }
```

##### `getRemediationStrategy(cveData: string): string`
Get automated remediation recommendations.

```typescript
const strategy = cveCore.getRemediationStrategy(cveData);
const recommendations = JSON.parse(strategy);
// Returns: { priority: 'high' | 'medium' | 'low', actions: Action[], estimatedTime: number }
```

##### `getHealthStatus(): string`
Check module health and status.

```typescript
const health = cveCore.getHealthStatus();
const status = JSON.parse(health);
// Returns: { status: 'healthy' | 'degraded' | 'error', timestamp: string, version: string }
```

---

### 2. phantom-intel-core

Threat intelligence aggregation, analysis, and correlation.

```typescript
import { IntelCoreNapi } from 'phantom-intel-core';
```

#### Constructor
```typescript
const intelCore = new IntelCoreNapi();
```

#### Core Methods

##### `gatherIntelligence(sources: string): string`
Aggregate intelligence from multiple sources.

```typescript
const sources = JSON.stringify({
  indicators: ['192.168.1.100', 'malicious-domain.com', 'sha256hash...'],
  sources: ['alienvault', 'virustotal', 'threatconnect'],
  timeRange: '24h',
  includeContext: true
});

const intelligence = intelCore.gatherIntelligence(sources);
```

##### `correlateIndicators(indicators: string): string`
Perform advanced correlation analysis.

```typescript
const indicators = JSON.stringify([
  { type: 'ip', value: '192.168.1.100', confidence: 0.8 },
  { type: 'domain', value: 'malicious.com', confidence: 0.9 },
  { type: 'hash', value: 'sha256...', confidence: 0.95 }
]);

const correlations = intelCore.correlateIndicators(indicators);
```

##### `enrichIndicator(indicator: string): string`
Enrich single indicator with contextual data.

```typescript
const enriched = intelCore.enrichIndicator(JSON.stringify({
  type: 'ip',
  value: '192.168.1.100'
}));
```

##### `generateReport(criteria: string): string`
Generate comprehensive intelligence reports.

```typescript
const report = intelCore.generateReport(JSON.stringify({
  timeRange: '7d',
  threatTypes: ['malware', 'phishing', 'ransomware'],
  format: 'detailed'
}));
```

---

### 3. phantom-xdr-core

Extended Detection and Response with advanced correlation.

```typescript
import { XdrCoreNapi } from 'phantom-xdr-core';
```

#### Constructor
```typescript
const xdrCore = new XdrCoreNapi();
```

#### Core Methods

##### `correlateEvents(events: string): string`
Correlate security events across multiple data sources.

```typescript
const events = JSON.stringify([
  { source: 'endpoint', type: 'process_creation', timestamp: '2023-10-01T10:00:00Z' },
  { source: 'network', type: 'suspicious_traffic', timestamp: '2023-10-01T10:01:00Z' },
  { source: 'dns', type: 'malicious_lookup', timestamp: '2023-10-01T10:02:00Z' }
]);

const correlations = xdrCore.correlateEvents(events);
```

##### `detectThreats(data: string): string`
Advanced threat detection using ML algorithms.

```typescript
const detectionResults = xdrCore.detectThreats(JSON.stringify({
  timeWindow: '1h',
  sources: ['endpoint', 'network', 'email'],
  algorithms: ['behavioral', 'signature', 'anomaly']
}));
```

##### `investigateIncident(incidentData: string): string`
Automated incident investigation and evidence collection.

```typescript
const investigation = xdrCore.investigateIncident(JSON.stringify({
  incidentId: 'INC-2023-001',
  alertIds: ['ALT-001', 'ALT-002'],
  timeRange: { start: '2023-10-01T09:00:00Z', end: '2023-10-01T11:00:00Z' }
}));
```

---

### 4. phantom-mitre-core

MITRE ATT&CK framework integration and analysis.

```typescript
import { MitreCoreNapi } from 'phantom-mitre-core';
```

#### Constructor
```typescript
const mitreCore = new MitreCoreNapi();
```

#### Core Methods

##### `mapTechniques(observations: string): string`
Map observed behaviors to MITRE ATT&CK techniques.

```typescript
const observations = JSON.stringify([
  { behavior: 'powershell execution', context: 'suspicious command line' },
  { behavior: 'registry modification', context: 'persistence mechanism' },
  { behavior: 'network connection', context: 'C2 communication' }
]);

const mapping = mitreCore.mapTechniques(observations);
```

##### `analyzeCoverage(techniques: string): string`
Analyze defensive coverage against MITRE techniques.

```typescript
const coverage = mitreCore.analyzeCoverage(JSON.stringify({
  implementedControls: ['endpoint_detection', 'network_monitoring', 'email_security'],
  scope: 'enterprise',
  matrix: 'enterprise-attack'
}));
```

##### `simulateAttack(scenario: string): string`
Simulate attack scenarios based on MITRE TTPs.

```typescript
const simulation = mitreCore.simulateAttack(JSON.stringify({
  adversary: 'APT29',
  target: 'enterprise_network',
  objectives: ['initial_access', 'persistence', 'lateral_movement']
}));
```

---

### 5. phantom-crypto-core

Cryptographic analysis, validation, and security assessment.

```typescript
import { CryptoCoreNapi } from 'phantom-crypto-core';
```

#### Constructor
```typescript
const cryptoCore = new CryptoCoreNapi();
```

#### Core Methods

##### `analyzeHash(algorithm: string, data: Buffer): string`
Analyze and validate cryptographic hashes.

```typescript
const analysis = cryptoCore.analyzeHash('sha256', Buffer.from('test data'));
```

##### `validateSignature(keyId: string, message: Buffer, signature: string): boolean`
Validate digital signatures.

```typescript
const isValid = cryptoCore.verifySignature('key-123', Buffer.from('message'), 'signature...');
```

##### `generateSecureToken(length: number): string`
Generate cryptographically secure tokens.

```typescript
const token = cryptoCore.generateSecureToken(32);
```

##### `encodeHexEnhanced(data: Buffer): string`
Enhanced hex encoding with performance metrics.

```typescript
const encoded = cryptoCore.encodeHexEnhanced(Buffer.from('binary data'));
const result = JSON.parse(encoded);
// Returns: { encoded: string, performance: { time: number, throughput: number } }
```

##### `decodeHexEnhanced(hexData: string): string`
Enhanced hex decoding with validation.

```typescript
const decoded = cryptoCore.decodeHexEnhanced('48656c6c6f');
const result = JSON.parse(decoded);
// Returns: { decoded: Buffer, validation: { valid: boolean, errors: string[] } }
```

##### `getPreciseTimestamp(): number`
Get high-precision timestamp (nanoseconds).

```typescript
const timestamp = cryptoCore.getPreciseTimestamp();
```

---

### 6. phantom-incident-response-core

Incident response orchestration and automation.

```typescript
import { IncidentResponseCoreNapi } from 'phantom-incident-response-core';
```

#### Core Methods

##### `createIncident(data: string): string`
Create and initialize incident response workflow.

```typescript
const incident = irCore.createIncident(JSON.stringify({
  title: 'Suspected Data Breach',
  severity: 'high',
  description: 'Unusual data access patterns detected',
  affectedSystems: ['web-server-01', 'db-server-02']
}));
```

##### `executePlaybook(playbookData: string): string`
Execute automated response playbooks.

```typescript
const execution = irCore.executePlaybook(JSON.stringify({
  playbookId: 'malware-response-v1',
  incidentId: 'INC-2023-001',
  parameters: { isolateEndpoint: true, collectArtifacts: true }
}));
```

---

### 7. phantom-malware-core

Advanced malware analysis and detection.

```typescript
import { MalwareCoreNapi } from 'phantom-malware-core';
```

#### Core Methods

##### `analyzeSample(sampleData: string): string`
Analyze malware samples using static and dynamic analysis.

```typescript
const analysis = malwareCore.analyzeSample(JSON.stringify({
  hash: 'sha256...',
  fileType: 'pe',
  analysisTypes: ['static', 'behavioral', 'network']
}));
```

##### `detectFamily(signatures: string): string`
Detect malware family and variants.

```typescript
const family = malwareCore.detectFamily(JSON.stringify({
  hash: 'sha256...',
  behaviors: ['file_encryption', 'registry_modification', 'network_communication']
}));
```

---

### 8. phantom-forensics-core

Digital forensics analysis and evidence collection.

```typescript
import { ForensicsCoreNapi } from 'phantom-forensics-core';
```

#### Core Methods

##### `collectEvidence(sources: string): string`
Collect digital evidence from multiple sources.

```typescript
const evidence = forensicsCore.collectEvidence(JSON.stringify({
  sources: ['filesystem', 'memory', 'network', 'registry'],
  timeRange: { start: '2023-10-01T00:00:00Z', end: '2023-10-01T23:59:59Z' },
  preserveIntegrity: true
}));
```

##### `analyzeTimeline(events: string): string`
Perform timeline analysis of events.

```typescript
const timeline = forensicsCore.analyzeTimeline(JSON.stringify({
  events: [/* event data */],
  correlationWindow: '5m',
  includeMetadata: true
}));
```

---

## 🔄 Common Data Structures

### Error Response Format
```typescript
interface ErrorResponse {
  error: string;
  code: string;
  details?: string;
  timestamp: string;
}
```

### Success Response Format
```typescript
interface SuccessResponse<T> {
  success: true;
  data: T;
  timestamp: string;
  performanceMetrics?: {
    executionTime: number;
    memoryUsage: number;
  };
}
```

### Health Status Format
```typescript
interface HealthStatus {
  status: 'healthy' | 'degraded' | 'error';
  timestamp: string;
  version: string;
  uptime: number;
  metrics?: {
    totalOperations: number;
    successRate: number;
    averageResponseTime: number;
  };
}
```

## 🎯 Usage Patterns

### Single Module Usage
```typescript
import { CveCoreNapi } from 'phantom-cve-core';

async function processCves() {
  const cveCore = new CveCoreNapi();
  
  try {
    const result = cveCore.processCve(JSON.stringify({
      cveId: 'CVE-2023-12345',
      description: 'Test vulnerability'
    }));
    
    console.log('Processed:', JSON.parse(result));
  } catch (error) {
    console.error('Error:', error.message);
  }
}
```

### Multi-Module Integration
```typescript
import { CveCoreNapi } from 'phantom-cve-core';
import { IntelCoreNapi } from 'phantom-intel-core';
import { XdrCoreNapi } from 'phantom-xdr-core';

async function securityAnalysis() {
  const cveCore = new CveCoreNapi();
  const intelCore = new IntelCoreNapi();
  const xdrCore = new XdrCoreNapi();
  
  // Process CVE
  const cveResult = cveCore.processCve(cveData);
  
  // Gather related threat intelligence
  const intelResult = intelCore.gatherIntelligence(intelCriteria);
  
  // Correlate with XDR data
  const correlation = xdrCore.correlateEvents(JSON.stringify([
    JSON.parse(cveResult),
    JSON.parse(intelResult)
  ]));
  
  return {
    cve: JSON.parse(cveResult),
    intelligence: JSON.parse(intelResult),
    correlation: JSON.parse(correlation)
  };
}
```

### Error Handling Best Practices
```typescript
function robustModuleUsage() {
  const cveCore = new CveCoreNapi();
  
  try {
    // Check module health first
    const health = JSON.parse(cveCore.getHealthStatus());
    if (health.status !== 'healthy') {
      throw new Error(`Module unhealthy: ${health.status}`);
    }
    
    // Perform operation
    const result = cveCore.processCve(data);
    return JSON.parse(result);
    
  } catch (error) {
    // Log error with context
    console.error('CVE processing failed:', {
      error: error.message,
      timestamp: new Date().toISOString(),
      input: data
    });
    
    // Return safe fallback
    return { error: true, message: error.message };
  }
}
```

## 🚀 Performance Considerations

### Batch Processing
For high-throughput scenarios, use batch methods when available:

```typescript
// Instead of multiple individual calls
const results = cves.map(cve => cveCore.processCve(JSON.stringify(cve)));

// Use batch processing
const batchResult = cveCore.batchProcessCves(JSON.stringify(cves));
```

### Memory Management
NAPI modules are memory-efficient, but consider these patterns:

```typescript
// For long-running applications, periodically check health
setInterval(() => {
  const health = JSON.parse(cveCore.getHealthStatus());
  console.log('Memory usage:', health.metrics?.memoryUsage);
}, 60000);

// Release references when done
let cveCore = new CveCoreNapi();
// ... use module
cveCore = null; // Allow garbage collection
```

### Async Patterns
While most methods are synchronous, wrap in async functions for better control:

```typescript
async function processWithTimeout(data: string, timeoutMs: number) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Operation timed out'));
    }, timeoutMs);
    
    try {
      const result = cveCore.processCve(data);
      clearTimeout(timer);
      resolve(JSON.parse(result));
    } catch (error) {
      clearTimeout(timer);
      reject(error);
    }
  });
}
```

---

## 📚 Further Reading

- [Installation Guide](./NAPI_INSTALLATION_GUIDE.md)
- [Integration Patterns](./NAPI_INTEGRATION_PATTERNS.md)
- [Performance Guide](./NAPI_PERFORMANCE_GUIDE.md)
- [Troubleshooting Guide](./NAPI_TROUBLESHOOTING.md)

---

*API Reference Version: 1.0.0*
*Last Updated: {{ current_date }}*