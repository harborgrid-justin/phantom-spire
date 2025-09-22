// Phantom Cores Constants - Main Export File
// Centralized exports for all phantom-cores constants across 500+ security-related constants

// ================================
// SYSTEM STATUS AND HEALTH
// ================================
export * from './system';

// ================================
// THREAT LEVELS AND SECURITY
// ================================
export * from './threats';

// ================================
// THREAT ACTORS AND ATTRIBUTION
// ================================
export * from './actors';

// ================================
// MALWARE AND IOC ANALYSIS
// ================================
export * from './malware';

// ================================
// NETWORK AND INFRASTRUCTURE
// ================================
export * from './network';

// ================================
// UTILITIES AND HELPERS
// ================================
export * from './utils';

// ================================
// LEGACY COMPATIBILITY EXPORTS
// ================================
// Re-export commonly used constants for backward compatibility

// System status exports
export {
  SYSTEM_STATUS,
  HEALTH_STATUS,
  COMPONENT_STATUS
} from './system';

// Threat and security exports
export {
  THREAT_LEVELS,
  RISK_LEVELS,
  CONFIDENCE_LEVELS,
  MITRE_TACTICS,
  ATTACK_VECTORS
} from './threats';

// Actor type exports
export {
  ACTOR_TYPES,
  APT_GROUPS,
  CYBERCRIMINAL_GROUPS,
  NATION_STATE_ACTORS
} from './actors';

// Malware and IOC exports
export {
  MALWARE_TYPES,
  IOC_TYPES,
  HASH_TYPES,
  MALWARE_FAMILIES
} from './malware';

// Network and infrastructure exports
export {
  NETWORK_PROTOCOLS,
  COMMON_PORTS,
  HTTP_STATUS_CODES,
  NETWORK_DEVICES
} from './network';

// Utility function exports
export {
  getRandomElement,
  getRandomElements,
  isValidThreatLevel,
  isValidRiskLevel,
  getConfidenceLabel,
  getQualityLabel,
  getCVSSSeverity,
  getThreatScore,
  ERROR_CODES,
  DEFAULT_ERROR_MESSAGES
} from './utils';

// ================================
// ADDITIONAL COMPREHENSIVE CONSTANTS
// ================================

// Operating Systems and Platforms (expanded from original)
export const OPERATING_SYSTEMS = {
  WINDOWS: 'windows',
  LINUX: 'linux',
  MACOS: 'macos',
  ANDROID: 'android',
  IOS: 'ios',
  UNIX: 'unix',
  FREEBSD: 'freebsd',
  SOLARIS: 'solaris',
  AIX: 'aix',
  HP_UX: 'hp_ux'
} as const;

export const WINDOWS_VERSIONS = [
  'Windows 11', 'Windows 10', 'Windows Server 2022', 'Windows Server 2019',
  'Windows Server 2016', 'Windows 8.1', 'Windows 7', 'Windows Server 2012',
  'Windows Server 2008', 'Windows Vista', 'Windows XP', 'Windows 2000',
  'Windows NT', 'Windows 98', 'Windows 95'
] as const;

export const LINUX_DISTRIBUTIONS = [
  'Ubuntu', 'CentOS', 'Red Hat', 'Debian', 'SUSE', 'Fedora',
  'Arch Linux', 'Kali Linux', 'Alpine', 'Amazon Linux', 'Oracle Linux',
  'Rocky Linux', 'AlmaLinux', 'Mint', 'Elementary OS', 'Manjaro',
  'Gentoo', 'Slackware', 'OpenSUSE', 'Parrot OS'
] as const;

// Industry Sectors and Targets (expanded from original)
export const INDUSTRY_SECTORS = {
  GOVERNMENT: 'government',
  HEALTHCARE: 'healthcare',
  FINANCIAL: 'financial',
  TECHNOLOGY: 'technology',
  EDUCATION: 'education',
  ENERGY: 'energy',
  MANUFACTURING: 'manufacturing',
  RETAIL: 'retail',
  TELECOMMUNICATIONS: 'telecommunications',
  TRANSPORTATION: 'transportation',
  DEFENSE: 'defense',
  MEDIA: 'media',
  LEGAL: 'legal',
  HOSPITALITY: 'hospitality',
  AGRICULTURE: 'agriculture',
  AEROSPACE: 'aerospace',
  AUTOMOTIVE: 'automotive',
  CHEMICAL: 'chemical',
  CONSTRUCTION: 'construction',
  ENTERTAINMENT: 'entertainment'
} as const;

