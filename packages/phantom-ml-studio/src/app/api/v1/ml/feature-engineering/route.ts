import { NextResponse } from 'next/server';
import { interactiveFeatureEngineeringService } from '@/features/feature-engineering/lib';

export async function GET() {
  const data = await interactiveFeatureEngineeringService.getFeatureEngineeringPipeline({
    id: 'get_pipeline_req',
    type: 'getFeatureEngineeringPipeline',
    data: { pipelineId: 'fe-security-pipeline-001' },
    metadata: { category: 'feature-engineering', module: 'feature-engineering-page', version: '1.0.0' },
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
