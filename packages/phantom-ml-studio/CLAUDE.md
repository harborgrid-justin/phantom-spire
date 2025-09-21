# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
npm run dev         # Start development server with Turbopack
npm run build       # Build for production with Turbopack
npm run start       # Start production server
npm run lint        # Run ESLint for code quality
```

### Testing Framework
The project uses Cypress for end-to-end testing, including comprehensive prefetch regression tests:

```bash
npm run cypress:open      # Open Cypress test runner
npm run cypress:run       # Run tests headlessly
npm run test:e2e         # Run all e2e tests
```

**Prefetch Testing**: See `cypress/e2e/prefetch-regression.cy.ts` for automated prefetch behavior testing.

## Project Overview

**Phantom ML Studio** is an enterprise-grade machine learning platform that serves as the web UI component of the larger Phantom Spire cybersecurity intelligence platform. It provides ML model development and deployment capabilities that compete with platforms like H2O.ai.

### Key Technologies
- **Framework**: Next.js 15.5.3 with App Router
- **UI Library**: Material-UI (MUI) v7 with custom theming
- **Styling**: Tailwind CSS 4 with custom theme integration
- **Charts/Visualization**: Recharts, Plotly.js, MUI X-Charts
- **ML Libraries**:
  - Hugging Face Hub and Transformers
  - ml-random-forest, ml-regression-simple-linear
- **Data Processing**: PapaParse for CSV, Lodash utilities
- **State Management**: TanStack React Query v5
- **Forms**: React Hook Form with Yup validation

## Architecture

### Service-Oriented Architecture
The application follows a modular service-based architecture with clear separation of concerns:

```
src/
├── app/                    # Next.js App Router pages
├── services/              # Business logic services
│   ├── core/             # Core service infrastructure
│   ├── dashboard/        # Dashboard-related services
│   ├── automl-pipeline-visualizer/
│   ├── bias-detection-engine/
│   ├── data-explorer/
│   ├── deployments/
│   ├── experiments/
│   ├── explainable-ai-visualizer/
│   ├── interactive-feature-engineering/
│   ├── model-builder/
│   ├── models/
│   ├── multi-model-ab-testing/
│   ├── real-time-monitoring/
│   ├── settings/
│   ├── shared/           # Shared utilities
│   ├── threat-intelligence-marketplace/
│   └── training-orchestrator/
├── theme/                # Material-UI theme configuration
└── utils/                # Utility functions
```

### Core Service Pattern
All services follow a standardized business logic pattern defined in `src/services/core/types/business-logic.types.ts`:

- **BusinessLogicRequest/Response**: Standardized request/response interfaces
- **Comprehensive Error Handling**: Typed error responses with severity levels
- **Performance Metrics**: Built-in performance tracking
- **Validation System**: Structured validation with errors and warnings
- **Business Rules Engine**: Configurable rule system with conditions and actions
- **Analytics Integration**: Insights, metrics, and trend prediction capabilities

### Page Structure
Each major feature has its own page in the app directory:
- `dashboard/` - Main dashboard with overview metrics
- `automl-pipeline-visualizer/` - AutoML pipeline visualization
- `bias-detection-engine/` - ML bias detection and mitigation
- `data-explorer/` - Data exploration and analysis
- `deployments/` - Model deployment management
- `experiments/` - ML experiment tracking
- `explainable-ai-visualizer/` - AI explainability tools
- `interactive-feature-engineering/` - Feature engineering interface
- `model-builder/` - ML model creation and training
- `models/` - Model management and versioning
- `multi-model-ab-testing/` - A/B testing for models
- `real-time-monitoring/` - Real-time model monitoring
- `settings/` - Application configuration
- `threat-intelligence-marketplace/` - Threat intelligence integration

## Theme and Styling

### Material-UI Integration
The project uses a sophisticated theming system that integrates MUI with Tailwind CSS:

- **Theme Definition**: Custom theme in `src/theme/theme.ts`
- **Tailwind Integration**: Theme colors mapped to Tailwind in `tailwind.config.ts`
- **Custom Gradients**: Phantom-branded gradients (phantom-gradient, security-gradient, ml-gradient)
- **Typography**: Custom font families and sizing

### ThemeRegistry
Uses `@mui/material-nextjs` for server-side rendering compatibility with MUI themes.

## Hugging Face Integration

The platform includes sophisticated Hugging Face integration for enterprise ML workflows:

### Model Integration
- **HuggingFaceModelBase**: Base class for Hugging Face model interactions (`src/models/HuggingFaceModelBase.ts`)
- **HuggingFaceAutoMLIntegration**: AutoML capabilities with Hugging Face models (`src/models/HuggingFaceAutoMLIntegration.ts`)

### Capabilities
- Model discovery and selection from Hugging Face Hub
- Automated model fine-tuning and deployment
- Integration with the broader business logic system
- Performance monitoring and analytics

## Business Logic System

### Enterprise-Grade Features
The business logic system supports enterprise requirements:

- **Multi-tenant Architecture**: Tenant isolation and context
- **Audit Logging**: Comprehensive activity tracking
- **Performance Monitoring**: Real-time metrics collection
- **Workflow Integration**: BPM integration capabilities
- **Security Context**: User permissions and session management

### Analytics and Insights
Built-in analytics capabilities include:
- **Trend Analysis**: Pattern recognition and anomaly detection
- **Predictive Analytics**: Forecasting with confidence intervals
- **Recommendation Engine**: Actionable insights with priority scoring
- **KPI Tracking**: Metrics with thresholds and targets

## Development Patterns

### Component Organization
- Follow Material-UI component patterns
- Use consistent naming conventions across services
- Implement proper TypeScript interfaces for all data structures
- Leverage the business logic types for consistency

### Error Handling
- Use the standardized `BusinessLogicError` interface
- Implement proper validation with `ValidationResult`
- Provide meaningful error messages with context
- Include performance metrics in all responses

### State Management
- Use TanStack React Query for server state
- Implement proper loading and error states
- Cache data appropriately with query invalidation
- Follow React best practices for local state

## Integration with Phantom Spire Platform

This ML Studio is part of the larger Phantom Spire cybersecurity platform:
- Integrates with 19 NAPI-RS security modules
- Supports multi-database architecture (MongoDB, PostgreSQL, MySQL, Redis, Elasticsearch)
- Provides ML capabilities for threat intelligence analysis
- Follows enterprise security and compliance standards

## Configuration

### Environment Setup
- Uses Next.js environment variable conventions
- Supports multiple deployment environments
- Integrates with Docker-based development stack
- Follows security best practices for configuration management

### PostCSS Configuration
Simple PostCSS setup with Tailwind CSS and Autoprefixer in `postcss.config.mjs`.

## Performance Considerations

- **Turbopack**: Uses Turbopack for faster development builds
- **Code Splitting**: Leverage Next.js automatic code splitting
- **Lazy Loading**: Implement lazy loading for components and data
- **Caching**: Use React Query caching for API responses
- **Monitoring**: Built-in performance monitoring in business logic layer

### Prefetching Strategy

The application implements a sophisticated prefetching strategy to optimize navigation performance while respecting user bandwidth and device constraints:

#### Automatic Prefetching
- **Default Behavior**: All standard Next.js `<Link>` components have automatic prefetching enabled in production
- **Viewport-based**: Only links visible in the viewport are automatically prefetched
- **TTL**: Prefetched content is cached for 5 minutes or until app reload

#### Resource-Heavy Route Management
Routes marked as `isResourceHeavy: true` have prefetching disabled to prevent unnecessary bandwidth usage:
- **Data Explorer** (`/dataExplorer`) - Large dataset processing
- **Deployments** (`/deployments`) - Heavy deployment management interface
- **Real-time Monitoring** (`/monitoring`) - Live data streams
- **AutoML Pipeline** (`/automlPipeline`) - Complex pipeline visualization
- **Feature Engineering** (`/featureEngineering`) - Data transformation interfaces
- **Model Comparison** (`/model-comparison`) - Multi-model analysis views
- **Explainable AI** (`/explainableAi`) - Complex visualization components
- **Threat Intelligence** (`/threatIntelligence`) - Large security datasets
- **Analytics** (`/h2o-comparison`) - Heavy analytical dashboards

#### Connection-Aware Prefetching
The application includes connection-aware prefetching that automatically adjusts behavior based on network conditions:

```typescript
// Usage in components
import { useConnectionAwarePrefetch } from '@/hooks/useConnectionAwarePrefetch';

