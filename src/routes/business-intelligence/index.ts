/**
 * Business Intelligence Routes Index
 * Aggregates all business intelligence reporting routes
 */

import { Router } from 'express';
import { createExecutiveSummaryDashboardRoutes } from './executive-summary-dashboardRoutes.js';
import { createFinancialPerformanceAnalyticsRoutes } from './financial-performance-analyticsRoutes.js';
import { createMarketIntelligenceReportsRoutes } from './market-intelligence-reportsRoutes.js';
import { createCompetitiveAnalysisSuiteRoutes } from './competitive-analysis-suiteRoutes.js';
import { createCustomerInsightsDashboardRoutes } from './customer-insights-dashboardRoutes.js';
import { createBusinessMetricsOverviewRoutes } from './business-metrics-overviewRoutes.js';
import { createStrategicPlanningAnalyticsRoutes } from './strategic-planning-analyticsRoutes.js';
import { createRoiAnalysisReportsRoutes } from './roi-analysis-reportsRoutes.js';
import { createMarketTrendDashboardRoutes } from './market-trend-dashboardRoutes.js';
import { createBusinessForecastingSuiteRoutes } from './business-forecasting-suiteRoutes.js';

export function createBusinessIntelligenceRoutes(): Router {
  const router = Router();

  // Mount all business intelligence routes
  router.use(
    '/executive-summary-dashboard',
    createExecutiveSummaryDashboardRoutes()
  );
  router.use(
    '/financial-performance-analytics',
    createFinancialPerformanceAnalyticsRoutes()
  );
  router.use(
    '/market-intelligence-reports',
    createMarketIntelligenceReportsRoutes()
  );
  router.use(
    '/competitive-analysis-suite',
    createCompetitiveAnalysisSuiteRoutes()
  );
  router.use(
    '/customer-insights-dashboard',
    createCustomerInsightsDashboardRoutes()
  );
  router.use(
    '/business-metrics-overview',
    createBusinessMetricsOverviewRoutes()
  );
  router.use(
    '/strategic-planning-analytics',
    createStrategicPlanningAnalyticsRoutes()
  );
  router.use('/roi-analysis-reports', createRoiAnalysisReportsRoutes());
  router.use('/market-trend-dashboard', createMarketTrendDashboardRoutes());
  router.use(
    '/business-forecasting-suite',
    createBusinessForecastingSuiteRoutes()
  );

  return router;
}
