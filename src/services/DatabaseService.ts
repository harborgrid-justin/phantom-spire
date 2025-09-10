/**
 * Database Service
 * Production-ready database abstraction layer for multi-database architecture
 */

import { MongoClient, Db, Collection } from 'mongodb';
import { Pool as PostgreSQLPool } from 'pg';
import { createConnection, Connection } from 'mysql2/promise';
import { Redis } from 'redis';
import { LoggingService } from './LoggingService';

export interface CVEAnalysisResult {
  cve: any;
  assessment: any;
  processing_timestamp: Date;
  related_cves: string[];
  threat_actors: string[];
  campaigns: string[];
}

export interface RemediationStrategy {
  cve_id: string;
  priority: string;
  immediate_actions: any[];
  short_term_actions: any[];
  long_term_actions: any[];
  compensating_controls: any[];
  estimated_effort: any;
}

export class DatabaseService {
  private static instance: DatabaseService;
  private mongoClient: MongoClient | null = null;
  private mongodb: Db | null = null;
  private postgresPool: PostgreSQLPool | null = null;
  private mysqlConnection: Connection | null = null;
  private redisClient: Redis | null = null;
  private logger = LoggingService.getInstance();

  private constructor() {}

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  async initialize(): Promise<void> {
    try {
      // Initialize MongoDB
      if (process.env.MONGODB_URI) {
        this.mongoClient = new MongoClient(process.env.MONGODB_URI);
        await this.mongoClient.connect();
        this.mongodb = this.mongoClient.db();
        this.logger.info('MongoDB connected successfully');
      }

      // Initialize PostgreSQL
      if (process.env.POSTGRESQL_URI) {
        this.postgresPool = new PostgreSQLPool({
          connectionString: process.env.POSTGRESQL_URI,
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 2000,
        });
        this.logger.info('PostgreSQL pool created successfully');
      }

      // Initialize MySQL
      if (process.env.MYSQL_URI) {
        this.mysqlConnection = await createConnection(process.env.MYSQL_URI);
        this.logger.info('MySQL connected successfully');
      }

      // Initialize Redis
      if (process.env.REDIS_URL) {
        this.redisClient = new Redis(process.env.REDIS_URL);
        await this.redisClient.ping();
        this.logger.info('Redis connected successfully');
      }

      this.logger.info('Database service initialized successfully');
    } catch (error) {
      this.logger.error('Database initialization failed:', error);
      throw error;
    }
  }

  async storeCVEAnalysis(analysis: CVEAnalysisResult): Promise<void> {
    try {
      // Store in MongoDB for flexible document storage
      if (this.mongodb) {
        const collection: Collection = this.mongodb.collection('cve_analyses');
        await collection.insertOne({
          ...analysis,
          _id: analysis.cve.id,
          created_at: new Date(),
          updated_at: new Date()
        });
      }

      // Store structured data in PostgreSQL
      if (this.postgresPool) {
        const client = await this.postgresPool.connect();
        try {
          await client.query(
            `INSERT INTO threat_intelligence.cve_analyses 
             (cve_id, risk_level, exploitability, impact_score, created_at) 
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (cve_id) DO UPDATE SET
             risk_level = $2, exploitability = $3, impact_score = $4, updated_at = NOW()`,
            [
              analysis.cve.id,
              analysis.assessment.risk_level,
              analysis.assessment.exploitability,
              analysis.assessment.impact_score,
              new Date()
            ]
          );
        } finally {
          client.release();
        }
      }

      this.logger.info(`CVE analysis stored for ${analysis.cve.id}`);
    } catch (error) {
      this.logger.error('Failed to store CVE analysis:', error);
      throw error;
    }
  }

  async storeRemediationStrategy(strategy: RemediationStrategy): Promise<void> {
    try {
      // Store in MongoDB
      if (this.mongodb) {
        const collection: Collection = this.mongodb.collection('remediation_strategies');
        await collection.insertOne({
          ...strategy,
          _id: strategy.cve_id,
          created_at: new Date(),
          updated_at: new Date()
        });
      }

      // Store in PostgreSQL for reporting
      if (this.postgresPool) {
        const client = await this.postgresPool.connect();
        try {
          await client.query(
            `INSERT INTO workflow_engine.remediation_strategies 
             (cve_id, priority, estimated_hours, created_at) 
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (cve_id) DO UPDATE SET
             priority = $2, estimated_hours = $3, updated_at = NOW()`,
            [
              strategy.cve_id,
              strategy.priority,
              strategy.estimated_effort.hours,
              new Date()
            ]
          );
        } finally {
          client.release();
        }
      }

      this.logger.info(`Remediation strategy stored for ${strategy.cve_id}`);
    } catch (error) {
      this.logger.error('Failed to store remediation strategy:', error);
      throw error;
    }
  }