const { shouldPrefetch, reason } = useConnectionAwarePrefetch();
```

**Automatic Prefetch Disabling:**
- **Data Saver Mode**: Respects user's data saver preference
- **Slow Connections**: Disabled on 2G and slow-2G connections
- **Low Bandwidth**: Disabled when downlink < 0.5 Mbps
- **Low Memory Devices**: Disabled when device memory < 2GB (P.38)
- **Limited CPU**: Disabled when hardware concurrency < 2 cores (P.38)
- **Connection Changes**: Dynamically adjusts when network conditions change

#### Loading States
Dynamic routes include optimized loading states to improve perceived performance during prefetch boundaries:
- `src/app/projects/[projectId]/loading.tsx` - Project loading skeleton
- `src/app/projects/[projectId]/models/[modelId]/loading.tsx` - Model detail loading
- `src/app/users/[id]/loading.tsx` - User profile loading
- `src/app/docs/[...slug]/loading.tsx` - Documentation loading
- `src/app/blog/[[...slug]]/loading.tsx` - Blog content loading

#### Best Practices for Developers

**When to Disable Prefetching:**
```typescript
// For resource-heavy routes
<Link href="/heavy-dashboard" prefetch={false}>
  Heavy Dashboard
</Link>

// For rarely visited pages
<Link href="/admin/advanced-settings" prefetch={false}>
  Advanced Settings
