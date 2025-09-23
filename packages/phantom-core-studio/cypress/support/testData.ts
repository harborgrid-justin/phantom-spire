/**
 * Test data generation utilities
 * Provides cached test data generation for improved performance
 */

import { faker } from '@faker-js/faker';

interface TestDataCache {
  data: unknown;
  timestamp: number;
}

class TestDataGenerator {
  private static instance: TestDataGenerator;
  private cache: Map<string, TestDataCache> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  static getInstance(): TestDataGenerator {
    if (!TestDataGenerator.instance) {
      TestDataGenerator.instance = new TestDataGenerator();
    }
    return TestDataGenerator.instance;
  }

  /**
   * Generate test data with caching
   */
  async generate(type: string, options: Record<string, unknown> = {}): Promise<unknown> {
    const cacheKey = `${type}-${JSON.stringify(options)}`;

    // Check cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    // Generate new data
    const data = await this.generateFresh(type, options);

    // Cache the result
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });

    return data;
  }

  /**
   * Generate fresh test data
   */
  private async generateFresh(type: string, options: Record<string, unknown> = {}): Promise<unknown> {
    switch (type) {
      case 'user':
        return this.generateUser(options);
      case 'model':
        return this.generateModel(options);
      case 'dataset':
        return this.generateDataset(options);
      case 'experiment':
        return this.generateExperiment(options);
      case 'deployment':
        return this.generateDeployment(options);
      case 'timeSeries':
        return this.generateTimeSeries(options);
      case 'metrics':
        return this.generateMetrics(options);
      default:
        return this.generateGeneric(options);
    }
  }

  private generateUser(options: Record<string, unknown> = {}) {
    return {
      id: faker.string.uuid(),
      email: faker.internet.email(),
      name: faker.person.fullName(),
      role: faker.helpers.arrayElement(['admin', 'user', 'viewer']),
      avatar: faker.image.avatar(),
      createdAt: faker.date.past(),
      ...options,
    };
  }

  private generateModel(options: Record<string, unknown> = {}) {
    return {
      id: faker.string.uuid(),
      name: faker.commerce.productName() + ' Model',
      type: faker.helpers.arrayElement(['classification', 'regression', 'clustering']),
      algorithm: faker.helpers.arrayElement(['random-forest', 'neural-network', 'svm', 'xgboost']),
      status: faker.helpers.arrayElement(['training', 'active', 'archived']),
      accuracy: faker.number.float({ min: 0.7, max: 0.99, fractionDigits: 2 }),
      version: faker.system.semver(),
      createdAt: faker.date.past(),
      ...options,
    };
  }

  private generateDataset(options: Record<string, unknown> = {}) {
    return {
      id: faker.string.uuid(),
      name: faker.commerce.productName() + ' Dataset',
      size: faker.number.int({ min: 100, max: 100000 }),
      features: faker.number.int({ min: 5, max: 100 }),
      samples: faker.number.int({ min: 1000, max: 1000000 }),
      format: faker.helpers.arrayElement(['csv', 'json', 'parquet']),
      status: faker.helpers.arrayElement(['ready', 'processing', 'error']),
      createdAt: faker.date.past(),
      ...options,
    };
  }

  private generateExperiment(options: Record<string, unknown> = {}) {
    return {
      id: faker.string.uuid(),
      name: 'Experiment ' + faker.commerce.productAdjective(),
      modelId: faker.string.uuid(),
      datasetId: faker.string.uuid(),
      status: faker.helpers.arrayElement(['running', 'completed', 'failed', 'pending']),
      parameters: {
        learningRate: faker.number.float({ min: 0.001, max: 0.1, fractionDigits: 3 }),
        epochs: faker.number.int({ min: 10, max: 100 }),
        batchSize: faker.helpers.arrayElement([32, 64, 128, 256]),
      },
      metrics: {
        accuracy: faker.number.float({ min: 0.7, max: 0.99, fractionDigits: 2 }),
        loss: faker.number.float({ min: 0.01, max: 0.5, fractionDigits: 3 }),
        f1Score: faker.number.float({ min: 0.7, max: 0.99, fractionDigits: 2 }),
      },
      duration: faker.number.int({ min: 60, max: 3600 }),
      createdAt: faker.date.past(),
      ...options,
    };
  }

  private generateDeployment(options: Record<string, unknown> = {}) {
    return {
      id: faker.string.uuid(),
      modelId: faker.string.uuid(),
      environment: faker.helpers.arrayElement(['development', 'staging', 'production']),
      status: faker.helpers.arrayElement(['active', 'inactive', 'deploying', 'error']),
      endpoint: faker.internet.url() + '/predict',
      replicas: faker.number.int({ min: 1, max: 10 }),
      requestsPerMinute: faker.number.int({ min: 0, max: 10000 }),
      avgLatency: faker.number.int({ min: 10, max: 500 }),
      errorRate: faker.number.float({ min: 0, max: 0.05, fractionDigits: 3 }),
      lastDeployedAt: faker.date.recent(),
      ...options,
    };
  }

  private generateTimeSeries(options: Record<string, unknown> = {}) {
    const points = (options.points as number) || 100;
    const data = [];
    let value = faker.number.float({ min: 50, max: 100 });

    for (let i = 0; i < points; i++) {
      value += faker.number.float({ min: -5, max: 5 });
      value = Math.max(0, Math.min(100, value)); // Keep within bounds

      data.push({
        timestamp: new Date(Date.now() - (points - i) * 60000), // 1 minute intervals
        value: parseFloat(value.toFixed(2)),
      });
    }

    return data;
  }

  private generateMetrics(options: Record<string, unknown> = {}) {
    return {
      cpu: faker.number.float({ min: 0, max: 100, fractionDigits: 1 }),
      memory: faker.number.float({ min: 0, max: 100, fractionDigits: 1 }),
      disk: faker.number.float({ min: 0, max: 100, fractionDigits: 1 }),
      network: {
        inbound: faker.number.int({ min: 0, max: 1000 }),
        outbound: faker.number.int({ min: 0, max: 1000 }),
      },
      requests: {
        total: faker.number.int({ min: 0, max: 10000 }),
        success: faker.number.int({ min: 0, max: 10000 }),
        error: faker.number.int({ min: 0, max: 100 }),
      },
      latency: {
        p50: faker.number.int({ min: 10, max: 100 }),
        p95: faker.number.int({ min: 100, max: 500 }),
        p99: faker.number.int({ min: 500, max: 1000 }),
      },
      timestamp: new Date(),
      ...options,
    };
  }

  private generateGeneric(options: Record<string, unknown> = {}) {
    return {
      id: faker.string.uuid(),
      name: faker.commerce.productName(),
      description: faker.lorem.sentence(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      ...options,
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

const generator = TestDataGenerator.getInstance();

/**
 * Generate test data
 */
export async function generateData(type?: string): Promise<unknown> {
  if (!type) {
    // Generate complete test suite data
    return {
      users: await Promise.all([...Array(5)].map(() => generator.generate('user'))),
      models: await Promise.all([...Array(10)].map(() => generator.generate('model'))),
      datasets: await Promise.all([...Array(5)].map(() => generator.generate('dataset'))),
      experiments: await Promise.all([...Array(20)].map(() => generator.generate('experiment'))),
      deployments: await Promise.all([...Array(3)].map(() => generator.generate('deployment'))),
    };
  }

  return generator.generate(type);
}

/**
 * Generate batch test data
 */
export async function generateBatch(type: string, count: number): Promise<unknown[]> {
  return Promise.all([...Array(count)].map(() => generator.generate(type)));
}

/**
 * Generate test file
 */
export function generateTestFile(type: string, size: number = 1024): File {
  const content = new Array(size).fill('a').join('');
  const blob = new Blob([content], { type: 'text/plain' });
  return new File([blob], `test-${type}.txt`, { type: 'text/plain' });
}

/**
 * Generate CSV data
 */
export function generateCSV(rows: number = 100, columns: string[] = ['id', 'name', 'value']): string {
  const data = [columns.join(',')];

  for (let i = 0; i < rows; i++) {
    const row = columns.map(col => {
      if (col === 'id') return i + 1;
      if (col === 'name') return faker.person.fullName();
      if (col === 'value') return faker.number.float({ min: 0, max: 100, fractionDigits: 2 });
      return faker.lorem.word();
    });
    data.push(row.join(','));
  }

  return data.join('\n');
}
