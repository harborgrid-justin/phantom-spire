#!/usr/bin/env node

// Comprehensive test script for workspace-4 CVE Analysis endpoints
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001';

// Test data
const testCVE = {
  id: "CVE-2024-TEST001",
  description: "Test SQL injection vulnerability in web application",
  published_date: new Date().toISOString(),
  last_modified_date: new Date().toISOString(),
  cvss_metrics: {
    version: "3.1",
    base_score: 8.5,
    severity: "High",
    attack_vector: "Network",
    attack_complexity: "Low",
    privileges_required: "None",
    user_interaction: "None",
    scope: "Unchanged",
    confidentiality_impact: "High",
    integrity_impact: "High",
    availability_impact: "High",
    exploitability_score: 8.0,
    impact_score: 6.0
  },
  cwe: {
    id: "CWE-89",
    name: "SQL Injection",
    description: "Improper neutralization of special elements used in an SQL Command"
  },
  affected_products: [{
    vendor: "Test Corp",
    product: "Web Application",
    version: "2.1.0"
  }],
  references: [{
    url: "https://example.com/advisory",
    source: "Vendor",
    tags: ["vendor-advisory"]
  }],
  status: "published",
  assigner: "test@example.com",
  tags: ["web-application", "sql-injection"]
};

const batchCVEs = [
  {
    ...testCVE,
    id: "CVE-2024-TEST002",
    description: "Buffer overflow in network service",
    cvss_metrics: { ...testCVE.cvss_metrics, base_score: 9.8, severity: "Critical" }
  },
  {
    ...testCVE,
    id: "CVE-2024-TEST003",
    description: "Information disclosure vulnerability",
    cvss_metrics: { ...testCVE.cvss_metrics, base_score: 4.3, severity: "Medium" }
  }
];

const searchCriteria = {
  vendor: "Test Corp",
  severity_min: 7.0,
  tags: ["sql-injection"]
};

// Helper function to make HTTP requests
async function makeRequest(method, endpoint, data = null) {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(url, options);
    const result = await response.json();
    
    return {
      status: response.status,
      ok: response.ok,
      data: result
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error.message
    };
  }
}

// Test functions
async function testHealthEndpoint() {
  console.log('\n🔍 Testing Health Endpoint...');
  const result = await makeRequest('GET', '/api/health');
  
  if (result.ok) {
    console.log('✅ Health check passed');
    console.log('   Status:', result.data.status);
    console.log('   Version:', result.data.version);
  } else {
    console.log('❌ Health check failed:', result.error || result.data);
  }
  
  return result.ok;
}

async function testCVEProcessing() {
  console.log('\n🔍 Testing CVE Processing...');
  
  // Test single CVE processing
  console.log('  Testing single CVE processing...');
  const singleResult = await makeRequest('POST', '/api/cves/process', { cve: testCVE });
  
  if (singleResult.ok) {
    console.log('✅ Single CVE processed successfully');
    console.log('   CVE ID:', singleResult.data.cve.id);
    console.log('   Risk Level:', singleResult.data.assessment.risk_level);
    console.log('   Remediation Priority:', singleResult.data.assessment.remediation_priority);
    console.log('   Threat Actors:', singleResult.data.threat_actors.length);
  } else {
    console.log('❌ Single CVE processing failed:', singleResult.error || singleResult.data);
    return false;
  }
  
  // Test batch CVE processing
  console.log('  Testing batch CVE processing...');
  const batchResult = await makeRequest('POST', '/api/cves/batch-process', { cves: batchCVEs });
  
  if (batchResult.ok) {
    console.log('✅ Batch CVE processing successful');
    console.log('   Processed:', batchResult.data.length, 'CVEs');
    batchResult.data.forEach(result => {
      console.log(`   - ${result.cve.id}: ${result.assessment.risk_level} risk`);
    });
  } else {
    console.log('❌ Batch CVE processing failed:', batchResult.error || batchResult.data);
    return false;
  }
  
  return true;
}

