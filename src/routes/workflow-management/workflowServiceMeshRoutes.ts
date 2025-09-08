import { Router } from 'express';
import { workflowServiceMeshController } from '../controllers/workflowServiceMeshController';

const router = Router();

/**
 * @swagger
 * /api/workflow-management/workflow-service-mesh:
 *   get:
 *     summary: Get all workflow service mesh items
 *     tags: [Workflow Service Mesh]
 *     responses:
 *       200:
 *         description: List of workflow service mesh items
 */
router.get('/', workflowServiceMeshController.getAll.bind(workflowServiceMeshController));

/**
 * @swagger
 * /api/workflow-management/workflow-service-mesh/{id}:
 *   get:
 *     summary: Get workflow service mesh item by ID
 *     tags: [Workflow Service Mesh]
 */
router.get('/:id', workflowServiceMeshController.getById.bind(workflowServiceMeshController));

/**
 * @swagger
 * /api/workflow-management/workflow-service-mesh:
 *   post:
 *     summary: Create new workflow service mesh item
 *     tags: [Workflow Service Mesh]
 */
router.post('/', workflowServiceMeshController.create.bind(workflowServiceMeshController));

export { router as workflowServiceMeshRoutes };
export default router;