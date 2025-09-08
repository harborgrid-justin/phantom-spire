import { Router } from 'express';
import { workflowSecurityScannerController } from '../controllers/workflowSecurityScannerController';

const router = Router();

/**
 * @swagger
 * /api/workflow-management/workflow-security-scanner:
 *   get:
 *     summary: Get all workflow security scanner items
 *     tags: [Workflow Security Scanner]
 *     responses:
 *       200:
 *         description: List of workflow security scanner items
 */
router.get('/', workflowSecurityScannerController.getAll.bind(workflowSecurityScannerController));

/**
 * @swagger
 * /api/workflow-management/workflow-security-scanner/{id}:
 *   get:
 *     summary: Get workflow security scanner item by ID
 *     tags: [Workflow Security Scanner]
 */
router.get('/:id', workflowSecurityScannerController.getById.bind(workflowSecurityScannerController));

/**
 * @swagger
 * /api/workflow-management/workflow-security-scanner:
 *   post:
 *     summary: Create new workflow security scanner item
 *     tags: [Workflow Security Scanner]
 */
router.post('/', workflowSecurityScannerController.create.bind(workflowSecurityScannerController));

export { router as workflowSecurityScannerRoutes };
export default router;