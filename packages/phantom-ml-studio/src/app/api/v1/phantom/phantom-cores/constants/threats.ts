// Threat and Security Constants
// Comprehensive constants for threat levels, attack techniques, and security operations

export const THREAT_LEVELS = {
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
  INFO: 'INFO',
  NONE: 'NONE',
  UNKNOWN: 'UNKNOWN'
} as const;

export const RISK_LEVELS = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  MINIMAL: 'minimal',
  NEGLIGIBLE: 'negligible',
  UNKNOWN: 'unknown'
} as const;

export const CONFIDENCE_LEVELS = {
  VERY_HIGH: 'very_high',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  VERY_LOW: 'very_low',
  UNKNOWN: 'unknown'
} as const;

export const SEVERITY_LEVELS = {
  EMERGENCY: 'emergency',
  CRITICAL: 'critical',
  MAJOR: 'major',
  MINOR: 'minor',
  WARNING: 'warning',
  INFORMATIONAL: 'informational'
} as const;

export const MITRE_TACTICS = {
  RECONNAISSANCE: 'reconnaissance',
  RESOURCE_DEVELOPMENT: 'resource-development',
  INITIAL_ACCESS: 'initial-access',
  EXECUTION: 'execution',
  PERSISTENCE: 'persistence',
  PRIVILEGE_ESCALATION: 'privilege-escalation',
  DEFENSE_EVASION: 'defense-evasion',
  CREDENTIAL_ACCESS: 'credential-access',
  DISCOVERY: 'discovery',
  LATERAL_MOVEMENT: 'lateral-movement',
  COLLECTION: 'collection',
  COMMAND_CONTROL: 'command-and-control',
  EXFILTRATION: 'exfiltration',
  IMPACT: 'impact'
} as const;

export const COMMON_ATTACK_TECHNIQUES = [
  'T1566.001', // Spearphishing Attachment
  'T1566.002', // Spearphishing Link
  'T1566.003', // Spearphishing via Service
  'T1055.001', // Process Injection: Dynamic-link Library Injection
  'T1055.002', // Process Injection: Portable Executable Injection
  'T1055.003', // Process Injection: Thread Execution Hijacking
  'T1055.004', // Process Injection: Asynchronous Procedure Call
  'T1055.005', // Process Injection: Thread Local Storage
  'T1547.001', // Boot or Logon Autostart Execution: Registry Run Keys
  'T1547.004', // Boot or Logon Autostart Execution: Winlogon Helper DLL
  'T1053.005', // Scheduled Task/Job: Scheduled Task
  'T1078.001', // Valid Accounts: Default Accounts
  'T1078.002', // Valid Accounts: Domain Accounts
  'T1078.003', // Valid Accounts: Local Accounts
  'T1078.004', // Valid Accounts: Cloud Accounts
  'T1027.001', // Obfuscated Files or Information: Binary Padding
  'T1027.002', // Obfuscated Files or Information: Software Packing
  'T1027.003', // Obfuscated Files or Information: Steganography
  'T1027.004', // Obfuscated Files or Information: Compile After Delivery
  'T1070.001', // Indicator Removal on Host: Clear Windows Event Logs
  'T1070.003', // Indicator Removal on Host: Clear Command History
  'T1070.004', // Indicator Removal on Host: File Deletion
  'T1070.006', // Indicator Removal on Host: Timestomp
  'T1082',     // System Information Discovery
  'T1083',     // File and Directory Discovery
  'T1087.001', // Account Discovery: Local Account
  'T1087.002', // Account Discovery: Domain Account
  'T1021.001', // Remote Services: Remote Desktop Protocol
  'T1021.002', // Remote Services: SMB/Windows Admin Shares
  'T1021.003', // Remote Services: Distributed Component Object Model
  'T1021.004', // Remote Services: SSH
  'T1005',     // Data from Local System
  'T1041',     // Exfiltration Over C2 Channel
  'T1486',     // Data Encrypted for Impact
  'T1490',     // Inhibit System Recovery
  'T1489',     // Service Stop
  'T1491.001', // Defacement: Internal Defacement
  'T1491.002'  // Defacement: External Defacement
] as const;

