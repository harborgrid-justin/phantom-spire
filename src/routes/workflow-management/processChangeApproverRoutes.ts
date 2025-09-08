import { Router } from 'express';
import { processChangeApproverController } from '../controllers/processChangeApproverController';

const router = Router();

/**
 * @swagger
 * /api/workflow-management/process-change-approver:
 *   get:
 *     summary: Get all process change approver items
 *     tags: [Process Change Approver]
 *     responses:
 *       200:
 *         description: List of process change approver items
 */
router.get('/', processChangeApproverController.getAll.bind(processChangeApproverController));

/**
 * @swagger
 * /api/workflow-management/process-change-approver/{id}:
 *   get:
 *     summary: Get process change approver item by ID
 *     tags: [Process Change Approver]
 */
router.get('/:id', processChangeApproverController.getById.bind(processChangeApproverController));

/**
 * @swagger
 * /api/workflow-management/process-change-approver:
 *   post:
 *     summary: Create new process change approver item
 *     tags: [Process Change Approver]
 */
router.post('/', processChangeApproverController.create.bind(processChangeApproverController));

export { router as processChangeApproverRoutes };
export default router;