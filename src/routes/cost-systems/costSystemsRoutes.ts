/**
 * Cost Systems Engineering Routes
 * Unified API endpoints for cost systems management
 */

import { Router } from 'express';
import { CostSystemsEngineeringOrchestrator } from '../services/business-logic/modules/cost-systems-engineering/CostSystemsEngineeringOrchestrator';
import type { CostSystemsConfig } from '../services/business-logic/modules/cost-systems-engineering';

const router = Router();

// Initialize the cost systems orchestrator
const costSystemsConfig: CostSystemsConfig = {
  businessTracking: {
    enabled: true,
    realTime: true,
    granularity: 'hour',
    categories: ['infrastructure', 'personnel', 'operations', 'technology']
  },
  customerAnalysis: {
    enabled: true,
    segmentation: true,
    predictiveModeling: true,
    lifetimeValueTracking: true
  },
  engineeringAlignment: {
    standardization: true,
    integration: true,
    optimization: true,
    monitoring: true
  },
  reporting: {
    frequency: 'hourly',
    formats: ['json', 'dashboard'],
    recipients: ['admin', 'managers', 'analysts']
  }
};

let orchestrator: CostSystemsEngineeringOrchestrator;

// Initialize orchestrator on first use
async function getOrchestrator(): Promise<CostSystemsEngineeringOrchestrator> {
  if (!orchestrator) {
    orchestrator = new CostSystemsEngineeringOrchestrator(costSystemsConfig);
    await orchestrator.initialize();
  }
  return orchestrator;
}

/**
 * @swagger
 * /api/v1/cost-systems/status:
 *   get:
 *     summary: Get cost systems status
 *     tags: [Cost Systems]
 *     responses:
 *       200:
 *         description: Cost systems status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get('/status', async (req, res) => {
  try {
    const orch = await getOrchestrator();
    const status = orch.getStatus();
    
    res.json({
      success: true,
      status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /api/v1/cost-systems/alignment:
 *   get:
 *     summary: Get comprehensive cost systems alignment
 *     tags: [Cost Systems]
 *     responses:
 *       200:
 *         description: Cost systems alignment data
 */
