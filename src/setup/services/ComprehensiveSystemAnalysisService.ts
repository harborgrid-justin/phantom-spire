import { SystemRequirementsService } from './SystemRequirementsService.js';
import { InstallationEvaluationService } from './InstallationEvaluationService.js';

export interface ComprehensiveSystemAnalysis {
  timestamp: Date;
  systemRequirements: any;
  installationEvaluation: any;
  overallStatus: 'pass' | 'warning' | 'fail';
  criticalIssues: string[];
  recommendations: string[];
  summary: {
    systemScore: number;
    installationScore: number;
    combinedScore: number;
    readinessLevel: 'production-ready' | 'needs-attention' | 'not-ready';
  };
}

/**
 * Comprehensive System Analysis Service
 *
 * This service combines system requirements checking with installation process evaluation
 * to provide a complete picture of the deployment readiness.
 */
export class ComprehensiveSystemAnalysisService {
  private systemRequirementsService: SystemRequirementsService;
  private installationEvaluationService: InstallationEvaluationService;

  constructor() {
    this.systemRequirementsService = new SystemRequirementsService();
    this.installationEvaluationService = new InstallationEvaluationService();
  }

  public async performComprehensiveAnalysis(): Promise<ComprehensiveSystemAnalysis> {
    console.log('🔍 Performing comprehensive system analysis...');

    // Run both analyses in parallel
    const [systemRequirements, installationEvaluation] = await Promise.all([
      this.systemRequirementsService.performSystemCheck(),
      this.installationEvaluationService.evaluateInstallationScripts(),
    ]);

    const systemScore = systemRequirements.passed ? 100 : 50;
    const installationScore = installationEvaluation.overallScore;
    const combinedScore = Math.round((systemScore + installationScore) / 2);

    // Determine overall status
    let overallStatus: 'pass' | 'warning' | 'fail' = 'pass';
    if (!systemRequirements.passed || installationScore < 50) {
      overallStatus = 'fail';
    } else if (
      installationScore < 80 ||
      systemRequirements.warnings.length > 0
    ) {
      overallStatus = 'warning';
    }

    // Collect critical issues
    const criticalIssues: string[] = [];

    // System requirements critical issues
    const systemCriticalFailures = systemRequirements.requirements.filter(
      (req: any) => req.critical && !req.passed
    );
    systemCriticalFailures.forEach((req: any) => {
      criticalIssues.push(`System: ${req.message}`);
    });

    // Installation critical issues
    const installationCriticalIssues =
      installationEvaluation.scriptEvaluations.reduce(
        (total: number, script: any) => total + script.criticalIssues,
        0
      );
    if (installationCriticalIssues > 0) {
      criticalIssues.push(
        `Installation: ${installationCriticalIssues} critical security issues found`
      );
    }

    // Generate combined recommendations
    const recommendations: string[] = [];

    // Add system recommendations
    recommendations.push(...systemRequirements.recommendations);

    // Add installation recommendations (top 3)
    recommendations.push(
      ...installationEvaluation.globalRecommendations.slice(0, 3)
    );

    // Add specific readiness recommendations
    if (overallStatus === 'fail') {
      recommendations.unshift(
        '🚨 System is NOT ready for production deployment'
      );
    } else if (overallStatus === 'warning') {
      recommendations.unshift(
        '⚠️ System needs attention before production deployment'
      );
    } else {
      recommendations.unshift(
        '✅ System appears ready for production deployment'
      );
    }

    // Determine readiness level
    let readinessLevel: 'production-ready' | 'needs-attention' | 'not-ready' =
      'production-ready';
    if (criticalIssues.length > 0 || combinedScore < 50) {
      readinessLevel = 'not-ready';
    } else if (combinedScore < 80 || overallStatus === 'warning') {
      readinessLevel = 'needs-attention';
    }

    return {
      timestamp: new Date(),
      systemRequirements,
      installationEvaluation,
      overallStatus,
      criticalIssues,
      recommendations,
      summary: {
        systemScore,
        installationScore,
        combinedScore,
        readinessLevel,
      },
    };
  }

