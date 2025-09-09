/**
 * Security Intelligence Components Index
 * Exports all security intelligence frontend components
 */

export { default as ThreatLandscapeOverviewComponent } from './ThreatLandscapeOverviewComponent';
export { default as VulnerabilityAssessmentReportsComponent } from './VulnerabilityAssessmentReportsComponent';
export { default as IncidentResponseAnalyticsComponent } from './IncidentResponseAnalyticsComponent';
export { default as SecurityPostureDashboardComponent } from './SecurityPostureDashboardComponent';
export { default as ComplianceMonitoringSuiteComponent } from './ComplianceMonitoringSuiteComponent';
export { default as RiskAssessmentFrameworkComponent } from './RiskAssessmentFrameworkComponent';
export { default as CyberThreatIndicatorsComponent } from './CyberThreatIndicatorsComponent';
export { default as SecurityMetricsDashboardComponent } from './SecurityMetricsDashboardComponent';
export { default as ForensicsAnalysisReportsComponent } from './ForensicsAnalysisReportsComponent';
export { default as PenetrationTestingResultsComponent } from './PenetrationTestingResultsComponent';

// Component registry for dynamic loading
export const SecurityIntelligenceComponents = {
  ThreatLandscapeOverview: 'ThreatLandscapeOverviewComponent',
  VulnerabilityAssessmentReports: 'VulnerabilityAssessmentReportsComponent',
  IncidentResponseAnalytics: 'IncidentResponseAnalyticsComponent',
  SecurityPostureDashboard: 'SecurityPostureDashboardComponent',
  ComplianceMonitoringSuite: 'ComplianceMonitoringSuiteComponent',
  RiskAssessmentFramework: 'RiskAssessmentFrameworkComponent',
  CyberThreatIndicators: 'CyberThreatIndicatorsComponent',
  SecurityMetricsDashboard: 'SecurityMetricsDashboardComponent',
  ForensicsAnalysisReports: 'ForensicsAnalysisReportsComponent',
  PenetrationTestingResults: 'PenetrationTestingResultsComponent'
};

// Category metadata
export const SecurityIntelligenceMetadata = {
  category: 'security-intelligence',
  displayName: 'Security Intelligence',
  description: 'Comprehensive cybersecurity reporting and threat analysis',
  icon: 'Security',
  componentCount: 10
};