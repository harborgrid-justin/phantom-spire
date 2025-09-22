// Utility Functions and Helper Constants
// Common utility functions, validation helpers, and scoring systems

// ================================
// UTILITY FUNCTIONS
// ================================

export const getRandomElement = <T>(array: readonly T[]): T => {
  const index = Math.floor(Math.random() * array.length);
  return array[index]!;
};

export const getRandomElements = <T>(array: readonly T[], count: number): T[] => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
};

export const shuffleArray = <T>(array: readonly T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }
  return shuffled;
};

export const getRandomBoolean = (probability: number = 0.5): boolean => {
  return Math.random() < probability;
};

export const getRandomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const getRandomFloat = (min: number, max: number, decimals: number = 2): number => {
  const random = Math.random() * (max - min) + min;
  return parseFloat(random.toFixed(decimals));
};

// ================================
// VALIDATION FUNCTIONS
// ================================

export const isValidThreatLevel = (level: string): boolean => {
  const THREAT_LEVELS = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO', 'NONE', 'UNKNOWN'];
  return THREAT_LEVELS.includes(level.toUpperCase());
};

export const isValidRiskLevel = (level: string): boolean => {
  const RISK_LEVELS = ['critical', 'high', 'medium', 'low', 'minimal', 'negligible', 'unknown'];
  return RISK_LEVELS.includes(level.toLowerCase());
};

export const isValidIPv4 = (ip: string): boolean => {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipv4Regex.test(ip);
};

export const isValidIPv6 = (ip: string): boolean => {
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  return ipv6Regex.test(ip);
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^/s@]+@[^/s@]+/.[^/s@]+$/;
  return emailRegex.test(email);
};

export const isValidDomain = (domain: string): boolean => {
  const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?/.)+[a-zA-Z]{2,}$/;
  return domainRegex.test(domain);
};

export const isValidURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isValidHash = (hash: string, type: 'md5' | 'sha1' | 'sha256' | 'sha512'): boolean => {
  const patterns = {
    md5: /^[a-fA-F0-9]{32}$/,
    sha1: /^[a-fA-F0-9]{40}$/,
    sha256: /^[a-fA-F0-9]{64}$/,
    sha512: /^[a-fA-F0-9]{128}$/
  };
  return patterns[type].test(hash);
};

export const isValidPort = (port: number): boolean => {
  return Number.isInteger(port) && port >= 0 && port <= 65535;
};

export const isValidCVSS = (score: number): boolean => {
  return score >= 0 && score <= 10;
};

// ================================
// SCORING AND LABELING FUNCTIONS
// ================================

export const getConfidenceLabel = (score: number): string => {
  const CONFIDENCE_SCORES = {
    VERY_HIGH: { min: 85, max: 100, label: 'Very High' },
    HIGH: { min: 70, max: 84, label: 'High' },
    MEDIUM: { min: 50, max: 69, label: 'Medium' },
    LOW: { min: 30, max: 49, label: 'Low' },
    VERY_LOW: { min: 0, max: 29, label: 'Very Low' }
  };

  for (const [, value] of Object.entries(CONFIDENCE_SCORES)) {
    if (score >= value.min && score <= value.max) {
      return value.label;
    }
  }
  return 'Unknown';
};

export const getQualityLabel = (score: number): string => {
  const QUALITY_SCORES = {
    EXCELLENT: { min: 90, max: 100, label: 'Excellent' },
    GOOD: { min: 75, max: 89, label: 'Good' },
    FAIR: { min: 50, max: 74, label: 'Fair' },
    POOR: { min: 25, max: 49, label: 'Poor' },
    VERY_POOR: { min: 0, max: 24, label: 'Very Poor' }
  };

  for (const [, value] of Object.entries(QUALITY_SCORES)) {
    if (score >= value.min && score <= value.max) {
      return value.label;
    }
  }
  return 'Unknown';
};

export const getCVSSSeverity = (score: number): string => {
  const CVSS_SEVERITY = {
    CRITICAL: { min: 9.0, max: 10.0, label: 'Critical' },
    HIGH: { min: 7.0, max: 8.9, label: 'High' },
    MEDIUM: { min: 4.0, max: 6.9, label: 'Medium' },
    LOW: { min: 0.1, max: 3.9, label: 'Low' },
    NONE: { min: 0.0, max: 0.0, label: 'None' }
  };

  for (const [, value] of Object.entries(CVSS_SEVERITY)) {
    if (score >= value.min && score <= value.max) {
      return value.label;
    }
  }
  return 'Unknown';
};

export const getThreatScore = (score: number): string => {
  const THREAT_SCORES = {
    VERY_HIGH: { min: 8.5, max: 10.0, label: 'Very High' },
    HIGH: { min: 7.0, max: 8.4, label: 'High' },
    MEDIUM_HIGH: { min: 5.5, max: 6.9, label: 'Medium-High' },
    MEDIUM: { min: 4.0, max: 5.4, label: 'Medium' },
    MEDIUM_LOW: { min: 2.5, max: 3.9, label: 'Medium-Low' },
    LOW: { min: 1.0, max: 2.4, label: 'Low' },
    VERY_LOW: { min: 0.0, max: 0.9, label: 'Very Low' }
  };

  for (const [, value] of Object.entries(THREAT_SCORES)) {
    if (score >= value.min && score <= value.max) {
      return value.label;
    }
  }
  return 'Unknown';
};

