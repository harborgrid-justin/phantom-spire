import { NextResponse } from 'next/server';
import { experimentsService } from '@/services/experiments';

export async function GET() {
  const data = await experimentsService.getExperiments({
    id: 'get_experiments_req',
    type: 'getExperiments',
    data: null,
    metadata: { category: 'experiments', module: 'experiments-page', version: '1.0.0' },
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
