/**
 * Budget Forecasting Engine API Routes
 */

import { Router } from 'express';
import { BudgetForecastingEngineController } from '../../controllers/project-execution/budget-forecasting-engineController.js';
import { authenticate } from '../../middleware/auth.js';

export function createBudgetForecastingEngineRoutes(): Router {
  const router = Router();
  const controller = new BudgetForecastingEngineController();

  router.get('/', authenticate, controller.getAll);
  router.post('/', authenticate, controller.create);
  router.get('/:id', authenticate, controller.getById);
  router.put('/:id', authenticate, controller.update);
  router.delete('/:id', authenticate, controller.delete);

  return router;
}
