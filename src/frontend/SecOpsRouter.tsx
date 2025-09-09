import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Incident Response Components (10 pages)
import AdvancedPlaybookOrchestratorComponent from './views/incident-response/AdvancedPlaybookOrchestratorComponent';
import AutomatedResponseWorkflowComponent from './views/incident-response/AutomatedResponseWorkflowComponent';
import EscalationManagementSystemComponent from './views/incident-response/EscalationManagementSystemComponent';
import ForensicTimelineAnalyzerComponent from './views/incident-response/ForensicTimelineAnalyzerComponent';
import EvidenceCollectionManagerComponent from './views/incident-response/EvidenceCollectionManagerComponent';
import ContainmentProcedureEngineComponent from './views/incident-response/ContainmentProcedureEngineComponent';
import RecoveryPlanningCenterComponent from './views/incident-response/RecoveryPlanningCenterComponent';
import PostIncidentAnalysisHubComponent from './views/incident-response/PostIncidentAnalysisHubComponent';
import LessonsLearnedRepositoryComponent from './views/incident-response/LessonsLearnedRepositoryComponent';
import ComplianceReportGeneratorComponent from './views/incident-response/ComplianceReportGeneratorComponent';

// Threat Hunting Components (8 pages)
import AdvancedHuntingQueryBuilderComponent from './views/threat-hunting/AdvancedHuntingQueryBuilderComponent';
import IOCTrackingDashboardComponent from './views/threat-hunting/IOCTrackingDashboardComponent';
import BehavioralAnalysisEngineComponent from './views/threat-hunting/BehavioralAnalysisEngineComponent';
import ThreatActorProfilingCenterComponent from './views/threat-hunting/ThreatActorProfilingCenterComponent';
import CampaignTrackingSystemComponent from './views/threat-hunting/CampaignTrackingSystemComponent';
import TTaPsAnalysisPlatformComponent from './views/threat-hunting/TTaPsAnalysisPlatformComponent';
import ThreatLandscapeMapperComponent from './views/threat-hunting/ThreatLandscapeMapperComponent';
import HuntingMetricsDashboardComponent from './views/threat-hunting/HuntingMetricsDashboardComponent';

// Security Monitoring Components (8 pages)
import RealTimeSecurityDashboardComponent from './views/security-monitoring/RealTimeSecurityDashboardComponent';
import AlertCorrelationEngineComponent from './views/security-monitoring/AlertCorrelationEngineComponent';
import SIEMIntegrationHubComponent from './views/security-monitoring/SIEMIntegrationHubComponent';
import LogAnalysisWorkbenchComponent from './views/security-monitoring/LogAnalysisWorkbenchComponent';
import AnomalyDetectionCenterComponent from './views/security-monitoring/AnomalyDetectionCenterComponent';
import BaselineMonitoringSystemComponent from './views/security-monitoring/BaselineMonitoringSystemComponent';
import ComplianceMonitoringDashboardComponent from './views/security-monitoring/ComplianceMonitoringDashboardComponent';
import SecurityKPIDashboardComponent from './views/security-monitoring/SecurityKPIDashboardComponent';

// Vulnerability Management Components (8 pages)
import AssetDiscoveryPlatformComponent from './views/vulnerability-management/AssetDiscoveryPlatformComponent';
import VulnerabilityScanningOrchestratorComponent from './views/vulnerability-management/VulnerabilityScanningOrchestratorComponent';
import RiskScoringEngineComponent from './views/vulnerability-management/RiskScoringEngineComponent';
import PatchManagementCenterComponent from './views/vulnerability-management/PatchManagementCenterComponent';
import RemediationTrackingSystemComponent from './views/vulnerability-management/RemediationTrackingSystemComponent';
import ComplianceValidationHubComponent from './views/vulnerability-management/ComplianceValidationHubComponent';
import ThreatCorrelationAnalyzerComponent from './views/vulnerability-management/ThreatCorrelationAnalyzerComponent';
import VulnerabilityAnalyticsDashboardComponent from './views/vulnerability-management/VulnerabilityAnalyticsDashboardComponent';

