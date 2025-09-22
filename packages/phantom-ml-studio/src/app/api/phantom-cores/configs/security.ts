// Security Configuration
// Configuration for authentication, authorization, encryption, and security policies

export interface SecurityConfig {
  jwt: {
    secret: string;
    expiresIn: string;
    refreshExpiresIn: string;
    algorithm: string;
  };
  encryption: {
    algorithm: string;
    keySize: number;
    ivLength: number;
  };
  rateLimit: {
    windowMs: number;
    max: number;
    skipSuccessfulRequests: boolean;
    skipFailedRequests: boolean;
  };
  csrf: {
    enabled: boolean;
    secret: string;
  };
  helmet: {
    enabled: boolean;
    contentSecurityPolicy: boolean;
    crossOriginEmbedderPolicy: boolean;
  };
}

export const SECURITY_DEFAULTS: SecurityConfig = {
  jwt: {
    secret: 'your-secret-key',
    expiresIn: '15m',
    refreshExpiresIn: '7d',
    algorithm: 'HS256',
  },
  encryption: {
    algorithm: 'aes-256-gcm',
    keySize: 32,
    ivLength: 16,
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 1000,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
  },
  csrf: {
    enabled: true,
    secret: 'your-csrf-secret',
  },
  helmet: {
    enabled: true,
    contentSecurityPolicy: true,
    crossOriginEmbedderPolicy: false,
  },
};
