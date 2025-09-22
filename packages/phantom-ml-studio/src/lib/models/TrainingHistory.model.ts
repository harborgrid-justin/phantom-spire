/**
 * TRAINING HISTORY SEQUELIZE MODEL
 * Represents training progress for experiments with comprehensive type safety
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
  DataType
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { Op } from 'sequelize';
import { Experiment } from './Experiment.model';

// TrainingHistory Attributes Interface
export interface TrainingHistoryAttributes {
  /** Unique identifier for the training history record */
  id: number;
  /** Foreign key reference to the experiment */
  experiment_id: number;
  /** Training epoch number */
  epoch: number;
  /** Training loss value */
  training_loss: number;
  /** Validation loss value */
  validation_loss: number;
  /** Accuracy score for this epoch */
  accuracy: number;
  /** Precision score for this epoch */
  precision?: number;
  /** Recall score for this epoch */
  recall?: number;
  /** F1 score for this epoch */
  f1_score?: number;
  /** Learning rate used in this epoch */
  learning_rate?: number;
  /** Batch size used in this epoch */
  batch_size?: number;
  /** Training time for this epoch in seconds */
  epoch_time?: number;
  /** Additional metrics for this epoch */
  metrics: Record<string, any>;
  /** Record creation timestamp */
  created_at: Date;
  /** Record last update timestamp */
  updated_at: Date;
}

// TrainingHistory Creation Attributes Interface
export interface TrainingHistoryCreationAttributes extends Optional<TrainingHistoryAttributes,
  'id' | 'precision' | 'recall' | 'f1_score' | 'learning_rate' | 'batch_size' | 
  'epoch_time' | 'metrics' | 'created_at' | 'updated_at'
> {}

@Table({
  tableName: 'training_history',
  timestamps: true,
  underscored: true,
  paranoid: false,
  indexes: [
    { fields: ['experiment_id'] },
    { fields: ['epoch'] },
    { fields: ['accuracy'] },
    { fields: ['training_loss'] },
    { fields: ['validation_loss'] },
    { unique: true, fields: ['experiment_id', 'epoch'] }
  ]
})
export class TrainingHistory extends Model<TrainingHistoryAttributes, TrainingHistoryCreationAttributes> implements TrainingHistoryAttributes {
  /** Unique identifier for the training history record */
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  /** Foreign key reference to the experiment */
  @ForeignKey(() => Experiment)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare experiment_id: number;

  /** Training epoch number */
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare epoch: number;

  /** Training loss value */
  @AllowNull(false)
  @Column(DataType.FLOAT)
  declare training_loss: number;

  /** Validation loss value */
  @AllowNull(false)
  @Column(DataType.FLOAT)
  declare validation_loss: number;

  /** Accuracy score for this epoch */
  @AllowNull(false)
  @Column(DataType.FLOAT)
  declare accuracy: number;

  /** Precision score for this epoch */
  @AllowNull(true)
  @Column(DataType.FLOAT)
  declare precision?: number;

  /** Recall score for this epoch */
  @AllowNull(true)
  @Column(DataType.FLOAT)
  declare recall?: number;

  /** F1 score for this epoch */
  @AllowNull(true)
  @Column(DataType.FLOAT)
  declare f1_score?: number;

  /** Learning rate used in this epoch */
  @AllowNull(true)
  @Column(DataType.FLOAT)
  declare learning_rate?: number;

  /** Batch size used in this epoch */
  @AllowNull(true)
  @Column(DataType.INTEGER)
  declare batch_size?: number;

  /** Training time for this epoch in seconds */
  @AllowNull(true)
  @Column(DataType.FLOAT)
  declare epoch_time?: number;

  /** Additional metrics for this epoch */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare metrics: Record<string, any>;

  /** Record creation timestamp */
  @CreatedAt
  @Column(DataType.DATE)
  declare created_at: Date;

  /** Record last update timestamp */
  @UpdatedAt
  @Column(DataType.DATE)
  declare updated_at: Date;

