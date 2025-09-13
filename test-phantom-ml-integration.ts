/**
 * Phantom ML Core Integration Test
 * Validates all 32 additional business-ready ML features
 */

import { phantomMLCoreService } from '../src/services/PhantomMLCoreService';

interface TestResult {
  name: string;
  category: string;
  success: boolean;
  executionTime?: number;
  error?: string;
  data?: any;
}

class PhantomMLCoreIntegrationTest {
  private results: TestResult[] = [];

  private async runTest(
    name: string, 
    category: string, 
    testFn: () => Promise<any>
  ): Promise<void> {
    console.log(`\n🧪 Testing: ${name}`);
    
    try {
      const startTime = Date.now();
      const result = await testFn();
      const executionTime = Date.now() - startTime;
      
      if (result.success) {
        console.log(`✅ ${name} - SUCCESS (${executionTime}ms)`);
        this.results.push({
          name,
          category,
          success: true,
          executionTime,
          data: result.data
        });
      } else {
        console.log(`❌ ${name} - FAILED: ${result.error}`);
        this.results.push({
          name,
          category,
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      console.log(`❌ ${name} - ERROR: ${error.message}`);
      this.results.push({
        name,
        category,
        success: false,
        error: error.message
      });
    }
  }

  async runAllTests(): Promise<void> {
    console.log('🚀 Starting Phantom ML Core Integration Tests');
    console.log('Testing all 32 additional business-ready ML features...\n');

    // System Status Test
    await this.runTest('System Status', 'System', async () => {
      return await phantomMLCoreService.getSystemStatus();
    });

    // ==================== MODEL MANAGEMENT TESTS (8) ====================
    
    await this.runTest('Model Validation', 'Model Management', async () => {
      return await phantomMLCoreService.validateModel('test_model_001', {
        validation_type: 'comprehensive',
        include_performance: true
      });
    });

    await this.runTest('Model Export', 'Model Management', async () => {
      return await phantomMLCoreService.exportModel('test_model_001', 'json');
    });

    await this.runTest('Model Import', 'Model Management', async () => {
      return await phantomMLCoreService.importModel({
        model_type: 'classification',
        algorithm: 'random_forest'
      });
    });

    await this.runTest('Model Clone', 'Model Management', async () => {
      return await phantomMLCoreService.cloneModel('test_model_001', 'test_model_clone');
    });

    await this.runTest('Model Archive', 'Model Management', async () => {
      return await phantomMLCoreService.archiveModel('test_model_001');
    });

    await this.runTest('Model Restore', 'Model Management', async () => {
      return await phantomMLCoreService.restoreModel('test_model_001');
    });

    await this.runTest('Model Comparison', 'Model Management', async () => {
      return await phantomMLCoreService.compareModels('test_model_001', 'test_model_002');
    });

    await this.runTest('Model Optimization', 'Model Management', async () => {
      return await phantomMLCoreService.optimizeModel('test_model_001', 'performance');
    });

    // ==================== ANALYTICS & INSIGHTS TESTS (8) ====================
    
    await this.runTest('Insights Generation', 'Analytics & Insights', async () => {
      return await phantomMLCoreService.generateInsights({
        dataset: 'threat_intelligence',
        analysis_depth: 'comprehensive',
        time_range: '30d'
      });
    });

    await this.runTest('Trend Analysis', 'Analytics & Insights', async () => {
      return await phantomMLCoreService.performTrendAnalysis({
        metrics: ['accuracy', 'performance'],
        period: '30d',
        granularity: 'daily'
      });
    });

    await this.runTest('Correlation Analysis', 'Analytics & Insights', async () => {
      return await phantomMLCoreService.performCorrelationAnalysis([
        'feature_1', 'feature_2', 'feature_3', 'target'
      ]);
    });

    await this.runTest('Statistical Summary', 'Analytics & Insights', async () => {
      return await phantomMLCoreService.getStatisticalSummary('test_dataset_001');
    });

    await this.runTest('Data Quality Assessment', 'Analytics & Insights', async () => {
      return await phantomMLCoreService.assessDataQuality({
        dataset: 'test_dataset_001',
        checks: ['completeness', 'consistency', 'validity']
      });
    });

    await this.runTest('Feature Importance Analysis', 'Analytics & Insights', async () => {
      return await phantomMLCoreService.analyzeFeatureImportance('test_model_001');
    });

    await this.runTest('Model Explainability', 'Analytics & Insights', async () => {
      return await phantomMLCoreService.explainModel('test_model_001', {
        instance_id: 'test_instance_001'
      });
    });

    await this.runTest('Business Impact Analysis', 'Analytics & Insights', async () => {
      return await phantomMLCoreService.analyzeBusinessImpact({
        project: 'threat_detection',
        metrics: ['cost_savings', 'efficiency_gains'],
        time_period: '12_months'
      });
    });

    // ==================== REAL-TIME PROCESSING TESTS (6) ====================
    
    await this.runTest('Stream Predictions', 'Real-time Processing', async () => {
      return await phantomMLCoreService.streamPredict('test_model_001', {
        stream_source: 'live_data_feed',
        batch_size: 100
      });
    });

    await this.runTest('Batch Processing Async', 'Real-time Processing', async () => {
      return await phantomMLCoreService.batchProcessAsync('test_model_001', {
        data_source: 'batch_data_001',
        processing_mode: 'parallel'
      });
    });

    await this.runTest('Real-time Monitoring', 'Real-time Processing', async () => {
      return await phantomMLCoreService.startRealTimeMonitoring({
        models: ['test_model_001'],
        metrics: ['accuracy', 'latency'],
        interval: 60
      });
    });

    await this.runTest('Alert Configuration', 'Real-time Processing', async () => {
      return await phantomMLCoreService.configureAlerts({
        rules: [
          { metric: 'accuracy', threshold: 0.85, operator: 'less_than' },
          { metric: 'latency', threshold: 1000, operator: 'greater_than' }
        ]
      });
    });

    await this.runTest('Threshold Management', 'Real-time Processing', async () => {
      return await phantomMLCoreService.manageThresholds({
        model_id: 'test_model_001',
        thresholds: { accuracy: 0.9, precision: 0.85 }
      });
    });

    await this.runTest('Event Processing', 'Real-time Processing', async () => {
      return await phantomMLCoreService.processEvents({
        event_source: 'ml_pipeline',
        processing_rules: ['filter_anomalies', 'enrich_data']
      });
    });

    // ==================== ENTERPRISE FEATURES TESTS (5) ====================
    
    await this.runTest('Audit Trail Generation', 'Enterprise Features', async () => {
      return await phantomMLCoreService.generateAuditTrail({
        scope: 'ml_operations',
        time_range: '7d',
        detail_level: 'comprehensive'
      });
    });

    await this.runTest('Compliance Reporting', 'Enterprise Features', async () => {
      return await phantomMLCoreService.generateComplianceReport({
        standards: ['SOC2', 'GDPR', 'HIPAA'],
        scope: 'all_models'
      });
    });

    await this.runTest('Security Scanning', 'Enterprise Features', async () => {
      return await phantomMLCoreService.performSecurityScan({
        target: 'all_models',
        scan_type: 'vulnerability_assessment'
      });
    });

    await this.runTest('System Backup', 'Enterprise Features', async () => {
      return await phantomMLCoreService.backupSystem({
        backup_type: 'incremental',
        include_models: true,
        include_data: false
      });
    });

    await this.runTest('Disaster Recovery', 'Enterprise Features', async () => {
      return await phantomMLCoreService.initiateDisasterRecovery({
        recovery_type: 'model_restoration',
        backup_id: 'latest'
      });
    });

    // ==================== BUSINESS INTELLIGENCE TESTS (5) ====================
    
    await this.runTest('ROI Calculation', 'Business Intelligence', async () => {
      return await phantomMLCoreService.calculateROI({
        project: 'ml_threat_detection',
        investment: 100000,
        time_period: '12_months'
      });
    });

    await this.runTest('Cost-Benefit Analysis', 'Business Intelligence', async () => {
      return await phantomMLCoreService.performCostBenefitAnalysis({
        initiative: 'automated_threat_detection',
        costs: ['infrastructure', 'maintenance', 'training'],
        benefits: ['time_savings', 'accuracy_improvement']
      });
    });

    await this.runTest('Performance Forecasting', 'Business Intelligence', async () => {
      return await phantomMLCoreService.forecastPerformance({
        models: ['test_model_001'],
        forecast_horizon: '90d',
        metrics: ['accuracy', 'throughput']
      });
    });

    await this.runTest('Resource Optimization', 'Business Intelligence', async () => {
      return await phantomMLCoreService.optimizeResources({
        scope: 'ml_infrastructure',
        optimization_goals: ['cost', 'performance']
      });
    });

    await this.runTest('Business Metrics Tracking', 'Business Intelligence', async () => {
      return await phantomMLCoreService.trackBusinessMetrics({
        kpis: ['detection_rate', 'false_positive_rate', 'cost_per_detection'],
        reporting_frequency: 'daily'
      });
    });
  }

  generateReport(): void {
    console.log('\n📊 PHANTOM ML CORE INTEGRATION TEST REPORT');
    console.log('=' .repeat(60));
    
    const totalTests = this.results.length;
    const successfulTests = this.results.filter(r => r.success).length;
    const failedTests = totalTests - successfulTests;
    const successRate = ((successfulTests / totalTests) * 100).toFixed(1);
    
    console.log(`\n🔍 Test Summary:`);
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   Successful: ${successfulTests}`);
    console.log(`   Failed: ${failedTests}`);
    console.log(`   Success Rate: ${successRate}%`);
    
    // Group by category
    const categories = [...new Set(this.results.map(r => r.category))];
    
    console.log(`\n📈 Results by Category:`);
    categories.forEach(category => {
      const categoryResults = this.results.filter(r => r.category === category);
      const categorySuccess = categoryResults.filter(r => r.success).length;
      const categoryTotal = categoryResults.length;
      const categoryRate = ((categorySuccess / categoryTotal) * 100).toFixed(1);
      
      console.log(`   ${category}: ${categorySuccess}/${categoryTotal} (${categoryRate}%)`);
    });
    
    // Show failed tests
    const failedResults = this.results.filter(r => !r.success);
    if (failedResults.length > 0) {
      console.log(`\n❌ Failed Tests:`);
      failedResults.forEach(result => {
        console.log(`   - ${result.name}: ${result.error}`);
      });
    }
    
    // Show performance metrics
    const executionTimes = this.results
      .filter(r => r.success && r.executionTime)
      .map(r => r.executionTime!);
    
    if (executionTimes.length > 0) {
      const avgTime = executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length;
      const maxTime = Math.max(...executionTimes);
      const minTime = Math.min(...executionTimes);
      
      console.log(`\n⚡ Performance Metrics:`);
      console.log(`   Average Execution Time: ${avgTime.toFixed(2)}ms`);
      console.log(`   Fastest Test: ${minTime}ms`);
      console.log(`   Slowest Test: ${maxTime}ms`);
    }
    
    console.log(`\n🎯 Status: ${successRate === '100.0' ? '✅ ALL TESTS PASSED' : '⚠️  SOME TESTS FAILED'}`);
    console.log('=' .repeat(60));
  }
}

// Export for use in other modules
export { PhantomMLCoreIntegrationTest };

// CLI execution
if (require.main === module) {
  const tester = new PhantomMLCoreIntegrationTest();
  
  tester.runAllTests()
    .then(() => {
      tester.generateReport();
      
      const results = tester.results || [];
      const successRate = (results.filter(r => r.success).length / results.length) * 100;
      process.exit(successRate === 100 ? 0 : 1);
    })
    .catch((error) => {
      console.error('Integration test suite failed:', error);
      process.exit(1);
    });
}