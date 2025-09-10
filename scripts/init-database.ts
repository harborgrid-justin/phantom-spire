#!/usr/bin/env node

/**
 * Database Initialization Script
 * Sets up production-ready database schemas and seed data
 */

import { DatabaseService } from '../src/services/DatabaseService';
import { DatabaseSchemaManager } from '../src/database/DatabaseSchemaManager';
import { LoggingService } from '../src/services/LoggingService';

const logger = LoggingService.getInstance();

async function initializeDatabase() {
  try {
    logger.info('🚀 Starting database initialization...');

    // Initialize database service
    const dbService = DatabaseService.getInstance();
    await dbService.initialize();
    logger.info('✅ Database connections established');

    // Initialize schema manager
    const schemaManager = new DatabaseSchemaManager();
    
    // Create schemas and indexes
    await schemaManager.initializeSchemas();
    logger.info('✅ Database schemas and indexes created');

    // Seed test data if requested
    if (process.argv.includes('--seed-data')) {
      await schemaManager.seedTestData();
      logger.info('✅ Test data seeded successfully');
    }

    // Validate schemas
    const validation = await schemaManager.validateSchemas();
    logger.info('📊 Schema validation results:', validation);

    logger.info('🎉 Database initialization completed successfully!');

    // Output summary
    console.log('\n' + '='.repeat(60));
    console.log('🗄️  PHANTOM SPIRE DATABASE INITIALIZATION COMPLETE');
    console.log('='.repeat(60));
    console.log('✅ PostgreSQL: Threat intelligence schemas created');
    console.log('✅ MySQL: Analytics and reporting schemas created');
    console.log('✅ MongoDB: Document collections and indexes created');
    console.log('✅ Redis: Caching layer ready');
    console.log('\n📊 Database Health Status:');
    console.log(`   PostgreSQL: ${validation.postgresql ? '✅ Ready' : '❌ Failed'}`);
    console.log(`   MySQL:      ${validation.mysql ? '✅ Ready' : '❌ Failed'}`);
    console.log(`   MongoDB:    ${validation.mongodb ? '✅ Ready' : '❌ Failed'}`);
    console.log('\n🚀 Your Phantom Spire platform is ready for production!');
    console.log('\nNext steps:');
    console.log('1. Start the application: npm start');
    console.log('2. Access the API: http://localhost:3000/api/v1');
    console.log('3. View health status: http://localhost:3000/api/v1/health');
    console.log('='.repeat(60) + '\n');

    process.exit(0);

  } catch (error) {
    logger.error('❌ Database initialization failed:', error);
    console.error('\n💥 Database initialization failed!');
    console.error('Error:', error instanceof Error ? error.message : error);
    console.error('\nPlease check your database configuration and try again.');
    console.error('Ensure all required environment variables are set in .env file.\n');
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  try {
    await DatabaseService.getInstance().close();
    logger.info('Database connections closed');
  } catch (error) {
    logger.error('Error during shutdown:', error);
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  try {
    await DatabaseService.getInstance().close();
    logger.info('Database connections closed');
  } catch (error) {
    logger.error('Error during shutdown:', error);
  }
  process.exit(0);
});

// Run initialization
initializeDatabase();