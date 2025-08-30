/**
 * Evidence Management API Routes
 * RESTful API endpoints for Fortune 100-grade evidence management
 */

import { Router, Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { authenticateToken, authorizeRole } from '../../middleware/auth';
import { DataLayerOrchestrator } from '../../data-layer/DataLayerOrchestrator';
import { 
  EvidenceType, 
  EvidenceSourceType, 
  ClassificationLevel 
} from '../../data-layer/evidence/interfaces/IEvidence';
import { 
  IEvidenceContext, 
  ICreateEvidenceRequest 
} from '../../data-layer/evidence/interfaces/IEvidenceManager';
import { logger } from '../../utils/logger';

const router = Router();

// Middleware to create evidence context from request
const createEvidenceContext = (req: any): IEvidenceContext => {
  return {
    userId: req.user?.id || req.user?.userId,
    userRole: req.user?.role || 'viewer',
    permissions: req.user?.permissions || ['evidence:read'],
    classification: req.user?.classification || ClassificationLevel.TLP_WHITE,
    sessionId: req.sessionID || 'unknown',
    ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
    userAgent: req.get('User-Agent')
  };
};

/**
 * @swagger
 * /api/v1/evidence:
 *   post:
 *     summary: Create new evidence
 *     tags: [Evidence Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - sourceType
 *               - sourceId
 *               - sourceSystem
 *               - data
 *               - metadata
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [ioc_evidence, threat_intelligence, network_traffic, malware_sample, forensic_artifact, attack_pattern, vulnerability, campaign_evidence, attribution_evidence, correlation_evidence]
 *               sourceType:
 *                 type: string
 *                 enum: [human_analysis, automated_analysis, threat_feed, sensor_data, third_party_intel, internal_detection, external_report, honeypot, sandbox, osint]
 *               sourceId:
 *                 type: string
 *               sourceSystem:
 *                 type: string
 *               data:
 *                 type: object
 *               metadata:
 *                 type: object
 *                 required:
 *                   - title
 *                   - description
 *                   - severity
 *                   - confidence
 *                   - format
 *                 properties:
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   severity:
 *                     type: string
 *                     enum: [low, medium, high, critical]
 *                   confidence:
 *                     type: number
 *                     minimum: 0
 *                     maximum: 100
 *                   format:
 *                     type: string
 *               classification:
 *                 type: string
 *                 enum: [unclassified, confidential, secret, top_secret, tlp_white, tlp_green, tlp_amber, tlp_red]
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Evidence created successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.post('/',
  authenticateToken,
  authorizeRole(['analyst', 'admin']),
  [
    body('type').isIn(Object.values(EvidenceType)),
    body('sourceType').isIn(Object.values(EvidenceSourceType)),
    body('sourceId').notEmpty(),
    body('sourceSystem').notEmpty(),
    body('data').isObject(),
    body('metadata.title').notEmpty(),
    body('metadata.description').notEmpty(),
    body('metadata.severity').isIn(['low', 'medium', 'high', 'critical']),
    body('metadata.confidence').isInt({ min: 0, max: 100 }),
    body('metadata.format').notEmpty(),
    body('classification').optional().isIn(Object.values(ClassificationLevel))
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const orchestrator: DataLayerOrchestrator = req.app.get('dataLayerOrchestrator');
      const context = createEvidenceContext(req);
      
      const request: ICreateEvidenceRequest = {
        type: req.body.type,
        sourceType: req.body.sourceType,
        sourceId: req.body.sourceId,
        sourceSystem: req.body.sourceSystem,
        data: req.body.data,
        metadata: req.body.metadata,
        classification: req.body.classification || ClassificationLevel.TLP_WHITE,
        tags: req.body.tags || [],
        handling: req.body.handling,
        retentionPolicy: req.body.retentionPolicy
      };

      const evidence = await orchestrator.createEvidence(request, context);

      logger.info('Evidence created via API', {
        evidenceId: evidence.id,
        userId: context.userId,
        type: evidence.type,
        classification: evidence.classification
      });

      res.status(201).json({
        success: true,
        data: evidence,
        message: 'Evidence created successfully'
      });
    } catch (error) {
      logger.error('Failed to create evidence via API', {
        userId: (req as any).user?.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(500).json({
        success: false,
        message: 'Failed to create evidence',
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/evidence:
 *   get:
 *     summary: Search evidence
 *     tags: [Evidence Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: types
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Evidence types to filter by
 *       - in: query
 *         name: sourceTypes
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Source types to filter by
 *       - in: query
 *         name: classifications
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Classifications to filter by
 *       - in: query
 *         name: tags
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Tags to filter by
 *       - in: query
 *         name: text
 *         schema:
 *           type: string
 *         description: Text search in title and description
 *       - in: query
 *         name: severities
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [low, medium, high, critical]
 *         description: Severity levels to filter by
 *       - in: query
 *         name: minConfidence
 *         schema:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *         description: Minimum confidence level
 *       - in: query
 *         name: maxConfidence
 *         schema:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *         description: Maximum confidence level
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for date range filter
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for date range filter
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, confidence, severity]
 *         description: Field to sort by
 *       - in: query
 *         name: sortDirection
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort direction
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           minimum: 1
 *           maximum: 1000
 *           default: 50
 *         description: Number of results to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: number
 *           minimum: 0
 *           default: 0
 *         description: Number of results to skip
 *     responses:
 *       200:
 *         description: Search results
 *       400:
 *         description: Invalid query parameters
 *       401:
 *         description: Unauthorized
 */
router.get('/',
  authenticateToken,
  [
    query('minConfidence').optional().isInt({ min: 0, max: 100 }),
    query('maxConfidence').optional().isInt({ min: 0, max: 100 }),
    query('limit').optional().isInt({ min: 1, max: 1000 }),
    query('offset').optional().isInt({ min: 0 })
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const orchestrator: DataLayerOrchestrator = req.app.get('dataLayerOrchestrator');
      const context = createEvidenceContext(req);
      
      const query = {
        types: req.query.types ? (Array.isArray(req.query.types) ? req.query.types : [req.query.types]) : undefined,
        sourceTypes: req.query.sourceTypes ? (Array.isArray(req.query.sourceTypes) ? req.query.sourceTypes : [req.query.sourceTypes]) : undefined,
        classifications: req.query.classifications ? (Array.isArray(req.query.classifications) ? req.query.classifications : [req.query.classifications]) : undefined,
        tags: req.query.tags ? (Array.isArray(req.query.tags) ? req.query.tags : [req.query.tags]) : undefined,
        text: req.query.text as string,
        severities: req.query.severities ? (Array.isArray(req.query.severities) ? req.query.severities : [req.query.severities]) : undefined,
        confidenceRange: (req.query.minConfidence || req.query.maxConfidence) ? {
          min: parseInt(req.query.minConfidence as string) || 0,
          max: parseInt(req.query.maxConfidence as string) || 100
        } : undefined,
        dateRange: (req.query.startDate || req.query.endDate) ? {
          start: req.query.startDate ? new Date(req.query.startDate as string) : new Date(0),
          end: req.query.endDate ? new Date(req.query.endDate as string) : new Date()
        } : undefined,
        sortBy: req.query.sortBy as string,
        sortDirection: req.query.sortDirection as 'asc' | 'desc',
        limit: parseInt(req.query.limit as string) || 50,
        offset: parseInt(req.query.offset as string) || 0
      };

      const result = await orchestrator.searchEvidence(query, context);

      res.json({
        success: true,
        data: result,
        message: 'Search completed successfully'
      });
    } catch (error) {
      logger.error('Failed to search evidence via API', {
        userId: (req as any).user?.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(500).json({
        success: false,
        message: 'Failed to search evidence',
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/evidence/{evidenceId}:
 *   get:
 *     summary: Get evidence by ID
 *     tags: [Evidence Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: evidenceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Evidence ID
 *     responses:
 *       200:
 *         description: Evidence retrieved successfully
 *       404:
 *         description: Evidence not found or access denied
 *       401:
 *         description: Unauthorized
 */
router.get('/:evidenceId',
  authenticateToken,
  [
    param('evidenceId').notEmpty()
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const orchestrator: DataLayerOrchestrator = req.app.get('dataLayerOrchestrator');
      const context = createEvidenceContext(req);
      const evidenceManager = orchestrator.getEvidenceManager();
      
      const evidence = await evidenceManager.getEvidence(req.params.evidenceId, context);
      
      if (!evidence) {
        return res.status(404).json({
          success: false,
          message: 'Evidence not found or access denied'
        });
      }

      res.json({
        success: true,
        data: evidence,
        message: 'Evidence retrieved successfully'
      });
    } catch (error) {
      logger.error('Failed to retrieve evidence via API', {
        evidenceId: req.params.evidenceId,
        userId: (req as any).user?.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(500).json({
        success: false,
        message: 'Failed to retrieve evidence',
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/evidence/{evidenceId}/analyze:
 *   post:
 *     summary: Analyze single evidence item
 *     tags: [Evidence Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: evidenceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Evidence ID
 *     responses:
 *       200:
 *         description: Analysis completed successfully
 *       404:
 *         description: Evidence not found or access denied
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.post('/:evidenceId/analyze',
  authenticateToken,
  authorizeRole(['analyst', 'admin']),
  [
    param('evidenceId').notEmpty()
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const orchestrator: DataLayerOrchestrator = req.app.get('dataLayerOrchestrator');
      const context = createEvidenceContext(req);
      const analyticsEngine = orchestrator.getEvidenceAnalyticsEngine();
      
      const findings = await analyticsEngine.analyzeSingleEvidence(
        req.params.evidenceId,
        context
      );

      res.json({
        success: true,
        data: {
          evidenceId: req.params.evidenceId,
          findings,
          analyzedAt: new Date()
        },
        message: 'Evidence analysis completed successfully'
      });
    } catch (error) {
      logger.error('Failed to analyze evidence via API', {
        evidenceId: req.params.evidenceId,
        userId: (req as any).user?.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(500).json({
        success: false,
        message: 'Failed to analyze evidence',
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/evidence/{evidenceId}/custody:
 *   get:
 *     summary: Get custody chain for evidence
 *     tags: [Evidence Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: evidenceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Evidence ID
 *     responses:
 *       200:
 *         description: Custody chain retrieved successfully
 *       404:
 *         description: Evidence not found or access denied
 *       401:
 *         description: Unauthorized
 */
router.get('/:evidenceId/custody',
  authenticateToken,
  [
    param('evidenceId').notEmpty()
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const orchestrator: DataLayerOrchestrator = req.app.get('dataLayerOrchestrator');
      const context = createEvidenceContext(req);
      const evidenceManager = orchestrator.getEvidenceManager();
      
      const custodyChain = await evidenceManager.getCustodyChain(req.params.evidenceId, context);
      const verification = await evidenceManager.verifyCustodyChain(req.params.evidenceId, context);

      res.json({
        success: true,
        data: {
          evidenceId: req.params.evidenceId,
          custodyChain,
          verification
        },
        message: 'Custody chain retrieved successfully'
      });
    } catch (error) {
      logger.error('Failed to retrieve custody chain via API', {
        evidenceId: req.params.evidenceId,
        userId: (req as any).user?.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(500).json({
        success: false,
        message: 'Failed to retrieve custody chain',
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/evidence/{evidenceId}/integrity:
 *   post:
 *     summary: Verify evidence integrity
 *     tags: [Evidence Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: evidenceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Evidence ID
 *     responses:
 *       200:
 *         description: Integrity verification completed
 *       404:
 *         description: Evidence not found or access denied
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.post('/:evidenceId/integrity',
  authenticateToken,
  authorizeRole(['analyst', 'admin']),
  [
    param('evidenceId').notEmpty()
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const orchestrator: DataLayerOrchestrator = req.app.get('dataLayerOrchestrator');
      const context = createEvidenceContext(req);
      
      const result = await orchestrator.verifyEvidenceIntegrity(req.params.evidenceId, context);

      res.json({
        success: true,
        data: result,
        message: 'Integrity verification completed successfully'
      });
    } catch (error) {
      logger.error('Failed to verify evidence integrity via API', {
        evidenceId: req.params.evidenceId,
        userId: (req as any).user?.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(500).json({
        success: false,
        message: 'Failed to verify evidence integrity',
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/evidence/analyze:
 *   post:
 *     summary: Perform comprehensive evidence analysis
 *     tags: [Evidence Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - evidenceIds
 *             properties:
 *               evidenceIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               options:
 *                 type: object
 *                 properties:
 *                   include_correlations:
 *                     type: boolean
 *                     default: true
 *                   include_patterns:
 *                     type: boolean
 *                     default: true
 *                   include_risk_assessment:
 *                     type: boolean
 *                     default: true
 *                   include_recommendations:
 *                     type: boolean
 *                     default: true
 *                   analysis_depth:
 *                     type: string
 *                     enum: [basic, standard, comprehensive]
 *                     default: standard
 *     responses:
 *       200:
 *         description: Analysis completed successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.post('/analyze',
  authenticateToken,
  authorizeRole(['analyst', 'admin']),
  [
    body('evidenceIds').isArray({ min: 1 }),
    body('evidenceIds.*').notEmpty(),
    body('options.analysis_depth').optional().isIn(['basic', 'standard', 'comprehensive'])
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const orchestrator: DataLayerOrchestrator = req.app.get('dataLayerOrchestrator');
      const context = createEvidenceContext(req);
      
      const result = await orchestrator.analyzeEvidence(
        req.body.evidenceIds,
        context,
        req.body.options || {}
      );

      res.json({
        success: true,
        data: result,
        message: 'Comprehensive analysis completed successfully'
      });
    } catch (error) {
      logger.error('Failed to perform comprehensive evidence analysis via API', {
        evidenceIds: req.body.evidenceIds,
        userId: (req as any).user?.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(500).json({
        success: false,
        message: 'Failed to perform evidence analysis',
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/evidence/metrics:
 *   get:
 *     summary: Get evidence metrics and statistics
 *     tags: [Evidence Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for metrics calculation
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for metrics calculation
 *     responses:
 *       200:
 *         description: Metrics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get('/metrics',
  authenticateToken,
  authorizeRole(['analyst', 'admin']),
  async (req: Request, res: Response) => {
    try {
      const orchestrator: DataLayerOrchestrator = req.app.get('dataLayerOrchestrator');
      
      const timeRange = (req.query.startDate || req.query.endDate) ? {
        start: req.query.startDate ? new Date(req.query.startDate as string) : new Date(0),
        end: req.query.endDate ? new Date(req.query.endDate as string) : new Date()
      } : undefined;

      const metrics = await orchestrator.getEvidenceMetrics(timeRange);

      res.json({
        success: true,
        data: metrics,
        message: 'Evidence metrics retrieved successfully'
      });
    } catch (error) {
      logger.error('Failed to retrieve evidence metrics via API', {
        userId: (req as any).user?.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(500).json({
        success: false,
        message: 'Failed to retrieve evidence metrics',
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }
);

export default router;