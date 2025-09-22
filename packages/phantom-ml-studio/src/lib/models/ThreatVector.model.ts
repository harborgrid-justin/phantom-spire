/**
 * THREAT VECTOR SEQUELIZE MODEL
 * Represents attack vectors and entry points with comprehensive type safety
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
  DataType,
  Length
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { Op } from 'sequelize';

// ThreatVector Attributes Interface
export interface ThreatVectorAttributes {
  /** Unique identifier for the threat vector */
  id: number;
  /** Name of the attack vector */
  vector_name: string;
  /** Type of the attack vector */
  vector_type: string;
  /** Risk level of the vector */
  risk_level: string;
  /** Array of attack techniques */
  attack_techniques: string[];
  /** Mitigation controls data */
  mitigation_controls: Record<string, any>;
  /** Number of times this vector has been exploited */
  exploitation_count: number;
  /** Additional metadata */
  metadata: Record<string, any>;
  /** Record creation timestamp */
  created_at: Date;
  /** Record last update timestamp */
  updated_at: Date;
}

// ThreatVector Creation Attributes Interface
export interface ThreatVectorCreationAttributes extends Optional<ThreatVectorAttributes,
  'id' | 'risk_level' | 'attack_techniques' | 'mitigation_controls' | 
  'exploitation_count' | 'metadata' | 'created_at' | 'updated_at'
> {}

