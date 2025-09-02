/**
 * Fortune 100-Grade State Management Interfaces
 * Enterprise-level state management system for Cyber Threat Intelligence Platform
 */

export enum StateScope {
  APPLICATION = 'application',
  SESSION = 'session',
  USER = 'user',
  WORKFLOW = 'workflow',
  TASK = 'task',
  ORGANIZATION = 'organization',
}

export enum StateAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  MERGE = 'merge',
  RESET = 'reset',
}

export interface IStateEvent {
  id: string;
  timestamp: Date;
  scope: StateScope;
  action: StateAction;
  key: string;
  previousValue?: any;
  newValue?: any;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

export interface IStateSubscription {
  id: string;
  scope: StateScope;
  pattern?: string;
  callback: (event: IStateEvent) => void | Promise<void>;
  once?: boolean;
}

export interface IStateConfiguration {
  persistence: {
    enabled: boolean;
    strategy: 'memory' | 'redis' | 'database' | 'hybrid';
    syncInterval: number;
  };
  serialization: {
    enabled: boolean;
    format: 'json' | 'binary';
  };
  versioning: {
    enabled: boolean;
    maxVersions: number;
  };
  validation: {
    enabled: boolean;
    strict: boolean;
  };
  monitoring: {
    enabled: boolean;
    trackChanges: boolean;
    metricsInterval: number;
  };
  security: {
    enabled: boolean;
    encryption: boolean;
    accessControl: boolean;
  };
}

export interface IStateMetrics {
  totalStates: number;
  totalEvents: number;
  memoryUsage: number;
  lastSyncTime?: Date;
  syncErrors: number;
  subscriptions: number;
}

export interface IStateManager {
  // Core state operations
  get<T>(scope: StateScope, key: string, defaultValue?: T): Promise<T | null>;
  set<T>(
    scope: StateScope,
    key: string,
    value: T,
    options?: IStateOptions
  ): Promise<void>;
  delete(scope: StateScope, key: string): Promise<boolean>;
  exists(scope: StateScope, key: string): Promise<boolean>;

  // Bulk operations
  getMultiple<T>(scope: StateScope, keys: string[]): Promise<Map<string, T>>;
  setMultiple<T>(
    scope: StateScope,
    entries: Map<string, T>,
    options?: IStateOptions
  ): Promise<void>;
  deleteMultiple(scope: StateScope, keys: string[]): Promise<number>;

  // Pattern-based operations
  getByPattern<T>(scope: StateScope, pattern: string): Promise<Map<string, T>>;
  deleteByPattern(scope: StateScope, pattern: string): Promise<number>;

  // State merging and updating
  merge<T>(scope: StateScope, key: string, value: Partial<T>): Promise<void>;
  update<T>(
    scope: StateScope,
    key: string,
    updater: (current: T) => T
  ): Promise<void>;

  // State scoping and isolation
  createScope(scope: StateScope, identifier: string): Promise<IStateScope>;
  deleteScope(scope: StateScope, identifier: string): Promise<boolean>;
  listScopes(scope: StateScope): Promise<string[]>;

  // Event system
  subscribe(subscription: Omit<IStateSubscription, 'id'>): Promise<string>;
  unsubscribe(subscriptionId: string): Promise<boolean>;
  emit(event: Omit<IStateEvent, 'id' | 'timestamp'>): Promise<void>;

  // State persistence and synchronization
  persist(scope?: StateScope): Promise<void>;
  restore(scope?: StateScope): Promise<void>;
  sync(): Promise<void>;

  // State versioning
  getVersion(scope: StateScope, key: string, version?: number): Promise<any>;
  getVersions(
    scope: StateScope,
    key: string
  ): Promise<Array<{ version: number; timestamp: Date; value: any }>>;
  revert(scope: StateScope, key: string, version: number): Promise<void>;

  // Analytics and monitoring
  getMetrics(): Promise<IStateMetrics>;
  getStateHistory(
    scope: StateScope,
    key: string,
    limit?: number
  ): Promise<IStateEvent[]>;

  // Configuration and lifecycle
  configure(config: Partial<IStateConfiguration>): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;

  // Utility methods
  clear(scope?: StateScope): Promise<void>;
  validate<T>(scope: StateScope, key: string, value: T): Promise<boolean>;
  serialize(value: any): string;
  deserialize<T>(data: string): T;
}

export interface IStateOptions {
  persist?: boolean;
  version?: boolean;
  validate?: boolean;
  encrypt?: boolean;
  ttl?: number;
  metadata?: Record<string, any>;
}

export interface IStateScope {
  get<T>(key: string, defaultValue?: T): Promise<T | null>;
  set<T>(key: string, value: T, options?: IStateOptions): Promise<void>;
  delete(key: string): Promise<boolean>;
  exists(key: string): Promise<boolean>;
  clear(): Promise<void>;
  keys(): Promise<string[]>;
  size(): Promise<number>;
}

export interface IStatePersistence {
  load(scope: StateScope, identifier?: string): Promise<Map<string, any>>;
  save(
    scope: StateScope,
    data: Map<string, any>,
    identifier?: string
  ): Promise<void>;
  delete(scope: StateScope, identifier?: string): Promise<boolean>;
  exists(scope: StateScope, identifier?: string): Promise<boolean>;
}
