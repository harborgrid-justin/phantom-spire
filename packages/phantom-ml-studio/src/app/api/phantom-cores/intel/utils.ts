// Utility functions for Intel API

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
    source: 'phantom-intel-core',
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
 * Generate random status ID
 */
export function generateStatusId(): string {
  return 'intel-' + Date.now();
}

/**
 * Generate random analysis ID
 */
export function generateAnalysisId(): string {
  return 'intel-analysis-' + Date.now();
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
 * Generate random threat score (0-100)
 */
export function randomThreatScore(): number {
  return Math.floor(Math.random() * 100);
}

/**
 * Generate random confidence score (0.6 - 1.0)
 */
export function randomConfidence(): number {
  return Math.random() * 0.4 + 0.6;
}

/**
 * Generate random past timestamp
 */
export function generatePastTimestamp(maxDaysAgo: number): string {
  const now = Date.now();
  const maxMs = maxDaysAgo * 24 * 60 * 60 * 1000;
  const randomMs = Math.random() * maxMs;
  return new Date(now - randomMs).toISOString();
}

/**
 * Generate random recent timestamp
 */
export function generateRecentTimestamp(maxHoursAgo: number): string {
  const now = Date.now();
  const maxMs = maxHoursAgo * 60 * 60 * 1000;
  const randomMs = Math.random() * maxMs;
  return new Date(now - randomMs).toISOString();
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
  console.error('Intel API error:', error);
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
  console.log('Intel API - Received operation:', operation);
  if (params) {
    console.log('Intel API - Parameters:', JSON.stringify(params, null, 2));
  }
}

/**
 * Common threat levels
 */
export const THREAT_LEVELS = {
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
  INFO: 'INFO'
} as const;

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
 * Common motivations
 */
export const MOTIVATIONS = [
  'Espionage',
  'Financial',
  'Hacktivism',
  'Cyber Warfare',
  'Personal',
  'Unknown'
];

/**
 * Common threat actor origins
 */
export const ORIGINS = [
  'Eastern Europe',
  'North Korea',
  'China',
  'Russian Federation',
  'Iran',
  'Unknown'
];

/**
 * Common threat types
 */
export const THREAT_TYPES = [
  'APT',
  'Espionage',
  'Ransomware',
  'Banking Trojan',
  'Botnet',
  'Cryptomining',
  'Phishing',
  'Insider Threat'
];

/**
 * Common campaign names
 */
export const CAMPAIGN_NAMES = [
  'Operation Shadow Dragon',
  'APT29 Campaign',
  'Cobalt Strike Campaign',
  'Lazarus Group Operations',
  'FIN7 Financial Campaign',
  'Emotet Botnet',
  'TrickBot Distribution',
  'SolarWinds Supply Chain'
];

/**
 * Common threat actors
 */
export const THREAT_ACTORS = [
  'APT29 (Cozy Bear)',
  'APT28 (Fancy Bear)',
  'Lazarus Group',
  'FIN7',
  'Carbanak Group',
  'APT1',
  'Equation Group',
  'Sandworm Team'
];

/**
 * Common geolocation data
 */
export const GEOLOCATIONS = [
  'Eastern Europe',
  'North Korea',
  'China',
  'Russian Federation',
  'Iran',
  'Middle East',
  'Southeast Asia',
  'Unknown'
];

/**
 * Common MITRE ATT&CK tactics and techniques
 */
export const MITRE_TACTICS = [
  { tactic: 'Initial Access', technique: 'Spearphishing Attachment', mitre_id: 'T1566.001' },
  { tactic: 'Execution', technique: 'PowerShell', mitre_id: 'T1059.001' },
  { tactic: 'Persistence', technique: 'Registry Run Keys', mitre_id: 'T1547.001' },
  { tactic: 'Defense Evasion', technique: 'Obfuscated Files', mitre_id: 'T1027' },
  { tactic: 'Credential Access', technique: 'Credential Dumping', mitre_id: 'T1003' },
  { tactic: 'Discovery', technique: 'System Information Discovery', mitre_id: 'T1082' },
  { tactic: 'Lateral Movement', technique: 'Remote Services', mitre_id: 'T1021' },
  { tactic: 'Collection', technique: 'Data from Local System', mitre_id: 'T1005' },
  { tactic: 'Command and Control', technique: 'Web Protocols', mitre_id: 'T1071.001' },
  { tactic: 'Exfiltration', technique: 'Data Encrypted', mitre_id: 'T1041' }
];

/**
 * Common targeting sectors
 */
export const TARGETING_SECTORS = [
  'Government',
  'Defense',
  'Healthcare',
  'Financial Services',
  'Energy',
  'Manufacturing',
  'Technology',
  'Education',
  'Telecommunications',
  'Transportation'
];

/**
 * Common enrichment sources
 */
export const ENRICHMENT_SOURCES = [
  'MISP',
  'VirusTotal',
  'ThreatConnect',
  'IBM X-Force',
  'Recorded Future',
  'CrowdStrike',
  'FireEye',
  'Internal Intel'
];
