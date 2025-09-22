/**
 * DATASET COLUMN SEQUELIZE MODEL
 * Represents columns within datasets with comprehensive type safety
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
  DataType,
  Length
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { Op } from 'sequelize';
import { Dataset } from './Dataset.model';

// DatasetColumn Attributes Interface
export interface DatasetColumnAttributes {
  /** Unique identifier for the dataset column */
  id: number;
  /** Foreign key reference to the parent dataset */
  dataset_id: number;
  /** Name of the column */
  name: string;
  /** Data type of the column */
  type: 'integer' | 'float' | 'string' | 'boolean' | 'date' | 'datetime' | 'categorical' | 'text' | 'binary';
  /** Number of missing/null values in this column */
  missing: number;
  /** Number of unique values in this column */
  unique_count: number;
  /** Minimum value (for numeric columns) */
  min_value?: number;
  /** Maximum value (for numeric columns) */
  max_value?: number;
  /** Mean value (for numeric columns) */
  mean_value?: number;
  /** Standard deviation (for numeric columns) */
  std_deviation?: number;
  /** Column statistics metadata */
  statistics: Record<string, any>;
  /** Column description */
  description?: string;
  /** Whether this column is a target variable */
  is_target: boolean;
  /** Whether this column should be used in modeling */
  include_in_model: boolean;
  /** Data quality score for this column (0-100) */
  quality_score: number;
  /** Record creation timestamp */
  created_at: Date;
  /** Record last update timestamp */
  updated_at: Date;
}

// DatasetColumn Creation Attributes Interface
export interface DatasetColumnCreationAttributes extends Optional<DatasetColumnAttributes,
  'id' | 'missing' | 'unique_count' | 'min_value' | 'max_value' | 'mean_value' | 
  'std_deviation' | 'statistics' | 'description' | 'is_target' | 'include_in_model' | 
  'quality_score' | 'created_at' | 'updated_at'
> {}

@Table({
  tableName: 'dataset_columns',
  timestamps: true,
  underscored: true,
  paranoid: false,
  indexes: [
    { fields: ['dataset_id'] },
    { fields: ['name'] },
    { fields: ['type'] },
    { fields: ['is_target'] },
    { fields: ['include_in_model'] }
  ]
})
export class DatasetColumn extends Model<DatasetColumnAttributes, DatasetColumnCreationAttributes> implements DatasetColumnAttributes {
  /** Unique identifier for the dataset column */
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  /** Foreign key reference to the parent dataset */
  @ForeignKey(() => Dataset)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare dataset_id: number;

  /** Name of the column */
  @AllowNull(false)
  @Length({ min: 1, max: 255 })
  @Column(DataType.STRING(255))
  declare name: string;

  /** Data type of the column */
  @AllowNull(false)
  @Default('string')
  @Column(DataType.ENUM('integer', 'float', 'string', 'boolean', 'date', 'datetime', 'categorical', 'text', 'binary'))
  declare type: 'integer' | 'float' | 'string' | 'boolean' | 'date' | 'datetime' | 'categorical' | 'text' | 'binary';

  /** Number of missing/null values in this column */
  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  declare missing: number;

  /** Number of unique values in this column */
  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  declare unique_count: number;

  /** Minimum value (for numeric columns) */
  @AllowNull(true)
  @Column(DataType.FLOAT)
  declare min_value?: number;

  /** Maximum value (for numeric columns) */
  @AllowNull(true)
  @Column(DataType.FLOAT)
  declare max_value?: number;

  /** Mean value (for numeric columns) */
  @AllowNull(true)
  @Column(DataType.FLOAT)
  declare mean_value?: number;

  /** Standard deviation (for numeric columns) */
  @AllowNull(true)
  @Column(DataType.FLOAT)
  declare std_deviation?: number;

  /** Column statistics metadata */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare statistics: Record<string, any>;

  /** Column description */
  @AllowNull(true)
  @Column(DataType.TEXT)
  declare description?: string;

  /** Whether this column is a target variable */
  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  declare is_target: boolean;

  /** Whether this column should be used in modeling */
  @AllowNull(false)
  @Default(true)
  @Column(DataType.BOOLEAN)
  declare include_in_model: boolean;

  /** Data quality score for this column (0-100) */
  @AllowNull(false)
  @Default(100)
  @Column(DataType.INTEGER)
  declare quality_score: number;

  /** Record creation timestamp */
  @CreatedAt
  @Column(DataType.DATE)
  declare created_at: Date;

  /** Record last update timestamp */
  @UpdatedAt
  @Column(DataType.DATE)
  declare updated_at: Date;

