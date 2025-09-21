/**
 * Jest Test Setup
 * Global test configuration and setup for enterprise test suite
 */

import 'jest';

// Global test timeout
jest.setTimeout(30000);

// Mock console methods for cleaner test output
global.console = {
  ...console,
  // Uncomment to suppress logs during testing
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Mock process.env for consistent testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret';
process.env.REDIS_URL = 'redis://localhost:6379';

// Mock external dependencies that aren't available in test environment
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    flushall: jest.fn().mockResolvedValue('OK'),
    disconnect: jest.fn().mockResolvedValue(undefined),
    on: jest.fn(),
    off: jest.fn(),
    ping: jest.fn().mockResolvedValue('PONG'),
  }));
});

// Mock bcryptjs for consistent password hashing in tests
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('$2a$10$mockedhash'),
  compare: jest.fn().mockResolvedValue(true),
  genSalt: jest.fn().mockResolvedValue('$2a$10$mockedsalt'),
}));

// Mock jsonwebtoken for consistent token generation
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mocked.jwt.token'),
  verify: jest.fn().mockReturnValue({
    userId: 'test-user-id',
    username: 'testuser',
    roles: ['user'],
    permissions: ['read'],
    sessionId: 'test-session-id',
    tokenType: 'access',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
  }),
  decode: jest.fn().mockReturnValue({
    userId: 'test-user-id',
    username: 'testuser',
  }),
}));

// Mock winston logger for test environment
jest.mock('winston', () => ({
  createLogger: jest.fn().mockReturnValue({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  }),
  format: {
    combine: jest.fn(),
    timestamp: jest.fn(),
    errors: jest.fn(),
    json: jest.fn(),
    printf: jest.fn(),
  },
  transports: {
    Console: jest.fn(),
    File: jest.fn(),
  },
}));

// Mock WebSocket for real-time features
jest.mock('ws', () => {
  return jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    send: jest.fn(),
    close: jest.fn(),
    readyState: 1, // OPEN
  }));
});

// Mock prometheus client for metrics
jest.mock('prom-client', () => ({
  Counter: jest.fn().mockImplementation(() => ({
    inc: jest.fn(),
    labels: jest.fn().mockReturnThis(),
  })),
  Histogram: jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    labels: jest.fn().mockReturnThis(),
    startTimer: jest.fn().mockReturnValue(() => {}),
  })),
  Gauge: jest.fn().mockImplementation(() => ({
    set: jest.fn(),
    inc: jest.fn(),
    dec: jest.fn(),
    labels: jest.fn().mockReturnThis(),
  })),
  register: {
    metrics: jest.fn().mockResolvedValue(''),
    clear: jest.fn(),
    getSingleMetric: jest.fn(),
  },
  collectDefaultMetrics: jest.fn(),
}));

// Global test utilities
global.testUtils = {
  createMockUser: (overrides = {}) => ({
    id: 'test-user-id',
    username: 'testuser',
    email: 'test@example.com',
    roles: ['user'],
    permissions: ['read'],
    isActive: true,
    failedLoginAttempts: 0,
    twoFactorEnabled: false,
    ...overrides,
  }),

  createMockMetric: (overrides = {}) => ({
    id: 'test.metric',
    name: 'Test Metric',
    value: 100,
    timestamp: new Date(),
    ...overrides,
  }),

  createMockDashboard: (overrides = {}) => ({
    id: 'test-dashboard',
    name: 'Test Dashboard',
    description: 'Test dashboard for unit tests',
    category: 'custom',
    widgets: [],
    layout: 'grid',
    isDefault: false,
    isPublic: true,
    createdBy: 'test-user',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['test'],
    ...overrides,
  }),

  wait: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
};

// Custom matchers for better test assertions
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },

  toBeValidDate(received: any) {
    const pass = received instanceof Date && !isNaN(received.getTime());
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid date`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid date`,
        pass: false,
      };
    }
  },

  toBeValidUUID(received: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const pass = typeof received === 'string' && uuidRegex.test(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid UUID`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid UUID`,
        pass: false,
      };
    }
  },

  toHaveValidStructure(received: any, expectedKeys: string[]) {
    const receivedKeys = Object.keys(received);
    const hasAllKeys = expectedKeys.every(key => receivedKeys.includes(key));
    
    if (hasAllKeys) {
      return {
        message: () => `expected object not to have keys: ${expectedKeys.join(', ')}`,
        pass: true,
      };
    } else {
      const missingKeys = expectedKeys.filter(key => !receivedKeys.includes(key));
      return {
        message: () => `expected object to have keys: ${missingKeys.join(', ')}`,
        pass: false,
      };
    }
  },
});

// Global cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Global cleanup after all tests
afterAll(async () => {
  // Clean up any persistent resources
  await new Promise(resolve => setTimeout(resolve, 100));
});

// Type declarations for global test utilities and custom matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeWithinRange(floor: number, ceiling: number): R;
      toBeValidDate(): R;
      toBeValidUUID(): R;
      toHaveValidStructure(expectedKeys: string[]): R;
    }
  }

  var testUtils: {
    createMockUser: (overrides?: any) => any;
    createMockMetric: (overrides?: any) => any;
    createMockDashboard: (overrides?: any) => any;
    wait: (ms: number) => Promise<void>;
  };
}