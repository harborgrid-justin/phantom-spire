import { Router } from 'express';
import { malformedDataHandlerController } from '../../controllers/data-error-recovery/malformedDataHandlerController';

const router = Router();

/**
 * @swagger
 * /api/data-error-recovery/malformed-data-handler:
 *   get:
 *     summary: Get all malformed data handler items
 *     tags: [Malformed Data Handler]
 *     responses:
 *       200:
 *         description: List of malformed data handler items with analytics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 analytics:
 *                   type: object
 *                 total:
 *                   type: number
 *       500:
 *         description: Internal server error
 */
router.get('/', malformedDataHandlerController.getAll.bind(malformedDataHandlerController));

/**
 * @swagger
 * /api/data-error-recovery/malformed-data-handler/{id}:
 *   get:
 *     summary: Get malformed data handler item by ID
 *     tags: [Malformed Data Handler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Malformed Data Handler item ID
 *     responses:
 *       200:
 *         description: Malformed Data Handler item details
 *       404:
 *         description: Malformed Data Handler item not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', malformedDataHandlerController.getById.bind(malformedDataHandlerController));

/**
 * @swagger
 * /api/data-error-recovery/malformed-data-handler:
 *   post:
 *     summary: Create new malformed data handler item
 *     tags: [Malformed Data Handler]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               severity:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *               affectedSystems:
 *                 type: array
 *                 items:
 *                   type: string
 *               resolutionSteps:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Malformed Data Handler item created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/', malformedDataHandlerController.create.bind(malformedDataHandlerController));

/**
 * @swagger
 * /api/data-error-recovery/malformed-data-handler/{id}:
 *   put:
 *     summary: Update malformed data handler item
 *     tags: [Malformed Data Handler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Malformed Data Handler item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Malformed Data Handler item updated successfully
 *       404:
 *         description: Malformed Data Handler item not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', malformedDataHandlerController.update.bind(malformedDataHandlerController));

/**
 * @swagger
 * /api/data-error-recovery/malformed-data-handler/{id}:
 *   delete:
 *     summary: Delete malformed data handler item
 *     tags: [Malformed Data Handler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Malformed Data Handler item ID
 *     responses:
 *       200:
 *         description: Malformed Data Handler item deleted successfully
 *       404:
 *         description: Malformed Data Handler item not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', malformedDataHandlerController.delete.bind(malformedDataHandlerController));

/**
 * @swagger
 * /api/data-error-recovery/malformed-data-handler/health:
 *   get:
 *     summary: Health check for malformed data handler service
 *     tags: [Malformed Data Handler]
 *     responses:
 *       200:
 *         description: Service is healthy
 *       503:
 *         description: Service is unhealthy
 */
router.get('/health', malformedDataHandlerController.healthCheck.bind(malformedDataHandlerController));

export { router as malformedDataHandlerRoutes };
export default router;