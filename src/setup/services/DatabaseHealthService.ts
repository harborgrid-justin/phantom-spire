import mongoose from 'mongoose';
import { createClient } from 'redis';
import { Client as PgClient } from 'pg';
import mysql from 'mysql2/promise';

export interface DatabaseConnectionResult {
  connected: boolean;
  status: 'connected' | 'error' | 'timeout';
  message: string;
  details?: any;
  responseTime: number;
  version?: string;
}

export interface DatabaseHealthCheck {
  timestamp: Date;
  databases: {
    mongodb: DatabaseConnectionResult;
    postgresql: DatabaseConnectionResult;
    mysql: DatabaseConnectionResult;
    redis: DatabaseConnectionResult;
  };
  overall: {
    healthy: boolean;
    connectedCount: number;
    totalCount: number;
    averageResponseTime: number;
  };
}

export class DatabaseHealthService {
  private readonly timeout = 10000; // 10 seconds

  async checkConnection(databaseType: string): Promise<DatabaseConnectionResult> {
    const startTime = Date.now();
    
    try {
      switch (databaseType) {
        case 'mongodb':
          return await this.checkMongoDBConnection(startTime);
        case 'postgresql':
          return await this.checkPostgreSQLConnection(startTime);
        case 'mysql':
          return await this.checkMySQLConnection(startTime);
        case 'redis':
          return await this.checkRedisConnection(startTime);
        default:
          throw new Error(`Unsupported database type: ${databaseType}`);
      }
    } catch (error) {
      return {
        connected: false,
        status: 'error',
        message: (error as Error).message,
        responseTime: Date.now() - startTime
      };
    }
  }

  private async checkMongoDBConnection(startTime: number): Promise<DatabaseConnectionResult> {
    console.log('Testing MongoDB connection...');
    
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI environment variable not set');
    }

    // Create a new connection for testing
    const connection = mongoose.createConnection();
    let connected = false;
    
    try {
      // Set connection timeout
      await Promise.race([
        connection.openUri(uri, {
          serverSelectionTimeoutMS: this.timeout,
          connectTimeoutMS: this.timeout,
          socketTimeoutMS: this.timeout
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), this.timeout)
        )
      ]);

      connected = true;
      
      // Test basic operations
      const adminDb = connection.db.admin();
      const serverStatus = await adminDb.serverStatus();
      
