import { Router } from 'express';
import { workflowVersionControlController } from '../controllers/workflowVersionControlController';

const router = Router();

/**
 * @swagger
 * /api/workflow-management/workflow-version-control:
 *   get:
 *     summary: Get all workflow version control items
 *     tags: [Workflow Version Control]
 *     responses:
 *       200:
 *         description: List of workflow version control items
 */
router.get('/', workflowVersionControlController.getAll.bind(workflowVersionControlController));

/**
 * @swagger
 * /api/workflow-management/workflow-version-control/{id}:
 *   get:
 *     summary: Get workflow version control item by ID
 *     tags: [Workflow Version Control]
 */
router.get('/:id', workflowVersionControlController.getById.bind(workflowVersionControlController));

/**
 * @swagger
 * /api/workflow-management/workflow-version-control:
 *   post:
 *     summary: Create new workflow version control item
 *     tags: [Workflow Version Control]
 */
router.post('/', workflowVersionControlController.create.bind(workflowVersionControlController));

export { router as workflowVersionControlRoutes };
export default router;