#!/usr/bin/env tsx
/**
 * DATABASE SYNC SCRIPT
 * Synchronizes all Sequelize models with the database
 * Creates tables, indexes, and handles schema updates
 */
import 'reflect-metadata';
import { initializeSequelizeForScript, getSequelizeForScript } from './sequelize-script';
import { models, validateModels } from '../src/lib/models';

/**
 * Sync models to database with options
 */
async function syncDatabase(options: {
  force?: boolean;
  alter?: boolean;
  seed?: boolean;
} = {}) {
  try {
    console.log('🚀 Starting database synchronization...');
    
    // Validate all models first
    console.log('🔍 Validating models...');
    validateModels();
    
    // Initialize Sequelize connection
    console.log('🔌 Connecting to database...');
    const sequelize = await initializeSequelizeForScript();
    
    // Sync models to database
    console.log('📊 Synchronizing models to database...');
    console.log(`📈 Found ${models.length} models to sync:`);
    models.forEach(model => console.log(`  - ${model.name}`));
    
    await sequelize.sync({
      force: options.force || false,
      alter: options.alter || false,
      logging: true
    });
    
    console.log('✅ Database models synchronized successfully!');
    
    // Optionally seed the database
    if (options.seed) {
      console.log('🌱 Seeding database with initial data...');
      const { seedSequelizeDatabase } = await import('../src/lib/seed-sequelize');
      await seedSequelizeDatabase();
    }
    
    // Display table information
    console.log('📋 Database schema summary:');
    const tableNames = await sequelize.getQueryInterface().showAllTables();
    console.log(`📊 Created ${tableNames.length} tables:`);
    tableNames.forEach((table: string) => console.log(`  ✓ ${table}`));
    
    console.log('🎉 Database synchronization completed successfully!');
    
  } catch (error) {
    console.error('❌ Database synchronization failed:', error);
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
    alter: args.includes('--alter'),
    seed: args.includes('--seed')
  };
  
  // Show help if requested
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
📊 Database Sync Script

Usage: npm run sync-db [options]

Options:
  --force     Drop and recreate all tables (destructive!)
  --alter     Alter existing tables to match models (safer)
  --seed      Seed database with initial data after sync
  --help, -h  Show this help message

Examples:
  npm run sync-db              # Sync without altering existing tables
  npm run sync-db --alter      # Alter tables to match models  
  npm run sync-db --seed       # Sync and seed with initial data
  npm run sync-db --force      # Drop and recreate all tables (destructive)

⚠️  Warning: --force will delete all existing data!
`);
    return;
  }
  
  // Show warning for destructive operations
  if (options.force) {
    console.log('⚠️  WARNING: --force will delete all existing data!');
    console.log('   This operation is irreversible.');
    
    // In non-CI environments, we might want to add a confirmation prompt
    if (!process.env['CI']) {
      console.log('   Make sure you have backups before proceeding.');
    }
  }
  
  try {
    await syncDatabase(options);
    process.exit(0);
  } catch (error) {
    console.error('💥 Sync failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { syncDatabase };
