/**
 * Enterprise Logging Infrastructure
 * Comprehensive logging system with multiple transports, structured logging,
 * performance monitoring, and audit trails
 */

import { BaseService, Injectable } from './ServiceRegistry';

// Log levels
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4
}

// Log entry interface
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  metadata?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  service?: string;
  component?: string;
  action?: string;
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
  performance?: {
    duration: number;
    startTime: number;
    endTime: number;
  };
  audit?: {
    resource: string;
    operation: string;
    outcome: 'success' | 'failure' | 'warning';
    clientIp?: string;
    userAgent?: string;
  };
}

// Log transport interface
export interface ILogTransport {
  name: string;
  log(entry: LogEntry): Promise<void>;
  initialize(): Promise<void>;
  destroy(): Promise<void>;
}

// Console transport
export class ConsoleTransport implements ILogTransport {
  name = 'console';

  async initialize(): Promise<void> {
    // No initialization needed for console
  }

  async destroy(): Promise<void> {
    // No cleanup needed for console
  }

  async log(entry: LogEntry): Promise<void> {
    const levelNames = ['ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE'];
    const levelName = levelNames[entry.level] || 'UNKNOWN';
    
    const colorCodes = {
      ERROR: '\x1b[31m',
      WARN: '\x1b[33m',
      INFO: '\x1b[36m',
      DEBUG: '\x1b[37m',
      TRACE: '\x1b[90m'
    };

    const resetCode = '\x1b[0m';
    const colorCode = colorCodes[levelName as keyof typeof colorCodes] || '';

    const logMessage = `${colorCode}[${entry.timestamp}] ${levelName}${resetCode} ${entry.context ? `[${entry.context}]` : ''} ${entry.message}`;
    
    if (entry.level === LogLevel.ERROR) {
      console.error(logMessage, entry.metadata || '');
    } else if (entry.level === LogLevel.WARN) {
      console.warn(logMessage, entry.metadata || '');
    } else {
      console.log(logMessage, entry.metadata || '');
    }
  }
}

// File transport (for server-side usage)
export class FileTransport implements ILogTransport {
  name = 'file';
  private logFile: string;
  private writeStream?: any;

  constructor(logFile: string = 'application.log') {
    this.logFile = logFile;
  }

  async initialize(): Promise<void> {
    // Only initialize on server side
    if (typeof window === 'undefined') {
      try {
        const fs = require('fs');
        const path = require('path');
        
        const logDir = path.dirname(this.logFile);
        if (!fs.existsSync(logDir)) {
          fs.mkdirSync(logDir, { recursive: true });
        }

        this.writeStream = fs.createWriteStream(this.logFile, { flags: 'a' });
      } catch (error) {
        console.warn('Failed to initialize file transport:', error.message);
      }
    }
  }

  async destroy(): Promise<void> {
    if (this.writeStream) {
      this.writeStream.end();
    }
  }

  async log(entry: LogEntry): Promise<void> {
    if (this.writeStream) {
      const logLine = JSON.stringify(entry) + '\n';
      this.writeStream.write(logLine);
    }
  }
}

// HTTP transport for remote logging
export class HttpTransport implements ILogTransport {
  name = 'http';
  private endpoint: string;
  private batchSize: number;
  private flushInterval: number;
  private buffer: LogEntry[] = [];
  private flushTimer?: NodeJS.Timeout;

  constructor(endpoint: string, batchSize = 10, flushInterval = 5000) {
    this.endpoint = endpoint;
    this.batchSize = batchSize;
    this.flushInterval = flushInterval;
  }

  async initialize(): Promise<void> {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  async destroy(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    await this.flush();
  }

  async log(entry: LogEntry): Promise<void> {
    this.buffer.push(entry);
    
    if (this.buffer.length >= this.batchSize) {
      await this.flush();
    }
  }

  private async flush(): Promise<void> {
    if (this.buffer.length === 0) {
      return;
    }

    const batch = this.buffer.splice(0, this.buffer.length);

    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ logs: batch })
      });
    } catch (error) {
      console.error('Failed to send logs to remote endpoint:', error);
      // In a production system, you might want to implement retry logic here
    }
  }
}

// Main logger service
@Injectable('LoggerService')
export class LoggerService extends BaseService {
  public readonly serviceName = 'LoggerService';
  private transports: ILogTransport[] = [];
  private currentLogLevel: LogLevel = LogLevel.INFO;
  private context: string = '';

