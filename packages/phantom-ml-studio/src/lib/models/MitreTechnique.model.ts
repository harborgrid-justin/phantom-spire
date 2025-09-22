/**
 * MITRE TECHNIQUE SEQUELIZE MODEL
 * Represents MITRE ATT&CK techniques
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
  HasMany,
  ForeignKey,
  Unique,
  DataType
} from 'sequelize-typescript';
import { MitreTactic } from './MitreTactic.model';
import { MitreSubtechnique } from './MitreSubtechnique.model';
import { ThreatActorTechnique } from './ThreatActorTechnique.model';
import { Op } from 'sequelize';

@Table({
  tableName: 'mitre_techniques',
  timestamps: true,
  underscored: true
})
export class MitreTechnique extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Unique
  @Column(DataType.STRING(20))
  declare technique_id: string; // e.g., "T1001"

  @AllowNull(false)
  @Column(DataType.STRING(255))
  declare name: string;

  @Column(DataType.TEXT)
  declare description: string;

  @ForeignKey(() => MitreTactic)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare tactic_id: number;

  @Column(DataType.STRING(500))
  declare url: string;

  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare platforms: string[];

  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare data_sources: string[];

  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare defenses_bypassed: string[];

  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare permissions_required: string[];

  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare system_requirements: string[];

  @AllowNull(false)
  @Default('active')
  @Column(DataType.STRING(20))
  declare status: string;

  @Column(DataType.STRING(20))
  declare version: string;

  @Default('{}')
  @Column(DataType.JSONB)
  declare detection: Record<string, any>;

  @Default('{}')
  @Column(DataType.JSONB)
  declare mitigation: Record<string, any>;

  @Default('{}')
  @Column(DataType.JSONB)
  declare metadata: Record<string, any>;

  @CreatedAt
  @Column(DataType.DATE)
  declare created_at: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  declare updated_at: Date;

  // Associations
  @BelongsTo(() => MitreTactic)
  declare tactic: MitreTactic;

  @HasMany(() => MitreSubtechnique)
  declare subtechniques: MitreSubtechnique[];

  @HasMany(() => ThreatActorTechnique)
  declare threat_actor_techniques: ThreatActorTechnique[];

  // Static methods
  static async findByTechniqueId(techniqueId: string) {
    return this.findOne({ 
      where: { technique_id: techniqueId },
      include: [MitreTactic]
    });
  }

  static async findByTactic(tacticId: number) {
    return this.findAll({
      where: { tactic_id: tacticId },
      order: [['technique_id', 'ASC']]
    });
  }

  static async findByPlatform(platform: string) {
    return this.findAll({
      where: {
        platforms: {
          [Op.contains]: [platform]
        }
      },
      include: [MitreTactic]
    });
  }

  static async findActive() {
    return this.findAll({
      where: { status: 'active' },
      include: [MitreTactic],
      order: [['technique_id', 'ASC']]
    });
  }

  static async searchByName(query: string) {
    return this.findAll({
      where: {
        name: {
          [Op.iLike]: `%${query}%`
        }
      },
      include: [MitreTactic]
    });
  }

  static async getTechniqueStats() {
    const results = await this.findAll({
      attributes: [
        'status',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      group: ['status']
    });
    
    return results.map(r => ({
      status: r.status,
      count: (r as any).getDataValue('count')
    }));
  }

  static async getPlatformStats() {
    const techniques = await this.findAll({
      attributes: ['platforms']
    });
    
    const platformCounts: Record<string, number> = {};
    techniques.forEach(technique => {
      technique.platforms.forEach(platform => {
        platformCounts[platform] = (platformCounts[platform] || 0) + 1;
      });
    });
    
    return Object.entries(platformCounts).map(([platform, count]) => ({
      platform,
      count
    }));
  }
}
