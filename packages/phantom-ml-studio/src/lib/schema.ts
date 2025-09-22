/**
 * DATABASE SCHEMA INITIALIZATION
 * Creates tables for phantom-ml-studio data
 */
import 'server-only';
import { query, transaction } from './database';

/**
 * Database schema SQL statements
 */
const CREATE_TABLES_SQL = `
  -- Datasets table
  CREATE TABLE IF NOT EXISTS datasets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    rows INTEGER NOT NULL DEFAULT 0,
    columns INTEGER NOT NULL DEFAULT 0,
    type VARCHAR(100) NOT NULL,
    uploaded VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );

  -- Dataset columns table
  CREATE TABLE IF NOT EXISTS dataset_columns (
    id SERIAL PRIMARY KEY,
    dataset_id INTEGER REFERENCES datasets(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    missing INTEGER DEFAULT 0,
    unique_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
  );

  -- Sample data table
  CREATE TABLE IF NOT EXISTS sample_data (
    id SERIAL PRIMARY KEY,
    dataset_id INTEGER REFERENCES datasets(id) ON DELETE CASCADE,
    timestamp TIMESTAMP,
    source_ip VARCHAR(50),
    destination_ip VARCHAR(50),
    port INTEGER,
    protocol VARCHAR(20),
    bytes_sent INTEGER,
    is_threat BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
  );

  -- Deployments table
  CREATE TABLE IF NOT EXISTS deployments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    model_name VARCHAR(255) NOT NULL,
    model_version VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'stopped',
    environment VARCHAR(50) NOT NULL DEFAULT 'development',
    endpoint VARCHAR(500),
    instances INTEGER DEFAULT 0,
    cpu FLOAT DEFAULT 0,
    memory FLOAT DEFAULT 0,
    requests_per_minute INTEGER DEFAULT 0,
    total_requests INTEGER DEFAULT 0,
    uptime VARCHAR(20) DEFAULT '0%',
    avg_response_time INTEGER DEFAULT 0,
    error_rate FLOAT DEFAULT 0,
    deployed_at TIMESTAMP,
    last_updated TIMESTAMP DEFAULT NOW(),
    health VARCHAR(20) DEFAULT 'stopped',
    auto_scaling BOOLEAN DEFAULT FALSE,
    min_instances INTEGER DEFAULT 1,
    max_instances INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );

  -- Metrics data table
  CREATE TABLE IF NOT EXISTS metrics_data (
    id SERIAL PRIMARY KEY,
    deployment_id INTEGER REFERENCES deployments(id) ON DELETE CASCADE,
    time VARCHAR(10) NOT NULL,
    requests INTEGER DEFAULT 0,
    response_time INTEGER DEFAULT 0,
    errors INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
  );

  -- Performance data table
  CREATE TABLE IF NOT EXISTS performance_data (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    value FLOAT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  );

  -- Threat types table
  CREATE TABLE IF NOT EXISTS threat_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );

  -- Recent activities table
  CREATE TABLE IF NOT EXISTS recent_activities (
    id SERIAL PRIMARY KEY,
    user_name VARCHAR(255) NOT NULL,
    action VARCHAR(500) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    details TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  );

  -- Experiments table
  CREATE TABLE IF NOT EXISTS experiments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled',
    accuracy FLOAT DEFAULT 0,
    f1_score FLOAT DEFAULT 0,
    auc FLOAT DEFAULT 0,
    algorithm VARCHAR(100) NOT NULL,
    dataset VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    duration VARCHAR(100),
    hyperparameters JSONB,
    updated_at TIMESTAMP DEFAULT NOW()
  );

  -- Training history table
  CREATE TABLE IF NOT EXISTS training_history (
    id SERIAL PRIMARY KEY,
    experiment_id INTEGER REFERENCES experiments(id) ON DELETE CASCADE,
    epoch INTEGER NOT NULL,
    training_loss FLOAT NOT NULL,
    validation_loss FLOAT NOT NULL,
    accuracy FLOAT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  );

  -- Models table
  CREATE TABLE IF NOT EXISTS models (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    algorithm VARCHAR(100) NOT NULL,
    accuracy FLOAT DEFAULT 0,
    f1_score FLOAT DEFAULT 0,
    auc FLOAT DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'Development',
    version VARCHAR(50) NOT NULL DEFAULT '1.0.0',
    size VARCHAR(20) NOT NULL DEFAULT '0 MB',
    created_at TIMESTAMP DEFAULT NOW(),
    last_trained TIMESTAMP DEFAULT NOW(),
    deployments INTEGER DEFAULT 0,
    predictions INTEGER DEFAULT 0,
    starred BOOLEAN DEFAULT FALSE,
    framework VARCHAR(100) DEFAULT 'phantom-ml-core',
    features TEXT[],
    metrics JSONB,
    security_score INTEGER DEFAULT 0,
    performance_score INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT NOW()
  );

  -- Settings table
  CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );

  -- API keys table
  CREATE TABLE IF NOT EXISTS api_keys (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    key_value VARCHAR(255) NOT NULL,
    created VARCHAR(50) NOT NULL,
    last_used VARCHAR(100) DEFAULT 'Never',
    permissions TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );

  -- Create indexes for better performance
  CREATE INDEX IF NOT EXISTS idx_datasets_type ON datasets(type);
  CREATE INDEX IF NOT EXISTS idx_deployments_status ON deployments(status);
  CREATE INDEX IF NOT EXISTS idx_deployments_environment ON deployments(environment);
  CREATE INDEX IF NOT EXISTS idx_experiments_status ON experiments(status);
  CREATE INDEX IF NOT EXISTS idx_models_status ON models(status);
  CREATE INDEX IF NOT EXISTS idx_models_starred ON models(starred);
  CREATE INDEX IF NOT EXISTS idx_recent_activities_timestamp ON recent_activities(timestamp);
  CREATE INDEX IF NOT EXISTS idx_sample_data_dataset_id ON sample_data(dataset_id);
  CREATE INDEX IF NOT EXISTS idx_metrics_data_deployment_id ON metrics_data(deployment_id);
  CREATE INDEX IF NOT EXISTS idx_training_history_experiment_id ON training_history(experiment_id);
`;