  protected async onInitialize(): Promise<void> {
    // Add default transports
    this.addTransport(new ConsoleTransport());
    
    // Add file transport for server-side
    if (typeof window === 'undefined') {
      this.addTransport(new FileTransport('logs/phantom-ml-studio.log'));
    }

    // Initialize all transports
    await Promise.all(this.transports.map(transport => transport.initialize()));
  }

  protected async onDestroy(): Promise<void> {
    await Promise.all(this.transports.map(transport => transport.destroy()));
    this.transports = [];
  }

  protected async performHealthCheck(): Promise<boolean> {
    return this.transports.length > 0;
  }

  addTransport(transport: ILogTransport): void {
    this.transports.push(transport);
  }

  setLogLevel(level: LogLevel): void {
    this.currentLogLevel = level;
  }

  setContext(context: string): LoggerService {
    const newLogger = Object.create(this);
    newLogger.context = context;
    return newLogger;
  }

  error(message: string, error?: Error, metadata?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, {
      ...metadata,
      ...(error && {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      })
    });
  }

  warn(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, metadata);
  }

  info(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, metadata);
  }

  debug(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, metadata);
  }

  trace(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.TRACE, message, metadata);
  }

  // Performance logging
  startTimer(operation: string): () => void {
    const startTime = Date.now();
    
    return () => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      this.info(`Performance: ${operation}`, {
        performance: {
          duration,
          startTime,
          endTime
        }
      });
    };
  }

  // Audit logging
  audit(resource: string, operation: string, outcome: 'success' | 'failure' | 'warning', metadata?: Record<string, any>): void {
    this.log(LogLevel.INFO, `Audit: ${operation} on ${resource}`, {
      ...metadata,
      audit: {
        resource,
        operation,
        outcome,
        clientIp: this.getClientIp(),
        userAgent: this.getUserAgent()
      }
    });
  }

  // Request logging
  logRequest(method: string, url: string, statusCode: number, duration: number, userId?: string): void {
    const level = statusCode >= 400 ? LogLevel.WARN : LogLevel.INFO;
    
    this.log(level, `${method} ${url} ${statusCode}`, {
      request: {
        method,
        url,
        statusCode,
        duration,
        userId
      }
    });
  }

  private async log(level: LogLevel, message: string, metadata?: Record<string, any>): Promise<void> {
    if (level > this.currentLogLevel) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: this.context,
      metadata,
      userId: this.getCurrentUserId(),
      sessionId: this.getCurrentSessionId(),
      requestId: this.getCurrentRequestId(),
      service: 'phantom-ml-studio'
    };

    // Log to all transports
    await Promise.all(
      this.transports.map(async transport => {
        try {
          await transport.log(entry);
        } catch (error) {
          console.error(`Failed to log to ${transport.name}:`, error);
        }
      })
    );
  }

  private getCurrentUserId(): string | undefined {
    // Implementation would depend on your authentication system
    // For now, return undefined
    return undefined;
  }

  private getCurrentSessionId(): string | undefined {
    // Implementation would depend on your session management
    // For now, return undefined
    return undefined;
  }

  private getCurrentRequestId(): string | undefined {
    // Implementation would depend on your request tracking system
    // For now, return undefined
    return undefined;
  }

  private getClientIp(): string | undefined {
    // This would typically be extracted from request headers
    return undefined;
  }

  private getUserAgent(): string | undefined {
    if (typeof window !== 'undefined') {
      return navigator.userAgent;
    }
    return undefined;
  }
}

// Logger factory for easy usage
export class LoggerFactory {
  private static loggerService: LoggerService;

  static async initialize(): Promise<void> {
    LoggerFactory.loggerService = new LoggerService();
    await LoggerFactory.loggerService.initialize();
  }

  static getLogger(context?: string): LoggerService {
    if (!LoggerFactory.loggerService) {
      throw new Error('LoggerService not initialized. Call LoggerFactory.initialize() first.');
    }
    
    return context ? LoggerFactory.loggerService.setContext(context) : LoggerFactory.loggerService;
  }

  static async shutdown(): Promise<void> {
    if (LoggerFactory.loggerService) {
      await LoggerFactory.loggerService.destroy();
    }
  }
}

// Export convenience logger
export const createLogger = (context?: string) => LoggerFactory.getLogger(context);

// Logging middleware for API routes
export const createLoggingMiddleware = (logger: LoggerService) => {
  return (req: any, res: any, next: any) => {
    const startTime = Date.now();
    const originalSend = res.json;

    res.json = function (data: any) {
      const duration = Date.now() - startTime;
      logger.logRequest(req.method, req.url, res.statusCode, duration, req.user?.id);
      return originalSend.call(this, data);
    };

    next();
  };
};