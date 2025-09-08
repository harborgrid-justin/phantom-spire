import { Router } from 'express';
import { processOptimizationAdvisorController } from '../controllers/processOptimizationAdvisorController';

const router = Router();

/**
 * @swagger
 * /api/workflow-management/process-optimization-advisor:
 *   get:
 *     summary: Get all process optimization advisor items
 *     tags: [Process Optimization Advisor]
 *     responses:
 *       200:
 *         description: List of process optimization advisor items
 */
router.get('/', processOptimizationAdvisorController.getAll.bind(processOptimizationAdvisorController));

/**
 * @swagger
 * /api/workflow-management/process-optimization-advisor/{id}:
 *   get:
 *     summary: Get process optimization advisor item by ID
 *     tags: [Process Optimization Advisor]
 */
router.get('/:id', processOptimizationAdvisorController.getById.bind(processOptimizationAdvisorController));

/**
 * @swagger
 * /api/workflow-management/process-optimization-advisor:
 *   post:
 *     summary: Create new process optimization advisor item
 *     tags: [Process Optimization Advisor]
 */
router.post('/', processOptimizationAdvisorController.create.bind(processOptimizationAdvisorController));

export { router as processOptimizationAdvisorRoutes };
export default router;