  public async generateComprehensiveReport(): Promise<string> {
    const analysis = await this.performComprehensiveAnalysis();

    let report =
      '# Phantom Spire CTI Platform - Comprehensive System Analysis\n\n';
    report += `**Generated:** ${analysis.timestamp.toISOString()}\n`;
    report += `**Overall Status:** ${this.getStatusEmoji(analysis.overallStatus)} ${analysis.overallStatus.toUpperCase()}\n`;
    report += `**Readiness Level:** ${this.getReadinessEmoji(analysis.summary.readinessLevel)} ${analysis.summary.readinessLevel.replace('-', ' ').toUpperCase()}\n\n`;

    // Executive Dashboard
    report += '## Executive Dashboard\n\n';
    report += `| Metric | Score | Status |\n`;
    report += `|--------|-------|--------|\n`;
    report += `| System Requirements | ${analysis.summary.systemScore}/100 | ${analysis.systemRequirements.passed ? '✅ Pass' : '❌ Fail'} |\n`;
    report += `| Installation Security | ${analysis.summary.installationScore}/100 | ${this.getScoreStatus(analysis.summary.installationScore)} |\n`;
    report += `| **Combined Score** | **${analysis.summary.combinedScore}/100** | **${this.getScoreStatus(analysis.summary.combinedScore)}** |\n\n`;

    // Critical Issues Alert
    if (analysis.criticalIssues.length > 0) {
      report += '## 🚨 Critical Issues Requiring Immediate Attention\n\n';
      analysis.criticalIssues.forEach((issue, index) => {
        report += `${index + 1}. **${issue}**\n`;
      });
      report += '\n';
    }

    // Top Recommendations
    report += '## 💡 Priority Recommendations\n\n';
    analysis.recommendations.slice(0, 5).forEach((rec, index) => {
      report += `${index + 1}. ${rec}\n`;
    });
    report += '\n';

    // System Requirements Summary
    report += '## 🖥️ System Requirements Analysis\n\n';
    const passedReqs = analysis.systemRequirements.requirements.filter(
      (req: any) => req.passed
    ).length;
    const totalReqs = analysis.systemRequirements.requirements.length;
    report += `**Status:** ${passedReqs}/${totalReqs} requirements met\n\n`;

    if (analysis.systemRequirements.warnings.length > 0) {
      report += '**Warnings:**\n';
      analysis.systemRequirements.warnings.forEach((warning: string) => {
        report += `- ⚠️ ${warning}\n`;
      });
      report += '\n';
    }

    // Installation Security Summary
    report += '## 🔒 Installation Security Analysis\n\n';
    const totalCritical =
      analysis.installationEvaluation.scriptEvaluations.reduce(
        (sum: number, script: any) => sum + script.criticalIssues,
        0
      );
    const totalHigh = analysis.installationEvaluation.scriptEvaluations.reduce(
      (sum: number, script: any) => sum + script.highIssues,
      0
    );

    report += `**Scripts Evaluated:** ${analysis.installationEvaluation.scriptsEvaluated}\n`;
    report += `**Security Issues:** ${totalCritical} critical, ${totalHigh} high priority\n\n`;

    // Compliance Status
    report += '**Compliance Status:**\n';
    const compliance = analysis.installationEvaluation.complianceChecks;
    Object.entries(compliance).forEach(([check, passed]: [string, any]) => {
      const checkName = check
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .replace('Has ', '');
      const icon = passed ? '✅' : '❌';
      report += `- ${icon} ${checkName}\n`;
    });
    report += '\n';

    // Deployment Readiness Assessment
    report += '## 🚀 Deployment Readiness Assessment\n\n';

    switch (analysis.summary.readinessLevel) {
      case 'production-ready':
        report += '✅ **READY FOR PRODUCTION**\n\n';
        report +=
          'The system meets all critical requirements and security standards. ';
        report +=
          'Minor optimizations may be beneficial but are not blocking for deployment.\n\n';
        break;
      case 'needs-attention':
        report += '⚠️ **NEEDS ATTENTION BEFORE PRODUCTION**\n\n';
        report +=
          'The system has some issues that should be addressed before production deployment. ';
        report +=
          'While not critical, these issues could impact security or reliability.\n\n';
        break;
      case 'not-ready':
        report += '❌ **NOT READY FOR PRODUCTION**\n\n';
        report +=
          'The system has critical issues that must be resolved before deployment. ';
        report +=
          'Deploying in the current state could pose security risks or cause system failures.\n\n';
        break;
    }

    // Next Steps
    report += '## 📋 Recommended Next Steps\n\n';

    if (analysis.summary.readinessLevel === 'not-ready') {
      report +=
        '1. **Immediate Action Required:** Address all critical security vulnerabilities\n';
      report +=
        '2. **Review Installation Scripts:** Fix unsafe patterns identified in evaluation\n';
      report +=
        '3. **System Requirements:** Ensure all critical requirements are met\n';
      report += '4. **Re-evaluate:** Run this analysis again after fixes\n';
    } else if (analysis.summary.readinessLevel === 'needs-attention') {
      report +=
        '1. **Address High-Priority Issues:** Review and fix security concerns\n';
      report +=
        '2. **Improve Installation Scripts:** Implement best practices recommendations\n';
      report +=
        '3. **Monitor System Requirements:** Ensure ongoing compliance\n';
      report +=
        '4. **Plan Deployment:** Prepare for production with monitoring\n';
    } else {
      report +=
        '1. **Proceed with Deployment:** System is ready for production\n';
      report +=
        '2. **Implement Monitoring:** Set up ongoing system monitoring\n';
      report +=
        '3. **Regular Audits:** Schedule periodic security and system reviews\n';
      report +=
        '4. **Documentation:** Ensure deployment procedures are documented\n';
    }

    report += '\n---\n\n';
    report += `**Analysis completed at:** ${analysis.timestamp.toISOString()}\n`;
    report += `**Generated by:** Phantom Spire Comprehensive System Analysis Service\n`;

    return report;
  }

  private getStatusEmoji(status: string): string {
    switch (status) {
      case 'pass':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'fail':
        return '❌';
      default:
        return '❓';
    }
  }

  private getReadinessEmoji(readiness: string): string {
    switch (readiness) {
      case 'production-ready':
        return '🚀';
      case 'needs-attention':
        return '⚠️';
      case 'not-ready':
        return '🚨';
      default:
        return '❓';
    }
  }

  private getScoreStatus(score: number): string {
    if (score >= 80) return '✅ Excellent';
    if (score >= 60) return '⚠️ Needs Improvement';
    return '❌ Poor';
  }
}