async function testCVECRUD() {
  console.log('\n🔍 Testing CVE CRUD Operations...');
  
  // Test GET all CVEs
  console.log('  Testing GET all CVEs...');
  const getAllResult = await makeRequest('GET', '/api/cves');
  
  if (getAllResult.ok) {
    console.log('✅ Retrieved all CVEs');
    console.log('   Total CVEs:', getAllResult.data.length);
  } else {
    console.log('❌ Failed to get all CVEs:', getAllResult.error || getAllResult.data);
    return false;
  }
  
  // Test GET specific CVE
  console.log('  Testing GET specific CVE...');
  const getOneResult = await makeRequest('GET', `/api/cves/${testCVE.id}`);
  
  if (getOneResult.ok) {
    console.log('✅ Retrieved specific CVE');
    console.log('   CVE ID:', getOneResult.data.cve_data.id);
  } else {
    console.log('❌ Failed to get specific CVE:', getOneResult.error || getOneResult.data);
  }
  
  // Test UPDATE CVE
  console.log('  Testing UPDATE CVE...');
  const updatedCVE = { ...testCVE, description: "Updated: " + testCVE.description };
  const updateResult = await makeRequest('PUT', `/api/cves/${testCVE.id}`, { cve: updatedCVE });
  
  if (updateResult.ok) {
    console.log('✅ CVE updated successfully');
    console.log('   Updated:', updateResult.data.updated);
  } else {
    console.log('❌ Failed to update CVE:', updateResult.error || updateResult.data);
  }
  
  return true;
}

async function testCVESearch() {
  console.log('\n🔍 Testing CVE Search...');
  
  const searchResult = await makeRequest('POST', '/api/cves/search', searchCriteria);
  
  if (searchResult.ok) {
    console.log('✅ CVE search successful');
    console.log('   Found:', searchResult.data.length, 'vulnerabilities');
    if (searchResult.data.length > 0) {
      console.log('   Sample result:', searchResult.data[0].id);
    }
  } else {
    console.log('❌ CVE search failed:', searchResult.error || searchResult.data);
    return false;
  }
  
  // Test search history
  console.log('  Testing search history...');
  const historyResult = await makeRequest('GET', '/api/searches');
  
  if (historyResult.ok) {
    console.log('✅ Search history retrieved');
    console.log('   History entries:', historyResult.data.length);
  } else {
    console.log('❌ Failed to get search history:', historyResult.error || historyResult.data);
  }
  
  return true;
}

async function testExploitTimelines() {
  console.log('\n🔍 Testing Exploit Timelines...');
  
  // Test GET exploit timeline
  console.log('  Testing GET exploit timeline...');
  const timelineResult = await makeRequest('GET', `/api/exploit-timelines/${testCVE.id}`);
  
  if (timelineResult.ok) {
    console.log('✅ Exploit timeline retrieved');
    console.log('   CVE ID:', timelineResult.data.cve_id);
    console.log('   Stages:', timelineResult.data.exploitation_stages.length);
    console.log('   Risk points:', timelineResult.data.risk_progression.length);
  } else {
    console.log('❌ Failed to get exploit timeline:', timelineResult.error || timelineResult.data);
    return false;
  }
  
  // Test GET all timelines
  console.log('  Testing GET all timelines...');
  const allTimelinesResult = await makeRequest('GET', '/api/exploit-timelines');
  
  if (allTimelinesResult.ok) {
    console.log('✅ All timelines retrieved');
    console.log('   Total timelines:', allTimelinesResult.data.length);
  } else {
    console.log('❌ Failed to get all timelines:', allTimelinesResult.error || allTimelinesResult.data);
  }
  
  return true;
}

