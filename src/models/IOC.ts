import mongoose, { Schema, Document } from 'mongoose';

export interface IIOC extends Document {
  value: string;
  type: 'ip' | 'domain' | 'url' | 'hash' | 'email';
  confidence: number; // 0-100
  severity: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  source: string;
  description?: string;
  firstSeen: Date;
  lastSeen: Date;
  isActive: boolean;
  metadata: Record<string, any>;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const iocSchema = new Schema<IIOC>(
  {
    value: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['ip', 'domain', 'url', 'hash', 'email'],
      index: true,
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      index: true,
    },
    severity: {
      type: String,
      required: true,
      enum: ['low', 'medium', 'high', 'critical'],
      index: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    source: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    firstSeen: {
      type: Date,
      required: true,
      default: Date.now,
    },
    lastSeen: {
      type: Date,
      required: true,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
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

// Compound indexes for better query performance
iocSchema.index({ type: 1, severity: 1 });
iocSchema.index({ confidence: -1, createdAt: -1 });
iocSchema.index({ tags: 1 });
iocSchema.index({ value: 1, type: 1 }, { unique: true });

export const IOC = mongoose.model<IIOC>('IOC', iocSchema);
