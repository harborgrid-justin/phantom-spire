/**
 * Enterprise API Response Standards
 * Consistent API response schemas across all services
 * Provides type safety, error handling, and standardized metadata
 */

import { z } from 'zod';

// Base response metadata
export interface ApiResponseMetadata {
  timestamp: string;
  requestId: string;
  version: string;
  service: string;
  endpoint: string;
  executionTime?: number;
  cacheHit?: boolean;
  warnings?: string[];
}

// Pagination information
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  nextPage?: number;
  prevPage?: number;
}

// Error details interface
export interface ApiErrorDetails {
  code: string;
  message: string;
  field?: string;
  value?: unknown;
  details?: Record<string, unknown>;
  timestamp: string;
  requestId: string;
  correlationId?: string;
  innerError?: ApiErrorDetails;
}

// Success response interface
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  metadata: ApiResponseMetadata;
  pagination?: PaginationInfo;
  related?: Record<string, unknown>;
}

// Error response interface
export interface ApiErrorResponse {
  success: false;
  error: ApiErrorDetails;
  metadata: ApiResponseMetadata;
  suggestions?: string[];
  documentation?: string;
  supportContact?: string;
}

// Combined response type
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

// Zod schemas for validation
export const PaginationInfoSchema = z.object({
  page: z.number().min(1),
  limit: z.number().min(1).max(1000),
  total: z.number().min(0),
  totalPages: z.number().min(0),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
  nextPage: z.number().min(1).optional(),
  prevPage: z.number().min(1).optional(),
});

export const ApiResponseMetadataSchema = z.object({
  timestamp: z.string().datetime(),
  requestId: z.string().uuid(),
  version: z.string(),
  service: z.string(),
  endpoint: z.string(),
  executionTime: z.number().optional(),
  cacheHit: z.boolean().optional(),
  warnings: z.array(z.string()).optional(),
});

export const ApiErrorDetailsSchema = z.object({
  code: z.string(),
  message: z.string(),
  field: z.string().optional(),
  value: z.unknown().optional(),
  details: z.record(z.unknown()).optional(),
  timestamp: z.string().datetime(),
  requestId: z.string().uuid(),
  correlationId: z.string().uuid().optional(),
  innerError: z.lazy(() => ApiErrorDetailsSchema).optional(),
});

// Response builder class
export class ApiResponseBuilder<T = unknown> {
  private metadata: Partial<ApiResponseMetadata> = {};
  private pagination?: PaginationInfo;
  private related?: Record<string, unknown>;
  private warnings: string[] = [];

  constructor(
    private requestId: string,
    private service: string = 'phantom-ml-studio',
    private endpoint: string = '',
    private version: string = '1.0.0'
  ) {
    this.metadata = {
      requestId,
      service,
      endpoint,
      version,
      timestamp: new Date().toISOString(),
    };
  }

  withPagination(pagination: PaginationInfo): ApiResponseBuilder<T> {
    this.pagination = pagination;
    return this;
  }

  withRelated(related: Record<string, unknown>): ApiResponseBuilder<T> {
    this.related = related;
    return this;
  }

  withExecutionTime(executionTime: number): ApiResponseBuilder<T> {
    this.metadata.executionTime = executionTime;
    return this;
  }

  withCacheHit(cacheHit: boolean): ApiResponseBuilder<T> {
    this.metadata.cacheHit = cacheHit;
    return this;
  }

  withWarning(warning: string): ApiResponseBuilder<T> {
    this.warnings.push(warning);
    return this;
  }

  withWarnings(warnings: string[]): ApiResponseBuilder<T> {
    this.warnings.push(...warnings);
    return this;
  }

  success(data: T): ApiSuccessResponse<T> {
    const metadata: ApiResponseMetadata = {
      ...this.metadata,
      warnings: this.warnings.length > 0 ? this.warnings : undefined,
    } as ApiResponseMetadata;

    return {
      success: true,
      data,
      metadata,
      pagination: this.pagination,
      related: this.related,
    };
  }

  error(
    code: string,
    message: string,
    details?: Partial<ApiErrorDetails>
  ): ApiErrorResponse {
    const error: ApiErrorDetails = {
      code,
      message,
      timestamp: new Date().toISOString(),
      requestId: this.requestId,
      ...details,
    };

    const metadata: ApiResponseMetadata = {
      ...this.metadata,
      warnings: this.warnings.length > 0 ? this.warnings : undefined,
    } as ApiResponseMetadata;

    return {
      success: false,
      error,
      metadata,
    };
  }

  validationError(
    message: string,
    field?: string,
    value?: unknown
  ): ApiErrorResponse {
    return this.error('VALIDATION_ERROR', message, {
      field,
      value,
      details: {
        type: 'validation',
        field,
        value,
      },
    });
  }

  notFoundError(resource: string, id?: string | number): ApiErrorResponse {
    return this.error(
      'NOT_FOUND',
      `${resource}${id ? ` with ID '${id}'` : ''} not found`,
      {
        details: {
          type: 'not_found',
          resource,
          id,
        },
      }
    );
  }

  unauthorizedError(message: string = 'Authentication required'): ApiErrorResponse {
    return this.error('UNAUTHORIZED', message, {
      details: {
        type: 'authentication',
      },
    });
  }

  forbiddenError(message: string = 'Access denied'): ApiErrorResponse {
    return this.error('FORBIDDEN', message, {
      details: {
        type: 'authorization',
      },
    });
  }

