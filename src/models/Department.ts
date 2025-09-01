import mongoose, { Schema, Document } from 'mongoose';

export interface IDepartment extends Document {
  name: string;
  code: string; // Unique within company
  description?: string;
  company: mongoose.Types.ObjectId;
  parentDepartment?: mongoose.Types.ObjectId; // For nested departments
  subDepartments: mongoose.Types.ObjectId[];
  manager?: mongoose.Types.ObjectId; // User who manages this department
  members: mongoose.Types.ObjectId[]; // Users in this department
  isActive: boolean;
  settings: {
    maxTeams?: number;
    allowNestedDepartments: boolean;
    requireManagerApproval: boolean;
    budgetLimit?: number;
  };
  metadata: {
    costCenter?: string;
    location?: string;
    function:
      | 'operations'
      | 'security'
      | 'intelligence'
      | 'analysis'
      | 'research'
      | 'support'
      | 'management'
      | 'other';
    clearanceLevel?:
      | 'public'
      | 'internal'
      | 'confidential'
      | 'secret'
      | 'top-secret';
  };
  createdAt: Date;
  updatedAt: Date;
  // Instance methods
  getHierarchyDepth(): Promise<number>;
  getAncestors(): Promise<IDepartment[]>;
  getDescendants(): Promise<IDepartment[]>;
  canUserAccess(userId: mongoose.Types.ObjectId): Promise<boolean>;
}

const departmentSchema = new Schema<IDepartment>(
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
      uppercase: true,
      trim: true,
      match: /^[A-Z0-9_]{2,20}$/, // 2-20 characters, alphanumeric and underscore
    },
    description: {
      type: String,
      maxlength: 500,
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    parentDepartment: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
    },
    subDepartments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Department',
      },
    ],
    manager: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    settings: {
      maxTeams: {
        type: Number,
        min: 0,
        max: 100,
      },
      allowNestedDepartments: {
        type: Boolean,
        default: true,
      },
      requireManagerApproval: {
        type: Boolean,
        default: false,
      },
      budgetLimit: {
        type: Number,
        min: 0,
      },
    },
    metadata: {
      costCenter: {
        type: String,
        match: /^[A-Z0-9-]{3,15}$/,
      },
      location: {
        type: String,
        maxlength: 100,
      },
      function: {
        type: String,
        enum: [
          'operations',
          'security',
          'intelligence',
          'analysis',
          'research',
          'support',
          'management',
          'other',
        ],
        required: true,
      },
      clearanceLevel: {
        type: String,
        enum: ['public', 'internal', 'confidential', 'secret', 'top-secret'],
        default: 'internal',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for performance and uniqueness
departmentSchema.index({ company: 1, code: 1 }, { unique: true }); // Code unique per company
departmentSchema.index({ company: 1, isActive: 1 });
departmentSchema.index({ parentDepartment: 1 });
departmentSchema.index({ manager: 1 });
departmentSchema.index({ 'metadata.function': 1 });

// Virtual for full hierarchy path
departmentSchema.virtual('fullPath').get(function () {
  // This will be populated by a service method
  return this.name;
});

// Middleware to update parent department's subdepartments
departmentSchema.pre('save', async function (next) {
  if (this.isModified('parentDepartment') && this.parentDepartment) {
    await mongoose
      .model('Department')
      .updateOne(
        { _id: this.parentDepartment },
        { $addToSet: { subDepartments: this._id } }
      );
  }
  next();
});

// Middleware to prevent circular references
departmentSchema.pre('save', async function (next) {
  if (this.parentDepartment && this.parentDepartment.equals(this._id as mongoose.Types.ObjectId)) {
    throw new Error('Department cannot be its own parent');
  }

  // Check for circular reference in hierarchy
  if (this.parentDepartment) {
    const depth = await this.getHierarchyDepth();
    if (depth > 10) {
      // Max 10 levels deep
      throw new Error('Department hierarchy too deep (max 10 levels)');
    }
  }

  next();
});

// Method to get hierarchy depth
departmentSchema.methods.getHierarchyDepth =
  async function (): Promise<number> {
    let depth = 0;
    let currentDept = this;
    const visitedIds = new Set();

    while (
      currentDept.parentDepartment &&
      !visitedIds.has(currentDept._id.toString())
    ) {
      visitedIds.add(currentDept._id.toString());
      depth++;
      currentDept = await mongoose
        .model('Department')
        .findById(currentDept.parentDepartment);
      if (!currentDept || depth > 10) break; // Prevent infinite loops
    }

    return depth;
  };

// Method to get all ancestor departments
departmentSchema.methods.getAncestors = async function (): Promise<
  IDepartment[]
> {
  const ancestors: IDepartment[] = [];
  let currentDept = this;
  const visitedIds = new Set();

  while (
    currentDept.parentDepartment &&
    !visitedIds.has(currentDept._id.toString())
  ) {
    visitedIds.add(currentDept._id.toString());
    const parent = await mongoose
      .model('Department')
      .findById(currentDept.parentDepartment);
    if (!parent) break;
    ancestors.unshift(parent);
    currentDept = parent;
    if (ancestors.length > 10) break; // Safety limit
  }

  return ancestors;
};

// Method to get all descendant departments
departmentSchema.methods.getDescendants = async function (): Promise<
  IDepartment[]
> {
  const descendants: IDepartment[] = [];
  const toProcess = [...this.subDepartments];
  const processedIds = new Set();

  while (toProcess.length > 0 && descendants.length < 1000) {
    // Safety limit
    const deptId = toProcess.shift();
    if (!deptId || processedIds.has(deptId.toString())) continue;

    processedIds.add(deptId.toString());
    const dept = await mongoose.model('Department').findById(deptId);
    if (dept) {
      descendants.push(dept);
      toProcess.push(...dept.subDepartments);
    }
  }

  return descendants;
};

// Method to check if user can access this department
departmentSchema.methods.canUserAccess = async function (
  userId: mongoose.Types.ObjectId
): Promise<boolean> {
  // Check if user is a member
  if (this.members.includes(userId)) return true;

  // Check if user is the manager
  if (this.manager && this.manager.equals(userId)) return true;

  // Check parent departments (inherited access)
  const ancestors = await this.getAncestors();
  for (const ancestor of ancestors) {
    if (
      ancestor.members.includes(userId) ||
      (ancestor.manager && ancestor.manager.equals(userId))
    ) {
      return true;
    }
  }

  return false;
};

export const Department = mongoose.model<IDepartment>(
  'Department',
  departmentSchema
);
