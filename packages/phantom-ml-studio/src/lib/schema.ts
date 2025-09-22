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

  -- MITRE ATT&CK Framework Tables
  -- Tactics table
  CREATE TABLE IF NOT EXISTS mitre_tactics (
    id SERIAL PRIMARY KEY,
    mitre_id VARCHAR(20) NOT NULL UNIQUE, -- e.g., "TA0001"
    name VARCHAR(255) NOT NULL,
    description TEXT,
    short_name VARCHAR(100),
    url VARCHAR(500),
    version VARCHAR(50),
    stix_id VARCHAR(100),
    created_date TIMESTAMP,
    modified_date TIMESTAMP,
    platforms TEXT[], -- PostgreSQL array type
    kill_chain_phases JSONB DEFAULT '[]',
    external_references JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );

  -- Techniques table
  CREATE TABLE IF NOT EXISTS mitre_techniques (
    id SERIAL PRIMARY KEY,
    mitre_id VARCHAR(20) NOT NULL UNIQUE, -- e.g., "T1566", "T1566.001"
    name VARCHAR(500) NOT NULL,
    description TEXT,
    url VARCHAR(500),
    version VARCHAR(50),
    stix_id VARCHAR(100),
    created_date TIMESTAMP,
    modified_date TIMESTAMP,
    parent_technique VARCHAR(20), -- For sub-techniques
    is_sub_technique BOOLEAN DEFAULT FALSE,
    tactics TEXT[], -- Array of tactic IDs
    platforms TEXT[], -- Array of platforms
    data_sources TEXT[], -- Array of data sources
    defenses TEXT[],
    permissions TEXT[],
    system_requirements TEXT[],
    network_requirements TEXT[],
    remote_support BOOLEAN DEFAULT FALSE,
    detection TEXT,
    kill_chain_phases JSONB DEFAULT '[]',
    external_references JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );

  -- Groups (Threat Actors/APTs) table
  CREATE TABLE IF NOT EXISTS mitre_groups (
    id SERIAL PRIMARY KEY,
    mitre_id VARCHAR(20) NOT NULL UNIQUE, -- e.g., "G0001"
    name VARCHAR(255) NOT NULL,
    description TEXT,
    aliases TEXT[], -- Array of known aliases
    url VARCHAR(500),
    version VARCHAR(50),
    stix_id VARCHAR(100),
    created_date TIMESTAMP,
    modified_date TIMESTAMP,
    associated_groups TEXT[],
    techniques_used TEXT[], -- Array of technique IDs
    software_used TEXT[], -- Array of software IDs
    external_references JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );

  -- Software (Malware/Tools) table
  CREATE TABLE IF NOT EXISTS mitre_software (
    id SERIAL PRIMARY KEY,
    mitre_id VARCHAR(20) NOT NULL UNIQUE, -- e.g., "S0001"
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50), -- 'malware' or 'tool'
    labels TEXT[],
    aliases TEXT[],
    url VARCHAR(500),
    version VARCHAR(50),
    stix_id VARCHAR(100),
    created_date TIMESTAMP,
    modified_date TIMESTAMP,
    platforms TEXT[],
    techniques_used TEXT[], -- Array of technique IDs
    groups_using TEXT[], -- Array of group IDs
    external_references JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );

  -- Mitigations table
  CREATE TABLE IF NOT EXISTS mitre_mitigations (
    id SERIAL PRIMARY KEY,
    mitre_id VARCHAR(20) NOT NULL UNIQUE, -- e.g., "M1001"
    name VARCHAR(255) NOT NULL,
    description TEXT,
    url VARCHAR(500),
    version VARCHAR(50),
    stix_id VARCHAR(100),
    created_date TIMESTAMP,
    modified_date TIMESTAMP,
    techniques_addressed TEXT[], -- Array of technique IDs
    external_references JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );

  -- Data Sources table
  CREATE TABLE IF NOT EXISTS mitre_data_sources (
    id SERIAL PRIMARY KEY,
    mitre_id VARCHAR(20) NOT NULL UNIQUE, -- e.g., "DS0001"
    name VARCHAR(255) NOT NULL,
    description TEXT,
    url VARCHAR(500),
    version VARCHAR(50),
    stix_id VARCHAR(100),
    created_date TIMESTAMP,
    modified_date TIMESTAMP,
    data_components TEXT[],
    techniques_detected TEXT[], -- Array of technique IDs
    platforms TEXT[],
    collection_layers TEXT[],
    external_references JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );

  -- MITRE Relationships table (for complex relationships between entities)
  CREATE TABLE IF NOT EXISTS mitre_relationships (
    id SERIAL PRIMARY KEY,
    relationship_type VARCHAR(100) NOT NULL, -- 'uses', 'mitigates', 'detects', etc.
    source_type VARCHAR(50) NOT NULL, -- 'technique', 'group', 'software', etc.
    source_id VARCHAR(20) NOT NULL, -- MITRE ID of source
    target_type VARCHAR(50) NOT NULL,
    target_id VARCHAR(20) NOT NULL, -- MITRE ID of target
    description TEXT,
    stix_id VARCHAR(100),
    created_date TIMESTAMP,
    modified_date TIMESTAMP,
    external_references JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
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
  
  -- MITRE indexes for performance
  CREATE INDEX IF NOT EXISTS idx_mitre_tactics_mitre_id ON mitre_tactics(mitre_id);
  CREATE INDEX IF NOT EXISTS idx_mitre_tactics_name ON mitre_tactics(name);
  CREATE INDEX IF NOT EXISTS idx_mitre_techniques_mitre_id ON mitre_techniques(mitre_id);
  CREATE INDEX IF NOT EXISTS idx_mitre_techniques_name ON mitre_techniques(name);
  CREATE INDEX IF NOT EXISTS idx_mitre_techniques_parent ON mitre_techniques(parent_technique);
  CREATE INDEX IF NOT EXISTS idx_mitre_techniques_is_sub ON mitre_techniques(is_sub_technique);
  CREATE INDEX IF NOT EXISTS idx_mitre_techniques_tactics ON mitre_techniques USING GIN(tactics);
  CREATE INDEX IF NOT EXISTS idx_mitre_techniques_platforms ON mitre_techniques USING GIN(platforms);
  CREATE INDEX IF NOT EXISTS idx_mitre_groups_mitre_id ON mitre_groups(mitre_id);
  CREATE INDEX IF NOT EXISTS idx_mitre_groups_name ON mitre_groups(name);
  CREATE INDEX IF NOT EXISTS idx_mitre_software_mitre_id ON mitre_software(mitre_id);
  CREATE INDEX IF NOT EXISTS idx_mitre_software_name ON mitre_software(name);
  CREATE INDEX IF NOT EXISTS idx_mitre_software_type ON mitre_software(type);
  CREATE INDEX IF NOT EXISTS idx_mitre_mitigations_mitre_id ON mitre_mitigations(mitre_id);
  CREATE INDEX IF NOT EXISTS idx_mitre_mitigations_name ON mitre_mitigations(name);
  CREATE INDEX IF NOT EXISTS idx_mitre_data_sources_mitre_id ON mitre_data_sources(mitre_id);
  CREATE INDEX IF NOT EXISTS idx_mitre_data_sources_name ON mitre_data_sources(name);
  CREATE INDEX IF NOT EXISTS idx_mitre_relationships_type ON mitre_relationships(relationship_type);
  CREATE INDEX IF NOT EXISTS idx_mitre_relationships_source ON mitre_relationships(source_type, source_id);
  CREATE INDEX IF NOT EXISTS idx_mitre_relationships_target ON mitre_relationships(target_type, target_id);
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
      DROP TABLE IF EXISTS mitre_relationships CASCADE;
      DROP TABLE IF EXISTS mitre_data_sources CASCADE;
      DROP TABLE IF EXISTS mitre_mitigations CASCADE;
      DROP TABLE IF EXISTS mitre_software CASCADE;
      DROP TABLE IF EXISTS mitre_groups CASCADE;
      DROP TABLE IF EXISTS mitre_techniques CASCADE;
      DROP TABLE IF EXISTS mitre_tactics CASCADE;
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
      AND table_name IN ('datasets', 'deployments', 'experiments', 'models', 'mitre_tactics', 'mitre_techniques')
    `);
    
    return result.rows.length >= 6;
  } catch (error) {
    console.error('❌ Failed to check table existence:', error);
    return false;
  }
}