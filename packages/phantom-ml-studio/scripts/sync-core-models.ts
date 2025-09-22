#!/usr/bin/env tsx
/**
 * CORE MODELS SYNC SCRIPT
 * Synchronizes only the core working models with the database
 * Bypasses problematic models with foreign key issues
 */
import 'reflect-metadata';
import { Sequelize } from 'sequelize-typescript';

// Import only the working core models
import { Dataset } from '../src/lib/models/Dataset.model';
import { DatasetColumn } from '../src/lib/models/DatasetColumn.model';
import { SampleData } from '../src/lib/models/SampleData.model';
import { Experiment } from '../src/lib/models/Experiment.model';
import { TrainingHistory } from '../src/lib/models/TrainingHistory.model';
import { MLModel } from '../src/lib/models/Model.model';
import { Deployment } from '../src/lib/models/Deployment.model';
import { MetricsData } from '../src/lib/models/MetricsData.model';
import { User } from '../src/lib/models/User.model';
import { ApiKey } from '../src/lib/models/ApiKey.model';
import { AuditLog } from '../src/lib/models/AuditLog.model';
import { Project } from '../src/lib/models/Project.model';
import { ThreatVector } from '../src/lib/models/ThreatVector.model';
import { ThreatTrend } from '../src/lib/models/ThreatTrend.model';

// Core working models list
const coreModels = [
  Dataset,
  DatasetColumn,
  SampleData,
  Experiment,
  TrainingHistory,
  MLModel,
  Deployment,
  MetricsData,
  User,
  ApiKey,
  AuditLog,
  Project,
  ThreatVector,
  ThreatTrend
];

/**
 * Get database configuration from environment
 */
function getDatabaseConfig() {
  const connectionString = process.env['DATABASE_URL'] || 
    "postgresql://neondb_owner:npg_yPdfhxv7YbO8@ep-ancient-dream-ad9479e7-pooler.c-2.us-east-1.aws.neon.tech/pilot?sslmode=require&channel_binding=require";

  try {
    const parsed = new URL(connectionString);
    return {
      host: parsed.hostname,
      port: parseInt(parsed.port) || 5432,
      database: parsed.pathname.slice(1),
      username: parsed.username,
      password: parsed.password,
      ssl: parsed.searchParams.get('sslmode') === 'require'
    };
  } catch (error) {
    throw new Error(`Invalid DATABASE_URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Sync core models to database
 */
async function syncCoreModels(options: {
  force?: boolean;
  alter?: boolean;
} = {}) {
  try {
    console.log('🚀 Starting core models database synchronization...');
    
    const config = getDatabaseConfig();

    const sequelize = new Sequelize({
      host: config.host,
      port: config.port,
      database: config.database,
      username: config.username,
      password: config.password,
      dialect: 'postgres',
      dialectOptions: {
        ssl: config.ssl ? {
          require: true,
          rejectUnauthorized: false
        } : false
      },
      pool: {
        max: 20,
        min: 5,
        acquire: 30000,
        idle: 10000
      },
      logging: console.log,
      define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true
      },
      models: coreModels
    });

    // Test connection
    console.log('🔌 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
    
    // Sync models
    console.log('📊 Synchronizing core models to database...');
    console.log(`📈 Found ${coreModels.length} core models to sync:`);
    coreModels.forEach(model => console.log(`  - ${model.name}`));
    
    await sequelize.sync({
      force: options.force || false,
      alter: options.alter || false,
      logging: true
    });
    
    console.log('✅ Core models synchronized successfully!');
    
    // Display table information
    console.log('📋 Database schema summary:');
    const tableNames = await sequelize.getQueryInterface().showAllTables();
    console.log(`📊 Created ${tableNames.length} tables:`);
    tableNames.forEach((table: string) => console.log(`  ✓ ${table}`));
    
    await sequelize.close();
    console.log('🎉 Core models synchronization completed successfully!');
    
  } catch (error) {
    console.error('❌ Core models synchronization failed:', error);
    throw error;
  }
}

/**
 * Main execution function
 */
async function main() {
  const args = process.argv.slice(2);
  
  const options = {
    force: args.includes('--force'),
    alter: args.includes('--alter')
  };
  
  // Show help if requested
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
📊 Core Models Sync Script

Usage: npm run sync-core [options]

Options:
  --force     Drop and recreate all tables (destructive!)
  --alter     Alter existing tables to match models (safer)
  --help, -h  Show this help message

This script syncs only the core working models:
- Dataset, DatasetColumn, SampleData
- Experiment, TrainingHistory  
- MLModel, Deployment, MetricsData
- User, ApiKey, AuditLog, Project
- ThreatVector, ThreatTrend

⚠️  Warning: --force will delete all existing data!
`);
    return;
  }
  
  // Show warning for destructive operations
  if (options.force) {
    console.log('⚠️  WARNING: --force will delete all existing data!');
    console.log('   This operation is irreversible.');
  }
  
  try {
    await syncCoreModels(options);
    process.exit(0);
  } catch (error) {
    console.error('💥 Core sync failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { syncCoreModels };
