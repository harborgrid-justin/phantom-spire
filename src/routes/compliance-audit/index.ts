/**
 * Compliance Audit Routes Index
 * Aggregates all compliance and audit reporting routes
 */

import { Router } from 'express';
import { createRegulatoryComplianceDashboardRoutes } from './regulatory-compliance-dashboardRoutes.js';
import { createAuditTrailAnalyticsRoutes } from './audit-trail-analyticsRoutes.js';
import { createPolicyAdherenceReportsRoutes } from './policy-adherence-reportsRoutes.js';
import { createComplianceGapAnalysisRoutes } from './compliance-gap-analysisRoutes.js';
import { createCertificationTrackingSuiteRoutes } from './certification-tracking-suiteRoutes.js';
import { createRegulatoryReportingEngineRoutes } from './regulatory-reporting-engineRoutes.js';
import { createComplianceMonitoringDashboardRoutes } from './compliance-monitoring-dashboardRoutes.js';
import { createAuditPreparationReportsRoutes } from './audit-preparation-reportsRoutes.js';
import { createGovernanceMetricsSuiteRoutes } from './governance-metrics-suiteRoutes.js';

export function createComplianceAuditRoutes(): Router {
  const router = Router();

  // Mount all compliance audit routes
  router.use(
    '/regulatory-compliance-dashboard',
    createRegulatoryComplianceDashboardRoutes()
  );
  router.use('/audit-trail-analytics', createAuditTrailAnalyticsRoutes());
  router.use('/policy-adherence-reports', createPolicyAdherenceReportsRoutes());
  router.use('/compliance-gap-analysis', createComplianceGapAnalysisRoutes());
  router.use(
    '/certification-tracking-suite',
    createCertificationTrackingSuiteRoutes()
  );
  router.use(
    '/regulatory-reporting-engine',
    createRegulatoryReportingEngineRoutes()
  );
  router.use(
    '/compliance-monitoring-dashboard',
    createComplianceMonitoringDashboardRoutes()
  );
  router.use(
    '/audit-preparation-reports',
    createAuditPreparationReportsRoutes()
  );
  router.use('/governance-metrics-suite', createGovernanceMetricsSuiteRoutes());

  return router;
}
