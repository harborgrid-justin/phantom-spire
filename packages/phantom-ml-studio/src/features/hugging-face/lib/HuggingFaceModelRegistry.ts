/**
 * HuggingFaceModelRegistry - Centralized model management system
 * 
 * This registry provides:
 * - Model versioning and lifecycle management
 * - Metadata storage and search capabilities  
 * - Hub integration for model discovery
 * - Local and remote model synchronization
 * - Enterprise security and compliance tracking
 * - Model performance monitoring and analytics
 * - Automated model updates and deployments
 */

import { EventEmitter } from 'events';
import { HuggingFaceModelBase, ModelMetadata, HFModelConfig } from './HuggingFaceModelBase';

export interface ModelRegistryEntry {
  id: string;
  modelId: string; // Hugging Face model ID
  localPath?: string;
  config: HFModelConfig;
  metadata: ModelMetadata;
  status: ModelStatus;
  versions: ModelVersion[];
  deployment?: ModelDeployment;
  analytics: ModelAnalytics;
  security: ModelSecurityInfo;
  compliance: ComplianceStatus;
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt?: Date;
}

export type ModelStatus = 
  | 'available'      // Ready to use
  | 'loading'        // Currently loading
  | 'training'       // Currently training
  | 'error'          // Error state
  | 'deprecated'     // No longer recommended
  | 'archived'       // Archived/inactive
  | 'updating';      // Being updated

export interface ModelVersion {
  version: string;
  modelId: string;
  commit?: string; // Git/Hub commit hash
  changelog: string;
  performance: Record<string, number>;
  createdAt: Date;
  isActive: boolean;
  downloadUrl?: string;
  size: number; // in bytes
  dependencies: string[];
}

export interface ModelDeployment {
  environments: DeploymentEnvironment[];
  currentVersion: string;
  autoUpdate: boolean;
  healthCheck: HealthCheckConfig;
  scalingConfig: ScalingConfig;
}

export interface DeploymentEnvironment {
  name: string; // 'dev', 'staging', 'prod'
  endpoint?: string;
  version: string;
  status: 'active' | 'inactive' | 'maintenance';
  lastDeployed: Date;
  healthStatus: 'healthy' | 'degraded' | 'unhealthy';
}

export interface HealthCheckConfig {
  enabled: boolean;
  interval: number; // seconds
  timeout: number;  // seconds
  retries: number;
  endpoint?: string;
}

export interface ScalingConfig {
  minInstances: number;
  maxInstances: number;
  targetUtilization: number; // percentage
  scaleUpThreshold: number;
  scaleDownThreshold: number;
}

export interface ModelAnalytics {
  totalInferences: number;
  averageLatency: number;
  errorRate: number;
  accuracy?: number;
  throughput: number; // requests per second
  peakUsage: Date;
  usageByDay: Record<string, number>;
  usageByHour: Record<string, number>;
  topUsers: UserUsageStats[];
  performanceTrend: PerformanceDataPoint[];
}

export interface UserUsageStats {
  userId: string;
  requestCount: number;
  lastAccess: Date;
  errorRate: number;
}

export interface PerformanceDataPoint {
  timestamp: Date;
  latency: number;
  throughput: number;
  errorRate: number;
  accuracy?: number;
  memoryUsage: number;
  cpuUsage: number;
}

export interface ModelSecurityInfo {
  securityScore: number; // 0-100
  lastSecurityScan: Date;
  vulnerabilities: SecurityVulnerability[];
  hasPiiProtection: boolean;
  hasAdversarialDefense: boolean;
  isEncrypted: boolean;
  accessControls: AccessControl[];
}

export interface SecurityVulnerability {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  description: string;
  status: 'open' | 'acknowledged' | 'fixed' | 'wont-fix';
  discoveredAt: Date;
  fixedAt?: Date;
}

export interface AccessControl {
  type: 'user' | 'role' | 'api_key';
  subject: string;
  permissions: string[];
  createdAt: Date;
  expiresAt?: Date;
}

