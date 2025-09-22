# Phantom Cores Centralized Configuration

This directory contains centralized configuration management for the Phantom Cores API suite. It provides structured, type-safe configuration with environment-specific overrides and validation.

## Structure

```
configs/
├── index.ts              # Main configuration export and interface definitions
├── api.ts                # API-specific configuration (endpoints, CORS, etc.)
├── database.ts           # Database configuration and connection settings
├── security.ts           # Security configuration (JWT, encryption, etc.)
├── performance.ts        # Performance settings (caching, compression, etc.)
├── external-services.ts  # External service configurations
├── environment.ts        # Environment-specific settings
├── logging.ts            # Logging configuration
├── cache.ts              # Cache configuration
├── rate-limiting.ts      # Rate limiting settings
├── feature-flags.ts      # Feature flag configuration
├── utils.ts              # Configuration utilities and helpers
├── validation.ts         # Configuration validation functions
└── README.md             # This documentation file
```

## Key Features

### 1. Type-Safe Configuration
- Complete TypeScript interfaces for all configuration options
- Compile-time validation of configuration structure
- Auto-completion and IntelliSense support

### 2. Environment-Specific Overrides
- Development, staging, production, and test configurations
- Environment variable integration
- Secure secret management

### 3. Centralized Management
- Single source of truth for all configuration
- Consistent structure across all modules
- Easy maintenance and updates

### 4. Backward Compatibility
- Re-exports existing constants from `../constants`
- Maintains compatibility with existing code
- Gradual migration path

## Usage

### Basic Configuration Import

```typescript
import { DEFAULT_CONFIG, PhantomCoresConfig } from '../configs';

// Use default configuration
const config = DEFAULT_CONFIG;
console.log(config.api.baseUrl); // '/api/phantom-cores'
```

### Environment-Specific Configuration

```typescript
import { 
  DEFAULT_CONFIG, 
  PRODUCTION_OVERRIDES,
  STAGING_OVERRIDES,
  TEST_OVERRIDES 
} from '../configs';

// Apply environment-specific overrides
const environment = process.env.NODE_ENV || 'development';

let config = DEFAULT_CONFIG;
switch (environment) {
  case 'production':
    config = { ...DEFAULT_CONFIG, ...PRODUCTION_OVERRIDES };
    break;
  case 'staging':
    config = { ...DEFAULT_CONFIG, ...STAGING_OVERRIDES };
    break;
  case 'test':
    config = { ...DEFAULT_CONFIG, ...TEST_OVERRIDES };
    break;
}
```

### Loading from Environment Variables

```typescript
import { loadConfigFromEnvironment, validateConfig } from '../configs';

// Load configuration from environment variables
const envConfig = loadConfigFromEnvironment();
const config = { ...DEFAULT_CONFIG, ...envConfig };

// Validate configuration
const errors = validateConfig(config);
if (errors.length > 0) {
  console.error('Configuration errors:', errors);
  process.exit(1);
}
```

### Accessing Specific Configuration Categories

```typescript
// Import specific configuration categories
import { API_ENDPOINTS, HTTP_STATUS_CODES } from '../configs/api';
import { COLLECTION_NAMES, DATABASE_PORTS } from '../configs/database';
import { SECURITY_DEFAULTS } from '../configs/security';

// Use in your code
const endpoint = API_ENDPOINTS.RISK_ASSESSMENT;
const statusCode = HTTP_STATUS_CODES.OK;
const collection = COLLECTION_NAMES.RISK_ASSESSMENTS;
```

### Using Constants (Backward Compatibility)

```typescript
// All existing constants are still available
import { 
  THREAT_LEVELS,
  MITRE_TACTICS,
  IOC_TYPES,
  MALWARE_FAMILIES 
} from '../configs';

// Use as before
const threatLevel = THREAT_LEVELS.HIGH;
const tactic = MITRE_TACTICS.INITIAL_ACCESS;
```

## Configuration Categories

### API Configuration (`api.ts`)
- API endpoints and routes
- HTTP status codes and content types
- CORS settings and headers
- Pagination defaults
- Response formats

### Database Configuration (`database.ts`)
- Database connection settings
- Collection names and indexes
- Query defaults and operators
- Connection pool settings
- Backup configuration

### Security Configuration (`security.ts`)
- JWT settings and algorithms
- Encryption configuration
- Rate limiting rules
- CSRF protection
- Security headers (Helmet)

### Performance Configuration (`performance.ts`)
- Cache settings and TTL
- Compression configuration
- Monitoring thresholds
- Query optimization

### External Services (`external-services.ts`)
- Threat intelligence APIs
- Malware analysis services
- CVE databases
- Service timeouts and retries

### Environment Settings (`environment.ts`)
- Environment names and modes
- Debug flags
- Metrics collection
- Health check settings
- Profiling options

### Logging Configuration (`logging.ts`)
- Log levels and formats
- Output destinations (console, file, syslog)
- File rotation settings
- Audit logging

