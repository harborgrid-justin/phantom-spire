import mongoose, { Schema, Document } from 'mongoose';

export interface IMitreMitigation extends Document {
  mitreId: string; // e.g., "M1001"
  name: string; // e.g., "Active Directory Configuration"
  description: string;
  url: string; // MITRE URL
  version: string;
  created: Date;
  modified: Date;
  techniques: string[]; // Array of technique IDs this mitigation addresses
  externalReferences: {
    sourceName: string;
    url?: string;
    externalId?: string;
    description?: string;
  }[];
  metadata: Record<string, any>;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const mitreMitigationSchema = new Schema<IMitreMitigation>(
  {
    mitreId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    version: {
      type: String,
      required: true,
      trim: true,
    },
    created: {
      type: Date,
      required: true,
    },
    modified: {
      type: Date,
      required: true,
    },
    techniques: [
      {
        type: String,
        trim: true,
      },
    ],
    externalReferences: [
      {
        sourceName: {
          type: String,
          required: true,
          trim: true,
        },
        url: {
          type: String,
          trim: true,
        },
        externalId: {
          type: String,
          trim: true,
        },
        description: {
          type: String,
          trim: true,
        },
      },
    ],
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

// Indexes for better query performance
mitreMitigationSchema.index({ mitreId: 1 });
mitreMitigationSchema.index({ name: 1 });
mitreMitigationSchema.index({ techniques: 1 });

export const MitreMitigation = mongoose.model<IMitreMitigation>(
  'MitreMitigation',
  mitreMitigationSchema
);