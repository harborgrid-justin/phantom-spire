/**
 * Issue Management Interfaces
 * Fortune 100-Grade Issue & Ticket Tracker
 */

import { IIssue } from '../../../models/Issue';

export interface ICreateIssueRequest {
  title: string;
  description: string;
  issueType: 'bug' | 'feature' | 'incident' | 'vulnerability' | 'threat' | 'investigation' | 'compliance' | 'enhancement';
  priority?: 'critical' | 'high' | 'medium' | 'low';
  severity?: 'critical' | 'major' | 'minor' | 'cosmetic';
  assignee?: string;
  reporter: string;
  watchers?: string[];
  teamAssignment?: string;
  threatLevel?: 'critical' | 'high' | 'medium' | 'low';
  affectedSystems?: string[];
  relatedIOCs?: string[];
  relatedAlerts?: string[];
  labels?: string[];
  tags?: string[];
  customFields?: Record<string, any>;
  dueDate?: Date;
  securityClassification?: 'public' | 'internal' | 'confidential' | 'restricted';
  complianceRequirements?: string[];
}

export interface IUpdateIssueRequest {
  title?: string;
  description?: string;
  issueType?: 'bug' | 'feature' | 'incident' | 'vulnerability' | 'threat' | 'investigation' | 'compliance' | 'enhancement';
  status?: 'open' | 'in_progress' | 'on_hold' | 'resolved' | 'closed' | 'rejected' | 'escalated';
  priority?: 'critical' | 'high' | 'medium' | 'low';
  severity?: 'critical' | 'major' | 'minor' | 'cosmetic';
  assignee?: string;
  watchers?: string[];
  teamAssignment?: string;
  threatLevel?: 'critical' | 'high' | 'medium' | 'low';
  affectedSystems?: string[];
  relatedIOCs?: string[];
  relatedAlerts?: string[];
  relatedTasks?: string[];
  labels?: string[];
  tags?: string[];
  customFields?: Record<string, any>;
  dueDate?: Date;
  estimatedHours?: number;
  complianceRequirements?: string[];
}

export interface IIssueFilter {
  status?: string[];
  priority?: string[];
  severity?: string[];
  issueType?: string[];
  assignee?: string[];
  reporter?: string[];
  threatLevel?: string[];
  labels?: string[];
  tags?: string[];
  createdAfter?: Date;
  createdBefore?: Date;
  dueAfter?: Date;
  dueBefore?: Date;
  securityClassification?: string[];
  teamAssignment?: string[];
}

export interface IIssueSearchQuery {
  query?: string;
  filters?: IIssueFilter;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  includeResolved?: boolean;
}

export interface IIssueComment {
  id: string;
  userId: string;
  content: string;
  timestamp: Date;
  isInternal: boolean;
  attachments?: Array<{
    filename: string;
    url: string;
    size: number;
  }>;
}

export interface IAddCommentRequest {
  issueId: string;
  userId: string;
  content: string;
  isInternal?: boolean;
  attachments?: Array<{
    filename: string;
    url: string;
    size: number;
  }>;
}

export interface IWorkflowTransition {
  fromStatus: string;
  toStatus: string;
  requiredRole?: string;
  requiredPermissions?: string[];
  autoAssign?: string;
  notifications?: string[];
  conditions?: Array<{
    field: string;
    operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
    value: any;
  }>;
}

export interface IEscalationRule {
  id: string;
  name: string;
  conditions: Array<{
    field: string;
    operator: 'equals' | 'greater_than' | 'less_than' | 'age_hours';
    value: any;
  }>;
  actions: Array<{
    type: 'assign' | 'notify' | 'change_priority' | 'change_status' | 'create_task';
    parameters: Record<string, any>;
  }>;
  enabled: boolean;
}

export interface IIssueMetrics {
  totalIssues: number;
  openIssues: number;
  resolvedIssues: number;
  averageResolutionTime: number;
  issuesByPriority: Record<string, number>;
  issuesByStatus: Record<string, number>;
  issuesByType: Record<string, number>;
  slaBreaches: number;
  overdueIssues: number;
  assigneeWorkload: Record<string, number>;
}

export interface IIssueContext {
  userId: string;
  userRole: string;
  permissions: string[];
  organizationId?: string;
}

