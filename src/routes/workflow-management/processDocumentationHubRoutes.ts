import { Router } from 'express';
import { processDocumentationHubController } from '../controllers/processDocumentationHubController';

const router = Router();

/**
 * @swagger
 * /api/workflow-management/process-documentation-hub:
 *   get:
 *     summary: Get all process documentation hub items
 *     tags: [Process Documentation Hub]
 *     responses:
 *       200:
 *         description: List of process documentation hub items
 */
router.get('/', processDocumentationHubController.getAll.bind(processDocumentationHubController));

/**
 * @swagger
 * /api/workflow-management/process-documentation-hub/{id}:
 *   get:
 *     summary: Get process documentation hub item by ID
 *     tags: [Process Documentation Hub]
 */
router.get('/:id', processDocumentationHubController.getById.bind(processDocumentationHubController));

/**
 * @swagger
 * /api/workflow-management/process-documentation-hub:
 *   post:
 *     summary: Create new process documentation hub item
 *     tags: [Process Documentation Hub]
 */
router.post('/', processDocumentationHubController.create.bind(processDocumentationHubController));

export { router as processDocumentationHubRoutes };
export default router;