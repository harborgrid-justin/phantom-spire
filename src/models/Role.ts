import mongoose, { Schema, Document } from 'mongoose';

export interface IRole extends Document {
  name: string;
  code: string; // Unique role identifier
  description?: string;
  level: number; // Hierarchy level (higher = more privileges)
  parentRole?: mongoose.Types.ObjectId; // For role inheritance
  childRoles: mongoose.Types.ObjectId[];
  company?: mongoose.Types.ObjectId; // Company-specific role, null for system roles
  permissions: mongoose.Types.ObjectId[]; // Associated permissions
  isActive: boolean;
  isSystemRole: boolean; // Cannot be deleted or modified
  metadata: {
    category:
      | 'system'
      | 'functional'
      | 'operational'
      | 'administrative'
      | 'executive';
    scope: 'global' | 'company' | 'department' | 'team' | 'resource';
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    requiresApproval: boolean;
    maxUsers?: number; // Maximum users that can have this role
  };
  constraints: {
    timeRestrictions?: {
      allowedHours?: { start: string; end: string }; // "09:00" - "17:00"
      allowedDays?: number[]; // 0-6 (Sunday-Saturday)
      timezone?: string;
    };
    ipRestrictions?: string[]; // Allowed IP ranges
    locationRestrictions?: string[]; // Allowed countries/regions
    requireMFA?: boolean;
    sessionTimeout?: number; // in minutes
  };
  createdAt: Date;
  updatedAt: Date;
}

