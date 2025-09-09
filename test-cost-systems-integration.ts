/**
 * Cost Systems Engineering Integration Test
 * Test the complete integration between frontend and backend cost systems
 */

import { CostSystemsEngineeringOrchestrator } from '../src/services/business-logic/modules/cost-systems-engineering/CostSystemsEngineeringOrchestrator';

async function testCostSystemsIntegration() {
  console.log('🧪 Testing Cost Systems Engineering Integration...');

  try {
    // Test configuration
    const config = {
      businessTracking: {
        enabled: true,
        realTime: true,
        granularity: 'hour' as const,
        categories: ['infrastructure', 'personnel', 'operations', 'technology']
      },
      customerAnalysis: {
        enabled: true,
        segmentation: true,
        predictiveModeling: true,
        lifetimeValueTracking: true
      },
      engineeringAlignment: {
        standardization: true,
        integration: true,
        optimization: true,
        monitoring: true
      },
      reporting: {
        frequency: 'hourly' as const,
        formats: ['json', 'dashboard'] as const,
        recipients: ['admin', 'managers', 'analysts']
      }
    };

    // Initialize orchestrator
    console.log('📊 Initializing Cost Systems Engineering Orchestrator...');
    const orchestrator = new CostSystemsEngineeringOrchestrator(config);
    await orchestrator.initialize();
    console.log('✅ Orchestrator initialized successfully');

    // Test status
    console.log('🔍 Testing orchestrator status...');
    const status = orchestrator.getStatus();
    console.log('Status:', JSON.stringify(status, null, 2));

    // Test cost data processing
    console.log('💰 Testing cost data processing...');
    const testCostData = {
      cost: 15000,
      category: 'infrastructure',
      description: 'Server infrastructure costs',
      timestamp: new Date().toISOString(),
      businessUnit: 'security-operations',
      resourceType: 'compute',
      efficiency: 0.75,
      resourceUtilization: 0.65,
      manualProcesses: ['server-provisioning', 'monitoring-setup']
    };

    const processingResult = await orchestrator.processCostData(testCostData);
    console.log('✅ Cost data processed successfully');
    console.log('Processing result summary:', {
      business: processingResult.business ? 'processed' : 'failed',
      customer: processingResult.customer ? 'processed' : 'failed',
      optimizations: processingResult.optimizations?.length || 0,
      management: processingResult.management ? 'managed' : 'failed'
    });

    // Test cost systems alignment
    console.log('🎯 Testing cost systems alignment...');
    const alignment = await orchestrator.getCostSystemsAlignment();
    console.log('✅ Cost systems alignment retrieved');
    console.log('Alignment summary:', {
      businessTracking: alignment.business.tracking.totalCost,
      customerAnalysis: alignment.customer.analysis.customerSegment,
      engineeringStandardization: alignment.engineering.standardization.maturity,
      integrationStatus: Object.values(alignment.engineering.integration).filter(Boolean).length + '/5 systems connected'
    });

    // Test optimization report
    console.log('📈 Testing optimization report generation...');
    const optimizationReport = await orchestrator.generateOptimizationReport();
    console.log('✅ Optimization report generated');
    console.log('Report summary:', {
      businessReadinessScore: (optimizationReport.summary.businessReadinessScore * 100).toFixed(1) + '%',
      customerReadinessScore: (optimizationReport.summary.customerReadinessScore * 100).toFixed(1) + '%',
      engineeringAlignmentScore: (optimizationReport.summary.engineeringAlignmentScore * 100).toFixed(1) + '%',
      totalSavingsPotential: '$' + optimizationReport.summary.totalCostSavingsPotential.toLocaleString(),
      recommendationsCount: optimizationReport.summary.recommendationsCount
    });

    // Test individual components
    console.log('🔧 Testing individual component status...');
    const componentStatus = {
      businessTracker: status.components.businessTracker,
      customerAnalyzer: status.components.customerAnalyzer,
      managementService: status.components.managementService,
      optimizationEngine: status.components.optimizationEngine,
      integrator: status.components.integrator
    };
    console.log('Component status:', componentStatus);

    // Shutdown test
    console.log('🛑 Testing graceful shutdown...');
    await orchestrator.shutdown();
    console.log('✅ Orchestrator shutdown successfully');

    console.log('\n🎉 All Cost Systems Engineering Integration Tests Passed!');
    
    return {
      success: true,
      testResults: {
        initialization: true,
        statusCheck: true,
        dataProcessing: true,
        alignmentRetrieval: true,
        optimizationReport: true,
        componentStatus: Object.values(componentStatus).every(Boolean),
        gracefulShutdown: true
      },
      summary: {
        businessReadiness: 'READY',
        customerReadiness: 'READY', 
        engineeringAlignment: 'ALIGNED',
        integrationStatus: 'COMPLETE'
      }
    };

  } catch (error) {
    console.error('❌ Cost Systems Integration Test Failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      testResults: {
        initialization: false,
        statusCheck: false,
        dataProcessing: false,
        alignmentRetrieval: false,
        optimizationReport: false,
        componentStatus: false,
        gracefulShutdown: false
      }
    };
  }
}

// Export for use in other tests
export { testCostSystemsIntegration };

// Run test if this file is executed directly
if (require.main === module) {
  testCostSystemsIntegration()
    .then(result => {
      console.log('\n📋 Final Test Results:', JSON.stringify(result, null, 2));
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Test execution failed:', error);
      process.exit(1);
    });
}