/**
 * REPUTATION SCORE SEQUELIZE MODEL
 * Represents reputation scoring from phantom-reputation-core
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
  Index
} from 'sequelize-typescript';
import { Op } from 'sequelize';

@Table({
  tableName: 'reputation_scores',
  timestamps: true,
  underscored: true
})
export class ReputationScore extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Index
  @Column(DataType.STRING(500))
  declare indicator: string; // IP, Domain, Hash, etc.

  @AllowNull(false)
  @Index
  @Column(DataType.STRING(20))
  declare indicator_type: string; // ip, domain, hash, email, url

  @AllowNull(false)
  @Default(50)
  @Column(DataType.INTEGER)
  declare reputation_score: number; // 0-100 (0=malicious, 100=clean)

  @AllowNull(false)
  @Default('unknown')
  @Column(DataType.STRING(20))
  declare classification: string; // malicious, suspicious, unknown, clean

  @Default(0)
  @Column(DataType.INTEGER)
  declare confidence: number; // 0-100

  @Default('[]')
  @Column(DataType.ARRAY(DataType.STRING))
  declare sources: string[]; // Reputation sources

  @Default('{}')
  @Column(DataType.JSONB)
  declare source_scores: Record<string, any>; // Individual source scores

  @Column(DataType.DATE)
  declare last_seen: Date;

  @Column(DataType.DATE)
  declare first_seen: Date;

  @Default(1)
  @Column(DataType.INTEGER)
  declare observation_count: number;

  @Default('[]')
  @Column(DataType.ARRAY(DataType.STRING))
  declare categories: string[]; // malware, phishing, spam, etc.

  @Default('{}')
  @Column(DataType.JSONB)
  declare enrichment_data: Record<string, any>;

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
  public isMalicious(): boolean {
    return this.classification === 'malicious' || this.reputation_score <= 20;
  }

  public isSuspicious(): boolean {
    return this.classification === 'suspicious' || (this.reputation_score > 20 && this.reputation_score <= 50);
  }

  public isClean(): boolean {
    return this.classification === 'clean' || this.reputation_score >= 80;
  }

  public async updateScore(newScore: number, source: string) {
    this.reputation_score = Math.max(0, Math.min(100, newScore));
    this.observation_count += 1;
    this.last_seen = new Date();
    
    // Update source scores
    const sourceScores = this.source_scores || {};
    sourceScores[source] = newScore;
    this.source_scores = sourceScores;
    
    // Update classification based on score
    if (this.reputation_score <= 20) {
      this.classification = 'malicious';
    } else if (this.reputation_score <= 50) {
      this.classification = 'suspicious';
    } else if (this.reputation_score >= 80) {
      this.classification = 'clean';
    } else {
      this.classification = 'unknown';
    }
    
    return this.save();
  }

  // Static methods
  static async findByIndicator(indicator: string) {
    return this.findOne({ where: { indicator } });
  }

  static async findByType(indicatorType: string) {
    return this.findAll({
      where: { indicator_type: indicatorType },
      order: [['reputation_score', 'ASC']]
    });
  }

  static async findMalicious() {
    return this.findAll({
      where: {
        [Op.or]: [
          { classification: 'malicious' },
          { reputation_score: { [Op.lte]: 20 } }
        ]
      },
      order: [['reputation_score', 'ASC']]
    });
  }

  static async findSuspicious() {
    return this.findAll({
      where: {
        [Op.or]: [
          { classification: 'suspicious' },
          { 
            reputation_score: { 
              [Op.and]: [{ [Op.gt]: 20 }, { [Op.lte]: 50 }] 
            } 
          }
        ]
      },
      order: [['reputation_score', 'ASC']]
    });
  }

  static async findClean() {
    return this.findAll({
      where: {
        [Op.or]: [
          { classification: 'clean' },
          { reputation_score: { [Op.gte]: 80 } }
        ]
      },
      order: [['reputation_score', 'DESC']]
    });
  }

  static async getClassificationStats() {
    const results = await this.findAll({
      attributes: [
        'classification',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      group: ['classification']
    });
    
    return results.map(r => ({
      classification: r.classification,
      count: (r as any).getDataValue('count')
    }));
  }

  static async getTypeStats() {
    const results = await this.findAll({
      attributes: [
        'indicator_type',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      group: ['indicator_type']
    });
    
    return results.map(r => ({
      type: r.indicator_type,
      count: (r as any).getDataValue('count')
    }));
  }
}
