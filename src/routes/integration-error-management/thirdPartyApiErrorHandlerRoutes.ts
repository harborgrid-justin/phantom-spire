import { Router } from 'express';
import { thirdPartyApiErrorHandlerController } from '../../controllers/integration-error-management/thirdPartyApiErrorHandlerController';

const router = Router();

/**
 * @swagger
 * /api/integration-error-management/third-party-api-error-handler:
 *   get:
 *     summary: Get all third party api error handler items
 *     tags: [Third Party Api Error Handler]
 *     responses:
 *       200:
 *         description: List of third party api error handler items with analytics
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
router.get('/', thirdPartyApiErrorHandlerController.getAll.bind(thirdPartyApiErrorHandlerController));

/**
 * @swagger
 * /api/integration-error-management/third-party-api-error-handler/{id}:
 *   get:
 *     summary: Get third party api error handler item by ID
 *     tags: [Third Party Api Error Handler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Third Party Api Error Handler item ID
 *     responses:
 *       200:
 *         description: Third Party Api Error Handler item details
 *       404:
 *         description: Third Party Api Error Handler item not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', thirdPartyApiErrorHandlerController.getById.bind(thirdPartyApiErrorHandlerController));

/**
 * @swagger
 * /api/integration-error-management/third-party-api-error-handler:
 *   post:
 *     summary: Create new third party api error handler item
 *     tags: [Third Party Api Error Handler]
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
 *         description: Third Party Api Error Handler item created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/', thirdPartyApiErrorHandlerController.create.bind(thirdPartyApiErrorHandlerController));

/**
 * @swagger
 * /api/integration-error-management/third-party-api-error-handler/{id}:
 *   put:
 *     summary: Update third party api error handler item
 *     tags: [Third Party Api Error Handler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Third Party Api Error Handler item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Third Party Api Error Handler item updated successfully
 *       404:
 *         description: Third Party Api Error Handler item not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', thirdPartyApiErrorHandlerController.update.bind(thirdPartyApiErrorHandlerController));

/**
 * @swagger
 * /api/integration-error-management/third-party-api-error-handler/{id}:
 *   delete:
 *     summary: Delete third party api error handler item
 *     tags: [Third Party Api Error Handler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Third Party Api Error Handler item ID
 *     responses:
 *       200:
 *         description: Third Party Api Error Handler item deleted successfully
 *       404:
 *         description: Third Party Api Error Handler item not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', thirdPartyApiErrorHandlerController.delete.bind(thirdPartyApiErrorHandlerController));

/**
 * @swagger
 * /api/integration-error-management/third-party-api-error-handler/health:
 *   get:
 *     summary: Health check for third party api error handler service
 *     tags: [Third Party Api Error Handler]
 *     responses:
 *       200:
 *         description: Service is healthy
 *       503:
 *         description: Service is unhealthy
 */
router.get('/health', thirdPartyApiErrorHandlerController.healthCheck.bind(thirdPartyApiErrorHandlerController));

export { router as thirdPartyApiErrorHandlerRoutes };
export default router;