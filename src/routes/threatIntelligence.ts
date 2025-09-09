/**
 * Comprehensive Threat Intelligence Routes
 * API routes for all 32 threat intelligence endpoints
 */

import { Router } from 'express';
import ComprehensiveThreatIntelController from '../controllers/threatIntelligence/comprehensiveThreatIntelController';

const router = Router();

// Advanced Analytics & Intelligence Routes (8 endpoints)
router.get(
  '/advanced-analytics/threat-analytics',
  ComprehensiveThreatIntelController.getAdvancedThreatAnalytics
);
router.get(
  '/advanced-analytics/intelligence-dashboard',
  ComprehensiveThreatIntelController.getThreatIntelligenceDashboard
);
router.get(
  '/advanced-analytics/ioc-correlation',
  ComprehensiveThreatIntelController.getIOCCorrelationEngine
);
router.get(
  '/advanced-analytics/actor-attribution',
  ComprehensiveThreatIntelController.getThreatActorAttribution
);
router.get(
  '/advanced-analytics/campaign-analysis',
  ComprehensiveThreatIntelController.getCampaignAnalysis
);
router.get(
  '/advanced-analytics/landscape-assessment',
  ComprehensiveThreatIntelController.getThreatLandscapeAssessment
);
router.get(
  '/advanced-analytics/vulnerability-mapping',
  ComprehensiveThreatIntelController.getVulnerabilityThreatMapping
);
router.get(
  '/advanced-analytics/predictive-modeling',
  ComprehensiveThreatIntelController.getPredictiveThreatModeling
);

// IOC & Indicators Management Routes (8 endpoints)
router.get(
  '/ioc-management/lifecycle-management',
  ComprehensiveThreatIntelController.getIOCLifecycleManagement
);
router.get(
  '/ioc-management/enrichment-service',
  ComprehensiveThreatIntelController.getIOCEnrichmentService
);
router.get(
  '/ioc-management/validation-system',
  ComprehensiveThreatIntelController.getIOCValidationSystem
);
router.get(
  '/ioc-management/investigation-tools',
  ComprehensiveThreatIntelController.getIOCInvestigationTools
);
router.get(
  '/ioc-management/reputation-scoring',
  ComprehensiveThreatIntelController.getIOCReputationScoring
);
router.get(
  '/ioc-management/relationship-mapping',
  ComprehensiveThreatIntelController.getIOCRelationshipMapping
);
router.get(
  '/ioc-management/source-management',
  ComprehensiveThreatIntelController.getIOCSourceManagement
);
router.get(
  '/ioc-management/export-import-hub',
  ComprehensiveThreatIntelController.getIOCExportImportHub
);

// Threat Actor & Attribution Routes (8 endpoints)
router.get(
  '/threat-actors/actor-profiles',
  ComprehensiveThreatIntelController.getThreatActorProfiles
);
router.get(
  '/threat-actors/attribution-analytics',
  ComprehensiveThreatIntelController.getAttributionAnalytics
);
router.get(
  '/threat-actors/actor-tracking',
  ComprehensiveThreatIntelController.getThreatActorTracking
);
router.get(
  '/threat-actors/capability-assessment',
  ComprehensiveThreatIntelController.getActorCapabilityAssessment
);
router.get(
  '/threat-actors/confidence-scoring',
  ComprehensiveThreatIntelController.getAttributionConfidenceScoring
);
router.get(
  '/threat-actors/collaboration-networks',
  ComprehensiveThreatIntelController.getActorCollaborationNetworks
);
router.get(
  '/threat-actors/campaign-mapping',
  ComprehensiveThreatIntelController.getActorCampaignMapping
);
router.get(
  '/threat-actors/intelligence-feeds',
  ComprehensiveThreatIntelController.getActorIntelligenceFeeds
);

// Intelligence Operations Routes (8 endpoints)
router.get(
  '/intel-operations/intelligence-sharing',
  ComprehensiveThreatIntelController.getIntelligenceSharing
);
router.get(
  '/intel-operations/collection-management',
  ComprehensiveThreatIntelController.getIntelligenceCollectionManagement
);
router.get(
  '/intel-operations/automation-engine',
  ComprehensiveThreatIntelController.getThreatIntelligenceAutomation
);
router.get(
  '/intel-operations/realtime-monitoring',
  ComprehensiveThreatIntelController.getRealtimeThreatMonitoring
);
router.get(
  '/intel-operations/workflow-engine',
  ComprehensiveThreatIntelController.getThreatIntelligenceWorkflows
);
router.get(
  '/intel-operations/source-management',
  ComprehensiveThreatIntelController.getIntelligenceSourceManagement
);
router.get(
  '/intel-operations/api-management',
  ComprehensiveThreatIntelController.getThreatIntelligenceAPIs
);
router.get(
  '/intel-operations/training-center',
  ComprehensiveThreatIntelController.getIntelligenceTrainingCenter
);

// Cyber Threat Hunting & Response Routes (8 endpoints)
router.get(
  '/threat-hunting/proactive-hunting',
  ComprehensiveThreatIntelController.getProactiveThreatHunting
);
router.get(
  '/threat-hunting/behavioral-analytics',
  ComprehensiveThreatIntelController.getBehavioralAnalyticsEngine
);
router.get(
  '/threat-hunting/hunting-playbooks',
  ComprehensiveThreatIntelController.getThreatHuntingPlaybooks
);
router.get(
  '/threat-hunting/incident-response',
  ComprehensiveThreatIntelController.getRapidIncidentResponse
);
router.get(
  '/threat-hunting/forensic-analysis',
  ComprehensiveThreatIntelController.getDigitalForensicsAnalysis
);
router.get(
  '/threat-hunting/threat-simulation',
  ComprehensiveThreatIntelController.getThreatSimulationEngine
);
router.get(
  '/threat-hunting/compromise-assessment',
  ComprehensiveThreatIntelController.getCompromiseAssessment
);
router.get(
  '/threat-hunting/response-automation',
  ComprehensiveThreatIntelController.getResponseAutomationHub
);

// Advanced Threat Detection & Prevention Routes (8 endpoints)
router.get(
  '/threat-detection/ml-detection',
  ComprehensiveThreatIntelController.getMLPoweredDetection
);
router.get(
  '/threat-detection/zero-day-protection',
  ComprehensiveThreatIntelController.getZeroDayProtection
);
router.get(
  '/threat-detection/sandbox-analysis',
  ComprehensiveThreatIntelController.getSandboxAnalysisCenter
);
router.get(
  '/threat-detection/network-monitoring',
  ComprehensiveThreatIntelController.getNetworkThreatMonitoring
);
router.get(
  '/threat-detection/endpoint-protection',
  ComprehensiveThreatIntelController.getEndpointProtectionCenter
);
router.get(
  '/threat-detection/threat-prevention',
  ComprehensiveThreatIntelController.getThreatPreventionEngine
);
router.get(
  '/threat-detection/signature-engine',
  ComprehensiveThreatIntelController.getSignatureDetectionEngine
);
router.get(
  '/threat-detection/threat-scoring',
  ComprehensiveThreatIntelController.getThreatScoringMatrix
);

export default router;