@Table({
  tableName: 'threat_vectors',
  timestamps: true,
  underscored: true,
  paranoid: false,
  indexes: [
    { fields: ['vector_name'] },
    { fields: ['vector_type'] },
    { fields: ['risk_level'] },
    { fields: ['exploitation_count'] },
    { fields: ['created_at'] }
  ]
})
export class ThreatVector extends Model<ThreatVectorAttributes, ThreatVectorCreationAttributes> implements ThreatVectorAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  declare vector_name: string;

  @AllowNull(false)
  @Column(DataType.STRING(50))
  declare vector_type: string; // email, web, network, physical, social

  @Default('medium')
  @Column(DataType.STRING(20))
  declare risk_level: string;

  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare attack_techniques: string[];

  @Default('{}')
  @Column(DataType.JSONB)
  declare mitigation_controls: Record<string, any>;

  @Default(0)
  @Column(DataType.INTEGER)
  declare exploitation_count: number;

  @Default('{}')
  @Column(DataType.JSONB)
  declare metadata: Record<string, any>;

  @CreatedAt
  @Column(DataType.DATE)
  declare created_at: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  declare updated_at: Date;

  // Instance methods
  /**
   * Check if this is a high-risk vector
   * @returns True if risk level is high or critical
   */
  public isHighRisk(): boolean {
    return ['high', 'critical'].includes(this.risk_level.toLowerCase());
  }

  /**
   * Increment exploitation count
   * @returns Promise resolving to updated vector
   */
  public async incrementExploitationCount(): Promise<this> {
    this.exploitation_count += 1;
    return this.save();
  }

  /**
   * Add attack technique to the vector
   * @param technique Technique to add
   * @returns Promise resolving to updated vector
   */
  public async addAttackTechnique(technique: string): Promise<this> {
    if (!this.attack_techniques.includes(technique)) {
      this.attack_techniques = [...this.attack_techniques, technique];
      return this.save();
    }
    return this;
  }

  /**
   * Remove attack technique from the vector
   * @param technique Technique to remove
   * @returns Promise resolving to updated vector
   */
  public async removeAttackTechnique(technique: string): Promise<this> {
    this.attack_techniques = this.attack_techniques.filter(t => t !== technique);
    return this.save();
  }

  /**
   * Update mitigation controls
   * @param controls New controls to merge
   * @returns Promise resolving to updated vector
   */
  public async updateMitigationControls(controls: Record<string, any>): Promise<this> {
    this.mitigation_controls = { ...this.mitigation_controls, ...controls };
    return this.save();
  }

  // Static methods
  /**
   * Find vectors by type
   * @param vectorType Type to filter by
   * @returns Promise resolving to vectors array
   */
  static async findByType(vectorType: string): Promise<ThreatVector[]> {
    return this.findAll({
      where: { vector_type: vectorType },
      order: [['exploitation_count', 'DESC']]
    });
  }

  /**
   * Find vectors by risk level
   * @param riskLevel Risk level to filter by
   * @returns Promise resolving to vectors array
   */
  static async findByRiskLevel(riskLevel: string): Promise<ThreatVector[]> {
    return this.findAll({
      where: { risk_level: riskLevel },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Find high-risk vectors
   * @returns Promise resolving to high-risk vectors
   */
  static async findHighRisk(): Promise<ThreatVector[]> {
    return this.findAll({
      where: {
        risk_level: {
          [Op.in]: ['high', 'critical']
        }
      },
      order: [['exploitation_count', 'DESC']]
    });
  }

  /**
   * Find most exploited vectors
   * @param limit Maximum number to return
   * @returns Promise resolving to most exploited vectors
   */
  static async findMostExploited(limit: number = 10): Promise<ThreatVector[]> {
    return this.findAll({
      where: {
        exploitation_count: {
          [Op.gt]: 0
        }
      },
      order: [['exploitation_count', 'DESC']],
      limit
    });
  }

  /**
   * Get vectors by attack technique
   * @param technique Attack technique to search for
   * @returns Promise resolving to vectors with that technique
   */
  static async findByAttackTechnique(technique: string): Promise<ThreatVector[]> {
    return this.findAll({
      where: {
        attack_techniques: {
          [Op.contains]: [technique]
        }
      },
      order: [['exploitation_count', 'DESC']]
    });
  }

  /**
   * Get risk level statistics
   * @returns Promise resolving to risk statistics
   */
  static async getRiskLevelStats(): Promise<Array<{ risk_level: string; count: number }>> {
    const results = await this.findAll({
      attributes: [
        'risk_level',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      group: ['risk_level']
    });
    
    return results.map(r => ({
      risk_level: r.risk_level,
      count: parseInt((r as any).getDataValue('count'))
    }));
  }

  /**
   * Get vector type statistics
   * @returns Promise resolving to type statistics
   */
  static async getTypeStats(): Promise<Array<{ vector_type: string; count: number; total_exploitations: number }>> {
    const results = await this.findAll({
      attributes: [
        'vector_type',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count'],
        [this.sequelize!.fn('SUM', this.sequelize!.col('exploitation_count')), 'total_exploitations']
      ],
      group: ['vector_type']
    });
    
    return results.map(r => ({
      vector_type: r.vector_type,
      count: parseInt((r as any).getDataValue('count')),
      total_exploitations: parseInt((r as any).getDataValue('total_exploitations')) || 0
    }));
  }

  /**
   * Get total exploitation count across all vectors
   * @returns Promise resolving to total exploitations
   */
  static async getTotalExploitations(): Promise<number> {
    const result = await this.findAll({
      attributes: [
        [this.sequelize!.fn('SUM', this.sequelize!.col('exploitation_count')), 'total']
      ]
    });
    
    return result[0] ? parseInt((result[0] as any).getDataValue('total')) || 0 : 0;
  }

  /**
   * Create threat vector with validation
   * @param data Vector data to create
   * @returns Promise resolving to created vector
   */
  static async createVector(data: ThreatVectorCreationAttributes): Promise<ThreatVector> {
    // Validate vector type
    const validTypes = ['email', 'web', 'network', 'physical', 'social', 'other'];
    if (data.vector_type && !validTypes.includes(data.vector_type)) {
      throw new Error(`Invalid vector type. Must be one of: ${validTypes.join(', ')}`);
    }

    // Validate risk level
    const validRiskLevels = ['low', 'medium', 'high', 'critical'];
    if (data.risk_level && !validRiskLevels.includes(data.risk_level)) {
      throw new Error(`Invalid risk level. Must be one of: ${validRiskLevels.join(', ')}`);
    }

    return this.create(data);
  }
}

export default ThreatVector;
