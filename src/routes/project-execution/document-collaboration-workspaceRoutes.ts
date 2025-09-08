/**
 * Document Collaboration Workspace API Routes
 */

import { Router } from 'express';
import { DocumentCollaborationWorkspaceController } from '../../controllers/project-execution/document-collaboration-workspaceController.js';
import { authenticate } from '../../middleware/auth.js';

export function createDocumentCollaborationWorkspaceRoutes(): Router {
  const router = Router();
  const controller = new DocumentCollaborationWorkspaceController();

  router.get('/', authenticate, controller.getAll);
  router.post('/', authenticate, controller.create);
  router.get('/:id', authenticate, controller.getById);
  router.put('/:id', authenticate, controller.update);
  router.delete('/:id', authenticate, controller.delete);

  return router;
}
