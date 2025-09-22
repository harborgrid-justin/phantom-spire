// Database Configuration
// Configuration for database connections, pools, and queries

export interface DatabaseConfig {
  type: 'mongodb' | 'postgresql' | 'mysql' | 'sqlite';
  host: string;
  port: number;
  name: string;
  username?: string;
  password?: string;
  ssl: boolean;
  poolSize: number;
  timeout: number;
  retryWrites: boolean;
  readPreference: 'primary' | 'secondary' | 'nearest';
  maxRetries: number;
  retryDelayMs: number;
  enableLogging: boolean;
}

export const DATABASE_DEFAULTS: DatabaseConfig = {
  type: 'mongodb',
  host: 'localhost',
  port: 27017,
  name: 'phantom_cores',
  ssl: false,
  poolSize: 10,
  timeout: 30000,
  retryWrites: true,
  readPreference: 'primary',
  maxRetries: 3,
  retryDelayMs: 1000,
  enableLogging: false,
};

export const DATABASE_PORTS = {
  MONGODB: 27017,
  POSTGRESQL: 5432,
  MYSQL: 3306,
  REDIS: 6379,
  ELASTICSEARCH: 9200,
  CASSANDRA: 9042,
  INFLUXDB: 8086,
} as const;

export const CONNECTION_STRINGS = {
  MONGODB: (config: DatabaseConfig) => {
    const auth = config.username && config.password ? `${config.username}:${config.password}@` : '';
    const ssl = config.ssl ? '?ssl=true' : '';
    return `mongodb://${auth}${config.host}:${config.port}/${config.name}${ssl}`;
  },
  
  POSTGRESQL: (config: DatabaseConfig) => {
    const ssl = config.ssl ? '?sslmode=require' : '';
    return `postgresql://${config.username}:${config.password}@${config.host}:${config.port}/${config.name}${ssl}`;
  },
  
  MYSQL: (config: DatabaseConfig) => {
    const ssl = config.ssl ? '?ssl=true' : '';
    return `mysql://${config.username}:${config.password}@${config.host}:${config.port}/${config.name}${ssl}`;
  },
} as const;

export const COLLECTION_NAMES = {
  // Core collections
  USERS: 'users',
  SESSIONS: 'sessions',
  AUDIT_LOGS: 'audit_logs',
  
  // Risk management collections
  RISK_ASSESSMENTS: 'risk_assessments',
  RISK_MITIGATIONS: 'risk_mitigations',
  RISK_PROFILES: 'risk_profiles',
  RISK_METRICS: 'risk_metrics',
  
  // Compliance collections
  COMPLIANCE_FRAMEWORKS: 'compliance_frameworks',
  COMPLIANCE_ASSESSMENTS: 'compliance_assessments',
  COMPLIANCE_AUDITS: 'compliance_audits',
  COMPLIANCE_REPORTS: 'compliance_reports',
  
  // CVE collections
  CVES: 'cves',
  CVE_ANALYSIS: 'cve_analysis',
  CVE_TRACKING: 'cve_tracking',
  VULNERABILITY_SCANS: 'vulnerability_scans',
  
  // Threat intelligence collections
  THREAT_INTEL: 'threat_intel',
  IOC_DATA: 'ioc_data',
  THREAT_ACTORS: 'threat_actors',
  CAMPAIGNS: 'campaigns',
  INDICATORS: 'indicators',
  
  // Incident response collections
  INCIDENTS: 'incidents',
  INCIDENT_TIMELINE: 'incident_timeline',
  INCIDENT_EVIDENCE: 'incident_evidence',
  INCIDENT_REPORTS: 'incident_reports',
  
  // Forensics collections
  FORENSIC_CASES: 'forensic_cases',
  EVIDENCE_ITEMS: 'evidence_items',
  FORENSIC_ANALYSIS: 'forensic_analysis',
  FORENSIC_REPORTS: 'forensic_reports',
  
  // Threat hunting collections
  HUNT_CAMPAIGNS: 'hunt_campaigns',
  HUNT_QUERIES: 'hunt_queries',
  HUNT_RESULTS: 'hunt_results',
  HUNT_RULES: 'hunt_rules',
  
  // ML collections
  ML_MODELS: 'ml_models',
  ML_DATASETS: 'ml_datasets',
  ML_TRAINING_JOBS: 'ml_training_jobs',
  ML_PREDICTIONS: 'ml_predictions',
  
  // Sandbox collections
  SANDBOX_SUBMISSIONS: 'sandbox_submissions',
  SANDBOX_REPORTS: 'sandbox_reports',
  SANDBOX_ARTIFACTS: 'sandbox_artifacts',
  
  // XDR collections
  XDR_EVENTS: 'xdr_events',
  XDR_ALERTS: 'xdr_alerts',
  XDR_CORRELATIONS: 'xdr_correlations',
  
  // Configuration collections
  CONFIGURATIONS: 'configurations',
  FEATURE_FLAGS: 'feature_flags',
  API_KEYS: 'api_keys',
} as const;

