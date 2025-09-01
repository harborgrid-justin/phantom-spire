/**
 * Issue Routes
 * Fortune 100-Grade Issue & Ticket Tracker API Routes
 */

import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { IssueController } from '../../controllers/issue/IssueController.js';
import { authMiddleware } from '../../middleware/auth.js';

const router = Router();
const issueController = new IssueController();

// Apply authentication to all issue routes
router.use(authMiddleware);

/**
 * @swagger
 * components:
 *   schemas:
 *     Issue:
 *       type: object
 *       required:
 *         - ticketId
 *         - title
 *         - description
 *         - issueType
 *         - reporter
 *       properties:
 *         ticketId:
 *           type: string
 *           description: Unique ticket identifier
 *         title:
 *           type: string
 *           description: Issue title
 *         description:
 *           type: string
 *           description: Detailed issue description
 *         issueType:
 *           type: string
 *           enum: [bug, feature, incident, vulnerability, threat, investigation, compliance, enhancement]
 *         status:
 *           type: string
 *           enum: [open, in_progress, on_hold, resolved, closed, rejected, escalated]
 *         priority:
 *           type: string
 *           enum: [critical, high, medium, low]
 *         severity:
 *           type: string
 *           enum: [critical, major, minor, cosmetic]
 *         assignee:
 *           type: string
 *           description: Assigned user ID
 *         reporter:
 *           type: string
 *           description: Reporter user ID
 *         threatLevel:
 *           type: string
 *           enum: [critical, high, medium, low]
 *         affectedSystems:
 *           type: array
 *           items:
 *             type: string
 *         relatedIOCs:
 *           type: array
 *           items:
 *             type: string
 *         relatedAlerts:
 *           type: array
 *           items:
 *             type: string
 *         relatedTasks:
 *           type: array
 *           items:
 *             type: string
 *         labels:
 *           type: array
 *           items:
 *             type: string
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         dueDate:
 *           type: string
 *           format: date-time
 *         securityClassification:
 *           type: string
 *           enum: [public, internal, confidential, restricted]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

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
 *                 maxLength: 200
 *               description:
 *                 type: string
 *                 maxLength: 5000
 *               issueType:
 *                 type: string
 *                 enum: [bug, feature, incident, vulnerability, threat, investigation, compliance, enhancement]
 *               priority:
 *                 type: string
 *                 enum: [critical, high, medium, low]
 *               severity:
 *                 type: string
 *                 enum: [critical, major, minor, cosmetic]
 *               assignee:
 *                 type: string
 *               threatLevel:
 *                 type: string
 *                 enum: [critical, high, medium, low]
 *               affectedSystems:
 *                 type: array
 *                 items:
 *                   type: string
 *               relatedIOCs:
 *                 type: array
 *                 items:
 *                   type: string
 *               relatedAlerts:
 *                 type: array
 *                 items:
 *                   type: string
 *               labels:
 *                 type: array
 *                 items:
 *                   type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               securityClassification:
 *                 type: string
 *                 enum: [public, internal, confidential, restricted]
 *               complianceRequirements:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Issue created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Issue'
 *                 message:
 *                   type: string
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
  body('securityClassification').optional().isIn(['public', 'internal', 'confidential', 'restricted'])
    .withMessage('Invalid security classification'),
  body('affectedSystems').optional().isArray().withMessage('Affected systems must be an array'),
  body('relatedIOCs').optional().isArray().withMessage('Related IOCs must be an array'),
  body('relatedAlerts').optional().isArray().withMessage('Related alerts must be an array'),
  body('labels').optional().isArray().withMessage('Labels must be an array'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('complianceRequirements').optional().isArray().withMessage('Compliance requirements must be an array'),
  body('dueDate').optional().isISO8601().withMessage('Due date must be valid ISO 8601 date'),
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
 *           type: array
 *           items:
 *             type: string
 *             enum: [open, in_progress, on_hold, resolved, closed, rejected, escalated]
 *         description: Filter by status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [critical, high, medium, low]
 *         description: Filter by priority
 *       - in: query
 *         name: issueType
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [bug, feature, incident, vulnerability, threat, investigation, compliance, enhancement]
 *         description: Filter by issue type
 *       - in: query
 *         name: assignee
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Filter by assignee
 *       - in: query
 *         name: threatLevel
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [critical, high, medium, low]
 *         description: Filter by threat level
 *       - in: query
 *         name: labels
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Filter by labels
 *       - in: query
 *         name: tags
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Filter by tags
 *       - in: query
 *         name: createdAfter
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter by creation date (after)
 *       - in: query
 *         name: createdBefore
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter by creation date (before)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: updatedAt
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Items per page
 *       - in: query
 *         name: includeResolved
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include resolved/closed issues
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     issues:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Issue'
 *                     totalCount:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 */
