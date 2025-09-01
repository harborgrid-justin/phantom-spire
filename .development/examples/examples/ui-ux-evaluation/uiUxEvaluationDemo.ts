/**
 * UI/UX Evaluation Demo Script
 * Demonstrates the Fortune 100-grade UI/UX evaluation system
 */

import { UIUXEvaluationService } from '../../services/ui-ux-evaluation/core/UIUXEvaluationService';
import {
  globalEvaluationManager,
  quickEvaluate,
  addUIUXEvaluation
} from '../../services/ui-ux-evaluation';
import {
  EvaluationCategory,
  EvaluationSeverity
} from '../../services/ui-ux-evaluation/interfaces/IUIUXEvaluation';

// Console styling for better output
const styles = {
  title: '\x1b[1m\x1b[35m%s\x1b[0m',
  success: '\x1b[1m\x1b[32m%s\x1b[0m',
  info: '\x1b[1m\x1b[36m%s\x1b[0m',
  warning: '\x1b[1m\x1b[33m%s\x1b[0m',
  error: '\x1b[1m\x1b[31m%s\x1b[0m',
  reset: '\x1b[0m'
};

async function runUIUXEvaluationDemo() {
  console.log(styles.title, '🎯 Fortune 100 UI/UX Evaluation System Demo');
  console.log('=' * 60);

  try {
    // 1. Initialize the evaluation service
    console.log(styles.info, '\n📊 Step 1: Initializing Evaluation Service...');
    const evaluationService = new UIUXEvaluationService();
    
    // Configure the service
    await evaluationService.configure({
      enabled: true,
      autoEvaluate: true,
      evaluationInterval: 30000,
      accessibility: {
        enabled: true,
        wcagLevel: 'AA',
        checkColorContrast: true,
        checkKeyboardNav: true,
        checkScreenReader: true
      },
      performance: {
        enabled: true,
        targetLoadTime: 2000,
        targetInteractionTime: 100,
        monitorFrameRate: true
      }
    });
    
    console.log(styles.success, '✅ Evaluation service initialized successfully');

    // 2. Evaluate each GUI page
    console.log(styles.info, '\n🔍 Step 2: Evaluating GUI Pages...');
    
    const pages = [
      'enterprise-realtime-dashboard',
      'enterprise-workflow-designer',
      'enterprise-notification-center'
    ];

    const evaluationResults = [];
    
    for (const pageId of pages) {
      console.log(`\n  Evaluating: ${pageId}...`);
      
      const evaluation = await evaluationService.evaluatePage(pageId);
      evaluationResults.push(evaluation);
      
      console.log(`    📈 Score: ${evaluation.overallScore}/100`);
      console.log(`    🐛 Issues: ${evaluation.issues.length} (${evaluation.issues.filter(i => i.severity === EvaluationSeverity.CRITICAL).length} critical)`);
      console.log(`    ♿ WCAG: ${evaluation.compliance.wcag}`);
      console.log(`    🏢 Enterprise: ${evaluation.compliance.enterprise ? '✅' : '❌'}`);
      console.log(`    📊 Metrics: ${evaluation.metrics.length}`);
    }

    // 3. Display detailed results
    console.log(styles.info, '\n📋 Step 3: Detailed Evaluation Results');
    
    for (const evaluation of evaluationResults) {
      console.log(`\n${'-'.repeat(40)}`);
      console.log(styles.title, `📄 ${evaluation.pageName}`);
      console.log(`   Component: ${evaluation.component}`);
      console.log(`   Evaluation Duration: ${evaluation.duration}ms`);
      console.log(`   Overall Score: ${evaluation.overallScore}/100`);
      
      console.log('\n   Category Scores:');
      Object.entries(evaluation.categoryScores).forEach(([category, score]) => {
        const emoji = score >= 90 ? '🟢' : score >= 75 ? '🟡' : score >= 50 ? '🟠' : '🔴';
        console.log(`     ${emoji} ${category.replace('_', ' ').toUpperCase()}: ${Math.round(score)}/100`);
      });
      
      if (evaluation.issues.length > 0) {
        console.log('\n   🚨 Issues Found:');
        evaluation.issues.forEach((issue, index) => {
          const severityEmoji = {
            critical: '🔴',
            high: '🟠',
            medium: '🟡',
            low: '🟢',
            info: '🔵'
          }[issue.severity];
          console.log(`     ${index + 1}. ${severityEmoji} [${issue.severity.toUpperCase()}] ${issue.title}`);
          console.log(`        💡 ${issue.recommendation}`);
        });
      } else {
        console.log(styles.success, '\n   ✅ No issues found - Excellent!');
      }
      
      if (evaluation.recommendations.length > 0) {
        console.log('\n   💡 Recommendations:');
        evaluation.recommendations.forEach((rec, index) => {
          console.log(`     ${index + 1}. ${rec}`);
        });
      }
    }

    // 4. Generate comprehensive report
    console.log(styles.info, '\n📊 Step 4: Generating Comprehensive Report...');
    
    const report = await evaluationService.generateReport(pages);
    
    console.log(`\n📋 Report Generated: ${report.title}`);
    console.log(`   📅 Timestamp: ${report.timestamp.toLocaleString()}`);
    console.log(`   📄 Pages Evaluated: ${report.summary.totalPages}`);
    console.log(`   📈 Overall Score: ${report.summary.overallScore}/100`);
    console.log(`   🚨 Total Issues: ${report.summary.criticalIssues + report.summary.highIssues + report.summary.mediumIssues + report.summary.lowIssues}`);
    console.log(`      🔴 Critical: ${report.summary.criticalIssues}`);
    console.log(`      🟠 High: ${report.summary.highIssues}`);
    console.log(`      🟡 Medium: ${report.summary.mediumIssues}`);
    console.log(`      🟢 Low: ${report.summary.lowIssues}`);

    // 5. Export report
    console.log(styles.info, '\n📤 Step 5: Exporting Report...');
    
    const jsonExport = await evaluationService.exportReport(report.id, 'json');
    const csvExport = await evaluationService.exportReport(report.id, 'csv');
    
    console.log(`   📄 JSON Export Size: ${(jsonExport as string).length} characters`);
    console.log(`   📊 CSV Export Preview:`);
    const csvLines = (csvExport as string).split('\n').slice(0, 3);
    csvLines.forEach(line => console.log(`      ${line}`));

    // Summary
    console.log(styles.title, '\n🎉 Demo Summary');
    console.log('=' * 40);
    console.log(styles.success, '✅ UI/UX Evaluation System fully operational');
    console.log(`📄 Pages evaluated: ${pages.length}`);
    console.log(`📊 Reports generated: 1`);
    console.log(`🔍 Features demonstrated:`);
    console.log(`   • Page evaluation with metrics and issues`);
    console.log(`   • Category-based scoring`);
    console.log(`   • WCAG compliance checking`);
    console.log(`   • Enterprise standards validation`);
    console.log(`   • Report generation and export`);
    
    console.log(styles.info, '\n🚀 The UI/UX evaluation system is ready for production use!');

  } catch (error) {
    console.error(styles.error, '❌ Demo failed:', error);
    throw error;
  }
}

// Run the demo if this file is executed directly
if (require.main === module) {
  runUIUXEvaluationDemo()
    .then(() => {
      console.log(styles.success, '\n✅ Demo completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error(styles.error, '\n❌ Demo failed:', error);
      process.exit(1);
    });
}

export { runUIUXEvaluationDemo };