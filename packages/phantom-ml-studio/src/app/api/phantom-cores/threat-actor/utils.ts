// Utility functions for Threat Actor API

import { ApiResponse } from './types';

/**
 * Create a standardized API response
 */
export function createApiResponse<T>(
  success: boolean,
  data?: T,
  error?: string
): ApiResponse<T> {
  const response: ApiResponse<T> = {
    success,
    source: 'phantom-threat-actor-core',
    timestamp: new Date().toISOString()
  };
  
  if (data !== undefined) {
    response.data = data;
  }
  
  if (error !== undefined) {
    response.error = error;
  }
  
  return response;
}

/**
 * Generate random actor analysis ID
 */
export function generateActorAnalysisId(): string {
  return 'actor-analysis-' + Date.now();
}

/**
 * Generate random actor profile ID
 */
export function generateActorProfileId(): string {
  return 'actor-profile-' + Date.now();
}

/**
 * Generate random campaign tracking ID
 */
export function generateCampaignTrackingId(): string {
  return 'campaign-track-' + Date.now();
}

/**
 * Generate random attribution ID
 */
export function generateAttributionId(): string {
  return 'attribution-' + Date.now();
}

/**
 * Generate random intelligence report ID
 */
export function generateIntelligenceId(): string {
  return 'intel-report-' + Date.now();
}

/**
 * Generate random hunt ID
 */
export function generateHuntId(): string {
  return 'hunt-' + Date.now();
}

/**
 * Generate random number within range
 */
export function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate random confidence score (0.5 - 1.0)
 */
export function randomConfidence(): number {
  return Math.random() * 0.5 + 0.5;
}

/**
 * Generate random high confidence score (0.7 - 1.0)
 */
export function randomHighConfidence(): number {
  return Math.random() * 0.3 + 0.7;
}

/**
 * Generate random attribution score (60-95)
 */
export function randomAttributionScore(): number {
  return randomInRange(60, 95);
}

/**
 * Generate random confidence score in range (0.75-0.95)
 */
export function randomHighConfidenceRange(): number {
  return Math.random() * 0.2 + 0.75;
}

/**
 * Get random item from array
 */
export function getRandomItem<T>(array: T[]): T {
  const index = Math.floor(Math.random() * array.length);
  return array[index] as T;
}

/**
 * Get random items from array
 */
export function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * Handle API errors consistently
 */
export function handleError(error: unknown): ApiResponse {
  console.error('Threat Actor API error:', error);
  return createApiResponse(
    false,
    undefined,
    error instanceof Error ? error.message : 'Unknown error'
  );
}

/**
 * Log operation for debugging
 */
export function logOperation(operation: string, params?: any): void {
  console.log('Threat Actor API - Received operation:', operation);
  if (params) {
    console.log('Threat Actor API - Params:', JSON.stringify(params, null, 2));
  }
}

/**
 * Common APT group names
 */
export const APT_GROUPS = [
  'APT29 (Cozy Bear)',
  'APT28 (Fancy Bear)',
  'Lazarus Group',
  'APT1 (Comment Crew)',
  'APT40 (Leviathan)',
  'APT41',
  'Carbanak',
  'Equation Group',
  'Turla',
  'Sandworm'
];

/**
 * Common cybercriminal groups
 */
export const CYBERCRIMINAL_GROUPS = [
  'FIN7',
  'FIN8',
  'FIN11',
  'Evil Corp',
  'Conti',
  'REvil',
  'LockBit',
  'BlackCat'
];

/**
 * Common hacktivist groups
 */
export const HACKTIVIST_GROUPS = [
  'Anonymous',
  'LulzSec',
  'Syrian Electronic Army',
  'Cyber Caliphate',
  'Ghost Squad Hackers'
];

/**
 * Common threat actor aliases
 */
export const THREAT_ACTOR_ALIASES = [
  'Shadow Dragon',
  'Phantom Phoenix',
  'Dark Eagle',
  'Steel Lynx',
  'Crimson Viper',
  'Ghost Wolf',
  'Iron Spider',
  'Silent Falcon'
];

/**
 * Common origins/countries
 */
export const ORIGINS = [
  'Russian Federation',
  'China',
  'North Korea',
  'Iran',
  'United States',
  'Israel',
  'Ukraine',
  'Unknown'
];

/**
 * Common sophistication levels
 */
export const SOPHISTICATION_LEVELS = [
  'Basic',
  'Intermediate',
  'Advanced',
  'Expert'
];

/**
 * Common actor types
 */
export const ACTOR_TYPES = [
  'Nation State',
  'Cybercriminal',
  'Hacktivist',
  'Insider Threat',
  'Advanced Persistent Threat'
];

/**
 * Common threat levels
 */
export const THREAT_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

/**
 * Common motivations
 */
export const MOTIVATIONS = [
  'Espionage',
  'Financial Gain',
  'Ideological',
  'Intelligence Gathering',
  'Sabotage',
  'Reputation',
  'Personal Vendetta'
];

