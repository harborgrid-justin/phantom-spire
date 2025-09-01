import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'analyst' | 'viewer'; // Legacy role field, kept for compatibility
  roles: mongoose.Types.ObjectId[]; // New hierarchical roles
  company: mongoose.Types.ObjectId;
  department?: mongoose.Types.ObjectId;
  teams: mongoose.Types.ObjectId[];
  manager?: mongoose.Types.ObjectId; // Direct manager
  directReports: mongoose.Types.ObjectId[]; // Users reporting to this user
  isActive: boolean;
  lastLogin?: Date;
  profile: {
    title?: string;
    employeeId?: string;
    phoneNumber?: string;
    timezone?: string;
    preferredLanguage?: string;
    avatar?: string;
  };
  security: {
    mfaEnabled: boolean;
    mfaSecret?: string;
    failedLoginAttempts: number;
    lastFailedLogin?: Date;
    accountLockedUntil?: Date;
    passwordChangedAt?: Date;
    sessionTimeout?: number; // in minutes
  };
  preferences: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    defaultDashboard?: string;
    theme: 'light' | 'dark' | 'auto';
  };
  metadata: {
    clearanceLevel?:
      | 'public'
      | 'internal'
      | 'confidential'
      | 'secret'
      | 'top-secret';
    costCenter?: string;
    hireDate?: Date;
    lastActiveDate?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
  hasRole(roleId: mongoose.Types.ObjectId): boolean;
  hasPermission(permissionCode: string): Promise<boolean>;
  canAccessResource(resource: string, action: string): Promise<boolean>;
  isManagerOf(userId: mongoose.Types.ObjectId): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['admin', 'analyst', 'viewer'],
      default: 'viewer',
    },
    roles: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Role',
      },
    ],
    company: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
    },
    teams: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Team',
      },
    ],
    manager: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    directReports: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    profile: {
      title: {
        type: String,
        maxlength: 100,
      },
      employeeId: {
        type: String,
        unique: true,
        sparse: true,
        match: /^[A-Z0-9]{3,20}$/,
      },
      phoneNumber: {
        type: String,
        match: /^\+?[\d\s\-\(\)]{10,20}$/,
      },
      timezone: {
        type: String,
        default: 'UTC',
      },
      preferredLanguage: {
        type: String,
        default: 'en',
        match: /^[a-z]{2}(-[A-Z]{2})?$/,
      },
      avatar: {
        type: String,
        match: /^https?:\/\/.+/,
      },
    },
    security: {
      mfaEnabled: {
        type: Boolean,
        default: false,
      },
      mfaSecret: {
        type: String,
        select: false, // Never return in queries
      },
      failedLoginAttempts: {
        type: Number,
        default: 0,
        max: 10,
      },
      lastFailedLogin: {
        type: Date,
      },
      accountLockedUntil: {
        type: Date,
      },
      passwordChangedAt: {
        type: Date,
      },
      sessionTimeout: {
        type: Number,
        min: 5, // 5 minutes minimum
        max: 1440, // 24 hours maximum
      },
    },
    preferences: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      pushNotifications: {
        type: Boolean,
        default: false,
      },
      defaultDashboard: {
        type: String,
      },
      theme: {
        type: String,
        enum: ['light', 'dark', 'auto'],
        default: 'light',
      },
    },
    metadata: {
      clearanceLevel: {
        type: String,
        enum: ['public', 'internal', 'confidential', 'secret', 'top-secret'],
        default: 'internal',
      },
      costCenter: {
        type: String,
        match: /^[A-Z0-9-]{3,15}$/,
      },
      hireDate: {
        type: Date,
      },
      lastActiveDate: {
        type: Date,
        default: Date.now,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ company: 1, isActive: 1 });
