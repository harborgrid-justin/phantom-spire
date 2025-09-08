import { Router } from 'express';
import { configurationErrorResolverController } from '../../controllers/system-error-management/configurationErrorResolverController';

const router = Router();

/**
 * @swagger
 * /api/system-error-management/configuration-error-resolver:
 *   get:
 *     summary: Get all configuration error resolver items
 *     tags: [Configuration Error Resolver]
 *     responses:
 *       200:
 *         description: List of configuration error resolver items with analytics
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
router.get('/', configurationErrorResolverController.getAll.bind(configurationErrorResolverController));

/**
 * @swagger
 * /api/system-error-management/configuration-error-resolver/{id}:
 *   get:
 *     summary: Get configuration error resolver item by ID
 *     tags: [Configuration Error Resolver]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Configuration Error Resolver item ID
 *     responses:
 *       200:
 *         description: Configuration Error Resolver item details
 *       404:
 *         description: Configuration Error Resolver item not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', configurationErrorResolverController.getById.bind(configurationErrorResolverController));

/**
 * @swagger
 * /api/system-error-management/configuration-error-resolver:
 *   post:
 *     summary: Create new configuration error resolver item
 *     tags: [Configuration Error Resolver]
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
 *         description: Configuration Error Resolver item created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/', configurationErrorResolverController.create.bind(configurationErrorResolverController));

/**
 * @swagger
 * /api/system-error-management/configuration-error-resolver/{id}:
 *   put:
 *     summary: Update configuration error resolver item
 *     tags: [Configuration Error Resolver]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Configuration Error Resolver item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Configuration Error Resolver item updated successfully
 *       404:
 *         description: Configuration Error Resolver item not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', configurationErrorResolverController.update.bind(configurationErrorResolverController));

/**
 * @swagger
 * /api/system-error-management/configuration-error-resolver/{id}:
 *   delete:
 *     summary: Delete configuration error resolver item
 *     tags: [Configuration Error Resolver]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Configuration Error Resolver item ID
 *     responses:
 *       200:
 *         description: Configuration Error Resolver item deleted successfully
 *       404:
 *         description: Configuration Error Resolver item not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', configurationErrorResolverController.delete.bind(configurationErrorResolverController));

/**
 * @swagger
 * /api/system-error-management/configuration-error-resolver/health:
 *   get:
 *     summary: Health check for configuration error resolver service
 *     tags: [Configuration Error Resolver]
 *     responses:
 *       200:
 *         description: Service is healthy
 *       503:
 *         description: Service is unhealthy
 */
router.get('/health', configurationErrorResolverController.healthCheck.bind(configurationErrorResolverController));

export { router as configurationErrorResolverRoutes };
export default router;