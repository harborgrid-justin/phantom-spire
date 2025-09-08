/**
 * Vendor Resource Manager API Routes
 */

import { Router } from 'express';
import { VendorResourceManagerController } from '../../controllers/project-execution/vendor-resource-managerController.js';
import { authenticate } from '../../middleware/auth.js';

export function createVendorResourceManagerRoutes(): Router {
  const router = Router();
  const controller = new VendorResourceManagerController();

  router.get('/', authenticate, controller.getAll);
  router.post('/', authenticate, controller.create);
  router.get('/:id', authenticate, controller.getById);
  router.put('/:id', authenticate, controller.update);
  router.delete('/:id', authenticate, controller.delete);

  return router;
}