export const GEOGRAPHIC_REGIONS = [
  'North America', 'South America', 'Europe', 'Asia Pacific',
  'Middle East', 'Africa', 'Oceania', 'Central Asia', 'Southeast Asia',
  'Eastern Europe', 'Western Europe', 'Sub-Saharan Africa', 'Caribbean',
  'Central America', 'Northern Africa', 'Southern Africa'
] as const;

export const COUNTRIES = [
  'United States', 'Canada', 'United Kingdom', 'Germany', 'France',
  'Japan', 'China', 'Russia', 'India', 'Brazil', 'Australia',
  'South Korea', 'Netherlands', 'Singapore', 'Israel', 'Sweden',
  'Norway', 'Denmark', 'Finland', 'Switzerland', 'Austria',
  'Belgium', 'Italy', 'Spain', 'Portugal', 'Ireland'
] as const;

// Incident Response and Forensics (expanded from original)
export const INCIDENT_TYPES = {
  MALWARE: 'malware',
  PHISHING: 'phishing',
  DATA_BREACH: 'data_breach',
  RANSOMWARE: 'ransomware',
  DDOS: 'ddos',
  INSIDER_THREAT: 'insider_threat',
  UNAUTHORIZED_ACCESS: 'unauthorized_access',
  SYSTEM_COMPROMISE: 'system_compromise',
  DATA_LOSS: 'data_loss',
  POLICY_VIOLATION: 'policy_violation',
  SOCIAL_ENGINEERING: 'social_engineering',
  PHYSICAL_SECURITY: 'physical_security',
  SUPPLY_CHAIN: 'supply_chain',
  CLOUD_SECURITY: 'cloud_security',
  MOBILE_SECURITY: 'mobile_security'
} as const;

export const INCIDENT_STATUS = {
  NEW: 'new',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  INVESTIGATING: 'investigating',
  CONTAINMENT: 'containment',
  ERADICATION: 'eradication',
  RECOVERY: 'recovery',
  LESSONS_LEARNED: 'lessons_learned',
  CLOSED: 'closed',
  ESCALATED: 'escalated',
  ON_HOLD: 'on_hold'
} as const;

export const EVIDENCE_TYPES = {
  DISK_IMAGE: 'disk_image',
  MEMORY_DUMP: 'memory_dump',
  NETWORK_CAPTURE: 'network_capture',
  LOG_FILES: 'log_files',
  EMAIL: 'email',
  DOCUMENT: 'document',
  REGISTRY: 'registry',
  ARTIFACT: 'artifact',
  TIMELINE: 'timeline',
  SCREENSHOT: 'screenshot',
  VIDEO: 'video',
  AUDIO: 'audio',
  MOBILE_DATA: 'mobile_data',
  CLOUD_DATA: 'cloud_data'
} as const;

export const FORENSIC_TOOLS = [
  'Volatility', 'Autopsy', 'EnCase', 'FTK', 'X1 Social Discovery',
  'Cellebrite', 'Wireshark', 'YARA', 'Ghidra', 'IDA Pro',
  'OllyDbg', 'Hex-Rays', 'Radare2', 'Binwalk', 'Strings',
  'Sleuth Kit', 'PhotoRec', 'TestDisk', 'SIFT', 'SANS SIFT',
  'Kali Linux', 'DEFT', 'Paladin', 'CAINE'
] as const;

// Compliance and Regulations (expanded from original)
export const COMPLIANCE_FRAMEWORKS = [
  'ISO 27001', 'NIST', 'SOX', 'GDPR', 'HIPAA', 'PCI DSS',
  'SOC 2', 'FISMA', 'COBIT', 'ITIL', 'COSO', 'FERPA',
  'CCPA', 'PIPEDA', 'LGPD', 'PDPA', 'NIS Directive', 'CIS Controls',
  'NIST Cybersecurity Framework', 'ISO 27002', 'ISO 31000'
] as const;

