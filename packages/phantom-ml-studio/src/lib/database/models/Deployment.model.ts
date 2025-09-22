/**
 * DEPLOYMENT SEQUELIZE MODEL
 * Represents ML model deployments with comprehensive type safety
 */
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Default,
  CreatedAt,
  UpdatedAt,
  BelongsTo,
  HasMany,
  ForeignKey,
  DataType,
  Length
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { Op } from 'sequelize';
import { MLModel } from './Model.model';
import { MetricsData } from './MetricsData.model';

// Deployment Attributes Interface
export interface DeploymentAttributes {
  /** Unique identifier for the deployment */
  id: number;
  /** Foreign key reference to the ML model */
  model_id: number;
  /** Human-readable name for the deployment */
  name: string;
  /** Name of the deployed model */
  model_name: string;
  /** Version of the deployed model */
  model_version: string;
  /** Current deployment status */
  status: 'stopped' | 'starting' | 'running' | 'stopping' | 'failed' | 'updating';
  /** Deployment environment */
  environment: 'development' | 'staging' | 'production' | 'testing';
  /** API endpoint URL for the deployment */
  endpoint?: string;
  /** Number of running instances */
  instances: number;
  /** CPU allocation per instance */
  cpu: number;
  /** Memory allocation per instance in GB */
  memory: number;
  /** Current requests per minute */
  requests_per_minute: number;
  /** Total requests served since deployment */
  total_requests: number;
  /** Deployment uptime percentage */
  uptime: string;
  /** Average response time in milliseconds */
  avg_response_time: number;
  /** Error rate percentage */
  error_rate: number;
  /** Timestamp when deployment was first started */
  deployed_at?: Date;
  /** Last update timestamp */
  last_updated: Date;
  /** Health status of the deployment */
  health: 'healthy' | 'degraded' | 'critical' | 'down' | 'unknown';
  /** Whether auto-scaling is enabled */
  auto_scaling: boolean;
  /** Minimum number of instances for auto-scaling */
  min_instances: number;
  /** Maximum number of instances for auto-scaling */
  max_instances: number;
  /** Deployment configuration */
  config: Record<string, any>;
  /** Deployment tags */
  tags: string[];
  /** Resource limits */
  resource_limits: Record<string, any>;
  /** Record creation timestamp */
  created_at: Date;
  /** Record last update timestamp */
  updated_at: Date;
}

// Deployment Creation Attributes Interface
export interface DeploymentCreationAttributes extends Optional<DeploymentAttributes,
  'id' | 'status' | 'environment' | 'endpoint' | 'instances' | 'cpu' | 'memory' | 
  'requests_per_minute' | 'total_requests' | 'uptime' | 'avg_response_time' | 
  'error_rate' | 'deployed_at' | 'last_updated' | 'health' | 'auto_scaling' | 
  'min_instances' | 'max_instances' | 'config' | 'tags' | 'resource_limits' | 
  'created_at' | 'updated_at'
> {}

@Table({
  tableName: 'deployments',
  timestamps: true,
  underscored: true,
  paranoid: false,
  indexes: [
    { fields: ['name'] },
    { fields: ['model_name'] },
    { fields: ['status'] },
    { fields: ['environment'] },
    { fields: ['health'] },
    { fields: ['deployed_at'] },
    { fields: ['last_updated'] },
    { fields: ['created_at'] }
  ]
})
export class Deployment extends Model<DeploymentAttributes, DeploymentCreationAttributes> implements DeploymentAttributes {
  /** Unique identifier for the deployment */
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  /** Associated model ID */
  @ForeignKey(() => Model)
  @AllowNull(true)
  @Column(DataType.INTEGER)
  declare model_id?: number;

  /** Foreign key reference to the ML model */
  @ForeignKey(() => MLModel)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare model_id: number;

  /** Human-readable name for the deployment */
  @AllowNull(false)
  @Length({ min: 1, max: 255 })
  @Column(DataType.STRING(255))
  declare name: string;

  /** Name of the deployed model */
  @AllowNull(false)
  @Length({ min: 1, max: 255 })
  @Column(DataType.STRING(255))
  declare model_name: string;

  /** Version of the deployed model */
  @AllowNull(false)
  @Length({ min: 1, max: 100 })
  @Column(DataType.STRING(100))
  declare model_version: string;

