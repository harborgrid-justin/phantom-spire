import { Router } from 'express';
import { processEventHubController } from '../controllers/processEventHubController';

const router = Router();

/**
 * @swagger
 * /api/workflow-management/process-event-hub:
 *   get:
 *     summary: Get all process event hub items
 *     tags: [Process Event Hub]
 *     responses:
 *       200:
 *         description: List of process event hub items
 */
router.get('/', processEventHubController.getAll.bind(processEventHubController));

/**
 * @swagger
 * /api/workflow-management/process-event-hub/{id}:
 *   get:
 *     summary: Get process event hub item by ID
 *     tags: [Process Event Hub]
 */
router.get('/:id', processEventHubController.getById.bind(processEventHubController));

/**
 * @swagger
 * /api/workflow-management/process-event-hub:
 *   post:
 *     summary: Create new process event hub item
 *     tags: [Process Event Hub]
 */
router.post('/', processEventHubController.create.bind(processEventHubController));

export { router as processEventHubRoutes };
export default router;