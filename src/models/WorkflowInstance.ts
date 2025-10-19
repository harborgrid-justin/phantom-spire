import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkflowInstanceDoc extends Document {
  id: string;
  workflowId: string;
  status: 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
  parameters: Record<string, any>;
  initiatedBy: string;
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  currentStep: number;
  steps: any[];
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const workflowInstanceSchema = new Schema<IWorkflowInstanceDoc>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    workflowId: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['running', 'paused', 'completed', 'failed', 'cancelled'],
      default: 'running',
      index: true,
    },
    parameters: {
      type: Schema.Types.Mixed,
      default: {},
    },
    initiatedBy: {
      type: String,
      required: true,
      index: true,
    },
    startedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    duration: {
      type: Number,
    },
    currentStep: {
      type: Number,
      required: true,
      default: 0,
    },
    steps: {
      type: Schema.Types.Mixed,
      default: [],
    },
    error: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
workflowInstanceSchema.index({ workflowId: 1, status: 1 });
workflowInstanceSchema.index({ initiatedBy: 1, startedAt: -1 });
workflowInstanceSchema.index({ status: 1, startedAt: -1 });

export const WorkflowInstance = mongoose.model<IWorkflowInstanceDoc>(
  'WorkflowInstance',
  workflowInstanceSchema
);
