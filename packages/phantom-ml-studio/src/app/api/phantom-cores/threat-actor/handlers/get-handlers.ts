// GET request handlers for Threat Actor API

import { createApiResponse, generateActorAnalysisId, randomInRange, getRandomItem, getRandomItems, generateRandomCampaign, generateRandomAttribution, APT_GROUPS, TARGET_SECTORS, DEFENSE_RECOMMENDATIONS, generateRandomTimeAgo } from '../utils';
import { ThreatActorStatus, ThreatActorAnalysis, ActorsData, CampaignsData, AttributionData, ApiResponse } from '../types';

/**
 * Handle status operation
 */
export function handleStatus(): ApiResponse<ThreatActorStatus> {
  const data: ThreatActorStatus = {
    status: 'operational',
    components: {
      actor_profiler: 'operational',
      attribution_engine: 'operational',
      campaign_tracker: 'operational',
      intelligence_aggregator: 'operational'
    },
    metrics: {
      uptime: '99.9%',
      tracked_actors: 289,
      active_campaigns: 45,
      attribution_confidence: 87.4
    },
    system_overview: {
      overall_status: 'operational',
      system_health: 'excellent',
      uptime: '99.9%',
      tracked_actors: 289,
      active_campaigns: 45
    },
    actor_intelligence: {
      apt_groups: 156,
      cybercriminal_groups: 89,
      insider_threats: 23,
      hacktivist_groups: 21,
      nation_state_actors: 67
    },
    attribution_metrics: {
      high_confidence: 234,
      medium_confidence: 567,
      low_confidence: 123,
      attribution_accuracy: 0.894,
      false_positive_rate: 0.056
    },
    activity_tracking: {
      campaigns_analyzed: 1247,
      ttps_mapped: 5678,
      indicators_attributed: 23456,
      timeline_reconstructions: 345
    },
    intelligence_sources: {
      osint: { active: 34, quality: 0.87 },
      commercial: { active: 15, quality: 0.94 },
      government: { active: 8, quality: 0.96 },
      community: { active: 12, quality: 0.82 }
    }
  };

  return createApiResponse(true, data);
}

/**
 * Handle analysis operation
 */
export function handleAnalysis(): ApiResponse<ThreatActorAnalysis> {
  const data: ThreatActorAnalysis = {
    analysis_id: generateActorAnalysisId(),
    actor_profile: {
      name: 'APT29 (Cozy Bear)',
      aliases: ['The Dukes', 'CozyDuke', 'Nobelium'],
      classification: 'Advanced Persistent Threat',
      origin: 'Russian Federation',
      active_since: '2008',
      sophistication_level: 'Advanced'
    },
    attribution_assessment: {
      confidence_score: 0.91,
      attribution_factors: [
        'Technical infrastructure overlap',
        'Tactical, Techniques, and Procedures (TTPs)',
        'Target selection patterns',
        'Geopolitical motivations',
        'Operational security patterns'
      ],
      supporting_evidence: {
        infrastructure: 'Shared C2 infrastructure with previous campaigns',
        ttps: 'Consistent use of spearphishing and registry persistence',
        targeting: 'Focus on government and healthcare sectors',
        timing: 'Operations aligned with geopolitical events'
      }
    },
    operational_profile: {
      primary_motivation: 'Espionage',
      secondary_motivations: ['Intelligence Gathering', 'State Interests'],
      target_sectors: ['Government', 'Healthcare', 'Technology', 'Defense'],
      target_regions: ['North America', 'Europe', 'Asia Pacific'],
      attack_lifecycle: {
        initial_access: ['Spearphishing Email', 'Supply Chain'],
        persistence: ['Registry Modification', 'Scheduled Tasks'],
        privilege_escalation: ['Valid Accounts', 'Process Injection'],
        command_control: ['Web Protocols', 'DNS Tunneling']
      }
    },
    campaign_history: [
      {
        name: 'Operation Shadow Dragon',
        timeframe: '2024-01-01 to Present',
        targets: 'Government Healthcare',
        status: 'Active',
        iocs: 247
      },
      {
        name: 'SolarWinds Supply Chain Attack',
        timeframe: '2019-2020',
        targets: 'Technology Government',
        status: 'Completed',
        iocs: 1456
      },
      {
        name: 'COVID-19 Themed Campaign',
        timeframe: '2020-2021',
        targets: 'Healthcare Research',
        status: 'Dormant',
        iocs: 678
      }
    ],
    threat_assessment: {
      current_threat_level: 'HIGH',
      likelihood_of_attack: 0.78,
      potential_impact: 'CRITICAL',
      recommended_defenses: getRandomItems(DEFENSE_RECOMMENDATIONS, 4)
    }
  };

  return createApiResponse(true, data);
}

