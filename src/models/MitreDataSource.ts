import mongoose, { Schema, Document } from 'mongoose';

export interface IMitreDataSource extends Document {
  mitreId: string; // e.g., "DS0001"
  name: string; // e.g., "Process"
  description: string;
  url: string; // MITRE URL
  version: string;
  created: Date;
  modified: Date;
  platforms: string[]; // e.g., ["Windows", "Linux", "macOS"]
  collectionLayers: string; // Collection method description
  dataComponents: {
    name: string;
    description: string;
    detects: string[]; // Array of technique IDs this component can detect
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

const mitreDataSourceSchema = new Schema<IMitreDataSource>(
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
    platforms: [
      {
        type: String,
        trim: true,
      },
    ],
    collectionLayers: {
      type: String,
      trim: true,
    },
    dataComponents: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        description: {
          type: String,
          required: true,
          trim: true,
        },
        detects: [
          {
            type: String,
            trim: true,
          },
        ],
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
mitreDataSourceSchema.index({ mitreId: 1 });
mitreDataSourceSchema.index({ name: 1 });
mitreDataSourceSchema.index({ platforms: 1 });
mitreDataSourceSchema.index({ 'dataComponents.detects': 1 });

export const MitreDataSource = mongoose.model<IMitreDataSource>(
  'MitreDataSource',
  mitreDataSourceSchema
);