export const INDEX_DEFINITIONS = {
  // Common indexes
  CREATED_AT: { created_at: -1 },
  UPDATED_AT: { updated_at: -1 },
  STATUS: { status: 1 },
  USER_ID: { user_id: 1 },
  
  // Risk-specific indexes
  RISK_LEVEL: { risk_level: 1 },
  RISK_SCORE: { risk_score: -1 },
  ASSESSMENT_DATE: { assessment_date: -1 },
  
  // CVE-specific indexes
  CVE_ID: { cve_id: 1 },
  CVSS_SCORE: { cvss_score: -1 },
  PUBLISHED_DATE: { published_date: -1 },
  
  // Threat intel indexes
  IOC_VALUE: { value: 1 },
  IOC_TYPE: { type: 1 },
  CONFIDENCE: { confidence: -1 },
  TLP_LEVEL: { tlp_level: 1 },
  
  // Incident indexes
  INCIDENT_TYPE: { incident_type: 1 },
  SEVERITY: { severity: -1 },
  ASSIGNED_TO: { assigned_to: 1 },
  
  // Compound indexes
  USER_STATUS: { user_id: 1, status: 1 },
  TYPE_DATE: { type: 1, created_at: -1 },
  LEVEL_SCORE: { level: 1, score: -1 },
} as const;

export const QUERY_DEFAULTS = {
  DEFAULT_LIMIT: 100,
  MAX_LIMIT: 1000,
  DEFAULT_SKIP: 0,
  DEFAULT_SORT: { created_at: -1 },
  DEFAULT_TIMEOUT: 30000,
} as const;

export const AGGREGATION_PIPELINE_STAGES = {
  // Common stages
  MATCH: '$match',
  GROUP: '$group',
  PROJECT: '$project',
  SORT: '$sort',
  LIMIT: '$limit',
  SKIP: '$skip',
  UNWIND: '$unwind',
  LOOKUP: '$lookup',
  
  // Analytics stages
  FACET: '$facet',
  BUCKET: '$bucket',
  COUNT: '$count',
  SUM: '$sum',
  AVG: '$avg',
  MIN: '$min',
  MAX: '$max',
} as const;

export const MONGODB_OPERATORS = {
  // Comparison operators
  EQ: '$eq',
  NE: '$ne',
  GT: '$gt',
  GTE: '$gte',
  LT: '$lt',
  LTE: '$lte',
  IN: '$in',
  NIN: '$nin',
  
  // Logical operators
  AND: '$and',
  OR: '$or',
  NOT: '$not',
  NOR: '$nor',
  
  // Element operators
  EXISTS: '$exists',
  TYPE: '$type',
  
  // Array operators
  ALL: '$all',
  ELEM_MATCH: '$elemMatch',
  SIZE: '$size',
  
  // Text operators
  TEXT: '$text',
  REGEX: '$regex',
  
  // Geospatial operators
  GEO_WITHIN: '$geoWithin',
  NEAR: '$near',
  NEAR_SPHERE: '$nearSphere',
} as const;

export const DATABASE_VALIDATION_RULES = {
  // Common field validations
  REQUIRED_STRING: { $type: 'string', minLength: 1 },
  OPTIONAL_STRING: { $type: 'string' },
  POSITIVE_NUMBER: { $type: 'number', minimum: 0 },
  EMAIL_FORMAT: { $type: 'string', format: 'email' },
  URL_FORMAT: { $type: 'string', format: 'uri' },
  UUID_FORMAT: { $type: 'string', pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' },
  
  // Risk-specific validations
  RISK_SCORE: { $type: 'number', minimum: 0, maximum: 100 },
  CVSS_SCORE: { $type: 'number', minimum: 0, maximum: 10 },
  CONFIDENCE_LEVEL: { $type: 'number', minimum: 0, maximum: 1 },
  
  // Status validations
  INCIDENT_STATUS: { 
    $type: 'string', 
    enum: ['new', 'assigned', 'in_progress', 'investigating', 'resolved', 'closed'] 
  },
  THREAT_LEVEL: { 
    $type: 'string', 
    enum: ['critical', 'high', 'medium', 'low', 'info', 'unknown'] 
  },
  TLP_LEVEL: { 
    $type: 'string', 
    enum: ['red', 'amber', 'green', 'white'] 
  },
} as const;

export const CONNECTION_POOL_SETTINGS = {
  MONGODB: {
    minPoolSize: 5,
    maxPoolSize: 50,
    maxIdleTimeMS: 30000,
    waitQueueTimeoutMS: 5000,
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 30000,
    connectTimeoutMS: 10000,
    heartbeatFrequencyMS: 10000,
    maxStalenessSeconds: 90,
  },
  
  POSTGRESQL: {
    min: 5,
    max: 50,
    acquireTimeoutMillis: 5000,
    createTimeoutMillis: 10000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 200,
  },
  
  MYSQL: {
    connectionLimit: 50,
    timeout: 30000,
    acquireTimeout: 5000,
    reconnect: true,
    multipleStatements: false,
    dateStrings: true,
  },
} as const;

export const BACKUP_SETTINGS = {
  ENABLED: true,
  SCHEDULE: '0 2 * * *', // Daily at 2 AM
  RETENTION_DAYS: 30,
  COMPRESSION: true,
  ENCRYPTION: true,
  BACKUP_LOCATION: '/var/backups/phantom-cores',
  NOTIFICATION_EMAIL: 'admin@phantom-cores.com',
} as const;

// Type definitions
export type DatabaseType = typeof DATABASE_DEFAULTS.type;
export type ReadPreference = typeof DATABASE_DEFAULTS.readPreference;
export type CollectionName = typeof COLLECTION_NAMES[keyof typeof COLLECTION_NAMES];
export type MongoOperator = typeof MONGODB_OPERATORS[keyof typeof MONGODB_OPERATORS];
export type AggregationStage = typeof AGGREGATION_PIPELINE_STAGES[keyof typeof AGGREGATION_PIPELINE_STAGES];
