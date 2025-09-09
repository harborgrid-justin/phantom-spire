import { Sequelize, DataTypes, Model } from 'sequelize';

const sequelize = new Sequelize('postgresql://neondb_owner:npg_yPdfhxv7YbO8@ep-ancient-dream-ad9479e7-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

export class IOC extends Model {
  public id!: string;
  public indicator_type!: string;
  public value!: string;
  public confidence!: number;
  public severity!: string;
  public source!: string;
  public timestamp!: Date;
  public tags!: string[];
  public context!: object;
  public analysis!: object;
}

IOC.init({
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  indicator_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  value: {
    type: DataTypes.STRING,
    allowNull: false
  },
  confidence: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  severity: {
    type: DataTypes.STRING,
    allowNull: false
  },
  source: {
    type: DataTypes.STRING,
    allowNull: false
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false
  },
  context: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  analysis: {
    type: DataTypes.JSONB,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'IOC',
  tableName: 'iocs',
  timestamps: false
});

export default sequelize;