### Feature Flags (`feature-flags.ts`)
- Module enablement flags
- Feature toggles
- A/B testing configuration
- Rollout controls

## Environment Variables

The configuration system supports the following environment variables:

### Database
- `DB_TYPE`: Database type (mongodb, postgresql, mysql, sqlite)
- `DB_HOST`: Database host
- `DB_PORT`: Database port
- `DB_NAME`: Database name
- `DB_USERNAME`: Database username
- `DB_PASSWORD`: Database password
- `DB_SSL`: Enable SSL (true/false)

### Security
- `JWT_SECRET`: JWT signing secret
- `JWT_EXPIRES_IN`: JWT expiration time
- `JWT_REFRESH_EXPIRES_IN`: JWT refresh token expiration
- `ENCRYPTION_ALGORITHM`: Encryption algorithm
- `CSRF_SECRET`: CSRF protection secret

### Logging
- `LOG_LEVEL`: Logging level (error, warn, info, debug, trace)
- `LOG_FORMAT`: Log format (json, text)
- `LOG_FILE`: Enable file logging (true/false)
- `LOG_FILE_PATH`: Log file path
- `LOG_MAX_FILE_SIZE`: Maximum log file size
- `LOG_MAX_FILES`: Maximum number of log files

### Rate Limiting
- `RATE_LIMIT_WINDOW_MS`: Rate limit window in milliseconds
- `RATE_LIMIT_MAX`: Maximum requests per window
- `RATE_LIMIT_SKIP_SUCCESS`: Skip successful requests (true/false)
- `RATE_LIMIT_SKIP_FAILED`: Skip failed requests (true/false)

## Configuration Interface

```typescript
interface PhantomCoresConfig {
  api: APIConfig;
  database: DatabaseConfig;
  security: SecurityConfig;
  externalServices: ExternalServicesConfig;
  performance: PerformanceConfig;
  logging: LoggingConfig;
  environment: EnvironmentConfig;
  features: FeatureFlagsConfig;
}
```

## Migration Guide

### From Hardcoded Values

**Before:**
```typescript
const apiTimeout = 30000;
const dbHost = 'localhost';
const jwtSecret = 'hardcoded-secret';
```

**After:**
```typescript
import { DEFAULT_CONFIG } from '../configs';

const apiTimeout = DEFAULT_CONFIG.api.timeout;
const dbHost = DEFAULT_CONFIG.database.host;
const jwtSecret = DEFAULT_CONFIG.security.jwt.secret;
```

### From Constants Directory

**Before:**
```typescript
import { THREAT_LEVELS } from '../constants/threats';
import { IOC_TYPES } from '../constants/malware';
```

**After:**
```typescript
import { THREAT_LEVELS, IOC_TYPES } from '../configs';
// or
import { THREAT_LEVELS, IOC_TYPES } from '../constants'; // still works
```

### Using Configuration in Handlers

**Before:**
```typescript
export function handleRequest() {
  const timeout = 30000; // hardcoded
  const baseUrl = '/api/phantom-cores'; // hardcoded
  // ...
}
```

**After:**
```typescript
import { DEFAULT_CONFIG } from '../configs';

export function handleRequest() {
  const timeout = DEFAULT_CONFIG.api.timeout;
  const baseUrl = DEFAULT_CONFIG.api.baseUrl;
  // ...
}
```

## Best Practices

1. **Use Type-Safe Imports**: Always import configurations with proper typing
2. **Environment-Specific Configs**: Use appropriate overrides for different environments
3. **Validate Configuration**: Always validate configuration before using in production
4. **Secure Secrets**: Use environment variables for sensitive information
5. **Document Changes**: Update this README when adding new configuration options
6. **Test Configuration**: Include configuration in unit and integration tests
7. **Centralized Updates**: Make configuration changes in this directory only

## Validation

The configuration system includes validation functions:

```typescript
import { validateConfig } from '../configs';

const errors = validateConfig(config);
if (errors.length > 0) {
  console.error('Configuration validation failed:', errors);
  // Handle errors appropriately
}
```

Common validation checks:
- Required fields are present
- Values are within acceptable ranges
- Secret keys meet security requirements
- Database connection parameters are valid
- External service URLs are properly formatted

## Benefits

1. **Maintainability**: Single place to update configuration
2. **Type Safety**: Compile-time validation of configuration structure
3. **Environment Flexibility**: Easy switching between environments
4. **Security**: Proper handling of secrets and sensitive data
5. **Consistency**: Standardized configuration across all modules
6. **Documentation**: Self-documenting through TypeScript interfaces
7. **Testing**: Easy mocking and testing of different configurations
8. **Performance**: Optimized loading and caching of configuration data

## Future Enhancements

- **Hot Reloading**: Dynamic configuration updates without restart
- **Remote Configuration**: Load configuration from external sources
- **Configuration UI**: Web interface for configuration management
- **Advanced Validation**: Schema validation with detailed error messages
- **Configuration Versioning**: Track configuration changes over time
- **A/B Testing**: Advanced feature flag management
- **Configuration Backup**: Automated backup and restore capabilities
