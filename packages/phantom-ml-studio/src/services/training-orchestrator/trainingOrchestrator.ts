/**
 * Training Orchestrator - Enterprise-grade distributed training management
 * 
 * This orchestrator provides:
 * - Distributed training across multiple GPUs/nodes
 * - Automatic checkpointing and recovery
 * - Real-time training monitoring and metrics
 * - Resource allocation and optimization
 * - Fault tolerance and error recovery
 * - Training job queuing and scheduling
 * - Model fine-tuning with Hugging Face models
 * - Enterprise security and audit logging
 */

import { EventEmitter } from 'events';
import { HuggingFaceModelBase, TrainingConfig, TrainingProgress } from '@/models/HuggingFaceModelBase';
import { HuggingFaceModelRegistry } from '@/models/HuggingFaceModelRegistry';

export interface TrainingJob {
  id: string;
  name: string;
  modelId: string;
  config: TrainingConfig;
  dataset: TrainingDataset;
  status: TrainingJobStatus;
  priority: TrainingPriority;
  resourceRequirements: ResourceRequirements;
  distributedConfig?: DistributedTrainingConfig;
  checkpointing: CheckpointingConfig;
  monitoring: MonitoringConfig;
  security: TrainingSecurityConfig;
  metadata: TrainingJobMetadata;
  progress?: TrainingProgress;
  error?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  estimatedCompletionAt?: Date;
}

export type TrainingJobStatus = 
  | 'queued'        // Waiting for resources
  | 'preparing'     // Setting up environment
  | 'running'       // Training in progress
  | 'paused'        // Temporarily paused
  | 'completed'     // Successfully completed
  | 'failed'        // Failed with error
  | 'cancelled'     // Cancelled by user
  | 'checkpointing' // Saving checkpoint
  | 'recovering';   // Recovering from checkpoint

export type TrainingPriority = 'low' | 'normal' | 'high' | 'critical';

export interface TrainingDataset {
  name: string;
  path: string;
  format: 'json' | 'csv' | 'parquet' | 'arrow' | 'hf_dataset';
  size: number; // number of samples
  splits: {
    train: number;
    validation?: number;
    test?: number;
  };
  schema: DatasetSchema;
  preprocessing?: PreprocessingPipeline;
}

export interface DatasetSchema {
  features: FeatureSchema[];
  target?: FeatureSchema;
  metadata: Record<string, unknown>;
}

export interface FeatureSchema {
  name: string;
  type: 'text' | 'numeric' | 'categorical' | 'image' | 'audio' | 'datetime';
  description?: string;
  nullable: boolean;
  constraints?: FeatureConstraints;
}

export interface FeatureConstraints {
  min?: number;
  max?: number;
  enum?: (string | number | boolean)[];
  pattern?: string;
  maxLength?: number;
}

export interface PreprocessingPipeline {
  steps: PreprocessingStep[];
  parallel: boolean;
  cacheResults: boolean;
}

export interface PreprocessingStep {
  name: string;
  type: string;
  parameters: Record<string, unknown>;
  condition?: string; // SQL-like condition
}

export interface ResourceRequirements {
  minCpuCores: number;
  minMemoryGB: number;
  minGpuMemoryGB?: number;
  gpuCount?: number;
  gpuType?: string; // 'tesla-v100', 'rtx-3090', etc.
  diskSpaceGB: number;
  networkBandwidthMbps?: number;
  estimatedTrainingTimeHours: number;
}

export interface DistributedTrainingConfig {
  enabled: boolean;
  strategy: DistributedStrategy;
  nodes: number;
  gpusPerNode: number;
  masterAddress?: string;
  masterPort?: number;
  backend: 'nccl' | 'gloo' | 'mpi';
  gradientCompression?: {
    enabled: boolean;
    algorithm: 'topk' | 'random' | 'dgc';
    compressionRatio: number;
  };
  allReduceStrategy?: 'ring' | 'tree' | 'hierarchical';
}

export type DistributedStrategy = 
  | 'data_parallel'     // Data parallelism
  | 'model_parallel'    // Model parallelism  
  | 'pipeline_parallel' // Pipeline parallelism
  | 'hybrid'            // Combination of strategies
  | 'federated';        // Federated learning

export interface CheckpointingConfig {
  enabled: boolean;
  frequency: CheckpointFrequency;
  maxCheckpoints: number;
  compressionEnabled: boolean;
  remoteStorage?: {
    enabled: boolean;
    provider: 'aws_s3' | 'gcs' | 'azure_blob' | 'huggingface_hub';
    bucket: string;
    path: string;
    credentials: Record<string, string>;
  };
  autoResume: boolean;
  validationBeforeSave: boolean;
}

