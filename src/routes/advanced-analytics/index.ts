/**
 * Advanced Analytics Routes Index
 * Aggregates all advanced analytics reporting routes
 */

import { Router } from 'express';
import { createPerformanceAnalyticsDashboardRoutes } from './performance-analytics-dashboardRoutes.js';
import { createPredictiveModelingReportsRoutes } from './predictive-modeling-reportsRoutes.js';
import { createDataVisualizationEngineRoutes } from './data-visualization-engineRoutes.js';
import { createStatisticalAnalysisSuiteRoutes } from './statistical-analysis-suiteRoutes.js';
import { createMachineLearningInsightsRoutes } from './machine-learning-insightsRoutes.js';
import { createBehavioralAnalyticsPlatformRoutes } from './behavioral-analytics-platformRoutes.js';
import { createTrendAnalysisDashboardRoutes } from './trend-analysis-dashboardRoutes.js';
import { createCorrelationAnalysisEngineRoutes } from './correlation-analysis-engineRoutes.js';
import { createAnomalyDetectionReportsRoutes } from './anomaly-detection-reportsRoutes.js';
import { createRealTimeAnalyticsHubRoutes } from './real-time-analytics-hubRoutes.js';

export function createAdvancedAnalyticsRoutes(): Router {
  const router = Router();

  // Mount all advanced analytics routes
  router.use(
    '/performance-analytics-dashboard',
    createPerformanceAnalyticsDashboardRoutes()
  );
  router.use(
    '/predictive-modeling-reports',
    createPredictiveModelingReportsRoutes()
  );
  router.use(
    '/data-visualization-engine',
    createDataVisualizationEngineRoutes()
  );
  router.use(
    '/statistical-analysis-suite',
    createStatisticalAnalysisSuiteRoutes()
  );
  router.use(
    '/machine-learning-insights',
    createMachineLearningInsightsRoutes()
  );
  router.use(
    '/behavioral-analytics-platform',
    createBehavioralAnalyticsPlatformRoutes()
  );
  router.use('/trend-analysis-dashboard', createTrendAnalysisDashboardRoutes());
  router.use(
    '/correlation-analysis-engine',
    createCorrelationAnalysisEngineRoutes()
  );
  router.use(
    '/anomaly-detection-reports',
    createAnomalyDetectionReportsRoutes()
  );
  router.use('/real-time-analytics-hub', createRealTimeAnalyticsHubRoutes());

  return router;
}
