/**
 * Test reporting utilities for Cypress
 */

import { aggregate, generateSummary, exportResults } from './results';

interface CypressRunResult {
  startedTestsAt: string;
  endedTestsAt: string;
  totalDuration: number;
  totalSuites: number;
  totalTests: number;
  totalFailed: number;
  totalPassed: number;
  totalPending: number;
  totalSkipped: number;
  runs: Array<{
    tests: Array<{
      title: string[];
      state: string;
      duration: number;
      err?: any;
    }>;
    spec: {
      name: string;
      relative: string;
      absolute: string;
    };
    stats: {
      duration: number;
      tests: number;
      passes: number;
      pending: number;
      failures: number;
    };
  }>;
  browserName?: string;
  browserVersion?: string;
  osName?: string;
  osVersion?: string;
}

/**
 * Generate comprehensive test report
 */
export async function generateReport(results: CypressRunResult): Promise<void> {
  try {
    // Convert Cypress results to our format
    const testResults = results.runs.flatMap(run =>
      run.tests.map(test => ({
        name: test.title.join(' > '),
        file: run.spec.relative,
        duration: test.duration || 0,
        status: test.state as 'passed' | 'failed' | 'skipped',
        error: test.err?.message,
        browser: results.browserName,
        timestamp: Date.now(),
      }))
    );

    // Aggregate results
    const aggregated = await aggregate(testResults);

    // Generate reports in multiple formats
    const summary = generateSummary(aggregated);
    const jsonReport = await exportResults(aggregated, 'json');
    const htmlReport = await exportResults(aggregated, 'html');
    const junitReport = await exportResults(aggregated, 'junit');

    // Save reports (mock implementation)
    await saveReport('summary.txt', summary);
    await saveReport('results.json', jsonReport);
    await saveReport('index.html', htmlReport);
    await saveReport('junit.xml', junitReport);

    // Send to external services if configured
    await sendToAnalytics(aggregated);
    await sendToSlack(summary);

    console.log('Test reports generated successfully');
  } catch (error) {
    console.error('Failed to generate test report:', error);
  }
}

/**
 * Save report to file system
 */
async function saveReport(filename: string, content: string): Promise<void> {
  // In a real implementation, this would save to file system
  console.log(`Saving report to cypress/results/${filename}`);

  if (typeof window === 'undefined' && typeof require !== 'undefined') {
    try {
      const fs = require('fs');
      const path = require('path');
      const dir = path.join(process.cwd(), 'cypress', 'results');

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(path.join(dir, filename), content);
    } catch (error) {
      console.error(`Failed to save report ${filename}:`, error);
    }
  }
}

/**
 * Send results to analytics service
 */
async function sendToAnalytics(results: any): Promise<void> {
  if (!process.env.ANALYTICS_ENDPOINT) {
    return;
  }

  try {
    await fetch(process.env.ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ANALYTICS_API_KEY}`,
      },
      body: JSON.stringify({
        type: 'test-results',
        timestamp: new Date().toISOString(),
        results: {
          totalTests: results.totalTests,
          passed: results.passed,
          failed: results.failed,
          skipped: results.skipped,
          duration: results.totalDuration,
          successRate: results.successRate,
        },
        metadata: {
          branch: process.env.GITHUB_REF,
          commit: process.env.GITHUB_SHA,
          workflow: process.env.GITHUB_WORKFLOW,
          runner: process.env.RUNNER_NAME,
        },
      }),
    });
  } catch (error) {
    console.error('Failed to send results to analytics:', error);
  }
}

/**
 * Send summary to Slack
 */
async function sendToSlack(summary: string): Promise<void> {
  if (!process.env.SLACK_WEBHOOK_URL) {
    return;
  }

  try {
    const color = summary.includes('Failed: 0') ? 'good' : 'danger';

    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        attachments: [{
          color,
          title: 'Test Results - Phantom ML Studio',
          text: summary,
          footer: 'Cypress Test Suite',
          footer_icon: 'https://www.cypress.io/images/layouts/cypress-logo.svg',
          ts: Math.floor(Date.now() / 1000),
        }],
      }),
    });
  } catch (error) {
    console.error('Failed to send summary to Slack:', error);
  }
}

/**
 * Generate performance report
 */
export async function generatePerformanceReport(metrics: any[]): Promise<string> {
  const report = {
    timestamp: new Date().toISOString(),
    metrics: {
      pageLoads: metrics.filter(m => m.name.startsWith('page-load')),
      apiCalls: metrics.filter(m => m.name.startsWith('api')),
      custom: metrics.filter(m => !m.name.startsWith('page-load') && !m.name.startsWith('api')),
    },
    summary: {
      avgPageLoad: 0,
      avgApiCall: 0,
      slowestPage: '',
      slowestApi: '',
    },
  };

  // Calculate averages
  if (report.metrics.pageLoads.length > 0) {
    report.summary.avgPageLoad =
      report.metrics.pageLoads.reduce((sum, m) => sum + m.value, 0) /
      report.metrics.pageLoads.length;

    const slowest = report.metrics.pageLoads.reduce((max, m) =>
      m.value > max.value ? m : max
    );
    report.summary.slowestPage = slowest.name.replace('page-load:', '');
  }

  if (report.metrics.apiCalls.length > 0) {
    report.summary.avgApiCall =
      report.metrics.apiCalls.reduce((sum, m) => sum + m.value, 0) /
      report.metrics.apiCalls.length;

    const slowest = report.metrics.apiCalls.reduce((max, m) =>
      m.value > max.value ? m : max
    );
    report.summary.slowestApi = slowest.name.replace('api:', '');
  }

  return JSON.stringify(report, null, 2);
}

/**
 * Generate coverage report
 */
export async function generateCoverageReport(coverage: any): Promise<void> {
  if (!coverage) {
    console.log('No coverage data available');
    return;
  }

  const summary = {
    lines: coverage.lines || { percent: 0 },
    statements: coverage.statements || { percent: 0 },
    functions: coverage.functions || { percent: 0 },
    branches: coverage.branches || { percent: 0 },
  };

  const report = `
# Code Coverage Report

## Summary
- Lines: ${summary.lines.percent}%
- Statements: ${summary.statements.percent}%
- Functions: ${summary.functions.percent}%
- Branches: ${summary.branches.percent}%

## Details
${Object.entries(coverage.files || {}).map(([file, data]: any) => `
### ${file}
- Lines: ${data.lines.percent}% (${data.lines.covered}/${data.lines.total})
- Statements: ${data.statements.percent}% (${data.statements.covered}/${data.statements.total})
- Functions: ${data.functions.percent}% (${data.functions.covered}/${data.functions.total})
- Branches: ${data.branches.percent}% (${data.branches.covered}/${data.branches.total})
`).join('\n')}
  `;

  await saveReport('coverage.md', report);
}