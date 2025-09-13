/**
 * Phantom ML Core API Controller
 * REST API endpoints for all 32 additional business-ready ML features
 */

import { Request, Response } from 'express';
import { BaseController } from '../BaseController';
import { phantomMLCoreService, MLServiceRequest } from '../services/PhantomMLCoreService';
import { logger } from '../utils/logger';

/**
 * ML Core Controller - Exposes all 32 additional NAPI bindings as REST endpoints
 * Provides enterprise-grade ML capabilities with full H2O competitive feature set
 */
export class PhantomMLCoreController extends BaseController {

  // ==================== SYSTEM STATUS ====================
  
  /**
   * GET /api/ml/status
   * Get system status and available methods
   */
  getSystemStatus = this.asyncHandler(async (req: Request, res: Response) => {
    const result = await phantomMLCoreService.getSystemStatus();
    
    if (result.success) {
      this.sendSuccess(res, result.data, 'ML Core system status retrieved');
    } else {
      this.handleError(res, result.error || 'Failed to get system status');
    }
  });

  // ==================== ADVANCED MODEL MANAGEMENT (8 endpoints) ====================

  /**
   * POST /api/ml/models/:modelId/validate
   * Validate model integrity and performance
   */
  validateModel = this.asyncHandler(async (req: Request, res: Response) => {
    const { modelId } = req.params;
    const config = req.body;
    
    const result = await phantomMLCoreService.validateModel(modelId, config);
    
    if (result.success) {
      this.sendSuccess(res, result.data, 'Model validation completed', { executionTime: result.executionTime });
    } else {
      this.handleError(res, result.error || 'Model validation failed');
    }
  });

  /**
   * POST /api/ml/models/:modelId/export
   * Export model in various formats
   */
  exportModel = this.asyncHandler(async (req: Request, res: Response) => {
    const { modelId } = req.params;
    const { format = 'json' } = req.body;
    
    const result = await phantomMLCoreService.exportModel(modelId, format);
    
    if (result.success) {
      this.sendSuccess(res, result.data, 'Model exported successfully', { executionTime: result.executionTime });
    } else {
      this.handleError(res, result.error || 'Model export failed');
    }
  });

  /**
   * POST /api/ml/models/import
   * Import model from external formats
   */
  importModel = this.asyncHandler(async (req: Request, res: Response) => {
    const { modelData, config } = req.body;
    
    const result = await phantomMLCoreService.importModel(modelData, config);
    
    if (result.success) {
      this.sendSuccess(res, result.data, 'Model imported successfully', { executionTime: result.executionTime });
    } else {
      this.handleError(res, result.error || 'Model import failed');
    }
  });

  /**
   * POST /api/ml/models/:modelId/clone
   * Clone model with optional modifications
   */
  cloneModel = this.asyncHandler(async (req: Request, res: Response) => {
    const { modelId } = req.params;
    const { newName } = req.body;
    
    const result = await phantomMLCoreService.cloneModel(modelId, newName);
    
    if (result.success) {
      this.sendSuccess(res, result.data, 'Model cloned successfully', { executionTime: result.executionTime });
    } else {
      this.handleError(res, result.error || 'Model cloning failed');
    }
  });

  /**
   * POST /api/ml/models/:modelId/archive
   * Archive model for long-term storage
   */
  archiveModel = this.asyncHandler(async (req: Request, res: Response) => {
    const { modelId } = req.params;
    
    const result = await phantomMLCoreService.archiveModel(modelId);
    
    if (result.success) {
      this.sendSuccess(res, result.data, 'Model archived successfully', { executionTime: result.executionTime });
    } else {
      this.handleError(res, result.error || 'Model archiving failed');
    }
  });

  /**
   * POST /api/ml/models/:modelId/restore
   * Restore model from archive
   */
  restoreModel = this.asyncHandler(async (req: Request, res: Response) => {
    const { modelId } = req.params;
    
    const result = await phantomMLCoreService.restoreModel(modelId);
    
    if (result.success) {
      this.sendSuccess(res, result.data, 'Model restored successfully', { executionTime: result.executionTime });
    } else {
      this.handleError(res, result.error || 'Model restoration failed');
    }
  });

  /**
   * POST /api/ml/models/compare
   * Compare performance between models
   */
  compareModels = this.asyncHandler(async (req: Request, res: Response) => {
    const { modelId1, modelId2 } = req.body;
    
    const result = await phantomMLCoreService.compareModels(modelId1, modelId2);
    
    if (result.success) {
      this.sendSuccess(res, result.data, 'Model comparison completed', { executionTime: result.executionTime });
    } else {
      this.handleError(res, result.error || 'Model comparison failed');
    }
  });

