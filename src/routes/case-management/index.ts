/**
 * Case Management Routes Index
 * Exports all case management route creators
 */

import { createCaseCreationWizardRoutes } from './case-creation-wizardRoutes.js';
import { createCaseAssignmentDashboardRoutes } from './case-assignment-dashboardRoutes.js';
import { createCaseStatusTrackingRoutes } from './case-status-trackingRoutes.js';
import { createCaseEscalationManagementRoutes } from './case-escalation-managementRoutes.js';
import { createCaseClosureWorkflowRoutes } from './case-closure-workflowRoutes.js';
import { createCaseArchivalSystemRoutes } from './case-archival-systemRoutes.js';
import { createCaseTemplateManagementRoutes } from './case-template-managementRoutes.js';
import { createCasePriorityMatrixRoutes } from './case-priority-matrixRoutes.js';
import { createEvidenceIntakePortalRoutes } from './evidence-intake-portalRoutes.js';
import { createChainOfCustodyTrackerRoutes } from './chain-of-custody-trackerRoutes.js';
import { createDigitalEvidenceAnalyzerRoutes } from './digital-evidence-analyzerRoutes.js';
import { createEvidenceStorageManagerRoutes } from './evidence-storage-managerRoutes.js';
import { createForensicTimelineBuilderRoutes } from './forensic-timeline-builderRoutes.js';
import { createEvidenceIntegrityMonitorRoutes } from './evidence-integrity-monitorRoutes.js';
import { createEvidenceSearchEngineRoutes } from './evidence-search-engineRoutes.js';
import { createEvidenceSharingPortalRoutes } from './evidence-sharing-portalRoutes.js';
import { createInvestigationPlanningDashboardRoutes } from './investigation-planning-dashboardRoutes.js';
import { createTaskAssignmentBoardRoutes } from './task-assignment-boardRoutes.js';
import { createCollaborationWorkspaceRoutes } from './collaboration-workspaceRoutes.js';
import { createProgressTrackingDashboardRoutes } from './progress-tracking-dashboardRoutes.js';
import { createMilestoneManagementRoutes } from './milestone-managementRoutes.js';
import { createResourceAllocationOptimizerRoutes } from './resource-allocation-optimizerRoutes.js';
import { createWorkflowAutomationBuilderRoutes } from './workflow-automation-builderRoutes.js';
import { createInvestigationQualityAssuranceRoutes } from './investigation-quality-assuranceRoutes.js';
import { createCaseAnalyticsDashboardRoutes } from './case-analytics-dashboardRoutes.js';
import { createPerformanceMetricsCenterRoutes } from './performance-metrics-centerRoutes.js';
import { createTrendAnalysisPlatformRoutes } from './trend-analysis-platformRoutes.js';
import { createExecutiveReportingSuiteRoutes } from './executive-reporting-suiteRoutes.js';
import { createCustomReportBuilderRoutes } from './custom-report-builderRoutes.js';
import { createAutomatedReportingEngineRoutes } from './automated-reporting-engineRoutes.js';
import { createCaseOutcomeAnalyzerRoutes } from './case-outcome-analyzerRoutes.js';
import { createResourceUtilizationDashboardRoutes } from './resource-utilization-dashboardRoutes.js';
import { createComplianceMonitoringCenterRoutes } from './compliance-monitoring-centerRoutes.js';
import { createAuditTrailViewerRoutes } from './audit-trail-viewerRoutes.js';
import { createLegalHoldManagerRoutes } from './legal-hold-managerRoutes.js';
import { createRetentionPolicyEngineRoutes } from './retention-policy-engineRoutes.js';
import { createComplianceReportingDashboardRoutes } from './compliance-reporting-dashboardRoutes.js';
import { createPrivacyProtectionMonitorRoutes } from './privacy-protection-monitorRoutes.js';
import { createRegulatoryChangeTrackerRoutes } from './regulatory-change-trackerRoutes.js';
import { createCertificationManagementPortalRoutes } from './certification-management-portalRoutes.js';