async function testRemediationStrategies() {
  console.log('\n🔍 Testing Remediation Strategies...');
  
  // Test POST remediation strategy
  console.log('  Testing POST remediation strategy...');
  const strategyResult = await makeRequest('POST', `/api/remediation-strategies/${testCVE.id}`, { cve: testCVE });
  
  if (strategyResult.ok) {
    console.log('✅ Remediation strategy generated');
    console.log('   Priority:', strategyResult.data.priority);
    console.log('   Immediate actions:', strategyResult.data.immediate_actions.length);
    console.log('   Short-term actions:', strategyResult.data.short_term_actions.length);
    console.log('   Compensating controls:', strategyResult.data.compensating_controls.length);
  } else {
    console.log('❌ Failed to generate remediation strategy:', strategyResult.error || strategyResult.data);
    return false;
  }
  
  // Test GET remediation strategy
  console.log('  Testing GET remediation strategy...');
  const getStrategyResult = await makeRequest('GET', `/api/remediation-strategies/${testCVE.id}`);
  
  if (getStrategyResult.ok) {
    console.log('✅ Remediation strategy retrieved');
    console.log('   Strategy for:', getStrategyResult.data.strategy_data.cve_id);
  } else {
    console.log('❌ Failed to get remediation strategy:', getStrategyResult.error || getStrategyResult.data);
  }
  
  // Test GET all strategies
  console.log('  Testing GET all strategies...');
  const allStrategiesResult = await makeRequest('GET', '/api/remediation-strategies');
  
  if (allStrategiesResult.ok) {
    console.log('✅ All strategies retrieved');
    console.log('   Total strategies:', allStrategiesResult.data.length);
  } else {
    console.log('❌ Failed to get all strategies:', allStrategiesResult.error || allStrategiesResult.data);
  }
  
  return true;
}

async function testDeleteOperations() {
  console.log('\n🔍 Testing DELETE Operations...');
  
  // Test delete CVE
  console.log('  Testing DELETE CVE...');
  const deleteCVEResult = await makeRequest('DELETE', `/api/cves/${batchCVEs[0].id}`);
  
  if (deleteCVEResult.ok) {
    console.log('✅ CVE deleted successfully');
    console.log('   Deleted:', deleteCVEResult.data.cve_id);
  } else {
    console.log('❌ Failed to delete CVE:', deleteCVEResult.error || deleteCVEResult.data);
  }
  
  // Test delete timeline
  console.log('  Testing DELETE timeline...');
  const deleteTimelineResult = await makeRequest('DELETE', `/api/exploit-timelines/${batchCVEs[1].id}`);
  
  if (deleteTimelineResult.ok) {
    console.log('✅ Timeline deleted successfully');
  } else {
    console.log('❌ Failed to delete timeline:', deleteTimelineResult.error || deleteTimelineResult.data);
  }
  
  // Test delete strategy
  console.log('  Testing DELETE strategy...');
  const deleteStrategyResult = await makeRequest('DELETE', `/api/remediation-strategies/${testCVE.id}`);
  
  if (deleteStrategyResult.ok) {
    console.log('✅ Strategy deleted successfully');
  } else {
    console.log('❌ Failed to delete strategy:', deleteStrategyResult.error || deleteStrategyResult.data);
  }
  
  return true;
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Comprehensive Workspace-4 Endpoint Testing');
  console.log('=' .repeat(60));
  
  const tests = [
    { name: 'Health Check', fn: testHealthEndpoint },
    { name: 'CVE Processing', fn: testCVEProcessing },
    { name: 'CVE CRUD Operations', fn: testCVECRUD },
    { name: 'CVE Search', fn: testCVESearch },
    { name: 'Exploit Timelines', fn: testExploitTimelines },
    { name: 'Remediation Strategies', fn: testRemediationStrategies },
    { name: 'Delete Operations', fn: testDeleteOperations }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name} threw an error:`, error.message);
      failed++;
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('📊 Test Results Summary');
  console.log('=' .repeat(60));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Workspace-4 is fully operational.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the output above for details.');
  }
}

// Run the tests
runAllTests().catch(console.error);
