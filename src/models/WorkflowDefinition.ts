import mongoose, { Schema, Document } from 'mongoose';
import { WorkflowStatus, WorkflowPriority } from '../workflow-bpm/interfaces/IWorkflowEngine.js';

export interface IWorkflowDefinitionDoc extends Document {
  id: string;
  name: string;
  version: string;
  status: WorkflowStatus;
  priority: WorkflowPriority;
  description?: string;
  category?: string;
  tags?: string[];
  metadata?: {
    author?: string;
    createdAt?: Date;
    updatedAt?: Date;
  };
  triggers?: any[];
  steps: any[];
  parameters?: Record<string, any>;
  sla?: any;
  security?: any;
  integrations?: any;
  monitoring?: any;
  createdAt: Date;
  updatedAt: Date;
}

const workflowDefinitionSchema = new Schema<IWorkflowDefinitionDoc>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    version: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(WorkflowStatus),
      default: WorkflowStatus.DRAFT,
      index: true,
    },
    priority: {
      type: String,
      required: true,
      enum: Object.values(WorkflowPriority),
      default: WorkflowPriority.MEDIUM,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      index: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    triggers: {
      type: Schema.Types.Mixed,
      default: [],
    },
    steps: {
      type: Schema.Types.Mixed,
      required: true,
      default: [],
    },
    parameters: {
      type: Schema.Types.Mixed,
      default: {},
    },
    sla: {
      type: Schema.Types.Mixed,
    },
    security: {
      type: Schema.Types.Mixed,
    },
    integrations: {
      type: Schema.Types.Mixed,
    },
    monitoring: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
workflowDefinitionSchema.index({ status: 1, priority: 1 });
workflowDefinitionSchema.index({ category: 1, createdAt: -1 });
workflowDefinitionSchema.index({ name: 1, version: 1 });

export const WorkflowDefinition = mongoose.model<IWorkflowDefinitionDoc>(
  'WorkflowDefinition',
  workflowDefinitionSchema
);
