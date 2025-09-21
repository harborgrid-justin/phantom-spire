/**
 * Enterprise Security Headers and CORS Configuration
 * Comprehensive security middleware with OWASP compliance and advanced protection
 */

import type { LoggerService } from '../services/core/LoggerService';

// Security policy configurations
export interface SecurityPolicyConfig {
  // Content Security Policy
  csp: {
    enabled: boolean;
    reportOnly: boolean;
    directives: {
      defaultSrc?: string[];
      scriptSrc?: string[];
      styleSrc?: string[];
      imgSrc?: string[];
      connectSrc?: string[];
      fontSrc?: string[];
      objectSrc?: string[];
      mediaSrc?: string[];
      frameSrc?: string[];
      childSrc?: string[];
      workerSrc?: string[];
      manifestSrc?: string[];
      baseUri?: string[];
      formAction?: string[];
      frameAncestors?: string[];
      upgradeInsecureRequests?: boolean;
      blockAllMixedContent?: boolean;
    };
    reportUri?: string;
  };
  
  // HTTP Strict Transport Security
  hsts: {
    enabled: boolean;
    maxAge: number;
    includeSubDomains: boolean;
    preload: boolean;
  };
  
  // X-Frame-Options
  frameOptions: {
    enabled: boolean;
    value: 'DENY' | 'SAMEORIGIN' | string; // string for ALLOW-FROM
  };
  
  // X-Content-Type-Options
  contentTypeOptions: {
    enabled: boolean;
    nosniff: boolean;
  };
  
  // Referrer Policy
  referrerPolicy: {
    enabled: boolean;
    policy: 'no-referrer' | 'no-referrer-when-downgrade' | 'origin' | 'origin-when-cross-origin' | 
            'same-origin' | 'strict-origin' | 'strict-origin-when-cross-origin' | 'unsafe-url';
  };
  
  // Permissions Policy (formerly Feature Policy)
  permissionsPolicy: {
    enabled: boolean;
    directives: Record<string, string[]>;
  };
  
  // X-XSS-Protection
  xssProtection: {
    enabled: boolean;
    mode: 'block' | 'report';
    reportUri?: string;
  };
  
  // Cross-Origin Embedder Policy
  coep: {
    enabled: boolean;
    policy: 'unsafe-none' | 'require-corp' | 'credentialless';
  };
  
  // Cross-Origin Opener Policy
  coop: {
    enabled: boolean;
    policy: 'unsafe-none' | 'same-origin-allow-popups' | 'same-origin';
  };
  
  // Cross-Origin Resource Policy
  corp: {
    enabled: boolean;
    policy: 'same-site' | 'same-origin' | 'cross-origin';
  };
}

// CORS configuration
export interface CorsConfig {
  enabled: boolean;
  origin: string[] | string | boolean | ((origin: string | undefined) => boolean);
  methods: string[];
  allowedHeaders: string[];
  exposedHeaders: string[];
  credentials: boolean;
  maxAge: number;
  preflightContinue: boolean;
  optionsSuccessStatus: number;
  
  // Advanced CORS options
  dynamicOrigin?: {
    enabled: boolean;
    allowLocalhost: boolean;
    allowedDomains: string[];
    allowedPatterns: RegExp[];
  };
  
  // CORS security
  security: {
    validateOrigin: boolean;
    logBlocked: boolean;
    rateLimitPreflight: boolean;
    maxPreflightAge: number;
  };
}

// Security event types
export enum SecurityEventType {
  CSP_VIOLATION = 'csp_violation',
  CORS_BLOCKED = 'cors_blocked',
  INVALID_ORIGIN = 'invalid_origin',
  XSS_ATTEMPT = 'xss_attempt',
  INJECTION_ATTEMPT = 'injection_attempt',
  SUSPICIOUS_HEADER = 'suspicious_header',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  MALFORMED_REQUEST = 'malformed_request',
}