/**
 * Common target sectors
 */
export const TARGET_SECTORS = [
  'Government',
  'Healthcare',
  'Technology',
  'Financial',
  'Defense',
  'Energy',
  'Telecommunications',
  'Manufacturing',
  'Education',
  'Retail'
];

/**
 * Common target regions
 */
export const TARGET_REGIONS = [
  'North America',
  'Europe',
  'Asia Pacific',
  'Middle East',
  'Latin America',
  'Africa'
];

/**
 * Common attack vectors
 */
export const ATTACK_VECTORS = [
  'Spear phishing campaigns',
  'Supply chain attacks',
  'Zero-day exploits',
  'Living off the land techniques',
  'Social engineering',
  'Watering hole attacks',
  'Malicious attachments',
  'Drive-by downloads'
];

/**
 * Common attribution factors
 */
export const ATTRIBUTION_FACTORS = [
  'TTP Overlap',
  'Infrastructure Reuse',
  'Target Profile',
  'Tool Usage',
  'Operational Patterns',
  'Code Similarities',
  'Infrastructure',
  'Targeting',
  'Operational Timing',
  'Technical Infrastructure Overlap',
  'Geopolitical Motivations'
];

/**
 * Common campaign statuses
 */
export const CAMPAIGN_STATUSES = [
  'Active',
  'Dormant',
  'Completed',
  'Monitored',
  'Suspended'
];

/**
 * Common defense recommendations
 */
export const DEFENSE_RECOMMENDATIONS = [
  'Enhanced email security controls',
  'Network segmentation',
  'Privileged access management',
  'Advanced endpoint detection',
  'Multi-factor authentication',
  'Regular security awareness training',
  'Threat intelligence integration',
  'Incident response planning'
];

/**
 * Generate random actor profile
 */
export function generateRandomActorProfile(actorType?: string): {
  name: string;
  aliases: string[];
  type: string;
  sophistication_level: string;
  motivation: string;
  origin_country: string;
} {
  const type = actorType || getRandomItem(ACTOR_TYPES);
  
  let name: string;
  let origin: string;
  let motivation: string;
  
  switch (type) {
    case 'apt_group':
    case 'Nation State':
      name = getRandomItem(APT_GROUPS);
      origin = getRandomItem(['Russian Federation', 'China', 'North Korea', 'Iran']);
      motivation = 'Espionage';
      break;
    case 'cybercriminal_group':
    case 'Cybercriminal':
      name = getRandomItem(CYBERCRIMINAL_GROUPS);
      origin = 'Unknown';
      motivation = 'Financial Gain';
      break;
    case 'hacktivist':
    case 'Hacktivist':
      name = getRandomItem(HACKTIVIST_GROUPS);
      origin = 'Unknown';
      motivation = 'Ideological';
      break;
    default:
      name = getRandomItem(APT_GROUPS);
      origin = getRandomItem(ORIGINS);
      motivation = getRandomItem(MOTIVATIONS);
  }
  
  return {
    name,
    aliases: getRandomItems(THREAT_ACTOR_ALIASES, 3),
    type: type,
    sophistication_level: getRandomItem(SOPHISTICATION_LEVELS),
    motivation,
    origin_country: origin
  };
}

/**
 * Generate random campaign
 */
export function generateRandomCampaign(actor?: string): {
  id: string;
  name: string;
  actor: string;
  status: string;
  start_date: string;
  targets: string;
  indicators: number;
  confidence: number;
} {
  const campaignNames = [
    'Operation Shadow Strike',
    'Operation Dark Phoenix',
    'Operation Steel Dragon',
    'Operation Ghost Wolf',
    'Operation Silent Falcon',
    'Operation Crimson Viper',
    'Operation Iron Spider'
  ];
  
  return {
    id: 'camp-' + randomInRange(100, 999),
    name: getRandomItem(campaignNames),
    actor: actor || getRandomItem(APT_GROUPS),
    status: getRandomItem(CAMPAIGN_STATUSES),
    start_date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    targets: getRandomItems(TARGET_SECTORS, 2).join(', '),
    indicators: randomInRange(50, 500),
    confidence: Math.random() * 0.3 + 0.7
  };
}

/**
 * Generate random attribution
 */
export function generateRandomAttribution(): {
  incident_id: string;
  attributed_actor: string;
  confidence: number;
  factors: string[];
  timestamp: string;
} {
  return {
    incident_id: 'inc-' + randomInRange(100, 999),
    attributed_actor: getRandomItem(APT_GROUPS),
    confidence: randomConfidence(),
    factors: getRandomItems(ATTRIBUTION_FACTORS, randomInRange(2, 4)),
    timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
  };
}

/**
 * Generate random hunt match
 */
