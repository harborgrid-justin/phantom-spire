// Phantom Compliance Core API Route - Enterprise Compliance Management
// Provides REST endpoints for comprehensive compliance and regulatory capabilities

import { NextRequest, NextResponse } from 'next/server';
import { getPhantomCoreIntegrator } from '@/services/phantom-core-integrator';

/**
 * GET /api/phantom-cores/compliance - Get compliance system status and operations
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const operation = url.searchParams.get('operation') || 'status';

    const integrator = getPhantomCoreIntegrator();
    if (!integrator.isInitialized()) {
      return NextResponse.json({
        success: false,
        error: 'Phantom cores not initialized',
        timestamp: new Date().toISOString()
      }, { status: 503 });
    }

    const complianceCore = integrator.getCore('compliance');

    switch (operation) {
      case 'status':
        const status = await complianceCore.getComplianceSystemStatus();
        return NextResponse.json({
          success: true,
          data: status,
          source: 'phantom-compliance-api',
          timestamp: new Date().toISOString()
        });

      case 'health':
        const health = await complianceCore.performHealthCheck();
        return NextResponse.json({
          success: true,
          data: health,
          source: 'phantom-compliance-api',
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json({
          success: false,
          error: `Unknown compliance operation: ${operation}`,
          timestamp: new Date().toISOString()
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Phantom Compliance API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * POST /api/phantom-cores/compliance - Perform compliance operations
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation, ...params } = body;

    const integrator = getPhantomCoreIntegrator();
    if (!integrator.isInitialized()) {
      return NextResponse.json({
        success: false,
        error: 'Phantom cores not initialized',
        timestamp: new Date().toISOString()
      }, { status: 503 });
    }

    const complianceCore = integrator.getCore('compliance');

    switch (operation) {
      case 'analyze-framework':
        const frameworkAnalysis = await complianceCore.analyzeComplianceFramework(
          params.frameworkData || {
            name: 'Enterprise Compliance Framework',
            industry: 'Technology',
            standards: ['ISO 27001', 'SOC 2', 'NIST CSF']
          },
          params.context || 'ml-studio'
        );
        return NextResponse.json({
          success: true,
          data: frameworkAnalysis,
          source: 'phantom-compliance-api',
          timestamp: new Date().toISOString()
        });

      case 'assess-status':
        const statusAssessment = await complianceCore.assessComplianceStatus(
          params.assessmentData || {
            framework_id: 'enterprise-framework',
            assessmentScope: ['data_protection', 'access_control', 'audit_trails']
          },
          params.context || 'ml-studio'
        );
        return NextResponse.json({
          success: true,
          data: statusAssessment,
          source: 'phantom-compliance-api',
          timestamp: new Date().toISOString()
        });

      case 'conduct-audit':
        const auditResults = await complianceCore.conductComplianceAudit(
          params.auditData || {
            audit_type: 'ML Compliance Audit',
            scope: ['model_governance', 'data_privacy', 'algorithmic_fairness']
          },
          params.context || 'ml-studio'
        );
        return NextResponse.json({
          success: true,
          data: auditResults,
          source: 'phantom-compliance-api',
          timestamp: new Date().toISOString()
        });

      case 'generate-report':
        const complianceReport = await complianceCore.generateComplianceReport(
          params.reportData || {
            report_type: 'ML Studio Compliance Report',
            frameworks: ['ISO 27001', 'SOC 2', 'GDPR'],
            reportingPeriod: 'Q4 2024'
          },
          params.context || 'ml-studio'
        );
        return NextResponse.json({
          success: true,
          data: complianceReport,
          source: 'phantom-compliance-api',
          timestamp: new Date().toISOString()
        });

      case 'analyze-metrics':
        const metricsAnalysis = await complianceCore.analyzeComplianceMetrics(
          params.metricsData || {
            time_period: '6 months',
            frameworks: ['ISO 27001', 'SOC 2', 'GDPR']
          },
          params.context || 'ml-studio'
        );
        return NextResponse.json({
          success: true,
          data: metricsAnalysis,
          source: 'phantom-compliance-api',
          timestamp: new Date().toISOString()
        });

      case 'quick-analysis':
        const quickAnalysis = await complianceCore.quickFrameworkAnalysis(
          params.framework || 'ISO 27001',
          params.industry || 'Technology'
        );
        return NextResponse.json({
          success: true,
          data: quickAnalysis,
          source: 'phantom-compliance-api',
          timestamp: new Date().toISOString()
        });

      case 'comprehensive-assessment':
        const comprehensiveAssessment = await complianceCore.comprehensiveAssessment(
          params.frameworkId || 'enterprise-framework'
        );
        return NextResponse.json({
          success: true,
          data: comprehensiveAssessment,
          source: 'phantom-compliance-api',
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json({
          success: false,
          error: `Unknown compliance operation: ${operation}`,
          timestamp: new Date().toISOString()
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Phantom Compliance API POST error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}