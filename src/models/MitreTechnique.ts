import mongoose, { Schema, Document } from 'mongoose';

export interface IMitreTechnique extends Document {
  mitreId: string; // e.g., "T1566", "T1566.001"
  name: string; // e.g., "Phishing", "Spearphishing Attachment"
  description: string;
  url: string; // MITRE URL
  version: string;
  created: Date;
  modified: Date;
  parentTechnique?: string; // For sub-techniques, refers to parent technique ID
  isSubTechnique: boolean;
  tactics: string[]; // Array of tactic IDs this technique belongs to
  platforms: string[]; // e.g., ["Windows", "Linux", "macOS"]
  dataSources: string[]; // Data sources that can detect this technique
  defenses: string[]; // Defense categories
  permissions: string[]; // Required permissions
  systemRequirements: string[];
  networkRequirements: string[];
  remoteSupport: boolean;
  killChainPhases: {
    killChainName: string;
    phaseName: string;
  }[];
  detection: string; // Detection guidance text
  mitigations: mongoose.Types.ObjectId[]; // References to MitreMitigation
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

const mitreTechniqueSchema = new Schema<IMitreTechnique>(
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
    parentTechnique: {
      type: String,
      trim: true,
      index: true,
    },
    isSubTechnique: {
      type: Boolean,
      default: false,
      index: true,
    },
    tactics: [
      {
        type: String,
        trim: true,
      },
    ],
    platforms: [
      {
        type: String,
        trim: true,
      },
    ],
    dataSources: [
      {
        type: String,
        trim: true,
      },
    ],
    defenses: [
      {
        type: String,
        trim: true,
      },
    ],
    permissions: [
      {
        type: String,
        trim: true,
      },
    ],
    systemRequirements: [
      {
        type: String,
        trim: true,
      },
    ],
    networkRequirements: [
      {
        type: String,
        trim: true,
      },
    ],
    remoteSupport: {
      type: Boolean,
      default: false,
    },
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
    detection: {
      type: String,
      trim: true,
    },
    mitigations: [
      {
        type: Schema.Types.ObjectId,
        ref: 'MitreMitigation',
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
mitreTechniqueSchema.index({ mitreId: 1 });
mitreTechniqueSchema.index({ name: 1 });
mitreTechniqueSchema.index({ parentTechnique: 1 });
mitreTechniqueSchema.index({ isSubTechnique: 1 });
mitreTechniqueSchema.index({ tactics: 1 });
mitreTechniqueSchema.index({ platforms: 1 });
mitreTechniqueSchema.index({ dataSources: 1 });

export const MitreTechnique = mongoose.model<IMitreTechnique>(
  'MitreTechnique',
  mitreTechniqueSchema
);
