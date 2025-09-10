/**
 * Database Schema Initialization
 * Creates production-ready database schemas for multi-database architecture
 */

import { DatabaseService } from '../services/DatabaseService';
import { LoggingService } from '../services/LoggingService';

const logger = LoggingService.getInstance();

export class DatabaseSchemaManager {
  private dbService: DatabaseService;

  constructor() {
    this.dbService = DatabaseService.getInstance();
  }

  async initializeSchemas(): Promise<void> {
    try {
      logger.info('Starting database schema initialization...');
      
      await Promise.all([
        this.initializePostgreSQLSchemas(),
        this.initializeMySQLSchemas(),
        this.initializeMongoDBIndexes()
      ]);
      
      logger.info('Database schema initialization completed successfully');
    } catch (error) {
      logger.error('Database schema initialization failed:', error);
      throw error;
    }
  }

  private async initializePostgreSQLSchemas(): Promise<void> {
    const client = await (this.dbService as any).postgresPool?.connect();
    if (!client) {
      logger.warn('PostgreSQL not available, skipping schema initialization');
      return;
    }

    try {
      // Create schemas
      await client.query(`CREATE SCHEMA IF NOT EXISTS threat_intelligence`);
      await client.query(`CREATE SCHEMA IF NOT EXISTS workflow_engine`);
      await client.query(`CREATE SCHEMA IF NOT EXISTS system_monitoring`);
      await client.query(`CREATE SCHEMA IF NOT EXISTS evidence_management`);

      // CVE Analysis table
      await client.query(`
        CREATE TABLE IF NOT EXISTS threat_intelligence.cve_analyses (
          cve_id VARCHAR(50) PRIMARY KEY,
          risk_level VARCHAR(20) NOT NULL,
          exploitability DECIMAL(3,2),
          impact_score DECIMAL(3,2),
          confidence_score DECIMAL(3,2),
          exploit_available BOOLEAN DEFAULT FALSE,
          in_the_wild BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Threat Actors table
      await client.query(`
        CREATE TABLE IF NOT EXISTS threat_intelligence.threat_actors (
          actor_id VARCHAR(50) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          actor_type VARCHAR(50),
          sophistication_level VARCHAR(50),
          confidence_score DECIMAL(3,2),
          origin_country VARCHAR(100),
          first_observed TIMESTAMP,
          last_activity TIMESTAMP,
          status VARCHAR(20) DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Remediation Strategies table
      await client.query(`
        CREATE TABLE IF NOT EXISTS workflow_engine.remediation_strategies (
          cve_id VARCHAR(50) PRIMARY KEY,
          priority VARCHAR(20) NOT NULL,
          estimated_hours INTEGER,
          complexity VARCHAR(20),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create indexes for performance
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_cve_risk_level ON threat_intelligence.cve_analyses(risk_level);
        CREATE INDEX IF NOT EXISTS idx_cve_exploit_available ON threat_intelligence.cve_analyses(exploit_available);
        CREATE INDEX IF NOT EXISTS idx_threat_actors_type ON threat_intelligence.threat_actors(actor_type);
        CREATE INDEX IF NOT EXISTS idx_threat_actors_activity ON threat_intelligence.threat_actors(last_activity);
      `);

      logger.info('PostgreSQL schemas initialized successfully');
    } finally {
      client.release();
    }
  }

  private async initializeMySQLSchemas(): Promise<void> {
    const connection = (this.dbService as any).mysqlConnection;
    if (!connection) {
      logger.warn('MySQL not available, skipping schema initialization');
      return;
    }

    try {
      // Create database if not exists
      await connection.execute('CREATE DATABASE IF NOT EXISTS phantom_spire');
      await connection.execute('USE phantom_spire');

      // Threat Feeds Analytics table
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS threat_feeds (
          id INT AUTO_INCREMENT PRIMARY KEY,
          feed_name VARCHAR(255) NOT NULL,
          feed_type VARCHAR(100),
          reliability_score DECIMAL(3,2),
          last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          records_count INT DEFAULT 0,
          status ENUM('active', 'inactive', 'error') DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_feed_name (feed_name),
          INDEX idx_feed_status (status)
        )
      `);

      // Analytics Reports table
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS analytics_reports (
          id INT AUTO_INCREMENT PRIMARY KEY,
          report_type VARCHAR(100) NOT NULL,
          report_name VARCHAR(255) NOT NULL,
          parameters JSON,
          results JSON,
          generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          generated_by VARCHAR(100),
          execution_time_ms INT,
          INDEX idx_report_type (report_type),
          INDEX idx_generated_at (generated_at)
        )
      `);

      logger.info('MySQL schemas initialized successfully');
    } catch (error) {
      logger.error('MySQL schema initialization failed:', error);
      throw error;
    }
  }

  private async initializeMongoDBIndexes(): Promise<void> {
    const mongodb = (this.dbService as any).mongodb;
    if (!mongodb) {
      logger.warn('MongoDB not available, skipping index initialization');
      return;
    }

    try {
      // CVE Analyses collection indexes
      await mongodb.collection('cve_analyses').createIndexes([
        { key: { 'assessment.risk_level': 1 } },
        { key: { 'assessment.exploit_available': 1 } },
        { key: { 'cve.id': 1 }, unique: true },
        { key: { 'processing_timestamp': -1 } }
      ]);

      // Threat Actor Analyses collection indexes
      await mongodb.collection('threat_actor_analyses').createIndexes([
        { key: { 'actor_type': 1 } },
        { key: { 'sophistication_level': 1 } },
        { key: { 'confidence_score': -1 } },
        { key: { 'last_activity': -1 } }
      ]);

      // XDR Detections collection indexes
      await mongodb.collection('xdr_detections').createIndexes([
        { key: { 'threats.severity': 1 } },
        { key: { 'threats.threat_type': 1 } },
        { key: { 'created_at': -1 } }
      ]);

      logger.info('MongoDB indexes initialized successfully');
    } catch (error) {
      logger.error('MongoDB index initialization failed:', error);
      throw error;
    }
  }

  async seedTestData(): Promise<void> {
    try {
      logger.info('Seeding test data...');

      const mongodb = (this.dbService as any).mongodb;
      if (mongodb) {
        // Seed test CVE analysis
        await mongodb.collection('cve_analyses').insertOne({
          _id: 'CVE-2024-DEMO',
          cve: {
            id: 'CVE-2024-DEMO',
            description: 'Demo vulnerability for testing',
            published_date: new Date(),
            last_modified_date: new Date()
          },
          assessment: {
            risk_level: 'high',
            exploitability: 0.8,
            impact_score: 7.5,
            exploit_available: true,
            recommendations: ['Apply patches immediately', 'Implement network segmentation']
          },
          processing_timestamp: new Date(),
          related_cves: ['CVE-2024-DEMO-1', 'CVE-2024-DEMO-2'],
          threat_actors: ['Demo Actor Group'],
          campaigns: ['Demo Campaign'],
          created_at: new Date(),
          updated_at: new Date()
        });
      }

      logger.info('Test data seeding completed');
    } catch (error) {
      logger.error('Test data seeding failed:', error);
      throw error;
    }
  }
}