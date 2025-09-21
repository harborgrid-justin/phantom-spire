/**
 * Enterprise Testing Infrastructure
 * Comprehensive test utilities, mocks, and base classes for unit testing
 */

// Base test utilities
export class TestUtils {
  static createMockRequest(options: {
    method?: string;
    url?: string;
    headers?: Record<string, string>;
    body?: any;
    params?: Record<string, string>;
    query?: Record<string, string>;
    user?: any;
  } = {}) {
    return {
      method: options.method || 'GET',
      url: options.url || '/',
      headers: options.headers || {},
      body: options.body,
      params: options.params || {},
      query: options.query || {},
      user: options.user,
      ip: '127.0.0.1',
      get: (name: string) => options.headers?.[name.toLowerCase()]
    };
  }

  static createMockResponse() {
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
      redirect: jest.fn().mockReturnThis(),
      statusCode: 200,
      locals: {}
    };
    return res;
  }

  static createMockNext() {
    return jest.fn();
  }

  static async waitFor(condition: () => boolean, timeout = 5000): Promise<void> {
    const start = Date.now();
    while (!condition() && Date.now() - start < timeout) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    if (!condition()) {
      throw new Error('Condition not met within timeout');
    }
  }

  static randomString(length = 10): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  static randomEmail(): string {
    return `${this.randomString()}@test.com`;
  }

  static randomId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  static deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }
}

// Mock factory for services
export class MockFactory {
  static createMockLogger() {
    return {
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
      trace: jest.fn(),
      setContext: jest.fn().mockReturnThis(),
      startTimer: jest.fn().mockReturnValue(jest.fn()),
      audit: jest.fn(),
      logRequest: jest.fn()
    };
  }

  static createMockCache() {
    const cache = new Map();
    return {
      get: jest.fn().mockImplementation((key: string) => cache.get(key) || null),
      set: jest.fn().mockImplementation((key: string, value: any) => cache.set(key, value)),
      delete: jest.fn().mockImplementation((key: string) => cache.delete(key)),
      clear: jest.fn().mockImplementation(() => cache.clear()),
      has: jest.fn().mockImplementation((key: string) => cache.has(key)),
      getStats: jest.fn().mockReturnValue({
        strategy: 'memory',
        hits: 0,
        misses: 0,
        hitRate: 0,
        entries: 0,
        averageResponseTime: 0,
        operations: { get: 0, set: 0, delete: 0, clear: 0 }
      })
    };
  }

  static createMockDatabase() {
    return {
      query: jest.fn(),
      findOne: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      beginTransaction: jest.fn(),
      commit: jest.fn(),
      rollback: jest.fn(),
      close: jest.fn()
    };
  }

  static createMockConfigManager() {
    return {
      get: jest.fn().mockImplementation((path: string, defaultValue?: any) => {
        const configs: Record<string, any> = {
          'app.environment': 'test',
          'app.port': 3001,
          'security.jwtSecret': 'test-secret-key-for-testing',
          'cache.provider': 'memory',
          'logging.level': 'error'
        };
        return configs[path] ?? defaultValue;
      }),
      getConfig: jest.fn().mockReturnValue({
        app: { environment: 'test', port: 3001 },
        security: { jwtSecret: 'test-secret' }
      }),
      isFeatureEnabled: jest.fn().mockReturnValue(false),
      watch: jest.fn().mockReturnValue(jest.fn()),
      reloadConfiguration: jest.fn(),
      exportConfiguration: jest.fn()
    };
  }

  static createMockPerformanceMonitor() {
    return {
      recordWebVital: jest.fn(),
      recordAPIPerformance: jest.fn(),
      getMetrics: jest.fn().mockReturnValue([]),
      getWebVitals: jest.fn().mockReturnValue([]),
      getAPIMetrics: jest.fn().mockReturnValue([]),
      getActiveAlerts: jest.fn().mockReturnValue([]),
      getPerformanceSummary: jest.fn().mockReturnValue({
        webVitals: {},
        apiPerformance: { averageResponseTime: 0, errorRate: 0 },
        resourceUsage: { memoryUsage: 0 },
        alerts: { total: 0, critical: 0, warnings: 0 }
      }),
      resolveAlert: jest.fn().mockReturnValue(true),
      updateThresholds: jest.fn(),
      exportMetrics: jest.fn()
    };
  }

  static createMockMLModel() {
    return {
      id: TestUtils.randomId(),
      name: 'Test Model',
      type: 'classification',
      algorithm: 'random_forest',
      status: 'trained',
      accuracy: 0.95,
      createdAt: new Date(),
      updatedAt: new Date(),
      parameters: { n_estimators: 100 },
      metrics: { precision: 0.94, recall: 0.96, f1Score: 0.95 },
      version: '1.0.0',
      tags: ['test', 'classification']
    };
  }

