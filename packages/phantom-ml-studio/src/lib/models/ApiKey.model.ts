/**
 * API KEY SEQUELIZE MODEL
 * Represents API keys for user authentication with comprehensive type safety
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
  BelongsTo,
  ForeignKey,
  Unique,
  DataType,
  Index,
  Length
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { Op } from 'sequelize';
import { User } from './User.model';

// ApiKey Attributes Interface
export interface ApiKeyAttributes {
  /** Unique identifier for the API key */
  id: number;
  /** ID of the user who owns this API key */
  user_id: number;
  /** Hashed version of the API key */
  key_hash: string;
  /** Human-readable name for the API key */
  name: string;
  /** Optional description of the API key's purpose */
  description?: string;
  /** Current status of the API key */
  status: 'active' | 'revoked' | 'expired' | 'suspended';
  /** Permissions/scopes granted to this API key */
  scopes: string[];
  /** When the API key expires (null for never) */
  expires_at?: Date;
  /** When the API key was last used */
  last_used_at?: Date;
  /** Number of times this key has been used */
  usage_count: number;
  /** Rate limit for requests per hour */
  rate_limit: number;
  /** IP addresses allowed to use this key */
  allowed_ips: string[];
  /** Additional metadata */
  metadata: Record<string, any>;
  /** Record creation timestamp */
  created_at: Date;
  /** Record last update timestamp */
  updated_at: Date;
}

// ApiKey Creation Attributes Interface
export interface ApiKeyCreationAttributes extends Optional<ApiKeyAttributes,
  'id' | 'description' | 'status' | 'scopes' | 'expires_at' | 'last_used_at' | 
  'usage_count' | 'rate_limit' | 'allowed_ips' | 'metadata' | 'created_at' | 'updated_at'
> {}

@Table({
  tableName: 'api_keys',
  timestamps: true,
  underscored: true,
  paranoid: false,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['key_hash'], unique: true },
    { fields: ['status'] },
    { fields: ['expires_at'] },
    { fields: ['last_used_at'] },
    { fields: ['created_at'] }
  ]
})
export class ApiKey extends Model<ApiKeyAttributes, ApiKeyCreationAttributes> implements ApiKeyAttributes {
  /** Unique identifier for the API key */
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  /** ID of the user who owns this API key */
  @ForeignKey(() => User)
  @AllowNull(false)
  @Index
  @Column(DataType.INTEGER)
  declare user_id: number;

  /** Hashed version of the API key */
  @AllowNull(false)
  @Unique
  @Index
  @Length({ min: 1, max: 128 })
  @Column(DataType.STRING(128))
  declare key_hash: string;

  /** Human-readable name for the API key */
  @AllowNull(false)
  @Length({ min: 1, max: 100 })
  @Column(DataType.STRING(100))
  declare name: string;

  /** Optional description of the API key's purpose */
  @AllowNull(true)
  @Column(DataType.TEXT)
  declare description?: string;

  /** Current status of the API key */
  @AllowNull(false)
  @Default('active')
  @Index
  @Column(DataType.ENUM('active', 'revoked', 'expired', 'suspended'))
  declare status: 'active' | 'revoked' | 'expired' | 'suspended';

  /** Permissions/scopes granted to this API key */
  @AllowNull(false)
  @Default('[]')
  @Column(DataType.ARRAY(DataType.STRING))
  declare scopes: string[];

  /** When the API key expires (null for never) */
  @AllowNull(true)
  @Index
  @Column(DataType.DATE)
  declare expires_at?: Date;

  /** When the API key was last used */
  @AllowNull(true)
  @Index
  @Column(DataType.DATE)
  declare last_used_at?: Date;

  /** Number of times this key has been used */
  @AllowNull(false)
  @Default(0)
  @Column(DataType.BIGINT)
  declare usage_count: number;

  /** Rate limit for requests per hour */
  @AllowNull(false)
  @Default(1000)
  @Column(DataType.INTEGER)
  declare rate_limit: number;

