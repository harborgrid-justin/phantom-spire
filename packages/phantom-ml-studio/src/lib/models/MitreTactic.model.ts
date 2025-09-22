/**
 * MITRE TACTIC SEQUELIZE MODEL
 * Represents MITRE ATT&CK tactics with comprehensive type safety
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
  HasMany,
  Unique,
  DataType,
  Length
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { Op } from 'sequelize';
import { MitreTechnique } from './MitreTechnique.model';
import { ThreatActorTactic } from './ThreatActorTactic.model';

// MitreTactic Attributes Interface
export interface MitreTacticAttributes {
  /** Unique identifier for the tactic */
  id: number;
  /** MITRE tactic identifier (e.g., "TA0001") */
  tactic_id: string;
  /** Human-readable name of the tactic */
  name: string;
  /** Detailed description of the tactic */
  description?: string;
  /** Official MITRE URL for this tactic */
  url?: string;
  /** Platforms this tactic applies to */
  platforms: string[];
  /** Data sources for detecting this tactic */
  data_sources: string[];
  /** Current status of the tactic */
  status: 'active' | 'deprecated' | 'revoked' | 'draft';
  /** MITRE ATT&CK version */
  version?: string;
  /** Additional metadata */
  metadata: Record<string, any>;
  /** Record creation timestamp */
  created_at: Date;
  /** Record last update timestamp */
  updated_at: Date;
}

// MitreTactic Creation Attributes Interface
export interface MitreTacticCreationAttributes extends Optional<MitreTacticAttributes,
  'id' | 'description' | 'url' | 'platforms' | 'data_sources' | 'status' | 'version' | 
  'metadata' | 'created_at' | 'updated_at'
> {}

@Table({
  tableName: 'mitre_tactics',
  timestamps: true,
  underscored: true,
  paranoid: false,
  indexes: [
    { fields: ['tactic_id'], unique: true },
    { fields: ['name'] },
    { fields: ['status'] },
    { fields: ['version'] },
    { fields: ['created_at'] }
  ]
})
export class MitreTactic extends Model<MitreTacticAttributes, MitreTacticCreationAttributes> implements MitreTacticAttributes {
  /** Unique identifier for the tactic */
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  /** MITRE tactic identifier (e.g., "TA0001") */
  @AllowNull(false)
  @Unique
  @Length({ min: 1, max: 20 })
  @Column(DataType.STRING(20))
  declare tactic_id: string;

  /** Human-readable name of the tactic */
  @AllowNull(false)
  @Length({ min: 1, max: 255 })
  @Column(DataType.STRING(255))
  declare name: string;

  /** Detailed description of the tactic */
  @AllowNull(true)
  @Column(DataType.TEXT)
  declare description?: string;

  /** Official MITRE URL for this tactic */
  @AllowNull(true)
  @Length({ max: 500 })
  @Column(DataType.STRING(500))
  declare url?: string;

  /** Platforms this tactic applies to */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare platforms: string[];

  /** Data sources for detecting this tactic */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare data_sources: string[];

  /** Current status of the tactic */
  @AllowNull(false)
  @Default('active')
  @Column(DataType.ENUM('active', 'deprecated', 'revoked', 'draft'))
  declare status: 'active' | 'deprecated' | 'revoked' | 'draft';