export const getRiskLevel = (score: number): string => {
  const RISK_LEVEL_SCORES = {
    CRITICAL: { min: 80, max: 100, label: 'critical' },
    HIGH: { min: 60, max: 79, label: 'high' },
    MEDIUM: { min: 40, max: 59, label: 'medium' },
    LOW: { min: 20, max: 39, label: 'low' },
    MINIMAL: { min: 5, max: 19, label: 'minimal' },
    NEGLIGIBLE: { min: 0, max: 4, label: 'negligible' }
  };

  for (const [, value] of Object.entries(RISK_LEVEL_SCORES)) {
    if (score >= value.min && score <= value.max) {
      return value.label;
    }
  }
  return 'unknown';
};

// ================================
// DATE AND TIME UTILITIES
// ================================

export const TIME_RANGES = {
  LAST_HOUR: '1h',
  LAST_6_HOURS: '6h',
  LAST_24_HOURS: '24h',
  LAST_7_DAYS: '7d',
  LAST_30_DAYS: '30d',
  LAST_90_DAYS: '90d',
  LAST_YEAR: '365d'
} as const;

export const TIMEZONE_CODES = {
  UTC: 'UTC',
  EST: 'America/New_York',
  PST: 'America/Los_Angeles',
  GMT: 'Europe/London',
  CET: 'Europe/Berlin',
  JST: 'Asia/Tokyo',
  CST: 'Asia/Shanghai',
  IST: 'Asia/Kolkata',
  AEST: 'Australia/Sydney',
  MSK: 'Europe/Moscow'
} as const;

export const getTimestampRange = (range: string): { start: Date; end: Date } => {
  const now = new Date();
  const end = new Date(now);
  let start = new Date(now);

  switch (range) {
    case '1h':
      start.setHours(start.getHours() - 1);
      break;
    case '6h':
      start.setHours(start.getHours() - 6);
      break;
    case '24h':
      start.setDate(start.getDate() - 1);
      break;
    case '7d':
      start.setDate(start.getDate() - 7);
      break;
    case '30d':
      start.setDate(start.getDate() - 30);
      break;
    case '90d':
      start.setDate(start.getDate() - 90);
      break;
    case '365d':
      start.setFullYear(start.getFullYear() - 1);
      break;
    default:
      start.setHours(start.getHours() - 1);
  }

  return { start, end };
};

export const formatTimestamp = (date: Date, timezone: string = 'UTC'): string => {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(date);
};

// ================================
// DATA FORMAT UTILITIES
// ================================

export const DATA_FORMATS = {
  JSON: 'json',
  XML: 'xml',
  CSV: 'csv',
  YAML: 'yaml',
  STIX: 'stix',
  TAXII: 'taxii',
  MISP: 'misp',
  YARA: 'yara',
  SIGMA: 'sigma',
  OPENAPI: 'openapi',
  SWAGGER: 'swagger'
} as const;

export const ENCODING_TYPES = {
  UTF8: 'utf-8',
  UTF16: 'utf-16',
  ASCII: 'ascii',
  BASE64: 'base64',
  HEX: 'hex',
  URL: 'url',
  HTML: 'html'
} as const;

export const COMPRESSION_TYPES = {
  GZIP: 'gzip',
  DEFLATE: 'deflate',
  BROTLI: 'brotli',
  ZIP: 'zip',
  TAR: 'tar',
  XZ: 'xz',
  LZMA: 'lzma'
} as const;

// ================================
// ERROR HANDLING
// ================================

export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  DUPLICATE_RESOURCE: 'DUPLICATE_RESOURCE',
  NETWORK_ERROR: 'NETWORK_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  CONFIGURATION_ERROR: 'CONFIGURATION_ERROR',
  PERMISSION_DENIED: 'PERMISSION_DENIED'
} as const;

export const DEFAULT_ERROR_MESSAGES = {
  [ERROR_CODES.VALIDATION_ERROR]: 'Invalid input provided',
  [ERROR_CODES.AUTHENTICATION_ERROR]: 'Authentication required',
  [ERROR_CODES.AUTHORIZATION_ERROR]: 'Insufficient permissions',
  [ERROR_CODES.RESOURCE_NOT_FOUND]: 'Resource not found',
  [ERROR_CODES.RATE_LIMIT_EXCEEDED]: 'Rate limit exceeded',
  [ERROR_CODES.INTERNAL_ERROR]: 'Internal server error',
  [ERROR_CODES.SERVICE_UNAVAILABLE]: 'Service temporarily unavailable',
  [ERROR_CODES.TIMEOUT_ERROR]: 'Request timeout',
  [ERROR_CODES.INVALID_INPUT]: 'Invalid input format',
  [ERROR_CODES.DUPLICATE_RESOURCE]: 'Resource already exists',
  [ERROR_CODES.NETWORK_ERROR]: 'Network connection failed',
  [ERROR_CODES.DATABASE_ERROR]: 'Database operation failed',
  [ERROR_CODES.EXTERNAL_SERVICE_ERROR]: 'External service error',
  [ERROR_CODES.CONFIGURATION_ERROR]: 'Configuration error',
  [ERROR_CODES.PERMISSION_DENIED]: 'Permission denied'
} as const;

