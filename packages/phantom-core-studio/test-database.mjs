/**
 * Test script to verify database setup
 */
import { initializeCompleteDatabase } from '../src/lib/database-init';
import { query } from '../src/lib/database';

async function testDatabase() {
  try {
    console.log('🔄 Testing database setup...');
    
    // Initialize database
    await initializeCompleteDatabase();
    
    // Test datasets API
    console.log('🔄 Testing datasets table...');
    const datasets = await query('SELECT COUNT(*) as count FROM datasets');
    console.log(`✅ Found ${datasets.rows[0].count} datasets`);
    
    // Test deployments API
    console.log('🔄 Testing deployments table...');
    const deployments = await query('SELECT COUNT(*) as count FROM deployments');
    console.log(`✅ Found ${deployments.rows[0].count} deployments`);
    
    // Test models API
    console.log('🔄 Testing models table...');
    const models = await query('SELECT COUNT(*) as count FROM models');
    console.log(`✅ Found ${models.rows[0].count} models`);
    
    // Test experiments API
    console.log('🔄 Testing experiments table...');
    const experiments = await query('SELECT COUNT(*) as count FROM experiments');
    console.log(`✅ Found ${experiments.rows[0].count} experiments`);
    
    console.log('🎉 Database test completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    process.exit(1);
  }
}

testDatabase();