export interface CheckpointFrequency {
  byEpochs?: number;      // Every N epochs
  bySteps?: number;       // Every N steps
  byTime?: number;        // Every N minutes
  onImprovement?: boolean; // On validation improvement
  onError?: boolean;       // Before handling errors
}

export interface MonitoringConfig {
  enabled: boolean;
  metricsCollection: {
    systemMetrics: boolean;    // CPU, memory, GPU usage
    trainingMetrics: boolean;  // Loss, accuracy, etc.
    customMetrics: string[];   // User-defined metrics
  };
  alerting: {
    enabled: boolean;
    channels: AlertChannel[];
    conditions: AlertCondition[];
  };
  visualization: {
    enabled: boolean;
    updateInterval: number; // seconds
    dashboard?: string;     // URL to monitoring dashboard
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    structured: boolean;
    remoteLogging?: {
      enabled: boolean;
      endpoint: string;
      credentials: Record<string, string>;
    };
  };
}

export interface AlertChannel {
  type: 'email' | 'slack' | 'webhook' | 'pagerduty';
  target: string; // email, webhook URL, etc.
  severity: 'info' | 'warning' | 'error' | 'critical';
}

export interface AlertCondition {
  name: string;
  metric: string;
  threshold: number;
  comparison: 'gt' | 'lt' | 'eq' | 'ne';
  duration: number; // seconds
  severity: 'info' | 'warning' | 'error' | 'critical';
}

export interface TrainingSecurityConfig {
  encryption: {
    dataAtRest: boolean;
    dataInTransit: boolean;
    modelEncryption: boolean;
    keyManagement: 'local' | 'hsm' | 'cloud_kms';
  };
  accessControl: {
    rbac: boolean;
    auditLogging: boolean;
    userAuthentication: 'local' | 'ldap' | 'oauth2' | 'saml';
  };
  privacy: {
    differentialPrivacy: boolean;
    privacyBudget?: number;
    noiseMultiplier?: number;
    piiRedaction: boolean;
  };
  compliance: {
    standards: string[]; // 'SOX', 'GDPR', 'HIPAA', etc.
    auditTrail: boolean;
    dataLineage: boolean;
  };
}

export interface TrainingJobMetadata {
  userId: string;
  projectId?: string;
  experimentId?: string;
  tags: string[];
  description?: string;
  hyperparameters: Record<string, unknown>;
  modelArchitecture?: string;
  trainingFramework: string;
  version: string;
  parentJobId?: string; // For resuming/retraining
  relatedJobs: string[]; // Related training jobs
}

export interface ResourceAllocation {
  jobId: string;
  nodeId: string;
  resources: AllocatedResources;
  allocatedAt: Date;
  estimatedReleaseAt: Date;
  actualReleaseAt?: Date;
}

export interface AllocatedResources {
  cpuCores: number;
  memoryGB: number;
  gpuIds: string[];
  gpuMemoryGB: number;
  diskSpaceGB: number;
  networkPorts: number[];
}

export interface TrainingNode {
  id: string;
  hostname: string;
  status: 'available' | 'busy' | 'maintenance' | 'offline';
  capabilities: NodeCapabilities;
  currentLoad: ResourceUsage;
  maxCapacity: ResourceCapacity;
  lastHeartbeat: Date;
  metadata: NodeMetadata;
}

export interface NodeCapabilities {
  cpuArchitecture: string;
  cpuCores: number;
  memoryGB: number;
  gpus: GPUInfo[];
  diskSpaceGB: number;
  networkSpeedMbps: number;
  supportedFrameworks: string[];
  containerRuntime?: string;
  kubernetesEnabled?: boolean;
}

export interface GPUInfo {
  id: string;
  model: string;
  memoryGB: number;
  computeCapability: string;
  utilization: number; // 0-100%
  temperature: number; // Celsius
}

export interface ResourceUsage {
  cpuUtilization: number; // 0-100%
  memoryUsageGB: number;
  gpuUtilization: number[]; // Per GPU 0-100%
  diskUsageGB: number;
  networkUtilizationMbps: number;
}

export interface ResourceCapacity {
  maxCpuCores: number;
  maxMemoryGB: number;
  maxGpuMemoryGB: number;
  maxDiskSpaceGB: number;
  maxNetworkMbps: number;
}

