import 'server-only';
import { NextResponse } from 'next/server';
import { modelBuilderService } from '@/services/model-builder';

export async function POST(request: Request) {
  try {
    // Input validation
    if (!request.body) {
      return NextResponse.json(
        { error: 'Request body is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { config, data } = body;

    // Validate required fields
    if (!config) {
      return NextResponse.json(
        { error: 'Configuration is required' },
        { status: 400 }
      );
    }

    if (!data || !Array.isArray(data.columns)) {
      return NextResponse.json(
        { error: 'Data with columns array is required' },
        { status: 400 }
      );
    }

    const result = await modelBuilderService.startTraining({
      id: 'start_training_req',
      type: 'startTraining',
      data: { config, columns: data.columns },
      metadata: { category: 'model-builder', module: 'model-builder-page', version: '1.0.0' },
      context: { environment: (process.env.NODE_ENV === 'test' ? 'development' : process.env.NODE_ENV) || 'development' as 'development' | 'staging' | 'production' },
      timestamp: new Date(),
    }, {
      requestId: `req-${Date.now()}`,
      startTime: new Date(),
      timeout: 30000,
      permissions: [],
      metadata: {},
      trace: {
          traceId: `trace-${Date.now()}`,
          spanId: `span-${Date.now()}`,
          sampled: true,
          baggage: {},
      }
    }, (progress: number) => {
        // Progress callback - avoid logging in production
        if (process.env.NODE_ENV === 'development') {
          console.log(`Training progress: ${progress}%`);
        }
      });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Model builder API error:', error);

    // Don't expose internal errors in production
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
