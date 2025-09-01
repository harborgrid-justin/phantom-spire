import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  getIOCs,
  getIOCById,
  createIOC,
  updateIOC,
  deleteIOC,
  analyzeIOC,
  enrichIOC,
  batchValidateIOCs,
  getIOCStatistics,
  getDashboardStats,
  getTrendAnalysis,
  getQualityReport,
} from '../controllers/iocController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

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
router.get('/statistics', authMiddleware, getIOCStatistics);
router.get('/dashboard', authMiddleware, getDashboardStats);
router.get('/trends', authMiddleware, getTrendAnalysis);
router.get(
  '/quality-report',
  authMiddleware,
  requireRole(['admin', 'analyst']),
  getQualityReport
);

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

router.post(
  '/batch/validate',
  authMiddleware,
  requireRole(['admin', 'analyst']),
  body('iocs').isArray().withMessage('IOCs array is required'),
  validateRequest,
  batchValidateIOCs
);

router.post(
  '/:id/analyze',
  authMiddleware,
  requireRole(['admin', 'analyst']),
  param('id').isMongoId(),
  validateRequest,
  analyzeIOC
);

router.post(
  '/:id/enrich',
  authMiddleware,
  requireRole(['admin', 'analyst']),
  param('id').isMongoId(),
  validateRequest,
  enrichIOC
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
