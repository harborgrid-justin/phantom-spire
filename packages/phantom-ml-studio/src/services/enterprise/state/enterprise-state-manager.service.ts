/**
 * Enterprise State Management Service
 * Comprehensive state management for enterprise ML operations
 * Handles models, experiments, deployments, configurations, and system state
 */

import { EventEmitter } from 'events';
import { persistenceService } from '../persistence/enterprise-persistence.service';
import { realTimeProcessingService } from '../streaming/real-time-processing.service';

// ==================== STATE TYPES ====================

export interface SystemState {
  initialized: boolean;
  status: 'healthy' | 'degraded' | 'critical' | 'maintenance';
  uptime: number;
  version: string;
  lastHealthCheck: Date;
  components: {
    mlCore: ComponentStatus;
    persistence: ComponentStatus;
    streaming: ComponentStatus;
    analytics: ComponentStatus;
    security: ComponentStatus;
  };
  resources: {
    cpu: ResourceMetrics;
    memory: ResourceMetrics;
    disk: ResourceMetrics;
    network: ResourceMetrics;
  };
  configuration: SystemConfiguration;
}

export interface ComponentStatus {
  status: 'healthy' | 'degraded' | 'critical' | 'offline';
  lastCheck: Date;
  uptime: number;
  version?: string;
  metrics?: Record<string, number>;
  errors?: string[];
}

export interface ResourceMetrics {
  current: number;
  available: number;
  utilization: number; // percentage
  threshold: {
    warning: number;
    critical: number;
  };
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface SystemConfiguration {
  environment: 'development' | 'staging' | 'production';
  features: string[];
  limits: {
    maxModels: number;
    maxStreams: number;
    maxConcurrentJobs: number;
    maxMemoryUsage: number;
  };
  security: {
    encryptionEnabled: boolean;
    auditLevel: string;
    accessControl: boolean;
  };
  performance: {
    cacheEnabled: boolean;
    compressionEnabled: boolean;
    optimizationsEnabled: boolean;
  };
}

export interface ModelState {
  id: string;
  name: string;
  status: 'training' | 'trained' | 'deployed' | 'archived' | 'failed';
  version: string;
  lifecycle: {
    created: Date;
    lastTrained?: Date;
    lastDeployed?: Date;
    lastAccessed?: Date;
  };
  performance: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    inferenceTime: number;
  };
  deployment: {
    environment?: string;
    endpoint?: string;
    instances: number;
    resources: Record<string, number>;
  };
  monitoring: {
    predictions: number;
    errors: number;
    lastError?: Date;
    datadrift?: number;
    performanceDrift?: number;
  };
  configuration: Record<string, any>;
  metadata: Record<string, any>;
}

export interface ExperimentState {
  id: string;
  name: string;
  description: string;
  status: 'created' | 'running' | 'completed' | 'failed' | 'cancelled';
  type: 'training' | 'hyperparameter_tuning' | 'ablation' | 'comparison';
  progress: {
    current: number;
    total: number;
    percentage: number;
  };
  runs: ExperimentRun[];
  bestRun?: string;
  metrics: Record<string, number>;
  configuration: ExperimentConfiguration;
  results?: ExperimentResults;
  timeline: {
    created: Date;
    started?: Date;
    completed?: Date;
    duration?: number;
  };
}

export interface ExperimentRun {
  id: string;
  experimentId: string;
  status: 'running' | 'completed' | 'failed';
  parameters: Record<string, any>;
  metrics: Record<string, number>;
  artifacts: string[];
  logs: string[];
  startTime: Date;
  endTime?: Date;
  duration?: number;
}

export interface ExperimentConfiguration {
  algorithm: string;
  dataset: string;
  validation: {
    strategy: string;
    splitRatio: number;
  };
  hyperparameters: Record<string, any>;
  objectives: string[];
  constraints: Record<string, any>;
}

export interface ExperimentResults {
  bestParameters: Record<string, any>;
  bestMetrics: Record<string, number>;
  convergence: boolean;
  insights: string[];
  recommendations: string[];
}