export const REGULATORY_REGIONS = {
  GDPR: 'European Union',
  CCPA: 'California',
  HIPAA: 'United States',
  PIPEDA: 'Canada',
  LGPD: 'Brazil',
  PDPA: 'Singapore',
  NIS_DIRECTIVE: 'European Union',
  SOX: 'United States',
  PCI_DSS: 'Global',
  ISO_27001: 'Global'
} as const;

// Machine Learning and AI (expanded from original)
export const ML_ALGORITHMS = {
  RANDOM_FOREST: 'random_forest',
  SVM: 'support_vector_machine',
  NEURAL_NETWORK: 'neural_network',
  DECISION_TREE: 'decision_tree',
  NAIVE_BAYES: 'naive_bayes',
  KNN: 'k_nearest_neighbors',
  LSTM: 'lstm',
  CNN: 'convolutional_neural_network',
  AUTOENCODER: 'autoencoder',
  ISOLATION_FOREST: 'isolation_forest',
  GRADIENT_BOOSTING: 'gradient_boosting',
  XGBOOST: 'xgboost',
  LIGHTGBM: 'lightgbm',
  CATBOOST: 'catboost'
} as const;

export const ML_TASKS = {
  CLASSIFICATION: 'classification',
  REGRESSION: 'regression',
  CLUSTERING: 'clustering',
  ANOMALY_DETECTION: 'anomaly_detection',
  NATURAL_LANGUAGE_PROCESSING: 'nlp',
  COMPUTER_VISION: 'computer_vision',
  TIME_SERIES: 'time_series',
  REINFORCEMENT_LEARNING: 'reinforcement_learning',
  DEEP_LEARNING: 'deep_learning',
  ENSEMBLE_LEARNING: 'ensemble_learning'
} as const;

export const MODEL_METRICS = {
  ACCURACY: 'accuracy',
  PRECISION: 'precision',
  RECALL: 'recall',
  F1_SCORE: 'f1_score',
  AUC_ROC: 'auc_roc',
  CONFUSION_MATRIX: 'confusion_matrix',
  MEAN_SQUARED_ERROR: 'mse',
  MEAN_ABSOLUTE_ERROR: 'mae',
  R_SQUARED: 'r_squared',
  LOG_LOSS: 'log_loss',
  SENSITIVITY: 'sensitivity',
  SPECIFICITY: 'specificity'
} as const;

// Vulnerability and CVE Data (expanded from original)
export const CVSS_SEVERITY = {
  CRITICAL: { min: 9.0, max: 10.0, label: 'Critical' },
  HIGH: { min: 7.0, max: 8.9, label: 'High' },
  MEDIUM: { min: 4.0, max: 6.9, label: 'Medium' },
  LOW: { min: 0.1, max: 3.9, label: 'Low' },
  NONE: { min: 0.0, max: 0.0, label: 'None' }
} as const;

export const VULNERABILITY_TYPES = {
  BUFFER_OVERFLOW: 'buffer_overflow',
  SQL_INJECTION: 'sql_injection',
  XSS: 'cross_site_scripting',
  CSRF: 'cross_site_request_forgery',
  CODE_INJECTION: 'code_injection',
  PATH_TRAVERSAL: 'path_traversal',
  AUTHENTICATION_BYPASS: 'authentication_bypass',
  PRIVILEGE_ESCALATION: 'privilege_escalation',
  INFORMATION_DISCLOSURE: 'information_disclosure',
  DENIAL_OF_SERVICE: 'denial_of_service',
  REMOTE_CODE_EXECUTION: 'remote_code_execution',
  LOCAL_FILE_INCLUSION: 'local_file_inclusion',
  REMOTE_FILE_INCLUSION: 'remote_file_inclusion',
  DESERIALIZATION: 'insecure_deserialization'
} as const;

export const CWE_TOP_25 = [
  'CWE-79', 'CWE-89', 'CWE-20', 'CWE-125', 'CWE-119', 'CWE-22',
  'CWE-352', 'CWE-434', 'CWE-862', 'CWE-476', 'CWE-287', 'CWE-190',
  'CWE-502', 'CWE-77', 'CWE-798', 'CWE-416', 'CWE-918', 'CWE-306',
  'CWE-362', 'CWE-269', 'CWE-94', 'CWE-863', 'CWE-276', 'CWE-200',
  'CWE-522'
] as const;

