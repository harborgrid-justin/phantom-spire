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
  // Extended IOC Analytics & Reporting
  getIOCTrendAnalytics,
  getIOCRiskAssessment,
  getIOCPerformanceMetrics,
  getIOCComplianceReport,
  // IOC Intelligence & Enrichment
  getIOCThreatAttribution,
  getIOCOSINTEnrichment,
  getIOCContextualAnalysis,
  getIOCReputationScoring,
  // IOC Operations & Management
  performIOCBatchOperations,
  getIOCLifecycleManagement,
  getIOCDataQuality,
  manageIOCArchive,
  // IOC Integration & Feeds
  getIOCFeedSources,
  getIOCAPIConnectors,
  getIOCFeedManagement,
  performIOCDataSync,
  // IOC Visualization
  getIOCGeolocation,
  getIOCRelationshipNetwork,
  getIOCTimeline,
  getIOCInteractiveDashboard,
  // IOC Workflows
  getIOCPlaybooks,
  getIOCAutomationWorkflows,
  getIOCCaseManagement,
  getIOCInvestigationTools,
  // IOC Collaboration
  getIOCCollaborationWorkspaces,
  manageIOCSharing,
  getIOCCommunityIntelligence,
  getIOCPeerReviews,
  // IOC Advanced Features
  getIOCMLDetection,
  getIOCBehavioralAnalysis,
  getIOCPredictiveIntelligence,
  getIOCCustomRules,
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

// ============================================================================
// EXTENDED IOC ROUTES - 32 Additional Business-Ready Endpoints
// ============================================================================

// IOC Analytics & Reporting (4 routes)
router.get('/analytics/trends', authMiddleware, getIOCTrendAnalytics);
router.get('/analytics/risk-assessment', authMiddleware, getIOCRiskAssessment);
router.get('/analytics/performance', authMiddleware, getIOCPerformanceMetrics);
router.get(
  '/analytics/compliance',
  authMiddleware,
  requireRole(['admin', 'analyst']),
  getIOCComplianceReport
);

// IOC Intelligence & Enrichment (4 routes)
router.get(
  '/intelligence/attribution',
  authMiddleware,
  getIOCThreatAttribution
);
router.get('/intelligence/osint', authMiddleware, getIOCOSINTEnrichment);
router.get('/intelligence/context', authMiddleware, getIOCContextualAnalysis);
router.get('/intelligence/reputation', authMiddleware, getIOCReputationScoring);

// IOC Operations & Management (4 routes)
router.post(
  '/operations/batch',
  authMiddleware,
  requireRole(['admin', 'analyst']),
  performIOCBatchOperations
);
router.get('/operations/lifecycle', authMiddleware, getIOCLifecycleManagement);
router.get('/operations/data-quality', authMiddleware, getIOCDataQuality);
router.post(
  '/operations/archive',
  authMiddleware,
  requireRole(['admin']),
  manageIOCArchive
);

// IOC Integration & Feeds (4 routes)
router.get('/feeds/sources', authMiddleware, getIOCFeedSources);
router.get('/feeds/connectors', authMiddleware, getIOCAPIConnectors);
router.get(
  '/feeds/management',
  authMiddleware,
  requireRole(['admin', 'analyst']),
  getIOCFeedManagement
);
router.post(
  '/feeds/synchronization',
  authMiddleware,
  requireRole(['admin']),
  performIOCDataSync
);

// IOC Visualization (4 routes)
router.get('/visualization/geolocation', authMiddleware, getIOCGeolocation);
router.get(
  '/visualization/relationships',
  authMiddleware,
  getIOCRelationshipNetwork
);
router.get('/visualization/timeline', authMiddleware, getIOCTimeline);
router.get(
  '/visualization/dashboard',
  authMiddleware,
  getIOCInteractiveDashboard
);

// IOC Workflows (4 routes)
router.get('/workflows/playbooks', authMiddleware, getIOCPlaybooks);
router.get('/workflows/automation', authMiddleware, getIOCAutomationWorkflows);
router.get('/workflows/cases', authMiddleware, getIOCCaseManagement);
router.get(
  '/workflows/investigation',
  authMiddleware,
  getIOCInvestigationTools
);

// IOC Collaboration (4 routes)
router.get(
  '/collaboration/workspaces',
  authMiddleware,
  getIOCCollaborationWorkspaces
);
router.post(
  '/collaboration/sharing',
  authMiddleware,
  requireRole(['admin', 'analyst']),
  manageIOCSharing
);
router.get(
  '/collaboration/community',
  authMiddleware,
  getIOCCommunityIntelligence
);
router.get('/collaboration/reviews', authMiddleware, getIOCPeerReviews);

// IOC Advanced Features (4 routes)
router.get(
  '/advanced/ml-detection',
  authMiddleware,
  requireRole(['admin', 'analyst']),
  getIOCMLDetection
);
router.get('/advanced/behavioral', authMiddleware, getIOCBehavioralAnalysis);
router.get(
  '/advanced/predictive',
  authMiddleware,
  requireRole(['admin', 'analyst']),
  getIOCPredictiveIntelligence
);
router.get('/advanced/custom-rules', authMiddleware, getIOCCustomRules);

export default router;
