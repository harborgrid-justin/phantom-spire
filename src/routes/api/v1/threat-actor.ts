/**
 * Threat Actor Core API Routes
 * Production-ready REST endpoints for threat actor intelligence and attribution
 */

import { Router, Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { ThreatActorCore } from '../../../../packages/phantom-threat-actor-core/src-ts';
import { DatabaseService } from '../../../services/DatabaseService';
import { LoggingService } from '../../../services/LoggingService';
import { CacheService } from '../../../services/CacheService';
import { rateLimit } from 'express-rate-limit';

const router = Router();
const logger = LoggingService.getInstance();
const dbService = DatabaseService.getInstance();
const cacheService = CacheService.getInstance();

// Rate limiting for Threat Actor endpoints
const threatActorRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per windowMs
  message: 'Too many threat actor requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Initialize Threat Actor Core
let threatActorCore: ThreatActorCore | null = null;

const initializeThreatActorCore = async () => {
  if (!threatActorCore) {
    try {
      threatActorCore = await ThreatActorCore.new();
      logger.info('Threat Actor Core initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Threat Actor Core:', error);
      throw new Error('Threat Actor Core initialization failed');
    }
  }
  return threatActorCore;
};

/**
 * @swagger
 * /api/v1/threat-actor/analyze:
 *   post:
 *     summary: Analyze threat actor from indicators
 *     tags: [ThreatActor]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               indicators:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of indicators for analysis
 *               context:
 *                 type: object
 *                 description: Additional context for analysis
 *             required:
 *               - indicators
 *     responses:
 *       200:
 *         description: Threat actor analysis completed successfully
 */
router.post('/analyze', [
  threatActorRateLimit,
  body('indicators').isArray({ min: 1 }).withMessage('Indicators array is required'),
  body('indicators.*').isString().withMessage('Each indicator must be a string'),
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

    const { indicators, context = {} } = req.body;
    
    // Create cache key from indicators
    const cacheKey = `threat_actor_analysis_${JSON.stringify(indicators).slice(0, 100)}`;
    const cachedResult = await cacheService.get(cacheKey);
    if (cachedResult) {
      return res.json({
        success: true,
        data: cachedResult,
        message: 'Threat actor analysis retrieved from cache',
        cached: true
      });
    }

    const core = await initializeThreatActorCore();
    const analysis = await core.analyze_threat_actor(indicators);
    
    // Store in database
    await dbService.storeThreatActorAnalysis(analysis);
    
    // Cache the result for 2 hours
    await cacheService.set(cacheKey, analysis, 7200);
    
    logger.info('Threat actor analysis completed', {
      indicatorCount: indicators.length,
      actorId: analysis.id,
      confidenceScore: analysis.confidence_score
    });

    res.json({
      success: true,
      data: analysis,
      message: 'Threat actor analysis completed successfully'
    });

  } catch (error) {
    logger.error('Threat actor analysis failed:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during threat actor analysis',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

/**
 * @swagger
 * /api/v1/threat-actor/attribution:
 *   post:
 *     summary: Perform attribution analysis
 *     tags: [ThreatActor]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               indicators:
 *                 type: array
 *                 items:
 *                   type: string
 *               context:
 *                 type: object
 *             required:
 *               - indicators
 *     responses:
 *       200:
 *         description: Attribution analysis completed
 */
router.post('/attribution', [
  threatActorRateLimit,
  body('indicators').isArray({ min: 1 }).withMessage('Indicators array is required'),
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

    const { indicators, context = {} } = req.body;
    
    const cacheKey = `attribution_analysis_${JSON.stringify(indicators).slice(0, 100)}`;
    const cachedResult = await cacheService.get(cacheKey);
    if (cachedResult) {
      return res.json({
        success: true,
        data: cachedResult,
        message: 'Attribution analysis retrieved from cache',
        cached: true
      });
    }

    const core = await initializeThreatActorCore();
    const attribution = await core.perform_attribution(indicators);
    
    // Store attribution in database
    await dbService.storeAttributionAnalysis(attribution);
    
    // Cache for 4 hours
    await cacheService.set(cacheKey, attribution, 14400);
    
    logger.info('Attribution analysis completed', {
      indicatorCount: indicators.length,
      primaryAttribution: attribution.primary_attribution,
      confidenceScore: attribution.confidence_score
    });

    res.json({
      success: true,
      data: attribution,
      message: 'Attribution analysis completed successfully'
    });

  } catch (error) {
    logger.error('Attribution analysis failed:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during attribution analysis',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

/**
 * @swagger
 * /api/v1/threat-actor/campaign:
 *   post:
 *     summary: Track and analyze campaign activities
 *     tags: [ThreatActor]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               indicators:
 *                 type: array
 *                 items:
 *                   type: string
 *               campaign_name:
 *                 type: string
 *             required:
 *               - indicators
 *     responses:
 *       200:
 *         description: Campaign analysis completed
 */
router.post('/campaign', [
  threatActorRateLimit,
  body('indicators').isArray({ min: 1 }).withMessage('Indicators array is required'),
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

    const { indicators, campaign_name } = req.body;
    
    const cacheKey = `campaign_analysis_${JSON.stringify(indicators).slice(0, 100)}`;
    const cachedResult = await cacheService.get(cacheKey);
    if (cachedResult) {
      return res.json({
        success: true,
        data: cachedResult,
        message: 'Campaign analysis retrieved from cache',
        cached: true
      });
    }

    const core = await initializeThreatActorCore();
    const campaign = await core.track_campaign(indicators);
    
    // Store campaign in database
    await dbService.storeCampaignAnalysis(campaign);
    
    // Cache for 1 hour
    await cacheService.set(cacheKey, campaign, 3600);
    
    logger.info('Campaign analysis completed', {
      indicatorCount: indicators.length,
      campaignId: campaign.id,
      campaignName: campaign.name
    });

    res.json({
      success: true,
      data: campaign,
      message: 'Campaign analysis completed successfully'
    });

  } catch (error) {
    logger.error('Campaign analysis failed:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during campaign analysis',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

/**
 * @swagger
 * /api/v1/threat-actor/{actorId}/behavior:
 *   get:
 *     summary: Analyze behavioral patterns of a threat actor
 *     tags: [ThreatActor]
 *     parameters:
 *       - in: path
 *         name: actorId
 *         required: true
 *         schema:
 *           type: string
 *         description: Threat Actor ID
 *     responses:
 *       200:
 *         description: Behavioral analysis completed
 */
router.get('/:actorId/behavior', [
  threatActorRateLimit,
  param('actorId').isString().withMessage('Actor ID is required'),
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

    const { actorId } = req.params;
    
    const cacheKey = `behavior_analysis_${actorId}`;
    const cachedResult = await cacheService.get(cacheKey);
    if (cachedResult) {
      return res.json({
        success: true,
        data: cachedResult,
        message: 'Behavioral analysis retrieved from cache',
        cached: true
      });
    }

    // Get activities from database or use mock data
    const activities = await dbService.getThreatActorActivities(actorId) || [
      'spear_phishing_campaign',
      'credential_harvesting',
      'lateral_movement',
      'data_exfiltration'
    ];

    const core = await initializeThreatActorCore();
    const behavior = await core.analyze_behavior(actorId, activities);
    
    // Store behavioral analysis
    await dbService.storeBehavioralAnalysis(behavior);
    
    // Cache for 6 hours
    await cacheService.set(cacheKey, behavior, 21600);
    
    logger.info('Behavioral analysis completed', {
      actorId,
      patternCount: behavior.behavioral_patterns.length
    });

    res.json({
      success: true,
      data: behavior,
      message: 'Behavioral analysis completed successfully'
    });

  } catch (error) {
    logger.error('Behavioral analysis failed:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during behavioral analysis',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

/**
 * @swagger
 * /api/v1/threat-actor/search:
 *   get:
 *     summary: Search threat actors by criteria
 *     tags: [ThreatActor]
 *     parameters:
 *       - in: query
 *         name: actor_type
 *         schema:
 *           type: string
 *         description: Type of threat actor
 *       - in: query
 *         name: sophistication
 *         schema:
 *           type: string
 *         description: Sophistication level
 *       - in: query
 *         name: origin_country
 *         schema:
 *           type: string
 *         description: Country of origin
 *       - in: query
 *         name: active_since
 *         schema:
 *           type: string
 *         description: Active since date
 *     responses:
 *       200:
 *         description: Threat actor search results
 */
router.get('/search', [
  threatActorRateLimit,
], async (req: Request, res: Response) => {
  try {
    const criteria = {
      actor_type: req.query.actor_type as string,
      sophistication: req.query.sophistication as string,
      origin_country: req.query.origin_country as string,
      active_since: req.query.active_since as string,
    };

    // Filter out undefined values
    const cleanCriteria = Object.fromEntries(
      Object.entries(criteria).filter(([_, value]) => value !== undefined)
    );

    const cacheKey = `threat_actor_search_${JSON.stringify(cleanCriteria)}`;
    const cachedResult = await cacheService.get(cacheKey);
    if (cachedResult) {
      return res.json({
        success: true,
        data: cachedResult,
        message: 'Threat actor search results retrieved from cache',
        cached: true
      });
    }

    const core = await initializeThreatActorCore();
    const results = await core.search_actors(cleanCriteria);

    // Cache results for 1 hour
    await cacheService.set(cacheKey, results, 3600);

    logger.info('Threat actor search completed', {
      criteria: cleanCriteria,
      resultCount: results.length
    });

    res.json({
      success: true,
      data: {
        results,
        count: results.length,
        criteria: cleanCriteria
      },
      message: 'Threat actor search completed successfully'
    });

  } catch (error) {
    logger.error('Threat actor search failed:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during threat actor search',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

/**
 * @swagger
 * /api/v1/threat-actor/{actorId}/reputation:
 *   get:
 *     summary: Get threat actor reputation score
 *     tags: [ThreatActor]
 *     parameters:
 *       - in: path
 *         name: actorId
 *         required: true
 *         schema:
 *           type: string
 *         description: Threat Actor ID
 *     responses:
 *       200:
 *         description: Reputation score retrieved
 */
router.get('/:actorId/reputation', [
  threatActorRateLimit,
  param('actorId').isString().withMessage('Actor ID is required'),
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

    const { actorId } = req.params;
    
    const cacheKey = `reputation_${actorId}`;
    const cachedResult = await cacheService.get(cacheKey);
    if (cachedResult) {
      return res.json({
        success: true,
        data: cachedResult,
        message: 'Reputation score retrieved from cache',
        cached: true
      });
    }

    const core = await initializeThreatActorCore();
    const reputation = await core.get_reputation(actorId);
    
    const result = {
      actor_id: actorId,
      reputation_score: reputation,
      timestamp: new Date(),
      risk_level: reputation > 0.8 ? 'high' : reputation > 0.6 ? 'medium' : 'low'
    };

    // Cache for 2 hours
    await cacheService.set(cacheKey, result, 7200);
    
    logger.info('Reputation score calculated', {
      actorId,
      reputation,
      riskLevel: result.risk_level
    });

    res.json({
      success: true,
      data: result,
      message: 'Reputation score calculated successfully'
    });

  } catch (error) {
    logger.error('Reputation calculation failed:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during reputation calculation',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

/**
 * @swagger
 * /api/v1/threat-actor/health:
 *   get:
 *     summary: Get Threat Actor Core health status
 *     tags: [ThreatActor]
 *     responses:
 *       200:
 *         description: Threat Actor Core health status
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const core = await initializeThreatActorCore();
    const health = await core.get_health_status();

    res.json({
      success: true,
      data: health,
      message: 'Threat Actor Core health check completed'
    });

  } catch (error) {
    logger.error('Threat Actor health check failed:', error);
    res.status(503).json({
      success: false,
      message: 'Threat Actor Core health check failed',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

export default router;