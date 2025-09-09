// API route for CVE statistics

import { NextResponse } from 'next/server';
import { cveService } from '@/lib/services/cve-service';

export async function GET() {
  try {
    const statistics = await cveService.getCVEStatistics();
    
    return NextResponse.json(statistics);
  } catch (error) {
    console.error('Failed to fetch CVE statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch CVE statistics' },
      { status: 500 }
    );
  }
}
