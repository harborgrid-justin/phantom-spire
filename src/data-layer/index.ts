/**
 * Data Layer Module Exports
 * Main entry point for the modular data layer
 */

// Core components
export {
  DataLayerOrchestrator,
  IDataLayerConfig,
  IDataLayerMetrics,
} from './DataLayerOrchestrator.js';
export {
  DataFederationEngine,
  IFederatedQuery,
  IFederatedResult,
} from './core/DataFederationEngine.js';
export { BaseDataSource } from './core/BaseDataSource.js';
export { MongoDataSource } from './core/MongoDataSource.js';
export { PostgreSQLDataSource } from './core/PostgreSQLDataSource.js';
export { RedisDataSource } from './core/RedisDataSource.js';
export { ElasticsearchDataSource } from './core/ElasticsearchDataSource.js';

// Analytics
export {
  AdvancedAnalyticsEngine,
  IAnalyticsResult,
  IPatternDefinition,
  IThreatModel,
  IAnomalyDetectionResult,
  ITimeSeriesPoint,
} from './analytics/AdvancedAnalyticsEngine.js';

// Connectors
export { BaseDataConnector } from './connectors/BaseDataConnector.js';
export {
  RestApiConnector,
  IRestApiConfig,
} from './connectors/RestApiConnector.js';

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
} from './interfaces/IDataSource.js';

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
} from './interfaces/IDataConnector.js';

export {
  IGraphAnalyzer,
  IGraphNode,
  IGraph,
  IEntityResolver,
  IPatternResult,
} from './interfaces/IGraphAnalyzer.js';

// Services
export {
  EnhancedIOCService,
  IEnhancedIOCQuery,
  IEnhancedIOCResult,
  IIOCEnrichmentResult,
} from '../services/enhancedIOCService.js';
