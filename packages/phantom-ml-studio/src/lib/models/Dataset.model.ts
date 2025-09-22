/**
 * DATASET SEQUELIZE MODEL
 * Represents datasets in the ML pipeline with comprehensive type safety
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
import { DatasetColumn } from './DatasetColumn.model';
import { SampleData } from './SampleData.model';
import { Experiment } from './Experiment.model';

// Dataset Attributes Interface
export interface DatasetAttributes {
  /** Unique identifier for the dataset */
  id: number;
  /** Name of the dataset */
  name: string;
  /** Number of rows in the dataset */
  rows: number;
  /** Number of columns in the dataset */
  columns: number;
  /** Type of dataset (classification, regression, etc.) */
  type: 'classification' | 'regression' | 'clustering' | 'time_series' | 'text' | 'image' | 'other';
  /** Upload status of the dataset */
  uploaded: 'pending' | 'processing' | 'completed' | 'failed';
  /** Optional description of the dataset */
  description?: string;
  /** File path or URL to the dataset */
  file_path?: string;
  /** File size in bytes */
  file_size?: number;
  /** File format (CSV, JSON, etc.) */
  file_format?: string;
  /** Dataset source information */
  source?: string;
  /** Dataset tags for categorization */
  tags: string[];
  /** Dataset metadata */
  metadata: Record<string, any>;
  /** Whether the dataset is public */
  is_public: boolean;
  /** Dataset quality score (0-100) */
  quality_score: number;
  /** Record creation timestamp */
  created_at: Date;
  /** Record last update timestamp */
  updated_at: Date;
}

// Dataset Creation Attributes Interface
export interface DatasetCreationAttributes extends Optional<DatasetAttributes,
  'id' | 'rows' | 'columns' | 'uploaded' | 'description' | 'file_path' | 
  'file_size' | 'file_format' | 'source' | 'tags' | 'metadata' | 
  'is_public' | 'quality_score' | 'created_at' | 'updated_at'
> {}

@Table({
  tableName: 'datasets',
  timestamps: true,
  underscored: true,
  paranoid: false,
  indexes: [
    { fields: ['name'] },
    { fields: ['type'] },
    { fields: ['uploaded'] },
    { fields: ['is_public'] },
    { fields: ['created_at'] }
  ]
})
export class Dataset extends Model<DatasetAttributes, DatasetCreationAttributes> implements DatasetAttributes {
  /** Unique identifier for the dataset */
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  /** Name of the dataset */
  @AllowNull(false)
  @Length({ min: 1, max: 255 })
  @Column(DataType.STRING(255))
  declare name: string;

  /** Number of rows in the dataset */
  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  declare rows: number;

  /** Number of columns in the dataset */
  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  declare columns: number;

  /** Type of dataset (classification, regression, etc.) */
  @AllowNull(false)
  @Default('other')
  @Column(DataType.ENUM('classification', 'regression', 'clustering', 'time_series', 'text', 'image', 'other'))
  declare type: 'classification' | 'regression' | 'clustering' | 'time_series' | 'text' | 'image' | 'other';

  /** Upload status of the dataset */
  @AllowNull(false)
  @Default('pending')
  @Column(DataType.ENUM('pending', 'processing', 'completed', 'failed'))
  declare uploaded: 'pending' | 'processing' | 'completed' | 'failed';

  /** Optional description of the dataset */
  @AllowNull(true)
  @Column(DataType.TEXT)
  declare description?: string;

  /** File path or URL to the dataset */
  @AllowNull(true)
  @Length({ max: 500 })
  @Column(DataType.STRING(500))
  declare file_path?: string;

  /** File size in bytes */
  @AllowNull(true)
  @Column(DataType.BIGINT)
  declare file_size?: number;

  /** File format (CSV, JSON, etc.) */
  @AllowNull(true)
  @Length({ max: 50 })
  @Column(DataType.STRING(50))
  declare file_format?: string;

  /** Dataset source information */
  @AllowNull(true)
  @Length({ max: 255 })
  @Column(DataType.STRING(255))
  declare source?: string;

  /** Dataset tags for categorization */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare tags: string[];

  /** Dataset metadata */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare metadata: Record<string, any>;

  /** Whether the dataset is public */
  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  declare is_public: boolean;

