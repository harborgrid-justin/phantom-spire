// Core ML services with NAPI integration (export first to establish base types)
export * from './core';
export * from './phantom-ml-core';

// ML Pipeline services (be specific to avoid conflicts)
export { automlPipelineVisualizerService } from './automl-pipeline-visualizer';
export { TrainingOrchestrator } from './training-orchestrator';
export { modelBuilderService, enhancedModelBuilderService } from './model-builder';
export { modelsService } from './models';

// Analytics and insights services  
export { biasDetectionEngineService } from './bias-detection-engine';
export { explainableAiVisualizerService } from './explainable-ai-visualizer';
export { dataExplorerService } from './data-explorer';

// Deployment and monitoring services
export { deploymentsService } from './deployments';
export { realTimeMonitoringService } from './real-time-monitoring';
export { multiModelAbTestingService } from './multi-model-ab-testing';

// Feature engineering and interactive tools
export { interactiveFeatureEngineeringService } from './interactive-feature-engineering';

// Experiments and testing
export { experimentsService } from './experiments';

// Threat intelligence integration
export { threatIntelligenceMarketplaceService } from './threat-intelligence-marketplace';

// Dashboard services
export { dashboardService } from './dashboard';

// Configuration and settings
export { settingsService } from './settings';

// Shared utilities
export * from './shared';
