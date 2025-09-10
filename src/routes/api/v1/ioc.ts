/**
 * IOC Core API Routes
 * Production-ready REST endpoints for Indicators of Compromise processing
 */

import { Router, Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { IOCCore } from '../../../../packages/phantom-ioc-core/src-ts';
import { DatabaseService } from '../../../services/DatabaseService';
import { LoggingService } from '../../../services/LoggingService';
import { CacheService } from '../../../services/CacheService';
import { rateLimit } from 'express-rate-limit';

const router = Router();
const logger = LoggingService.getInstance();
const dbService = DatabaseService.getInstance();
const cacheService = CacheService.getInstance();

// Rate limiting for IOC endpoints
const iocRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Higher limit for IOC processing
  message: 'Too many IOC requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Initialize IOC Core
let iocCore: IOCCore | null = null;

const initializeIOCCore = async () => {
  if (!iocCore) {
    try {
      iocCore = await IOCCore.new();
      logger.info('IOC Core initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize IOC Core:', error);
      throw new Error('IOC Core initialization failed');
    }
  }
  return iocCore;
};

/**
 * @swagger
 * /api/v1/ioc/analyze:
 *   post:
 *     summary: Analyze and enrich IOCs with threat intelligence
 *     tags: [IOC]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               iocs:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     value:
 *                       type: string
 *                     type:
 *                       type: string
 *                 description: Array of IOCs to analyze
 *             required:
 *               - iocs
 *     responses:
 *       200:
 *         description: IOC analysis completed successfully
 */
router.post('/analyze', [
  iocRateLimit,
  body('iocs').isArray({ min: 1, max: 100 }).withMessage('IOCs array is required (1-100 items)'),
  body('iocs.*.value').isString().withMessage('IOC value is required'),
  body('iocs.*.type').isIn(['ip', 'domain', 'url', 'hash', 'email']).withMessage('Valid IOC type is required'),
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

    const { iocs } = req.body;
    
    // Create cache key from IOC values
    const iocHash = iocs.map((ioc: any) => `${ioc.type}:${ioc.value}`).join('|');
    const cacheKey = `ioc_analysis_${iocHash.slice(0, 100)}`;
    
    const cachedResult = await cacheService.get(cacheKey);
    if (cachedResult) {
      return res.json({
        success: true,
        data: cachedResult,
        message: 'IOC analysis retrieved from cache',
        cached: true
      });
    }

    const core = await initializeIOCCore();
    const analysisResults = await core.analyze_iocs(iocs);
    
    // Store analysis results in database
    await dbService.storeIOCAnalysis(analysisResults);
    
    // Cache results for 30 minutes
    await cacheService.set(cacheKey, analysisResults, 1800);
    
    logger.info('IOC analysis completed', {
      iocCount: iocs.length,
      maliciousCount: analysisResults.filter((r: any) => r.is_malicious).length
    });

    res.json({
      success: true,
      data: analysisResults,
      message: 'IOC analysis completed successfully'
    });

  } catch (error) {
    logger.error('IOC analysis failed:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during IOC analysis',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

/**
 * @swagger
 * /api/v1/ioc/correlate:
 *   post:
 *     summary: Find correlations between IOCs and campaigns
 *     tags: [IOC]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               iocs:
 *                 type: array
 *                 items:
 *                   type: string
 *               time_window:
 *                 type: number
 *                 description: Time window in hours for correlation
 *             required:
 *               - iocs
 *     responses:
 *       200:
 *         description: IOC correlation completed
 */
router.post('/correlate', [
  iocRateLimit,
  body('iocs').isArray({ min: 1 }).withMessage('IOCs array is required'),
  body('time_window').optional().isInt({ min: 1, max: 720 }),
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

    const { iocs, time_window = 24 } = req.body;
    
    const cacheKey = `ioc_correlation_${JSON.stringify(iocs).slice(0, 100)}_${time_window}`;
    const cachedResult = await cacheService.get(cacheKey);
    if (cachedResult) {
      return res.json({
        success: true,
        data: cachedResult,
        message: 'IOC correlation retrieved from cache',
        cached: true
      });
    }

    const core = await initializeIOCCore();
    const correlations = await core.correlate_iocs(iocs, time_window);
    
    // Store correlations in database
    await dbService.storeIOCCorrelations(correlations);
    
    // Cache for 1 hour
    await cacheService.set(cacheKey, correlations, 3600);
    
    logger.info('IOC correlation completed', {
      inputIOCs: iocs.length,
      correlationsFound: correlations.length
    });

    res.json({
      success: true,
      data: correlations,
      message: 'IOC correlation completed successfully'
    });

  } catch (error) {
    logger.error('IOC correlation failed:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during IOC correlation',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

/**
 * @swagger
 * /api/v1/ioc/search:
 *   get:
 *     summary: Search IOCs with advanced filtering
 *     tags: [IOC]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: IOC type filter
 *       - in: query
 *         name: threat_level
 *         schema:
 *           type: string
 *           enum: [low, medium, high, critical]
 *         description: Threat level filter
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *         description: Source filter
 *       - in: query
 *         name: days_back
 *         schema:
 *           type: number
 *         description: Number of days to search back
 *     responses:
 *       200:
 *         description: IOC search results
 */
router.get('/search', [
  iocRateLimit,
  query('threat_level').optional().isIn(['low', 'medium', 'high', 'critical']),
  query('days_back').optional().isInt({ min: 1, max: 365 }),
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

    const criteria = {
      type: req.query.type as string,
      threat_level: req.query.threat_level as string,
      source: req.query.source as string,
      days_back: req.query.days_back ? parseInt(req.query.days_back as string) : 7,
    };

    const cleanCriteria = Object.fromEntries(
      Object.entries(criteria).filter(([_, value]) => value !== undefined)
    );

    const cacheKey = `ioc_search_${JSON.stringify(cleanCriteria)}`;
    const cachedResult = await cacheService.get(cacheKey);
    if (cachedResult) {
      return res.json({
        success: true,
        data: cachedResult,
        message: 'IOC search results retrieved from cache',
        cached: true
      });
    }

    const core = await initializeIOCCore();
    const results = await core.search_iocs(cleanCriteria);

    // Cache for 15 minutes
    await cacheService.set(cacheKey, results, 900);

    logger.info('IOC search completed', {
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
      message: 'IOC search completed successfully'
    });

  } catch (error) {
    logger.error('IOC search failed:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during IOC search',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

/**
 * @swagger
 * /api/v1/ioc/bulk-import:
 *   post:
 *     summary: Bulk import IOCs from external feeds
 *     tags: [IOC]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               feed_url:
 *                 type: string
 *               feed_type:
 *                 type: string
 *                 enum: [csv, json, stix, misp]
 *               source_name:
 *                 type: string
 *             required:
 *               - feed_url
 *               - source_name
 *     responses:
 *       200:
 *         description: Bulk import completed
 */
router.post('/bulk-import', [
  iocRateLimit,
  body('feed_url').isURL().withMessage('Valid feed URL is required'),
  body('feed_type').isIn(['csv', 'json', 'stix', 'misp']).withMessage('Valid feed type is required'),
  body('source_name').isString().withMessage('Source name is required'),
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

    const { feed_url, feed_type, source_name } = req.body;
    
    const core = await initializeIOCCore();
    const importResult = await core.bulk_import_iocs(feed_url, feed_type, source_name);
    
    // Store import results
    await dbService.storeIOCImport(importResult);
    
    logger.info('IOC bulk import completed', {
      feedUrl: feed_url,
      feedType: feed_type,
      sourceName: source_name,
      importedCount: importResult.imported_count
    });

    res.json({
      success: true,
      data: importResult,
      message: 'IOC bulk import completed successfully'
    });

  } catch (error) {
    logger.error('IOC bulk import failed:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during IOC bulk import',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

/**
 * @swagger
 * /api/v1/ioc/health:
 *   get:
 *     summary: Get IOC Core health status
 *     tags: [IOC]
 *     responses:
 *       200:
 *         description: IOC Core health status
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const core = await initializeIOCCore();
    const health = await core.get_health_status();

    res.json({
      success: true,
      data: health,
      message: 'IOC Core health check completed'
    });

  } catch (error) {
    logger.error('IOC health check failed:', error);
    res.status(503).json({
      success: false,
      message: 'IOC Core health check failed',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

export default router;