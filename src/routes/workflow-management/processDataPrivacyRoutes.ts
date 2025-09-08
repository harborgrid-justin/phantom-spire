import { Router } from 'express';
import { processDataPrivacyController } from '../controllers/processDataPrivacyController';

const router = Router();

/**
 * @swagger
 * /api/workflow-management/process-data-privacy:
 *   get:
 *     summary: Get all process data privacy items
 *     tags: [Process Data Privacy]
 *     responses:
 *       200:
 *         description: List of process data privacy items
 */
router.get('/', processDataPrivacyController.getAll.bind(processDataPrivacyController));

/**
 * @swagger
 * /api/workflow-management/process-data-privacy/{id}:
 *   get:
 *     summary: Get process data privacy item by ID
 *     tags: [Process Data Privacy]
 */
router.get('/:id', processDataPrivacyController.getById.bind(processDataPrivacyController));

/**
 * @swagger
 * /api/workflow-management/process-data-privacy:
 *   post:
 *     summary: Create new process data privacy item
 *     tags: [Process Data Privacy]
 */
router.post('/', processDataPrivacyController.create.bind(processDataPrivacyController));

export { router as processDataPrivacyRoutes };
export default router;