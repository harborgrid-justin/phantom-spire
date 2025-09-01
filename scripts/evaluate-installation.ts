#!/usr/bin/env node

/**
 * Installation Evaluation CLI
 * 
 * This command-line interface allows users to evaluate installation scripts
 * for security, best practices, and potential issues.
 */

import { InstallationEvaluationService } from '../src/setup/services/InstallationEvaluationService.js';
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
  console.log(colorize('║           PHANTOM SPIRE INSTALLATION EVALUATOR               ║', 'cyan'));
  console.log(colorize('║                                                               ║', 'cyan'));
  console.log(colorize('║           Comprehensive Installation Script Analysis         ║', 'cyan'));
  console.log(colorize('║                                                               ║', 'cyan'));
  console.log(colorize('╚═══════════════════════════════════════════════════════════════╝', 'cyan'));
  console.log();
}

function printUsage(): void {
  console.log(colorize('Usage:', 'bright'));
  console.log('  npm run evaluate:installation [options]');
  console.log('  node scripts/evaluate-installation.js [options]');
  console.log();
  console.log(colorize('Options:', 'bright'));
  console.log('  --detailed, -d     Generate detailed report');
  console.log('  --output, -o FILE  Save report to file');
  console.log('  --format FORMAT    Output format: console|markdown|json (default: console)');
  console.log('  --help, -h         Show this help message');
  console.log();
  console.log(colorize('Examples:', 'bright'));
  console.log('  npm run evaluate:installation --detailed');
  console.log('  npm run evaluate:installation --output install-report.md --format markdown');
  console.log('  npm run evaluate:installation --format json > evaluation.json');
  console.log();
}

function printSummary(evaluation: any): void {
  console.log(colorize('📋 EVALUATION SUMMARY', 'bright'));
  console.log('━'.repeat(50));
  
  // Overall score with color coding
  const scoreColor = evaluation.overallScore >= 80 ? 'green' : 
                     evaluation.overallScore >= 60 ? 'yellow' : 'red';
  console.log(`${colorize('Overall Score:', 'bright')} ${colorize(evaluation.overallScore + '/100', scoreColor)}`);
  console.log(`${colorize('Scripts Evaluated:', 'bright')} ${evaluation.scriptsEvaluated}`);
  
  // Issue counts
  const totalCritical = evaluation.scriptEvaluations.reduce((sum: number, script: any) => sum + script.criticalIssues, 0);
  const totalHigh = evaluation.scriptEvaluations.reduce((sum: number, script: any) => sum + script.highIssues, 0);
  const totalMedium = evaluation.scriptEvaluations.reduce((sum: number, script: any) => sum + script.mediumIssues, 0);
  const totalLow = evaluation.scriptEvaluations.reduce((sum: number, script: any) => sum + script.lowIssues, 0);
  
  console.log();
  console.log(colorize('📊 ISSUE BREAKDOWN', 'bright'));
  if (totalCritical > 0) console.log(`${colorize('🚨 Critical:', 'red')} ${totalCritical}`);
  if (totalHigh > 0) console.log(`${colorize('⚠️  High:', 'yellow')} ${totalHigh}`);
  if (totalMedium > 0) console.log(`${colorize('🔍 Medium:', 'blue')} ${totalMedium}`);
  if (totalLow > 0) console.log(`${colorize('ℹ️  Low:', 'cyan')} ${totalLow}`);
  
  if (totalCritical === 0 && totalHigh === 0 && totalMedium === 0 && totalLow === 0) {
    console.log(colorize('✅ No issues found!', 'green'));
  }
  
  // Compliance status
  console.log();
  console.log(colorize('🛡️  COMPLIANCE CHECKS', 'bright'));
  const checks = evaluation.complianceChecks;
  Object.entries(checks).forEach(([check, passed]: [string, any]) => {
    const icon = passed ? '✅' : '❌';
    const color = passed ? 'green' : 'red';
    const checkName = check.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    console.log(`${icon} ${colorize(checkName, color)}`);
  });
  
  // Global recommendations
  if (evaluation.globalRecommendations.length > 0) {
    console.log();
    console.log(colorize('💡 TOP RECOMMENDATIONS', 'bright'));
    evaluation.globalRecommendations.slice(0, 3).forEach((rec: string, index: number) => {
      console.log(`${index + 1}. ${rec}`);
    });
  }
  
  console.log('━'.repeat(50));
}