  // Associations
  /** Parent dataset for this column */
  @BelongsTo(() => Dataset, {
    foreignKey: 'dataset_id',
    as: 'dataset',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  declare dataset?: Dataset;

  // Instance methods
  /**
   * Check if this column is numeric (integer or float)
   * @returns True if column type is numeric
   */
  public isNumeric(): boolean {
    return this.type === 'integer' || this.type === 'float';
  }

  /**
   * Check if this column is categorical
   * @returns True if column type is categorical or string with low cardinality
   */
  public isCategorical(): boolean {
    return this.type === 'categorical' || 
           (this.type === 'string' && this.unique_count < 50);
  }

  /**
   * Calculate missing value percentage
   * @param totalRows Total number of rows in the dataset
   * @returns Percentage of missing values (0-100)
   */
  public getMissingPercentage(totalRows: number): number {
    if (totalRows === 0) return 0;
    return (this.missing / totalRows) * 100;
  }

  /**
   * Calculate cardinality ratio (unique values / total values)
   * @param totalRows Total number of rows in the dataset
   * @returns Cardinality ratio (0-1)
   */
  public getCardinalityRatio(totalRows: number): number {
    if (totalRows === 0) return 0;
    return this.unique_count / totalRows;
  }

  /**
   * Check if column has high cardinality
   * @param totalRows Total number of rows in the dataset
   * @param threshold Cardinality threshold (default: 0.8)
   * @returns True if column has high cardinality
   */
  public hasHighCardinality(totalRows: number, threshold: number = 0.8): boolean {
    return this.getCardinalityRatio(totalRows) > threshold;
  }

  // Static methods
  /**
   * Find columns by dataset ID
   * @param datasetId Dataset ID to filter by
   * @returns Promise resolving to array of dataset columns
   */
  static async findByDataset(datasetId: number): Promise<DatasetColumn[]> {
    return this.findAll({
      where: { dataset_id: datasetId },
      order: [['id', 'ASC']]
    });
  }

  /**
   * Find target columns across all datasets
   * @returns Promise resolving to array of target columns
   */
  static async findTargetColumns(): Promise<DatasetColumn[]> {
    return this.findAll({
      where: { is_target: true },
      include: [Dataset]
    });
  }

  /**
   * Find columns by data type
   * @param type Column data type to filter by
   * @returns Promise resolving to array of columns
   */
  static async findByType(type: DatasetColumnAttributes['type']): Promise<DatasetColumn[]> {
    return this.findAll({
      where: { type },
      order: [['dataset_id', 'ASC'], ['id', 'ASC']]
    });
  }

  /**
   * Find columns included in modeling
   * @param datasetId Optional dataset ID to filter by
   * @returns Promise resolving to array of modeling columns
   */
  static async findModelingColumns(datasetId?: number): Promise<DatasetColumn[]> {
    const whereClause: any = { include_in_model: true };
    if (datasetId) {
      whereClause.dataset_id = datasetId;
    }
    
    return this.findAll({
      where: whereClause,
      order: [['dataset_id', 'ASC'], ['id', 'ASC']]
    });
  }

  /**
   * Get data type distribution statistics
   * @returns Promise resolving to type distribution
   */
  static async getTypeDistribution(): Promise<Array<{ type: string; count: number }>> {
    const results = await this.findAll({
      attributes: [
        'type',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      group: ['type']
    });
    
    return results.map(r => ({
      type: r.type,
      count: parseInt((r as any).getDataValue('count'))
    }));
  }

  /**
   * Get columns with high missing value percentage
   * @param threshold Missing value threshold (default: 20%)
   * @returns Promise resolving to columns with high missing values
   */
  static async findHighMissingColumns(threshold: number = 20): Promise<DatasetColumn[]> {
    // This is a simplified version - in practice, you'd need to join with dataset
    // to get total rows and calculate percentage
    return this.findAll({
      where: {
        missing: {
          [Op.gt]: 0
        }
      },
      include: [Dataset],
      order: [['missing', 'DESC']]
    });
  }

  /**
   * Get quality score statistics
   * @returns Promise resolving to quality statistics
   */
  static async getQualityStats(): Promise<{
    avg_quality: number;
    min_quality: number;
    max_quality: number;
  }> {
    const result = await this.findAll({
      attributes: [
        [this.sequelize!.fn('AVG', this.sequelize!.col('quality_score')), 'avg_quality'],
        [this.sequelize!.fn('MIN', this.sequelize!.col('quality_score')), 'min_quality'],
        [this.sequelize!.fn('MAX', this.sequelize!.col('quality_score')), 'max_quality']
      ]
    });
    
    const stats = result[0];
    return {
      avg_quality: parseFloat((stats as any).getDataValue('avg_quality')) || 0,
      min_quality: parseFloat((stats as any).getDataValue('min_quality')) || 0,
      max_quality: parseFloat((stats as any).getDataValue('max_quality')) || 0
    };
  }
}

export default DatasetColumn;
