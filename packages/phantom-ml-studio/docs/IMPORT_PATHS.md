# Import Path Centralization Guide

This document outlines the centralized import path system implemented to eliminate complex relative imports and improve code maintainability.

## 🎯 Overview

The codebase now uses centralized import paths with TypeScript path mapping to replace complex relative imports like `../../../lib/api/phantom-cores-client` with clean, absolute imports like `@/api/phantom-cores-client`.

## 📁 Path Mapping Configuration

### TypeScript Configuration (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/config/*": ["./src/config/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/api/*": ["./src/lib/api/*"],
      "@/core/*": ["./src/lib/core/*"],
      "@/models/*": ["./src/lib/models/*"],
      "@/monitoring/*": ["./src/lib/monitoring/*"],
      "@/analytics/*": ["./src/lib/analytics/*"],
      "@/caching/*": ["./src/lib/caching/*"],
      "@/security/*": ["./src/security/*"],
      "@/theme/*": ["./src/theme/*"],
      "@/components/*": ["./src/components/*"],
      "@/features/*": ["./src/features/*"],
      "@/utils/*": ["./src/utils/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/shared/*": ["./src/shared/*"]
    }
  }
}
```

## 🔄 Migration Examples

### Before (Complex Relative Imports)
```typescript
// ❌ Hard to read and maintain
import { phantomCoresClient } from '../../../lib/api/phantom-cores-client';
import { BusinessLogicBase } from '../../../lib/core';
import { PerformanceMonitor } from '../../../lib/monitoring/performance-monitor';
import { EnterpriseCache } from '../../../lib/caching/enterprise-cache';
```

### After (Clean Absolute Imports)
```typescript
// ✅ Clean and maintainable
import { phantomCoresClient } from '@/api/phantom-cores-client';
import { BusinessLogicBase } from '@/core';
import { PerformanceMonitor } from '@/monitoring/performance-monitor';
import { EnterpriseCache } from '@/caching/enterprise-cache';
```

## 📚 Import Categories

### Core Business Logic
```typescript
import {
  BusinessLogicBase,
  ServiceDefinition,
  ServiceContext,
  BusinessLogicRequest,
  BusinessLogicResponse
} from '@/core';
```

### API Clients
```typescript
import { phantomCoresClient } from '@/api/phantom-cores-client';
import { mlModelClient } from '@/api/ml-model-client';
```

### Monitoring & Analytics
```typescript
import { PerformanceMonitor } from '@/monitoring/performance-monitor';
import { HealthMonitor } from '@/monitoring/health-monitor';
import { AnalyticsEngine } from '@/analytics/analytics-engine';
```

### Caching & Security
```typescript
import { EnterpriseCache } from '@/caching/enterprise-cache';
import { JWTAuthenticationService } from '@/security/jwt-authentication';
import { RBACSystem } from '@/security/rbac-system';
```

### Database Models
```typescript
import { User } from '@/models/User.model';
import { Project } from '@/models/Project.model';
import { MLModel } from '@/models/Model.model';
```

### Theme & Styling
```typescript
import { theme } from '@/theme/theme';
```

## 🛠️ Centralized Import Configuration

For convenience, commonly used imports are re-exported from `@/config/import-paths`:

```typescript
// Single import for multiple related items
import {
  BusinessLogicBase,
  phantomCoresClient,
  PerformanceMonitor,
  EnterpriseCache
} from '@/config/import-paths';
```

## 🔄 Migration Tools

### Automatic Migration Script

Use the migration script to automatically convert existing relative imports:

```bash
# Preview changes (dry-run)
npm run migrate-imports -- --dry-run

# Apply migrations
npm run migrate-imports
```

### Migration Rules

The script applies these transformation rules:

| Pattern | Replacement | Example |
|---------|-------------|---------|
| `../../../lib/core` | `@/core` | Core business logic |
| `../../../lib/api/*` | `@/api/*` | API clients |
| `../../../lib/monitoring/*` | `@/monitoring/*` | Monitoring services |
| `../../../lib/caching/*` | `@/caching/*` | Caching services |
| `../../../security/*` | `@/security/*` | Security services |
| `../../../lib/models/*` | `@/models/*` | Database models |

## 🎨 IDE Configuration

### VS Code

Add to your VS Code settings for better IntelliSense:

```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "typescript.preferences.includePackageJsonAutoImports": "auto"
}
```

### WebStorm/IntelliJ

The TypeScript path mapping in `tsconfig.json` is automatically recognized.

## 🧪 Testing Import Paths

### Validation Utility

```typescript
import { validatePathConfiguration } from '@/utils/path-validation';

// Validate all configured paths
const validation = validatePathConfiguration();
if (!validation.valid) {
  console.error('Path validation errors:', validation.errors);
}
```

### Debug Tools

```typescript
import { debugPaths, debugPath } from '@/utils/path-debug';

// Development mode only
debugPaths(); // Show all configured paths
debugPath('@/api/phantom-cores-client'); // Analyze specific path
```

## 📝 Best Practices

### 1. Always Use Absolute Imports
```typescript
// ✅ Good
import { MyService } from '@/services/MyService';

// ❌ Avoid
import { MyService } from '../../../services/MyService';
```

### 2. Group Related Imports
```typescript
// ✅ Good - Grouped by category
import { BusinessLogicBase } from '@/core';
import { phantomCoresClient } from '@/api/phantom-cores-client';
import { PerformanceMonitor } from '@/monitoring/performance-monitor';

// ❌ Avoid - Mixed order
import { PerformanceMonitor } from '@/monitoring/performance-monitor';
import { BusinessLogicBase } from '@/core';
import { phantomCoresClient } from '@/api/phantom-cores-client';
```

### 3. Use Type-Only Imports When Appropriate
```typescript
// ✅ Good
import type { UserType } from '@/models/User.model';
import { User } from '@/models/User.model';
```

### 4. Leverage Centralized Exports
```typescript
// ✅ Good - Single import source
import {
  BusinessLogicBase,
  phantomCoresClient,
  PerformanceMonitor
} from '@/config/import-paths';

// ❌ Less optimal - Multiple import sources
import { BusinessLogicBase } from '@/core';
import { phantomCoresClient } from '@/api/phantom-cores-client';
import { PerformanceMonitor } from '@/monitoring/performance-monitor';
```

## 🔧 Troubleshooting

### Common Issues

1. **Import not found**: Verify the path mapping in `tsconfig.json`
2. **TypeScript errors**: Restart TypeScript language service
3. **Build errors**: Ensure Next.js recognizes the path mappings

### Next.js Configuration

Ensure `next.config.js` has proper module resolution:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    externalDir: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };
    return config;
  },
};
```

## 📊 Migration Progress

Track migration progress with these commands:

```bash
# Count remaining relative imports
grep -r "from ['\"][.][.][/]" src/ --include="*.ts" --include="*.tsx" | wc -l

# Find specific patterns
grep -r "from ['\"][.][.][/][.][.][/][.][.][/]lib" src/ --include="*.ts" --include="*.tsx"
```

## 🚀 Benefits

- **Improved Readability**: Clean, absolute imports are easier to understand
- **Better Maintainability**: Moving files doesn't break import paths
- **Enhanced IDE Support**: Better IntelliSense and auto-completion
- **Consistent Code Style**: Standardized import patterns across the codebase
- **Easier Refactoring**: Path mappings make large-scale changes simpler

## 📋 Checklist

- [ ] TypeScript path mapping configured
- [ ] Import path configuration created
- [ ] Migration script executed
- [ ] All relative imports converted
- [ ] Build and tests passing
- [ ] IDE configured for optimal experience
- [ ] Team documentation updated