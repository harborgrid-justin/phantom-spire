# Phantom Cores Constants Documentation

## Overview
This document provides comprehensive documentation for the **500+ reusable constants** organized across **6 specialized files** for the Phantom Cores APIs. These constants are designed to ensure consistency, type safety, and maintainability across all phantom-cores security operations.

### File Structure
The constants have been broken down into the following specialized files:

- **`system.ts`** - System status, health monitoring, and performance metrics (65+ constants)
- **`threats.ts`** - Threat levels, attack techniques, and security frameworks (85+ constants) 
- **`actors.ts`** - Threat actors, attribution, and operational patterns (75+ constants)
- **`malware.ts`** - Malware types, IOCs, and analysis frameworks (90+ constants)
- **`network.ts`** - Network protocols, infrastructure, and security (120+ constants)
- **`utils.ts`** - Utility functions, validation helpers, and scoring systems (65+ constants)
- **`index.ts`** - Main export file with additional constants and legacy compatibility

## Table of Contents
1. [Usage Examples](#usage-examples)
2. [Constant Categories](#constant-categories)
3. [Type Safety](#type-safety)
4. [Utility Functions](#utility-functions)
5. [Integration Guide](#integration-guide)

## Usage Examples

### Basic Import and Usage
```typescript
import {
  THREAT_LEVELS,
  ACTOR_TYPES,
  APT_GROUPS,
  SYSTEM_STATUS,
  getRandomElement,
  isValidThreatLevel
} from './constants';

// Using threat levels
const currentThreatLevel = THREAT_LEVELS.HIGH;

// Using actor types
const actorType = ACTOR_TYPES.NATION_STATE;

// Getting a random APT group
const randomAptGroup = getRandomElement(APT_GROUPS);

// Validating threat level
if (isValidThreatLevel(userInput)) {
  // Process valid threat level
}
```

### API Response Construction
```typescript
import { SYSTEM_STATUS, HEALTH_STATUS, HTTP_STATUS_CODES } from './constants';

const apiResponse = {
  status: SYSTEM_STATUS.OPERATIONAL,
  health: HEALTH_STATUS.EXCELLENT,
  timestamp: new Date().toISOString(),
  httpStatus: HTTP_STATUS_CODES.OK
};
```

### Threat Intelligence Operations
```typescript
import {
  APT_GROUPS,
  CYBERCRIMINAL_GROUPS,
  THREAT_LEVELS,
  CONFIDENCE_LEVELS,
  getRandomElements
} from './constants';

const threatIntelligence = {
  actors: getRandomElements(APT_GROUPS, 5),
  threatLevel: THREAT_LEVELS.CRITICAL,
  confidence: CONFIDENCE_LEVELS.HIGH,
  cybercriminalGroups: getRandomElements(CYBERCRIMINAL_GROUPS, 3)
};
```

## Constant Categories

### 1. System Status and Health (15+ constants)
- `SYSTEM_STATUS`: operational, degraded, maintenance, offline, error
- `HEALTH_STATUS`: excellent, good, fair, poor, critical
- `COMPONENT_STATUS`: online, offline, degraded, maintenance, unknown

### 2. Threat Levels and Severity (15+ constants)
- `THREAT_LEVELS`: CRITICAL, HIGH, MEDIUM, LOW, INFO
- `RISK_LEVELS`: critical, high, medium, low, minimal
- `CONFIDENCE_LEVELS`: very_high, high, medium, low, very_low

### 3. Attack Techniques and Tactics (30+ constants)
- `MITRE_TACTICS`: Complete MITRE ATT&CK tactical framework
- `COMMON_ATTACK_TECHNIQUES`: 15 most common attack techniques with IDs
- `ATTACK_VECTORS`: email, web, usb, network, physical, social_engineering, supply_chain, insider

### 4. Threat Actor Types (50+ constants)
- `ACTOR_TYPES`: nation_state, apt_group, cybercriminal, hacktivist, insider, script_kiddie
- `APT_GROUPS`: 25+ Advanced Persistent Threat groups
- `CYBERCRIMINAL_GROUPS`: 18+ known cybercriminal organizations

### 5. Malware and IOC Types (30+ constants)
- `MALWARE_TYPES`: ransomware, trojan, backdoor, rootkit, worm, virus, etc.
- `IOC_TYPES`: ip_address, domain, url, file_hash, email, registry_key, etc.
- `HASH_TYPES`: md5, sha1, sha256, sha512, ssdeep, imphash

### 6. Network and Infrastructure (30+ constants)
- `NETWORK_PROTOCOLS`: http, https, ftp, smtp, dns, tcp, udp, etc.
- `PORT_CATEGORIES`: well_known, registered, dynamic, suspicious
- `COMMON_PORTS`: Complete mapping of service ports

### 7. Operating Systems and Platforms (25+ constants)
- `OPERATING_SYSTEMS`: windows, linux, macos, android, ios, unix, etc.
- `WINDOWS_VERSIONS`: Complete Windows version list
- `LINUX_DISTRIBUTIONS`: Major Linux distributions

### 8. Industry Sectors and Targets (40+ constants)
- `INDUSTRY_SECTORS`: 15 major industry sectors
- `GEOGRAPHIC_REGIONS`: 12 global regions
- `COUNTRIES`: 16 major countries for threat intelligence

### 9. Incident Response and Forensics (35+ constants)
- `INCIDENT_TYPES`: malware, phishing, data_breach, ransomware, etc.
- `INCIDENT_STATUS`: Complete incident lifecycle statuses
- `EVIDENCE_TYPES`: disk_image, memory_dump, network_capture, etc.
- `FORENSIC_TOOLS`: 15 major forensic analysis tools

### 10. Compliance and Regulations (18+ constants)
- `COMPLIANCE_FRAMEWORKS`: ISO 27001, NIST, SOX, GDPR, HIPAA, PCI DSS, etc.
- `REGULATORY_REGIONS`: Regional compliance mapping

### 11. Machine Learning and AI (25+ constants)
- `ML_ALGORITHMS`: random_forest, svm, neural_network, etc.
- `ML_TASKS`: classification, regression, clustering, anomaly_detection, etc.
- `MODEL_METRICS`: accuracy, precision, recall, f1_score, etc.

### 12. Vulnerability and CVE Data (40+ constants)
- `CVSS_SEVERITY`: Detailed CVSS scoring ranges with labels
- `VULNERABILITY_TYPES`: 10 major vulnerability categories
- `CWE_TOP_25`: MITRE's top 25 most dangerous software weaknesses

### 13. Cryptography and Security (20+ constants)
- `ENCRYPTION_ALGORITHMS`: aes, des, rsa, ecc, etc.
- `HASH_ALGORITHMS`: md5, sha1, sha256, blake2, etc.
- `KEY_SIZES`: Standard encryption key sizes

### 14. Threat Intelligence Sources (15+ constants)
- `INTEL_SOURCES`: osint, commercial, government, community, etc.
- `TLP_LEVELS`: Traffic Light Protocol levels (red, amber, green, white)
- `INTEL_CONFIDENCE`: confirmed, probable, possible, doubtful, improbable

### 15. Hunting and Detection (20+ constants)
- `HUNTING_TYPES`: structured, unstructured, hypothesis_driven, etc.
- `DETECTION_METHODS`: signature, behavioral, anomaly, statistical, etc.
- `LOG_SOURCES`: 11 major log source types

### 16. Sandbox and Analysis (15+ constants)
- `SANDBOX_TYPES`: static, dynamic, hybrid, cloud, on_premise
- `ANALYSIS_ENGINES`: 8 major malware analysis platforms
- `FILE_TYPES`: executable, document, archive, script, etc.

### 17. Time and Date Constants (15+ constants)
- `TIME_RANGES`: 1h, 6h, 24h, 7d, 30d, 90d, 365d
- `TIMEZONE_CODES`: Major timezone mappings

### 18. API and Response Formats (25+ constants)
- `HTTP_STATUS_CODES`: Complete HTTP status code mapping
- `DATA_FORMATS`: json, xml, csv, yaml, stix, taxii, misp, yara

### 19. Quality and Confidence Metrics (10+ constants)
- `QUALITY_SCORES`: Excellent, Good, Fair, Poor, Very Poor with ranges
- `CONFIDENCE_SCORES`: Very High, High, Medium, Low, Very Low with ranges

### 20. Error Messages and Codes (20+ constants)
- `ERROR_CODES`: 10 standard error codes
- `DEFAULT_ERROR_MESSAGES`: User-friendly error messages

## Type Safety

The constants file provides comprehensive TypeScript type definitions:

```typescript
// String literal types for compile-time safety
export type SystemStatus = typeof SYSTEM_STATUS[keyof typeof SYSTEM_STATUS];
export type ThreatLevel = typeof THREAT_LEVELS[keyof typeof THREAT_LEVELS];
export type ActorType = typeof ACTOR_TYPES[keyof typeof ACTOR_TYPES];

// Usage with type safety
function processThreats(level: ThreatLevel, actor: ActorType) {
  // TypeScript will enforce valid values
}

processThreats(THREAT_LEVELS.HIGH, ACTOR_TYPES.NATION_STATE); // ✅ Valid
processThreats("invalid", "bad_actor"); // ❌ TypeScript error
```

## Utility Functions

### Random Selection Functions
```typescript
// Get a single random element
const randomAptGroup = getRandomElement(APT_GROUPS);
const randomMalwareType = getRandomElement(Object.values(MALWARE_TYPES));

// Get multiple random elements
const randomCountries = getRandomElements(COUNTRIES, 3);
const randomSectors = getRandomElements(Object.values(INDUSTRY_SECTORS), 5);
```

### Validation Functions
```typescript
// Validate threat levels
if (isValidThreatLevel(userInput)) {
  console.log('Valid threat level');
}

// Validate risk levels
if (isValidRiskLevel(riskInput)) {
  console.log('Valid risk level');
}
```

### Score-based Label Functions
```typescript
// Get confidence label from numeric score
const confidenceLabel = getConfidenceLabel(85); // "Very High"

// Get quality label from numeric score
const qualityLabel = getQualityLabel(92); // "Excellent"

// Get CVSS severity from score
const severity = getCVSSSeverity(8.5); // "High"
```

## Integration Guide

### 1. Import in API Routes
```typescript
// In your phantom-cores API routes
import {
  SYSTEM_STATUS,
  THREAT_LEVELS,
  APT_GROUPS,
  HTTP_STATUS_CODES
} from '../constants';

export async function GET() {
  return NextResponse.json({
    status: SYSTEM_STATUS.OPERATIONAL,
    threatLevel: THREAT_LEVELS.MEDIUM,
    detectedActors: getRandomElements(APT_GROUPS, 3)
  }, { 
    status: HTTP_STATUS_CODES.OK 
  });
}
```

### 2. Use in Handler Functions
```typescript
// In handler functions
import { INCIDENT_TYPES, INCIDENT_STATUS, EVIDENCE_TYPES } from '../constants';

export function createIncident(type: string) {
  if (!Object.values(INCIDENT_TYPES).includes(type)) {
    throw new Error('Invalid incident type');
  }
  
  return {
    type,
    status: INCIDENT_STATUS.NEW,
    evidenceTypes: [EVIDENCE_TYPES.LOG_FILES, EVIDENCE_TYPES.NETWORK_CAPTURE]
  };
}
```

### 3. Frontend Integration
```typescript
// In React components or frontend code
import { THREAT_LEVELS, CONFIDENCE_LEVELS } from '@/app/api/phantom-cores/constants';

const ThreatIndicator = ({ level, confidence }) => {
  const color = level === THREAT_LEVELS.CRITICAL ? 'red' : 
                level === THREAT_LEVELS.HIGH ? 'orange' : 'yellow';
                
  return (
    <div style={{ color }}>
      Threat Level: {level}
      Confidence: {confidence}
    </div>
  );
};
```

### 4. Database Schema Validation
```typescript
// Use constants for database schemas
import { ACTOR_TYPES, MALWARE_TYPES } from '../constants';

const ThreatSchema = {
  actorType: {
    type: String,
    enum: Object.values(ACTOR_TYPES),
    required: true
  },
  malwareType: {
    type: String,
    enum: Object.values(MALWARE_TYPES)
  }
};
```

### 5. Configuration Files
```typescript
// Use in configuration files
import { COMPLIANCE_FRAMEWORKS, ENCRYPTION_ALGORITHMS } from '../constants';

export const securityConfig = {
  enabledFrameworks: [
    COMPLIANCE_FRAMEWORKS[0], // ISO 27001
    COMPLIANCE_FRAMEWORKS[3], // GDPR
    COMPLIANCE_FRAMEWORKS[4]  // HIPAA
  ],
  encryption: ENCRYPTION_ALGORITHMS.AES,
  keySize: KEY_SIZES.AES_256
};
```

## Best Practices

### 1. Always Use Constants Instead of String Literals
```typescript
// ❌ Avoid
const status = 'operational';
const threat = 'HIGH';

// ✅ Preferred
const status = SYSTEM_STATUS.OPERATIONAL;
const threat = THREAT_LEVELS.HIGH;
```

### 2. Leverage Type Safety
```typescript
// ✅ Use typed parameters
function processThreat(level: ThreatLevel, actor: ActorType) {
  // Implementation with compile-time guarantees
}
```

### 3. Use Validation Functions
```typescript
// ✅ Validate user input
if (isValidThreatLevel(userInput)) {
  processThreat(userInput as ThreatLevel);
}
```

### 4. Combine Constants for Complex Operations
```typescript
// ✅ Combine multiple constants
const threatIntelReport = {
  actors: getRandomElements(APT_GROUPS, 3),
  malwareTypes: getRandomElements(Object.values(MALWARE_TYPES), 5),
  targetSectors: getRandomElements(Object.values(INDUSTRY_SECTORS), 4),
  confidenceLevel: CONFIDENCE_LEVELS.HIGH,
  threatLevel: THREAT_LEVELS.CRITICAL
};
```

## Benefits

1. **Consistency**: Ensures consistent values across all phantom-cores APIs
2. **Type Safety**: Compile-time checking prevents runtime errors
3. **Maintainability**: Centralized constants make updates easy
4. **Documentation**: Self-documenting code with meaningful constant names
5. **Validation**: Built-in validation functions prevent invalid data
6. **Extensibility**: Easy to add new constants and categories
7. **Performance**: No runtime string concatenation or construction
8. **Testing**: Predictable values make testing easier

## Constant Count Verification

The constants collection contains:
- **500+ total constants** across 22 major categories
- **50+ type definitions** for all major constant groups  
- **25+ utility functions** for random selection, validation, and scoring
- **10+ validation functions** for data integrity
- **6 specialized files** plus main index for organization
- **Complete coverage** of security domains in phantom-cores

### File Breakdown:
- **`system.ts`**: 65+ constants (system status, health, performance)
- **`threats.ts`**: 85+ constants (threat levels, attack techniques, MITRE)
- **`actors.ts`**: 75+ constants (threat actors, attribution, capabilities)
- **`malware.ts`**: 90+ constants (malware types, IOCs, analysis)
- **`network.ts`**: 120+ constants (protocols, infrastructure, security)
- **`utils.ts`**: 65+ constants (utilities, validation, scoring)
- **`index.ts`**: Additional constants and legacy compatibility exports

All constants are designed to be reusable across the entire phantom-cores ecosystem, providing a solid foundation for consistent, type-safe security operations with comprehensive coverage of cybersecurity domains.
