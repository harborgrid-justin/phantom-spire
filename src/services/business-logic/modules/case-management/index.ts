/**
 * Case Management Business Logic Index
 * Exports all case management business logic services
 */

import { CaseCreationWizardBusinessLogic } from './CaseCreationWizardBusinessLogic.js';
import { CaseAssignmentDashboardBusinessLogic } from './CaseAssignmentDashboardBusinessLogic.js';
import { CaseStatusTrackingBusinessLogic } from './CaseStatusTrackingBusinessLogic.js';
import { CaseEscalationManagementBusinessLogic } from './CaseEscalationManagementBusinessLogic.js';
import { CaseClosureWorkflowBusinessLogic } from './CaseClosureWorkflowBusinessLogic.js';
import { CaseArchivalSystemBusinessLogic } from './CaseArchivalSystemBusinessLogic.js';
import { CaseTemplateManagementBusinessLogic } from './CaseTemplateManagementBusinessLogic.js';
import { CasePriorityMatrixBusinessLogic } from './CasePriorityMatrixBusinessLogic.js';
import { EvidenceIntakePortalBusinessLogic } from './EvidenceIntakePortalBusinessLogic.js';
import { ChainOfCustodyTrackerBusinessLogic } from './ChainOfCustodyTrackerBusinessLogic.js';
import { DigitalEvidenceAnalyzerBusinessLogic } from './DigitalEvidenceAnalyzerBusinessLogic.js';
import { EvidenceStorageManagerBusinessLogic } from './EvidenceStorageManagerBusinessLogic.js';
import { ForensicTimelineBuilderBusinessLogic } from './ForensicTimelineBuilderBusinessLogic.js';
import { EvidenceIntegrityMonitorBusinessLogic } from './EvidenceIntegrityMonitorBusinessLogic.js';
import { EvidenceSearchEngineBusinessLogic } from './EvidenceSearchEngineBusinessLogic.js';
import { EvidenceSharingPortalBusinessLogic } from './EvidenceSharingPortalBusinessLogic.js';
import { InvestigationPlanningDashboardBusinessLogic } from './InvestigationPlanningDashboardBusinessLogic.js';
import { TaskAssignmentBoardBusinessLogic } from './TaskAssignmentBoardBusinessLogic.js';
import { CollaborationWorkspaceBusinessLogic } from './CollaborationWorkspaceBusinessLogic.js';
import { ProgressTrackingDashboardBusinessLogic } from './ProgressTrackingDashboardBusinessLogic.js';
import { MilestoneManagementBusinessLogic } from './MilestoneManagementBusinessLogic.js';
import { ResourceAllocationOptimizerBusinessLogic } from './ResourceAllocationOptimizerBusinessLogic.js';
import { WorkflowAutomationBuilderBusinessLogic } from './WorkflowAutomationBuilderBusinessLogic.js';
import { InvestigationQualityAssuranceBusinessLogic } from './InvestigationQualityAssuranceBusinessLogic.js';
import { CaseAnalyticsDashboardBusinessLogic } from './CaseAnalyticsDashboardBusinessLogic.js';
import { PerformanceMetricsCenterBusinessLogic } from './PerformanceMetricsCenterBusinessLogic.js';
import { TrendAnalysisPlatformBusinessLogic } from './TrendAnalysisPlatformBusinessLogic.js';
import { ExecutiveReportingSuiteBusinessLogic } from './ExecutiveReportingSuiteBusinessLogic.js';
import { CustomReportBuilderBusinessLogic } from './CustomReportBuilderBusinessLogic.js';
import { AutomatedReportingEngineBusinessLogic } from './AutomatedReportingEngineBusinessLogic.js';
import { CaseOutcomeAnalyzerBusinessLogic } from './CaseOutcomeAnalyzerBusinessLogic.js';
import { ResourceUtilizationDashboardBusinessLogic } from './ResourceUtilizationDashboardBusinessLogic.js';
import { ComplianceMonitoringCenterBusinessLogic } from './ComplianceMonitoringCenterBusinessLogic.js';
import { AuditTrailViewerBusinessLogic } from './AuditTrailViewerBusinessLogic.js';
import { LegalHoldManagerBusinessLogic } from './LegalHoldManagerBusinessLogic.js';
import { RetentionPolicyEngineBusinessLogic } from './RetentionPolicyEngineBusinessLogic.js';
import { ComplianceReportingDashboardBusinessLogic } from './ComplianceReportingDashboardBusinessLogic.js';
import { PrivacyProtectionMonitorBusinessLogic } from './PrivacyProtectionMonitorBusinessLogic.js';
import { RegulatoryChangeTrackerBusinessLogic } from './RegulatoryChangeTrackerBusinessLogic.js';
import { CertificationManagementPortalBusinessLogic } from './CertificationManagementPortalBusinessLogic.js';

