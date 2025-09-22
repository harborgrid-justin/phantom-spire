// API Configuration
// Configuration for API endpoints, timeouts, CORS, and request handling

export interface APIConfig {
  version: string;
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  enableCompression: boolean;
  enableCors: boolean;
  corsOrigins: string[];
  maxRequestSize: string;
  enableSwagger: boolean;
  rateLimitWindowMs: number;
  rateLimitMax: number;
  enableMetrics: boolean;
  enableHealthCheck: boolean;
}

export const API_DEFAULTS: APIConfig = {
  version: '1.0.0',
  baseUrl: '/api/phantom-cores',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  enableCompression: true,
  enableCors: true,
  corsOrigins: ['http://localhost:3000', 'https://localhost:3000'],
  maxRequestSize: '10mb',
  enableSwagger: false,
  rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
  rateLimitMax: 1000,
  enableMetrics: true,
  enableHealthCheck: true,
};

export const API_ENDPOINTS = {
  // Core endpoints
  HEALTH: '/health',
  METRICS: '/metrics',
  STATUS: '/status',
  
  // Risk management endpoints
  RISK: '/risk',
  RISK_ASSESSMENT: '/risk/assessment',
  RISK_ANALYSIS: '/risk/analysis',
  RISK_MITIGATION: '/risk/mitigation',
  
  // Compliance endpoints
  COMPLIANCE: '/compliance',
  COMPLIANCE_ANALYSIS: '/compliance/analysis',
  COMPLIANCE_AUDIT: '/compliance/audit',
  COMPLIANCE_REPORT: '/compliance/report',
  
  // CVE endpoints
  CVE: '/cve',
  CVE_SEARCH: '/cve/search',
  CVE_ANALYSIS: '/cve/analysis',
  CVE_TRACKING: '/cve/tracking',
  
  // Threat intelligence endpoints
  INTEL: '/intel',
  INTEL_SEARCH: '/intel/search',
  INTEL_ANALYSIS: '/intel/analysis',
  INTEL_FEEDS: '/intel/feeds',
  
  // Incident response endpoints
  INCIDENT: '/incident-response',
  INCIDENT_CREATE: '/incident-response/create',
  INCIDENT_UPDATE: '/incident-response/update',
  INCIDENT_TIMELINE: '/incident-response/timeline',
  
  // Forensics endpoints
  FORENSICS: '/forensics',
  FORENSICS_ANALYSIS: '/forensics/analysis',
  FORENSICS_EVIDENCE: '/forensics/evidence',
  FORENSICS_REPORT: '/forensics/report',
  
  // Threat hunting endpoints
  HUNTING: '/hunting',
  HUNTING_SEARCH: '/hunting/search',
  HUNTING_ANALYSIS: '/hunting/analysis',
  HUNTING_RULES: '/hunting/rules',
  
  // IOC endpoints
  IOC: '/ioc',
  IOC_SEARCH: '/ioc/search',
  IOC_ANALYSIS: '/ioc/analysis',
  IOC_ENRICHMENT: '/ioc/enrichment',
  
  // MITRE endpoints
  MITRE: '/mitre',
  MITRE_TACTICS: '/mitre/tactics',
  MITRE_TECHNIQUES: '/mitre/techniques',
  MITRE_MAPPING: '/mitre/mapping',
  
  // ML endpoints
  ML: '/ml',
  ML_ANALYSIS: '/ml/analysis',
  ML_MODELS: '/ml/models',
  ML_TRAINING: '/ml/training',
  
  // Reputation endpoints
  REPUTATION: '/reputation',
  REPUTATION_CHECK: '/reputation/check',
  REPUTATION_ANALYSIS: '/reputation/analysis',
  
  // Sandbox endpoints
  SANDBOX: '/sandbox',
  SANDBOX_SUBMIT: '/sandbox/submit',
  SANDBOX_ANALYSIS: '/sandbox/analysis',
  SANDBOX_REPORT: '/sandbox/report',
  
  // Threat actor endpoints
  THREAT_ACTOR: '/threat-actor',
  THREAT_ACTOR_SEARCH: '/threat-actor/search',
  THREAT_ACTOR_ANALYSIS: '/threat-actor/analysis',
  THREAT_ACTOR_ATTRIBUTION: '/threat-actor/attribution',
  
  // XDR endpoints
  XDR: '/xdr',
  XDR_EVENTS: '/xdr/events',
  XDR_ANALYSIS: '/xdr/analysis',
  XDR_CORRELATION: '/xdr/correlation',
} as const;

export const HTTP_STATUS_CODES = {
  // Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  
  // Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  
  // Server Errors
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

export const CONTENT_TYPES = {
  JSON: 'application/json',
  XML: 'application/xml',
  TEXT: 'text/plain',
  HTML: 'text/html',
  CSV: 'text/csv',
  BINARY: 'application/octet-stream',
  FORM_DATA: 'multipart/form-data',
  URL_ENCODED: 'application/x-www-form-urlencoded',
  STIX: 'application/stix+json',
  YARA: 'text/x-yara',
} as const;

export const API_RESPONSE_FORMATS = {
  SUCCESS: 'success',
  ERROR: 'error',
  PAGINATED: 'paginated',
  STREAMING: 'streaming',
} as const;

export const PAGINATION_DEFAULTS = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 1000,
  DEFAULT_SORT: 'created_at',
  DEFAULT_ORDER: 'desc',
} as const;

export const CACHE_HEADERS = {
  NO_CACHE: 'no-cache, no-store, must-revalidate',
  CACHE_1_HOUR: 'public, max-age=3600',
  CACHE_1_DAY: 'public, max-age=86400',
  CACHE_1_WEEK: 'public, max-age=604800',
  CACHE_1_MONTH: 'public, max-age=2592000',
} as const;

export const CORS_DEFAULTS = {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-API-Key',
    'X-Client-Version',
    'X-Request-ID',
  ],
  exposedHeaders: [
    'X-Request-ID',
    'X-Response-Time',
    'X-Rate-Limit-Limit',
    'X-Rate-Limit-Remaining',
    'X-Rate-Limit-Reset',
  ],
  maxAge: 86400, // 24 hours
} as const;

// Type definitions
export type APIEndpoint = typeof API_ENDPOINTS[keyof typeof API_ENDPOINTS];
export type HTTPStatusCode = typeof HTTP_STATUS_CODES[keyof typeof HTTP_STATUS_CODES];
export type ContentType = typeof CONTENT_TYPES[keyof typeof CONTENT_TYPES];
export type ResponseFormat = typeof API_RESPONSE_FORMATS[keyof typeof API_RESPONSE_FORMATS];
