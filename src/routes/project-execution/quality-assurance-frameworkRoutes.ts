/**
 * Quality Assurance Framework API Routes
 */

import { Router } from 'express';
import { QualityAssuranceFrameworkController } from '../../controllers/project-execution/quality-assurance-frameworkController.js';
import { authenticate } from '../../middleware/auth.js';

export function createQualityAssuranceFrameworkRoutes(): Router {
  const router = Router();
  const controller = new QualityAssuranceFrameworkController();

  router.get('/', authenticate, controller.getAll);
  router.post('/', authenticate, controller.create);
  router.get('/:id', authenticate, controller.getById);
  router.put('/:id', authenticate, controller.update);
  router.delete('/:id', authenticate, controller.delete);

  return router;
}