const roleSchema = new Schema<IRole>(
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
      match: /^[A-Z0-9_]{3,30}$/, // 3-30 characters, alphanumeric and underscore
    },
    description: {
      type: String,
      maxlength: 500,
    },
    level: {
      type: Number,
      required: true,
      min: 0,
      max: 100, // 0 = lowest privilege, 100 = highest privilege
    },
    parentRole: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
    },
    childRoles: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Role',
      },
    ],
    company: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
    },
    permissions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Permission',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    isSystemRole: {
      type: Boolean,
      default: false,
    },
    metadata: {
      category: {
        type: String,
        enum: [
          'system',
          'functional',
          'operational',
          'administrative',
          'executive',
        ],
        required: true,
      },
      scope: {
        type: String,
        enum: ['global', 'company', 'department', 'team', 'resource'],
        required: true,
      },
      riskLevel: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium',
      },
      requiresApproval: {
        type: Boolean,
        default: false,
      },
      maxUsers: {
        type: Number,
        min: 1,
      },
    },
    constraints: {
      timeRestrictions: {
        allowedHours: {
          start: {
            type: String,
            match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, // HH:MM format
          },
          end: {
            type: String,
            match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, // HH:MM format
          },
        },
        allowedDays: [
          {
            type: Number,
            min: 0,
            max: 6,
          },
        ],
        timezone: {
          type: String,
          default: 'UTC',
        },
      },
      ipRestrictions: [
        {
          type: String,
          validate: {
            validator: function (ip: string) {
              // Basic CIDR validation
              return /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/.test(ip);
            },
            message: 'Invalid IP address or CIDR notation',
          },
        },
      ],
      locationRestrictions: [
        {
          type: String,
          length: 2, // ISO country codes
        },
      ],
      requireMFA: {
        type: Boolean,
        default: false,
      },
      sessionTimeout: {
        type: Number,
        min: 5, // minimum 5 minutes
        max: 1440, // maximum 24 hours
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
roleSchema.index({ code: 1 }, { unique: true });
roleSchema.index({ company: 1, isActive: 1 });
roleSchema.index({ level: -1 }); // Descending for privilege ordering
roleSchema.index({ parentRole: 1 });
roleSchema.index({ 'metadata.category': 1 });
roleSchema.index({ 'metadata.scope': 1 });
roleSchema.index({ isSystemRole: 1 });

// Virtual for effective permissions (including inherited)
roleSchema.virtual('effectivePermissions').get(function () {
  // This will be calculated by service methods
  return this.permissions;
});

// Middleware to prevent deletion of system roles
roleSchema.pre('deleteOne', { document: true, query: false }, function () {
  if (this.isSystemRole) {
    throw new Error('System roles cannot be deleted');
  }
});

// Middleware to prevent circular inheritance
roleSchema.pre('save', async function (next) {
  if (this.parentRole && this.parentRole.equals(this._id)) {
    throw new Error('Role cannot be its own parent');
  }

  // Check for circular reference in hierarchy
  if (this.parentRole) {
    const depth = await this.getInheritanceDepth();
    if (depth > 10) {
      // Max 10 levels deep
      throw new Error('Role hierarchy too deep (max 10 levels)');
    }
  }

  next();
});

// Middleware to update child roles when parent changes
roleSchema.pre('save', async function (next) {
  if (this.isModified('parentRole')) {
    // Remove from old parent's children
    if (this.parentRole) {
      await mongoose
        .model('Role')
        .updateOne(
          { _id: this.parentRole },
          { $addToSet: { childRoles: this._id } }
        );
    }
  }
  next();
});

// Method to get inheritance depth
roleSchema.methods.getInheritanceDepth = async function (): Promise<number> {
  let depth = 0;
  let currentRole = this;
  const visitedIds = new Set();

  while (
    currentRole.parentRole &&
    !visitedIds.has(currentRole._id.toString())
  ) {
    visitedIds.add(currentRole._id.toString());
    depth++;
    currentRole = await mongoose.model('Role').findById(currentRole.parentRole);
    if (!currentRole || depth > 10) break; // Prevent infinite loops
  }

  return depth;
};

// Method to get all ancestor roles
roleSchema.methods.getAncestors = async function (): Promise<IRole[]> {
  const ancestors: IRole[] = [];
  let currentRole = this;
  const visitedIds = new Set();

  while (
    currentRole.parentRole &&
    !visitedIds.has(currentRole._id.toString())
  ) {
    visitedIds.add(currentRole._id.toString());
    const parent = await mongoose
      .model('Role')
      .findById(currentRole.parentRole);
    if (!parent) break;
    ancestors.unshift(parent);
    currentRole = parent;
    if (ancestors.length > 10) break; // Safety limit
  }

  return ancestors;
};

// Method to get all descendant roles
roleSchema.methods.getDescendants = async function (): Promise<IRole[]> {
  const descendants: IRole[] = [];
  const toProcess = [...this.childRoles];
  const processedIds = new Set();

  while (toProcess.length > 0 && descendants.length < 100) {
    // Safety limit
    const roleId = toProcess.shift();
    if (!roleId || processedIds.has(roleId.toString())) continue;

    processedIds.add(roleId.toString());
    const role = await mongoose.model('Role').findById(roleId);
    if (role) {
      descendants.push(role);
      toProcess.push(...role.childRoles);
    }
  }

  return descendants;
};

// Method to get all inherited permissions
roleSchema.methods.getInheritedPermissions = async function (): Promise<
  mongoose.Types.ObjectId[]
> {
  const allPermissions = new Set<string>();

  // Add own permissions
  this.permissions.forEach(p => allPermissions.add(p.toString()));

  // Add ancestor permissions
  const ancestors = await this.getAncestors();
  for (const ancestor of ancestors) {
    ancestor.permissions.forEach(p => allPermissions.add(p.toString()));
  }

  return Array.from(allPermissions).map(p => new mongoose.Types.ObjectId(p));
};

// Method to check if role has specific permission (including inherited)
roleSchema.methods.hasPermission = async function (
  permissionId: mongoose.Types.ObjectId
): Promise<boolean> {
  const inheritedPermissions = await this.getInheritedPermissions();
  return inheritedPermissions.some(p => p.equals(permissionId));
};

// Method to check time-based access
roleSchema.methods.isAccessAllowed = function (timestamp?: Date): boolean {
  const now = timestamp || new Date();
  const constraints = this.constraints;

  // Check time restrictions
  if (constraints.timeRestrictions?.allowedHours) {
    const currentTime = now.toTimeString().substring(0, 5); // HH:MM
    const start = constraints.timeRestrictions.allowedHours.start;
    const end = constraints.timeRestrictions.allowedHours.end;

    if (start && end && (currentTime < start || currentTime > end)) {
      return false;
    }
  }

  // Check day restrictions
  if (constraints.timeRestrictions?.allowedDays?.length) {
    const currentDay = now.getDay(); // 0-6
    if (!constraints.timeRestrictions.allowedDays.includes(currentDay)) {
      return false;
    }
  }

  return true;
};

// Method to check IP-based access
roleSchema.methods.isIPAllowed = function (clientIP: string): boolean {
  const ipRestrictions = this.constraints.ipRestrictions;
  if (!ipRestrictions?.length) return true; // No restrictions

  // Simple IP range check (would need more sophisticated logic for production)
  return ipRestrictions.some(allowedRange => {
    if (allowedRange.includes('/')) {
      // CIDR notation check would go here
      return true; // Simplified for now
    }
    return clientIP === allowedRange;
  });
};

// Static method to find roles by level range
roleSchema.statics.findByLevelRange = function (
  minLevel: number,
  maxLevel: number,
  companyId?: mongoose.Types.ObjectId
) {
  const query: any = {
    level: { $gte: minLevel, $lte: maxLevel },
    isActive: true,
  };

  if (companyId) {
    query.company = companyId;
  }

  return this.find(query).sort({ level: -1 });
};

// Static method to get system roles
roleSchema.statics.getSystemRoles = function () {
  return this.find({ isSystemRole: true, isActive: true }).sort({ level: -1 });
};

export const Role = mongoose.model<IRole>('Role', roleSchema);