export const ATTACK_VECTORS = {
  EMAIL: 'email',
  WEB: 'web',
  USB: 'usb',
  NETWORK: 'network',
  PHYSICAL: 'physical',
  SOCIAL_ENGINEERING: 'social_engineering',
  SUPPLY_CHAIN: 'supply_chain',
  INSIDER: 'insider',
  WIRELESS: 'wireless',
  CLOUD: 'cloud',
  MOBILE: 'mobile',
  IoT: 'iot'
} as const;

export const ATTACK_PHASES = {
  RECONNAISSANCE: 'reconnaissance',
  WEAPONIZATION: 'weaponization',
  DELIVERY: 'delivery',
  EXPLOITATION: 'exploitation',
  INSTALLATION: 'installation',
  COMMAND_CONTROL: 'command_control',
  ACTIONS_ON_OBJECTIVES: 'actions_on_objectives'
} as const;

export const THREAT_CATEGORIES = {
  MALWARE: 'malware',
  PHISHING: 'phishing',
  SOCIAL_ENGINEERING: 'social_engineering',
  INSIDER_THREAT: 'insider_threat',
  ADVANCED_PERSISTENT_THREAT: 'advanced_persistent_threat',
  DENIAL_OF_SERVICE: 'denial_of_service',
  MAN_IN_THE_MIDDLE: 'man_in_the_middle',
  SQL_INJECTION: 'sql_injection',
  CROSS_SITE_SCRIPTING: 'cross_site_scripting',
  ZERO_DAY: 'zero_day',
  RANSOMWARE: 'ransomware',
  CRYPTOJACKING: 'cryptojacking'
} as const;

export const THREAT_SOURCES = {
  EXTERNAL: 'external',
  INTERNAL: 'internal',
  PARTNER: 'partner',
  VENDOR: 'vendor',
  CUSTOMER: 'customer',
  UNKNOWN: 'unknown'
} as const;

export const ATTACK_SOPHISTICATION = {
  BASIC: 'basic',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  EXPERT: 'expert',
  NATION_STATE: 'nation_state'
} as const;

export const THREAT_INDICATORS = {
  BEHAVIORAL: 'behavioral',
  SIGNATURE: 'signature',
  ANOMALY: 'anomaly',
  REPUTATION: 'reputation',
  HEURISTIC: 'heuristic',
  MACHINE_LEARNING: 'machine_learning'
} as const;

export const SECURITY_CONTROLS = {
  PREVENTIVE: 'preventive',
  DETECTIVE: 'detective',
  CORRECTIVE: 'corrective',
  COMPENSATING: 'compensating',
  DETERRENT: 'deterrent',
  RECOVERY: 'recovery'
} as const;

export const CONTROL_EFFECTIVENESS = {
  VERY_HIGH: 'very_high',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  VERY_LOW: 'very_low',
  INEFFECTIVE: 'ineffective'
} as const;

export const THREAT_ACTOR_MOTIVATIONS = {
  FINANCIAL: 'financial',
  ESPIONAGE: 'espionage',
  SABOTAGE: 'sabotage',
  IDEOLOGY: 'ideology',
  REVENGE: 'revenge',
  NOTORIETY: 'notoriety',
  CURIOSITY: 'curiosity',
  DOMINANCE: 'dominance'
} as const;

export const IMPACT_TYPES = {
  CONFIDENTIALITY: 'confidentiality',
  INTEGRITY: 'integrity',
  AVAILABILITY: 'availability',
  FINANCIAL: 'financial',
  REPUTATIONAL: 'reputational',
  OPERATIONAL: 'operational',
  LEGAL: 'legal',
  REGULATORY: 'regulatory'
} as const;

export const EXPOSURE_LEVELS = {
  INTERNET_FACING: 'internet_facing',
  INTERNAL_NETWORK: 'internal_network',
  RESTRICTED_NETWORK: 'restricted_network',
  ISOLATED: 'isolated',
  AIR_GAPPED: 'air_gapped'
} as const;

export const THREAT_HUNTING_TYPES = {
  STRUCTURED: 'structured',
  UNSTRUCTURED: 'unstructured',
  HYPOTHESIS_DRIVEN: 'hypothesis_driven',
  SITUATIONAL_AWARENESS: 'situational_awareness',
  DOMAIN_EXPERT: 'domain_expert',
  INVESTIGATION: 'investigation'
} as const;

export const DETECTION_MATURITY = {
  INITIAL: 'initial',
  DEVELOPING: 'developing',
  DEFINED: 'defined',
  MANAGED: 'managed',
  OPTIMIZING: 'optimizing'
} as const;

