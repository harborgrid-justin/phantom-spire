#!/usr/bin/env node

/**
 * Comprehensive System Analysis CLI
 * 
 * This tool combines system requirements checking with installation script evaluation
 * to provide a complete deployment readiness assessment.
 */

import { ComprehensiveSystemAnalysisService } from '../src/setup/services/ComprehensiveSystemAnalysisService.js';
import { promises as fs } from 'fs';
import path from 'path';

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bright: '\x1b[1m'
};

function colorize(text: string, color: keyof typeof COLORS): string {
  return `${COLORS[color]}${text}${COLORS.reset}`;
}

function printBanner(): void {
  console.log(colorize('\n╔═══════════════════════════════════════════════════════════════╗', 'cyan'));
  console.log(colorize('║                                                               ║', 'cyan'));
  console.log(colorize('║        PHANTOM SPIRE COMPREHENSIVE SYSTEM ANALYSIS           ║', 'cyan'));
  console.log(colorize('║                                                               ║', 'cyan'));
  console.log(colorize('║     Complete System Requirements & Installation Analysis     ║', 'cyan'));
  console.log(colorize('║                                                               ║', 'cyan'));
  console.log(colorize('╚═══════════════════════════════════════════════════════════════╝', 'cyan'));
  console.log();
}

function printUsage(): void {
  console.log(colorize('Usage:', 'bright'));
  console.log('  npm run analyze:system [options]');
  console.log('  node scripts/analyze-system.js [options]');
  console.log();
  console.log(colorize('Options:', 'bright'));
  console.log('  --report, -r FILE  Save comprehensive report to file');
  console.log('  --json, -j         Output results as JSON');
  console.log('  --help, -h         Show this help message');
  console.log();
  console.log(colorize('Examples:', 'bright'));
  console.log('  npm run analyze:system');
  console.log('  npm run analyze:system --report system-analysis.md');
  console.log('  npm run analyze:system --json > analysis.json');
  console.log();
}

function printAnalysisSummary(analysis: any): void {
  console.log(colorize('📊 COMPREHENSIVE SYSTEM ANALYSIS', 'bright'));
  console.log('━'.repeat(60));
  
  // Overall Status
  const statusColor = analysis.overallStatus === 'pass' ? 'green' : 
                     analysis.overallStatus === 'warning' ? 'yellow' : 'red';
  const statusIcon = analysis.overallStatus === 'pass' ? '✅' : 
                    analysis.overallStatus === 'warning' ? '⚠️' : '❌';
  
  console.log(`${statusIcon} ${colorize('Overall Status:', 'bright')} ${colorize(analysis.overallStatus.toUpperCase(), statusColor)}`);
  
  const readinessColor = analysis.summary.readinessLevel === 'production-ready' ? 'green' : 
                        analysis.summary.readinessLevel === 'needs-attention' ? 'yellow' : 'red';
  const readinessIcon = analysis.summary.readinessLevel === 'production-ready' ? '🚀' : 
                       analysis.summary.readinessLevel === 'needs-attention' ? '⚠️' : '🚨';
  
  console.log(`${readinessIcon} ${colorize('Readiness Level:', 'bright')} ${colorize(analysis.summary.readinessLevel.replace('-', ' ').toUpperCase(), readinessColor)}`);
  
  // Score Dashboard
  console.log();
  console.log(colorize('📋 SCORE DASHBOARD', 'bright'));
  console.log(`${colorize('System Requirements:', 'bright')} ${getScoreDisplay(analysis.summary.systemScore)}`);
  console.log(`${colorize('Installation Security:', 'bright')} ${getScoreDisplay(analysis.summary.installationScore)}`);
  console.log(`${colorize('Combined Score:', 'bright')} ${getScoreDisplay(analysis.summary.combinedScore)}`);
  
  // Critical Issues
  if (analysis.criticalIssues.length > 0) {
    console.log();
    console.log(colorize('🚨 CRITICAL ISSUES', 'red'));
    analysis.criticalIssues.forEach((issue: string, index: number) => {
      console.log(`${index + 1}. ${issue}`);
    });
  }
  
  // Top Recommendations
  console.log();
  console.log(colorize('💡 TOP RECOMMENDATIONS', 'bright'));
  analysis.recommendations.slice(0, 3).forEach((rec: string, index: number) => {
    console.log(`${index + 1}. ${rec}`);
  });
  
  console.log('━'.repeat(60));
}

function getScoreDisplay(score: number): string {
  let color: keyof typeof COLORS = 'red';
  let status = 'Poor';
  
  if (score >= 80) {
    color = 'green';
    status = 'Excellent';
  } else if (score >= 60) {
    color = 'yellow';
    status = 'Needs Improvement';
  }
  
  return `${colorize(score + '/100', color)} (${status})`;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  
  // Parse command line arguments
  const options = {
    help: args.includes('--help') || args.includes('-h'),
    json: args.includes('--json') || args.includes('-j'),
    report: ''
  };
  
  // Parse report file
  const reportIndex = args.findIndex(arg => arg === '--report' || arg === '-r');
  if (reportIndex !== -1 && args[reportIndex + 1]) {
    options.report = args[reportIndex + 1];
  }
  
  if (options.help) {
    printBanner();
    printUsage();
    return;
  }
  
  printBanner();
  
  console.log(colorize('🔍 Starting comprehensive system analysis...', 'blue'));
  console.log();
  
  try {
    const analysisService = new ComprehensiveSystemAnalysisService();
    const analysis = await analysisService.performComprehensiveAnalysis();
    
    if (options.json) {
      const jsonOutput = JSON.stringify(analysis, null, 2);
      console.log(jsonOutput);
      return;
    }
    
    // Console output
    printAnalysisSummary(analysis);
    
    // Save report if requested
    if (options.report) {
      const report = await analysisService.generateComprehensiveReport();
      await fs.writeFile(options.report, report, 'utf-8');
      console.log();
      console.log(colorize(`✅ Comprehensive report saved to: ${options.report}`, 'green'));
    }
    
    console.log();
    
    // Final message based on readiness level
    switch (analysis.summary.readinessLevel) {
      case 'production-ready':
        console.log(colorize('🎉 System is ready for production deployment!', 'green'));
        break;
      case 'needs-attention':
        console.log(colorize('⚠️  System needs attention before production deployment.', 'yellow'));
        break;
      case 'not-ready':
        console.log(colorize('🚨 System is NOT ready for production deployment.', 'red'));
        console.log(colorize('   Address critical issues before proceeding.', 'red'));
        break;
    }
    
    // Exit with appropriate code
    const exitCode = analysis.summary.readinessLevel === 'production-ready' ? 0 : 
                    analysis.summary.readinessLevel === 'needs-attention' ? 1 : 2;
    
    process.exit(exitCode);
    
  } catch (error) {
    console.error(colorize('❌ Error during analysis:', 'red'));
    console.error((error as Error).message);
    console.error();
    console.error('Stack trace:');
    console.error((error as Error).stack);
    process.exit(3);
  }
}

// Run the CLI if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}