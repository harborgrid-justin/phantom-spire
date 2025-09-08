import { Router } from 'express';
import { processModelRepositoryController } from '../controllers/processModelRepositoryController';

const router = Router();

/**
 * @swagger
 * /api/workflow-management/process-model-repository:
 *   get:
 *     summary: Get all process model repository items
 *     tags: [Process Model Repository]
 *     responses:
 *       200:
 *         description: List of process model repository items
 */
router.get('/', processModelRepositoryController.getAll.bind(processModelRepositoryController));

/**
 * @swagger
 * /api/workflow-management/process-model-repository/{id}:
 *   get:
 *     summary: Get process model repository item by ID
 *     tags: [Process Model Repository]
 */
router.get('/:id', processModelRepositoryController.getById.bind(processModelRepositoryController));

/**
 * @swagger
 * /api/workflow-management/process-model-repository:
 *   post:
 *     summary: Create new process model repository item
 *     tags: [Process Model Repository]
 */
router.post('/', processModelRepositoryController.create.bind(processModelRepositoryController));

export { router as processModelRepositoryRoutes };
export default router;