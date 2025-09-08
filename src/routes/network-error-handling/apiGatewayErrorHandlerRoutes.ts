import { Router } from 'express';
import { apiGatewayErrorHandlerController } from '../../controllers/network-error-handling/apiGatewayErrorHandlerController';

const router = Router();

/**
 * @swagger
 * /api/network-error-handling/api-gateway-error-handler:
 *   get:
 *     summary: Get all api gateway error handler items
 *     tags: [Api Gateway Error Handler]
 *     responses:
 *       200:
 *         description: List of api gateway error handler items with analytics
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
router.get('/', apiGatewayErrorHandlerController.getAll.bind(apiGatewayErrorHandlerController));

/**
 * @swagger
 * /api/network-error-handling/api-gateway-error-handler/{id}:
 *   get:
 *     summary: Get api gateway error handler item by ID
 *     tags: [Api Gateway Error Handler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Api Gateway Error Handler item ID
 *     responses:
 *       200:
 *         description: Api Gateway Error Handler item details
 *       404:
 *         description: Api Gateway Error Handler item not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', apiGatewayErrorHandlerController.getById.bind(apiGatewayErrorHandlerController));

/**
 * @swagger
 * /api/network-error-handling/api-gateway-error-handler:
 *   post:
 *     summary: Create new api gateway error handler item
 *     tags: [Api Gateway Error Handler]
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
 *         description: Api Gateway Error Handler item created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/', apiGatewayErrorHandlerController.create.bind(apiGatewayErrorHandlerController));

/**
 * @swagger
 * /api/network-error-handling/api-gateway-error-handler/{id}:
 *   put:
 *     summary: Update api gateway error handler item
 *     tags: [Api Gateway Error Handler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Api Gateway Error Handler item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Api Gateway Error Handler item updated successfully
 *       404:
 *         description: Api Gateway Error Handler item not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', apiGatewayErrorHandlerController.update.bind(apiGatewayErrorHandlerController));

/**
 * @swagger
 * /api/network-error-handling/api-gateway-error-handler/{id}:
 *   delete:
 *     summary: Delete api gateway error handler item
 *     tags: [Api Gateway Error Handler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Api Gateway Error Handler item ID
 *     responses:
 *       200:
 *         description: Api Gateway Error Handler item deleted successfully
 *       404:
 *         description: Api Gateway Error Handler item not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', apiGatewayErrorHandlerController.delete.bind(apiGatewayErrorHandlerController));

/**
 * @swagger
 * /api/network-error-handling/api-gateway-error-handler/health:
 *   get:
 *     summary: Health check for api gateway error handler service
 *     tags: [Api Gateway Error Handler]
 *     responses:
 *       200:
 *         description: Service is healthy
 *       503:
 *         description: Service is unhealthy
 */
router.get('/health', apiGatewayErrorHandlerController.healthCheck.bind(apiGatewayErrorHandlerController));

export { router as apiGatewayErrorHandlerRoutes };
export default router;