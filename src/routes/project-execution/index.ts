/**
 * Project Execution Routes
 */

import { createProjectCharterBuilderRoutes } from './project-charter-builderRoutes.js';
import { createProjectScopeManagementRoutes } from './project-scope-managementRoutes.js';
import { createStakeholderAnalysisMatrixRoutes } from './stakeholder-analysis-matrixRoutes.js';
import { createProjectRequirementsTrackerRoutes } from './project-requirements-trackerRoutes.js';
import { createWorkBreakdownStructureRoutes } from './work-breakdown-structureRoutes.js';
import { createProjectEstimationEngineRoutes } from './project-estimation-engineRoutes.js';
import { createProjectFeasibilityAnalyzerRoutes } from './project-feasibility-analyzerRoutes.js';
import { createProjectInitiationDashboardRoutes } from './project-initiation-dashboardRoutes.js';
import { createResourceCapacityPlannerRoutes } from './resource-capacity-plannerRoutes.js';
import { createTeamCompositionOptimizerRoutes } from './team-composition-optimizerRoutes.js';
import { createResourceConflictResolverRoutes } from './resource-conflict-resolverRoutes.js';
import { createSkillGapAnalyzerRoutes } from './skill-gap-analyzerRoutes.js';
import { createVendorResourceManagerRoutes } from './vendor-resource-managerRoutes.js';
import { createResourceUtilizationTrackerRoutes } from './resource-utilization-trackerRoutes.js';
import { createCrossProjectResourceBoardRoutes } from './cross-project-resource-boardRoutes.js';
import { createResourcePerformanceAnalyticsRoutes } from './resource-performance-analyticsRoutes.js';
import { createCriticalPathAnalyzerRoutes } from './critical-path-analyzerRoutes.js';
import { createMilestoneTrackingCenterRoutes } from './milestone-tracking-centerRoutes.js';
import { createScheduleOptimizationEngineRoutes } from './schedule-optimization-engineRoutes.js';
import { createDependencyManagementBoardRoutes } from './dependency-management-boardRoutes.js';
import { createTimelineVisualizationStudioRoutes } from './timeline-visualization-studioRoutes.js';
import { createScheduleVarianceMonitorRoutes } from './schedule-variance-monitorRoutes.js';
import { createAgileSprintPlannerRoutes } from './agile-sprint-plannerRoutes.js';
import { createBaselineScheduleManagerRoutes } from './baseline-schedule-managerRoutes.js';
import { createProjectRiskRegisterRoutes } from './project-risk-registerRoutes.js';
import { createQualityAssuranceFrameworkRoutes } from './quality-assurance-frameworkRoutes.js';
import { createIssueEscalationMatrixRoutes } from './issue-escalation-matrixRoutes.js';
import { createChangeRequestWorkflowRoutes } from './change-request-workflowRoutes.js';
import { createQualityMetricsDashboardRoutes } from './quality-metrics-dashboardRoutes.js';
import { createRiskHeatMapAnalyzerRoutes } from './risk-heat-map-analyzerRoutes.js';
import { createComplianceChecklistManagerRoutes } from './compliance-checklist-managerRoutes.js';
import { createLessonsLearnedRepositoryRoutes } from './lessons-learned-repositoryRoutes.js';
import { createProjectBudgetPlannerRoutes } from './project-budget-plannerRoutes.js';
import { createCostTrackingDashboardRoutes } from './cost-tracking-dashboardRoutes.js';
import { createEarnedValueAnalyzerRoutes } from './earned-value-analyzerRoutes.js';
import { createProcurementManagementCenterRoutes } from './procurement-management-centerRoutes.js';
import { createCostBenefitCalculatorRoutes } from './cost-benefit-calculatorRoutes.js';
import { createBudgetForecastingEngineRoutes } from './budget-forecasting-engineRoutes.js';
import { createExpenseApprovalWorkflowRoutes } from './expense-approval-workflowRoutes.js';
import { createFinancialReportingSuiteRoutes } from './financial-reporting-suiteRoutes.js';
import { createStakeholderCommunicationHubRoutes } from './stakeholder-communication-hubRoutes.js';
import { createProjectStatusBroadcasterRoutes } from './project-status-broadcasterRoutes.js';
import { createMeetingManagementCenterRoutes } from './meeting-management-centerRoutes.js';
import { createDocumentCollaborationWorkspaceRoutes } from './document-collaboration-workspaceRoutes.js';
import { createTeamCommunicationPortalRoutes } from './team-communication-portalRoutes.js';
import { createExecutiveBriefingGeneratorRoutes } from './executive-briefing-generatorRoutes.js';
import { createProjectWikiManagerRoutes } from './project-wiki-managerRoutes.js';
import { createNotificationCenterRoutes } from './notification-centerRoutes.js';

