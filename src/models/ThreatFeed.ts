import mongoose, { Schema, Document } from 'mongoose';

export interface IThreatFeed extends Document {
  name: string;
  description: string;
  url: string;
  feedType: 'rss' | 'json' | 'csv' | 'stix' | 'misp';
  isActive: boolean;
  lastFetch?: Date;
  fetchInterval: number; // in minutes
  credentials?: {
    username?: string;
    password?: string;
    apiKey?: string;
  };
  headers?: Record<string, string>;
  parser: {
    format: string;
    mapping: Record<string, string>;
  };
  statistics: {
    totalProcessed: number;
    lastProcessedCount: number;
    errorCount: number;
    lastError?: string;
  };
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const threatFeedSchema = new Schema<IThreatFeed>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    feedType: {
      type: String,
      required: true,
      enum: ['rss', 'json', 'csv', 'stix', 'misp'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastFetch: {
      type: Date,
    },
    fetchInterval: {
      type: Number,
      required: true,
      min: 5, // minimum 5 minutes
      default: 60, // default 1 hour
    },
    credentials: {
      username: String,
      password: String,
      apiKey: String,
    },
    headers: {
      type: Schema.Types.Mixed,
      default: {},
    },
    parser: {
      format: {
        type: String,
        required: true,
      },
      mapping: {
        type: Schema.Types.Mixed,
        required: true,
      },
    },
    statistics: {
      totalProcessed: {
        type: Number,
        default: 0,
      },
      lastProcessedCount: {
        type: Number,
        default: 0,
      },
      errorCount: {
        type: Number,
        default: 0,
      },
      lastError: String,
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

export const ThreatFeed = mongoose.model<IThreatFeed>(
  'ThreatFeed',
  threatFeedSchema
);
