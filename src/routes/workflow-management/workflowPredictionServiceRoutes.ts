import { Router } from 'express';
import { workflowPredictionServiceController } from '../controllers/workflowPredictionServiceController';

const router = Router();

/**
 * @swagger
 * /api/workflow-management/workflow-prediction-service:
 *   get:
 *     summary: Get all workflow prediction service items
 *     tags: [Workflow Prediction Service]
 *     responses:
 *       200:
 *         description: List of workflow prediction service items
 */
router.get('/', workflowPredictionServiceController.getAll.bind(workflowPredictionServiceController));

/**
 * @swagger
 * /api/workflow-management/workflow-prediction-service/{id}:
 *   get:
 *     summary: Get workflow prediction service item by ID
 *     tags: [Workflow Prediction Service]
 */
router.get('/:id', workflowPredictionServiceController.getById.bind(workflowPredictionServiceController));

/**
 * @swagger
 * /api/workflow-management/workflow-prediction-service:
 *   post:
 *     summary: Create new workflow prediction service item
 *     tags: [Workflow Prediction Service]
 */
router.post('/', workflowPredictionServiceController.create.bind(workflowPredictionServiceController));

export { router as workflowPredictionServiceRoutes };
export default router;