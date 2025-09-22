/**
 * Enterprise Security Headers Middleware
 * Comprehensive security headers and middleware for Next.js
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Security configuration interface
export interface SecurityConfig {
  contentSecurityPolicy: {
    enabled: boolean;
    directives: Record<string, string[]>;
    reportOnly: boolean;
    reportUri?: string;
  };
  hsts: {
    enabled: boolean;
    maxAge: number;
    includeSubDomains: boolean;
    preload: boolean;
  };
  frameOptions: {
    enabled: boolean;
    policy: 'DENY' | 'SAMEORIGIN' | 'ALLOW-FROM';
    uri?: string;
  };
  contentTypeOptions: {
    enabled: boolean;
  };
  xssProtection: {
    enabled: boolean;
    mode: 'block' | 'report';
    reportUri?: string;
  };
  referrerPolicy: {
    enabled: boolean;
    policy: 'no-referrer' | 'no-referrer-when-downgrade' | 'origin' | 'origin-when-cross-origin' | 'same-origin' | 'strict-origin' | 'strict-origin-when-cross-origin' | 'unsafe-url';
  };
  permissionsPolicy: {
    enabled: boolean;
    directives: Record<string, string[]>;
  };
  cors: {
    enabled: boolean;
    allowedOrigins: string[];
    allowedMethods: string[];
    allowedHeaders: string[];
    credentials: boolean;
    maxAge: number;
  };
  rateLimiting: {
    enabled: boolean;
    windowMs: number;
    maxRequests: number;
    message: string;
    skipSuccessfulRequests: boolean;
    skipFailedRequests: boolean;
  };
}

// Default security configuration
export const defaultSecurityConfig: SecurityConfig = {
  contentSecurityPolicy: {
    enabled: true,
    reportOnly: false,
    directives: {
      'default-src': ["'self'"],
      'script-src': [
        "'self'",
        "'unsafe-inline'", // Next.js requires this for development
        "'unsafe-eval'", // Required for development
        'https://vercel.live'
      ],
      'style-src': [
        "'self'",
        "'unsafe-inline'", // Required for Material-UI
        'https://fonts.googleapis.com'
      ],
      'font-src': [
        "'self'",
        'https://fonts.gstatic.com',
        'data:'
      ],
      'img-src': [
        "'self'",
        'data:',
        'https:',
        'blob:'
      ],
      'connect-src': [
        "'self'",
        'https://api.phantom-spire.com',
        'wss://localhost:*',
        'ws://localhost:*'
      ],
      'frame-src': [
        "'none'"
      ],
      'object-src': [
        "'none'"
      ],
      'base-uri': [
        "'self'"
      ],
      'form-action': [
        "'self'"
      ],
      'frame-ancestors': [
        "'none'"
      ],
      'upgrade-insecure-requests': []
    }
  },
  hsts: {
    enabled: true,
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  frameOptions: {
    enabled: true,
    policy: 'DENY'
  },
  contentTypeOptions: {
    enabled: true
  },
  xssProtection: {
    enabled: true,
    mode: 'block'
  },
  referrerPolicy: {
    enabled: true,
    policy: 'strict-origin-when-cross-origin'
  },
  permissionsPolicy: {
    enabled: true,
    directives: {
      'camera': [],
      'microphone': [],
      'geolocation': [],
      'interest-cohort': [], // Disable FLoC
      'payment': [],
      'usb': [],
      'magnetometer': [],
      'accelerometer': [],
      'gyroscope': []
    }
  },
  cors: {
    enabled: true,
    allowedOrigins: [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://*.phantom-spire.com'
    ],
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'X-CSRF-Token'
    ],
    credentials: true,
    maxAge: 86400 // 24 hours
  },
  rateLimiting: {
    enabled: true,
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 1000,
    message: 'Too many requests, please try again later.',
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  }
};

// Rate limiting store
class RateLimitStore {
  private store: Map<string, { count: number; resetTime: number }> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor(windowMs: number) {
    // Cleanup expired entries every minute
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.store.entries()) {
        if (now > value.resetTime) {
          this.store.delete(key);
        }
      }
    }, 60000);
  }

  increment(key: string, windowMs: number): { count: number; resetTime: number } {
    const now = Date.now();
    const existing = this.store.get(key);

    if (!existing || now > existing.resetTime) {
      const entry = { count: 1, resetTime: now + windowMs };
      this.store.set(key, entry);
      return entry;
    }

    existing.count++;
    this.store.set(key, existing);
    return existing;
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.store.clear();
  }
}

// Security middleware class
export class SecurityMiddleware {
  public config: SecurityConfig;
  private rateLimitStore: RateLimitStore;

  constructor(config: Partial<SecurityConfig> = {}) {
    this.config = { ...defaultSecurityConfig, ...config };
    this.rateLimitStore = new RateLimitStore(this.config.rateLimiting.windowMs);
  }

  // Main middleware function
  middleware = (request: NextRequest): NextResponse | Response => {
    // Skip middleware for static assets
    if (this.isStaticAsset(request.nextUrl.pathname)) {
      return NextResponse.next();
    }

    // Rate limiting
    if (this.config.rateLimiting.enabled) {
      const rateLimitResult = this.checkRateLimit(request);
      if (rateLimitResult) {
        return rateLimitResult;
      }
    }

    // CORS preflight
    if (request.method === 'OPTIONS' && this.config.cors.enabled) {
      return this.handleCorsPreflightRequest(request);
    }

    // Create response with security headers
    const response = NextResponse.next();
    this.addSecurityHeaders(response, request);

    return response;
  };

  private isStaticAsset(pathname: string): boolean {
    const staticExtensions = [
      '.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot'
    ];
    return staticExtensions.some(ext => pathname.endsWith(ext)) || 
           pathname.startsWith('/_next/') || 
           pathname.startsWith('/static/');
  }

  private checkRateLimit(request: NextRequest): NextResponse | null {
    const clientId = this.getClientId(request);
    const { count, resetTime } = this.rateLimitStore.increment(
      clientId,
      this.config.rateLimiting.windowMs
    );

    if (count > this.config.rateLimiting.maxRequests) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: this.config.rateLimiting.message
          }
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': this.config.rateLimiting.maxRequests.toString(),
            'X-RateLimit-Remaining': Math.max(0, this.config.rateLimiting.maxRequests - count).toString(),
            'X-RateLimit-Reset': new Date(resetTime).toISOString()
          }
        }
      );
    }

    return null;
  }

  private getClientId(request: NextRequest): string {
    // Use IP address and User-Agent for rate limiting
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown';
    const userAgent = request.headers.get('user-agent') || '';
    return `${ip}:${Buffer.from(userAgent).toString('base64').slice(0, 32)}`;
  }

  private handleCorsPreflightRequest(request: NextRequest): NextResponse {
    const origin = request.headers.get('origin');
    const method = request.headers.get('access-control-request-method');
    const headers = request.headers.get('access-control-request-headers');

    const response = new NextResponse(null, { status: 200 });

    // Check if origin is allowed
    if (origin && this.isOriginAllowed(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }

    // Set allowed methods
    if (method && this.config.cors.allowedMethods.includes(method)) {
      response.headers.set('Access-Control-Allow-Methods', this.config.cors.allowedMethods.join(', '));
    }

    // Set allowed headers
    if (headers) {
      const requestedHeaders = headers.split(',').map(h => h.trim().toLowerCase());
      const allowedHeaders = requestedHeaders.filter(h => 
        this.config.cors.allowedHeaders.map(ah => ah.toLowerCase()).includes(h)
      );
      if (allowedHeaders.length > 0) {
        response.headers.set('Access-Control-Allow-Headers', allowedHeaders.join(', '));
      }
    }

    if (this.config.cors.credentials) {
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }

    response.headers.set('Access-Control-Max-Age', this.config.cors.maxAge.toString());

    return response;
  }

  private isOriginAllowed(origin: string): boolean {
    return this.config.cors.allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin === '*') return true;
      if (allowedOrigin.startsWith('*')) {
        return origin.endsWith(allowedOrigin.slice(1));
      }
      return origin === allowedOrigin;
    });
  }

  private addSecurityHeaders(response: NextResponse, request: NextRequest): void {
    // Content Security Policy
    if (this.config.contentSecurityPolicy.enabled) {
      const cspValue = this.buildCSPHeader();
      const headerName = this.config.contentSecurityPolicy.reportOnly 
        ? 'Content-Security-Policy-Report-Only' 
        : 'Content-Security-Policy';
      response.headers.set(headerName, cspValue);
    }

    // HTTP Strict Transport Security
    if (this.config.hsts.enabled) {
      let hstsValue = `max-age=${this.config.hsts.maxAge}`;
      if (this.config.hsts.includeSubDomains) {
        hstsValue += '; includeSubDomains';
      }
      if (this.config.hsts.preload) {
        hstsValue += '; preload';
      }
      response.headers.set('Strict-Transport-Security', hstsValue);
    }

    // X-Frame-Options
    if (this.config.frameOptions.enabled) {
      let frameValue = this.config.frameOptions.policy;
      if (this.config.frameOptions.policy === 'ALLOW-FROM' && this.config.frameOptions.uri) {
        frameValue += ` ${this.config.frameOptions.uri}`;
      }
      response.headers.set('X-Frame-Options', frameValue);
    }

    // X-Content-Type-Options
    if (this.config.contentTypeOptions.enabled) {
      response.headers.set('X-Content-Type-Options', 'nosniff');
    }

    // Additional security headers
    response.headers.set('X-DNS-Prefetch-Control', 'off');
    response.headers.set('X-Download-Options', 'noopen');
    response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');

    // Server identification
    response.headers.set('Server', 'Phantom-Spire');
    response.headers.set('X-Powered-By', 'Phantom-ML-Studio');
  }

  private buildCSPHeader(): string {
    const directives = Object.entries(this.config.contentSecurityPolicy.directives)
      .map(([directive, values]) => {
        if (values.length === 0) {
          return directive;
        }
        return `${directive} ${values.join(' ')}`;
      })
      .join('; ');

    if (this.config.contentSecurityPolicy.reportUri) {
      return `${directives}; report-uri ${this.config.contentSecurityPolicy.reportUri}`;
    }

    return directives;
  }

  // Update configuration
  updateConfig(newConfig: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Destroy middleware and cleanup resources
  destroy(): void {
    this.rateLimitStore.destroy();
  }
}

// Create middleware instance
export const createSecurityMiddleware = (config?: Partial<SecurityConfig>) => {
  return new SecurityMiddleware(config);
};

// Default middleware for Next.js
export const securityMiddleware = createSecurityMiddleware();