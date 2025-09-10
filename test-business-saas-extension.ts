/**
 * Test file for Business SaaS Incident Response Data Store Extension
 */

import { createBusinessSaaSIncidentResponse, BusinessSaaSConfig } from '../frontend/phantom-incidentResponse-core/src-ts/enhanced-api.js';
import { IncidentSeverity, IncidentStatus, IncidentCategory } from '../frontend/phantom-incidentResponse-core/src-ts/types.js';

async function testBusinessSaaSFeatures() {
  console.log('🚀 Testing Business SaaS Incident Response Data Store Extension...\n');

  const config: BusinessSaaSConfig = {
    tenantId: 'test-tenant-001',
    dataStore: {
      mongodb: {
        uri: 'mongodb://admin:phantom_secure_pass@localhost:27017',
        database: 'phantom_spire_test'
      },
      redis: {
        url: 'redis://localhost:6379'
      },
      postgresql: {
        connectionString: 'postgresql://postgres:phantom_secure_pass@localhost:5432/phantom_spire_test'
      },
      elasticsearch: {
        node: 'http://localhost:9200'
      }
    },
    features: {
      realTimeUpdates: true,
      advancedAnalytics: true,
      customReports: true,
      apiAccess: true,
      ssoIntegration: false
    },
    quotas: {
      maxIncidents: 1000,
      maxEvidenceSize: 1073741824, // 1GB
      maxApiRequestsPerHour: 500,
      maxConcurrentUsers: 50
    }
  };

  try {
    // Initialize the enhanced incident response core
    const incidentCore = createBusinessSaaSIncidentResponse(config);
    console.log('✅ Enhanced Incident Response Core initialized');

    // Test system health
    console.log('\n📊 Testing system health...');
    const health = await incidentCore.getSystemHealth();
    console.log('System Health:', JSON.stringify(health, null, 2));

    // Test tenant information
    console.log('\n🏢 Testing tenant information...');
    const tenantInfo = await incidentCore.getTenantInfo();
    console.log('Tenant Info:', JSON.stringify(tenantInfo, null, 2));

    // Test incident creation with persistence
    console.log('\n📋 Testing persistent incident creation...');
    const incidentData = {
      title: 'Test Security Incident',
      description: 'A test incident to verify the Business SaaS data store integration',
      severity: IncidentSeverity.High,
      status: IncidentStatus.Open,
      category: IncidentCategory.SecurityBreach,
      reportedBy: 'test-user@company.com',
      tags: ['test', 'saas', 'data-store']
    };

    const incidentId = await incidentCore.createIncidentPersistent(incidentData);
    console.log(`✅ Incident created with ID: ${incidentId}`);

    // Test incident retrieval
    console.log('\n🔍 Testing persistent incident retrieval...');
    const retrievedIncident = await incidentCore.getIncidentPersistent(incidentId);
    console.log('Retrieved Incident:', JSON.stringify(retrievedIncident, null, 2));

    // Test evidence addition
    console.log('\n🔬 Testing evidence addition...');
    const evidenceData = {
      name: 'Test Evidence File',
      type: 'log_file',
      description: 'Sample log file for testing',
      collectedBy: 'test-analyst',
      filePath: '/tmp/test-evidence.log',
      hash: 'sha256:test-hash-value',
      size: 1024
    };

    const evidenceId = await incidentCore.addEvidencePersistent(incidentId, evidenceData);
    console.log(`✅ Evidence added with ID: ${evidenceId}`);

    // Test incident search
    console.log('\n🔎 Testing incident search...');
    const searchResults = await incidentCore.searchIncidentsPersistent('security breach', {
      severity: IncidentSeverity.High
    });
    console.log('Search Results:', JSON.stringify(searchResults, null, 2));

    // Test analytics generation
    console.log('\n📈 Testing advanced analytics...');
    const analytics = await incidentCore.generateAdvancedAnalytics({
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      end: new Date()
    });
    console.log('Analytics:', JSON.stringify(analytics, null, 2));

    // Test custom report generation
    console.log('\n📊 Testing custom report generation...');
    const incidentReport = await incidentCore.generateCustomReport({
      type: 'incidents',
      dateRange: {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        end: new Date()
      },
      filters: { severity: IncidentSeverity.High },
      groupBy: ['severity', 'category'],
      aggregations: ['count', 'avg_resolution_time']
    });
    console.log('Incident Report:', JSON.stringify(incidentReport, null, 2));

    // Test data export
    console.log('\n💾 Testing data export...');
    const exportData = await incidentCore.exportIncidentData([incidentId], 'json');
    console.log('Export Data:', JSON.stringify(exportData, null, 2));

    // Test tenant metrics
    console.log('\n📊 Testing tenant metrics...');
    const tenantMetrics = await incidentCore.getTenantMetrics();
    console.log('Tenant Metrics:', JSON.stringify(tenantMetrics, null, 2));

    // Test API quota checking
    console.log('\n⚖️ Testing API quota management...');
    const quotaOk = await incidentCore.checkApiQuota();
    console.log(`API Quota Status: ${quotaOk ? 'OK' : 'Exceeded'}`);
    incidentCore.incrementApiUsage();
    console.log('API usage incremented');

    // Test incident update with real-time notifications
    console.log('\n🔄 Testing real-time incident updates...');
    
    // Subscribe to updates (simulate in a real environment)
    console.log('Setting up real-time subscription...');
    await incidentCore.subscribeToIncidentUpdates(incidentId, (update) => {
      console.log('Real-time update received:', update);
    });

    // Update the incident
    const updateSuccess = await incidentCore.updateIncidentPersistent(incidentId, {
      status: IncidentStatus.InProgress,
      assignedTo: 'incident-commander-001',
      notes: 'Incident assigned and investigation started'
    });
    console.log(`✅ Incident update ${updateSuccess ? 'successful' : 'failed'}`);

    // Publish a custom update
    await incidentCore.publishIncidentUpdate(incidentId, {
      type: 'status_change',
      message: 'Incident status changed to In Progress',
      actor: 'system',
      timestamp: new Date().toISOString()
    });

    console.log('\n🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Helper function to test individual data sources
async function testDataSources() {
  console.log('\n🧪 Testing individual data sources...\n');

  try {
    // Test Redis Data Source
    console.log('Testing Redis Data Source...');
    const { RedisDataSource } = await import('../src/data-layer/core/RedisDataSource.js');
    const redisSource = new RedisDataSource({ url: 'redis://localhost:6379' });
    
    console.log('Redis capabilities:', redisSource.capabilities);
    console.log('Redis type:', redisSource.type);
    console.log('✅ Redis Data Source created successfully');

    // Test PostgreSQL Data Source
    console.log('\nTesting PostgreSQL Data Source...');
    const { PostgreSQLDataSource } = await import('../src/data-layer/core/PostgreSQLDataSource.js');
    const pgSource = new PostgreSQLDataSource({
      connectionString: 'postgresql://postgres:phantom_secure_pass@localhost:5432/phantom_spire_test'
    });
    
    console.log('PostgreSQL capabilities:', pgSource.capabilities);
    console.log('PostgreSQL type:', pgSource.type);
    console.log('✅ PostgreSQL Data Source created successfully');

    // Test Elasticsearch Data Source
    console.log('\nTesting Elasticsearch Data Source...');
    const { ElasticsearchDataSource } = await import('../src/data-layer/core/ElasticsearchDataSource.js');
    const esSource = new ElasticsearchDataSource({
      node: 'http://localhost:9200'
    });
    
    console.log('Elasticsearch capabilities:', esSource.capabilities);
    console.log('Elasticsearch type:', esSource.type);
    console.log('✅ Elasticsearch Data Source created successfully');

    console.log('\n✅ All data source tests passed!');

  } catch (error) {
    console.error('❌ Data source test failed:', error);
  }
}

// Main test execution
async function runTests() {
  console.log('='.repeat(80));
  console.log('🧪 PHANTOM-SPIRE BUSINESS SAAS DATA STORE EXTENSION TESTS');
  console.log('='.repeat(80));

  // Test data sources first
  await testDataSources();

  // Test business SaaS features
  await testBusinessSaaSFeatures();

  console.log('\n' + '='.repeat(80));
  console.log('🏁 Test execution completed');
  console.log('='.repeat(80));
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

export { testBusinessSaaSFeatures, testDataSources, runTests };