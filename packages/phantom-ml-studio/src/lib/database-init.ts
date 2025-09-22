/**
 * DATABASE INITIALIZATION SCRIPT
 * Sets up and seeds the PostgreSQL database for phantom-ml-studio
 */
import { initializeDatabase } from './database';
import { initializeSchema } from './schema';
import { seedDatabase, isDatabaseSeeded } from './seed';

/**
 * Initialize the complete database setup
 */
export async function initializeCompleteDatabase(): Promise<void> {
  try {
    console.log('🚀 Starting database initialization...');
    
    // 1. Initialize database connection
    console.log('🔄 Initializing database connection...');
    await initializeDatabase();
    
    // 2. Initialize schema (create tables)
    console.log('🔄 Initializing database schema...');
    await initializeSchema();
    
    // 3. Check if already seeded
    const isSeeded = await isDatabaseSeeded();
    if (isSeeded) {
      console.log('ℹ️ Database is already seeded. Skipping seeding step.');
      console.log('✅ Database initialization completed (already seeded)');
      return;
    }
    
    // 4. Seed database with initial data
    console.log('🔄 Seeding database with initial data...');
    await seedDatabase();
    
    console.log('🎉 Database initialization completed successfully!');
    console.log('');
    console.log('Database setup summary:');
    console.log('✅ Database connection established');
    console.log('✅ Schema created with all required tables');
    console.log('✅ Database seeded with mock data');
    console.log('✅ Ready to serve API requests');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

/**
 * Force re-seed the database (clear and re-populate)
 */
export async function reinitializeDatabase(): Promise<void> {
  try {
    console.log('🔄 Force re-initializing database...');
    
    // Initialize connection and schema
    await initializeDatabase();
    await initializeSchema();
    
    // Force re-seed (this will clear existing data)
    console.log('🌱 Force re-seeding database...');
    await seedDatabase();
    
    console.log('✅ Database re-initialization completed successfully!');
  } catch (error) {
    console.error('❌ Database re-initialization failed:', error);
    throw error;
  }
}

// Run initialization if called directly
if (require.main === module) {
  initializeCompleteDatabase()
    .then(() => {
      console.log('🎉 Database setup complete! Exiting...');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Database setup failed:', error);
      process.exit(1);
    });
}