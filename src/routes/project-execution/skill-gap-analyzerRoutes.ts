/**
 * Skill Gap Analyzer API Routes
 */

import { Router } from 'express';
import { SkillGapAnalyzerController } from '../../controllers/project-execution/skill-gap-analyzerController.js';
import { authenticate } from '../../middleware/auth.js';

export function createSkillGapAnalyzerRoutes(): Router {
  const router = Router();
  const controller = new SkillGapAnalyzerController();

  router.get('/', authenticate, controller.getAll);
  router.post('/', authenticate, controller.create);
  router.get('/:id', authenticate, controller.getById);
  router.put('/:id', authenticate, controller.update);
  router.delete('/:id', authenticate, controller.delete);

  return router;
}
