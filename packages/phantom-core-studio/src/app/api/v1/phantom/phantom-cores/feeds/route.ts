// Phantom Feeds Core API Route - Threat Feed Aggregation and Processing
// Provides REST endpoints for multi-source threat feed aggregation, processing, and intelligence fusion

import { NextRequest, NextResponse } from 'next/server';
import { createApiResponse, handleError } from '../utils';
import {
  handleStatus,
  handleHealth,
  handleEnterpriseStatus,
  handleStatistics,
  handleFeedSources,
  handleFeedMetrics,
  handleThreatFeeds,
  handleIntelligenceFusion,
  handleFeedAggregation,
  handleFeedProcessing,
  handleFeedNormalization,
  handleFeedEnrichment,
  handleFeedValidation,
  handleFeedDeduplication,
  handleFeedCorrelation,
  handleFeedDistribution,
  handleRealTimeFeed,
  handleHistoricalFeeds,
  handleCustomFeeds,
  handleFeedQuality,
  handleFeedReliability,
  handleFeedTaxonomy,
  handleFeedIntegration,
  handleFeedAlerts,
  handleFeedReporting
} from './handlers';

/**
 * GET /api/phantom-cores/feeds - Get feed system status and threat feed data
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const operation = url.searchParams.get('operation') || 'status';

    switch (operation) {
      case 'status':
        return NextResponse.json(handleStatus());

      case 'health':
        return NextResponse.json(handleHealth());

      case 'enterprise-status':
        return NextResponse.json(handleEnterpriseStatus());

      case 'statistics':
        return NextResponse.json(handleStatistics());

      case 'feed-sources':
        return NextResponse.json(handleFeedSources());

      case 'feed-metrics':
        return NextResponse.json(handleFeedMetrics());

      case 'threat-feeds':
        return NextResponse.json(handleThreatFeeds());

      case 'intelligence-fusion':
        return NextResponse.json(handleIntelligenceFusion());

      case 'real-time-feed':
        return NextResponse.json(handleRealTimeFeed());

      case 'historical-feeds':
        return NextResponse.json(handleHistoricalFeeds());

      case 'custom-feeds':
        return NextResponse.json(handleCustomFeeds());

      case 'feed-quality':
        return NextResponse.json(handleFeedQuality());

      case 'feed-reliability':
        return NextResponse.json(handleFeedReliability());

      case 'feed-taxonomy':
        return NextResponse.json(handleFeedTaxonomy());

      default:
        return NextResponse.json(
          createApiResponse(false, undefined, `Unknown feeds operation: ${operation}`),
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(handleError(error), { status: 500 });
  }
}

/**
 * POST /api/phantom-cores/feeds - Process feeds and perform intelligence operations
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation, ...params } = body;

    switch (operation) {
      case 'aggregate-feeds':
        return NextResponse.json(handleFeedAggregation(params));

      case 'process-feed':
        return NextResponse.json(handleFeedProcessing(params));

      case 'normalize-feed':
        return NextResponse.json(handleFeedNormalization(params));

      case 'enrich-feed':
        return NextResponse.json(handleFeedEnrichment(params));

      case 'validate-feed':
        return NextResponse.json(handleFeedValidation(params));

      case 'deduplicate-feed':
        return NextResponse.json(handleFeedDeduplication(params));

      case 'correlate-feeds':
        return NextResponse.json(handleFeedCorrelation(params));

      case 'distribute-feed':
        return NextResponse.json(handleFeedDistribution(params));

      case 'intelligence-fusion':
        return NextResponse.json(handleIntelligenceFusion(params));

      case 'create-custom-feed':
        return NextResponse.json(handleCustomFeeds(params));

      case 'integrate-feed':
        return NextResponse.json(handleFeedIntegration(params));

      case 'configure-alerts':
        return NextResponse.json(handleFeedAlerts(params));

      case 'generate-report':
        return NextResponse.json(handleFeedReporting(params));

      case 'real-time-processing':
        return NextResponse.json(handleRealTimeFeed(params));

      default:
        return NextResponse.json(
          createApiResponse(false, undefined, `Unknown feeds operation: ${operation}`),
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(handleError(error), { status: 500 });
  }
}

/**
 * PUT /api/phantom-cores/feeds - Update feed configurations and sources
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation, ...params } = body;

    switch (operation) {
      case 'update-feed-source':
        return NextResponse.json(handleFeedSources(params));

      case 'update-feed-config':
        return NextResponse.json(handleFeedProcessing(params));

      case 'update-quality-metrics':
        return NextResponse.json(handleFeedQuality(params));

      case 'update-reliability-score':
        return NextResponse.json(handleFeedReliability(params));

      case 'update-taxonomy':
        return NextResponse.json(handleFeedTaxonomy(params));

      default:
        return NextResponse.json(
          createApiResponse(false, undefined, `Unknown feeds update operation: ${operation}`),
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(handleError(error), { status: 500 });
  }
}

/**
 * DELETE /api/phantom-cores/feeds - Remove feeds and configurations
 */
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const operation = url.searchParams.get('operation') || 'remove-feed';

    switch (operation) {
      case 'remove-feed':
        return NextResponse.json(
          createApiResponse(true, { message: 'Threat feed removed successfully' })
        );

      case 'remove-feed-source':
        return NextResponse.json(
          createApiResponse(true, { message: 'Feed source removed successfully' })
        );

      case 'purge-old-data':
        return NextResponse.json(
          createApiResponse(true, { message: 'Old feed data purged successfully' })
        );

      default:
        return NextResponse.json(
          createApiResponse(false, undefined, `Unknown feeds delete operation: ${operation}`),
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(handleError(error), { status: 500 });
  }
}