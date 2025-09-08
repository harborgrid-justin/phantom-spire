/**
 * Expense Approval Workflow API Routes
 */

import { Router } from 'express';
import { ExpenseApprovalWorkflowController } from '../../controllers/project-execution/expense-approval-workflowController.js';
import { authenticate } from '../../middleware/auth.js';

export function createExpenseApprovalWorkflowRoutes(): Router {
  const router = Router();
  const controller = new ExpenseApprovalWorkflowController();

  router.get('/', authenticate, controller.getAll);
  router.post('/', authenticate, controller.create);
  router.get('/:id', authenticate, controller.getById);
  router.put('/:id', authenticate, controller.update);
  router.delete('/:id', authenticate, controller.delete);

  return router;
}
