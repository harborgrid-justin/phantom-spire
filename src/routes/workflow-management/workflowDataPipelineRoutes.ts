import { Router } from 'express';
import { workflowDataPipelineController } from '../controllers/workflowDataPipelineController';

const router = Router();

/**
 * @swagger
 * /api/workflow-management/workflow-data-pipeline:
 *   get:
 *     summary: Get all workflow data pipeline items
 *     tags: [Workflow Data Pipeline]
 *     responses:
 *       200:
 *         description: List of workflow data pipeline items
 */
router.get('/', workflowDataPipelineController.getAll.bind(workflowDataPipelineController));

/**
 * @swagger
 * /api/workflow-management/workflow-data-pipeline/{id}:
 *   get:
 *     summary: Get workflow data pipeline item by ID
 *     tags: [Workflow Data Pipeline]
 */
router.get('/:id', workflowDataPipelineController.getById.bind(workflowDataPipelineController));

/**
 * @swagger
 * /api/workflow-management/workflow-data-pipeline:
 *   post:
 *     summary: Create new workflow data pipeline item
 *     tags: [Workflow Data Pipeline]
 */
router.post('/', workflowDataPipelineController.create.bind(workflowDataPipelineController));

export { router as workflowDataPipelineRoutes };
export default router;