/**
 * Handle actors operation
 */
export function handleActors(): ApiResponse<ActorsData> {
  const data: ActorsData = {
    total_actors: 289,
    active_actors: 156,
    actors: [
      {
        id: 'actor-001',
        name: 'APT29 (Cozy Bear)',
        type: 'Nation State',
        origin: 'Russian Federation',
        sophistication: 'Advanced',
        active_campaigns: 3,
        last_activity: generateRandomTimeAgo(24),
        threat_level: 'HIGH'
      },
      {
        id: 'actor-002',
        name: 'Lazarus Group',
        type: 'Nation State',
        origin: 'North Korea',
        sophistication: 'Advanced',
        active_campaigns: 2,
        last_activity: generateRandomTimeAgo(48),
        threat_level: 'HIGH'
      },
      {
        id: 'actor-003',
        name: 'FIN7',
        type: 'Cybercriminal',
        origin: 'Unknown',
        sophistication: 'Intermediate',
        active_campaigns: 1,
        last_activity: generateRandomTimeAgo(72),
        threat_level: 'MEDIUM'
      },
      {
        id: 'actor-004',
        name: 'APT28 (Fancy Bear)',
        type: 'Nation State',
        origin: 'Russian Federation',
        sophistication: 'Advanced',
        active_campaigns: 4,
        last_activity: generateRandomTimeAgo(12),
        threat_level: 'HIGH'
      }
    ]
  };

  return createApiResponse(true, data);
}

/**
 * Handle campaigns operation
 */
export function handleCampaigns(): ApiResponse<CampaignsData> {
  const campaigns = [
    generateRandomCampaign('APT29'),
    generateRandomCampaign('Lazarus Group'),
    generateRandomCampaign('APT28')
  ];

  // Override specific campaigns with predefined data
  campaigns[0] = {
    id: 'camp-001',
    name: 'Operation Shadow Dragon',
    actor: 'APT29',
    status: 'Active',
    start_date: '2024-01-01T00:00:00Z',
    targets: 'Government, Healthcare',
    indicators: 247,
    confidence: 0.91
  };

  campaigns[1] = {
    id: 'camp-002',
    name: 'Financial Heist Campaign',
    actor: 'Lazarus Group',
    status: 'Active',
    start_date: '2024-01-05T00:00:00Z',
    targets: 'Banking, Cryptocurrency',
    indicators: 156,
    confidence: 0.87
  };

  campaigns[2] = {
    id: 'camp-003',
    name: 'Supply Chain Infiltration',
    actor: 'APT28',
    status: 'Monitored',
    start_date: '2023-12-15T00:00:00Z',
    targets: 'Technology, Defense',
    indicators: 389,
    confidence: 0.94
  };

  const data: CampaignsData = {
    total_campaigns: 1247,
    active_campaigns: 45,
    campaigns
  };

  return createApiResponse(true, data);
}

/**
 * Handle attribution operation
 */
export function handleAttribution(): ApiResponse<AttributionData> {
  const attributions = [
    generateRandomAttribution(),
    generateRandomAttribution(),
    generateRandomAttribution()
  ];

  // Override with specific data
  attributions[0] = {
    incident_id: 'inc-001',
    attributed_actor: 'APT29',
    confidence: 0.89,
    factors: ['TTP Overlap', 'Infrastructure Reuse', 'Target Profile'],
    timestamp: generateRandomTimeAgo(6)
  };

  attributions[1] = {
    incident_id: 'inc-002',
    attributed_actor: 'FIN7',
    confidence: 0.76,
    factors: ['Tool Usage', 'Operational Patterns'],
    timestamp: generateRandomTimeAgo(12)
  };

  attributions[2] = {
    incident_id: 'inc-003',
    attributed_actor: 'Lazarus Group',
    confidence: 0.94,
    factors: ['Code Similarities', 'Infrastructure', 'Targeting'],
    timestamp: generateRandomTimeAgo(18)
  };

  const data: AttributionData = {
    recent_attributions: attributions
  };

  return createApiResponse(true, data);
}
