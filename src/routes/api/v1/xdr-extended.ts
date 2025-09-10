/**
 * XDR Core API Routes
 * Production-ready REST endpoints for Extended Detection and Response (XDR)
 */

import { Router, Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { XDRCore } from '../../../../packages/phantom-xdr-core/src-ts';
import { DatabaseService } from '../../../services/DatabaseService';
import { LoggingService } from '../../../services/LoggingService';
import { CacheService } from '../../../services/CacheService';
import { rateLimit } from 'express-rate-limit';

const router = Router();
const logger = LoggingService.getInstance();
const dbService = DatabaseService.getInstance();
const cacheService = CacheService.getInstance();

// Rate limiting for XDR endpoints
const xdrRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Higher limit for real-time detection system
  message: 'Too many XDR requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Initialize XDR Core
let xdrCore: XDRCore | null = null;

const initializeXDRCore = async () => {
  if (!xdrCore) {
    try {
      xdrCore = await XDRCore.new();
      logger.info('XDR Core initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize XDR Core:', error);
      throw new Error('XDR Core initialization failed');
    }
  }
  return xdrCore;
};

/**
 * @swagger
 * /api/v1/xdr/detect:
 *   post:
 *     summary: Analyze events for threat detection
 *     tags: [XDR]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               events:
 *                 type: array
 *                 items:
 *                   type: object
 *                 description: Security events to analyze
 *               correlation_window:
 *                 type: number
 *                 description: Time window for correlation in minutes
 *             required:
 *               - events
 *     responses:
 *       200:
 *         description: Threat detection analysis completed
 */
router.post('/detect', [
  xdrRateLimit,
  body('events').isArray({ min: 1 }).withMessage('Events array is required'),
  body('correlation_window').optional().isInt({ min: 1, max: 1440 }),
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { events, correlation_window = 60 } = req.body;
    
    // Create cache key from event hashes
    const eventHashes = events.map((e: any) => JSON.stringify(e).slice(0, 50)).join('_');
    const cacheKey = `xdr_detection_${eventHashes.slice(0, 100)}`;
    
    const cachedResult = await cacheService.get(cacheKey);
    if (cachedResult) {
      return res.json({
        success: true,
        data: cachedResult,
        message: 'XDR detection results retrieved from cache',
        cached: true
      });
    }

    const core = await initializeXDRCore();
    const detectionResults = await core.detect_threats(events, correlation_window);
    
    // Store detection results in database
    await dbService.storeXDRDetection(detectionResults);
    
    // Cache results for 10 minutes (short TTL for real-time system)
    await cacheService.set(cacheKey, detectionResults, 600);
    
    logger.info('XDR threat detection completed', {
      eventCount: events.length,
      threatsDetected: detectionResults.threats.length,
      severityDistribution: detectionResults.severity_distribution
    });

    res.json({
      success: true,
      data: detectionResults,
      message: 'XDR threat detection completed successfully'
    });

  } catch (error) {
    logger.error('XDR threat detection failed:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during XDR threat detection',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

/**
 * @swagger
 * /api/v1/xdr/respond:
 *   post:
 *     summary: Execute automated response to detected threats
 *     tags: [XDR]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               threat_id:
 *                 type: string
 *                 description: ID of the detected threat
 *               response_actions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Response actions to execute
 *               approval_required:
 *                 type: boolean
 *                 description: Whether approval is required for response
 *             required:
 *               - threat_id
 *               - response_actions
 *     responses:
 *       200:
 *         description: Automated response executed successfully
 */
router.post('/respond', [
  xdrRateLimit,
  body('threat_id').isString().withMessage('Threat ID is required'),
  body('response_actions').isArray({ min: 1 }).withMessage('Response actions are required'),
  body('approval_required').optional().isBoolean(),
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { threat_id, response_actions, approval_required = false } = req.body;
    
    const core = await initializeXDRCore();
    const responseResult = await core.execute_response(threat_id, response_actions, approval_required);
    
    // Store response execution in database
    await dbService.storeXDRResponse(responseResult);
    
    logger.info('XDR automated response executed', {
      threatId: threat_id,
      actionsExecuted: response_actions.length,
      success: responseResult.success,
      requiresApproval: approval_required
    });

    res.json({
      success: true,
      data: responseResult,
      message: 'XDR automated response executed successfully'
    });

  } catch (error) {
    logger.error('XDR automated response failed:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during XDR automated response',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

/**
 * @swagger
 * /api/v1/xdr/hunt:
 *   post:
 *     summary: Execute threat hunting queries
 *     tags: [XDR]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query:
 *                 type: string
 *                 description: Threat hunting query
 *               time_range:
 *                 type: object
 *                 properties:
 *                   start:
 *                     type: string
 *                   end:
 *                     type: string
 *                 description: Time range for hunting
 *               indicators:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: IOCs to hunt for
 *             required:
 *               - query
 *     responses:
 *       200:
 *         description: Threat hunting completed successfully
 */
router.post('/hunt', [
  xdrRateLimit,
  body('query').isString().withMessage('Hunt query is required'),
  body('time_range').optional().isObject(),
  body('indicators').optional().isArray(),
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { query, time_range, indicators = [] } = req.body;
    
    const cacheKey = `xdr_hunt_${JSON.stringify({ query, time_range }).slice(0, 100)}`;
    const cachedResult = await cacheService.get(cacheKey);
    if (cachedResult) {
      return res.json({
        success: true,
        data: cachedResult,
        message: 'XDR hunting results retrieved from cache',
        cached: true
      });
    }

    const core = await initializeXDRCore();
    const huntResults = await core.threat_hunt(query, time_range, indicators);
    
    // Store hunting results in database
    await dbService.storeXDRHunt(huntResults);
    
    // Cache results for 30 minutes
    await cacheService.set(cacheKey, huntResults, 1800);
    
    logger.info('XDR threat hunting completed', {
      query: query.slice(0, 100),
      indicatorCount: indicators.length,
      resultsFound: huntResults.results.length
    });

    res.json({
      success: true,
      data: huntResults,
      message: 'XDR threat hunting completed successfully'
    });

  } catch (error) {
    logger.error('XDR threat hunting failed:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during XDR threat hunting',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

/**
 * @swagger
 * /api/v1/xdr/analytics:
 *   get:
 *     summary: Get behavioral analytics and insights
 *     tags: [XDR]
 *     parameters:
 *       - in: query
 *         name: time_period
 *         schema:
 *           type: string
 *           enum: [1h, 24h, 7d, 30d]
 *         description: Time period for analytics
 *       - in: query
 *         name: entity_type
 *         schema:
 *           type: string
 *           enum: [user, host, network, process]
 *         description: Entity type for analysis
 *       - in: query
 *         name: baseline_update
 *         schema:
 *           type: boolean
 *         description: Whether to update behavioral baseline
 *     responses:
 *       200:
 *         description: Behavioral analytics completed
 */
router.get('/analytics', [
  xdrRateLimit,
  query('time_period').optional().isIn(['1h', '24h', '7d', '30d']),
  query('entity_type').optional().isIn(['user', 'host', 'network', 'process']),
  query('baseline_update').optional().isBoolean(),
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const {
      time_period = '24h',
      entity_type = 'all',
      baseline_update = false
    } = req.query;

    const cacheKey = `xdr_analytics_${time_period}_${entity_type}_${baseline_update}`;
    const cachedResult = await cacheService.get(cacheKey);
    if (cachedResult) {
      return res.json({
        success: true,
        data: cachedResult,
        message: 'XDR analytics retrieved from cache',
        cached: true
      });
    }

    const core = await initializeXDRCore();
    const analytics = await core.behavioral_analytics(
      time_period as string,
      entity_type as string,
      baseline_update as boolean
    );
    
    // Store analytics in database
    await dbService.storeXDRAnalytics(analytics);
    
    // Cache analytics for 1 hour
    await cacheService.set(cacheKey, analytics, 3600);
    
    logger.info('XDR behavioral analytics completed', {
      timePeriod: time_period,
      entityType: entity_type,
      anomaliesDetected: analytics.anomalies.length
    });

    res.json({
      success: true,
      data: analytics,
      message: 'XDR behavioral analytics completed successfully'
    });

  } catch (error) {
    logger.error('XDR behavioral analytics failed:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during XDR behavioral analytics',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

/**
 * @swagger
 * /api/v1/xdr/dashboard:
 *   get:
 *     summary: Get real-time XDR dashboard data
 *     tags: [XDR]
 *     responses:
 *       200:
 *         description: XDR dashboard data retrieved
 */
router.get('/dashboard', [
  xdrRateLimit,
], async (req: Request, res: Response) => {
  try {
    const cacheKey = 'xdr_dashboard_realtime';
    const cachedResult = await cacheService.get(cacheKey);
    if (cachedResult) {
      return res.json({
        success: true,
        data: cachedResult,
        message: 'XDR dashboard data retrieved from cache',
        cached: true
      });
    }

    const core = await initializeXDRCore();
    const dashboardData = await core.get_dashboard_data();
    
    // Cache dashboard data for 5 minutes (frequent updates for real-time display)
    await cacheService.set(cacheKey, dashboardData, 300);
    
    logger.info('XDR dashboard data generated', {
      activeThreatCount: dashboardData.active_threats,
      riskScore: dashboardData.overall_risk_score
    });

    res.json({
      success: true,
      data: dashboardData,
      message: 'XDR dashboard data retrieved successfully'
    });

  } catch (error) {
    logger.error('XDR dashboard data generation failed:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during XDR dashboard data generation',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

/**
 * @swagger
 * /api/v1/xdr/health:
 *   get:
 *     summary: Get XDR Core health status
 *     tags: [XDR]
 *     responses:
 *       200:
 *         description: XDR Core health status
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const core = await initializeXDRCore();
    const health = await core.get_health_status();

    res.json({
      success: true,
      data: health,
      message: 'XDR Core health check completed'
    });

  } catch (error) {
    logger.error('XDR health check failed:', error);
    res.status(503).json({
      success: false,
      message: 'XDR Core health check failed',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

export default router;