export interface ComplianceStatus {
  overall: 'compliant' | 'non-compliant' | 'partial' | 'unknown';
  standards: ComplianceStandard[];
  lastAssessment: Date;
  nextAssessmentDue: Date;
  assessor?: string;
}

export interface ComplianceStandard {
  name: string; // 'GDPR', 'CCPA', 'SOX', 'NIST', etc.
  status: 'compliant' | 'non-compliant' | 'partial';
  requirements: ComplianceRequirement[];
  evidence: ComplianceEvidence[];
}

export interface ComplianceRequirement {
  id: string;
  description: string;
  status: 'met' | 'not-met' | 'partial';
  evidence?: string;
  lastChecked: Date;
}

export interface ComplianceEvidence {
  type: string;
  description: string;
  filePath?: string;
  url?: string;
  createdAt: Date;
}

export interface RegistryConfig {
  dataDir: string;
  cacheDir: string;
  hubToken?: string;
  syncEnabled: boolean;
  syncInterval: number; // minutes
  maxCacheSize: number; // MB
  enableAnalytics: boolean;
  enableSecurityScanning: boolean;
  enableComplianceChecking: boolean;
}

export interface SearchQuery {
  query?: string;
  tags?: string[];
  task?: string;
  author?: string;
  language?: string[];
  minScore?: number;
  status?: ModelStatus[];
  limit?: number;
  offset?: number;
  sortBy?: 'relevance' | 'downloads' | 'created' | 'updated' | 'score';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResult {
  entries: ModelRegistryEntry[];
  total: number;
  hasMore: boolean;
  searchTime: number;
  query: SearchQuery;
}

/**
 * Centralized registry for managing Hugging Face models
 * Provides enterprise-grade model lifecycle management
 */
export class HuggingFaceModelRegistry extends EventEmitter {
  private entries: Map<string, ModelRegistryEntry> = new Map();
  private config: RegistryConfig;
  private syncTimer?: NodeJS.Timeout;
  private analyticsCollector?: NodeJS.Timeout;
  private isInitialized: boolean = false;

  constructor(config: RegistryConfig) {
    super();
    this.config = config;
    this.setupAnalyticsCollection();
  }

  async initialize(): Promise<void> {
    try {
      await this.loadFromDisk();
      
      if (this.config.syncEnabled) {
        this.startSync();
      }
      
      this.isInitialized = true;
      this.emit('initialized');
      
      console.log(`Model registry initialized with ${this.entries.size} models`);
      
    } catch (error) {
      console.error('Failed to initialize model registry:', error);
      throw error;
    }
  }

  async dispose(): Promise<void> {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }
    
    if (this.analyticsCollector) {
      clearInterval(this.analyticsCollector);
    }
    
    await this.saveToDisk();
    this.isInitialized = false;
    this.emit('disposed');
  }

