// Attribution Core Utilities - Helper functions and constants

import { ApiResponse } from './types';

// Generate unique identifiers
export function generateStatusId(): string {
  return `attr-status-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateAnalysisId(): string {
  return `attr-analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateActorId(): string {
  return `actor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateCampaignId(): string {
  return `campaign-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Utility functions
export function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomConfidence(): number {
  return Math.random() * 0.4 + 0.6; // 0.6 to 1.0
}

export function generatePastTimestamp(daysAgo: number = 30): string {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date.toISOString();
}

export function generateRecentTimestamp(hoursAgo: number = 24): string {
  const date = new Date();
  date.setHours(date.getHours() - Math.floor(Math.random() * hoursAgo));
  return date.toISOString();
}

export function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = array.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
}

// Create standardized API response
export function createApiResponse<T>(
  success: boolean, 
  data?: T, 
  message?: string
): ApiResponse<T> {
  return {
    success,
    data,
    message,
    timestamp: new Date().toISOString(),
    source: 'phantom-attribution-core'
  };
}

// Handle errors
export function handleError(error: any): ApiResponse {
  console.error('Attribution API Error:', error);
  return createApiResponse(false, undefined, 'Attribution operation failed');
}

// Constants for threat actor attribution
export const SOPHISTICATION_LEVELS = [
  'novice', 'intermediate', 'advanced', 'expert'
] as const;

export const CONFIDENCE_LEVELS = [
  'high', 'medium', 'low'
] as const;

export const MOTIVATIONS = [
  'Financial Gain',
  'Espionage', 
  'Sabotage',
  'Hacktivism',
  'State-Sponsored',
  'Criminal Enterprise',
  'Intellectual Property Theft',
  'Competitive Intelligence',
  'Political Influence',
  'Cyber Warfare'
] as const;

export const GEOGRAPHICAL_ORIGINS = [
  'Eastern Europe',
  'Southeast Asia', 
  'East Asia',
  'North America',
  'Middle East',
  'Russia',
  'China',
  'North Korea',
  'Iran',
  'Unknown'
] as const;

export const THREAT_ACTOR_GROUPS = [
  'APT1 (Comment Crew)',
  'APT28 (Fancy Bear)',
  'APT29 (Cozy Bear)', 
  'APT32 (OceanLotus)',
  'APT34 (OilRig)',
  'APT40 (Leviathan)',
  'Lazarus Group',
  'FIN7',
  'Carbanak',
  'Equation Group',
  'DarkHalo',
  'UNC2452 (SolarWinds)',
  'Sandworm',
  'Turla',
  'Kimsuky'
] as const;

export const TARGET_SECTORS = [
  'Government',
  'Defense',
  'Financial Services',
  'Healthcare',
  'Energy',
  'Technology',
  'Telecommunications',
  'Manufacturing',
  'Education',
  'Retail',
  'Transportation',
  'Critical Infrastructure'
] as const;

export const ATTACK_PATTERNS = [
  { mitre_id: 'T1566.001', technique: 'Spearphishing Attachment' },
  { mitre_id: 'T1566.002', technique: 'Spearphishing Link' },
  { mitre_id: 'T1190', technique: 'Exploit Public-Facing Application' },
  { mitre_id: 'T1078', technique: 'Valid Accounts' },
  { mitre_id: 'T1133', technique: 'External Remote Services' },
  { mitre_id: 'T1547.001', technique: 'Registry Run Keys / Startup Folder' },
  { mitre_id: 'T1053.005', technique: 'Scheduled Task' },
  { mitre_id: 'T1071.001', technique: 'Web Protocols' },
  { mitre_id: 'T1041', technique: 'Exfiltration Over C2 Channel' },
  { mitre_id: 'T1005', technique: 'Data from Local System' }
] as const;

export const MALWARE_FAMILIES = [
  'Cobalt Strike',
  'Metasploit',
  'PowerShell Empire',
  'Mimikatz',
  'BloodHound',
  'PsExec',
  'WinRAR',
  'AdFind',
  'Rclone',
  'MEGASync',
  'TrickBot',
  'Emotet',
  'Dridex',
  'IcedID',
  'BazarLoader'
] as const;

export const INFRASTRUCTURE_TYPES = [
  'Command and Control',
  'Staging',
  'Exfiltration',
  'Malware Delivery',
  'Phishing',
  'Reconnaissance',
  'Lateral Movement',
  'Persistence'
] as const;

export const EVIDENCE_TYPES = [
  'Code Reuse',
  'Infrastructure Overlap',
  'Behavioral Consistency',
  'Timing Correlation',
  'Linguistic Artifacts',
  'Tool Preferences',
  'Target Selection',
  'Operational Patterns'
] as const;