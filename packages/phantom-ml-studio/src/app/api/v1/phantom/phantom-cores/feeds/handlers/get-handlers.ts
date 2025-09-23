// GET request handlers for Feeds API

import { createApiResponse, randomInRange, getRandomItem, FEED_TYPES, FEED_SOURCES } from '../utils';

export function handleStatus() {
  return createApiResponse(true, {
    system_health: 'operational',
    active_feeds: randomInRange(40, 60),
    total_indicators: `${randomInRange(8, 15)}M`,
    processing_rate: `${randomInRange(1000, 5000)}/hour`,
    feed_sources: {
      commercial: { active: 15, reliability: 0.92 },
      open_source: { active: 23, reliability: 0.84 },
      government: { active: 8, reliability: 0.96 },
      community: { active: 12, reliability: 0.78 }
    }
  });
}

export function handleHealth() {
  return createApiResponse(true, {
    service: 'phantom-feeds-core',
    status: 'healthy',
    version: '2.5.1',
    uptime: '99.8%'
  });
}

export function handleEnterpriseStatus() {
  return createApiResponse(true, {
    enterprise_metrics: {
      total_feeds_processed: randomInRange(50000, 100000),
      indicators_enriched: randomInRange(1000000, 2000000),
      false_positive_rate: '2.3%',
      feed_reliability_score: 0.89
    }
  });
}

export function handleStatistics() {
  return createApiResponse(true, {
    processing_stats: {
      daily_indicators: randomInRange(10000, 50000),
      feeds_updated: randomInRange(40, 80),
      correlation_matches: randomInRange(500, 2000),
      quality_score: 0.87
    }
  });
}

export function handleFeedSources() {
  return createApiResponse(true, {
    sources: FEED_SOURCES.map(source => ({
      name: source,
      type: getRandomItem(FEED_TYPES),
      status: 'active',
      reliability: Math.random() * 0.3 + 0.7,
      last_update: new Date().toISOString()
    }))
  });
}

export function handleFeedMetrics() {
  return createApiResponse(true, {
    metrics: {
      volume: randomInRange(10000, 50000),
      quality: 0.87,
      timeliness: 0.92,
      accuracy: 0.89
    }
  });
}

export function handleThreatFeeds() {
  return createApiResponse(true, {
    feeds: Array.from({length: 10}, (_, i) => ({
      feed_id: `feed-${i + 1}`,
      source: getRandomItem(FEED_SOURCES),
      type: getRandomItem(FEED_TYPES),
      indicators: randomInRange(100, 1000),
      timestamp: new Date().toISOString()
    }))
  });
}

export function handleRealTimeFeed() {
  return createApiResponse(true, {
    real_time_data: {
      current_indicators: randomInRange(50, 200),
      processing_latency: '< 2 seconds',
      stream_status: 'active'
    }
  });
}

export function handleHistoricalFeeds() {
  return createApiResponse(true, {
    historical_data: {
      retention_period: '2 years',
      archived_feeds: randomInRange(10000, 50000),
      query_performance: '< 5 seconds'
    }
  });
}

export function handleCustomFeeds() {
  return createApiResponse(true, {
    custom_feeds: {
      total_custom_feeds: randomInRange(10, 50),
      active_subscriptions: randomInRange(100, 500),
      user_created_feeds: randomInRange(5, 25)
    }
  });
}

export function handleFeedQuality() {
  return createApiResponse(true, {
    quality_metrics: {
      overall_score: 0.87,
      accuracy: 0.91,
      completeness: 0.85,
      freshness: 0.89
    }
  });
}

export function handleFeedReliability() {
  return createApiResponse(true, {
    reliability_scores: FEED_SOURCES.map(source => ({
      source,
      reliability: Math.random() * 0.3 + 0.7,
      uptime: `${randomInRange(95, 99)}.${randomInRange(1, 9)}%`
    }))
  });
}

export function handleFeedTaxonomy() {
  return createApiResponse(true, {
    taxonomy: {
      categories: FEED_TYPES.length,
      classifications: randomInRange(50, 100),
      mapping_accuracy: 0.93
    }
  });
}