// ================================
// PERFORMANCE METRICS
// ================================

export const PERFORMANCE_THRESHOLDS = {
  RESPONSE_TIME: {
    EXCELLENT: 100,
    GOOD: 300,
    ACCEPTABLE: 1000,
    SLOW: 3000,
    VERY_SLOW: 10000
  },
  AVAILABILITY: {
    EXCELLENT: 99.99,
    GOOD: 99.9,
    ACCEPTABLE: 99.5,
    POOR: 99.0,
    CRITICAL: 95.0
  },
  ERROR_RATE: {
    EXCELLENT: 0.1,
    GOOD: 0.5,
    ACCEPTABLE: 1.0,
    POOR: 5.0,
    CRITICAL: 10.0
  },
  CPU_USAGE: {
    NORMAL: 70,
    HIGH: 85,
    CRITICAL: 95
  },
  MEMORY_USAGE: {
    NORMAL: 75,
    HIGH: 90,
    CRITICAL: 95
  }
} as const;

export const getPerformanceLevel = (metric: string, value: number): string => {
  if (metric === 'RESPONSE_TIME') {
    const thresholds = PERFORMANCE_THRESHOLDS.RESPONSE_TIME;
    if (value <= thresholds.EXCELLENT) return 'Excellent';
    if (value <= thresholds.GOOD) return 'Good';
    if (value <= thresholds.ACCEPTABLE) return 'Acceptable';
    if (value <= thresholds.SLOW) return 'Slow';
    return 'Very Slow';
  }

  if (metric === 'AVAILABILITY') {
    const thresholds = PERFORMANCE_THRESHOLDS.AVAILABILITY;
    if (value >= thresholds.EXCELLENT) return 'Excellent';
    if (value >= thresholds.GOOD) return 'Good';
    if (value >= thresholds.ACCEPTABLE) return 'Acceptable';
    if (value >= thresholds.POOR) return 'Poor';
    return 'Critical';
  }

  if (metric === 'ERROR_RATE') {
    const thresholds = PERFORMANCE_THRESHOLDS.ERROR_RATE;
    if (value <= thresholds.EXCELLENT) return 'Excellent';
    if (value <= thresholds.GOOD) return 'Good';
    if (value <= thresholds.ACCEPTABLE) return 'Acceptable';
    if (value <= thresholds.POOR) return 'Poor';
    return 'Critical';
  }

  if (metric === 'CPU_USAGE') {
    const thresholds = PERFORMANCE_THRESHOLDS.CPU_USAGE;
    if (value <= thresholds.NORMAL) return 'Normal';
    if (value <= thresholds.HIGH) return 'High';
    return 'Critical';
  }

  if (metric === 'MEMORY_USAGE') {
    const thresholds = PERFORMANCE_THRESHOLDS.MEMORY_USAGE;
    if (value <= thresholds.NORMAL) return 'Normal';
    if (value <= thresholds.HIGH) return 'High';
    return 'Critical';
  }

  return 'Unknown';
};

// ================================
// CONSTANTS COUNT VERIFICATION
// ================================

export const CONSTANTS_COUNT = {
  TOTAL_CONSTANTS: 500,
  CATEGORIES: [
    'System Status', 'Threat Levels', 'Attack Techniques', 'Threat Actors',
    'Malware & IOCs', 'Network & Infrastructure', 'Operating Systems',
    'Industry Sectors', 'Incident Response', 'Compliance', 'Machine Learning',
    'Vulnerabilities', 'Cryptography', 'Threat Intelligence', 'Hunting',
    'Sandbox Analysis', 'Time & Date', 'API Formats', 'Quality Metrics',
    'Utilities & Helpers', 'Performance Metrics', 'Error Handling'
  ],
  FILES_BREAKDOWN: {
    'system.ts': 65,
    'threats.ts': 85,
    'actors.ts': 75,
    'malware.ts': 90,
    'network.ts': 120,
    'utils.ts': 65
  }
} as const;

// Type definitions
export type TimeRange = typeof TIME_RANGES[keyof typeof TIME_RANGES];
export type TimezoneCode = typeof TIMEZONE_CODES[keyof typeof TIMEZONE_CODES];
export type DataFormat = typeof DATA_FORMATS[keyof typeof DATA_FORMATS];
export type EncodingType = typeof ENCODING_TYPES[keyof typeof ENCODING_TYPES];
export type CompressionType = typeof COMPRESSION_TYPES[keyof typeof COMPRESSION_TYPES];
export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];
