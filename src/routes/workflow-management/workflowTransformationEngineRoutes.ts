import { Router } from 'express';
import { workflowTransformationEngineController } from '../controllers/workflowTransformationEngineController';

const router = Router();

/**
 * @swagger
 * /api/workflow-management/workflow-transformation-engine:
 *   get:
 *     summary: Get all workflow transformation engine items
 *     tags: [Workflow Transformation Engine]
 *     responses:
 *       200:
 *         description: List of workflow transformation engine items
 */
router.get('/', workflowTransformationEngineController.getAll.bind(workflowTransformationEngineController));

/**
 * @swagger
 * /api/workflow-management/workflow-transformation-engine/{id}:
 *   get:
 *     summary: Get workflow transformation engine item by ID
 *     tags: [Workflow Transformation Engine]
 */
router.get('/:id', workflowTransformationEngineController.getById.bind(workflowTransformationEngineController));

/**
 * @swagger
 * /api/workflow-management/workflow-transformation-engine:
 *   post:
 *     summary: Create new workflow transformation engine item
 *     tags: [Workflow Transformation Engine]
 */
router.post('/', workflowTransformationEngineController.create.bind(workflowTransformationEngineController));

export { router as workflowTransformationEngineRoutes };
export default router;