router.get('/alignment', async (req, res) => {
  try {
    const orch = await getOrchestrator();
    const alignment = await orch.getCostSystemsAlignment();
    
    res.json({
      success: true,
      alignment,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /api/v1/cost-systems/process:
 *   post:
 *     summary: Process cost data through standardized pipeline
 *     tags: [Cost Systems]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: object
 *                 description: Cost data to process
 *     responses:
 *       200:
 *         description: Cost data processed successfully
 */
router.post('/process', async (req, res) => {
  try {
    const { data } = req.body;
    
    if (!data) {
      return res.status(400).json({
        success: false,
        error: 'Cost data is required',
        timestamp: new Date().toISOString()
      });
    }
    
    const orch = await getOrchestrator();
    const result = await orch.processCostData(data);
    
    res.json({
      success: true,
      result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /api/v1/cost-systems/optimization/report:
 *   get:
 *     summary: Generate comprehensive cost optimization report
 *     tags: [Cost Systems]
 *     responses:
 *       200:
 *         description: Cost optimization report generated
 */
router.get('/optimization/report', async (req, res) => {
  try {
    const orch = await getOrchestrator();
    const report = await orch.generateOptimizationReport();
    
    res.json({
      success: true,
      report,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /api/v1/cost-systems/business/metrics:
 *   get:
 *     summary: Get business-ready cost metrics
 *     tags: [Cost Systems]
 *     responses:
 *       200:
 *         description: Business cost metrics
 */
router.get('/business/metrics', async (req, res) => {
  try {
    const orch = await getOrchestrator();
    const alignment = await orch.getCostSystemsAlignment();
    
    res.json({
      success: true,
      metrics: alignment.business.tracking,
      optimization: alignment.business.optimization,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /api/v1/cost-systems/business/track:
 *   post:
 *     summary: Track business costs
 *     tags: [Cost Systems]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Business costs tracked successfully
 */
router.post('/business/track', async (req, res) => {
  try {
    const orch = await getOrchestrator();
    const result = await orch.processCostData({
      ...req.body,
      type: 'business-tracking'
    });
    
    res.json({
      success: true,
      trackingResult: result.business,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /api/v1/cost-systems/customer/analysis:
 *   get:
 *     summary: Get customer-ready cost analysis
 *     tags: [Cost Systems]
 *     responses:
 *       200:
 *         description: Customer cost analysis
 */
router.get('/customer/analysis', async (req, res) => {
  try {
    const orch = await getOrchestrator();
    const alignment = await orch.getCostSystemsAlignment();
    
    res.json({
      success: true,
      analysis: alignment.customer.analysis,
      insights: alignment.customer.insights,
      recommendations: alignment.customer.recommendations,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /api/v1/cost-systems/customer/analyze:
 *   post:
 *     summary: Analyze customer costs
 *     tags: [Cost Systems]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Customer costs analyzed successfully
 */
router.post('/customer/analyze', async (req, res) => {
  try {
    const orch = await getOrchestrator();
    const result = await orch.processCostData({
      ...req.body,
      type: 'customer-analysis'
    });
    
    res.json({
      success: true,
      analysisResult: result.customer,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /api/v1/cost-systems/engineering/metrics:
 *   get:
 *     summary: Get engineering alignment metrics
 *     tags: [Cost Systems]
 *     responses:
 *       200:
 *         description: Engineering alignment metrics
 */
router.get('/engineering/metrics', async (req, res) => {
  try {
    const orch = await getOrchestrator();
    const alignment = await orch.getCostSystemsAlignment();
    
    res.json({
      success: true,
      engineering: alignment.engineering,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /api/v1/cost-systems/integration/status:
 *   get:
 *     summary: Get cost systems integration status
 *     tags: [Cost Systems]
 *     responses:
 *       200:
 *         description: Integration status
 */
router.get('/integration/status', async (req, res) => {
  try {
    const orch = await getOrchestrator();
    const alignment = await orch.getCostSystemsAlignment();
    
    res.json({
      success: true,
      integration: alignment.engineering.integration,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /api/v1/cost-systems/health:
 *   get:
 *     summary: Get comprehensive cost systems health
 *     tags: [Cost Systems]
 *     responses:
 *       200:
 *         description: Cost systems health status
 */
router.get('/health', async (req, res) => {
  try {
    const orch = await getOrchestrator();
    const status = orch.getStatus();
    const alignment = await orch.getCostSystemsAlignment();
    
    const health = {
      overall: 'healthy',
      components: status.components,
      integration: alignment.engineering.integration,
      architecture: alignment.engineering.architecture,
      businessReadiness: status.components.businessTracker && status.components.businessTracker,
      customerReadiness: status.components.customerAnalyzer && status.components.customerAnalyzer,
      engineeringAlignment: status.components.integrator && status.components.integrator,
      lastCheck: new Date().toISOString()
    };
    
    res.json({
      success: true,
      health,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /api/v1/cost-systems/dashboard:
 *   get:
 *     summary: Get cost systems dashboard data
 *     tags: [Cost Systems]
 *     responses:
 *       200:
 *         description: Dashboard data for cost systems
 */
router.get('/dashboard', async (req, res) => {
  try {
    const orch = await getOrchestrator();
    const alignment = await orch.getCostSystemsAlignment();
    const optimizationReport = await orch.generateOptimizationReport();
    
    const dashboard = {
      summary: {
        businessReadinessScore: optimizationReport.summary.businessReadinessScore,
        customerReadinessScore: optimizationReport.summary.customerReadinessScore,
        engineeringAlignmentScore: optimizationReport.summary.engineeringAlignmentScore,
        totalPotentialSavings: optimizationReport.summary.totalCostSavingsPotential,
        activeRecommendations: optimizationReport.summary.recommendationsCount
      },
      business: {
        metrics: alignment.business.tracking,
        topOptimizations: alignment.business.optimization.slice(0, 5)
      },
      customer: {
        analysis: alignment.customer.analysis,
        topInsights: alignment.customer.insights.slice(0, 5),
        topRecommendations: alignment.customer.recommendations.slice(0, 5)
      },
      engineering: {
        standardization: alignment.engineering.standardization,
        integration: alignment.engineering.integration,
        architecture: alignment.engineering.architecture
      },
      trends: {
        costTrends: alignment.business.tracking.trends,
        optimizationTrends: { monthly: optimizationReport.summary.recommendationsCount }
      }
    };
    
    res.json({
      success: true,
      dashboard,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;