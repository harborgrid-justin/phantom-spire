import { Router } from 'express';
import { loadBalancerErrorHandlerController } from '../../controllers/network-error-handling/loadBalancerErrorHandlerController';

const router = Router();

/**
 * @swagger
 * /api/network-error-handling/load-balancer-error-handler:
 *   get:
 *     summary: Get all load balancer error handler items
 *     tags: [Load Balancer Error Handler]
 *     responses:
 *       200:
 *         description: List of load balancer error handler items with analytics
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
router.get('/', loadBalancerErrorHandlerController.getAll.bind(loadBalancerErrorHandlerController));

/**
 * @swagger
 * /api/network-error-handling/load-balancer-error-handler/{id}:
 *   get:
 *     summary: Get load balancer error handler item by ID
 *     tags: [Load Balancer Error Handler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Load Balancer Error Handler item ID
 *     responses:
 *       200:
 *         description: Load Balancer Error Handler item details
 *       404:
 *         description: Load Balancer Error Handler item not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', loadBalancerErrorHandlerController.getById.bind(loadBalancerErrorHandlerController));

/**
 * @swagger
 * /api/network-error-handling/load-balancer-error-handler:
 *   post:
 *     summary: Create new load balancer error handler item
 *     tags: [Load Balancer Error Handler]
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
 *         description: Load Balancer Error Handler item created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/', loadBalancerErrorHandlerController.create.bind(loadBalancerErrorHandlerController));

/**
 * @swagger
 * /api/network-error-handling/load-balancer-error-handler/{id}:
 *   put:
 *     summary: Update load balancer error handler item
 *     tags: [Load Balancer Error Handler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Load Balancer Error Handler item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Load Balancer Error Handler item updated successfully
 *       404:
 *         description: Load Balancer Error Handler item not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', loadBalancerErrorHandlerController.update.bind(loadBalancerErrorHandlerController));

/**
 * @swagger
 * /api/network-error-handling/load-balancer-error-handler/{id}:
 *   delete:
 *     summary: Delete load balancer error handler item
 *     tags: [Load Balancer Error Handler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Load Balancer Error Handler item ID
 *     responses:
 *       200:
 *         description: Load Balancer Error Handler item deleted successfully
 *       404:
 *         description: Load Balancer Error Handler item not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', loadBalancerErrorHandlerController.delete.bind(loadBalancerErrorHandlerController));

/**
 * @swagger
 * /api/network-error-handling/load-balancer-error-handler/health:
 *   get:
 *     summary: Health check for load balancer error handler service
 *     tags: [Load Balancer Error Handler]
 *     responses:
 *       200:
 *         description: Service is healthy
 *       503:
 *         description: Service is unhealthy
 */
router.get('/health', loadBalancerErrorHandlerController.healthCheck.bind(loadBalancerErrorHandlerController));

export { router as loadBalancerErrorHandlerRoutes };
export default router;