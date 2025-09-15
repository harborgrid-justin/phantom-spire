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

### No Testing Framework
This project currently does not have a testing framework configured. When implementing tests, first research the existing codebase to determine what testing approach should be used.

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

## Security

- **Metadata Configuration**: Disabled search engine indexing for security
- **CORS Configuration**: Proper CORS setup for API endpoints
- **Authentication**: JWT-based authentication ready
- **Audit Trails**: Comprehensive logging for compliance