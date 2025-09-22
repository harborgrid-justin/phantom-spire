// Utility functions for XDR API

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
    source: 'phantom-xdr-core',
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
 * Generate random XDR status ID
 */
export function generateStatusId(): string {
  return 'xdr-status-' + Date.now();
}

/**
 * Generate random threat detection ID
 */
export function generateThreatDetectionId(): string {
  return 'xdr-threat-detection-' + Date.now();
}

/**
 * Generate random investigation ID
 */
export function generateInvestigationId(): string {
  return 'xdr-investigation-' + Date.now();
}

/**
 * Generate random hunt ID
 */
export function generateHuntId(): string {
  return 'xdr-hunt-' + Date.now();
}

/**
 * Generate random response ID
 */
export function generateResponseId(): string {
  return 'xdr-response-' + Date.now();
}

/**
 * Generate random behavior analysis ID
 */
export function generateBehaviorAnalysisId(): string {
  return 'xdr-behavior-' + Date.now();
}

/**
 * Generate random comprehensive analysis ID
 */
export function generateComprehensiveAnalysisId(): string {
  return 'xdr-comprehensive-' + Date.now();
}

/**
 * Generate random number within range
 */
export function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate random percentage (0.0 - 1.0)
 */
export function randomPercentage(): number {
  return Math.random();
}

/**
 * Generate random high accuracy score (0.8 - 1.0)
 */
export function randomHighAccuracy(): number {
  return Math.random() * 0.2 + 0.8;
}

/**
 * Generate random confidence score (0.7 - 1.0)
 */
export function randomConfidence(): number {
  return Math.random() * 0.3 + 0.7;
}

/**
 * Generate random low system usage (0.2 - 0.5)
 */
export function randomLowUsage(): number {
  return Math.random() * 0.3 + 0.2;
}

/**
 * Generate random moderate system usage (0.3 - 0.7)
 */
export function randomModerateUsage(): number {
  return Math.random() * 0.4 + 0.3;
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
  console.error('Phantom XDR API error:', error);
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
  console.log('XDR API - Received operation:', operation);
  if (params) {
    console.log('XDR API - Full body:', JSON.stringify(params, null, 2));
  }
}

/**
 * Common threat categories
 */
export const THREAT_CATEGORIES = [
  'Malware',
  'Lateral Movement',
  'Data Exfiltration',
  'Persistence',
  'Command and Control',
  'Initial Access',
  'Privilege Escalation',
  'Defense Evasion'
];

/**
 * Common threat indicators
 */
export const THREAT_INDICATORS = [
  'suspicious_file_execution',
  'command_line_obfuscation',
  'network_beaconing',
  'privilege_escalation',
  'credential_dumping',
  'remote_execution',
  'large_data_transfer',
  'compression_activity',
  'external_communication',
  'registry_modification',
  'scheduled_task_creation',
  'service_installation'
];

/**
 * Common severity levels
 */
export const SEVERITY_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

/**
 * Common TTP (Tactics, Techniques, and Procedures)
 */
export const COMMON_TTPS = [
  'T1078 - Valid Accounts',
  'T1059 - Command and Scripting Interpreter',
  'T1083 - File and Directory Discovery',
  'T1105 - Ingress Tool Transfer',
  'T1041 - Exfiltration Over C2 Channel',
  'T1055 - Process Injection',
  'T1003 - OS Credential Dumping',
  'T1547 - Boot or Logon Autostart Execution',
  'T1027 - Obfuscated Files or Information',
  'T1071 - Application Layer Protocol'
];

/**
 * Common discovery types for threat hunting
 */
export const DISCOVERY_TYPES = [
  'Anomalous Network Behavior',
  'Privilege Escalation Attempts',
  'Data Staging Activity',
  'Suspicious Process Execution',
  'Unusual Authentication Patterns',
  'Abnormal File Operations'
];

/**
 * Common behavioral changes
 */
