/**
 * USER SEQUELIZE MODEL
 * Represents users in the ML platform with comprehensive type safety and validation
 */
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Default,
  CreatedAt,
  UpdatedAt,
  Unique,
  HasMany,
  DataType,
  Length,
  IsEmail,
  Index
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { Op } from 'sequelize';
import { Project } from './Project.model';
import { AuditLog } from './AuditLog.model';
import { ApiKey } from './ApiKey.model';
import bcrypt from 'bcrypt';

// User Attributes Interface
export interface UserAttributes {
  /** Unique identifier for the user */
  id: number;
  /** User's email address - must be unique */
  email: string;
  /** User's first name */
  first_name: string;
  /** User's last name */
  last_name: string;
  /** Hashed password for authentication */
  password_hash: string;
  /** User's role in the system */
  role: 'admin' | 'user' | 'analyst' | 'viewer' | 'security_manager' | 'threat_hunter' | 'compliance_officer';
  /** Whether the user account is active */
  is_active: boolean;
  /** URL to user's avatar image */
  avatar_url?: string;
  /** User's department */
  department?: string;
  /** User's job title */
  job_title?: string;
  /** User's phone number */
  phone_number?: string;
  /** User's timezone */
  timezone?: string;
  /** User's language preference */
  language: string;
  /** Last login timestamp */
  last_login?: Date;
  /** Last password change timestamp */
  password_changed_at?: Date;
  /** Failed login attempts count */
  failed_login_attempts: number;
  /** Account locked until timestamp */
  locked_until?: Date;
  /** Whether MFA is enabled */
  mfa_enabled: boolean;
  /** MFA secret for TOTP */
  mfa_secret?: string;
  /** Email verification status */
  email_verified: boolean;
  /** Email verification token */
  email_verification_token?: string;
  /** Password reset token */
  password_reset_token?: string;
  /** Password reset token expiry */
  password_reset_expires?: Date;
  /** User preferences as JSON object */
  preferences: Record<string, any>;
  /** Array of user permissions */
  permissions: string[];
  /** User's security clearance level */
  clearance_level: 'unclassified' | 'confidential' | 'secret' | 'top_secret';
  /** User's status */
  status: 'active' | 'inactive' | 'suspended' | 'pending' | 'locked';
  /** Last activity timestamp */
  last_activity?: Date;
  /** Classification tags */
  tags: string[];
  /** Additional metadata */
  metadata: Record<string, any>;
  /** Record creation timestamp */
  created_at: Date;
  /** Record last update timestamp */
  updated_at: Date;
}

// User Creation Attributes Interface (optional fields for creation)
export interface UserCreationAttributes extends Optional<UserAttributes, 
  'id' | 'is_active' | 'avatar_url' | 'department' | 'job_title' | 'phone_number' | 'timezone' |
  'language' | 'last_login' | 'password_changed_at' | 'failed_login_attempts' | 'locked_until' |
  'mfa_enabled' | 'mfa_secret' | 'email_verified' | 'email_verification_token' | 
  'password_reset_token' | 'password_reset_expires' | 'preferences' | 'permissions' |
  'clearance_level' | 'status' | 'last_activity' | 'tags' | 'metadata' | 'created_at' | 'updated_at'
> {}

