import { Router } from 'express';
import { workflowGovernancePortalController } from '../controllers/workflowGovernancePortalController';

const router = Router();

/**
 * @swagger
 * /api/workflow-management/workflow-governance-portal:
 *   get:
 *     summary: Get all workflow governance portal items
 *     tags: [Workflow Governance Portal]
 *     responses:
 *       200:
 *         description: List of workflow governance portal items
 */
router.get('/', workflowGovernancePortalController.getAll.bind(workflowGovernancePortalController));

/**
 * @swagger
 * /api/workflow-management/workflow-governance-portal/{id}:
 *   get:
 *     summary: Get workflow governance portal item by ID
 *     tags: [Workflow Governance Portal]
 */
router.get('/:id', workflowGovernancePortalController.getById.bind(workflowGovernancePortalController));

/**
 * @swagger
 * /api/workflow-management/workflow-governance-portal:
 *   post:
 *     summary: Create new workflow governance portal item
 *     tags: [Workflow Governance Portal]
 */
router.post('/', workflowGovernancePortalController.create.bind(workflowGovernancePortalController));

export { router as workflowGovernancePortalRoutes };
export default router;