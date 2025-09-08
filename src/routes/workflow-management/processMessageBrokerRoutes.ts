import { Router } from 'express';
import { processMessageBrokerController } from '../controllers/processMessageBrokerController';

const router = Router();

/**
 * @swagger
 * /api/workflow-management/process-message-broker:
 *   get:
 *     summary: Get all process message broker items
 *     tags: [Process Message Broker]
 *     responses:
 *       200:
 *         description: List of process message broker items
 */
router.get('/', processMessageBrokerController.getAll.bind(processMessageBrokerController));

/**
 * @swagger
 * /api/workflow-management/process-message-broker/{id}:
 *   get:
 *     summary: Get process message broker item by ID
 *     tags: [Process Message Broker]
 */
router.get('/:id', processMessageBrokerController.getById.bind(processMessageBrokerController));

/**
 * @swagger
 * /api/workflow-management/process-message-broker:
 *   post:
 *     summary: Create new process message broker item
 *     tags: [Process Message Broker]
 */
router.post('/', processMessageBrokerController.create.bind(processMessageBrokerController));

export { router as processMessageBrokerRoutes };
export default router;