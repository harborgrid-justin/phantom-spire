/**
 * Path Configuration Debug Utilities
 * Development tools for debugging and validating path configuration
 */

import {
  getAllPaths,
  validatePathConfiguration,
  isValidInternalPath,
  isValidExternalUrl,
  getPathCategory,
  getPrefetchSettings,
  extractRouteParams
} from './path-validation';

// ============================================================================
// DEBUG CONSOLE UTILITIES
// ============================================================================

/**
 * Logs all available paths to console for debugging
 */
export const debugPaths = () => {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('debugPaths() should only be used in development');
    return;
  }

  const paths = getAllPaths();
  console.group('🔗 Application Path Configuration');

  console.group('📱 Core Application Paths');
  console.table(paths.core);
  console.groupEnd();

  console.group('🔐 Authentication Paths');
  console.table(paths.auth);
  console.groupEnd();

  console.group('📄 Content Paths');
  console.table(paths.content);
  console.groupEnd();

  console.group('🌐 External URLs');
  console.table(paths.external);
  console.groupEnd();

  console.groupEnd();
};

/**
 * Validates and reports on path configuration
 */
export const debugPathValidation = () => {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('debugPathValidation() should only be used in development');
    return;
  }

  const validation = validatePathConfiguration();
  console.group('✅ Path Configuration Validation');

  if (validation.valid) {
    console.log('✅ All paths are valid!');
  } else {
    console.error('❌ Path validation failed:');
    validation.errors.forEach(error => console.error(`  • ${error}`));
  }

  console.groupEnd();
};

/**
 * Tests a specific path and reports its properties
 */
export const debugPath = (path: string) => {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('debugPath() should only be used in development');
    return;
  }

  console.group(`🔍 Path Analysis: ${path}`);

  const isValidInternal = isValidInternalPath(path);
  const isValidExternal = isValidExternalUrl(path);
  const category = getPathCategory(path);
  const prefetchSettings = getPrefetchSettings(path);
  const routeParams = extractRouteParams(path);

  console.log('Valid internal path:', isValidInternal);
  console.log('Valid external URL:', isValidExternal);
  console.log('Category:', category);
  console.log('Prefetch settings:', prefetchSettings);

  if (Object.keys(routeParams).length > 0) {
    console.log('Route parameters:', routeParams);
  }

  console.groupEnd();
};

// ============================================================================
// COMPONENT DEBUG UTILITIES
// ============================================================================

/**
 * React component for displaying path debug information in development
 */
export const PathDebugPanel = ({ paths }: { paths: string[] }) => {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const handlePathClick = (path: string) => {
    debugPath(path);
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        color: 'white',
        padding: '15px',
        borderRadius: '8px',
        fontSize: '12px',
        maxWidth: '300px',
        zIndex: 9999
      }}
    >
      <h4 style={{ margin: '0 0 10px 0' }}>🔗 Path Debug Panel</h4>
      <div style={{ marginBottom: '10px' }}>
        <button
          onClick={debugPaths}
          style={{
            backgroundColor: '#007acc',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '4px',
            marginRight: '5px',
            cursor: 'pointer'
          }}
        >
          Show All Paths
        </button>
        <button
          onClick={debugPathValidation}
          style={{
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Validate Config
        </button>
      </div>

      {paths.length > 0 && (
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Current Page Paths:</div>
          {paths.map((path, index) => (
            <div
              key={index}
              onClick={() => handlePathClick(path)}
              style={{
                padding: '3px 6px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '3px',
                margin: '2px 0',
                cursor: 'pointer',
                fontSize: '11px'
              }}
            >
              {path}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// AUTOMATED TESTING UTILITIES
// ============================================================================

/**
 * Generates test data for automated testing of paths
 */
export const generatePathTestData = () => {
  const paths = getAllPaths();
  const testCases = [];

  // Generate test cases for each path type
  Object.entries(paths).forEach(([category, pathGroup]) => {
    Object.entries(pathGroup).forEach(([key, path]) => {
      testCases.push({
        category,
        key,
        path,
        isValid: true,
        shouldPrefetch: getPrefetchSettings(path).shouldPrefetch
      });
    });
  });

  // Add negative test cases
  const invalidPaths = [
    '/invalid/path',
    '//double-slash',
    '/path with spaces',
    '/path/with/../../traversal',
    '<script>alert("xss")</script>',
  ];

  invalidPaths.forEach(path => {
    testCases.push({
      category: 'invalid',
      key: `invalid_${path.replace(/[^a-zA-Z0-9]/g, '_')}`,
      path,
      isValid: false,
      shouldPrefetch: false
    });
  });

  return testCases;
};

/**
 * Performance benchmark for path validation functions
 */
export const benchmarkPathValidation = (iterations = 1000) => {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('benchmarkPathValidation() should only be used in development');
    return;
  }

  const testPaths = [
    '/dashboard',
    '/projects/test-project',
    '/projects/test-project/models/test-model',
    'https://external-site.com',
    '/invalid/path'
  ];

  console.group('⚡ Path Validation Performance Benchmark');

  testPaths.forEach(path => {
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      isValidInternalPath(path);
      getPathCategory(path);
      getPrefetchSettings(path);
    }

    const end = performance.now();
    const timePerIteration = (end - start) / iterations;

    console.log(`${path}: ${timePerIteration.toFixed(4)}ms per validation`);
  });

  console.groupEnd();
};

// ============================================================================
// GLOBAL DEBUG FUNCTIONS
// ============================================================================

// Make debug functions available globally in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  (window as any).debugPaths = debugPaths;
  (window as any).debugPathValidation = debugPathValidation;
  (window as any).debugPath = debugPath;
  (window as any).benchmarkPathValidation = benchmarkPathValidation;

  console.log('🔗 Path debug utilities available globally:');
  console.log('  • debugPaths() - Show all configured paths');
  console.log('  • debugPathValidation() - Validate configuration');
  console.log('  • debugPath(path) - Analyze specific path');
  console.log('  • benchmarkPathValidation() - Performance benchmark');
}