userSchema.index({ department: 1 });
userSchema.index({ teams: 1 });
userSchema.index({ manager: 1 });
userSchema.index({ 'profile.employeeId': 1 }, { unique: true, sparse: true });
userSchema.index({ 'metadata.clearanceLevel': 1 });
userSchema.index({ roles: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for display name (includes title if present)
userSchema.virtual('displayName').get(function () {
  const title = this.profile?.title;
  return title ? `${this.fullName} (${title})` : this.fullName;
});

// Middleware to update manager's direct reports
userSchema.pre('save', async function (next) {
  if (this.isModified('manager')) {
    // Remove from old manager's direct reports
    const oldManagerId = this.get('manager');
    if (oldManagerId) {
      await mongoose
        .model('User')
        .updateOne(
          { _id: oldManagerId },
          { $pull: { directReports: this._id } }
        );
    }

    // Add to new manager's direct reports
    if (this.manager) {
      await mongoose
        .model('User')
        .updateOne(
          { _id: this.manager },
          { $addToSet: { directReports: this._id } }
        );
    }
  }

  // Update last active date
  this.metadata.lastActiveDate = new Date();

  next();
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const bcryptRounds = 12;
  this.password = await bcrypt.hash(this.password, bcryptRounds);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function (): Record<string, unknown> {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.security?.mfaSecret;
  return userObject;
};

// Method to check if user has a specific role
userSchema.methods.hasRole = function (
  roleId: mongoose.Types.ObjectId
): boolean {
  return this.roles.some((r: mongoose.Types.ObjectId) => r.equals(roleId));
};

// Method to check if user has a specific permission
userSchema.methods.hasPermission = async function (
  permissionCode: string
): Promise<boolean> {
  // Get all user roles
  const Role = mongoose.model('Role');
  const Permission = mongoose.model('Permission');

  const userRoles = await Role.find({ _id: { $in: this.roles } }).populate(
    'permissions'
  );
  const permission = await Permission.findOne({ code: permissionCode });

  if (!permission) return false;

  // Check if any role has this permission (including inherited)
  for (const role of userRoles) {
    const hasPermission = await role.hasPermission(permission._id);
    if (hasPermission) return true;
  }

  return false;
};

// Method to check if user can access a resource with specific action
userSchema.methods.canAccessResource = async function (
  resource: string,
  action: string
): Promise<boolean> {
  const Permission = mongoose.model('Permission');

  // Find relevant permissions
  const permissions = await Permission.findByResourceAction(resource, action);

  // Check if user has any of these permissions
  for (const permission of permissions) {
    const hasPermission = await this.hasPermission(permission.code);
    if (hasPermission) return true;
  }

  return false;
};

// Method to check if user is manager of another user
userSchema.methods.isManagerOf = async function (
  userId: mongoose.Types.ObjectId
): Promise<boolean> {
  // Direct management
  if (this.directReports.includes(userId)) return true;

  // Indirect management (through hierarchy)
  const subordinate = await mongoose.model('User').findById(userId);
  if (!subordinate) return false;

  let currentManager = subordinate.manager;
  const visitedIds = new Set();

  while (currentManager && !visitedIds.has(currentManager.toString())) {
    visitedIds.add(currentManager.toString());
    if (currentManager.equals(this._id)) return true;

    const manager = await mongoose.model('User').findById(currentManager);
    currentManager = manager?.manager;

    if (visitedIds.size > 10) break; // Prevent infinite loops
  }

  return false;
};

// Method to check if account is locked
userSchema.methods.isAccountLocked = function (): boolean {
  return (
    this.security.accountLockedUntil &&
    this.security.accountLockedUntil > new Date()
  );
};

// Method to increment failed login attempts
userSchema.methods.incrementFailedLoginAttempts =
  async function (): Promise<void> {
    this.security.failedLoginAttempts += 1;
    this.security.lastFailedLogin = new Date();

    // Lock account after 5 failed attempts
    if (this.security.failedLoginAttempts >= 5) {
      this.security.accountLockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    }

    await this.save();
  };

// Method to reset failed login attempts
userSchema.methods.resetFailedLoginAttempts = async function (): Promise<void> {
  this.security.failedLoginAttempts = 0;
  this.security.accountLockedUntil = undefined;
  this.security.lastFailedLogin = undefined;
  await this.save();
};

export const User = mongoose.model<IUser>('User', userSchema);
