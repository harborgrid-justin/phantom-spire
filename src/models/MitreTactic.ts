import mongoose, { Schema, Document } from 'mongoose';

export interface IMitreTactic extends Document {
  mitreId: string; // e.g., "TA0001"
  name: string; // e.g., "Initial Access"
  description: string;
  shortName: string; // e.g., "initial-access"
  url: string; // MITRE URL
  version: string;
  created: Date;
  modified: Date;
  platforms: string[]; // e.g., ["Windows", "Linux", "macOS"]
  killChainPhases: {
    killChainName: string;
    phaseName: string;
  }[];
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

const mitreTacticSchema = new Schema<IMitreTactic>(
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
    shortName: {
      type: String,
      required: true,
      trim: true,
      index: true,
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
    platforms: [
      {
        type: String,
        trim: true,
      },
    ],
    killChainPhases: [
      {
        killChainName: {
          type: String,
          required: true,
          trim: true,
        },
        phaseName: {
          type: String,
          required: true,
          trim: true,
        },
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
mitreTacticSchema.index({ mitreId: 1 });
mitreTacticSchema.index({ name: 1 });
mitreTacticSchema.index({ shortName: 1 });
mitreTacticSchema.index({ platforms: 1 });

export const MitreTactic = mongoose.model<IMitreTactic>(
  'MitreTactic',
  mitreTacticSchema
);
