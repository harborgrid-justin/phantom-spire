/**
 * PHANTOM CORE SEQUELIZE MODEL
 * Represents phantom-core modules and their configurations with comprehensive type safety
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

// PhantomCore Attributes Interface
export interface PhantomCoreAttributes {
  /** Unique identifier for the phantom core */
  id: number;
  /** Core module name (attribution, compliance, crypto, cve, etc.) */
  name: string;
  /** Human-readable display name */
  display_name: string;
  /** Detailed description of the core module */
  description?: string;
  /** Version of the core module */
  version: string;
  /** Current status of the core module */
  status: 'active' | 'inactive' | 'maintenance' | 'deprecated';
  /** Type classification of the core module */
  core_type: 'core' | 'intelligence' | 'analysis' | 'response' | 'security' | 'utility';
  /** List of capabilities provided by this core */
  capabilities: string[];
  /** List of other cores this module depends on */
  dependencies: string[];
  /** Configuration parameters for the core */
  configuration: Record<string, any>;
  /** API endpoints exposed by this core */
  api_endpoints: Record<string, any>;
  /** Permission requirements and grants */
  permissions: Record<string, any>;
  /** Number of times this core has been used */
  usage_count: number;
  /** When the core was last used */
  last_used?: Date;
  /** Owner/maintainer of this core */
  owner_id?: number;
  /** Additional metadata */
  metadata: Record<string, any>;
  /** Record creation timestamp */
  created_at: Date;
  /** Record last update timestamp */
  updated_at: Date;
}

// PhantomCore Creation Attributes Interface
export interface PhantomCoreCreationAttributes extends Optional<PhantomCoreAttributes,
  'id' | 'description' | 'status' | 'core_type' | 'capabilities' | 'dependencies' |
  'configuration' | 'api_endpoints' | 'permissions' | 'usage_count' | 'last_used' |
  'owner_id' | 'metadata' | 'created_at' | 'updated_at'
> {}

@Table({
  tableName: 'phantom_cores',
  timestamps: true,
  underscored: true,
  paranoid: false,
  indexes: [
    { fields: ['name'], unique: true },
    { fields: ['status'] },
    { fields: ['core_type'] },
    { fields: ['owner_id'] },
    { fields: ['usage_count'] },
    { fields: ['last_used'] },
    { fields: ['created_at'] }
  ]
})
export class PhantomCore extends Model<PhantomCoreAttributes, PhantomCoreCreationAttributes> implements PhantomCoreAttributes {
  /** Unique identifier for the phantom core */
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  /** Core module name (attribution, compliance, crypto, cve, etc.) */
  @AllowNull(false)
  @Unique
  @Length({ min: 1, max: 100 })
  @Column(DataType.STRING(100))
  declare name: string;

  /** Human-readable display name */
  @AllowNull(false)
  @Length({ min: 1, max: 255 })
  @Column(DataType.STRING(255))
  declare display_name: string;

  /** Detailed description of the core module */
  @AllowNull(true)
  @Column(DataType.TEXT)
  declare description?: string;

  /** Version of the core module */
  @AllowNull(false)
  @Length({ min: 1, max: 50 })
  @Column(DataType.STRING(50))
  declare version: string;

  /** Current status of the core module */
  @AllowNull(false)
  @Default('active')
  @Index
  @Column(DataType.ENUM('active', 'inactive', 'maintenance', 'deprecated'))
  declare status: 'active' | 'inactive' | 'maintenance' | 'deprecated';

  /** Type classification of the core module */
  @AllowNull(false)
  @Default('core')
  @Index
  @Column(DataType.ENUM('core', 'intelligence', 'analysis', 'response', 'security', 'utility'))
  declare core_type: 'core' | 'intelligence' | 'analysis' | 'response' | 'security' | 'utility';

  /** List of capabilities provided by this core */
  @AllowNull(false)
  @Default('[]')
  @Column(DataType.ARRAY(DataType.STRING))
  declare capabilities: string[];

  /** List of other cores this module depends on */
  @AllowNull(false)
  @Default('[]')
  @Column(DataType.ARRAY(DataType.STRING))
  declare dependencies: string[];

  /** Configuration parameters for the core */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare configuration: Record<string, any>;

  /** API endpoints exposed by this core */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare api_endpoints: Record<string, any>;

  /** Permission requirements and grants */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare permissions: Record<string, any>;

  /** Number of times this core has been used */
  @AllowNull(false)
  @Default(0)
  @Index
  @Column(DataType.INTEGER)
  declare usage_count: number;

  /** When the core was last used */
  @AllowNull(true)
  @Index
  @Column(DataType.DATE)
  declare last_used?: Date;

