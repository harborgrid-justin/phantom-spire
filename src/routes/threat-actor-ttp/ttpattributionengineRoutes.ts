import { Router } from 'express';
import { Request, Response } from 'express';
import { TTPAttributionEngineBusinessLogic } from '../../services/business-logic/modules/threat-actor-ttp/TTPAttributionEngineBusinessLogic';
import { authenticateToken, authorizeRole } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validation';
import { rateLimiter } from '../../middleware/rateLimiter';
import { Logger } from '../../utils/Logger';

const router = Router();
const businessLogic = new TTPAttributionEngineBusinessLogic();
const logger = new Logger('TTPAttributionEngineRoutes');

// Apply middleware
router.use(authenticateToken);
router.use(rateLimiter);

/**
 * @swagger
 * /api/threat-actor-ttp/ttpattributionengine:
 *   get:
 *     summary: Get all T T P Attribution Engine items
 *     tags: [Threat Actor Ttp TTP]
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
 *         description: List of T T P Attribution Engine items
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
    logger.error('Failed to get T T P Attribution Engine items', { error: error.message });
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve T T P Attribution Engine items'
    });
  }
});

/**
 * @swagger
 * /api/threat-actor-ttp/ttpattributionengine/{id}:
 *   get:
 *     summary: Get T T P Attribution Engine item by ID
 *     tags: [Threat Actor Ttp TTP]
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
 *         description: T T P Attribution Engine item details
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
        message: `T T P Attribution Engine item with ID ${id} not found`
      });
    }

    res.json(item);

  } catch (error) {
    logger.error('Failed to get T T P Attribution Engine item', { error: error.message, id: req.params.id });
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve T T P Attribution Engine item'
    });
  }
});

/**
 * @swagger
 * /api/threat-actor-ttp/ttpattributionengine:
 *   post:
 *     summary: Create new T T P Attribution Engine item
 *     tags: [Threat Actor Ttp TTP]
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
 *         description: T T P Attribution Engine item created successfully
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
    logger.error('Failed to create T T P Attribution Engine item', { error: error.message, input: req.body });
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create T T P Attribution Engine item'
    });
  }
});

/**
 * @swagger
 * /api/threat-actor-ttp/ttpattributionengine/{id}:
 *   put:
 *     summary: Update T T P Attribution Engine item
 *     tags: [Threat Actor Ttp TTP]
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
 *         description: T T P Attribution Engine item updated successfully
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
        message: `T T P Attribution Engine item with ID ${id} not found`
      });
    }

    res.json(item);

  } catch (error) {
    logger.error('Failed to update T T P Attribution Engine item', { error: error.message, id: req.params.id, input: req.body });
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update T T P Attribution Engine item'
    });
  }
});

/**
 * @swagger
 * /api/threat-actor-ttp/ttpattributionengine/{id}:
 *   delete:
 *     summary: Delete T T P Attribution Engine item
 *     tags: [Threat Actor Ttp TTP]
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
 *         description: T T P Attribution Engine item deleted successfully
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
        message: `T T P Attribution Engine item with ID ${id} not found`
      });
    }

    res.json({
      message: 'T T P Attribution Engine item deleted successfully'
    });

  } catch (error) {
    logger.error('Failed to delete T T P Attribution Engine item', { error: error.message, id: req.params.id });
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete T T P Attribution Engine item'
    });
  }
});

/**
 * @swagger
 * /api/threat-actor-ttp/ttpattributionengine/analytics:
 *   get:
 *     summary: Get T T P Attribution Engine analytics
 *     tags: [Threat Actor Ttp TTP]
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
    logger.error('Failed to get T T P Attribution Engine analytics', { error: error.message });
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve analytics'
    });
  }
});

/**
 * @swagger
 * /api/threat-actor-ttp/ttpattributionengine/bulk-update:
 *   patch:
 *     summary: Bulk update T T P Attribution Engine items
 *     tags: [Threat Actor Ttp TTP]
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
      message: `Successfully updated ${modifiedCount} T T P Attribution Engine items`
    });

  } catch (error) {
    logger.error('Failed to bulk update T T P Attribution Engine items', { error: error.message, input: req.body });
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to bulk update T T P Attribution Engine items'
    });
  }
});

export default router;