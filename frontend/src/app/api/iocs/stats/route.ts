// API route for IOC statistics
import { NextResponse } from 'next/server';
import { IOCService } from '@/lib/ioc-service';

// GET /api/iocs/stats - Get IOC statistics
export async function GET() {
  try {
    const stats = await IOCService.getStatistics();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching IOC statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch IOC statistics' },
      { status: 500 }
    );
  }
}
