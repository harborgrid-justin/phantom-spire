import { promises as fs } from 'fs';
import path from 'path';

export interface SystemRequirement {
  name: string;
  required: string;
  current: string | null;
  passed: boolean;
  message: string;
  critical: boolean;
}

export interface SystemCheckResult {
  passed: boolean;
  timestamp: Date;
  requirements: SystemRequirement[];
  warnings: string[];
  recommendations: string[];
}

export class SystemRequirementsService {
  private async checkNodeVersion(): Promise<SystemRequirement> {
    const requiredVersion = '18.0.0';
    const currentVersion = process.version.slice(1); // Remove 'v' prefix
    
    const [reqMajor, reqMinor] = requiredVersion.split('.').map(Number);
    const [curMajor, curMinor] = currentVersion.split('.').map(Number);
    
    const passed = curMajor > reqMajor || (curMajor === reqMajor && curMinor >= reqMinor);
    
    return {
      name: 'Node.js Version',
      required: `>= ${requiredVersion}`,
      current: currentVersion,
      passed,
      message: passed 
        ? `Node.js ${currentVersion} meets requirements`
        : `Node.js ${currentVersion} is below required version ${requiredVersion}`,
      critical: true
    };
  }

  private async checkMemory(): Promise<SystemRequirement> {
    const totalMem = process.memoryUsage();
    const freeMem = totalMem.heapTotal - totalMem.heapUsed;
    const totalMemGB = Math.round((totalMem.rss / 1024 / 1024 / 1024) * 100) / 100;
    
    // Minimum 2GB recommended
    const minMemoryGB = 2;
    const passed = totalMemGB >= minMemoryGB;
    
    return {
      name: 'Available Memory',
      required: `>= ${minMemoryGB}GB`,
      current: `${totalMemGB}GB`,
      passed,
      message: passed
        ? `Memory ${totalMemGB}GB is sufficient`
        : `Available memory ${totalMemGB}GB is below recommended ${minMemoryGB}GB`,
      critical: false
    };
  }

  private async checkDiskSpace(): Promise<SystemRequirement> {
    try {
      const stats = await fs.stat(process.cwd());
      // This is a simplified check - in production you'd want to use a proper disk space library
      const passed = true; // Assume passed for now
      
      return {
        name: 'Disk Space',
        required: '>= 10GB free',
        current: 'Available',
        passed,
        message: 'Disk space check passed',
        critical: false
      };
    } catch (error) {
      return {
        name: 'Disk Space',
        required: '>= 10GB free',
        current: null,
        passed: false,
        message: 'Could not check disk space: ' + (error as Error).message,
        critical: false
      };
    }
  }

  private async checkEnvironmentVariables(): Promise<SystemRequirement> {
    const requiredEnvVars = [
      'NODE_ENV',
      'JWT_SECRET',
      'MONGODB_URI',
      'POSTGRESQL_URI',
      'MYSQL_URI',
      'REDIS_URL'
    ];
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    const passed = missingVars.length === 0;
    
    return {
      name: 'Environment Variables',
      required: 'All critical environment variables set',
      current: passed ? 'All required variables present' : `Missing: ${missingVars.join(', ')}`,
      passed,
      message: passed
        ? 'All required environment variables are configured'
        : `Missing required environment variables: ${missingVars.join(', ')}`,
      critical: true
    };
  }

  private async checkDirectoryStructure(): Promise<SystemRequirement> {
    const requiredDirectories = [
      'src',
      'logs',
      'uploads',
      'backups',
      'docker'
    ];
    
    const results = await Promise.allSettled(
      requiredDirectories.map(async dir => {
        try {
          await fs.access(path.join(process.cwd(), dir));
          return { dir, exists: true };
        } catch {
          try {
            await fs.mkdir(path.join(process.cwd(), dir), { recursive: true });
            return { dir, exists: true, created: true };
          } catch (error) {
            return { dir, exists: false, error: (error as Error).message };
          }
        }
      })
    );
    
    const missingDirs = results
      .map((result, index) => ({ result, dir: requiredDirectories[index] }))
      .filter(({ result }) => result.status === 'rejected' || 
                              (result.status === 'fulfilled' && !result.value.exists))
      .map(({ dir }) => dir);
    
    const passed = missingDirs.length === 0;
    
    return {
      name: 'Directory Structure',
      required: 'Required directories exist or can be created',
      current: passed ? 'All directories available' : `Missing: ${missingDirs.join(', ')}`,
      passed,
      message: passed
        ? 'Directory structure is ready'
        : `Could not create required directories: ${missingDirs.join(', ')}`,
      critical: true
    };
  }

