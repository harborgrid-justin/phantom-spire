// API route for bulk CVE operations

import { NextRequest, NextResponse } from 'next/server';
import { cveService } from '@/lib/services/cve-service';

export async function POST(request: NextRequest) {
  try {
    const { cves } = await request.json();
    
    if (!Array.isArray(cves)) {
      return NextResponse.json(
        { error: 'CVEs must be an array' },
        { status: 400 }
      );
    }
    
    const results = await cveService.bulkCreateCVEs(cves);
    
    return NextResponse.json({
      success: true,
      created: results.length,
      results
    });
  } catch (error) {
    console.error('Failed to bulk create CVEs:', error);
    return NextResponse.json(
      { error: 'Failed to bulk create CVEs' },
      { status: 500 }
    );
  }
}