export interface IIssueNotification {
  type: 'created' | 'assigned' | 'status_changed' | 'comment_added' | 'escalated' | 'resolved';
  issueId: string;
  recipientIds: string[];
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ITaskIntegration {
  issueId: string;
  taskId: string;
  taskType: string;
  relationship: 'spawned_from' | 'resolves' | 'blocks' | 'related_to';
  createdAt: Date;
  createdBy: string;
}

export interface IIssueAnalytics {
  resolutionTrends: Array<{
    date: Date;
    resolved: number;
    created: number;
  }>;
  priorityDistribution: Record<string, number>;
  averageTimeToResolution: Record<string, number>; // by priority
  topContributors: Array<{
    userId: string;
    issuesResolved: number;
  }>;
  teamPerformance: Record<string, {
    totalIssues: number;
    averageResolutionTime: number;
    slaCompliance: number;
  }>;
}

/**
 * Core Issue Management Interface
 */
export interface IIssueManager {
  // Core CRUD Operations
  createIssue(request: ICreateIssueRequest, context: IIssueContext): Promise<IIssue>;
  getIssue(issueId: string, context: IIssueContext): Promise<IIssue | null>;
  updateIssue(issueId: string, updates: IUpdateIssueRequest, context: IIssueContext): Promise<IIssue>;
  deleteIssue(issueId: string, context: IIssueContext): Promise<boolean>;
  
  // Search and Query
  searchIssues(query: IIssueSearchQuery, context: IIssueContext): Promise<{
    issues: IIssue[];
    totalCount: number;
    page: number;
    totalPages: number;
  }>;
  getIssuesByFilter(filter: IIssueFilter, context: IIssueContext): Promise<IIssue[]>;
  
  // Workflow Management
  transitionIssueStatus(issueId: string, newStatus: string, context: IIssueContext, notes?: string): Promise<IIssue>;
  getAvailableTransitions(issueId: string, context: IIssueContext): Promise<IWorkflowTransition[]>;
  
  // Assignment and Ownership
  assignIssue(issueId: string, assigneeId: string, context: IIssueContext): Promise<IIssue>;
  unassignIssue(issueId: string, context: IIssueContext): Promise<IIssue>;
  addWatcher(issueId: string, watcherId: string, context: IIssueContext): Promise<IIssue>;
  removeWatcher(issueId: string, watcherId: string, context: IIssueContext): Promise<IIssue>;
  
  // Comments and Communication
  addComment(request: IAddCommentRequest, context: IIssueContext): Promise<IIssue>;
  updateComment(issueId: string, commentId: string, content: string, context: IIssueContext): Promise<IIssue>;
  deleteComment(issueId: string, commentId: string, context: IIssueContext): Promise<IIssue>;
  
  // Time Tracking
  logTime(issueId: string, hours: number, description: string, context: IIssueContext): Promise<IIssue>;
  getTimeSpent(issueId: string, context: IIssueContext): Promise<number>;
  
  // Escalation
  escalateIssue(issueId: string, reason: string, context: IIssueContext): Promise<IIssue>;
  processEscalationRules(): Promise<void>;
  
  // Integration
  linkToTask(issueId: string, taskId: string, relationship: string, context: IIssueContext): Promise<ITaskIntegration>;
  unlinkFromTask(issueId: string, taskId: string, context: IIssueContext): Promise<boolean>;
  getRelatedTasks(issueId: string, context: IIssueContext): Promise<ITaskIntegration[]>;
  
  // Analytics and Reporting
  getIssueMetrics(filter?: IIssueFilter, context?: IIssueContext): Promise<IIssueMetrics>;
  getIssueAnalytics(startDate: Date, endDate: Date, context?: IIssueContext): Promise<IIssueAnalytics>;
  
  // Bulk Operations
  bulkUpdateIssues(issueIds: string[], updates: IUpdateIssueRequest, context: IIssueContext): Promise<IIssue[]>;
  bulkAssignIssues(issueIds: string[], assigneeId: string, context: IIssueContext): Promise<IIssue[]>;
  
  // Resolution
  resolveIssue(issueId: string, resolution: {
    type: 'fixed' | 'wont_fix' | 'duplicate' | 'invalid' | 'works_as_designed';
    description: string;
  }, context: IIssueContext): Promise<IIssue>;
  reopenIssue(issueId: string, reason: string, context: IIssueContext): Promise<IIssue>;
}