router.get('/search', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
  query('includeResolved').optional().isBoolean().withMessage('Include resolved must be boolean'),
], issueController.searchIssues);

/**
 * @swagger
 * /api/v1/issues/metrics:
 *   get:
 *     summary: Get issue metrics and statistics
 *     tags: [Issues]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Filter metrics by status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Filter metrics by priority
 *       - in: query
 *         name: issueType
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Filter metrics by type
 *     responses:
 *       200:
 *         description: Issue metrics
 */
router.get('/metrics', issueController.getIssueMetrics);

/**
 * @swagger
 * /api/v1/issues/analytics:
 *   get:
 *     summary: Get issue analytics for date range
 *     tags: [Issues]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for analytics
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for analytics
 *     responses:
 *       200:
 *         description: Issue analytics
 */
router.get('/analytics', [
  query('startDate').isISO8601().withMessage('Start date must be valid ISO 8601 date'),
  query('endDate').isISO8601().withMessage('End date must be valid ISO 8601 date'),
], issueController.getIssueAnalytics);

/**
 * @swagger
 * /api/v1/issues/bulk/update:
 *   put:
 *     summary: Bulk update multiple issues
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
 *               - issueIds
 *               - updates
 *             properties:
 *               issueIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               updates:
 *                 type: object
 *                 properties:
 *                   status:
 *                     type: string
 *                   priority:
 *                     type: string
 *                   assignee:
 *                     type: string
 *                   labels:
 *                     type: array
 *                     items:
 *                       type: string
 *                   tags:
 *                     type: array
 *                     items:
 *                       type: string
 *     responses:
 *       200:
 *         description: Issues updated successfully
 */
router.put('/bulk/update', [
  body('issueIds').isArray({ min: 1 }).withMessage('Issue IDs must be a non-empty array'),
  body('issueIds.*').isString().withMessage('Each issue ID must be a string'),
], issueController.bulkUpdateIssues);

/**
 * @swagger
 * /api/v1/issues/bulk/assign:
 *   put:
 *     summary: Bulk assign multiple issues
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
 *               - issueIds
 *               - assigneeId
 *             properties:
 *               issueIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               assigneeId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Issues assigned successfully
 */
router.put('/bulk/assign', [
  body('issueIds').isArray({ min: 1 }).withMessage('Issue IDs must be a non-empty array'),
  body('issueIds.*').isString().withMessage('Each issue ID must be a string'),
  body('assigneeId').isString().withMessage('Assignee ID must be a string'),
], issueController.bulkAssignIssues);

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Issue'
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
 *                 maxLength: 200
 *               description:
 *                 type: string
 *                 maxLength: 5000
 *               status:
 *                 type: string
 *                 enum: [open, in_progress, on_hold, resolved, closed, rejected, escalated]
 *               priority:
 *                 type: string
 *                 enum: [critical, high, medium, low]
 *               severity:
 *                 type: string
 *                 enum: [critical, major, minor, cosmetic]
 *               assignee:
 *                 type: string
 *               threatLevel:
 *                 type: string
 *                 enum: [critical, high, medium, low]
 *               affectedSystems:
 *                 type: array
 *                 items:
 *                   type: string
 *               relatedIOCs:
 *                 type: array
 *                 items:
 *                   type: string
 *               relatedAlerts:
 *                 type: array
 *                 items:
 *                   type: string
 *               labels:
 *                 type: array
 *                 items:
 *                   type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Issue updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Issue not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put('/:issueId', [
  param('issueId').isString().withMessage('Issue ID must be a string'),
  body('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Title must be 1-200 characters'),
  body('description').optional().trim().isLength({ min: 1, max: 5000 }).withMessage('Description must be 1-5000 characters'),
  body('status').optional().isIn(['open', 'in_progress', 'on_hold', 'resolved', 'closed', 'rejected', 'escalated'])
    .withMessage('Invalid status'),
  body('priority').optional().isIn(['critical', 'high', 'medium', 'low']).withMessage('Invalid priority'),
  body('severity').optional().isIn(['critical', 'major', 'minor', 'cosmetic']).withMessage('Invalid severity'),
  body('threatLevel').optional().isIn(['critical', 'high', 'medium', 'low']).withMessage('Invalid threat level'),
], issueController.updateIssue);

