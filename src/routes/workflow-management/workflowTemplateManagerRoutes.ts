import { Router } from 'express';
import { workflowTemplateManagerController } from '../controllers/workflowTemplateManagerController';

const router = Router();

/**
 * @swagger
 * /api/workflow-management/workflow-template-manager:
 *   get:
 *     summary: Get all workflow template manager items
 *     tags: [Workflow Template Manager]
 *     responses:
 *       200:
 *         description: List of workflow template manager items
 */
router.get('/', workflowTemplateManagerController.getAll.bind(workflowTemplateManagerController));

/**
 * @swagger
 * /api/workflow-management/workflow-template-manager/{id}:
 *   get:
 *     summary: Get workflow template manager item by ID
 *     tags: [Workflow Template Manager]
 */
router.get('/:id', workflowTemplateManagerController.getById.bind(workflowTemplateManagerController));

/**
 * @swagger
 * /api/workflow-management/workflow-template-manager:
 *   post:
 *     summary: Create new workflow template manager item
 *     tags: [Workflow Template Manager]
 */
router.post('/', workflowTemplateManagerController.create.bind(workflowTemplateManagerController));

export { router as workflowTemplateManagerRoutes };
export default router;