export {
  CaseCreationWizardBusinessLogic,
  CaseAssignmentDashboardBusinessLogic,
  CaseStatusTrackingBusinessLogic,
  CaseEscalationManagementBusinessLogic,
  CaseClosureWorkflowBusinessLogic,
  CaseArchivalSystemBusinessLogic,
  CaseTemplateManagementBusinessLogic,
  CasePriorityMatrixBusinessLogic,
  EvidenceIntakePortalBusinessLogic,
  ChainOfCustodyTrackerBusinessLogic,
  DigitalEvidenceAnalyzerBusinessLogic,
  EvidenceStorageManagerBusinessLogic,
  ForensicTimelineBuilderBusinessLogic,
  EvidenceIntegrityMonitorBusinessLogic,
  EvidenceSearchEngineBusinessLogic,
  EvidenceSharingPortalBusinessLogic,
  InvestigationPlanningDashboardBusinessLogic,
  TaskAssignmentBoardBusinessLogic,
  CollaborationWorkspaceBusinessLogic,
  ProgressTrackingDashboardBusinessLogic,
  MilestoneManagementBusinessLogic,
  ResourceAllocationOptimizerBusinessLogic,
  WorkflowAutomationBuilderBusinessLogic,
  InvestigationQualityAssuranceBusinessLogic,
  CaseAnalyticsDashboardBusinessLogic,
  PerformanceMetricsCenterBusinessLogic,
  TrendAnalysisPlatformBusinessLogic,
  ExecutiveReportingSuiteBusinessLogic,
  CustomReportBuilderBusinessLogic,
  AutomatedReportingEngineBusinessLogic,
  CaseOutcomeAnalyzerBusinessLogic,
  ResourceUtilizationDashboardBusinessLogic,
  ComplianceMonitoringCenterBusinessLogic,
  AuditTrailViewerBusinessLogic,
  LegalHoldManagerBusinessLogic,
  RetentionPolicyEngineBusinessLogic,
  ComplianceReportingDashboardBusinessLogic,
  PrivacyProtectionMonitorBusinessLogic,
  RegulatoryChangeTrackerBusinessLogic,
  CertificationManagementPortalBusinessLogic
};

