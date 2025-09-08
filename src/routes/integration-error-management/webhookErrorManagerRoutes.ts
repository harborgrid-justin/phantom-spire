import { Router } from 'express';
import { webhookErrorManagerController } from '../../controllers/integration-error-management/webhookErrorManagerController';

const router = Router();

/**
 * @swagger
 * /api/integration-error-management/webhook-error-manager:
 *   get:
 *     summary: Get all webhook error manager items
 *     tags: [Webhook Error Manager]
 *     responses:
 *       200:
 *         description: List of webhook error manager items with analytics
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
router.get('/', webhookErrorManagerController.getAll.bind(webhookErrorManagerController));

/**
 * @swagger
 * /api/integration-error-management/webhook-error-manager/{id}:
 *   get:
 *     summary: Get webhook error manager item by ID
 *     tags: [Webhook Error Manager]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Webhook Error Manager item ID
 *     responses:
 *       200:
 *         description: Webhook Error Manager item details
 *       404:
 *         description: Webhook Error Manager item not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', webhookErrorManagerController.getById.bind(webhookErrorManagerController));

/**
 * @swagger
 * /api/integration-error-management/webhook-error-manager:
 *   post:
 *     summary: Create new webhook error manager item
 *     tags: [Webhook Error Manager]
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
 *         description: Webhook Error Manager item created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/', webhookErrorManagerController.create.bind(webhookErrorManagerController));

/**
 * @swagger
 * /api/integration-error-management/webhook-error-manager/{id}:
 *   put:
 *     summary: Update webhook error manager item
 *     tags: [Webhook Error Manager]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Webhook Error Manager item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook Error Manager item updated successfully
 *       404:
 *         description: Webhook Error Manager item not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', webhookErrorManagerController.update.bind(webhookErrorManagerController));

/**
 * @swagger
 * /api/integration-error-management/webhook-error-manager/{id}:
 *   delete:
 *     summary: Delete webhook error manager item
 *     tags: [Webhook Error Manager]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Webhook Error Manager item ID
 *     responses:
 *       200:
 *         description: Webhook Error Manager item deleted successfully
 *       404:
 *         description: Webhook Error Manager item not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', webhookErrorManagerController.delete.bind(webhookErrorManagerController));

/**
 * @swagger
 * /api/integration-error-management/webhook-error-manager/health:
 *   get:
 *     summary: Health check for webhook error manager service
 *     tags: [Webhook Error Manager]
 *     responses:
 *       200:
 *         description: Service is healthy
 *       503:
 *         description: Service is unhealthy
 */
router.get('/health', webhookErrorManagerController.healthCheck.bind(webhookErrorManagerController));

export { router as webhookErrorManagerRoutes };
export default router;