  async getCVEAnalysis(cveId: string): Promise<CVEAnalysisResult | null> {
    try {
      if (this.mongodb) {
        const collection: Collection = this.mongodb.collection('cve_analyses');
        const result = await collection.findOne({ _id: cveId });
        return result as CVEAnalysisResult | null;
      }
      return null;
    } catch (error) {
      this.logger.error('Failed to get CVE analysis:', error);
      throw error;
    }
  }

  async storeThreatActorAnalysis(analysis: any): Promise<void> {
    try {
      // Store in MongoDB for flexible document storage
      if (this.mongodb) {
        const collection: Collection = this.mongodb.collection('threat_actor_analyses');
        await collection.insertOne({
          ...analysis,
          _id: analysis.id,
          created_at: new Date(),
          updated_at: new Date()
        });
      }

      // Store structured data in PostgreSQL
      if (this.postgresPool) {
        const client = await this.postgresPool.connect();
        try {
          await client.query(
            `INSERT INTO threat_intelligence.threat_actors 
             (actor_id, name, actor_type, sophistication_level, confidence_score, created_at) 
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (actor_id) DO UPDATE SET
             name = $2, actor_type = $3, sophistication_level = $4, confidence_score = $5, updated_at = NOW()`,
            [
              analysis.id,
              analysis.name,
              analysis.actor_type,
              analysis.sophistication_level,
              analysis.confidence_score,
              new Date()
            ]
          );
        } finally {
          client.release();
        }
      }

      this.logger.info(`Threat actor analysis stored for ${analysis.id}`);
    } catch (error) {
      this.logger.error('Failed to store threat actor analysis:', error);
      throw error;
    }
  }

  async storeAttributionAnalysis(attribution: any): Promise<void> {
    try {
      // Store in MongoDB
      if (this.mongodb) {
        const collection: Collection = this.mongodb.collection('attribution_analyses');
        await collection.insertOne({
          ...attribution,
          _id: `${attribution.primary_attribution || 'unknown'}_${Date.now()}`,
          created_at: new Date(),
          updated_at: new Date()
        });
      }

      this.logger.info(`Attribution analysis stored`);
    } catch (error) {
      this.logger.error('Failed to store attribution analysis:', error);
      throw error;
    }
  }

  async storeCampaignAnalysis(campaign: any): Promise<void> {
    try {
      // Store in MongoDB
      if (this.mongodb) {
        const collection: Collection = this.mongodb.collection('campaign_analyses');
        await collection.insertOne({
          ...campaign,
          _id: campaign.id,
          created_at: new Date(),
          updated_at: new Date()
        });
      }

      this.logger.info(`Campaign analysis stored for ${campaign.id}`);
    } catch (error) {
      this.logger.error('Failed to store campaign analysis:', error);
      throw error;
    }
  }

  async storeBehavioralAnalysis(behavior: any): Promise<void> {
    try {
      // Store in MongoDB
      if (this.mongodb) {
        const collection: Collection = this.mongodb.collection('behavioral_analyses');
        await collection.insertOne({
          ...behavior,
          _id: `${behavior.actor_id}_${Date.now()}`,
          created_at: new Date(),
          updated_at: new Date()
        });
      }

      this.logger.info(`Behavioral analysis stored for ${behavior.actor_id}`);
    } catch (error) {
      this.logger.error('Failed to store behavioral analysis:', error);
      throw error;
    }
  }

  async getThreatActorActivities(actorId: string): Promise<string[] | null> {
    try {
      if (this.mongodb) {
        const collection: Collection = this.mongodb.collection('threat_actor_activities');
        const result = await collection.findOne({ actor_id: actorId });
        return result?.activities || null;
      }
      return null;
    } catch (error) {
      this.logger.error('Failed to get threat actor activities:', error);
      return null;
    }
  }

  async storeXDRDetection(detection: any): Promise<void> {
    try {
      // Store in MongoDB
      if (this.mongodb) {
        const collection: Collection = this.mongodb.collection('xdr_detections');
        await collection.insertOne({
          ...detection,
          _id: `detection_${Date.now()}`,
          created_at: new Date(),
          updated_at: new Date()
        });
      }

      this.logger.info('XDR detection stored', { threatCount: detection.threats.length });
    } catch (error) {
      this.logger.error('Failed to store XDR detection:', error);
      throw error;
    }
  }

  async storeXDRResponse(response: any): Promise<void> {
    try {
      // Store in MongoDB
      if (this.mongodb) {
        const collection: Collection = this.mongodb.collection('xdr_responses');
        await collection.insertOne({
          ...response,
          _id: `response_${Date.now()}`,
          created_at: new Date(),
          updated_at: new Date()
        });
      }

      this.logger.info('XDR response stored');
    } catch (error) {
      this.logger.error('Failed to store XDR response:', error);
      throw error;
    }
  }

