/**
 * Fortune 100-Grade Issue Management Service
 * Enterprise-level issue & ticket tracking for Cyber Threat Intelligence Platform
 */

import { v4 as uuidv4 } from 'uuid';
import { IIssue, Issue } from '../../models/Issue.js';
import {
  IIssueManager,
  ICreateIssueRequest,
  IUpdateIssueRequest,
  IIssueFilter,
  IIssueSearchQuery,
  IAddCommentRequest,
  IIssueContext,
  IWorkflowTransition,
  IEscalationRule,
  IIssueMetrics,
  ITaskIntegration,
  IIssueAnalytics,
  IIssueNotification
} from './interfaces/IIssueManager.js';
import { logger } from '../../utils/logger.js';

export class IssueManagementService implements IIssueManager {
  private logger = logger;
  
  // Workflow transitions configuration
  private workflowTransitions: IWorkflowTransition[] = [
    { fromStatus: 'open', toStatus: 'in_progress' },
    { fromStatus: 'open', toStatus: 'on_hold' },
    { fromStatus: 'open', toStatus: 'resolved', requiredPermissions: ['resolve_issues'] },
    { fromStatus: 'open', toStatus: 'rejected', requiredPermissions: ['reject_issues'] },
    { fromStatus: 'in_progress', toStatus: 'on_hold' },
    { fromStatus: 'in_progress', toStatus: 'resolved', requiredPermissions: ['resolve_issues'] },
    { fromStatus: 'in_progress', toStatus: 'escalated' },
    { fromStatus: 'on_hold', toStatus: 'in_progress' },
    { fromStatus: 'on_hold', toStatus: 'open' },
    { fromStatus: 'resolved', toStatus: 'closed', requiredPermissions: ['close_issues'] },
    { fromStatus: 'resolved', toStatus: 'open' }, // reopen
    { fromStatus: 'escalated', toStatus: 'in_progress' },
  ];

  // Escalation rules
  private escalationRules: IEscalationRule[] = [
    {
      id: 'critical-priority-auto-escalate',
      name: 'Critical Priority Auto-Escalation',
      conditions: [
        { field: 'priority', operator: 'equals', value: 'critical' },
        { field: 'age_hours', operator: 'greater_than', value: 2 }
      ],
      actions: [
        { type: 'change_status', parameters: { status: 'escalated' } },
        { type: 'notify', parameters: { roles: ['security_manager', 'ciso'] } }
      ],
      enabled: true
    },
    {
      id: 'threat-level-critical-escalate',
      name: 'Critical Threat Level Escalation',
      conditions: [
        { field: 'threatLevel', operator: 'equals', value: 'critical' },
        { field: 'status', operator: 'equals', value: 'open' },
        { field: 'age_hours', operator: 'greater_than', value: 1 }
      ],
      actions: [
        { type: 'assign', parameters: { team: 'incident-response' } },
        { type: 'change_priority', parameters: { priority: 'critical' } },
        { type: 'create_task', parameters: { taskType: 'evidence_collection' } }
      ],
      enabled: true
    }
  ];

  /**
   * Create a new issue
   */
  async createIssue(request: ICreateIssueRequest, context: IIssueContext): Promise<IIssue> {
    try {
      this.logger.info('Creating new issue', { title: request.title, type: request.issueType });

      const issue = new Issue({
        ...request,
        reporter: context.userId,
        workflowState: {
          currentStage: 'created',
          stageHistory: [{
            stage: 'created',
            timestamp: new Date(),
            actor: context.userId,
            notes: 'Issue created'
          }]
        },
        auditTrail: [{
          timestamp: new Date(),
          userId: context.userId,
          action: 'created',
          notes: 'Issue created'
        }]
      });

      const savedIssue = await issue.save();
      
      // Send notification
      await this.sendNotification({
        type: 'created',
        issueId: savedIssue._id?.toString() || savedIssue.id,
        recipientIds: this.getNotificationRecipients(savedIssue, 'created'),
        content: `Issue ${savedIssue.ticketId} has been created`,
        timestamp: new Date()
      });

      // Check for auto-assignment or escalation
      await this.processAutoActions(savedIssue);

      this.logger.info('Issue created successfully', { ticketId: savedIssue.ticketId });
      return savedIssue;
    } catch (error) {
      this.logger.error('Error creating issue', { error, request });
      throw error;
    }
  }

