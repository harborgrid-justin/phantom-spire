import { Router } from 'express';
import { workflowDesignerStudioController } from '../controllers/workflowDesignerStudioController';

const router = Router();

/**
 * @swagger
 * /api/workflow-management/workflow-designer-studio:
 *   get:
 *     summary: Get all workflow designer studio items
 *     tags: [Workflow Designer Studio]
 *     responses:
 *       200:
 *         description: List of workflow designer studio items
 */
router.get('/', workflowDesignerStudioController.getAll.bind(workflowDesignerStudioController));

/**
 * @swagger
 * /api/workflow-management/workflow-designer-studio/{id}:
 *   get:
 *     summary: Get workflow designer studio item by ID
 *     tags: [Workflow Designer Studio]
 */
router.get('/:id', workflowDesignerStudioController.getById.bind(workflowDesignerStudioController));

/**
 * @swagger
 * /api/workflow-management/workflow-designer-studio:
 *   post:
 *     summary: Create new workflow designer studio item
 *     tags: [Workflow Designer Studio]
 */
router.post('/', workflowDesignerStudioController.create.bind(workflowDesignerStudioController));

export { router as workflowDesignerStudioRoutes };
export default router;