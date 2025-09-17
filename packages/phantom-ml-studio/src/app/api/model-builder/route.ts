import { NextResponse } from 'next/server';
import { modelBuilderService } from '@/services/model-builder';

export async function POST(request: Request) {
  const { config, data } = await request.json();
  const result = await modelBuilderService.startTraining({
    id: 'start_training_req',
    type: 'startTraining',
    data: { config, columns: data.columns || [] },
    metadata: { category: 'model-builder', module: 'model-builder-page', version: '1.0.0' },
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
}, (progress) => {
    console.log(`Training progress: ${progress}%`);
  });
  return NextResponse.json(result);
}
