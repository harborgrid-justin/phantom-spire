import { Router } from 'express';
import { workflowApiGatewayController } from '../controllers/workflowApiGatewayController';

const router = Router();

/**
 * @swagger
 * /api/workflow-management/workflow-api-gateway:
 *   get:
 *     summary: Get all workflow api gateway items
 *     tags: [Workflow API Gateway]
 *     responses:
 *       200:
 *         description: List of workflow api gateway items
 */
router.get('/', workflowApiGatewayController.getAll.bind(workflowApiGatewayController));

/**
 * @swagger
 * /api/workflow-management/workflow-api-gateway/{id}:
 *   get:
 *     summary: Get workflow api gateway item by ID
 *     tags: [Workflow API Gateway]
 */
router.get('/:id', workflowApiGatewayController.getById.bind(workflowApiGatewayController));

/**
 * @swagger
 * /api/workflow-management/workflow-api-gateway:
 *   post:
 *     summary: Create new workflow api gateway item
 *     tags: [Workflow API Gateway]
 */
router.post('/', workflowApiGatewayController.create.bind(workflowApiGatewayController));

export { router as workflowApiGatewayRoutes };
export default router;