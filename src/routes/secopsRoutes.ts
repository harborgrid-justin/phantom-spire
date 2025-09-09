import express from 'express';

// Import all new SecOps route modules
import advancedPlaybookOrchestratorRoutes from './incident-response/advancedplaybookorchestratorRoutes.js';
import automatedResponseWorkflowRoutes from './incident-response/automatedresponseworkflowRoutes.js';
import escalationManagementSystemRoutes from './incident-response/escalationmanagementsystemRoutes.js';
import forensicTimelineAnalyzerRoutes from './incident-response/forensictimelineanalyzerRoutes.js';
import evidenceCollectionManagerRoutes from './incident-response/evidencecollectionmanagerRoutes.js';
import containmentProcedureEngineRoutes from './incident-response/containmentprocedureengineRoutes.js';
import recoveryPlanningCenterRoutes from './incident-response/recoveryplanningcenterRoutes.js';
import postIncidentAnalysisHubRoutes from './incident-response/postincidentanalysishubRoutes.js';
import lessonsLearnedRepositoryRoutes from './incident-response/lessonslearnedrepositoryRoutes.js';
import complianceReportGeneratorRoutes from './incident-response/compliancereportgeneratorRoutes.js';

import advancedHuntingQueryBuilderRoutes from './threat-hunting/advancedhuntingquerybuilderRoutes.js';
import iocTrackingDashboardRoutes from './threat-hunting/ioctrackingdashboardRoutes.js';
import behavioralAnalysisEngineRoutes from './threat-hunting/behavioralanalysisengineRoutes.js';
import threatActorProfilingCenterRoutes from './threat-hunting/threatactorprofilingcenterRoutes.js';
import campaignTrackingSystemRoutes from './threat-hunting/campaigntrackingsystemRoutes.js';
import ttapsAnalysisPlatformRoutes from './threat-hunting/ttapsanalysisplatformRoutes.js';
import threatLandscapeMapperRoutes from './threat-hunting/threatlandscapemapperRoutes.js';
import huntingMetricsDashboardRoutes from './threat-hunting/huntingmetricsdashboardRoutes.js';

import realTimeSecurityDashboardRoutes from './security-monitoring/realtimesecuritydashboardRoutes.js';
import alertCorrelationEngineRoutes from './security-monitoring/alertcorrelationengineRoutes.js';
import siemIntegrationHubRoutes from './security-monitoring/siemintegrationhubRoutes.js';
import logAnalysisWorkbenchRoutes from './security-monitoring/loganalysisworkbenchRoutes.js';
import anomalyDetectionCenterRoutes from './security-monitoring/anomalydetectioncenterRoutes.js';
import baselineMonitoringSystemRoutes from './security-monitoring/baselinemonitoringsystemRoutes.js';
import complianceMonitoringDashboardRoutes from './security-monitoring/compliancemonitoringdashboardRoutes.js';
import securityKPIDashboardRoutes from './security-monitoring/securitykpidashboardRoutes.js';

import assetDiscoveryPlatformRoutes from './vulnerability-management/assetdiscoveryplatformRoutes.js';
import vulnerabilityScanningOrchestratorRoutes from './vulnerability-management/vulnerabilityscanningorchestratorRoutes.js';
import riskScoringEngineRoutes from './vulnerability-management/riskscoringengineRoutes.js';
import patchManagementCenterRoutes from './vulnerability-management/patchmanagementcenterRoutes.js';
import remediationTrackingSystemRoutes from './vulnerability-management/remediationtrackingsystemRoutes.js';
import complianceValidationHubRoutes from './vulnerability-management/compliancevalidationhubRoutes.js';
import threatCorrelationAnalyzerRoutes from './vulnerability-management/threatcorrelationanalyzerRoutes.js';
import vulnerabilityAnalyticsDashboardRoutes from './vulnerability-management/vulnerabilityanalyticsdashboardRoutes.js';

