/**
 * Risk Heat Map Analyzer API Routes
 */

import { Router } from 'express';
import { RiskHeatMapAnalyzerController } from '../../controllers/project-execution/risk-heat-map-analyzerController.js';
import { authenticate } from '../../middleware/auth.js';

export function createRiskHeatMapAnalyzerRoutes(): Router {
  const router = Router();
  const controller = new RiskHeatMapAnalyzerController();

  router.get('/', authenticate, controller.getAll);
  router.post('/', authenticate, controller.create);
  router.get('/:id', authenticate, controller.getById);
  router.put('/:id', authenticate, controller.update);
  router.delete('/:id', authenticate, controller.delete);

  return router;
}
