import type { Config } from 'jest';

beforeAll(() => {
  process.env.NODE_ENV = 'test';
});

afterEach(() => {
  jest.clearAllMocks();
});

global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};

export {};