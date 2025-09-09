/**
 * Operational Efficiency Routes Index
 * Aggregates all operational efficiency reporting routes
 */

import { Router } from 'express';
import { createResourceUtilizationReportsRoutes } from './resource-utilization-reportsRoutes.js';
import { createWorkflowOptimizationDashboardRoutes } from './workflow-optimization-dashboardRoutes.js';
import { createProductivityMetricsSuiteRoutes } from './productivity-metrics-suiteRoutes.js';
import { createCapacityPlanningAnalyticsRoutes } from './capacity-planning-analyticsRoutes.js';
import { createPerformanceMonitoringHubRoutes } from './performance-monitoring-hubRoutes.js';
import { createEfficiencyBenchmarkingRoutes } from './efficiency-benchmarkingRoutes.js';
import { createAutomationImpactAnalysisRoutes } from './automation-impact-analysisRoutes.js';
import { createCostOptimizationReportsRoutes } from './cost-optimization-reportsRoutes.js';
import { createServiceLevelDashboardRoutes } from './service-level-dashboardRoutes.js';
import { createOperationalKpiTrackerRoutes } from './operational-kpi-trackerRoutes.js';

export function createOperationalEfficiencyRoutes(): Router {
  const router = Router();

  // Mount all operational efficiency routes
  router.use(
    '/resource-utilization-reports',
    createResourceUtilizationReportsRoutes()
  );
  router.use(
    '/workflow-optimization-dashboard',
    createWorkflowOptimizationDashboardRoutes()
  );
  router.use(
    '/productivity-metrics-suite',
    createProductivityMetricsSuiteRoutes()
  );
  router.use(
    '/capacity-planning-analytics',
    createCapacityPlanningAnalyticsRoutes()
  );
  router.use(
    '/performance-monitoring-hub',
    createPerformanceMonitoringHubRoutes()
  );
  router.use('/efficiency-benchmarking', createEfficiencyBenchmarkingRoutes());
  router.use(
    '/automation-impact-analysis',
    createAutomationImpactAnalysisRoutes()
  );
  router.use(
    '/cost-optimization-reports',
    createCostOptimizationReportsRoutes()
  );
  router.use('/service-level-dashboard', createServiceLevelDashboardRoutes());
  router.use('/operational-kpi-tracker', createOperationalKpiTrackerRoutes());

  return router;
}