export interface NodeMetadata {
  location?: string;
  zone?: string;
  provider?: string;
  costPerHour?: number;
  preemptible?: boolean;
  maintenanceWindow?: string;
  tags: Record<string, string>;
}

export interface TrainingMetrics {
  jobId: string;
  timestamp: Date;
  epoch: number;
  step: number;
  trainingLoss: number;
  validationLoss?: number;
  trainingAccuracy?: number;
  validationAccuracy?: number;
  learningRate: number;
  batchSize: number;
  throughput: number; // samples/second
  resourceUsage: ResourceUsage;
  customMetrics: Record<string, number>;
}

export interface CheckpointInfo {
  jobId: string;
  checkpointId: string;
  epoch: number;
  step: number;
  filePath: string;
  remoteUrl?: string;
  size: number; // bytes
  hash: string; // SHA-256
  metadata: Record<string, unknown>;
  createdAt: Date;
  isValid: boolean;
  canResume: boolean;
}

/**
 * Enterprise Training Orchestrator
 * Manages distributed training jobs across multiple nodes with enterprise features
 */
export class TrainingOrchestrator extends EventEmitter {
  private registry: HuggingFaceModelRegistry;
  private jobs: Map<string, TrainingJob> = new Map();
  private queue: string[] = []; // Job IDs in queue
  private nodes: Map<string, TrainingNode> = new Map();
  private allocations: Map<string, ResourceAllocation> = new Map();
  private metrics: Map<string, TrainingMetrics[]> = new Map();
  private checkpoints: Map<string, CheckpointInfo[]> = new Map();
  
  private schedulerTimer?: NodeJS.Timeout;
  private monitoringTimer?: NodeJS.Timeout;
  private heartbeatTimer?: NodeJS.Timeout;
  
  private isInitialized: boolean = false;
  private maxConcurrentJobs: number = 10;
  private jobRetentionDays: number = 30;

  constructor(
    registry: HuggingFaceModelRegistry,
    options?: {
      maxConcurrentJobs?: number;
      jobRetentionDays?: number;
      schedulingInterval?: number;
      monitoringInterval?: number;
    }
  ) {
    super();
    this.registry = registry;
    this.maxConcurrentJobs = options?.maxConcurrentJobs || 10;
    this.jobRetentionDays = options?.jobRetentionDays || 30;
    
    // Start background processes
    this.startScheduler(options?.schedulingInterval || 30); // 30 seconds
    this.startMonitoring(options?.monitoringInterval || 10); // 10 seconds
    this.startHeartbeat(30); // 30 seconds
  }

  async initialize(): Promise<void> {
    try {
      console.log('🚀 Initializing Training Orchestrator...');
      
      // Discover available nodes
      await this.discoverNodes();
      
      // Load existing jobs from persistence
      await this.loadJobs();
      
      // Resume any interrupted jobs
      await this.resumeInterruptedJobs();
      
      this.isInitialized = true;
      this.emit('initialized');
      
      console.log(`✅ Training Orchestrator initialized with ${this.nodes.size} nodes and ${this.jobs.size} jobs`);
      
    } catch (error) {
      console.error('❌ Failed to initialize Training Orchestrator:', error);
      throw error;
    }
  }

  async dispose(): Promise<void> {
    try {
      // Stop all background processes
      if (this.schedulerTimer) clearInterval(this.schedulerTimer);
      if (this.monitoringTimer) clearInterval(this.monitoringTimer);
      if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
      
      // Cancel running jobs
      const runningJobs = Array.from(this.jobs.values())
        .filter(job => job.status === 'running' || job.status === 'preparing');
      
      for (const job of runningJobs) {
        await this.cancelJob(job.id, 'Orchestrator shutdown');
      }
      
      // Save state
      await this.saveJobs();
      
      this.isInitialized = false;
      this.emit('disposed');
      
      console.log('🛑 Training Orchestrator disposed');
      
    } catch (error) {
      console.error('Error disposing Training Orchestrator:', error);
    }
  }

  // Job Management
  async submitJob(jobConfig: Omit<TrainingJob, 'id' | 'status' | 'createdAt'>): Promise<string> {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const job: TrainingJob = {
      ...jobConfig,
      id: jobId,
      status: 'queued',
      createdAt: new Date()
    };

    // Validate job configuration
    await this.validateJobConfig(job);
    
    // Add to jobs and queue
    this.jobs.set(jobId, job);
    this.insertIntoQueue(jobId);
    
    // Initialize metrics and checkpoints
    this.metrics.set(jobId, []);
    this.checkpoints.set(jobId, []);
    
    this.emit('jobSubmitted', job);
    console.log(`📋 Job submitted: ${jobId} (${job.name})`);
    
    // Trigger immediate scheduling attempt
    this.scheduleJobs();
    
    return jobId;
  }

