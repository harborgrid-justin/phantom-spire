import mongoose, { Schema, Document } from 'mongoose';

export interface ITeam extends Document {
  name: string;
  code: string; // Unique within department
  description?: string;
  department: mongoose.Types.ObjectId;
  company: mongoose.Types.ObjectId; // For direct queries
  teamLead?: mongoose.Types.ObjectId; // User who leads this team
  members: mongoose.Types.ObjectId[]; // Users in this team
  isActive: boolean;
  settings: {
    maxMembers?: number;
    requireLeadApproval: boolean;
    allowGuestMembers: boolean;
  };
  metadata: {
    teamType:
      | 'operational'
      | 'project'
      | 'functional'
      | 'cross-functional'
      | 'temporary'
      | 'permanent';
    specialization?:
      | 'threat-hunting'
      | 'incident-response'
      | 'malware-analysis'
      | 'forensics'
      | 'intelligence'
      | 'operations'
      | 'research'
      | 'other';
    clearanceLevel?:
      | 'public'
      | 'internal'
      | 'confidential'
      | 'secret'
      | 'top-secret';
    operatingHours?: {
      timezone: string;
      schedule: '24/7' | 'business-hours' | 'extended-hours' | 'on-call';
    };
  };
  performance: {
    casesHandled: number;
    averageResponseTime?: number; // in minutes
    successRate?: number; // percentage
    lastUpdated: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const teamSchema = new Schema<ITeam>(
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
      match: /^[A-Z0-9_]{2,15}$/, // 2-15 characters, alphanumeric and underscore
    },
    description: {
      type: String,
      maxlength: 500,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    teamLead: {
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
      maxMembers: {
        type: Number,
        min: 1,
        max: 50,
        default: 20,
      },
      requireLeadApproval: {
        type: Boolean,
        default: true,
      },
      allowGuestMembers: {
        type: Boolean,
        default: false,
      },
    },
    metadata: {
      teamType: {
        type: String,
        enum: [
          'operational',
          'project',
          'functional',
          'cross-functional',
          'temporary',
          'permanent',
        ],
        default: 'functional',
        required: true,
      },
      specialization: {
        type: String,
        enum: [
          'threat-hunting',
          'incident-response',
          'malware-analysis',
          'forensics',
          'intelligence',
          'operations',
          'research',
          'other',
        ],
      },
      clearanceLevel: {
        type: String,
        enum: ['public', 'internal', 'confidential', 'secret', 'top-secret'],
        default: 'internal',
      },
      operatingHours: {
        timezone: {
          type: String,
          default: 'UTC',
        },
        schedule: {
          type: String,
          enum: ['24/7', 'business-hours', 'extended-hours', 'on-call'],
          default: 'business-hours',
        },
      },
    },
    performance: {
      casesHandled: {
        type: Number,
        default: 0,
        min: 0,
      },
      averageResponseTime: {
        type: Number,
        min: 0, // in minutes
      },
      successRate: {
        type: Number,
        min: 0,
        max: 100, // percentage
      },
      lastUpdated: {
        type: Date,
        default: Date.now,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for performance and uniqueness
teamSchema.index({ department: 1, code: 1 }, { unique: true }); // Code unique per department
teamSchema.index({ company: 1, isActive: 1 });
teamSchema.index({ department: 1, isActive: 1 });
teamSchema.index({ teamLead: 1 });
teamSchema.index({ members: 1 });
teamSchema.index({ 'metadata.specialization': 1 });
teamSchema.index({ 'metadata.teamType': 1 });

// Virtual for team capacity utilization
teamSchema.virtual('capacityUtilization').get(function () {
  const maxMembers = this.settings.maxMembers || 20;
  return Math.round((this.members.length / maxMembers) * 100);
});

// Virtual for full team path (Company > Department > Team)
teamSchema.virtual('fullPath').get(function () {
  // This will be populated by a service method
  return this.name;
});

// Middleware to ensure team lead is also a member
teamSchema.pre('save', async function (next) {
  if (this.teamLead && !this.members.includes(this.teamLead)) {
    this.members.push(this.teamLead);
  }

  // Check member limit
  const maxMembers = this.settings.maxMembers || 20;
  if (this.members.length > maxMembers) {
    throw new Error(`Team cannot have more than ${maxMembers} members`);
  }

  next();
});

// Middleware to update performance metrics timestamp
teamSchema.pre('save', function (next) {
  if (
    this.isModified('performance.casesHandled') ||
    this.isModified('performance.averageResponseTime') ||
    this.isModified('performance.successRate')
  ) {
    this.performance.lastUpdated = new Date();
  }
  next();
});

// Method to add member to team
teamSchema.methods.addMember = async function (
  userId: mongoose.Types.ObjectId
): Promise<boolean> {
  if (this.members.includes(userId)) return false; // Already a member

  const maxMembers = this.settings.maxMembers || 20;
  if (this.members.length >= maxMembers) {
    throw new Error(
      `Team has reached maximum capacity of ${maxMembers} members`
    );
  }

  this.members.push(userId);
  await this.save();
  return true;
};

// Method to remove member from team
teamSchema.methods.removeMember = async function (
  userId: mongoose.Types.ObjectId
): Promise<boolean> {
  const index = this.members.indexOf(userId);
  if (index === -1) return false; // Not a member

  // Cannot remove team lead without reassigning
  if (this.teamLead && this.teamLead.equals(userId)) {
    throw new Error('Cannot remove team lead. Reassign leadership first.');
  }

  this.members.splice(index, 1);
  await this.save();
  return true;
};

// Method to change team lead
teamSchema.methods.changeTeamLead = async function (
  newLeadId?: mongoose.Types.ObjectId
): Promise<void> {
  if (newLeadId) {
    // Ensure new lead is a member
    if (!this.members.includes(newLeadId)) {
      await this.addMember(newLeadId);
    }
  }

  this.teamLead = newLeadId;
  await this.save();
};

// Method to check if user can access this team
teamSchema.methods.canUserAccess = async function (
  userId: mongoose.Types.ObjectId
): Promise<boolean> {
  // Check if user is a member
  if (this.members.includes(userId)) return true;

  // Check if user is the team lead
  if (this.teamLead && this.teamLead.equals(userId)) return true;

  // Check department access (team members have access to parent department)
  const department = await mongoose
    .model('Department')
    .findById(this.department);
  if (department) {
    return await department.canUserAccess(userId);
  }

  return false;
};

// Method to update performance metrics
teamSchema.methods.updatePerformance = async function (metrics: {
  casesHandled?: number;
  averageResponseTime?: number;
  successRate?: number;
}): Promise<void> {
  if (metrics.casesHandled !== undefined) {
    this.performance.casesHandled = metrics.casesHandled;
  }
  if (metrics.averageResponseTime !== undefined) {
    this.performance.averageResponseTime = metrics.averageResponseTime;
  }
  if (metrics.successRate !== undefined) {
    this.performance.successRate = Math.max(
      0,
      Math.min(100, metrics.successRate)
    );
  }

  this.performance.lastUpdated = new Date();
  await this.save();
};

// Static method to find teams by specialization
teamSchema.statics.findBySpecialization = function (
  specialization: string,
  companyId?: mongoose.Types.ObjectId
) {
  const query: any = {
    'metadata.specialization': specialization,
    isActive: true,
  };

  if (companyId) {
    query.company = companyId;
  }

  return this.find(query)
    .populate('department', 'name code')
    .populate('company', 'name code')
    .populate('teamLead', 'firstName lastName email')
    .sort({ name: 1 });
};

export const Team = mongoose.model<ITeam>('Team', teamSchema);