</Link>
```

**Connection-Aware Components:**
```typescript
import { ConnectionAwareLink } from '@/components/common/ConnectionAwareLink';

// Automatically adjusts prefetching based on connection
<ConnectionAwareLink href="/data-intensive-page">
  Data Page
</ConnectionAwareLink>

// Force prefetching regardless of connection
<ConnectionAwareLink href="/critical-page" forcePrefetch={true}>
  Critical Page
</ConnectionAwareLink>
```

**Monitoring Prefetch Decisions:**
In development mode, prefetch decisions are logged with debug attributes:
- `data-prefetch-enabled`: Whether prefetching is active
- `data-prefetch-reason`: Reason for prefetch decision
- `data-connection-type`: Current connection type

#### Security Considerations
- **No Sensitive Data**: Prefetching never includes routes with sensitive data
- **Authentication Routes**: Login/logout routes use default prefetching
- **Privacy Compliance**: Respects user's data saver and privacy preferences

#### Performance Monitoring
The application tracks prefetch effectiveness through:
- Navigation timing metrics
- Failed prefetch logs
- Connection-aware decision analytics
- Cache hit rates for prefetched content

**Prefetch Analytics Usage:**
```typescript
import { usePrefetchAnalytics } from '@/utils/prefetch-analytics';

const { getSummary, exportMetrics, trackTiming } = usePrefetchAnalytics();

// Track prefetch timing
const stopTiming = trackTiming('/dashboard');
// ... prefetch logic
stopTiming();

// Get analytics summary
const summary = getSummary();
console.log('Prefetch hit rate:', summary.navigationMetrics.prefetchHitRate);
```

#### Cache Management
**Cache TTL Configuration (P.7):**
- Production: 5-minute TTL with stale-while-revalidate
- Development: No caching for immediate updates

**Cache Invalidation Strategies (P.34):**
```typescript
import { invalidateCacheTag, smartInvalidate } from '@/utils/cache-invalidation';

// Invalidate specific content types
await smartInvalidate('model', modelId);
await invalidateCacheTag('dashboard');
```

#### Manual Prefetching (P.2)
For off-screen or special UX scenarios:
```typescript
import { useManualPrefetch } from '@/hooks/useManualPrefetch';

const { prefetchCriticalOffScreen, prefetchOnUserIntent } = useManualPrefetch();

// Prefetch critical off-screen routes
useEffect(() => {
  prefetchCriticalOffScreen();
}, []);

// Prefetch on user intent (hover, focus)
<button onMouseEnter={() => prefetchOnUserIntent('/settings')}>
  Settings
</button>
```

#### Troubleshooting Prefetch Issues (P.49)
Common prefetch problems and solutions:

1. **Prefetch Not Working**: Check browser network tab for prefetch requests
2. **Too Many Prefetches**: Review `isResourceHeavy` flags in navigation config
3. **Slow Navigation**: Verify prefetch cache hits in analytics
4. **Connection Issues**: Check `data-prefetch-reason` attributes in dev mode
5. **Cache Stale**: Use cache invalidation utilities for fresh content

**Debug Mode**: Set `data-prefetch-debug="true"` on links for detailed logging.

## Next.js Navigation and Linking Guidelines

### N.33: Navigation Decision Documentation

This section documents all navigation and linking decisions for developers working on the Phantom ML Studio application.

#### Core Navigation Principles

1. **Always Use Link Components**: All internal navigation must use Next.js `<Link>` components to enable client-side routing and prefetching.

2. **External Link Security**: External links must include `target="_blank"` and `rel="noopener noreferrer"` for security.

3. **Dynamic Route Patterns**: Use template literals for dynamic routes (e.g., `/projects/${projectId}`).

#### Navigation Component Hierarchy

```typescript
// Standard internal navigation
<Link href="/dashboard">Dashboard</Link>

