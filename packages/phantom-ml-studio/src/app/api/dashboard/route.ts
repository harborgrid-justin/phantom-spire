import 'server-only';
import { NextResponse } from 'next/server';
import { dashboardService } from '@/services/dashboard';

export async function GET() {
  const data = await dashboardService.getDashboardData({
    id: 'get_dashboard_req',
    type: 'getDashboardData',
    data: null,
    metadata: { category: 'dashboard', module: 'dashboard-page', version: '1.0.0' },
    context: { environment: 'development' },
    timestamp: new Date(),
  }, {
    requestId: `req-${Date.now()}`,
    startTime: new Date(),
    timeout: 5000,
    permissions: [],
    metadata: {},
    trace: {
        traceId: `trace-${Date.now()}`,
        spanId: `span-${Date.now()}`,
        sampled: true,
        baggage: {},
    }
});
  return NextResponse.json(data);
}
