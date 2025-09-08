import { Router } from 'express';
import { workflowComplianceMonitorController } from '../controllers/workflowComplianceMonitorController';

const router = Router();

/**
 * @swagger
 * /api/workflow-management/workflow-compliance-monitor:
 *   get:
 *     summary: Get all workflow compliance monitor items
 *     tags: [Workflow Compliance Monitor]
 *     responses:
 *       200:
 *         description: List of workflow compliance monitor items
 */
router.get('/', workflowComplianceMonitorController.getAll.bind(workflowComplianceMonitorController));

/**
 * @swagger
 * /api/workflow-management/workflow-compliance-monitor/{id}:
 *   get:
 *     summary: Get workflow compliance monitor item by ID
 *     tags: [Workflow Compliance Monitor]
 */
router.get('/:id', workflowComplianceMonitorController.getById.bind(workflowComplianceMonitorController));

/**
 * @swagger
 * /api/workflow-management/workflow-compliance-monitor:
 *   post:
 *     summary: Create new workflow compliance monitor item
 *     tags: [Workflow Compliance Monitor]
 */
router.post('/', workflowComplianceMonitorController.create.bind(workflowComplianceMonitorController));

export { router as workflowComplianceMonitorRoutes };
export default router;