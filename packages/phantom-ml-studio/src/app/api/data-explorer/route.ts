import 'server-only';
import { NextResponse } from 'next/server';
import { dataExplorerService } from '@/services/data-explorer';

export async function GET() {
  const data = await dataExplorerService.getDatasets({
    id: 'get_datasets_req',
    type: 'getDatasets',
    data: null,
    metadata: { category: 'data-explorer', module: 'data-explorer-page', version: '1.0.0' },
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