  /**
   * POST /api/ml/models/:modelId/optimize
   * Optimize model for performance/size/speed
   */
  optimizeModel = this.asyncHandler(async (req: Request, res: Response) => {
    const { modelId } = req.params;
    const { optimizationType = 'performance' } = req.body;
    
    const result = await phantomMLCoreService.optimizeModel(modelId, optimizationType);
    
    if (result.success) {
      this.sendSuccess(res, result.data, 'Model optimization completed', { executionTime: result.executionTime });
    } else {
      this.handleError(res, result.error || 'Model optimization failed');
    }
  });

  // ==================== ENHANCED ANALYTICS & INSIGHTS (8 endpoints) ====================

  /**
   * POST /api/ml/analytics/insights
   * Generate AI-powered insights from data
   */
  generateInsights = this.asyncHandler(async (req: Request, res: Response) => {
    const dataConfig = req.body;
    
    const result = await phantomMLCoreService.generateInsights(dataConfig);
    
    if (result.success) {
      this.sendSuccess(res, result.data, 'Insights generated successfully', { executionTime: result.executionTime });
    } else {
      this.handleError(res, result.error || 'Insights generation failed');
    }
  });

  /**
   * POST /api/ml/analytics/trends
   * Perform trend analysis on historical data
   */
  performTrendAnalysis = this.asyncHandler(async (req: Request, res: Response) => {
    const data = req.body;
    
    const result = await phantomMLCoreService.performTrendAnalysis(data);
    
    if (result.success) {
      this.sendSuccess(res, result.data, 'Trend analysis completed', { executionTime: result.executionTime });
    } else {
      this.handleError(res, result.error || 'Trend analysis failed');
    }
  });

  /**
   * POST /api/ml/analytics/correlation
   * Perform feature correlation analysis
   */
  performCorrelationAnalysis = this.asyncHandler(async (req: Request, res: Response) => {
    const { features } = req.body;
    
    const result = await phantomMLCoreService.performCorrelationAnalysis(features);
    
    if (result.success) {
      this.sendSuccess(res, result.data, 'Correlation analysis completed', { executionTime: result.executionTime });
    } else {
      this.handleError(res, result.error || 'Correlation analysis failed');
    }
  });

  /**
   * GET /api/ml/analytics/summary/:datasetId
   * Get comprehensive statistical summary
   */
  getStatisticalSummary = this.asyncHandler(async (req: Request, res: Response) => {
    const { datasetId } = req.params;
    
    const result = await phantomMLCoreService.getStatisticalSummary(datasetId);
    
    if (result.success) {
      this.sendSuccess(res, result.data, 'Statistical summary generated', { executionTime: result.executionTime });
    } else {
      this.handleError(res, result.error || 'Statistical summary failed');
    }
  });

  /**
   * POST /api/ml/analytics/data-quality
   * Assess data quality and completeness
   */
  assessDataQuality = this.asyncHandler(async (req: Request, res: Response) => {
    const dataConfig = req.body;
    
    const result = await phantomMLCoreService.assessDataQuality(dataConfig);
    
    if (result.success) {
      this.sendSuccess(res, result.data, 'Data quality assessment completed', { executionTime: result.executionTime });
    } else {
      this.handleError(res, result.error || 'Data quality assessment failed');
    }
  });

  /**
   * GET /api/ml/analytics/feature-importance/:modelId
   * Analyze feature importance scoring
   */
  analyzeFeatureImportance = this.asyncHandler(async (req: Request, res: Response) => {
    const { modelId } = req.params;
    
    const result = await phantomMLCoreService.analyzeFeatureImportance(modelId);
    
    if (result.success) {
      this.sendSuccess(res, result.data, 'Feature importance analysis completed', { executionTime: result.executionTime });
    } else {
      this.handleError(res, result.error || 'Feature importance analysis failed');
    }
  });

  /**
   * POST /api/ml/analytics/explain/:modelId
   * Generate model decision explanations
   */
  explainModel = this.asyncHandler(async (req: Request, res: Response) => {
    const { modelId } = req.params;
    const { instance } = req.body;
    
    const result = await phantomMLCoreService.explainModel(modelId, instance);
    
    if (result.success) {
      this.sendSuccess(res, result.data, 'Model explanation generated', { executionTime: result.executionTime });
    } else {
      this.handleError(res, result.error || 'Model explanation failed');
    }
  });

