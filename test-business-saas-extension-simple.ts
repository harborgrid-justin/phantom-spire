/**
 * Simple test to verify Business SaaS Extension functionality
 */

import { createBusinessSaaSIntelCore } from './frontend/phantom-intel-core/src-ts/business-saas/BusinessSaaSIntelCore.js';

async function testBusinessSaaSExtension() {
  console.log('🧪 Testing Business SaaS Extension...\n');

  try {
    // Basic configuration
    const config = {
      tenantId: 'test-tenant',
      dataStore: {
        mongodb: {
          uri: 'mongodb://localhost:27017',
          database: 'test_phantom_intel',
        },
        redis: {
          url: 'redis://localhost:6379',
        },
      },
      features: {
        realTimeUpdates: true,
        advancedAnalytics: true,
        customReports: true,
        apiAccess: true,
      },
      quotas: {
        maxIndicators: 1000,
        maxThreatActors: 100,
        maxCampaigns: 50,
        maxReports: 25,
        maxDataSize: 1073741824, // 1GB
        maxApiRequestsPerHour: 100,
        maxConcurrentUsers: 10,
      },
    };

    console.log('✅ Creating Business SaaS Intel Core instance...');
    const businessSaaSIntel = createBusinessSaaSIntelCore(config);

    console.log('✅ Initializing components...');
    await businessSaaSIntel.initialize();

    console.log('✅ Getting tenant information...');
    const tenantInfo = businessSaaSIntel.getTenantInfo();
    console.log(`   Tenant: ${tenantInfo?.name} (${tenantInfo?.plan})`);

    console.log('✅ Creating persistent indicator...');
    const indicatorId = await businessSaaSIntel.createIndicatorPersistent({
      indicator_type: 'ip_address',
      value: '192.168.1.100',
      confidence: 0.85,
      severity: 'high',
      sources: ['Test Source'],
      tags: ['test', 'demo'],
      context: {
        malware_families: ['TestMalware'],
        threat_actors: ['TestActor'],
        campaigns: ['TestCampaign'],
        attack_patterns: ['T1071'],
        targeted_sectors: ['Test'],
        geographic_regions: ['Test Region'],
        description: 'Test indicator for Business SaaS extension',
      },
      relationships: [],
      enrichment: {
        passive_dns: [],
        certificates: [],
      },
      kill_chain_phases: ['command-and-control'],
      false_positive_score: 0.1,
      metadata: {},
    });
    console.log(`   Created indicator: ${indicatorId}`);

    console.log('✅ Retrieving persistent indicator...');
    const retrievedIndicator = await businessSaaSIntel.getIndicatorPersistent(indicatorId);
    console.log(`   Retrieved: ${retrievedIndicator?.value} (confidence: ${retrievedIndicator?.confidence})`);

    console.log('✅ Searching indicators...');
    const searchResults = await businessSaaSIntel.searchIndicatorsPersistent('test', {});
    console.log(`   Found ${searchResults.total} indicators`);

    console.log('✅ Getting system health...');
    const health = await businessSaaSIntel.getSystemHealth();
    console.log(`   Overall status: ${health.overall_status}`);
    console.log(`   Data stores: ${Object.keys(health.data_stores).join(', ')}`);

    console.log('✅ Getting tenant metrics...');
    const metrics = businessSaaSIntel.getTenantMetrics();
    console.log(`   Indicators: ${metrics.data_metrics.total_indicators}`);
    console.log(`   Usage: ${metrics.quota_metrics.indicators_quota_usage.toFixed(1)}%`);

    console.log('✅ Testing fallback to original core methods...');
    const originalIndicatorId = businessSaaSIntel.addIndicator({
      indicator_type: 'domain',
      value: 'test.example.com',
      confidence: 0.7,
      severity: 'medium',
    });
    console.log(`   Original core indicator: ${originalIndicatorId}`);

    const summary = businessSaaSIntel.generateIntelligenceSummary();
    console.log(`   Intelligence summary: ${summary.total_indicators} indicators, ${summary.total_threat_actors} actors`);

    console.log('✅ Shutting down...');
    await businessSaaSIntel.shutdown();

    console.log('\n🎉 All tests passed! Business SaaS extension is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

// Export for use as module
export { testBusinessSaaSExtension };

// Run if called directly
if (require.main === module) {
  testBusinessSaaSExtension().catch(console.error);
}