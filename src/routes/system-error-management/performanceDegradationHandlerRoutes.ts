import { Router } from 'express';
import { performanceDegradationHandlerController } from '../../controllers/system-error-management/performanceDegradationHandlerController';

const router = Router();

/**
 * @swagger
 * /api/system-error-management/performance-degradation-handler:
 *   get:
 *     summary: Get all performance degradation handler items
 *     tags: [Performance Degradation Handler]
 *     responses:
 *       200:
 *         description: List of performance degradation handler items with analytics
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
router.get('/', performanceDegradationHandlerController.getAll.bind(performanceDegradationHandlerController));

/**
 * @swagger
 * /api/system-error-management/performance-degradation-handler/{id}:
 *   get:
 *     summary: Get performance degradation handler item by ID
 *     tags: [Performance Degradation Handler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Performance Degradation Handler item ID
 *     responses:
 *       200:
 *         description: Performance Degradation Handler item details
 *       404:
 *         description: Performance Degradation Handler item not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', performanceDegradationHandlerController.getById.bind(performanceDegradationHandlerController));

/**
 * @swagger
 * /api/system-error-management/performance-degradation-handler:
 *   post:
 *     summary: Create new performance degradation handler item
 *     tags: [Performance Degradation Handler]
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
 *         description: Performance Degradation Handler item created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/', performanceDegradationHandlerController.create.bind(performanceDegradationHandlerController));

/**
 * @swagger
 * /api/system-error-management/performance-degradation-handler/{id}:
 *   put:
 *     summary: Update performance degradation handler item
 *     tags: [Performance Degradation Handler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Performance Degradation Handler item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Performance Degradation Handler item updated successfully
 *       404:
 *         description: Performance Degradation Handler item not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', performanceDegradationHandlerController.update.bind(performanceDegradationHandlerController));

/**
 * @swagger
 * /api/system-error-management/performance-degradation-handler/{id}:
 *   delete:
 *     summary: Delete performance degradation handler item
 *     tags: [Performance Degradation Handler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Performance Degradation Handler item ID
 *     responses:
 *       200:
 *         description: Performance Degradation Handler item deleted successfully
 *       404:
 *         description: Performance Degradation Handler item not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', performanceDegradationHandlerController.delete.bind(performanceDegradationHandlerController));

/**
 * @swagger
 * /api/system-error-management/performance-degradation-handler/health:
 *   get:
 *     summary: Health check for performance degradation handler service
 *     tags: [Performance Degradation Handler]
 *     responses:
 *       200:
 *         description: Service is healthy
 *       503:
 *         description: Service is unhealthy
 */
router.get('/health', performanceDegradationHandlerController.healthCheck.bind(performanceDegradationHandlerController));

export { router as performanceDegradationHandlerRoutes };
export default router;