/**
 * Cost-Benefit Calculator API Routes
 */

import { Router } from 'express';
import { CostBenefitCalculatorController } from '../../controllers/project-execution/cost-benefit-calculatorController.js';
import { authenticate } from '../../middleware/auth.js';

export function createCostBenefitCalculatorRoutes(): Router {
  const router = Router();
  const controller = new CostBenefitCalculatorController();

  router.get('/', authenticate, controller.getAll);
  router.post('/', authenticate, controller.create);
  router.get('/:id', authenticate, controller.getById);
  router.put('/:id', authenticate, controller.update);
  router.delete('/:id', authenticate, controller.delete);

  return router;
}
