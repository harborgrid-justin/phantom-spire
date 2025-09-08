import { Router } from 'express';
import { workflowCheckpointManagerController } from '../controllers/workflowCheckpointManagerController';

const router = Router();

/**
 * @swagger
 * /api/workflow-management/workflow-checkpoint-manager:
 *   get:
 *     summary: Get all workflow checkpoint manager items
 *     tags: [Workflow Checkpoint Manager]
 *     responses:
 *       200:
 *         description: List of workflow checkpoint manager items
 */
router.get('/', workflowCheckpointManagerController.getAll.bind(workflowCheckpointManagerController));

/**
 * @swagger
 * /api/workflow-management/workflow-checkpoint-manager/{id}:
 *   get:
 *     summary: Get workflow checkpoint manager item by ID
 *     tags: [Workflow Checkpoint Manager]
 */
router.get('/:id', workflowCheckpointManagerController.getById.bind(workflowCheckpointManagerController));

/**
 * @swagger
 * /api/workflow-management/workflow-checkpoint-manager:
 *   post:
 *     summary: Create new workflow checkpoint manager item
 *     tags: [Workflow Checkpoint Manager]
 */
router.post('/', workflowCheckpointManagerController.create.bind(workflowCheckpointManagerController));

export { router as workflowCheckpointManagerRoutes };
export default router;