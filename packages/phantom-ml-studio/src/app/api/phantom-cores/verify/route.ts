import { NextRequest, NextResponse } from 'next/server';

// Comprehensive API verification system for all phantom-*-core packages
export async function GET(request: NextRequest) {
  const verificationResults = {
    timestamp: new Date().toISOString(),
    totalCores: 20,
    verificationResults: {} as Record<string, any>,
    summary: {
      accessible: 0,
      errors: 0,
      warnings: 0
    }
  };

  const phantomCores = [
    'xdr-core',
    'compliance-core',
    'threat-intelligence-core',
    'vulnerability-assessment-core',
    'incident-response-core',
    'forensics-core',
    'network-security-core',
    'endpoint-security-core',
    'cloud-security-core',
    'identity-access-core',
    'data-protection-core',
    'security-orchestration-core',
    'threat-hunting-core',
    'malware-analysis-core',
    'behavioral-analytics-core',
    'risk-assessment-core',
    'security-monitoring-core',
    'penetration-testing-core',
    'governance-risk-compliance-core',
    'security-awareness-core'
  ];

  // Verify each phantom core package
  for (const coreName of phantomCores) {
    try {
      console.log(`Verifying ${coreName}...`);

      // Test dynamic import capability
      let coreModule = null;
      let importError = null;

      try {
        coreModule = await import(`@phantom-spire/${coreName}/enterprise-wrapper`);
      } catch (error) {
        importError = error;
        // Try alternative import paths
        try {
          coreModule = await import(`@phantom-spire/${coreName}`);
        } catch (fallbackError) {
          importError = fallbackError;
        }
      }

      // Determine enterprise API availability
      const enterpriseApis = [];
      let coreInstance = null;

      if (coreModule && !importError) {
        // Extract available APIs from the module
        const moduleKeys = Object.keys(coreModule);
        enterpriseApis.push(...moduleKeys.filter(key =>
          typeof coreModule[key] === 'function' ||
          typeof coreModule[key] === 'object'
        ));

        // Try to instantiate core if it has a constructor
        const CoreClass = coreModule[`Phantom${coreName.split('-').map(part =>
          part.charAt(0).toUpperCase() + part.slice(1)
        ).join('')}Core`] || coreModule.default || coreModule[Object.keys(coreModule)[0]];

        if (CoreClass && typeof CoreClass === 'function') {
          try {
            coreInstance = new CoreClass();
          } catch (instError) {
            console.warn(`Could not instantiate ${coreName}:`, instError);
          }
        }
      }

      // Define expected enterprise APIs based on core type
      const expectedApis = getExpectedEnterpriseApis(coreName);

      verificationResults.verificationResults[coreName] = {
        packageName: `@phantom-spire/${coreName}`,
        status: importError ? 'error' : 'accessible',
        importError: importError?.message || null,
        availableApis: enterpriseApis,
        expectedApis: expectedApis,
        apiCoverage: expectedApis.length > 0 ?
          (enterpriseApis.filter(api => expectedApis.includes(api)).length / expectedApis.length) * 100 :
          100,
        coreInstance: !!coreInstance,
        enterpriseFeatures: getEnterpriseFeatures(coreName),
        testResults: await testCoreApis(coreName, coreInstance, enterpriseApis)
      };

      if (importError) {
        verificationResults.summary.errors++;
      } else {
        verificationResults.summary.accessible++;
      }

    } catch (error) {
      console.error(`Failed to verify ${coreName}:`, error);
      verificationResults.verificationResults[coreName] = {
        packageName: `@phantom-spire/${coreName}`,
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
        availableApis: [],
        expectedApis: [],
        apiCoverage: 0
      };
      verificationResults.summary.errors++;
    }
  }

  return NextResponse.json(verificationResults);
}