export const THREAT_LANDSCAPE_TRENDS = [
  'Increased Ransomware Attacks',
  'Supply Chain Compromises',
  'Cloud Security Misconfigurations',
  'IoT Device Vulnerabilities',
  'AI-Powered Attacks',
  'Living off the Land Techniques',
  'Fileless Malware',
  'Business Email Compromise',
  'Credential Stuffing Attacks',
  'Zero-Day Exploits',
  'Deepfake Technology Abuse',
  'Cryptocurrency Mining Malware',
  'Mobile Banking Trojans',
  'State-Sponsored Cyber Warfare',
  'Insider Threat Incidents'
] as const;

export const KILL_CHAIN_PHASES = {
  RECONNAISSANCE: 'reconnaissance',
  WEAPONIZATION: 'weaponization',
  DELIVERY: 'delivery',
  EXPLOITATION: 'exploitation',
  INSTALLATION: 'installation',
  COMMAND_AND_CONTROL: 'command_and_control',
  ACTIONS_ON_OBJECTIVES: 'actions_on_objectives'
} as const;

export const DIAMOND_MODEL_FEATURES = {
  ADVERSARY: 'adversary',
  CAPABILITY: 'capability',
  INFRASTRUCTURE: 'infrastructure',
  VICTIM: 'victim'
} as const;

// Threat scoring and assessment
export const THREAT_SCORES = {
  VERY_HIGH: { min: 8.5, max: 10.0, label: 'Very High' },
  HIGH: { min: 7.0, max: 8.4, label: 'High' },
  MEDIUM_HIGH: { min: 5.5, max: 6.9, label: 'Medium-High' },
  MEDIUM: { min: 4.0, max: 5.4, label: 'Medium' },
  MEDIUM_LOW: { min: 2.5, max: 3.9, label: 'Medium-Low' },
  LOW: { min: 1.0, max: 2.4, label: 'Low' },
  VERY_LOW: { min: 0.0, max: 0.9, label: 'Very Low' }
} as const;

// Type definitions
export type ThreatLevel = typeof THREAT_LEVELS[keyof typeof THREAT_LEVELS];
export type RiskLevel = typeof RISK_LEVELS[keyof typeof RISK_LEVELS];
export type ConfidenceLevel = typeof CONFIDENCE_LEVELS[keyof typeof CONFIDENCE_LEVELS];
export type SeverityLevel = typeof SEVERITY_LEVELS[keyof typeof SEVERITY_LEVELS];
export type AttackVector = typeof ATTACK_VECTORS[keyof typeof ATTACK_VECTORS];
export type AttackPhase = typeof ATTACK_PHASES[keyof typeof ATTACK_PHASES];
export type ThreatCategory = typeof THREAT_CATEGORIES[keyof typeof THREAT_CATEGORIES];
export type ThreatSource = typeof THREAT_SOURCES[keyof typeof THREAT_SOURCES];
export type AttackSophistication = typeof ATTACK_SOPHISTICATION[keyof typeof ATTACK_SOPHISTICATION];
export type ThreatIndicator = typeof THREAT_INDICATORS[keyof typeof THREAT_INDICATORS];
export type SecurityControl = typeof SECURITY_CONTROLS[keyof typeof SECURITY_CONTROLS];
export type ControlEffectiveness = typeof CONTROL_EFFECTIVENESS[keyof typeof CONTROL_EFFECTIVENESS];
export type ThreatActorMotivation = typeof THREAT_ACTOR_MOTIVATIONS[keyof typeof THREAT_ACTOR_MOTIVATIONS];
export type ImpactType = typeof IMPACT_TYPES[keyof typeof IMPACT_TYPES];
export type ExposureLevel = typeof EXPOSURE_LEVELS[keyof typeof EXPOSURE_LEVELS];
export type ThreatHuntingType = typeof THREAT_HUNTING_TYPES[keyof typeof THREAT_HUNTING_TYPES];
export type DetectionMaturity = typeof DETECTION_MATURITY[keyof typeof DETECTION_MATURITY];
export type KillChainPhase = typeof KILL_CHAIN_PHASES[keyof typeof KILL_CHAIN_PHASES];
export type DiamondModelFeature = typeof DIAMOND_MODEL_FEATURES[keyof typeof DIAMOND_MODEL_FEATURES];
