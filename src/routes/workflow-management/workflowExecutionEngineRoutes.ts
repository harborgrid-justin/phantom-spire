import { Router } from 'express';
import { workflowExecutionEngineController } from '../controllers/workflowExecutionEngineController';

const router = Router();

/**
 * @swagger
 * /api/workflow-management/workflow-execution-engine:
 *   get:
 *     summary: Get all workflow execution engine items
 *     tags: [Workflow Execution Engine]
 *     responses:
 *       200:
 *         description: List of workflow execution engine items
 */
router.get('/', workflowExecutionEngineController.getAll.bind(workflowExecutionEngineController));

/**
 * @swagger
 * /api/workflow-management/workflow-execution-engine/{id}:
 *   get:
 *     summary: Get workflow execution engine item by ID
 *     tags: [Workflow Execution Engine]
 */
router.get('/:id', workflowExecutionEngineController.getById.bind(workflowExecutionEngineController));

/**
 * @swagger
 * /api/workflow-management/workflow-execution-engine:
 *   post:
 *     summary: Create new workflow execution engine item
 *     tags: [Workflow Execution Engine]
 */
router.post('/', workflowExecutionEngineController.create.bind(workflowExecutionEngineController));

export { router as workflowExecutionEngineRoutes };
export default router;