// Utility functions for IOC API

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
    source: 'phantom-ioc-core',
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
 * Generate random analysis ID
 */
export function generateAnalysisId(): string {
  return 'ioc-analysis-' + Date.now();
}

/**
 * Generate random submission ID
 */
export function generateSubmissionId(): string {
  return 'sub-' + Date.now();
}

/**
 * Generate random enrichment ID
 */
export function generateEnrichmentId(): string {
  return 'enrichment-' + Date.now();
}

/**
 * Generate random correlation ID
 */
export function generateCorrelationId(): string {
  return 'correlation-' + Date.now();
}

/**
 * Generate random report ID
 */
export function generateReportId(): string {
  return 'report-' + Date.now();
}

/**
 * Generate random IOC ID
 */
export function generateIOCId(): string {
  return 'ioc-' + String(Math.floor(Math.random() * 1000)).padStart(3, '0');
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
 * Generate random threat score (60 - 100)
 */
export function randomThreatScore(): number {
  return Math.floor(Math.random() * 40) + 60;
}

/**
 * Generate random IP address
 */
export function generateRandomIP(): string {
  return `192.168.1.${Math.floor(Math.random() * 255)}`;
}

/**
 * Generate random domain
 */
export function generateRandomDomain(base: string = 'example'): string {
  return `${base}-${Math.floor(Math.random() * 1000)}.com`;
}

/**
 * Generate random hash
 */
export function generateRandomHash(): string {
  const chars = '0123456789abcdef';
  let hash = '';
  for (let i = 0; i < 15; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

/**
 * Generate random date within the last 30 days
 */
export function generateRecentDate(): string {
  const now = Date.now();
  const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
  const randomTime = thirtyDaysAgo + Math.random() * (now - thirtyDaysAgo);
  return new Date(randomTime).toISOString();
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
  console.error('IOC API error:', error);
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
  console.log('IOC API - Received operation:', operation);
  if (params) {
    console.log('IOC API - Parameters:', JSON.stringify(params, null, 2));
  }
}

/**
 * Common IOC types
 */
export const IOC_TYPES = {
  IP_ADDRESS: 'ip_address',
  DOMAIN: 'domain',
  FILE_HASH: 'file_hash',
  URL: 'url',
  EMAIL: 'email_address'
} as const;

/**
 * Common malware families
 */
export const MALWARE_FAMILIES = [
  'Emotet',
  'TrickBot',
  'Cobalt Strike',
  'Qakbot',
  'IcedID',
  'Dridex',
  'Zeus',
  'Ryuk'
];

/**
 * Common campaign names
 */
export const CAMPAIGN_NAMES = [
  'Operation Shadow Dragon',
  'APT29 Campaign',
  'Emotet Campaign',
  'Operation X',
  'APT Campaign Y',
  'Botnet Campaign',
  'Phishing Campaign',
  'Malware Family X'
];

/**
 * Common threat sources
 */
export const THREAT_SOURCES = [
  'VirusTotal',
  'MISP Feed',
  'Internal Analysis',
  'ThreatConnect',
  'AbuseIPDB',
  'ThreatMiner'
];
