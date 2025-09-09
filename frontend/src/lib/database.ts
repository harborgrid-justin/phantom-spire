// Database configuration for Sequelize
import { Sequelize } from 'sequelize';
import { IOCModel } from './models/ioc';
import { AnalysisResultModel } from './models/analysis-result';
import { ThreatActorModel } from './models/threat-actor';
import { MalwareFamilyModel } from './models/malware-family';
import { CampaignModel } from './models/campaign';

const sequelize = new Sequelize('postgresql://neondb_owner:npg_yPdfhxv7YbO8@ep-ancient-dream-ad9479e7-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require', {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Initialize models
const models = {
  IOC: IOCModel(sequelize),
  AnalysisResult: AnalysisResultModel(sequelize),
  ThreatActor: ThreatActorModel(sequelize),
  MalwareFamily: MalwareFamilyModel(sequelize),
  Campaign: CampaignModel(sequelize)
};

// Define associations
Object.keys(models).forEach((modelName: string) => {
  const model = models[modelName as keyof typeof models];
  if (model && typeof model.associate === 'function') {
    model.associate(models);
  }
});

export { sequelize, models };
export default sequelize;
