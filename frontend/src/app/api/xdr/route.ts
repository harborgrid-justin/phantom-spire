// Next.js API route for XDR functionality
import { NextRequest, NextResponse } from 'next/server';
import XDRCore from 'phantom-xdr-core';

// POST /api/xdr/process-threat
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    const xdr = new XDRCore();

    let result;

    switch (action) {
      case 'process_threat':
        result = await xdr.processThreatIndicator(data);
        break;

      case 'evaluate_access':
        result = await xdr.evaluateAccess(data);
        break;

      case 'analyze_traffic':
        result = await xdr.analyzeNetworkTraffic(data);
        break;

      case 'get_status':
        result = await xdr.getStatus();
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('XDR API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// GET /api/xdr/status - Get system status
export async function GET() {
  try {
    const xdr = new XDRCore();
    const status = await xdr.getStatus();

    return NextResponse.json({
      success: true,
      data: status,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('XDR Status API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'XDR Core not available',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
