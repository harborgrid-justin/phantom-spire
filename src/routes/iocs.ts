import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  getIOCs,
  getIOCById,
  createIOC,
  updateIOC,
  deleteIOC,
} from '../controllers/iocController';
import { authMiddleware, requireRole } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: IOCs
 *   description: Indicators of Compromise management
 */

// Validation rules
const createIOCValidation = [
  body('value').trim().notEmpty().withMessage('IOC value is required'),
  body('type').isIn(['ip', 'domain', 'url', 'hash', 'email']),
  body('confidence').isInt({ min: 0, max: 100 }),
  body('severity').isIn(['low', 'medium', 'high', 'critical']),
  body('source').trim().notEmpty(),
  body('tags').optional().isArray(),
  body('description').optional().trim(),
];

const updateIOCValidation = [
  param('id').isMongoId(),
  body('value').optional().trim().notEmpty(),
  body('type').optional().isIn(['ip', 'domain', 'url', 'hash', 'email']),
  body('confidence').optional().isInt({ min: 0, max: 100 }),
  body('severity').optional().isIn(['low', 'medium', 'high', 'critical']),
  body('tags').optional().isArray(),
  body('isActive').optional().isBoolean(),
];

// Routes
router.get('/', authMiddleware, getIOCs);
router.get(
  '/:id',
  authMiddleware,
  param('id').isMongoId(),
  validateRequest,
  getIOCById
);
router.post(
  '/',
  authMiddleware,
  requireRole(['admin', 'analyst']),
  createIOCValidation,
  validateRequest,
  createIOC
);
router.put(
  '/:id',
  authMiddleware,
  requireRole(['admin', 'analyst']),
  updateIOCValidation,
  validateRequest,
  updateIOC
);
router.delete(
  '/:id',
  authMiddleware,
  requireRole(['admin']),
  param('id').isMongoId(),
  validateRequest,
  deleteIOC
);

export default router;
