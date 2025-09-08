import { Router } from 'express';
import { browserCompatibilityErrorHandlerController } from '../../controllers/user-error-guidance/browserCompatibilityErrorHandlerController';

const router = Router();

/**
 * @swagger
 * /api/user-error-guidance/browser-compatibility-error-handler:
 *   get:
 *     summary: Get all browser compatibility error handler items
 *     tags: [Browser Compatibility Error Handler]
 *     responses:
 *       200:
 *         description: List of browser compatibility error handler items with analytics
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
router.get('/', browserCompatibilityErrorHandlerController.getAll.bind(browserCompatibilityErrorHandlerController));

/**
 * @swagger
 * /api/user-error-guidance/browser-compatibility-error-handler/{id}:
 *   get:
 *     summary: Get browser compatibility error handler item by ID
 *     tags: [Browser Compatibility Error Handler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Browser Compatibility Error Handler item ID
 *     responses:
 *       200:
 *         description: Browser Compatibility Error Handler item details
 *       404:
 *         description: Browser Compatibility Error Handler item not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', browserCompatibilityErrorHandlerController.getById.bind(browserCompatibilityErrorHandlerController));

/**
 * @swagger
 * /api/user-error-guidance/browser-compatibility-error-handler:
 *   post:
 *     summary: Create new browser compatibility error handler item
 *     tags: [Browser Compatibility Error Handler]
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
 *         description: Browser Compatibility Error Handler item created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/', browserCompatibilityErrorHandlerController.create.bind(browserCompatibilityErrorHandlerController));

/**
 * @swagger
 * /api/user-error-guidance/browser-compatibility-error-handler/{id}:
 *   put:
 *     summary: Update browser compatibility error handler item
 *     tags: [Browser Compatibility Error Handler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Browser Compatibility Error Handler item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Browser Compatibility Error Handler item updated successfully
 *       404:
 *         description: Browser Compatibility Error Handler item not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', browserCompatibilityErrorHandlerController.update.bind(browserCompatibilityErrorHandlerController));

/**
 * @swagger
 * /api/user-error-guidance/browser-compatibility-error-handler/{id}:
 *   delete:
 *     summary: Delete browser compatibility error handler item
 *     tags: [Browser Compatibility Error Handler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Browser Compatibility Error Handler item ID
 *     responses:
 *       200:
 *         description: Browser Compatibility Error Handler item deleted successfully
 *       404:
 *         description: Browser Compatibility Error Handler item not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', browserCompatibilityErrorHandlerController.delete.bind(browserCompatibilityErrorHandlerController));

/**
 * @swagger
 * /api/user-error-guidance/browser-compatibility-error-handler/health:
 *   get:
 *     summary: Health check for browser compatibility error handler service
 *     tags: [Browser Compatibility Error Handler]
 *     responses:
 *       200:
 *         description: Service is healthy
 *       503:
 *         description: Service is unhealthy
 */
router.get('/health', browserCompatibilityErrorHandlerController.healthCheck.bind(browserCompatibilityErrorHandlerController));

export { router as browserCompatibilityErrorHandlerRoutes };
export default router;