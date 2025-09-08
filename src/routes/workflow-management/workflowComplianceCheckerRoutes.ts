import { Router } from 'express';
import { workflowComplianceCheckerController } from '../controllers/workflowComplianceCheckerController';

const router = Router();

/**
 * @swagger
 * /api/workflow-management/workflow-compliance-checker:
 *   get:
 *     summary: Get all workflow compliance checker items
 *     tags: [Workflow Compliance Checker]
 *     responses:
 *       200:
 *         description: List of workflow compliance checker items
 */
router.get('/', workflowComplianceCheckerController.getAll.bind(workflowComplianceCheckerController));

/**
 * @swagger
 * /api/workflow-management/workflow-compliance-checker/{id}:
 *   get:
 *     summary: Get workflow compliance checker item by ID
 *     tags: [Workflow Compliance Checker]
 */
router.get('/:id', workflowComplianceCheckerController.getById.bind(workflowComplianceCheckerController));

/**
 * @swagger
 * /api/workflow-management/workflow-compliance-checker:
 *   post:
 *     summary: Create new workflow compliance checker item
 *     tags: [Workflow Compliance Checker]
 */
router.post('/', workflowComplianceCheckerController.create.bind(workflowComplianceCheckerController));

export { router as workflowComplianceCheckerRoutes };
export default router;