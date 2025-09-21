// Phantom Cores API Route - Unified API for all phantom-*-core modules
// Provides REST endpoints for integrated cybersecurity and ML operations

import { NextRequest, NextResponse } from 'next/server';
import { getPhantomCoreIntegrator, initializePhantomCores, PhantomCoreConfig } from '@/services/phantom-core-integrator';

/**
 * GET /api/phantom-cores - Get unified system status
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

    switch (operation) {
      case 'status':
        const status = await integrator.getUnifiedSystemStatus();
        return NextResponse.json(status);

      case 'health':
        const healthChecks = await integrator.performHealthChecks();
        return NextResponse.json({
          success: true,
          data: {
            health_checks: Object.fromEntries(healthChecks),
            overall_health: Array.from(healthChecks.values()).every(h => h)
          },
          source: 'phantom-cores-api',
          timestamp: new Date().toISOString()
        });

      case 'config':
        const config = integrator.getConfiguration();
        return NextResponse.json({
          success: true,
          data: config,
          source: 'phantom-cores-api',
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json({
          success: false,
          error: `Unknown operation: ${operation}`,
          timestamp: new Date().toISOString()
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Phantom cores API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * POST /api/phantom-cores - Initialize cores or perform operations
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation, config, ...params } = body;

    switch (operation) {
      case 'initialize':
        const initConfig: PhantomCoreConfig = config || {
          organizationName: 'ML Studio Enterprise',
          enterpriseMode: true,
          integrationMode: 'full',
          enabledModules: ['ml', 'xdr', 'compliance'],
          xdrConfig: {
            detectionEngines: ['signature', 'behavioral', 'ml_anomaly', 'threat_intel'],
            responseMode: 'automated',
            enterpriseIntegration: true
          },
          complianceConfig: {
            frameworks: ['ISO 27001', 'SOC 2', 'NIST CSF'],
            auditFrequency: 'quarterly',
            retentionYears: 7
          },
          mlConfig: {
            modelRegistry: true,
            autoML: true,
            distributedTraining: true
          }
        };

        const initResult = await initializePhantomCores(initConfig);
        return NextResponse.json(initResult);

      case 'cross-analysis':
        const integrator = getPhantomCoreIntegrator();
        if (!integrator.isInitialized()) {
          return NextResponse.json({
            success: false,
            error: 'Phantom cores not initialized',
            timestamp: new Date().toISOString()
          }, { status: 503 });
        }

        const analysisResult = await integrator.performCrossModuleAnalysis({
          analysisType: params.analysisType || 'enterprise_security_ml',
          dataSource: params.dataSource || {},
          includeML: params.includeML !== false,
          includeXDR: params.includeXDR !== false,
          includeCompliance: params.includeCompliance !== false
        });

        return NextResponse.json({
          success: true,
          data: analysisResult,
          source: 'phantom-cores-api',
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json({
          success: false,
          error: `Unknown operation: ${operation}`,
          timestamp: new Date().toISOString()
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Phantom cores API POST error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}