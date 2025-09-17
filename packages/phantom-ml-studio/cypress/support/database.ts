/**
 * Database utilities for Cypress tests
 * Provides thread-safe database operations for parallel test execution
 */

interface SeedData {
  users?: any[];
  models?: any[];
  experiments?: any[];
  deployments?: any[];
  [key: string]: any;
}

// Mock database connection pool
class DatabasePool {
  private static instance: DatabasePool;
  private connections: Map<string, any> = new Map();
  private locks: Map<string, Promise<void>> = new Map();

  static getInstance(): DatabasePool {
    if (!DatabasePool.instance) {
      DatabasePool.instance = new DatabasePool();
    }
    return DatabasePool.instance;
  }

  async acquireLock(resource: string): Promise<() => void> {
    while (this.locks.has(resource)) {
      await this.locks.get(resource);
    }

    let releaseLock: () => void;
    const lockPromise = new Promise<void>((resolve) => {
      releaseLock = resolve;
    });

    this.locks.set(resource, lockPromise);

    return () => {
      this.locks.delete(resource);
      releaseLock();
    };
  }

  async getConnection(workerId: string = '0'): Promise<any> {
    if (!this.connections.has(workerId)) {
      // Create mock connection for worker
      this.connections.set(workerId, {
        id: workerId,
        isConnected: true,
        query: async (sql: string) => {
          // Mock query execution
          return { rows: [], rowCount: 0 };
        },
      });
    }
    return this.connections.get(workerId);
  }
}

const pool = DatabasePool.getInstance();

/**
 * Seed database with test data
 */
export async function seed(data?: SeedData): Promise<boolean> {
  const workerId = process.env.CYPRESS_WORKER_ID || '0';
  const releaseLock = await pool.acquireLock('seed');

  try {
    const connection = await pool.getConnection(workerId);

    // Clear existing data
    await clearCollections(['users', 'models', 'experiments', 'deployments']);

    // Seed default test data
    const defaultData: SeedData = {
      users: [
        {
          id: 'test-user-1',
          email: 'test1@phantom-ml.com',
          name: 'Test User 1',
          role: 'admin',
        },
        {
          id: 'test-user-2',
          email: 'test2@phantom-ml.com',
          name: 'Test User 2',
          role: 'user',
        },
      ],
      models: [
        {
          id: 'model-1',
          name: 'Test Model 1',
          type: 'classification',
          status: 'active',
          accuracy: 0.95,
        },
        {
          id: 'model-2',
          name: 'Test Model 2',
          type: 'regression',
          status: 'training',
          accuracy: 0.89,
        },
      ],
      experiments: [
        {
          id: 'exp-1',
          name: 'Experiment 1',
          modelId: 'model-1',
          status: 'completed',
          metrics: { accuracy: 0.95, loss: 0.05 },
        },
      ],
      deployments: [
        {
          id: 'deploy-1',
          modelId: 'model-1',
          environment: 'production',
          status: 'active',
          endpoint: 'https://api.phantom-ml.com/predict',
        },
      ],
    };

    const seedData = { ...defaultData, ...data };

    // Insert seed data
    for (const [collection, items] of Object.entries(seedData)) {
      if (Array.isArray(items)) {
        for (const item of items) {
          await insertDocument(collection, item);
        }
      }
    }

    console.log(`Database seeded successfully by worker ${workerId}`);
    return true;
  } catch (error) {
    console.error('Failed to seed database:', error);
    return false;
  } finally {
    releaseLock();
  }
}

/**
 * Clear database
 */
export async function clear(): Promise<boolean> {
  const workerId = process.env.CYPRESS_WORKER_ID || '0';
  const releaseLock = await pool.acquireLock('clear');

  try {
    const connection = await pool.getConnection(workerId);

    await clearCollections([
      'users',
      'models',
      'experiments',
      'deployments',
      'datasets',
      'pipelines',
      'metrics',
    ]);

    console.log(`Database cleared successfully by worker ${workerId}`);
    return true;
  } catch (error) {
    console.error('Failed to clear database:', error);
    return false;
  } finally {
    releaseLock();
  }
}

/**
 * Clear specific collections
 */
async function clearCollections(collections: string[]): Promise<void> {
  // Mock implementation
  for (const collection of collections) {
    // In a real implementation, this would clear the collection
    console.log(`Clearing collection: ${collection}`);
  }
}

/**
 * Insert document into collection
 */
async function insertDocument(collection: string, document: any): Promise<void> {
  // Mock implementation
  console.log(`Inserting into ${collection}:`, document.id || document.name);
}

/**
 * Get test data by type
 */
export async function getTestData(type: string): Promise<any> {
  const testData: Record<string, any> = {
    user: {
      id: 'test-user',
      email: 'test@phantom-ml.com',
      name: 'Test User',
      role: 'admin',
    },
    model: {
      id: 'test-model',
      name: 'Test Model',
      type: 'classification',
      status: 'active',
    },
    dataset: {
      id: 'test-dataset',
      name: 'Test Dataset',
      size: 1000,
      features: 10,
    },
  };

  return testData[type] || null;
}

/**
 * Create isolated test environment for parallel execution
 */
export async function createTestEnvironment(testId: string): Promise<string> {
  const workerId = process.env.CYPRESS_WORKER_ID || '0';
  const envId = `test-env-${workerId}-${testId}-${Date.now()}`;

  // Create isolated namespace for test
  await seed({
    testEnvironments: [
      {
        id: envId,
        workerId,
        testId,
        createdAt: new Date(),
      },
    ],
  });

  return envId;
}

/**
 * Cleanup test environment
 */
export async function cleanupTestEnvironment(envId: string): Promise<void> {
  // Mock cleanup
  console.log(`Cleaning up test environment: ${envId}`);
}