export const BEHAVIORAL_CHANGES = [
  'unusual_login_times',
  'increased_file_access',
  'new_application_usage',
  'geographic_anomaly',
  'privilege_escalation_attempts',
  'unusual_data_access',
  'after_hours_activity',
  'multiple_failed_logins',
  'abnormal_network_usage',
  'suspicious_email_patterns'
];

/**
 * Common recommended actions
 */
export const RECOMMENDED_ACTIONS = [
  'Isolate affected endpoints immediately',
  'Collect forensic artifacts for analysis',
  'Review and update detection rules',
  'Initiate incident response procedures',
  'Notify security stakeholders',
  'Deploy additional monitoring on identified suspicious hosts',
  'Update threat intelligence feeds with new indicators',
  'Enhance detection rules based on hunt findings',
  'Conduct deeper forensic analysis on high-risk discoveries',
  'Schedule follow-up hunt campaigns'
];

/**
 * Common response team assignments
 */
export const RESPONSE_TEAMS = [
  'SOC Tier 1',
  'SOC Tier 2',
  'SOC Tier 3',
  'Incident Response Team',
  'Digital Forensics Team',
  'Threat Hunting Team'
];

/**
 * Common automated actions
 */
export const AUTOMATED_ACTIONS = [
  'Endpoint Isolation',
  'User Account Suspension',
  'Network Segmentation',
  'Threat Intel Enrichment',
  'Firewall Rule Update',
  'DNS Blocking',
  'Email Quarantine',
  'Process Termination'
];

/**
 * Common behavioral models
 */
export const BEHAVIORAL_MODELS = [
  'login_patterns',
  'file_access',
  'network_usage',
  'application_usage',
  'privilege_usage',
  'communication_patterns',
  'data_access_patterns',
  'system_interaction'
];

/**
 * Generate random threat category with indicators
 */
export function generateThreatCategory(category: string, severity: string): {
  category: string;
  count: number;
  severity: string;
  indicators: string[];
} {
  return {
    category,
    count: randomInRange(2, 20),
    severity,
    indicators: getRandomItems(THREAT_INDICATORS, randomInRange(2, 5))
  };
}

/**
 * Generate random key discovery
 */
export function generateKeyDiscovery(discoveryType: string, description: string, riskLevel: string): {
  discovery_type: string;
  description: string;
  risk_level: string;
  affected_hosts: number;
} {
  return {
    discovery_type: discoveryType,
    description,
    risk_level: riskLevel,
    affected_hosts: randomInRange(1, 15)
  };
}

/**
 * Generate random user risk profile
 */
export function generateUserRiskProfile(userId: string): {
  user_id: string;
  risk_score: number;
  anomalies_detected: number;
  behavioral_changes: string[];
} {
  return {
    user_id: userId,
    risk_score: randomInRange(50, 120),
    anomalies_detected: randomInRange(2, 10),
    behavioral_changes: getRandomItems(BEHAVIORAL_CHANGES, randomInRange(2, 4))
  };
}

/**
 * Generate random automated action
 */
export function generateAutomatedAction(action: string, status: string, minutesAgo: number): {
  action: string;
  status: string;
  timestamp: string;
  affected_hosts?: number;
  affected_accounts?: number;
  affected_vlans?: number;
  indicators_processed?: number;
} {
  const baseAction = {
    action,
    status,
    timestamp: new Date(Date.now() - minutesAgo * 60000).toISOString()
  };

  // Add specific properties based on action type
  switch (action) {
    case 'Endpoint Isolation':
      return { ...baseAction, affected_hosts: randomInRange(1, 8) };
    case 'User Account Suspension':
      return { ...baseAction, affected_accounts: randomInRange(1, 4) };
    case 'Network Segmentation':
      return { ...baseAction, affected_vlans: randomInRange(2, 6) };
    case 'Threat Intel Enrichment':
      return { ...baseAction, indicators_processed: randomInRange(25, 75) };
    default:
      return baseAction;
  }
}

