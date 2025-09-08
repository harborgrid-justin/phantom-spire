import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { privilegeEscalationControlController } from '../controllers/privilegeEscalationControlController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Privilege Escalation Control
 *   description: Temporary privilege escalation and time-based access
 */

// GET /api/user-management/privilege-escalation-control - Get all items
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['active', 'pending', 'inactive', 'suspended', 'draft']),
    validateRequest
  ],
  privilegeEscalationControlController.getAllPrivilegeEscalationControl
);

// POST /api/user-management/privilege-escalation-control - Create new item
router.post(
  '/',
  [
    body('name').isString().trim().isLength({ min: 1, max: 200 }),
    body('description').optional().isString().trim().isLength({ max: 1000 }),
    body('status').optional().isIn(['active', 'pending', 'inactive', 'suspended', 'draft']),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('metadata').optional().isObject(),
    validateRequest
  ],
  privilegeEscalationControlController.createPrivilegeEscalationControl
);

// GET /api/user-management/privilege-escalation-control/:id - Get item by ID
router.get(
  '/:id',
  [
    param('id').isString().trim().notEmpty(),
    validateRequest
  ],
  privilegeEscalationControlController.getPrivilegeEscalationControlById
);

// PUT /api/user-management/privilege-escalation-control/:id - Update item
router.put(
  '/:id',
  [
    param('id').isString().trim().notEmpty(),
    body('name').optional().isString().trim().isLength({ min: 1, max: 200 }),
    body('description').optional().isString().trim().isLength({ max: 1000 }),
    body('status').optional().isIn(['active', 'pending', 'inactive', 'suspended', 'draft']),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('metadata').optional().isObject(),
    validateRequest
  ],
  privilegeEscalationControlController.updatePrivilegeEscalationControl
);

// DELETE /api/user-management/privilege-escalation-control/:id - Delete item
router.delete(
  '/:id',
  [
    param('id').isString().trim().notEmpty(),
    validateRequest
  ],
  privilegeEscalationControlController.deletePrivilegeEscalationControl
);

export { router as privilegeEscalationControlRoutes };
