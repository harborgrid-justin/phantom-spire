/**
 * Frontend Integration Service
 * Advanced integration patterns for Next.js frontend with enterprise services
 * Provides real-time updates, caching, state synchronization, and API orchestration
 */

import { EventEmitter } from 'events';
import { enterpriseStateManager } from '..\..\state\enterprise-state-manager.service';
import { realTimeProcessingService } from '..\..\streaming\real-time-processing.service';
import { performanceMonitoringService } from '..\..\monitoring\performance-monitoring.service';
import { businessIntelligenceService } from '../analytics/business-intelligence.service';
import { complianceSecurityService } from '..\..\security\compliance-security.service';

// ==================== INTEGRATION TYPES ====================

export interface WebSocketConnection {
  id: string;
  userId: string;
  sessionId: string;
  subscriptions: string[];
  lastActivity: Date;
  metadata: Record<string, any>;
}

export interface CacheConfiguration {
  enabled: boolean;
  ttl: number; // Time to live in milliseconds
  maxSize: number;
  strategy: 'lru' | 'lfu' | 'fifo';
  compression: boolean;
  encryption: boolean;
}

export interface APIEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  handler: Function;
  middleware: string[];
  rateLimit?: {
    windowMs: number;
    max: number;
  };
  cache?: {
    enabled: boolean;
    ttl: number;
    key?: string;
  };
  auth?: {
    required: boolean;
    roles?: string[];
    permissions?: string[];
  };
}

