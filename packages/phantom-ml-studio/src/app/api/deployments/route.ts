import { NextResponse } from 'next/server';
import { deploymentsService } from '@/services/deployments';

export async function GET() {
  const data = await deploymentsService.getDeployments({
    id: 'get_deployments_req',
    type: 'getDeployments',
    data: null,
    metadata: { category: 'deployments', module: 'deployments-page', version: '1.0.0' },
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
