/**
 * Issue Controller
 * Fortune 100-Grade Issue & Ticket Tracker API Controller
 */

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { IssueManagementService } from '../../services/issue/IssueManagementService.js';
import {
  ICreateIssueRequest,
  IUpdateIssueRequest,
  IIssueSearchQuery,
  IAddCommentRequest,
  IIssueContext,
} from '../../services/issue/interfaces/IIssueManager.js';
import { logger } from '../../utils/logger.js';

export class IssueController {
  private issueService: IssueManagementService;
  private logger = logger;

  constructor() {
    this.issueService = new IssueManagementService();
  }

  /**
   * Create a new issue
   */
  public createIssue = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array(),
        });
        return;
      }

      const context = this.buildContext(req);
      const createRequest: ICreateIssueRequest = {
        ...req.body,
        reporter: context.userId,
      };

      const issue = await this.issueService.createIssue(createRequest, context);

      res.status(201).json({
        success: true,
        data: issue,
        message: `Issue ${issue.ticketId} created successfully`,
      });
    } catch (error) {
      this.logger.error('Error creating issue', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create issue',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Get issue by ID
   */
  public getIssue = async (req: Request, res: Response): Promise<void> => {
    try {
      const { issueId } = req.params;
      const context = this.buildContext(req);

      if (!issueId) {
        res.status(400).json({
          success: false,
          message: 'Issue ID is required',
        });
        return;
      }

      const issue = await this.issueService.getIssue(issueId, context);

      if (!issue) {
        res.status(404).json({
          success: false,
          message: 'Issue not found',
        });
        return;
      }

      res.json({
        success: true,
        data: issue,
      });
    } catch (error) {
      this.logger.error('Error retrieving issue', { error, issueId: req.params.issueId });
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve issue',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Update issue
   */
  public updateIssue = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array(),
        });
        return;
      }

      const { issueId } = req.params;
      const context = this.buildContext(req);
      const updates: IUpdateIssueRequest = req.body;

      if (!issueId) {
        res.status(400).json({
          success: false,
          message: 'Issue ID is required',
        });
        return;
      }

      const issue = await this.issueService.updateIssue(issueId, updates, context);

      res.json({
        success: true,
        data: issue,
        message: `Issue ${issue.ticketId} updated successfully`,
      });
    } catch (error) {
      this.logger.error('Error updating issue', { error, issueId: req.params.issueId });
      res.status(500).json({
        success: false,
        message: 'Failed to update issue',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Delete issue
   */
  public deleteIssue = async (req: Request, res: Response): Promise<void> => {
    try {
      const { issueId } = req.params;
      const context = this.buildContext(req);

      if (!issueId) {
        res.status(400).json({
          success: false,
          message: 'Issue ID is required',
        });
        return;
      }

      const deleted = await this.issueService.deleteIssue(issueId, context);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Issue not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Issue deleted successfully',
      });
    } catch (error) {
      this.logger.error('Error deleting issue', { error, issueId: req.params.issueId });
      res.status(500).json({
        success: false,
        message: 'Failed to delete issue',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Search issues
   */
  public searchIssues = async (req: Request, res: Response): Promise<void> => {
    try {
      const context = this.buildContext(req);
      const searchQuery: IIssueSearchQuery = {
        query: req.query.q as string,
        filters: this.buildFilters(req.query),
        sortBy: req.query.sortBy as string || 'updatedAt',
        sortOrder: req.query.sortOrder as 'asc' | 'desc' || 'desc',
        page: parseInt(req.query.page as string) || 1,
        limit: Math.min(parseInt(req.query.limit as string) || 50, 100),
        includeResolved: req.query.includeResolved === 'true',
      };

      const result = await this.issueService.searchIssues(searchQuery, context);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      this.logger.error('Error searching issues', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to search issues',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Transition issue status
   */
  public transitionStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const issueId = this.validateParam(req.params.issueId, 'Issue ID');
      const { status, notes } = req.body;
      const context = this.buildContext(req);

      if (!status) {
        res.status(400).json({
          success: false,
          message: 'Status is required',
        });
        return;
      }

      const issue = await this.issueService.transitionIssueStatus(issueId, status, context, notes);

      res.json({
        success: true,
        data: issue,
        message: `Issue status changed to ${status}`,
      });
    } catch (error) {
      this.logger.error('Error transitioning issue status', { error, issueId: req.params.issueId });
      res.status(400).json({
        success: false,
        message: 'Failed to transition status',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Get available transitions
   */
  public getAvailableTransitions = async (req: Request, res: Response): Promise<void> => {
    try {
      const { issueId } = req.params;
      const context = this.buildContext(req);

      const transitions = await this.issueService.getAvailableTransitions(issueId, context);

      res.json({
        success: true,
        data: transitions,
      });
    } catch (error) {
      this.logger.error('Error getting available transitions', { error, issueId: req.params.issueId });
      res.status(500).json({
        success: false,
        message: 'Failed to get available transitions',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Assign issue
   */
  public assignIssue = async (req: Request, res: Response): Promise<void> => {
    try {
      const { issueId } = req.params;
      const { assigneeId } = req.body;
      const context = this.buildContext(req);

      if (!assigneeId) {
        res.status(400).json({
          success: false,
          message: 'Assignee ID is required',
        });
        return;
      }

      const issue = await this.issueService.assignIssue(issueId, assigneeId, context);

      res.json({
        success: true,
        data: issue,
        message: 'Issue assigned successfully',
      });
    } catch (error) {
      this.logger.error('Error assigning issue', { error, issueId: req.params.issueId });
      res.status(500).json({
        success: false,
        message: 'Failed to assign issue',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Unassign issue
   */
  public unassignIssue = async (req: Request, res: Response): Promise<void> => {
    try {
      const { issueId } = req.params;
      const context = this.buildContext(req);

      const issue = await this.issueService.unassignIssue(issueId, context);

      res.json({
        success: true,
        data: issue,
        message: 'Issue unassigned successfully',
      });
    } catch (error) {
      this.logger.error('Error unassigning issue', { error, issueId: req.params.issueId });
      res.status(500).json({
        success: false,
        message: 'Failed to unassign issue',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Add watcher to issue
   */
  public addWatcher = async (req: Request, res: Response): Promise<void> => {
    try {
      const { issueId } = req.params;
      const { watcherId } = req.body;
      const context = this.buildContext(req);

      if (!watcherId) {
        res.status(400).json({
          success: false,
          message: 'Watcher ID is required',
        });
        return;
      }

      const issue = await this.issueService.addWatcher(issueId, watcherId, context);

      res.json({
        success: true,
        data: issue,
        message: 'Watcher added successfully',
      });
    } catch (error) {
      this.logger.error('Error adding watcher', { error, issueId: req.params.issueId });
      res.status(500).json({
        success: false,
        message: 'Failed to add watcher',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Remove watcher from issue
   */
  public removeWatcher = async (req: Request, res: Response): Promise<void> => {
    try {
      const { issueId, watcherId } = req.params;
      const context = this.buildContext(req);

      const issue = await this.issueService.removeWatcher(issueId, watcherId, context);

      res.json({
        success: true,
        data: issue,
        message: 'Watcher removed successfully',
      });
    } catch (error) {
      this.logger.error('Error removing watcher', { error, issueId: req.params.issueId });
      res.status(500).json({
        success: false,
        message: 'Failed to remove watcher',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Add comment to issue
   */
  public addComment = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array(),
        });
        return;
      }

      const { issueId } = req.params;
      const context = this.buildContext(req);
      const commentRequest: IAddCommentRequest = {
        issueId,
        userId: context.userId,
        content: req.body.content,
        isInternal: req.body.isInternal || false,
        attachments: req.body.attachments || [],
      };

      const issue = await this.issueService.addComment(commentRequest, context);

      res.status(201).json({
        success: true,
        data: issue,
        message: 'Comment added successfully',
      });
    } catch (error) {
      this.logger.error('Error adding comment', { error, issueId: req.params.issueId });
      res.status(500).json({
        success: false,
        message: 'Failed to add comment',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Update comment
   */
  public updateComment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { issueId, commentId } = req.params;
      const { content } = req.body;
      const context = this.buildContext(req);

      if (!content) {
        res.status(400).json({
          success: false,
          message: 'Content is required',
        });
        return;
      }

      const issue = await this.issueService.updateComment(issueId, commentId, content, context);

      res.json({
        success: true,
        data: issue,
        message: 'Comment updated successfully',
      });
    } catch (error) {
      this.logger.error('Error updating comment', { error, issueId: req.params.issueId });
      res.status(500).json({
        success: false,
        message: 'Failed to update comment',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Delete comment
   */
  public deleteComment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { issueId, commentId } = req.params;
      const context = this.buildContext(req);

      const issue = await this.issueService.deleteComment(issueId, commentId, context);

      res.json({
        success: true,
        data: issue,
        message: 'Comment deleted successfully',
      });
    } catch (error) {
      this.logger.error('Error deleting comment', { error, issueId: req.params.issueId });
      res.status(500).json({
        success: false,
        message: 'Failed to delete comment',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Log time spent on issue
   */
  public logTime = async (req: Request, res: Response): Promise<void> => {
    try {
      const { issueId } = req.params;
      const { hours, description } = req.body;
      const context = this.buildContext(req);

      if (!hours || !description) {
        res.status(400).json({
          success: false,
          message: 'Hours and description are required',
        });
        return;
      }

      const issue = await this.issueService.logTime(issueId, hours, description, context);

      res.json({
        success: true,
        data: issue,
        message: 'Time logged successfully',
      });
    } catch (error) {
      this.logger.error('Error logging time', { error, issueId: req.params.issueId });
      res.status(500).json({
        success: false,
        message: 'Failed to log time',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Get time spent on issue
   */
  public getTimeSpent = async (req: Request, res: Response): Promise<void> => {
    try {
      const { issueId } = req.params;
      const context = this.buildContext(req);

      const timeSpent = await this.issueService.getTimeSpent(issueId, context);

      res.json({
        success: true,
        data: { timeSpent },
      });
    } catch (error) {
      this.logger.error('Error getting time spent', { error, issueId: req.params.issueId });
      res.status(500).json({
        success: false,
        message: 'Failed to get time spent',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Escalate issue
   */
  public escalateIssue = async (req: Request, res: Response): Promise<void> => {
    try {
      const { issueId } = req.params;
      const { reason } = req.body;
      const context = this.buildContext(req);

      if (!reason) {
        res.status(400).json({
          success: false,
          message: 'Escalation reason is required',
        });
        return;
      }

      const issue = await this.issueService.escalateIssue(issueId, reason, context);

      res.json({
        success: true,
        data: issue,
        message: 'Issue escalated successfully',
      });
    } catch (error) {
      this.logger.error('Error escalating issue', { error, issueId: req.params.issueId });
      res.status(500).json({
        success: false,
        message: 'Failed to escalate issue',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Link issue to task
   */
  public linkToTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const { issueId } = req.params;
      const { taskId, relationship } = req.body;
      const context = this.buildContext(req);

      if (!taskId || !relationship) {
        res.status(400).json({
          success: false,
          message: 'Task ID and relationship are required',
        });
        return;
      }

      const integration = await this.issueService.linkToTask(issueId, taskId, relationship, context);

      res.status(201).json({
        success: true,
        data: integration,
        message: 'Issue linked to task successfully',
      });
    } catch (error) {
      this.logger.error('Error linking issue to task', { error, issueId: req.params.issueId });
      res.status(500).json({
        success: false,
        message: 'Failed to link issue to task',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Unlink issue from task
   */
  public unlinkFromTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const { issueId, taskId } = req.params;
      const context = this.buildContext(req);

      const unlinked = await this.issueService.unlinkFromTask(issueId, taskId, context);

      res.json({
        success: true,
        data: { unlinked },
        message: 'Issue unlinked from task successfully',
      });
    } catch (error) {
      this.logger.error('Error unlinking issue from task', { error, issueId: req.params.issueId });
      res.status(500).json({
        success: false,
        message: 'Failed to unlink issue from task',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Get related tasks for issue
   */
  public getRelatedTasks = async (req: Request, res: Response): Promise<void> => {
    try {
      const { issueId } = req.params;
      const context = this.buildContext(req);

      const tasks = await this.issueService.getRelatedTasks(issueId, context);

      res.json({
        success: true,
        data: tasks,
      });
    } catch (error) {
      this.logger.error('Error getting related tasks', { error, issueId: req.params.issueId });
      res.status(500).json({
        success: false,
        message: 'Failed to get related tasks',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Get issue metrics
   */
  public getIssueMetrics = async (req: Request, res: Response): Promise<void> => {
    try {
      const context = this.buildContext(req);
      const filters = this.buildFilters(req.query);

      const metrics = await this.issueService.getIssueMetrics(filters, context);

      res.json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      this.logger.error('Error getting issue metrics', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to get issue metrics',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Get issue analytics
   */
  public getIssueAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;
      const context = this.buildContext(req);

      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          message: 'Start date and end date are required',
        });
        return;
      }

      const analytics = await this.issueService.getIssueAnalytics(
        new Date(startDate as string),
        new Date(endDate as string),
        context
      );

      res.json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      this.logger.error('Error getting issue analytics', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to get issue analytics',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Bulk update issues
   */
  public bulkUpdateIssues = async (req: Request, res: Response): Promise<void> => {
    try {
      const { issueIds, updates } = req.body;
      const context = this.buildContext(req);

      if (!issueIds || !Array.isArray(issueIds) || issueIds.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Issue IDs array is required',
        });
        return;
      }

      const updatedIssues = await this.issueService.bulkUpdateIssues(issueIds, updates, context);

      res.json({
        success: true,
        data: updatedIssues,
        message: `${updatedIssues.length} issues updated successfully`,
      });
    } catch (error) {
      this.logger.error('Error bulk updating issues', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to bulk update issues',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Bulk assign issues
   */
  public bulkAssignIssues = async (req: Request, res: Response): Promise<void> => {
    try {
      const { issueIds, assigneeId } = req.body;
      const context = this.buildContext(req);

      if (!issueIds || !Array.isArray(issueIds) || issueIds.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Issue IDs array is required',
        });
        return;
      }

      if (!assigneeId) {
        res.status(400).json({
          success: false,
          message: 'Assignee ID is required',
        });
        return;
      }

      const assignedIssues = await this.issueService.bulkAssignIssues(issueIds, assigneeId, context);

      res.json({
        success: true,
        data: assignedIssues,
        message: `${assignedIssues.length} issues assigned successfully`,
      });
    } catch (error) {
      this.logger.error('Error bulk assigning issues', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to bulk assign issues',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Resolve issue
   */
  public resolveIssue = async (req: Request, res: Response): Promise<void> => {
    try {
      const { issueId } = req.params;
      const { resolution } = req.body;
      const context = this.buildContext(req);

      if (!resolution || !resolution.type || !resolution.description) {
        res.status(400).json({
          success: false,
          message: 'Resolution type and description are required',
        });
        return;
      }

      const issue = await this.issueService.resolveIssue(issueId, resolution, context);

      res.json({
        success: true,
        data: issue,
        message: 'Issue resolved successfully',
      });
    } catch (error) {
      this.logger.error('Error resolving issue', { error, issueId: req.params.issueId });
      res.status(500).json({
        success: false,
        message: 'Failed to resolve issue',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Reopen issue
   */
  public reopenIssue = async (req: Request, res: Response): Promise<void> => {
    try {
      const { issueId } = req.params;
      const { reason } = req.body;
      const context = this.buildContext(req);

      if (!reason) {
        res.status(400).json({
          success: false,
          message: 'Reason is required',
        });
        return;
      }

      const issue = await this.issueService.reopenIssue(issueId, reason, context);

      res.json({
        success: true,
        data: issue,
        message: 'Issue reopened successfully',
      });
    } catch (error) {
      this.logger.error('Error reopening issue', { error, issueId: req.params.issueId });
      res.status(500).json({
        success: false,
        message: 'Failed to reopen issue',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Build issue context from request
   */
  private buildContext(req: Request): IIssueContext {
    const user = (req as any).user; // Assuming user is attached by auth middleware
    
    return {
      userId: user?.userId || user?.id || 'anonymous',
      userRole: user?.role || 'viewer',
      permissions: user?.permissions || [],
      organizationId: user?.organizationId,
    };
  }

  /**
   * Validate required parameter exists
   */
  private validateParam(value: string | undefined, name: string): string {
    if (!value) {
      throw new Error(`${name} is required`);
    }
    return value;
  }

  /**
   * Build filters from query parameters
   */
  private buildFilters(query: any): any {
    const filters: any = {};

    if (query.status) filters.status = Array.isArray(query.status) ? query.status : [query.status];
    if (query.priority) filters.priority = Array.isArray(query.priority) ? query.priority : [query.priority];
    if (query.severity) filters.severity = Array.isArray(query.severity) ? query.severity : [query.severity];
    if (query.issueType) filters.issueType = Array.isArray(query.issueType) ? query.issueType : [query.issueType];
    if (query.assignee) filters.assignee = Array.isArray(query.assignee) ? query.assignee : [query.assignee];
    if (query.reporter) filters.reporter = Array.isArray(query.reporter) ? query.reporter : [query.reporter];
    if (query.threatLevel) filters.threatLevel = Array.isArray(query.threatLevel) ? query.threatLevel : [query.threatLevel];
    if (query.labels) filters.labels = Array.isArray(query.labels) ? query.labels : [query.labels];
    if (query.tags) filters.tags = Array.isArray(query.tags) ? query.tags : [query.tags];
    if (query.securityClassification) {
      filters.securityClassification = Array.isArray(query.securityClassification) 
        ? query.securityClassification 
        : [query.securityClassification];
    }
    if (query.teamAssignment) {
      filters.teamAssignment = Array.isArray(query.teamAssignment) 
        ? query.teamAssignment 
        : [query.teamAssignment];
    }

    if (query.createdAfter) filters.createdAfter = new Date(query.createdAfter);
    if (query.createdBefore) filters.createdBefore = new Date(query.createdBefore);
    if (query.dueAfter) filters.dueAfter = new Date(query.dueAfter);
    if (query.dueBefore) filters.dueBefore = new Date(query.dueBefore);

    return filters;
  }
}