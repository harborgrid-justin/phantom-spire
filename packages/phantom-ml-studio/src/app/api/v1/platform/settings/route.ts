import { NextResponse } from 'next/server';
import { settingsService } from '@/services/settings';

export async function GET() {
  const data = await settingsService.getSettings({
    id: 'get_settings_req',
    type: 'getSettings',
    data: null,
    metadata: { category: 'settings', module: 'settings-page', version: '1.0.0' },
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
