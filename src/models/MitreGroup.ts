import mongoose, { Schema, Document } from 'mongoose';

export interface IMitreGroup extends Document {
  mitreId: string; // e.g., "G0001"
  name: string; // e.g., "Lazarus Group"
  description: string;
  aliases: string[]; // Alternative names for the group
  url: string; // MITRE URL
  version: string;
  created: Date;
  modified: Date;
  techniques: string[]; // Array of technique IDs used by this group
  software: string[]; // Array of software IDs used by this group
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

const mitreGroupSchema = new Schema<IMitreGroup>(
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
    aliases: [
      {
        type: String,
        trim: true,
      },
    ],
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
    software: [
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
mitreGroupSchema.index({ mitreId: 1 });
mitreGroupSchema.index({ name: 1 });
mitreGroupSchema.index({ aliases: 1 });
mitreGroupSchema.index({ techniques: 1 });
mitreGroupSchema.index({ software: 1 });

export const MitreGroup = mongoose.model<IMitreGroup>(
  'MitreGroup',
  mitreGroupSchema
);