      return {
        connected: true,
        status: 'connected',
        message: 'MongoDB connection successful',
        responseTime: Date.now() - startTime,
        version: serverStatus.version,
        details: {
          host: serverStatus.host,
          uptime: serverStatus.uptime,
          connections: serverStatus.connections
        }
      };
    } finally {
      if (connected) {
        await connection.close();
      }
    }
  }

  private async checkPostgreSQLConnection(startTime: number): Promise<DatabaseConnectionResult> {
    console.log('Testing PostgreSQL connection...');
    
    const uri = process.env.POSTGRESQL_URI;
    if (!uri) {
      throw new Error('POSTGRESQL_URI environment variable not set');
    }

    const client = new PgClient({
      connectionString: uri,
      connectionTimeoutMillis: this.timeout,
      query_timeout: this.timeout
    });

    try {
      await client.connect();
      
      // Test basic query
      const result = await client.query('SELECT version(), current_database(), current_user');
      const versionInfo = result.rows[0];
      
      return {
        connected: true,
        status: 'connected',
        message: 'PostgreSQL connection successful',
        responseTime: Date.now() - startTime,
        version: versionInfo.version.split(' ')[1],
        details: {
          database: versionInfo.current_database,
          user: versionInfo.current_user,
          version: versionInfo.version
        }
      };
    } finally {
      await client.end();
    }
  }

  private async checkMySQLConnection(startTime: number): Promise<DatabaseConnectionResult> {
    console.log('Testing MySQL connection...');
    
    const uri = process.env.MYSQL_URI;
    if (!uri) {
      throw new Error('MYSQL_URI environment variable not set');
    }

    // Parse MySQL URI manually since mysql2 expects config object
    const url = new URL(uri);
    const config = {
      host: url.hostname,
      port: parseInt(url.port) || 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1), // Remove leading '/'
      connectTimeout: this.timeout,
      acquireTimeout: this.timeout,
      timeout: this.timeout
    };

    const connection = await mysql.createConnection(config);
    
    try {
      // Test basic query
      const [rows] = await connection.execute('SELECT VERSION() as version, DATABASE() as database, USER() as user');
      const info = rows[0] as any;
      
      return {
        connected: true,
        status: 'connected',
        message: 'MySQL connection successful',
        responseTime: Date.now() - startTime,
        version: info.version,
        details: {
          database: info.database,
          user: info.user,
          version: info.version
        }
      };
    } finally {
      await connection.end();
    }
  }

  private async checkRedisConnection(startTime: number): Promise<DatabaseConnectionResult> {
    console.log('Testing Redis connection...');
    
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      throw new Error('REDIS_URL environment variable not set');
    }

    // Parse Redis URL to extract password
    const url = new URL(redisUrl);
    const client = createClient({
      url: redisUrl,
      socket: {
        connectTimeout: this.timeout
      },
      commandsQueueMaxLength: this.timeout
    });

    try {
      await client.connect();
      
      // Test basic operations
      const pong = await client.ping();
      const info = await client.info('server');
      
      // Parse Redis version from info
      const infoStr = typeof info === 'string' ? info : JSON.stringify(info);
      const versionMatch = infoStr.match(/redis_version:([^\r\n]+)/);
      const version = versionMatch ? versionMatch[1] : 'unknown';
      
      return {
        connected: true,
        status: 'connected',
        message: 'Redis connection successful',
        responseTime: Date.now() - startTime,
        version,
        details: {
          ping: pong,
          version,
          mode: infoStr.match(/redis_mode:([^\r\n]+)/)?.[1] || 'unknown'
        }
      };
    } finally {
      await client.disconnect();
    }
  }

  async performHealthCheck(): Promise<DatabaseHealthCheck> {
    console.log('Starting comprehensive database health check...');
    
    const databases = ['mongodb', 'postgresql', 'mysql', 'redis'];
    const results = await Promise.all(
      databases.map(async db => ({
        name: db,
        result: await this.checkConnection(db)
      }))
    );

    const databaseResults = {
      mongodb: results.find(r => r.name === 'mongodb')!.result,
      postgresql: results.find(r => r.name === 'postgresql')!.result,
      mysql: results.find(r => r.name === 'mysql')!.result,
      redis: results.find(r => r.name === 'redis')!.result
    };

    const connectedCount = Object.values(databaseResults).filter(r => r.connected).length;
    const totalResponseTime = Object.values(databaseResults).reduce((sum, r) => sum + r.responseTime, 0);
    const averageResponseTime = Math.round(totalResponseTime / databases.length);

    const healthCheck: DatabaseHealthCheck = {
      timestamp: new Date(),
      databases: databaseResults,
      overall: {
        healthy: connectedCount === databases.length,
        connectedCount,
        totalCount: databases.length,
        averageResponseTime
      }
    };

    console.log(`Database health check completed: ${connectedCount}/${databases.length} databases connected`);
    console.log(`Average response time: ${averageResponseTime}ms`);
    
    return healthCheck;
  }

  async generateHealthReport(): Promise<string> {
    const healthCheck = await this.performHealthCheck();
    
    let report = '# Phantom Spire CTI Platform - Database Health Report\n\n';
    report += `**Generated:** ${healthCheck.timestamp.toISOString()}\n`;
    report += `**Overall Status:** ${healthCheck.overall.healthy ? '✅ HEALTHY' : '❌ UNHEALTHY'}\n`;
    report += `**Connected:** ${healthCheck.overall.connectedCount}/${healthCheck.overall.totalCount} databases\n`;
    report += `**Average Response Time:** ${healthCheck.overall.averageResponseTime}ms\n\n`;
    
    report += '## Database Connections\n\n';
    
    Object.entries(healthCheck.databases).forEach(([dbName, result]) => {
      const status = result.connected ? '✅ CONNECTED' : '❌ DISCONNECTED';
      report += `### ${dbName.toUpperCase()}\n`;
      report += `- **Status:** ${status}\n`;
      report += `- **Response Time:** ${result.responseTime}ms\n`;
      report += `- **Message:** ${result.message}\n`;
      
      if (result.version) {
        report += `- **Version:** ${result.version}\n`;
      }
      
      if (result.details) {
        report += `- **Details:** ${JSON.stringify(result.details, null, 2)}\n`;
      }
      
      report += '\n';
    });
    
    if (!healthCheck.overall.healthy) {
      report += '## Troubleshooting\n\n';
      Object.entries(healthCheck.databases).forEach(([dbName, result]) => {
        if (!result.connected) {
          report += `### ${dbName.toUpperCase()} Connection Issues\n`;
          report += `- Check if ${dbName} container is running: \`docker-compose ps ${dbName}\`\n`;
          report += `- Check ${dbName} logs: \`docker-compose logs ${dbName}\`\n`;
          report += `- Verify connection string in environment variables\n`;
          report += `- Ensure firewall allows connection to ${dbName} port\n\n`;
        }
      });
    }
    
    return report;
  }
}