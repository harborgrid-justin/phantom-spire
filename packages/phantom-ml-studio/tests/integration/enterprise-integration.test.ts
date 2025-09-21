/**
 * Integration Test Suite for Enterprise ML Studio
 * Tests complete workflows and service integration
 */

import { MonitoringDashboard } from '../../../src/services/dashboard/monitoring-dashboard';
import { AnalyticsEngine } from '../../../src/services/analytics/analytics-engine';
import { PerformanceMonitor } from '../../../src/services/monitoring/performance-monitor';
import { HealthMonitor } from '../../../src/services/monitoring/health-monitor';
import { EnterpriseCache } from '../../../src/services/caching/enterprise-cache';
import { JWTAuthenticationService } from '../../../src/security/jwt-authentication';
import { RBACSystem } from '../../../src/security/rbac-system';

describe('Enterprise ML Studio Integration Tests', () => {
  let dashboard: MonitoringDashboard;
  let analytics: AnalyticsEngine;
  let authService: JWTAuthenticationService;
  let rbacSystem: RBACSystem;

  beforeAll(async () => {
    // Initialize services
    dashboard = new MonitoringDashboard({
      updateInterval: 1000,
      enableRealTimeUpdates: true,
      alertingEnabled: true
    });

    analytics = new AnalyticsEngine({
      enableAnomalyDetection: true,
      enableTrendAnalysis: true,
      enablePredictiveAnalytics: true,
      realTimeProcessing: true
    });

    authService = new JWTAuthenticationService({
      jwtSecret: 'test-secret',
      refreshSecret: 'test-refresh-secret',
      accessTokenTTL: 900, // 15 minutes
      refreshTokenTTL: 604800, // 7 days
      maxConcurrentSessions: 3
    });

    rbacSystem = new RBACSystem();

    // Wait for services to initialize
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  afterAll(async () => {
    // Cleanup resources
    if (dashboard) {
      dashboard.removeAllListeners();
    }
    if (analytics) {
      analytics.removeAllListeners();
    }
  });

  describe('Dashboard and Analytics Integration', () => {
    it('should integrate dashboard metrics with analytics engine', async () => {
      // Add metrics through dashboard
      await dashboard.addMetric({
        id: 'integration.test.cpu',
        name: 'CPU Usage',
        description: 'CPU utilization percentage',
        value: 75.5,
        unit: '%',
        timestamp: new Date(),
        alertLevel: 'normal'
      });

      // Ingest same metric into analytics
      await analytics.ingestMetric({
        id: 'integration.test.cpu',
        name: 'CPU Usage',
        value: 75.5,
        timestamp: new Date()
      });

      // Verify both services have the data
      const dashboardMetrics = await dashboard.getCurrentMetrics(['integration.test.cpu']);
      const analyticsMetrics = await analytics.getMetrics(['integration.test.cpu']);

      expect(dashboardMetrics['integration.test.cpu']).toBeDefined();
      expect(analyticsMetrics['integration.test.cpu']).toHaveLength(1);
      expect(analyticsMetrics['integration.test.cpu'][0].value).toBe(75.5);
    });

    it('should trigger alerts based on analytics anomalies', async (done) => {
      const metricId = 'integration.anomaly.test';

      // Set up alert rule in dashboard
      const alertRuleId = await dashboard.createAlertRule({
        name: 'Anomaly Alert',
        description: 'Alert on anomalous behavior',
        metricId,
        condition: 'gt',
        threshold: 200,
        severity: 'critical',
        enabled: true,
        suppressionWindow: 5,
        notificationChannels: ['email']
      });

      expect(alertRuleId).toBeDefined();

      // Listen for alert
      dashboard.on('alertTriggered', (alert) => {
        expect(alert.rule.name).toBe('Anomaly Alert');
        expect(alert.metric.value).toBe(250);
        done();
      });

      // Add normal data to analytics
      for (let i = 0; i < 15; i++) {
        await analytics.ingestMetric({
          id: metricId,
          name: 'Anomaly Test',
          value: 100 + (Math.random() * 10),
          timestamp: new Date(Date.now() + i * 1000)
        });
      }

      // Add anomalous metric that should trigger alert
      await dashboard.addMetric({
        id: metricId,
        name: 'Anomaly Test',
        description: 'Test metric for anomaly detection',
        value: 250, // Anomalous value
        timestamp: new Date(),
        alertLevel: 'critical'
      });
    });

    it('should generate insights from dashboard analytics', async () => {
      const testMetrics = ['dashboard.response_time', 'dashboard.requests'];

      // Simulate trend data
      const baseTime = new Date('2024-01-01T00:00:00Z').getTime();
      for (let i = 0; i < 10; i++) {
        // Response time increasing
        await dashboard.addMetric({
          id: 'dashboard.response_time',
          name: 'Response Time',
          description: 'API response time',
          value: 100 + (i * 10),
          unit: 'ms',
          timestamp: new Date(baseTime + i * 3600000),
          alertLevel: i > 7 ? 'warning' : 'normal'
        });

        // Requests increasing
        await dashboard.addMetric({
          id: 'dashboard.requests',
          name: 'Request Count',
          description: 'Number of requests',
          value: 1000 + (i * 50),
          unit: '/hour',
          timestamp: new Date(baseTime + i * 3600000),
          alertLevel: 'normal'
        });

        // Also add to analytics
        await analytics.ingestMetric({
          id: 'dashboard.response_time',
          name: 'Response Time',
          value: 100 + (i * 10),
          timestamp: new Date(baseTime + i * 3600000)
        });

        await analytics.ingestMetric({
          id: 'dashboard.requests',
          name: 'Request Count',
          value: 1000 + (i * 50),
          timestamp: new Date(baseTime + i * 3600000)
        });
      }

      // Generate insights
      const insights = await analytics.generateInsights(testMetrics);
      expect(insights.length).toBeGreaterThan(0);

      // Should have performance insights for response time
      const performanceInsights = insights.filter(i => i.category === 'performance');
      expect(performanceInsights.length).toBeGreaterThan(0);
    });
  });

  describe('Authentication and Authorization Integration', () => {
    let testUser: any;
    let authTokens: any;

    beforeAll(async () => {
      // Create test user
      testUser = {
        id: 'test-user-1',
        username: 'testuser',
        email: 'test@example.com',
        roles: ['ml-engineer'],
        permissions: ['models:create', 'models:read', 'experiments:create', 'experiments:read'],
        isActive: true,
        failedLoginAttempts: 0,
        twoFactorEnabled: false
      };

      // Mock user lookup
      (authService as any).getUserByUsername = async (username: string) => {
        return username === 'testuser' ? testUser : null;
      };
      (authService as any).getPasswordHash = async (userId: string) => {
        return '$2a$10$hash'; // Mock bcrypt hash
      };
      (authService as any).updateUser = async (user: any) => {};
      (authService as any).updateLastLogin = async (userId: string) => {};
      (authService as any).resetFailedLoginAttempts = async (userId: string) => {};

      // Mock bcrypt compare
      const bcrypt = require('bcryptjs');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
    });

    it('should authenticate user and create session', async () => {
      const authResult = await authService.authenticate(
        'testuser',
        'password123',
        '127.0.0.1',
        'Mozilla/5.0 Test Browser'
      );

      expect(authResult.success).toBe(true);
      expect(authResult.tokens).toBeDefined();
      expect(authResult.user).toBeDefined();
      expect(authResult.user!.username).toBe('testuser');

      authTokens = authResult.tokens;
    });

    it('should validate permissions through RBAC', async () => {
      // Define ML Engineer role
      await rbacSystem.defineRole({
        id: 'ml-engineer',
        name: 'ML Engineer',
        description: 'Machine learning development role',
        permissions: ['models:create', 'models:read', 'models:deploy', 'experiments:create'],
        isSystemRole: false,
        isActive: true
      });

      // Assign role to user
      await rbacSystem.assignRole(testUser.id, 'ml-engineer', 'system');

      // Check permissions
      const canCreateModels = await rbacSystem.hasPermission(testUser.id, 'models:create');
      const canDeleteUsers = await rbacSystem.hasPermission(testUser.id, 'users:delete');

      expect(canCreateModels).toBe(true);
      expect(canDeleteUsers).toBe(false);

      // Check resource-level permissions
      const modelAction = await rbacSystem.canPerformAction(testUser.id, 'models', 'create');
      expect(modelAction.allowed).toBe(true);

      const userAction = await rbacSystem.canPerformAction(testUser.id, 'users', 'delete');
      expect(userAction.allowed).toBe(false);
    });

    it('should refresh authentication tokens', async () => {
      expect(authTokens.refreshToken).toBeDefined();

      const refreshResult = await authService.refreshToken(authTokens.refreshToken, '127.0.0.1');

      expect(refreshResult.success).toBe(true);
      expect(refreshResult.tokens).toBeDefined();
      expect(refreshResult.tokens!.accessToken).toBeDefined();
      expect(refreshResult.tokens!.accessToken).not.toBe(authTokens.accessToken);
    });

    it('should handle permission-based dashboard access', async () => {
      // Create dashboard with permission requirements
      const securityDashboard = await dashboard.createDashboard({
        name: 'Security Dashboard',
        description: 'Security monitoring dashboard',
        category: 'security',
        widgets: [{
          id: 'security-events',
          title: 'Security Events',
          type: 'log',
          size: 'large',
          position: { x: 0, y: 0, width: 12, height: 6 },
          config: { logLevel: 'warning' },
          dataSource: 'security-monitor',
          refreshInterval: 30,
          isVisible: true,
          permissions: ['security:read']
        }],
        layout: 'grid',
        isDefault: false,
        isPublic: false,
        createdBy: testUser.id,
        tags: ['security']
      });

      expect(securityDashboard).toBeDefined();

      // User should not be able to access security dashboard
      const userPermissions = await rbacSystem.getUserPermissions(testUser.id);
      const hasSecurityAccess = userPermissions.includes('security:read');
      expect(hasSecurityAccess).toBe(false);

      // But should be able to access ML dashboard
      const mlDashboard = await dashboard.createDashboard({
        name: 'ML Operations',
        description: 'ML monitoring dashboard',
        category: 'ml-operations',
        widgets: [],
        layout: 'grid',
        isDefault: false,
        isPublic: true,
        createdBy: testUser.id,
        tags: ['ml', 'operations']
      });

      expect(mlDashboard).toBeDefined();
    });
  });

  describe('Performance and Caching Integration', () => {
    let cache: EnterpriseCache;
    let performanceMonitor: PerformanceMonitor;

    beforeAll(async () => {
      cache = new EnterpriseCache({
        enableMemoryCache: true,
        enableRedisCache: false, // Disable Redis for testing
        enableCompression: true,
        defaultTtl: 300
      });

      performanceMonitor = new PerformanceMonitor({
        collectSystemMetrics: true,
        collectApplicationMetrics: true,
        metricsInterval: 1000
      });

      await performanceMonitor.start();
    });

    afterAll(async () => {
      await performanceMonitor.stop();
    });

    it('should cache analytics results for performance', async () => {
      const metricId = 'cache.performance.test';
      
      // Add test data
      for (let i = 0; i < 20; i++) {
        await analytics.ingestMetric({
          id: metricId,
          name: 'Cache Performance Test',
          value: 100 + (i * 2),
          timestamp: new Date(Date.now() + i * 3600000)
        });
      }

      // First trend analysis call
      const start1 = Date.now();
      const trend1 = await analytics.analyzeTrend(metricId, 'hourly');
      const duration1 = Date.now() - start1;

      // Second call should be faster (cached)
      const start2 = Date.now();
      const trend2 = await analytics.analyzeTrend(metricId, 'hourly');
      const duration2 = Date.now() - start2;

      expect(trend1.metricId).toBe(metricId);
      expect(trend2.metricId).toBe(metricId);
      expect(duration2).toBeLessThan(duration1 * 0.5); // At least 50% faster
    });

    it('should monitor system performance metrics', async () => {
      // Let performance monitor collect some metrics
      await new Promise(resolve => setTimeout(resolve, 2000));

      const systemMetrics = await performanceMonitor.getSystemMetrics();
      
      expect(systemMetrics).toBeDefined();
      expect(systemMetrics.cpu).toBeDefined();
      expect(systemMetrics.memory).toBeDefined();
      expect(systemMetrics.cpu.usage).toBeGreaterThanOrEqual(0);
      expect(systemMetrics.memory.usage).toBeGreaterThanOrEqual(0);
    });

    it('should integrate performance metrics with dashboard', async () => {
      const systemMetrics = await performanceMonitor.getSystemMetrics();

      // Add performance metrics to dashboard
      await dashboard.addMetric({
        id: 'system.cpu.usage',
        name: 'CPU Usage',
        description: 'System CPU utilization',
        value: systemMetrics.cpu.usage,
        unit: '%',
        timestamp: new Date(),
        alertLevel: systemMetrics.cpu.usage > 80 ? 'warning' : 'normal'
      });

      await dashboard.addMetric({
        id: 'system.memory.usage',
        name: 'Memory Usage', 
        description: 'System memory utilization',
        value: systemMetrics.memory.usage,
        unit: '%',
        timestamp: new Date(),
        alertLevel: systemMetrics.memory.usage > 90 ? 'critical' : 'normal'
      });

      const currentMetrics = await dashboard.getCurrentMetrics(['system.cpu.usage', 'system.memory.usage']);
      expect(Object.keys(currentMetrics)).toHaveLength(2);
    });
  });

  describe('Health Monitoring Integration', () => {
    let healthMonitor: HealthMonitor;

    beforeAll(async () => {
      healthMonitor = new HealthMonitor({
        checkInterval: 1000,
        enableDependencyChecks: true,
        enableResourceMonitoring: true
      });

      await healthMonitor.start();
    });

    afterAll(async () => {
      await healthMonitor.stop();
    });

    it('should provide comprehensive health status', async () => {
      const healthStatus = await healthMonitor.getOverallHealth();
      
      expect(healthStatus).toBeDefined();
      expect(healthStatus.status).toBeOneOf(['healthy', 'degraded', 'unhealthy']);
      expect(healthStatus.timestamp).toBeInstanceOf(Date);
      expect(healthStatus.services).toBeDefined();
    });

    it('should integrate health status with dashboard', async () => {
      const healthStatus = await healthMonitor.getOverallHealth();
      
      await dashboard.addMetric({
        id: 'system.health.overall',
        name: 'System Health',
        description: 'Overall system health status',
        value: healthStatus.status,
        timestamp: new Date(),
        alertLevel: healthStatus.status === 'healthy' ? 'normal' : 
                   healthStatus.status === 'degraded' ? 'warning' : 'critical'
      });

      const dashboardAnalytics = await dashboard.getDashboardAnalytics();
      expect(dashboardAnalytics.systemHealth).toBeDefined();
      expect(['healthy', 'warning', 'critical']).toContain(dashboardAnalytics.systemHealth);
    });
  });

  describe('End-to-End ML Operations Workflow', () => {
    it('should handle complete ML model lifecycle monitoring', async () => {
      const modelId = 'test-model-1';
      const experimentId = 'test-experiment-1';

      // 1. Model training metrics
      const trainingMetrics = [
        { phase: 'data_loading', duration: 120, accuracy: 0 },
        { phase: 'preprocessing', duration: 45, accuracy: 0 },
        { phase: 'training', duration: 3600, accuracy: 0.85 },
        { phase: 'validation', duration: 300, accuracy: 0.87 },
        { phase: 'testing', duration: 180, accuracy: 0.86 }
      ];

      for (let i = 0; i < trainingMetrics.length; i++) {
        const metric = trainingMetrics[i];
        
        // Add to dashboard
        await dashboard.addMetric({
          id: `model.${modelId}.${metric.phase}.duration`,
          name: `${metric.phase} Duration`,
          description: `Time taken for ${metric.phase} phase`,
          value: metric.duration,
          unit: 'seconds',
          timestamp: new Date(Date.now() + i * 60000),
          alertLevel: 'normal',
          metadata: { modelId, experimentId, phase: metric.phase }
        });

        if (metric.accuracy > 0) {
          await dashboard.addMetric({
            id: `model.${modelId}.accuracy`,
            name: 'Model Accuracy',
            description: 'Model accuracy score',
            value: metric.accuracy,
            timestamp: new Date(Date.now() + i * 60000),
            alertLevel: metric.accuracy < 0.8 ? 'warning' : 'normal',
            metadata: { modelId, experimentId }
          });

          // Also add to analytics for trend analysis
          await analytics.ingestMetric({
            id: `model.${modelId}.accuracy`,
            name: 'Model Accuracy',
            value: metric.accuracy,
            timestamp: new Date(Date.now() + i * 60000),
            metadata: { modelId, experimentId }
          });
        }
      }

      // 2. Model deployment metrics
      await dashboard.addMetric({
        id: `model.${modelId}.deployment.status`,
        name: 'Deployment Status',
        description: 'Model deployment status',
        value: 'deployed',
        timestamp: new Date(),
        alertLevel: 'normal',
        metadata: { modelId, status: 'deployed' }
      });

      // 3. Inference metrics
      const inferenceStart = Date.now();
      for (let i = 0; i < 50; i++) {
        const latency = 50 + (Math.random() * 20); // 50-70ms base latency
        const timestamp = new Date(inferenceStart + i * 10000); // Every 10 seconds

        await dashboard.addMetric({
          id: `model.${modelId}.inference.latency`,
          name: 'Inference Latency',
          description: 'Time taken for model inference',
          value: latency,
          unit: 'ms',
          timestamp,
          alertLevel: latency > 100 ? 'warning' : 'normal',
          metadata: { modelId }
        });

        await analytics.ingestMetric({
          id: `model.${modelId}.inference.latency`,
          name: 'Inference Latency',
          value: latency,
          timestamp,
          metadata: { modelId }
        });
      }

      // 4. Verify complete workflow data
      const currentMetrics = await dashboard.getCurrentMetrics([
        `model.${modelId}.accuracy`,
        `model.${modelId}.inference.latency`,
        `model.${modelId}.deployment.status`
      ]);

      expect(Object.keys(currentMetrics)).toHaveLength(3);
      expect(currentMetrics[`model.${modelId}.accuracy`].value).toBe(0.86);
      expect(currentMetrics[`model.${modelId}.deployment.status`].value).toBe('deployed');

      // 5. Analyze trends
      const latencyTrend = await analytics.analyzeTrend(`model.${modelId}.inference.latency`, 'hourly');
      expect(latencyTrend.metricId).toBe(`model.${modelId}.inference.latency`);
      expect(latencyTrend.dataPoints.length).toBeGreaterThan(0);

      // 6. Generate insights
      const insights = await analytics.generateInsights([`model.${modelId}.inference.latency`]);
      expect(insights.length).toBeGreaterThanOrEqual(0);

      // 7. Dashboard analytics
      const dashboardAnalytics = await dashboard.getDashboardAnalytics();
      expect(dashboardAnalytics.totalMetrics).toBeGreaterThan(0);
      expect(dashboardAnalytics.topPerformingModels).toBeDefined();
    });
  });

  // Helper function for test expectations  
  expect.extend({
    toBeOneOf(received: any, expected: any[]) {
      const pass = expected.includes(received);
      if (pass) {
        return {
          message: () => `expected ${received} not to be one of ${expected.join(', ')}`,
          pass: true,
        };
      } else {
        return {
          message: () => `expected ${received} to be one of ${expected.join(', ')}`,
          pass: false,
        };
      }
    },
  });
});

// Type declaration for custom matcher
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeOneOf(expected: any[]): R;
    }
  }
}