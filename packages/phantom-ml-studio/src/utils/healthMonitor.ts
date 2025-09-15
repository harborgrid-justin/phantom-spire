interface HealthCheck {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: number;
  responseTime?: number;
  error?: string;
  metadata?: Record<string, any>;
}

interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  checks: HealthCheck[];
  timestamp: number;
  uptime: number;
}

class HealthMonitor {
  private checks: Map<string, HealthCheck> = new Map();
  private checkInterval: number = 30000; // 30 seconds
  private intervalId: number | null = null;
  private startTime: number = Date.now();

  constructor() {
    this.initializeHealthChecks();
    this.startMonitoring();
  }

  private initializeHealthChecks() {
    // API connectivity check
    this.registerCheck('api', async () => {
      const apiUrl = import.meta.env.VITE_API_URL;
      if (!apiUrl) return { status: 'degraded' as const, error: 'API URL not configured' };

      try {
        const response = await fetch(`${apiUrl}/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 5000,
        } as RequestInit);

        if (!response.ok) {
          return { 
            status: 'unhealthy' as const, 
            error: `API returned ${response.status}` 
          };
        }

        return { status: 'healthy' as const };
      } catch (error: any) {
        return { 
          status: 'unhealthy' as const, 
          error: error.message || 'API unreachable' 
        };
      }
    });

    // WebSocket connectivity check
    this.registerCheck('websocket', async () => {
      const wsUrl = import.meta.env.VITE_WS_URL;
      if (!wsUrl) return { status: 'degraded' as const, error: 'WebSocket URL not configured' };

      return new Promise<{ status: 'healthy' | 'degraded' | 'unhealthy'; error?: string }>((resolve) => {
        try {
          const ws = new WebSocket(wsUrl);
          
          const timeout = setTimeout(() => {
            ws.close();
            resolve({ status: 'unhealthy', error: 'WebSocket connection timeout' });
          }, 5000);

          ws.onopen = () => {
            clearTimeout(timeout);
            ws.close();
            resolve({ status: 'healthy' });
          };

          ws.onerror = () => {
            clearTimeout(timeout);
            resolve({ status: 'unhealthy', error: 'WebSocket connection failed' });
          };
        } catch (error: any) {
          resolve({ status: 'unhealthy', error: error.message || 'WebSocket error' });
        }
      });
    });

    // Browser storage check
    this.registerCheck('storage', async () => {
      try {
        const testKey = '__health_check_test__';
        const testValue = Date.now().toString();
        
        // Test localStorage
        localStorage.setItem(testKey, testValue);
        if (localStorage.getItem(testKey) !== testValue) {
          throw new Error('localStorage write/read failed');
        }
        localStorage.removeItem(testKey);

        // Test sessionStorage
        sessionStorage.setItem(testKey, testValue);
        if (sessionStorage.getItem(testKey) !== testValue) {
          throw new Error('sessionStorage write/read failed');
        }
        sessionStorage.removeItem(testKey);

        return { status: 'healthy' as const };
      } catch (error: any) {
        return { 
          status: 'unhealthy' as const, 
          error: `Storage error: ${error.message}` 
        };
      }
    });

    // Memory usage check
    this.registerCheck('memory', async () => {
      try {
        if ('memory' in performance) {
          const memory = (performance as any).memory;
          const usedMB = memory.usedJSHeapSize / 1024 / 1024;
          const totalMB = memory.totalJSHeapSize / 1024 / 1024;
          const limitMB = memory.jsHeapSizeLimit / 1024 / 1024;
          
          const usagePercentage = (usedMB / limitMB) * 100;
          
          const metadata = {
            usedMB: Math.round(usedMB),
            totalMB: Math.round(totalMB),
            limitMB: Math.round(limitMB),
            usagePercentage: Math.round(usagePercentage),
          };

          if (usagePercentage > 90) {
            return { status: 'unhealthy' as const, error: 'High memory usage', metadata };
          } else if (usagePercentage > 75) {
            return { status: 'degraded' as const, error: 'Elevated memory usage', metadata };
          } else {
            return { status: 'healthy' as const, metadata };
          }
        }
        
        return { status: 'healthy' as const };
      } catch (error: any) {
        return { 
          status: 'degraded' as const, 
          error: `Memory check failed: ${error.message}` 
        };
      }
    });

    // Feature flags check
    this.registerCheck('features', async () => {
      try {
        const criticalFeatures = [
          'VITE_ENABLE_AUTO_ML',
          'VITE_ENABLE_REAL_TIME_MONITORING',
          'VITE_API_URL',
        ];

        const missingFeatures = criticalFeatures.filter(
          feature => !import.meta.env[feature as keyof ImportMetaEnv]
        );

        if (missingFeatures.length > 0) {
          return {
            status: 'degraded' as const,
            error: `Missing feature configurations: ${missingFeatures.join(', ')}`,
            metadata: { missingFeatures }
          };
        }

        return { status: 'healthy' as const };
      } catch (error: any) {
        return { 
          status: 'unhealthy' as const, 
          error: `Feature check failed: ${error.message}` 
        };
      }
    });
  }

  private registerCheck(
    name: string, 
    checkFn: () => Promise<{ 
      status: 'healthy' | 'degraded' | 'unhealthy'; 
      error?: string; 
      metadata?: Record<string, any> 
    }>
  ) {
    this.checks.set(name, {
      name,
      status: 'healthy',
      lastCheck: 0,
    });

    // Store the check function for later execution
    (this.checks.get(name) as any).checkFn = checkFn;
  }

  private async runCheck(name: string): Promise<void> {
    const check = this.checks.get(name);
    if (!check || !(check as any).checkFn) return;

    const startTime = performance.now();
    
    try {
      const result = await (check as any).checkFn();
      const endTime = performance.now();
      
      this.checks.set(name, {
        ...check,
        status: result.status,
        lastCheck: Date.now(),
        responseTime: endTime - startTime,
        error: result.error,
        metadata: result.metadata,
      });
    } catch (error: any) {
      const endTime = performance.now();
      
      this.checks.set(name, {
        ...check,
        status: 'unhealthy',
        lastCheck: Date.now(),
        responseTime: endTime - startTime,
        error: error.message || 'Check failed',
      });
    }
  }

  private async runAllChecks(): Promise<void> {
    const checkPromises = Array.from(this.checks.keys()).map(name => 
      this.runCheck(name)
    );
    
    await Promise.all(checkPromises);
  }

  private startMonitoring(): void {
    // Run initial check
    this.runAllChecks();
    
    // Set up periodic checks
    this.intervalId = window.setInterval(() => {
      this.runAllChecks();
    }, this.checkInterval);
  }

  public stopMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public async getSystemHealth(): Promise<SystemHealth> {
    // Ensure we have recent check results
    await this.runAllChecks();
    
    const checks = Array.from(this.checks.values());
    
    // Determine overall health status
    const hasUnhealthy = checks.some(check => check.status === 'unhealthy');
    const hasDegraded = checks.some(check => check.status === 'degraded');
    
    let overall: 'healthy' | 'degraded' | 'unhealthy';
    if (hasUnhealthy) {
      overall = 'unhealthy';
    } else if (hasDegraded) {
      overall = 'degraded';
    } else {
      overall = 'healthy';
    }

    return {
      overall,
      checks,
      timestamp: Date.now(),
      uptime: Date.now() - this.startTime,
    };
  }

  public getCheck(name: string): HealthCheck | undefined {
    return this.checks.get(name);
  }

  public setCheckInterval(interval: number): void {
    this.checkInterval = interval;
    
    if (this.intervalId) {
      this.stopMonitoring();
      this.startMonitoring();
    }
  }

  public async forceCheck(name?: string): Promise<void> {
    if (name) {
      await this.runCheck(name);
    } else {
      await this.runAllChecks();
    }
  }
}

// Create singleton instance
const healthMonitor = new HealthMonitor();

export default healthMonitor;
export type { HealthCheck, SystemHealth };