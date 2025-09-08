/**
 * Case Management Pages Index
 * Exports all 40 case management pages
 */

export { default as CaseCreationWizardPage } from './case-creation-wizard/page';
export { default as CaseAssignmentDashboardPage } from './case-assignment-dashboard/page';
export { default as CaseStatusTrackingPage } from './case-status-tracking/page';
export { default as CaseEscalationManagementPage } from './case-escalation-management/page';
export { default as CaseClosureWorkflowPage } from './case-closure-workflow/page';
export { default as CaseArchivalSystemPage } from './case-archival-system/page';
export { default as CaseTemplateManagementPage } from './case-template-management/page';
export { default as CasePriorityMatrixPage } from './case-priority-matrix/page';
export { default as EvidenceIntakePortalPage } from './evidence-intake-portal/page';
export { default as ChainOfCustodyTrackerPage } from './chain-of-custody-tracker/page';
export { default as DigitalEvidenceAnalyzerPage } from './digital-evidence-analyzer/page';
export { default as EvidenceStorageManagerPage } from './evidence-storage-manager/page';
export { default as ForensicTimelineBuilderPage } from './forensic-timeline-builder/page';
export { default as EvidenceIntegrityMonitorPage } from './evidence-integrity-monitor/page';
export { default as EvidenceSearchEnginePage } from './evidence-search-engine/page';
export { default as EvidenceSharingPortalPage } from './evidence-sharing-portal/page';
export { default as InvestigationPlanningDashboardPage } from './investigation-planning-dashboard/page';
export { default as TaskAssignmentBoardPage } from './task-assignment-board/page';
export { default as CollaborationWorkspacePage } from './collaboration-workspace/page';
export { default as ProgressTrackingDashboardPage } from './progress-tracking-dashboard/page';
export { default as MilestoneManagementPage } from './milestone-management/page';
export { default as ResourceAllocationOptimizerPage } from './resource-allocation-optimizer/page';
export { default as WorkflowAutomationBuilderPage } from './workflow-automation-builder/page';
export { default as InvestigationQualityAssurancePage } from './investigation-quality-assurance/page';
export { default as CaseAnalyticsDashboardPage } from './case-analytics-dashboard/page';
export { default as PerformanceMetricsCenterPage } from './performance-metrics-center/page';
export { default as TrendAnalysisPlatformPage } from './trend-analysis-platform/page';
export { default as ExecutiveReportingSuitePage } from './executive-reporting-suite/page';
export { default as CustomReportBuilderPage } from './custom-report-builder/page';
export { default as AutomatedReportingEnginePage } from './automated-reporting-engine/page';
export { default as CaseOutcomeAnalyzerPage } from './case-outcome-analyzer/page';
export { default as ResourceUtilizationDashboardPage } from './resource-utilization-dashboard/page';
export { default as ComplianceMonitoringCenterPage } from './compliance-monitoring-center/page';
export { default as AuditTrailViewerPage } from './audit-trail-viewer/page';
export { default as LegalHoldManagerPage } from './legal-hold-manager/page';
export { default as RetentionPolicyEnginePage } from './retention-policy-engine/page';
export { default as ComplianceReportingDashboardPage } from './compliance-reporting-dashboard/page';
export { default as PrivacyProtectionMonitorPage } from './privacy-protection-monitor/page';
export { default as RegulatoryChangeTrackerPage } from './regulatory-change-tracker/page';
export { default as CertificationManagementPortalPage } from './certification-management-portal/page';

