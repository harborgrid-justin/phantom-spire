import mongoose, { Schema, Document } from 'mongoose';

export interface ICompany extends Document {
  name: string;
  code: string; // Unique company identifier
  domain: string; // Primary email domain
  description?: string;
  industry?: string;
  country?: string;
  parentCompany?: mongoose.Types.ObjectId; // For holding companies/subsidiaries
  subsidiaries: mongoose.Types.ObjectId[]; // Child companies
  isActive: boolean;
  settings: {
    allowSubsidiaries: boolean;
    maxDepartments?: number;
    securityPolicy: 'strict' | 'moderate' | 'flexible';
    dataRetentionDays: number;
    requireMFA: boolean;
    allowExternalUsers: boolean;
  };
  metadata: {
    threatIntelligenceLevel: 'basic' | 'advanced' | 'premium' | 'enterprise';
    complianceRequirements: string[]; // e.g., ['SOC2', 'ISO27001', 'GDPR']
    riskTolerance: 'low' | 'medium' | 'high';
  };
  createdAt: Date;
  updatedAt: Date;
}

const companySchema = new Schema<ICompany>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      match: /^[A-Z0-9]{2,10}$/, // 2-10 characters, alphanumeric
    },
    domain: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/, // Valid domain format
    },
    description: {
      type: String,
      maxlength: 500,
    },
    industry: {
      type: String,
      enum: [
        'technology',
        'finance',
        'healthcare',
        'government',
        'defense',
        'energy',
        'manufacturing',
        'retail',
        'education',
        'other',
      ],
    },
    country: {
      type: String,
      length: 2, // ISO 3166-1 alpha-2 codes
    },
    parentCompany: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
    },
    subsidiaries: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Company',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    settings: {
      allowSubsidiaries: {
        type: Boolean,
        default: false,
      },
      maxDepartments: {
        type: Number,
        min: 1,
        max: 1000,
      },
      securityPolicy: {
        type: String,
        enum: ['strict', 'moderate', 'flexible'],
        default: 'moderate',
      },
      dataRetentionDays: {
        type: Number,
        default: 2555, // 7 years
        min: 30,
        max: 3650, // 10 years
      },
      requireMFA: {
        type: Boolean,
        default: true,
      },
      allowExternalUsers: {
        type: Boolean,
        default: false,
      },
    },
    metadata: {
      threatIntelligenceLevel: {
        type: String,
        enum: ['basic', 'advanced', 'premium', 'enterprise'],
        default: 'basic',
      },
      complianceRequirements: [
        {
          type: String,
          enum: [
            'SOC2',
            'ISO27001',
            'GDPR',
            'HIPAA',
            'PCI-DSS',
            'NIST',
            'FedRAMP',
            'FISMA',
          ],
        },
      ],
      riskTolerance: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
companySchema.index({ code: 1 });
companySchema.index({ domain: 1 });
companySchema.index({ parentCompany: 1 });
companySchema.index({ isActive: 1 });

// Virtual for full hierarchy path
companySchema.virtual('hierarchyPath').get(function () {
  // This will be populated by a service method
  return this.name;
});

// Middleware to update subsidiaries when parent changes
companySchema.pre('save', async function (next) {
  if (this.isModified('parentCompany')) {
    // Remove from old parent's subsidiaries
    if (this.parentCompany) {
      await mongoose
        .model('Company')
        .updateOne(
          { _id: this.parentCompany },
          { $addToSet: { subsidiaries: this._id } }
        );
    }
  }
  next();
});

// Method to check if company can have subsidiaries
companySchema.methods.canHaveSubsidiaries = function (): boolean {
  return this.settings.allowSubsidiaries;
};

// Method to get full hierarchy depth
companySchema.methods.getHierarchyDepth = async function (): Promise<number> {
  let depth = 0;
  let currentCompany = this;

  while (currentCompany.parentCompany) {
    depth++;
    currentCompany = await mongoose
      .model('Company')
      .findById(currentCompany.parentCompany);
    if (!currentCompany || depth > 10) break; // Prevent infinite loops
  }

  return depth;
};

export const Company = mongoose.model<ICompany>('Company', companySchema);
