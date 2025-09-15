import { NextResponse } from 'next/server';
import { explainableAiVisualizerService } from '@/services/explainable-ai-visualizer';

export async function GET() {
  const data = await explainableAiVisualizerService.getModelExplanation({
    id: 'get_explanation_req',
    type: 'getModelExplanation',
    data: { modelId: 'threat-detector-v3' },
    metadata: { category: 'xai', module: 'xai-page', version: '1.0.0' },
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
