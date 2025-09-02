/**
 * Simplified Issue Controller for initial implementation
 * This version focuses on core functionality with proper type handling
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

  constructor() {
    this.issueService = new IssueManagementService();
  }

  /**
   * Create a new issue
   */
  public createIssue = async (req: Request, res: Response): Promise<void> => {
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
      logger.error('Error creating issue', { error, body: req.body });
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
      const issueId = req.params.issueId;
      if (!issueId) {
        res.status(400).json({
          success: false,
          message: 'Issue ID is required',
        });
        return;
      }

      const context = this.buildContext(req);
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
      logger.error('Error retrieving issue', {
        error,
        issueId: req.params.issueId,
      });
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

      const issueId = req.params.issueId;
      if (!issueId) {
        res.status(400).json({
          success: false,
          message: 'Issue ID is required',
        });
        return;
      }

      const context = this.buildContext(req);
      const updates: IUpdateIssueRequest = req.body;

      const issue = await this.issueService.updateIssue(
        issueId,
        updates,
        context
      );

      res.json({
        success: true,
        data: issue,
        message: `Issue ${issue.ticketId} updated successfully`,
      });
    } catch (error) {
      logger.error('Error updating issue', {
        error,
        issueId: req.params.issueId,
      });
      res.status(500).json({
        success: false,
        message: 'Failed to update issue',
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
        sortBy: (req.query.sortBy as string) || 'updatedAt',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
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
      logger.error('Error searching issues', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to search issues',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Get issue metrics
   */
  public getIssueMetrics = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const context = this.buildContext(req);
      const filters = this.buildFilters(req.query);

      const metrics = await this.issueService.getIssueMetrics(filters, context);

      res.json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      logger.error('Error getting issue metrics', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to get issue metrics',
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

      const issueId = req.params.issueId;
      if (!issueId) {
        res.status(400).json({
          success: false,
          message: 'Issue ID is required',
        });
        return;
      }

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
      logger.error('Error adding comment', {
        error,
        issueId: req.params.issueId,
      });
      res.status(500).json({
        success: false,
        message: 'Failed to add comment',
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
      permissions: user?.permissions || ['view_issues'],
      organizationId: user?.organizationId,
    };
  }

  /**
   * Build filters from query parameters
   */
  private buildFilters(query: any): any {
    const filters: any = {};

    if (query.status)
      filters.status = Array.isArray(query.status)
        ? query.status
        : [query.status];
    if (query.priority)
      filters.priority = Array.isArray(query.priority)
        ? query.priority
        : [query.priority];
    if (query.severity)
      filters.severity = Array.isArray(query.severity)
        ? query.severity
        : [query.severity];
    if (query.issueType)
      filters.issueType = Array.isArray(query.issueType)
        ? query.issueType
        : [query.issueType];
    if (query.assignee)
      filters.assignee = Array.isArray(query.assignee)
        ? query.assignee
        : [query.assignee];
    if (query.reporter)
      filters.reporter = Array.isArray(query.reporter)
        ? query.reporter
        : [query.reporter];
    if (query.threatLevel)
      filters.threatLevel = Array.isArray(query.threatLevel)
        ? query.threatLevel
        : [query.threatLevel];
    if (query.labels)
      filters.labels = Array.isArray(query.labels)
        ? query.labels
        : [query.labels];
    if (query.tags)
      filters.tags = Array.isArray(query.tags) ? query.tags : [query.tags];

    if (query.createdAfter) filters.createdAfter = new Date(query.createdAfter);
    if (query.createdBefore)
      filters.createdBefore = new Date(query.createdBefore);
    if (query.dueAfter) filters.dueAfter = new Date(query.dueAfter);
    if (query.dueBefore) filters.dueBefore = new Date(query.dueBefore);

    return filters;
  }
}