  static createMockUser() {
    return {
      id: TestUtils.randomId(),
      email: TestUtils.randomEmail(),
      firstName: 'Test',
      lastName: 'User',
      role: 'analyst',
      permissions: ['read', 'write'],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}

// Base test class with common setup
export abstract class BaseTest {
  protected mockLogger: any;
  protected mockCache: any;
  protected mockDatabase: any;
  protected mockConfigManager: any;
  protected mockPerformanceMonitor: any;

  beforeEach() {
    this.mockLogger = MockFactory.createMockLogger();
    this.mockCache = MockFactory.createMockCache();
    this.mockDatabase = MockFactory.createMockDatabase();
    this.mockConfigManager = MockFactory.createMockConfigManager();
    this.mockPerformanceMonitor = MockFactory.createMockPerformanceMonitor();
    
    // Clear all mocks
    jest.clearAllMocks();
  }

  afterEach() {
    jest.restoreAllMocks();
  }
}

// Service test base class
export abstract class ServiceTest extends BaseTest {
  protected abstract createService(): any;
  protected service: any;

  beforeEach() {
    super.beforeEach();
    this.service = this.createService();
  }

  afterEach() {
    super.afterEach();
    if (this.service && typeof this.service.destroy === 'function') {
      this.service.destroy();
    }
  }
}

// Test data generators
export class TestDataGenerator {
  static generateMLModelData(overrides: Partial<any> = {}) {
    return {
      name: 'Test ML Model',
      description: 'A test machine learning model',
      type: 'classification',
      algorithm: 'random_forest',
      status: 'draft',
      parameters: {
        n_estimators: 100,
        max_depth: 10,
        random_state: 42
      },
      version: '1.0.0',
      tags: ['test', 'classification'],
      ...overrides
    };
  }

  static generateUserData(overrides: Partial<any> = {}) {
    return {
      email: TestUtils.randomEmail(),
      password: 'SecurePassword123!',
      confirmPassword: 'SecurePassword123!',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
      role: 'analyst',
      permissions: ['read', 'write'],
      ...overrides
    };
  }

  static generateAPIResponse(data: any = {}, success = true) {
    return {
      success,
      message: success ? 'Success' : 'Error',
      data: success ? data : undefined,
      error: success ? undefined : { code: 'TEST_ERROR', message: 'Test error' },
      timestamp: new Date().toISOString(),
      requestId: TestUtils.randomId(),
      version: '1.0.0'
    };
  }
}

// Test assertions helpers
export class TestAssertions {
  static expectValidResponse(response: any, expectedData?: any) {
    expect(response).toBeDefined();
    expect(response.success).toBe(true);
    expect(response.timestamp).toBeDefined();
    expect(response.requestId).toBeDefined();
    expect(response.version).toBeDefined();
    
    if (expectedData) {
      expect(response.data).toEqual(expectedData);
    }
  }

  static expectErrorResponse(response: any, expectedCode?: string, expectedMessage?: string) {
    expect(response).toBeDefined();
    expect(response.success).toBe(false);
    expect(response.error).toBeDefined();
    expect(response.error.code).toBeDefined();
    expect(response.error.message).toBeDefined();
    expect(response.timestamp).toBeDefined();
    expect(response.requestId).toBeDefined();
    
    if (expectedCode) {
      expect(response.error.code).toBe(expectedCode);
    }
    
    if (expectedMessage) {
      expect(response.error.message).toBe(expectedMessage);
    }
  }

  static expectServiceCall(mockService: any, methodName: string, expectedArgs?: any[]) {
    expect(mockService[methodName]).toHaveBeenCalled();
    
    if (expectedArgs) {
      expect(mockService[methodName]).toHaveBeenCalledWith(...expectedArgs);
    }
  }

  static expectLogCall(mockLogger: any, level: string, expectedMessage?: string) {
    expect(mockLogger[level]).toHaveBeenCalled();
    
    if (expectedMessage) {
      const calls = mockLogger[level].mock.calls;
      const messageFound = calls.some((call: any[]) => 
        call.some(arg => typeof arg === 'string' && arg.includes(expectedMessage))
      );
      expect(messageFound).toBe(true);
    }
  }
}

// Integration test helpers
export class IntegrationTestHelpers {
  static async setupTestDatabase() {
    // In a real implementation, this would set up a test database
    // For now, return mock database connection
    return MockFactory.createMockDatabase();
  }

  static async cleanupTestDatabase(db: any) {
    // Clean up test data
    if (db && typeof db.close === 'function') {
      await db.close();
    }
  }
}

// Export all utilities
export default {
  TestUtils,
  MockFactory,
  BaseTest,
  ServiceTest,
  TestDataGenerator,
  TestAssertions,
  IntegrationTestHelpers
};