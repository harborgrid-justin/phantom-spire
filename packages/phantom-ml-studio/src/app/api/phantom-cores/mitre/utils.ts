// Utility functions for MITRE API

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
    source: 'phantom-mitre-core',
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
 * Generate random MITRE analysis ID
 */
export function generateAnalysisId(): string {
  return 'mitre-analysis-' + Date.now();
}

/**
 * Generate random mapping ID
 */
export function generateMappingId(): string {
  return 'mapping-' + Date.now();
}

/**
 * Generate random assessment ID
 */
export function generateAssessmentId(): string {
  return 'assessment-' + Date.now();
}

/**
 * Generate random report ID
 */
export function generateReportId(): string {
  return 'mitre-report-' + Date.now();
}

/**
 * Generate random number within range
 */
export function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate random coverage score (0.6 - 1.0)
 */
export function randomCoverageScore(): number {
  return Math.random() * 0.4 + 0.6;
}

/**
 * Generate random confidence score (0.5 - 1.0)
 */
export function randomConfidence(): number {
  return Math.random() * 0.5 + 0.5;
}

/**
 * Generate random threat score (50-100)
 */
export function randomThreatScore(): number {
  return Math.floor(Math.random() * 50) + 50;
}

/**
 * Generate random tactic coverage (0.7 - 1.0)
 */
export function randomTacticCoverage(): number {
  return Math.random() * 0.3 + 0.7;
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
  console.error('MITRE API error:', error);
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
  console.log('MITRE API - Received operation:', operation);
  if (params) {
    console.log('MITRE API - Parameters:', JSON.stringify(params, null, 2));
  }
}

/**
 * Common MITRE tactics
 */
export const MITRE_TACTICS = [
  'Initial Access',
  'Execution',
  'Persistence',
  'Privilege Escalation',
  'Defense Evasion',
  'Credential Access',
  'Discovery',
  'Lateral Movement',
  'Collection',
  'Command and Control',
  'Exfiltration',
  'Impact'
];

/**
 * Common prevalence levels
 */
export const PREVALENCE_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

/**
 * Common difficulty levels
 */
export const DIFFICULTY_LEVELS = ['LOW', 'MEDIUM', 'HIGH'];

/**
 * Common sophistication levels
 */
export const SOPHISTICATION_LEVELS = ['Basic', 'Intermediate', 'Advanced', 'Expert'];

/**
 * Common threat groups
 */
export const THREAT_GROUPS = [
  'APT29',
  'APT28',
  'APT1',
  'Lazarus Group',
  'FIN7',
  'Carbanak',
  'Equation Group',
  'Sandworm Team',
  'Cozy Bear',
  'Fancy Bear'
];

/**
 * Common technique IDs and names
 */
export const COMMON_TECHNIQUES = [
  { id: 'T1566.001', name: 'Spearphishing Attachment' },
  { id: 'T1566.002', name: 'Spearphishing Link' },
  { id: 'T1547.001', name: 'Registry Run Keys' },
  { id: 'T1071.001', name: 'Web Protocols' },
  { id: 'T1055', name: 'Process Injection' },
  { id: 'T1027', name: 'Obfuscated Files' },
  { id: 'T1003', name: 'Credential Dumping' },
  { id: 'T1082', name: 'System Information Discovery' },
  { id: 'T1021', name: 'Remote Services' },
  { id: 'T1005', name: 'Data from Local System' }
];

/**
 * Common detection methods
 */
export const DETECTION_METHODS = [
  'Email security solutions',
  'Endpoint detection and response',
  'Network traffic analysis',
  'User behavior analytics',
  'File integrity monitoring',
  'Process monitoring',
  'Registry monitoring',
  'DNS monitoring'
];

/**
 * Common mitigation strategies
 */
export const MITIGATIONS = [
  {
    id: 'M1049',
    name: 'Antivirus/Antimalware',
    description: 'Use signatures to detect malicious content'
  },
  {
    id: 'M1021',
    name: 'Restrict Web-Based Content',
    description: 'Block suspicious content types'
  },
  {
    id: 'M1017',
    name: 'User Training',
    description: 'Train users to identify threats'
  },
  {
    id: 'M1031',
    name: 'Network Intrusion Prevention',
    description: 'Monitor and block malicious traffic'
  },
  {
    id: 'M1026',
    name: 'Privileged Account Management',
    description: 'Restrict privileged account usage'
  }
];

/**
 * Common detection analytics
 */
export const DETECTION_ANALYTICS = [
  'Monitor email gateway logs for suspicious attachments',
  'Analyze process execution from Office applications',
  'Detect unusual network connections from user workstations',
  'Monitor for file writes to startup locations',
  'Track registry modifications in run keys',
  'Analyze DNS queries for suspicious domains',
  'Monitor process injection attempts',
  'Detect credential dumping activities'
];

/**
 * Common coverage gaps
 */
export const COVERAGE_GAPS = [
  { technique: 'T1071.001', name: 'Web Protocols', priority: 'HIGH' },
  { technique: 'T1055', name: 'Process Injection', priority: 'HIGH' },
  { technique: 'T1027', name: 'Obfuscated Files', priority: 'MEDIUM' },
  { technique: 'T1003', name: 'Credential Dumping', priority: 'HIGH' },
  { technique: 'T1021', name: 'Remote Services', priority: 'MEDIUM' }
];

/**
 * Common recommendations
 */
export const RECOMMENDATIONS = [
  'Implement specific detection rules for high-priority techniques',
  'Enhance monitoring capabilities for under-covered tactics',
  'Update security controls based on threat landscape',
  'Conduct tabletop exercises for critical techniques',
  'Focus on high-priority gaps in detection coverage',
  'Implement behavioral analytics for process injection',
  'Enhance network monitoring capabilities',
  'Review and update detection rules quarterly',
  'Prioritize detection rules for critical gaps',
  'Implement network-based detection for C2 communications',
  'Enhance behavioral analysis capabilities',
  'Schedule regular coverage assessment reviews'
];

/**
 * Report sections
 */
export const REPORT_SECTIONS = [
  'Executive Summary',
  'Coverage Analysis',
  'Gap Assessment',
  'Threat Landscape Overview',
  'Recommendations',
  'Implementation Roadmap',
  'Risk Assessment',
  'Compliance Mapping'
];

/**
 * Campaign types
 */
export const CAMPAIGN_TYPES = [
  'Financial',
  'Espionage',
  'Ransomware',
  'Cryptocurrency',
  'Supply Chain',
  'Critical Infrastructure'
];

/**
 * Evidence types
 */
export const EVIDENCE_TYPES = [
  'Email attachment detected',
  'Registry modification observed',
  'HTTP C2 communication',
  'Process injection detected',
  'Credential dumping activity',
  'Lateral movement attempt',
  'Data exfiltration detected',
  'Persistence mechanism installed'
];

/**
 * Generate random technique mapping
 */
export function generateTechniqueMapping(): { technique: string; confidence: number; evidence: string } {
  const technique = getRandomItem(COMMON_TECHNIQUES);
  return {
    technique: technique.id,
    confidence: randomConfidence(),
    evidence: getRandomItem(EVIDENCE_TYPES)
  };
}

/**
 * Generate random attack step
 */
export function generateAttackStep(step: number): { step: number; tactic: string; technique: string } {
  const technique = getRandomItem(COMMON_TECHNIQUES);
  return {
    step,
    tactic: getRandomItem(MITRE_TACTICS),
    technique: technique.id
  };
}