  /**
   * POST /api/ml/analytics/business-impact
   * Analyze business impact and ROI
   */
  analyzeBusinessImpact = this.asyncHandler(async (req: Request, res: Response) => {
    const config = req.body;
    
    const result = await phantomMLCoreService.analyzeBusinessImpact(config);
    
    if (result.success) {
      this.sendSuccess(res, result.data, 'Business impact analysis completed', { executionTime: result.executionTime });
    } else {
      this.handleError(res, result.error || 'Business impact analysis failed');
    }
  });

  // ==================== REAL-TIME PROCESSING (6 endpoints) ====================

  /**
   * POST /api/ml/stream/predict/:modelId
   * Real-time streaming predictions
   */
  streamPredict = this.asyncHandler(async (req: Request, res: Response) => {
    const { modelId } = req.params;
    const streamConfig = req.body;
    
    const result = await phantomMLCoreService.streamPredict(modelId, streamConfig);
    
    if (result.success) {
      this.sendSuccess(res, result.data, 'Stream prediction initiated', { executionTime: result.executionTime });
    } else {
      this.handleError(res, result.error || 'Stream prediction failed');
    }
  });

  /**
   * POST /api/ml/batch/process/:modelId
   * Asynchronous batch processing
   */
  batchProcessAsync = this.asyncHandler(async (req: Request, res: Response) => {
    const { modelId } = req.params;
    const { batchData } = req.body;
    
    const result = await phantomMLCoreService.batchProcessAsync(modelId, batchData);
    
    if (result.success) {
      this.sendSuccess(res, result.data, 'Batch processing initiated', { executionTime: result.executionTime });
    } else {
      this.handleError(res, result.error || 'Batch processing failed');
    }
  });

  /**
   * POST /api/ml/monitoring/start
   * Start real-time monitoring
   */
  startRealTimeMonitoring = this.asyncHandler(async (req: Request, res: Response) => {
    const config = req.body;
    
    const result = await phantomMLCoreService.startRealTimeMonitoring(config);
    
    if (result.success) {
      this.sendSuccess(res, result.data, 'Real-time monitoring started', { executionTime: result.executionTime });
    } else {
      this.handleError(res, result.error || 'Real-time monitoring failed');
    }
  });

  /**
   * POST /api/ml/alerts/configure
   * Configure automated alerts
   */
  configureAlerts = this.asyncHandler(async (req: Request, res: Response) => {
    const alertRules = req.body;
    
    const result = await phantomMLCoreService.configureAlerts(alertRules);
    
    if (result.success) {
      this.sendSuccess(res, result.data, 'Alerts configured successfully', { executionTime: result.executionTime });
    } else {
      this.handleError(res, result.error || 'Alert configuration failed');
    }
  });

  /**
   * POST /api/ml/thresholds/manage
   * Manage dynamic thresholds
   */
  manageThresholds = this.asyncHandler(async (req: Request, res: Response) => {
    const config = req.body;
    
    const result = await phantomMLCoreService.manageThresholds(config);
    
    if (result.success) {
      this.sendSuccess(res, result.data, 'Thresholds managed successfully', { executionTime: result.executionTime });
    } else {
      this.handleError(res, result.error || 'Threshold management failed');
    }
  });

  /**
   * POST /api/ml/events/process
   * Process events in real-time
   */
  processEvents = this.asyncHandler(async (req: Request, res: Response) => {
    const eventConfig = req.body;
    
    const result = await phantomMLCoreService.processEvents(eventConfig);
    
    if (result.success) {
      this.sendSuccess(res, result.data, 'Events processed successfully', { executionTime: result.executionTime });
    } else {
      this.handleError(res, result.error || 'Event processing failed');
    }
  });

  // ==================== ENTERPRISE FEATURES (5 endpoints) ====================

  /**
   * POST /api/ml/audit/trail
   * Generate comprehensive audit trail
   */
  generateAuditTrail = this.asyncHandler(async (req: Request, res: Response) => {
    const config = req.body;
    
    const result = await phantomMLCoreService.generateAuditTrail(config);
    
    if (result.success) {
      this.sendSuccess(res, result.data, 'Audit trail generated', { executionTime: result.executionTime });
    } else {
      this.handleError(res, result.error || 'Audit trail generation failed');
    }
  });

