import { Router } from 'express';
import { workflowEncryptionManagerController } from '../controllers/workflowEncryptionManagerController';

const router = Router();

/**
 * @swagger
 * /api/workflow-management/workflow-encryption-manager:
 *   get:
 *     summary: Get all workflow encryption manager items
 *     tags: [Workflow Encryption Manager]
 *     responses:
 *       200:
 *         description: List of workflow encryption manager items
 */
router.get('/', workflowEncryptionManagerController.getAll.bind(workflowEncryptionManagerController));

/**
 * @swagger
 * /api/workflow-management/workflow-encryption-manager/{id}:
 *   get:
 *     summary: Get workflow encryption manager item by ID
 *     tags: [Workflow Encryption Manager]
 */
router.get('/:id', workflowEncryptionManagerController.getById.bind(workflowEncryptionManagerController));

/**
 * @swagger
 * /api/workflow-management/workflow-encryption-manager:
 *   post:
 *     summary: Create new workflow encryption manager item
 *     tags: [Workflow Encryption Manager]
 */
router.post('/', workflowEncryptionManagerController.create.bind(workflowEncryptionManagerController));

export { router as workflowEncryptionManagerRoutes };
export default router;