  /** Owner/maintainer of this core */
  @ForeignKey(() => User)
  @AllowNull(true)
  @Index
  @Column(DataType.INTEGER)
  declare owner_id?: number;

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
  /** Owner/maintainer user */
  @BelongsTo(() => User, {
    foreignKey: 'owner_id',
    as: 'owner',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  })
  declare owner?: User;

  // Instance methods
  /**
   * Check if the core is active
   * @returns True if core status is active
   */
  public isActive(): boolean {
    return this.status === 'active';
  }

  /**
   * Check if the core is inactive
   * @returns True if core status is inactive
   */
  public isInactive(): boolean {
    return this.status === 'inactive';
  }

  /**
   * Check if the core is under maintenance
   * @returns True if core status is maintenance
   */
  public isUnderMaintenance(): boolean {
    return this.status === 'maintenance';
  }

  /**
   * Check if the core is deprecated
   * @returns True if core status is deprecated
   */
  public isDeprecated(): boolean {
    return this.status === 'deprecated';
  }

  /**
   * Check if the core is available for use
   * @returns True if core can be used (active or maintenance)
   */
  public isAvailable(): boolean {
    return this.status === 'active' || this.status === 'maintenance';
  }

  /**
   * Check if this core has a specific capability
   * @param capability Capability to check for
   * @returns True if core provides the capability
   */
  public hasCapability(capability: string): boolean {
    return this.capabilities.includes(capability);
  }

  /**
   * Check if this core depends on another core
   * @param coreName Name of core to check dependency for
   * @returns True if this core depends on the specified core
   */
  public dependsOn(coreName: string): boolean {
    return this.dependencies.includes(coreName);
  }

  /**
   * Get the core's popularity score based on usage
   * @returns Popularity score (0-10)
   */
  public getPopularityScore(): number {
    if (this.usage_count === 0) return 0;
    // Simple logarithmic scale, max score of 10
    return Math.min(10, Math.floor(Math.log10(this.usage_count + 1) * 3));
  }

  /**
   * Check if the core has been recently used
   * @param days Number of days to consider "recent" (default: 30)
   * @returns True if used within specified days
   */
  public isRecentlyUsed(days: number = 30): boolean {
    if (!this.last_used) return false;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return this.last_used > cutoffDate;
  }

