/**
 * Test results aggregation utilities
 */

export interface TestResult {
  name: string;
  file: string;
  duration: number;
  status: 'passed' | 'failed' | 'skipped';
  error?: string;
  retries?: number;
  browser?: string;
  timestamp: number;
}

interface AggregatedResults {
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  totalDuration: number;
  averageDuration: number;
  successRate: number;
  testsByFile: Record<string, TestResult[]>;
  testsByStatus: {
    passed: TestResult[];
    failed: TestResult[];
    skipped: TestResult[];
  };
  slowestTests: TestResult[];
  flakyTests: TestResult[];
}

/**
 * Aggregate test results from multiple workers
 */
export async function aggregate(results: TestResult[]): Promise<AggregatedResults> {
  const aggregated: AggregatedResults = {
    totalTests: results.length,
    passed: 0,
    failed: 0,
    skipped: 0,
    totalDuration: 0,
    averageDuration: 0,
    successRate: 0,
    testsByFile: {},
    testsByStatus: {
      passed: [],
      failed: [],
      skipped: [],
    },
    slowestTests: [],
    flakyTests: [],
  };

  // Process results
  for (const result of results) {
    // Count by status
    aggregated[result.status]++;
    aggregated.testsByStatus[result.status].push(result);

    // Total duration
    aggregated.totalDuration += result.duration;

    // Group by file
    if (!aggregated.testsByFile[result.file]) {
      aggregated.testsByFile[result.file] = [];
    }
    aggregated.testsByFile[result.file].push(result);

    // Track flaky tests (tests with retries)
    if (result.retries && result.retries > 0) {
      aggregated.flakyTests.push(result);
    }
  }

  // Calculate metrics
  aggregated.averageDuration = aggregated.totalTests > 0
    ? aggregated.totalDuration / aggregated.totalTests
    : 0;

  aggregated.successRate = aggregated.totalTests > 0
    ? (aggregated.passed / aggregated.totalTests) * 100
    : 0;

  // Find slowest tests
  aggregated.slowestTests = results
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 10);

  return aggregated;
}

/**
 * Generate summary report
 */
export function generateSummary(results: AggregatedResults): string {
  const summary = [
    '# Test Results Summary',
    '',
    `Total Tests: ${results.totalTests}`,
    `Passed: ${results.passed} (${results.successRate.toFixed(1)}%)`,
    `Failed: ${results.failed}`,
    `Skipped: ${results.skipped}`,
    '',
    `Total Duration: ${(results.totalDuration / 1000).toFixed(2)}s`,
    `Average Duration: ${(results.averageDuration / 1000).toFixed(2)}s`,
    '',
  ];

  if (results.slowestTests.length > 0) {
    summary.push('## Slowest Tests');
    summary.push('');
    results.slowestTests.forEach((test, i) => {
      summary.push(`${i + 1}. ${test.name} - ${(test.duration / 1000).toFixed(2)}s`);
    });
    summary.push('');
  }

  if (results.flakyTests.length > 0) {
    summary.push('## Flaky Tests');
    summary.push('');
    results.flakyTests.forEach(test => {
      summary.push(`- ${test.name} (${test.retries} retries)`);
    });
    summary.push('');
  }

  if (results.failed > 0) {
    summary.push('## Failed Tests');
    summary.push('');
    results.testsByStatus.failed.forEach(test => {
      summary.push(`- ${test.name}`);
      if (test.error) {
        summary.push(`  Error: ${test.error}`);
      }
    });
  }

  return summary.join('\n');
}

/**
 * Export results to various formats
 */
export async function exportResults(
  results: AggregatedResults,
  format: 'json' | 'html' | 'junit' | 'csv'
): Promise<string> {
  switch (format) {
    case 'json':
      return JSON.stringify(results, null, 2);

    case 'html':
      return generateHTMLReport(results);

    case 'junit':
      return generateJUnitXML(results);

    case 'csv':
      return generateCSV(results);

    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

function generateHTMLReport(results: AggregatedResults): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Test Results</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .summary { background: #f5f5f5; padding: 20px; border-radius: 8px; }
    .passed { color: green; }
    .failed { color: red; }
    .skipped { color: orange; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #f0f0f0; }
  </style>
</head>
<body>
  <h1>Test Results Report</h1>
  <div class="summary">
    <h2>Summary</h2>
    <p>Total Tests: ${results.totalTests}</p>
    <p class="passed">Passed: ${results.passed} (${results.successRate.toFixed(1)}%)</p>
    <p class="failed">Failed: ${results.failed}</p>
    <p class="skipped">Skipped: ${results.skipped}</p>
    <p>Total Duration: ${(results.totalDuration / 1000).toFixed(2)}s</p>
  </div>

  <h2>Test Details</h2>
  <table>
    <thead>
      <tr>
        <th>Test Name</th>
        <th>Status</th>
        <th>Duration</th>
        <th>File</th>
      </tr>
    </thead>
    <tbody>
      ${results.testsByStatus.passed.concat(
        results.testsByStatus.failed,
        results.testsByStatus.skipped
      ).map(test => `
        <tr>
          <td>${test.name}</td>
          <td class="${test.status}">${test.status}</td>
          <td>${(test.duration / 1000).toFixed(2)}s</td>
          <td>${test.file}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
</body>
</html>
  `;
}

function generateJUnitXML(results: AggregatedResults): string {
  const testsuites = Object.entries(results.testsByFile).map(([file, tests]) => {
    const passed = tests.filter(t => t.status === 'passed').length;
    const failed = tests.filter(t => t.status === 'failed').length;
    const skipped = tests.filter(t => t.status === 'skipped').length;
    const time = tests.reduce((sum, t) => sum + t.duration, 0) / 1000;

    const testcases = tests.map(test => {
      let testcaseXML = `    <testcase name="${test.name}" time="${(test.duration / 1000).toFixed(3)}">`;
      if (test.status === 'failed' && test.error) {
        testcaseXML += `\n      <failure message="${test.error}"/>\n    `;
      } else if (test.status === 'skipped') {
        testcaseXML += `\n      <skipped/>\n    `;
      }
      testcaseXML += '</testcase>';
      return testcaseXML;
    }).join('\n');

    return `  <testsuite name="${file}" tests="${tests.length}" failures="${failed}" skipped="${skipped}" time="${time.toFixed(3)}">
${testcases}
  </testsuite>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<testsuites tests="${results.totalTests}" failures="${results.failed}" skipped="${results.skipped}" time="${(results.totalDuration / 1000).toFixed(3)}">
${testsuites}
</testsuites>`;
}

function generateCSV(results: AggregatedResults): string {
  const headers = ['Test Name', 'Status', 'Duration (s)', 'File', 'Browser'];
  const rows = results.testsByStatus.passed.concat(
    results.testsByStatus.failed,
    results.testsByStatus.skipped
  ).map(test => [
    test.name,
    test.status,
    (test.duration / 1000).toFixed(2),
    test.file,
    test.browser || 'unknown',
  ]);

  return [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');
}