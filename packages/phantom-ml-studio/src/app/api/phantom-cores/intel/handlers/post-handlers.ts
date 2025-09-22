// POST request handlers for Intel API

import { createApiResponse, generateHuntId, randomThreatScore, randomConfidence, generatePastTimestamp, generateRecentTimestamp, getRandomItem, getRandomItems, CAMPAIGN_NAMES, GEOLOCATIONS, THREAT_TYPES, ENRICHMENT_SOURCES, logOperation } from '../utils';
import { EnrichRequest, HuntRequest, IndicatorEnrichment, ThreatHuntResult, ApiResponse } from '../types';

/**
 * Handle enrich operation
 */
export function handleEnrich(params: EnrichRequest): ApiResponse<IndicatorEnrichment> {
  logOperation('enrich', params);

  const indicator = params.indicator || 'unknown';
  
  const data: IndicatorEnrichment = {
    indicator,
    enrichment: {
      threat_score: randomThreatScore(),
      first_seen: generatePastTimestamp(30), // Up to 30 days ago
      last_seen: generateRecentTimestamp(24), // Up to 24 hours ago
      associated_campaigns: getRandomItems(CAMPAIGN_NAMES, 2),
      geolocation: getRandomItem(GEOLOCATIONS),
      threat_types: getRandomItems(THREAT_TYPES, 2),
      confidence: randomConfidence()
    },
    sources: [
      { name: 'MISP', last_update: new Date().toISOString() },
      { name: 'VirusTotal', last_update: new Date().toISOString() },
      { name: 'Internal Intel', last_update: new Date().toISOString() }
    ]
  };

  return createApiResponse(true, data);
}

/**
 * Handle hunt operation
 */
export function handleHunt(params: HuntRequest): ApiResponse<ThreatHuntResult> {
  logOperation('hunt', params);

  const query = params.query || '';
  
  const data: ThreatHuntResult = {
    hunt_id: generateHuntId(),
    query,
    results: [
      {
        indicator: '192.168.1.100',
        type: 'ip_address',
        matches: 15,
        threat_score: 85,
        campaigns: ['Operation Shadow Dragon']
      },
      {
        indicator: 'malicious-domain.com',
        type: 'domain',
        matches: 8,
        threat_score: 92,
        campaigns: ['APT29 Campaign']
      }
    ],
    total_matches: 23,
    execution_time: '1.2s'
  };

  return createApiResponse(true, data);
}
