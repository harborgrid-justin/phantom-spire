import { Router } from 'express';
import { featureUnavailableHandlerController } from '../../controllers/user-error-guidance/featureUnavailableHandlerController';

const router = Router();

/**
 * @swagger
 * /api/user-error-guidance/feature-unavailable-handler:
 *   get:
 *     summary: Get all feature unavailable handler items
 *     tags: [Feature Unavailable Handler]
 *     responses:
 *       200:
 *         description: List of feature unavailable handler items with analytics
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
router.get('/', featureUnavailableHandlerController.getAll.bind(featureUnavailableHandlerController));

/**
 * @swagger
 * /api/user-error-guidance/feature-unavailable-handler/{id}:
 *   get:
 *     summary: Get feature unavailable handler item by ID
 *     tags: [Feature Unavailable Handler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Feature Unavailable Handler item ID
 *     responses:
 *       200:
 *         description: Feature Unavailable Handler item details
 *       404:
 *         description: Feature Unavailable Handler item not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', featureUnavailableHandlerController.getById.bind(featureUnavailableHandlerController));

/**
 * @swagger
 * /api/user-error-guidance/feature-unavailable-handler:
 *   post:
 *     summary: Create new feature unavailable handler item
 *     tags: [Feature Unavailable Handler]
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
 *         description: Feature Unavailable Handler item created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/', featureUnavailableHandlerController.create.bind(featureUnavailableHandlerController));

/**
 * @swagger
 * /api/user-error-guidance/feature-unavailable-handler/{id}:
 *   put:
 *     summary: Update feature unavailable handler item
 *     tags: [Feature Unavailable Handler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Feature Unavailable Handler item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Feature Unavailable Handler item updated successfully
 *       404:
 *         description: Feature Unavailable Handler item not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', featureUnavailableHandlerController.update.bind(featureUnavailableHandlerController));

/**
 * @swagger
 * /api/user-error-guidance/feature-unavailable-handler/{id}:
 *   delete:
 *     summary: Delete feature unavailable handler item
 *     tags: [Feature Unavailable Handler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Feature Unavailable Handler item ID
 *     responses:
 *       200:
 *         description: Feature Unavailable Handler item deleted successfully
 *       404:
 *         description: Feature Unavailable Handler item not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', featureUnavailableHandlerController.delete.bind(featureUnavailableHandlerController));

/**
 * @swagger
 * /api/user-error-guidance/feature-unavailable-handler/health:
 *   get:
 *     summary: Health check for feature unavailable handler service
 *     tags: [Feature Unavailable Handler]
 *     responses:
 *       200:
 *         description: Service is healthy
 *       503:
 *         description: Service is unhealthy
 */
router.get('/health', featureUnavailableHandlerController.healthCheck.bind(featureUnavailableHandlerController));

export { router as featureUnavailableHandlerRoutes };
export default router;