import { NextResponse } from 'next/server';
import { automlPipelineVisualizerService } from '@/features/automl-pipeline-visualizer/lib';

export async function GET() {
  const data = await automlPipelineVisualizerService.getAutoMLExperiment({
    id: 'req-automl-exp',
    type: 'getAutoMLExperiment',
    data: { experimentId: 'exp-security-ml-001' },
    metadata: { category: 'automl', module: 'automl-page', version: '1.0.0' },
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
