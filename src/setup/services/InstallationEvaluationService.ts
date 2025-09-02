import { promises as fs } from 'fs';
import path from 'path';

export interface LineEvaluation {
  lineNumber: number;
  content: string;
  category:
    | 'security'
    | 'best-practice'
    | 'error-handling'
    | 'performance'
    | 'maintainability'
    | 'correctness';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  passed: boolean;
  issue?: string;
  suggestion?: string;
  reasoning?: string;
}

export interface ScriptEvaluation {
  filePath: string;
  fileName: string;
  totalLines: number;
  evaluatedLines: number;
  overallScore: number; // 0-100
  criticalIssues: number;
  highIssues: number;
  mediumIssues: number;
  lowIssues: number;
  lineEvaluations: LineEvaluation[];
  summary: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  };
}

export interface InstallationEvaluationResult {
  timestamp: Date;
  scriptsEvaluated: number;
  overallScore: number; // 0-100
  scriptEvaluations: ScriptEvaluation[];
  globalRecommendations: string[];
  complianceChecks: {
    hasErrorHandling: boolean;
    hasInputValidation: boolean;
    hasSecurityMeasures: boolean;
    hasLogging: boolean;
    hasCleanup: boolean;
  };
}

export class InstallationEvaluationService {
  private readonly securityPatterns = {
    // Potentially unsafe patterns
    unsafeDownloads: /curl.*\|.*sh|wget.*\|.*sh|bash.*<\(curl/,
    httpDownloads: /http:\/\/[^\/]/,
    sudoWithoutValidation: /sudo\s+[^-]/,
    passwordInPlainText: /password=|pwd=|passwd=/,
    worldWritableFiles: /chmod.*777|chmod.*666/,
    unsanitizedInput: /read\s+-p.*\$\{.*\}|echo.*\$\{.*\}/,

    // Good security patterns
    httpsDownloads: /https:\/\//,
    inputValidation: /\[\[.*=~|\[\[.*-n|\[\[.*-z/,
    errorHandling: /set -e|set -u|trap/,
    userValidation: /\[\[.*EUID.*-ne.*0/,
  };

  private readonly bestPracticePatterns = {
    // Good practices
    shebang: /^#!/,
    setStrict: /set -[euo]/,
    logging: /log_info|log_error|log_success|log_warning/,
    functionDefinition: /^[a-zA-Z_][a-zA-Z0-9_]*\(\)/,
    variableQuoting: /"\$\{.*\}"|'\$\{.*\}'/,

    // Questionable practices
    echoWithoutValidation: /^echo\s+[^"']/,
    commandSubstitution: /`.*`/,
    unquotedVariables: /\$[A-Za-z_][A-Za-z0-9_]*[^"]|[^"]\$\{[^}]+\}[^"]/,
    hardcodedPaths: /\/usr\/bin|\/usr\/local\/bin|\/opt\//,
  };

  private readonly errorHandlingPatterns = {
    hasGlobalErrorHandling: /set -e|trap.*ERR/,
    hasExitOnError: /exit\s+1|return\s+1/,
    hasErrorMessages: /log_error|echo.*error/i,
    hasConditionChecks: /if.*command -v|if.*\[\[/,
    hasHandleError: /handle_error/,
  };

  public async evaluateInstallationScripts(): Promise<InstallationEvaluationResult> {
    const scriptPaths = [
      path.join(process.cwd(), 'install.sh'),
      path.join(process.cwd(), 'scripts', 'enhanced-install.sh'),
    ];

    const scriptEvaluations: ScriptEvaluation[] = [];

    for (const scriptPath of scriptPaths) {
      try {
        const evaluation = await this.evaluateScript(scriptPath);
        scriptEvaluations.push(evaluation);
      } catch (error) {
        console.warn(
          `Could not evaluate script ${scriptPath}:`,
          (error as Error).message
        );
      }
    }

    const overallScore =
      scriptEvaluations.length > 0
        ? scriptEvaluations.reduce(
            (sum, evaluation) => sum + evaluation.overallScore,
            0
          ) / scriptEvaluations.length
        : 0;

    const complianceChecks = this.performComplianceChecks(scriptEvaluations);
    const globalRecommendations = this.generateGlobalRecommendations(
      scriptEvaluations,
      complianceChecks
    );

    return {
      timestamp: new Date(),
      scriptsEvaluated: scriptEvaluations.length,
      overallScore: Math.round(overallScore),
      scriptEvaluations,
      globalRecommendations,
      complianceChecks,
    };
  }

  private async evaluateScript(scriptPath: string): Promise<ScriptEvaluation> {
    const content = await fs.readFile(scriptPath, 'utf-8');
    const lines = content.split('\n');
    const fileName = path.basename(scriptPath);

    const lineEvaluations: LineEvaluation[] = [];
    let evaluatedLines = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const lineNumber = i + 1;

      // Skip empty lines and comments for evaluation count
      if (line === '' || line.startsWith('#')) {
        continue;
      }

      evaluatedLines++;
      const evaluation = this.evaluateLine(line, lineNumber);
      if (evaluation) {
        lineEvaluations.push(evaluation);
      }
    }

    const criticalIssues = lineEvaluations.filter(
      e => !e.passed && e.severity === 'critical'
    ).length;
    const highIssues = lineEvaluations.filter(
      e => !e.passed && e.severity === 'high'
    ).length;
    const mediumIssues = lineEvaluations.filter(
      e => !e.passed && e.severity === 'medium'
    ).length;
    const lowIssues = lineEvaluations.filter(
      e => !e.passed && e.severity === 'low'
    ).length;

    const totalIssues = criticalIssues + highIssues + mediumIssues + lowIssues;
    const issueScore = Math.max(
      0,
      100 -
        (criticalIssues * 30 +
          highIssues * 20 +
          mediumIssues * 10 +
          lowIssues * 5)
    );

    const summary = this.generateScriptSummary(lineEvaluations, content);

    return {
      filePath: scriptPath,
      fileName,
      totalLines: lines.length,
      evaluatedLines,
      overallScore: Math.round(issueScore),
      criticalIssues,
      highIssues,
      mediumIssues,
      lowIssues,
      lineEvaluations,
      summary,
    };
  }

  private evaluateLine(
    line: string,
    lineNumber: number
  ): LineEvaluation | null {
    const evaluations: LineEvaluation[] = [];

    // Security evaluations
    evaluations.push(...this.evaluateLineSecurity(line, lineNumber));

    // Best practice evaluations
    evaluations.push(...this.evaluateLineBestPractices(line, lineNumber));

    // Error handling evaluations
    evaluations.push(...this.evaluateLineErrorHandling(line, lineNumber));

    // Return the most severe evaluation for this line, or null if no issues
    evaluations.sort((a, b) => {
      const severityOrder = {
        critical: 0,
        high: 1,
        medium: 2,
        low: 3,
        info: 4,
      };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });

    return evaluations.length > 0 ? evaluations[0] : null;
  }

  private evaluateLineSecurity(
    line: string,
    lineNumber: number
  ): LineEvaluation[] {
    const evaluations: LineEvaluation[] = [];

    // Check for unsafe download patterns
    if (this.securityPatterns.unsafeDownloads.test(line)) {
      evaluations.push({
        lineNumber,
        content: line,
        category: 'security',
        severity: 'critical',
        passed: false,
        issue: 'Unsafe download pattern - piping curl/wget directly to shell',
        suggestion: 'Download file first, verify it, then execute',
        reasoning:
          'This pattern allows arbitrary code execution and is a major security risk',
      });
    }

    // Check for HTTP downloads
    if (
      this.securityPatterns.httpDownloads.test(line) &&
      !this.securityPatterns.httpsDownloads.test(line)
    ) {
      evaluations.push({
        lineNumber,
        content: line,
        category: 'security',
        severity: 'high',
        passed: false,
        issue: 'Using HTTP instead of HTTPS for downloads',
        suggestion: 'Use HTTPS to prevent man-in-the-middle attacks',
        reasoning:
          'HTTP downloads can be intercepted and modified by attackers',
      });
    }

    // Check for sudo without validation
    if (
      this.securityPatterns.sudoWithoutValidation.test(line) &&
      !line.includes('systemctl')
    ) {
      evaluations.push({
        lineNumber,
        content: line,
        category: 'security',
        severity: 'medium',
        passed: false,
        issue: 'Using sudo without proper validation',
        suggestion: 'Validate user permissions before using sudo',
        reasoning: 'Unrestricted sudo usage can lead to privilege escalation',
      });
    }

    // Check for world-writable files
    if (this.securityPatterns.worldWritableFiles.test(line)) {
      evaluations.push({
        lineNumber,
        content: line,
        category: 'security',
        severity: 'high',
        passed: false,
        issue: 'Setting world-writable permissions (777/666)',
        suggestion: 'Use more restrictive permissions like 755 or 644',
        reasoning: 'World-writable files can be modified by any user',
      });
    }

    return evaluations;
  }

  private evaluateLineBestPractices(
    line: string,
    lineNumber: number
  ): LineEvaluation[] {
    const evaluations: LineEvaluation[] = [];

    // Check for unquoted variables
    if (
      this.bestPracticePatterns.unquotedVariables.test(line) &&
      !line.includes('$(') &&
      !line.includes('`')
    ) {
      evaluations.push({
        lineNumber,
        content: line,
        category: 'best-practice',
        severity: 'medium',
        passed: false,
        issue: 'Unquoted variable usage',
        suggestion: 'Quote variables to prevent word splitting: "$VARIABLE"',
        reasoning:
          'Unquoted variables can cause unexpected behavior with spaces or special characters',
      });
    }

    // Check for backtick command substitution
    if (this.bestPracticePatterns.commandSubstitution.test(line)) {
      evaluations.push({
        lineNumber,
        content: line,
        category: 'best-practice',
        severity: 'low',
        passed: false,
        issue: 'Using deprecated backtick command substitution',
        suggestion: 'Use modern $() syntax instead of backticks',
        reasoning: 'Modern $() syntax is more readable and can be nested',
      });
    }

    // Positive evaluation for good practices
    if (this.bestPracticePatterns.logging.test(line)) {
      evaluations.push({
        lineNumber,
        content: line,
        category: 'best-practice',
        severity: 'info',
        passed: true,
        suggestion: 'Good use of structured logging functions',
        reasoning: 'Proper logging helps with debugging and monitoring',
      });
    }

    return evaluations;
  }

  private evaluateLineErrorHandling(
    line: string,
    lineNumber: number
  ): LineEvaluation[] {
    const evaluations: LineEvaluation[] = [];

    // Check for commands without error handling
    if (
      line.startsWith('curl ') ||
      line.startsWith('wget ') ||
      line.startsWith('npm ') ||
      line.startsWith('apt-get ')
    ) {
      if (!line.includes('||') && !line.includes('&&') && lineNumber > 1) {
        evaluations.push({
          lineNumber,
          content: line,
          category: 'error-handling',
          severity: 'medium',
          passed: false,
          issue: 'Command without explicit error handling',
          suggestion: 'Add error handling with || or && operators',
          reasoning: 'Commands can fail and should be handled gracefully',
        });
      }
    }

    return evaluations;
  }

  private generateScriptSummary(
    lineEvaluations: LineEvaluation[],
    content: string
  ): {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  } {
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const recommendations: string[] = [];

    // Analyze content for strengths
    if (this.errorHandlingPatterns.hasGlobalErrorHandling.test(content)) {
      strengths.push('Global error handling with set -e or trap');
    }
    if (this.bestPracticePatterns.logging.test(content)) {
      strengths.push('Structured logging with dedicated functions');
    }
    if (
      content.includes('function ') ||
      /^[a-zA-Z_][a-zA-Z0-9_]*\(\)/.test(content)
    ) {
      strengths.push('Well-organized code with functions');
    }

    // Analyze weaknesses from evaluations
    const criticalIssues = lineEvaluations.filter(
      e => !e.passed && e.severity === 'critical'
    );
    const securityIssues = lineEvaluations.filter(
      e => !e.passed && e.category === 'security'
    );

    if (criticalIssues.length > 0) {
      weaknesses.push(
        `${criticalIssues.length} critical security issues found`
      );
    }
    if (securityIssues.length > 0) {
      weaknesses.push(`${securityIssues.length} security-related issues`);
    }

    // Generate recommendations
    if (criticalIssues.length > 0) {
      recommendations.push(
        'Address critical security vulnerabilities immediately'
      );
    }
    if (securityIssues.length > 3) {
      recommendations.push('Implement comprehensive security review process');
    }
    if (!this.errorHandlingPatterns.hasGlobalErrorHandling.test(content)) {
      recommendations.push(
        'Add global error handling with "set -e" and trap statements'
      );
    }

    return { strengths, weaknesses, recommendations };
  }

  private performComplianceChecks(scriptEvaluations: ScriptEvaluation[]): {
    hasErrorHandling: boolean;
    hasInputValidation: boolean;
    hasSecurityMeasures: boolean;
    hasLogging: boolean;
    hasCleanup: boolean;
  } {
    const allContent = scriptEvaluations
      .map(se => {
        return se.lineEvaluations.map(le => le.content).join('\n');
      })
      .join('\n');

    const allScriptContents = scriptEvaluations
      .map(
        se =>
          se.fileName +
          '\n' +
          se.lineEvaluations.map(le => le.content).join('\n')
      )
      .join('\n\n');

    return {
      hasErrorHandling:
        this.errorHandlingPatterns.hasGlobalErrorHandling.test(
          allScriptContents
        ),
      hasInputValidation:
        this.securityPatterns.inputValidation.test(allScriptContents),
      hasSecurityMeasures:
        this.securityPatterns.userValidation.test(allScriptContents),
      hasLogging: this.bestPracticePatterns.logging.test(allScriptContents),
      hasCleanup:
        allScriptContents.includes('cleanup') ||
        allScriptContents.includes('rm -rf'),
    };
  }

  private generateGlobalRecommendations(
    scriptEvaluations: ScriptEvaluation[],
    complianceChecks: any
  ): string[] {
    const recommendations: string[] = [];

    const totalCritical = scriptEvaluations.reduce(
      (sum, evaluation) => sum + evaluation.criticalIssues,
      0
    );
    const totalHigh = scriptEvaluations.reduce(
      (sum, evaluation) => sum + evaluation.highIssues,
      0
    );
    const avgScore =
      scriptEvaluations.reduce(
        (sum, evaluation) => sum + evaluation.overallScore,
        0
      ) / scriptEvaluations.length;

    if (totalCritical > 0) {
      recommendations.push(
        `🚨 Address ${totalCritical} critical security vulnerabilities immediately`
      );
    }

    if (totalHigh > 2) {
      recommendations.push(
        `⚠️  Review and fix ${totalHigh} high-priority issues`
      );
    }

    if (avgScore < 70) {
      recommendations.push(
        '📈 Overall installation script quality is below recommended threshold (70%)'
      );
    }

    if (!complianceChecks.hasErrorHandling) {
      recommendations.push(
        '🛡️  Implement comprehensive error handling across all scripts'
      );
    }

    if (!complianceChecks.hasInputValidation) {
      recommendations.push(
        '✅ Add input validation for all user inputs and parameters'
      );
    }

    if (!complianceChecks.hasSecurityMeasures) {
      recommendations.push(
        '🔒 Implement security measures like user privilege validation'
      );
    }

    recommendations.push(
      '📋 Consider implementing automated testing for installation scripts'
    );
    recommendations.push(
      '🔄 Set up continuous integration to validate installation process changes'
    );

    return recommendations;
  }

  public async generateDetailedReport(): Promise<string> {
    const evaluation = await this.evaluateInstallationScripts();

    let report = '# Installation Process Evaluation Report\n\n';
    report += `**Generated:** ${evaluation.timestamp.toISOString()}\n`;
    report += `**Scripts Evaluated:** ${evaluation.scriptsEvaluated}\n`;
    report += `**Overall Score:** ${evaluation.overallScore}/100\n\n`;

    // Executive Summary
    report += '## Executive Summary\n\n';
    if (evaluation.overallScore >= 80) {
      report +=
        '✅ **Status:** Good - Installation scripts meet quality standards\n';
    } else if (evaluation.overallScore >= 60) {
      report +=
        '⚠️ **Status:** Needs Improvement - Several issues require attention\n';
    } else {
      report +=
        '❌ **Status:** Poor - Significant issues need immediate attention\n';
    }
    report += '\n';

    // Compliance Dashboard
    report += '## Compliance Dashboard\n\n';
    report += `| Check | Status |\n`;
    report += `|-------|--------|\n`;
    report += `| Error Handling | ${evaluation.complianceChecks.hasErrorHandling ? '✅ Pass' : '❌ Fail'} |\n`;
    report += `| Input Validation | ${evaluation.complianceChecks.hasInputValidation ? '✅ Pass' : '❌ Fail'} |\n`;
    report += `| Security Measures | ${evaluation.complianceChecks.hasSecurityMeasures ? '✅ Pass' : '❌ Fail'} |\n`;
    report += `| Logging | ${evaluation.complianceChecks.hasLogging ? '✅ Pass' : '❌ Fail'} |\n`;
    report += `| Cleanup | ${evaluation.complianceChecks.hasCleanup ? '✅ Pass' : '❌ Fail'} |\n\n`;

    // Global Recommendations
    if (evaluation.globalRecommendations.length > 0) {
      report += '## Global Recommendations\n\n';
      evaluation.globalRecommendations.forEach(rec => {
        report += `${rec}\n`;
      });
      report += '\n';
    }

    // Detailed Script Analysis
    report += '## Detailed Script Analysis\n\n';

    for (const scriptEval of evaluation.scriptEvaluations) {
      report += `### ${scriptEval.fileName}\n\n`;
      report += `**Score:** ${scriptEval.overallScore}/100\n`;
      report += `**Lines Analyzed:** ${scriptEval.evaluatedLines}/${scriptEval.totalLines}\n`;
      report += `**Issues:** ${scriptEval.criticalIssues} critical, ${scriptEval.highIssues} high, ${scriptEval.mediumIssues} medium, ${scriptEval.lowIssues} low\n\n`;

      // Strengths
      if (scriptEval.summary.strengths.length > 0) {
        report += '**Strengths:**\n';
        scriptEval.summary.strengths.forEach(strength => {
          report += `- ✅ ${strength}\n`;
        });
        report += '\n';
      }

      // Weaknesses
      if (scriptEval.summary.weaknesses.length > 0) {
        report += '**Areas for Improvement:**\n';
        scriptEval.summary.weaknesses.forEach(weakness => {
          report += `- ⚠️ ${weakness}\n`;
        });
        report += '\n';
      }

      // Critical and High Issues
      const criticalAndHigh = scriptEval.lineEvaluations.filter(
        le =>
          !le.passed && (le.severity === 'critical' || le.severity === 'high')
      );

      if (criticalAndHigh.length > 0) {
        report += '**Critical & High Priority Issues:**\n\n';
        criticalAndHigh.forEach(issue => {
          const severityIcon = issue.severity === 'critical' ? '🚨' : '⚠️';
          report += `${severityIcon} **Line ${issue.lineNumber}** (${issue.category})\n`;
          report += `\`\`\`bash\n${issue.content}\n\`\`\`\n`;
          report += `**Issue:** ${issue.issue}\n`;
          if (issue.suggestion) {
            report += `**Suggestion:** ${issue.suggestion}\n`;
          }
          if (issue.reasoning) {
            report += `**Why:** ${issue.reasoning}\n`;
          }
          report += '\n';
        });
      }

      // Script Recommendations
      if (scriptEval.summary.recommendations.length > 0) {
        report += '**Script-Specific Recommendations:**\n';
        scriptEval.summary.recommendations.forEach(rec => {
          report += `- 💡 ${rec}\n`;
        });
        report += '\n';
      }

      report += '---\n\n';
    }

    report += '## Report Footer\n\n';
    report += `This automated evaluation was performed by the Phantom Spire Installation Evaluation Service.\n`;
    report += `For questions or additional analysis, please review the individual line evaluations in detail.\n`;

    return report;
  }
}
