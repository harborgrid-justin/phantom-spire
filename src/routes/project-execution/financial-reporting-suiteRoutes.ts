/**
 * Financial Reporting Suite API Routes
 */

import { Router } from 'express';
import { FinancialReportingSuiteController } from '../../controllers/project-execution/financial-reporting-suiteController.js';
import { authenticate } from '../../middleware/auth.js';

export function createFinancialReportingSuiteRoutes(): Router {
  const router = Router();
  const controller = new FinancialReportingSuiteController();

  router.get('/', authenticate, controller.getAll);
  router.post('/', authenticate, controller.create);
  router.get('/:id', authenticate, controller.getById);
  router.put('/:id', authenticate, controller.update);
  router.delete('/:id', authenticate, controller.delete);

  return router;
}
