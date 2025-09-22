#!/usr/bin/env tsx
/**
 * ALL WORKING MODELS SYNC SCRIPT
 * Synchronizes all working models including the ones we fixed
 */
import 'reflect-metadata';
import { Sequelize } from 'sequelize-typescript';

// Import all the working models (core + fixed foreign key models)
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

// Additional models that should work now
import { ThreatFeed } from '../src/lib/models/ThreatFeed.model';
import { ThreatIntelligence } from '../src/lib/models/ThreatIntelligence.model';
import { IOC } from '../src/lib/models/IOC.model';
import { ThreatActor } from '../src/lib/models/ThreatActor.model';
import { ThreatGroup } from '../src/lib/models/ThreatGroup.model';
import { Campaign } from '../src/lib/models/Campaign.model';
import { CVE } from '../src/lib/models/CVE.model';
import { MitreTactic } from '../src/lib/models/MitreTactic.model';
import { MitreTechnique } from '../src/lib/models/MitreTechnique.model';
import { MitreSubtechnique } from '../src/lib/models/MitreSubtechnique.model';
import { Incident } from '../src/lib/models/Incident.model';
import { Alert } from '../src/lib/models/Alert.model';

// Junction tables that should work now
import { ThreatActorTactic } from '../src/lib/models/ThreatActorTactic.model';
import { ThreatActorTechnique } from '../src/lib/models/ThreatActorTechnique.model';
import { ThreatActorCVE } from '../src/lib/models/ThreatActorCVE.model';
import { IncidentIOC } from '../src/lib/models/IncidentIOC.model';
import { IncidentCVE } from '../src/lib/models/IncidentCVE.model';

// All working models list
const workingModels = [
  // Core ML Platform Models (working)
  Dataset,
  DatasetColumn,
  SampleData,
  Experiment,
  TrainingHistory,
  MLModel,
  Deployment,
  MetricsData,
  
  // User Management & Authentication (working)
  User,
  ApiKey,
  AuditLog,
  
  // Project Management (working)
  Project,
  
  // Threat Intelligence Models (fixed foreign keys)
  ThreatFeed,
  ThreatIntelligence,
  IOC,
  ThreatActor,
  ThreatGroup,
  Campaign,
  
  // Security Models
  CVE,
  
  // MITRE ATT&CK Framework
  MitreTactic,
  MitreTechnique,
  MitreSubtechnique,
  
  // Incident Response
  Incident,
  Alert,
  
  // Junction Tables
  ThreatActorTactic,
  ThreatActorTechnique,
  ThreatActorCVE,
  IncidentIOC,
  IncidentCVE,
  
  // Phantom Analysis Models (working)
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
 * Sync all working models to database
 */
async function syncAllWorkingModels(options: {
  force?: boolean;
  alter?: boolean;
} = {}) {
  try {
    console.log('🚀 Starting all working models database synchronization...');
    
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
      models: workingModels
    });

    // Test connection
    console.log('🔌 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
    
    // Sync models
    console.log('📊 Synchronizing all working models to database...');
    console.log(`📈 Found ${workingModels.length} working models to sync:`);
    workingModels.forEach(model => console.log(`  - ${model.name}`));
    
    await sequelize.sync({
      force: options.force || false,
      alter: options.alter || false,
      logging: true
    });
    
    console.log('✅ All working models synchronized successfully!');
    
    // Display table information
    console.log('📋 Database schema summary:');
    const tableNames = await sequelize.getQueryInterface().showAllTables();
    console.log(`📊 Created ${tableNames.length} tables:`);
    tableNames.forEach((table: string) => console.log(`  ✓ ${table}`));
    
    await sequelize.close();
    console.log('🎉 All working models synchronization completed successfully!');
    
  } catch (error) {
    console.error('❌ All working models synchronization failed:', error);
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
📊 All Working Models Sync Script

Usage: tsx scripts/sync-all-working-models.ts [options]

Options:
  --force     Drop and recreate all tables (destructive!)
  --alter     Alter existing tables to match models (safer)
  --help, -h  Show this help message

This script syncs ${workingModels.length} working models including:
- Core ML Platform Models (8)
- User Management & Authentication (3)
- Project Management (1)
- Threat Intelligence Models (6) - with fixed foreign keys
- Security Models (1)
- MITRE ATT&CK Framework (3)
- Incident Response (2)
- Junction Tables (5)
- Phantom Analysis Models (2)

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
    await syncAllWorkingModels(options);
    process.exit(0);
  } catch (error) {
    console.error('💥 All working models sync failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { syncAllWorkingModels };