export interface DeploymentState {
  id: string;
  modelId: string;
  name: string;
  environment: 'development' | 'staging' | 'production';
  status: 'pending' | 'deploying' | 'deployed' | 'failed' | 'stopped';
  version: string;
  endpoint: {
    url: string;
    method: string;
    authentication: string;
  };
  infrastructure: {
    provider: string;
    region: string;
    instances: number;
    resources: Record<string, any>;
  };
  monitoring: {
    health: 'healthy' | 'unhealthy' | 'unknown';
    uptime: number;
    requests: number;
    errors: number;
    latency: {
      p50: number;
      p95: number;
      p99: number;
    };
  };
  scaling: {
    enabled: boolean;
    minInstances: number;
    maxInstances: number;
    targetUtilization: number;
    currentUtilization: number;
  };
  timeline: {
    created: Date;
    deployed?: Date;
    lastUpdate?: Date;
  };
}

// ==================== STATE EVENTS ====================

export interface StateChangeEvent {
  type: 'system' | 'model' | 'experiment' | 'deployment';
  action: 'created' | 'updated' | 'deleted' | 'status_changed';
  resourceId: string;
  oldState?: any;
  newState: any;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// ==================== STATE STORE ====================

export class StateStore extends EventEmitter {
  private data: Map<string, any> = new Map();
  private subscriptions: Map<string, Set<(data: any) => void>> = new Map();
  private history: StateChangeEvent[] = [];
  private maxHistorySize = 1000;

  set<T>(key: string, value: T): void {
    const oldValue = this.data.get(key);
    this.data.set(key, value);

    // Record change
    const event: StateChangeEvent = {
      type: this.getTypeFromKey(key),
      action: oldValue ? 'updated' : 'created',
      resourceId: key,
      oldState: oldValue,
      newState: value,
      timestamp: new Date()
    };

    this.addToHistory(event);
    this.notifySubscribers(key, value);
    this.emit('change', event);
  }

  get<T>(key: string): T | undefined {
    return this.data.get(key);
  }

  delete(key: string): boolean {
    const value = this.data.get(key);
    if (value) {
      this.data.delete(key);

      const event: StateChangeEvent = {
        type: this.getTypeFromKey(key),
        action: 'deleted',
        resourceId: key,
        oldState: value,
        newState: null,
        timestamp: new Date()
      };

      this.addToHistory(event);
      this.notifySubscribers(key, null);
      this.emit('change', event);
      return true;
    }
    return false;
  }

  has(key: string): boolean {
    return this.data.has(key);
  }

  keys(): string[] {
    return Array.from(this.data.keys());
  }

  values<T>(): T[] {
    return Array.from(this.data.values());
  }

  entries<T>(): Array<[string, T]> {
    return Array.from(this.data.entries());
  }

  subscribe(key: string, callback: (data: any) => void): () => void {
    if (!this.subscriptions.has(key)) {
      this.subscriptions.set(key, new Set());
    }

    this.subscriptions.get(key)!.add(callback);

    // Return unsubscribe function
    return () => {
      const subscribers = this.subscriptions.get(key);
      if (subscribers) {
        subscribers.delete(callback);
        if (subscribers.size === 0) {
          this.subscriptions.delete(key);
        }
      }
    };
  }

  private notifySubscribers(key: string, data: any): void {
    const subscribers = this.subscriptions.get(key);
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.warn('Error in state subscription callback:', error);
        }
      });
    }
  }

  private getTypeFromKey(key: string): StateChangeEvent['type'] {
    if (key.startsWith('model:')) return 'model';
    if (key.startsWith('experiment:')) return 'experiment';
    if (key.startsWith('deployment:')) return 'deployment';
    return 'system';
  }

  private addToHistory(event: StateChangeEvent): void {
    this.history.push(event);

    // Keep history size manageable
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }

  getHistory(limit?: number): StateChangeEvent[] {
    if (limit) {
      return this.history.slice(-limit);
    }
    return [...this.history];
  }

  query<T>(predicate: (key: string, value: T) => boolean): Array<[string, T]> {
    const results: Array<[string, T]> = [];
    for (const [key, value] of this.data.entries()) {
      if (predicate(key, value)) {
        results.push([key, value]);
      }
    }
    return results;
  }

  clear(): void {
    const keys = Array.from(this.data.keys());
    this.data.clear();
    this.subscriptions.clear();

    keys.forEach(key => {
      const event: StateChangeEvent = {
        type: this.getTypeFromKey(key),
        action: 'deleted',
        resourceId: key,
        oldState: null,
        newState: null,
        timestamp: new Date()
      };
      this.addToHistory(event);
    });

    this.emit('cleared');
  }
}