  // Associations
  /** Parent experiment for this training record */
  @BelongsTo(() => Experiment, {
    foreignKey: 'experiment_id',
    as: 'experiment',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  declare experiment?: Experiment;

  // Instance methods
  /**
   * Check if this epoch shows improvement over previous epoch
   * @returns Promise resolving to boolean indicating improvement
   */
  public async showsImprovement(): Promise<boolean> {
    if (this.epoch === 1) return true;
    
    const previousEpoch = await TrainingHistory.findOne({
      where: {
        experiment_id: this.experiment_id,
        epoch: this.epoch - 1
      }
    });
    
    if (!previousEpoch) return true;
    
    return this.accuracy > previousEpoch.accuracy || 
           this.validation_loss < previousEpoch.validation_loss;
  }

  /**
   * Calculate loss difference from previous epoch
   * @returns Promise resolving to loss change metrics
   */
  public async getLossChange(): Promise<{
    training_loss_change: number;
    validation_loss_change: number;
  } | null> {
    if (this.epoch === 1) return null;
    
    const previousEpoch = await TrainingHistory.findOne({
      where: {
        experiment_id: this.experiment_id,
        epoch: this.epoch - 1
      }
    });
    
    if (!previousEpoch) return null;
    
    return {
      training_loss_change: this.training_loss - previousEpoch.training_loss,
      validation_loss_change: this.validation_loss - previousEpoch.validation_loss
    };
  }

  /**
   * Check if this epoch shows signs of overfitting
   * @param threshold Gap threshold between training and validation loss
   * @returns True if overfitting is detected
   */
  public isOverfitting(threshold: number = 0.1): boolean {
    return (this.validation_loss - this.training_loss) > threshold;
  }

  // Static methods
  /**
   * Find training history by experiment ID
   * @param experimentId Experiment ID to filter by
   * @returns Promise resolving to training history array
   */
  static async findByExperiment(experimentId: number): Promise<TrainingHistory[]> {
    return this.findAll({
      where: { experiment_id: experimentId },
      order: [['epoch', 'ASC']]
    });
  }

  /**
   * Get latest training record for an experiment
   * @param experimentId Experiment ID to search
   * @returns Promise resolving to latest training history or null
   */
  static async getLatestForExperiment(experimentId: number): Promise<TrainingHistory | null> {
    return this.findOne({
      where: { experiment_id: experimentId },
      order: [['epoch', 'DESC']]
    });
  }

  /**
   * Get training record with best accuracy for an experiment
   * @param experimentId Experiment ID to search
   * @returns Promise resolving to best accuracy record or null
   */
  static async getBestAccuracyForExperiment(experimentId: number): Promise<TrainingHistory | null> {
    return this.findOne({
      where: { experiment_id: experimentId },
      order: [['accuracy', 'DESC']]
    });
  }

  /**
   * Get training record with lowest validation loss for an experiment
   * @param experimentId Experiment ID to search
   * @returns Promise resolving to best validation loss record or null
   */
  static async getBestValidationLossForExperiment(experimentId: number): Promise<TrainingHistory | null> {
    return this.findOne({
      where: { experiment_id: experimentId },
      order: [['validation_loss', 'ASC']]
    });
  }

  /**
   * Get statistical summary for an experiment's training history
   * @param experimentId Experiment ID to analyze
   * @returns Promise resolving to training statistics
   */
  static async getEpochStats(experimentId: number): Promise<{
    training_loss: { min: number; max: number; avg: number };
    validation_loss: { min: number; max: number; avg: number };
    accuracy: { min: number; max: number; avg: number };
  } | null> {
    const results = await this.findAll({
      attributes: [
        [this.sequelize!.fn('MIN', this.sequelize!.col('training_loss')), 'min_training_loss'],
        [this.sequelize!.fn('MAX', this.sequelize!.col('training_loss')), 'max_training_loss'],
        [this.sequelize!.fn('AVG', this.sequelize!.col('training_loss')), 'avg_training_loss'],
        [this.sequelize!.fn('MIN', this.sequelize!.col('validation_loss')), 'min_validation_loss'],
        [this.sequelize!.fn('MAX', this.sequelize!.col('validation_loss')), 'max_validation_loss'],
        [this.sequelize!.fn('AVG', this.sequelize!.col('validation_loss')), 'avg_validation_loss'],
        [this.sequelize!.fn('MIN', this.sequelize!.col('accuracy')), 'min_accuracy'],
        [this.sequelize!.fn('MAX', this.sequelize!.col('accuracy')), 'max_accuracy'],
        [this.sequelize!.fn('AVG', this.sequelize!.col('accuracy')), 'avg_accuracy']
      ],
      where: { experiment_id: experimentId }
    });

    return results[0] ? {
      training_loss: {
        min: parseFloat((results[0] as any).getDataValue('min_training_loss')) || 0,
        max: parseFloat((results[0] as any).getDataValue('max_training_loss')) || 0,
        avg: parseFloat((results[0] as any).getDataValue('avg_training_loss')) || 0
      },
      validation_loss: {
        min: parseFloat((results[0] as any).getDataValue('min_validation_loss')) || 0,
        max: parseFloat((results[0] as any).getDataValue('max_validation_loss')) || 0,
        avg: parseFloat((results[0] as any).getDataValue('avg_validation_loss')) || 0
      },
      accuracy: {
        min: parseFloat((results[0] as any).getDataValue('min_accuracy')) || 0,
        max: parseFloat((results[0] as any).getDataValue('max_accuracy')) || 0,
        avg: parseFloat((results[0] as any).getDataValue('avg_accuracy')) || 0
      }
    } : null;
  }

  /**
   * Get training progress curve data for visualization
   * @param experimentId Experiment ID to get data for
   * @returns Promise resolving to curve data points
   */
  static async getProgressCurve(experimentId: number): Promise<Array<{
    epoch: number;
    training_loss: number;
    validation_loss: number;
    accuracy: number;
  }>> {
    const records = await this.findAll({
      where: { experiment_id: experimentId },
      attributes: ['epoch', 'training_loss', 'validation_loss', 'accuracy'],
      order: [['epoch', 'ASC']]
    });

    return records.map(r => ({
      epoch: r.epoch,
      training_loss: r.training_loss,
      validation_loss: r.validation_loss,
      accuracy: r.accuracy
    }));
  }

  /**
   * Find epochs that show potential overfitting
   * @param experimentId Experiment ID to analyze
   * @param threshold Loss gap threshold (default: 0.1)
   * @returns Promise resolving to overfitting epochs
   */
  static async findOverfittingEpochs(experimentId: number, threshold: number = 0.1): Promise<TrainingHistory[]> {
    return this.findAll({
      where: {
        experiment_id: experimentId,
        [Op.and]: [
          this.sequelize!.where(
            this.sequelize!.fn('ABS', 
              this.sequelize!.col('validation_loss'), 
              '-', 
              this.sequelize!.col('training_loss')
            ), 
            '>', 
            threshold
          )
        ]
      },
      order: [['epoch', 'ASC']]
    });
  }

  /**
   * Get convergence analysis for an experiment
   * @param experimentId Experiment ID to analyze
   * @param windowSize Window size for moving average (default: 5)
   * @returns Promise resolving to convergence metrics
   */
  static async getConvergenceAnalysis(experimentId: number, windowSize: number = 5): Promise<{
    is_converged: boolean;
    convergence_epoch?: number;
    final_trend: 'improving' | 'stable' | 'degrading';
  }> {
    const records = await this.findAll({
      where: { experiment_id: experimentId },
      order: [['epoch', 'ASC']]
    });

    if (records.length < windowSize * 2) {
      return { is_converged: false, final_trend: 'stable' };
    }

    // Simple convergence detection based on validation loss stability
    const recentRecords = records.slice(-windowSize);
    const validationLosses = recentRecords.map(r => r.validation_loss);
    const avgLoss = validationLosses.reduce((a, b) => a + b, 0) / validationLosses.length;
    const variance = validationLosses.reduce((a, b) => a + Math.pow(b - avgLoss, 2), 0) / validationLosses.length;
    
    const isConverged = variance < 0.001; // Low variance indicates convergence
    
    // Determine trend
    const firstHalfAvg = recentRecords.slice(0, Math.floor(windowSize / 2))
      .reduce((a, b) => a + b.validation_loss, 0) / Math.floor(windowSize / 2);
    const secondHalfAvg = recentRecords.slice(Math.floor(windowSize / 2))
      .reduce((a, b) => a + b.validation_loss, 0) / (windowSize - Math.floor(windowSize / 2));
    
    let trend: 'improving' | 'stable' | 'degrading';
    if (secondHalfAvg < firstHalfAvg - 0.01) trend = 'improving';
    else if (secondHalfAvg > firstHalfAvg + 0.01) trend = 'degrading';
    else trend = 'stable';

    const result: {
      is_converged: boolean;
      convergence_epoch?: number;
      final_trend: 'improving' | 'stable' | 'degrading';
    } = {
      is_converged: isConverged,
      final_trend: trend
    };
    
    if (isConverged && records.length >= windowSize) {
      const convergenceRecord = records[records.length - windowSize];
      if (convergenceRecord) {
        result.convergence_epoch = convergenceRecord.epoch;
      }
    }
    
    return result;
  }
}

export default TrainingHistory;