  /** Current deployment status */
  @AllowNull(false)
  @Default('stopped')
  @Column(DataType.ENUM('stopped', 'starting', 'running', 'stopping', 'failed', 'updating'))
  declare status: 'stopped' | 'starting' | 'running' | 'stopping' | 'failed' | 'updating';

  /** Deployment environment */
  @AllowNull(false)
  @Default('development')
  @Column(DataType.ENUM('development', 'staging', 'production', 'testing'))
  declare environment: 'development' | 'staging' | 'production' | 'testing';

  /** API endpoint URL for the deployment */
  @AllowNull(true)
  @Length({ max: 500 })
  @Column(DataType.STRING(500))
  declare endpoint?: string;

  /** Number of running instances */
  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  declare instances: number;

  /** CPU allocation per instance */
  @AllowNull(false)
  @Default(0)
  @Column(DataType.FLOAT)
  declare cpu: number;

  /** Memory allocation per instance in GB */
  @AllowNull(false)
  @Default(0)
  @Column(DataType.FLOAT)
  declare memory: number;

  /** Current requests per minute */
  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  declare requests_per_minute: number;

  /** Total requests served since deployment */
  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  declare total_requests: number;

  /** Deployment uptime percentage */
  @AllowNull(false)
  @Default('0%')
  @Length({ max: 20 })
  @Column(DataType.STRING(20))
  declare uptime: string;

  /** Average response time in milliseconds */
  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  declare avg_response_time: number;

  /** Error rate percentage */
  @AllowNull(false)
  @Default(0)
  @Column(DataType.FLOAT)
  declare error_rate: number;

  /** Timestamp when deployment was first started */
  @AllowNull(true)
  @Column(DataType.DATE)
  declare deployed_at?: Date;

  /** Last update timestamp */
  @AllowNull(false)
  @Default(() => new Date())
  @Column(DataType.DATE)
  declare last_updated: Date;

  /** Health status of the deployment */
  @AllowNull(false)
  @Default('unknown')
  @Column(DataType.ENUM('healthy', 'degraded', 'critical', 'down', 'unknown'))
  declare health: 'healthy' | 'degraded' | 'critical' | 'down' | 'unknown';

  /** Whether auto-scaling is enabled */
  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  declare auto_scaling: boolean;

  /** Minimum number of instances for auto-scaling */
  @AllowNull(false)
  @Default(1)
  @Column(DataType.INTEGER)
  declare min_instances: number;

  /** Maximum number of instances for auto-scaling */
  @AllowNull(false)
  @Default(1)
  @Column(DataType.INTEGER)
  declare max_instances: number;

  /** Deployment configuration */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare config: Record<string, any>;

  /** Deployment tags */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare tags: string[];

  /** Resource limits */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare resource_limits: Record<string, any>;

  /** Record creation timestamp */
  @CreatedAt
  @Column(DataType.DATE)
  declare created_at: Date;

  /** Record last update timestamp */
  @UpdatedAt
  @Column(DataType.DATE)
  declare updated_at: Date;

