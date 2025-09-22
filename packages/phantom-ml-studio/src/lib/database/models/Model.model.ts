/**
 * MODEL SEQUELIZE MODEL
 * Represents ML models in the system
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
  DataType,
  Length
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { Op } from 'sequelize';
import { Deployment } from './Deployment.model';

// Model Attributes Interface
export interface ModelAttributes {
  /** Unique identifier for the model */
  id: number;
  /** Name of the model */
  name: string;
  /** Type of the model */
  type: string;
  /** Algorithm used by the model */
  algorithm: string;
  /** Model accuracy score */
  accuracy: number;
  /** Model F1 score */
  f1_score: number;
  /** Model AUC score */
  auc: number;
  /** Current status of the model */
  status: string;
  /** Version of the model */
  version: string;
  /** Size of the model */
  size: string;
  /** Record creation timestamp */
  created_at: Date;
  /** Last training timestamp */
  last_trained: Date;
  /** Number of deployments */
  deployments: number;
  /** Number of predictions made */
  predictions: number;
  /** Whether the model is starred */
  starred: boolean;
  /** Framework used to build the model */
  framework: string;
  /** Model features */
  features: string[];
  /** Model metrics */
  metrics: Record<string, any>;
  /** Security score */
  security_score: number;
  /** Performance score */
  performance_score: number;
  /** Record last update timestamp */
  updated_at: Date;
}

// Model Creation Attributes Interface
export interface ModelCreationAttributes extends Optional<ModelAttributes,
  'id' | 'accuracy' | 'f1_score' | 'auc' | 'status' | 'version' | 'size' | 
  'created_at' | 'last_trained' | 'deployments' | 'predictions' | 'starred' | 
  'framework' | 'features' | 'metrics' | 'security_score' | 'performance_score' | 'updated_at'
> {}

@Table({
  tableName: 'models',
  timestamps: true,
  underscored: true,
  paranoid: false,
  indexes: [
    { fields: ['name'] },
    { fields: ['type'] },
    { fields: ['algorithm'] },
    { fields: ['status'] },
    { fields: ['starred'] },
    { fields: ['created_at'] }
  ]
})
export class MLModel extends Model<ModelAttributes, ModelCreationAttributes> implements ModelAttributes {
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

export default MLModel;
