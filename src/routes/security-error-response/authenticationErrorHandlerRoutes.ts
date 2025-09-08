import { Router } from 'express';
import { authenticationErrorHandlerController } from '../../controllers/security-error-response/authenticationErrorHandlerController';

const router = Router();

/**
 * @swagger
 * /api/security-error-response/authentication-error-handler:
 *   get:
 *     summary: Get all authentication error handler items
 *     tags: [Authentication Error Handler]
 *     responses:
 *       200:
 *         description: List of authentication error handler items with analytics
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
router.get('/', authenticationErrorHandlerController.getAll.bind(authenticationErrorHandlerController));

/**
 * @swagger
 * /api/security-error-response/authentication-error-handler/{id}:
 *   get:
 *     summary: Get authentication error handler item by ID
 *     tags: [Authentication Error Handler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Authentication Error Handler item ID
 *     responses:
 *       200:
 *         description: Authentication Error Handler item details
 *       404:
 *         description: Authentication Error Handler item not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', authenticationErrorHandlerController.getById.bind(authenticationErrorHandlerController));

/**
 * @swagger
 * /api/security-error-response/authentication-error-handler:
 *   post:
 *     summary: Create new authentication error handler item
 *     tags: [Authentication Error Handler]
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
 *         description: Authentication Error Handler item created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticationErrorHandlerController.create.bind(authenticationErrorHandlerController));

/**
 * @swagger
 * /api/security-error-response/authentication-error-handler/{id}:
 *   put:
 *     summary: Update authentication error handler item
 *     tags: [Authentication Error Handler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Authentication Error Handler item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Authentication Error Handler item updated successfully
 *       404:
 *         description: Authentication Error Handler item not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', authenticationErrorHandlerController.update.bind(authenticationErrorHandlerController));

/**
 * @swagger
 * /api/security-error-response/authentication-error-handler/{id}:
 *   delete:
 *     summary: Delete authentication error handler item
 *     tags: [Authentication Error Handler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Authentication Error Handler item ID
 *     responses:
 *       200:
 *         description: Authentication Error Handler item deleted successfully
 *       404:
 *         description: Authentication Error Handler item not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authenticationErrorHandlerController.delete.bind(authenticationErrorHandlerController));

/**
 * @swagger
 * /api/security-error-response/authentication-error-handler/health:
 *   get:
 *     summary: Health check for authentication error handler service
 *     tags: [Authentication Error Handler]
 *     responses:
 *       200:
 *         description: Service is healthy
 *       503:
 *         description: Service is unhealthy
 */
router.get('/health', authenticationErrorHandlerController.healthCheck.bind(authenticationErrorHandlerController));

export { router as authenticationErrorHandlerRoutes };
export default router;