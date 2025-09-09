// API route for CVE management

import { NextRequest, NextResponse } from 'next/server';
import { cveService } from '@/lib/services/cve-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sort = searchParams.get('sort') || 'published_date';
    const order = (searchParams.get('order') || 'DESC') as 'ASC' | 'DESC';
    
    // Extract filters
    const filters: any = {};
    
    if (searchParams.get('cve_id')) {
      filters.cve_id = searchParams.get('cve_id');
    }
    if (searchParams.get('severity')) {
      filters.severity = searchParams.get('severity');
    }
    if (searchParams.get('min_score')) {
      filters.min_score = parseFloat(searchParams.get('min_score')!);
    }
    if (searchParams.get('max_score')) {
      filters.max_score = parseFloat(searchParams.get('max_score')!);
    }
    if (searchParams.get('vendor')) {
      filters.vendor = searchParams.get('vendor');
    }
    if (searchParams.get('product')) {
      filters.product = searchParams.get('product');
    }
    if (searchParams.get('exploit_available')) {
      filters.exploit_available = searchParams.get('exploit_available') === 'true';
    }
    if (searchParams.get('status')) {
      filters.status = searchParams.get('status');
    }
    if (searchParams.get('published_after')) {
      filters.published_after = new Date(searchParams.get('published_after')!);
    }
    if (searchParams.get('published_before')) {
      filters.published_before = new Date(searchParams.get('published_before')!);
    }
    if (searchParams.get('tags')) {
      filters.tags = searchParams.get('tags')!.split(',');
    }
    
    const result = await cveService.getCVEs(filters, {
      page,
      limit,
      sort,
      order
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to fetch CVEs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch CVEs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cveData = await request.json();
    
    const result = await cveService.createCVE(cveData);
    
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Failed to create CVE:', error);
    return NextResponse.json(
      { error: 'Failed to create CVE' },
      { status: 500 }
    );
  }
}
