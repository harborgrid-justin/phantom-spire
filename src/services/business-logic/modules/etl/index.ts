// ETL Business Logic Modules
export * from './extraction';
export * from './transformation';
export * from './loading';
export * from './pipeline';
export * from './monitoring';
export * from './governance';

// Business Logic Registry
export const ETLBusinessLogicRegistry = {
  'extraction': ETLExtractionBusinessLogic,
  'transformation': ETLTransformationBusinessLogic,
  'loading': ETLLoadingBusinessLogic,
  'pipeline': ETLPipelineBusinessLogic,
  'monitoring': ETLMonitoringBusinessLogic,
  'governance': ETLGovernanceBusinessLogic
};