// GET request handlers for IOC API

import { createApiResponse, generateAnalysisId, generateIOCId, randomConfidence, randomThreatScore, generateRecentDate, getRandomItem, getRandomItems, MALWARE_FAMILIES, CAMPAIGN_NAMES, THREAT_SOURCES, IOC_TYPES } from '../utils';
import { IOCStatus, IOCAnalysis, IOCItem, TrendingIOC, IOCFeed, ApiResponse } from '../types';

/**
 * Handle status operation
 */
export function handleStatus(): ApiResponse<IOCStatus> {
  const data: IOCStatus = {
    status: 'operational',
    components: {
      enrichment_engine: 'operational',
      correlation_engine: 'operational',
      ingestion_pipeline: 'operational',
      validation_service: 'operational'
    },
    metrics: {
      uptime: '99.8%',
      total_iocs: 2456789,
      active_iocs: 1247,
      detection_rate: 0.967,
      false_positive_rate: 0.023
    },
    system_overview: {
      overall_status: 'operational',
      system_health: 'excellent',
      uptime: '99.8%',
      total_indicators: 2456789,
      new_indicators_today: 1247
    },
    indicator_distribution: {
      ip_addresses: 856432,
      domains: 734567,
      file_hashes: 523456,
      urls: 245678,
      email_addresses: 96656
    },
    threat_classification: {
      malware: 934567,
      phishing: 456789,
      botnet: 234567,
      apt: 123456,
      unknown: 707410
    },
    processing_metrics: {
      ingestion_rate: '1,247 IOCs/min',
      enrichment_queue: 156,
      validation_accuracy: 0.967,
      false_positive_rate: 0.023
    },
    data_sources: {
      feeds_active: 34,
      manual_submissions: 12,
      api_integrations: 8,
      automated_collection: 15
    }
  };

  return createApiResponse(true, data);
}

/**
 * Handle analysis operation
 */
export function handleAnalysis(): ApiResponse<IOCAnalysis> {
  const data: IOCAnalysis = {
    analysis_id: generateAnalysisId(),
    indicator_profile: {
      value: '192.168.1.100',
      type: 'ip_address',
      first_seen: '2024-01-10T08:00:00Z',
      last_seen: '2024-01-15T09:30:00Z',
      confidence: 0.94,
      threat_score: 85
    },
    threat_context: {
      malware_families: ['Emotet', 'TrickBot'],
      campaign_associations: ['Operation Shadow Dragon', 'APT29 Campaign'],
      geolocation: {
        country: 'Russian Federation',
        city: 'Moscow',
        isp: 'Evil ISP Inc.'
      },
      network_behavior: {
        port_scanning: true,
        c2_communication: true,
        data_exfiltration: false,
        lateral_movement: true
      }
    },
    enrichment_data: {
      whois_info: {
        registrar: 'Evil Registrar',
        creation_date: '2023-12-01T00:00:00Z',
        expiration_date: '2024-12-01T00:00:00Z'
      },
      dns_records: ['A: 192.168.1.100', 'MX: mail.evil.com'],
      ssl_certificates: [],
      reputation_scores: {
        virustotal: 15,
        abuseipdb: 85,
        threatminer: 72
      }
    },
    related_indicators: [
      { value: 'evil-domain.com', type: 'domain', relationship: 'resolves_to' },
      { value: 'a1b2c3d4e5f6', type: 'file_hash', relationship: 'downloads_from' },
      { value: 'attacker@evil.com', type: 'email', relationship: 'communicates_with' }
    ],
    recommendations: [
      'Block IP address at perimeter firewalls',
      'Monitor for related indicators in network traffic',
      'Review historical connections to this IP',
      'Update threat intelligence feeds',
      'Implement additional network monitoring rules'
    ]
  };

  return createApiResponse(true, data);
}

/**
 * Handle recent operation
 */
export function handleRecent(): ApiResponse<{ timeframe: string; total_new_iocs: number; high_confidence: number; iocs: IOCItem[] }> {
  const iocs: IOCItem[] = [
    {
      id: generateIOCId(),
      value: '192.168.1.100',
      type: IOC_TYPES.IP_ADDRESS,
      confidence: 0.95,
      threat_score: 92,
      first_seen: '2024-01-15T08:00:00Z',
      source: getRandomItem(THREAT_SOURCES),
      campaigns: ['APT29']
    },
    {
      id: generateIOCId(),
      value: 'malicious-domain.com',
      type: IOC_TYPES.DOMAIN,
      confidence: 0.89,
      threat_score: 87,
      first_seen: '2024-01-15T07:30:00Z',
      source: getRandomItem(THREAT_SOURCES),
      campaigns: ['Operation Shadow Dragon']
    },
    {
      id: generateIOCId(),
      value: 'a1b2c3d4e5f6789',
      type: IOC_TYPES.FILE_HASH,
      confidence: 0.97,
      threat_score: 95,
      first_seen: '2024-01-15T07:00:00Z',
      source: getRandomItem(THREAT_SOURCES),
      campaigns: ['Emotet Campaign']
    }
  ];

  const data = {
    timeframe: '24h',
    total_new_iocs: 1247,
    high_confidence: 234,
    iocs
  };

  return createApiResponse(true, data);
}

/**
 * Handle trending operation
 */
export function handleTrending(): ApiResponse<{ trending_iocs: TrendingIOC[] }> {
  const trending_iocs: TrendingIOC[] = [
    {
      value: '203.0.113.5',
      type: IOC_TYPES.IP_ADDRESS,
      mentions: 456,
      trend: 'increasing',
      campaigns: ['Botnet Campaign']
    },
    {
      value: 'suspicious-site.com',
      type: IOC_TYPES.DOMAIN,
      mentions: 234,
      trend: 'stable',
      campaigns: ['Phishing Campaign']
    },
    {
      value: 'f1e2d3c4b5a6',
      type: IOC_TYPES.FILE_HASH,
      mentions: 189,
      trend: 'decreasing',
      campaigns: ['Malware Family X']
    }
  ];

  const data = {
    trending_iocs
  };

  return createApiResponse(true, data);
}

/**
 * Handle feeds operation
 */
export function handleFeeds(): ApiResponse<{ total_feeds: number; active_feeds: number; feeds: IOCFeed[] }> {
  const feeds: IOCFeed[] = [
    {
      id: 'feed-001',
      name: 'VirusTotal Intelligence',
      type: 'commercial',
      status: 'active',
      last_update: '2024-01-15T10:30:00Z',
      indicators_today: 5623,
      quality_score: 0.95
    },
    {
      id: 'feed-002',
      name: 'MISP Community',
      type: 'open_source',
      status: 'active',
      last_update: '2024-01-15T10:25:00Z',
      indicators_today: 2847,
      quality_score: 0.87
    },
    {
      id: 'feed-003',
      name: 'Internal IOC Feed',
      type: 'internal',
      status: 'active',
      last_update: '2024-01-15T10:20:00Z',
      indicators_today: 234,
      quality_score: 0.98
    }
  ];

  const data = {
    total_feeds: 34,
    active_feeds: 32,
    feeds
  };

  return createApiResponse(true, data);
}
