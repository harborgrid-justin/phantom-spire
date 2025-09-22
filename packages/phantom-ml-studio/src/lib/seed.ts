/**
 * DATABASE SEEDING UTILITIES
 * Populates database with initial data from mock data
 */
import 'server-only';
import { query, transaction } from './database';
import { initializeSchema } from './schema';

// Import mock data
import {
  mockDatasets,
  mockColumns,
  mockSampleData,
  mockDeployments,
  mockMetricsData,
  performanceData,
  threatTypes,
  recentActivities,
  mockExperiments,
  mockTrainingHistory,
  mockModels,
  mockSettings,
  mockApiKeys
} from '../services/shared/mockData';

/**
 * Seed all tables with initial data
 */
export async function seedDatabase(): Promise<void> {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Initialize schema first
    await initializeSchema();
    
    await transaction(async (client) => {
      // Clear existing data
      await clearAllData(client);
      
      // Seed datasets
      console.log('📄 Seeding datasets...');
      const datasetIds = await seedDatasets(client);
      
      // Seed dataset columns and sample data
      console.log('📊 Seeding dataset columns and sample data...');
      await seedDatasetColumns(client, datasetIds);
      await seedSampleData(client, datasetIds);
      
      // Seed deployments
      console.log('🚀 Seeding deployments...');
      const deploymentIds = await seedDeployments(client);
      
      // Seed metrics data
      console.log('📈 Seeding metrics data...');
      await seedMetricsData(client, deploymentIds);
      
      // Seed performance data
      console.log('⚡ Seeding performance data...');
      await seedPerformanceData(client);
      
      // Seed threat types
      console.log('🔒 Seeding threat types...');
      await seedThreatTypes(client);
      
      // Seed recent activities
      console.log('📋 Seeding recent activities...');
      await seedRecentActivities(client);
      
      // Seed experiments
      console.log('🧪 Seeding experiments...');
      const experimentIds = await seedExperiments(client);
      
      // Seed training history
      console.log('📚 Seeding training history...');
      await seedTrainingHistory(client, experimentIds);
      
      // Seed models
      console.log('🤖 Seeding models...');
      await seedModels(client);
      
      // Seed settings
      console.log('⚙️ Seeding settings...');
      await seedSettings(client);
      
      // Seed API keys
      console.log('🔑 Seeding API keys...');
      await seedApiKeys(client);
    });

    console.log('✅ Database seeding completed successfully');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
}

/**
 * Clear all data from tables
 */
async function clearAllData(client: any): Promise<void> {
  console.log('🧹 Clearing existing data...');
  
  const tables = [
    'training_history',
    'dataset_columns',
    'sample_data',
    'metrics_data',
    'datasets',
    'deployments',
    'performance_data',
    'threat_types',
    'recent_activities',
    'experiments',
    'models',
    'settings',
    'api_keys'
  ];

  for (const table of tables) {
    await client.query(`DELETE FROM ${table}`);
    // Reset sequence for serial columns
    await client.query(`SELECT setval(pg_get_serial_sequence('${table}', 'id'), 1, false)`);
  }
}

/**
 * Seed datasets table
 */
async function seedDatasets(client: any): Promise<number[]> {
  const insertedIds: number[] = [];
  
  for (const dataset of mockDatasets) {
    const result = await client.query(
      `INSERT INTO datasets (name, rows, columns, type, uploaded) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id`,
      [dataset.name, dataset.rows, dataset.columns, dataset.type, dataset.uploaded]
    );
    insertedIds.push(result.rows[0].id);
  }
  
  return insertedIds;
}

/**
 * Seed dataset columns
 */
async function seedDatasetColumns(client: any, datasetIds: number[]): Promise<void> {
  // Associate columns with first dataset
  const datasetId = datasetIds[0];
  
  for (const column of mockColumns) {
    await client.query(
      `INSERT INTO dataset_columns (dataset_id, name, type, missing, unique_count) 
       VALUES ($1, $2, $3, $4, $5)`,
      [datasetId, column.name, column.type, column.missing, column.unique]
    );
  }
}

/**
 * Seed sample data
 */