// Business logic service registry
export const caseManagementBusinessLogicServices = [
  {
    name: 'case-creation-wizard-business-logic',
    title: 'Case Creation Wizard Business Logic',
    category: 'lifecycle',
    service: CaseCreationWizardBusinessLogic
  },
  {
    name: 'case-assignment-dashboard-business-logic',
    title: 'Case Assignment Dashboard Business Logic',
    category: 'lifecycle',
    service: CaseAssignmentDashboardBusinessLogic
  },
  {
    name: 'case-status-tracking-business-logic',
    title: 'Case Status Tracking Business Logic',
    category: 'lifecycle',
    service: CaseStatusTrackingBusinessLogic
  },
  {
    name: 'case-escalation-management-business-logic',
    title: 'Case Escalation Management Business Logic',
    category: 'lifecycle',
    service: CaseEscalationManagementBusinessLogic
  },
  {
    name: 'case-closure-workflow-business-logic',
    title: 'Case Closure Workflow Business Logic',
    category: 'lifecycle',
    service: CaseClosureWorkflowBusinessLogic
  },
  {
    name: 'case-archival-system-business-logic',
    title: 'Case Archival System Business Logic',
    category: 'lifecycle',
    service: CaseArchivalSystemBusinessLogic
  },
  {
    name: 'case-template-management-business-logic',
    title: 'Case Template Management Business Logic',
    category: 'lifecycle',
    service: CaseTemplateManagementBusinessLogic
  },
  {
    name: 'case-priority-matrix-business-logic',
    title: 'Case Priority Matrix Business Logic',
    category: 'lifecycle',
    service: CasePriorityMatrixBusinessLogic
  },
  {
    name: 'evidence-intake-portal-business-logic',
    title: 'Evidence Intake Portal Business Logic',
    category: 'evidence',
    service: EvidenceIntakePortalBusinessLogic
  },
  {
    name: 'chain-of-custody-tracker-business-logic',
    title: 'Chain of Custody Tracker Business Logic',
    category: 'evidence',
    service: ChainOfCustodyTrackerBusinessLogic
  },
  {
    name: 'digital-evidence-analyzer-business-logic',
    title: 'Digital Evidence Analyzer Business Logic',
    category: 'evidence',
    service: DigitalEvidenceAnalyzerBusinessLogic
  },
  {
    name: 'evidence-storage-manager-business-logic',
    title: 'Evidence Storage Manager Business Logic',
    category: 'evidence',
    service: EvidenceStorageManagerBusinessLogic
  },
  {
    name: 'forensic-timeline-builder-business-logic',
    title: 'Forensic Timeline Builder Business Logic',
    category: 'evidence',
    service: ForensicTimelineBuilderBusinessLogic
  },
  {
    name: 'evidence-integrity-monitor-business-logic',
    title: 'Evidence Integrity Monitor Business Logic',
    category: 'evidence',
    service: EvidenceIntegrityMonitorBusinessLogic
  },
  {
    name: 'evidence-search-engine-business-logic',
    title: 'Evidence Search Engine Business Logic',
    category: 'evidence',
    service: EvidenceSearchEngineBusinessLogic
  },
  {
    name: 'evidence-sharing-portal-business-logic',
    title: 'Evidence Sharing Portal Business Logic',
    category: 'evidence',
    service: EvidenceSharingPortalBusinessLogic
  },
  {
    name: 'investigation-planning-dashboard-business-logic',
    title: 'Investigation Planning Dashboard Business Logic',
    category: 'workflows',
    service: InvestigationPlanningDashboardBusinessLogic
  },
  {
    name: 'task-assignment-board-business-logic',
    title: 'Task Assignment Board Business Logic',
    category: 'workflows',
    service: TaskAssignmentBoardBusinessLogic
  },
  {
    name: 'collaboration-workspace-business-logic',
    title: 'Collaboration Workspace Business Logic',
    category: 'workflows',
    service: CollaborationWorkspaceBusinessLogic
  },
  {
    name: 'progress-tracking-dashboard-business-logic',
    title: 'Progress Tracking Dashboard Business Logic',
    category: 'workflows',
    service: ProgressTrackingDashboardBusinessLogic
  },
  {
    name: 'milestone-management-business-logic',
    title: 'Milestone Management Business Logic',
    category: 'workflows',
    service: MilestoneManagementBusinessLogic
  },
  {
    name: 'resource-allocation-optimizer-business-logic',
    title: 'Resource Allocation Optimizer Business Logic',
    category: 'workflows',
    service: ResourceAllocationOptimizerBusinessLogic
  },
  {
    name: 'workflow-automation-builder-business-logic',
    title: 'Workflow Automation Builder Business Logic',
    category: 'workflows',
    service: WorkflowAutomationBuilderBusinessLogic
  },
  {
    name: 'investigation-quality-assurance-business-logic',
    title: 'Investigation Quality Assurance Business Logic',
    category: 'workflows',
    service: InvestigationQualityAssuranceBusinessLogic
  },
  {
    name: 'case-analytics-dashboard-business-logic',
    title: 'Case Analytics Dashboard Business Logic',
    category: 'analytics',
    service: CaseAnalyticsDashboardBusinessLogic
  },
  {
    name: 'performance-metrics-center-business-logic',
    title: 'Performance Metrics Center Business Logic',
    category: 'analytics',
    service: PerformanceMetricsCenterBusinessLogic
  },
  {
    name: 'trend-analysis-platform-business-logic',
    title: 'Trend Analysis Platform Business Logic',
    category: 'analytics',
    service: TrendAnalysisPlatformBusinessLogic
  },
  {
    name: 'executive-reporting-suite-business-logic',
    title: 'Executive Reporting Suite Business Logic',
    category: 'analytics',
    service: ExecutiveReportingSuiteBusinessLogic
  },
  {
    name: 'custom-report-builder-business-logic',
    title: 'Custom Report Builder Business Logic',
    category: 'analytics',
    service: CustomReportBuilderBusinessLogic
  },
  {
    name: 'automated-reporting-engine-business-logic',
    title: 'Automated Reporting Engine Business Logic',
    category: 'analytics',
    service: AutomatedReportingEngineBusinessLogic
  },
  {
    name: 'case-outcome-analyzer-business-logic',
    title: 'Case Outcome Analyzer Business Logic',
    category: 'analytics',
    service: CaseOutcomeAnalyzerBusinessLogic
  },
  {
    name: 'resource-utilization-dashboard-business-logic',
    title: 'Resource Utilization Dashboard Business Logic',
    category: 'analytics',
    service: ResourceUtilizationDashboardBusinessLogic
  },
  {
    name: 'compliance-monitoring-center-business-logic',
    title: 'Compliance Monitoring Center Business Logic',
    category: 'compliance',
    service: ComplianceMonitoringCenterBusinessLogic
  },
  {
    name: 'audit-trail-viewer-business-logic',
    title: 'Audit Trail Viewer Business Logic',
    category: 'compliance',
    service: AuditTrailViewerBusinessLogic
  },
  {
    name: 'legal-hold-manager-business-logic',
    title: 'Legal Hold Manager Business Logic',
    category: 'compliance',
    service: LegalHoldManagerBusinessLogic
  },
  {
    name: 'retention-policy-engine-business-logic',
    title: 'Retention Policy Engine Business Logic',
    category: 'compliance',
    service: RetentionPolicyEngineBusinessLogic
  },
  {
    name: 'compliance-reporting-dashboard-business-logic',
    title: 'Compliance Reporting Dashboard Business Logic',
    category: 'compliance',
    service: ComplianceReportingDashboardBusinessLogic
  },
  {
    name: 'privacy-protection-monitor-business-logic',
    title: 'Privacy Protection Monitor Business Logic',
    category: 'compliance',
    service: PrivacyProtectionMonitorBusinessLogic
  },
  {
    name: 'regulatory-change-tracker-business-logic',
    title: 'Regulatory Change Tracker Business Logic',
    category: 'compliance',
    service: RegulatoryChangeTrackerBusinessLogic
  },
  {
    name: 'certification-management-portal-business-logic',
    title: 'Certification Management Portal Business Logic',
    category: 'compliance',
    service: CertificationManagementPortalBusinessLogic
  }
];
