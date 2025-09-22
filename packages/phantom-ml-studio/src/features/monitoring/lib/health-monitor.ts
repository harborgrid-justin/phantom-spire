/**
 * Enterprise Health Check System
 * Comprehensive service monitoring with detailed health reporting
 * Compatible with Kubernetes, Docker, and enterprise monitoring tools
 */

import { EventEmitter } from 'events';

export interface HealthCheckConfig {
  timeout: number; // milliseconds
  interval: number; // milliseconds for periodic checks
  retries: number;
  critical: boolean; // whether failure affects overall health
  tags: string[];
  dependencies?: string[]; // other health checks this depends on
}

export interface HealthCheckResult {
  name: string;
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  responseTime: number; // milliseconds
  timestamp: Date;
  details?: Record<string, any>;
  error?: string;
  dependencies?: HealthCheckResult[];
}

export interface ServiceHealth {
  service: string;
  status: 'healthy' | 'warning' | 'critical';
  uptime: number; // seconds
  checks: HealthCheckResult[];
  summary: {
    total: number;
    healthy: number;
    warning: number;
    critical: number;
    unknown: number;
  };
  lastUpdated: Date;
}

export interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical';
  score: number; // 0-100
  uptime: number; // seconds
  services: ServiceHealth[];
  environment: {
    nodeVersion: string;
    platform: string;
    arch: string;
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    cpu: {
      usage: number;
      loadAverage: number[];
    };
    disk?: {
      usage: number;
      available: number;
    };
  };
  lastUpdated: Date;
  alerts: Array<{
    level: 'warning' | 'critical';
    message: string;
    service?: string;
    timestamp: Date;
  }>;
}

export type HealthCheckFunction = () => Promise<{
  healthy: boolean;
  details?: Record<string, any>;
  responseTime?: number;
  error?: string;
}>;

/**
 * Individual health check implementation
 */
export class HealthCheck {
  public readonly name: string;
  public readonly config: HealthCheckConfig;
  private checkFunction: HealthCheckFunction;
  private lastResult?: HealthCheckResult;
  private running = false;

  constructor(
    name: string,
    checkFunction: HealthCheckFunction,
    config: Partial<HealthCheckConfig> = {}
  ) {
    this.name = name;
    this.checkFunction = checkFunction;
    this.config = {
      timeout: 5000,
      interval: 30000,
      retries: 2,
      critical: true,
      tags: [],
      ...config
    };
  }

  async execute(): Promise<HealthCheckResult> {
    if (this.running) {
      return this.lastResult || this.createUnknownResult('Check already running');
    }

    this.running = true;
    const startTime = Date.now();
    let attempts = 0;
    let lastError: any;

    try {
      while (attempts <= this.config.retries) {
        try {
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Health check timeout')), this.config.timeout)
          );

          const result = await Promise.race([
            this.checkFunction(),
            timeoutPromise
          ]);

          const responseTime = Date.now() - startTime;
          
          const healthResult: HealthCheckResult = {
            name: this.name,
            status: result.healthy ? 'healthy' : 'critical',
            responseTime: result.responseTime || responseTime,
            timestamp: new Date(),
            details: result.details,
            error: result.error
          };

          this.lastResult = healthResult;
          return healthResult;

        } catch (error) {
          lastError = error;
          attempts++;
          
          if (attempts <= this.config.retries) {
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
          }
        }
      }

      // All retries exhausted
      const responseTime = Date.now() - startTime;
      const healthResult: HealthCheckResult = {
        name: this.name,
        status: 'critical',
        responseTime,
        timestamp: new Date(),
        error: lastError?.message || 'Unknown error'
      };

      this.lastResult = healthResult;
      return healthResult;

    } finally {
      this.running = false;
    }
  }

  private createUnknownResult(reason: string): HealthCheckResult {
    return {
      name: this.name,
      status: 'unknown',
      responseTime: 0,
      timestamp: new Date(),
      error: reason
    };
  }

  getLastResult(): HealthCheckResult | undefined {
    return this.lastResult;
  }
}

/**
 * Comprehensive health monitoring system
 */
export class EnterpriseHealthMonitor extends EventEmitter {
  private healthChecks: Map<string, HealthCheck> = new Map();
  private serviceGroups: Map<string, string[]> = new Map(); // service -> check names
  private isRunning = false;
  private checkInterval?: NodeJS.Timeout;
  private startTime = Date.now();
  private alerts: Array<{
    level: 'warning' | 'critical';
    message: string;
    service?: string;
    timestamp: Date;
  }> = [];