export function generateRandomHuntMatch(): {
  actor: string;
  match_type: string;
  confidence: number;
  evidence: string;
} {
  const matchTypes = ['infrastructure', 'ttp', 'malware', 'campaign'];
  const evidenceMap = {
    infrastructure: 'Shared C2 server infrastructure',
    ttp: 'Similar registry persistence mechanism',
    malware: 'Code similarity in malware samples',
    campaign: 'Related campaign targeting patterns'
  };
  
  const matchType = getRandomItem(matchTypes);
  
  return {
    actor: getRandomItem(APT_GROUPS),
    match_type: matchType,
    confidence: randomConfidence(),
    evidence: evidenceMap[matchType as keyof typeof evidenceMap]
  };
}

/**
 * Generate random emerging threat
 */
export function generateRandomEmergingThreat(): {
  actor: string;
  threat_type: string;
  risk_level: string;
  description: string;
} {
  const threatTypes = [
    'Hybrid APT/Cybercriminal',
    'AI-Enhanced Operations',
    'Supply Chain Focus',
    'Cloud Infrastructure Targeting',
    'IoT Botnet Development'
  ];
  
  const descriptions = [
    'Increased targeting of cloud infrastructure',
    'Integration of AI tools in social engineering',
    'Focus on supply chain vulnerabilities',
    'Advanced persistent access techniques',
    'Novel evasion techniques'
  ];
  
  return {
    actor: getRandomItem([...APT_GROUPS, ...CYBERCRIMINAL_GROUPS]),
    threat_type: getRandomItem(threatTypes),
    risk_level: getRandomItem(['High', 'Critical', 'Medium']),
    description: getRandomItem(descriptions)
  };
}

/**
 * Generate random technical indicators
 */
export function generateTechnicalIndicators(): {
  malware_similarity: number;
  infrastructure_reuse: number;
  ttp_overlap: number;
  code_similarity: number;
} {
  return {
    malware_similarity: Math.random() * 0.2 + 0.8, // 0.8-1.0
    infrastructure_reuse: Math.random() * 0.3 + 0.6, // 0.6-0.9
    ttp_overlap: Math.random() * 0.2 + 0.8, // 0.8-1.0
    code_similarity: Math.random() * 0.3 + 0.7 // 0.7-1.0
  };
}

/**
 * Generate random matching factors
 */
export function generateMatchingFactors(count: number = 4): string[] {
  const factors = [
    'Attack pattern similarity: 94%',
    'Infrastructure overlap: 87%',
    'Target profile match: 92%',
    'Operational timing correlation: 89%',
    'Tool usage similarity: 85%',
    'Code reuse patterns: 78%',
    'Network infrastructure: 82%',
    'Persistence mechanisms: 90%'
  ];
  
  return getRandomItems(factors, count);
}

/**
 * Generate strategic recommendations
 */
export const STRATEGIC_RECOMMENDATIONS = [
  'Enhanced monitoring of Russian and Chinese APT groups',
  'Increased focus on healthcare sector protection',
  'Development of AI-aware detection capabilities',
  'Strengthened international threat intelligence sharing',
  'Investment in quantum-resistant cryptography preparation',
  'Advanced behavioral analytics implementation',
  'Supply chain security enhancement',
  'Zero-trust architecture adoption'
];

/**
 * Generate hunt recommendations
 */
export const HUNT_RECOMMENDATIONS = [
  'Investigate infrastructure connections',
  'Review related campaigns',
  'Update threat actor profiles',
  'Expand IOC collection',
  'Enhance attribution models',
  'Cross-reference with historical data'
];

/**
 * Generate campaign names
 */
export const CAMPAIGN_NAMES = [
  'Operation Shadow Dragon',
  'Operation Dark Phoenix',
  'Operation Steel Lynx',
  'Operation Ghost Protocol',
  'Operation Silent Storm',
  'Operation Crimson Tide',
  'Operation Iron Curtain',
  'Operation Digital Fortress'
];

/**
 * Generate random time ago (within specified hours)
 */
export function generateRandomTimeAgo(maxHours: number): string {
  const hoursAgo = Math.random() * maxHours;
  return new Date(Date.now() - hoursAgo * 3600000).toISOString();
}

/**
 * Generate behavioral patterns description
 */
export function generateBehavioralPatterns(): {
  operational_timing: string;
  target_selection: string;
  attack_methodology: string;
  persistence_mechanisms: string;
} {
  return {
    operational_timing: 'Consistent with APT29 historical patterns',
    target_selection: 'Aligns with known APT29 interests',
    attack_methodology: 'High correlation with previous campaigns',
    persistence_mechanisms: 'Matches APT29 preferred techniques'
  };
}

/**
 * Generate attribution recommendations
 */
export const ATTRIBUTION_RECOMMENDATIONS = [
  'High confidence attribution to APT29 based on comprehensive analysis',
  'Monitor for additional indicators consistent with APT29 operations',
  'Implement APT29-specific detection and mitigation strategies',
  'Review and update threat intelligence profiles',
  'Coordinate response with APT29 historical campaign knowledge'
];
