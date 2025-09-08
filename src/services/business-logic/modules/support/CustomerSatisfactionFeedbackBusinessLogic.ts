/**
 * Customer Satisfaction Feedback Business Logic
 * Customer feedback collection and analysis
 */

import { BusinessLogicModule } from '../BusinessLogicModule';
import { DatabaseManager } from '../../../data-layer/DatabaseManager';
import { Logger } from '../../../utils/Logger';
import { EventEmitter } from 'events';

export interface CustomerSatisfactionFeedbackBusinessLogicConfig {
  enabled: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  alertThresholds: {
    warning: number;
    critical: number;
  };
  integrationSettings: {
    notifications: boolean;
    realTimeUpdates: boolean;
    auditTrail: boolean;
  };
}

export interface CustomerSatisfactionFeedbackBusinessLogicMetrics {
  totalRequests: number;
  successfulOperations: number;
  failedOperations: number;
  averageResponseTime: number;
  lastUpdateTime: Date;
  currentStatus: 'operational' | 'degraded' | 'outage';
}

export interface CustomerSatisfactionFeedbackBusinessLogicData {
  id: string;
  title: string;
  status: 'active' | 'pending' | 'completed' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'customer-support';
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, any>;
}

export class CustomerSatisfactionFeedbackBusinessLogic extends BusinessLogicModule {
  private config: CustomerSatisfactionFeedbackBusinessLogicConfig;
  private metrics: CustomerSatisfactionFeedbackBusinessLogicMetrics;
  private eventEmitter: EventEmitter;
  private logger: Logger;
  private databaseManager: DatabaseManager;

  constructor() {
    super();
    this.config = this.getDefaultConfig();
    this.metrics = this.initializeMetrics();
    this.eventEmitter = new EventEmitter();
    this.logger = new Logger('CustomerSatisfactionFeedbackBusinessLogic');
    this.databaseManager = DatabaseManager.getInstance();
    
    this.setupEventHandlers();
    this.initializeModule();
  }

  private getDefaultConfig(): CustomerSatisfactionFeedbackBusinessLogicConfig {
    return {
      enabled: true,
      autoRefresh: true,
      refreshInterval: 30000,
      alertThresholds: {
        warning: 80,
        critical: 95
      },
      integrationSettings: {
        notifications: true,
        realTimeUpdates: true,
        auditTrail: true
      }
    };
  }

  private initializeMetrics(): CustomerSatisfactionFeedbackBusinessLogicMetrics {
    return {
      totalRequests: 0,
      successfulOperations: 0,
      failedOperations: 0,
      averageResponseTime: 0,
      lastUpdateTime: new Date(),
      currentStatus: 'operational'
    };
  }

  private setupEventHandlers(): void {
    this.eventEmitter.on('dataUpdate', this.handleDataUpdate.bind(this));
    this.eventEmitter.on('error', this.handleError.bind(this));
    this.eventEmitter.on('statusChange', this.handleStatusChange.bind(this));
  }

  private async initializeModule(): Promise<void> {
    try {
      this.logger.info('Initializing Customer Satisfaction Feedback module...');
      
      // Initialize database connections
      await this.databaseManager.ensureConnection('mongodb');
      await this.databaseManager.ensureConnection('postgresql');
      
      // Set up initial data structures
      await this.createInitialSchema();
      
      this.logger.info('Customer Satisfaction Feedback module initialized successfully');
      this.metrics.currentStatus = 'operational';
    } catch (error) {
      this.logger.error('Failed to initialize Customer Satisfaction Feedback module:', error);
      this.metrics.currentStatus = 'outage';
      throw error;
    }
  }

  public async getData(filters?: Record<string, any>): Promise<CustomerSatisfactionFeedbackBusinessLogicData[]> {
    const startTime = Date.now();
    
    try {
      this.metrics.totalRequests++;
      
      const collection = await this.databaseManager.getCollection('mongodb', 'customer_satisfaction_feedback_data');
      const query = filters || {};
      
      const data = await collection.find(query).toArray();
      
      this.metrics.successfulOperations++;
      this.updateResponseTime(Date.now() - startTime);
      
      this.eventEmitter.emit('dataUpdate', { 
        operation: 'getData', 
        count: data.length,
        filters 
      });
      
      return data;
    } catch (error) {
      this.metrics.failedOperations++;
      this.logger.error('Failed to get data:', error);
      this.eventEmitter.emit('error', error);
      throw error;
    }
  }

  public async createItem(item: Partial<CustomerSatisfactionFeedbackBusinessLogicData>): Promise<CustomerSatisfactionFeedbackBusinessLogicData> {
    const startTime = Date.now();
    
    try {
      this.metrics.totalRequests++;
      
      const collection = await this.databaseManager.getCollection('mongodb', 'customer_satisfaction_feedback_data');
      
      const newItem: CustomerSatisfactionFeedbackBusinessLogicData = {
        id: this.generateId(),
        title: item.title || 'Untitled',
        status: item.status || 'pending',
        priority: item.priority || 'medium',
        category: 'customer-support',
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: item.metadata || {},
        ...item
      };
      
      await collection.insertOne(newItem);
      
      this.metrics.successfulOperations++;
      this.updateResponseTime(Date.now() - startTime);
      
      this.eventEmitter.emit('dataUpdate', { 
        operation: 'createItem', 
        item: newItem 
      });
      
      return newItem;
    } catch (error) {
      this.metrics.failedOperations++;
      this.logger.error('Failed to create item:', error);
      this.eventEmitter.emit('error', error);
      throw error;
    }
  }

