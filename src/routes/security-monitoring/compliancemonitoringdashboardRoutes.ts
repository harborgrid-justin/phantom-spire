import { Router } from 'express';
import { ComplianceMonitoringDashboardBusinessLogic } from '../services/business-logic/modules/security-monitoring/ComplianceMonitoringDashboardBusinessLogic.js';
import { authMiddleware } from '../middleware/auth.js';
import { validationMiddleware } from '../middleware/validation.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { logger } from '../utils/logger.js';

const router = Router();
const businessLogic = new ComplianceMonitoringDashboardBusinessLogic();

/**
 * @swagger
 * /api/v1/security-monitoring/compliancemonitoringdashboard:
 *   get:
 *     summary: List security monitoring items
 *     tags: [security-monitoring]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [active, pending, completed, failed]
 *         description: Filter by status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [low, medium, high, critical]
 *         description: Filter by priority
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *     responses:
 *       200:
 *         description: List of security monitoring items
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/', authMiddleware, asyncHandler(async (req, res) => {
  const { page, limit, status, priority, search, sortField, sortDirection } = req.query;

  const filters = {
    status: status ? (Array.isArray(status) ? status : [status]) : undefined,
    priority: priority ? (Array.isArray(priority) ? priority : [priority]) : undefined,
    searchTerm: search as string
  };

  const sort = sortField ? {
    field: sortField as any,
    direction: (sortDirection as 'asc' | 'desc') || 'desc'
  } : undefined;

  const pagination = {
    page: parseInt(page as string) || 1,
    limit: parseInt(limit as string) || 25
  };

  const result = await businessLogic.list(filters, sort, pagination);
  
  res.json({
    success: true,
    data: result
  });
}));

/**
 * @swagger
 * /api/v1/security-monitoring/compliancemonitoringdashboard:
 *   post:
 *     summary: Create new security monitoring item
 *     tags: [security-monitoring]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Item name
 *               status:
 *                 type: string
 *                 enum: [active, pending, completed, failed]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *               metadata:
 *                 type: object
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               owner:
 *                 type: string
 *     responses:
 *       201:
 *         description: Item created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Item already exists
 *       500:
 *         description: Internal server error
 */
router.post('/', authMiddleware, validationMiddleware, asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const item = await businessLogic.create(req.body, userId);
  
  res.status(201).json({
    success: true,
    data: item
  });
}));

/**
 * @swagger
 * /api/v1/security-monitoring/compliancemonitoringdashboard/{id}:
 *   get:
 *     summary: Get security monitoring item by ID
 *     tags: [security-monitoring]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Item ID
 *     responses:
 *       200:
 *         description: Item details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Item not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', authMiddleware, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const item = await businessLogic.getById(id);
  
  if (!item) {
    return res.status(404).json({
      success: false,
      error: 'Item not found'
    });
  }
  
  res.json({
    success: true,
    data: item
  });
}));

/**
 * @swagger
 * /api/v1/security-monitoring/compliancemonitoringdashboard/{id}:
 *   put:
 *     summary: Update security monitoring item
 *     tags: [security-monitoring]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, pending, completed, failed]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *               metadata:
 *                 type: object
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               owner:
 *                 type: string
 *     responses:
 *       200:
 *         description: Item updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Item not found
 *       409:
 *         description: Conflict
 *       500:
 *         description: Internal server error
 */
router.put('/:id', authMiddleware, validationMiddleware, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const item = await businessLogic.update(id, req.body, userId);
  
  res.json({
    success: true,
    data: item
  });
}));

/**
 * @swagger
 * /api/v1/security-monitoring/compliancemonitoringdashboard/{id}:
 *   delete:
 *     summary: Delete security monitoring item
 *     tags: [security-monitoring]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Item ID
 *     responses:
 *       200:
 *         description: Item deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Item not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authMiddleware, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;
  await businessLogic.delete(id, userId);
  
  res.json({
    success: true,
    message: 'Item deleted successfully'
  });
}));

/**
 * @swagger
 * /api/v1/security-monitoring/compliancemonitoringdashboard/analytics:
 *   get:
 *     summary: Get security monitoring analytics
 *     tags: [security-monitoring]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/analytics', authMiddleware, asyncHandler(async (req, res) => {
  const analytics = await businessLogic.getAnalytics();
  
  res.json({
    success: true,
    data: analytics
  });
}));

/**
 * @swagger
 * /api/v1/security-monitoring/compliancemonitoringdashboard/bulk:
 *   put:
 *     summary: Bulk update security monitoring items
 *     tags: [security-monitoring]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ids
 *               - update
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *               update:
 *                 type: object
 *                 properties:
 *                   status:
 *                     type: string
 *                     enum: [active, pending, completed, failed]
 *                   priority:
 *                     type: string
 *                     enum: [low, medium, high, critical]
 *                   tags:
 *                     type: array
 *                     items:
 *                       type: string
 *     responses:
 *       200:
 *         description: Bulk update completed
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.put('/bulk', authMiddleware, validationMiddleware, asyncHandler(async (req, res) => {
  const { ids, update } = req.body;
  const userId = req.user?.id;
  const updatedCount = await businessLogic.bulkUpdate(ids, update, userId);
  
  res.json({
    success: true,
    data: {
      updatedCount
    }
  });
}));

export default router;
