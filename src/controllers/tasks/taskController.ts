/**
 * Task Management API Controller
 * Fortune 100-Grade Task Management REST API endpoints
 */

import { Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { logger } from '../../utils/logger.js';
import {
  ITaskManager,
  TaskType,
  TaskStatus,
  TaskPriority,
  ITaskQuery,
  ITaskSchedule,
} from '../../data-layer/tasks/interfaces/ITaskManager.js';

export class TaskController {
  constructor(private taskManager: ITaskManager) {}

  /**
   * Create a new task
   */
  public createTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          error: 'Validation failed',
          details: errors.array(),
        });
        return;
      }

      const taskDefinition = req.body;

      // Add security context from request  
      taskDefinition.createdBy = (req as any).user?.id || 'anonymous';
      taskDefinition.permissions = (req as any).user?.permissions || [];

      const task = await this.taskManager.createTask(taskDefinition);

      logger.info('Task created via API', {
        taskId: task.id,
        taskName: task.name,
        taskType: task.type,
        createdBy: task.createdBy,
      });

      res.status(201).json({
        success: true,
        data: task,
        message: 'Task created successfully',
      });
    } catch (error) {
      logger.error('Failed to create task', { error });
      res.status(500).json({
        error: 'Failed to create task',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Get a task by ID
   */
  public getTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const taskId = req.params.taskId;
      if (!taskId) {
        res.status(400).json({ error: 'Task ID is required' });
        return;
      }
      
      const task = await this.taskManager.getTask(taskId);

      if (!task) {
        res.status(404).json({
          error: 'Task not found',
          message: `Task with ID ${taskId} does not exist`,
        });
        return;
      }

      res.json({
        success: true,
        data: task,
      });
    } catch (error) {
      logger.error('Failed to get task', { error, taskId: req.params.taskId });
      res.status(500).json({
        error: 'Failed to retrieve task',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Update a task
   */
  public updateTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          error: 'Validation failed',
          details: errors.array(),
        });
        return;
      }

      const taskId = req.params.taskId;
      if (!taskId) {
        res.status(400).json({ error: 'Task ID is required' });
        return;
      }
      
      const updates = req.body;

      const task = await this.taskManager.updateTask(taskId, updates);

      logger.info('Task updated via API', {
        taskId,
        updates: Object.keys(updates),
      });

      res.json({
        success: true,
        data: task,
        message: 'Task updated successfully',
      });
    } catch (error) {
      logger.error('Failed to update task', { error, taskId: req.params.taskId });
      res.status(500).json({
        error: 'Failed to update task',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Delete a task
   */
  public deleteTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const taskId = req.params.taskId;
      if (!taskId) {
        res.status(400).json({ error: 'Task ID is required' });
        return;
      }
      
      const deleted = await this.taskManager.deleteTask(taskId);

      if (!deleted) {
        res.status(404).json({
          error: 'Task not found',
          message: `Task with ID ${taskId} does not exist`,
        });
        return;
      }

      logger.info('Task deleted via API', { taskId });

      res.json({
        success: true,
        message: 'Task deleted successfully',
      });
    } catch (error) {
      logger.error('Failed to delete task', { error, taskId: req.params.taskId });
      res.status(500).json({
        error: 'Failed to delete task',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Execute a task
   */
  public executeTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const taskId = req.params.taskId;
      if (!taskId) {
        res.status(400).json({ error: 'Task ID is required' });
        return;
      }
      
      const context = req.body.context || {};

      // Add user context
      context.userId = (req as any).user?.id || 'anonymous';
      context.permissions = (req as any).user?.permissions || [];

      const execution = await this.taskManager.executeTask(taskId, context);

      logger.info('Task execution started via API', {
        taskId,
        executionId: execution.id,
      });

      res.json({
        success: true,
        data: execution,
        message: 'Task execution started',
      });
    } catch (error) {
      logger.error('Failed to execute task', { error, taskId: req.params.taskId });
      res.status(500).json({
        error: 'Failed to execute task',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Cancel a task
   */
  public cancelTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const taskId = req.params.taskId;
      if (!taskId) {
        res.status(400).json({ error: 'Task ID is required' });
        return;
      }
      const cancelled = await this.taskManager.cancelTask(taskId);

      if (!cancelled) {
        res.status(404).json({
          error: 'Task not found or cannot be cancelled',
          message: `Task with ID ${taskId} does not exist or is not in a cancellable state`,
        });
        return;
      }

      logger.info('Task cancelled via API', { taskId });

      res.json({
        success: true,
        message: 'Task cancelled successfully',
      });
    } catch (error) {
      logger.error('Failed to cancel task', { error, taskId: req.params.taskId });
      res.status(500).json({
        error: 'Failed to cancel task',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Pause a task
   */
  public pauseTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const taskId = req.params.taskId;
      if (!taskId) {
        res.status(400).json({ error: 'Task ID is required' });
        return;
      }
      const paused = await this.taskManager.pauseTask(taskId);

      if (!paused) {
        res.status(404).json({
          error: 'Task not found or cannot be paused',
          message: `Task with ID ${taskId} does not exist or is not in a pausable state`,
        });
        return;
      }

      logger.info('Task paused via API', { taskId });

      res.json({
        success: true,
        message: 'Task paused successfully',
      });
    } catch (error) {
      logger.error('Failed to pause task', { error, taskId: req.params.taskId });
      res.status(500).json({
        error: 'Failed to pause task',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Resume a task
   */
  public resumeTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const taskId = req.params.taskId;
      if (!taskId) {
        res.status(400).json({ error: 'Task ID is required' });
        return;
      }
      const resumed = await this.taskManager.resumeTask(taskId);

      if (!resumed) {
        res.status(404).json({
          error: 'Task not found or cannot be resumed',
          message: `Task with ID ${taskId} does not exist or is not in a resumable state`,
        });
        return;
      }

      logger.info('Task resumed via API', { taskId });

      res.json({
        success: true,
        message: 'Task resumed successfully',
      });
    } catch (error) {
      logger.error('Failed to resume task', { error, taskId: req.params.taskId });
      res.status(500).json({
        error: 'Failed to resume task',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Retry a failed task
   */
  public retryTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const taskId = req.params.taskId;
      if (!taskId) {
        res.status(400).json({ error: 'Task ID is required' });
        return;
      }
      const execution = await this.taskManager.retryTask(taskId);

      logger.info('Task retry initiated via API', {
        taskId,
        executionId: execution.id,
      });

      res.json({
        success: true,
        data: execution,
        message: 'Task retry initiated',
      });
    } catch (error) {
      logger.error('Failed to retry task', { error, taskId: req.params.taskId });
      res.status(500).json({
        error: 'Failed to retry task',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Query tasks with filters
   */
  public queryTasks = async (req: Request, res: Response): Promise<void> => {
    try {
      const query: ITaskQuery = {};

      // Parse query parameters
      if (req.query.types) {
        query.types = Array.isArray(req.query.types) 
          ? req.query.types as TaskType[] 
          : [req.query.types as TaskType];
      }

      if (req.query.statuses) {
        query.statuses = Array.isArray(req.query.statuses) 
          ? req.query.statuses as TaskStatus[] 
          : [req.query.statuses as TaskStatus];
      }

      if (req.query.priorities) {
        query.priorities = Array.isArray(req.query.priorities) 
          ? req.query.priorities as TaskPriority[] 
          : [req.query.priorities as TaskPriority];
      }

      if (req.query.createdBy) {
        query.createdBy = req.query.createdBy as string;
      }

      if (req.query.assignedTo) {
        query.assignedTo = req.query.assignedTo as string;
      }

      if (req.query.tags) {
        query.tags = Array.isArray(req.query.tags) 
          ? req.query.tags as string[] 
          : [req.query.tags as string];
      }

      // Date range filters
      if (req.query.createdAfter) {
        query.createdAfter = new Date(req.query.createdAfter as string);
      }

      if (req.query.createdBefore) {
        query.createdBefore = new Date(req.query.createdBefore as string);
      }

      // Pagination
      if (req.query.limit) {
        query.limit = parseInt(req.query.limit as string, 10);
      }

      if (req.query.offset) {
        query.offset = parseInt(req.query.offset as string, 10);
      }

      // Sorting
      if (req.query.sort) {
        const sortParam = req.query.sort as string;
        const [field, direction = 'asc'] = sortParam.split(':');
        if (field) {
          query.sort = [{ field, direction: direction as 'asc' | 'desc' }];
        }
      }

      const result = await this.taskManager.queryTasks(query);

      res.json({
        success: true,
        data: result.tasks,
        pagination: {
          total: result.total,
          hasMore: result.hasMore,
          limit: query.limit || 50,
          offset: query.offset || 0,
        },
        executionTime: result.executionTime,
      });
    } catch (error) {
      logger.error('Failed to query tasks', { error });
      res.status(500).json({
        error: 'Failed to query tasks',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Search tasks by text
   */
  public searchTasks = async (req: Request, res: Response): Promise<void> => {
    try {
      const { q } = req.query;
      
      if (!q || typeof q !== 'string') {
        res.status(400).json({
          error: 'Search query is required',
          message: 'Please provide a search term using the "q" parameter',
        });
        return;
      }

      const options = {
        fields: req.query.fields ? (req.query.fields as string).split(',') : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      };

      const result = await this.taskManager.searchTasks(q, options);

      res.json({
        success: true,
        data: result.tasks,
        pagination: {
          total: result.total,
          hasMore: result.hasMore,
          limit: options.limit || 50,
        },
        query: q,
      });
    } catch (error) {
      logger.error('Failed to search tasks', { error });
      res.status(500).json({
        error: 'Failed to search tasks',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Get task status
   */
  public getTaskStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const taskId = req.params.taskId;
      if (!taskId) {
        res.status(400).json({ error: 'Task ID is required' });
        return;
      }
      const status = await this.taskManager.getTaskStatus(taskId);

      res.json({
        success: true,
        data: { taskId, status },
      });
    } catch (error) {
      logger.error('Failed to get task status', { error, taskId: req.params.taskId });
      res.status(500).json({
        error: 'Failed to get task status',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Get task metrics
   */
  public getTaskMetrics = async (req: Request, res: Response): Promise<void> => {
    try {
      const taskId = req.params.taskId;
      if (!taskId) {
        res.status(400).json({ error: 'Task ID is required' });
        return;
      }
      const metrics = await this.taskManager.getTaskMetrics(taskId);

      res.json({
        success: true,
        data: { taskId, metrics },
      });
    } catch (error) {
      logger.error('Failed to get task metrics', { error, taskId: req.params.taskId });
      res.status(500).json({
        error: 'Failed to get task metrics',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Get task execution history
   */
  public getTaskHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const taskId = req.params.taskId;
      if (!taskId) {
        res.status(400).json({ error: 'Task ID is required' });
        return;
      }
      const history = await this.taskManager.getExecutionHistory(taskId);

      res.json({
        success: true,
        data: { taskId, history },
      });
    } catch (error) {
      logger.error('Failed to get task history', { error, taskId: req.params.taskId });
      res.status(500).json({
        error: 'Failed to get task history',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Get task logs
   */
  public getTaskLogs = async (req: Request, res: Response): Promise<void> => {
    try {
      const taskId = req.params.taskId;
      if (!taskId) {
        res.status(400).json({ error: 'Task ID is required' });
        return;
      }
      const { executionId } = req.query;
      
      const logs = await this.taskManager.getTaskLogs(
        taskId, 
        executionId as string | undefined
      );

      res.json({
        success: true,
        data: { taskId, executionId, logs },
      });
    } catch (error) {
      logger.error('Failed to get task logs', { error, taskId: req.params.taskId });
      res.status(500).json({
        error: 'Failed to get task logs',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Schedule a task
   */
  public scheduleTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          error: 'Validation failed',
          details: errors.array(),
        });
        return;
      }

      const taskId = req.params.taskId;
      if (!taskId) {
        res.status(400).json({ error: 'Task ID is required' });
        return;
      }
      const schedule: ITaskSchedule = req.body;

      const scheduled = await this.taskManager.scheduleTask(taskId, schedule);

      if (!scheduled) {
        res.status(404).json({
          error: 'Task not found',
          message: `Task with ID ${taskId} does not exist`,
        });
        return;
      }

      logger.info('Task scheduled via API', { taskId, schedule });

      res.json({
        success: true,
        message: 'Task scheduled successfully',
        data: { taskId, schedule },
      });
    } catch (error) {
      logger.error('Failed to schedule task', { error, taskId: req.params.taskId });
      res.status(500).json({
        error: 'Failed to schedule task',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Get system health and metrics
   */
  public getSystemHealth = async (req: Request, res: Response): Promise<void> => {
    try {
      const health = await this.taskManager.healthCheck();
      const metrics = await this.taskManager.getSystemMetrics();

      res.json({
        success: true,
        data: {
          health,
          metrics,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      logger.error('Failed to get system health', { error });
      res.status(500).json({
        error: 'Failed to get system health',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Get resource usage information
   */
  public getResourceUsage = async (req: Request, res: Response): Promise<void> => {
    try {
      const usage = await this.taskManager.getResourceUsage();
      const available = await this.taskManager.getAvailableResources();

      res.json({
        success: true,
        data: {
          current: usage,
          available,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      logger.error('Failed to get resource usage', { error });
      res.status(500).json({
        error: 'Failed to get resource usage',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };
}

/**
 * Validation middleware for task creation
 */
export const createTaskValidation = [
  body('name').isString().notEmpty().withMessage('Task name is required'),
  body('type').isIn(Object.values(TaskType)).withMessage('Valid task type is required'),
  body('definition').isObject().notEmpty().withMessage('Task definition is required'),
  body('definition.handler').isString().notEmpty().withMessage('Task handler is required'),
  body('definition.parameters').isObject().withMessage('Task parameters must be an object'),
  body('definition.timeout').optional().isInt({ min: 1000 }).withMessage('Timeout must be at least 1000ms'),
  body('priority').optional().isIn(Object.values(TaskPriority)).withMessage('Invalid task priority'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('metadata').optional().isObject().withMessage('Metadata must be an object'),
];

/**
 * Validation middleware for task updates
 */
export const updateTaskValidation = [
  param('taskId').isUUID().withMessage('Valid task ID is required'),
  body('name').optional().isString().notEmpty().withMessage('Task name must be a non-empty string'),
  body('priority').optional().isIn(Object.values(TaskPriority)).withMessage('Invalid task priority'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('metadata').optional().isObject().withMessage('Metadata must be an object'),
];

/**
 * Validation middleware for task scheduling
 */
export const scheduleTaskValidation = [
  param('taskId').isUUID().withMessage('Valid task ID is required'),
  body('type').isIn(['once', 'recurring', 'event_driven']).withMessage('Valid schedule type is required'),
  body('executeAt').optional().isISO8601().withMessage('Execute at must be a valid ISO8601 date'),
  body('cronExpression').optional().isString().withMessage('Cron expression must be a string'),
  body('interval').optional().isInt({ min: 1000 }).withMessage('Interval must be at least 1000ms'),
];

/**
 * Validation middleware for task ID parameters
 */
export const taskIdValidation = [
  param('taskId').isUUID().withMessage('Valid task ID is required'),
];