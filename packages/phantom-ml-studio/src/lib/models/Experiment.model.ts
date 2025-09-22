/**
 * EXPERIMENT SEQUELIZE MODEL
 * Represents ML experiments and their results with comprehensive type safety
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
  DataType,
  Length
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { Op } from 'sequelize';
import { Dataset } from './Dataset.model';
import { TrainingHistory } from './TrainingHistory.model';

// Experiment Attributes Interface
export interface ExperimentAttributes {
  /** Unique identifier for the experiment */
  id: number;
  /** Name of the experiment */
  name: string;
  /** Current status of the experiment */
  status: 'scheduled' | 'running' | 'completed' | 'failed' | 'stopped';
  /** Model accuracy score (0-1) */
  accuracy: number;
  /** F1 score metric (0-1) */
  f1_score: number;
  /** Area under curve metric (0-1) */
  auc: number;
  /** Machine learning algorithm used */
  algorithm: 'random_forest' | 'gradient_boosting' | 'svm' | 'logistic_regression' | 'neural_network' | 'xgboost' | 'other';
  /** Dataset name used for training */
  dataset: string;
  /** Foreign key reference to dataset */
  dataset_id?: number;
  /** Experiment duration */
  duration?: string;
  /** Hyperparameters configuration */
  hyperparameters: Record<string, any>;
  /** Experiment description */
  description?: string;
  /** Number of training epochs */
  epochs?: number;
  /** Batch size used in training */
  batch_size?: number;
  /** Learning rate */
  learning_rate?: number;
  /** Cross-validation folds */
  cv_folds?: number;
  /** Test set size ratio */
  test_size?: number;
  /** Random seed for reproducibility */
  random_seed?: number;
  /** Experiment configuration metadata */
  config: Record<string, any>;
  /** Training metrics history */
  metrics: Record<string, any>;
  /** Model artifacts and outputs */
  artifacts: Record<string, any>;
  /** Experiment tags */
  tags: string[];
  /** Whether experiment is favorited */
  is_favorite: boolean;
  /** Record creation timestamp */
  created_at: Date;
  /** Record last update timestamp */
  updated_at: Date;
}

// Experiment Creation Attributes Interface
export interface ExperimentCreationAttributes extends Optional<ExperimentAttributes,
  'id' | 'status' | 'accuracy' | 'f1_score' | 'auc' | 'dataset_id' | 'duration' | 
  'hyperparameters' | 'description' | 'epochs' | 'batch_size' | 'learning_rate' | 
  'cv_folds' | 'test_size' | 'random_seed' | 'config' | 'metrics' | 'artifacts' | 
  'tags' | 'is_favorite' | 'created_at' | 'updated_at'
> {}

@Table({
  tableName: 'experiments',
  timestamps: true,
  underscored: true,
  paranoid: false,
  indexes: [
    { fields: ['name'] },
    { fields: ['status'] },
    { fields: ['algorithm'] },
    { fields: ['dataset'] },
    { fields: ['dataset_id'] },
    { fields: ['accuracy'] },
    { fields: ['is_favorite'] },
    { fields: ['created_at'] }
  ]
})
export class Experiment extends Model<ExperimentAttributes, ExperimentCreationAttributes> implements ExperimentAttributes {
  /** Unique identifier for the experiment */
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  /** Name of the experiment */
  @AllowNull(false)
  @Length({ min: 1, max: 255 })
  @Column(DataType.STRING(255))
  declare name: string;

  /** Current status of the experiment */
  @AllowNull(false)
  @Default('scheduled')
  @Column(DataType.ENUM('scheduled', 'running', 'completed', 'failed', 'stopped'))
  declare status: 'scheduled' | 'running' | 'completed' | 'failed' | 'stopped';

  /** Model accuracy score (0-1) */
  @AllowNull(false)
  @Default(0)
  @Column(DataType.FLOAT)
  declare accuracy: number;

