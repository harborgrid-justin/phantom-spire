/**
 * Compliance Checklist Manager API Routes
 */

import { Router } from 'express';
import { ComplianceChecklistManagerController } from '../../controllers/project-execution/compliance-checklist-managerController.js';
import { authenticate } from '../../middleware/auth.js';

export function createComplianceChecklistManagerRoutes(): Router {
  const router = Router();
  const controller = new ComplianceChecklistManagerController();

  router.get('/', authenticate, controller.getAll);
  router.post('/', authenticate, controller.create);
  router.get('/:id', authenticate, controller.getById);
  router.put('/:id', authenticate, controller.update);
  router.delete('/:id', authenticate, controller.delete);

  return router;
}
