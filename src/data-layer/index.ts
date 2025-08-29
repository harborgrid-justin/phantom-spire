/**
 * Data Layer Module Exports
 * Main entry point for the modular data layer
 */

// Core components
export {
  DataLayerOrchestrator,
  IDataLayerConfig,
  IDataLayerMetrics,
} from './DataLayerOrchestrator';
export {
  DataFederationEngine,
  IFederatedQuery,
  IFederatedResult,
} from './core/DataFederationEngine';
export { BaseDataSource } from './core/BaseDataSource';
export { MongoDataSource } from './core/MongoDataSource';

// Analytics
export {
  AdvancedAnalyticsEngine,
  IAnalyticsResult,
  IPatternDefinition,
  IThreatModel,
  IAnomalyDetectionResult,
  ITimeSeriesPoint,
} from './analytics/AdvancedAnalyticsEngine';

// Connectors
export { BaseDataConnector } from './connectors/BaseDataConnector';
export {
  RestApiConnector,
  IRestApiConfig,
} from './connectors/RestApiConnector';

// Interfaces
export {
  IDataSource,
  IDataRecord,
  IQuery,
  IQueryContext,
  IQueryResult,
  IRelationship,
  IProvenance,
  IHealthStatus,
} from './interfaces/IDataSource';

export {
  IDataConnector,
  IConnectorConfig,
  IValidationResult,
  IExtractionRequest,
  IExtractionResult,
  ITransformationRule,
  ILoadResult,
  IDataPipeline,
  IPipelineResult,
} from './interfaces/IDataConnector';

export {
  IGraphAnalyzer,
  IGraphNode,
  IGraph,
  IEntityResolver,
  IPatternResult,
} from './interfaces/IGraphAnalyzer';

// Services
export {
  EnhancedIOCService,
  IEnhancedIOCQuery,
  IEnhancedIOCResult,
  IIOCEnrichmentResult,
} from '../services/enhancedIOCService';