export const projectExecutionRoutes = [
  {
    path: '/project-charter-builder',
    createRouter: createProjectCharterBuilderRoutes,
    title: 'Project Charter Builder',
    category: 'planning'
  },
  {
    path: '/project-scope-management',
    createRouter: createProjectScopeManagementRoutes,
    title: 'Project Scope Management',
    category: 'planning'
  },
  {
    path: '/stakeholder-analysis-matrix',
    createRouter: createStakeholderAnalysisMatrixRoutes,
    title: 'Stakeholder Analysis Matrix',
    category: 'planning'
  },
  {
    path: '/project-requirements-tracker',
    createRouter: createProjectRequirementsTrackerRoutes,
    title: 'Project Requirements Tracker',
    category: 'planning'
  },
  {
    path: '/work-breakdown-structure',
    createRouter: createWorkBreakdownStructureRoutes,
    title: 'Work Breakdown Structure',
    category: 'planning'
  },
  {
    path: '/project-estimation-engine',
    createRouter: createProjectEstimationEngineRoutes,
    title: 'Project Estimation Engine',
    category: 'planning'
  },
  {
    path: '/project-feasibility-analyzer',
    createRouter: createProjectFeasibilityAnalyzerRoutes,
    title: 'Project Feasibility Analyzer',
    category: 'planning'
  },
  {
    path: '/project-initiation-dashboard',
    createRouter: createProjectInitiationDashboardRoutes,
    title: 'Project Initiation Dashboard',
    category: 'planning'
  },
  {
    path: '/resource-capacity-planner',
    createRouter: createResourceCapacityPlannerRoutes,
    title: 'Resource Capacity Planner',
    category: 'resources'
  },
  {
    path: '/team-composition-optimizer',
    createRouter: createTeamCompositionOptimizerRoutes,
    title: 'Team Composition Optimizer',
    category: 'resources'
  },
  {
    path: '/resource-conflict-resolver',
    createRouter: createResourceConflictResolverRoutes,
    title: 'Resource Conflict Resolver',
    category: 'resources'
  },
  {
    path: '/skill-gap-analyzer',
    createRouter: createSkillGapAnalyzerRoutes,
    title: 'Skill Gap Analyzer',
    category: 'resources'
  },
  {
    path: '/vendor-resource-manager',
    createRouter: createVendorResourceManagerRoutes,
    title: 'Vendor Resource Manager',
    category: 'resources'
  },
  {
    path: '/resource-utilization-tracker',
    createRouter: createResourceUtilizationTrackerRoutes,
    title: 'Resource Utilization Tracker',
    category: 'resources'
  },
  {
    path: '/cross-project-resource-board',
    createRouter: createCrossProjectResourceBoardRoutes,
    title: 'Cross-Project Resource Board',
    category: 'resources'
  },
  {
    path: '/resource-performance-analytics',
    createRouter: createResourcePerformanceAnalyticsRoutes,
    title: 'Resource Performance Analytics',
    category: 'resources'
  },
  {
    path: '/critical-path-analyzer',
    createRouter: createCriticalPathAnalyzerRoutes,
    title: 'Critical Path Analyzer',
    category: 'scheduling'
  },
  {
    path: '/milestone-tracking-center',
    createRouter: createMilestoneTrackingCenterRoutes,
    title: 'Milestone Tracking Center',
    category: 'scheduling'
  },
  {
    path: '/schedule-optimization-engine',
    createRouter: createScheduleOptimizationEngineRoutes,
    title: 'Schedule Optimization Engine',
    category: 'scheduling'
  },
  {
    path: '/dependency-management-board',
    createRouter: createDependencyManagementBoardRoutes,
    title: 'Dependency Management Board',
    category: 'scheduling'
  },
  {
    path: '/timeline-visualization-studio',
    createRouter: createTimelineVisualizationStudioRoutes,
    title: 'Timeline Visualization Studio',
    category: 'scheduling'
  },
  {
    path: '/schedule-variance-monitor',
    createRouter: createScheduleVarianceMonitorRoutes,
    title: 'Schedule Variance Monitor',
    category: 'scheduling'
  },
  {
    path: '/agile-sprint-planner',
    createRouter: createAgileSprintPlannerRoutes,
    title: 'Agile Sprint Planner',
    category: 'scheduling'
  },
  {
    path: '/baseline-schedule-manager',
    createRouter: createBaselineScheduleManagerRoutes,
    title: 'Baseline Schedule Manager',
    category: 'scheduling'
  },
  {
    path: '/project-risk-register',
    createRouter: createProjectRiskRegisterRoutes,
    title: 'Project Risk Register',
    category: 'risk-quality'
  },
  {
    path: '/quality-assurance-framework',
    createRouter: createQualityAssuranceFrameworkRoutes,
    title: 'Quality Assurance Framework',
    category: 'risk-quality'
  },
  {
    path: '/issue-escalation-matrix',
    createRouter: createIssueEscalationMatrixRoutes,
    title: 'Issue Escalation Matrix',
    category: 'risk-quality'
  },
  {
    path: '/change-request-workflow',
    createRouter: createChangeRequestWorkflowRoutes,
    title: 'Change Request Workflow',
    category: 'risk-quality'
  },
  {
    path: '/quality-metrics-dashboard',
    createRouter: createQualityMetricsDashboardRoutes,
    title: 'Quality Metrics Dashboard',
    category: 'risk-quality'
  },
  {
    path: '/risk-heat-map-analyzer',
    createRouter: createRiskHeatMapAnalyzerRoutes,
    title: 'Risk Heat Map Analyzer',
    category: 'risk-quality'
  },
  {
    path: '/compliance-checklist-manager',
    createRouter: createComplianceChecklistManagerRoutes,
    title: 'Compliance Checklist Manager',
    category: 'risk-quality'
  },
  {
    path: '/lessons-learned-repository',
    createRouter: createLessonsLearnedRepositoryRoutes,
    title: 'Lessons Learned Repository',
    category: 'risk-quality'
  },
  {
    path: '/project-budget-planner',
    createRouter: createProjectBudgetPlannerRoutes,
    title: 'Project Budget Planner',
    category: 'budget'
  },
  {
    path: '/cost-tracking-dashboard',
    createRouter: createCostTrackingDashboardRoutes,
    title: 'Cost Tracking Dashboard',
    category: 'budget'
  },
  {
    path: '/earned-value-analyzer',
    createRouter: createEarnedValueAnalyzerRoutes,
    title: 'Earned Value Analyzer',
    category: 'budget'
  },
  {
    path: '/procurement-management-center',
    createRouter: createProcurementManagementCenterRoutes,
    title: 'Procurement Management Center',
    category: 'budget'
  },
  {
    path: '/cost-benefit-calculator',
    createRouter: createCostBenefitCalculatorRoutes,
    title: 'Cost-Benefit Calculator',
    category: 'budget'
  },
  {
    path: '/budget-forecasting-engine',
    createRouter: createBudgetForecastingEngineRoutes,
    title: 'Budget Forecasting Engine',
    category: 'budget'
  },
  {
    path: '/expense-approval-workflow',
    createRouter: createExpenseApprovalWorkflowRoutes,
    title: 'Expense Approval Workflow',
    category: 'budget'
  },
  {
    path: '/financial-reporting-suite',
    createRouter: createFinancialReportingSuiteRoutes,
    title: 'Financial Reporting Suite',
    category: 'budget'
  },
  {
    path: '/stakeholder-communication-hub',
    createRouter: createStakeholderCommunicationHubRoutes,
    title: 'Stakeholder Communication Hub',
    category: 'communication'
  },
  {
    path: '/project-status-broadcaster',
    createRouter: createProjectStatusBroadcasterRoutes,
    title: 'Project Status Broadcaster',
    category: 'communication'
  },
  {
    path: '/meeting-management-center',
    createRouter: createMeetingManagementCenterRoutes,
    title: 'Meeting Management Center',
    category: 'communication'
  },
  {
    path: '/document-collaboration-workspace',
    createRouter: createDocumentCollaborationWorkspaceRoutes,
    title: 'Document Collaboration Workspace',
    category: 'communication'
  },
  {
    path: '/team-communication-portal',
    createRouter: createTeamCommunicationPortalRoutes,
    title: 'Team Communication Portal',
    category: 'communication'
  },
  {
    path: '/executive-briefing-generator',
    createRouter: createExecutiveBriefingGeneratorRoutes,
    title: 'Executive Briefing Generator',
    category: 'communication'
  },
  {
    path: '/project-wiki-manager',
    createRouter: createProjectWikiManagerRoutes,
    title: 'Project Wiki Manager',
    category: 'communication'
  },
  {
    path: '/notification-center',
    createRouter: createNotificationCenterRoutes,
    title: 'Notification Center',
    category: 'communication'
  }
];
