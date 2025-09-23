// Utility functions for Hunting API

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
    source: 'phantom-hunting-core',
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
 * Generate random hunt analysis ID
 */
export function generateHuntAnalysisId(): string {
  return 'hunt-analysis-' + Date.now();
}

/**
 * Generate random hypothesis ID
 */
export function generateHypothesisId(): string {
  return 'hypothesis-' + Date.now();
}

/**
 * Generate random IOC tracking ID
 */
export function generateIOCTrackingId(): string {
  return 'ioc-track-' + Date.now();
}

/**
 * Generate random hunt report ID
 */
export function generateHuntReportId(): string {
  return 'hunt-report-' + Date.now();
}

/**
 * Generate random number within range
 */
export function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate random confidence score (0.6 - 1.0)
 */
export function randomConfidence(): number {
  return Math.random() * 0.4 + 0.6;
}

/**
 * Generate high confidence score (0.75 - 0.95)
 */
export function randomHighConfidence(): number {
  return Math.random() * 0.2 + 0.75;
}

/**
 * Generate random threat likelihood (0.6 - 1.0)
 */
export function randomThreatLikelihood(): number {
  return Math.random() * 0.4 + 0.6;
}

/**
 * Generate random threat level
 */
export function randomThreatLevel(): string {
  const levels = ['low', 'medium', 'high', 'critical'];
  const rand = Math.random();
  if (rand > 0.7) return 'high';
  if (rand > 0.4) return 'medium';
  if (rand > 0.1) return 'low';
  return 'critical';
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
  console.error('Hunting API error:', error);
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
  console.log('Hunting API - Received operation:', operation);
  if (params) {
    console.log('Hunting API - Parameters:', JSON.stringify(params, null, 2));
  }
}

/**
 * Common hunt types
 */
export const HUNT_TYPES = [
  'behavioral_anomaly',
  'ioc_hunting',
  'ttp_tracking',
  'insider_threat',
  'lateral_movement',
  'data_exfiltration',
  'privilege_escalation',
  'persistence_hunting'
];

/**
 * Common hunt names by type
 */
export const HUNT_NAMES = {
  behavioral_anomaly: 'Behavioral Anomaly Hunt',
  ioc_hunting: 'IOC Pattern Hunt',
  ttp_tracking: 'TTP Correlation Hunt',
  insider_threat: 'Insider Threat Hunt',
  lateral_movement: 'Lateral Movement Hunt',
  data_exfiltration: 'Data Exfiltration Hunt',
  privilege_escalation: 'Privilege Escalation Hunt',
  persistence_hunting: 'Persistence Mechanism Hunt'
};

/**
 * Common threat levels
 */
export const THREAT_LEVELS = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
} as const;

/**
 * Common hunt statuses
 */
export const HUNT_STATUSES = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  PAUSED: 'paused',
  CANCELLED: 'cancelled'
} as const;

/**
 * Common IOC types
 */
export const IOC_TYPES = [
  'file_hash',
  'ip_address',
  'domain',
  'url',
  'email_address',
  'registry_key',
  'process_name',
  'network_signature'
];

/**
 * Common threat families
 */
export const THREAT_FAMILIES = [
  'Emotet',
  'TrickBot',
  'Ryuk',
  'Cobalt Strike',
  'Mimikatz',
  'PowerShell Empire',
  'Metasploit',
  'Living off the Land'
];

/**
 * Common geographic distributions
 */
export const GEOGRAPHIC_DISTRIBUTIONS = [
  'Russian Federation',
  'China',
  'North Korea',
  'Iran',
  'Eastern Europe',
  'Southeast Asia',
  'Unknown'
];

/**
 * Common IOC categories
 */
export const IOC_CATEGORIES = [
  'C2 servers',
  'Phishing',
  'Malware distribution',
  'Data exfiltration',
  'Lateral movement',
  'Persistence'
];

/**
 * Common persistence mechanisms
 */
export const PERSISTENCE_MECHANISMS = [
  'Run keys',
  'Services',
  'Scheduled tasks',
  'WMI events',
  'DLL hijacking',
  'Registry modifications'
];

/**
 * Common threat actors
 */
export const THREAT_ACTORS = [
  'APT29',
  'APT28',
  'APT1',
  'Lazarus Group',
  'FIN7',
  'Carbanak Group',
  'Equation Group',
  'Sandworm Team'
];

/**
 * Common campaign names
 */
export const CAMPAIGN_NAMES = [
  'Operation Shadow Strike',
  'Financial Sector Targeting',
  'Government Infrastructure Attack',
  'Healthcare Data Breach',
  'Supply Chain Compromise',
  'Critical Infrastructure Targeting'
];

/**
 * Common hunt hypotheses
 */
export const HUNT_HYPOTHESES = [
  'Advanced persistent threat using living-off-the-land techniques',
  'Insider threat using privileged access for data theft',
  'Lateral movement using legitimate administrative tools',
  'Data exfiltration through encrypted channels',
  'Privilege escalation via unpatched vulnerabilities',
  'Persistence mechanisms in system startup processes'
];

/**
 * Common hunt recommendations
 */
export const HUNT_RECOMMENDATIONS = [
  'Implement enhanced monitoring for detected IOCs',
  'Review user access patterns for anomalous behavior',
  'Strengthen network segmentation around critical assets',
  'Update threat intelligence feeds with new indicators',
  'Conduct deeper analysis of identified threat vectors',
  'Implement additional user monitoring',
  'Review and restrict data access permissions',
  'Enable enhanced audit logging',
  'Enhance monitoring capabilities for lateral movement detection',
  'Implement additional data loss prevention controls',
  'Strengthen user behavior analytics',
  'Update threat hunting playbooks with new TTPs'
];

/**
 * Common evidence strength levels
 */
export const EVIDENCE_STRENGTH_LEVELS = [
  'low',
  'medium',
  'high',
  'conclusive'
];

/**
 * Common validation statuses
 */
export const VALIDATION_STATUSES = [
  'validated',
  'refuted',
  'pending',
  'insufficient_data'
];

/**
 * Common hunt methodologies
 */
export const HUNT_METHODOLOGIES = [
  'Behavioral analysis',
  'IOC correlation',
  'TTP mapping',
  'Timeline reconstruction',
  'Statistical analysis',
  'Machine learning detection',
  'Anomaly detection',
  'Pattern recognition'
];

/**
 * Common data sources
 */
export const DATA_SOURCES = [
  'Network traffic logs',
  'Endpoint telemetry',
  'User behavior analytics',
  'Security event logs',
  'DNS logs',
  'Proxy logs',
  'Active Directory logs',
  'System process logs'
];
