import { Router } from 'express';
import { workflowImpactAnalyzerController } from '../controllers/workflowImpactAnalyzerController';

const router = Router();

/**
 * @swagger
 * /api/workflow-management/workflow-impact-analyzer:
 *   get:
 *     summary: Get all workflow impact analyzer items
 *     tags: [Workflow Impact Analyzer]
 *     responses:
 *       200:
 *         description: List of workflow impact analyzer items
 */
router.get('/', workflowImpactAnalyzerController.getAll.bind(workflowImpactAnalyzerController));

/**
 * @swagger
 * /api/workflow-management/workflow-impact-analyzer/{id}:
 *   get:
 *     summary: Get workflow impact analyzer item by ID
 *     tags: [Workflow Impact Analyzer]
 */
router.get('/:id', workflowImpactAnalyzerController.getById.bind(workflowImpactAnalyzerController));

/**
 * @swagger
 * /api/workflow-management/workflow-impact-analyzer:
 *   post:
 *     summary: Create new workflow impact analyzer item
 *     tags: [Workflow Impact Analyzer]
 */
router.post('/', workflowImpactAnalyzerController.create.bind(workflowImpactAnalyzerController));

export { router as workflowImpactAnalyzerRoutes };
export default router;