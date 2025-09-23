/**
 * MITRE ATT&CK Framework API Routes
 * Provides access to MITRE data and synchronization capabilities
 */
import { NextRequest, NextResponse } from 'next/server';
import { mitreService } from '@/lib/services/mitreService';
import { MitreSearchQuery } from '@/lib/types/mitre';

/**
 * GET /api/mitre - Get MITRE integration status and analytics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'status':
        const status = await mitreService.getIntegrationStatus();
        return NextResponse.json(status);

      case 'analytics':
        const analytics = await mitreService.getAnalytics();
        return NextResponse.json(analytics);

      case 'tactics':
        const tacticsQuery: MitreSearchQuery = {
          query: searchParams.get('q') || undefined,
          limit: parseInt(searchParams.get('limit') || '50'),
          offset: parseInt(searchParams.get('offset') || '0')
        };
        const tactics = await mitreService.searchMitreData('mitre_tactics', tacticsQuery);
        return NextResponse.json(tactics);

      case 'techniques':
        const techniquesQuery: MitreSearchQuery = {
          query: searchParams.get('q') || undefined,
          tactics: searchParams.get('tactics')?.split(',') || undefined,
          platforms: searchParams.get('platforms')?.split(',') || undefined,
          limit: parseInt(searchParams.get('limit') || '50'),
          offset: parseInt(searchParams.get('offset') || '0')
        };
        const techniques = await mitreService.searchMitreData('mitre_techniques', techniquesQuery);
        return NextResponse.json(techniques);

      case 'groups':
        const groupsQuery: MitreSearchQuery = {
          query: searchParams.get('q') || undefined,
          limit: parseInt(searchParams.get('limit') || '50'),
          offset: parseInt(searchParams.get('offset') || '0')
        };
        const groups = await mitreService.searchMitreData('mitre_groups', groupsQuery);
        return NextResponse.json(groups);

      case 'software':
        const softwareQuery: MitreSearchQuery = {
          query: searchParams.get('q') || undefined,
          platforms: searchParams.get('platforms')?.split(',') || undefined,
          limit: parseInt(searchParams.get('limit') || '50'),
          offset: parseInt(searchParams.get('offset') || '0')
        };
        const software = await mitreService.searchMitreData('mitre_software', softwareQuery);
        return NextResponse.json(software);

      case 'mitigations':
        const mitigationsQuery: MitreSearchQuery = {
          query: searchParams.get('q') || undefined,
          limit: parseInt(searchParams.get('limit') || '50'),
          offset: parseInt(searchParams.get('offset') || '0')
        };
        const mitigations = await mitreService.searchMitreData('mitre_mitigations', mitigationsQuery);
        return NextResponse.json(mitigations);

      case 'data-sources':
        const dataSourcesQuery: MitreSearchQuery = {
          query: searchParams.get('q') || undefined,
          platforms: searchParams.get('platforms')?.split(',') || undefined,
          limit: parseInt(searchParams.get('limit') || '50'),
          offset: parseInt(searchParams.get('offset') || '0')
        };
        const dataSources = await mitreService.searchMitreData('mitre_data_sources', dataSourcesQuery);
        return NextResponse.json(dataSources);

      default:
        // Return overall status and analytics by default
        const [defaultStatus, defaultAnalytics] = await Promise.all([
          mitreService.getIntegrationStatus(),
          mitreService.getAnalytics()
        ]);

        return NextResponse.json({
          status: defaultStatus,
          analytics: defaultAnalytics
        });
    }
  } catch (error: any) {
    console.error('MITRE API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/mitre - Trigger MITRE data synchronization
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'sync':
        console.log('🔄 Starting MITRE data synchronization via API...');
        const syncResult = await mitreService.syncMitreData();
        
        return NextResponse.json({
          success: true,
          message: 'MITRE data synchronization completed',
          result: syncResult,
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json(
          { 
            error: 'Invalid action', 
            message: `Action '${action}' not supported`,
            supportedActions: ['sync'],
            timestamp: new Date().toISOString()
          },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('MITRE sync error:', error);
    return NextResponse.json(
      { 
        error: 'Synchronization failed', 
        message: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}