  async storeXDRHunt(hunt: any): Promise<void> {
    try {
      // Store in MongoDB
      if (this.mongodb) {
        const collection: Collection = this.mongodb.collection('xdr_hunts');
        await collection.insertOne({
          ...hunt,
          _id: `hunt_${Date.now()}`,
          created_at: new Date(),
          updated_at: new Date()
        });
      }

      this.logger.info('XDR hunt stored');
    } catch (error) {
      this.logger.error('Failed to store XDR hunt:', error);
      throw error;
    }
  }

  async storeXDRAnalytics(analytics: any): Promise<void> {
    try {
      // Store in MongoDB
      if (this.mongodb) {
        const collection: Collection = this.mongodb.collection('xdr_analytics');
        await collection.insertOne({
          ...analytics,
          _id: `analytics_${Date.now()}`,
          created_at: new Date(),
          updated_at: new Date()
        });
      }

      this.logger.info('XDR analytics stored');
    } catch (error) {
      this.logger.error('Failed to store XDR analytics:', error);
      throw error;
    }
  }

  async storeIOCAnalysis(analysis: any): Promise<void> {
    try {
      // Store in MongoDB
      if (this.mongodb) {
        const collection: Collection = this.mongodb.collection('ioc_analyses');
        await collection.insertOne({
          ...analysis,
          _id: `ioc_analysis_${Date.now()}`,
          created_at: new Date(),
          updated_at: new Date()
        });
      }

      this.logger.info('IOC analysis stored');
    } catch (error) {
      this.logger.error('Failed to store IOC analysis:', error);
      throw error;
    }
  }

  async storeIOCCorrelations(correlations: any): Promise<void> {
    try {
      // Store in MongoDB
      if (this.mongodb) {
        const collection: Collection = this.mongodb.collection('ioc_correlations');
        await collection.insertOne({
          ...correlations,
          _id: `ioc_correlation_${Date.now()}`,
          created_at: new Date(),
          updated_at: new Date()
        });
      }

      this.logger.info('IOC correlations stored');
    } catch (error) {
      this.logger.error('Failed to store IOC correlations:', error);
      throw error;
    }
  }

  async storeIOCImport(importResult: any): Promise<void> {
    try {
      // Store in MongoDB
      if (this.mongodb) {
        const collection: Collection = this.mongodb.collection('ioc_imports');
        await collection.insertOne({
          ...importResult,
          _id: `ioc_import_${Date.now()}`,
          created_at: new Date(),
          updated_at: new Date()
        });
      }

      this.logger.info('IOC import stored');
    } catch (error) {
      this.logger.error('Failed to store IOC import:', error);
      throw error;
    }
  }

  async searchCVEs(criteria: any): Promise<CVEAnalysisResult[]> {
    try {
      if (this.mongodb) {
        const collection: Collection = this.mongodb.collection('cve_analyses');
        const query: any = {};

        if (criteria.risk_level) {
          query['assessment.risk_level'] = criteria.risk_level;
        }
        if (criteria.min_score) {
          query['assessment.impact_score'] = { $gte: criteria.min_score };
        }
        if (criteria.exploit_available !== undefined) {
          query['assessment.exploit_available'] = criteria.exploit_available;
        }

        const results = await collection.find(query).limit(100).toArray();
        return results as CVEAnalysisResult[];
      }
      return [];
    } catch (error) {
      this.logger.error('Failed to search CVEs:', error);
      throw error;
    }
  }

  async getHealthStatus(): Promise<any> {
    const status = {
      mongodb: false,
      postgresql: false,
      mysql: false,
      redis: false,
      timestamp: new Date()
    };

    try {
      // Check MongoDB
      if (this.mongodb) {
        await this.mongodb.admin().ping();
        status.mongodb = true;
      }

      // Check PostgreSQL
      if (this.postgresPool) {
        const client = await this.postgresPool.connect();
        await client.query('SELECT 1');
        client.release();
        status.postgresql = true;
      }

      // Check MySQL
      if (this.mysqlConnection) {
        await this.mysqlConnection.ping();
        status.mysql = true;
      }

      // Check Redis
      if (this.redisClient) {
        await this.redisClient.ping();
        status.redis = true;
      }
    } catch (error) {
      this.logger.error('Database health check failed:', error);
    }

    return status;
  }

  async close(): Promise<void> {
    try {
      if (this.mongoClient) {
        await this.mongoClient.close();
      }
      if (this.postgresPool) {
        await this.postgresPool.end();
      }
      if (this.mysqlConnection) {
        await this.mysqlConnection.end();
      }
      if (this.redisClient) {
        await this.redisClient.quit();
      }
      this.logger.info('Database connections closed');
    } catch (error) {
      this.logger.error('Error closing database connections:', error);
    }
  }
}