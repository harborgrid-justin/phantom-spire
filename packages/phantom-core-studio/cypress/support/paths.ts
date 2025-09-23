/**
 * Centralized path constants for Cypress tests
 * Re-exports from the main paths config for test usage
 */

// Re-export path constants for Cypress tests
export const TEST_PATHS = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  MODELS: '/models',
  TRAINING: '/training',
  DATASETS: '/datasets',
  EXPERIMENTS: '/experiments',
  SETTINGS: '/settings',
} as const;

// Helper function to generate selectors for testing
export const getPathSelector = (path: string) => `a[href="${path}"]`;

// Common test selectors
export const SELECTORS = {
  DASHBOARD_LINK: getPathSelector(TEST_PATHS.DASHBOARD),
  MODELS_LINK: getPathSelector(TEST_PATHS.MODELS),
  TRAINING_LINK: getPathSelector(TEST_PATHS.TRAINING),
  DATASETS_LINK: getPathSelector(TEST_PATHS.DATASETS),
  EXPERIMENTS_LINK: getPathSelector(TEST_PATHS.EXPERIMENTS),
  SETTINGS_LINK: getPathSelector(TEST_PATHS.SETTINGS),
} as const;

// Resource-heavy paths for prefetch testing
export const RESOURCE_HEAVY_PATHS = [
  TEST_PATHS.TRAINING,
  TEST_PATHS.DATASETS,
] as const;

// Lightweight paths for prefetch testing
export const LIGHTWEIGHT_PATHS = [
  TEST_PATHS.DASHBOARD,
  TEST_PATHS.MODELS,
  TEST_PATHS.EXPERIMENTS,
] as const;