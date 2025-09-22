# Phantom Cores Constants

This directory contains **500+ reusable constants** organized across specialized files for consistent, type-safe security operations in the Phantom Cores APIs.

## Quick Start

```typescript
// Import all constants from the main index
import { THREAT_LEVELS, APT_GROUPS, getRandomElement } from './constants';

// Or import from specific files
import { SYSTEM_STATUS, HEALTH_STATUS } from './constants/system';
import { MALWARE_TYPES, IOC_TYPES } from './constants/malware';
```

## File Structure

| File | Purpose | Constants |
|------|---------|-----------|
| `index.ts` | Main export file with legacy compatibility | All exports + additional constants |
| `system.ts` | System status, health monitoring, performance | 65+ constants |
| `threats.ts` | Threat levels, attack techniques, MITRE ATT&CK | 85+ constants |
| `actors.ts` | Threat actors, attribution, operational patterns | 75+ constants |
| `malware.ts` | Malware types, IOCs, analysis frameworks | 90+ constants |
| `network.ts` | Network protocols, infrastructure, security | 120+ constants |
| `utils.ts` | Utility functions, validation, scoring systems | 65+ constants |

## Key Features

- ✅ **500+ Constants** - Comprehensive coverage of cybersecurity domains
- ✅ **Type Safety** - Full TypeScript support with 50+ type definitions  
- ✅ **Validation** - 10+ validation functions for data integrity
- ✅ **Utilities** - 25+ helper functions for common operations
- ✅ **Modular** - Organized into logical, specialized files
- ✅ **Legacy Compatible** - Backward compatible with existing imports

## Most Common Constants

### System Status
```typescript
SYSTEM_STATUS.OPERATIONAL
HEALTH_STATUS.EXCELLENT
COMPONENT_STATUS.ONLINE
```

### Threat Intelligence
```typescript
THREAT_LEVELS.CRITICAL
ACTOR_TYPES.NATION_STATE
APT_GROUPS // Array of 70+ APT groups
CYBERCRIMINAL_GROUPS // Array of 50+ criminal groups
```

### Network Security
```typescript
HTTP_STATUS_CODES.OK
NETWORK_PROTOCOLS.HTTPS
COMMON_PORTS.HTTPS // 443
```

### Malware Analysis
```typescript
MALWARE_TYPES.RANSOMWARE
IOC_TYPES.FILE_HASH
HASH_TYPES.SHA256
```

## Utility Functions

```typescript
// Random selection
const randomApt = getRandomElement(APT_GROUPS);
const randomActors = getRandomElements(APT_GROUPS, 5);

// Validation
if (isValidThreatLevel(userInput)) { /* ... */ }
if (isValidIPv4(ipAddress)) { /* ... */ }

// Scoring and labeling
const confidence = getConfidenceLabel(85); // "Very High"
const quality = getQualityLabel(92); // "Excellent"
const severity = getCVSSSeverity(8.5); // "High"
```

## Documentation

See `constants.md` for comprehensive documentation including:
- Detailed usage examples
- Integration patterns
- Best practices
- Type safety guidelines
- Complete constant listings

## Migration from Legacy constants.ts

The old `constants.ts` file has been replaced by this modular structure. All exports are maintained for backward compatibility through the main `index.ts` file.

```typescript
// Old way (still works)
import { THREAT_LEVELS, APT_GROUPS } from '../constants';

// New way (recommended)
import { THREAT_LEVELS, APT_GROUPS } from '../constants';
// OR
import { THREAT_LEVELS } from '../constants/threats';
import { APT_GROUPS } from '../constants/actors';
```

## Statistics

- **Total Constants**: 500+
- **Type Definitions**: 50+
- **Utility Functions**: 25+
- **Validation Functions**: 10+
- **Categories**: 22 major security domains
- **Files**: 6 specialized + 1 main index
- **Lines of Code**: 2000+

All constants are designed for reusability across the entire phantom-cores ecosystem.