  /** F1 score metric (0-1) */
  @AllowNull(false)
  @Default(0)
  @Column(DataType.FLOAT)
  declare f1_score: number;

  /** Area under curve metric (0-1) */
  @AllowNull(false)
  @Default(0)
  @Column(DataType.FLOAT)
  declare auc: number;

  /** Machine learning algorithm used */
  @AllowNull(false)
  @Default('other')
  @Column(DataType.ENUM('random_forest', 'gradient_boosting', 'svm', 'logistic_regression', 'neural_network', 'xgboost', 'other'))
  declare algorithm: 'random_forest' | 'gradient_boosting' | 'svm' | 'logistic_regression' | 'neural_network' | 'xgboost' | 'other';

  /** Dataset name used for training */
  @AllowNull(false)
  @Length({ min: 1, max: 255 })
  @Column(DataType.STRING(255))
  declare dataset: string;

  /** Foreign key reference to dataset */
  @ForeignKey(() => Dataset)
  @AllowNull(true)
  @Column(DataType.INTEGER)
  declare dataset_id?: number;

  /** Experiment duration */
  @AllowNull(true)
  @Length({ max: 100 })
  @Column(DataType.STRING(100))
  declare duration?: string;

  /** Hyperparameters configuration */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare hyperparameters: Record<string, any>;

  /** Experiment description */
  @AllowNull(true)
  @Column(DataType.TEXT)
  declare description?: string;

  /** Number of training epochs */
  @AllowNull(true)
  @Column(DataType.INTEGER)
  declare epochs?: number;

  /** Batch size used in training */
  @AllowNull(true)
  @Column(DataType.INTEGER)
  declare batch_size?: number;

  /** Learning rate */
  @AllowNull(true)
  @Column(DataType.FLOAT)
  declare learning_rate?: number;

  /** Cross-validation folds */
  @AllowNull(true)
  @Column(DataType.INTEGER)
  declare cv_folds?: number;

  /** Test set size ratio */
  @AllowNull(true)
  @Column(DataType.FLOAT)
  declare test_size?: number;

  /** Random seed for reproducibility */
  @AllowNull(true)
  @Column(DataType.INTEGER)
  declare random_seed?: number;

  /** Experiment configuration metadata */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare config: Record<string, any>;

  /** Training metrics history */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare metrics: Record<string, any>;

  /** Model artifacts and outputs */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare artifacts: Record<string, any>;

  /** Experiment tags */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare tags: string[];

  /** Whether experiment is favorited */
  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  declare is_favorite: boolean;

  /** Record creation timestamp */
  @CreatedAt
  @Column(DataType.DATE)
  declare created_at: Date;

  /** Record last update timestamp */
  @UpdatedAt
  @Column(DataType.DATE)
  declare updated_at: Date;

  // Associations
  /** Dataset used in this experiment */
  @BelongsTo(() => Dataset, {
    foreignKey: 'dataset_id',
    as: 'experiment_dataset',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  })
  declare experiment_dataset?: Dataset;