export {
  createCaseCreationWizardRoutes,
  createCaseAssignmentDashboardRoutes,
  createCaseStatusTrackingRoutes,
  createCaseEscalationManagementRoutes,
  createCaseClosureWorkflowRoutes,
  createCaseArchivalSystemRoutes,
  createCaseTemplateManagementRoutes,
  createCasePriorityMatrixRoutes,
  createEvidenceIntakePortalRoutes,
  createChainOfCustodyTrackerRoutes,
  createDigitalEvidenceAnalyzerRoutes,
  createEvidenceStorageManagerRoutes,
  createForensicTimelineBuilderRoutes,
  createEvidenceIntegrityMonitorRoutes,
  createEvidenceSearchEngineRoutes,
  createEvidenceSharingPortalRoutes,
  createInvestigationPlanningDashboardRoutes,
  createTaskAssignmentBoardRoutes,
  createCollaborationWorkspaceRoutes,
  createProgressTrackingDashboardRoutes,
  createMilestoneManagementRoutes,
  createResourceAllocationOptimizerRoutes,
  createWorkflowAutomationBuilderRoutes,
  createInvestigationQualityAssuranceRoutes,
  createCaseAnalyticsDashboardRoutes,
  createPerformanceMetricsCenterRoutes,
  createTrendAnalysisPlatformRoutes,
  createExecutiveReportingSuiteRoutes,
  createCustomReportBuilderRoutes,
  createAutomatedReportingEngineRoutes,
  createCaseOutcomeAnalyzerRoutes,
  createResourceUtilizationDashboardRoutes,
  createComplianceMonitoringCenterRoutes,
  createAuditTrailViewerRoutes,
  createLegalHoldManagerRoutes,
  createRetentionPolicyEngineRoutes,
  createComplianceReportingDashboardRoutes,
  createPrivacyProtectionMonitorRoutes,
  createRegulatoryChangeTrackerRoutes,
  createCertificationManagementPortalRoutes
};