import evidenceAcquisitionWorkflowRoutes from './digital-forensics/evidenceacquisitionworkflowRoutes.js';
import forensicImagingPlatformRoutes from './digital-forensics/forensicimagingplatformRoutes.js';
import timelineAnalysisWorkbenchRoutes from './digital-forensics/timelineanalysisworkbenchRoutes.js';
import malwareAnalysisLabRoutes from './digital-forensics/malwareanalysislabRoutes.js';
import networkForensicsCenterRoutes from './digital-forensics/networkforensicscenterRoutes.js';
import mobileForensicsWorkbenchRoutes from './digital-forensics/mobileforensicsworkbenchRoutes.js';
import cloudForensicsAnalyzerRoutes from './digital-forensics/cloudforensicsanalyzerRoutes.js';

import frameworkMappingCenterRoutes from './compliance-audit/frameworkmappingcenterRoutes.js';
import controlValidationSystemRoutes from './compliance-audit/controlvalidationsystemRoutes.js';
import auditTrailAnalyzerRoutes from './compliance-audit/audittrailanalyzerRoutes.js';
import complianceReportingHubRoutes from './compliance-audit/compliancereportinghubRoutes.js';
import riskAssessmentPlatformRoutes from './compliance-audit/riskassessmentplatformRoutes.js';
import policyManagementCenterRoutes from './compliance-audit/policymanagementcenterRoutes.js';
import certificationTrackingSystemRoutes from './compliance-audit/certificationtrackingsystemRoutes.js';
import remediationPlanningWorkbenchRoutes from './compliance-audit/remediationplanningworkbenchRoutes.js';

const router = express.Router();

/**
 * SecOps Routes Configuration
 * 49 new business-ready and customer-ready security operations pages
 */

// Incident Response Routes (10 pages)
router.use('/incident-response/advanced-playbook-orchestrator', advancedPlaybookOrchestratorRoutes);
router.use('/incident-response/automated-response-workflow', automatedResponseWorkflowRoutes);
router.use('/incident-response/escalation-management-system', escalationManagementSystemRoutes);
router.use('/incident-response/forensic-timeline-analyzer', forensicTimelineAnalyzerRoutes);
router.use('/incident-response/evidence-collection-manager', evidenceCollectionManagerRoutes);
router.use('/incident-response/containment-procedure-engine', containmentProcedureEngineRoutes);
router.use('/incident-response/recovery-planning-center', recoveryPlanningCenterRoutes);
router.use('/incident-response/post-incident-analysis-hub', postIncidentAnalysisHubRoutes);
router.use('/incident-response/lessons-learned-repository', lessonsLearnedRepositoryRoutes);
router.use('/incident-response/compliance-report-generator', complianceReportGeneratorRoutes);

// Threat Hunting Routes (8 pages)
router.use('/threat-hunting/advanced-hunting-query-builder', advancedHuntingQueryBuilderRoutes);
router.use('/threat-hunting/ioc-tracking-dashboard', iocTrackingDashboardRoutes);
router.use('/threat-hunting/behavioral-analysis-engine', behavioralAnalysisEngineRoutes);
router.use('/threat-hunting/threat-actor-profiling-center', threatActorProfilingCenterRoutes);
router.use('/threat-hunting/campaign-tracking-system', campaignTrackingSystemRoutes);
router.use('/threat-hunting/ttaps-analysis-platform', ttapsAnalysisPlatformRoutes);
router.use('/threat-hunting/threat-landscape-mapper', threatLandscapeMapperRoutes);
router.use('/threat-hunting/hunting-metrics-dashboard', huntingMetricsDashboardRoutes);

