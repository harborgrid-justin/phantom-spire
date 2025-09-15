import { NextResponse } from 'next/server';
import { realTimeMonitoringService } from '@/services/real-time-monitoring';

export async function GET() {
  const data = await realTimeMonitoringService.getModelMetrics({
    id: 'get_metrics_req',
    type: 'getModelMetrics',
    data: null,
    metadata: { category: 'monitoring', module: 'monitoring-page', version: '1.0.0' },
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