  /**
   * Get issue by ID
   */
  async getIssue(issueId: string, context: IIssueContext): Promise<IIssue | null> {
    try {
      const issue = await Issue.findById(issueId);
      
      if (!issue) {
        return null;
      }

      // Check access permissions
      if (!this.hasAccessToIssue(issue, context)) {
        throw new Error('Access denied to this issue');
      }

      return issue;
    } catch (error) {
      this.logger.error('Error retrieving issue', { error, issueId });
      throw error;
    }
  }

  /**
   * Update an issue
   */
  async updateIssue(issueId: string, updates: IUpdateIssueRequest, context: IIssueContext): Promise<IIssue> {
    try {
      const issue = await Issue.findById(issueId);
      if (!issue) {
        throw new Error('Issue not found');
      }

      if (!this.hasUpdatePermission(issue, context)) {
        throw new Error('Permission denied to update this issue');
      }

      // Track changes for audit trail
      const changes = this.trackChanges(issue, updates);
      
      // Update the issue
      Object.assign(issue, updates);
      issue.auditTrail.push({
        timestamp: new Date(),
        userId: context.userId,
        action: 'updated',
        notes: `Updated fields: ${Object.keys(updates).join(', ')}`
      });

      const updatedIssue = await issue.save();

      // Send notifications for significant changes
      if (changes.length > 0) {
        await this.sendChangeNotifications(updatedIssue, changes, context);
      }

      this.logger.info('Issue updated successfully', { ticketId: updatedIssue.ticketId, changes });
      return updatedIssue;
    } catch (error) {
      this.logger.error('Error updating issue', { error, issueId, updates });
      throw error;
    }
  }

  /**
   * Delete an issue (soft delete with audit trail)
   */
  async deleteIssue(issueId: string, context: IIssueContext): Promise<boolean> {
    try {
      const issue = await Issue.findById(issueId);
      if (!issue) {
        return false;
      }

      if (!this.hasDeletePermission(issue, context)) {
        throw new Error('Permission denied to delete this issue');
      }

      // Add deletion audit trail
      issue.auditTrail.push({
        timestamp: new Date(),
        userId: context.userId,
        action: 'deleted',
        notes: 'Issue deleted'
      });

      // Mark as deleted instead of actually deleting
      issue.status = 'closed';
      issue.customFields.deleted = true;
      issue.customFields.deletedAt = new Date();
      issue.customFields.deletedBy = context.userId;
      
      await issue.save();

      this.logger.info('Issue deleted successfully', { ticketId: issue.ticketId });
      return true;
    } catch (error) {
      this.logger.error('Error deleting issue', { error, issueId });
      throw error;
    }
  }

