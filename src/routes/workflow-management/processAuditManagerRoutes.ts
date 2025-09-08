import { Router } from 'express';
import { processAuditManagerController } from '../controllers/processAuditManagerController';

const router = Router();

/**
 * @swagger
 * /api/workflow-management/process-audit-manager:
 *   get:
 *     summary: Get all process audit manager items
 *     tags: [Process Audit Manager]
 *     responses:
 *       200:
 *         description: List of process audit manager items
 */
router.get('/', processAuditManagerController.getAll.bind(processAuditManagerController));

/**
 * @swagger
 * /api/workflow-management/process-audit-manager/{id}:
 *   get:
 *     summary: Get process audit manager item by ID
 *     tags: [Process Audit Manager]
 */
router.get('/:id', processAuditManagerController.getById.bind(processAuditManagerController));

/**
 * @swagger
 * /api/workflow-management/process-audit-manager:
 *   post:
 *     summary: Create new process audit manager item
 *     tags: [Process Audit Manager]
 */
router.post('/', processAuditManagerController.create.bind(processAuditManagerController));

export { router as processAuditManagerRoutes };
export default router;