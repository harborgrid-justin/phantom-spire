import { Router } from 'express';
import { workflowResourceManagerController } from '../controllers/workflowResourceManagerController';

const router = Router();

/**
 * @swagger
 * /api/workflow-management/workflow-resource-manager:
 *   get:
 *     summary: Get all workflow resource manager items
 *     tags: [Workflow Resource Manager]
 *     responses:
 *       200:
 *         description: List of workflow resource manager items
 */
router.get('/', workflowResourceManagerController.getAll.bind(workflowResourceManagerController));

/**
 * @swagger
 * /api/workflow-management/workflow-resource-manager/{id}:
 *   get:
 *     summary: Get workflow resource manager item by ID
 *     tags: [Workflow Resource Manager]
 */
router.get('/:id', workflowResourceManagerController.getById.bind(workflowResourceManagerController));

/**
 * @swagger
 * /api/workflow-management/workflow-resource-manager:
 *   post:
 *     summary: Create new workflow resource manager item
 *     tags: [Workflow Resource Manager]
 */
router.post('/', workflowResourceManagerController.create.bind(workflowResourceManagerController));

export { router as workflowResourceManagerRoutes };
export default router;