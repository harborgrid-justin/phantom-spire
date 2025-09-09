import { Router } from 'express';
import { Request, Response } from 'express';
import { DefenseEvasionAnalyzerBusinessLogic } from '../../services/business-logic/modules/tactics-analysis/DefenseEvasionAnalyzerBusinessLogic';
import { authenticateToken, authorizeRole } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validation';
import { rateLimiter } from '../../middleware/rateLimiter';
import { Logger } from '../../utils/Logger';

const router = Router();
const businessLogic = new DefenseEvasionAnalyzerBusinessLogic();
const logger = new Logger('DefenseEvasionAnalyzerRoutes');

// Apply middleware
router.use(authenticateToken);
router.use(rateLimiter);

/**
 * @swagger
 * /api/tactics-analysis/defenseevasionanalyzer:
 *   get:
 *     summary: Get all Defense Evasion Analyzer items
 *     tags: [Tactics Analysis TTP]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 25
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [active, monitoring, mitigated, archived]
 *         description: Filter by status
 *       - in: query
 *         name: severity
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [critical, high, medium, low]
 *         description: Filter by severity
 *     responses:
 *       200:
 *         description: List of Defense Evasion Analyzer items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TTPData'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const queryOptions = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 25,
      status: req.query.status ? (Array.isArray(req.query.status) ? req.query.status : [req.query.status]) : undefined,
      severity: req.query.severity ? (Array.isArray(req.query.severity) ? req.query.severity : [req.query.severity]) : undefined,
      tactics: req.query.tactics ? (Array.isArray(req.query.tactics) ? req.query.tactics : [req.query.tactics]) : undefined,
      techniques: req.query.techniques ? (Array.isArray(req.query.techniques) ? req.query.techniques : [req.query.techniques]) : undefined,
      actors: req.query.actors ? (Array.isArray(req.query.actors) ? req.query.actors : [req.query.actors]) : undefined,
      sortBy: req.query.sortBy as string || 'updatedAt',
      sortOrder: req.query.sortOrder as 'asc' | 'desc' || 'desc'
    };

    const result = await businessLogic.getAll(queryOptions);

    res.json({
      ...result,
      page: queryOptions.page,
      limit: queryOptions.limit
    });

  } catch (error) {
    logger.error('Failed to get Defense Evasion Analyzer items', { error: error.message });
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve Defense Evasion Analyzer items'
    });
  }
});

/**
 * @swagger
 * /api/tactics-analysis/defenseevasionanalyzer/{id}:
 *   get:
 *     summary: Get Defense Evasion Analyzer item by ID
 *     tags: [Tactics Analysis TTP]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Item ID
 *     responses:
 *       200:
 *         description: Defense Evasion Analyzer item details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TTPData'
 *       404:
 *         description: Item not found
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const item = await businessLogic.getById(id);

    if (!item) {
      return res.status(404).json({
        error: 'Not found',
        message: `Defense Evasion Analyzer item with ID ${id} not found`
      });
    }

    res.json(item);

  } catch (error) {
    logger.error('Failed to get Defense Evasion Analyzer item', { error: error.message, id: req.params.id });
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve Defense Evasion Analyzer item'
    });
  }
});

/**
 * @swagger
 * /api/tactics-analysis/defenseevasionanalyzer:
 *   post:
 *     summary: Create new Defense Evasion Analyzer item
 *     tags: [Tactics Analysis TTP]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TTPCreateInput'
 *     responses:
 *       201:
 *         description: Defense Evasion Analyzer item created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TTPData'
 *       400:
 *         description: Invalid input
 */
router.post('/', authorizeRole(['admin', 'analyst']), validateRequest, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const item = await businessLogic.create(req.body, userId);

    res.status(201).json(item);

  } catch (error) {
    logger.error('Failed to create Defense Evasion Analyzer item', { error: error.message, input: req.body });
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create Defense Evasion Analyzer item'
    });
  }
});

/**
 * @swagger
 * /api/tactics-analysis/defenseevasionanalyzer/{id}:
 *   put:
 *     summary: Update Defense Evasion Analyzer item
 *     tags: [Tactics Analysis TTP]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TTPUpdateInput'
 *     responses:
 *       200:
 *         description: Defense Evasion Analyzer item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TTPData'
 *       404:
 *         description: Item not found
 */
router.put('/:id', authorizeRole(['admin', 'analyst']), validateRequest, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const item = await businessLogic.update(id, req.body, userId);

    if (!item) {
      return res.status(404).json({
        error: 'Not found',
        message: `Defense Evasion Analyzer item with ID ${id} not found`
      });
    }

    res.json(item);

  } catch (error) {
    logger.error('Failed to update Defense Evasion Analyzer item', { error: error.message, id: req.params.id, input: req.body });
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update Defense Evasion Analyzer item'
    });
  }
});

/**
 * @swagger
 * /api/tactics-analysis/defenseevasionanalyzer/{id}:
 *   delete:
 *     summary: Delete Defense Evasion Analyzer item
 *     tags: [Tactics Analysis TTP]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Item ID
 *     responses:
 *       200:
 *         description: Defense Evasion Analyzer item deleted successfully
 *       404:
 *         description: Item not found
 */
router.delete('/:id', authorizeRole(['admin']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const deleted = await businessLogic.delete(id, userId);

    if (!deleted) {
      return res.status(404).json({
        error: 'Not found',
        message: `Defense Evasion Analyzer item with ID ${id} not found`
      });
    }

    res.json({
      message: 'Defense Evasion Analyzer item deleted successfully'
    });

  } catch (error) {
    logger.error('Failed to delete Defense Evasion Analyzer item', { error: error.message, id: req.params.id });
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete Defense Evasion Analyzer item'
    });
  }
});

/**
 * @swagger
 * /api/tactics-analysis/defenseevasionanalyzer/analytics:
 *   get:
 *     summary: Get Defense Evasion Analyzer analytics
 *     tags: [Tactics Analysis TTP]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalCount:
 *                   type: integer
 *                 statusCounts:
 *                   type: object
 *                 severityCounts:
 *                   type: object
 *                 coverageStats:
 *                   type: object
 */
router.get('/analytics', async (req: Request, res: Response) => {
  try {
    const analytics = await businessLogic.getAnalytics();
    res.json(analytics);

  } catch (error) {
    logger.error('Failed to get Defense Evasion Analyzer analytics', { error: error.message });
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve analytics'
    });
  }
});

/**
 * @swagger
 * /api/tactics-analysis/defenseevasionanalyzer/bulk-update:
 *   patch:
 *     summary: Bulk update Defense Evasion Analyzer items
 *     tags: [Tactics Analysis TTP]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *               update:
 *                 $ref: '#/components/schemas/TTPUpdateInput'
 *     responses:
 *       200:
 *         description: Bulk update completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 modifiedCount:
 *                   type: integer
 */
router.patch('/bulk-update', authorizeRole(['admin', 'analyst']), validateRequest, async (req: Request, res: Response) => {
  try {
    const { ids, update } = req.body;
    const userId = req.user.id;
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'IDs array is required and must not be empty'
      });
    }

    const modifiedCount = await businessLogic.bulkUpdate(ids, update, userId);

    res.json({
      modifiedCount,
      message: `Successfully updated ${modifiedCount} Defense Evasion Analyzer items`
    });

  } catch (error) {
    logger.error('Failed to bulk update Defense Evasion Analyzer items', { error: error.message, input: req.body });
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to bulk update Defense Evasion Analyzer items'
    });
  }
});

export default router;