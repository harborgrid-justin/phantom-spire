import { Router } from 'express';
import { processInstanceMonitorController } from '../controllers/processInstanceMonitorController';

const router = Router();

/**
 * @swagger
 * /api/workflow-management/process-instance-monitor:
 *   get:
 *     summary: Get all process instance monitor items
 *     tags: [Process Instance Monitor]
 *     responses:
 *       200:
 *         description: List of process instance monitor items
 */
router.get('/', processInstanceMonitorController.getAll.bind(processInstanceMonitorController));

/**
 * @swagger
 * /api/workflow-management/process-instance-monitor/{id}:
 *   get:
 *     summary: Get process instance monitor item by ID
 *     tags: [Process Instance Monitor]
 */
router.get('/:id', processInstanceMonitorController.getById.bind(processInstanceMonitorController));

/**
 * @swagger
 * /api/workflow-management/process-instance-monitor:
 *   post:
 *     summary: Create new process instance monitor item
 *     tags: [Process Instance Monitor]
 */
router.post('/', processInstanceMonitorController.create.bind(processInstanceMonitorController));

export { router as processInstanceMonitorRoutes };
export default router;