// Security Monitoring Routes (8 pages)
router.use('/security-monitoring/realtime-security-dashboard', realTimeSecurityDashboardRoutes);
router.use('/security-monitoring/alert-correlation-engine', alertCorrelationEngineRoutes);
router.use('/security-monitoring/siem-integration-hub', siemIntegrationHubRoutes);
router.use('/security-monitoring/log-analysis-workbench', logAnalysisWorkbenchRoutes);
router.use('/security-monitoring/anomaly-detection-center', anomalyDetectionCenterRoutes);
router.use('/security-monitoring/baseline-monitoring-system', baselineMonitoringSystemRoutes);
router.use('/security-monitoring/compliance-monitoring-dashboard', complianceMonitoringDashboardRoutes);
router.use('/security-monitoring/security-kpi-dashboard', securityKPIDashboardRoutes);

// Vulnerability Management Routes (8 pages)
router.use('/vulnerability-management/asset-discovery-platform', assetDiscoveryPlatformRoutes);
router.use('/vulnerability-management/vulnerability-scanning-orchestrator', vulnerabilityScanningOrchestratorRoutes);
router.use('/vulnerability-management/risk-scoring-engine', riskScoringEngineRoutes);
router.use('/vulnerability-management/patch-management-center', patchManagementCenterRoutes);
router.use('/vulnerability-management/remediation-tracking-system', remediationTrackingSystemRoutes);
router.use('/vulnerability-management/compliance-validation-hub', complianceValidationHubRoutes);
router.use('/vulnerability-management/threat-correlation-analyzer', threatCorrelationAnalyzerRoutes);
router.use('/vulnerability-management/vulnerability-analytics-dashboard', vulnerabilityAnalyticsDashboardRoutes);

// Digital Forensics Routes (7 pages)
router.use('/digital-forensics/evidence-acquisition-workflow', evidenceAcquisitionWorkflowRoutes);
router.use('/digital-forensics/forensic-imaging-platform', forensicImagingPlatformRoutes);
router.use('/digital-forensics/timeline-analysis-workbench', timelineAnalysisWorkbenchRoutes);
router.use('/digital-forensics/malware-analysis-lab', malwareAnalysisLabRoutes);
router.use('/digital-forensics/network-forensics-center', networkForensicsCenterRoutes);
router.use('/digital-forensics/mobile-forensics-workbench', mobileForensicsWorkbenchRoutes);
router.use('/digital-forensics/cloud-forensics-analyzer', cloudForensicsAnalyzerRoutes);

// Compliance & Audit Routes (8 pages)
router.use('/compliance-audit/framework-mapping-center', frameworkMappingCenterRoutes);
router.use('/compliance-audit/control-validation-system', controlValidationSystemRoutes);
router.use('/compliance-audit/audit-trail-analyzer', auditTrailAnalyzerRoutes);
router.use('/compliance-audit/compliance-reporting-hub', complianceReportingHubRoutes);
router.use('/compliance-audit/risk-assessment-platform', riskAssessmentPlatformRoutes);
router.use('/compliance-audit/policy-management-center', policyManagementCenterRoutes);
router.use('/compliance-audit/certification-tracking-system', certificationTrackingSystemRoutes);
router.use('/compliance-audit/remediation-planning-workbench', remediationPlanningWorkbenchRoutes);

/**
 * Route health check and metrics endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'operational',
    message: '49 SecOps business pages active',
    categories: {
      'incident-response': 10,
      'threat-hunting': 8,
      'security-monitoring': 8,
      'vulnerability-management': 8,
      'digital-forensics': 7,
      'compliance-audit': 8
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * SecOps navigation metadata endpoint
 */