  /** Training history records for this experiment */
  @HasMany(() => TrainingHistory, {
    foreignKey: 'experiment_id',
    as: 'training_history',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  declare training_history?: TrainingHistory[];

  // Instance methods
  /**
   * Get the latest training metrics for this experiment
   * @returns Promise resolving to latest metrics or null
   */
  public async getLatestMetrics(): Promise<{
    epoch: number;
    training_loss: number;
    validation_loss: number;
    accuracy: number;
  } | null> {
    const latestHistory = await TrainingHistory.findOne({
      where: { experiment_id: this.id },
      order: [['epoch', 'DESC']]
    });
    
    return latestHistory ? {
      epoch: latestHistory.epoch,
      training_loss: latestHistory.training_loss,
      validation_loss: latestHistory.validation_loss,
      accuracy: latestHistory.accuracy
    } : null;
  }

  /**
   * Get complete training progress for this experiment
   * @returns Promise resolving to training history array
   */
  public async getTrainingProgress(): Promise<TrainingHistory[]> {
    return TrainingHistory.findAll({
      where: { experiment_id: this.id },
      order: [['epoch', 'ASC']]
    });
  }

  /**
   * Check if experiment is completed
   * @returns True if experiment status is completed
   */
  public isCompleted(): boolean {
    return this.status === 'completed';
  }

  /**
   * Check if experiment is running
   * @returns True if experiment status is running
   */
  public isRunning(): boolean {
    return this.status === 'running';
  }

  /**
   * Calculate overall performance score based on metrics
   * @returns Weighted performance score (0-100)
   */
  public getPerformanceScore(): number {
    // Weighted combination of metrics
    const weightedScore = (this.accuracy * 0.4) + (this.f1_score * 0.3) + (this.auc * 0.3);
    return Math.round(weightedScore * 100);
  }

  /**
   * Toggle favorite status
   * @returns Promise resolving to updated experiment
   */
  public async toggleFavorite(): Promise<this> {
    this.is_favorite = !this.is_favorite;
    return this.save();
  }

  // Static methods
  /**
   * Find experiments by status
   * @param status Status to filter by
   * @returns Promise resolving to experiments array
   */
  static async findByStatus(status: ExperimentAttributes['status']): Promise<Experiment[]> {
    return this.findAll({
      where: { status },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Find experiments by algorithm
   * @param algorithm Algorithm to filter by
   * @returns Promise resolving to experiments array
   */
  static async findByAlgorithm(algorithm: ExperimentAttributes['algorithm']): Promise<Experiment[]> {
    return this.findAll({
      where: { algorithm },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Find experiments by dataset
   * @param dataset Dataset name to filter by
   * @returns Promise resolving to experiments array
   */
  static async findByDataset(dataset: string): Promise<Experiment[]> {
    return this.findAll({
      where: { dataset },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Find favorite experiments
   * @returns Promise resolving to favorite experiments
   */
  static async findFavorites(): Promise<Experiment[]> {
    return this.findAll({
      where: { is_favorite: true },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Find experiments by tag
   * @param tag Tag to filter by
   * @returns Promise resolving to experiments array
   */
  static async findByTag(tag: string): Promise<Experiment[]> {
    return this.findAll({
      where: {
        tags: {
          [Op.contains]: [tag]
        }
      },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Get experiment status statistics
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
   * Get algorithm performance statistics
   * @returns Promise resolving to algorithm statistics
   */
  static async getAlgorithmStats(): Promise<Array<{
    algorithm: string;
    count: number;
    avg_accuracy: number;
  }>> {
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
      count: parseInt((r as any).getDataValue('count')),
      avg_accuracy: parseFloat((r as any).getDataValue('avg_accuracy')) || 0
    }));
  }

  /**
   * Get best performing experiments
   * @param limit Maximum number of experiments to return
   * @returns Promise resolving to top performing experiments
   */
  static async getBestPerforming(limit: number = 10): Promise<Experiment[]> {
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

  /**
   * Get recent experiments
   * @param limit Maximum number of experiments to return
   * @returns Promise resolving to recent experiments
   */
  static async findRecent(limit: number = 10): Promise<Experiment[]> {
    return this.findAll({
      order: [['created_at', 'DESC']],
      limit
    });
  }

  /**
   * Get experiments within accuracy range
   * @param minAccuracy Minimum accuracy threshold
   * @param maxAccuracy Maximum accuracy threshold
   * @returns Promise resolving to experiments in range
   */
  static async findByAccuracyRange(minAccuracy: number, maxAccuracy: number): Promise<Experiment[]> {
    return this.findAll({
      where: {
        accuracy: {
          [Op.between]: [minAccuracy, maxAccuracy]
        }
      },
      order: [['accuracy', 'DESC']]
    });
  }
}

export default Experiment;