async function seedSampleData(client: any, datasetIds: number[]): Promise<void> {
  // Associate sample data with first dataset
  const datasetId = datasetIds[0];
  
  for (const sample of mockSampleData) {
    await client.query(
      `INSERT INTO sample_data (dataset_id, timestamp, source_ip, destination_ip, port, protocol, bytes_sent, is_threat) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        datasetId,
        new Date(sample.timestamp),
        sample.source_ip,
        sample.destination_ip,
        sample.port,
        sample.protocol,
        sample.bytes_sent,
        sample.is_threat
      ]
    );
  }
}

/**
 * Seed deployments table
 */
async function seedDeployments(client: any): Promise<number[]> {
  const insertedIds: number[] = [];
  
  for (const deployment of mockDeployments) {
    const result = await client.query(
      `INSERT INTO deployments (
        name, model_name, model_version, status, environment, endpoint, instances,
        cpu, memory, requests_per_minute, total_requests, uptime, avg_response_time,
        error_rate, deployed_at, last_updated, health, auto_scaling, min_instances, max_instances
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20) 
      RETURNING id`,
      [
        deployment.name,
        deployment.modelName,
        deployment.modelVersion,
        deployment.status,
        deployment.environment,
        deployment.endpoint,
        deployment.instances,
        deployment.cpu,
        deployment.memory,
        deployment.requestsPerMinute,
        deployment.totalRequests,
        deployment.uptime,
        deployment.avgResponseTime,
        deployment.errorRate,
        new Date(deployment.deployedAt),
        new Date(deployment.lastUpdated),
        deployment.health,
        deployment.autoScaling,
        deployment.minInstances,
        deployment.maxInstances
      ]
    );
    insertedIds.push(result.rows[0].id);
  }
  
  return insertedIds;
}

/**
 * Seed metrics data
 */
async function seedMetricsData(client: any, deploymentIds: number[]): Promise<void> {
  // Associate metrics with first deployment
  const deploymentId = deploymentIds[0];
  
  for (const metric of mockMetricsData) {
    await client.query(
      `INSERT INTO metrics_data (deployment_id, time, requests, response_time, errors) 
       VALUES ($1, $2, $3, $4, $5)`,
      [deploymentId, metric.time, metric.requests, metric.responseTime, metric.errors]
    );
  }
}

/**
 * Seed performance data
 */
async function seedPerformanceData(client: any): Promise<void> {
  for (const perf of performanceData) {
    await client.query(
      `INSERT INTO performance_data (name, value) 
       VALUES ($1, $2)`,
      [perf.name, perf.value]
    );
  }
}

/**
 * Seed threat types
 */
async function seedThreatTypes(client: any): Promise<void> {
  for (const threat of threatTypes) {
    await client.query(
      `INSERT INTO threat_types (name, count) 
       VALUES ($1, $2)`,
      [threat.name, threat.count]
    );
  }
}

/**
 * Seed recent activities
 */
async function seedRecentActivities(client: any): Promise<void> {
  for (const activity of recentActivities) {
    await client.query(
      `INSERT INTO recent_activities (user_name, action, timestamp, details) 
       VALUES ($1, $2, $3, $4)`,
      [activity.user, activity.action, new Date(activity.timestamp), activity.details]
    );
  }
}

/**
 * Seed experiments table
 */
async function seedExperiments(client: any): Promise<number[]> {
  const insertedIds: number[] = [];
  
  for (const experiment of mockExperiments) {
    const result = await client.query(
      `INSERT INTO experiments (
        name, status, accuracy, f1_score, auc, algorithm, dataset, 
        created_at, duration, hyperparameters
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
      RETURNING id`,
      [
        experiment.name,
        experiment.status,
        experiment.accuracy,
        experiment.f1Score,
        experiment.auc,
        experiment.algorithm,
        experiment.dataset,
        new Date(experiment.createdAt),
        experiment.duration,
        JSON.stringify(experiment.hyperparameters)
      ]
    );
    insertedIds.push(result.rows[0].id);
  }
  
  return insertedIds;
}

/**
 * Seed training history
 */
async function seedTrainingHistory(client: any, experimentIds: number[]): Promise<void> {
  // Associate training history with first experiment
  const experimentId = experimentIds[0];
  
  for (const history of mockTrainingHistory) {
    await client.query(
      `INSERT INTO training_history (experiment_id, epoch, training_loss, validation_loss, accuracy) 
       VALUES ($1, $2, $3, $4, $5)`,
      [experimentId, history.epoch, history.training_loss, history.validation_loss, history.accuracy]
    );
  }
}

/**
 * Seed models table
 */
async function seedModels(client: any): Promise<void> {
  for (const model of mockModels) {
    await client.query(
      `INSERT INTO models (
        name, type, algorithm, accuracy, f1_score, auc, status, version, size,
        created_at, last_trained, deployments, predictions, starred, framework,
        features, metrics, security_score, performance_score
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
      [
        model.name,
        model.type,
        model.algorithm,
        model.accuracy,
        model.f1Score,
        model.auc,
        model.status,
        model.version,
        model.size,
        new Date(model.createdAt),
        new Date(model.lastTrained),
        model.deployments,
        model.predictions,
        model.starred,
        model.framework,
        model.features,
        JSON.stringify(model.metrics),
        model.securityScore,
        model.performanceScore
      ]
    );
  }
}

/**
 * Seed settings table
 */
async function seedSettings(client: any): Promise<void> {
  // Convert settings object to key-value pairs
  for (const [key, value] of Object.entries(mockSettings)) {
    await client.query(
      `INSERT INTO settings (key, value) 
       VALUES ($1, $2)`,
      [key, JSON.stringify(value)]
    );
  }
}

/**
 * Seed API keys table
 */
async function seedApiKeys(client: any): Promise<void> {
  for (const apiKey of mockApiKeys) {
    await client.query(
      `INSERT INTO api_keys (name, key_value, created, last_used, permissions) 
       VALUES ($1, $2, $3, $4, $5)`,
      [apiKey.name, apiKey.key, apiKey.created, apiKey.lastUsed, apiKey.permissions]
    );
  }
}

/**
 * Check if database has been seeded
 */
export async function isDatabaseSeeded(): Promise<boolean> {
  try {
    const result = await query('SELECT COUNT(*) as count FROM datasets');
    return parseInt(result.rows[0].count) > 0;
  } catch (error) {
    return false;
  }
}