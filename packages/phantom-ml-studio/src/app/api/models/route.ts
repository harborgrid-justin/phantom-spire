import { NextResponse } from 'next/server';
import { modelsService } from '@/services/models';

export async function GET() {
  const data = await modelsService.getModels({
    id: 'get_models_req',
    type: 'getModels',
    data: null,
    metadata: { category: 'models', module: 'models-page', version: '1.0.0' },
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