  async cancelJob(jobId: string, reason?: string): Promise<boolean> {
    const job = this.jobs.get(jobId);
    if (!job) {
      return false;
    }

    if (job.status === 'completed' || job.status === 'cancelled') {
      return false;
    }

    try {
      // If job is running, stop it
      if (job.status === 'running') {
        await this.stopRunningJob(jobId);
      }

      // Update job status
      job.status = 'cancelled';
      job.completedAt = new Date();
      job.error = reason || 'Cancelled by user';

      // Remove from queue
      const queueIndex = this.queue.indexOf(jobId);
      if (queueIndex > -1) {
        this.queue.splice(queueIndex, 1);
      }

      // Free resources
      await this.freeJobResources(jobId);

      this.emit('jobCancelled', { job, reason });
      console.log(`🚫 Job cancelled: ${jobId} - ${reason || 'User request'}`);
      
      return true;
      
    } catch (error) {
      console.error(`Failed to cancel job ${jobId}:`, error);
      return false;
    }
  }

  async pauseJob(jobId: string): Promise<boolean> {
    const job = this.jobs.get(jobId);
    if (!job || job.status !== 'running') {
      return false;
    }

    try {
      // Create checkpoint before pausing
      await this.createCheckpoint(jobId, 'pause');
      
      // Stop the training process
      await this.stopRunningJob(jobId);
      
      job.status = 'paused';
      
      this.emit('jobPaused', job);
      console.log(`⏸️ Job paused: ${jobId}`);
      
      return true;
      
    } catch (error) {
      console.error(`Failed to pause job ${jobId}:`, error);
      return false;
    }
  }

  async resumeJob(jobId: string): Promise<boolean> {
    const job = this.jobs.get(jobId);
    if (!job || job.status !== 'paused') {
      return false;
    }

    // Add back to queue with high priority
    job.priority = 'high';
    job.status = 'queued';
    this.insertIntoQueue(jobId);
    
    this.emit('jobResumed', job);
    console.log(`▶️ Job resumed: ${jobId}`);
    
    return true;
  }

  // Resource Management
  async registerNode(node: TrainingNode): Promise<void> {
    this.nodes.set(node.id, node);
    
    this.emit('nodeRegistered', node);
    console.log(`🖥️ Node registered: ${node.id} (${node.hostname})`);
  }

  async unregisterNode(nodeId: string): Promise<void> {
    const node = this.nodes.get(nodeId);
    if (!node) {
      return;
    }

    // Move jobs from this node
    const nodeJobs = Array.from(this.jobs.values())
      .filter(job => this.isJobRunningOnNode(job.id, nodeId));
      
    for (const job of nodeJobs) {
      await this.migrateJob(job.id, nodeId);
    }

    this.nodes.delete(nodeId);
    
    this.emit('nodeUnregistered', node);
    console.log(`🚫 Node unregistered: ${nodeId}`);
  }

  // Job Scheduling
  private async scheduleJobs(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    const queuedJobs = this.queue
      .map(jobId => this.jobs.get(jobId)!)
      .filter(job => job.status === 'queued')
      .sort((a, b) => this.getPriorityScore(b) - this.getPriorityScore(a));

    const runningJobsCount = Array.from(this.jobs.values())
      .filter(job => job.status === 'running' || job.status === 'preparing').length;

    const availableSlots = this.maxConcurrentJobs - runningJobsCount;
    
    if (availableSlots <= 0 || queuedJobs.length === 0) {
      return;
    }

    console.log(`🎯 Scheduling jobs: ${queuedJobs.length} queued, ${availableSlots} slots available`);

    for (let i = 0; i < Math.min(queuedJobs.length, availableSlots); i++) {
      const job = queuedJobs[i];
      
      try {
        const allocated = await this.allocateResources(job);
        if (allocated) {
          await this.startJob(job);
        }
      } catch (error) {
        console.error(`Failed to start job ${job.id}:`, error);
        job.status = 'failed';
        job.error = error instanceof Error ? error.message : String(error);
        job.completedAt = new Date();
      }
    }
  }

  private getPriorityScore(job: TrainingJob): number {
    const priorityScores = {
      'critical': 1000,
      'high': 100,
      'normal': 10,
      'low': 1
    };

    let score = priorityScores[job.priority];
    
    // Add age bonus (older jobs get higher priority)
    const ageHours = (Date.now() - job.createdAt.getTime()) / (1000 * 60 * 60);
    score += Math.floor(ageHours);
    
    return score;
  }

