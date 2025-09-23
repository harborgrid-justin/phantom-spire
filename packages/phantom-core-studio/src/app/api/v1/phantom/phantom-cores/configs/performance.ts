// Performance Configuration
export interface PerformanceConfig {
  cache: {
    enabled: boolean;
    ttl: number;
    maxKeys: number;
    checkPeriod: number;
  };
  compression: {
    enabled: boolean;
    level: number;
    threshold: number;
  };
  monitoring: {
    enabled: boolean;
    sampleRate: number;
    slowQueryThreshold: number;
  };
}

export const PERFORMANCE_DEFAULTS: PerformanceConfig = {
  cache: {
    enabled: true,
    ttl: 300,
    maxKeys: 1000,
    checkPeriod: 60,
  },
  compression: {
    enabled: true,
    level: 6,
    threshold: 1024,
  },
  monitoring: {
    enabled: true,
    sampleRate: 0.1,
    slowQueryThreshold: 1000,
  },
};
