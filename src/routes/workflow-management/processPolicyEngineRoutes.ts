import { Router } from 'express';
import { processPolicyEngineController } from '../controllers/processPolicyEngineController';

const router = Router();

/**
 * @swagger
 * /api/workflow-management/process-policy-engine:
 *   get:
 *     summary: Get all process policy engine items
 *     tags: [Process Policy Engine]
 *     responses:
 *       200:
 *         description: List of process policy engine items
 */
router.get('/', processPolicyEngineController.getAll.bind(processPolicyEngineController));

/**
 * @swagger
 * /api/workflow-management/process-policy-engine/{id}:
 *   get:
 *     summary: Get process policy engine item by ID
 *     tags: [Process Policy Engine]
 */
router.get('/:id', processPolicyEngineController.getById.bind(processPolicyEngineController));

/**
 * @swagger
 * /api/workflow-management/process-policy-engine:
 *   post:
 *     summary: Create new process policy engine item
 *     tags: [Process Policy Engine]
 */
router.post('/', processPolicyEngineController.create.bind(processPolicyEngineController));

export { router as processPolicyEngineRoutes };
export default router;