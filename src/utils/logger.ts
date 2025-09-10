import * as winston from 'winston';

// Simple config fallback for testing
const testConfig = {
  LOG_LEVEL: 'info',
  NODE_ENV: 'test'
};

let config;
try {
  // Try to import config, fallback to test config if it fails
  config = require('../config/config').config;
} catch (error) {
  config = testConfig;
}

const { combine, timestamp, printf, colorize, json } = winston.format;

// Custom log format
const logFormat = printf(({ level, message, timestamp, ...meta }) => {
  return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
});

// Create logger instance
export const logger = winston.createLogger({
  level: config.LOG_LEVEL,
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    config.NODE_ENV === 'production' ? json() : combine(colorize(), logFormat)
  ),
  transports: [new winston.transports.Console()],
  ...(config.NODE_ENV === 'production' && {
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
      }),
      new winston.transports.File({
        filename: 'logs/combined.log',
      }),
    ],
  }),
});

// Stream for HTTP request logging
export const logStream = {
  write: (message: string): void => {
    logger.info(message.trim());
  },
};