// ==================== ENTERPRISE STATE MANAGER ====================

export class EnterpriseStateManager extends EventEmitter {
  private store: StateStore;
  private isInitialized = false;
  private healthCheckInterval?: NodeJS.Timeout;
  private stateSnapshotInterval?: NodeJS.Timeout;
  private startTime = Date.now();

  constructor() {
    super();
    this.store = new StateStore();
    this.setupEventForwarding();
  }

  async initialize(): Promise<void> {
    try {
      // Initialize system state
      await this.initializeSystemState();

      // Load persisted state
      await this.loadPersistedState();

      // Start periodic tasks
      this.startHealthChecks();
      this.startStateSnapshots();

      this.isInitialized = true;
      this.emit('initialized');
      console.log('✅ Enterprise State Manager initialized');

    } catch (error) {
      console.error('❌ Failed to initialize state manager:', error);
      throw error;
    }
  }

  private setupEventForwarding(): void {
    this.store.on('change', (event: StateChangeEvent) => {
      this.emit('state_changed', event);

      // Persist important state changes
      if (event.type !== 'system' || event.action === 'status_changed') {
        this.persistStateChange(event);
      }
    });
  }

  private async initializeSystemState(): Promise<void> {
    const systemState: SystemState = {
      initialized: true,
      status: 'healthy',
      uptime: 0,
      version: '1.0.1',
      lastHealthCheck: new Date(),
      components: {
        mlCore: { status: 'healthy', lastCheck: new Date(), uptime: 0 },
        persistence: { status: 'healthy', lastCheck: new Date(), uptime: 0 },
        streaming: { status: 'healthy', lastCheck: new Date(), uptime: 0 },
        analytics: { status: 'healthy', lastCheck: new Date(), uptime: 0 },
        security: { status: 'healthy', lastCheck: new Date(), uptime: 0 }
      },
      resources: {
        cpu: { current: 0, available: 100, utilization: 0, threshold: { warning: 80, critical: 95 }, trend: 'stable' },
        memory: { current: 0, available: 8192, utilization: 0, threshold: { warning: 80, critical: 95 }, trend: 'stable' },
        disk: { current: 0, available: 1024, utilization: 0, threshold: { warning: 80, critical: 95 }, trend: 'stable' },
        network: { current: 0, available: 1000, utilization: 0, threshold: { warning: 80, critical: 95 }, trend: 'stable' }
      },
      configuration: {
        environment: 'production',
        features: ['ml', 'analytics', 'security', 'realtime'],
        limits: {
          maxModels: 100,
          maxStreams: 50,
          maxConcurrentJobs: 20,
          maxMemoryUsage: 16384
        },
        security: {
          encryptionEnabled: true,
          auditLevel: 'enterprise',
          accessControl: true
        },
        performance: {
          cacheEnabled: true,
          compressionEnabled: true,
          optimizationsEnabled: true
        }
      }
    };

    this.store.set('system', systemState);
  }

  private async loadPersistedState(): Promise<void> {
    try {
      // Load models
      const models = await persistenceService.queryDatasets({ type: 'model' });
      models.forEach(model => {
        const modelState: ModelState = {
          id: model.id,
          name: model.name,
          status: 'trained',
          version: '1.0.0',
          lifecycle: {
            created: model.createdAt,
            lastAccessed: new Date()
          },
          performance: {
            accuracy: 0.85,
            precision: 0.82,
            recall: 0.88,
            f1Score: 0.85,
            inferenceTime: 25
          },
          deployment: {
            instances: 0,
            resources: {}
          },
          monitoring: {
            predictions: 0,
            errors: 0
          },
          configuration: {},
          metadata: {}
        };

        this.store.set(`model:${model.id}`, modelState);
      });

    } catch (error) {
      console.warn('Failed to load persisted state:', error);
    }
  }

