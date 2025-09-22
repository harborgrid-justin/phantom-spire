/**
 * SAMPLE DATA SEQUELIZE MODEL
 * Represents sample data records from datasets
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
  BelongsTo,
  ForeignKey,
  DataType
} from 'sequelize-typescript';
import { Dataset } from './Dataset.model';

@Table({
  tableName: 'sample_data',
  timestamps: true,
  underscored: true
})
export class SampleData extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => Dataset)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare dataset_id: number;

  @Column(DataType.DATE)
  declare timestamp: Date;

  @Column(DataType.STRING(50))
  declare source_ip: string;

  @Column(DataType.STRING(50))
  declare destination_ip: string;

  @Column(DataType.INTEGER)
  declare port: number;

  @Column(DataType.STRING(20))
  declare protocol: string;

  @Column(DataType.INTEGER)
  declare bytes_sent: number;

  @Default(false)
  @Column(DataType.BOOLEAN)
  declare is_threat: boolean;

  @CreatedAt
  @Column(DataType.DATE)
  declare created_at: Date;

  // Associations
  @BelongsTo(() => Dataset)
  declare dataset: Dataset;

  // Static methods
  static async findByDataset(datasetId: number, limit: number = 100) {
    return this.findAll({
      where: { dataset_id: datasetId },
      limit,
      order: [['created_at', 'DESC']]
    });
  }

  static async getThreatStats(datasetId?: number) {
    const whereClause = datasetId ? { dataset_id: datasetId } : {};
    
    const results = await this.findAll({
      attributes: [
        'is_threat',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      where: whereClause,
      group: ['is_threat']
    });
    
    return results.map(r => ({
      is_threat: r.is_threat,
      count: (r as any).getDataValue('count')
    }));
  }

  static async getProtocolDistribution(datasetId?: number) {
    const whereClause = datasetId ? { dataset_id: datasetId } : {};
    
    const results = await this.findAll({
      attributes: [
        'protocol',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      where: whereClause,
      group: ['protocol']
    });
    
    return results.map(r => ({
      protocol: r.protocol,
      count: (r as any).getDataValue('count')
    }));
  }
}
