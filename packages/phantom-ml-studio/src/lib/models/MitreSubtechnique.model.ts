/**
 * MITRE SUBTECHNIQUE SEQUELIZE MODEL
 * Represents MITRE ATT&CK subtechniques
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
  DataType
} from 'sequelize-typescript';
import { MitreTechnique } from './MitreTechnique.model';
import { Op } from 'sequelize';

@Table({
  tableName: 'mitre_subtechniques',
  timestamps: true,
  underscored: true
})
export class MitreSubtechnique extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  /** Associated mitretechnique ID */
  @ForeignKey(() => MitreTechnique)
  @AllowNull(true)
  @Column(DataType.INTEGER)
  declare mitretechnique_id?: number;

  @AllowNull(false)
  @Unique
  @Column(DataType.STRING(20))
  declare subtechnique_id: string; // e.g., "T1001.001"

  @AllowNull(false)
  @Column(DataType.STRING(255))
  declare name: string;

  @Column(DataType.TEXT)
  declare description: string;

  @ForeignKey(() => MitreTechnique)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare technique_id: number;

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
  @BelongsTo(() => MitreTechnique)
  declare technique: MitreTechnique;

 
  /** Associated mitretechnique */
  @BelongsTo(() => MitreTechnique, {
    foreignKey: 'mitretechnique_id',
    as: 'mitretechnique',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  })
  declare mitretechnique?: MitreTechnique;
 // Static methods
  static async findBySubtechniqueId(subtechniqueId: string) {
    return this.findOne({ 
      where: { subtechnique_id: subtechniqueId },
      include: [MitreTechnique]
    });
  }

  static async findByTechnique(techniqueId: number) {
    return this.findAll({
      where: { technique_id: techniqueId },
      order: [['subtechnique_id', 'ASC']]
    });
  }

  static async findActive() {
    return this.findAll({
      where: { status: 'active' },
      include: [MitreTechnique],
      order: [['subtechnique_id', 'ASC']]
    });
  }

  static async searchByName(query: string) {
    return this.findAll({
      where: {
        name: {
          [Op.iLike]: `%${query}%`
        }
      },
      include: [MitreTechnique]
    });
  }
}