  /** Dataset quality score (0-100) */
  @AllowNull(false)
  @Default(0)
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
  /** Columns belonging to this dataset */
  @HasMany(() => DatasetColumn, {
    foreignKey: 'dataset_id',
    as: 'dataset_columns',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  declare dataset_columns?: DatasetColumn[];

  /** Sample data rows for this dataset */
  @HasMany(() => SampleData, {
    foreignKey: 'dataset_id',
    as: 'sample_data',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  declare sample_data?: SampleData[];

  /** Experiments using this dataset */
  @HasMany(() => Experiment, {
    foreignKey: 'dataset_id',
    as: 'experiments',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  })
  declare experiments?: Experiment[];

  // Instance methods
  /**
   * Get column statistics for this dataset
   * @returns Promise resolving to array of column statistics
   */
  public async getColumnStats(): Promise<Array<{
    name: string;
    type: string;
    missing: number;
    unique_count: number;
  }>> {
    if (!this.dataset_columns) {
      await this.reload({ include: [DatasetColumn] });
    }
    
    return (this.dataset_columns || []).map(col => ({
      name: col.name,
      type: col.type,
      missing: col.missing || 0,
      unique_count: col.unique_count || 0
    }));
  }

  /**
   * Get sample data for this dataset
   * @param limit Maximum number of samples to return
   * @returns Promise resolving to array of sample data
   */
  public async getSampleData(limit: number = 100): Promise<SampleData[]> {
    if (!this.sample_data) {
      await this.reload({ 
        include: [{
          model: SampleData,
          limit
        }]
      });
    }
    
    return (this.sample_data || []).slice(0, limit);
  }

  /**
   * Check if dataset upload is completed
   * @returns True if upload status is completed
   */
  public isUploadCompleted(): boolean {
    return this.uploaded === 'completed';
  }

  /**
   * Calculate dataset density (non-null values / total values)
   * @returns Density percentage (0-100)
   */
  public calculateDensity(): number {
    if (this.rows === 0 || this.columns === 0) return 0;
    
    const totalValues = this.rows * this.columns;
    // This would need to be calculated based on actual missing value counts
    // For now, return a placeholder based on quality score
    return Math.min(this.quality_score, 100);
  }

  // Static methods
  /**
   * Find datasets by type
   * @param type Dataset type to filter by
   * @returns Promise resolving to array of datasets
   */
  static async findByType(type: DatasetAttributes['type']): Promise<Dataset[]> {
    return this.findAll({
      where: { type },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Find recent datasets
   * @param limit Maximum number of datasets to return
   * @returns Promise resolving to array of recent datasets
   */
  static async findRecent(limit: number = 10): Promise<Dataset[]> {
    return this.findAll({
      order: [['created_at', 'DESC']],
      limit
    });
  }

  /**
   * Find public datasets
   * @returns Promise resolving to array of public datasets
   */
  static async findPublic(): Promise<Dataset[]> {
    return this.findAll({
      where: { is_public: true },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Find datasets by upload status
   * @param status Upload status to filter by
   * @returns Promise resolving to array of datasets
   */
  static async findByStatus(status: DatasetAttributes['uploaded']): Promise<Dataset[]> {
    return this.findAll({
      where: { uploaded: status },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Get dataset type statistics
   * @returns Promise resolving to type statistics
   */
  static async getTypeStats(): Promise<Array<{ type: string; count: number }>> {
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
   * Get upload status statistics
   * @returns Promise resolving to status statistics
   */
  static async getStatusStats(): Promise<Array<{ status: string; count: number }>> {
    const results = await this.findAll({
      attributes: [
        'uploaded',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      group: ['uploaded']
    });
    
    return results.map(r => ({
      status: r.uploaded,
      count: parseInt((r as any).getDataValue('count'))
    }));
  }

  /**
   * Get average dataset size statistics
   * @returns Promise resolving to size statistics
   */
  static async getSizeStats(): Promise<{
    avg_rows: number;
    avg_columns: number;
    avg_file_size: number;
  }> {
    const result = await this.findAll({
      attributes: [
        [this.sequelize!.fn('AVG', this.sequelize!.col('rows')), 'avg_rows'],
        [this.sequelize!.fn('AVG', this.sequelize!.col('columns')), 'avg_columns'],
        [this.sequelize!.fn('AVG', this.sequelize!.col('file_size')), 'avg_file_size']
      ]
    });
    
    const stats = result[0];
    return {
      avg_rows: parseFloat((stats as any).getDataValue('avg_rows')) || 0,
      avg_columns: parseFloat((stats as any).getDataValue('avg_columns')) || 0,
      avg_file_size: parseFloat((stats as any).getDataValue('avg_file_size')) || 0
    };
  }
}

export default Dataset;
