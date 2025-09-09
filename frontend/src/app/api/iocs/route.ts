// API routes for IOC management
import { NextRequest, NextResponse } from 'next/server';
import { IOCService } from '@/lib/ioc-service';

// GET /api/iocs - List IOCs with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Build filters
    const filters: any = {};
    const pagination: any = {};

    // Pagination
    pagination.page = parseInt(searchParams.get('page') || '1');
    pagination.limit = parseInt(searchParams.get('limit') || '20');

    // Filters
    if (searchParams.get('type')) filters.type = searchParams.get('type');
    if (searchParams.get('severity')) filters.severity = searchParams.get('severity');
    if (searchParams.get('minConfidence')) filters.minConfidence = searchParams.get('minConfidence');
    if (searchParams.get('status')) filters.status = searchParams.get('status');
    if (searchParams.get('search')) filters.search = searchParams.get('search');

    const result = await IOCService.getIOCs(filters, pagination);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching IOCs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch IOCs' },
      { status: 500 }
    );
  }
}

// POST /api/iocs - Create new IOC
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { indicator_type, value, confidence, severity, source, tags, context } = body;

    // Validate required fields
    if (!indicator_type || !value || !source) {
      return NextResponse.json(
        { error: 'Missing required fields: indicator_type, value, source' },
        { status: 400 }
      );
    }

    const result = await IOCService.createIOC({
      indicator_type,
      value,
      confidence,
      severity,
      source,
      tags,
      context
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating IOC:', error);
    return NextResponse.json(
      { error: 'Failed to create IOC' },
      { status: 500 }
    );
  }
}
