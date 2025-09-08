import { Router } from 'express';
import { workflowSchedulerServiceController } from '../controllers/workflowSchedulerServiceController';

const router = Router();

/**
 * @swagger
 * /api/workflow-management/workflow-scheduler-service:
 *   get:
 *     summary: Get all workflow scheduler service items
 *     tags: [Workflow Scheduler Service]
 *     responses:
 *       200:
 *         description: List of workflow scheduler service items
 */
router.get('/', workflowSchedulerServiceController.getAll.bind(workflowSchedulerServiceController));

/**
 * @swagger
 * /api/workflow-management/workflow-scheduler-service/{id}:
 *   get:
 *     summary: Get workflow scheduler service item by ID
 *     tags: [Workflow Scheduler Service]
 */
router.get('/:id', workflowSchedulerServiceController.getById.bind(workflowSchedulerServiceController));

/**
 * @swagger
 * /api/workflow-management/workflow-scheduler-service:
 *   post:
 *     summary: Create new workflow scheduler service item
 *     tags: [Workflow Scheduler Service]
 */
router.post('/', workflowSchedulerServiceController.create.bind(workflowSchedulerServiceController));

export { router as workflowSchedulerServiceRoutes };
export default router;