export interface RealtimeEvent {
  type: string;
  payload: any;
  timestamp: Date;
  source: string;
  targets?: string[]; // Specific connection IDs or user IDs
  broadcast?: boolean; // Send to all connections
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata: {
    timestamp: string;
    requestId: string;
    version: string;
    executionTime: number;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CacheEntry {
  key: string;
  value: any;
  timestamp: Date;
  ttl: number;
  accessCount: number;
  lastAccessed: Date;
  size: number;
}

export interface APIMetrics {
  endpoint: string;
  method: string;
  totalRequests: number;
  averageResponseTime: number;
  errorRate: number;
  lastRequest: Date;
  cacheHitRate?: number;
}

// ==================== WEBSOCKET MANAGER ====================

export class WebSocketManager extends EventEmitter {
  private connections: Map<string, WebSocketConnection> = new Map();
  private subscriptionMap: Map<string, Set<string>> = new Map(); // topic -> connection IDs
  private heartbeatInterval?: NodeJS.Timeout;
  private cleanupInterval?: NodeJS.Timeout;

  constructor() {
    super();
    this.startHeartbeat();
    this.startCleanup();
  }

  addConnection(connectionData: Omit<WebSocketConnection, 'id' | 'lastActivity'>): string {
    const connectionId = `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const connection: WebSocketConnection = {
      id: connectionId,
      lastActivity: new Date(),
      ...connectionData
    };

    this.connections.set(connectionId, connection);
    this.emit('connection_added', { connectionId, connection });

    return connectionId;
  }

  removeConnection(connectionId: string): boolean {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      return false;
    }

    // Remove from all subscriptions
    connection.subscriptions.forEach(topic => {
      this.unsubscribe(connectionId, topic);
    });

    this.connections.delete(connectionId);
    this.emit('connection_removed', { connectionId, connection });

    return true;
  }

  subscribe(connectionId: string, topic: string): boolean {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      return false;
    }

    // Add to connection subscriptions
    if (!connection.subscriptions.includes(topic)) {
      connection.subscriptions.push(topic);
    }

    // Add to subscription map
    if (!this.subscriptionMap.has(topic)) {
      this.subscriptionMap.set(topic, new Set());
    }
    this.subscriptionMap.get(topic)!.add(connectionId);

    connection.lastActivity = new Date();
    this.emit('subscription_added', { connectionId, topic });

    return true;
  }

  unsubscribe(connectionId: string, topic: string): boolean {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      return false;
    }

    // Remove from connection subscriptions
    const index = connection.subscriptions.indexOf(topic);
    if (index > -1) {
      connection.subscriptions.splice(index, 1);
    }

    // Remove from subscription map
    const subscribers = this.subscriptionMap.get(topic);
    if (subscribers) {
      subscribers.delete(connectionId);
      if (subscribers.size === 0) {
        this.subscriptionMap.delete(topic);
      }
    }

    connection.lastActivity = new Date();
    this.emit('subscription_removed', { connectionId, topic });

    return true;
  }

  broadcastToTopic(topic: string, event: RealtimeEvent): number {
    const subscribers = this.subscriptionMap.get(topic);
    if (!subscribers || subscribers.size === 0) {
      return 0;
    }

    let sentCount = 0;
    subscribers.forEach(connectionId => {
      const connection = this.connections.get(connectionId);
      if (connection) {
        this.sendToConnection(connectionId, event);
        sentCount++;
      }
    });

    return sentCount;
  }

  broadcastToAll(event: RealtimeEvent): number {
    let sentCount = 0;
    this.connections.forEach((connection, connectionId) => {
      this.sendToConnection(connectionId, event);
      sentCount++;
    });

    return sentCount;
  }

  sendToConnection(connectionId: string, event: RealtimeEvent): boolean {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      return false;
    }

    // In a real implementation, this would send via WebSocket
    this.emit('message_sent', { connectionId, event });

    connection.lastActivity = new Date();
    return true;
  }

  sendToUser(userId: string, event: RealtimeEvent): number {
    let sentCount = 0;
    this.connections.forEach((connection, connectionId) => {
      if (connection.userId === userId) {
        this.sendToConnection(connectionId, event);
        sentCount++;
      }
    });

    return sentCount;
  }

  getConnection(connectionId: string): WebSocketConnection | undefined {
    return this.connections.get(connectionId);
  }

  getConnectionsByUser(userId: string): WebSocketConnection[] {
    return Array.from(this.connections.values()).filter(conn => conn.userId === userId);
  }

  getActiveConnections(): WebSocketConnection[] {
    return Array.from(this.connections.values());
  }

  getSubscribers(topic: string): string[] {
    const subscribers = this.subscriptionMap.get(topic);
    return subscribers ? Array.from(subscribers) : [];
  }

  getTopics(): string[] {
    return Array.from(this.subscriptionMap.keys());
  }

  updateConnectionActivity(connectionId: string): boolean {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      return false;
    }

    connection.lastActivity = new Date();
    return true;
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      const heartbeatEvent: RealtimeEvent = {
        type: 'heartbeat',
        payload: { timestamp: new Date().toISOString() },
        timestamp: new Date(),
        source: 'websocket_manager'
      };

      this.broadcastToAll(heartbeatEvent);
    }, 30000); // Every 30 seconds
  }

  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      const now = new Date();
      const timeout = 5 * 60 * 1000; // 5 minutes

      const staleConnections: string[] = [];
      this.connections.forEach((connection, connectionId) => {
        if (now.getTime() - connection.lastActivity.getTime() > timeout) {
          staleConnections.push(connectionId);
        }
      });

      staleConnections.forEach(connectionId => {
        this.removeConnection(connectionId);
      });

      if (staleConnections.length > 0) {
        this.emit('stale_connections_cleaned', { count: staleConnections.length });
      }
    }, 60000); // Every minute
  }

  getStatistics(): {
    totalConnections: number;
    activeTopics: number;
    averageSubscriptionsPerConnection: number;
    messagesSentLastHour: number;
  } {
    const totalConnections = this.connections.size;
    const activeTopics = this.subscriptionMap.size;
    const totalSubscriptions = Array.from(this.connections.values())
      .reduce((sum, conn) => sum + conn.subscriptions.length, 0);
    const averageSubscriptionsPerConnection = totalConnections > 0 ?
      totalSubscriptions / totalConnections : 0;

    return {
      totalConnections,
      activeTopics,
      averageSubscriptionsPerConnection,
      messagesSentLastHour: 0 // Would track in real implementation
    };
  }

  cleanup(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.connections.clear();
    this.subscriptionMap.clear();
  }
}

// ==================== CACHE MANAGER ====================

export class CacheManager extends EventEmitter {
  private cache: Map<string, CacheEntry> = new Map();
  private config: CacheConfiguration;
  private accessOrder: string[] = []; // For LRU
  private accessCount: Map<string, number> = new Map(); // For LFU
  private cleanupInterval?: NodeJS.Timeout;

  constructor(config: CacheConfiguration) {
    super();
    this.config = config;
    this.startCleanup();
  }

  set(key: string, value: any, ttl?: number): boolean {
    if (!this.config.enabled) {
      return false;
    }

    const effectiveTtl = ttl || this.config.ttl;
    const serializedValue = this.config.compression ? this.compress(value) : value;
    const size = this.calculateSize(serializedValue);

    // Check cache size limits
    if (this.cache.size >= this.config.maxSize) {
      this.evictEntries(1);
    }

    const entry: CacheEntry = {
      key,
      value: serializedValue,
      timestamp: new Date(),
      ttl: effectiveTtl,
      accessCount: 0,
      lastAccessed: new Date(),
      size
    };

    this.cache.set(key, entry);
    this.updateAccessOrder(key);

    this.emit('cache_set', { key, size, ttl: effectiveTtl });

    return true;
  }

  get(key: string): any {
    if (!this.config.enabled) {
      return undefined;
    }

    const entry = this.cache.get(key);
    if (!entry) {
      this.emit('cache_miss', { key });
      return undefined;
    }

    // Check if expired
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
      this.emit('cache_expired', { key });
      return undefined;
    }

    // Update access tracking
    entry.lastAccessed = new Date();
    entry.accessCount++;
    this.updateAccessOrder(key);
    this.accessCount.set(key, (this.accessCount.get(key) || 0) + 1);

    this.emit('cache_hit', { key, accessCount: entry.accessCount });

    return this.config.compression ? this.decompress(entry.value) : entry.value;
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.removeFromAccessOrder(key);
      this.accessCount.delete(key);
      this.emit('cache_deleted', { key });
    }
    return deleted;
  }

  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.accessOrder = [];
    this.accessCount.clear();
    this.emit('cache_cleared', { entriesCleared: size });
  }

  has(key: string): boolean {
    if (!this.config.enabled) {
      return false;
    }

    const entry = this.cache.get(key);
    if (!entry) {
      return false;
    }

    return !this.isExpired(entry);
  }

  keys(): string[] {
    return Array.from(this.cache.keys()).filter(key => {
      const entry = this.cache.get(key);
      return entry && !this.isExpired(entry);
    });
  }

  size(): number {
    return this.cache.size;
  }

  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    totalSize: number;
    oldestEntry?: Date;
    newestEntry?: Date;
  } {
    const entries = Array.from(this.cache.values());
    const totalSize = entries.reduce((sum, entry) => sum + entry.size, 0);

    const timestamps = entries.map(entry => entry.timestamp.getTime());
    const oldestEntry = timestamps.length > 0 ? new Date(Math.min(...timestamps)) : undefined;
    const newestEntry = timestamps.length > 0 ? new Date(Math.max(...timestamps)) : undefined;

    // Calculate hit rate (simplified)
    const totalAccesses = Array.from(this.accessCount.values()).reduce((sum, count) => sum + count, 0);
    const hitRate = totalAccesses > 0 ? (totalAccesses / (totalAccesses + 100)) * 100 : 0; // Simplified

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate,
      totalSize,
      oldestEntry,
      newestEntry
    };
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp.getTime() > entry.ttl;
  }

  private updateAccessOrder(key: string): void {
    this.removeFromAccessOrder(key);
    this.accessOrder.push(key);
  }

  private removeFromAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  }

  private evictEntries(count: number): void {
    const keysToEvict: string[] = [];

    switch (this.config.strategy) {
      case 'lru':
        keysToEvict.push(...this.accessOrder.slice(0, count));
        break;

      case 'lfu':
        const entriesByFrequency = Array.from(this.cache.keys())
          .map(key => ({ key, frequency: this.accessCount.get(key) || 0 }))
          .sort((a, b) => a.frequency - b.frequency);
        keysToEvict.push(...entriesByFrequency.slice(0, count).map(entry => entry.key));
        break;

      case 'fifo':
        const entriesByAge = Array.from(this.cache.entries())
          .sort((a, b) => a[1].timestamp.getTime() - b[1].timestamp.getTime());
        keysToEvict.push(...entriesByAge.slice(0, count).map(entry => entry[0]));
        break;
    }

    keysToEvict.forEach(key => {
      this.delete(key);
    });

    this.emit('cache_evicted', { keys: keysToEvict, strategy: this.config.strategy });
  }

  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      const expiredKeys: string[] = [];

      this.cache.forEach((entry, key) => {
        if (this.isExpired(entry)) {
          expiredKeys.push(key);
        }
      });

      expiredKeys.forEach(key => {
        this.delete(key);
      });

      if (expiredKeys.length > 0) {
        this.emit('cleanup_completed', { expiredKeys: expiredKeys.length });
      }
    }, 60000); // Every minute
  }

  private compress(value: any): any {
    // Simplified compression simulation
    return JSON.stringify(value);
  }

  private decompress(value: any): any {
    // Simplified decompression simulation
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  private calculateSize(value: any): number {
    // Simplified size calculation
    return JSON.stringify(value).length;
  }

  updateConfiguration(updates: Partial<CacheConfiguration>): void {
    Object.assign(this.config, updates);
    this.emit('configuration_updated', { config: this.config });
  }

  cleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
  }
}

// ==================== API ORCHESTRATOR ====================

export class APIOrchestrator extends EventEmitter {
  private endpoints: Map<string, APIEndpoint> = new Map();
  private metrics: Map<string, APIMetrics> = new Map();
  private cache: CacheManager;
  private isInitialized = false;

  constructor(cacheConfig: CacheConfiguration) {
    super();
    this.cache = new CacheManager(cacheConfig);
    this.registerDefaultEndpoints();
  }

  private registerDefaultEndpoints(): void {
    // System endpoints
    this.registerEndpoint({
      path: '/api/system/health',
      method: 'GET',
      handler: this.handleSystemHealth.bind(this),
      middleware: ['cors', 'rateLimit'],
      cache: { enabled: true, ttl: 30000 }, // 30 seconds
      auth: { required: false }
    });

    this.registerEndpoint({
      path: '/api/system/status',
      method: 'GET',
      handler: this.handleSystemStatus.bind(this),
      middleware: ['cors', 'auth', 'rateLimit'],
      cache: { enabled: true, ttl: 60000 }, // 1 minute
      auth: { required: true, roles: ['user', 'admin'] }
    });

    // Model endpoints
    this.registerEndpoint({
      path: '/api/models',
      method: 'GET',
      handler: this.handleGetModels.bind(this),
      middleware: ['cors', 'auth', 'rateLimit'],
      cache: { enabled: true, ttl: 300000 }, // 5 minutes
      auth: { required: true }
    });

    this.registerEndpoint({
      path: '/api/models/:id',
      method: 'GET',
      handler: this.handleGetModel.bind(this),
      middleware: ['cors', 'auth', 'rateLimit'],
      cache: { enabled: true, ttl: 600000 }, // 10 minutes
      auth: { required: true }
    });

    this.registerEndpoint({
      path: '/api/models/:id/predict',
      method: 'POST',
      handler: this.handleModelPredict.bind(this),
      middleware: ['cors', 'auth', 'rateLimit', 'validation'],
      auth: { required: true, permissions: ['predict'] }
    });

    // Analytics endpoints
    this.registerEndpoint({
      path: '/api/analytics/performance',
      method: 'GET',
      handler: this.handlePerformanceAnalytics.bind(this),
      middleware: ['cors', 'auth', 'rateLimit'],
      cache: { enabled: true, ttl: 120000 }, // 2 minutes
      auth: { required: true, roles: ['analyst', 'admin'] }
    });

    this.registerEndpoint({
      path: '/api/analytics/business-metrics',
      method: 'GET',
      handler: this.handleBusinessMetrics.bind(this),
      middleware: ['cors', 'auth', 'rateLimit'],
      cache: { enabled: true, ttl: 300000 }, // 5 minutes
      auth: { required: true, roles: ['manager', 'admin'] }
    });

    // Security endpoints
    this.registerEndpoint({
      path: '/api/security/scan',
      method: 'POST',
      handler: this.handleSecurityScan.bind(this),
      middleware: ['cors', 'auth', 'rateLimit'],
      auth: { required: true, roles: ['security', 'admin'] }
    });

    this.registerEndpoint({
      path: '/api/security/vulnerabilities',
      method: 'GET',
      handler: this.handleGetVulnerabilities.bind(this),
      middleware: ['cors', 'auth', 'rateLimit'],
      cache: { enabled: true, ttl: 180000 }, // 3 minutes
      auth: { required: true, roles: ['security', 'admin'] }
    });

    // Monitoring endpoints
    this.registerEndpoint({
      path: '/api/monitoring/metrics',
      method: 'GET',
      handler: this.handleGetMetrics.bind(this),
      middleware: ['cors', 'auth', 'rateLimit'],
      cache: { enabled: true, ttl: 30000 }, // 30 seconds
      auth: { required: true }
    });

    this.registerEndpoint({
      path: '/api/monitoring/alerts',
      method: 'GET',
      handler: this.handleGetAlerts.bind(this),
      middleware: ['cors', 'auth', 'rateLimit'],
      cache: { enabled: true, ttl: 60000 }, // 1 minute
      auth: { required: true }
    });
  }

  registerEndpoint(endpoint: APIEndpoint): void {
    const key = `${endpoint.method}:${endpoint.path}`;
    this.endpoints.set(key, endpoint);

    // Initialize metrics
    this.metrics.set(key, {
      endpoint: endpoint.path,
      method: endpoint.method,
      totalRequests: 0,
      averageResponseTime: 0,
      errorRate: 0,
      lastRequest: new Date(),
      cacheHitRate: endpoint.cache?.enabled ? 0 : undefined
    });

    this.emit('endpoint_registered', { endpoint });
  }

  async handleRequest(
    path: string,
    method: string,
    body?: any,
    query?: Record<string, any>,
    headers?: Record<string, string>
  ): Promise<APIResponse> {
    const startTime = Date.now();
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Find matching endpoint
      const endpoint = this.findEndpoint(path, method);
      if (!endpoint) {
        return this.createErrorResponse('ENDPOINT_NOT_FOUND', 'Endpoint not found', requestId, startTime);
      }

      // Check cache if enabled
      const cacheKey = this.generateCacheKey(path, method, query);
      if (endpoint.cache?.enabled && method === 'GET') {
        const cachedResponse = this.cache.get(cacheKey);
        if (cachedResponse) {
          this.updateMetrics(endpoint, startTime, true, false);
          return {
            ...cachedResponse,
            metadata: {
              ...cachedResponse.metadata,
              requestId,
              executionTime: Date.now() - startTime
            }
          };
        }
      }

      // Execute handler
      const result = await endpoint.handler(body, query, headers);

      const response: APIResponse = {
        success: true,
        data: result,
        metadata: {
          timestamp: new Date().toISOString(),
          requestId,
          version: '1.0.0',
          executionTime: Date.now() - startTime
        }
      };

      // Cache response if enabled
      if (endpoint.cache?.enabled && method === 'GET') {
        this.cache.set(cacheKey, response, endpoint.cache.ttl);
      }

      this.updateMetrics(endpoint, startTime, false, false);
      return response;

    } catch (error) {
      const errorResponse = this.createErrorResponse(
        'INTERNAL_ERROR',
        error instanceof Error ? error.message : 'Unknown error',
        requestId,
        startTime
      );

      // Update metrics for error
      const endpoint = this.findEndpoint(path, method);
      if (endpoint) {
        this.updateMetrics(endpoint, startTime, false, true);
      }

      return errorResponse;
    }
  }

  private findEndpoint(path: string, method: string): APIEndpoint | undefined {
    const key = `${method}:${path}`;
    let endpoint = this.endpoints.get(key);

    if (!endpoint) {
      // Try to match with path parameters
      for (const [endpointKey, endpointValue] of this.endpoints.entries()) {
        const [endpointMethod, endpointPath] = endpointKey.split(':');
        if (endpointMethod === method && this.pathMatches(path, endpointPath)) {
          endpoint = endpointValue;
          break;
        }
      }
    }

    return endpoint;
  }

  private pathMatches(requestPath: string, endpointPath: string): boolean {
    const requestSegments = requestPath.split('/');
    const endpointSegments = endpointPath.split('/');

    if (requestSegments.length !== endpointSegments.length) {
      return false;
    }

    return endpointSegments.every((segment, index) => {
      return segment.startsWith(':') || segment === requestSegments[index];
    });
  }

  private generateCacheKey(path: string, method: string, query?: Record<string, any>): string {
    const queryString = query ? JSON.stringify(query) : '';
    return `api_${method}_${path}_${queryString}`;
  }

  private updateMetrics(
    endpoint: APIEndpoint,
    startTime: number,
    cacheHit: boolean,
    isError: boolean
  ): void {
    const key = `${endpoint.method}:${endpoint.path}`;
    const metrics = this.metrics.get(key);
    if (!metrics) {
      return;
    }

    const responseTime = Date.now() - startTime;

    metrics.totalRequests++;
    metrics.averageResponseTime = (metrics.averageResponseTime + responseTime) / 2;
    metrics.lastRequest = new Date();

    if (isError) {
      metrics.errorRate = (metrics.errorRate + 1) / metrics.totalRequests;
    }

    if (metrics.cacheHitRate !== undefined) {
      const hitRate = cacheHit ? 1 : 0;
      metrics.cacheHitRate = (metrics.cacheHitRate + hitRate) / metrics.totalRequests;
    }

    this.metrics.set(key, metrics);
  }

  private createErrorResponse(
    code: string,
    message: string,
    requestId: string,
    startTime: number
  ): APIResponse {
    return {
      success: false,
      error: {
        code,
        message
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId,
        version: '1.0.0',
        executionTime: Date.now() - startTime
      }
    };
  }

  // ==================== ENDPOINT HANDLERS ====================

  private async handleSystemHealth(): Promise<any> {
    return performanceMonitoringService.getSystemHealth();
  }

  private async handleSystemStatus(): Promise<any> {
    const systemState = enterpriseStateManager.getSystemState();
    const statistics = enterpriseStateManager.getStatistics();

    return {
      system: systemState,
      statistics,
      timestamp: new Date().toISOString()
    };
  }

  private async handleGetModels(body?: any, query?: Record<string, any>): Promise<any> {
    const models = enterpriseStateManager.getAllModels();

    // Apply filters if provided
    let filteredModels = models;
    if (query?.status) {
      filteredModels = models.filter(model => model.status === query.status);
    }
    if (query?.search) {
      filteredModels = filteredModels.filter(model =>
        model.name.toLowerCase().includes(query.search.toLowerCase())
      );
    }

    // Apply pagination
    const page = parseInt(query?.page || '1');
    const limit = parseInt(query?.limit || '10');
    const start = (page - 1) * limit;
    const paginatedModels = filteredModels.slice(start, start + limit);

    return {
      models: paginatedModels,
      pagination: {
        page,
        limit,
        total: filteredModels.length,
        hasNext: start + limit < filteredModels.length,
        hasPrev: page > 1
      }
    };
  }

  private async handleGetModel(body?: any, query?: Record<string, any>, headers?: Record<string, string>): Promise<any> {
    // Extract model ID from path (simplified)
    const modelId = query?.id || 'default_model';
    const model = enterpriseStateManager.getModel(modelId);

    if (!model) {
      throw new Error(`Model ${modelId} not found`);
    }

    return model;
  }

  private async handleModelPredict(body?: any): Promise<any> {
    if (!body || !body.modelId || !body.data) {
      throw new Error('Missing required fields: modelId, data');
    }

    // Validate model exists
    const model = enterpriseStateManager.getModel(body.modelId);
    if (!model) {
      throw new Error(`Model ${body.modelId} not found`);
    }

    // Perform prediction (simplified)
    return {
      modelId: body.modelId,
      prediction: Math.random() * 100,
      confidence: 0.85 + Math.random() * 0.15,
      timestamp: new Date().toISOString()
    };
  }

  private async handlePerformanceAnalytics(): Promise<any> {
    return performanceMonitoringService.generatePerformanceReport();
  }

  private async handleBusinessMetrics(): Promise<any> {
    return businessIntelligenceService.generateBusinessMetrics();
  }

  private async handleSecurityScan(body?: any): Promise<any> {
    const scope = body?.scope || 'all';
    return complianceSecurityService.performSecurityScan(scope);
  }

  private async handleGetVulnerabilities(body?: any, query?: Record<string, any>): Promise<any> {
    const filter: any = {};
    if (query?.severity) filter.severity = query.severity;
    if (query?.status) filter.status = query.status;
    if (query?.type) filter.type = query.type;

    return complianceSecurityService.getSecurityVulnerabilities(filter);
  }

  private async handleGetMetrics(body?: any, query?: Record<string, any>): Promise<any> {
    const metricName = query?.metric;
    const timeRange = query?.timeRange ? {
      start: new Date(query.timeRange.start),
      end: new Date(query.timeRange.end)
    } : undefined;

    return performanceMonitoringService.getMetrics(metricName, timeRange);
  }

  private async handleGetAlerts(body?: any, query?: Record<string, any>): Promise<any> {
    const activeOnly = query?.activeOnly === 'true';
    return performanceMonitoringService.getAlerts(activeOnly);
  }

  // ==================== UTILITIES ====================

  getEndpoints(): APIEndpoint[] {
    return Array.from(this.endpoints.values());
  }

  getMetrics(): APIMetrics[] {
    return Array.from(this.metrics.values());
  }

  getEndpointMetrics(path: string, method: string): APIMetrics | undefined {
    const key = `${method}:${path}`;
    return this.metrics.get(key);
  }

  getCacheStats(): any {
    return this.cache.getStats();
  }

  clearCache(): void {
    this.cache.clear();
  }

  cleanup(): void {
    this.cache.cleanup();
    this.endpoints.clear();
    this.metrics.clear();
  }
}

// ==================== FRONTEND INTEGRATION SERVICE ====================

export class FrontendIntegrationService extends EventEmitter {
  private webSocketManager: WebSocketManager;
  private apiOrchestrator: APIOrchestrator;
  private isInitialized = false;
  private eventSubscriptions: Map<string, Function> = new Map();

  constructor(cacheConfig?: Partial<CacheConfiguration>) {
    super();

    const defaultCacheConfig: CacheConfiguration = {
      enabled: true,
      ttl: 300000, // 5 minutes
      maxSize: 1000,
      strategy: 'lru',
      compression: true,
      encryption: false,
      ...cacheConfig
    };

    this.webSocketManager = new WebSocketManager();
    this.apiOrchestrator = new APIOrchestrator(defaultCacheConfig);

    this.setupEventForwarding();
  }

  private setupEventForwarding(): void {
    // Forward WebSocket events
    this.webSocketManager.on('connection_added', (event) => {
      this.emit('websocket_connection_added', event);
    });

    this.webSocketManager.on('connection_removed', (event) => {
      this.emit('websocket_connection_removed', event);
    });

    this.webSocketManager.on('message_sent', (event) => {
      this.emit('websocket_message_sent', event);
    });

    // Forward API events
    this.apiOrchestrator.on('endpoint_registered', (event) => {
      this.emit('api_endpoint_registered', event);
    });

    // Subscribe to enterprise service events
    this.subscribeToEnterpriseEvents();
  }

  private subscribeToEnterpriseEvents(): void {
    // Subscribe to state changes
    this.eventSubscriptions.set('state_changed', (event) => {
      this.broadcastRealtimeEvent({
        type: 'state_changed',
        payload: event,
        timestamp: new Date(),
        source: 'enterprise_state',
        broadcast: true
      });
    });

    // Subscribe to performance monitoring events
    this.eventSubscriptions.set('alert_triggered', (alert) => {
      this.broadcastRealtimeEvent({
        type: 'alert_triggered',
        payload: alert,
        timestamp: new Date(),
        source: 'performance_monitoring'
      });
    });

    this.eventSubscriptions.set('health_updated', (event) => {
      this.broadcastRealtimeEvent({
        type: 'health_updated',
        payload: event.health,
        timestamp: new Date(),
        source: 'health_monitor'
      });
    });

    // Subscribe to optimization events
    this.eventSubscriptions.set('optimization_completed', (event) => {
      this.broadcastRealtimeEvent({
        type: 'optimization_completed',
        payload: event,
        timestamp: new Date(),
        source: 'performance_optimizer'
      });
    });

    // Subscribe to security events
    this.eventSubscriptions.set('security_scan_completed', (event) => {
      this.broadcastRealtimeEvent({
        type: 'security_scan_completed',
        payload: event,
        timestamp: new Date(),
        source: 'security_scanner'
      });
    });

    // Subscribe to analytics events
    this.eventSubscriptions.set('metrics_generated', (event) => {
      this.broadcastRealtimeEvent({
        type: 'business_metrics_updated',
        payload: event.metrics,
        timestamp: new Date(),
        source: 'business_intelligence'
      });
    });

    // Actually set up the subscriptions
    enterpriseStateManager.on('state_changed', this.eventSubscriptions.get('state_changed')!);
    performanceMonitoringService.on('alert_triggered', this.eventSubscriptions.get('alert_triggered')!);
    performanceMonitoringService.on('health_updated', this.eventSubscriptions.get('health_updated')!);
    performanceMonitoringService.on('optimization_completed', this.eventSubscriptions.get('optimization_completed')!);
    complianceSecurityService.on('security_scan_completed', this.eventSubscriptions.get('security_scan_completed')!);
    businessIntelligenceService.on('metrics_generated', this.eventSubscriptions.get('metrics_generated')!);
  }

  async initialize(): Promise<void> {
    try {
      this.isInitialized = true;
      this.emit('initialized');
      console.log('✅ Frontend Integration Service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize frontend integration service:', error);
      throw error;
    }
  }

  // ==================== WEBSOCKET API ====================

  addWebSocketConnection(connectionData: Omit<WebSocketConnection, 'id' | 'lastActivity'>): string {
    return this.webSocketManager.addConnection(connectionData);
  }

  removeWebSocketConnection(connectionId: string): boolean {
    return this.webSocketManager.removeConnection(connectionId);
  }

  subscribeToTopic(connectionId: string, topic: string): boolean {
    return this.webSocketManager.subscribe(connectionId, topic);
  }

  unsubscribeFromTopic(connectionId: string, topic: string): boolean {
    return this.webSocketManager.unsubscribe(connectionId, topic);
  }

  broadcastRealtimeEvent(event: RealtimeEvent): number {
    if (event.broadcast) {
      return this.webSocketManager.broadcastToAll(event);
    }

    if (event.targets) {
      let sentCount = 0;
      event.targets.forEach(target => {
        if (target.startsWith('user_')) {
          const userId = target.replace('user_', '');
          sentCount += this.webSocketManager.sendToUser(userId, event);
        } else {
          sentCount += this.webSocketManager.sendToConnection(target, event) ? 1 : 0;
        }
      });
      return sentCount;
    }

    // Default to broadcasting to all if no specific targets
    return this.webSocketManager.broadcastToAll(event);
  }

  broadcastToTopic(topic: string, event: RealtimeEvent): number {
    return this.webSocketManager.broadcastToTopic(topic, event);
  }

  getWebSocketConnections(): WebSocketConnection[] {
    return this.webSocketManager.getActiveConnections();
  }

  getWebSocketStatistics(): any {
    return this.webSocketManager.getStatistics();
  }

  // ==================== API API ====================

  async handleAPIRequest(
    path: string,
    method: string,
    body?: any,
    query?: Record<string, any>,
    headers?: Record<string, string>
  ): Promise<APIResponse> {
    if (!this.isInitialized) {
      throw new Error('Service not initialized');
    }

    return this.apiOrchestrator.handleRequest(path, method, body, query, headers);
  }

  registerAPIEndpoint(endpoint: APIEndpoint): void {
    this.apiOrchestrator.registerEndpoint(endpoint);
  }

  getAPIEndpoints(): APIEndpoint[] {
    return this.apiOrchestrator.getEndpoints();
  }

  getAPIMetrics(): APIMetrics[] {
    return this.apiOrchestrator.getMetrics();
  }

  getCacheStatistics(): any {
    return this.apiOrchestrator.getCacheStats();
  }

  clearAPICache(): void {
    this.apiOrchestrator.clearCache();
  }

  // ==================== INTEGRATION UTILITIES ====================

  async createDashboardData(): Promise<{
    systemHealth: any;
    realtimeMetrics: any;
    alerts: any;
    models: any;
    analytics: any;
  }> {
    const [systemHealth, alerts, models, analytics] = await Promise.all([
      this.handleAPIRequest('/api/system/health', 'GET'),
      this.handleAPIRequest('/api/monitoring/alerts', 'GET', undefined, { activeOnly: 'true' }),
      this.handleAPIRequest('/api/models', 'GET', undefined, { limit: '5' }),
      this.handleAPIRequest('/api/analytics/business-metrics', 'GET')
    ]);

    const realtimeMetrics = performanceMonitoringService.getCurrentMetrics();

    return {
      systemHealth: systemHealth.data,
      realtimeMetrics,
      alerts: alerts.data,
      models: models.data,
      analytics: analytics.data
    };
  }

  async setupRealtimeUpdates(connectionId: string, preferences: {
    systemHealth?: boolean;
    alerts?: boolean;
    metrics?: boolean;
    models?: boolean;
    analytics?: boolean;
  }): Promise<boolean> {
    const topics: string[] = [];

    if (preferences.systemHealth) topics.push('system_health');
    if (preferences.alerts) topics.push('alerts');
    if (preferences.metrics) topics.push('metrics');
    if (preferences.models) topics.push('models');
    if (preferences.analytics) topics.push('analytics');

    let allSuccessful = true;
    topics.forEach(topic => {
      if (!this.subscribeToTopic(connectionId, topic)) {
        allSuccessful = false;
      }
    });

    return allSuccessful;
  }

  generateAPIDocumentation(): {
    endpoints: Array<{
      path: string;
      method: string;
      description: string;
      auth: any;
      cache: any;
      rateLimit: any;
    }>;
    statistics: {
      totalEndpoints: number;
      authRequired: number;
      cached: number;
      rateLimited: number;
    };
  } {
    const endpoints = this.getAPIEndpoints();

    const documentation = endpoints.map(endpoint => ({
      path: endpoint.path,
      method: endpoint.method,
      description: this.generateEndpointDescription(endpoint),
      auth: endpoint.auth,
      cache: endpoint.cache,
      rateLimit: endpoint.rateLimit
    }));

    const statistics = {
      totalEndpoints: endpoints.length,
      authRequired: endpoints.filter(e => e.auth?.required).length,
      cached: endpoints.filter(e => e.cache?.enabled).length,
      rateLimited: endpoints.filter(e => e.rateLimit).length
    };

    return { endpoints: documentation, statistics };
  }

  private generateEndpointDescription(endpoint: APIEndpoint): string {
    const descriptions: Record<string, string> = {
      '/api/system/health': 'Get system health status and component information',
      '/api/system/status': 'Get detailed system status including state and statistics',
      '/api/models': 'List all models with optional filtering and pagination',
      '/api/models/:id': 'Get detailed information about a specific model',
      '/api/models/:id/predict': 'Make predictions using a specific model',
      '/api/analytics/performance': 'Get performance analytics and reports',
      '/api/analytics/business-metrics': 'Get business intelligence metrics and KPIs',
      '/api/security/scan': 'Initiate a security scan',
      '/api/security/vulnerabilities': 'Get security vulnerabilities with filtering',
      '/api/monitoring/metrics': 'Get system and performance metrics',
      '/api/monitoring/alerts': 'Get system alerts and notifications'
    };

    return descriptions[endpoint.path] || 'API endpoint';
  }

  getIntegrationStatistics(): {
    websocket: any;
    api: any;
    cache: any;
    realtime: {
      activeTopics: number;
      totalSubscriptions: number;
      eventsProcessedLastHour: number;
    };
  } {
    const websocketStats = this.getWebSocketStatistics();
    const apiMetrics = this.getAPIMetrics();
    const cacheStats = this.getCacheStatistics();

    const totalRequests = apiMetrics.reduce((sum, metric) => sum + metric.totalRequests, 0);
    const averageResponseTime = apiMetrics.reduce((sum, metric) => sum + metric.averageResponseTime, 0) / apiMetrics.length;
    const totalErrors = apiMetrics.reduce((sum, metric) => sum + (metric.totalRequests * metric.errorRate), 0);

    return {
      websocket: websocketStats,
      api: {
        totalEndpoints: apiMetrics.length,
        totalRequests,
        averageResponseTime: averageResponseTime || 0,
        errorRate: totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0,
        cacheHitRate: cacheStats.hitRate
      },
      cache: cacheStats,
      realtime: {
        activeTopics: websocketStats.activeTopics,
        totalSubscriptions: websocketStats.totalConnections * websocketStats.averageSubscriptionsPerConnection,
        eventsProcessedLastHour: 0 // Would track in real implementation
      }
    };
  }

  async cleanup(): Promise<void> {
    // Unsubscribe from enterprise events
    this.eventSubscriptions.forEach((handler, event) => {
      try {
        enterpriseStateManager.off('state_changed', handler);
        performanceMonitoringService.off('alert_triggered', handler);
        performanceMonitoringService.off('health_updated', handler);
        performanceMonitoringService.off('optimization_completed', handler);
        complianceSecurityService.off('security_scan_completed', handler);
        businessIntelligenceService.off('metrics_generated', handler);
      } catch (error) {
        console.warn('Error unsubscribing from event:', error);
      }
    });

    this.webSocketManager.cleanup();
    this.apiOrchestrator.cleanup();
    this.eventSubscriptions.clear();
    this.isInitialized = false;
    this.emit('cleanup');
  }
}

// ==================== DEFAULT CONFIGURATION ====================

export const defaultCacheConfiguration: CacheConfiguration = {
  enabled: true,
  ttl: 300000, // 5 minutes
  maxSize: 1000,
  strategy: 'lru',
  compression: true,
  encryption: false
};

// Export singleton instance
export const frontendIntegrationService = new FrontendIntegrationService(defaultCacheConfiguration);
export default frontendIntegrationService;