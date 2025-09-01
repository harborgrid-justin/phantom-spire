/**
 * Fortune 100-Grade Issue & Ticket Tracker Model
 * Enterprise-level issue management for Cyber Threat Intelligence Platform
 */

import { Schema, model, Document } from 'mongoose';

export interface IIssue extends Document {
  // Core Issue Information
  ticketId: string;
  title: string;
  description: string;
  issueType:
    | 'bug'
    | 'feature'
    | 'incident'
    | 'vulnerability'
    | 'threat'
    | 'investigation'
    | 'compliance'
    | 'enhancement';

  // Status and Workflow
  status:
    | 'open'
    | 'in_progress'
    | 'on_hold'
    | 'resolved'
    | 'closed'
    | 'rejected'
    | 'escalated';
  priority: 'critical' | 'high' | 'medium' | 'low';
  severity: 'critical' | 'major' | 'minor' | 'cosmetic';

  // Assignment and Ownership
  assignee?: string; // User ID
  reporter: string; // User ID
  watchers: string[]; // User IDs
  teamAssignment?: string;

  // CTI-Specific Fields
  threatLevel?: 'critical' | 'high' | 'medium' | 'low';
  affectedSystems: string[];
  relatedIOCs: string[]; // IOC IDs
  relatedAlerts: string[]; // Alert IDs
  relatedTasks: string[]; // Task IDs from task management system

  // Workflow and Tracking
  workflowState: {
    currentStage: string;
    stageHistory: Array<{
      stage: string;
      timestamp: Date;
      actor: string;
      notes?: string;
    }>;
  };

  // Time Tracking
  estimatedHours?: number;
  actualHours?: number;
  timeSpent: Array<{
    userId: string;
    hours: number;
    date: Date;
    description: string;
  }>;

  // Metadata
  labels: string[];
  tags: string[];
  customFields: Record<string, any>;

  // Resolution Information
  resolution?: {
    type: 'fixed' | 'wont_fix' | 'duplicate' | 'invalid' | 'works_as_designed';
    description: string;
    resolvedBy: string;
    resolvedAt: Date;
    verifiedBy?: string;
    verifiedAt?: Date;
  };

  // Dates
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;

  // Enterprise Features
  securityClassification: 'public' | 'internal' | 'confidential' | 'restricted';
  complianceRequirements: string[];
  auditTrail: Array<{
    timestamp: Date;
    userId: string;
    action: string;
    field?: string;
    oldValue?: any;
    newValue?: any;
    notes?: string;
  }>;

  // Integration Points
  externalReferences: Array<{
    system: string;
    id: string;
    url?: string;
    type: string;
  }>;

  // Comments and Communication
  comments: Array<{
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
  }>;

  // Attachments
  attachments: Array<{
    filename: string;
    url: string;
    size: number;
    uploadedBy: string;
    uploadedAt: Date;
    contentType: string;
  }>;

  // SLA and Performance
  slaMetrics: {
    responseTime?: Date; // When first response was provided
    resolutionTime?: Date; // When issue was resolved
    escalationDeadlines: Date[];
    breachedSLA: boolean;
  };
}

