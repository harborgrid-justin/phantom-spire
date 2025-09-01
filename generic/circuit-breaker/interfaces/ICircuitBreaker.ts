/**
 * Generic Circuit Breaker Interfaces
 * Revolutionary plug-and-play circuit breaker system with automatic configuration
 */

export enum CircuitBreakerState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half_open'
}

export interface ICircuitBreakerConfig {
  /** Failure threshold before opening circuit */
  failureThreshold?: number;
  /** Success threshold to close circuit from half-open */
  successThreshold?: number;
  /** Timeout before attempting recovery (ms) */
  recoveryTimeout?: number;
  /** Monitoring window for failure calculation (ms) */
  monitoringWindow?: number;
  /** Minimum number of requests in window to trigger */
  minimumRequestThreshold?: number;
  /** Auto-discovery enabled */
  autoDiscovery?: boolean;
  /** Auto-link with other modules */
  autoLink?: boolean;
  /** Service name for registration */
  serviceName?: string;
}

export interface ICircuitBreakerMetrics {
  state: CircuitBreakerState;
  failureCount: number;
  successCount: number;
  totalRequests: number;
  successRate: number;
  averageResponseTime: number;
  lastFailureTime?: number;
  lastSuccessTime?: number;
  timeInCurrentState: number;
}

export interface ICircuitBreakerEvents {
  'state-changed': (oldState: CircuitBreakerState, newState: CircuitBreakerState) => void;
  'circuit-opened': (metrics: ICircuitBreakerMetrics) => void;
  'circuit-closed': (metrics: ICircuitBreakerMetrics) => void;
  'circuit-half-opened': (metrics: ICircuitBreakerMetrics) => void;
  'request-success': (responseTime: number) => void;
  'request-failure': (error: Error, responseTime: number) => void;
  'auto-discovery': (services: string[]) => void;
}

export interface ICircuitBreaker {
  /** Execute operation with circuit breaker protection */
  execute<T>(operation: () => Promise<T>, fallback?: () => Promise<T>): Promise<T>;
  
  /** Get current metrics */
  getMetrics(): ICircuitBreakerMetrics;
  
  /** Get current state */
  getState(): CircuitBreakerState;
  
  /** Force state change */
  forceState(state: CircuitBreakerState): void;
  
  /** Reset circuit breaker */
  reset(): void;
  
  /** Enable/disable auto-discovery */
  setAutoDiscovery(enabled: boolean): void;
  
  /** Link with another circuit breaker */
  linkWith(breaker: ICircuitBreaker, serviceName: string): void;
  
  /** Get health status */
  getHealth(): {
    healthy: boolean;
    score: number;
    issues: string[];
  };
}

export interface ICircuitBreakerFactory {
  /** Create circuit breaker with auto-configuration */
  create(serviceName?: string, config?: Partial<ICircuitBreakerConfig>): ICircuitBreaker;
  
  /** Create with intelligent defaults based on service type */
  createForService(serviceType: 'database' | 'api' | 'cache' | 'queue' | 'custom', serviceName?: string): ICircuitBreaker;
  
  /** Get or create singleton instance */
  getInstance(serviceName: string, config?: Partial<ICircuitBreakerConfig>): ICircuitBreaker;
}

export interface ICircuitBreakerRegistry {
  /** Register a circuit breaker */
  register(serviceName: string, breaker: ICircuitBreaker): void;
  
  /** Get circuit breaker by service name */
  get(serviceName: string): ICircuitBreaker | undefined;
  
  /** Get all registered circuit breakers */
  getAll(): Map<string, ICircuitBreaker>;
  
  /** Auto-discover and register services */
  autoDiscover(): Promise<void>;
  
  /** Get overall health of all circuits */
  getOverallHealth(): {
    healthy: boolean;
    totalCircuits: number;
    healthyCircuits: number;
    openCircuits: number;
    halfOpenCircuits: number;
  };
}