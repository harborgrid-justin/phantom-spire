import mongoose, { Schema, Document } from 'mongoose';

export interface IPermission extends Document {
  name: string;
  code: string; // Unique permission identifier
  description?: string;
  resource: string; // What resource this permission applies to
  action: string; // What action is allowed
  scope: 'global' | 'company' | 'department' | 'team' | 'resource' | 'self';
  isActive: boolean;
  isSystemPermission: boolean; // Cannot be deleted or modified
  metadata: {
    category:
      | 'system'
      | 'user'
      | 'data'
      | 'threat-intel'
      | 'analytics'
      | 'workflow'
      | 'admin';
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    requiresJustification: boolean;
    auditRequired: boolean;
  };
  constraints?: {
    conditions?: Array<{
      field: string;
      operator:
        | 'eq'
        | 'ne'
        | 'gt'
        | 'lt'
        | 'gte'
        | 'lte'
        | 'in'
        | 'nin'
        | 'contains'
        | 'regex';
      value: any;
    }>;
    timeWindow?: {
      start?: string; // HH:MM
      end?: string; // HH:MM
      timezone?: string;
    };
    rateLimit?: {
      requests: number;
      window: number; // in seconds
    };
  };
  createdAt: Date;
  updatedAt: Date;
  // Instance methods
  appliesTo(context: {
    resource: string;
    action: string;
    scope?: string;
    companyId?: mongoose.Types.ObjectId;
    departmentId?: mongoose.Types.ObjectId;
    teamId?: mongoose.Types.ObjectId;
    userId?: mongoose.Types.ObjectId;
  }): boolean;
  evaluateConstraints(context: {
    user?: any;
    resource?: any;
    timestamp?: Date;
    clientIP?: string;
    [key: string]: any;
  }): { allowed: boolean; reason?: string };
  getNestedValue(obj: any, path: string): any;
  evaluateCondition(
    fieldValue: any,
    operator: string,
    conditionValue: any
  ): boolean;
}

// Static methods interface
export interface IPermissionModel extends mongoose.Model<IPermission> {
  findByResourceAction(
    resource: string,
    action: string,
    includeWildcards?: boolean
  ): mongoose.Query<IPermission[], IPermission>;
  findByCategory(category: string): mongoose.Query<IPermission[], IPermission>;
  findHighRisk(): mongoose.Query<IPermission[], IPermission>;
  getSystemPermissions(): mongoose.Query<IPermission[], IPermission>;
}

