import { Router } from 'express';
import { processValidationEngineController } from '../controllers/processValidationEngineController';

const router = Router();

/**
 * @swagger
 * /api/workflow-management/process-validation-engine:
 *   get:
 *     summary: Get all process validation engine items
 *     tags: [Process Validation Engine]
 *     responses:
 *       200:
 *         description: List of process validation engine items
 */
router.get('/', processValidationEngineController.getAll.bind(processValidationEngineController));

/**
 * @swagger
 * /api/workflow-management/process-validation-engine/{id}:
 *   get:
 *     summary: Get process validation engine item by ID
 *     tags: [Process Validation Engine]
 */
router.get('/:id', processValidationEngineController.getById.bind(processValidationEngineController));

/**
 * @swagger
 * /api/workflow-management/process-validation-engine:
 *   post:
 *     summary: Create new process validation engine item
 *     tags: [Process Validation Engine]
 */
router.post('/', processValidationEngineController.create.bind(processValidationEngineController));

export { router as processValidationEngineRoutes };
export default router;