// Digital Forensics Components (7 pages)
import EvidenceAcquisitionWorkflowComponent from './views/digital-forensics/EvidenceAcquisitionWorkflowComponent';
import ForensicImagingPlatformComponent from './views/digital-forensics/ForensicImagingPlatformComponent';
import TimelineAnalysisWorkbenchComponent from './views/digital-forensics/TimelineAnalysisWorkbenchComponent';
import MalwareAnalysisLabComponent from './views/digital-forensics/MalwareAnalysisLabComponent';
import NetworkForensicsCenterComponent from './views/digital-forensics/NetworkForensicsCenterComponent';
import MobileForensicsWorkbenchComponent from './views/digital-forensics/MobileForensicsWorkbenchComponent';
import CloudForensicsAnalyzerComponent from './views/digital-forensics/CloudForensicsAnalyzerComponent';

// Compliance & Audit Components (8 pages)
import FrameworkMappingCenterComponent from './views/compliance-audit/FrameworkMappingCenterComponent';
import ControlValidationSystemComponent from './views/compliance-audit/ControlValidationSystemComponent';
import AuditTrailAnalyzerComponent from './views/compliance-audit/AuditTrailAnalyzerComponent';
import ComplianceReportingHubComponent from './views/compliance-audit/ComplianceReportingHubComponent';
import RiskAssessmentPlatformComponent from './views/compliance-audit/RiskAssessmentPlatformComponent';
import PolicyManagementCenterComponent from './views/compliance-audit/PolicyManagementCenterComponent';
import CertificationTrackingSystemComponent from './views/compliance-audit/CertificationTrackingSystemComponent';
import RemediationPlanningWorkbenchComponent from './views/compliance-audit/RemediationPlanningWorkbenchComponent';

/**
 * SecOps Router Component
 * 
 * Comprehensive routing for 49 new business-ready and customer-ready 
 * security operations pages with complete frontend-backend integration.
 */
