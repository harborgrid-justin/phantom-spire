import { Router } from 'express';
import { processRiskAssessorController } from '../controllers/processRiskAssessorController';

const router = Router();

/**
 * @swagger
 * /api/workflow-management/process-risk-assessor:
 *   get:
 *     summary: Get all process risk assessor items
 *     tags: [Process Risk Assessor]
 *     responses:
 *       200:
 *         description: List of process risk assessor items
 */
router.get('/', processRiskAssessorController.getAll.bind(processRiskAssessorController));

/**
 * @swagger
 * /api/workflow-management/process-risk-assessor/{id}:
 *   get:
 *     summary: Get process risk assessor item by ID
 *     tags: [Process Risk Assessor]
 */
router.get('/:id', processRiskAssessorController.getById.bind(processRiskAssessorController));

/**
 * @swagger
 * /api/workflow-management/process-risk-assessor:
 *   post:
 *     summary: Create new process risk assessor item
 *     tags: [Process Risk Assessor]
 */
router.post('/', processRiskAssessorController.create.bind(processRiskAssessorController));

export { router as processRiskAssessorRoutes };
export default router;