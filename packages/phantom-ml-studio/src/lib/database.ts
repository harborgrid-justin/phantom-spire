/**
 * DATABASE CONNECTION AND QUERY UTILITIES
 * PostgreSQL database client for phantom-ml-studio
 */
import 'server-only';
import { Pool, PoolClient } from 'pg';
import { getDatabaseConfig, createSafeConnectionString } from '../utils/database';

// Database connection pool
let pool: Pool | null = null;

/**
 * Initialize database connection pool
 */
export async function initializeDatabase(): Promise<Pool> {
  if (pool) {
    return pool;
  }

  // Parse the connection string from database.txt
  const connectionString = "postgresql://neondb_owner:npg_yPdfhxv7YbO8@ep-ancient-dream-ad9479e7-pooler.c-2.us-east-1.aws.neon.tech/pilot?sslmode=require&channel_binding=require";
  
  pool = new Pool({
    connectionString,
    max: 20,
    min: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  // Test the connection
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('✅ Database connection established successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }

  return pool;
}

/**
 * Get database connection pool
 */
export async function getDatabase(): Promise<Pool> {
  if (!pool) {
    return initializeDatabase();
  }
  return pool;
}

/**
 * Execute a query with the database pool
 */
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<{ rows: T[]; rowCount: number }> {
  const db = await getDatabase();
  try {
    const result = await db.query(text, params);
    return {
      rows: result.rows,
      rowCount: result.rowCount || 0
    };
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Execute a query with a dedicated client (for transactions)
 */
export async function queryWithClient<T = any>(
  client: PoolClient,
  text: string,
  params?: any[]
): Promise<{ rows: T[]; rowCount: number }> {
  try {
    const result = await client.query(text, params);
    return {
      rows: result.rows,
      rowCount: result.rowCount || 0
    };
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Get a client from the pool for transactions
 */
export async function getClient(): Promise<PoolClient> {
  const db = await getDatabase();
  return db.connect();
}

/**
 * Execute queries within a transaction
 */
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Close database connections (for cleanup)
 */
export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('✅ Database connections closed');
  }
}