  public async updateItem(id: string, updates: Partial<CustomerSatisfactionFeedbackBusinessLogicData>): Promise<CustomerSatisfactionFeedbackBusinessLogicData> {
    const startTime = Date.now();
    
    try {
      this.metrics.totalRequests++;
      
      const collection = await this.databaseManager.getCollection('mongodb', 'customer_satisfaction_feedback_data');
      
      const updateData = {
        ...updates,
        updatedAt: new Date()
      };
      
      const result = await collection.findOneAndUpdate(
        { id },
        { $set: updateData },
        { returnDocument: 'after' }
      );
      
      if (!result.value) {
        throw new Error(`Item with id ${id} not found`);
      }
      
      this.metrics.successfulOperations++;
      this.updateResponseTime(Date.now() - startTime);
      
      this.eventEmitter.emit('dataUpdate', { 
        operation: 'updateItem', 
        item: result.value 
      });
      
      return result.value;
    } catch (error) {
      this.metrics.failedOperations++;
      this.logger.error('Failed to update item:', error);
      this.eventEmitter.emit('error', error);
      throw error;
    }
  }

  public async deleteItem(id: string): Promise<boolean> {
    const startTime = Date.now();
    
    try {
      this.metrics.totalRequests++;
      
      const collection = await this.databaseManager.getCollection('mongodb', 'customer_satisfaction_feedback_data');
      
      const result = await collection.deleteOne({ id });
      
      if (result.deletedCount === 0) {
        throw new Error(`Item with id ${id} not found`);
      }
      
      this.metrics.successfulOperations++;
      this.updateResponseTime(Date.now() - startTime);
      
      this.eventEmitter.emit('dataUpdate', { 
        operation: 'deleteItem', 
        id 
      });
      
      return true;
    } catch (error) {
      this.metrics.failedOperations++;
      this.logger.error('Failed to delete item:', error);
      this.eventEmitter.emit('error', error);
      throw error;
    }
  }

  public getMetrics(): CustomerSatisfactionFeedbackBusinessLogicMetrics {
    return { ...this.metrics };
  }

  public getConfig(): CustomerSatisfactionFeedbackBusinessLogicConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<CustomerSatisfactionFeedbackBusinessLogicConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.logger.info('Configuration updated', { newConfig });
  }

  public getHealthStatus(): { status: string; details: any } {
    const health = {
      status: this.metrics.currentStatus,
      details: {
        totalRequests: this.metrics.totalRequests,
        successRate: this.calculateSuccessRate(),
        averageResponseTime: this.metrics.averageResponseTime,
        lastUpdate: this.metrics.lastUpdateTime,
        configStatus: this.config.enabled ? 'enabled' : 'disabled'
      }
    };
    
    return health;
  }

  private async createInitialSchema(): Promise<void> {
    try {
      const mongodb = this.databaseManager.getDatabase('mongodb');
      const postgresql = this.databaseManager.getDatabase('postgresql');
      
      // Create MongoDB collection with indexes
      const collection = mongodb.collection('customer_satisfaction_feedback_data');
      await collection.createIndex({ id: 1 }, { unique: true });
      await collection.createIndex({ status: 1 });
      await collection.createIndex({ priority: 1 });
      await collection.createIndex({ createdAt: -1 });
      
      // Create PostgreSQL tables for analytics
      await postgresql.query(`
        CREATE TABLE IF NOT EXISTS customer_satisfaction_feedback_analytics (
          id SERIAL PRIMARY KEY,
          operation_type VARCHAR(50) NOT NULL,
          execution_time INTEGER NOT NULL,
          status VARCHAR(20) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
    } catch (error) {
      this.logger.error('Failed to create initial schema:', error);
      throw error;
    }
  }

  private calculateSuccessRate(): number {
    if (this.metrics.totalRequests === 0) return 100;
    return (this.metrics.successfulOperations / this.metrics.totalRequests) * 100;
  }

  private updateResponseTime(responseTime: number): void {
    if (this.metrics.totalRequests === 1) {
      this.metrics.averageResponseTime = responseTime;
    } else {
      this.metrics.averageResponseTime = (
        (this.metrics.averageResponseTime * (this.metrics.totalRequests - 1)) + responseTime
      ) / this.metrics.totalRequests;
    }
  }

  private generateId(): string {
    return `${page.category}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private handleDataUpdate(event: any): void {
    this.metrics.lastUpdateTime = new Date();
    this.logger.debug('Data update event:', event);
  }

  private handleError(error: Error): void {
    this.logger.error('Module error:', error);
    if (this.calculateSuccessRate() < this.config.alertThresholds.critical) {
      this.metrics.currentStatus = 'outage';
    } else if (this.calculateSuccessRate() < this.config.alertThresholds.warning) {
      this.metrics.currentStatus = 'degraded';
    }
  }

  private handleStatusChange(status: string): void {
    this.metrics.currentStatus = status as any;
    this.logger.info('Status changed to:', status);
  }
}

export default CustomerSatisfactionFeedbackBusinessLogic;
