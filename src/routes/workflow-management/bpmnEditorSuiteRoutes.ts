import { Router } from 'express';
import { bpmnEditorSuiteController } from '../controllers/bpmnEditorSuiteController';

const router = Router();

/**
 * @swagger
 * /api/workflow-management/bpmn-editor-suite:
 *   get:
 *     summary: Get all bpmn editor suite items
 *     tags: [BPMN Editor Suite]
 *     responses:
 *       200:
 *         description: List of bpmn editor suite items
 */
router.get('/', bpmnEditorSuiteController.getAll.bind(bpmnEditorSuiteController));

/**
 * @swagger
 * /api/workflow-management/bpmn-editor-suite/{id}:
 *   get:
 *     summary: Get bpmn editor suite item by ID
 *     tags: [BPMN Editor Suite]
 */
router.get('/:id', bpmnEditorSuiteController.getById.bind(bpmnEditorSuiteController));

/**
 * @swagger
 * /api/workflow-management/bpmn-editor-suite:
 *   post:
 *     summary: Create new bpmn editor suite item
 *     tags: [BPMN Editor Suite]
 */
router.post('/', bpmnEditorSuiteController.create.bind(bpmnEditorSuiteController));

export { router as bpmnEditorSuiteRoutes };
export default router;