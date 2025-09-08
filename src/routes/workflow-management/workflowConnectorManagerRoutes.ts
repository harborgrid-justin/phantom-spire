import { Router } from 'express';
import { workflowConnectorManagerController } from '../controllers/workflowConnectorManagerController';

const router = Router();

/**
 * @swagger
 * /api/workflow-management/workflow-connector-manager:
 *   get:
 *     summary: Get all workflow connector manager items
 *     tags: [Workflow Connector Manager]
 *     responses:
 *       200:
 *         description: List of workflow connector manager items
 */
router.get('/', workflowConnectorManagerController.getAll.bind(workflowConnectorManagerController));

/**
 * @swagger
 * /api/workflow-management/workflow-connector-manager/{id}:
 *   get:
 *     summary: Get workflow connector manager item by ID
 *     tags: [Workflow Connector Manager]
 */
router.get('/:id', workflowConnectorManagerController.getById.bind(workflowConnectorManagerController));

/**
 * @swagger
 * /api/workflow-management/workflow-connector-manager:
 *   post:
 *     summary: Create new workflow connector manager item
 *     tags: [Workflow Connector Manager]
 */
router.post('/', workflowConnectorManagerController.create.bind(workflowConnectorManagerController));

export { router as workflowConnectorManagerRoutes };
export default router;