// Navigation configuration for case management pages
export const caseManagementNavigation = [
  {
    path: '/case-management/case-creation-wizard',
    title: 'Case Creation Wizard',
    description: 'Guided case creation with templates and validation',
    category: 'lifecycle',
    icon: getCategoryIcon('lifecycle')
  },
  {
    path: '/case-management/case-assignment-dashboard',
    title: 'Case Assignment Dashboard',
    description: 'Intelligent case assignment and workload management',
    category: 'lifecycle',
    icon: getCategoryIcon('lifecycle')
  },
  {
    path: '/case-management/case-status-tracking',
    title: 'Case Status Tracking',
    description: 'Real-time case status monitoring and updates',
    category: 'lifecycle',
    icon: getCategoryIcon('lifecycle')
  },
  {
    path: '/case-management/case-escalation-management',
    title: 'Case Escalation Management',
    description: 'Automated escalation workflows and approvals',
    category: 'lifecycle',
    icon: getCategoryIcon('lifecycle')
  },
  {
    path: '/case-management/case-closure-workflow',
    title: 'Case Closure Workflow',
    description: 'Comprehensive case closure and sign-off process',
    category: 'lifecycle',
    icon: getCategoryIcon('lifecycle')
  },
  {
    path: '/case-management/case-archival-system',
    title: 'Case Archival System',
    description: 'Long-term case storage and retrieval system',
    category: 'lifecycle',
    icon: getCategoryIcon('lifecycle')
  },
  {
    path: '/case-management/case-template-management',
    title: 'Case Template Management',
    description: 'Case template creation and customization',
    category: 'lifecycle',
    icon: getCategoryIcon('lifecycle')
  },
  {
    path: '/case-management/case-priority-matrix',
    title: 'Case Priority Matrix',
    description: 'Dynamic case prioritization and resource allocation',
    category: 'lifecycle',
    icon: getCategoryIcon('lifecycle')
  },
  {
    path: '/case-management/evidence-intake-portal',
    title: 'Evidence Intake Portal',
    description: 'Streamlined evidence submission and validation',
    category: 'evidence',
    icon: getCategoryIcon('evidence')
  },
  {
    path: '/case-management/chain-of-custody-tracker',
    title: 'Chain of Custody Tracker',
    description: 'Complete evidence custody tracking and auditing',
    category: 'evidence',
    icon: getCategoryIcon('evidence')
  },
  {
    path: '/case-management/digital-evidence-analyzer',
    title: 'Digital Evidence Analyzer',
    description: 'Automated digital evidence analysis and correlation',
    category: 'evidence',
    icon: getCategoryIcon('evidence')
  },
  {
    path: '/case-management/evidence-storage-manager',
    title: 'Evidence Storage Manager',
    description: 'Secure evidence storage and access control',
    category: 'evidence',
    icon: getCategoryIcon('evidence')
  },
  {
    path: '/case-management/forensic-timeline-builder',
    title: 'Forensic Timeline Builder',
    description: 'Interactive forensic timeline creation and visualization',
    category: 'evidence',
    icon: getCategoryIcon('evidence')
  },
  {
    path: '/case-management/evidence-integrity-monitor',
    title: 'Evidence Integrity Monitor',
    description: 'Continuous evidence integrity verification',
    category: 'evidence',
    icon: getCategoryIcon('evidence')
  },
  {
    path: '/case-management/evidence-search-engine',
    title: 'Evidence Search Engine',
    description: 'Advanced evidence search and filtering capabilities',
    category: 'evidence',
    icon: getCategoryIcon('evidence')
  },
  {
    path: '/case-management/evidence-sharing-portal',
    title: 'Evidence Sharing Portal',
    description: 'Secure evidence sharing with external parties',
    category: 'evidence',
    icon: getCategoryIcon('evidence')
  },
  {
    path: '/case-management/investigation-planning-dashboard',
    title: 'Investigation Planning Dashboard',
    description: 'Strategic investigation planning and resource allocation',
    category: 'workflows',
    icon: getCategoryIcon('workflows')
  },
  {
    path: '/case-management/task-assignment-board',
    title: 'Task Assignment Board',
    description: 'Kanban-style task management for investigations',
    category: 'workflows',
    icon: getCategoryIcon('workflows')
  },
  {
    path: '/case-management/collaboration-workspace',
    title: 'Collaboration Workspace',
    description: 'Team collaboration tools for investigation teams',
    category: 'workflows',
    icon: getCategoryIcon('workflows')
  },
  {
    path: '/case-management/progress-tracking-dashboard',
    title: 'Progress Tracking Dashboard',
    description: 'Real-time investigation progress monitoring',
    category: 'workflows',
    icon: getCategoryIcon('workflows')
  },
  {
    path: '/case-management/milestone-management',
    title: 'Milestone Management',
    description: 'Investigation milestone tracking and reporting',
    category: 'workflows',
    icon: getCategoryIcon('workflows')
  },
  {
    path: '/case-management/resource-allocation-optimizer',
    title: 'Resource Allocation Optimizer',
    description: 'AI-driven resource optimization for investigations',
    category: 'workflows',
    icon: getCategoryIcon('workflows')
  },
  {
    path: '/case-management/workflow-automation-builder',
    title: 'Workflow Automation Builder',
    description: 'Custom workflow automation and triggers',
    category: 'workflows',
    icon: getCategoryIcon('workflows')
  },
  {
    path: '/case-management/investigation-quality-assurance',
    title: 'Investigation Quality Assurance',
    description: 'Quality control and review processes',
    category: 'workflows',
    icon: getCategoryIcon('workflows')
  },
  {
    path: '/case-management/case-analytics-dashboard',
    title: 'Case Analytics Dashboard',
    description: 'Comprehensive case metrics and KPI tracking',
    category: 'analytics',
    icon: getCategoryIcon('analytics')
  },
  {
    path: '/case-management/performance-metrics-center',
    title: 'Performance Metrics Center',
    description: 'Team and individual performance analytics',
    category: 'analytics',
    icon: getCategoryIcon('analytics')
  },
  {
    path: '/case-management/trend-analysis-platform',
    title: 'Trend Analysis Platform',
    description: 'Case trend analysis and predictive insights',
    category: 'analytics',
    icon: getCategoryIcon('analytics')
  },
  {
    path: '/case-management/executive-reporting-suite',
    title: 'Executive Reporting Suite',
    description: 'Executive-level reporting and dashboards',
    category: 'analytics',
    icon: getCategoryIcon('analytics')
  },
  {
    path: '/case-management/custom-report-builder',
    title: 'Custom Report Builder',
    description: 'Drag-and-drop custom report creation',
    category: 'analytics',
    icon: getCategoryIcon('analytics')
  },
  {
    path: '/case-management/automated-reporting-engine',
    title: 'Automated Reporting Engine',
    description: 'Scheduled and triggered report generation',
    category: 'analytics',
    icon: getCategoryIcon('analytics')
  },
  {
    path: '/case-management/case-outcome-analyzer',
    title: 'Case Outcome Analyzer',
    description: 'Case outcome analysis and success metrics',
    category: 'analytics',
    icon: getCategoryIcon('analytics')
  },
  {
    path: '/case-management/resource-utilization-dashboard',
    title: 'Resource Utilization Dashboard',
    description: 'Resource usage optimization analytics',
    category: 'analytics',
    icon: getCategoryIcon('analytics')
  },
  {
    path: '/case-management/compliance-monitoring-center',
    title: 'Compliance Monitoring Center',
    description: 'Regulatory compliance tracking and monitoring',
    category: 'compliance',
    icon: getCategoryIcon('compliance')
  },
  {
    path: '/case-management/audit-trail-viewer',
    title: 'Audit Trail Viewer',
    description: 'Comprehensive audit trail visualization and search',
    category: 'compliance',
    icon: getCategoryIcon('compliance')
  },
  {
    path: '/case-management/legal-hold-manager',
    title: 'Legal Hold Manager',
    description: 'Legal hold management and notification system',
    category: 'compliance',
    icon: getCategoryIcon('compliance')
  },
  {
    path: '/case-management/retention-policy-engine',
    title: 'Retention Policy Engine',
    description: 'Automated data retention and disposal policies',
    category: 'compliance',
    icon: getCategoryIcon('compliance')
  },
  {
    path: '/case-management/compliance-reporting-dashboard',
    title: 'Compliance Reporting Dashboard',
    description: 'Regulatory reporting and submission tracking',
    category: 'compliance',
    icon: getCategoryIcon('compliance')
  },
  {
    path: '/case-management/privacy-protection-monitor',
    title: 'Privacy Protection Monitor',
    description: 'Data privacy compliance and protection monitoring',
    category: 'compliance',
    icon: getCategoryIcon('compliance')
  },
  {
    path: '/case-management/regulatory-change-tracker',
    title: 'Regulatory Change Tracker',
    description: 'Regulatory requirement change tracking and impact analysis',
    category: 'compliance',
    icon: getCategoryIcon('compliance')
  },
  {
    path: '/case-management/certification-management-portal',
    title: 'Certification Management Portal',
    description: 'Security certification tracking and renewal management',
    category: 'compliance',
    icon: getCategoryIcon('compliance')
  }
];

function getCategoryIcon(category: string): string {
  const icons = {
    lifecycle: '🔄',
    evidence: '🔍',
    workflows: '⚡',
    analytics: '📊',
    compliance: '✅'
  };
  return icons[category as keyof typeof icons] || '📋';
}
