import { Router } from 'express';
import { workflowTrendTrackerController } from '../controllers/workflowTrendTrackerController';

const router = Router();

/**
 * @swagger
 * /api/workflow-management/workflow-trend-tracker:
 *   get:
 *     summary: Get all workflow trend tracker items
 *     tags: [Workflow Trend Tracker]
 *     responses:
 *       200:
 *         description: List of workflow trend tracker items
 */
router.get('/', workflowTrendTrackerController.getAll.bind(workflowTrendTrackerController));

/**
 * @swagger
 * /api/workflow-management/workflow-trend-tracker/{id}:
 *   get:
 *     summary: Get workflow trend tracker item by ID
 *     tags: [Workflow Trend Tracker]
 */
router.get('/:id', workflowTrendTrackerController.getById.bind(workflowTrendTrackerController));

/**
 * @swagger
 * /api/workflow-management/workflow-trend-tracker:
 *   post:
 *     summary: Create new workflow trend tracker item
 *     tags: [Workflow Trend Tracker]
 */
router.post('/', workflowTrendTrackerController.create.bind(workflowTrendTrackerController));

export { router as workflowTrendTrackerRoutes };
export default router;