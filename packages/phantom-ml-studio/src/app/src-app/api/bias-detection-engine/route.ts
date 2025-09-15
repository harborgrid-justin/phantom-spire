import { NextResponse } from 'next/server';
import { biasDetectionEngineService } from '@/services/bias-detection-engine';

export async function GET() {
  const data = await biasDetectionEngineService.getModelBiasAnalysis({
    id: 'get_bias_analysis_req',
    type: 'getModelBiasAnalysis',
    data: { modelId: 'all' },
    metadata: { category: 'bias-detection', module: 'bias-detection-page', version: '1.0.0' },
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