  /**
   * Search issues with advanced filtering
   */
  async searchIssues(query: IIssueSearchQuery, context: IIssueContext): Promise<{
    issues: IIssue[];
    totalCount: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const { query: searchQuery, filters, sortBy = 'updatedAt', sortOrder = 'desc', page = 1, limit = 50, includeResolved = false } = query;

      // Build MongoDB query
      const mongoQuery: any = {};

      // Text search
      if (searchQuery) {
        mongoQuery.$text = { $search: searchQuery };
      }

      // Apply filters
      if (filters) {
        this.applyFilters(mongoQuery, filters);
      }

      // Security classification filtering
      if (!context.permissions.includes('view_all_issues')) {
        mongoQuery.securityClassification = { $in: this.getAllowedClassifications(context) };
      }

      // Exclude resolved issues unless explicitly requested
      if (!includeResolved) {
        mongoQuery.status = { $nin: ['resolved', 'closed'] };
      }

      // Apply soft delete filter
      mongoQuery['customFields.deleted'] = { $ne: true };

      // Execute query with pagination
      const skip = (page - 1) * limit;
      const sort: any = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      const [issues, totalCount] = await Promise.all([
        Issue.find(mongoQuery).sort(sort).skip(skip).limit(limit),
        Issue.countDocuments(mongoQuery)
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return {
        issues,
        totalCount,
        page,
        totalPages
      };
    } catch (error) {
      this.logger.error('Error searching issues', { error, query });
      throw error;
    }
  }

  /**
   * Get issues by filter
   */
  async getIssuesByFilter(filter: IIssueFilter, context: IIssueContext): Promise<IIssue[]> {
    const query: IIssueSearchQuery = { filters: filter };
    const result = await this.searchIssues(query, context);
    return result.issues;
  }

  /**
   * Transition issue status with workflow validation
   */
  async transitionIssueStatus(issueId: string, newStatus: string, context: IIssueContext, notes?: string): Promise<IIssue> {
    try {
      const issue = await Issue.findById(issueId);
      if (!issue) {
        throw new Error('Issue not found');
      }

      // Validate transition
      const validTransition = this.workflowTransitions.find(t => 
        t.fromStatus === issue.status && t.toStatus === newStatus
      );

      if (!validTransition) {
        throw new Error(`Invalid status transition from ${issue.status} to ${newStatus}`);
      }

      // Check permissions
      if (validTransition.requiredPermissions) {
        const hasPermission = validTransition.requiredPermissions.every(perm => 
          context.permissions.includes(perm)
        );
        if (!hasPermission) {
          throw new Error('Insufficient permissions for this status transition');
        }
      }

      // Update status and workflow
      const oldStatus = issue.status;
      issue.status = newStatus as any;
      issue.workflowState.currentStage = newStatus;
      issue.workflowState.stageHistory.push({
        stage: newStatus,
        timestamp: new Date(),
        actor: context.userId,
        notes: notes || `Status changed from ${oldStatus} to ${newStatus}`
      });

      // Add audit trail
      issue.auditTrail.push({
        timestamp: new Date(),
        userId: context.userId,
        action: 'status_changed',
        field: 'status',
        oldValue: oldStatus,
        newValue: newStatus,
        notes
      });

      const updatedIssue = await issue.save();

      // Send notification
      await this.sendNotification({
        type: 'status_changed',
        issueId: updatedIssue._id.toString(),
        recipientIds: this.getNotificationRecipients(updatedIssue, 'status_changed'),
        content: `Issue ${updatedIssue.ticketId} status changed from ${oldStatus} to ${newStatus}`,
        timestamp: new Date()
      });

      this.logger.info('Issue status transitioned', { 
        ticketId: updatedIssue.ticketId, 
        from: oldStatus, 
        to: newStatus 
      });

      return updatedIssue;
    } catch (error) {
      this.logger.error('Error transitioning issue status', { error, issueId, newStatus });
      throw error;
    }
  }

  /**
   * Get available status transitions for an issue
   */
  async getAvailableTransitions(issueId: string, context: IIssueContext): Promise<IWorkflowTransition[]> {
    const issue = await Issue.findById(issueId);
    if (!issue) {
      throw new Error('Issue not found');
    }

    return this.workflowTransitions.filter(t => {
      if (t.fromStatus !== issue.status) return false;
      
      if (t.requiredPermissions) {
        return t.requiredPermissions.every(perm => context.permissions.includes(perm));
      }
      
      return true;
    });
  }

  /**
   * Assign issue to user
   */
  async assignIssue(issueId: string, assigneeId: string, context: IIssueContext): Promise<IIssue> {
    try {
      const issue = await Issue.findById(issueId);
      if (!issue) {
        throw new Error('Issue not found');
      }

      const oldAssignee = issue.assignee;
      issue.assignee = assigneeId;
      issue.auditTrail.push({
        timestamp: new Date(),
        userId: context.userId,
        action: 'assigned',
        field: 'assignee',
        oldValue: oldAssignee,
        newValue: assigneeId
      });

      const updatedIssue = await issue.save();

      // Send notification to new assignee
      await this.sendNotification({
        type: 'assigned',
        issueId: updatedIssue._id.toString(),
        recipientIds: [assigneeId],
        content: `You have been assigned to issue ${updatedIssue.ticketId}`,
        timestamp: new Date()
      });

      this.logger.info('Issue assigned', { ticketId: updatedIssue.ticketId, assignee: assigneeId });
      return updatedIssue;
    } catch (error) {
      this.logger.error('Error assigning issue', { error, issueId, assigneeId });
      throw error;
    }
  }

  /**
   * Unassign issue
   */
  async unassignIssue(issueId: string, context: IIssueContext): Promise<IIssue> {
    const issue = await Issue.findById(issueId);
    if (!issue) {
      throw new Error('Issue not found');
    }

    const oldAssignee = issue.assignee;
    issue.assignee = undefined;
    issue.auditTrail.push({
      timestamp: new Date(),
      userId: context.userId,
      action: 'unassigned',
      field: 'assignee',
      oldValue: oldAssignee,
      newValue: null
    });

    return await issue.save();
  }

  /**
   * Add watcher to issue
   */
  async addWatcher(issueId: string, watcherId: string, context: IIssueContext): Promise<IIssue> {
    const issue = await Issue.findById(issueId);
    if (!issue) {
      throw new Error('Issue not found');
    }

    if (!issue.watchers.includes(watcherId)) {
      issue.watchers.push(watcherId);
      await issue.save();
    }

    return issue;
  }

  /**
   * Remove watcher from issue
   */
  async removeWatcher(issueId: string, watcherId: string, context: IIssueContext): Promise<IIssue> {
    const issue = await Issue.findById(issueId);
    if (!issue) {
      throw new Error('Issue not found');
    }

    issue.watchers = issue.watchers.filter(w => w !== watcherId);
    return await issue.save();
  }

  /**
   * Add comment to issue
   */
  async addComment(request: IAddCommentRequest, context: IIssueContext): Promise<IIssue> {
    try {
      const issue = await Issue.findById(request.issueId);
      if (!issue) {
        throw new Error('Issue not found');
      }

      const comment = {
        id: uuidv4(),
        userId: request.userId,
        content: request.content,
        timestamp: new Date(),
        isInternal: request.isInternal || false,
        attachments: request.attachments || []
      };

      issue.comments.push(comment);
      issue.auditTrail.push({
        timestamp: new Date(),
        userId: context.userId,
        action: 'comment_added',
        notes: `Comment added: ${request.content.substring(0, 100)}...`
      });

      const updatedIssue = await issue.save();

      // Send notification
      if (!request.isInternal) {
        await this.sendNotification({
          type: 'comment_added',
          issueId: updatedIssue._id.toString(),
          recipientIds: this.getNotificationRecipients(updatedIssue, 'comment_added'),
          content: `New comment added to issue ${updatedIssue.ticketId}`,
          timestamp: new Date()
        });
      }

      return updatedIssue;
    } catch (error) {
      this.logger.error('Error adding comment', { error, request });
      throw error;
    }
  }

  /**
   * Update comment
   */
  async updateComment(issueId: string, commentId: string, content: string, context: IIssueContext): Promise<IIssue> {
    const issue = await Issue.findById(issueId);
    if (!issue) {
      throw new Error('Issue not found');
    }

    const comment = issue.comments.find(c => c.id === commentId);
    if (!comment) {
      throw new Error('Comment not found');
    }

    if (comment.userId !== context.userId && !context.permissions.includes('edit_all_comments')) {
      throw new Error('Permission denied to edit this comment');
    }

    comment.content = content;
    return await issue.save();
  }

  /**
   * Delete comment
   */
  async deleteComment(issueId: string, commentId: string, context: IIssueContext): Promise<IIssue> {
    const issue = await Issue.findById(issueId);
    if (!issue) {
      throw new Error('Issue not found');
    }

    const commentIndex = issue.comments.findIndex(c => c.id === commentId);
    if (commentIndex === -1) {
      throw new Error('Comment not found');
    }

    const comment = issue.comments[commentIndex];
    if (comment.userId !== context.userId && !context.permissions.includes('delete_all_comments')) {
      throw new Error('Permission denied to delete this comment');
    }

    issue.comments.splice(commentIndex, 1);
    return await issue.save();
  }

  /**
   * Log time spent on issue
   */
  async logTime(issueId: string, hours: number, description: string, context: IIssueContext): Promise<IIssue> {
    const issue = await Issue.findById(issueId);
    if (!issue) {
      throw new Error('Issue not found');
    }

    issue.timeSpent.push({
      userId: context.userId,
      hours,
      date: new Date(),
      description
    });

    // Update total actual hours
    issue.actualHours = (issue.actualHours || 0) + hours;

    return await issue.save();
  }

  /**
   * Get total time spent on issue
   */
  async getTimeSpent(issueId: string, context: IIssueContext): Promise<number> {
    const issue = await Issue.findById(issueId);
    if (!issue) {
      throw new Error('Issue not found');
    }

    return issue.timeSpent.reduce((total, entry) => total + entry.hours, 0);
  }

  /**
   * Escalate issue
   */
  async escalateIssue(issueId: string, reason: string, context: IIssueContext): Promise<IIssue> {
    const issue = await Issue.findById(issueId);
    if (!issue) {
      throw new Error('Issue not found');
    }

    issue.status = 'escalated';
    issue.auditTrail.push({
      timestamp: new Date(),
      userId: context.userId,
      action: 'escalated',
      notes: reason
    });

    const updatedIssue = await issue.save();

    // Send escalation notification
    await this.sendNotification({
      type: 'escalated',
      issueId: updatedIssue._id.toString(),
      recipientIds: this.getEscalationRecipients(updatedIssue),
      content: `Issue ${updatedIssue.ticketId} has been escalated: ${reason}`,
      timestamp: new Date()
    });

    return updatedIssue;
  }

  /**
   * Process escalation rules
   */
  async processEscalationRules(): Promise<void> {
    try {
      for (const rule of this.escalationRules.filter(r => r.enabled)) {
        const issues = await this.findIssuesMatchingRule(rule);
        
        for (const issue of issues) {
          await this.executeEscalationActions(issue, rule);
        }
      }
    } catch (error) {
      this.logger.error('Error processing escalation rules', { error });
    }
  }

  /**
   * Link issue to task
   */
  async linkToTask(issueId: string, taskId: string, relationship: string, context: IIssueContext): Promise<ITaskIntegration> {
    const issue = await Issue.findById(issueId);
    if (!issue) {
      throw new Error('Issue not found');
    }

    if (!issue.relatedTasks.includes(taskId)) {
      issue.relatedTasks.push(taskId);
      await issue.save();
    }

    const integration: ITaskIntegration = {
      issueId,
      taskId,
      taskType: 'unknown', // This would be populated from the task system
      relationship: relationship as any,
      createdAt: new Date(),
      createdBy: context.userId
    };

    return integration;
  }

  /**
   * Unlink issue from task
   */
  async unlinkFromTask(issueId: string, taskId: string, context: IIssueContext): Promise<boolean> {
    const issue = await Issue.findById(issueId);
    if (!issue) {
      return false;
    }

    issue.relatedTasks = issue.relatedTasks.filter(t => t !== taskId);
    await issue.save();
    return true;
  }

  /**
   * Get related tasks for issue
   */
  async getRelatedTasks(issueId: string, context: IIssueContext): Promise<ITaskIntegration[]> {
    const issue = await Issue.findById(issueId);
    if (!issue) {
      throw new Error('Issue not found');
    }

    // This would integrate with the actual task management system
    return issue.relatedTasks.map(taskId => ({
      issueId,
      taskId,
      taskType: 'unknown',
      relationship: 'related_to' as any,
      createdAt: new Date(),
      createdBy: 'system'
    }));
  }

  /**
   * Get issue metrics
   */
  async getIssueMetrics(filter?: IIssueFilter, context?: IIssueContext): Promise<IIssueMetrics> {
    const mongoQuery: any = {};
    if (filter) {
      this.applyFilters(mongoQuery, filter);
    }

    const [
      totalIssues,
      openIssues,
      resolvedIssues,
      priorityDistribution,
      statusDistribution,
      typeDistribution
    ] = await Promise.all([
      Issue.countDocuments(mongoQuery),
      Issue.countDocuments({ ...mongoQuery, status: { $in: ['open', 'in_progress'] } }),
      Issue.countDocuments({ ...mongoQuery, status: 'resolved' }),
      this.getDistribution(mongoQuery, 'priority'),
      this.getDistribution(mongoQuery, 'status'),
      this.getDistribution(mongoQuery, 'issueType')
    ]);

    return {
      totalIssues,
      openIssues,
      resolvedIssues,
      averageResolutionTime: 0, // This would require more complex aggregation
      issuesByPriority: priorityDistribution,
      issuesByStatus: statusDistribution,
      issuesByType: typeDistribution,
      slaBreaches: 0, // This would require SLA calculation
      overdueIssues: await Issue.countDocuments({ ...mongoQuery, dueDate: { $lt: new Date() }, status: { $nin: ['resolved', 'closed'] } }),
      assigneeWorkload: {}
    };
  }

  /**
   * Get issue analytics
   */
  async getIssueAnalytics(startDate: Date, endDate: Date, context?: IIssueContext): Promise<IIssueAnalytics> {
    // This would require complex aggregation queries
    return {
      resolutionTrends: [],
      priorityDistribution: {},
      averageTimeToResolution: {},
      topContributors: [],
      teamPerformance: {}
    };
  }

  /**
   * Bulk update issues
   */
  async bulkUpdateIssues(issueIds: string[], updates: IUpdateIssueRequest, context: IIssueContext): Promise<IIssue[]> {
    const updatedIssues: IIssue[] = [];
    
    for (const issueId of issueIds) {
      try {
        const updated = await this.updateIssue(issueId, updates, context);
        updatedIssues.push(updated);
      } catch (error) {
        this.logger.error('Error in bulk update', { error, issueId });
      }
    }

    return updatedIssues;
  }

  /**
   * Bulk assign issues
   */
  async bulkAssignIssues(issueIds: string[], assigneeId: string, context: IIssueContext): Promise<IIssue[]> {
    const assignedIssues: IIssue[] = [];
    
    for (const issueId of issueIds) {
      try {
        const assigned = await this.assignIssue(issueId, assigneeId, context);
        assignedIssues.push(assigned);
      } catch (error) {
        this.logger.error('Error in bulk assignment', { error, issueId });
      }
    }

    return assignedIssues;
  }

  /**
   * Resolve issue
   */
  async resolveIssue(issueId: string, resolution: {
    type: 'fixed' | 'wont_fix' | 'duplicate' | 'invalid' | 'works_as_designed';
    description: string;
  }, context: IIssueContext): Promise<IIssue> {
    const issue = await Issue.findById(issueId);
    if (!issue) {
      throw new Error('Issue not found');
    }

    issue.status = 'resolved';
    issue.resolution = {
      ...resolution,
      resolvedBy: context.userId,
      resolvedAt: new Date()
    };

    issue.auditTrail.push({
      timestamp: new Date(),
      userId: context.userId,
      action: 'resolved',
      notes: `Resolved as ${resolution.type}: ${resolution.description}`
    });

    const updatedIssue = await issue.save();

    // Send notification
    await this.sendNotification({
      type: 'resolved',
      issueId: updatedIssue._id.toString(),
      recipientIds: this.getNotificationRecipients(updatedIssue, 'resolved'),
      content: `Issue ${updatedIssue.ticketId} has been resolved`,
      timestamp: new Date()
    });

    return updatedIssue;
  }

  /**
   * Reopen issue
   */
  async reopenIssue(issueId: string, reason: string, context: IIssueContext): Promise<IIssue> {
    const issue = await Issue.findById(issueId);
    if (!issue) {
      throw new Error('Issue not found');
    }

    issue.status = 'open';
    issue.resolution = undefined;
    issue.auditTrail.push({
      timestamp: new Date(),
      userId: context.userId,
      action: 'reopened',
      notes: reason
    });

    return await issue.save();
  }

  // Private helper methods
  private hasAccessToIssue(issue: IIssue, context: IIssueContext): boolean {
    // Check security classification
    const allowedClassifications = this.getAllowedClassifications(context);
    return allowedClassifications.includes(issue.securityClassification);
  }

  private hasUpdatePermission(issue: IIssue, context: IIssueContext): boolean {
    return context.permissions.includes('edit_issues') || issue.reporter === context.userId || issue.assignee === context.userId;
  }

  private hasDeletePermission(issue: IIssue, context: IIssueContext): boolean {
    return context.permissions.includes('delete_issues') || issue.reporter === context.userId;
  }

  private getAllowedClassifications(context: IIssueContext): string[] {
    const role = context.userRole;
    switch (role) {
      case 'admin': return ['public', 'internal', 'confidential', 'restricted'];
      case 'security_manager': return ['public', 'internal', 'confidential'];
      case 'analyst': return ['public', 'internal'];
      default: return ['public'];
    }
  }

  private applyFilters(mongoQuery: any, filters: IIssueFilter): void {
    if (filters.status) mongoQuery.status = { $in: filters.status };
    if (filters.priority) mongoQuery.priority = { $in: filters.priority };
    if (filters.severity) mongoQuery.severity = { $in: filters.severity };
    if (filters.issueType) mongoQuery.issueType = { $in: filters.issueType };
    if (filters.assignee) mongoQuery.assignee = { $in: filters.assignee };
    if (filters.reporter) mongoQuery.reporter = { $in: filters.reporter };
    if (filters.threatLevel) mongoQuery.threatLevel = { $in: filters.threatLevel };
    if (filters.labels) mongoQuery.labels = { $in: filters.labels };
    if (filters.tags) mongoQuery.tags = { $in: filters.tags };
    if (filters.securityClassification) mongoQuery.securityClassification = { $in: filters.securityClassification };
    if (filters.teamAssignment) mongoQuery.teamAssignment = { $in: filters.teamAssignment };
    
    if (filters.createdAfter || filters.createdBefore) {
      mongoQuery.createdAt = {};
      if (filters.createdAfter) mongoQuery.createdAt.$gte = filters.createdAfter;
      if (filters.createdBefore) mongoQuery.createdAt.$lte = filters.createdBefore;
    }

    if (filters.dueAfter || filters.dueBefore) {
      mongoQuery.dueDate = {};
      if (filters.dueAfter) mongoQuery.dueDate.$gte = filters.dueAfter;
      if (filters.dueBefore) mongoQuery.dueDate.$lte = filters.dueBefore;
    }
  }

  private trackChanges(original: IIssue, updates: IUpdateIssueRequest): Array<{field: string, oldValue: any, newValue: any}> {
    const changes: Array<{field: string, oldValue: any, newValue: any}> = [];
    
    for (const [key, newValue] of Object.entries(updates)) {
      const oldValue = (original as any)[key];
      if (oldValue !== newValue) {
        changes.push({ field: key, oldValue, newValue });
      }
    }

    return changes;
  }

  private async sendNotification(notification: IIssueNotification): Promise<void> {
    // This would integrate with the notification system
    this.logger.info('Sending notification', { type: notification.type, issueId: notification.issueId });
  }

  private getNotificationRecipients(issue: IIssue, type: string): string[] {
    const recipients: string[] = [];
    
    // Always notify reporter and assignee
    recipients.push(issue.reporter);
    if (issue.assignee && !recipients.includes(issue.assignee)) {
      recipients.push(issue.assignee);
    }

    // Add watchers
    issue.watchers.forEach(watcher => {
      if (!recipients.includes(watcher)) {
        recipients.push(watcher);
      }
    });

    return recipients;
  }

  private getEscalationRecipients(issue: IIssue): string[] {
    // This would return manager/escalation recipient IDs
    return [];
  }

  private async sendChangeNotifications(issue: IIssue, changes: Array<{field: string, oldValue: any, newValue: any}>, context: IIssueContext): Promise<void> {
    // Send notifications for significant changes
    const significantChanges = changes.filter(c => ['status', 'priority', 'assignee'].includes(c.field));
    if (significantChanges.length > 0) {
      await this.sendNotification({
        type: 'status_changed',
        issueId: issue._id.toString(),
        recipientIds: this.getNotificationRecipients(issue, 'status_changed'),
        content: `Issue ${issue.ticketId} updated: ${significantChanges.map(c => c.field).join(', ')}`,
        timestamp: new Date()
      });
    }
  }

  private async processAutoActions(issue: IIssue): Promise<void> {
    // Process auto-assignment and escalation rules
    for (const rule of this.escalationRules.filter(r => r.enabled)) {
      if (this.issueMatchesRule(issue, rule)) {
        await this.executeEscalationActions(issue, rule);
      }
    }
  }

  private issueMatchesRule(issue: IIssue, rule: IEscalationRule): boolean {
    return rule.conditions.every(condition => {
      switch (condition.field) {
        case 'priority':
          return condition.operator === 'equals' ? issue.priority === condition.value : true;
        case 'threatLevel':
          return condition.operator === 'equals' ? issue.threatLevel === condition.value : true;
        case 'status':
          return condition.operator === 'equals' ? issue.status === condition.value : true;
        case 'age_hours':
          const hoursSinceCreated = (Date.now() - issue.createdAt.getTime()) / (1000 * 60 * 60);
          return condition.operator === 'greater_than' ? hoursSinceCreated > condition.value : true;
        default:
          return false;
      }
    });
  }

  private async findIssuesMatchingRule(rule: IEscalationRule): Promise<IIssue[]> {
    const mongoQuery: any = {};
    
    rule.conditions.forEach(condition => {
      if (condition.field === 'age_hours') {
        const thresholdDate = new Date(Date.now() - (condition.value * 60 * 60 * 1000));
        mongoQuery.createdAt = { $lt: thresholdDate };
      } else if (condition.field !== 'age_hours') {
        mongoQuery[condition.field] = condition.value;
      }
    });

    return await Issue.find(mongoQuery);
  }

  private async executeEscalationActions(issue: IIssue, rule: IEscalationRule): Promise<void> {
    for (const action of rule.actions) {
      switch (action.type) {
        case 'change_status':
          if (action.parameters.status !== issue.status) {
            issue.status = action.parameters.status;
            await issue.save();
          }
          break;
        case 'change_priority':
          if (action.parameters.priority !== issue.priority) {
            issue.priority = action.parameters.priority;
            await issue.save();
          }
          break;
        case 'assign':
          if (action.parameters.team && !issue.teamAssignment) {
            issue.teamAssignment = action.parameters.team;
            await issue.save();
          }
          break;
        case 'notify':
          // Send notifications
          break;
        case 'create_task':
          // This would integrate with the task management system
          break;
      }
    }
  }

  private async getDistribution(query: any, field: string): Promise<Record<string, number>> {
    const result = await Issue.aggregate([
      { $match: query },
      { $group: { _id: `$${field}`, count: { $sum: 1 } } }
    ]);

    const distribution: Record<string, number> = {};
    result.forEach(item => {
      distribution[item._id || 'unknown'] = item.count;
    });

    return distribution;
  }
}