// API route for CVE analysis using phantom-cve-core

import { NextRequest, NextResponse } from 'next/server';
import { CVECore, CVE, CVESearchCriteria } from '../../../../../phantom-cve-core/src-ts';

// Initialize CVE Core instance
let cveCore: CVECore | null = null;

async function initializeCVECore() {
  if (!cveCore) {
    cveCore = new CVECore();
  }
  return cveCore;
}

// Helper function to create a CVE object from request data
function createCVEFromData(data: any): CVE {
  return {
    id: data.cve_id || data.id,
    description: data.description || '',
    published_date: data.published_date ? new Date(data.published_date) : new Date(),
    last_modified_date: data.last_modified_date ? new Date(data.last_modified_date) : new Date(),
    cvss_metrics: data.cvss_metrics ? {
      version: data.cvss_metrics.version || '3.1',
      base_score: data.cvss_metrics.base_score || data.cvss_score || 0.0,
      severity: data.cvss_metrics.severity || 'medium',
      attack_vector: data.cvss_metrics.attack_vector || 'network',
      attack_complexity: data.cvss_metrics.attack_complexity || 'low',
      privileges_required: data.cvss_metrics.privileges_required || 'none',
      user_interaction: data.cvss_metrics.user_interaction || 'none',
      scope: data.cvss_metrics.scope || 'unchanged',
      confidentiality_impact: data.cvss_metrics.confidentiality_impact || 'high',
      integrity_impact: data.cvss_metrics.integrity_impact || 'high',
      availability_impact: data.cvss_metrics.availability_impact || 'high'
    } : undefined,
    affected_products: data.affected_products || [{
      vendor: data.vendor || 'Unknown',
      product: data.product || 'Unknown',
      version: data.version || '*'
    }],
    references: data.references || [],
    status: data.status || 'published',
    assigner: data.assigner || 'Unknown',
    tags: data.tags || []
  };
}

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json();
    const core = await initializeCVECore();

    switch (action) {
      case 'process_cve': {
        if (!data.cve_id || !data.description) {
          return NextResponse.json(
            { error: 'CVE ID and description are required' },
            { status: 400 }
          );
        }

        const cve = createCVEFromData(data);
        const result = await core.process_cve(cve);

        return NextResponse.json({
          success: true,
          data: result
        });
      }

      case 'batch_process_cves': {
        if (!data.cves || !Array.isArray(data.cves)) {
          return NextResponse.json(
            { error: 'CVEs array is required' },
            { status: 400 }
          );
        }

        const cves = data.cves.map((cveData: any) => createCVEFromData(cveData));
        const results = await core.batch_process_cves(cves);

        return NextResponse.json({
          success: true,
          data: results
        });
      }

      case 'get_exploit_timeline': {
        const { cve_id } = data;
        
        if (!cve_id) {
          return NextResponse.json(
            { error: 'CVE ID is required' },
            { status: 400 }
          );
        }

        const timeline = await core.get_exploit_timeline(cve_id);
        
        return NextResponse.json({
          success: true,
          data: timeline
        });
      }

      case 'get_remediation_strategy': {
        if (!data.cve_id) {
          return NextResponse.json(
            { error: 'CVE data is required' },
            { status: 400 }
          );
        }

        const cve = createCVEFromData(data);
        const strategy = await core.get_remediation_strategy(cve);
        
        return NextResponse.json({
          success: true,
          data: strategy
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action specified' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('CVE analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to perform CVE analysis', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const cve_id = searchParams.get('cve_id');

    if (!action) {
      return NextResponse.json(
        { error: 'Action parameter is required' },
        { status: 400 }
      );
    }

    const core = await initializeCVECore();

    switch (action) {
      case 'get_exploit_timeline': {
        if (!cve_id) {
          return NextResponse.json(
            { error: 'CVE ID is required' },
            { status: 400 }
          );
        }

        const timeline = await core.get_exploit_timeline(cve_id);
        
        return NextResponse.json({
          success: true,
          data: timeline
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action specified. Available actions: get_exploit_timeline' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('CVE analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to perform CVE analysis', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
