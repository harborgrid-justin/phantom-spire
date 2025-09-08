import { Router } from 'express';
import { processSyncCoordinatorController } from '../controllers/processSyncCoordinatorController';

const router = Router();

/**
 * @swagger
 * /api/workflow-management/process-sync-coordinator:
 *   get:
 *     summary: Get all process sync coordinator items
 *     tags: [Process Sync Coordinator]
 *     responses:
 *       200:
 *         description: List of process sync coordinator items
 */
router.get('/', processSyncCoordinatorController.getAll.bind(processSyncCoordinatorController));

/**
 * @swagger
 * /api/workflow-management/process-sync-coordinator/{id}:
 *   get:
 *     summary: Get process sync coordinator item by ID
 *     tags: [Process Sync Coordinator]
 */
router.get('/:id', processSyncCoordinatorController.getById.bind(processSyncCoordinatorController));

/**
 * @swagger
 * /api/workflow-management/process-sync-coordinator:
 *   post:
 *     summary: Create new process sync coordinator item
 *     tags: [Process Sync Coordinator]
 */
router.post('/', processSyncCoordinatorController.create.bind(processSyncCoordinatorController));

export { router as processSyncCoordinatorRoutes };
export default router;