/**
 * @swagger
 * /api/v1/issues/{issueId}:
 *   delete:
 *     summary: Delete an issue
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
 *         description: Issue deleted successfully
 *       404:
 *         description: Issue not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete('/:issueId', [
  param('issueId').isString().withMessage('Issue ID must be a string'),
], issueController.deleteIssue);

/**
 * @swagger
 * /api/v1/issues/{issueId}/status:
 *   put:
 *     summary: Transition issue status
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [open, in_progress, on_hold, resolved, closed, rejected, escalated]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status transitioned successfully
 *       400:
 *         description: Invalid transition
 */
router.put('/:issueId/status', [
  param('issueId').isString().withMessage('Issue ID must be a string'),
  body('status').isIn(['open', 'in_progress', 'on_hold', 'resolved', 'closed', 'rejected', 'escalated'])
    .withMessage('Invalid status'),
  body('notes').optional().isString().withMessage('Notes must be a string'),
], issueController.transitionStatus);

/**
 * @swagger
 * /api/v1/issues/{issueId}/transitions:
 *   get:
 *     summary: Get available status transitions for issue
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
 *         description: Available transitions
 */
router.get('/:issueId/transitions', [
  param('issueId').isString().withMessage('Issue ID must be a string'),
], issueController.getAvailableTransitions);

/**
 * @swagger
 * /api/v1/issues/{issueId}/assign:
 *   put:
 *     summary: Assign issue to user
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
 *               - assigneeId
 *             properties:
 *               assigneeId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Issue assigned successfully
 */
router.put('/:issueId/assign', [
  param('issueId').isString().withMessage('Issue ID must be a string'),
  body('assigneeId').isString().withMessage('Assignee ID must be a string'),
], issueController.assignIssue);

/**
 * @swagger
 * /api/v1/issues/{issueId}/unassign:
 *   put:
 *     summary: Unassign issue
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
 *         description: Issue unassigned successfully
 */
router.put('/:issueId/unassign', [
  param('issueId').isString().withMessage('Issue ID must be a string'),
], issueController.unassignIssue);

/**
 * @swagger
 * /api/v1/issues/{issueId}/watchers:
 *   post:
 *     summary: Add watcher to issue
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
 *               - watcherId
 *             properties:
 *               watcherId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Watcher added successfully
 */
router.post('/:issueId/watchers', [
  param('issueId').isString().withMessage('Issue ID must be a string'),
  body('watcherId').isString().withMessage('Watcher ID must be a string'),
], issueController.addWatcher);

/**
 * @swagger
 * /api/v1/issues/{issueId}/watchers/{watcherId}:
 *   delete:
 *     summary: Remove watcher from issue
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
 *       - in: path
 *         name: watcherId
 *         required: true
 *         schema:
 *           type: string
 *         description: Watcher ID
 *     responses:
 *       200:
 *         description: Watcher removed successfully
 */
router.delete('/:issueId/watchers/:watcherId', [
  param('issueId').isString().withMessage('Issue ID must be a string'),
  param('watcherId').isString().withMessage('Watcher ID must be a string'),
], issueController.removeWatcher);

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
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     filename:
 *                       type: string
 *                     url:
 *                       type: string
 *                     size:
 *                       type: number
 *     responses:
 *       201:
 *         description: Comment added successfully
 */
router.post('/:issueId/comments', [
  param('issueId').isString().withMessage('Issue ID must be a string'),
  body('content').trim().isLength({ min: 1 }).withMessage('Content is required'),
  body('isInternal').optional().isBoolean().withMessage('Is internal must be boolean'),
], issueController.addComment);

/**
 * @swagger
 * /api/v1/issues/{issueId}/comments/{commentId}:
 *   put:
 *     summary: Update comment
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
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
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
 *     responses:
 *       200:
 *         description: Comment updated successfully
 */
router.put('/:issueId/comments/:commentId', [
  param('issueId').isString().withMessage('Issue ID must be a string'),
  param('commentId').isString().withMessage('Comment ID must be a string'),
  body('content').trim().isLength({ min: 1 }).withMessage('Content is required'),
], issueController.updateComment);

