/**
 * MODEL SEQUELIZE MODEL
 * Represents ML models in the system
 */
import {
  Table,
  Column,
  Model as SequelizeModel,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Default,
  CreatedAt,
  UpdatedAt,
  HasMany,
  DataType
} from 'sequelize-typescript';
import { Deployment } from './Deployment.model';
import { Op } from 'sequelize';

@Table({
  tableName: 'models',
  timestamps: true,
  underscored: true
})
export class MLModel extends SequelizeModel {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  declare name: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  declare type: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  declare algorithm: string;

  @Default(0)
  @Column(DataType.FLOAT)
  declare accuracy: number;

  @Default(0)
  @Column(DataType.FLOAT)
  declare f1_score: number;

  @Default(0)
  @Column(DataType.FLOAT)
  declare auc: number;

  @AllowNull(false)
  @Default('Development')
  @Column(DataType.STRING(50))
  declare status: string;

  @AllowNull(false)
  @Default('1.0.0')
  @Column(DataType.STRING(50))
  declare version: string;

  @AllowNull(false)
  @Default('0 MB')
  @Column(DataType.STRING(20))
  declare size: string;

  @CreatedAt
  @Column(DataType.DATE)
  declare created_at: Date;

  @Default(() => new Date())
  @Column(DataType.DATE)
  declare last_trained: Date;

  @Default(0)
  @Column(DataType.INTEGER)
  declare deployments: number;

  @Default(0)
  @Column(DataType.INTEGER)
  declare predictions: number;

  @Default(false)
  @Column(DataType.BOOLEAN)
  declare starred: boolean;

  @Default('phantom-ml-core')
  @Column(DataType.STRING(100))
  declare framework: string;

  @Column(DataType.ARRAY(DataType.TEXT))
  declare features: string[];

  @Column(DataType.JSONB)
  declare metrics: Record<string, any>;

  @Default(0)
  @Column(DataType.INTEGER)
  declare security_score: number;

  @Default(0)
  @Column(DataType.INTEGER)
  declare performance_score: number;

  @UpdatedAt
  @Column(DataType.DATE)
  declare updated_at: Date;

  // Associations
  @HasMany(() => Deployment)
  declare model_deployments: Deployment[];

  // Instance methods
  public async incrementPredictions() {
    this.predictions += 1;
    return this.save();
  }

  public async updateMetrics(newMetrics: Record<string, any>) {
    this.metrics = { ...this.metrics, ...newMetrics };
    return this.save();
  }

  public async toggleStar() {
    this.starred = !this.starred;
    return this.save();
  }

  // Static methods
  static async findByStatus(status: string) {
    return this.findAll({
      where: { status },
      order: [['created_at', 'DESC']]
    });
  }

  static async findByAlgorithm(algorithm: string) {
    return this.findAll({
      where: { algorithm },
      order: [['created_at', 'DESC']]
    });
  }

  static async findStarred() {
    return this.findAll({
      where: { starred: true },
      order: [['created_at', 'DESC']]
    });
  }

  static async findByAccuracyRange(minAccuracy: number, maxAccuracy: number) {
    return this.findAll({
      where: {
        accuracy: {
          [Op.between]: [minAccuracy, maxAccuracy]
        }
      },
      order: [['accuracy', 'DESC']]
    });
  }

  static async getTopPerforming(limit: number = 10) {
    return this.findAll({
      where: {
        accuracy: {
          [Op.gt]: 0
        }
      },
      order: [['accuracy', 'DESC']],
      limit
    });
  }

  static async getStatusStats() {
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

  static async getAlgorithmStats() {
    const results = await this.findAll({
      attributes: [
        'algorithm',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count'],
        [this.sequelize!.fn('AVG', this.sequelize!.col('accuracy')), 'avg_accuracy']
      ],
      group: ['algorithm']
    });
    
    return results.map(r => ({
      algorithm: r.algorithm,
      count: (r as any).getDataValue('count'),
      avg_accuracy: (r as any).getDataValue('avg_accuracy')
    }));
  }

  static async getFrameworkStats() {
    const results = await this.findAll({
      attributes: [
        'framework',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      group: ['framework']
    });
    
    return results.map(r => ({
      framework: r.framework,
      count: (r as any).getDataValue('count')
    }));
  }

  static async getMostUsed(limit: number = 10) {
    return this.findAll({
      order: [['predictions', 'DESC']],
      limit
    });
  }

  static async getRecentlyTrained(limit: number = 10) {
    return this.findAll({
      order: [['last_trained', 'DESC']],
      limit
    });
  }
}
