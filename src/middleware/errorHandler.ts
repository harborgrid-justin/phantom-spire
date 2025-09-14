import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export interface CustomError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  code?: string;
  details?: any;
  correlationId?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  path: string;
  method: string;
  correlationId: string;
  stack?: string;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const correlationId = req.headers['x-correlation-id'] as string || 
    `err-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Enhanced logging with structured data
  logger.error('API Error occurred:', {
    error: err.message,
    code: err.code,
    statusCode: err.statusCode,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    correlationId,
    requestId: req.headers['x-request-id'],
    userId: (req as any).user?.id,
    timestamp: new Date().toISOString(),
  });

  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Determine error code and message based on status
  let errorCode = err.code || 'INTERNAL_SERVER_ERROR';
  let message = err.isOperational ? err.message : 'Internal Server Error';

  // Map common HTTP status codes to enterprise error codes
  switch (statusCode) {
    case 400:
      errorCode = err.code || 'VALIDATION_ERROR';
      break;
    case 401:
      errorCode = err.code || 'AUTHENTICATION_ERROR';
      break;
    case 403:
      errorCode = err.code || 'AUTHORIZATION_ERROR';
      break;
    case 404:
      errorCode = err.code || 'RESOURCE_NOT_FOUND';
      break;
    case 409:
      errorCode = err.code || 'CONFLICT_ERROR';
      break;
    case 422:
      errorCode = err.code || 'UNPROCESSABLE_ENTITY';
      break;
    case 429:
      errorCode = err.code || 'RATE_LIMIT_EXCEEDED';
      break;
    case 500:
      errorCode = err.code || 'INTERNAL_SERVER_ERROR';
      message = 'Internal Server Error';
      break;
    case 502:
      errorCode = err.code || 'BAD_GATEWAY';
      break;
    case 503:
      errorCode = err.code || 'SERVICE_UNAVAILABLE';
      break;
    case 504:
      errorCode = err.code || 'GATEWAY_TIMEOUT';
      break;
  }

  const errorResponse: ApiErrorResponse = {
    success: false,
    error: statusCode >= 500 ? 'Internal Server Error' : (err.name || 'Error'),
    code: errorCode,
    message,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    correlationId,
  };

  // Include additional details for client errors (4xx)
  if (statusCode < 500 && err.details) {
    errorResponse.details = err.details;
  }

  // Include stack trace in development mode
  if (isDevelopment && err.stack) {
    errorResponse.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
};

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
): ((req: Request, res: Response, next: NextFunction) => void) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const createError = (
  message: string,
  statusCode: number = 500
): CustomError => {
  const error: CustomError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};