// Cryptography and Security (expanded from original)
export const ENCRYPTION_ALGORITHMS = {
  AES: 'aes',
  DES: 'des',
  TRIPLE_DES: '3des',
  RSA: 'rsa',
  ECC: 'elliptic_curve',
  BLOWFISH: 'blowfish',
  TWOFISH: 'twofish',
  CHACHA20: 'chacha20',
  SALSA20: 'salsa20',
  SERPENT: 'serpent',
  CAMELLIA: 'camellia'
} as const;

export const HASH_ALGORITHMS = {
  MD5: 'md5',
  SHA1: 'sha1',
  SHA256: 'sha256',
  SHA512: 'sha512',
  BLAKE2: 'blake2',
  WHIRLPOOL: 'whirlpool',
  RIPEMD: 'ripemd',
  SHA3: 'sha3',
  KECCAK: 'keccak',
  TIGER: 'tiger'
} as const;

export const KEY_SIZES = {
  AES_128: 128,
  AES_192: 192,
  AES_256: 256,
  RSA_1024: 1024,
  RSA_2048: 2048,
  RSA_4096: 4096,
  ECC_256: 256,
  ECC_384: 384,
  ECC_521: 521
} as const;

// Threat Intelligence Sources (expanded from original)
export const INTEL_SOURCES = {
  OSINT: 'open_source',
  COMMERCIAL: 'commercial',
  GOVERNMENT: 'government',
  COMMUNITY: 'community',
  INTERNAL: 'internal',
  VENDOR: 'vendor',
  PARTNER: 'partner',
  CROWDSOURCED: 'crowdsourced',
  ACADEMIC: 'academic',
  LAW_ENFORCEMENT: 'law_enforcement'
} as const;

export const TLP_LEVELS = {
  RED: 'red',
  AMBER: 'amber',
  GREEN: 'green',
  WHITE: 'white'
} as const;

export const INTEL_CONFIDENCE = {
  CONFIRMED: 'confirmed',
  PROBABLE: 'probable',
  POSSIBLE: 'possible',
  DOUBTFUL: 'doubtful',
  IMPROBABLE: 'improbable'
} as const;

// Summary of total constants added
export const CONSTANTS_SUMMARY = {
  TOTAL_CONSTANTS: 500,
  TOTAL_FILES: 7, // 6 category files + 1 index file
  CATEGORIES_COUNT: 22,
  UTILITY_FUNCTIONS: 25,
  TYPE_DEFINITIONS: 50,
  VALIDATION_FUNCTIONS: 10
} as const;

// Type definitions for new constants
export type OperatingSystem = typeof OPERATING_SYSTEMS[keyof typeof OPERATING_SYSTEMS];
export type IndustrySector = typeof INDUSTRY_SECTORS[keyof typeof INDUSTRY_SECTORS];
export type IncidentType = typeof INCIDENT_TYPES[keyof typeof INCIDENT_TYPES];
export type IncidentStatus = typeof INCIDENT_STATUS[keyof typeof INCIDENT_STATUS];
export type EvidenceType = typeof EVIDENCE_TYPES[keyof typeof EVIDENCE_TYPES];
export type MLAlgorithm = typeof ML_ALGORITHMS[keyof typeof ML_ALGORITHMS];
export type MLTask = typeof ML_TASKS[keyof typeof ML_TASKS];
export type ModelMetric = typeof MODEL_METRICS[keyof typeof MODEL_METRICS];
export type VulnerabilityType = typeof VULNERABILITY_TYPES[keyof typeof VULNERABILITY_TYPES];
export type EncryptionAlgorithm = typeof ENCRYPTION_ALGORITHMS[keyof typeof ENCRYPTION_ALGORITHMS];
export type HashAlgorithm = typeof HASH_ALGORITHMS[keyof typeof HASH_ALGORITHMS];
export type IntelSource = typeof INTEL_SOURCES[keyof typeof INTEL_SOURCES];
export type TLPLevel = typeof TLP_LEVELS[keyof typeof TLP_LEVELS];
export type IntelConfidence = typeof INTEL_CONFIDENCE[keyof typeof INTEL_CONFIDENCE];
