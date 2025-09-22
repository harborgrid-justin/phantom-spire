// Utility functions for Incident Response API

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
    source: 'phantom-incident-response-core',
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
 * Generate random incident ID
 */
export function generateIncidentId(): string {
  return 'INC-2024-' + String(Math.floor(Math.random() * 1000)).padStart(3, '0');
}

/**
 * Generate random analysis ID
 */
export function generateAnalysisId(): string {
  return 'incident-analysis-' + Date.now();
}

/**
 * Generate random response ID
 */
export function generateResponseId(): string {
  return 'response-' + Date.now();
}

/**
 * Generate random coordination ID
 */
export function generateCoordinationId(): string {
  return 'coord-' + Date.now();
}

/**
 * Generate random report ID
 */
export function generateReportId(): string {
  return 'incident-report-' + Date.now();
}

/**
 * Generate random number within range
 */
export function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate random confidence score (0.7 - 1.0)
 */
export function randomConfidence(): number {
  return Math.random() * 0.3 + 0.7;
}

/**
 * Generate random time string
 */
export function generateRandomTime(min: number, max: number, unit: string): string {
  return randomInRange(min, max) + ' ' + unit;
}

/**
 * Generate random duration in hours
 */
export function generateRandomDuration(): string {
  return (Math.floor(Math.random() * 12) + 2) + ' hours';
}

/**
 * Generate future timestamp
 */
export function generateFutureTimestamp(minutesFromNow: number): string {
  return new Date(Date.now() + minutesFromNow * 60 * 1000).toISOString();
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
  console.error('Incident Response API error:', error);
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
  console.log('Incident Response API - Received operation:', operation);
  if (params) {
    console.log('Incident Response API - Parameters:', JSON.stringify(params, null, 2));
  }
}

/**
 * Common severity levels
 */
export const SEVERITY_LEVELS = {
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
  INFORMATIONAL: 'INFORMATIONAL'
} as const;

/**
 * Common incident statuses
 */
export const INCIDENT_STATUSES = {
  OPEN: 'open',
  INVESTIGATING: 'investigating',
  CONTAINED: 'contained',
  RESOLVED: 'resolved',
  FALSE_POSITIVE: 'false_positive'
} as const;

/**
 * Common incident types
 */
export const INCIDENT_TYPES = [
  'security_breach',
  'malware_infection',
  'data_breach',
  'phishing_attack',
  'ddos_attack',
  'insider_threat',
  'system_compromise',
  'network_intrusion'
];

/**
 * Common response teams
 */
export const RESPONSE_TEAMS = [
  'technical_response',
  'communications',
  'legal',
  'management',
  'forensics',
  'compliance',
  'hr',
  'public_relations'
];

/**
 * Common containment actions
 */
export const CONTAINMENT_ACTIONS = [
  'Immediate network isolation initiated',
  'Affected systems quarantined',
  'User accounts secured',
  'Evidence preservation procedures activated',
  'Network isolation applied',
  'User account disabled',
  'Malicious processes terminated',
  'Firewall rules updated',
  'DNS blocking implemented'
];

/**
 * Common analysts
 */
export const ANALYSTS = [
  'John Smith',
  'Jane Doe',
  'Mike Johnson',
  'Sarah Wilson',
  'David Brown',
  'Lisa Rodriguez',
  'Tom Wilson',
  'Amy Chen'
];

/**
 * Common affected assets
 */
export const AFFECTED_ASSETS = [
  'WS-EXEC-001',
  'SRV-FILE-003',
  'SRV-FILE-004',
  'WS-USER-045',
  'DB-PROD-001',
  'WEB-SERVER-02',
  'MAIL-SERVER-01',
  'Multiple Users'
];

/**
 * Common timeline event types
 */
export const TIMELINE_EVENTS = [
  'Incident Created',
  'Initial Triage',
  'Escalation',
  'IOC Identification',
  'Containment Action',
  'Analysis Complete',
  'Evidence Collected',
  'Status Update'
];