const issueSchema = new Schema<IIssue>(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      maxLength: 200,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      maxLength: 5000,
    },
    issueType: {
      type: String,
      enum: [
        'bug',
        'feature',
        'incident',
        'vulnerability',
        'threat',
        'investigation',
        'compliance',
        'enhancement',
      ],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: [
        'open',
        'in_progress',
        'on_hold',
        'resolved',
        'closed',
        'rejected',
        'escalated',
      ],
      default: 'open',
      index: true,
    },
    priority: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low'],
      default: 'medium',
      index: true,
    },
    severity: {
      type: String,
      enum: ['critical', 'major', 'minor', 'cosmetic'],
      default: 'minor',
    },
    assignee: {
      type: String,
      index: true,
    },
    reporter: {
      type: String,
      required: true,
      index: true,
    },
    watchers: [
      {
        type: String,
      },
    ],
    teamAssignment: {
      type: String,
      index: true,
    },
    threatLevel: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low'],
      index: true,
    },
    affectedSystems: [
      {
        type: String,
      },
    ],
    relatedIOCs: [
      {
        type: String,
      },
    ],
    relatedAlerts: [
      {
        type: String,
      },
    ],
    relatedTasks: [
      {
        type: String,
      },
    ],
    workflowState: {
      currentStage: {
        type: String,
        default: 'created',
      },
      stageHistory: [
        {
          stage: String,
          timestamp: { type: Date, default: Date.now },
          actor: String,
          notes: String,
        },
      ],
    },
    estimatedHours: Number,
    actualHours: Number,
    timeSpent: [
      {
        userId: String,
        hours: Number,
        date: Date,
        description: String,
      },
    ],
    labels: [
      {
        type: String,
        index: true,
      },
    ],
    tags: [
      {
        type: String,
        index: true,
      },
    ],
    customFields: {
      type: Schema.Types.Mixed,
      default: {},
    },
    resolution: {
      type: {
        type: String,
        enum: [
          'fixed',
          'wont_fix',
          'duplicate',
          'invalid',
          'works_as_designed',
        ],
      },
      description: String,
      resolvedBy: String,
      resolvedAt: Date,
      verifiedBy: String,
      verifiedAt: Date,
    },
    dueDate: {
      type: Date,
      index: true,
    },
    securityClassification: {
      type: String,
      enum: ['public', 'internal', 'confidential', 'restricted'],
      default: 'internal',
      index: true,
    },
    complianceRequirements: [
      {
        type: String,
      },
    ],
    auditTrail: [
      {
        timestamp: { type: Date, default: Date.now },
        userId: String,
        action: String,
        field: String,
        oldValue: Schema.Types.Mixed,
        newValue: Schema.Types.Mixed,
        notes: String,
      },
    ],
    externalReferences: [
      {
        system: String,
        id: String,
        url: String,
        type: String,
      },
    ],
    comments: [
      {
        id: { type: String, required: true },
        userId: String,
        content: String,
        timestamp: { type: Date, default: Date.now },
        isInternal: { type: Boolean, default: false },
        attachments: [
          {
            filename: String,
            url: String,
            size: Number,
          },
        ],
      },
    ],
    attachments: [
      {
        filename: String,
        url: String,
        size: Number,
        uploadedBy: String,
        uploadedAt: { type: Date, default: Date.now },
        contentType: String,
      },
    ],
    slaMetrics: {
      responseTime: Date,
      resolutionTime: Date,
      escalationDeadlines: [Date],
      breachedSLA: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
    collection: 'issues',
  }
);

// Compound indexes for performance
issueSchema.index({ status: 1, priority: 1 });
issueSchema.index({ assignee: 1, status: 1 });
issueSchema.index({ reporter: 1, createdAt: -1 });
issueSchema.index({ issueType: 1, status: 1 });
issueSchema.index({ threatLevel: 1, status: 1 });
issueSchema.index({ 'workflowState.currentStage': 1 });
issueSchema.index({ dueDate: 1, status: 1 });
issueSchema.index({ labels: 1 });
issueSchema.index({ tags: 1 });

// Text search index
issueSchema.index({
  title: 'text',
  description: 'text',
  'comments.content': 'text',
});

// Pre-save middleware to generate ticket ID and update workflow
issueSchema.pre('save', async function (next) {
  if (this.isNew) {
    // Generate ticket ID
    const count = await model('Issue').countDocuments();
    this.ticketId = `ISS-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;

    // Initialize workflow state
    if (!this.workflowState.stageHistory.length) {
      this.workflowState.stageHistory.push({
        stage: 'created',
        timestamp: new Date(),
        actor: this.reporter,
        notes: 'Issue created',
      });
    }
  }
  next();
});

export const Issue = model<IIssue>('Issue', issueSchema);
export default Issue;
