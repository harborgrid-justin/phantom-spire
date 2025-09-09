// API routes for bulk IOC operations
import { NextRequest, NextResponse } from 'next/server';
import { IOCService } from '@/lib/ioc-service';

// POST /api/iocs/bulk - Bulk operations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation, iocIds, updates } = body;

    if (!operation || !iocIds || !Array.isArray(iocIds)) {
      return NextResponse.json(
        { error: 'Missing required fields: operation, iocIds' },
        { status: 400 }
      );
    }

    const result = await IOCService.bulkOperation(operation, iocIds, updates);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in bulk operation:', error);
    return NextResponse.json(
      { error: 'Bulk operation failed' },
      { status: 500 }
    );
  }
}
