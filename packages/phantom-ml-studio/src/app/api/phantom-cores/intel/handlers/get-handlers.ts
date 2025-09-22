// GET request handlers for Intel API

import { createApiResponse, generateStatusId, generateAnalysisId, randomInRange, randomConfidence, generatePastTimestamp, generateRecentTimestamp, getRandomItem, getRandomItems, THREAT_LEVELS, SOPHISTICATION_LEVELS, MOTIVATIONS, ORIGINS, THREAT_TYPES, CAMPAIGN_NAMES, THREAT_ACTORS, GEOLOCATIONS, MITRE_TACTICS, TARGETING_SECTORS } from '../utils';
import { IntelStatus, ThreatAnalysis, Campaign, ThreatActor, IntelFeed, ApiResponse } from '../types';

/**
 * Handle status operation
 */
export function handleStatus(): ApiResponse<IntelStatus> {
  const data: IntelStatus = {
    status_id: generateStatusId(),
    system_overview: {
      overall_status: 'operational',
      system_health: 'excellent',
      uptime: '99.9%',
      active_feeds: 47,
      intelligence_db_size: '12.4M indicators'
    },
    intelligence_sources: {
      osint: { active: 23, status: 'healthy', reliability: 0.87 },
      sigint: { active: 8, status: 'healthy', reliability: 0.94 },
      humint: { active: 5, status: 'healthy', reliability: 0.96 },
      technical: { active: 11, status: 'healthy', reliability: 0.91 }
    },
    collection_metrics: {
      indicators_collected_today: 45672,
      reports_generated: 127,
      intelligence_processed: 892467,
      quality_score: 0.923
    },
    threat_landscape: {
      active_campaigns: 23,
      new_campaigns_today: 3,
      threat_actors_tracked: 156,
      iocs_flagged: 2347
    }
  };

  return createApiResponse(true, data);
}

/**
 * Handle analysis operation
 */
export function handleAnalysis(): ApiResponse<ThreatAnalysis> {
  const data: ThreatAnalysis = {
    analysis_id: generateAnalysisId(),
    threat_assessment: {
      threat_level: THREAT_LEVELS.HIGH,
      confidence: 0.89,
      threat_type: 'Advanced Persistent Threat',
      campaign_name: 'Operation Shadow Dragon',
      first_observed: '2024-01-10T08:00:00Z',
      last_activity: '2024-01-15T09:30:00Z'
    },
    attribution: {
      threat_actor: 'APT29 (Cozy Bear)',
      confidence: 0.85,
      motivation: 'Espionage',
      targeting: 'Government, Defense, Healthcare',
      geographical_origin: 'Eastern Europe',
      sophistication_level: 'Advanced'
    },
    tactics_techniques: [
      { tactic: 'Initial Access', technique: 'Spearphishing Attachment', mitre_id: 'T1566.001' },
      { tactic: 'Persistence', technique: 'Registry Run Keys', mitre_id: 'T1547.001' },
      { tactic: 'Command and Control', technique: 'Web Protocols', mitre_id: 'T1071.001' },
      { tactic: 'Exfiltration', technique: 'Data Encrypted', mitre_id: 'T1041' }
    ],
    indicators: {
      ip_addresses: ['192.168.1.100', '10.0.0.50', '172.16.1.25'],
      domains: ['malicious-c2.com', 'evil-domain.net'],
      file_hashes: ['a1b2c3d4e5f6', 'f6e5d4c3b2a1'],
      email_addresses: ['attacker@evil.com']
    },
    recommendations: [
      'Implement enhanced email security controls',
      'Monitor for lateral movement indicators',
      'Review privileged account access',
      'Deploy additional endpoint detection rules',
      'Conduct threat hunting for similar TTPs'
    ]
  };

  return createApiResponse(true, data);
}

/**
 * Handle campaigns operation
 */
export function handleCampaigns(): ApiResponse<{ total_campaigns: number; active_campaigns: number; campaigns: Campaign[] }> {
  const campaigns: Campaign[] = [
    {
      id: 'camp-001',
      name: 'Operation Shadow Dragon',
      threat_actor: 'APT29',
      status: 'active',
      first_seen: '2024-01-10T08:00:00Z',
      targets: 'Government, Healthcare',
      severity: 'HIGH',
      indicators_count: 247
    },
    {
      id: 'camp-002',
      name: 'Cobalt Strike Campaign',
      threat_actor: 'Unknown',
      status: 'active',
      first_seen: '2024-01-12T14:30:00Z',
      targets: 'Financial Services',
      severity: 'MEDIUM',
      indicators_count: 89
    },
    {
      id: 'camp-003',
      name: 'Ransomware as a Service',
      threat_actor: 'Conti Group',
      status: 'monitored',
      first_seen: '2024-01-08T11:15:00Z',
      targets: 'Manufacturing, Energy',
      severity: 'CRITICAL',
      indicators_count: 456
    }
  ];

  const data = {
    total_campaigns: 156,
    active_campaigns: 23,
    campaigns
  };

  return createApiResponse(true, data);
}

/**
 * Handle actors operation
 */
export function handleActors(): ApiResponse<{ total_actors: number; tracked_actors: ThreatActor[] }> {
  const tracked_actors: ThreatActor[] = [
    {
      id: 'actor-001',
      name: 'APT29 (Cozy Bear)',
      aliases: ['The Dukes', 'CozyDuke', 'Nobelium'],
      origin: 'Russian Federation',
      motivation: 'Espionage',
      active_since: '2008',
      sophistication: 'Advanced',
      campaigns: 12,
      last_activity: '2024-01-15T09:30:00Z'
    },
    {
      id: 'actor-002',
      name: 'Lazarus Group',
      aliases: ['HIDDEN COBRA', 'APT38'],
      origin: 'North Korea',
      motivation: 'Financial, Espionage',
      active_since: '2009',
      sophistication: 'Advanced',
      campaigns: 8,
      last_activity: '2024-01-14T16:45:00Z'
    },
    {
      id: 'actor-003',
      name: 'FIN7',
      aliases: ['Carbanak Group'],
      origin: 'Unknown',
      motivation: 'Financial',
      active_since: '2013',
      sophistication: 'Intermediate',
      campaigns: 15,
      last_activity: '2024-01-13T12:20:00Z'
    }
  ];

  const data = {
    total_actors: 89,
    tracked_actors
  };

  return createApiResponse(true, data);
}

/**
 * Handle feeds operation
 */
export function handleFeeds(): ApiResponse<{ total_feeds: number; feed_categories: any; feeds: IntelFeed[] }> {
  const feeds: IntelFeed[] = [
    {
      id: 'feed-001',
      name: 'MISP Global Intelligence',
      category: 'osint',
      status: 'active',
      last_update: '2024-01-15T10:30:00Z',
      indicators_today: 1247,
      reliability: 0.89
    },
    {
      id: 'feed-002',
      name: 'Commercial Threat Intel',
      category: 'commercial',
      status: 'active',
      last_update: '2024-01-15T10:25:00Z',
      indicators_today: 892,
      reliability: 0.95
    },
    {
      id: 'feed-003',
      name: 'US-CERT Alerts',
      category: 'government',
      status: 'active',
      last_update: '2024-01-15T09:45:00Z',
      indicators_today: 34,
      reliability: 0.98
    }
  ];

  const data = {
    total_feeds: 47,
    feed_categories: {
      osint: 23,
      commercial: 12,
      government: 8,
      community: 4
    },
    feeds
  };

  return createApiResponse(true, data);
}
