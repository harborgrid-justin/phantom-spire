import mongoose, { Schema, Document } from 'mongoose';

export interface IMitreSoftware extends Document {
  mitreId: string; // e.g., "S0001"
  name: string; // e.g., "Cobalt Strike"
  description: string;
  labels: string[]; // e.g., ["malware", "tool"]
  url: string; // MITRE URL
  version: string;
  created: Date;
  modified: Date;
  platforms: string[]; // e.g., ["Windows", "Linux", "macOS"]
  techniques: string[]; // Array of technique IDs this software implements
  groups: string[]; // Array of group IDs that use this software
  aliases: string[]; // Alternative names for the software
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

const mitreSoftwareSchema = new Schema<IMitreSoftware>(
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
    labels: [
      {
        type: String,
        trim: true,
        enum: ['malware', 'tool'],
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
    platforms: [
      {
        type: String,
        trim: true,
      },
    ],
    techniques: [
      {
        type: String,
        trim: true,
      },
    ],
    groups: [
      {
        type: String,
        trim: true,
      },
    ],
    aliases: [
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
mitreSoftwareSchema.index({ mitreId: 1 });
mitreSoftwareSchema.index({ name: 1 });
mitreSoftwareSchema.index({ labels: 1 });
mitreSoftwareSchema.index({ platforms: 1 });
mitreSoftwareSchema.index({ techniques: 1 });
mitreSoftwareSchema.index({ groups: 1 });
mitreSoftwareSchema.index({ aliases: 1 });

export const MitreSoftware = mongoose.model<IMitreSoftware>(
  'MitreSoftware',
  mitreSoftwareSchema
);