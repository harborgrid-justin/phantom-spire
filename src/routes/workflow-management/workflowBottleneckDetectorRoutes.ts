import { Router } from 'express';
import { workflowBottleneckDetectorController } from '../controllers/workflowBottleneckDetectorController';

const router = Router();

/**
 * @swagger
 * /api/workflow-management/workflow-bottleneck-detector:
 *   get:
 *     summary: Get all workflow bottleneck detector items
 *     tags: [Workflow Bottleneck Detector]
 *     responses:
 *       200:
 *         description: List of workflow bottleneck detector items
 */
router.get('/', workflowBottleneckDetectorController.getAll.bind(workflowBottleneckDetectorController));

/**
 * @swagger
 * /api/workflow-management/workflow-bottleneck-detector/{id}:
 *   get:
 *     summary: Get workflow bottleneck detector item by ID
 *     tags: [Workflow Bottleneck Detector]
 */
router.get('/:id', workflowBottleneckDetectorController.getById.bind(workflowBottleneckDetectorController));

/**
 * @swagger
 * /api/workflow-management/workflow-bottleneck-detector:
 *   post:
 *     summary: Create new workflow bottleneck detector item
 *     tags: [Workflow Bottleneck Detector]
 */
router.post('/', workflowBottleneckDetectorController.create.bind(workflowBottleneckDetectorController));

export { router as workflowBottleneckDetectorRoutes };
export default router;