// Route configuration helper
export const caseManagementRoutes = [
  {
    path: '/case-creation-wizard',
    createRouter: createCaseCreationWizardRoutes,
    title: 'Case Creation Wizard',
    category: 'lifecycle'
  },
  {
    path: '/case-assignment-dashboard',
    createRouter: createCaseAssignmentDashboardRoutes,
    title: 'Case Assignment Dashboard',
    category: 'lifecycle'
  },
  {
    path: '/case-status-tracking',
    createRouter: createCaseStatusTrackingRoutes,
    title: 'Case Status Tracking',
    category: 'lifecycle'
  },
  {
    path: '/case-escalation-management',
    createRouter: createCaseEscalationManagementRoutes,
    title: 'Case Escalation Management',
    category: 'lifecycle'
  },
  {
    path: '/case-closure-workflow',
    createRouter: createCaseClosureWorkflowRoutes,
    title: 'Case Closure Workflow',
    category: 'lifecycle'
  },
  {
    path: '/case-archival-system',
    createRouter: createCaseArchivalSystemRoutes,
    title: 'Case Archival System',
    category: 'lifecycle'
  },
  {
    path: '/case-template-management',
    createRouter: createCaseTemplateManagementRoutes,
    title: 'Case Template Management',
    category: 'lifecycle'
  },
  {
    path: '/case-priority-matrix',
    createRouter: createCasePriorityMatrixRoutes,
    title: 'Case Priority Matrix',
    category: 'lifecycle'
  },
  {
    path: '/evidence-intake-portal',
    createRouter: createEvidenceIntakePortalRoutes,
    title: 'Evidence Intake Portal',
    category: 'evidence'
  },
  {
    path: '/chain-of-custody-tracker',
    createRouter: createChainOfCustodyTrackerRoutes,
    title: 'Chain of Custody Tracker',
    category: 'evidence'
  },
  {
    path: '/digital-evidence-analyzer',
    createRouter: createDigitalEvidenceAnalyzerRoutes,
    title: 'Digital Evidence Analyzer',
    category: 'evidence'
  },
  {
    path: '/evidence-storage-manager',
    createRouter: createEvidenceStorageManagerRoutes,
    title: 'Evidence Storage Manager',
    category: 'evidence'
  },
  {
    path: '/forensic-timeline-builder',
    createRouter: createForensicTimelineBuilderRoutes,
    title: 'Forensic Timeline Builder',
    category: 'evidence'
  },
  {
    path: '/evidence-integrity-monitor',
    createRouter: createEvidenceIntegrityMonitorRoutes,
    title: 'Evidence Integrity Monitor',
    category: 'evidence'
  },
  {
    path: '/evidence-search-engine',
    createRouter: createEvidenceSearchEngineRoutes,
    title: 'Evidence Search Engine',
    category: 'evidence'
  },
  {
    path: '/evidence-sharing-portal',
    createRouter: createEvidenceSharingPortalRoutes,
    title: 'Evidence Sharing Portal',
    category: 'evidence'
  },
  {
    path: '/investigation-planning-dashboard',
    createRouter: createInvestigationPlanningDashboardRoutes,
    title: 'Investigation Planning Dashboard',
    category: 'workflows'
  },
  {
    path: '/task-assignment-board',
    createRouter: createTaskAssignmentBoardRoutes,
    title: 'Task Assignment Board',
    category: 'workflows'
  },
  {
    path: '/collaboration-workspace',
    createRouter: createCollaborationWorkspaceRoutes,
    title: 'Collaboration Workspace',
    category: 'workflows'
  },
  {
    path: '/progress-tracking-dashboard',
    createRouter: createProgressTrackingDashboardRoutes,
    title: 'Progress Tracking Dashboard',
    category: 'workflows'
  },
  {
    path: '/milestone-management',
    createRouter: createMilestoneManagementRoutes,
    title: 'Milestone Management',
    category: 'workflows'
  },
  {
    path: '/resource-allocation-optimizer',
    createRouter: createResourceAllocationOptimizerRoutes,
    title: 'Resource Allocation Optimizer',
    category: 'workflows'
  },
  {
    path: '/workflow-automation-builder',
    createRouter: createWorkflowAutomationBuilderRoutes,
    title: 'Workflow Automation Builder',
    category: 'workflows'
  },
  {
    path: '/investigation-quality-assurance',
    createRouter: createInvestigationQualityAssuranceRoutes,
    title: 'Investigation Quality Assurance',
    category: 'workflows'
  },
  {
    path: '/case-analytics-dashboard',
    createRouter: createCaseAnalyticsDashboardRoutes,
    title: 'Case Analytics Dashboard',
    category: 'analytics'
  },
  {
    path: '/performance-metrics-center',
    createRouter: createPerformanceMetricsCenterRoutes,
    title: 'Performance Metrics Center',
    category: 'analytics'
  },
  {
    path: '/trend-analysis-platform',
    createRouter: createTrendAnalysisPlatformRoutes,
    title: 'Trend Analysis Platform',
    category: 'analytics'
  },
  {
    path: '/executive-reporting-suite',
    createRouter: createExecutiveReportingSuiteRoutes,
    title: 'Executive Reporting Suite',
    category: 'analytics'
  },
  {
    path: '/custom-report-builder',
    createRouter: createCustomReportBuilderRoutes,
    title: 'Custom Report Builder',
    category: 'analytics'
  },
  {
    path: '/automated-reporting-engine',
    createRouter: createAutomatedReportingEngineRoutes,
    title: 'Automated Reporting Engine',
    category: 'analytics'
  },
  {
    path: '/case-outcome-analyzer',
    createRouter: createCaseOutcomeAnalyzerRoutes,
    title: 'Case Outcome Analyzer',
    category: 'analytics'
  },
  {
    path: '/resource-utilization-dashboard',
    createRouter: createResourceUtilizationDashboardRoutes,
    title: 'Resource Utilization Dashboard',
    category: 'analytics'
  },
  {
    path: '/compliance-monitoring-center',
    createRouter: createComplianceMonitoringCenterRoutes,
    title: 'Compliance Monitoring Center',
    category: 'compliance'
  },
  {
    path: '/audit-trail-viewer',
    createRouter: createAuditTrailViewerRoutes,
    title: 'Audit Trail Viewer',
    category: 'compliance'
  },
  {
    path: '/legal-hold-manager',
    createRouter: createLegalHoldManagerRoutes,
    title: 'Legal Hold Manager',
    category: 'compliance'
  },
  {
    path: '/retention-policy-engine',
    createRouter: createRetentionPolicyEngineRoutes,
    title: 'Retention Policy Engine',
    category: 'compliance'
  },
  {
    path: '/compliance-reporting-dashboard',
    createRouter: createComplianceReportingDashboardRoutes,
    title: 'Compliance Reporting Dashboard',
    category: 'compliance'
  },
  {
    path: '/privacy-protection-monitor',
    createRouter: createPrivacyProtectionMonitorRoutes,
    title: 'Privacy Protection Monitor',
    category: 'compliance'
  },
  {
    path: '/regulatory-change-tracker',
    createRouter: createRegulatoryChangeTrackerRoutes,
    title: 'Regulatory Change Tracker',
    category: 'compliance'
  },
  {
    path: '/certification-management-portal',
    createRouter: createCertificationManagementPortalRoutes,
    title: 'Certification Management Portal',
    category: 'compliance'
  }
];
