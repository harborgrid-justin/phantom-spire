/**
 * Issue Management System - Index
 * Fortune 100-Grade Issue & Ticket Tracker Entry Point
 */

// Core model
export { Issue, IIssue } from '../../models/Issue';

// Service interfaces
export * from './interfaces/IIssueManager';

// Core service implementation
export { IssueManagementService } from './IssueManagementService';

// Default configuration for common issue types
export const DEFAULT_ISSUE_CONFIGURATIONS = {
  SECURITY_INCIDENT: {
    issueType: 'incident' as const,
    priority: 'critical' as const,
    threatLevel: 'high' as const,
    securityClassification: 'confidential' as const,
    labels: ['security', 'incident-response'],
  },

  VULNERABILITY_REPORT: {
    issueType: 'vulnerability' as const,
    priority: 'high' as const,
    threatLevel: 'medium' as const,
    securityClassification: 'internal' as const,
    labels: ['vulnerability', 'security'],
  },

  THREAT_INVESTIGATION: {
    issueType: 'investigation' as const,
    priority: 'high' as const,
    threatLevel: 'high' as const,
    securityClassification: 'confidential' as const,
    labels: ['threat-hunting', 'investigation'],
  },

  COMPLIANCE_ISSUE: {
    issueType: 'compliance' as const,
    priority: 'medium' as const,
    securityClassification: 'internal' as const,
    labels: ['compliance', 'governance'],
  },

  FEATURE_REQUEST: {
    issueType: 'feature' as const,
    priority: 'medium' as const,
    securityClassification: 'internal' as const,
    labels: ['enhancement', 'feature'],
  },

  BUG_REPORT: {
    issueType: 'bug' as const,
    priority: 'medium' as const,
    securityClassification: 'internal' as const,
    labels: ['bug', 'defect'],
  },
};

// Pre-defined issue templates for quick creation
export const ISSUE_TEMPLATES = {
  SECURITY_INCIDENT: {
    title: 'Security Incident - [Brief Description]',
    description: `
## Incident Summary
[Brief description of the security incident]

## Impact Assessment
- **Affected Systems**: [List affected systems]
- **Data Exposure**: [Yes/No - Details if applicable]
- **User Impact**: [Description of user impact]

## Timeline
- **Discovery Time**: [When was the incident discovered]
- **Initial Response**: [When did response begin]

## Initial Findings
[What is currently known about the incident]

## Next Steps
- [ ] Contain the incident
- [ ] Preserve evidence
- [ ] Notify stakeholders
- [ ] Begin investigation

## Stakeholders
- **Incident Commander**: [Name]
- **Technical Lead**: [Name]
- **Communications Lead**: [Name]
    `,
    ...DEFAULT_ISSUE_CONFIGURATIONS.SECURITY_INCIDENT,
  },

  VULNERABILITY_ASSESSMENT: {
    title: 'Vulnerability Assessment - [System/Component]',
    description: `
## Vulnerability Details
- **CVE ID**: [CVE identifier if available]
- **CVSS Score**: [Score/10]
- **Severity**: [Critical/High/Medium/Low]

## Affected Systems
[List of systems affected by this vulnerability]

## Exploitation Potential
[Assessment of how this vulnerability could be exploited]

## Recommended Actions
- [ ] Patch deployment
- [ ] Configuration changes
- [ ] Monitoring implementation
- [ ] User awareness

## Timeline
- **Discovery Date**: [When vulnerability was identified]
- **Disclosure Date**: [When vendor disclosed]
- **Patch Availability**: [When patch became available]
    `,
    ...DEFAULT_ISSUE_CONFIGURATIONS.VULNERABILITY_REPORT,
  },

  THREAT_HUNTING: {
    title: 'Threat Hunting Investigation - [Threat/IOC]',
    description: `
## Threat Intelligence
- **Threat Actor**: [Known or suspected threat actor]
- **TTPs**: [Tactics, Techniques, and Procedures]
- **IOCs**: [List of Indicators of Compromise]

## Hypothesis
[What are we hunting for and why]

## Scope
[Systems, timeframe, and data sources to investigate]

## Methodology
- [ ] Log analysis
- [ ] Network traffic analysis
- [ ] Endpoint investigation
- [ ] Timeline reconstruction

## Initial Findings
[Document findings as investigation progresses]

## Recommendations
[Based on findings, what actions should be taken]
    `,
    ...DEFAULT_ISSUE_CONFIGURATIONS.THREAT_INVESTIGATION,
  },
};

