import mongoose, { Schema, Document } from 'mongoose';

export interface IAlert extends Document {
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  category:
    | 'malware'
    | 'phishing'
    | 'apt'
    | 'botnet'
    | 'vulnerability'
    | 'other';
  iocs: mongoose.Types.ObjectId[];
  assignedTo?: mongoose.Types.ObjectId;
  resolvedBy?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
  metadata: Record<string, any>;
  tags: string[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const alertSchema = new Schema<IAlert>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    severity: {
      type: String,
      required: true,
      enum: ['low', 'medium', 'high', 'critical'],
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['open', 'investigating', 'resolved', 'false_positive'],
      default: 'open',
      index: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['malware', 'phishing', 'apt', 'botnet', 'vulnerability', 'other'],
      index: true,
    },
    iocs: [
      {
        type: Schema.Types.ObjectId,
        ref: 'IOC',
      },
    ],
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    resolvedAt: {
      type: Date,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
alertSchema.index({ severity: 1, status: 1 });
alertSchema.index({ category: 1, createdAt: -1 });
alertSchema.index({ assignedTo: 1, status: 1 });

export const Alert = mongoose.model<IAlert>('Alert', alertSchema);