  // Associations
  /** Associated ML model */
  @BelongsTo(() => MLModel, {
    foreignKey: 'model_id',
    as: 'model',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  declare model?: MLModel;

  /** Metrics data for this deployment */
  @HasMany(() => MetricsData, {
    foreignKey: 'deployment_id',
    as: 'metrics',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  declare metrics?: MetricsData[];

 
  /** Associated model */
  @BelongsTo(() => Model, {
    foreignKey: 'model_id',
    as: 'model',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  })
  declare model?: Model;
 // Instance methods
  /**
   * Increment the total request counter
   * @returns Promise resolving to updated deployment
   */
  public async incrementRequests(): Promise<this> {
    this.total_requests += 1;
    return this.save();
  }

  /**
   * Update the health status of the deployment
   * @param healthStatus New health status
   * @returns Promise resolving to updated deployment
   */
  public async updateHealth(healthStatus: DeploymentAttributes['health']): Promise<this> {
    this.health = healthStatus;
    this.last_updated = new Date();
    return this.save();
  }

  /**
   * Update the deployment status
   * @param newStatus New deployment status
   * @returns Promise resolving to updated deployment
   */
  public async updateStatus(newStatus: DeploymentAttributes['status']): Promise<this> {
    this.status = newStatus;
    if (newStatus === 'running' && !this.deployed_at) {
      this.deployed_at = new Date();
    }
    this.last_updated = new Date();
    return this.save();
  }

  /**
   * Scale the deployment to specified instance count
   * @param instanceCount Target number of instances
   * @returns Promise resolving to updated deployment
   */
  public async scale(instanceCount: number): Promise<this> {
    if (this.auto_scaling) {
      instanceCount = Math.max(this.min_instances, Math.min(this.max_instances, instanceCount));
    }
    this.instances = instanceCount;
    this.last_updated = new Date();
    return this.save();
  }

  /**
   * Check if deployment is running
   * @returns True if deployment status is running
   */
  public isRunning(): boolean {
    return this.status === 'running';
  }

  /**
   * Check if deployment is healthy
   * @returns True if health status is healthy
   */
  public isHealthy(): boolean {
    return this.health === 'healthy';
  }

  /**
   * Get deployment age in days
   * @returns Number of days since deployment
   */
  public getAge(): number {
    if (!this.deployed_at) return 0;
    const now = new Date();
    const diffTime = now.getTime() - this.deployed_at.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get uptime as a percentage number
   * @returns Uptime as percentage (0-100)
   */
  public getUptimePercentage(): number {
    const uptimeStr = this.uptime.replace('%', '');
    return parseFloat(uptimeStr) || 0;
  }

  /**
   * Check if deployment has high error rate
   * @param threshold Error rate threshold (default: 5%)
   * @returns True if error rate exceeds threshold
   */
  public hasHighErrorRate(threshold: number = 5): boolean {
    return this.error_rate > threshold;
  }

  /**
   * Add a tag to the deployment
   * @param tag Tag to add
   * @returns Promise resolving to updated deployment
   */
  public async addTag(tag: string): Promise<this> {
    if (!this.tags.includes(tag)) {
      this.tags = [...this.tags, tag];
      return this.save();
    }
    return this;
  }

  /**
   * Remove a tag from the deployment
   * @param tag Tag to remove
   * @returns Promise resolving to updated deployment
   */
  public async removeTag(tag: string): Promise<this> {
    this.tags = this.tags.filter(t => t !== tag);
    return this.save();
  }

  // Static methods
  /**
   * Find deployments by status
   * @param status Status to filter by
   * @returns Promise resolving to deployments array
   */
  static async findByStatus(status: DeploymentAttributes['status']): Promise<Deployment[]> {
    return this.findAll({
      where: { status },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Find deployments by environment
   * @param environment Environment to filter by
   * @returns Promise resolving to deployments array
   */
  static async findByEnvironment(environment: DeploymentAttributes['environment']): Promise<Deployment[]> {
    return this.findAll({
      where: { environment },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Find deployments by model name
   * @param modelName Model name to filter by
   * @returns Promise resolving to deployments array
   */
  static async findByModel(modelName: string): Promise<Deployment[]> {
    return this.findAll({
      where: { model_name: modelName },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Find all running deployments
   * @returns Promise resolving to running deployments
   */
  static async findRunning(): Promise<Deployment[]> {
    return this.findAll({
      where: { status: 'running' },
      order: [['deployed_at', 'DESC']]
    });
  }

  /**
   * Find unhealthy deployments
   * @returns Promise resolving to unhealthy deployments
   */
  static async findUnhealthy(): Promise<Deployment[]> {
    return this.findAll({
      where: {
        health: {
          [Op.in]: ['degraded', 'critical', 'down']
        }
      },
      order: [['last_updated', 'DESC']]
    });
  }

  /**
   * Find deployments by tag
   * @param tag Tag to search for
   * @returns Promise resolving to deployments array
   */
  static async findByTag(tag: string): Promise<Deployment[]> {
    return this.findAll({
      where: {
        tags: {
          [Op.contains]: [tag]
        }
      },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Get deployment status statistics
   * @returns Promise resolving to status statistics
   */
  static async getStatusStats(): Promise<Array<{ status: string; count: number }>> {
    const results = await this.findAll({
      attributes: [
        'status',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      group: ['status']
    });
    
    return results.map(r => ({
      status: r.status,
      count: parseInt((r as any).getDataValue('count'))
    }));
  }

  /**
   * Get environment distribution statistics
   * @returns Promise resolving to environment statistics
   */
  static async getEnvironmentStats(): Promise<Array<{ environment: string; count: number }>> {
    const results = await this.findAll({
      attributes: [
        'environment',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      group: ['environment']
    });
    
    return results.map(r => ({
      environment: r.environment,
      count: parseInt((r as any).getDataValue('count'))
    }));
  }

  /**
   * Get health status distribution
   * @returns Promise resolving to health statistics
   */
  static async getHealthStats(): Promise<Array<{ health: string; count: number }>> {
    const results = await this.findAll({
      attributes: [
        'health',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      group: ['health']
    });
    
    return results.map(r => ({
      health: r.health,
      count: parseInt((r as any).getDataValue('count'))
    }));
  }

  /**
   * Get total requests across all deployments
   * @returns Promise resolving to total request count
   */
  static async getTotalRequests(): Promise<number> {
    const result = await this.findAll({
      attributes: [
        [this.sequelize!.fn('SUM', this.sequelize!.col('total_requests')), 'total']
      ]
    });
    
    return result[0] ? parseInt((result[0] as any).getDataValue('total')) || 0 : 0;
  }

  /**
   * Get average response time across running deployments
   * @returns Promise resolving to average response time
   */
  static async getAverageResponseTime(): Promise<number> {
    const result = await this.findAll({
      attributes: [
        [this.sequelize!.fn('AVG', this.sequelize!.col('avg_response_time')), 'avg']
      ],
      where: {
        status: 'running'
      }
    });
    
    return result[0] ? parseFloat((result[0] as any).getDataValue('avg')) || 0 : 0;
  }

  /**
   * Get recently deployed deployments
   * @param limit Maximum number of deployments to return
   * @returns Promise resolving to recent deployments
   */
  static async getRecentlyDeployed(limit: number = 10): Promise<Deployment[]> {
    return this.findAll({
      where: this.sequelize!.literal('deployed_at IS NOT NULL'),
      order: [['deployed_at', 'DESC']],
      limit
    });
  }

  /**
   * Get deployment resource usage summary
   * @returns Promise resolving to resource usage statistics
   */
  static async getResourceUsage(): Promise<{
    total_instances: number;
    total_cpu: number;
    total_memory: number;
    avg_cpu_per_deployment: number;
    avg_memory_per_deployment: number;
  }> {
    const results = await this.findAll({
      attributes: [
        [this.sequelize!.fn('SUM', this.sequelize!.col('instances')), 'total_instances'],
        [this.sequelize!.fn('SUM', this.sequelize!.col('cpu')), 'total_cpu'],
        [this.sequelize!.fn('SUM', this.sequelize!.col('memory')), 'total_memory'],
        [this.sequelize!.fn('AVG', this.sequelize!.col('cpu')), 'avg_cpu'],
        [this.sequelize!.fn('AVG', this.sequelize!.col('memory')), 'avg_memory']
      ],
      where: {
        status: {
          [Op.in]: ['running', 'starting']
        }
      }
    });

    const result = results[0];
    return {
      total_instances: result ? parseInt((result as any).getDataValue('total_instances')) || 0 : 0,
      total_cpu: result ? parseFloat((result as any).getDataValue('total_cpu')) || 0 : 0,
      total_memory: result ? parseFloat((result as any).getDataValue('total_memory')) || 0 : 0,
      avg_cpu_per_deployment: result ? parseFloat((result as any).getDataValue('avg_cpu')) || 0 : 0,
      avg_memory_per_deployment: result ? parseFloat((result as any).getDataValue('avg_memory')) || 0 : 0
    };
  }

  /**
   * Find deployments with high error rates
   * @param threshold Error rate threshold (default: 5%)
   * @returns Promise resolving to high error rate deployments
   */
  static async findHighErrorRate(threshold: number = 5): Promise<Deployment[]> {
    return this.findAll({
      where: {
        error_rate: {
          [Op.gt]: threshold
        }
      },
      order: [['error_rate', 'DESC']]
    });
  }

  /**
   * Create deployment with validation
   * @param data Deployment data to create
   * @returns Promise resolving to created deployment
   */
  static async createDeployment(data: DeploymentCreationAttributes): Promise<Deployment> {
    // Validate instance counts for auto-scaling
    if (data.auto_scaling && data.min_instances && data.max_instances) {
      if (data.min_instances > data.max_instances) {
        throw new Error('Minimum instances cannot exceed maximum instances');
      }
    }

    // Validate resource allocations
    if (data.cpu && data.cpu < 0) {
      throw new Error('CPU allocation cannot be negative');
    }
    if (data.memory && data.memory < 0) {
      throw new Error('Memory allocation cannot be negative');
    }

    return this.create(data);
  }
}

export default Deployment;