// Workflow configurations for different issue types
export const WORKFLOW_CONFIGURATIONS = {
  INCIDENT_RESPONSE: {
    states: ['created', 'triaged', 'investigating', 'containing', 'eradicating', 'recovering', 'closed'],
    transitions: [
      { from: 'created', to: 'triaged' },
      { from: 'triaged', to: 'investigating' },
      { from: 'investigating', to: 'containing' },
      { from: 'containing', to: 'eradicating' },
      { from: 'eradicating', to: 'recovering' },
      { from: 'recovering', to: 'closed' },
    ],
  },

  VULNERABILITY_MANAGEMENT: {
    states: ['identified', 'assessed', 'prioritized', 'assigned', 'patching', 'testing', 'deployed', 'verified', 'closed'],
    transitions: [
      { from: 'identified', to: 'assessed' },
      { from: 'assessed', to: 'prioritized' },
      { from: 'prioritized', to: 'assigned' },
      { from: 'assigned', to: 'patching' },
      { from: 'patching', to: 'testing' },
      { from: 'testing', to: 'deployed' },
      { from: 'deployed', to: 'verified' },
      { from: 'verified', to: 'closed' },
    ],
  },

  STANDARD_ISSUE: {
    states: ['open', 'in_progress', 'on_hold', 'resolved', 'closed', 'rejected'],
    transitions: [
      { from: 'open', to: 'in_progress' },
      { from: 'open', to: 'on_hold' },
      { from: 'open', to: 'rejected' },
      { from: 'in_progress', to: 'on_hold' },
      { from: 'in_progress', to: 'resolved' },
      { from: 'on_hold', to: 'in_progress' },
      { from: 'on_hold', to: 'open' },
      { from: 'resolved', to: 'closed' },
      { from: 'resolved', to: 'open' }, // reopen
    ],
  },
};

// SLA configurations for different priority levels
export const SLA_CONFIGURATIONS = {
  critical: {
    responseTimeHours: 1,
    resolutionTimeHours: 4,
    escalationTimeHours: 2,
  },
  high: {
    responseTimeHours: 4,
    resolutionTimeHours: 24,
    escalationTimeHours: 8,
  },
  medium: {
    responseTimeHours: 8,
    resolutionTimeHours: 72,
    escalationTimeHours: 24,
  },
  low: {
    responseTimeHours: 24,
    resolutionTimeHours: 168, // 1 week
    escalationTimeHours: 72,
  },
};

// Security classifications and their access levels
export const SECURITY_CLASSIFICATIONS = {
  public: {
    level: 0,
    description: 'Information that can be shared publicly',
    allowedRoles: ['admin', 'manager', 'analyst', 'viewer'],
  },
  internal: {
    level: 1,
    description: 'Internal company information',
    allowedRoles: ['admin', 'manager', 'analyst'],
  },
  confidential: {
    level: 2,
    description: 'Confidential information with limited access',
    allowedRoles: ['admin', 'manager'],
  },
  restricted: {
    level: 3,
    description: 'Highly restricted information',
    allowedRoles: ['admin'],
  },
};

// Role-based permissions configuration
export const ROLE_PERMISSIONS = {
  admin: [
    'create_issues', 'edit_issues', 'delete_issues', 'resolve_issues',
    'close_issues', 'reject_issues', 'escalate_issues', 'assign_issues',
    'view_all_issues', 'edit_all_comments', 'delete_all_comments',
    'manage_workflows', 'view_metrics', 'export_data',
  ],
  security_manager: [
    'create_issues', 'edit_issues', 'resolve_issues', 'close_issues',
    'reject_issues', 'escalate_issues', 'assign_issues', 'view_all_issues',
    'view_metrics',
  ],
  analyst: [
    'create_issues', 'edit_issues', 'resolve_issues', 'escalate_issues',
    'assign_issues', 'view_metrics',
  ],
  viewer: [
    'view_issues',
  ],
};

// Integration helpers for CTI platform
export const CTI_INTEGRATION = {
  /**
   * Convert alert to issue
   */
  convertAlertToIssue: (alert: any) => ({
    title: `Security Alert - ${alert.title}`,
    description: `Alert converted from security monitoring system\n\n${alert.description}`,
    issueType: 'incident' as const,
    priority: alert.severity === 'critical' ? 'critical' as const : 'high' as const,
    threatLevel: alert.severity,
    affectedSystems: alert.affectedAssets || [],
    relatedAlerts: [alert.id],
    labels: ['alert-conversion', 'automated'],
    securityClassification: 'internal' as const,
  }),

  /**
   * Link issue to IOC
   */
  linkIssueToIOC: (issueId: string, iocId: string) => ({
    issueId,
    iocId,
    relationship: 'related_to' as const,
  }),

  /**
   * Create task from issue
   */
  createTaskFromIssue: (issue: any) => ({
    name: `Task for Issue ${issue.ticketId}`,
    type: issue.issueType === 'incident' ? 'evidence_collection' : 'data_analysis',
    priority: issue.priority,
    relatedIssue: issue._id,
    description: `Automated task created for issue: ${issue.title}`,
  }),
};

export default {
  DEFAULT_ISSUE_CONFIGURATIONS,
  ISSUE_TEMPLATES,
  WORKFLOW_CONFIGURATIONS,
  SLA_CONFIGURATIONS,
  SECURITY_CLASSIFICATIONS,
  ROLE_PERMISSIONS,
  CTI_INTEGRATION,
};