/**
 * @swagger
 * /api/v1/issues/{issueId}/comments/{commentId}:
 *   delete:
 *     summary: Delete comment
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
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 */
router.delete('/:issueId/comments/:commentId', [
  param('issueId').isString().withMessage('Issue ID must be a string'),
  param('commentId').isString().withMessage('Comment ID must be a string'),
], issueController.deleteComment);

/**
 * @swagger
 * /api/v1/issues/{issueId}/time:
 *   post:
 *     summary: Log time spent on issue
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
 *               - hours
 *               - description
 *             properties:
 *               hours:
 *                 type: number
 *                 minimum: 0.1
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Time logged successfully
 */
router.post('/:issueId/time', [
  param('issueId').isString().withMessage('Issue ID must be a string'),
  body('hours').isFloat({ min: 0.1 }).withMessage('Hours must be a positive number'),
  body('description').trim().isLength({ min: 1 }).withMessage('Description is required'),
], issueController.logTime);

/**
 * @swagger
 * /api/v1/issues/{issueId}/time:
 *   get:
 *     summary: Get total time spent on issue
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
 *         description: Time spent retrieved
 */
router.get('/:issueId/time', [
  param('issueId').isString().withMessage('Issue ID must be a string'),
], issueController.getTimeSpent);

/**
 * @swagger
 * /api/v1/issues/{issueId}/escalate:
 *   put:
 *     summary: Escalate issue
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
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Issue escalated successfully
 */
router.put('/:issueId/escalate', [
  param('issueId').isString().withMessage('Issue ID must be a string'),
  body('reason').trim().isLength({ min: 1 }).withMessage('Escalation reason is required'),
], issueController.escalateIssue);

/**
 * @swagger
 * /api/v1/issues/{issueId}/tasks:
 *   post:
 *     summary: Link issue to task
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
 *               - taskId
 *               - relationship
 *             properties:
 *               taskId:
 *                 type: string
 *               relationship:
 *                 type: string
 *                 enum: [spawned_from, resolves, blocks, related_to]
 *     responses:
 *       201:
 *         description: Issue linked to task successfully
 */
router.post('/:issueId/tasks', [
  param('issueId').isString().withMessage('Issue ID must be a string'),
  body('taskId').isString().withMessage('Task ID must be a string'),
  body('relationship').isIn(['spawned_from', 'resolves', 'blocks', 'related_to'])
    .withMessage('Invalid relationship type'),
], issueController.linkToTask);

/**
 * @swagger
 * /api/v1/issues/{issueId}/tasks/{taskId}:
 *   delete:
 *     summary: Unlink issue from task
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
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Issue unlinked from task successfully
 */
router.delete('/:issueId/tasks/:taskId', [
  param('issueId').isString().withMessage('Issue ID must be a string'),
  param('taskId').isString().withMessage('Task ID must be a string'),
], issueController.unlinkFromTask);

/**
 * @swagger
 * /api/v1/issues/{issueId}/tasks:
 *   get:
 *     summary: Get related tasks for issue
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
 *         description: Related tasks retrieved
 */
router.get('/:issueId/tasks', [
  param('issueId').isString().withMessage('Issue ID must be a string'),
], issueController.getRelatedTasks);

/**
 * @swagger
 * /api/v1/issues/{issueId}/resolve:
 *   put:
 *     summary: Resolve issue
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
 *               - resolution
 *             properties:
 *               resolution:
 *                 type: object
 *                 required:
 *                   - type
 *                   - description
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [fixed, wont_fix, duplicate, invalid, works_as_designed]
 *                   description:
 *                     type: string
 *     responses:
 *       200:
 *         description: Issue resolved successfully
 */
router.put('/:issueId/resolve', [
  param('issueId').isString().withMessage('Issue ID must be a string'),
  body('resolution.type').isIn(['fixed', 'wont_fix', 'duplicate', 'invalid', 'works_as_designed'])
    .withMessage('Invalid resolution type'),
  body('resolution.description').trim().isLength({ min: 1 }).withMessage('Resolution description is required'),
], issueController.resolveIssue);

/**
 * @swagger
 * /api/v1/issues/{issueId}/reopen:
 *   put:
 *     summary: Reopen resolved issue
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
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Issue reopened successfully
 */
router.put('/:issueId/reopen', [
  param('issueId').isString().withMessage('Issue ID must be a string'),
  body('reason').trim().isLength({ min: 1 }).withMessage('Reopen reason is required'),
], issueController.reopenIssue);

export default router;