  /**
   * Get days since last use
   * @returns Number of days since last use, or null if never used
   */
  public getDaysSinceLastUse(): number | null {
    if (!this.last_used) return null;
    const diffTime = new Date().getTime() - this.last_used.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get the core's age in days
   * @returns Age in days since creation
   */
  public getAge(): number {
    const diffTime = new Date().getTime() - this.created_at.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Check if core version is semantic version format
   * @returns True if version follows semantic versioning
   */
  public hasSemanticVersion(): boolean {
    return /^\d+\.\d+\.\d+/.test(this.version);
  }

  /**
   * Get major version number
   * @returns Major version number, or null if not semantic
   */
  public getMajorVersion(): number | null {
    const match = this.version.match(/^(\d+)\./);
    return match ? parseInt(match[1]) : null;
  }

  /**
   * Record usage of this core
   * @returns Promise resolving to updated core
   */
  public async recordUsage(): Promise<this> {
    this.usage_count += 1;
    this.last_used = new Date();
    return this.save();
  }

  /**
   * Activate the core
   * @returns Promise resolving to updated core
   */
  public async activate(): Promise<this> {
    this.status = 'active';
    return this.save();
  }

  /**
   * Deactivate the core
   * @returns Promise resolving to updated core
   */
  public async deactivate(): Promise<this> {
    this.status = 'inactive';
    return this.save();
  }

  /**
   * Put core into maintenance mode
   * @returns Promise resolving to updated core
   */
  public async setMaintenance(): Promise<this> {
    this.status = 'maintenance';
    return this.save();
  }

  /**
   * Mark core as deprecated
   * @returns Promise resolving to updated core
   */
  public async deprecate(): Promise<this> {
    this.status = 'deprecated';
    return this.save();
  }

  /**
   * Update core version
   * @param newVersion New version string
   * @returns Promise resolving to updated core
   */
  public async updateVersion(newVersion: string): Promise<this> {
    this.version = newVersion;
    return this.save();
  }

  /**
   * Add a capability to the core
   * @param capability Capability to add
   * @returns Promise resolving to updated core
   */
  public async addCapability(capability: string): Promise<this> {
    if (!this.capabilities.includes(capability)) {
      this.capabilities = [...this.capabilities, capability];
      return this.save();
    }
    return this;
  }

  /**
   * Remove a capability from the core
   * @param capability Capability to remove
   * @returns Promise resolving to updated core
   */
  public async removeCapability(capability: string): Promise<this> {
    this.capabilities = this.capabilities.filter(c => c !== capability);
    return this.save();
  }

  /**
   * Add a dependency to the core
   * @param dependency Core dependency to add
   * @returns Promise resolving to updated core
   */
  public async addDependency(dependency: string): Promise<this> {
    if (!this.dependencies.includes(dependency)) {
      this.dependencies = [...this.dependencies, dependency];
      return this.save();
    }
    return this;
  }

  /**
   * Remove a dependency from the core
   * @param dependency Core dependency to remove
   * @returns Promise resolving to updated core
   */
  public async removeDependency(dependency: string): Promise<this> {
    this.dependencies = this.dependencies.filter(d => d !== dependency);
    return this.save();
  }

  /**
   * Update configuration
   * @param config New configuration object
   * @returns Promise resolving to updated core
   */
  public async updateConfiguration(config: Record<string, any>): Promise<this> {
    this.configuration = { ...this.configuration, ...config };
    return this.save();
  }

  // Static methods
  /**
   * Find all active cores
   * @returns Promise resolving to active cores
   */
  static async findActive(): Promise<PhantomCore[]> {
    return this.findAll({
      where: { status: 'active' },
      order: [['name', 'ASC']]
    });
  }

  /**
   * Find cores by status
   * @param status Status to filter by
   * @returns Promise resolving to cores with specified status
   */
  static async findByStatus(status: PhantomCoreAttributes['status']): Promise<PhantomCore[]> {
    return this.findAll({
      where: { status },
      order: [['name', 'ASC']]
    });
  }

  /**
   * Find cores by type
   * @param coreType Core type to filter by
   * @returns Promise resolving to cores of specified type
   */
  static async findByType(coreType: PhantomCoreAttributes['core_type']): Promise<PhantomCore[]> {
    return this.findAll({
      where: { core_type: coreType },
      order: [['name', 'ASC']]
    });
  }

  /**
   * Find cores by capability
   * @param capability Capability to search for
   * @returns Promise resolving to cores with specified capability
   */
  static async findByCapability(capability: string): Promise<PhantomCore[]> {
    return this.findAll({
      where: {
        capabilities: { [Op.contains]: [capability] }
      },
      order: [['name', 'ASC']]
    });
  }

  /**
   * Find cores by dependency
   * @param dependency Dependency to search for
   * @returns Promise resolving to cores that depend on specified core
   */
  static async findByDependency(dependency: string): Promise<PhantomCore[]> {
    return this.findAll({
      where: {
        dependencies: { [Op.contains]: [dependency] }
      },
      order: [['name', 'ASC']]
    });
  }

  /**
   * Find cores by owner
   * @param ownerId Owner user ID
   * @returns Promise resolving to cores owned by specified user
   */
  static async findByOwner(ownerId: number): Promise<PhantomCore[]> {
    return this.findAll({
      where: { owner_id: ownerId },
      order: [['name', 'ASC']]
    });
  }

  /**
   * Find most popular cores
   * @param limit Maximum number of cores to return
   * @returns Promise resolving to most used cores
   */
  static async findMostPopular(limit: number = 10): Promise<PhantomCore[]> {
    return this.findAll({
      order: [['usage_count', 'DESC']],
      limit
    });
  }

  /**
   * Find recently used cores
   * @param days Number of days to look back (default: 30)
   * @returns Promise resolving to recently used cores
   */
  static async findRecentlyUsed(days: number = 30): Promise<PhantomCore[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return this.findAll({
      where: {
        last_used: { [Op.gte]: cutoffDate }
      },
      order: [['last_used', 'DESC']]
    });
  }

  /**
   * Find cores that haven't been used recently
   * @param days Number of days to consider "unused" (default: 90)
   * @returns Promise resolving to unused cores
   */
  static async findUnused(days: number = 90): Promise<PhantomCore[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return this.findAll({
      where: {
        [Op.or]: [
          { last_used: { [Op.lt]: cutoffDate } },
          { last_used: { [Op.is]: null } }
        ]
      } as any,
      order: [['created_at', 'ASC']]
    });
  }

  /**
   * Find available cores (active or maintenance)
   * @returns Promise resolving to available cores
   */
  static async findAvailable(): Promise<PhantomCore[]> {
    return this.findAll({
      where: {
        status: { [Op.in]: ['active', 'maintenance'] }
      },
      order: [['name', 'ASC']]
    });
  }

  /**
   * Search cores by name or description
   * @param query Search query
   * @returns Promise resolving to matching cores
   */
  static async searchCores(query: string): Promise<PhantomCore[]> {
    return this.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `%${query}%` } },
          { display_name: { [Op.iLike]: `%${query}%` } },
          { description: { [Op.iLike]: `%${query}%` } }
        ].filter(Boolean)
      },
      order: [['name', 'ASC']]
    });
  }

  /**
   * Get usage statistics for all cores
   * @returns Promise resolving to usage statistics
   */
  static async getUsageStats(): Promise<Array<{
    name: string;
    display_name: string;
    usage_count: number;
    last_used?: Date;
    popularity_score: number;
  }>> {
    const results = await this.findAll({
      attributes: [
        'name',
        'display_name',
        'usage_count',
        'last_used'
      ],
      order: [['usage_count', 'DESC']]
    });
    
    return results.map(r => ({
      name: r.name,
      display_name: r.display_name,
      usage_count: r.usage_count,
      last_used: r.last_used,
      popularity_score: r.getPopularityScore()
    }));
  }

  /**
   * Get status distribution statistics
   * @returns Promise resolving to status statistics
   */
  static async getStatusStats(): Promise<Array<{ status: string; count: number }>> {
    const results = await this.findAll({
      attributes: [
        'status',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      group: ['status']
    });
    
    return results.map(r => ({
      status: r.status,
      count: parseInt((r as any).getDataValue('count'))
    }));
  }

  /**
   * Get type distribution statistics
   * @returns Promise resolving to type statistics
   */
  static async getTypeStats(): Promise<Array<{ core_type: string; count: number }>> {
    const results = await this.findAll({
      attributes: [
        'core_type',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      group: ['core_type'],
      order: [[this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'DESC']]
    });
    
    return results.map(r => ({
      core_type: r.core_type,
      count: parseInt((r as any).getDataValue('count'))
    }));
  }

  /**
   * Get capability distribution statistics
   * @returns Promise resolving to capability statistics
   */
  static async getCapabilityStats(): Promise<Array<{ capability: string; count: number }>> {
    const cores = await this.findAll({
      attributes: ['capabilities']
    });
    
    const capabilityCount: Record<string, number> = {};
    cores.forEach(core => {
      core.capabilities.forEach(capability => {
        capabilityCount[capability] = (capabilityCount[capability] || 0) + 1;
      });
    });
    
    return Object.entries(capabilityCount)
      .map(([capability, count]) => ({ capability, count }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Get comprehensive core statistics
   * @returns Promise resolving to comprehensive statistics
   */
  static async getCoreStats(): Promise<{
    total_cores: number;
    active_cores: number;
    inactive_cores: number;
    deprecated_cores: number;
    maintenance_cores: number;
    total_usage: number;
    avg_usage: number;
    cores_used_recently: number;
  }> {
    const [
      totalCores,
      activeCores,
      inactiveCores,
      deprecatedCores,
      maintenanceCores,
      usageResult,
      recentlyUsedCount
    ] = await Promise.all([
      this.count(),
      this.count({ where: { status: 'active' } }),
      this.count({ where: { status: 'inactive' } }),
      this.count({ where: { status: 'deprecated' } }),
      this.count({ where: { status: 'maintenance' } }),
      this.findAll({
        attributes: [
          [this.sequelize!.fn('SUM', this.sequelize!.col('usage_count')), 'total_usage'],
          [this.sequelize!.fn('AVG', this.sequelize!.col('usage_count')), 'avg_usage']
        ]
      }).then(results => results[0]),
      this.count({
        where: {
          last_used: {
            [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ]);

    return {
      total_cores: totalCores,
      active_cores: activeCores,
      inactive_cores: inactiveCores,
      deprecated_cores: deprecatedCores,
      maintenance_cores: maintenanceCores,
      total_usage: parseInt((usageResult as any).getDataValue('total_usage')) || 0,
      avg_usage: parseFloat((usageResult as any).getDataValue('avg_usage')) || 0,
      cores_used_recently: recentlyUsedCount
    };
  }

  /**
   * Create phantom core with validation
   * @param data Core data to create
   * @returns Promise resolving to created core
   */
  static async createCore(data: PhantomCoreCreationAttributes): Promise<PhantomCore> {
    // Validate core name format (alphanumeric, hyphens, underscores)
    if (!/^[a-zA-Z0-9_-]+$/.test(data.name)) {
      throw new Error('Core name must contain only alphanumeric characters, hyphens, and underscores');
    }

    // Check for duplicate core name
    const existing = await this.findOne({ where: { name: data.name } });
    if (existing) {
      throw new Error(`Core with name ${data.name} already exists`);
    }

    // Validate version format
    if (!data.version || data.version.trim().length === 0) {
      throw new Error('Core version is required');
    }

    return this.create(data);
  }
}

export default PhantomCore;
