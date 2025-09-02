/**
 * Task Management API Routes
 * Fortune 100-Grade Task Management REST API routing configuration
 */

import { Router } from 'express';
import {
  TaskController,
  createTaskValidation,
  updateTaskValidation,
  scheduleTaskValidation,
  taskIdValidation,
} from '../../controllers/tasks/taskController.js';
import { authenticate } from '../../middleware/auth.js';
import { ITaskManager } from '../../data-layer/tasks/interfaces/ITaskManager.js';

export function createTaskRoutes(taskManager: ITaskManager): Router {
  const router = Router();
  const taskController = new TaskController(taskManager);

  // Apply authentication middleware to all routes
  router.use(authenticate);

  /**
   * @swagger
   * components:
   *   schemas:
   *     Task:
   *       type: object
   *       required:
   *         - name
   *         - type
   *         - definition
   *       properties:
   *         id:
   *           type: string
   *           format: uuid
   *           description: Unique task identifier
   *         name:
   *           type: string
   *           description: Human-readable task name
   *         type:
   *           type: string
   *           enum: [data_ingestion, threat_analysis, ioc_processing, evidence_collection, report_generation, alerting, data_enrichment, correlation_analysis, custom]
   *           description: Type of task
   *         status:
   *           type: string
   *           enum: [created, queued, running, paused, completed, failed, cancelled, timeout, retry]
   *           description: Current task status
   *         priority:
   *           type: string
   *           enum: [critical, high, normal, low]
   *           description: Task execution priority
   *         definition:
   *           type: object
   *           required:
   *             - handler
   *             - parameters
   *           properties:
   *             handler:
   *               type: string
   *               description: Task handler identifier
   *             parameters:
   *               type: object
   *               description: Task-specific parameters
   *             timeout:
   *               type: integer
   *               minimum: 1000
   *               description: Task timeout in milliseconds
   *         createdAt:
   *           type: string
   *           format: date-time
   *           description: Task creation timestamp
   *         tags:
   *           type: array
   *           items:
   *             type: string
   *           description: Task tags for categorization
   *         metadata:
   *           type: object
   *           description: Additional task metadata
   *     TaskExecution:
   *       type: object
   *       properties:
   *         id:
   *           type: string
   *           format: uuid
   *           description: Execution identifier
   *         taskId:
   *           type: string
   *           format: uuid
   *           description: Associated task ID
   *         status:
   *           type: string
   *           enum: [created, queued, running, paused, completed, failed, cancelled, timeout, retry]
   *         queuedAt:
   *           type: string
   *           format: date-time
   *         startedAt:
   *           type: string
   *           format: date-time
   *         completedAt:
   *           type: string
   *           format: date-time
   *         metrics:
   *           type: object
   *           description: Execution performance metrics
   *     TaskSchedule:
   *       type: object
   *       required:
   *         - type
   *       properties:
   *         type:
   *           type: string
   *           enum: [once, recurring, event_driven]
   *         executeAt:
   *           type: string
   *           format: date-time
   *           description: One-time execution timestamp
   *         cronExpression:
   *           type: string
   *           description: Cron expression for recurring tasks
   *         interval:
   *           type: integer
   *           minimum: 1000
   *           description: Interval in milliseconds for recurring tasks
   */

  /**
   * @swagger
   * /api/v1/tasks:
   *   post:
   *     summary: Create a new task
   *     tags: [Tasks]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Task'
   *           example:
   *             name: "Daily IOC Analysis"
   *             type: "ioc_processing"
   *             priority: "high"
   *             definition:
   *               handler: "IOCProcessingHandler"
   *               parameters:
   *                 iocs: ["1.2.3.4", "example.com"]
   *                 operations: ["validate", "enrich", "classify"]
   *               timeout: 300000
   *             tags: ["daily", "analysis", "ioc"]
   *             metadata:
   *               department: "security"
   *               project: "threat-intel"
   *     responses:
   *       201:
   *         description: Task created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/Task'
   *                 message:
   *                   type: string
   *       400:
   *         description: Invalid request data
   *       401:
   *         description: Authentication required
   *       500:
   *         description: Server error
   */
  router.post('/tasks', createTaskValidation, taskController.createTask);

  /**
   * @swagger
   * /api/v1/tasks:
   *   get:
   *     summary: Query tasks with filters
   *     tags: [Tasks]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: types
   *         schema:
   *           type: array
   *           items:
   *             type: string
   *             enum: [data_ingestion, threat_analysis, ioc_processing, evidence_collection, report_generation, alerting, data_enrichment, correlation_analysis, custom]
   *         description: Filter by task types
   *       - in: query
   *         name: statuses
   *         schema:
   *           type: array
   *           items:
   *             type: string
   *             enum: [created, queued, running, paused, completed, failed, cancelled, timeout, retry]
   *         description: Filter by task statuses
   *       - in: query
   *         name: priorities
   *         schema:
   *           type: array
   *           items:
   *             type: string
   *             enum: [critical, high, normal, low]
   *         description: Filter by task priorities
   *       - in: query
   *         name: createdBy
   *         schema:
   *           type: string
   *         description: Filter by creator
   *       - in: query
   *         name: assignedTo
   *         schema:
   *           type: string
   *         description: Filter by assignee
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
   *         description: Filter tasks created after this date
   *       - in: query
   *         name: createdBefore
   *         schema:
   *           type: string
   *           format: date-time
   *         description: Filter tasks created before this date
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 1000
   *           default: 50
   *         description: Maximum number of tasks to return
   *       - in: query
   *         name: offset
   *         schema:
   *           type: integer
   *           minimum: 0
   *           default: 0
   *         description: Number of tasks to skip
   *       - in: query
   *         name: sort
   *         schema:
   *           type: string
   *         description: 'Sort by field:direction (e.g., "createdAt:desc")'
   *     responses:
   *       200:
   *         description: Tasks retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Task'
   *                 pagination:
   *                   type: object
   *                   properties:
   *                     total:
   *                       type: integer
   *                     hasMore:
   *                       type: boolean
   *                     limit:
   *                       type: integer
   *                     offset:
   *                       type: integer
   *                 executionTime:
   *                   type: number
   */
  router.get('/tasks', taskController.queryTasks);

  /**
   * @swagger
   * /api/v1/tasks/search:
   *   get:
   *     summary: Search tasks by text
   *     tags: [Tasks]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: q
   *         required: true
   *         schema:
   *           type: string
   *         description: Search query
   *       - in: query
   *         name: fields
   *         schema:
   *           type: string
   *         description: Comma-separated list of fields to search (default: name,tags)
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 50
   *         description: Maximum number of results
   *     responses:
   *       200:
   *         description: Search results
   *       400:
   *         description: Search query is required
   */
  router.get('/tasks/search', taskController.searchTasks);

  /**
   * @swagger
   * /api/v1/tasks/{taskId}:
   *   get:
   *     summary: Get a task by ID
   *     tags: [Tasks]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: taskId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Task identifier
   *     responses:
   *       200:
   *         description: Task details
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/Task'
   *       404:
   *         description: Task not found
   */
  router.get('/tasks/:taskId', taskIdValidation, taskController.getTask);

  /**
   * @swagger
   * /api/v1/tasks/{taskId}:
   *   put:
   *     summary: Update a task
   *     tags: [Tasks]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: taskId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               priority:
   *                 type: string
   *                 enum: [critical, high, normal, low]
   *               tags:
   *                 type: array
   *                 items:
   *                   type: string
   *               metadata:
   *                 type: object
   *     responses:
   *       200:
   *         description: Task updated successfully
   *       404:
   *         description: Task not found
   */
  router.put('/tasks/:taskId', updateTaskValidation, taskController.updateTask);

  /**
   * @swagger
   * /api/v1/tasks/{taskId}:
   *   delete:
   *     summary: Delete a task
   *     tags: [Tasks]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: taskId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Task deleted successfully
   *       404:
   *         description: Task not found
   */
  router.delete('/tasks/:taskId', taskIdValidation, taskController.deleteTask);

  /**
   * @swagger
   * /api/v1/tasks/{taskId}/execute:
   *   post:
   *     summary: Execute a task
   *     tags: [Tasks]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: taskId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               context:
   *                 type: object
   *                 description: Additional execution context
   *     responses:
   *       200:
   *         description: Task execution started
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/TaskExecution'
   *                 message:
   *                   type: string
   */
  router.post(
    '/tasks/:taskId/execute',
    taskIdValidation,
    taskController.executeTask
  );

  /**
   * @swagger
   * /api/v1/tasks/{taskId}/cancel:
   *   post:
   *     summary: Cancel a task
   *     tags: [Tasks]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: taskId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Task cancelled successfully
   *       404:
   *         description: Task not found or cannot be cancelled
   */
  router.post(
    '/tasks/:taskId/cancel',
    taskIdValidation,
    taskController.cancelTask
  );

  /**
   * @swagger
   * /api/v1/tasks/{taskId}/pause:
   *   post:
   *     summary: Pause a task
   *     tags: [Tasks]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: taskId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Task paused successfully
   *       404:
   *         description: Task not found or cannot be paused
   */
  router.post(
    '/tasks/:taskId/pause',
    taskIdValidation,
    taskController.pauseTask
  );

  /**
   * @swagger
   * /api/v1/tasks/{taskId}/resume:
   *   post:
   *     summary: Resume a paused task
   *     tags: [Tasks]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: taskId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Task resumed successfully
   *       404:
   *         description: Task not found or cannot be resumed
   */
  router.post(
    '/tasks/:taskId/resume',
    taskIdValidation,
    taskController.resumeTask
  );

  /**
   * @swagger
   * /api/v1/tasks/{taskId}/retry:
   *   post:
   *     summary: Retry a failed task
   *     tags: [Tasks]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: taskId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Task retry initiated
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/TaskExecution'
   *                 message:
   *                   type: string
   */
  router.post(
    '/tasks/:taskId/retry',
    taskIdValidation,
    taskController.retryTask
  );

  /**
   * @swagger
   * /api/v1/tasks/{taskId}/schedule:
   *   post:
   *     summary: Schedule a task for execution
   *     tags: [Tasks]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: taskId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/TaskSchedule'
   *           examples:
   *             oneTime:
   *               summary: One-time execution
   *               value:
   *                 type: "once"
   *                 executeAt: "2024-03-01T09:00:00Z"
   *             recurring:
   *               summary: Recurring execution
   *               value:
   *                 type: "recurring"
   *                 cronExpression: "0 9 * * 1-5"
   *                 timezone: "UTC"
   *             interval:
   *               summary: Interval-based execution
   *               value:
   *                 type: "recurring"
   *                 interval: 3600000
   *     responses:
   *       200:
   *         description: Task scheduled successfully
   *       404:
   *         description: Task not found
   */
  router.post(
    '/tasks/:taskId/schedule',
    scheduleTaskValidation,
    taskController.scheduleTask
  );

  /**
   * @swagger
   * /api/v1/tasks/{taskId}/status:
   *   get:
   *     summary: Get task status
   *     tags: [Tasks]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: taskId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Task status
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
   *                     taskId:
   *                       type: string
   *                     status:
   *                       type: string
   */
  router.get(
    '/tasks/:taskId/status',
    taskIdValidation,
    taskController.getTaskStatus
  );

  /**
   * @swagger
   * /api/v1/tasks/{taskId}/metrics:
   *   get:
   *     summary: Get task performance metrics
   *     tags: [Tasks]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: taskId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Task metrics
   */
  router.get(
    '/tasks/:taskId/metrics',
    taskIdValidation,
    taskController.getTaskMetrics
  );

  /**
   * @swagger
   * /api/v1/tasks/{taskId}/history:
   *   get:
   *     summary: Get task execution history
   *     tags: [Tasks]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: taskId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Task execution history
   */
  router.get(
    '/tasks/:taskId/history',
    taskIdValidation,
    taskController.getTaskHistory
  );

  /**
   * @swagger
   * /api/v1/tasks/{taskId}/logs:
   *   get:
   *     summary: Get task execution logs
   *     tags: [Tasks]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: taskId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *       - in: query
   *         name: executionId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Specific execution ID (optional)
   *     responses:
   *       200:
   *         description: Task logs
   */
  router.get(
    '/tasks/:taskId/logs',
    taskIdValidation,
    taskController.getTaskLogs
  );

  /**
   * @swagger
   * /api/v1/tasks/system/health:
   *   get:
   *     summary: Get task management system health
   *     tags: [Tasks]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: System health status
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
   *                     health:
   *                       type: object
   *                       properties:
   *                         status:
   *                           type: string
   *                           enum: [healthy, degraded, unhealthy]
   *                         details:
   *                           type: object
   *                     metrics:
   *                       type: object
   *                     timestamp:
   *                       type: string
   *                       format: date-time
   */
  router.get('/tasks/system/health', taskController.getSystemHealth);

  /**
   * @swagger
   * /api/v1/tasks/system/resources:
   *   get:
   *     summary: Get system resource usage
   *     tags: [Tasks]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Resource usage information
   */
  router.get('/tasks/system/resources', taskController.getResourceUsage);

  return router;
}