const SecOpsRouter: React.FC = () => {
  return (
    <Routes>
      {/* Incident Response Routes (10 pages) */}
      <Route path="/incident-response/advanced-playbook-orchestrator" element={<AdvancedPlaybookOrchestratorComponent />} />
      <Route path="/incident-response/automated-response-workflow" element={<AutomatedResponseWorkflowComponent />} />
      <Route path="/incident-response/escalation-management-system" element={<EscalationManagementSystemComponent />} />
      <Route path="/incident-response/forensic-timeline-analyzer" element={<ForensicTimelineAnalyzerComponent />} />
      <Route path="/incident-response/evidence-collection-manager" element={<EvidenceCollectionManagerComponent />} />
      <Route path="/incident-response/containment-procedure-engine" element={<ContainmentProcedureEngineComponent />} />
      <Route path="/incident-response/recovery-planning-center" element={<RecoveryPlanningCenterComponent />} />
      <Route path="/incident-response/post-incident-analysis-hub" element={<PostIncidentAnalysisHubComponent />} />
      <Route path="/incident-response/lessons-learned-repository" element={<LessonsLearnedRepositoryComponent />} />
      <Route path="/incident-response/compliance-report-generator" element={<ComplianceReportGeneratorComponent />} />

      {/* Threat Hunting Routes (8 pages) */}
      <Route path="/threat-hunting/advanced-hunting-query-builder" element={<AdvancedHuntingQueryBuilderComponent />} />
      <Route path="/threat-hunting/ioc-tracking-dashboard" element={<IOCTrackingDashboardComponent />} />
      <Route path="/threat-hunting/behavioral-analysis-engine" element={<BehavioralAnalysisEngineComponent />} />
      <Route path="/threat-hunting/threat-actor-profiling-center" element={<ThreatActorProfilingCenterComponent />} />
      <Route path="/threat-hunting/campaign-tracking-system" element={<CampaignTrackingSystemComponent />} />
      <Route path="/threat-hunting/ttaps-analysis-platform" element={<TTaPsAnalysisPlatformComponent />} />
      <Route path="/threat-hunting/threat-landscape-mapper" element={<ThreatLandscapeMapperComponent />} />
      <Route path="/threat-hunting/hunting-metrics-dashboard" element={<HuntingMetricsDashboardComponent />} />

      {/* Security Monitoring Routes (8 pages) */}
      <Route path="/security-monitoring/realtime-security-dashboard" element={<RealTimeSecurityDashboardComponent />} />
      <Route path="/security-monitoring/alert-correlation-engine" element={<AlertCorrelationEngineComponent />} />
      <Route path="/security-monitoring/siem-integration-hub" element={<SIEMIntegrationHubComponent />} />
      <Route path="/security-monitoring/log-analysis-workbench" element={<LogAnalysisWorkbenchComponent />} />
      <Route path="/security-monitoring/anomaly-detection-center" element={<AnomalyDetectionCenterComponent />} />
      <Route path="/security-monitoring/baseline-monitoring-system" element={<BaselineMonitoringSystemComponent />} />
      <Route path="/security-monitoring/compliance-monitoring-dashboard" element={<ComplianceMonitoringDashboardComponent />} />
      <Route path="/security-monitoring/security-kpi-dashboard" element={<SecurityKPIDashboardComponent />} />

      {/* Vulnerability Management Routes (8 pages) */}
      <Route path="/vulnerability-management/asset-discovery-platform" element={<AssetDiscoveryPlatformComponent />} />
      <Route path="/vulnerability-management/vulnerability-scanning-orchestrator" element={<VulnerabilityScanningOrchestratorComponent />} />
      <Route path="/vulnerability-management/risk-scoring-engine" element={<RiskScoringEngineComponent />} />
      <Route path="/vulnerability-management/patch-management-center" element={<PatchManagementCenterComponent />} />
      <Route path="/vulnerability-management/remediation-tracking-system" element={<RemediationTrackingSystemComponent />} />
      <Route path="/vulnerability-management/compliance-validation-hub" element={<ComplianceValidationHubComponent />} />
      <Route path="/vulnerability-management/threat-correlation-analyzer" element={<ThreatCorrelationAnalyzerComponent />} />
      <Route path="/vulnerability-management/vulnerability-analytics-dashboard" element={<VulnerabilityAnalyticsDashboardComponent />} />

      {/* Digital Forensics Routes (7 pages) */}
      <Route path="/digital-forensics/evidence-acquisition-workflow" element={<EvidenceAcquisitionWorkflowComponent />} />
      <Route path="/digital-forensics/forensic-imaging-platform" element={<ForensicImagingPlatformComponent />} />
      <Route path="/digital-forensics/timeline-analysis-workbench" element={<TimelineAnalysisWorkbenchComponent />} />
      <Route path="/digital-forensics/malware-analysis-lab" element={<MalwareAnalysisLabComponent />} />
      <Route path="/digital-forensics/network-forensics-center" element={<NetworkForensicsCenterComponent />} />
      <Route path="/digital-forensics/mobile-forensics-workbench" element={<MobileForensicsWorkbenchComponent />} />
      <Route path="/digital-forensics/cloud-forensics-analyzer" element={<CloudForensicsAnalyzerComponent />} />

      {/* Compliance & Audit Routes (8 pages) */}
      <Route path="/compliance-audit/framework-mapping-center" element={<FrameworkMappingCenterComponent />} />
      <Route path="/compliance-audit/control-validation-system" element={<ControlValidationSystemComponent />} />
      <Route path="/compliance-audit/audit-trail-analyzer" element={<AuditTrailAnalyzerComponent />} />
      <Route path="/compliance-audit/compliance-reporting-hub" element={<ComplianceReportingHubComponent />} />
      <Route path="/compliance-audit/risk-assessment-platform" element={<RiskAssessmentPlatformComponent />} />
      <Route path="/compliance-audit/policy-management-center" element={<PolicyManagementCenterComponent />} />
      <Route path="/compliance-audit/certification-tracking-system" element={<CertificationTrackingSystemComponent />} />
      <Route path="/compliance-audit/remediation-planning-workbench" element={<RemediationPlanningWorkbenchComponent />} />

      {/* Default redirect to incident response dashboard */}
      <Route path="/" element={<Navigate to="/incident-response/advanced-playbook-orchestrator" replace />} />
      
      {/* Catch-all route for unmatched paths */}
      <Route path="*" element={<Navigate to="/incident-response/advanced-playbook-orchestrator" replace />} />
    </Routes>
  );
};

export default SecOpsRouter;