// Define expected enterprise APIs for each core type
function getExpectedEnterpriseApis(coreName: string): string[] {
  const apiMap: Record<string, string[]> = {
    'xdr-core': [
      'detectAndAnalyzeThreats',
      'investigateSecurityIncident',
      'conductThreatHunt',
      'orchestrateSecurityResponse',
      'analyzeBehavioralPatterns',
      'getXdrSystemStatus'
    ],
    'compliance-core': [
      'analyzeComplianceFramework',
      'assessComplianceStatus',
      'conductComplianceAudit',
      'generateComplianceReport',
      'manageRegulatoryRequirements'
    ],
    'threat-intelligence-core': [
      'collectThreatIntelligence',
      'analyzeThreatIndicators',
      'correlateThreatData',
      'generateThreatReports',
      'manageThreatFeeds'
    ],
    'vulnerability-assessment-core': [
      'scanForVulnerabilities',
      'assessVulnerabilityRisk',
      'prioritizeVulnerabilities',
      'generateVulnerabilityReports',
      'trackRemediationProgress'
    ],
    'incident-response-core': [
      'initiateIncidentResponse',
      'coordinateResponseTeam',
      'documentIncidentDetails',
      'executeResponsePlaybooks',
      'generateIncidentReports'
    ]
  };

  return apiMap[coreName] || [
    'initialize',
    'getStatus',
    'performAnalysis',
    'generateReport',
    'executeOperation'
  ];
}

// Define enterprise features for each core
function getEnterpriseFeatures(coreName: string): string[] {
  const featureMap: Record<string, string[]> = {
    'xdr-core': [
      'Advanced Threat Detection',
      'Behavioral Analytics',
      'Incident Investigation',
      'Threat Hunting',
      'Response Orchestration',
      'Multi-Vector Analysis'
    ],
    'compliance-core': [
      'Regulatory Framework Support',
      'Automated Compliance Assessment',
      'Audit Trail Management',
      'Policy Enforcement',
      'Risk Assessment',
      'Reporting & Documentation'
    ],
    'threat-intelligence-core': [
      'Threat Data Collection',
      'Indicator Analysis',
      'Threat Correlation',
      'Intelligence Sharing',
      'Threat Landscape Monitoring',
      'Predictive Analytics'
    ]
  };

  return featureMap[coreName] || [
    'Enterprise Integration',
    'Advanced Analytics',
    'Reporting',
    'Monitoring',
    'Automation'
  ];
}

// Test core APIs functionality
async function testCoreApis(coreName: string, coreInstance: any, availableApis: string[]): Promise<any> {
  const testResults = {
    totalTests: 0,
    passed: 0,
    failed: 0,
    tests: [] as any[]
  };

  // Test each available API
  for (const apiName of availableApis) {
    testResults.totalTests++;

    try {
      if (coreInstance && typeof coreInstance[apiName] === 'function') {
        // Test function call with minimal parameters
        const result = await coreInstance[apiName]({
          test: true,
          minimal: true
        });

        testResults.tests.push({
          api: apiName,
          status: 'passed',
          result: 'Function callable',
          response: typeof result
        });
        testResults.passed++;
      } else {
        testResults.tests.push({
          api: apiName,
          status: 'warning',
          result: 'API exists but not testable',
          reason: 'Not a function or no instance'
        });
      }
    } catch (error) {
      testResults.tests.push({
        api: apiName,
        status: 'failed',
        error: error instanceof Error ? error.message : String(error)
      });
      testResults.failed++;
    }
  }

  return testResults;
}

export async function POST(request: NextRequest) {
  try {
    const { operation, coreName, apiName, parameters } = await request.json();

    if (operation === 'test-api') {
      // Test specific API endpoint
      const coreModule = await import(`@phantom-spire/${coreName}/enterprise-wrapper`);
      const CoreClass = coreModule[`Phantom${coreName.split('-').map(part =>
        part.charAt(0).toUpperCase() + part.slice(1)
      ).join('')}Core`] || coreModule.default;

      if (CoreClass && typeof CoreClass === 'function') {
        const coreInstance = new CoreClass();

        if (typeof coreInstance[apiName] === 'function') {
          const result = await coreInstance[apiName](parameters || {});

          return NextResponse.json({
            success: true,
            coreName,
            apiName,
            result,
            timestamp: new Date().toISOString()
          });
        } else {
          return NextResponse.json({
            success: false,
            error: `API ${apiName} not found in ${coreName}`,
            availableApis: Object.keys(coreInstance).filter(key => typeof coreInstance[key] === 'function')
          });
        }
      }
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid operation or core not found'
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    });
  }
}