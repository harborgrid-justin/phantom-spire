/**
 * CVE Core API Routes
 * Production-ready REST endpoints for CVE processing and analysis
 */

import { Router, Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { CVECore } from '../../../../packages/phantom-cve-core/src-ts';
import { DatabaseService } from '../../../services/DatabaseService';
import { LoggingService } from '../../../services/LoggingService';
import { CacheService } from '../../../services/CacheService';
import { rateLimit } from 'express-rate-limit';

const router = Router();
const logger = LoggingService.getInstance();
const dbService = DatabaseService.getInstance();
const cacheService = CacheService.getInstance();

// Rate limiting for CVE endpoints
const cveRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many CVE requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Initialize CVE Core
let cveCore: CVECore | null = null;

const initializeCVECore = async () => {
  if (!cveCore) {
    try {
      cveCore = await CVECore.new();
      logger.info('CVE Core initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize CVE Core:', error);
      throw new Error('CVE Core initialization failed');
    }
  }
  return cveCore;
};

/**
 * @swagger
 * /api/v1/cve/analyze:
 *   post:
 *     summary: Analyze a CVE for threat intelligence and business impact
 *     tags: [CVE]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cve:
 *                 type: object
 *                 description: CVE object to analyze
 *             required:
 *               - cve
 *     responses:
 *       200:
 *         description: CVE analysis completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                 message:
 *                   type: string
 */
router.post('/analyze', [
  cveRateLimit,
  body('cve').isObject().withMessage('CVE object is required'),
  body('cve.id').isString().withMessage('CVE ID is required'),
  body('cve.description').isString().withMessage('CVE description is required'),
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

    const { cve } = req.body;
    
    // Check cache first
    const cacheKey = `cve_analysis_${cve.id}`;
    const cachedResult = await cacheService.get(cacheKey);
    if (cachedResult) {
      return res.json({
        success: true,
        data: cachedResult,
        message: 'CVE analysis retrieved from cache',
        cached: true
      });
    }

    const core = await initializeCVECore();
    
    // Convert dates to proper Date objects
    const processedCVE = {
      ...cve,
      published_date: new Date(cve.published_date || Date.now()),
      last_modified_date: new Date(cve.last_modified_date || Date.now())
    };

    const analysis = await core.process_cve(processedCVE);
    
    // Store in database
    await dbService.storeCVEAnalysis(analysis);
    
    // Cache the result for 1 hour
    await cacheService.set(cacheKey, analysis, 3600);
    
    logger.info(`CVE analysis completed for ${cve.id}`, {
      cveId: cve.id,
      riskLevel: analysis.assessment.risk_level,
      exploitAvailable: analysis.assessment.exploit_available
    });

    res.json({
      success: true,
      data: analysis,
      message: 'CVE analysis completed successfully'
    });

  } catch (error) {
    logger.error('CVE analysis failed:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during CVE analysis',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

/**
 * @swagger
 * /api/v1/cve/search:
 *   get:
 *     summary: Search CVEs with advanced criteria
 *     tags: [CVE]
 *     parameters:
 *       - in: query
 *         name: cve_id
 *         schema:
 *           type: string
 *         description: Specific CVE ID to search for
 *       - in: query
 *         name: vendor
 *         schema:
 *           type: string
 *         description: Vendor name filter
 *       - in: query
 *         name: product
 *         schema:
 *           type: string
 *         description: Product name filter
 *       - in: query
 *         name: min_score
 *         schema:
 *           type: number
 *         description: Minimum CVSS score
 *       - in: query
 *         name: max_score
 *         schema:
 *           type: number
 *         description: Maximum CVSS score
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [low, medium, high, critical]
 *         description: CVSS severity level
 *     responses:
 *       200:
 *         description: CVE search results
 */
router.get('/search', [
  cveRateLimit,
  query('min_score').optional().isFloat({ min: 0, max: 10 }),
  query('max_score').optional().isFloat({ min: 0, max: 10 }),
  query('severity').optional().isIn(['low', 'medium', 'high', 'critical']),
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
      cve_id: req.query.cve_id as string,
      vendor: req.query.vendor as string,
      product: req.query.product as string,
      min_score: req.query.min_score ? parseFloat(req.query.min_score as string) : undefined,
      max_score: req.query.max_score ? parseFloat(req.query.max_score as string) : undefined,
      severity: req.query.severity as string,
    };

    // Filter out undefined values
    const cleanCriteria = Object.fromEntries(
      Object.entries(criteria).filter(([_, value]) => value !== undefined)
    );

    const cacheKey = `cve_search_${JSON.stringify(cleanCriteria)}`;
    const cachedResult = await cacheService.get(cacheKey);
    if (cachedResult) {
      return res.json({
        success: true,
        data: cachedResult,
        message: 'CVE search results retrieved from cache',
        cached: true
      });
    }

    const core = await initializeCVECore();
    const results = await core.search_cves(cleanCriteria);

    // Cache results for 30 minutes
    await cacheService.set(cacheKey, results, 1800);

    logger.info('CVE search completed', {
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
      message: 'CVE search completed successfully'
    });

  } catch (error) {
    logger.error('CVE search failed:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during CVE search',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

/**
 * @swagger
 * /api/v1/cve/{cveId}/timeline:
 *   get:
 *     summary: Get exploit timeline for a specific CVE
 *     tags: [CVE]
 *     parameters:
 *       - in: path
 *         name: cveId
 *         required: true
 *         schema:
 *           type: string
 *         description: CVE ID
 *     responses:
 *       200:
 *         description: Exploit timeline data
 */
router.get('/:cveId/timeline', [
  cveRateLimit,
  param('cveId').matches(/^CVE-\d{4}-\d{4,}$/).withMessage('Invalid CVE ID format'),
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

    const { cveId } = req.params;
    
    const cacheKey = `cve_timeline_${cveId}`;
    const cachedResult = await cacheService.get(cacheKey);
    if (cachedResult) {
      return res.json({
        success: true,
        data: cachedResult,
        message: 'CVE timeline retrieved from cache',
        cached: true
      });
    }

    const core = await initializeCVECore();
    const timeline = await core.get_exploit_timeline(cveId);

    // Cache timeline for 2 hours
    await cacheService.set(cacheKey, timeline, 7200);

    logger.info(`CVE timeline generated for ${cveId}`, {
      cveId,
      stageCount: timeline.exploitation_stages.length
    });

    res.json({
      success: true,
      data: timeline,
      message: 'CVE timeline generated successfully'
    });

  } catch (error) {
    logger.error('CVE timeline generation failed:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during timeline generation',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

/**
 * @swagger
 * /api/v1/cve/remediation:
 *   post:
 *     summary: Generate remediation strategy for a CVE
 *     tags: [CVE]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cve:
 *                 type: object
 *                 description: CVE object for remediation
 *             required:
 *               - cve
 *     responses:
 *       200:
 *         description: Remediation strategy generated
 */
router.post('/remediation', [
  cveRateLimit,
  body('cve').isObject().withMessage('CVE object is required'),
  body('cve.id').isString().withMessage('CVE ID is required'),
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

    const { cve } = req.body;
    
    const cacheKey = `cve_remediation_${cve.id}`;
    const cachedResult = await cacheService.get(cacheKey);
    if (cachedResult) {
      return res.json({
        success: true,
        data: cachedResult,
        message: 'CVE remediation strategy retrieved from cache',
        cached: true
      });
    }

    const core = await initializeCVECore();
    
    // Convert dates to proper Date objects
    const processedCVE = {
      ...cve,
      published_date: new Date(cve.published_date || Date.now()),
      last_modified_date: new Date(cve.last_modified_date || Date.now())
    };

    const strategy = await core.get_remediation_strategy(processedCVE);

    // Store remediation strategy in database
    await dbService.storeRemediationStrategy(strategy);

    // Cache strategy for 4 hours
    await cacheService.set(cacheKey, strategy, 14400);

    logger.info(`CVE remediation strategy generated for ${cve.id}`, {
      cveId: cve.id,
      priority: strategy.priority,
      actionCount: strategy.immediate_actions.length
    });

    res.json({
      success: true,
      data: strategy,
      message: 'CVE remediation strategy generated successfully'
    });

  } catch (error) {
    logger.error('CVE remediation strategy generation failed:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during remediation strategy generation',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

/**
 * @swagger
 * /api/v1/cve/batch:
 *   post:
 *     summary: Batch process multiple CVEs
 *     tags: [CVE]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cves:
 *                 type: array
 *                 items:
 *                   type: object
 *                 description: Array of CVE objects to process
 *             required:
 *               - cves
 *     responses:
 *       200:
 *         description: Batch CVE processing completed
 */
router.post('/batch', [
  cveRateLimit,
  body('cves').isArray({ min: 1, max: 50 }).withMessage('CVEs array is required (1-50 items)'),
  body('cves.*.id').isString().withMessage('Each CVE must have an ID'),
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

    const { cves } = req.body;
    
    const core = await initializeCVECore();
    
    // Process CVEs with proper date conversion
    const processedCVEs = cves.map((cve: any) => ({
      ...cve,
      published_date: new Date(cve.published_date || Date.now()),
      last_modified_date: new Date(cve.last_modified_date || Date.now())
    }));

    const results = await core.batch_process_cves(processedCVEs);

    // Store all results in database
    for (const result of results) {
      await dbService.storeCVEAnalysis(result);
    }

    logger.info(`Batch CVE processing completed`, {
      inputCount: cves.length,
      outputCount: results.length
    });

    res.json({
      success: true,
      data: {
        results,
        processed: results.length,
        total: cves.length
      },
      message: 'Batch CVE processing completed successfully'
    });

  } catch (error) {
    logger.error('Batch CVE processing failed:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during batch CVE processing',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

/**
 * @swagger
 * /api/v1/cve/health:
 *   get:
 *     summary: Get CVE Core health status
 *     tags: [CVE]
 *     responses:
 *       200:
 *         description: CVE Core health status
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const core = await initializeCVECore();
    const health = await core.get_health_status();

    res.json({
      success: true,
      data: health,
      message: 'CVE Core health check completed'
    });

  } catch (error) {
    logger.error('CVE health check failed:', error);
    res.status(503).json({
      success: false,
      message: 'CVE Core health check failed',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

export default router;