export interface EnvironmentConfig {
  name: 'development' | 'staging' | 'production' | 'test';
  debug: boolean;
  enableMetrics: boolean;
  enableHealthCheck: boolean;
  enableProfiling: boolean;
}
