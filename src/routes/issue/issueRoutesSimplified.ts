/**
 * Simplified Issue Routes
 * Fortune 100-Grade Issue & Ticket Tracker API Routes (Core Features)
 */

import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { IssueController } from '../../controllers/issue/IssueControllerSimplified.js';
import { authMiddleware } from '../../middleware/auth.js';

const router = Router();
const issueController = new IssueController();

// Apply authentication to all issue routes
router.use(authMiddleware);

/**
 * @swagger
 * /api/v1/issues:
 *   post:
 *     summary: Create a new issue
 *     tags: [Issues]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - issueType
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               issueType:
 *                 type: string
 *                 enum: [bug, feature, incident, vulnerability, threat, investigation, compliance, enhancement]
 *               priority:
 *                 type: string
 *                 enum: [critical, high, medium, low]
 *               severity:
 *                 type: string
 *                 enum: [critical, major, minor, cosmetic]
 *               threatLevel:
 *                 type: string
 *                 enum: [critical, high, medium, low]
 *     responses:
 *       201:
 *         description: Issue created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title must be 1-200 characters'),
  body('description').trim().isLength({ min: 1, max: 5000 }).withMessage('Description must be 1-5000 characters'),
  body('issueType').isIn(['bug', 'feature', 'incident', 'vulnerability', 'threat', 'investigation', 'compliance', 'enhancement'])
    .withMessage('Invalid issue type'),
  body('priority').optional().isIn(['critical', 'high', 'medium', 'low']).withMessage('Invalid priority'),
  body('severity').optional().isIn(['critical', 'major', 'minor', 'cosmetic']).withMessage('Invalid severity'),
  body('threatLevel').optional().isIn(['critical', 'high', 'medium', 'low']).withMessage('Invalid threat level'),
], issueController.createIssue);

/**
 * @swagger
 * /api/v1/issues/search:
 *   get:
 *     summary: Search issues with advanced filtering
 *     tags: [Issues]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Text search query
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *         description: Filter by priority
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/search', issueController.searchIssues);

/**
 * @swagger
 * /api/v1/issues/metrics:
 *   get:
 *     summary: Get issue metrics and statistics
 *     tags: [Issues]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Issue metrics
 */
router.get('/metrics', issueController.getIssueMetrics);

/**
 * @swagger
 * /api/v1/issues/{issueId}:
 *   get:
 *     summary: Get issue by ID
 *     tags: [Issues]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: issueId
 *         required: true
 *         schema:
 *           type: string
 *         description: Issue ID
 *     responses:
 *       200:
 *         description: Issue retrieved successfully
 *       404:
 *         description: Issue not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/:issueId', [
  param('issueId').isString().withMessage('Issue ID must be a string'),
], issueController.getIssue);

/**
 * @swagger
 * /api/v1/issues/{issueId}:
 *   put:
 *     summary: Update an issue
 *     tags: [Issues]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: issueId
 *         required: true
 *         schema:
 *           type: string
 *         description: Issue ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [open, in_progress, on_hold, resolved, closed, rejected, escalated]
 *               priority:
 *                 type: string
 *                 enum: [critical, high, medium, low]
 *     responses:
 *       200:
 *         description: Issue updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Issue not found
 */
router.put('/:issueId', [
  param('issueId').isString().withMessage('Issue ID must be a string'),
  body('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Title must be 1-200 characters'),
  body('description').optional().trim().isLength({ min: 1, max: 5000 }).withMessage('Description must be 1-5000 characters'),
], issueController.updateIssue);

/**
 * @swagger
 * /api/v1/issues/{issueId}/comments:
 *   post:
 *     summary: Add comment to issue
 *     tags: [Issues]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: issueId
 *         required: true
 *         schema:
 *           type: string
 *         description: Issue ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *               isInternal:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Comment added successfully
 */
router.post('/:issueId/comments', [
  param('issueId').isString().withMessage('Issue ID must be a string'),
  body('content').trim().isLength({ min: 1 }).withMessage('Content is required'),
  body('isInternal').optional().isBoolean().withMessage('Is internal must be boolean'),
], issueController.addComment);

export default router;
