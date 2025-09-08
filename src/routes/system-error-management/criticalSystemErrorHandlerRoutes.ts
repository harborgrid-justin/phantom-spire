import { Router } from 'express';
import { criticalSystemErrorHandlerController } from '../../controllers/system-error-management/criticalSystemErrorHandlerController';

const router = Router();

/**
 * @swagger
 * /api/system-error-management/critical-system-error-handler:
 *   get:
 *     summary: Get all critical system error handler items
 *     tags: [Critical System Error Handler]
 *     responses:
 *       200:
 *         description: List of critical system error handler items with analytics
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
router.get('/', criticalSystemErrorHandlerController.getAll.bind(criticalSystemErrorHandlerController));

/**
 * @swagger
 * /api/system-error-management/critical-system-error-handler/{id}:
 *   get:
 *     summary: Get critical system error handler item by ID
 *     tags: [Critical System Error Handler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Critical System Error Handler item ID
 *     responses:
 *       200:
 *         description: Critical System Error Handler item details
 *       404:
 *         description: Critical System Error Handler item not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', criticalSystemErrorHandlerController.getById.bind(criticalSystemErrorHandlerController));

/**
 * @swagger
 * /api/system-error-management/critical-system-error-handler:
 *   post:
 *     summary: Create new critical system error handler item
 *     tags: [Critical System Error Handler]
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
 *         description: Critical System Error Handler item created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/', criticalSystemErrorHandlerController.create.bind(criticalSystemErrorHandlerController));

/**
 * @swagger
 * /api/system-error-management/critical-system-error-handler/{id}:
 *   put:
 *     summary: Update critical system error handler item
 *     tags: [Critical System Error Handler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Critical System Error Handler item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Critical System Error Handler item updated successfully
 *       404:
 *         description: Critical System Error Handler item not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', criticalSystemErrorHandlerController.update.bind(criticalSystemErrorHandlerController));

/**
 * @swagger
 * /api/system-error-management/critical-system-error-handler/{id}:
 *   delete:
 *     summary: Delete critical system error handler item
 *     tags: [Critical System Error Handler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Critical System Error Handler item ID
 *     responses:
 *       200:
 *         description: Critical System Error Handler item deleted successfully
 *       404:
 *         description: Critical System Error Handler item not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', criticalSystemErrorHandlerController.delete.bind(criticalSystemErrorHandlerController));

/**
 * @swagger
 * /api/system-error-management/critical-system-error-handler/health:
 *   get:
 *     summary: Health check for critical system error handler service
 *     tags: [Critical System Error Handler]
 *     responses:
 *       200:
 *         description: Service is healthy
 *       503:
 *         description: Service is unhealthy
 */
router.get('/health', criticalSystemErrorHandlerController.healthCheck.bind(criticalSystemErrorHandlerController));

export { router as criticalSystemErrorHandlerRoutes };
export default router;