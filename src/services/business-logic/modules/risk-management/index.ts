/**
 * Risk Management & Compliance Modules
 * Export all risk management business logic modules
 */

import { riskAssessmentRules } from './RiskAssessmentEngine';
import { complianceMonitoringRules } from './ComplianceMonitoringService';
import { policyEnforcementRules } from './PolicyEnforcementEngine';
import { auditTrailManagementRules } from './AuditTrailManagement';
import { controlEffectivenessRules } from './ControlEffectivenessMeasurement';
import { regulatoryReportingRules } from './RegulatoryReportingAutomation';
import { businessImpactAnalysisRules } from './BusinessImpactAnalysis';
import { thirdPartyRiskManagementRules } from './ThirdPartyRiskManagement';

// Export individual rule sets
export {
  riskAssessmentRules,
  complianceMonitoringRules,
  policyEnforcementRules,
  auditTrailManagementRules,
  controlEffectivenessRules,
  regulatoryReportingRules,
  businessImpactAnalysisRules,
  thirdPartyRiskManagementRules
};

// Aggregate all risk management rules
export const allRiskManagementRules = [
  ...riskAssessmentRules,
  ...complianceMonitoringRules,
  ...policyEnforcementRules,
  ...auditTrailManagementRules,
  ...controlEffectivenessRules,
  ...regulatoryReportingRules,
  ...businessImpactAnalysisRules,
  ...thirdPartyRiskManagementRules
];