/**
 * Shift Scheduling System Business Logic
 * Agent scheduling and shift management
 */

import { BusinessLogicModule } from '../BusinessLogicModule';
import { DatabaseManager } from '../../../data-layer/DatabaseManager';
import { Logger } from '../../../utils/Logger';
import { EventEmitter } from 'events';

export interface ShiftSchedulingSystemBusinessLogicConfig {
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

export interface ShiftSchedulingSystemBusinessLogicMetrics {
  totalRequests: number;
  successfulOperations: number;
  failedOperations: number;
  averageResponseTime: number;
  lastUpdateTime: Date;
  currentStatus: 'operational' | 'degraded' | 'outage';
}

export interface ShiftSchedulingSystemBusinessLogicData {
  id: string;
  title: string;
  status: 'active' | 'pending' | 'completed' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'help-desk';
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, any>;
}

export class ShiftSchedulingSystemBusinessLogic extends BusinessLogicModule {
  private config: ShiftSchedulingSystemBusinessLogicConfig;
  private metrics: ShiftSchedulingSystemBusinessLogicMetrics;
  private eventEmitter: EventEmitter;
  private logger: Logger;
  private databaseManager: DatabaseManager;

  constructor() {
    super();
    this.config = this.getDefaultConfig();
    this.metrics = this.initializeMetrics();
    this.eventEmitter = new EventEmitter();
    this.logger = new Logger('ShiftSchedulingSystemBusinessLogic');
    this.databaseManager = DatabaseManager.getInstance();
    
    this.setupEventHandlers();
    this.initializeModule();
  }

  private getDefaultConfig(): ShiftSchedulingSystemBusinessLogicConfig {
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

  private initializeMetrics(): ShiftSchedulingSystemBusinessLogicMetrics {
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
      this.logger.info('Initializing Shift Scheduling System module...');
      
      // Initialize database connections
      await this.databaseManager.ensureConnection('mongodb');
      await this.databaseManager.ensureConnection('postgresql');
      
      // Set up initial data structures
      await this.createInitialSchema();
      
      this.logger.info('Shift Scheduling System module initialized successfully');
      this.metrics.currentStatus = 'operational';
    } catch (error) {
      this.logger.error('Failed to initialize Shift Scheduling System module:', error);
      this.metrics.currentStatus = 'outage';
      throw error;
    }
  }

  public async getData(filters?: Record<string, any>): Promise<ShiftSchedulingSystemBusinessLogicData[]> {
    const startTime = Date.now();
    
    try {
      this.metrics.totalRequests++;
      
      const collection = await this.databaseManager.getCollection('mongodb', 'shift_scheduling_system_data');
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

  public async createItem(item: Partial<ShiftSchedulingSystemBusinessLogicData>): Promise<ShiftSchedulingSystemBusinessLogicData> {
    const startTime = Date.now();
    
    try {
      this.metrics.totalRequests++;
      
      const collection = await this.databaseManager.getCollection('mongodb', 'shift_scheduling_system_data');
      
      const newItem: ShiftSchedulingSystemBusinessLogicData = {
        id: this.generateId(),
        title: item.title || 'Untitled',
        status: item.status || 'pending',
        priority: item.priority || 'medium',
        category: 'help-desk',
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

  public async updateItem(id: string, updates: Partial<ShiftSchedulingSystemBusinessLogicData>): Promise<ShiftSchedulingSystemBusinessLogicData> {
    const startTime = Date.now();
    
    try {
      this.metrics.totalRequests++;
      
      const collection = await this.databaseManager.getCollection('mongodb', 'shift_scheduling_system_data');
      
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
      
      const collection = await this.databaseManager.getCollection('mongodb', 'shift_scheduling_system_data');
      
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

  public getMetrics(): ShiftSchedulingSystemBusinessLogicMetrics {
    return { ...this.metrics };
  }

  public getConfig(): ShiftSchedulingSystemBusinessLogicConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<ShiftSchedulingSystemBusinessLogicConfig>): void {
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
      const collection = mongodb.collection('shift_scheduling_system_data');
      await collection.createIndex({ id: 1 }, { unique: true });
      await collection.createIndex({ status: 1 });
      await collection.createIndex({ priority: 1 });
      await collection.createIndex({ createdAt: -1 });
      
      // Create PostgreSQL tables for analytics
      await postgresql.query(`
        CREATE TABLE IF NOT EXISTS shift_scheduling_system_analytics (
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

export default ShiftSchedulingSystemBusinessLogic;