  // Model registration and management
  async registerModel(
    modelInstance: HuggingFaceModelBase,
    options?: {
      localPath?: string;
      deployment?: ModelDeployment;
      accessControls?: AccessControl[];
    }
  ): Promise<ModelRegistryEntry> {
    const config = modelInstance.modelConfig;
    const metadata = modelInstance.modelMetadata;
    
    const entry: ModelRegistryEntry = {
      id: this.generateEntryId(config.modelId),
      modelId: config.modelId,
      localPath: options?.localPath,
      config,
      metadata,
      status: 'available',
      versions: [{
        version: metadata.version,
        modelId: config.modelId,
        changelog: 'Initial registration',
        performance: modelInstance.metrics,
        createdAt: new Date(),
        isActive: true,
        size: 0, // TODO: Calculate actual size
        dependencies: []
      }],
      deployment: options?.deployment,
      analytics: this.createInitialAnalytics(),
      security: await this.createSecurityInfo(modelInstance, options?.accessControls),
      compliance: await this.assessCompliance(modelInstance),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.entries.set(entry.id, entry);
    await this.saveToDisk();
    
    this.emit('modelRegistered', entry);
    console.log(`Registered model: ${config.modelId}`);
    
    return entry;
  }

  async unregisterModel(entryId: string): Promise<boolean> {
    const entry = this.entries.get(entryId);
    if (!entry) {
      return false;
    }

    // Clean up local files if they exist
    if (entry.localPath) {
      try {
        const fs = await import('fs/promises');
        await fs.rm(entry.localPath, { recursive: true, force: true });
      } catch (error) {
        console.warn(`Failed to clean up local files for ${entryId}:`, error);
      }
    }

    this.entries.delete(entryId);
    await this.saveToDisk();
    
    this.emit('modelUnregistered', entry);
    console.log(`Unregistered model: ${entry.modelId}`);
    
    return true;
  }

  async updateModel(
    entryId: string,
    updates: Partial<ModelRegistryEntry>
  ): Promise<ModelRegistryEntry | null> {
    const entry = this.entries.get(entryId);
    if (!entry) {
      return null;
    }

    const updatedEntry = {
      ...entry,
      ...updates,
      updatedAt: new Date()
    };

    this.entries.set(entryId, updatedEntry);
    await this.saveToDisk();
    
    this.emit('modelUpdated', updatedEntry);
    return updatedEntry;
  }

  // Model discovery and search
  async searchModels(query: SearchQuery): Promise<SearchResult> {
    const startTime = Date.now();
    let results = Array.from(this.entries.values());

    // Apply filters
    if (query.query) {
      const searchTerm = query.query.toLowerCase();
      results = results.filter(entry => 
        entry.modelId.toLowerCase().includes(searchTerm) ||
        entry.metadata.displayName?.toLowerCase().includes(searchTerm) ||
        entry.metadata.description?.toLowerCase().includes(searchTerm) ||
        entry.metadata.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    if (query.tags && query.tags.length > 0) {
      results = results.filter(entry =>
        query.tags!.some(tag => entry.metadata.tags.includes(tag))
      );
    }

    if (query.task) {
      results = results.filter(entry => entry.config.task === query.task);
    }

    if (query.author) {
      results = results.filter(entry => entry.metadata.author === query.author);
    }

    if (query.status && query.status.length > 0) {
      results = results.filter(entry => query.status!.includes(entry.status));
    }

    if (query.minScore && query.minScore > 0) {
      results = results.filter(entry => 
        entry.security.securityScore >= query.minScore!
      );
    }

    // Apply sorting
    const sortBy = query.sortBy || 'relevance';
    const sortOrder = query.sortOrder || 'desc';
    
    results.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'downloads':
          comparison = a.analytics.totalInferences - b.analytics.totalInferences;
          break;
        case 'created':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case 'updated':
          comparison = a.updatedAt.getTime() - b.updatedAt.getTime();
          break;
        case 'score':
          comparison = a.security.securityScore - b.security.securityScore;
          break;
        default: // relevance
          comparison = a.analytics.totalInferences - b.analytics.totalInferences;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    // Apply pagination
    const offset = query.offset || 0;
    const limit = query.limit || 50;
    const total = results.length;
    const paginatedResults = results.slice(offset, offset + limit);

    return {
      entries: paginatedResults,
      total,
      hasMore: offset + limit < total,
      searchTime: Date.now() - startTime,
      query
    };
  }

  async getModel(entryId: string): Promise<ModelRegistryEntry | null> {
    const entry = this.entries.get(entryId);
    if (entry) {
      entry.lastAccessedAt = new Date();
      this.recordAccess(entryId);
    }
    return entry || null;
  }

  async getModelByHuggingFaceId(modelId: string): Promise<ModelRegistryEntry | null> {
    for (const entry of this.entries.values()) {
      if (entry.modelId === modelId) {
        entry.lastAccessedAt = new Date();
        this.recordAccess(entry.id);
        return entry;
      }
    }
    return null;
  }

  // Hub integration
  async syncWithHub(): Promise<void> {
    console.log('Syncing with Hugging Face Hub...');
    
    try {
      // Sync existing models
      for (const entry of this.entries.values()) {
        await this.syncModelFromHub(entry);
      }
      
      // Discover new recommended models
      await this.discoverNewModels();
      
      await this.saveToDisk();
      this.emit('syncCompleted');
      
    } catch (error) {
      console.error('Hub sync failed:', error);
      this.emit('syncFailed', error);
    }
  }

  private async syncModelFromHub(entry: ModelRegistryEntry): Promise<void> {
    try {
      // Check for updates on the Hub
      // This would integrate with the Hugging Face Hub API
      // For now, just update the last sync time
      entry.updatedAt = new Date();
      
    } catch (error) {
      console.warn(`Failed to sync ${entry.modelId}:`, error);
    }
  }

  private async discoverNewModels(): Promise<void> {
    // This would use the Hugging Face Hub API to discover new models
    // based on user preferences, trending models, etc.
    console.log('Discovering new models (placeholder)...');
  }

  // Analytics and monitoring
  recordInference(entryId: string, latency: number, success: boolean): void {
    const entry = this.entries.get(entryId);
    if (!entry) return;

    const analytics = entry.analytics;
    analytics.totalInferences++;
    
    // Update rolling averages
    analytics.averageLatency = (analytics.averageLatency + latency) / 2;
    
    if (!success) {
      analytics.errorRate = (analytics.errorRate * 0.9) + (0.1); // Exponential moving average
    } else {
      analytics.errorRate = analytics.errorRate * 0.95; // Decay error rate
    }

    // Update daily/hourly usage
    const today = new Date().toISOString().split('T')[0];
    const hour = new Date().getHours().toString();
    
    analytics.usageByDay[today] = (analytics.usageByDay[today] || 0) + 1;
    analytics.usageByHour[hour] = (analytics.usageByHour[hour] || 0) + 1;

    // Add performance data point
    analytics.performanceTrend.push({
      timestamp: new Date(),
      latency,
      throughput: analytics.throughput,
      errorRate: analytics.errorRate,
      memoryUsage: process.memoryUsage?.()?.heapUsed / 1024 / 1024 || 0,
      cpuUsage: 0 // Would need actual CPU monitoring
    });

    // Keep only recent performance data (last 24 hours)
    const cutoff = Date.now() - (24 * 60 * 60 * 1000);
    analytics.performanceTrend = analytics.performanceTrend.filter(
      point => point.timestamp.getTime() > cutoff
    );
  }

  private recordAccess(entryId: string): void {
    // This would integrate with actual analytics systems
    this.recordInference(entryId, 0, true);
  }

  // Model deployment
  async deployModel(
    entryId: string,
    environment: string,
    version?: string
  ): Promise<boolean> {
    const entry = this.entries.get(entryId);
    if (!entry) {
      throw new Error(`Model not found: ${entryId}`);
    }

    const targetVersion = version || entry.versions.find(v => v.isActive)?.version;
    if (!targetVersion) {
      throw new Error('No active version found');
    }

    try {
      // Deployment logic would go here
      // For now, just update the deployment info
      
      if (!entry.deployment) {
        entry.deployment = {
          environments: [],
          currentVersion: targetVersion,
          autoUpdate: false,
          healthCheck: {
            enabled: true,
            interval: 30,
            timeout: 10,
            retries: 3
          },
          scalingConfig: {
            minInstances: 1,
            maxInstances: 10,
            targetUtilization: 70,
            scaleUpThreshold: 80,
            scaleDownThreshold: 30
          }
        };
      }

      const existingEnv = entry.deployment.environments.find(e => e.name === environment);
      if (existingEnv) {
        existingEnv.version = targetVersion;
        existingEnv.status = 'active';
        existingEnv.lastDeployed = new Date();
        existingEnv.healthStatus = 'healthy';
      } else {
        entry.deployment.environments.push({
          name: environment,
          version: targetVersion,
          status: 'active',
          lastDeployed: new Date(),
          healthStatus: 'healthy'
        });
      }

      await this.saveToDisk();
      this.emit('modelDeployed', { entryId, environment, version: targetVersion });
      
      return true;
      
    } catch (error) {
      console.error(`Deployment failed for ${entryId}:`, error);
      this.emit('deploymentFailed', { entryId, environment, error });
      throw error;
    }
  }

  // Security and compliance
  async scanSecurity(entryId: string): Promise<ModelSecurityInfo> {
    const entry = this.entries.get(entryId);
    if (!entry) {
      throw new Error(`Model not found: ${entryId}`);
    }

    // Placeholder security scanning
    const securityInfo: ModelSecurityInfo = {
      securityScore: 85 + Math.random() * 10, // Mock score
      lastSecurityScan: new Date(),
      vulnerabilities: [],
      hasPiiProtection: false,
      hasAdversarialDefense: false,
      isEncrypted: false,
      accessControls: entry.security.accessControls
    };

    // Add some mock vulnerabilities for demonstration
    if (Math.random() > 0.7) {
      securityInfo.vulnerabilities.push({
        id: 'vuln-001',
        severity: 'medium',
        category: 'Input Validation',
        description: 'Potential input injection vulnerability',
        status: 'open',
        discoveredAt: new Date()
      });
    }

    entry.security = securityInfo;
    await this.saveToDisk();
    
    this.emit('securityScanCompleted', { entryId, securityInfo });
    return securityInfo;
  }

  // Utility methods
  private generateEntryId(modelId: string): string {
    return `hf-${modelId.replace(/[///]/g, '-')}-${Date.now()}`;
  }

  private createInitialAnalytics(): ModelAnalytics {
    return {
      totalInferences: 0,
      averageLatency: 0,
      errorRate: 0,
      throughput: 0,
      peakUsage: new Date(),
      usageByDay: {},
      usageByHour: {},
      topUsers: [],
      performanceTrend: []
    };
  }

  private async createSecurityInfo(
    model: HuggingFaceModelBase,
    accessControls?: AccessControl[]
  ): Promise<ModelSecurityInfo> {
    const securityReport = model.securityReport;
    
    return {
      securityScore: securityReport?.riskLevel === 'low' ? 90 : 
                   securityReport?.riskLevel === 'medium' ? 70 : 50,
      lastSecurityScan: new Date(),
      vulnerabilities: securityReport?.vulnerabilities.map(v => ({
        id: v.id,
        severity: v.severity,
        category: v.category,
        description: v.description,
        status: 'open' as const,
        discoveredAt: new Date()
      })) || [],
      hasPiiProtection: false, // Would be determined by actual analysis
      hasAdversarialDefense: false,
      isEncrypted: false,
      accessControls: accessControls || []
    };
  }

  private async assessCompliance(
    model: HuggingFaceModelBase
  ): Promise<ComplianceStatus> {
    const validationReport = model.validationReport;
    
    return {
      overall: 'partial',
      standards: validationReport?.complianceChecks.map(check => ({
        name: check.standard,
        status: check.status,
        requirements: [], // Would be populated by actual compliance checker
        evidence: []
      })) || [],
      lastAssessment: new Date(),
      nextAssessmentDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      assessor: 'Phantom ML Studio'
    };
  }

  private setupAnalyticsCollection(): void {
    // Collect analytics every 5 minutes
    this.analyticsCollector = setInterval(() => {
      this.collectSystemMetrics();
    }, 5 * 60 * 1000);
  }

  private collectSystemMetrics(): void {
    // Collect system-wide metrics
    for (const entry of this.entries.values()) {
      // Update throughput calculations
      const recentActivity = entry.analytics.performanceTrend
        .filter(point => Date.now() - point.timestamp.getTime() < 60 * 1000)
        .length;
      
      entry.analytics.throughput = recentActivity;
    }
  }

  private startSync(): void {
    // Sync every configured interval
    this.syncTimer = setInterval(() => {
      this.syncWithHub().catch(error => {
        console.error('Periodic sync failed:', error);
      });
    }, this.config.syncInterval * 60 * 1000);
    
    // Initial sync
    setTimeout(() => {
      this.syncWithHub().catch(error => {
        console.error('Initial sync failed:', error);
      });
    }, 5000);
  }

  // Persistence
  private async loadFromDisk(): Promise<void> {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      const registryFile = path.join(this.config.dataDir, 'registry.json');
      const data = await fs.readFile(registryFile, 'utf-8');
      const entries = JSON.parse(data);
      
      // Deserialize dates
      for (const entry of entries) {
        entry.createdAt = new Date(entry.createdAt);
        entry.updatedAt = new Date(entry.updatedAt);
        if (entry.lastAccessedAt) {
          entry.lastAccessedAt = new Date(entry.lastAccessedAt);
        }
        
        // Deserialize versions
        for (const version of entry.versions) {
          version.createdAt = new Date(version.createdAt);
        }
        
        this.entries.set(entry.id, entry);
      }
      
      console.log(`Loaded ${entries.length} models from disk`);
      
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        console.error('Failed to load registry from disk:', error);
      }
      // Start with empty registry if file doesn't exist
    }
  }

  private async saveToDisk(): Promise<void> {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      // Ensure data directory exists
      await fs.mkdir(this.config.dataDir, { recursive: true });
      
      const registryFile = path.join(this.config.dataDir, 'registry.json');
      const entries = Array.from(this.entries.values());
      
      await fs.writeFile(registryFile, JSON.stringify(entries, null, 2));
      
    } catch (error) {
      console.error('Failed to save registry to disk:', error);
    }
  }

