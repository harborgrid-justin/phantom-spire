import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

export interface LoggerConfig {
  level: string;
  service: string;
  environment: string;
  logDir: string;
  enableConsole: boolean;
  enableFile: boolean;
  maxSize: string;
  maxFiles: string;
  datePattern: string;
}

const defaultConfig: LoggerConfig = {
  level: process.env.LOG_LEVEL || 'info',
  service: process.env.SERVICE_NAME || 'phantom-spire',
  environment: process.env.NODE_ENV || 'development',
  logDir: process.env.LOG_DIR || './logs',
  enableConsole: process.env.ENABLE_CONSOLE_LOGS !== 'false',
  enableFile: process.env.ENABLE_FILE_LOGS !== 'false',
  maxSize: process.env.LOG_MAX_SIZE || '20m',
  maxFiles: process.env.LOG_MAX_FILES || '14d',
  datePattern: process.env.LOG_DATE_PATTERN || 'YYYY-MM-DD',
};

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
    return JSON.stringify({
      timestamp,
      level,
      service,
      message,
      ...meta,
    });
  })
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} [${service}] ${level}: ${message} ${metaStr}`;
  })
);

export class Logger {
  private winston: winston.Logger;
  private config: LoggerConfig;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.winston = this.createLogger();
  }

  private createLogger(): winston.Logger {
    const transports: winston.transport[] = [];

    // Console transport
    if (this.config.enableConsole) {
      transports.push(
        new winston.transports.Console({
          level: this.config.level,
          format: this.config.environment === 'production' ? logFormat : consoleFormat,
        })
      );
    }

    // File transports
    if (this.config.enableFile) {
      // Combined logs
      transports.push(
        new DailyRotateFile({
          filename: path.join(this.config.logDir, '%DATE%-combined.log'),
          datePattern: this.config.datePattern,
          maxSize: this.config.maxSize,
          maxFiles: this.config.maxFiles,
          level: this.config.level,
          format: logFormat,
        })
      );

      // Error logs
      transports.push(
        new DailyRotateFile({
          filename: path.join(this.config.logDir, '%DATE%-error.log'),
          datePattern: this.config.datePattern,
          maxSize: this.config.maxSize,
          maxFiles: this.config.maxFiles,
          level: 'error',
          format: logFormat,
        })
      );

      // Audit logs
      transports.push(
        new DailyRotateFile({
          filename: path.join(this.config.logDir, '%DATE%-audit.log'),
          datePattern: this.config.datePattern,
          maxSize: this.config.maxSize,
          maxFiles: this.config.maxFiles,
          level: 'info',
          format: logFormat,
        })
      );
    }

    return winston.createLogger({
      level: this.config.level,
      format: logFormat,
      defaultMeta: { service: this.config.service, environment: this.config.environment },
      transports,
      exitOnError: false,
    });
  }

  // Standard logging methods
  error(message: string, meta?: Record<string, any>): void {
    this.winston.error(message, meta);
  }

  warn(message: string, meta?: Record<string, any>): void {
    this.winston.warn(message, meta);
  }

  info(message: string, meta?: Record<string, any>): void {
    this.winston.info(message, meta);
  }

  debug(message: string, meta?: Record<string, any>): void {
    this.winston.debug(message, meta);
  }

  verbose(message: string, meta?: Record<string, any>): void {
    this.winston.verbose(message, meta);
  }

  // Security logging
  security(event: string, details: Record<string, any>): void {
    this.winston.info(`SECURITY: ${event}`, {
      category: 'security',
      event,
      ...details,
    });
  }

  // Audit logging
  audit(action: string, user: string, details: Record<string, any>): void {
    this.winston.info(`AUDIT: ${action}`, {
      category: 'audit',
      action,
      user,
      timestamp: new Date().toISOString(),
      ...details,
    });
  }

  // Performance logging
  performance(operation: string, duration: number, details?: Record<string, any>): void {
    this.winston.info(`PERFORMANCE: ${operation}`, {
      category: 'performance',
      operation,
      duration,
      ...details,
    });
  }

  // Database logging
  database(query: string, duration: number, details?: Record<string, any>): void {
    this.winston.debug(`DATABASE: ${query}`, {
      category: 'database',
      query,
      duration,
      ...details,
    });
  }

  // API logging
  api(method: string, url: string, statusCode: number, duration: number, details?: Record<string, any>): void {
    this.winston.info(`API: ${method} ${url}`, {
      category: 'api',
      method,
      url,
      statusCode,
      duration,
      ...details,
    });
  }

  // Threat intelligence logging
  threat(indicator: string, type: string, severity: string, details: Record<string, any>): void {
    this.winston.warn(`THREAT: ${type} - ${indicator}`, {
      category: 'threat',
      indicator,
      type,
      severity,
      ...details,
    });
  }

  // Child logger with additional context
  child(meta: Record<string, any>): Logger {
    const childLogger = Object.create(this);
    childLogger.winston = this.winston.child(meta);
    return childLogger;
  }

  // Stream interface for HTTP logging
  stream = {
    write: (message: string) => {
      this.winston.info(message.trim());
    },
  };
}

// Global logger instance
export const logger = new Logger();

// Export logger for specific modules
export const createModuleLogger = (module: string): Logger => {
  return logger.child({ module });
};

// Legacy export for backward compatibility
export const logStream = logger.stream;

export default logger;
