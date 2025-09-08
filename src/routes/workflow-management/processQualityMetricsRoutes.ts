import { Router } from 'express';
import { processQualityMetricsController } from '../controllers/processQualityMetricsController';

const router = Router();

/**
 * @swagger
 * /api/workflow-management/process-quality-metrics:
 *   get:
 *     summary: Get all process quality metrics items
 *     tags: [Process Quality Metrics]
 *     responses:
 *       200:
 *         description: List of process quality metrics items
 */
router.get('/', processQualityMetricsController.getAll.bind(processQualityMetricsController));

/**
 * @swagger
 * /api/workflow-management/process-quality-metrics/{id}:
 *   get:
 *     summary: Get process quality metrics item by ID
 *     tags: [Process Quality Metrics]
 */
router.get('/:id', processQualityMetricsController.getById.bind(processQualityMetricsController));

/**
 * @swagger
 * /api/workflow-management/process-quality-metrics:
 *   post:
 *     summary: Create new process quality metrics item
 *     tags: [Process Quality Metrics]
 */
router.post('/', processQualityMetricsController.create.bind(processQualityMetricsController));

export { router as processQualityMetricsRoutes };
export default router;