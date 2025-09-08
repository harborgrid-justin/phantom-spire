import { Router } from 'express';
import { workflowAccessControlController } from '../controllers/workflowAccessControlController';

const router = Router();

/**
 * @swagger
 * /api/workflow-management/workflow-access-control:
 *   get:
 *     summary: Get all workflow access control items
 *     tags: [Workflow Access Control]
 *     responses:
 *       200:
 *         description: List of workflow access control items
 */
router.get('/', workflowAccessControlController.getAll.bind(workflowAccessControlController));

/**
 * @swagger
 * /api/workflow-management/workflow-access-control/{id}:
 *   get:
 *     summary: Get workflow access control item by ID
 *     tags: [Workflow Access Control]
 */
router.get('/:id', workflowAccessControlController.getById.bind(workflowAccessControlController));

/**
 * @swagger
 * /api/workflow-management/workflow-access-control:
 *   post:
 *     summary: Create new workflow access control item
 *     tags: [Workflow Access Control]
 */
router.post('/', workflowAccessControlController.create.bind(workflowAccessControlController));

export { router as workflowAccessControlRoutes };
export default router;