/**
 * Phantom ML Core Routes
 * REST API routes for all 32 additional business-ready ML features
 * Complete H2O competitive feature set with enterprise integration
 */

import { Router } from 'express';
import { phantomMLCoreController } from '../controllers/PhantomMLCoreController';

const router = Router();

// ==================== SYSTEM STATUS ====================
router.get('/status', phantomMLCoreController.getSystemStatus);

// ==================== ADVANCED MODEL MANAGEMENT (8 endpoints) ====================
router.post('/models/:modelId/validate', phantomMLCoreController.validateModel);
router.post('/models/:modelId/export', phantomMLCoreController.exportModel);
router.post('/models/import', phantomMLCoreController.importModel);
router.post('/models/:modelId/clone', phantomMLCoreController.cloneModel);
router.post('/models/:modelId/archive', phantomMLCoreController.archiveModel);
router.post('/models/:modelId/restore', phantomMLCoreController.restoreModel);
router.post('/models/compare', phantomMLCoreController.compareModels);
router.post('/models/:modelId/optimize', phantomMLCoreController.optimizeModel);

// ==================== ENHANCED ANALYTICS & INSIGHTS (8 endpoints) ====================
router.post('/analytics/insights', phantomMLCoreController.generateInsights);
router.post('/analytics/trends', phantomMLCoreController.performTrendAnalysis);
router.post('/analytics/correlation', phantomMLCoreController.performCorrelationAnalysis);
router.get('/analytics/summary/:datasetId', phantomMLCoreController.getStatisticalSummary);
router.post('/analytics/data-quality', phantomMLCoreController.assessDataQuality);
router.get('/analytics/feature-importance/:modelId', phantomMLCoreController.analyzeFeatureImportance);
router.post('/analytics/explain/:modelId', phantomMLCoreController.explainModel);
router.post('/analytics/business-impact', phantomMLCoreController.analyzeBusinessImpact);

// ==================== REAL-TIME PROCESSING (6 endpoints) ====================
router.post('/stream/predict/:modelId', phantomMLCoreController.streamPredict);
router.post('/batch/process/:modelId', phantomMLCoreController.batchProcessAsync);
router.post('/monitoring/start', phantomMLCoreController.startRealTimeMonitoring);
router.post('/alerts/configure', phantomMLCoreController.configureAlerts);
router.post('/thresholds/manage', phantomMLCoreController.manageThresholds);
router.post('/events/process', phantomMLCoreController.processEvents);

// ==================== ENTERPRISE FEATURES (5 endpoints) ====================
router.post('/audit/trail', phantomMLCoreController.generateAuditTrail);
router.post('/compliance/report', phantomMLCoreController.generateComplianceReport);
router.post('/security/scan', phantomMLCoreController.performSecurityScan);
router.post('/backup', phantomMLCoreController.backupSystem);
router.post('/disaster-recovery', phantomMLCoreController.initiateDisasterRecovery);

// ==================== BUSINESS INTELLIGENCE (5 endpoints) ====================
router.post('/business/roi', phantomMLCoreController.calculateROI);
router.post('/business/cost-benefit', phantomMLCoreController.performCostBenefitAnalysis);
router.post('/business/forecast', phantomMLCoreController.forecastPerformance);
router.post('/business/optimize-resources', phantomMLCoreController.optimizeResources);
router.post('/business/metrics', phantomMLCoreController.trackBusinessMetrics);

export { router as phantomMLCoreRoutes };