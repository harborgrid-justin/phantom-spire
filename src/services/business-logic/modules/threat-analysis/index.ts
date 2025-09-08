/**
 * Threat Analysis & Intelligence Modules
 * Export all threat analysis business logic modules
 */

import { advancedThreatDetectionRules } from './AdvancedThreatDetectionEngine';
import { threatIntelligenceCorrelationRules } from './ThreatIntelligenceCorrelationService';
import { attributionAnalysisRules } from './AttributionAnalysisEngine';
import { threatCampaignTrackingRules } from './ThreatCampaignTracking';
import { malwareAnalysisAutomationRules } from './MalwareAnalysisAutomation';
import { vulnerabilityImpactAssessmentRules } from './VulnerabilityImpactAssessment';
import { threatLandscapeMonitoringRules } from './ThreatLandscapeMonitoring';
import { intelligenceQualityScoringRules } from './IntelligenceQualityScoring';

// Export individual rule sets
export { 
  advancedThreatDetectionRules,
  threatIntelligenceCorrelationRules,
  attributionAnalysisRules,
  threatCampaignTrackingRules,
  malwareAnalysisAutomationRules,
  vulnerabilityImpactAssessmentRules,
  threatLandscapeMonitoringRules,
  intelligenceQualityScoringRules
};

// Export types
export type { ThreatDetectionRequest, ThreatDetectionResponse } from './AdvancedThreatDetectionEngine';

// Aggregate all threat analysis rules
export const allThreatAnalysisRules = [
  ...advancedThreatDetectionRules,
  ...threatIntelligenceCorrelationRules,
  ...attributionAnalysisRules,
  ...threatCampaignTrackingRules,
  ...malwareAnalysisAutomationRules,
  ...vulnerabilityImpactAssessmentRules,
  ...threatLandscapeMonitoringRules,
  ...intelligenceQualityScoringRules
];