/**
 * Issue Escalation Matrix API Routes
 */

import { Router } from 'express';
import { IssueEscalationMatrixController } from '../../controllers/project-execution/issue-escalation-matrixController.js';
import { authenticate } from '../../middleware/auth.js';

export function createIssueEscalationMatrixRoutes(): Router {
  const router = Router();
  const controller = new IssueEscalationMatrixController();

  router.get('/', authenticate, controller.getAll);
  router.post('/', authenticate, controller.create);
  router.get('/:id', authenticate, controller.getById);
  router.put('/:id', authenticate, controller.update);
  router.delete('/:id', authenticate, controller.delete);

  return router;
}