  constructor() {
    super();
    this.registerDefaultHealthChecks();
  }

  /**
   * Register a health check
   */
  registerHealthCheck(
    name: string,
    checkFunction: HealthCheckFunction,
    config?: Partial<HealthCheckConfig>,
    service?: string
  ): void {
    const healthCheck = new HealthCheck(name, checkFunction, config);
    this.healthChecks.set(name, healthCheck);

    // Add to service group if specified
    if (service) {
      if (!this.serviceGroups.has(service)) {
        this.serviceGroups.set(service, []);
      }
      this.serviceGroups.get(service)!.push(name);
    }

    this.emit('health_check_registered', { name, service });
  }

  /**
   * Unregister a health check
   */
  unregisterHealthCheck(name: string): boolean {
    const removed = this.healthChecks.delete(name);
    
    // Remove from service groups
    for (const [service, checks] of this.serviceGroups.entries()) {
      const index = checks.indexOf(name);
      if (index !== -1) {
        checks.splice(index, 1);
        if (checks.length === 0) {
          this.serviceGroups.delete(service);
        }
        break;
      }
    }

    if (removed) {
      this.emit('health_check_unregistered', { name });
    }

    return removed;
  }

  /**
   * Start periodic health monitoring
   */
  start(interval: number = 30000): void {
    if (this.isRunning) return;

    this.isRunning = true;
    
    // Run initial check
    this.runAllChecks();

    // Schedule periodic checks
    this.checkInterval = setInterval(() => {
      this.runAllChecks();
    }, interval);

    this.emit('monitoring_started', { interval });
  }

