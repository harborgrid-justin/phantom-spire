import { Request, Response, NextFunction } from 'express';
import { validationResult, FieldValidationError } from 'express-validator';
import { logger } from '../utils/logger.js';

export interface ValidationErrorDetail {
  field: string;
  message: string;
  value?: unknown;
  code?: string;
}

export interface ValidationErrorResponse {
  success: false;
  error: string;
  code: string;
  message: string;
  details: ValidationErrorDetail[];
  timestamp: string;
  path: string;
  method: string;
  correlationId: string;
}

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const correlationId = req.headers['x-correlation-id'] as string || 
      `val-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const validationDetails: ValidationErrorDetail[] = errors.array().map(error => {
      const fieldError = error as FieldValidationError;
      return {
        field: fieldError.path,
        message: fieldError.msg,
        value: fieldError.value,
        code: `VALIDATION_${fieldError.path.toUpperCase()}_ERROR`,
      };
    });

    // Enhanced logging for validation errors
    logger.warn('Validation Error:', {
      errors: validationDetails,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      correlationId,
      userId: (req as any).user?.id,
      timestamp: new Date().toISOString(),
    });

    const response: ValidationErrorResponse = {
      success: false,
      error: 'Validation Error',
      code: 'VALIDATION_ERROR',
      message: `Invalid input data: ${validationDetails.length} validation error(s) found`,
      details: validationDetails,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
      correlationId,
    };

    res.status(400).json(response);
    return;
  }

  next();
};

/**
 * Sanitization middleware for enterprise security
 */
export const sanitizeRequest = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  // Remove potentially dangerous characters from string inputs
  const sanitizeString = (str: string): string => {
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim();
  };

  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return sanitizeString(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }
    
    return obj;
  };

  // Sanitize request body, query, and params
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};

/**
 * Request size validation middleware
 */
export const validateRequestSize = (maxSizeBytes: number = 10 * 1024 * 1024) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.get('Content-Length') || '0', 10);
    
    if (contentLength > maxSizeBytes) {
      const correlationId = req.headers['x-correlation-id'] as string || 
        `size-${Date.now()}`;
        
      logger.warn('Request size exceeded:', {
        contentLength,
        maxSize: maxSizeBytes,
        url: req.url,
        method: req.method,
        correlationId,
      });

      res.status(413).json({
        success: false,
        error: 'Payload Too Large',
        code: 'REQUEST_SIZE_EXCEEDED',
        message: `Request size (${contentLength} bytes) exceeds maximum allowed size (${maxSizeBytes} bytes)`,
        timestamp: new Date().toISOString(),
        path: req.path,
        correlationId,
      });
      return;
    }

    next();
  };
};
