import { NextResponse } from 'next/server';
import { threatIntelligenceMarketplaceService } from '@/features/threat-intelligence/lib';

export async function GET() {
  const data = await threatIntelligenceMarketplaceService.getThreatModels({
    id: 'get_threat_models_req',
    type: 'getThreatModels',
    data: null,
    metadata: { category: 'marketplace', module: 'marketplace-page', version: '1.0.0' },
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
