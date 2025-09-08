import { Router } from 'express';
import { processMiningEngineController } from '../controllers/processMiningEngineController';

const router = Router();

/**
 * @swagger
 * /api/workflow-management/process-mining-engine:
 *   get:
 *     summary: Get all process mining engine items
 *     tags: [Process Mining Engine]
 *     responses:
 *       200:
 *         description: List of process mining engine items
 */
router.get('/', processMiningEngineController.getAll.bind(processMiningEngineController));

/**
 * @swagger
 * /api/workflow-management/process-mining-engine/{id}:
 *   get:
 *     summary: Get process mining engine item by ID
 *     tags: [Process Mining Engine]
 */
router.get('/:id', processMiningEngineController.getById.bind(processMiningEngineController));

/**
 * @swagger
 * /api/workflow-management/process-mining-engine:
 *   post:
 *     summary: Create new process mining engine item
 *     tags: [Process Mining Engine]
 */
router.post('/', processMiningEngineController.create.bind(processMiningEngineController));

export { router as processMiningEngineRoutes };
export default router;