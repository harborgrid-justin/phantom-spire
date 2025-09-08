import { Router } from 'express';
import { pluginErrorHandlerController } from '../../controllers/integration-error-management/pluginErrorHandlerController';

const router = Router();

/**
 * @swagger
 * /api/integration-error-management/plugin-error-handler:
 *   get:
 *     summary: Get all plugin error handler items
 *     tags: [Plugin Error Handler]
 *     responses:
 *       200:
 *         description: List of plugin error handler items with analytics
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
router.get('/', pluginErrorHandlerController.getAll.bind(pluginErrorHandlerController));

/**
 * @swagger
 * /api/integration-error-management/plugin-error-handler/{id}:
 *   get:
 *     summary: Get plugin error handler item by ID
 *     tags: [Plugin Error Handler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Plugin Error Handler item ID
 *     responses:
 *       200:
 *         description: Plugin Error Handler item details
 *       404:
 *         description: Plugin Error Handler item not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', pluginErrorHandlerController.getById.bind(pluginErrorHandlerController));

/**
 * @swagger
 * /api/integration-error-management/plugin-error-handler:
 *   post:
 *     summary: Create new plugin error handler item
 *     tags: [Plugin Error Handler]
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
 *         description: Plugin Error Handler item created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/', pluginErrorHandlerController.create.bind(pluginErrorHandlerController));

/**
 * @swagger
 * /api/integration-error-management/plugin-error-handler/{id}:
 *   put:
 *     summary: Update plugin error handler item
 *     tags: [Plugin Error Handler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Plugin Error Handler item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Plugin Error Handler item updated successfully
 *       404:
 *         description: Plugin Error Handler item not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', pluginErrorHandlerController.update.bind(pluginErrorHandlerController));

/**
 * @swagger
 * /api/integration-error-management/plugin-error-handler/{id}:
 *   delete:
 *     summary: Delete plugin error handler item
 *     tags: [Plugin Error Handler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Plugin Error Handler item ID
 *     responses:
 *       200:
 *         description: Plugin Error Handler item deleted successfully
 *       404:
 *         description: Plugin Error Handler item not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', pluginErrorHandlerController.delete.bind(pluginErrorHandlerController));

/**
 * @swagger
 * /api/integration-error-management/plugin-error-handler/health:
 *   get:
 *     summary: Health check for plugin error handler service
 *     tags: [Plugin Error Handler]
 *     responses:
 *       200:
 *         description: Service is healthy
 *       503:
 *         description: Service is unhealthy
 */
router.get('/health', pluginErrorHandlerController.healthCheck.bind(pluginErrorHandlerController));

export { router as pluginErrorHandlerRoutes };
export default router;