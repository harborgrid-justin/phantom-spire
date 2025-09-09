/**
 * Security Intelligence Routes Index
 * Aggregates all security intelligence reporting routes
 */

import { Router } from 'express';
import { createThreatLandscapeOverviewRoutes } from './threat-landscape-overviewRoutes.js';
import { createVulnerabilityAssessmentReportsRoutes } from './vulnerability-assessment-reportsRoutes.js';
import { createIncidentResponseAnalyticsRoutes } from './incident-response-analyticsRoutes.js';
import { createSecurityPostureDashboardRoutes } from './security-posture-dashboardRoutes.js';
import { createComplianceMonitoringSuiteRoutes } from './compliance-monitoring-suiteRoutes.js';
import { createRiskAssessmentFrameworkRoutes } from './risk-assessment-frameworkRoutes.js';
import { createCyberThreatIndicatorsRoutes } from './cyber-threat-indicatorsRoutes.js';
import { createSecurityMetricsDashboardRoutes } from './security-metrics-dashboardRoutes.js';
import { createForensicsAnalysisReportsRoutes } from './forensics-analysis-reportsRoutes.js';
import { createPenetrationTestingResultsRoutes } from './penetration-testing-resultsRoutes.js';

export function createSecurityIntelligenceRoutes(): Router {
  const router = Router();

  // Mount all security intelligence routes
  router.use(
    '/threat-landscape-overview',
    createThreatLandscapeOverviewRoutes()
  );
  router.use(
    '/vulnerability-assessment-reports',
    createVulnerabilityAssessmentReportsRoutes()
  );
  router.use(
    '/incident-response-analytics',
    createIncidentResponseAnalyticsRoutes()
  );
  router.use(
    '/security-posture-dashboard',
    createSecurityPostureDashboardRoutes()
  );
  router.use(
    '/compliance-monitoring-suite',
    createComplianceMonitoringSuiteRoutes()
  );
  router.use(
    '/risk-assessment-framework',
    createRiskAssessmentFrameworkRoutes()
  );
  router.use('/cyber-threat-indicators', createCyberThreatIndicatorsRoutes());
  router.use(
    '/security-metrics-dashboard',
    createSecurityMetricsDashboardRoutes()
  );
  router.use(
    '/forensics-analysis-reports',
    createForensicsAnalysisReportsRoutes()
  );
  router.use(
    '/penetration-testing-results',
    createPenetrationTestingResultsRoutes()
  );

  return router;
}
