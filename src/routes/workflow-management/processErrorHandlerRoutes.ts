import { Router } from 'express';
import { processErrorHandlerController } from '../controllers/processErrorHandlerController';

const router = Router();

/**
 * @swagger
 * /api/workflow-management/process-error-handler:
 *   get:
 *     summary: Get all process error handler items
 *     tags: [Process Error Handler]
 *     responses:
 *       200:
 *         description: List of process error handler items
 */
router.get('/', processErrorHandlerController.getAll.bind(processErrorHandlerController));

/**
 * @swagger
 * /api/workflow-management/process-error-handler/{id}:
 *   get:
 *     summary: Get process error handler item by ID
 *     tags: [Process Error Handler]
 */
router.get('/:id', processErrorHandlerController.getById.bind(processErrorHandlerController));

/**
 * @swagger
 * /api/workflow-management/process-error-handler:
 *   post:
 *     summary: Create new process error handler item
 *     tags: [Process Error Handler]
 */
router.post('/', processErrorHandlerController.create.bind(processErrorHandlerController));

export { router as processErrorHandlerRoutes };
export default router;