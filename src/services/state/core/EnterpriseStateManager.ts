/**
 * Enterprise State Manager
 * Fortune 100-grade centralized state management system
 */

import { EventEmitter } from 'events';
import {
  IStateManager,
  IStateEvent,
  IStateSubscription,
  IStateConfiguration,
  IStateMetrics,
  IStateOptions,
  IStateScope,
  StateScope,
  StateAction
} from '../interfaces/IStateManager';
import { cacheManager } from '../../cache/core/EnterpriseCacheManager';
import { logger } from '../../../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export class EnterpriseStateManager extends EventEmitter implements IStateManager {
  private configuration: IStateConfiguration;
  private subscriptions: Map<string, IStateSubscription> = new Map();
  private eventHistory: IStateEvent[] = [];
  private maxEventHistory: number = 10000;
  private isStarted: boolean = false;
  private metrics = {
    totalStates: 0,
    totalEvents: 0,
    syncErrors: 0,
    lastSyncTime: null as Date | null
  };

  constructor(customConfig?: Partial<IStateConfiguration>) {
    super();

    this.configuration = {
      persistence: {
        enabled: true,
        strategy: 'hybrid', // Use both Redis and memory
        syncInterval: 30000 // 30 seconds
      },
      serialization: {
        enabled: true,
        format: 'json'
      },
      versioning: {
        enabled: true,
        maxVersions: 10
      },
      validation: {
        enabled: true,
        strict: false
      },
      monitoring: {
        enabled: true,
        trackChanges: true,
        metricsInterval: 60000 // 1 minute
      },
      security: {
        enabled: true,
        encryption: false, // Will be handled by cache layer
        accessControl: true
      },
      ...customConfig
    };
  }

  async start(): Promise<void> {
    if (this.isStarted) return;

    try {
      // Ensure cache manager is started
      await cacheManager.start();

      // Start periodic sync if persistence is enabled
      if (this.configuration.persistence.enabled && this.configuration.persistence.syncInterval > 0) {
        setInterval(() => this.syncStates(), this.configuration.persistence.syncInterval);
      }

      // Start metrics collection
      if (this.configuration.monitoring.enabled) {
        setInterval(() => this.collectMetrics(), this.configuration.monitoring.metricsInterval);
      }

      this.isStarted = true;
      logger.info('Enterprise State Manager started successfully');
      this.emit('started');
    } catch (error) {
      logger.error('Failed to start Enterprise State Manager:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.isStarted) return;

    try {
      // Perform final sync
      if (this.configuration.persistence.enabled) {
        await this.syncStates();
      }

      this.isStarted = false;
      logger.info('Enterprise State Manager stopped successfully');
      this.emit('stopped');
    } catch (error) {
      logger.error('Error stopping Enterprise State Manager:', error);
      throw error;
    }
  }

  async get<T>(scope: StateScope, key: string, defaultValue?: T): Promise<T | null> {
    try {
      const stateKey = this.buildStateKey(scope, key);
      const cached = await cacheManager.get<T>(stateKey, {
        namespace: 'state',
        ttl: this.getStateTTL(scope)
      });

      if (cached !== null) {
        return cached;
      }

      // If not found and default value provided, set and return default
      if (defaultValue !== undefined) {
        await this.set(scope, key, defaultValue);
        return defaultValue;
      }

      return null;
    } catch (error) {
      logger.error('State get error:', error);
      throw error;
    }
  }

  async set<T>(scope: StateScope, key: string, value: T, options?: IStateOptions): Promise<void> {
    try {
      const stateKey = this.buildStateKey(scope, key);

      // Get previous value for event
      const previousValue = await this.get(scope, key);

      // Validate if validation is enabled
      if (this.configuration.validation.enabled && options?.validate !== false) {
        const isValid = await this.validate(scope, key, value);
        if (!isValid && this.configuration.validation.strict) {
          throw new Error(`State validation failed for key: ${key}`);
        }
      }

      // Store the state
      await cacheManager.set(stateKey, value, {
        namespace: 'state',
        ttl: options?.ttl || this.getStateTTL(scope),
        tags: ['state', scope]
      });

      // Store version if versioning is enabled
      if (this.configuration.versioning.enabled && options?.version !== false) {
        await this.storeVersion(scope, key, value);
      }

      // Emit state change event
      const event: Omit<IStateEvent, 'id' | 'timestamp'> = {
        scope,
        action: previousValue === null ? StateAction.CREATE : StateAction.UPDATE,
        key,
        previousValue,
        newValue: value,
        metadata: options?.metadata
      };

      await this.emit('stateChanged', event);

      this.metrics.totalStates++;
    } catch (error) {
      logger.error('State set error:', error);
      throw error;
    }
  }

  async delete(scope: StateScope, key: string): Promise<boolean> {
    try {
      const stateKey = this.buildStateKey(scope, key);
      const previousValue = await this.get(scope, key);

      const deleted = await cacheManager.delete(stateKey, {
        namespace: 'state'
      });

      if (deleted) {
        // Emit state change event
        const event: Omit<IStateEvent, 'id' | 'timestamp'> = {
          scope,
          action: StateAction.DELETE,
          key,
          previousValue,
          newValue: null
        };

        await this.emitStateEvent(event);
      }

      return deleted;
    } catch (error) {
      logger.error('State delete error:', error);
      throw error;
    }
  }

  async exists(scope: StateScope, key: string): Promise<boolean> {
    try {
      const stateKey = this.buildStateKey(scope, key);
      return await cacheManager.exists(stateKey, { namespace: 'state' });
    } catch (error) {
      logger.error('State exists error:', error);
      throw error;
    }
  }

  async getMultiple<T>(scope: StateScope, keys: string[]): Promise<Map<string, T>> {
    try {
      const stateKeys = keys.map(key => this.buildStateKey(scope, key));
      const cached = await cacheManager.getMultiple<T>(stateKeys, { namespace: 'state' });

      // Convert back to original keys
      const result = new Map<string, T>();
      for (const [stateKey, value] of cached) {
        const originalKey = this.extractOriginalKey(stateKey);
        result.set(originalKey, value);
      }

      return result;
    } catch (error) {
      logger.error('State getMultiple error:', error);
      throw error;
    }
  }

  async setMultiple<T>(scope: StateScope, entries: Map<string, T>, options?: IStateOptions): Promise<void> {
    try {
      const promises = Array.from(entries.entries()).map(([key, value]) =>
        this.set(scope, key, value, options)
      );

      await Promise.all(promises);
    } catch (error) {
      logger.error('State setMultiple error:', error);
      throw error;
    }
  }

  async deleteMultiple(scope: StateScope, keys: string[]): Promise<number> {
    try {
      let deletedCount = 0;
      for (const key of keys) {
        const deleted = await this.delete(scope, key);
        if (deleted) deletedCount++;
      }
      return deletedCount;
    } catch (error) {
      logger.error('State deleteMultiple error:', error);
      throw error;
    }
  }

  async getByPattern<T>(scope: StateScope, pattern: string): Promise<Map<string, T>> {
    try {
      const statePattern = this.buildStateKey(scope, pattern);
      const cached = await cacheManager.getByPattern<T>(statePattern, { namespace: 'state' });

      // Convert back to original keys
      const result = new Map<string, T>();
      for (const [stateKey, value] of cached) {
        const originalKey = this.extractOriginalKey(stateKey);
        result.set(originalKey, value);
      }

      return result;
    } catch (error) {
      logger.error('State getByPattern error:', error);
      throw error;
    }
  }

  async deleteByPattern(scope: StateScope, pattern: string): Promise<number> {
    try {
      const statePattern = this.buildStateKey(scope, pattern);
      return await cacheManager.deleteByPattern(statePattern, { namespace: 'state' });
    } catch (error) {
      logger.error('State deleteByPattern error:', error);
      throw error;
    }
  }

  async merge<T>(scope: StateScope, key: string, value: Partial<T>): Promise<void> {
    try {
      const currentValue = await this.get<T>(scope, key);
      
      if (currentValue && typeof currentValue === 'object' && !Array.isArray(currentValue)) {
        const mergedValue = { ...currentValue, ...value } as T;
        await this.set(scope, key, mergedValue);
      } else {
        // If current value is not an object, just set the new value
        await this.set(scope, key, value as T);
      }
    } catch (error) {
      logger.error('State merge error:', error);
      throw error;
    }
  }

  async update<T>(scope: StateScope, key: string, updater: (current: T) => T): Promise<void> {
    try {
      const currentValue = await this.get<T>(scope, key);
      if (currentValue !== null) {
        const updatedValue = updater(currentValue);
        await this.set(scope, key, updatedValue);
      }
    } catch (error) {
      logger.error('State update error:', error);
      throw error;
    }
  }

  async createScope(scope: StateScope, identifier: string): Promise<IStateScope> {
    return new StateScope_Implementation(this, scope, identifier);
  }

  async deleteScope(scope: StateScope, identifier: string): Promise<boolean> {
    try {
      const pattern = `${scope}:${identifier}:*`;
      const deletedCount = await this.deleteByPattern(scope, pattern);
      return deletedCount > 0;
    } catch (error) {
      logger.error('State deleteScope error:', error);
      throw error;
    }
  }

  async listScopes(scope: StateScope): Promise<string[]> {
    try {
      const pattern = `${scope}:*`;
      const states = await this.getByPattern(scope, pattern);
      
      const scopes = new Set<string>();
      for (const key of states.keys()) {
        const parts = key.split(':');
        if (parts.length >= 2) {
          scopes.add(parts[1]);
        }
      }
      
      return Array.from(scopes);
    } catch (error) {
      logger.error('State listScopes error:', error);
      throw error;
    }
  }

  async subscribe(subscription: Omit<IStateSubscription, 'id'>): Promise<string> {
    const id = uuidv4();
    const fullSubscription: IStateSubscription = {
      id,
      ...subscription
    };

    this.subscriptions.set(id, fullSubscription);

    // Listen for state change events
    this.on('stateChanged', async (event: IStateEvent) => {
      if (this.matchesSubscription(event, fullSubscription)) {
        try {
          await fullSubscription.callback(event);
          
          // Remove subscription if it's a one-time subscription
          if (fullSubscription.once) {
            this.subscriptions.delete(id);
          }
        } catch (error) {
          logger.error('State subscription callback error:', error);
        }
      }
    });

    return id;
  }

  async unsubscribe(subscriptionId: string): Promise<boolean> {
    return this.subscriptions.delete(subscriptionId);
  }

  async emit(event: Omit<IStateEvent, 'id' | 'timestamp'>): Promise<void> {
    await this.emitStateEvent(event);
  }

  async persist(scope?: StateScope): Promise<void> {
    try {
      // Cache manager handles persistence automatically
      logger.debug('State persistence completed', { scope });
    } catch (error) {
      this.metrics.syncErrors++;
      logger.error('State persist error:', error);
      throw error;
    }
  }

  async restore(scope?: StateScope): Promise<void> {
    try {
      // Cache manager handles restoration automatically
      logger.debug('State restoration completed', { scope });
    } catch (error) {
      logger.error('State restore error:', error);
      throw error;
    }
  }

  async sync(): Promise<void> {
    try {
      await this.syncStates();
      this.metrics.lastSyncTime = new Date();
    } catch (error) {
      this.metrics.syncErrors++;
      logger.error('State sync error:', error);
      throw error;
    }
  }

  async getVersion(scope: StateScope, key: string, version?: number): Promise<any> {
    try {
      if (!this.configuration.versioning.enabled) {
        return await this.get(scope, key);
      }

      const versionKey = this.buildVersionKey(scope, key, version);
      return await cacheManager.get(versionKey, { namespace: 'state-versions' });
    } catch (error) {
      logger.error('State getVersion error:', error);
      throw error;
    }
  }

  async getVersions(scope: StateScope, key: string): Promise<Array<{ version: number; timestamp: Date; value: any }>> {
    try {
      if (!this.configuration.versioning.enabled) {
        return [];
      }

      const pattern = this.buildVersionKey(scope, key, '*');
      const versions = await cacheManager.getByPattern(pattern, { namespace: 'state-versions' });
      
      const result = Array.from(versions.entries()).map(([versionKey, value]) => {
        const versionMatch = versionKey.match(/:v(\d+):(\d+)$/);
        const version = versionMatch ? parseInt(versionMatch[1], 10) : 0;
        const timestamp = versionMatch ? new Date(parseInt(versionMatch[2], 10)) : new Date();
        
        return { version, timestamp, value };
      });

      return result.sort((a, b) => b.version - a.version);
    } catch (error) {
      logger.error('State getVersions error:', error);
      throw error;
    }
  }

  async revert(scope: StateScope, key: string, version: number): Promise<void> {
    try {
      const versionValue = await this.getVersion(scope, key, version);
      if (versionValue !== null) {
        await this.set(scope, key, versionValue);
      } else {
        throw new Error(`Version ${version} not found for key ${key}`);
      }
    } catch (error) {
      logger.error('State revert error:', error);
      throw error;
    }
  }

  async getMetrics(): Promise<IStateMetrics> {
    const cacheMetrics = await cacheManager.getMetrics();
    
    return {
      totalStates: this.metrics.totalStates,
      totalEvents: this.metrics.totalEvents,
      memoryUsage: cacheMetrics.memoryUsage,
      lastSyncTime: this.metrics.lastSyncTime,
      syncErrors: this.metrics.syncErrors,
      subscriptions: this.subscriptions.size
    };
  }

  async getStateHistory(scope: StateScope, key: string, limit: number = 100): Promise<IStateEvent[]> {
    const stateKey = this.buildStateKey(scope, key);
    return this.eventHistory
      .filter(event => event.scope === scope && event.key === key)
      .slice(-limit);
  }

  async configure(config: Partial<IStateConfiguration>): Promise<void> {
    this.configuration = { ...this.configuration, ...config };
    this.emit('configUpdated', { config });
  }

  async clear(scope?: StateScope): Promise<void> {
    try {
      if (scope) {
        await cacheManager.deleteByPattern(`${scope}:*`, { namespace: 'state' });
      } else {
        await cacheManager.clearNamespace('state');
      }

      this.emit('cleared', { scope });
    } catch (error) {
      logger.error('State clear error:', error);
      throw error;
    }
  }

  async validate<T>(scope: StateScope, key: string, value: T): Promise<boolean> {
    // Basic validation - can be extended with custom validators
    return value !== null && value !== undefined;
  }

  serialize(value: any): string {
    return this.configuration.serialization.format === 'json' ? 
      JSON.stringify(value) : 
      JSON.stringify(value); // For now, only JSON is supported
  }

  deserialize<T>(data: string): T {
    return JSON.parse(data);
  }

  // Private helper methods
  private buildStateKey(scope: StateScope, key: string): string {
    return `${scope}:${key}`;
  }

  private extractOriginalKey(stateKey: string): string {
    const parts = stateKey.split(':');
    return parts.slice(1).join(':');
  }

  private buildVersionKey(scope: StateScope, key: string, version?: number | string): string {
    if (version === undefined || version === '*') {
      return `${scope}:${key}:v*`;
    }
    return `${scope}:${key}:v${version}:${Date.now()}`;
  }

  private getStateTTL(scope: StateScope): number {
    // Different scopes can have different TTLs
    switch (scope) {
      case StateScope.SESSION:
        return 24 * 60 * 60 * 1000; // 24 hours
      case StateScope.USER:
        return 7 * 24 * 60 * 60 * 1000; // 7 days
      case StateScope.WORKFLOW:
        return 30 * 24 * 60 * 60 * 1000; // 30 days
      case StateScope.APPLICATION:
        return 0; // No expiration
      default:
        return 60 * 60 * 1000; // 1 hour default
    }
  }

  private async storeVersion<T>(scope: StateScope, key: string, value: T): Promise<void> {
    if (!this.configuration.versioning.enabled) return;

    try {
      // Get current version count
      const versions = await this.getVersions(scope, key);
      const newVersion = versions.length > 0 ? Math.max(...versions.map(v => v.version)) + 1 : 1;

      const versionKey = this.buildVersionKey(scope, key, newVersion);
      await cacheManager.set(versionKey, value, {
        namespace: 'state-versions',
        ttl: this.getStateTTL(scope)
      });

      // Clean up old versions if exceeded max
      if (versions.length >= this.configuration.versioning.maxVersions) {
        const versionsToDelete = versions.slice(this.configuration.versioning.maxVersions - 1);
        for (const versionToDelete of versionsToDelete) {
          const oldVersionKey = this.buildVersionKey(scope, key, versionToDelete.version);
          await cacheManager.delete(oldVersionKey, { namespace: 'state-versions' });
        }
      }
    } catch (error) {
      logger.error('Error storing state version:', error);
    }
  }

  private async emitStateEvent(event: Omit<IStateEvent, 'id' | 'timestamp'>): Promise<void> {
    const fullEvent: IStateEvent = {
      id: uuidv4(),
      timestamp: new Date(),
      ...event
    };

    // Add to event history
    this.eventHistory.push(fullEvent);
    if (this.eventHistory.length > this.maxEventHistory) {
      this.eventHistory = this.eventHistory.slice(-this.maxEventHistory);
    }

    this.metrics.totalEvents++;
    
    // Emit event
    super.emit('stateChanged', fullEvent);
  }

  private matchesSubscription(event: IStateEvent, subscription: IStateSubscription): boolean {
    if (event.scope !== subscription.scope) return false;
    
    if (subscription.pattern) {
      const regex = new RegExp(subscription.pattern.replace(/\*/g, '.*'));
      return regex.test(event.key);
    }

    return true;
  }

  private async syncStates(): Promise<void> {
    // States are automatically persisted by cache manager
    // This method can be extended for custom sync logic
    logger.debug('State sync completed');
  }

  private async collectMetrics(): Promise<void> {
    try {
      const metrics = await this.getMetrics();
      this.emit('metrics', metrics);
    } catch (error) {
      logger.error('Error collecting state metrics:', error);
    }
  }
}

// State Scope Implementation
class StateScope_Implementation implements IStateScope {
  constructor(
    private stateManager: EnterpriseStateManager,
    private scope: StateScope,
    private identifier: string
  ) {}

  async get<T>(key: string, defaultValue?: T): Promise<T | null> {
    const scopedKey = `${this.identifier}:${key}`;
    return this.stateManager.get(this.scope, scopedKey, defaultValue);
  }

  async set<T>(key: string, value: T, options?: IStateOptions): Promise<void> {
    const scopedKey = `${this.identifier}:${key}`;
    return this.stateManager.set(this.scope, scopedKey, value, options);
  }

  async delete(key: string): Promise<boolean> {
    const scopedKey = `${this.identifier}:${key}`;
    return this.stateManager.delete(this.scope, scopedKey);
  }

  async exists(key: string): Promise<boolean> {
    const scopedKey = `${this.identifier}:${key}`;
    return this.stateManager.exists(this.scope, scopedKey);
  }

  async clear(): Promise<void> {
    const pattern = `${this.identifier}:*`;
    await this.stateManager.deleteByPattern(this.scope, pattern);
  }

  async keys(): Promise<string[]> {
    const pattern = `${this.identifier}:*`;
    const states = await this.stateManager.getByPattern(this.scope, pattern);
    return Array.from(states.keys()).map(key => key.replace(`${this.identifier}:`, ''));
  }

  async size(): Promise<number> {
    const keys = await this.keys();
    return keys.length;
  }
}

// Export singleton instance
export const stateManager = new EnterpriseStateManager();