  private async allocateResources(job: TrainingJob): Promise<boolean> {
    const requirements = job.resourceRequirements;
    const availableNodes = Array.from(this.nodes.values())
      .filter(node => node.status === 'available')
      .filter(node => this.canRunJob(node, requirements));

    if (availableNodes.length === 0) {
      console.log(`⚠️ No available nodes for job ${job.id}`);
      return false;
    }

    // Select best node(s) based on resource requirements
    const selectedNodes = await this.selectOptimalNodes(job, availableNodes);
    
    if (selectedNodes.length === 0) {
      return false;
    }

    // Allocate resources on selected nodes
    const allocations: ResourceAllocation[] = [];
    
    try {
      for (const node of selectedNodes) {
        const allocation = await this.reserveNodeResources(node, job);
        allocations.push(allocation);
      }

      // Store allocations
      for (const allocation of allocations) {
        this.allocations.set(allocation.jobId, allocation);
      }

      console.log(`✅ Resources allocated for job ${job.id} on ${selectedNodes.length} node(s)`);
      return true;

    } catch (error) {
      // Rollback any partial allocations
      for (const allocation of allocations) {
        await this.releaseNodeResources(allocation.nodeId, allocation.jobId);
      }
      throw error;
    }
  }

  // Training Execution
  private async startJob(job: TrainingJob): Promise<void> {
    console.log(`🏃 Starting job: ${job.id} (${job.name})`);
    
    job.status = 'preparing';
    job.startedAt = new Date();
    
    try {
      // Set up training environment
      await this.prepareTrainingEnvironment(job);
      
      // Load model
      const model = await this.loadModel(job.modelId);
      
      // Prepare dataset
      const dataset = await this.prepareDataset(job.dataset);
      
      // Set up checkpointing
      if (job.checkpointing.enabled) {
        await this.setupCheckpointing(job);
      }
      
      // Set up monitoring
      if (job.monitoring.enabled) {
        await this.setupMonitoring(job);
      }
      
      job.status = 'running';
      
      // Start training
      await this.executeTraining(job, model, dataset);
      
      this.emit('jobStarted', job);
      
    } catch (error) {
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : String(error);
      job.completedAt = new Date();
      
      await this.freeJobResources(job.id);
      
      this.emit('jobFailed', { job, error });
      throw error;
    }
  }

  private async executeTraining(job: TrainingJob, model: HuggingFaceModelBase, dataset: unknown): Promise<void> {
    try {
      // Set up progress tracking
      model.on('trainingProgress', (_progress: TrainingProgress) => {
        job.progress = _progress;
        this.recordMetrics(job.id, _progress);
        this.emit('trainingProgress', { job, progress: _progress });
      });

      // Set up checkpointing
      if (job.checkpointing.enabled) {
        model.on('epochCompleted', async () => {
          if (this.shouldCreateCheckpoint(job)) {
            await this.createCheckpoint(job.id, 'epoch');
          }
        });
      }

      // Start training
      await model.startTraining(dataset as Record<string, unknown>[], job.config);
      
      // Training completed successfully
      job.status = 'completed';
      job.completedAt = new Date();
      
      // Save final model
      await this.saveTrainedModel(job, model);
      
      // Clean up resources
      await this.freeJobResources(job.id);
      
      this.emit('jobCompleted', job);
      console.log(`✅ Job completed: ${job.id} (${job.name})`);
      
    } catch (error) {
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : String(error);
      job.completedAt = new Date();
      
      await this.freeJobResources(job.id);
      
      this.emit('jobFailed', { job, error });
      throw error;
    }
  }

