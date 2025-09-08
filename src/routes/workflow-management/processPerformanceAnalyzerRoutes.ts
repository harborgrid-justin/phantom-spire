import { Router } from 'express';
import { processPerformanceAnalyzerController } from '../controllers/processPerformanceAnalyzerController';

const router = Router();

/**
 * @swagger
 * /api/workflow-management/process-performance-analyzer:
 *   get:
 *     summary: Get all process performance analyzer items
 *     tags: [Process Performance Analyzer]
 *     responses:
 *       200:
 *         description: List of process performance analyzer items
 */
router.get('/', processPerformanceAnalyzerController.getAll.bind(processPerformanceAnalyzerController));

/**
 * @swagger
 * /api/workflow-management/process-performance-analyzer/{id}:
 *   get:
 *     summary: Get process performance analyzer item by ID
 *     tags: [Process Performance Analyzer]
 */
router.get('/:id', processPerformanceAnalyzerController.getById.bind(processPerformanceAnalyzerController));

/**
 * @swagger
 * /api/workflow-management/process-performance-analyzer:
 *   post:
 *     summary: Create new process performance analyzer item
 *     tags: [Process Performance Analyzer]
 */
router.post('/', processPerformanceAnalyzerController.create.bind(processPerformanceAnalyzerController));

export { router as processPerformanceAnalyzerRoutes };
export default router;