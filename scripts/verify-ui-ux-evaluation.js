/**
 * Simple UI/UX Evaluation Verification Script
 * Quick verification that the UI/UX evaluation system works
 */

import { UIUXEvaluationService } from '../src/services/ui-ux-evaluation/core/UIUXEvaluationService.js';

async function quickVerification() {
  console.log('🎯 UI/UX Evaluation System - Quick Verification\n');
  
  try {
    // Test 1: Service initialization
    console.log('1. Testing service initialization...');
    const service = new UIUXEvaluationService();
    const config = await service.getConfig();
    console.log('   ✅ Service initialized successfully');
    console.log(`   📊 Default interval: ${config.evaluationInterval}ms`);
    console.log(`   📋 Categories: ${config.categories.length}`);
    
    // Test 2: Page evaluation
    console.log('\n2. Testing page evaluation...');
    const pageId = 'enterprise-realtime-dashboard';
    const evaluation = await service.evaluatePage(pageId);
    console.log('   ✅ Page evaluation completed');
    console.log(`   📄 Page: ${evaluation.pageName}`);
    console.log(`   📈 Score: ${evaluation.overallScore}/100`);
    console.log(`   🐛 Issues: ${evaluation.issues.length}`);
    console.log(`   📊 Metrics: ${evaluation.metrics.length}`);
    console.log(`   ♿ WCAG: ${evaluation.compliance.wcag}`);
    console.log(`   🏢 Enterprise: ${evaluation.compliance.enterprise ? '✅' : '❌'}`);
    
    // Test 3: Report generation
    console.log('\n3. Testing report generation...');
    const report = await service.generateReport([pageId]);
    console.log('   ✅ Report generated successfully');
    console.log(`   📋 Title: ${report.title}`);
    console.log(`   📊 Overall Score: ${report.summary.overallScore}/100`);
    console.log(`   📄 Pages: ${report.summary.totalPages}`);
    
    // Test 4: Export functionality
    console.log('\n4. Testing export functionality...');
    const jsonExport = await service.exportReport(report.id, 'json');
    const csvExport = await service.exportReport(report.id, 'csv');
    console.log('   ✅ Export completed successfully');
    console.log(`   📄 JSON size: ${jsonExport.length} chars`);
    console.log(`   📊 CSV size: ${csvExport.length} chars`);
    
    console.log('\n🎉 All verification tests passed!');
    console.log('✅ UI/UX Evaluation System is fully operational');
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  quickVerification();
}

export { quickVerification };