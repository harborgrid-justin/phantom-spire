/**
 * Logging Service
 * Production-ready logging service with multiple transports and security features
 */

import winston, { Logger, format } from 'winston';
import path from 'path';

export class LoggingService {
  private static instance: LoggingService;
  private logger: Logger;

  private constructor() {
    this.logger = this.createLogger();
  }

  static getInstance(): LoggingService {
    if (!LoggingService.instance) {
      LoggingService.instance = new LoggingService();
    }
    return LoggingService.instance;
  }

  private createLogger(): Logger {
    const logFormat = format.combine(
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      format.errors({ stack: true }),
      format.json(),
      format.printf(({ timestamp, level, message, ...meta }) => {
        return JSON.stringify({
          timestamp,
          level,
          message,
          service: 'phantom-spire',
          ...meta
        });
      })
    );

    const transports: winston.transport[] = [
      new winston.transports.Console({
        level: process.env.LOG_LEVEL || 'info',
        format: format.combine(
          format.colorize(),
          format.simple()
        )
      })
    ];

    // Add file transports in production
    if (process.env.NODE_ENV === 'production') {
      transports.push(
        new winston.transports.File({
          filename: path.join(process.cwd(), 'logs', 'error.log'),
          level: 'error',
          format: logFormat,
          maxsize: 10485760, // 10MB
          maxFiles: 5
        }),
        new winston.transports.File({
          filename: path.join(process.cwd(), 'logs', 'combined.log'),
          format: logFormat,
          maxsize: 10485760, // 10MB
          maxFiles: 5
        })
      );
    }

    return winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: logFormat,
      transports,
      exitOnError: false
    });
  }

  info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  error(message: string, error?: any): void {
    this.logger.error(message, { error: error?.message || error, stack: error?.stack });
  }

  warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }

  debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }

  // Security audit logging
  audit(action: string, user: string, resource: string, meta?: any): void {
    this.logger.info('AUDIT', {
      action,
      user,
      resource,
      timestamp: new Date().toISOString(),
      ...meta
    });
  }

  // Performance logging
  performance(operation: string, duration: number, meta?: any): void {
    this.logger.info('PERFORMANCE', {
      operation,
      duration,
      ...meta
    });
  }

  // Business logic logging
  business(event: string, data: any): void {
    this.logger.info('BUSINESS', {
      event,
      data,
      timestamp: new Date().toISOString()
    });
  }
}