  // Public getters
  get modelCount(): number {
    return this.entries.size;
  }

  get isReady(): boolean {
    return this.isInitialized;
  }

  get registryConfig(): RegistryConfig {
    return { ...this.config };
  }

  getAllModels(): ModelRegistryEntry[] {
    return Array.from(this.entries.values());
  }

  getModelsByStatus(status: ModelStatus): ModelRegistryEntry[] {
    return Array.from(this.entries.values()).filter(entry => entry.status === status);
  }

  getModelsByTask(task: string): ModelRegistryEntry[] {
    return Array.from(this.entries.values()).filter(entry => entry.config.task === task);
  }

  getTrendingModels(limit: number = 10): ModelRegistryEntry[] {
    return Array.from(this.entries.values())
      .sort((a, b) => b.analytics.totalInferences - a.analytics.totalInferences)
      .slice(0, limit);
  }

  getRecentlyUsed(limit: number = 10): ModelRegistryEntry[] {
    return Array.from(this.entries.values())
      .filter(entry => entry.lastAccessedAt)
      .sort((a, b) => (b.lastAccessedAt?.getTime() || 0) - (a.lastAccessedAt?.getTime() || 0))
      .slice(0, limit);
  }

  getSystemStats(): Record<string, number | Record<string, number>> {
    const entries = Array.from(this.entries.values());
    
    return {
      totalModels: entries.length,
      activeModels: entries.filter(e => e.status === 'available').length,
      trainingModels: entries.filter(e => e.status === 'training').length,
      totalInferences: entries.reduce((sum, e) => sum + e.analytics.totalInferences, 0),
      averageSecurityScore: entries.reduce((sum, e) => sum + e.security.securityScore, 0) / entries.length || 0,
      taskDistribution: this.getTaskDistribution(),
      statusDistribution: this.getStatusDistribution()
    };
  }

  private getTaskDistribution(): Record<string, number> {
    const distribution: Record<string, number> = {};
    for (const entry of this.entries.values()) {
      distribution[entry.config.task] = (distribution[entry.config.task] || 0) + 1;
    }
    return distribution;
  }

  private getStatusDistribution(): Record<string, number> {
    const distribution: Record<string, number> = {};
    for (const entry of this.entries.values()) {
      distribution[entry.status] = (distribution[entry.status] || 0) + 1;
    }
    return distribution;
  }
}

export default HuggingFaceModelRegistry;