  conflictError(message: string, conflictingField?: string): ApiErrorResponse {
    return this.error('CONFLICT', message, {
      field: conflictingField,
      details: {
        type: 'conflict',
        conflictingField,
      },
    });
  }

  internalError(
    message: string = 'Internal server error',
    innerError?: Error
  ): ApiErrorResponse {
    return this.error('INTERNAL_ERROR', message, {
      details: {
        type: 'internal',
        innerError: innerError ? {
          name: innerError.name,
          message: innerError.message,
          stack: process.env.NODE_ENV === 'development' ? innerError.stack : undefined,
        } : undefined,
      },
    });
  }

  tooManyRequestsError(
    retryAfter?: number,
    message: string = 'Too many requests'
  ): ApiErrorResponse {
    return this.error('TOO_MANY_REQUESTS', message, {
      details: {
        type: 'rate_limit',
        retryAfter,
      },
    });
  }

  serviceUnavailableError(
    message: string = 'Service temporarily unavailable'
  ): ApiErrorResponse {
    return this.error('SERVICE_UNAVAILABLE', message, {
      details: {
        type: 'service_unavailable',
      },
    });
  }
}

// Factory function for creating response builders
export function createApiResponseBuilder<T = unknown>(
  requestId: string,
  endpoint: string,
  service: string = 'phantom-ml-studio',
  version: string = '1.0.0'
): ApiResponseBuilder<T> {
  return new ApiResponseBuilder<T>(requestId, service, endpoint, version);
}

// Utility functions for common response patterns
export const ResponseUtils = {
  // Create pagination info
  createPaginationInfo(
    page: number,
    limit: number,
    total: number
  ): PaginationInfo {
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      page,
      limit,
      total,
      totalPages,
      hasNext,
      hasPrev,
      nextPage: hasNext ? page + 1 : undefined,
      prevPage: hasPrev ? page - 1 : undefined,
    };
  },

  // Validate API response structure
  validateResponse<T>(response: ApiResponse<T>): boolean {
    try {
      if (response.success) {
        ApiResponseMetadataSchema.parse(response.metadata);
        if (response.pagination) {
          PaginationInfoSchema.parse(response.pagination);
        }
        return true;
      } else {
        ApiResponseMetadataSchema.parse(response.metadata);
        ApiErrorDetailsSchema.parse(response.error);
        return true;
      }
    } catch (error) {
      console.error('API Response validation failed:', error);
      return false;
    }
  },

  // Transform legacy responses to standard format
  transformLegacyResponse<T>(
    legacyResponse: any,
    requestId: string,
    endpoint: string
  ): ApiResponse<T> {
    const builder = createApiResponseBuilder<T>(requestId, endpoint);

    if (legacyResponse.success || legacyResponse.data !== undefined) {
      return builder.success(legacyResponse.data || legacyResponse);
    } else if (legacyResponse.error) {
      return builder.error(
        legacyResponse.error.code || 'UNKNOWN_ERROR',
        legacyResponse.error.message || 'An error occurred',
        legacyResponse.error
      );
    } else {
      return builder.internalError('Invalid response format');
    }
  },

  // Extract data from API response safely
  extractData<T>(response: ApiResponse<T>): T | null {
    return response.success ? response.data : null;
  },

  // Extract error from API response safely
  extractError(response: ApiResponse): ApiErrorDetails | null {
    return response.success ? null : response.error;
  },

  // Check if response indicates success
  isSuccess<T>(response: ApiResponse<T>): response is ApiSuccessResponse<T> {
    return response.success === true;
  },

  // Check if response indicates error
  isError<T>(response: ApiResponse<T>): response is ApiErrorResponse {
    return response.success === false;
  },
};

// Error code constants
export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  CONFLICT: 'CONFLICT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  BAD_REQUEST: 'BAD_REQUEST',
  UNPROCESSABLE_ENTITY: 'UNPROCESSABLE_ENTITY',
  TIMEOUT: 'TIMEOUT',
  NETWORK_ERROR: 'NETWORK_ERROR',
  INSUFFICIENT_STORAGE: 'INSUFFICIENT_STORAGE',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
} as const;

// HTTP status code mapping
export const StatusCodeMap: Record<string, number> = {
  [ErrorCodes.VALIDATION_ERROR]: 400,
  [ErrorCodes.BAD_REQUEST]: 400,
  [ErrorCodes.UNAUTHORIZED]: 401,
  [ErrorCodes.FORBIDDEN]: 403,
  [ErrorCodes.NOT_FOUND]: 404,
  [ErrorCodes.CONFLICT]: 409,
  [ErrorCodes.UNPROCESSABLE_ENTITY]: 422,
  [ErrorCodes.TOO_MANY_REQUESTS]: 429,
  [ErrorCodes.INTERNAL_ERROR]: 500,
  [ErrorCodes.SERVICE_UNAVAILABLE]: 503,
  [ErrorCodes.TIMEOUT]: 504,
  [ErrorCodes.INSUFFICIENT_STORAGE]: 507,
  [ErrorCodes.QUOTA_EXCEEDED]: 509,
} as const;

// Type guards
export function isApiSuccessResponse<T>(
  response: ApiResponse<T>
): response is ApiSuccessResponse<T> {
  return response.success === true;
}

export function isApiErrorResponse<T>(
  response: ApiResponse<T>
): response is ApiErrorResponse {
  return response.success === false;
}