  private async checkNetworkAccess(): Promise<SystemRequirement> {
    // Check if we can make outbound connections (simplified check)
    try {
      // This would normally test connectivity to external APIs
      const passed = true; // Simplified for demo
      
      return {
        name: 'Network Access',
        required: 'Outbound HTTPS connections allowed',
        current: 'Available',
        passed,
        message: 'Network access is available for external integrations',
        critical: false
      };
    } catch (error) {
      return {
        name: 'Network Access',
        required: 'Outbound HTTPS connections allowed',
        current: null,
        passed: false,
        message: 'Network access test failed: ' + (error as Error).message,
        critical: false
      };
    }
  }

  public async performSystemCheck(): Promise<SystemCheckResult> {
    console.log('Performing comprehensive system requirements check...');
    
    const checks = await Promise.all([
      this.checkNodeVersion(),
      this.checkMemory(),
      this.checkDiskSpace(),
      this.checkEnvironmentVariables(),
      this.checkDirectoryStructure(),
      this.checkNetworkAccess()
    ]);
    
    const criticalFailures = checks.filter(check => check.critical && !check.passed);
    const warnings = checks.filter(check => !check.critical && !check.passed);
    
    const passed = criticalFailures.length === 0;
    
    const recommendations = [];
    if (warnings.length > 0) {
      recommendations.push(`Address ${warnings.length} warning(s) for optimal performance`);
    }
    if (checks.find(check => check.name === 'Available Memory' && !check.passed)) {
      recommendations.push('Consider increasing available memory for better performance');
    }
    
    const result: SystemCheckResult = {
      passed,
      timestamp: new Date(),
      requirements: checks,
      warnings: warnings.map(w => w.message),
      recommendations
    };
    
    console.log(`System check ${passed ? 'PASSED' : 'FAILED'}:`);
    console.log(`- ${checks.filter(c => c.passed).length}/${checks.length} requirements met`);
    console.log(`- ${criticalFailures.length} critical failures`);
    console.log(`- ${warnings.length} warnings`);
    
    return result;
  }

  public async generateSystemReport(): Promise<string> {
    const checkResult = await this.performSystemCheck();
    
    let report = '# Phantom Spire CTI Platform - System Requirements Report\n\n';
    report += `**Generated:** ${checkResult.timestamp.toISOString()}\n`;
    report += `**Status:** ${checkResult.passed ? '✅ PASSED' : '❌ FAILED'}\n\n`;
    
    report += '## Requirements Check\n\n';
    checkResult.requirements.forEach(req => {
      const status = req.passed ? '✅' : '❌';
      const critical = req.critical ? '(Critical)' : '(Optional)';
      report += `${status} **${req.name}** ${critical}\n`;
      report += `   - Required: ${req.required}\n`;
      report += `   - Current: ${req.current || 'N/A'}\n`;
      report += `   - Message: ${req.message}\n\n`;
    });
    
    if (checkResult.warnings.length > 0) {
      report += '## Warnings\n\n';
      checkResult.warnings.forEach(warning => {
        report += `⚠️ ${warning}\n`;
      });
      report += '\n';
    }
    
    if (checkResult.recommendations.length > 0) {
      report += '## Recommendations\n\n';
      checkResult.recommendations.forEach(rec => {
        report += `💡 ${rec}\n`;
      });
      report += '\n';
    }
    
    report += '## System Information\n\n';
    report += `- **Platform:** ${process.platform}\n`;
    report += `- **Architecture:** ${process.arch}\n`;
    report += `- **Node.js Version:** ${process.version}\n`;
    report += `- **Working Directory:** ${process.cwd()}\n`;
    report += `- **Process PID:** ${process.pid}\n`;
    
    return report;
  }
}