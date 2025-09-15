import { NextResponse } from 'next/server';
import { multiModelAbTestingService } from '@/services/multi-model-ab-testing';

export async function GET() {
  const data = await multiModelAbTestingService.getABTests({
    id: 'get_ab_tests_req',
    type: 'getABTests',
    data: null,
    metadata: { category: 'ab-testing', module: 'ab-testing-page', version: '1.0.0' },
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
