import { Router } from 'express';
import { dnsResolutionErrorHandlerController } from '../../controllers/network-error-handling/dnsResolutionErrorHandlerController';

const router = Router();

/**
 * @swagger
 * /api/network-error-handling/dns-resolution-error-handler:
 *   get:
 *     summary: Get all dns resolution error handler items
 *     tags: [Dns Resolution Error Handler]
 *     responses:
 *       200:
 *         description: List of dns resolution error handler items with analytics
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
router.get('/', dnsResolutionErrorHandlerController.getAll.bind(dnsResolutionErrorHandlerController));

/**
 * @swagger
 * /api/network-error-handling/dns-resolution-error-handler/{id}:
 *   get:
 *     summary: Get dns resolution error handler item by ID
 *     tags: [Dns Resolution Error Handler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Dns Resolution Error Handler item ID
 *     responses:
 *       200:
 *         description: Dns Resolution Error Handler item details
 *       404:
 *         description: Dns Resolution Error Handler item not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', dnsResolutionErrorHandlerController.getById.bind(dnsResolutionErrorHandlerController));

/**
 * @swagger
 * /api/network-error-handling/dns-resolution-error-handler:
 *   post:
 *     summary: Create new dns resolution error handler item
 *     tags: [Dns Resolution Error Handler]
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
 *         description: Dns Resolution Error Handler item created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/', dnsResolutionErrorHandlerController.create.bind(dnsResolutionErrorHandlerController));

/**
 * @swagger
 * /api/network-error-handling/dns-resolution-error-handler/{id}:
 *   put:
 *     summary: Update dns resolution error handler item
 *     tags: [Dns Resolution Error Handler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Dns Resolution Error Handler item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Dns Resolution Error Handler item updated successfully
 *       404:
 *         description: Dns Resolution Error Handler item not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', dnsResolutionErrorHandlerController.update.bind(dnsResolutionErrorHandlerController));

/**
 * @swagger
 * /api/network-error-handling/dns-resolution-error-handler/{id}:
 *   delete:
 *     summary: Delete dns resolution error handler item
 *     tags: [Dns Resolution Error Handler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Dns Resolution Error Handler item ID
 *     responses:
 *       200:
 *         description: Dns Resolution Error Handler item deleted successfully
 *       404:
 *         description: Dns Resolution Error Handler item not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', dnsResolutionErrorHandlerController.delete.bind(dnsResolutionErrorHandlerController));

/**
 * @swagger
 * /api/network-error-handling/dns-resolution-error-handler/health:
 *   get:
 *     summary: Health check for dns resolution error handler service
 *     tags: [Dns Resolution Error Handler]
 *     responses:
 *       200:
 *         description: Service is healthy
 *       503:
 *         description: Service is unhealthy
 */
router.get('/health', dnsResolutionErrorHandlerController.healthCheck.bind(dnsResolutionErrorHandlerController));

export { router as dnsResolutionErrorHandlerRoutes };
export default router;