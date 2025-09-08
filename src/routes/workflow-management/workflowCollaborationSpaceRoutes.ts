import { Router } from 'express';
import { workflowCollaborationSpaceController } from '../controllers/workflowCollaborationSpaceController';

const router = Router();

/**
 * @swagger
 * /api/workflow-management/workflow-collaboration-space:
 *   get:
 *     summary: Get all workflow collaboration space items
 *     tags: [Workflow Collaboration Space]
 *     responses:
 *       200:
 *         description: List of workflow collaboration space items
 */
router.get('/', workflowCollaborationSpaceController.getAll.bind(workflowCollaborationSpaceController));

/**
 * @swagger
 * /api/workflow-management/workflow-collaboration-space/{id}:
 *   get:
 *     summary: Get workflow collaboration space item by ID
 *     tags: [Workflow Collaboration Space]
 */
router.get('/:id', workflowCollaborationSpaceController.getById.bind(workflowCollaborationSpaceController));

/**
 * @swagger
 * /api/workflow-management/workflow-collaboration-space:
 *   post:
 *     summary: Create new workflow collaboration space item
 *     tags: [Workflow Collaboration Space]
 */
router.post('/', workflowCollaborationSpaceController.create.bind(workflowCollaborationSpaceController));

export { router as workflowCollaborationSpaceRoutes };
export default router;