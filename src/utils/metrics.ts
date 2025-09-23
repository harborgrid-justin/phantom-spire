import { register, collectDefaultMetrics, Counter, Histogram, Gauge } from 'prom-client';

// Enable default metrics collection
collectDefaultMetrics({ register });

// Custom metrics for Phantom Spire
export const metrics = {
  // HTTP metrics
  httpRequestsTotal: new Counter({
    name: 'phantom_spire_http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
  }),

  httpRequestDuration: new Histogram({
    name: 'phantom_spire_http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route'],
    buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
  }),

  // Database metrics
  databaseConnectionsActive: new Gauge({
    name: 'phantom_spire_database_connections_active',
    help: 'Number of active database connections',
    labelNames: ['database_type'],
  }),

  databaseQueryDuration: new Histogram({
    name: 'phantom_spire_database_query_duration_seconds',
    help: 'Duration of database queries in seconds',
    labelNames: ['database_type', 'operation'],
    buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 3, 5],
  }),

  databaseErrorsTotal: new Counter({
    name: 'phantom_spire_database_errors_total',
    help: 'Total number of database errors',
    labelNames: ['database_type', 'error_type'],
  }),

  // Threat intelligence metrics
  threatIndicatorsProcessed: new Counter({
    name: 'phantom_spire_threat_indicators_processed_total',
    help: 'Total number of threat indicators processed',
    labelNames: ['indicator_type', 'source'],
  }),

  threatAnalysisTime: new Histogram({
    name: 'phantom_spire_threat_analysis_duration_seconds',
    help: 'Time spent analyzing threats',
    labelNames: ['analysis_type'],
    buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60],
  }),

  activeThreats: new Gauge({
    name: 'phantom_spire_active_threats',
    help: 'Number of currently active threats',
    labelNames: ['severity', 'type'],
  }),

  // Package metrics
  packageOperations: new Counter({
    name: 'phantom_spire_package_operations_total',
    help: 'Total number of package operations',
    labelNames: ['package_name', 'operation'],
  }),

  packageErrors: new Counter({
    name: 'phantom_spire_package_errors_total',
    help: 'Total number of package errors',
    labelNames: ['package_name', 'error_type'],
  }),

  // Cache metrics
  cacheHits: new Counter({
    name: 'phantom_spire_cache_hits_total',
    help: 'Total number of cache hits',
    labelNames: ['cache_type'],
  }),

  cacheMisses: new Counter({
    name: 'phantom_spire_cache_misses_total',
    help: 'Total number of cache misses',
    labelNames: ['cache_type'],
  }),

  cacheSize: new Gauge({
    name: 'phantom_spire_cache_size_bytes',
    help: 'Size of cache in bytes',
    labelNames: ['cache_type'],
  }),

  // Authentication metrics
  authenticationAttempts: new Counter({
    name: 'phantom_spire_auth_attempts_total',
    help: 'Total number of authentication attempts',
    labelNames: ['result', 'method'],
  }),

  activeUserSessions: new Gauge({
    name: 'phantom_spire_active_user_sessions',
    help: 'Number of active user sessions',
  }),

  // API rate limiting
  rateLimitHits: new Counter({
    name: 'phantom_spire_rate_limit_hits_total',
    help: 'Total number of rate limit hits',
    labelNames: ['endpoint', 'user_id'],
  }),

  // Memory and performance
  memoryUsage: new Gauge({
    name: 'phantom_spire_memory_usage_bytes',
    help: 'Memory usage in bytes',
    labelNames: ['type'],
  }),

  cpuUsage: new Gauge({
    name: 'phantom_spire_cpu_usage_percent',
    help: 'CPU usage percentage',
  }),

  // Custom business metrics
  vulnerabilitiesDetected: new Counter({
    name: 'phantom_spire_vulnerabilities_detected_total',
    help: 'Total number of vulnerabilities detected',
    labelNames: ['severity', 'source'],
  }),

  incidentsCreated: new Counter({
    name: 'phantom_spire_incidents_created_total',
    help: 'Total number of incidents created',
    labelNames: ['type', 'severity'],
  }),

  feedsProcessed: new Counter({
    name: 'phantom_spire_feeds_processed_total',
    help: 'Total number of threat intelligence feeds processed',
    labelNames: ['feed_source', 'status'],
  }),
};

// Utility functions for metrics
export const metricsUtils = {
  // HTTP request middleware
  httpMiddleware: () => {
    return (req: any, res: any, next: any) => {
      const start = Date.now();

      res.on('finish', () => {
        const duration = (Date.now() - start) / 1000;
        const route = req.route?.path || req.path || 'unknown';

        metrics.httpRequestsTotal.inc({
          method: req.method,
          route,
          status_code: res.statusCode,
        });

        metrics.httpRequestDuration.observe(
          { method: req.method, route },
          duration
        );
      });

      next();
    };
  },

  // Database query timer
  databaseTimer: (databaseType: string, operation: string) => {
    const end = metrics.databaseQueryDuration.startTimer({
      database_type: databaseType,
      operation,
    });
    return end;
  },

  // Threat analysis timer
  threatAnalysisTimer: (analysisType: string) => {
    const end = metrics.threatAnalysisTime.startTimer({
      analysis_type: analysisType,
    });
    return end;
  },

  // Update system metrics
  updateSystemMetrics: () => {
    const usage = process.memoryUsage();
    metrics.memoryUsage.set({ type: 'heap_used' }, usage.heapUsed);
    metrics.memoryUsage.set({ type: 'heap_total' }, usage.heapTotal);
    metrics.memoryUsage.set({ type: 'external' }, usage.external);
    metrics.memoryUsage.set({ type: 'rss' }, usage.rss);

    // CPU usage would require additional monitoring
    const cpuUsage = process.cpuUsage();
    metrics.cpuUsage.set((cpuUsage.user + cpuUsage.system) / 1000000);
  },

  // Helper to track package operations
  trackPackageOperation: (packageName: string, operation: string, success: boolean) => {
    metrics.packageOperations.inc({
      package_name: packageName,
      operation,
    });

    if (!success) {
      metrics.packageErrors.inc({
        package_name: packageName,
        error_type: 'operation_failed',
      });
    }
  },

  // Helper to track cache operations
  trackCacheOperation: (cacheType: string, hit: boolean) => {
    if (hit) {
      metrics.cacheHits.inc({ cache_type: cacheType });
    } else {
      metrics.cacheMisses.inc({ cache_type: cacheType });
    }
  },

  // Helper to track authentication
  trackAuthentication: (success: boolean, method: string) => {
    metrics.authenticationAttempts.inc({
      result: success ? 'success' : 'failure',
      method,
    });
  },
};

// Start periodic system metrics collection
setInterval(() => {
  metricsUtils.updateSystemMetrics();
}, 30000); // Update every 30 seconds

// Export the Prometheus register for /metrics endpoint
export { register };

export default metrics;