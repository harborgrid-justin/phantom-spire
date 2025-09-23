/**
 * DATABASE CONFIGURATION UTILITIES - SERVER COMPONENT
 *
 * This module provides secure database connection utilities following
 * Next.js environment variable best practices.
 *
 * IMPORTANT: This module runs server-side only and handles sensitive
 * database credentials. Never expose these utilities to client components.
 */
import 'server-only';

interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  maxConnections: number;
}

/**
 * Parse DATABASE_URL into components for secure connection handling
 */
export function parseDatabaseUrl(url?: string): DatabaseConfig | null {
  if (!url) {
    return null;
  }

  try {
    const parsed = new URL(url);

    return {
      host: parsed.hostname,
      port: parseInt(parsed.port) || 5432,
      database: parsed.pathname.slice(1), // Remove leading slash
      username: parsed.username,
      password: parsed.password,
      ssl: parsed.searchParams.get('ssl') === 'true' ||
           parsed.searchParams.get('sslmode') === 'require',
      maxConnections: parseInt(parsed.searchParams.get('max_connections') || '10')
    };
  } catch (error) {
    console.error('Failed to parse DATABASE_URL:', error);
    return null;
  }
}

/**
 * Get secure database configuration based on environment
 */
export function getDatabaseConfig(): DatabaseConfig {
  // First try DATABASE_URL (preferred for production)
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) {
    const config = parseDatabaseUrl(databaseUrl);
    if (config) {
      return config;
    }
  }

  // Fallback to individual environment variables
  const config: DatabaseConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || getDefaultDatabase(),
    username: process.env.DB_USER || getDefaultUser(),
    password: process.env.DB_PASSWORD || '',
    ssl: process.env.DB_SSL === 'true' || process.env.NODE_ENV === 'production',
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '10')
  };

  // Validate required fields
  if (!config.password && process.env.NODE_ENV === 'production') {
    throw new Error('Database password is required in production environment');
  }

  return config;
}

/**
 * Get default database name based on environment
 */
function getDefaultDatabase(): string {
  switch (process.env.NODE_ENV) {
    case 'test':
      return 'phantom_ml_test';
    case 'production':
      return 'phantom_ml_prod';
    case 'development':
    default:
      return 'phantom_ml_dev';
  }
}

/**
 * Get default database user based on environment
 */
function getDefaultUser(): string {
  switch (process.env.NODE_ENV) {
    case 'test':
      return 'phantom_test';
    case 'production':
      return 'phantom_prod';
    case 'development':
    default:
      return 'phantom_dev';
  }
}

/**
 * Create secure connection string (for logging/debugging - without password)
 */
export function createSafeConnectionString(config: DatabaseConfig): string {
  return `postgresql://${config.username}:***@${config.host}:${config.port}/${config.database}`;
}

/**
 * Validate database configuration before use
 */
export function validateDatabaseConfig(config: DatabaseConfig): void {
  const errors: string[] = [];

  if (!config.host) errors.push('Database host is required');
  if (!config.database) errors.push('Database name is required');
  if (!config.username) errors.push('Database username is required');
  if (!config.password && process.env.NODE_ENV === 'production') {
    errors.push('Database password is required in production');
  }
  if (config.port < 1 || config.port > 65535) {
    errors.push('Database port must be between 1 and 65535');
  }

  if (errors.length > 0) {
    throw new Error(`Database configuration errors: ${errors.join(', ')}`);
  }
}