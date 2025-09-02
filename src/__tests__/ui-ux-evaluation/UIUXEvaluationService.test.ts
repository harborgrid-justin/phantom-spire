/**
 * UI/UX Evaluation System Tests
 * Tests for the enterprise-grade UI/UX evaluation platform
 */

import { UIUXEvaluationService } from '../../services/ui-ux-evaluation/core/UIUXEvaluationService.js';
import {
  EvaluationCategory,
  EvaluationSeverity,
  IPageEvaluation,
  IUIUXEvaluationConfig,
} from '../../services/ui-ux-evaluation/interfaces/IUIUXEvaluation.js';

describe('UIUXEvaluationService', () => {
  let evaluationService: UIUXEvaluationService;

  beforeEach(() => {
    evaluationService = new UIUXEvaluationService();
  });

  describe('Service Configuration', () => {
    test('should initialize with default configuration', async () => {
      const config = await evaluationService.getConfig();

      expect(config.enabled).toBe(true);
      expect(config.autoEvaluate).toBe(true);
      expect(config.evaluationInterval).toBe(30000);
      expect(config.categories).toContain(EvaluationCategory.ACCESSIBILITY);
      expect(config.categories).toContain(EvaluationCategory.PERFORMANCE);
      expect(config.categories).toContain(EvaluationCategory.USABILITY);
    });

    test('should update configuration', async () => {
      const newConfig: Partial<IUIUXEvaluationConfig> = {
        enabled: false,
        evaluationInterval: 60000,
      };

      await evaluationService.configure(newConfig);
      const updatedConfig = await evaluationService.getConfig();

      expect(updatedConfig.enabled).toBe(false);
      expect(updatedConfig.evaluationInterval).toBe(60000);
      expect(updatedConfig.autoEvaluate).toBe(true); // Should remain unchanged
    });
  });

  describe('Page Evaluation', () => {
    test('should evaluate a page and return valid results', async () => {
      const pageId = 'test-page';
      const evaluation = await evaluationService.evaluatePage(pageId);

      expect(evaluation).toBeDefined();
      expect(evaluation.pageId).toBe(pageId);
      expect(evaluation.pageName).toBeDefined();
      expect(evaluation.component).toBeDefined();
      expect(evaluation.timestamp).toBeInstanceOf(Date);
      expect(evaluation.duration).toBeGreaterThan(0);
      expect(evaluation.metrics).toBeInstanceOf(Array);
      expect(evaluation.issues).toBeInstanceOf(Array);
      expect(evaluation.overallScore).toBeGreaterThanOrEqual(0);
      expect(evaluation.overallScore).toBeLessThanOrEqual(100);
      expect(evaluation.categoryScores).toBeDefined();
      expect(evaluation.recommendations).toBeInstanceOf(Array);
      expect(evaluation.compliance).toBeDefined();
    });

    test('should calculate score correctly based on metrics and issues', () => {
      const metrics = [
        {
          id: '1',
          name: 'Test Metric',
          category: EvaluationCategory.ACCESSIBILITY,
          description: 'Test',
          value: 80,
          maxValue: 100,
          unit: 'score',
          threshold: { excellent: 90, good: 75, acceptable: 60, poor: 40 },
          timestamp: new Date(),
        },
      ];

      const issues = [
        {
          id: '1',
          category: EvaluationCategory.ACCESSIBILITY,
          severity: EvaluationSeverity.HIGH,
          title: 'Test Issue',
          description: 'Test issue description',
          recommendation: 'Fix this issue',
          timestamp: new Date(),
          resolved: false,
        },
      ];

      const score = evaluationService.calculateScore(metrics, issues);

      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
      expect(score).toBeLessThan(80); // Should be less than metric value due to penalty
    });

    test('should handle known page IDs with correct names', async () => {
      const testCases = [
        {
          pageId: 'enterprise-realtime-dashboard',
          expectedName: 'Enterprise Realtime Dashboard',
        },
        {
          pageId: 'enterprise-workflow-designer',
          expectedName: 'Enterprise Workflow Designer',
        },
        {
          pageId: 'enterprise-notification-center',
          expectedName: 'Enterprise Notification Center',
        },
      ];

      for (const testCase of testCases) {
        const evaluation = await evaluationService.evaluatePage(
          testCase.pageId
        );
        expect(evaluation.pageName).toBe(testCase.expectedName);
      }
    });
  });

  describe('Report Generation', () => {
    test('should generate report for evaluated pages', async () => {
      const pageIds = ['test-page-1', 'test-page-2'];

      // Evaluate pages first
      for (const pageId of pageIds) {
        await evaluationService.evaluatePage(pageId);
      }

      const report = await evaluationService.generateReport(pageIds);

      expect(report).toBeDefined();
      expect(report.id).toBeDefined();
      expect(report.title).toBeDefined();
      expect(report.timestamp).toBeInstanceOf(Date);
      expect(report.pages).toHaveLength(2);
      expect(report.summary).toBeDefined();
      expect(report.summary.totalPages).toBe(2);
      expect(report.summary.overallScore).toBeGreaterThanOrEqual(0);
      expect(report.summary.overallScore).toBeLessThanOrEqual(100);
      expect(report.trends).toBeDefined();
      expect(report.exportFormats).toContain('json');
    });
  });
});