/**
 * Generate random file hashes
 */
export function generateFileHashes(count: number = 3): string[] {
  const hashes = [];
  for (let i = 0; i < count; i++) {
    const randomHex = Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    hashes.push(`SHA256:${randomHex.substring(0, 32)}...`);
  }
  return hashes;
}

/**
 * Generate random network indicators
 */
export function generateNetworkIndicators(count: number = 3): string[] {
  const indicators = [];
  for (let i = 0; i < count; i++) {
    const type = randomInRange(1, 3);
    switch (type) {
      case 1:
        // IP:Port
        indicators.push(`${randomInRange(1, 255)}.${randomInRange(0, 255)}.${randomInRange(0, 255)}.${randomInRange(1, 255)}:${randomInRange(80, 8080)}`);
        break;
      case 2:
        // Domain
        indicators.push(`malicious-domain-${randomInRange(1, 999)}.com`);
        break;
      case 3:
        // Internal IP:Port
        indicators.push(`10.0.0.${randomInRange(1, 255)}:${randomInRange(80, 8080)}`);
        break;
    }
  }
  return indicators;
}

/**
 * Generate random registry modifications
 */
export function generateRegistryModifications(count: number = 2): string[] {
  const modifications = [
    'HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run',
    'HKCU\\SOFTWARE\\Classes\\exefile\\shell\\open\\command',
    'HKLM\\SYSTEM\\CurrentControlSet\\Services',
    'HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\RunOnce',
    'HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Winlogon'
  ];
  return getRandomItems(modifications, count);
}

/**
 * Generate compliance frameworks
 */
export const COMPLIANCE_FRAMEWORKS = ['SOX', 'GDPR', 'HIPAA', 'ISO 27001', 'PCI DSS', 'NIST', 'SOC 2'];

/**
 * Generate geographic distribution
 */
export const GEOGRAPHIC_REGIONS = [
  'North America',
  'Europe',
  'Asia-Pacific',
  'Latin America',
  'Middle East',
  'Africa'
];

/**
 * Generate risk factors
 */
export const RISK_FACTORS = [
  'Unpatched systems detected',
  'Weak authentication policies',
  'Insufficient network segmentation',
  'Limited endpoint protection coverage',
  'Outdated security controls',
  'Inadequate user training',
  'Missing critical updates',
  'Poor access management'
];

/**
 * Generate risk mitigation priorities
 */
export const RISK_MITIGATION_PRIORITIES = [
  'Patch critical vulnerabilities immediately',
  'Implement multi-factor authentication',
  'Enhance network monitoring',
  'Deploy additional endpoint agents',
  'Update security policies',
  'Conduct security awareness training',
  'Implement zero-trust architecture',
  'Strengthen access controls'
];

/**
 * Generate attack vectors
 */
export const ATTACK_VECTORS = [
  'phishing',
  'credential_stuffing',
  'supply_chain',
  'malware',
  'social_engineering',
  'insider_threat',
  'zero_day_exploit',
  'ransomware'
];

/**
 * Generate security investments
 */
export const SECURITY_INVESTMENTS = [
  'SIEM upgrade',
  'threat_intelligence',
  'security_training',
  'endpoint_protection',
  'network_monitoring',
  'incident_response',
  'vulnerability_management',
  'security_orchestration'
];

/**
 * Generate random time-based values
 */
export function generateRandomTimeAgo(maxHours: number): string {
  const hoursAgo = Math.random() * maxHours;
  return new Date(Date.now() - hoursAgo * 3600000).toISOString();
}

/**
 * Generate random processing time
 */
export function generateProcessingTime(): string {
  return randomInRange(60, 300) + ' seconds';
}

/**
 * Generate random duration
 */
export function generateDuration(minHours: number, maxHours: number): string {
  return randomInRange(minHours, maxHours) + ' hours';
}
