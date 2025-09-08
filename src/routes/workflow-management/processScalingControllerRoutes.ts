import { Router } from 'express';
import { processScalingControllerController } from '../controllers/processScalingControllerController';

const router = Router();

/**
 * @swagger
 * /api/workflow-management/process-scaling-controller:
 *   get:
 *     summary: Get all process scaling controller items
 *     tags: [Process Scaling Controller]
 *     responses:
 *       200:
 *         description: List of process scaling controller items
 */
router.get('/', processScalingControllerController.getAll.bind(processScalingControllerController));

/**
 * @swagger
 * /api/workflow-management/process-scaling-controller/{id}:
 *   get:
 *     summary: Get process scaling controller item by ID
 *     tags: [Process Scaling Controller]
 */
router.get('/:id', processScalingControllerController.getById.bind(processScalingControllerController));

/**
 * @swagger
 * /api/workflow-management/process-scaling-controller:
 *   post:
 *     summary: Create new process scaling controller item
 *     tags: [Process Scaling Controller]
 */
router.post('/', processScalingControllerController.create.bind(processScalingControllerController));

export { router as processScalingControllerRoutes };
export default router;