/**
 * Initialize database schema
 */
export async function initializeSchema(): Promise<void> {
  try {
    console.log('🔄 Creating database tables...');
    
    await transaction(async (client) => {
      // Split SQL statements and execute each one
      const statements = CREATE_TABLES_SQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);

      for (const statement of statements) {
        await client.query(statement);
      }
    });

    console.log('✅ Database schema initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize database schema:', error);
    throw error;
  }
}

/**
 * Drop all tables (for testing/reset)
 */
export async function dropAllTables(): Promise<void> {
  try {
    console.log('🔄 Dropping all tables...');
    
    const dropSQL = `
      DROP TABLE IF EXISTS training_history CASCADE;
      DROP TABLE IF EXISTS dataset_columns CASCADE;
      DROP TABLE IF EXISTS sample_data CASCADE;
      DROP TABLE IF EXISTS metrics_data CASCADE;
      DROP TABLE IF EXISTS datasets CASCADE;
      DROP TABLE IF EXISTS deployments CASCADE;
      DROP TABLE IF EXISTS performance_data CASCADE;
      DROP TABLE IF EXISTS threat_types CASCADE;
      DROP TABLE IF EXISTS recent_activities CASCADE;
      DROP TABLE IF EXISTS experiments CASCADE;
      DROP TABLE IF EXISTS models CASCADE;
      DROP TABLE IF EXISTS settings CASCADE;
      DROP TABLE IF EXISTS api_keys CASCADE;
    `;

    await query(dropSQL);
    console.log('✅ All tables dropped successfully');
  } catch (error) {
    console.error('❌ Failed to drop tables:', error);
    throw error;
  }
}

/**
 * Check if tables exist
 */
export async function tablesExist(): Promise<boolean> {
  try {
    const result = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('datasets', 'deployments', 'experiments', 'models')
    `);
    
    return result.rows.length >= 4;
  } catch (error) {
    console.error('❌ Failed to check table existence:', error);
    return false;
  }
}