router.get('/navigation', (req, res) => {
  const navigation = {
    categories: [
      {
        id: 'incident-response',
        label: 'Incident Response',
        icon: 'Emergency',
        description: 'Advanced incident response and forensic capabilities',
        pages: [
          { id: 'advanced-playbook-orchestrator', label: 'Advanced Playbook Orchestrator', path: '/secops/incident-response/advanced-playbook-orchestrator' },
          { id: 'automated-response-workflow', label: 'Automated Response Workflow', path: '/secops/incident-response/automated-response-workflow' },
          { id: 'escalation-management-system', label: 'Escalation Management System', path: '/secops/incident-response/escalation-management-system' },
          { id: 'forensic-timeline-analyzer', label: 'Forensic Timeline Analyzer', path: '/secops/incident-response/forensic-timeline-analyzer' },
          { id: 'evidence-collection-manager', label: 'Evidence Collection Manager', path: '/secops/incident-response/evidence-collection-manager' },
          { id: 'containment-procedure-engine', label: 'Containment Procedure Engine', path: '/secops/incident-response/containment-procedure-engine' },
          { id: 'recovery-planning-center', label: 'Recovery Planning Center', path: '/secops/incident-response/recovery-planning-center' },
          { id: 'post-incident-analysis-hub', label: 'Post Incident Analysis Hub', path: '/secops/incident-response/post-incident-analysis-hub' },
          { id: 'lessons-learned-repository', label: 'Lessons Learned Repository', path: '/secops/incident-response/lessons-learned-repository' },
          { id: 'compliance-report-generator', label: 'Compliance Report Generator', path: '/secops/incident-response/compliance-report-generator' }
        ]
      },
      {
        id: 'threat-hunting',
        label: 'Threat Hunting',
        icon: 'Search',
        description: 'Advanced threat hunting and detection capabilities',
        pages: [
          { id: 'advanced-hunting-query-builder', label: 'Advanced Hunting Query Builder', path: '/secops/threat-hunting/advanced-hunting-query-builder' },
          { id: 'ioc-tracking-dashboard', label: 'IOC Tracking Dashboard', path: '/secops/threat-hunting/ioc-tracking-dashboard' },
          { id: 'behavioral-analysis-engine', label: 'Behavioral Analysis Engine', path: '/secops/threat-hunting/behavioral-analysis-engine' },
          { id: 'threat-actor-profiling-center', label: 'Threat Actor Profiling Center', path: '/secops/threat-hunting/threat-actor-profiling-center' },
          { id: 'campaign-tracking-system', label: 'Campaign Tracking System', path: '/secops/threat-hunting/campaign-tracking-system' },
          { id: 'ttaps-analysis-platform', label: 'TTPs Analysis Platform', path: '/secops/threat-hunting/ttaps-analysis-platform' },
          { id: 'threat-landscape-mapper', label: 'Threat Landscape Mapper', path: '/secops/threat-hunting/threat-landscape-mapper' },
          { id: 'hunting-metrics-dashboard', label: 'Hunting Metrics Dashboard', path: '/secops/threat-hunting/hunting-metrics-dashboard' }
        ]
      },
      {
        id: 'security-monitoring',
        label: 'Security Monitoring',
        icon: 'Visibility',
        description: 'Real-time security monitoring and alerting',
        pages: [
          { id: 'realtime-security-dashboard', label: 'Real-time Security Dashboard', path: '/secops/security-monitoring/realtime-security-dashboard' },
          { id: 'alert-correlation-engine', label: 'Alert Correlation Engine', path: '/secops/security-monitoring/alert-correlation-engine' },
          { id: 'siem-integration-hub', label: 'SIEM Integration Hub', path: '/secops/security-monitoring/siem-integration-hub' },
          { id: 'log-analysis-workbench', label: 'Log Analysis Workbench', path: '/secops/security-monitoring/log-analysis-workbench' },
          { id: 'anomaly-detection-center', label: 'Anomaly Detection Center', path: '/secops/security-monitoring/anomaly-detection-center' },
          { id: 'baseline-monitoring-system', label: 'Baseline Monitoring System', path: '/secops/security-monitoring/baseline-monitoring-system' },
          { id: 'compliance-monitoring-dashboard', label: 'Compliance Monitoring Dashboard', path: '/secops/security-monitoring/compliance-monitoring-dashboard' },
          { id: 'security-kpi-dashboard', label: 'Security KPI Dashboard', path: '/secops/security-monitoring/security-kpi-dashboard' }
        ]
      },
      {
        id: 'vulnerability-management',
        label: 'Vulnerability Management',
        icon: 'BugReport',
        description: 'Comprehensive vulnerability assessment and management',
        pages: [
          { id: 'asset-discovery-platform', label: 'Asset Discovery Platform', path: '/secops/vulnerability-management/asset-discovery-platform' },
          { id: 'vulnerability-scanning-orchestrator', label: 'Vulnerability Scanning Orchestrator', path: '/secops/vulnerability-management/vulnerability-scanning-orchestrator' },
          { id: 'risk-scoring-engine', label: 'Risk Scoring Engine', path: '/secops/vulnerability-management/risk-scoring-engine' },
          { id: 'patch-management-center', label: 'Patch Management Center', path: '/secops/vulnerability-management/patch-management-center' },
          { id: 'remediation-tracking-system', label: 'Remediation Tracking System', path: '/secops/vulnerability-management/remediation-tracking-system' },
          { id: 'compliance-validation-hub', label: 'Compliance Validation Hub', path: '/secops/vulnerability-management/compliance-validation-hub' },
          { id: 'threat-correlation-analyzer', label: 'Threat Correlation Analyzer', path: '/secops/vulnerability-management/threat-correlation-analyzer' },
          { id: 'vulnerability-analytics-dashboard', label: 'Vulnerability Analytics Dashboard', path: '/secops/vulnerability-management/vulnerability-analytics-dashboard' }
        ]
      },
      {
        id: 'digital-forensics',
        label: 'Digital Forensics',
        icon: 'Science',
        description: 'Advanced digital forensics and analysis tools',
        pages: [
          { id: 'evidence-acquisition-workflow', label: 'Evidence Acquisition Workflow', path: '/secops/digital-forensics/evidence-acquisition-workflow' },
          { id: 'forensic-imaging-platform', label: 'Forensic Imaging Platform', path: '/secops/digital-forensics/forensic-imaging-platform' },
          { id: 'timeline-analysis-workbench', label: 'Timeline Analysis Workbench', path: '/secops/digital-forensics/timeline-analysis-workbench' },
          { id: 'malware-analysis-lab', label: 'Malware Analysis Lab', path: '/secops/digital-forensics/malware-analysis-lab' },
          { id: 'network-forensics-center', label: 'Network Forensics Center', path: '/secops/digital-forensics/network-forensics-center' },
          { id: 'mobile-forensics-workbench', label: 'Mobile Forensics Workbench', path: '/secops/digital-forensics/mobile-forensics-workbench' },
          { id: 'cloud-forensics-analyzer', label: 'Cloud Forensics Analyzer', path: '/secops/digital-forensics/cloud-forensics-analyzer' }
        ]
      },
      {
        id: 'compliance-audit',
        label: 'Compliance & Audit',
        icon: 'AssignmentTurnedIn',
        description: 'Compliance management and audit capabilities',
        pages: [
          { id: 'framework-mapping-center', label: 'Framework Mapping Center', path: '/secops/compliance-audit/framework-mapping-center' },
          { id: 'control-validation-system', label: 'Control Validation System', path: '/secops/compliance-audit/control-validation-system' },
          { id: 'audit-trail-analyzer', label: 'Audit Trail Analyzer', path: '/secops/compliance-audit/audit-trail-analyzer' },
          { id: 'compliance-reporting-hub', label: 'Compliance Reporting Hub', path: '/secops/compliance-audit/compliance-reporting-hub' },
          { id: 'risk-assessment-platform', label: 'Risk Assessment Platform', path: '/secops/compliance-audit/risk-assessment-platform' },
          { id: 'policy-management-center', label: 'Policy Management Center', path: '/secops/compliance-audit/policy-management-center' },
          { id: 'certification-tracking-system', label: 'Certification Tracking System', path: '/secops/compliance-audit/certification-tracking-system' },
          { id: 'remediation-planning-workbench', label: 'Remediation Planning Workbench', path: '/secops/compliance-audit/remediation-planning-workbench' }
        ]
      }
    ]
  };

  res.json(navigation);
});

export default router;