@Table({
  tableName: 'users',
  timestamps: true,
  underscored: true,
  paranoid: false,
  indexes: [
    { unique: true, fields: ['email'] },
    { fields: ['role'] },
    { fields: ['is_active'] },
    { fields: ['status'] },
    { fields: ['department'] },
    { fields: ['clearance_level'] },
    { fields: ['email_verified'] },
    { fields: ['last_login'] },
    { fields: ['last_activity'] },
    { fields: ['created_at'] }
  ],
  scopes: {
    // SQ.39: Named scopes for frequently queried data
    active: {
      where: {
        is_active: true,
        status: 'active'
      }
    },
    admins: {
      where: {
        role: 'admin'
      }
    },
    analysts: {
      where: {
        role: ['analyst', 'security_manager', 'threat_hunter']
      }
    },
    verified: {
      where: {
        email_verified: true
      }
    },
    recentlyActive: {
      where: {
        last_activity: {
          [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    },
    withMFA: {
      where: {
        mfa_enabled: true
      }
    },
    highClearance: {
      where: {
        clearance_level: ['secret', 'top_secret']
      }
    }
  }
})
export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  /** Unique identifier for the user */
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  /** User's email address - must be unique */
  @AllowNull(false)
  @Unique
  @IsEmail
  @Length({ min: 5, max: 255 })
  @Column(DataType.STRING(255))
  declare email: string;

  /** User's first name */
  @AllowNull(false)
  @Length({ min: 1, max: 255 })
  @Column(DataType.STRING(255))
  declare first_name: string;

  /** User's last name */
  @AllowNull(false)
  @Length({ min: 1, max: 255 })
  @Column(DataType.STRING(255))
  declare last_name: string;

  /** Hashed password for authentication */
  @AllowNull(false)
  @Length({ min: 60, max: 255 })
  @Column(DataType.STRING(255))
  declare password_hash: string;

  /** User's role in the system */
  @AllowNull(false)
  @Default('user')
  @Index
  @Column(DataType.ENUM('admin', 'user', 'analyst', 'viewer', 'security_manager', 'threat_hunter', 'compliance_officer'))
  declare role: 'admin' | 'user' | 'analyst' | 'viewer' | 'security_manager' | 'threat_hunter' | 'compliance_officer';

  /** Whether the user account is active */
  @AllowNull(false)
  @Default(true)
  @Index
  @Column(DataType.BOOLEAN)
  declare is_active: boolean;

  /** URL to user's avatar image */
  @AllowNull(true)
  @Length({ max: 500 })
  @Column(DataType.STRING(500))
  declare avatar_url?: string;

  /** User's department */
  @AllowNull(true)
  @Index
  @Length({ max: 100 })
  @Column(DataType.STRING(100))
  declare department?: string;

  /** User's job title */
  @AllowNull(true)
  @Length({ max: 100 })
  @Column(DataType.STRING(100))
  declare job_title?: string;

  /** User's phone number */
  @AllowNull(true)
  @Length({ max: 20 })
  @Column(DataType.STRING(20))
  declare phone_number?: string;

  /** User's timezone */
  @AllowNull(true)
  @Length({ max: 50 })
  @Column(DataType.STRING(50))
  declare timezone?: string;

  /** User's language preference */
  @AllowNull(false)
  @Default('en')
  @Length({ max: 10 })
  @Column(DataType.STRING(10))
  declare language: string;

  /** Last login timestamp */
  @AllowNull(true)
  @Index
  @Column(DataType.DATE)
  declare last_login?: Date;

  /** Last password change timestamp */
  @AllowNull(true)
  @Column(DataType.DATE)
  declare password_changed_at?: Date;

  /** Failed login attempts count */
  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  declare failed_login_attempts: number;

  /** Account locked until timestamp */
  @AllowNull(true)
  @Column(DataType.DATE)
  declare locked_until?: Date;

  /** Whether MFA is enabled */
  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  declare mfa_enabled: boolean;

  /** MFA secret for TOTP */
  @AllowNull(true)
  @Column(DataType.STRING(255))
  declare mfa_secret?: string;

  /** Email verification status */
  @AllowNull(false)
  @Default(false)
  @Index
  @Column(DataType.BOOLEAN)
  declare email_verified: boolean;

  /** Email verification token */
  @AllowNull(true)
  @Column(DataType.STRING(255))
  declare email_verification_token?: string;

  /** Password reset token */
  @AllowNull(true)
  @Column(DataType.STRING(255))
  declare password_reset_token?: string;

  /** Password reset token expiry */
  @AllowNull(true)
  @Column(DataType.DATE)
  declare password_reset_expires?: Date;

  /** User preferences as JSON object */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare preferences: Record<string, any>;

  /** Array of user permissions */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare permissions: string[];

  /** User's security clearance level */
  @AllowNull(false)
  @Default('unclassified')
  @Index
  @Column(DataType.ENUM('unclassified', 'confidential', 'secret', 'top_secret'))
  declare clearance_level: 'unclassified' | 'confidential' | 'secret' | 'top_secret';

  /** User's status */
  @AllowNull(false)
  @Default('active')
  @Index
  @Column(DataType.ENUM('active', 'inactive', 'suspended', 'pending', 'locked'))
  declare status: 'active' | 'inactive' | 'suspended' | 'pending' | 'locked';

  /** Last activity timestamp */
  @AllowNull(true)
  @Index
  @Column(DataType.DATE)
  declare last_activity?: Date;

  /** Classification tags */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare tags: string[];

  /** Additional metadata */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare metadata: Record<string, any>;

  /** Record creation timestamp */
  @CreatedAt
  @Column(DataType.DATE)
  declare created_at: Date;

  /** Record last update timestamp */
  @UpdatedAt
  @Column(DataType.DATE)
  declare updated_at: Date;

  // Associations
  /** Projects owned by this user */
  @HasMany(() => Project, {
    foreignKey: 'owner_id',
    as: 'projects',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  })
  declare projects?: Project[];

  /** Audit logs for this user */
  @HasMany(() => AuditLog, {
    foreignKey: 'user_id',
    as: 'audit_logs',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  })
  declare audit_logs?: AuditLog[];

  /** API keys belonging to this user */
  @HasMany(() => ApiKey, {
    foreignKey: 'user_id',
    as: 'api_keys',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  declare api_keys?: ApiKey[];

  // Instance methods
  /**
   * Get the user's full name
   * @returns Concatenated first and last name
   */
  public getFullName(): string {
    return `${this.first_name} ${this.last_name}`;
  }

  /**
   * Get user's initials
   * @returns User's first and last name initials
   */
  public getInitials(): string {
    return `${this.first_name.charAt(0)}${this.last_name.charAt(0)}`.toUpperCase();
  }

  /**
   * Check if user is admin
   * @returns True if user has admin role
   */
  public isAdmin(): boolean {
    return this.role === 'admin';
  }

  /**
   * Check if user is analyst
   * @returns True if user has analyst or security roles
   */
  public isAnalyst(): boolean {
    return ['analyst', 'security_manager', 'threat_hunter'].includes(this.role);
  }

  /**
   * Check if user is security manager
   * @returns True if user has security_manager role
   */
  public isSecurityManager(): boolean {
    return this.role === 'security_manager';
  }

  /**
   * Check if user is threat hunter
   * @returns True if user has threat_hunter role
   */
  public isThreatHunter(): boolean {
    return this.role === 'threat_hunter';
  }

  /**
   * Check if user is compliance officer
   * @returns True if user has compliance_officer role
   */
  public isComplianceOfficer(): boolean {
    return this.role === 'compliance_officer';
  }

  /**
   * Check if user account is active
   * @returns True if user is active and not locked
   */
  public isActive(): boolean {
    return this.is_active && this.status === 'active' && !this.isLocked();
  }

  /**
   * Check if user account is locked
   * @returns True if account is locked
   */
  public isLocked(): boolean {
    return this.status === 'locked' || (this.locked_until && this.locked_until > new Date());
  }

  /**
   * Check if user account is suspended
   * @returns True if account is suspended
   */
  public isSuspended(): boolean {
    return this.status === 'suspended';
  }

  /**
   * Check if email is verified
   * @returns True if email is verified
   */
  public isEmailVerified(): boolean {
    return this.email_verified;
  }

  /**
   * Check if MFA is enabled
   * @returns True if MFA is enabled
   */
  public isMfaEnabled(): boolean {
    return this.mfa_enabled;
  }

  /**
   * Check if password reset is valid
   * @returns True if password reset token is valid and not expired
   */
  public isPasswordResetValid(): boolean {
    return !!(this.password_reset_token && 
              this.password_reset_expires && 
              this.password_reset_expires > new Date());
  }

  /**
   * Check if user has a specific permission
   * @param permission Permission string to check
   * @returns True if user has permission or is admin
   */
  public hasPermission(permission: string): boolean {
    return this.permissions.includes(permission) || this.role === 'admin';
  }

  /**
   * Check if user has specific tag
   * @param tag Tag to check for
   * @returns True if tag exists
   */
  public hasTag(tag: string): boolean {
    return this.tags.includes(tag);
  }

  /**
   * Get clearance level as numeric value
   * @returns Numeric clearance level (1-4)
   */
  public getClearanceLevel(): number {
    const clearanceMap = {
      unclassified: 1,
      confidential: 2,
      secret: 3,
      top_secret: 4
    };
    return clearanceMap[this.clearance_level];
  }

  /**
   * Check if user has sufficient clearance
   * @param requiredLevel Required clearance level
   * @returns True if user has sufficient clearance
   */
  public hasClearance(requiredLevel: UserAttributes['clearance_level']): boolean {
    const userLevel = this.getClearanceLevel();
    const requiredLevelNum = {
      unclassified: 1,
      confidential: 2,
      secret: 3,
      top_secret: 4
    }[requiredLevel];
    return userLevel >= requiredLevelNum;
  }

  /**
   * Get days since last login
   * @returns Days since last login, null if never logged in
   */
  public getDaysSinceLastLogin(): number | null {
    if (!this.last_login) return null;
    const diffTime = new Date().getTime() - this.last_login.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get days since account creation
   * @returns Days since account was created
   */
  public getAccountAge(): number {
    const diffTime = new Date().getTime() - this.created_at.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Update the user's last login timestamp
   * @returns Promise resolving to the updated user instance
   */
  public async updateLastLogin(): Promise<this> {
    this.last_login = new Date();
    this.failed_login_attempts = 0; // Reset failed attempts on successful login
    return this.save();
  }

  /**
   * Update the user's last activity timestamp
   * @returns Promise resolving to the updated user instance
   */
  public async updateLastActivity(): Promise<this> {
    this.last_activity = new Date();
    return this.save();
  }

  /**
   * Increment failed login attempts
   * @returns Promise resolving to the updated user instance
   */
  public async incrementFailedLogins(): Promise<this> {
    this.failed_login_attempts += 1;
    
    // Lock account after 5 failed attempts for 30 minutes
    if (this.failed_login_attempts >= 5) {
      this.locked_until = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      this.status = 'locked';
    }
    
    return this.save();
  }

  /**
   * Reset failed login attempts
   * @returns Promise resolving to the updated user instance
   */
  public async resetFailedLogins(): Promise<this> {
    this.failed_login_attempts = 0;
    this.locked_until = null;
    if (this.status === 'locked') {
      this.status = 'active';
    }
    return this.save();
  }

  /**
   * Verify password against hash
   * @param password Plain text password to verify
   * @returns Promise resolving to true if password matches
   */
  public async verifyPassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password_hash);
  }

  /**
   * Update password with hash
   * @param newPassword New plain text password
   * @returns Promise resolving to updated user
   */
  public async updatePassword(newPassword: string): Promise<this> {
    this.password_hash = await bcrypt.hash(newPassword, 12);
    this.password_changed_at = new Date();
    this.password_reset_token = null;
    this.password_reset_expires = null;
    return this.save();
  }

  /**
   * Generate password reset token
   * @param expiryHours Hours until token expires (default: 24)
   * @returns Promise resolving to updated user with reset token
   */
  public async generatePasswordResetToken(expiryHours: number = 24): Promise<this> {
    const crypto = require('crypto');
    this.password_reset_token = crypto.randomBytes(32).toString('hex');
    this.password_reset_expires = new Date(Date.now() + expiryHours * 60 * 60 * 1000);
    return this.save();
  }

  /**
   * Verify email address
   * @returns Promise resolving to updated user
   */
  public async verifyEmail(): Promise<this> {
    this.email_verified = true;
    this.email_verification_token = null;
    return this.save();
  }

  /**
   * Enable MFA
   * @param secret TOTP secret
   * @returns Promise resolving to updated user
   */
  public async enableMfa(secret: string): Promise<this> {
    this.mfa_enabled = true;
    this.mfa_secret = secret;
    return this.save();
  }

  /**
   * Disable MFA
   * @returns Promise resolving to updated user
   */
  public async disableMfa(): Promise<this> {
    this.mfa_enabled = false;
    this.mfa_secret = null;
    return this.save();
  }

  /**
   * Add permission to user
   * @param permission Permission to add
   * @returns Promise resolving to updated user
   */
  public async addPermission(permission: string): Promise<this> {
    if (!this.permissions.includes(permission)) {
      this.permissions = [...this.permissions, permission];
      return this.save();
    }
    return this;
  }

  /**
   * Remove permission from user
   * @param permission Permission to remove
   * @returns Promise resolving to updated user
   */
  public async removePermission(permission: string): Promise<this> {
    this.permissions = this.permissions.filter(p => p !== permission);
    return this.save();
  }

  /**
   * Add tag to user
   * @param tag Tag to add
   * @returns Promise resolving to updated user
   */
  public async addTag(tag: string): Promise<this> {
    if (!this.tags.includes(tag)) {
      this.tags = [...this.tags, tag];
      return this.save();
    }
    return this;
  }

  /**
   * Suspend user account
   * @param reason Reason for suspension
   * @returns Promise resolving to updated user
   */
  public async suspend(reason?: string): Promise<this> {
    this.status = 'suspended';
    if (reason) {
      this.metadata = {
        ...this.metadata,
        suspension_reason: reason,
        suspended_at: new Date()
      };
    }
    return this.save();
  }

  /**
   * Activate user account
   * @returns Promise resolving to updated user
   */
  public async activate(): Promise<this> {
    this.status = 'active';
    this.is_active = true;
    this.locked_until = null;
    this.failed_login_attempts = 0;
    return this.save();
  }

  // Static methods
  /**
   * Find user by email address
   * @param email Email to search for
   * @returns Promise resolving to user or null
   */
  static async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ where: { email: email.toLowerCase() } });
  }

  /**
   * Find all active users
   * @returns Promise resolving to array of active users
   */
  static async findActive(): Promise<User[]> {
    return this.findAll({ 
      where: { 
        is_active: true,
        status: 'active'
      },
      order: [['last_login', 'DESC']]
    });
  }

  /**
   * Find users by role
   * @param role Role to filter by
   * @returns Promise resolving to array of users
   */
  static async findByRole(role: UserAttributes['role']): Promise<User[]> {
    return this.findAll({ 
      where: { role },
      order: [['last_login', 'DESC']]
    });
  }

  /**
   * Find users by status
   * @param status Status to filter by
   * @returns Promise resolving to array of users
   */
  static async findByStatus(status: UserAttributes['status']): Promise<User[]> {
    return this.findAll({ 
      where: { status },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Find users by department
   * @param department Department to filter by
   * @returns Promise resolving to array of users
   */
  static async findByDepartment(department: string): Promise<User[]> {
    return this.findAll({ 
      where: { department },
      order: [['last_login', 'DESC']]
    });
  }

  /**
   * Find users by clearance level
   * @param clearanceLevel Clearance level to filter by
   * @returns Promise resolving to array of users
   */
  static async findByClearance(clearanceLevel: UserAttributes['clearance_level']): Promise<User[]> {
    return this.findAll({
      where: { clearance_level: clearanceLevel },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Find locked users
   * @returns Promise resolving to locked users
   */
  static async findLocked(): Promise<User[]> {
    return this.findAll({
      where: {
        [Op.or]: [
          { status: 'locked' },
          { locked_until: { [Op.gt]: new Date() } }
        ]
      },
      order: [['locked_until', 'DESC']]
    });
  }

  /**
   * Find users with unverified emails
   * @returns Promise resolving to users with unverified emails
   */
  static async findUnverifiedEmails(): Promise<User[]> {
    return this.findAll({
      where: { email_verified: false },
      order: [['created_at', 'ASC']]
    });
  }

  /**
   * Find inactive users
   * @param days Days to consider inactive (default: 30)
   * @returns Promise resolving to inactive users
   */
  static async findInactive(days: number = 30): Promise<User[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return this.findAll({
      where: {
        [Op.or]: [
          { last_login: { [Op.lt]: cutoffDate } },
          { last_login: null }
        ]
      },
      order: [['last_login', 'ASC']]
    });
  }

  /**
   * Find recently active users
   * @param hours Hours to look back (default: 24)
   * @returns Promise resolving to recently active users
   */
  static async findRecentlyActive(hours: number = 24): Promise<User[]> {
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - hours);
    
    return this.findAll({
      where: {
        last_activity: { [Op.gte]: cutoffDate }
      },
      order: [['last_activity', 'DESC']]
    });
  }

  /**
   * Get user statistics by role
   * @returns Promise resolving to role statistics
   */
  static async getRoleStats(): Promise<Array<{
    role: string;
    count: number;
    active_count: number;
  }>> {
    const results = await this.findAll({
      attributes: [
        'role',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count'],
        [this.sequelize!.fn('COUNT', this.sequelize!.literal("CASE WHEN is_active = true AND status = 'active' THEN 1 END")), 'active_count']
      ],
      group: ['role'],
      order: [['role', 'ASC']]
    });
    
    return results.map(r => ({
      role: r.role,
      count: parseInt((r as any).getDataValue('count')),
      active_count: parseInt((r as any).getDataValue('active_count')) || 0
    }));
  }

  /**
   * Get overall user statistics
   * @returns Promise resolving to comprehensive user stats
   */
  static async getOverallStats(): Promise<{
    total_users: number;
    active_users: number;
    locked_users: number;
    suspended_users: number;
    unverified_emails: number;
    mfa_enabled_users: number;
    users_this_month: number;
    avg_login_frequency: number;
  }> {
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    
    const [
      totalUsers,
      activeUsers,
      lockedUsers,
      suspendedUsers,
      unverifiedEmails,
      mfaEnabledUsers,
      usersThisMonth
    ] = await Promise.all([
      this.count(),
      this.count({ where: { is_active: true, status: 'active' } }),
      this.count({ where: { [Op.or]: [{ status: 'locked' }, { locked_until: { [Op.gt]: new Date() } }] } }),
      this.count({ where: { status: 'suspended' } }),
      this.count({ where: { email_verified: false } }),
      this.count({ where: { mfa_enabled: true } }),
      this.count({ where: { created_at: { [Op.gte]: thisMonth } } })
    ]);

    // Calculate average login frequency (simplified)
    const recentLogins = await this.count({
      where: {
        last_login: { [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }
    });

    return {
      total_users: totalUsers,
      active_users: activeUsers,
      locked_users: lockedUsers,
      suspended_users: suspendedUsers,
      unverified_emails: unverifiedEmails,
      mfa_enabled_users: mfaEnabledUsers,
      users_this_month: usersThisMonth,
      avg_login_frequency: totalUsers > 0 ? Math.round((recentLogins / totalUsers) * 100) / 100 : 0
    };
  }

  /**
   * Create user with validation and password hashing
   * @param data User data to create
   * @returns Promise resolving to created user
   */
  static async createUser(data: UserCreationAttributes & { password: string }): Promise<User> {
    // Validate required fields
    if (!data.email || !data.first_name || !data.last_name || !data.password) {
      throw new Error('Email, first name, last name, and password are required');
    }

    // Validate email format
    const emailRegex = /^[^/s@]+@[^/s@]+/.[^/s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new Error('Invalid email format');
    }

    // Check for duplicate email
    const existingUser = await this.findByEmail(data.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const password_hash = await bcrypt.hash(data.password, 12);
    
    // Remove plain password from data
    const { password, ...userData } = data;
    
    // Create user
    return this.create({
      ...userData,
      password_hash,
      email: data.email.toLowerCase(),
      password_changed_at: new Date()
    });
  }

  /**
   * Authenticate user with email and password
   * @param email User email
   * @param password Plain text password
   * @returns Promise resolving to user if authenticated, null otherwise
   */
  static async authenticate(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (!user || !user.isActive()) {
      return null;
    }

    const isValid = await user.verifyPassword(password);
    if (isValid) {
      await user.updateLastLogin();
      return user;
    } else {
      await user.incrementFailedLogins();
      return null;
    }
  }
}

export default User;