// Connection-aware navigation (respects bandwidth)
<ConnectionAwareLink href="/data-explorer">Data Explorer</ConnectionAwareLink>

// Navigation with progress feedback
<LinkWithStatus href="/models" showProgress={true}>Models</LinkWithStatus>

// Large list navigation (limits prefetching)
<LazyPrefetchLink href="/item/123">Item 123</LazyPrefetchLink>

// User-friendly blocking for unsaved changes
<BlockableLink href="/exit" hasUnsavedChanges={isDirty}>Exit</BlockableLink>
```

#### Prefetch Strategy by Route Type

- **Static Routes** (`/`, `/dashboard`, `/settings`): Auto-prefetch enabled
- **Resource-Heavy Routes** (`/data-explorer`, `/deployments`): Prefetch disabled
- **Dynamic Routes** (`/projects/[id]`): Conditional prefetch with loading states
- **External Routes**: No prefetch, security attributes required

#### Performance Guidelines

- **Large Lists**: Use `LazyPrefetchLink` to limit concurrent prefetches (max 3)
- **Navigation Metrics**: All navigation is automatically tracked for Core Web Vitals
- **Loading States**: Dynamic routes include `loading.tsx` for immediate feedback
- **Error Boundaries**: Navigation failures gracefully fall back to standard navigation

#### Accessibility Requirements

- All links must have accessible labels (`aria-label` or visible text)
- Active navigation states use `aria-current="page"`
- Hash navigation maintains focus and supports smooth scrolling
- Keyboard navigation supported with proper focus management

#### Developer Guidelines

**When to Use Each Component:**

- `Link`: Standard internal navigation
- `ConnectionAwareLink`: Data-sensitive routes (respects user's connection)
- `LazyPrefetchLink`: Items in large lists or tables
- `BlockableLink`: Forms or editors with unsaved changes
- `EnhancedLink`: Advanced scroll/replace behavior needed

**Navigation Blocking Pattern:**
```typescript
const { navigateWithConfirmation, hasUnsavedChanges } = useNavigationBlocker({
  hasUnsavedChanges: formIsDirty,
  message: 'You have unsaved changes. Continue?',
});

// Use navigateWithConfirmation() for programmatic navigation
```

**Performance Monitoring:**
```typescript
const { getCoreWebVitalsScore, getSummary } = useNavigationMetrics();

// Monitor navigation performance
const score = getCoreWebVitalsScore(); // A-D grade
const metrics = getSummary(); // Detailed timing data
```

#### Testing Requirements

- All navigation components have Cypress E2E tests
- Edge cases tested: slow networks, cancelled navigation, prefetch failures
- Accessibility tested with keyboard and screen reader navigation
- Performance metrics validated in CI/CD pipeline

#### Troubleshooting Navigation Issues

1. **Slow Navigation**: Check prefetch status and Core Web Vitals metrics
2. **Broken Client-Side Routing**: Verify Link components used instead of `<a>` tags
3. **Prefetch Issues**: Review network conditions and resource-heavy route flags
4. **Accessibility Problems**: Validate `aria-label` attributes and focus management
5. **Performance Degradation**: Monitor navigation metrics dashboard

#### Next.js Version Compatibility

**N.40: Update Tracking**: This documentation is maintained for Next.js 15.5.3. When upgrading:

1. Review Next.js changelog for Link/Router API changes
2. Update ESLint rules for deprecated patterns
3. Test navigation components with new Next.js version
4. Update documentation with any breaking changes

See `N.40: Update Tracking` section for specific upgrade procedures.

## Security

- **Metadata Configuration**: Disabled search engine indexing for security
- **CORS Configuration**: Proper CORS setup for API endpoints
- **Authentication**: JWT-based authentication ready
- **Audit Trails**: Comprehensive logging for compliance