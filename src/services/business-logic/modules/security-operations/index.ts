/**
 * Security Operations & Response Modules
 * Export all security operations business logic modules
 */

import { incidentResponseAutomationRules } from './IncidentResponseAutomation';
import { securityOrchestrationRules } from './SecurityOrchestrationEngine';
import { alertTriagePrioritizationRules } from './AlertTriagePrioritization';
import { forensicAnalysisWorkflowRules } from './ForensicAnalysisWorkflow';
import { containmentStrategyRules } from './ContainmentStrategyEngine';
import { recoveryOperationsRules } from './RecoveryOperationsManager';
import { threatHuntingAutomationRules } from './ThreatHuntingAutomation';
import { securityMetricsDashboardRules } from './SecurityMetricsDashboard';

// Export individual rule sets
export {
  incidentResponseAutomationRules,
  securityOrchestrationRules,
  alertTriagePrioritizationRules,
  forensicAnalysisWorkflowRules,
  containmentStrategyRules,
  recoveryOperationsRules,
  threatHuntingAutomationRules,
  securityMetricsDashboardRules
};

// Aggregate all security operations rules
export const allSecurityOperationsRules = [
  ...incidentResponseAutomationRules,
  ...securityOrchestrationRules,
  ...alertTriagePrioritizationRules,
  ...forensicAnalysisWorkflowRules,
  ...containmentStrategyRules,
  ...recoveryOperationsRules,
  ...threatHuntingAutomationRules,
  ...securityMetricsDashboardRules
];