const permissionSchema = new Schema<IPermission>(
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
      match: /^[A-Z0-9_:]{3,50}$/, // 3-50 characters, alphanumeric, underscore, colon
    },
    description: {
      type: String,
      maxlength: 500,
    },
    resource: {
      type: String,
      required: true,
      trim: true,
      enum: [
        'user',
        'company',
        'department',
        'team',
        'role',
        'permission',
        'ioc',
        'alert',
        'threat-feed',
        'mitre-data',
        'workflow',
        'task',
        'evidence',
        'report',
        'analytics',
        'system',
        'api',
        'audit-log',
        '*', // All resources
      ],
    },
    action: {
      type: String,
      required: true,
      trim: true,
      enum: [
        'create',
        'read',
        'update',
        'delete',
        'list',
        'search',
        'assign',
        'approve',
        'reject',
        'execute',
        'export',
        'import',
        'publish',
        'subscribe',
        'admin',
        'manage',
        '*', // All actions
      ],
    },
    scope: {
      type: String,
      enum: ['global', 'company', 'department', 'team', 'resource', 'self'],
      default: 'company',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isSystemPermission: {
      type: Boolean,
      default: false,
    },
    metadata: {
      category: {
        type: String,
        enum: [
          'system',
          'user',
          'data',
          'threat-intel',
          'analytics',
          'workflow',
          'admin',
        ],
        required: true,
      },
      riskLevel: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium',
      },
      requiresJustification: {
        type: Boolean,
        default: false,
      },
      auditRequired: {
        type: Boolean,
        default: true,
      },
    },
    constraints: {
      conditions: [
        {
          field: {
            type: String,
            required: true,
          },
          operator: {
            type: String,
            enum: [
              'eq',
              'ne',
              'gt',
              'lt',
              'gte',
              'lte',
              'in',
              'nin',
              'contains',
              'regex',
            ],
            required: true,
          },
          value: Schema.Types.Mixed,
        },
      ],
      timeWindow: {
        start: {
          type: String,
          match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, // HH:MM format
        },
        end: {
          type: String,
          match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, // HH:MM format
        },
        timezone: {
          type: String,
          default: 'UTC',
        },
      },
      rateLimit: {
        requests: {
          type: Number,
          min: 1,
        },
        window: {
          type: Number,
          min: 1, // seconds
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
permissionSchema.index({ code: 1 }, { unique: true });
permissionSchema.index({ resource: 1, action: 1 });
permissionSchema.index({ scope: 1 });
permissionSchema.index({ 'metadata.category': 1 });
permissionSchema.index({ 'metadata.riskLevel': 1 });
permissionSchema.index({ isSystemPermission: 1 });
permissionSchema.index({ isActive: 1 });

// Virtual for full permission string
permissionSchema.virtual('fullPermission').get(function () {
  return `${this.resource}:${this.action}`;
});

// Middleware to prevent deletion of system permissions
permissionSchema.pre(
  'deleteOne',
  { document: true, query: false },
  function () {
    if (this.isSystemPermission) {
      throw new Error('System permissions cannot be deleted');
    }
  }
);

// Method to check if permission applies to a specific context
permissionSchema.methods.appliesTo = function (context: {
  resource: string;
  action: string;
  scope?: string;
  companyId?: mongoose.Types.ObjectId;
  departmentId?: mongoose.Types.ObjectId;
  teamId?: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
}): boolean {
  // Check resource match
  if (this.resource !== '*' && this.resource !== context.resource) {
    return false;
  }

  // Check action match
  if (this.action !== '*' && this.action !== context.action) {
    return false;
  }

  // Check scope match (simplified logic)
  if (
    context.scope &&
    this.scope !== 'global' &&
    this.scope !== context.scope
  ) {
    return false;
  }

  return true;
};

// Method to evaluate permission constraints
permissionSchema.methods.evaluateConstraints = function (context: {
  user?: any;
  resource?: any;
  timestamp?: Date;
  clientIP?: string;
  [key: string]: any;
}): { allowed: boolean; reason?: string } {
  if (!this.constraints) {
    return { allowed: true };
  }

  const now = context.timestamp || new Date();

  // Check time window constraints
  if (this.constraints.timeWindow?.start || this.constraints.timeWindow?.end) {
    const currentTime = now.toTimeString().substring(0, 5); // HH:MM
    const start = this.constraints.timeWindow.start;
    const end = this.constraints.timeWindow.end;

    if (start && currentTime < start) {
      return {
        allowed: false,
        reason: 'Permission not allowed at this time (before allowed window)',
      };
    }

    if (end && currentTime > end) {
      return {
        allowed: false,
        reason: 'Permission not allowed at this time (after allowed window)',
      };
    }
  }

  // Check custom conditions
  if (this.constraints.conditions?.length) {
    for (const condition of this.constraints.conditions) {
      const fieldValue = this.getNestedValue(context, condition.field);
      if (
        !this.evaluateCondition(fieldValue, condition.operator, condition.value)
      ) {
        return {
          allowed: false,
          reason: `Condition not met: ${condition.field} ${condition.operator} ${condition.value}`,
        };
      }
    }
  }

  return { allowed: true };
};

// Helper method to get nested object values
permissionSchema.methods.getNestedValue = function (
  obj: any,
  path: string
): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

// Helper method to evaluate conditions
permissionSchema.methods.evaluateCondition = function (
  fieldValue: any,
  operator: string,
  conditionValue: any
): boolean {
  switch (operator) {
    case 'eq':
      return fieldValue === conditionValue;
    case 'ne':
      return fieldValue !== conditionValue;
    case 'gt':
      return fieldValue > conditionValue;
    case 'lt':
      return fieldValue < conditionValue;
    case 'gte':
      return fieldValue >= conditionValue;
    case 'lte':
      return fieldValue <= conditionValue;
    case 'in':
      return (
        Array.isArray(conditionValue) && conditionValue.includes(fieldValue)
      );
    case 'nin':
      return (
        Array.isArray(conditionValue) && !conditionValue.includes(fieldValue)
      );
    case 'contains':
      return (
        typeof fieldValue === 'string' && fieldValue.includes(conditionValue)
      );
    case 'regex':
      return new RegExp(conditionValue).test(String(fieldValue));
    default:
      return false;
  }
};

// Static method to find permissions by resource and action
permissionSchema.statics.findByResourceAction = function (
  resource: string,
  action: string,
  includeWildcards = true
) {
  const query: any = { isActive: true };

  if (includeWildcards) {
    query.$or = [
      { resource, action },
      { resource: '*', action },
      { resource, action: '*' },
      { resource: '*', action: '*' },
    ];
  } else {
    query.resource = resource;
    query.action = action;
  }

  return this.find(query);
};

// Static method to find permissions by category
permissionSchema.statics.findByCategory = function (category: string) {
  return this.find({
    'metadata.category': category,
    isActive: true,
  }).sort({ name: 1 });
};

// Static method to find high-risk permissions
permissionSchema.statics.findHighRisk = function () {
  return this.find({
    'metadata.riskLevel': { $in: ['high', 'critical'] },
    isActive: true,
  }).sort({ 'metadata.riskLevel': -1, name: 1 });
};

// Static method to get system permissions
permissionSchema.statics.getSystemPermissions = function () {
  return this.find({
    isSystemPermission: true,
    isActive: true,
  }).sort({ resource: 1, action: 1 });
};

export const Permission = mongoose.model<IPermission, IPermissionModel>(
  'Permission',
  permissionSchema
);
