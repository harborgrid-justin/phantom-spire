import { Router } from 'express';
import { workflowStateManagerController } from '../controllers/workflowStateManagerController';

const router = Router();

/**
 * @swagger
 * /api/workflow-management/workflow-state-manager:
 *   get:
 *     summary: Get all workflow state manager items
 *     tags: [Workflow State Manager]
 *     responses:
 *       200:
 *         description: List of workflow state manager items
 */
router.get('/', workflowStateManagerController.getAll.bind(workflowStateManagerController));

/**
 * @swagger
 * /api/workflow-management/workflow-state-manager/{id}:
 *   get:
 *     summary: Get workflow state manager item by ID
 *     tags: [Workflow State Manager]
 */
router.get('/:id', workflowStateManagerController.getById.bind(workflowStateManagerController));

/**
 * @swagger
 * /api/workflow-management/workflow-state-manager:
 *   post:
 *     summary: Create new workflow state manager item
 *     tags: [Workflow State Manager]
 */
router.post('/', workflowStateManagerController.create.bind(workflowStateManagerController));

export { router as workflowStateManagerRoutes };
export default router;