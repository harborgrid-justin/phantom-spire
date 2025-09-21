/**
 * Standardized API Response Interfaces
 * Enterprise-grade type definitions for consistent API responses
 */

// Base response interface
export interface BaseApiResponse {
  success: boolean;
  message: string;
  timestamp: string;
  requestId: string;
  version: string;
}

// Success response with data
export interface SuccessApiResponse<T = any> extends BaseApiResponse {
  success: true;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
    hasNext?: boolean;
    hasPrevious?: boolean;
  };
}

// Error response
export interface ErrorApiResponse extends BaseApiResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    field?: string;
    stack?: string; // Only in development
  };
  troubleshooting?: {
    suggestions: string[];
    documentationUrl: string;
    supportContact: string;
  };
}

// Paginated response
export interface PaginatedApiResponse<T = any> extends SuccessApiResponse<T[]> {
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
    firstPage: number;
    lastPage: number;
  };
}

// Validation error response
export interface ValidationErrorResponse extends ErrorApiResponse {
  error: {
    code: 'VALIDATION_ERROR';
    message: string;
    details: {
      field: string;
      message: string;
      value?: any;
    }[];
  };
}

// Health check response
export interface HealthCheckResponse extends BaseApiResponse {
  data: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    services: {
      [serviceName: string]: {
        status: 'up' | 'down' | 'degraded';
        responseTime?: number;
        lastCheck: string;
        message?: string;
      };
    };
    uptime: number;
    version: string;
    environment: string;
  };
}

// Authentication response
export interface AuthenticationResponse extends BaseApiResponse {
  data: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: 'Bearer';
    user: {
      id: string;
      email: string;
      name: string;
      roles: string[];
      permissions: string[];
    };
  };
}

// File upload response
export interface FileUploadResponse extends BaseApiResponse {
  data: {
    fileId: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    checksum: string;
    uploadedAt: string;
  };
}

// ML Model response interfaces
export interface MLModelResponse extends BaseApiResponse {
  data: {
    id: string;
    name: string;
    type: string;
    status: 'training' | 'trained' | 'deployed' | 'failed' | 'archived';
    accuracy?: number;
    createdAt: string;
    updatedAt: string;
    metrics?: {
      [key: string]: number;
    };
    parameters?: {
      [key: string]: any;
    };
  };
}

export interface MLPredictionResponse extends BaseApiResponse {
  data: {
    predictionId: string;
    modelId: string;
    input: any;
    prediction: any;
    confidence: number;
    processedAt: string;
    processingTime: number;
    explanation?: {
      features: {
        name: string;
        importance: number;
        value: any;
      }[];
      reasoning: string;
    };
  };
}

// Security-related responses
export interface ThreatDetectionResponse extends BaseApiResponse {
  data: {
    detectionId: string;
    threatLevel: 'low' | 'medium' | 'high' | 'critical';
    threatType: string;
    confidence: number;
    indicators: {
      type: string;
      value: string;
      severity: number;
    }[];
    mitigationSteps: string[];
    detectedAt: string;
  };
}

export interface ComplianceReportResponse extends BaseApiResponse {
  data: {
    reportId: string;
    framework: string;
    overallScore: number;
    assessmentDate: string;
    controls: {
      id: string;
      name: string;
      status: 'compliant' | 'non-compliant' | 'partial' | 'not-applicable';
      score: number;
      evidence?: string[];
      gaps?: string[];
    }[];
    recommendations: {
      priority: 'high' | 'medium' | 'low';
      description: string;
      estimatedEffort: string;
    }[];
  };
}

// Export utility type for API responses
export type ApiResponse<T = any> = SuccessApiResponse<T> | ErrorApiResponse;

// Response builder utilities
export class ApiResponseBuilder {
  static success<T>(data: T, message = 'Success'): SuccessApiResponse<T> {
    return {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
      requestId: this.generateRequestId(),
      version: '1.0.0'
    };
  }

  static error(
    code: string,
    message: string,
    details?: any
  ): ErrorApiResponse {
    return {
      success: false,
      message,
      error: {
        code,
        message,
        details
      },
      timestamp: new Date().toISOString(),
      requestId: this.generateRequestId(),
      version: '1.0.0'
    };
  }

  static paginated<T>(
    data: T[],
    meta: PaginatedApiResponse<T>['meta'],
    message = 'Success'
  ): PaginatedApiResponse<T> {
    return {
      success: true,
      message,
      data,
      meta,
      timestamp: new Date().toISOString(),
      requestId: this.generateRequestId(),
      version: '1.0.0'
    };
  }

  static validationError(
    errors: ValidationErrorResponse['error']['details']
  ): ValidationErrorResponse {
    return {
      success: false,
      message: 'Validation failed',
      error: {
        code: 'VALIDATION_ERROR',
        message: 'One or more validation errors occurred',
        details: errors
      },
      timestamp: new Date().toISOString(),
      requestId: this.generateRequestId(),
      version: '1.0.0'
    };
  }

  private static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// HTTP Status codes for consistent error handling
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION_ERROR: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
} as const;

// Error codes for consistent error handling
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  CONFLICT: 'CONFLICT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  EXPIRED_TOKEN: 'EXPIRED_TOKEN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS'
} as const;