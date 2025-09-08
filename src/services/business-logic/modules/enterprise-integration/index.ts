/**
 * Enterprise Integration & Automation Modules
 * Export all enterprise integration business logic modules
 */

import { workflowProcessEngineRules } from './WorkflowProcessEngine';
import { dataIntegrationPipelineRules } from './DataIntegrationPipeline';
import { apiGatewayManagementRules } from './APIGatewayManagement';
import { serviceHealthMonitoringRules } from './ServiceHealthMonitoring';
import { configurationManagementRules } from './ConfigurationManagement';
import { deploymentAutomationRules } from './DeploymentAutomation';
import { performanceOptimizationRules } from './PerformanceOptimization';
import { resourceAllocationEngineRules } from './ResourceAllocationEngine';
import { advancedAIMLIntegrationEngineRules } from './AdvancedAIMLIntegrationEngine';

// Export individual rule sets
export {
  workflowProcessEngineRules,
  dataIntegrationPipelineRules,
  apiGatewayManagementRules,
  serviceHealthMonitoringRules,
  configurationManagementRules,
  deploymentAutomationRules,
  performanceOptimizationRules,
  resourceAllocationEngineRules,
  advancedAIMLIntegrationEngineRules
};

// Aggregate all enterprise integration rules (now 9 modules total)
export const allEnterpriseIntegrationRules = [
  ...workflowProcessEngineRules,
  ...dataIntegrationPipelineRules,
  ...apiGatewayManagementRules,
  ...serviceHealthMonitoringRules,
  ...configurationManagementRules,
  ...deploymentAutomationRules,
  ...performanceOptimizationRules,
  ...resourceAllocationEngineRules,
  ...advancedAIMLIntegrationEngineRules
];