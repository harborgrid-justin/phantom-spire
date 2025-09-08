import { Router } from 'express';
import { processLibraryManagerController } from '../controllers/processLibraryManagerController';

const router = Router();

/**
 * @swagger
 * /api/workflow-management/process-library-manager:
 *   get:
 *     summary: Get all process library manager items
 *     tags: [Process Library Manager]
 *     responses:
 *       200:
 *         description: List of process library manager items
 */
router.get('/', processLibraryManagerController.getAll.bind(processLibraryManagerController));

/**
 * @swagger
 * /api/workflow-management/process-library-manager/{id}:
 *   get:
 *     summary: Get process library manager item by ID
 *     tags: [Process Library Manager]
 */
router.get('/:id', processLibraryManagerController.getById.bind(processLibraryManagerController));

/**
 * @swagger
 * /api/workflow-management/process-library-manager:
 *   post:
 *     summary: Create new process library manager item
 *     tags: [Process Library Manager]
 */
router.post('/', processLibraryManagerController.create.bind(processLibraryManagerController));

export { router as processLibraryManagerRoutes };
export default router;