  private startHealthChecks(): void {
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthCheck();
    }, 60000); // Every minute
  }

  private startStateSnapshots(): void {
    this.stateSnapshotInterval = setInterval(async () => {
      await this.createStateSnapshot();
    }, 300000); // Every 5 minutes
  }

  private async performHealthCheck(): Promise<void> {
    const systemState = this.store.get<SystemState>('system');
    if (!systemState) return;

    try {
      // Update uptime
      systemState.uptime = Date.now() - this.startTime;
      systemState.lastHealthCheck = new Date();

      // Check components
      const persistenceHealth = await persistenceService.healthCheck();
      systemState.components.persistence.status = Object.values(persistenceHealth).every(h => h) ? 'healthy' : 'degraded';

      // Update resource metrics (simulated)
      systemState.resources.cpu.current = Math.random() * 100;
      systemState.resources.cpu.utilization = (systemState.resources.cpu.current / systemState.resources.cpu.available) * 100;

      systemState.resources.memory.current = Math.random() * 4096;
      systemState.resources.memory.utilization = (systemState.resources.memory.current / systemState.resources.memory.available) * 100;

      // Determine overall status
      const componentStatuses = Object.values(systemState.components).map(c => c.status);
      if (componentStatuses.includes('critical')) {
        systemState.status = 'critical';
      } else if (componentStatuses.includes('degraded')) {
        systemState.status = 'degraded';
      } else {
        systemState.status = 'healthy';
      }

      this.store.set('system', systemState);

    } catch (error) {
      console.error('Health check failed:', error);
      if (systemState) {
        systemState.status = 'critical';
        this.store.set('system', systemState);
      }
    }
  }

  private async createStateSnapshot(): Promise<void> {
    try {
      const snapshot = {
        timestamp: new Date(),
        system: this.store.get('system'),
        models: this.getAllModels(),
        experiments: this.getAllExperiments(),
        deployments: this.getAllDeployments(),
        statistics: {
          totalModels: this.getAllModels().length,
          activeExperiments: this.getAllExperiments().filter(e => e.status === 'running').length,
          activeDeployments: this.getAllDeployments().filter(d => d.status === 'deployed').length
        }
      };

      await persistenceService.saveMetrics({
        id: `state_snapshot_${Date.now()}`,
        timestamp: new Date(),
        type: 'system',
        metrics: {
          total_models: snapshot.statistics.totalModels,
          active_experiments: snapshot.statistics.activeExperiments,
          active_deployments: snapshot.statistics.activeDeployments
        },
        dimensions: {
          type: 'state_snapshot'
        },
        aggregationLevel: 'raw'
      });

    } catch (error) {
      console.warn('Failed to create state snapshot:', error);
    }
  }

  private async persistStateChange(event: StateChangeEvent): Promise<void> {
    try {
      await persistenceService.saveAuditLog({
        id: `state_change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: event.timestamp,
        userId: 'system',
        action: `${event.type}_${event.action}`,
        resource: event.type,
        resourceId: event.resourceId,
        details: {
          oldState: event.oldState,
          newState: event.newState,
          metadata: event.metadata
        },
        ipAddress: 'system',
        userAgent: 'state_manager',
        sessionId: 'system',
        result: 'success',
        riskLevel: 'low',
        complianceFrameworks: ['internal'],
        retention: new Date(Date.now() + 31536000000) // 1 year
      });

    } catch (error) {
      console.warn('Failed to persist state change:', error);
    }
  }

  // ==================== PUBLIC API - SYSTEM ====================

  getSystemState(): SystemState | undefined {
    return this.store.get<SystemState>('system');
  }

  updateSystemConfiguration(updates: Partial<SystemConfiguration>): void {
    const systemState = this.store.get<SystemState>('system');
    if (systemState) {
      Object.assign(systemState.configuration, updates);
      this.store.set('system', systemState);
    }
  }

  // ==================== PUBLIC API - MODELS ====================

  createModel(modelData: Omit<ModelState, 'id' | 'lifecycle'>): string {
    const id = `model_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const model: ModelState = {
      ...modelData,
      id,
      lifecycle: {
        created: new Date()
      }
    };

    this.store.set(`model:${id}`, model);
    return id;
  }

  getModel(modelId: string): ModelState | undefined {
    return this.store.get<ModelState>(`model:${modelId}`);
  }

  updateModel(modelId: string, updates: Partial<ModelState>): boolean {
    const model = this.store.get<ModelState>(`model:${modelId}`);
    if (model) {
      Object.assign(model, updates);
      this.store.set(`model:${modelId}`, model);
      return true;
    }
    return false;
  }

  deleteModel(modelId: string): boolean {
    return this.store.delete(`model:${modelId}`);
  }

  getAllModels(): ModelState[] {
    return this.store.query<ModelState>((key, _value) => key.startsWith('model:')).map(([_key, value]) => value);
  }

  getModelsByStatus(status: ModelState['status']): ModelState[] {
    return this.getAllModels().filter(model => model.status === status);
  }

  // ==================== PUBLIC API - EXPERIMENTS ====================

  createExperiment(experimentData: Omit<ExperimentState, 'id' | 'timeline' | 'runs'>): string {
    const id = `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const experiment: ExperimentState = {
      ...experimentData,
      id,
      runs: [],
      timeline: {
        created: new Date()
      }
    };

    this.store.set(`experiment:${id}`, experiment);
    return id;
  }

  getExperiment(experimentId: string): ExperimentState | undefined {
    return this.store.get<ExperimentState>(`experiment:${experimentId}`);
  }

  updateExperiment(experimentId: string, updates: Partial<ExperimentState>): boolean {
    const experiment = this.store.get<ExperimentState>(`experiment:${experimentId}`);
    if (experiment) {
      Object.assign(experiment, updates);
      this.store.set(`experiment:${experimentId}`, experiment);
      return true;
    }
    return false;
  }

  addExperimentRun(experimentId: string, run: Omit<ExperimentRun, 'experimentId'>): boolean {
    const experiment = this.store.get<ExperimentState>(`experiment:${experimentId}`);
    if (experiment) {
      const experimentRun: ExperimentRun = {
        ...run,
        experimentId
      };
      experiment.runs.push(experimentRun);
      this.store.set(`experiment:${experimentId}`, experiment);
      return true;
    }
    return false;
  }

  getAllExperiments(): ExperimentState[] {
    return this.store.query<ExperimentState>((key, _value) => key.startsWith('experiment:')).map(([_key, value]) => value);
  }

  // ==================== PUBLIC API - DEPLOYMENTS ====================

  createDeployment(deploymentData: Omit<DeploymentState, 'id' | 'timeline'>): string {
    const id = `deploy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const deployment: DeploymentState = {
      ...deploymentData,
      id,
      timeline: {
        created: new Date()
      }
    };

    this.store.set(`deployment:${id}`, deployment);
    return id;
  }

  getDeployment(deploymentId: string): DeploymentState | undefined {
    return this.store.get<DeploymentState>(`deployment:${deploymentId}`);
  }

  updateDeployment(deploymentId: string, updates: Partial<DeploymentState>): boolean {
    const deployment = this.store.get<DeploymentState>(`deployment:${deploymentId}`);
    if (deployment) {
      Object.assign(deployment, updates);
      this.store.set(`deployment:${deploymentId}`, deployment);
      return true;
    }
    return false;
  }

  getAllDeployments(): DeploymentState[] {
    return this.store.query<DeploymentState>((key, _value) => key.startsWith('deployment:')).map(([_key, value]) => value);
  }

  getDeploymentsByModel(modelId: string): DeploymentState[] {
    return this.getAllDeployments().filter(deployment => deployment.modelId === modelId);
  }

  // ==================== PUBLIC API - UTILITIES ====================

  subscribe(key: string, callback: (data: any) => void): () => void {
    return this.store.subscribe(key, callback);
  }

  getStateHistory(limit?: number): StateChangeEvent[] {
    return this.store.getHistory(limit);
  }

  getStatistics(): {
    totalModels: number;
    activeExperiments: number;
    activeDeployments: number;
    systemUptime: number;
    healthStatus: string;
  } {
    const systemState = this.getSystemState();
    return {
      totalModels: this.getAllModels().length,
      activeExperiments: this.getAllExperiments().filter(e => e.status === 'running').length,
      activeDeployments: this.getAllDeployments().filter(d => d.status === 'deployed').length,
      systemUptime: systemState?.uptime || 0,
      healthStatus: systemState?.status || 'unknown'
    };
  }

  async cleanup(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    if (this.stateSnapshotInterval) {
      clearInterval(this.stateSnapshotInterval);
    }

    this.store.clear();
    this.isInitialized = false;
    this.emit('cleanup');
  }
}

// Export singleton instance
export const enterpriseStateManager = new EnterpriseStateManager();
export default enterpriseStateManager;