// Security event data
export interface SecurityEvent {
  type: SecurityEventType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  clientIp: string;
  userAgent?: string;
  origin?: string;
  path: string;
  method: string;
  headers: Record<string, string>;
  details: Record<string, unknown>;
  blocked: boolean;
}

// Default security configuration
const DEFAULT_SECURITY_CONFIG: SecurityPolicyConfig = {
  csp: {
    enabled: true,
    reportOnly: false,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://api.phantom-ml-studio.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      childSrc: ["'none'"],
      workerSrc: ["'self'"],
      manifestSrc: ["'self'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: true,
      blockAllMixedContent: true,
    },
    reportUri: '/api/security/csp-report',
  },
  
  hsts: {
    enabled: true,
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  
  frameOptions: {
    enabled: true,
    value: 'DENY',
  },
  
  contentTypeOptions: {
    enabled: true,
    nosniff: true,
  },
  
  referrerPolicy: {
    enabled: true,
    policy: 'strict-origin-when-cross-origin',
  },
  
  permissionsPolicy: {
    enabled: true,
    directives: {
      camera: [],
      microphone: [],
      geolocation: [],
      payment: ['self'],
      usb: [],
      fullscreen: ['self'],
    },
  },
  
  xssProtection: {
    enabled: true,
    mode: 'block',
  },
  
  coep: {
    enabled: true,
    policy: 'require-corp',
  },
  
  coop: {
    enabled: true,
    policy: 'same-origin',
  },
  
  corp: {
    enabled: true,
    policy: 'same-origin',
  },
};

// Default CORS configuration
const DEFAULT_CORS_CONFIG: CorsConfig = {
  enabled: true,
  origin: ['http://localhost:3000', 'https://phantom-ml-studio.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-Request-ID',
    'X-Correlation-ID',
  ],
  exposedHeaders: [
    'X-Request-ID',
    'X-Response-Time',
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
  ],
  credentials: true,
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204,
  
  dynamicOrigin: {
    enabled: true,
    allowLocalhost: true,
    allowedDomains: ['phantom-ml-studio.com', '*.phantom-ml-studio.com'],
    allowedPatterns: [/^https:\/\/.*\.phantom-ml-studio\.com$/],
  },
  
  security: {
    validateOrigin: true,
    logBlocked: true,
    rateLimitPreflight: true,
    maxPreflightAge: 86400,
  },
};

// Security middleware class
export class SecurityMiddleware {
  private readonly config: SecurityPolicyConfig;
  private readonly corsConfig: CorsConfig;
  private readonly logger?: LoggerService;
  private readonly securityEvents: SecurityEvent[] = [];
  private readonly preflightCache = new Map<string, { timestamp: Date; response: any }>();

  constructor(
    config: Partial<SecurityPolicyConfig> = {},
    corsConfig: Partial<CorsConfig> = {},
    logger?: LoggerService
  ) {
    this.config = this.mergeConfig(DEFAULT_SECURITY_CONFIG, config);
    this.corsConfig = this.mergeConfig(DEFAULT_CORS_CONFIG, corsConfig);
    this.logger = logger;
  }

  // Create security headers middleware
  createSecurityHeadersMiddleware() {
    return (req: any, res: any, next: any) => {
      try {
        // Set security headers
        this.setSecurityHeaders(res);
        
        // Validate request for security threats
        const securityCheck = this.validateRequest(req);
        if (!securityCheck.valid) {
          this.recordSecurityEvent({
            type: securityCheck.eventType!,
            severity: securityCheck.severity!,
            timestamp: new Date(),
            clientIp: this.getClientIp(req),
            userAgent: req.get('User-Agent'),
            origin: req.get('Origin'),
            path: req.path,
            method: req.method,
            headers: req.headers,
            details: securityCheck.details || {},
            blocked: true,
          });

          return res.status(403).json({
            error: 'Forbidden',
            message: 'Request blocked by security policy',
            code: securityCheck.eventType,
          });
        }

        next();
      } catch (error) {
        this.logger?.error('Security middleware error', error);
        next();
      }
    };
  }

  // Create CORS middleware
  createCorsMiddleware() {
    return (req: any, res: any, next: any) => {
      if (!this.corsConfig.enabled) {
        return next();
      }

      try {
        const origin = req.get('Origin');
        const method = req.method;
        
        // Handle preflight requests
        if (method === 'OPTIONS') {
          return this.handlePreflight(req, res);
        }

        // Validate origin
        if (origin && !this.isOriginAllowed(origin)) {
          this.recordSecurityEvent({
            type: SecurityEventType.CORS_BLOCKED,
            severity: 'medium',
            timestamp: new Date(),
            clientIp: this.getClientIp(req),
            userAgent: req.get('User-Agent'),
            origin,
            path: req.path,
            method: req.method,
            headers: req.headers,
            details: { reason: 'origin_not_allowed', origin },
            blocked: true,
          });

          if (this.corsConfig.security.logBlocked) {
            this.logger?.warn('CORS request blocked', {
              origin,
              path: req.path,
              method: req.method,
              ip: this.getClientIp(req),
            });
          }

          return res.status(403).json({
            error: 'CORS Error',
            message: 'Origin not allowed',
          });
        }

        // Set CORS headers for simple requests
        this.setCorsHeaders(res, origin);
        
        next();
      } catch (error) {
        this.logger?.error('CORS middleware error', error);
        next();
      }
    };
  }

  // Handle CSP violation reports
  createCspReportHandler() {
    return (req: any, res: any) => {
      try {
        const report = req.body['csp-report'] || req.body;
        
        this.recordSecurityEvent({
          type: SecurityEventType.CSP_VIOLATION,
          severity: 'medium',
          timestamp: new Date(),
          clientIp: this.getClientIp(req),
          userAgent: req.get('User-Agent'),
          origin: req.get('Origin'),
          path: req.path,
          method: req.method,
          headers: req.headers,
          details: { cspReport: report },
          blocked: false,
        });

        this.logger?.warn('CSP violation reported', {
          report,
          ip: this.getClientIp(req),
          userAgent: req.get('User-Agent'),
        });

        res.status(204).send();
      } catch (error) {
        this.logger?.error('CSP report handler error', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    };
  }

  // Get security events
  getSecurityEvents(
    filter?: {
      type?: SecurityEventType;
      severity?: string;
      since?: Date;
      limit?: number;
    }
  ): SecurityEvent[] {
    let events = [...this.securityEvents];

    if (filter) {
      if (filter.type) {
        events = events.filter(e => e.type === filter.type);
      }
      
      if (filter.severity) {
        events = events.filter(e => e.severity === filter.severity);
      }
      
      if (filter.since) {
        events = events.filter(e => e.timestamp >= filter.since!);
      }
      
      if (filter.limit) {
        events = events.slice(0, filter.limit);
      }
    }

    return events;
  }

  // Get security metrics
  getSecurityMetrics(): {
    totalEvents: number;
    eventsByType: Record<SecurityEventType, number>;
    eventsBySeverity: Record<string, number>;
    blockedRequests: number;
    topIps: Array<{ ip: string; count: number }>;
    recentEvents: SecurityEvent[];
  } {
    const eventsByType = {} as Record<SecurityEventType, number>;
    const eventsBySeverity: Record<string, number> = {};
    const ipCounts: Record<string, number> = {};

    let blockedRequests = 0;

    for (const event of this.securityEvents) {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
      eventsBySeverity[event.severity] = (eventsBySeverity[event.severity] || 0) + 1;
      ipCounts[event.clientIp] = (ipCounts[event.clientIp] || 0) + 1;
      
      if (event.blocked) {
        blockedRequests++;
      }
    }

    const topIps = Object.entries(ipCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([ip, count]) => ({ ip, count }));

    const recentEvents = this.securityEvents
      .slice(-50)
      .reverse();

    return {
      totalEvents: this.securityEvents.length,
      eventsByType,
      eventsBySeverity,
      blockedRequests,
      topIps,
      recentEvents,
    };
  }

  // Private methods

  private setSecurityHeaders(res: any): void {
    // Content Security Policy
    if (this.config.csp.enabled) {
      const cspValue = this.buildCspHeader();
      const headerName = this.config.csp.reportOnly 
        ? 'Content-Security-Policy-Report-Only' 
        : 'Content-Security-Policy';
      res.set(headerName, cspValue);
    }

    // Strict Transport Security
    if (this.config.hsts.enabled) {
      let hstsValue = `max-age=${this.config.hsts.maxAge}`;
      if (this.config.hsts.includeSubDomains) {
        hstsValue += '; includeSubDomains';
      }
      if (this.config.hsts.preload) {
        hstsValue += '; preload';
      }
      res.set('Strict-Transport-Security', hstsValue);
    }

    // X-Frame-Options
    if (this.config.frameOptions.enabled) {
      res.set('X-Frame-Options', this.config.frameOptions.value);
    }

    // X-Content-Type-Options
    if (this.config.contentTypeOptions.enabled) {
      res.set('X-Content-Type-Options', 'nosniff');
    }

    // Referrer Policy
    if (this.config.referrerPolicy.enabled) {
      res.set('Referrer-Policy', this.config.referrerPolicy.policy);
    }

    // Permissions Policy
    if (this.config.permissionsPolicy.enabled) {
      const permissionsPolicyValue = Object.entries(this.config.permissionsPolicy.directives)
        .map(([feature, origins]) => {
          if (origins.length === 0) {
            return `${feature}=()`;
          }
          return `${feature}=(${origins.join(' ')})`;
        })
        .join(', ');
      res.set('Permissions-Policy', permissionsPolicyValue);
    }

    // X-XSS-Protection
    if (this.config.xssProtection.enabled) {
      let xssValue = '1';
      if (this.config.xssProtection.mode === 'block') {
        xssValue += '; mode=block';
      } else if (this.config.xssProtection.reportUri) {
        xssValue += `; report=${this.config.xssProtection.reportUri}`;
      }
      res.set('X-XSS-Protection', xssValue);
    }

    // Cross-Origin Embedder Policy
    if (this.config.coep.enabled) {
      res.set('Cross-Origin-Embedder-Policy', this.config.coep.policy);
    }

    // Cross-Origin Opener Policy
    if (this.config.coop.enabled) {
      res.set('Cross-Origin-Opener-Policy', this.config.coop.policy);
    }

    // Cross-Origin Resource Policy
    if (this.config.corp.enabled) {
      res.set('Cross-Origin-Resource-Policy', this.config.corp.policy);
    }

    // Additional security headers
    res.set('X-Powered-By', 'Phantom ML Studio'); // Override default
    res.set('X-Download-Options', 'noopen');
    res.set('X-Permitted-Cross-Domain-Policies', 'none');
    res.set('X-DNS-Prefetch-Control', 'off');
  }

  private buildCspHeader(): string {
    const directives: string[] = [];

    for (const [key, value] of Object.entries(this.config.csp.directives)) {
      if (key === 'upgradeInsecureRequests' && value) {
        directives.push('upgrade-insecure-requests');
      } else if (key === 'blockAllMixedContent' && value) {
        directives.push('block-all-mixed-content');
      } else if (Array.isArray(value) && value.length > 0) {
        const kebabKey = key.replace(/[A-Z]/g, m => '-' + m.toLowerCase());
        directives.push(`${kebabKey} ${value.join(' ')}`);
      }
    }

    if (this.config.csp.reportUri) {
      directives.push(`report-uri ${this.config.csp.reportUri}`);
    }

    return directives.join('; ');
  }

  private handlePreflight(req: any, res: any): void {
    const origin = req.get('Origin');
    const method = req.get('Access-Control-Request-Method');
    const headers = req.get('Access-Control-Request-Headers');

    // Check cache for preflight responses
    const cacheKey = `${origin}:${method}:${headers}`;
    const cached = this.preflightCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp.getTime() < this.corsConfig.security.maxPreflightAge * 1000) {
      return res.status(this.corsConfig.optionsSuccessStatus).set(cached.response).send();
    }

    // Validate preflight request
    if (!origin || !this.isOriginAllowed(origin)) {
      return res.status(403).json({
        error: 'CORS Error',
        message: 'Origin not allowed for preflight',
      });
    }

    if (method && !this.corsConfig.methods.includes(method)) {
      return res.status(403).json({
        error: 'CORS Error',
        message: 'Method not allowed',
      });
    }

    // Set preflight response headers
    const responseHeaders: Record<string, string> = {};
    
    if (this.isOriginAllowed(origin)) {
      responseHeaders['Access-Control-Allow-Origin'] = origin;
    }
    
    if (this.corsConfig.credentials) {
      responseHeaders['Access-Control-Allow-Credentials'] = 'true';
    }
    
    responseHeaders['Access-Control-Allow-Methods'] = this.corsConfig.methods.join(', ');
    responseHeaders['Access-Control-Allow-Headers'] = this.corsConfig.allowedHeaders.join(', ');
    responseHeaders['Access-Control-Max-Age'] = this.corsConfig.maxAge.toString();

    // Cache preflight response
    this.preflightCache.set(cacheKey, {
      timestamp: new Date(),
      response: responseHeaders,
    });

    res.status(this.corsConfig.optionsSuccessStatus).set(responseHeaders).send();
  }

  private setCorsHeaders(res: any, origin?: string): void {
    if (origin && this.isOriginAllowed(origin)) {
      res.set('Access-Control-Allow-Origin', origin);
    }
    
    if (this.corsConfig.credentials) {
      res.set('Access-Control-Allow-Credentials', 'true');
    }
    
    if (this.corsConfig.exposedHeaders.length > 0) {
      res.set('Access-Control-Expose-Headers', this.corsConfig.exposedHeaders.join(', '));
    }
  }

  private isOriginAllowed(origin: string): boolean {
    const { origin: allowedOrigins, dynamicOrigin } = this.corsConfig;

    // Check static origins
    if (typeof allowedOrigins === 'boolean') {
      return allowedOrigins;
    }

    if (typeof allowedOrigins === 'string') {
      return allowedOrigins === origin;
    }

    if (Array.isArray(allowedOrigins)) {
      if (allowedOrigins.includes(origin)) {
        return true;
      }
    }

    if (typeof allowedOrigins === 'function') {
      return allowedOrigins(origin);
    }

    // Check dynamic origin rules
    if (dynamicOrigin?.enabled) {
      // Allow localhost for development
      if (dynamicOrigin.allowLocalhost && origin.includes('localhost')) {
        return true;
      }

      // Check allowed domains (with wildcard support)
      for (const domain of dynamicOrigin.allowedDomains) {
        if (domain.startsWith('*.')) {
          const baseDomain = domain.slice(2);
          if (origin.endsWith(baseDomain)) {
            return true;
          }
        } else if (origin.includes(domain)) {
          return true;
        }
      }

      // Check regex patterns
      for (const pattern of dynamicOrigin.allowedPatterns) {
        if (pattern.test(origin)) {
          return true;
        }
      }
    }

    return false;
  }

  private validateRequest(req: any): {
    valid: boolean;
    eventType?: SecurityEventType;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    details?: Record<string, unknown>;
  } {
    // Check for common XSS patterns
    const xssPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /<object/i,
      /<embed/i,
    ];

    const requestString = JSON.stringify({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    for (const pattern of xssPatterns) {
      if (pattern.test(requestString)) {
        return {
          valid: false,
          eventType: SecurityEventType.XSS_ATTEMPT,
          severity: 'high',
          details: {
            pattern: pattern.source,
            matched: pattern.exec(requestString)?.[0],
          },
        };
      }
    }

    // Check for SQL injection patterns
    const sqlPatterns = [
      /(\b(ALTER|CREATE|DELETE|DROP|EXEC(UTE)?|INSERT|SELECT|UNION|UPDATE)\b)/i,
      /(\b(OR|AND)\b.*(=|<|>|\b(LIKE)\b))/i,
      /(\'|\"|`)(.*)(\'|\"|`)/,
    ];

    for (const pattern of sqlPatterns) {
      if (pattern.test(requestString)) {
        return {
          valid: false,
          eventType: SecurityEventType.INJECTION_ATTEMPT,
          severity: 'critical',
          details: {
            type: 'sql_injection',
            pattern: pattern.source,
          },
        };
      }
    }

    // Check for suspicious headers
    const suspiciousHeaders = ['x-forwarded-for', 'x-real-ip'];
    for (const header of suspiciousHeaders) {
      const value = req.get(header);
      if (value && value.length > 1000) {
        return {
          valid: false,
          eventType: SecurityEventType.SUSPICIOUS_HEADER,
          severity: 'medium',
          details: {
            header,
            length: value.length,
          },
        };
      }
    }

    return { valid: true };
  }

  private recordSecurityEvent(event: SecurityEvent): void {
    this.securityEvents.push(event);

    // Keep only the last 10000 events to prevent memory issues
    if (this.securityEvents.length > 10000) {
      this.securityEvents.splice(0, this.securityEvents.length - 10000);
    }

    // Log critical events immediately
    if (event.severity === 'critical') {
      this.logger?.error('Critical security event', {
        type: event.type,
        ip: event.clientIp,
        path: event.path,
        details: event.details,
      });
    }
  }

  private getClientIp(req: any): string {
    return req.ip || 
           req.connection?.remoteAddress || 
           req.socket?.remoteAddress || 
           (req.connection?.socket as any)?.remoteAddress || 
           '0.0.0.0';
  }

  private mergeConfig<T>(defaultConfig: T, userConfig: Partial<T>): T {
    return { ...defaultConfig, ...userConfig } as T;
  }
}

// Security utilities
export const SecurityUtils = {
  // Generate secure random string
  generateSecureToken(length = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  },

  // Validate and sanitize input
  sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/['"]/g, '') // Remove quotes
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  },

  // Check if IP is in private range
  isPrivateIP(ip: string): boolean {
    const privateRanges = [
      /^10\./,
      /^172\.(1[6-9]|2\d|3[01])\./,
      /^192\.168\./,
      /^127\./,
      /^::1$/,
      /^fc00:/,
      /^fe80:/,
    ];

    return privateRanges.some(range => range.test(ip));
  },

  // Rate limiting key generator
  generateRateLimitKey(ip: string, endpoint: string, userId?: string): string {
    const key = userId ? `user:${userId}` : `ip:${ip}`;
    return `ratelimit:${key}:${endpoint}`;
  },

  // Content type validation
  isValidContentType(contentType: string, allowed: string[]): boolean {
    return allowed.some(type => contentType.startsWith(type));
  },

  // File extension validation
  isValidFileExtension(filename: string, allowed: string[]): boolean {
    const ext = filename.toLowerCase().split('.').pop();
    return ext ? allowed.includes(ext) : false;
  },
};

// Export security middleware factory
export function createSecurityMiddleware(
  config?: Partial<SecurityPolicyConfig>,
  corsConfig?: Partial<CorsConfig>,
  logger?: LoggerService
): SecurityMiddleware {
  return new SecurityMiddleware(config, corsConfig, logger);
}

// Export types and classes
export {
  type SecurityPolicyConfig,
  type CorsConfig,
  type SecurityEvent,
  SecurityEventType,
  SecurityMiddleware,
  DEFAULT_SECURITY_CONFIG,
  DEFAULT_CORS_CONFIG,
};