function printScriptSummary(scriptEval: any): void {
  console.log();
  console.log(colorize(`📄 ${scriptEval.fileName}`, 'bright'));
  console.log('-'.repeat(30));
  
  const scoreColor = scriptEval.overallScore >= 80 ? 'green' : 
                     scriptEval.overallScore >= 60 ? 'yellow' : 'red';
  console.log(`Score: ${colorize(scriptEval.overallScore + '/100', scoreColor)}`);
  console.log(`Lines: ${scriptEval.evaluatedLines}/${scriptEval.totalLines}`);
  
  if (scriptEval.criticalIssues > 0 || scriptEval.highIssues > 0) {
    console.log();
    console.log(colorize('Critical Issues:', 'red'));
    const criticalIssues = scriptEval.lineEvaluations.filter((le: any) => 
      !le.passed && le.severity === 'critical'
    );
    
    criticalIssues.forEach((issue: any) => {
      console.log(`  Line ${issue.lineNumber}: ${issue.issue}`);
    });
    
    if (scriptEval.highIssues > 0) {
      console.log(colorize('\nHigh Priority Issues:', 'yellow'));
      const highIssues = scriptEval.lineEvaluations.filter((le: any) => 
        !le.passed && le.severity === 'high'
      );
      
      highIssues.slice(0, 3).forEach((issue: any) => {
        console.log(`  Line ${issue.lineNumber}: ${issue.issue}`);
      });
      
      if (highIssues.length > 3) {
        console.log(`  ... and ${highIssues.length - 3} more high priority issues`);
      }
    }
  }
  
  if (scriptEval.summary.strengths.length > 0) {
    console.log();
    console.log(colorize('Strengths:', 'green'));
    scriptEval.summary.strengths.slice(0, 2).forEach((strength: string) => {
      console.log(`  ✅ ${strength}`);
    });
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  
  // Parse command line arguments
  const options = {
    detailed: args.includes('--detailed') || args.includes('-d'),
    help: args.includes('--help') || args.includes('-h'),
    output: '',
    format: 'console'
  };
  
  // Parse output file
  const outputIndex = args.findIndex(arg => arg === '--output' || arg === '-o');
  if (outputIndex !== -1 && args[outputIndex + 1]) {
    options.output = args[outputIndex + 1];
  }
  
  // Parse format
  const formatIndex = args.findIndex(arg => arg === '--format');
  if (formatIndex !== -1 && args[formatIndex + 1]) {
    options.format = args[formatIndex + 1];
  }
  
  if (options.help) {
    printBanner();
    printUsage();
    return;
  }
  
  printBanner();
  
  console.log(colorize('🔍 Starting installation script evaluation...', 'blue'));
  console.log();
  
  try {
    const evaluationService = new InstallationEvaluationService();
    const evaluation = await evaluationService.evaluateInstallationScripts();
    
    if (options.format === 'json') {
      const jsonOutput = JSON.stringify(evaluation, null, 2);
      if (options.output) {
        await fs.writeFile(options.output, jsonOutput, 'utf-8');
        console.log(colorize(`✅ JSON report saved to: ${options.output}`, 'green'));
      } else {
        console.log(jsonOutput);
      }
      return;
    }
    
    if (options.format === 'markdown' || (options.output && options.output.endsWith('.md'))) {
      const markdownReport = await evaluationService.generateDetailedReport();
      if (options.output) {
        await fs.writeFile(options.output, markdownReport, 'utf-8');
        console.log(colorize(`✅ Detailed report saved to: ${options.output}`, 'green'));
      } else {
        console.log(markdownReport);
      }
      return;
    }
    
    // Console output
    printSummary(evaluation);
    
    if (options.detailed) {
      console.log();
      console.log(colorize('📋 DETAILED SCRIPT ANALYSIS', 'bright'));
      evaluation.scriptEvaluations.forEach(printScriptSummary);
    }
    
    // Save to file if requested
    if (options.output) {
      const report = options.detailed 
        ? await evaluationService.generateDetailedReport()
        : JSON.stringify(evaluation, null, 2);
      await fs.writeFile(options.output, report, 'utf-8');
      console.log();
      console.log(colorize(`✅ Report saved to: ${options.output}`, 'green'));
    }
    
    console.log();
    console.log(colorize('✨ Evaluation complete!', 'green'));
    
    // Exit with appropriate code
    const exitCode = evaluation.overallScore >= 70 ? 0 : 1;
    if (exitCode !== 0) {
      console.log();
      console.log(colorize('⚠️  Evaluation found significant issues. Consider addressing them before deployment.', 'yellow'));
    }
    
    process.exit(exitCode);
    
  } catch (error) {
    console.error(colorize('❌ Error during evaluation:', 'red'));
    console.error((error as Error).message);
    console.error();
    console.error('Stack trace:');
    console.error((error as Error).stack);
    process.exit(1);
  }
}

// Run the CLI if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}