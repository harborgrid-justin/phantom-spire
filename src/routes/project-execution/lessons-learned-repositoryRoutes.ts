/**
 * Lessons Learned Repository API Routes
 */

import { Router } from 'express';
import { LessonsLearnedRepositoryController } from '../../controllers/project-execution/lessons-learned-repositoryController.js';
import { authenticate } from '../../middleware/auth.js';

export function createLessonsLearnedRepositoryRoutes(): Router {
  const router = Router();
  const controller = new LessonsLearnedRepositoryController();

  router.get('/', authenticate, controller.getAll);
  router.post('/', authenticate, controller.create);
  router.get('/:id', authenticate, controller.getById);
  router.put('/:id', authenticate, controller.update);
  router.delete('/:id', authenticate, controller.delete);

  return router;
}