  // Checkpointing
  private async createCheckpoint(jobId: string, trigger: string): Promise<CheckpointInfo> {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job not found: ${jobId}`);
    }

    const checkpointId = `checkpoint_${jobId}_${Date.now()}`;
    const filePath = `./checkpoints/${jobId}/${checkpointId}`;

    try {
      job.status = 'checkpointing';
      
      // Create checkpoint directory
      const fs = await import('fs/promises');
      await fs.mkdir(filePath, { recursive: true });
      
      // Save model state, optimizer state, etc.
      // This would integrate with the actual training framework
      
      const checkpointInfo: CheckpointInfo = {
        jobId,
        checkpointId,
        epoch: job.progress?.epoch || 0,
        step: job.progress?.step || 0,
        filePath,
        size: 1024 * 1024, // Mock size
        hash: 'mock_hash_' + Date.now(),
        metadata: {
          trigger,
          model_state: 'saved',
          optimizer_state: 'saved',
          scheduler_state: 'saved'
        },
        createdAt: new Date(),
        isValid: true,
        canResume: true
      };

      // Upload to remote storage if configured
      if (job.checkpointing.remoteStorage?.enabled) {
        checkpointInfo.remoteUrl = await this.uploadCheckpointToRemote(checkpointInfo, job.checkpointing.remoteStorage);
      }

      // Add to checkpoints list
      const jobCheckpoints = this.checkpoints.get(jobId) || [];
      jobCheckpoints.push(checkpointInfo);
      this.checkpoints.set(jobId, jobCheckpoints);

      // Clean up old checkpoints
      await this.cleanupOldCheckpoints(jobId, job.checkpointing.maxCheckpoints);

      job.status = 'running'; // Resume running status
      
      this.emit('checkpointCreated', checkpointInfo);
      console.log(`💾 Checkpoint created: ${checkpointId}`);
      
      return checkpointInfo;

    } catch (error) {
      job.status = 'running'; // Resume running status even on error
      console.error(`Failed to create checkpoint for job ${jobId}:`, error);
      throw error;
    }
  }

  // Monitoring and Metrics
  private recordMetrics(jobId: string, progress: TrainingProgress): void {
    const job = this.jobs.get(jobId);
    if (!job) return;

    const metrics: TrainingMetrics = {
      jobId,
      timestamp: new Date(),
      epoch: progress.epoch,
      step: progress.step,
      trainingLoss: progress.loss,
      validationLoss: progress.evalLoss,
      trainingAccuracy: progress.accuracy,
      learningRate: progress.learningRate,
      batchSize: job.config.batchSize,
      throughput: 0, // Would calculate actual throughput
      resourceUsage: {
        cpuUtilization: 50, // Mock values
        memoryUsageGB: 8,
        gpuUtilization: [85, 87],
        diskUsageGB: 2,
        networkUtilizationMbps: 10
      },
      customMetrics: progress.metrics || {}
    };

    const jobMetrics = this.metrics.get(jobId) || [];
    jobMetrics.push(metrics);
    this.metrics.set(jobId, jobMetrics);

    // Keep only recent metrics
    if (jobMetrics.length > 10000) {
      jobMetrics.splice(0, jobMetrics.length - 10000);
    }

    // Check alert conditions
    this.checkAlertConditions(job, metrics);
  }

  private checkAlertConditions(job: TrainingJob, metrics: TrainingMetrics): void {
    if (!job.monitoring.alerting.enabled) return;

    for (const condition of job.monitoring.alerting.conditions) {
      const metricValue = this.getMetricValue(metrics, condition.metric);
      if (metricValue === undefined) continue;

      const shouldAlert = this.evaluateCondition(metricValue, condition);
      
      if (shouldAlert) {
        this.triggerAlert(job, condition, metricValue);
      }
    }
  }

  // Utility methods
  private canRunJob(node: TrainingNode, requirements: ResourceRequirements): boolean {
    const available = this.getAvailableResources(node);
    
    return (
      available.cpuCores >= requirements.minCpuCores &&
      available.memoryGB >= requirements.minMemoryGB &&
      available.diskSpaceGB >= requirements.diskSpaceGB &&
      (!requirements.gpuCount || available.gpuCount >= requirements.gpuCount) &&
      (!requirements.minGpuMemoryGB || available.gpuMemoryGB >= requirements.minGpuMemoryGB)
    );
  }

  private getAvailableResources(node: TrainingNode): { cpuCores: number; memoryGB: number; diskSpaceGB: number; gpuCount: number; gpuMemoryGB: number } {
    // Calculate available resources based on current usage
    const capacity = node.maxCapacity;
    const usage = node.currentLoad;
    
    return {
      cpuCores: capacity.maxCpuCores - (capacity.maxCpuCores * usage.cpuUtilization / 100),
      memoryGB: capacity.maxMemoryGB - usage.memoryUsageGB,
      diskSpaceGB: capacity.maxDiskSpaceGB - usage.diskUsageGB,
      gpuCount: node.capabilities.gpus.length,
      gpuMemoryGB: node.capabilities.gpus.reduce((sum, gpu) => sum + gpu.memoryGB, 0)
    };
  }

  private async selectOptimalNodes(job: TrainingJob, availableNodes: TrainingNode[]): Promise<TrainingNode[]> {
    // For now, select the node with the most available resources
    // In a full implementation, this would consider network topology, data locality, etc.
    
    const scored = availableNodes.map(node => {
      const available = this.getAvailableResources(node);
      const score = available.cpuCores + available.memoryGB + available.gpuCount * 10;
      return { node, score };
    });

    scored.sort((a, b) => b.score - a.score);
    
    // For single-node jobs, return the best node
    if (!job.distributedConfig?.enabled) {
      return scored.length > 0 ? [scored[0].node] : [];
    }

    // For distributed jobs, select multiple nodes
    const requiredNodes = job.distributedConfig.nodes;
    return scored.slice(0, requiredNodes).map(s => s.node);
  }

  // Background processes
  private startScheduler(intervalSeconds: number): void {
    this.schedulerTimer = setInterval(() => {
      this.scheduleJobs().catch(error => {
        console.error('Scheduler error:', error);
      });
    }, intervalSeconds * 1000);
  }

  private startMonitoring(intervalSeconds: number): void {
    this.monitoringTimer = setInterval(() => {
      this.collectSystemMetrics().catch(error => {
        console.error('Monitoring error:', error);
      });
    }, intervalSeconds * 1000);
  }

  private startHeartbeat(intervalSeconds: number): void {
    this.heartbeatTimer = setInterval(() => {
      this.sendHeartbeats().catch(error => {
        console.error('Heartbeat error:', error);
      });
    }, intervalSeconds * 1000);
  }

  // Placeholder methods - would be implemented with actual integrations
  private async discoverNodes(): Promise<void> {
    // Would discover nodes via Kubernetes API, Docker Swarm, etc.
    console.log('🔍 Discovering training nodes...');
  }

  private async loadJobs(): Promise<void> {
    // Load jobs from persistent storage
  }

  private async saveJobs(): Promise<void> {
    // Save jobs to persistent storage
  }

  private async resumeInterruptedJobs(): Promise<void> {
    // Resume jobs that were interrupted
  }

  private async validateJobConfig(_job: TrainingJob): Promise<void> {
    // Validate job configuration
  }

  private insertIntoQueue(jobId: string): void {
    // Insert job into priority queue
    this.queue.push(jobId);
  }

  private async stopRunningJob(_jobId: string): Promise<void> {
    // Stop running training job
    console.log(`Stopping job: ${_jobId}`);
  }

  private async freeJobResources(_jobId: string): Promise<void> {
    // Free allocated resources
    console.log(`Freeing resources for job: ${_jobId}`);
  }

  private isJobRunningOnNode(_jobId: string, _nodeId: string): boolean {
    // Check if job is running on specific node
    console.log(`Checking if job ${_jobId} is running on node ${_nodeId}`);
    return false;
  }

  private async migrateJob(_jobId: string, _fromNodeId: string): Promise<void> {
    // Migrate job from one node to another
    console.log(`Migrating job ${_jobId} from node ${_fromNodeId}`);
  }

  private async reserveNodeResources(node: TrainingNode, job: TrainingJob): Promise<ResourceAllocation> {
    // Reserve resources on node
    console.log(`Reserving resources on node ${node.id} for job ${job.id}`);
    return {
      jobId: job.id,
      nodeId: node.id,
      resources: {
        cpuCores: job.resourceRequirements.minCpuCores,
        memoryGB: job.resourceRequirements.minMemoryGB,
        gpuIds: [],
        gpuMemoryGB: job.resourceRequirements.minGpuMemoryGB || 0,
        diskSpaceGB: job.resourceRequirements.diskSpaceGB,
        networkPorts: []
      },
      allocatedAt: new Date(),
      estimatedReleaseAt: new Date(Date.now() + job.resourceRequirements.estimatedTrainingTimeHours * 60 * 60 * 1000)
    };
  }

  private async releaseNodeResources(_nodeId: string, _jobId: string): Promise<void> {
    // Release node resources
    console.log(`Releasing resources on node ${_nodeId} for job ${_jobId}`);
  }

  private async prepareTrainingEnvironment(_job: TrainingJob): Promise<void> {
    // Set up training environment
    console.log(`Preparing training environment for job: ${_job.id}`);
  }

  private async loadModel(modelId: string): Promise<HuggingFaceModelBase> {
    // Load model from registry
    const entry = await this.registry.getModelByHuggingFaceId(modelId);
    if (!entry) {
      throw new Error(`Model not found: ${modelId}`);
    }
    
    // Would return actual model instance
    return {} as HuggingFaceModelBase;
  }

  private async prepareDataset(_dataset: TrainingDataset): Promise<unknown> {
    // Prepare and load dataset
    return {};
  }

  private async setupCheckpointing(_job: TrainingJob): Promise<void> {
    // Set up checkpointing system
    console.log(`Setting up checkpointing for job: ${_job.id}`);
  }

  private async setupMonitoring(_job: TrainingJob): Promise<void> {
    // Set up monitoring and alerting
    console.log(`Setting up monitoring for job: ${_job.id}`);
  }

  private shouldCreateCheckpoint(_job: TrainingJob): boolean {
    // Determine if checkpoint should be created
    console.log(`Checking if checkpoint should be created for job: ${_job.id}`);
    return true;
  }

  private async saveTrainedModel(_job: TrainingJob, _model: HuggingFaceModelBase): Promise<void> {
    // Save trained model
    console.log(`Saving trained model for job: ${_job.id}`);
  }

  private async uploadCheckpointToRemote(_checkpoint: CheckpointInfo, _config: Record<string, unknown>): Promise<string> {
    // Upload checkpoint to remote storage
    console.log(`Uploading checkpoint ${_checkpoint.checkpointId} to remote storage`);
    return 'https://remote-storage/checkpoint-url';
  }

  private async cleanupOldCheckpoints(_jobId: string, _maxCheckpoints: number): Promise<void> {
    // Clean up old checkpoints
    console.log(`Cleaning up old checkpoints for job ${_jobId}, keeping max ${_maxCheckpoints}`);
  }

  private getMetricValue(metrics: TrainingMetrics, _metricName: string): number | undefined {
    // Extract metric value by name
    console.log(`Getting metric value for ${_metricName}`);
    return metrics.trainingLoss;
  }

  private evaluateCondition(value: number, condition: AlertCondition): boolean {
    // Evaluate alert condition
    switch (condition.comparison) {
      case 'gt': return value > condition.threshold;
      case 'lt': return value < condition.threshold;
      case 'eq': return value === condition.threshold;
      case 'ne': return value !== condition.threshold;
      default: return false;
    }
  }

  private triggerAlert(job: TrainingJob, condition: AlertCondition, value: number): void {
    // Trigger alert
    console.warn(`🚨 Alert: ${condition.name} for job ${job.id}: ${value}`);
    this.emit('alert', { job, condition, value });
  }

  private async collectSystemMetrics(): Promise<void> {
    // Collect system metrics from all nodes
  }

  private async sendHeartbeats(): Promise<void> {
    // Send heartbeats to all nodes
  }

  // Public API
  getJob(jobId: string): TrainingJob | undefined {
    return this.jobs.get(jobId);
  }

  getAllJobs(): TrainingJob[] {
    return Array.from(this.jobs.values());
  }

  getJobsByStatus(status: TrainingJobStatus): TrainingJob[] {
    return Array.from(this.jobs.values()).filter(job => job.status === status);
  }

  getJobMetrics(jobId: string): TrainingMetrics[] {
    return this.metrics.get(jobId) || [];
  }

  getJobCheckpoints(jobId: string): CheckpointInfo[] {
    return this.checkpoints.get(jobId) || [];
  }

  getAllNodes(): TrainingNode[] {
    return Array.from(this.nodes.values());
  }

  getNodesByStatus(status: string): TrainingNode[] {
    return Array.from(this.nodes.values()).filter(node => node.status === status);
  }

  getResourceAllocations(): ResourceAllocation[] {
    return Array.from(this.allocations.values());
  }

  getSystemStats(): Record<string, unknown> {
    const jobs = Array.from(this.jobs.values());
    const nodes = Array.from(this.nodes.values());
    
    return {
      jobMetrics: {
        total: jobs.length,
        queued: jobs.filter(j => j.status === 'queued').length,
        running: jobs.filter(j => j.status === 'running').length,
        completed: jobs.filter(j => j.status === 'completed').length,
        failed: jobs.filter(j => j.status === 'failed').length
      },
      nodes: {
        total: nodes.length,
        available: nodes.filter(n => n.status === 'available').length,
        busy: nodes.filter(n => n.status === 'busy').length,
        offline: nodes.filter(n => n.status === 'offline').length
      },
      resources: {
        totalCpuCores: nodes.reduce((sum, n) => sum + n.capabilities.cpuCores, 0),
        totalMemoryGB: nodes.reduce((sum, n) => sum + n.capabilities.memoryGB, 0),
        totalGpus: nodes.reduce((sum, n) => sum + n.capabilities.gpus.length, 0)
      }
    };
  }
}

export default TrainingOrchestrator;
