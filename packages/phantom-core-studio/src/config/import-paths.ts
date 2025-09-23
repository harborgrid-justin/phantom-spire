/**
 * Centralized Import Path Configuration
 * Provides clean aliases for commonly used imports to replace complex relative paths
 */

// ============================================================================
// LIBRARY & API CLIENT IMPORTS
// ============================================================================

// Core business logic and types
export { BusinessLogicBase, ServiceDefinition, ServiceContext, BusinessLogicRequest, BusinessLogicResponse, ProcessResult, ValidationResult, RuleEnforcementResult, InsightResult, MetricResult, TrendPrediction, IntegrationResult, FeatureEngineeringResult, FeatureSelectionResult, EngineeredFeature, SelectedFeature } from '@/lib/core';

// Phantom ML Core
export { phantomMLCore } from '@/lib/phantom-ml-core';

// API Clients
export { phantomCoresClient } from '@/lib/api/phantom-cores-client';

// ============================================================================
// FEATURE-SPECIFIC TYPE EXPORTS
// ============================================================================

// Dashboard
export type {
  DashboardData,
  GetDashboardDataRequest,
  GetDashboardDataResponse
} from '@/lib/dashboard.types';

// Settings
export type {
  Settings,
  ApiKey,
  GetSettingsRequest,
  GetSettingsResponse,
  UpdateSettingsRequest,
  UpdateSettingsResponse,
  CreateApiKeyRequest,
  CreateApiKeyResponse,
  DeleteApiKeyRequest,
  DeleteApiKeyResponse
} from '@/features/settings/settings.types';

// Model Builder
export type {
  ModelConfig,
  AutoMLResult,
  AlgorithmType
} from '@/lib/model-builder/modelBuilder.types';

// Threat Intelligence
export type {
  ThreatModel,
  GetThreatModelsRequest,
  GetThreatModelsResponse
} from '@/lib/threatIntelligenceMarketplace.types';

// AutoML Pipeline
export type {
  AutoMLExperiment,
  GetAutoMLExperimentRequest,
  GetAutoMLExperimentResponse
} from '@/lib/automlPipelineVisualizer.types';

// Bias Detection
export type {
  ModelBiasAnalysis,
  GetModelBiasAnalysisRequest,
  GetModelBiasAnalysisResponse
} from '@/lib/biasDetectionEngine.types';

// Explainable AI
export type {
  ModelExplanation,
  GetModelExplanationRequest,
  GetModelExplanationResponse
} from '@/lib/explainableAiVisualizer.types';

// Real-time Monitoring
export type {
  ModelMetrics,
  RealTimeEvent,
  GetModelMetricsRequest,
  GetModelMetricsResponse,
  GetRealTimeEventsRequest,
  GetRealTimeEventsResponse,
  GetPerformanceDataRequest,
  GetPerformanceDataResponse
} from '@/lib/realTimeMonitoring.types';

// ============================================================================
// MONITORING & ANALYTICS SERVICES
// ============================================================================

export { PerformanceMonitor } from '@/lib/monitoring/performance-monitor';
export { HealthMonitor } from '@/lib/monitoring/health-monitor';
export { EnterpriseCache } from '@/lib/caching/enterprise-cache';
export { AnalyticsEngine } from '@/lib/analytics/analytics-engine';

// ============================================================================
// SECURITY & AUTHENTICATION
// ============================================================================

export { JWTAuthenticationService } from '@/security/jwt-authentication';
export { RBACSystem } from '@/security/rbac-system';

// ============================================================================
// MODELS & DATABASE
// ============================================================================

export { Dataset } from '@/lib/database/models/Dataset.model';
export { DatasetColumn } from '@/lib/database/models/DatasetColumn.model';
export { SampleData } from '@/lib/database/models/SampleData.model';
export { Experiment } from '@/lib/database/models/Experiment.model';
export { TrainingHistory } from '@/lib/database/models/TrainingHistory.model';
export { User } from '@/lib/database/models/User.model';
export { Project } from '@/lib/database/models/Project.model';
export { MLModel } from '@/lib/database/models/Model.model';
export { Deployment } from '@/lib/database/models/Deployment.model';
export { MetricsData } from '@/lib/database/models/MetricsData.model';
export { ApiKey } from '@/lib/database/models/ApiKey.model';
export { AuditLog } from '@/lib/database/models/AuditLog.model';
export { ThreatVector } from '@/lib/database/models/ThreatVector.model';
export { ThreatTrend } from '@/lib/database/models/ThreatTrend.model';
// ============================================================================
// COMPONENT IMPORTS (for Main Directory Structure)
// ============================================================================

// Dashboard Components
export { default as YearlyBreakup } from '@/components/dashboards/modern/YearlyBreakup';
export { default as Projects } from '@/components/dashboards/modern/Projects';
export { default as Customers } from '@/components/dashboards/modern/Customers';
export { default as SalesTwo } from '@/components/dashboards/ecommerce/SalesTwo';

// ============================================================================
// THEME & STYLING
// ============================================================================

export { theme } from '@/theme/theme';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Helper function to create service imports
 */
export const createServiceImport = <T>(servicePath: string): Promise<T> => {
  return import(servicePath);
};

/**
 * Helper function for dynamic component imports
 */
export const createComponentImport = (componentPath: string) => {
  return import(componentPath);
};

// ============================================================================
// CONDITIONAL EXPORTS FOR DIFFERENT ENVIRONMENTS
// ============================================================================

/**
 * Development-specific imports
 */
export const DevImports = process.env.NODE_ENV === 'development' ? {
  TestUtils: () => import('@/utils/test-utils'),
  MockData: () => import('@/lib/mock-data'),
} : {};

/**
 * Production-specific imports
 */
export const ProdImports = process.env.NODE_ENV === 'production' ? {
  Analytics: () => import('@/lib/analytics'),
  Monitoring: () => import('@/lib/monitoring'),
} : {};

// ============================================================================
// LEGACY SUPPORT
// ============================================================================

/**
 * Legacy import mappings for backward compatibility
 * @deprecated Use the new centralized imports instead
 */
export const LegacyImports = {
  /**
   * @deprecated Use: import { phantomCoresClient } from '@/config/import-paths'
   */
  phantomCoresClient: () => import('@/lib/api/phantom-cores-client'),

  /**
   * @deprecated Use: import { BusinessLogicBase } from '@/config/import-paths'
   */
  BusinessLogicCore: () => import('@/lib/core'),

  /**
   * @deprecated Use: import { PerformanceMonitor } from '@/config/import-paths'
   */
  Monitoring: () => import('@/lib/monitoring'),
} as const;