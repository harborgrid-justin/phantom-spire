import { Router } from 'express';
import { processQueueControllerController } from '../controllers/processQueueControllerController';

const router = Router();

/**
 * @swagger
 * /api/workflow-management/process-queue-controller:
 *   get:
 *     summary: Get all process queue controller items
 *     tags: [Process Queue Controller]
 *     responses:
 *       200:
 *         description: List of process queue controller items
 */
router.get('/', processQueueControllerController.getAll.bind(processQueueControllerController));

/**
 * @swagger
 * /api/workflow-management/process-queue-controller/{id}:
 *   get:
 *     summary: Get process queue controller item by ID
 *     tags: [Process Queue Controller]
 */
router.get('/:id', processQueueControllerController.getById.bind(processQueueControllerController));

/**
 * @swagger
 * /api/workflow-management/process-queue-controller:
 *   post:
 *     summary: Create new process queue controller item
 *     tags: [Process Queue Controller]
 */
router.post('/', processQueueControllerController.create.bind(processQueueControllerController));

export { router as processQueueControllerRoutes };
export default router;