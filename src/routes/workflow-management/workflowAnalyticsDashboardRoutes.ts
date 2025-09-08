import { Router } from 'express';
import { workflowAnalyticsDashboardController } from '../controllers/workflowAnalyticsDashboardController';

const router = Router();

/**
 * @swagger
 * /api/workflow-management/workflow-analytics-dashboard:
 *   get:
 *     summary: Get all workflow analytics dashboard items
 *     tags: [Workflow Analytics Dashboard]
 *     responses:
 *       200:
 *         description: List of workflow analytics dashboard items
 */
router.get('/', workflowAnalyticsDashboardController.getAll.bind(workflowAnalyticsDashboardController));

/**
 * @swagger
 * /api/workflow-management/workflow-analytics-dashboard/{id}:
 *   get:
 *     summary: Get workflow analytics dashboard item by ID
 *     tags: [Workflow Analytics Dashboard]
 */
router.get('/:id', workflowAnalyticsDashboardController.getById.bind(workflowAnalyticsDashboardController));

/**
 * @swagger
 * /api/workflow-management/workflow-analytics-dashboard:
 *   post:
 *     summary: Create new workflow analytics dashboard item
 *     tags: [Workflow Analytics Dashboard]
 */
router.post('/', workflowAnalyticsDashboardController.create.bind(workflowAnalyticsDashboardController));

export { router as workflowAnalyticsDashboardRoutes };
export default router;