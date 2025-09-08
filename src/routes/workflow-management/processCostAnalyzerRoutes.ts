import { Router } from 'express';
import { processCostAnalyzerController } from '../controllers/processCostAnalyzerController';

const router = Router();

/**
 * @swagger
 * /api/workflow-management/process-cost-analyzer:
 *   get:
 *     summary: Get all process cost analyzer items
 *     tags: [Process Cost Analyzer]
 *     responses:
 *       200:
 *         description: List of process cost analyzer items
 */
router.get('/', processCostAnalyzerController.getAll.bind(processCostAnalyzerController));

/**
 * @swagger
 * /api/workflow-management/process-cost-analyzer/{id}:
 *   get:
 *     summary: Get process cost analyzer item by ID
 *     tags: [Process Cost Analyzer]
 */
router.get('/:id', processCostAnalyzerController.getById.bind(processCostAnalyzerController));

/**
 * @swagger
 * /api/workflow-management/process-cost-analyzer:
 *   post:
 *     summary: Create new process cost analyzer item
 *     tags: [Process Cost Analyzer]
 */
router.post('/', processCostAnalyzerController.create.bind(processCostAnalyzerController));

export { router as processCostAnalyzerRoutes };
export default router;