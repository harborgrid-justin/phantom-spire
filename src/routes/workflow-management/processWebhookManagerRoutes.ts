import { Router } from 'express';
import { processWebhookManagerController } from '../controllers/processWebhookManagerController';

const router = Router();

/**
 * @swagger
 * /api/workflow-management/process-webhook-manager:
 *   get:
 *     summary: Get all process webhook manager items
 *     tags: [Process Webhook Manager]
 *     responses:
 *       200:
 *         description: List of process webhook manager items
 */
router.get('/', processWebhookManagerController.getAll.bind(processWebhookManagerController));

/**
 * @swagger
 * /api/workflow-management/process-webhook-manager/{id}:
 *   get:
 *     summary: Get process webhook manager item by ID
 *     tags: [Process Webhook Manager]
 */
router.get('/:id', processWebhookManagerController.getById.bind(processWebhookManagerController));

/**
 * @swagger
 * /api/workflow-management/process-webhook-manager:
 *   post:
 *     summary: Create new process webhook manager item
 *     tags: [Process Webhook Manager]
 */
router.post('/', processWebhookManagerController.create.bind(processWebhookManagerController));

export { router as processWebhookManagerRoutes };
export default router;