  /**
   * POST /api/ml/compliance/report
   * Generate compliance reports
   */
  generateComplianceReport = this.asyncHandler(async (req: Request, res: Response) => {
    const config = req.body;
    
    const result = await phantomMLCoreService.generateComplianceReport(config);
    
    if (result.success) {
      this.sendSuccess(res, result.data, 'Compliance report generated', { executionTime: result.executionTime });
    } else {
      this.handleError(res, result.error || 'Compliance report generation failed');
    }
  });

  /**
   * POST /api/ml/security/scan
   * Perform security vulnerability scanning
   */
  performSecurityScan = this.asyncHandler(async (req: Request, res: Response) => {
    const config = req.body;
    
    const result = await phantomMLCoreService.performSecurityScan(config);
    
    if (result.success) {
      this.sendSuccess(res, result.data, 'Security scan completed', { executionTime: result.executionTime });
    } else {
      this.handleError(res, result.error || 'Security scan failed');
    }
  });

  /**
   * POST /api/ml/backup
   * Backup system and data
   */
  backupSystem = this.asyncHandler(async (req: Request, res: Response) => {
    const config = req.body;
    
    const result = await phantomMLCoreService.backupSystem(config);
    
    if (result.success) {
      this.sendSuccess(res, result.data, 'System backup completed', { executionTime: result.executionTime });
    } else {
      this.handleError(res, result.error || 'System backup failed');
    }
  });

  /**
   * POST /api/ml/disaster-recovery
   * Initiate disaster recovery procedures
   */
  initiateDisasterRecovery = this.asyncHandler(async (req: Request, res: Response) => {
    const config = req.body;
    
    const result = await phantomMLCoreService.initiateDisasterRecovery(config);
    
    if (result.success) {
      this.sendSuccess(res, result.data, 'Disaster recovery initiated', { executionTime: result.executionTime });
    } else {
      this.handleError(res, result.error || 'Disaster recovery failed');
    }
  });

  // ==================== BUSINESS INTELLIGENCE (5 endpoints) ====================

  /**
   * POST /api/ml/business/roi
   * Calculate ROI and business metrics
   */
  calculateROI = this.asyncHandler(async (req: Request, res: Response) => {
    const config = req.body;
    
    const result = await phantomMLCoreService.calculateROI(config);
    
    if (result.success) {
      this.sendSuccess(res, result.data, 'ROI calculation completed', { executionTime: result.executionTime });
    } else {
      this.handleError(res, result.error || 'ROI calculation failed');
    }
  });

  /**
   * POST /api/ml/business/cost-benefit
   * Perform cost-benefit analysis
   */
  performCostBenefitAnalysis = this.asyncHandler(async (req: Request, res: Response) => {
    const config = req.body;
    
    const result = await phantomMLCoreService.performCostBenefitAnalysis(config);
    
    if (result.success) {
      this.sendSuccess(res, result.data, 'Cost-benefit analysis completed', { executionTime: result.executionTime });
    } else {
      this.handleError(res, result.error || 'Cost-benefit analysis failed');
    }
  });

  /**
   * POST /api/ml/business/forecast
   * Forecast performance and trends
   */
  forecastPerformance = this.asyncHandler(async (req: Request, res: Response) => {
    const config = req.body;
    
    const result = await phantomMLCoreService.forecastPerformance(config);
    
    if (result.success) {
      this.sendSuccess(res, result.data, 'Performance forecast completed', { executionTime: result.executionTime });
    } else {
      this.handleError(res, result.error || 'Performance forecasting failed');
    }
  });

  /**
   * POST /api/ml/business/optimize-resources
   * Optimize resource allocation
   */
  optimizeResources = this.asyncHandler(async (req: Request, res: Response) => {
    const config = req.body;
    
    const result = await phantomMLCoreService.optimizeResources(config);
    
    if (result.success) {
      this.sendSuccess(res, result.data, 'Resource optimization completed', { executionTime: result.executionTime });
    } else {
      this.handleError(res, result.error || 'Resource optimization failed');
    }
  });

  /**
   * POST /api/ml/business/metrics
   * Track business KPIs and metrics
   */
  trackBusinessMetrics = this.asyncHandler(async (req: Request, res: Response) => {
    const config = req.body;
    
    const result = await phantomMLCoreService.trackBusinessMetrics(config);
    
    if (result.success) {
      this.sendSuccess(res, result.data, 'Business metrics tracked', { executionTime: result.executionTime });
    } else {
      this.handleError(res, result.error || 'Business metrics tracking failed');
    }
  });
}

export const phantomMLCoreController = new PhantomMLCoreController();