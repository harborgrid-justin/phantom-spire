/**
 * Windmill Features Frontend Components - Main Index
 * Central export for all 32 windmill frontend components
 */

export { default as AutomatedBranchManagementComponent } from './repository-automation/AutomatedBranchManagementComponent.js';
export { default as RepositoryTemplateEngineComponent } from './repository-automation/RepositoryTemplateEngineComponent.js';
export { default as IssueAutoClassificationComponent } from './repository-automation/IssueAutoClassificationComponent.js';
export { default as PrReviewAutomationComponent } from './repository-automation/PrReviewAutomationComponent.js';
export { default as DependencyUpdateManagerComponent } from './repository-automation/DependencyUpdateManagerComponent.js';
export { default as ReleaseAutomationHubComponent } from './repository-automation/ReleaseAutomationHubComponent.js';
export { default as RepositoryHealthMonitorComponent } from './repository-automation/RepositoryHealthMonitorComponent.js';
export { default as CodeMigrationAssistantComponent } from './repository-automation/CodeMigrationAssistantComponent.js';
export { default as PipelineOrchestratorComponent } from './cicd-management/PipelineOrchestratorComponent.js';
export { default as BuildStatusDashboardComponent } from './cicd-management/BuildStatusDashboardComponent.js';
export { default as TestAutomationManagerComponent } from './cicd-management/TestAutomationManagerComponent.js';
export { default as DeploymentStrategyEngineComponent } from './cicd-management/DeploymentStrategyEngineComponent.js';
export { default as EnvironmentConfigurationComponent } from './cicd-management/EnvironmentConfigurationComponent.js';
export { default as PerformanceBenchmarkingComponent } from './cicd-management/PerformanceBenchmarkingComponent.js';
export { default as RollbackManagementComponent } from './cicd-management/RollbackManagementComponent.js';
export { default as InfrastructureAsCodeComponent } from './cicd-management/InfrastructureAsCodeComponent.js';
export { default as CodeQualityAnalyzerComponent } from './code-quality-security/CodeQualityAnalyzerComponent.js';
export { default as SecurityScanningHubComponent } from './code-quality-security/SecurityScanningHubComponent.js';
export { default as LicenseComplianceManagerComponent } from './code-quality-security/LicenseComplianceManagerComponent.js';
export { default as CodeCoverageTrackerComponent } from './code-quality-security/CodeCoverageTrackerComponent.js';
export { default as VulnerabilityAssessmentComponent } from './code-quality-security/VulnerabilityAssessmentComponent.js';
export { default as CodeReviewAnalyticsComponent } from './code-quality-security/CodeReviewAnalyticsComponent.js';
export { default as TechnicalDebtMonitorComponent } from './code-quality-security/TechnicalDebtMonitorComponent.js';
export { default as DocumentationGeneratorComponent } from './code-quality-security/DocumentationGeneratorComponent.js';
export { default as TeamProductivityAnalyticsComponent } from './collaboration-workflow/TeamProductivityAnalyticsComponent.js';
export { default as ProjectTimelineManagerComponent } from './collaboration-workflow/ProjectTimelineManagerComponent.js';
export { default as CommunicationHubComponent } from './collaboration-workflow/CommunicationHubComponent.js';
export { default as KnowledgeBaseManagerComponent } from './collaboration-workflow/KnowledgeBaseManagerComponent.js';
export { default as OnboardingAutomationComponent } from './collaboration-workflow/OnboardingAutomationComponent.js';
export { default as WorkflowTemplatesComponent } from './collaboration-workflow/WorkflowTemplatesComponent.js';
export { default as IntegrationManagerComponent } from './collaboration-workflow/IntegrationManagerComponent.js';
export { default as ReportingDashboardComponent } from './collaboration-workflow/ReportingDashboardComponent.js';

export const windmillComponentMetadata = {
  totalComponents: 32,
  categories: 4,
  componentsPerCategory: 8,
  version: '1.0.0',
  description: 'React components for 32 windmill GitHub repository features'
};