  /** IP addresses allowed to use this key */
  @AllowNull(false)
  @Default('[]')
  @Column(DataType.ARRAY(DataType.STRING))
  declare allowed_ips: string[];

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
  /** User who owns this API key */
  @BelongsTo(() => User, {
    foreignKey: 'user_id',
    as: 'user',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  declare user?: User;

  // Instance methods
  /**
   * Check if the API key has expired
   * @returns True if the key has passed its expiration date
   */
  public isExpired(): boolean {
    return this.expires_at ? new Date() > this.expires_at : false;
  }

  /**
   * Check if the API key is currently active
   * @returns True if status is active and not expired
   */
  public isActive(): boolean {
    return this.status === 'active' && !this.isExpired();
  }

  /**
   * Check if the API key is revoked
   * @returns True if status is revoked
   */
  public isRevoked(): boolean {
    return this.status === 'revoked';
  }

  /**
   * Check if the API key is suspended
   * @returns True if status is suspended
   */
  public isSuspended(): boolean {
    return this.status === 'suspended';
  }

  /**
   * Check if the API key has a specific scope
   * @param scope Scope to check for
   * @returns True if the key has the specified scope
   */
  public hasScope(scope: string): boolean {
    return this.scopes.includes(scope);
  }

  /**
   * Check if the API key has any of the specified scopes
   * @param scopes Array of scopes to check
   * @returns True if the key has at least one of the scopes
   */
  public hasAnyScope(scopes: string[]): boolean {
    return scopes.some(scope => this.scopes.includes(scope));
  }

  /**
   * Check if the API key has all of the specified scopes
   * @param scopes Array of scopes to check
   * @returns True if the key has all specified scopes
   */
  public hasAllScopes(scopes: string[]): boolean {
    return scopes.every(scope => this.scopes.includes(scope));
  }

  /**
   * Check if an IP address is allowed to use this key
   * @param ipAddress IP address to check
   * @returns True if IP is allowed (empty array means all IPs allowed)
   */
  public isIpAllowed(ipAddress: string): boolean {
    if (this.allowed_ips.length === 0) return true; // No restrictions
    return this.allowed_ips.includes(ipAddress);
  }

  /**
   * Get the number of days until the key expires
   * @returns Days until expiration, null if no expiration, negative if expired
   */
  public getDaysUntilExpiration(): number | null {
    if (!this.expires_at) return null;
    const diffTime = this.expires_at.getTime() - new Date().getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get the age of the API key in days
   * @returns Age in days since creation
   */
  public getAge(): number {
    const diffTime = new Date().getTime() - this.created_at.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get usage rate (uses per day)
   * @returns Average uses per day since creation
   */
  public getUsageRate(): number {
    const ageInDays = Math.max(1, this.getAge()); // At least 1 day
    return Math.round((Number(this.usage_count) / ageInDays) * 100) / 100;
  }

  /**
   * Check if the key is close to expiration
   * @param days Number of days to consider "close" (default: 7)
   * @returns True if key expires within the specified days
   */
  public isExpiringWithin(days: number = 7): boolean {
    const daysUntilExpiration = this.getDaysUntilExpiration();
    return daysUntilExpiration !== null && daysUntilExpiration <= days && daysUntilExpiration >= 0;
  }

  /**
   * Record usage of the API key
   * @param ipAddress Optional IP address that used the key
   * @returns Promise resolving to updated key
   */
  public async recordUsage(ipAddress?: string): Promise<this> {
    this.usage_count = Number(this.usage_count) + 1;
    this.last_used_at = new Date();
    
    if (ipAddress) {
      this.metadata = {
        ...this.metadata,
        last_used_ip: ipAddress,
        ip_usage_history: [
          ...(this.metadata['ip_usage_history'] || []).slice(-9), // Keep last 10
          { ip: ipAddress, timestamp: new Date() }
        ]
      };
    }
    
    return this.save();
  }

  /**
   * Revoke the API key
   * @param reason Optional reason for revocation
   * @returns Promise resolving to updated key
   */
  public async revoke(reason?: string): Promise<this> {
    this.status = 'revoked';
    if (reason) {
      this.metadata = {
        ...this.metadata,
        revocation_reason: reason,
        revoked_at: new Date()
      };
    }
    return this.save();
  }

  /**
   * Suspend the API key temporarily
   * @param reason Optional reason for suspension
   * @returns Promise resolving to updated key
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
   * Reactivate a suspended API key
   * @returns Promise resolving to updated key
   */
  public async reactivate(): Promise<this> {
    if (this.status === 'suspended') {
      this.status = 'active';
      this.metadata = {
        ...this.metadata,
        reactivated_at: new Date()
      };
    }
    return this.save();
  }

  /**
   * Update the expiration date
   * @param expirationDate New expiration date (null for never)
   * @returns Promise resolving to updated key
   */
  public async updateExpiration(expirationDate: Date | null): Promise<this> {
    this.expires_at = expirationDate || undefined;
    return this.save();
  }

  /**
   * Add a scope to the API key
   * @param scope Scope to add
   * @returns Promise resolving to updated key
   */
  public async addScope(scope: string): Promise<this> {
    if (!this.scopes.includes(scope)) {
      this.scopes = [...this.scopes, scope];
      return this.save();
    }
    return this;
  }

  /**
   * Remove a scope from the API key
   * @param scope Scope to remove
   * @returns Promise resolving to updated key
   */
  public async removeScope(scope: string): Promise<this> {
    this.scopes = this.scopes.filter(s => s !== scope);
    return this.save();
  }

  /**
   * Add an allowed IP address
   * @param ipAddress IP address to allow
   * @returns Promise resolving to updated key
   */
  public async addAllowedIp(ipAddress: string): Promise<this> {
    if (!this.allowed_ips.includes(ipAddress)) {
      this.allowed_ips = [...this.allowed_ips, ipAddress];
      return this.save();
    }
    return this;
  }

  /**
   * Remove an allowed IP address
   * @param ipAddress IP address to remove
   * @returns Promise resolving to updated key
   */
  public async removeAllowedIp(ipAddress: string): Promise<this> {
    this.allowed_ips = this.allowed_ips.filter(ip => ip !== ipAddress);
    return this.save();
  }

  /**
   * Update the rate limit
   * @param limit New rate limit (requests per hour)
   * @returns Promise resolving to updated key
   */
  public async updateRateLimit(limit: number): Promise<this> {
    this.rate_limit = Math.max(1, limit);
    return this.save();
  }

  // Static methods
  /**
   * Find API key by hash
   * @param keyHash Hashed key to search for
   * @returns Promise resolving to API key or null
   */
  static async findByKeyHash(keyHash: string): Promise<ApiKey | null> {
    return this.findOne({ 
      where: { key_hash: keyHash },
      include: [{ model: User, as: 'user' }]
    });
  }

  /**
   * Find all active API keys
   * @returns Promise resolving to active API keys
   */
  static async findActive(): Promise<ApiKey[]> {
    return this.findAll({
      where: { 
        status: 'active',
        [Op.or]: [
          { expires_at: { [Op.is]: null } },
          { expires_at: { [Op.gt]: new Date() } }
        ]
      },
      order: [['last_used_at', 'DESC']]
    });
  }

  /**
   * Find API keys by user
   * @param userId User ID to search for
   * @returns Promise resolving to user's API keys
   */
  static async findByUser(userId: number): Promise<ApiKey[]> {
    return this.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Find API keys by status
   * @param status Status to filter by
   * @returns Promise resolving to keys with specified status
   */
  static async findByStatus(status: ApiKeyAttributes['status']): Promise<ApiKey[]> {
    return this.findAll({
      where: { status },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Find API keys expiring within specified days
   * @param days Number of days to look ahead (default: 7)
   * @returns Promise resolving to expiring API keys
   */
  static async findExpiring(days: number = 7): Promise<ApiKey[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    return this.findAll({
      where: {
        expires_at: {
          [Op.between]: [new Date(), futureDate]
        },
        status: 'active'
      },
      order: [['expires_at', 'ASC']]
    });
  }

  /**
   * Find expired API keys
   * @returns Promise resolving to expired API keys
   */
  static async findExpired(): Promise<ApiKey[]> {
    return this.findAll({
      where: {
        expires_at: { [Op.lt]: new Date() },
        status: { [Op.ne]: 'expired' }
      },
      order: [['expires_at', 'ASC']]
    });
  }

  /**
   * Find unused API keys (never used or not used recently)
   * @param days Number of days to consider "unused" (default: 30)
   * @returns Promise resolving to unused API keys
   */
  static async findUnused(days: number = 30): Promise<ApiKey[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return this.findAll({
      where: {
        [Op.or]: [
          { last_used_at: { [Op.is]: null } },
          { last_used_at: { [Op.lt]: cutoffDate } }
        ],
        status: 'active'
      },
      order: [['last_used_at', 'ASC']]
    });
  }

  /**
   * Find highly used API keys
   * @param threshold Usage count threshold
   * @returns Promise resolving to highly used API keys
   */
  static async findHighlyUsed(threshold: number = 1000): Promise<ApiKey[]> {
    return this.findAll({
      where: {
        usage_count: { [Op.gte]: threshold }
      },
      order: [['usage_count', 'DESC']]
    });
  }

  /**
   * Find API keys with specific scope
   * @param scope Scope to search for
   * @returns Promise resolving to keys with the scope
   */
  static async findWithScope(scope: string): Promise<ApiKey[]> {
    return this.findAll({
      where: {
        scopes: { [Op.contains]: [scope] }
      },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Get API key usage statistics
   * @returns Promise resolving to usage statistics
   */
  static async getUsageStats(): Promise<{
    total_keys: number;
    active_keys: number;
    expired_keys: number;
    revoked_keys: number;
    suspended_keys: number;
    never_used_keys: number;
    total_usage: number;
    avg_usage_per_key: number;
  }> {
    const [
      totalKeys,
      activeKeys,
      expiredKeys,
      revokedKeys,
      suspendedKeys,
      neverUsedKeys,
      totalUsageResult
    ] = await Promise.all([
      this.count(),
      this.count({ where: { status: 'active' } }),
      this.count({ where: { status: 'expired' } }),
      this.count({ where: { status: 'revoked' } }),
      this.count({ where: { status: 'suspended' } }),
      this.count({ where: { last_used_at: null } }),
      this.findAll({
        attributes: [
          [this.sequelize!.fn('SUM', this.sequelize!.col('usage_count')), 'total_usage']
        ]
      }).then(results => results[0])
    ]);

    const totalUsage = parseInt((totalUsageResult as any).getDataValue('total_usage')) || 0;

    return {
      total_keys: totalKeys,
      active_keys: activeKeys,
      expired_keys: expiredKeys,
      revoked_keys: revokedKeys,
      suspended_keys: suspendedKeys,
      never_used_keys: neverUsedKeys,
      total_usage: totalUsage,
      avg_usage_per_key: totalKeys > 0 ? Math.round(totalUsage / totalKeys) : 0
    };
  }

  /**
   * Clean up expired API keys by updating their status
   * @returns Promise resolving to number of keys updated
   */
  static async cleanupExpired(): Promise<number> {
    const [affectedCount] = await this.update(
      { status: 'expired' },
      {
        where: {
          expires_at: { [Op.lt]: new Date() },
          status: { [Op.ne]: 'expired' }
        }
      }
    );
    return affectedCount;
  }

  /**
   * Create API key with validation
   * @param data API key data to create
   * @returns Promise resolving to created API key
   */
  static async createApiKey(data: ApiKeyCreationAttributes): Promise<ApiKey> {
    // Validate rate limit
    if (data.rate_limit !== undefined && data.rate_limit < 1) {
      throw new Error('Rate limit must be at least 1 request per hour');
    }

    // Validate expiration date
    if (data.expires_at && data.expires_at <= new Date()) {
      throw new Error('Expiration date must be in the future');
    }

    // Validate scopes
    if (data.scopes && data.scopes.length === 0) {
      throw new Error('At least one scope must be specified');
    }

    return this.create(data);
  }
}

export default ApiKey;