  /** MITRE ATT&CK version */
  @AllowNull(true)
  @Length({ max: 20 })
  @Column(DataType.STRING(20))
  declare version?: string;

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
  /** Techniques that belong to this tactic */
  @HasMany(() => MitreTechnique, {
    foreignKey: 'tactic_id',
    as: 'techniques',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  declare techniques?: MitreTechnique[];

  /** Threat actor associations with this tactic */
  @HasMany(() => ThreatActorTactic, {
    foreignKey: 'tactic_id',
    as: 'threat_actor_tactics',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  declare threat_actor_tactics?: ThreatActorTactic[];

  // Instance methods
  /**
   * Check if this tactic is currently active
   * @returns True if status is active
   */
  public isActive(): boolean {
    return this.status === 'active';
  }

  /**
   * Check if this tactic is deprecated
   * @returns True if status is deprecated
   */
  public isDeprecated(): boolean {
    return this.status === 'deprecated';
  }

  /**
   * Check if this tactic is revoked
   * @returns True if status is revoked
   */
  public isRevoked(): boolean {
    return this.status === 'revoked';
  }

  /**
   * Check if this tactic supports a specific platform
   * @param platform Platform to check for
   * @returns True if platform is supported
   */
  public supportsPlatform(platform: string): boolean {
    return this.platforms.includes(platform);
  }

  /**
   * Check if this tactic has a specific data source
   * @param dataSource Data source to check for
   * @returns True if data source is available
   */
  public hasDataSource(dataSource: string): boolean {
    return this.data_sources.includes(dataSource);
  }

  /**
   * Add a platform to this tactic
   * @param platform Platform to add
   * @returns Promise resolving to updated tactic
   */
  public async addPlatform(platform: string): Promise<this> {
    if (!this.platforms.includes(platform)) {
      this.platforms = [...this.platforms, platform];
      return this.save();
    }
    return this;
  }

  /**
   * Remove a platform from this tactic
   * @param platform Platform to remove
   * @returns Promise resolving to updated tactic
   */
  public async removePlatform(platform: string): Promise<this> {
    this.platforms = this.platforms.filter(p => p !== platform);
    return this.save();
  }

  /**
   * Add a data source to this tactic
   * @param dataSource Data source to add
   * @returns Promise resolving to updated tactic
   */
  public async addDataSource(dataSource: string): Promise<this> {
    if (!this.data_sources.includes(dataSource)) {
      this.data_sources = [...this.data_sources, dataSource];
      return this.save();
    }
    return this;
  }

  /**
   * Remove a data source from this tactic
   * @param dataSource Data source to remove
   * @returns Promise resolving to updated tactic
   */
  public async removeDataSource(dataSource: string): Promise<this> {
    this.data_sources = this.data_sources.filter(ds => ds !== dataSource);
    return this.save();
  }

  /**
   * Update the status of this tactic
   * @param newStatus New status to set
   * @returns Promise resolving to updated tactic
   */
  public async updateStatus(newStatus: MitreTacticAttributes['status']): Promise<this> {
    this.status = newStatus;
    return this.save();
  }

  /**
   * Get the tactic ID number (extract from tactic_id)
   * @returns Numeric part of tactic ID
   */
  public getTacticNumber(): number {
    const match = this.tactic_id.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  }

  /**
   * Get age of this tactic in days
   * @returns Age in days since creation
   */
  public getAge(): number {
    const diffTime = new Date().getTime() - this.created_at.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  // Static methods
  /**
   * Find tactic by MITRE tactic ID
   * @param tacticId MITRE tactic ID (e.g., "TA0001")
   * @returns Promise resolving to tactic or null
   */
  static async findByTacticId(tacticId: string): Promise<MitreTactic | null> {
    return this.findOne({ where: { tactic_id: tacticId } });
  }

  /**
   * Find tactics by platform
   * @param platform Platform to filter by
   * @returns Promise resolving to tactics array
   */
  static async findByPlatform(platform: string): Promise<MitreTactic[]> {
    return this.findAll({
      where: {
        platforms: {
          [Op.contains]: [platform]
        }
      },
      order: [['tactic_id', 'ASC']]
    });
  }

  /**
   * Find tactics by status
   * @param status Status to filter by
   * @returns Promise resolving to tactics array
   */
  static async findByStatus(status: MitreTacticAttributes['status']): Promise<MitreTactic[]> {
    return this.findAll({
      where: { status },
      order: [['tactic_id', 'ASC']]
    });
  }

  /**
   * Find all active tactics
   * @returns Promise resolving to active tactics
   */
  static async findActive(): Promise<MitreTactic[]> {
    return this.findAll({
      where: { status: 'active' },
      order: [['tactic_id', 'ASC']]
    });
  }

  /**
   * Find tactics by version
   * @param version MITRE ATT&CK version
   * @returns Promise resolving to tactics array
   */
  static async findByVersion(version: string): Promise<MitreTactic[]> {
    return this.findAll({
      where: { version },
      order: [['tactic_id', 'ASC']]
    });
  }

  /**
   * Find tactics by name (case-insensitive search)
   * @param name Name to search for
   * @returns Promise resolving to matching tactics
   */
  static async searchByName(name: string): Promise<MitreTactic[]> {
    return this.findAll({
      where: {
        name: {
          [Op.iLike]: `%${name}%`
        }
      },
      order: [['name', 'ASC']]
    });
  }

  /**
   * Find tactics that have a specific data source
   * @param dataSource Data source to search for
   * @returns Promise resolving to tactics with that data source
   */
  static async findByDataSource(dataSource: string): Promise<MitreTactic[]> {
    return this.findAll({
      where: {
        data_sources: {
          [Op.contains]: [dataSource]
        }
      },
      order: [['tactic_id', 'ASC']]
    });
  }

  /**
   * Get all unique platforms across all tactics
   * @returns Promise resolving to unique platforms array
   */
  static async getAllPlatforms(): Promise<string[]> {
    const results = await this.findAll({
      attributes: [
        [this.sequelize!.fn('unnest', this.sequelize!.col('platforms')), 'platform']
      ],
      group: [this.sequelize!.fn('unnest', this.sequelize!.col('platforms'))],
      order: [[this.sequelize!.fn('unnest', this.sequelize!.col('platforms')), 'ASC']]
    });
    
    return results.map(r => (r as any).getDataValue('platform')).filter(Boolean);
  }

  /**
   * Get all unique data sources across all tactics
   * @returns Promise resolving to unique data sources array
   */
  static async getAllDataSources(): Promise<string[]> {
    const results = await this.findAll({
      attributes: [
        [this.sequelize!.fn('unnest', this.sequelize!.col('data_sources')), 'data_source']
      ],
      group: [this.sequelize!.fn('unnest', this.sequelize!.col('data_sources'))],
      order: [[this.sequelize!.fn('unnest', this.sequelize!.col('data_sources')), 'ASC']]
    });
    
    return results.map(r => (r as any).getDataValue('data_source')).filter(Boolean);
  }

  /**
   * Get tactic status distribution statistics
   * @returns Promise resolving to status statistics
   */
  static async getTacticStats(): Promise<Array<{ status: string; count: number }>> {
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
   * Get platform distribution statistics
   * @returns Promise resolving to platform statistics
   */
  static async getPlatformStats(): Promise<Array<{ platform: string; count: number }>> {
    const results = await this.findAll({
      attributes: [
        [this.sequelize!.fn('unnest', this.sequelize!.col('platforms')), 'platform'],
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      group: [this.sequelize!.fn('unnest', this.sequelize!.col('platforms'))],
      order: [[this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'DESC']]
    });
    
    return results.map(r => ({
      platform: (r as any).getDataValue('platform'),
      count: parseInt((r as any).getDataValue('count'))
    })).filter(item => item.platform);
  }

  /**
   * Get data source distribution statistics
   * @returns Promise resolving to data source statistics
   */
  static async getDataSourceStats(): Promise<Array<{ data_source: string; count: number }>> {
    const results = await this.findAll({
      attributes: [
        [this.sequelize!.fn('unnest', this.sequelize!.col('data_sources')), 'data_source'],
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      group: [this.sequelize!.fn('unnest', this.sequelize!.col('data_sources'))],
      order: [[this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'DESC']]
    });
    
    return results.map(r => ({
      data_source: (r as any).getDataValue('data_source'),
      count: parseInt((r as any).getDataValue('count'))
    })).filter(item => item.data_source);
  }

  /**
   * Get version distribution statistics
   * @returns Promise resolving to version statistics
   */
  static async getVersionStats(): Promise<Array<{ version: string; count: number }>> {
    const results = await this.findAll({
      attributes: [
        'version',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      where: this.sequelize!.literal('version IS NOT NULL'),
      group: ['version'],
      order: [['version', 'DESC']]
    });
    
    return results.map(r => ({
      version: r.version!,
      count: parseInt((r as any).getDataValue('count'))
    }));
  }

  /**
   * Get tactics ordered by technique count
   * @param limit Maximum number of tactics to return
   * @returns Promise resolving to tactics with technique counts
   */
  static async getTacticsByTechniqueCount(limit?: number): Promise<Array<{
    tactic: MitreTactic;
    technique_count: number;
  }>> {
    const options: any = {
      include: [{
        model: MitreTechnique,
        as: 'techniques',
        attributes: []
      }],
      attributes: [
        '*',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('techniques.id')), 'technique_count']
      ],
      group: ['MitreTactic.id'],
      order: [[this.sequelize!.fn('COUNT', this.sequelize!.col('techniques.id')), 'DESC']]
    };

    if (limit) {
      options.limit = limit;
    }

    const results = await this.findAll(options);
    
    return results.map(r => ({
      tactic: r,
      technique_count: parseInt((r as any).getDataValue('technique_count')) || 0
    }));
  }

  /**
   * Get recently updated tactics
   * @param days Number of days to look back (default: 30)
   * @returns Promise resolving to recently updated tactics
   */
  static async getRecentlyUpdated(days: number = 30): Promise<MitreTactic[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return this.findAll({
      where: {
        updated_at: { [Op.gte]: cutoffDate }
      },
      order: [['updated_at', 'DESC']]
    });
  }

  /**
   * Create tactic with validation
   * @param data Tactic data to create
   * @returns Promise resolving to created tactic
   */
  static async createTactic(data: MitreTacticCreationAttributes): Promise<MitreTactic> {
    // Validate tactic ID format
    if (!/^TA\d{4}$/.test(data.tactic_id)) {
      throw new Error('Tactic ID must follow format TA#### (e.g., TA0001)');
    }

    // Check for duplicate tactic ID
    const existing = await this.findOne({ where: { tactic_id: data.tactic_id } });
    if (existing) {
      throw new Error(`Tactic with ID ${data.tactic_id} already exists`);
    }

    return this.create(data);
  }

  /**
   * Bulk update tactics from MITRE data
   * @param tacticsData Array of tactic data
   * @returns Promise resolving to update results
   */
  static async bulkUpdateFromMitre(tacticsData: MitreTacticCreationAttributes[]): Promise<{
    created: number;
    updated: number;
    errors: string[];
  }> {
    const results = { created: 0, updated: 0, errors: [] as string[] };

    for (const tacticData of tacticsData) {
      try {
        const existing = await this.findOne({ where: { tactic_id: tacticData.tactic_id } });
        
        if (existing) {
          await existing.update(tacticData);
          results.updated++;
        } else {
          await this.create(tacticData);
          results.created++;
        }
      } catch (error) {
        results.errors.push(`Failed to process ${tacticData.tactic_id}: ${error}`);
      }
    }

    return results;
  }
}

export default MitreTactic;