  /**
   * Stop health monitoring
   */
  stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = undefined;
    }

    this.emit('monitoring_stopped');
  }

  /**
   * Execute a specific health check
   */
  async executeHealthCheck(name: string): Promise<HealthCheckResult | null> {
    const healthCheck = this.healthChecks.get(name);
    if (!healthCheck) return null;

    try {
      const result = await healthCheck.execute();
      this.processHealthCheckResult(result);
      return result;
    } catch (error) {
      return {
        name,
        status: 'critical',
        responseTime: 0,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Execute all health checks
   */
  async runAllChecks(): Promise<HealthCheckResult[]> {
    const results: HealthCheckResult[] = [];
    
    // Execute all checks in parallel
    const checkPromises = Array.from(this.healthChecks.entries()).map(
      async ([name, healthCheck]) => {
        try {
          const result = await healthCheck.execute();
          this.processHealthCheckResult(result);
          return result;
        } catch (error) {
          return {
            name,
            status: 'critical' as const,
            responseTime: 0,
            timestamp: new Date(),
            error: error instanceof Error ? error.message : String(error)
          };
        }
      }
    );

    const checkResults = await Promise.allSettled(checkPromises);
    
    for (const result of checkResults) {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      }
    }

    this.emit('health_checks_completed', { count: results.length });
    return results;
  }

  /**
   * Get current health status for a specific service
   */
  async getServiceHealth(serviceName: string): Promise<ServiceHealth | null> {
    const checkNames = this.serviceGroups.get(serviceName);
    if (!checkNames || checkNames.length === 0) return null;

    const checks: HealthCheckResult[] = [];
    
    // Execute all checks for this service
    for (const checkName of checkNames) {
      const result = await this.executeHealthCheck(checkName);
      if (result) {
        checks.push(result);
      }
    }

    return this.buildServiceHealth(serviceName, checks);
  }

  /**
   * Get comprehensive system health
   */
  async getSystemHealth(): Promise<SystemHealth> {
    // Run all health checks
    const allResults = await this.runAllChecks();
    
    // Group by service
    const services: ServiceHealth[] = [];
    
    for (const [serviceName, checkNames] of this.serviceGroups.entries()) {
      const serviceChecks = allResults.filter(result => checkNames.includes(result.name));
      if (serviceChecks.length > 0) {
        services.push(this.buildServiceHealth(serviceName, serviceChecks));
      }
    }

    // Add ungrouped checks as 'system' service
    const ungroupedChecks = allResults.filter(result => 
      !Array.from(this.serviceGroups.values()).flat().includes(result.name)
    );
    
    if (ungroupedChecks.length > 0) {
      services.push(this.buildServiceHealth('system', ungroupedChecks));
    }

    // Calculate overall status
    const overallStatus = this.calculateOverallStatus(services);
    const healthScore = this.calculateHealthScore(services);
    const environment = await this.getEnvironmentInfo();

    return {
      overall: overallStatus,
      score: healthScore,
      uptime: (Date.now() - this.startTime) / 1000,
      services,
      environment,
      lastUpdated: new Date(),
      alerts: this.alerts.slice(-50) // Last 50 alerts
    };
  }

  /**
   * Get health check summary
   */
  getHealthSummary(): {
    totalChecks: number;
    services: number;
    healthy: number;
    warning: number;
    critical: number;
    unknown: number;
    lastRun?: Date;
  } {
    const results = Array.from(this.healthChecks.values())
      .map(check => check.getLastResult())
      .filter((result): result is HealthCheckResult => result !== undefined);

    const summary = {
      totalChecks: this.healthChecks.size,
      services: this.serviceGroups.size,
      healthy: 0,
      warning: 0,
      critical: 0,
      unknown: 0,
      lastRun: undefined as Date | undefined
    };

    if (results.length > 0) {
      summary.lastRun = new Date(Math.max(...results.map(r => r.timestamp.getTime())));
      
      for (const result of results) {
        summary[result.status]++;
      }
    }

    return summary;
  }

  /**
   * Create health check endpoint for Express/HTTP servers
   */
  createHealthEndpoint(detailed: boolean = false) {
    return async (req: any, res: any) => {
      try {
        if (detailed) {
          const systemHealth = await this.getSystemHealth();
          
          // Set appropriate HTTP status
          let statusCode = 200;
          if (systemHealth.overall === 'warning') statusCode = 200; // Still OK
          else if (systemHealth.overall === 'critical') statusCode = 503;
          
          res.status(statusCode).json(systemHealth);
        } else {
          const summary = this.getHealthSummary();
          
          // Simple health check
          const isHealthy = summary.critical === 0 && summary.unknown === 0;
          const statusCode = isHealthy ? 200 : 503;
          
          res.status(statusCode).json({
            status: isHealthy ? 'healthy' : 'unhealthy',
            timestamp: new Date().toISOString(),
            uptime: (Date.now() - this.startTime) / 1000,
            checks: summary
          });
        }
      } catch (error) {
        res.status(500).json({
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        });
      }
    };
  }

  /**
   * Private helper methods
   */
  private registerDefaultHealthChecks(): void {
    // Node.js process health
    this.registerHealthCheck(
      'process',
      async () => {
        const memoryUsage = process.memoryUsage();
        const memoryPercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
        
        return {
          healthy: memoryPercent < 90, // Unhealthy if using >90% of heap
          details: {
            memory: memoryUsage,
            uptime: process.uptime(),
            version: process.version
          }
        };
      },
      { critical: true, tags: ['system'], interval: 15000 },
      'system'
    );

    // Event loop lag check
    this.registerHealthCheck(
      'event_loop',
      async () => {
        const start = process.hrtime.bigint();
        
        return new Promise((resolve) => {
          setImmediate(() => {
            const lag = Number(process.hrtime.bigint() - start) / 1000000; // Convert to ms
            resolve({
              healthy: lag < 100, // Unhealthy if lag > 100ms
              details: { lagMs: lag },
              responseTime: lag
            });
          });
        });
      },
      { critical: false, tags: ['performance'], interval: 30000 },
      'system'
    );
  }

  private processHealthCheckResult(result: HealthCheckResult): void {
    // Generate alerts for status changes
    const previousResult = this.healthChecks.get(result.name)?.getLastResult();
    
    if (previousResult && previousResult.status !== result.status) {
      if (result.status === 'critical') {
        this.addAlert('critical', `Health check '${result.name}' is now critical: ${result.error || 'No details'}`);
      } else if (result.status === 'warning') {
        this.addAlert('warning', `Health check '${result.name}' is now in warning state`);
      } else if (result.status === 'healthy' && previousResult.status === 'critical') {
        this.addAlert('warning', `Health check '${result.name}' recovered from critical state`);
      }
    }

    this.emit('health_check_result', result);
  }

  private addAlert(level: 'warning' | 'critical', message: string, service?: string): void {
    const alert = {
      level,
      message,
      service,
      timestamp: new Date()
    };
    
    this.alerts.push(alert);
    
    // Keep only recent alerts
    if (this.alerts.length > 1000) {
      this.alerts = this.alerts.slice(-1000);
    }
    
    this.emit('health_alert', alert);
  }

  private buildServiceHealth(serviceName: string, checks: HealthCheckResult[]): ServiceHealth {
    const summary = {
      total: checks.length,
      healthy: checks.filter(c => c.status === 'healthy').length,
      warning: checks.filter(c => c.status === 'warning').length,
      critical: checks.filter(c => c.status === 'critical').length,
      unknown: checks.filter(c => c.status === 'unknown').length
    };

    let status: 'healthy' | 'warning' | 'critical';
    if (summary.critical > 0) {
      status = 'critical';
    } else if (summary.warning > 0) {
      status = 'warning';
    } else {
      status = 'healthy';
    }

    return {
      service: serviceName,
      status,
      uptime: (Date.now() - this.startTime) / 1000,
      checks,
      summary,
      lastUpdated: new Date()
    };
  }

  private calculateOverallStatus(services: ServiceHealth[]): 'healthy' | 'warning' | 'critical' {
    if (services.some(s => s.status === 'critical')) {
      return 'critical';
    } else if (services.some(s => s.status === 'warning')) {
      return 'warning';
    }
    return 'healthy';
  }

  private calculateHealthScore(services: ServiceHealth[]): number {
    if (services.length === 0) return 100;
    
    let totalScore = 0;
    
    for (const service of services) {
      let serviceScore = 100;
      
      // Penalize based on failed checks
      const failureRate = (service.summary.critical + service.summary.unknown) / service.summary.total;
      serviceScore -= failureRate * 60; // Up to 60 points off for failures
      
      const warningRate = service.summary.warning / service.summary.total;
      serviceScore -= warningRate * 20; // Up to 20 points off for warnings
      
      totalScore += Math.max(0, serviceScore);
    }
    
    return Math.round(totalScore / services.length);
  }

  private async getEnvironmentInfo(): Promise<SystemHealth['environment']> {
    const memoryUsage = process.memoryUsage();
    const totalMemory = memoryUsage.heapTotal;
    const usedMemory = memoryUsage.heapUsed;
    
    // Calculate CPU usage (simplified)
    const cpuUsage = await new Promise<number>((resolve) => {
      const start = process.cpuUsage();
      setTimeout(() => {
        const end = process.cpuUsage(start);
        const usage = ((end.user + end.system) / 1000000) * 100; // Convert to percentage
        resolve(Math.min(100, usage));
      }, 100);
    });

    return {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      memory: {
        used: usedMemory,
        total: totalMemory,
        percentage: (usedMemory / totalMemory) * 100
      },
      cpu: {
        usage: cpuUsage,
        loadAverage: process.platform !== 'win32' ? require('os').loadavg() : [0, 0, 0]
      }
    };
  }
}

/**
 * Predefined health check functions for common services
 */
export const CommonHealthChecks = {
  /**
   * Database connection health check
   */
  database: (connectionTest: () => Promise<boolean>, name: string = 'database') => ({
    name,
    check: async () => {
      const start = Date.now();
      try {
        const connected = await connectionTest();
        return {
          healthy: connected,
          responseTime: Date.now() - start,
          details: { connected }
        };
      } catch (error) {
        return {
          healthy: false,
          responseTime: Date.now() - start,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }
  }),

  /**
   * HTTP endpoint health check
   */
  httpEndpoint: (url: string, expectedStatus: number = 200, timeout: number = 5000) => ({
    name: `http_${url.replace(/[^a-zA-Z0-9]/g, '_')}`,
    check: async () => {
      const start = Date.now();
      try {
        // Simple HTTP check (would use fetch or axios in production)
        const response = await new Promise<{ status: number }>((resolve, reject) => {
          // Simplified for example - would use actual HTTP client
          setTimeout(() => resolve({ status: expectedStatus }), 100);
        });
        
        return {
          healthy: response.status === expectedStatus,
          responseTime: Date.now() - start,
          details: { status: response.status, url }
        };
      } catch (error) {
        return {
          healthy: false,
          responseTime: Date.now() - start,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }
  }),

  /**
   * Cache health check
   */
  cache: (cacheTest: () => Promise<{ hit: boolean; responseTime: number }>, name: string = 'cache') => ({
    name,
    check: async () => {
      try {
        const result = await cacheTest();
        return {
          healthy: true,
          responseTime: result.responseTime,
          details: { hit: result.hit }
        };
      } catch (error) {
        return {
          healthy: false,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }
  })
};

/**
 * Factory function
 */
export function createHealthMonitor(): EnterpriseHealthMonitor {
  return new EnterpriseHealthMonitor();
}

// Export singleton instance
export const healthMonitor = createHealthMonitor();