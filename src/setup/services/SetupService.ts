import { promises as fs } from 'fs';
import path from 'path';
import { URL } from 'url';
import net from 'net';
import { DatabaseHealthService } from './DatabaseHealthService.js';
import { SystemRequirementsService } from './SystemRequirementsService.js';
import axios from 'axios';
import mongoose from 'mongoose';

// API Response types
interface MISPVersionResponse {
  version: string;
}

interface OTXUserResponse {
  username: string;
  member_since: string;
}

interface VirusTotalUserResponse {
  data: {
    id: string;
    type: string;
    attributes: {
      quotas: any;
    };
  };
}

export interface SetupStatus {
  isSetupRequired: boolean;
  isFirstRun: boolean;
  setupMode: boolean;
  completedSteps: string[];
  currentStep: string | null;
  lastActivity: Date | null;
}

export interface SetupProgress {
  step: string;
  progress: number;
  message: string;
  completed: boolean;
  timestamp: Date;
}

export interface SetupConfiguration {
  systemConfig: {
    threatRetentionDays: number;
    evidenceRetentionDays: number;
    maxConcurrentWorkflows: number;
    enabledFeatures: string[];
  };
  integrationConfig: {
    misp?: { enabled: boolean; url?: string; authKey?: string };
    otx?: { enabled: boolean; apiKey?: string };
    virustotal?: { enabled: boolean; apiKey?: string };
  };
}

export interface IntegrationTestResult {
  success: boolean;
  message: string;
  details?: any;
  responseTime: number;
}

export class SetupService {
  private readonly setupConfigPath = path.join(process.cwd(), 'setup', 'setup-state.json');
  private databaseHealthService: DatabaseHealthService;
  private systemRequirementsService: SystemRequirementsService;

  constructor() {
    this.databaseHealthService = new DatabaseHealthService();
    this.systemRequirementsService = new SystemRequirementsService();
  }

  public async getSetupStatus(): Promise<SetupStatus> {
    const setupMode = process.env.SETUP_MODE === 'true';
    const firstRun = process.env.FIRST_RUN === 'true';
    
    let setupState = null;
    try {
      const stateData = await fs.readFile(this.setupConfigPath, 'utf-8');
      setupState = JSON.parse(stateData);
    } catch (error) {
      // Setup state file doesn't exist yet
    }

    // Check if admin user exists
    let hasAdminUser = false;
    try {
      const connection = mongoose.createConnection(process.env.MONGODB_URI!);
      const adminUser = await connection.db.collection('users').findOne({ 
        username: { $exists: true },
        roleId: { $exists: true }
      });
      hasAdminUser = !!adminUser;
      await connection.close();
    } catch (error) {
      console.warn('Could not check for admin user:', (error as Error).message);
    }

    const isSetupRequired = setupMode || firstRun || !hasAdminUser;

    return {
      isSetupRequired,
      isFirstRun: firstRun,
      setupMode,
      completedSteps: setupState?.completedSteps || [],
      currentStep: setupState?.currentStep || null,
      lastActivity: setupState?.lastActivity ? new Date(setupState?.lastActivity) : null
    };
  }

  public async getSetupProgress(): Promise<SetupProgress[]> {
    const steps = [
      'system-check',
      'database-connections',
      'admin-user',
      'system-config',
      'integrations',
      'finalization'
    ];

    const setupStatus = await this.getSetupStatus();
    const completedSteps = setupStatus.completedSteps;

    return steps.map((step, index) => {
      const isCompleted = completedSteps.includes(step);
      const isCurrent = setupStatus.currentStep === step;
      const progress = isCompleted ? 100 : (isCurrent ? 50 : 0);

      return {
        step,
        progress,
        message: this.getStepMessage(step, isCompleted, isCurrent),
        completed: isCompleted,
        timestamp: new Date()
      };
    });
  }

  private getStepMessage(step: string, completed: boolean, current: boolean): string {
    if (completed) {
      switch (step) {
        case 'system-check': return 'System requirements verified';
        case 'database-connections': return 'All databases connected successfully';
        case 'admin-user': return 'Administrator user created';
        case 'system-config': return 'System configuration saved';
        case 'integrations': return 'External integrations configured';
        case 'finalization': return 'Setup completed successfully';
        default: return 'Step completed';
      }
    } else if (current) {
      switch (step) {
        case 'system-check': return 'Checking system requirements...';
        case 'database-connections': return 'Testing database connections...';
        case 'admin-user': return 'Creating administrator user...';
        case 'system-config': return 'Configuring system settings...';
        case 'integrations': return 'Setting up integrations...';
        case 'finalization': return 'Finalizing setup...';
        default: return 'In progress...';
      }
    } else {
      switch (step) {
        case 'system-check': return 'System requirements check pending';
        case 'database-connections': return 'Database connection tests pending';
        case 'admin-user': return 'Administrator user creation pending';
        case 'system-config': return 'System configuration pending';
        case 'integrations': return 'Integration setup pending';
        case 'finalization': return 'Final setup pending';
        default: return 'Pending';
      }
    }
  }

  private async saveSetupState(completedSteps: string[], currentStep: string | null): Promise<void> {
    const setupState = {
      completedSteps,
      currentStep,
      lastActivity: new Date().toISOString(),
      version: '1.0.0'
    };

    try {
      await fs.mkdir(path.dirname(this.setupConfigPath), { recursive: true });
      await fs.writeFile(this.setupConfigPath, JSON.stringify(setupState, null, 2));
    } catch (error) {
      console.warn('Could not save setup state:', (error as Error).message);
    }
  }

  public async testIntegration(type: string, config: any): Promise<IntegrationTestResult> {
    const startTime = Date.now();
    
    try {
      switch (type) {
        case 'misp':
          return await this.testMISPIntegration(config, startTime);
        case 'otx':
          return await this.testOTXIntegration(config, startTime);
        case 'virustotal':
          return await this.testVirusTotalIntegration(config, startTime);
        default:
          throw new Error(`Unsupported integration type: ${type}`);
      }
    } catch (error) {
      return {
        success: false,
        message: `Integration test failed: ${(error as Error).message}`,
        responseTime: Date.now() - startTime
      };
    }
  }

  private async testMISPIntegration(config: any, startTime: number): Promise<IntegrationTestResult> {
    if (!config.url || !config.authKey) {
      throw new Error('MISP URL and Auth Key are required');
    }

    // SSRF mitigation: validate config.url
    this.validateSafeUrl(config.url);

    try {
      const response = await axios.get(`${config.url.replace(/\/+$/, '')}/servers/getPyMISPVersion.json`, {
        headers: {
          'Authorization': config.authKey,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      const responseData = response.data as MISPVersionResponse;

      return {
        success: true,
        message: 'MISP connection successful',
        details: {
          version: responseData.version || 'Unknown',
          url: config.url,
          status: response.status
        },
        responseTime: Date.now() - startTime
      };
    } catch (error: any) {
      let message = 'MISP connection failed';
      if (error.response) {
        message += `: HTTP ${error.response.status}`;
      } else if (error.code === 'ECONNREFUSED') {
        message += ': Connection refused';
      } else if (error.code === 'ETIMEDOUT') {
        message += ': Connection timeout';
      }
      throw new Error(message);
    }
  }
  /**
   * Validate input URL to mitigate SSRF risk.
   * Throws an error if the URL is unsafe.
   */
  private validateSafeUrl(inputUrl: string): void {
    let urlObj: URL;
    try {
      urlObj = new URL(inputUrl);
    } catch (err) {
      throw new Error('Invalid URL');
    }
    // Allow only http and https
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      throw new Error('URL must start with http:// or https://');
    }
    const hostname = urlObj.hostname;
    // Block localhost/loopback
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname === '::1'
    ) {
      throw new Error('Host is not allowed');
    }
    // Block private network ranges
    const blockedRanges = [
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^192\.168\./
    ];
    if (blockedRanges.some(re => re.test(hostname))) {
      throw new Error('Host is not allowed');
    }
    // If hostname is an IP, block link-local/metdata
    if (net.isIP(hostname)) {
      if (
        hostname.startsWith('169.254.') || // link local
        hostname.startsWith('100.64.')   // CGNAT
      ) {
        throw new Error('Host is not allowed');
      }
    }
    const lower = hostname.toLowerCase();
    if (
      lower.endsWith('metadata.google.internal') ||
      lower.endsWith('169.254.169.254')
    ) {
      throw new Error('Host is not allowed');
    }
    // Optionally, add an allowlist or further checks here.
  }


  private async testOTXIntegration(config: any, startTime: number): Promise<IntegrationTestResult> {
    if (!config.apiKey) {
      throw new Error('OTX API Key is required');
    }

    try {
      const response = await axios.get('https://otx.alienvault.com/api/v1/user/me', {
        headers: {
          'X-OTX-API-KEY': config.apiKey
        },
        timeout: 10000
      });

      const responseData = response.data as OTXUserResponse;

      return {
        success: true,
        message: 'AlienVault OTX connection successful',
        details: {
          username: responseData.username,
          member_since: responseData.member_since,
          status: response.status
        },
        responseTime: Date.now() - startTime
      };
    } catch (error: any) {
      let message = 'OTX connection failed';
      if (error.response?.status === 403) {
        message += ': Invalid API key';
      } else if (error.response?.status === 429) {
        message += ': Rate limit exceeded';
      } else if (error.code === 'ETIMEDOUT') {
        message += ': Connection timeout';
      }
      throw new Error(message);
    }
  }

  private async testVirusTotalIntegration(config: any, startTime: number): Promise<IntegrationTestResult> {
    if (!config.apiKey) {
      throw new Error('VirusTotal API Key is required');
    }

    try {
      const response = await axios.get('https://www.virustotal.com/api/v3/users/self', {
        headers: {
          'x-apikey': config.apiKey
        },
        timeout: 10000
      });

      const responseData = response.data as VirusTotalUserResponse;

      return {
        success: true,
        message: 'VirusTotal connection successful',
        details: {
          id: responseData.data.id,
          type: responseData.data.type,
          quotas: responseData.data.attributes.quotas,
          status: response.status
        },
        responseTime: Date.now() - startTime
      };
    } catch (error: any) {
      let message = 'VirusTotal connection failed';
      if (error.response?.status === 401) {
        message += ': Invalid API key';
      } else if (error.response?.status === 429) {
        message += ': Rate limit exceeded';
      } else if (error.code === 'ETIMEDOUT') {
        message += ': Connection timeout';
      }
      throw new Error(message);
    }
  }

  public async getDatabaseSchemaStatus(): Promise<any> {
    const schemas = {
      mongodb: { initialized: false, collections: 0, indexes: 0 },
      postgresql: { initialized: false, tables: 0, indexes: 0 },
      mysql: { initialized: false, tables: 0, indexes: 0 },
      redis: { initialized: false, databases: 16 }
    };

    try {
      // Check MongoDB
      const mongoConnection = mongoose.createConnection(process.env.MONGODB_URI!);
      const collections = await mongoConnection.db.listCollections().toArray();
      schemas.mongodb = {
        initialized: collections.length > 0,
        collections: collections.length,
        indexes: 0 // Would need to count indexes across all collections
      };
      await mongoConnection.close();
    } catch (error) {
      console.warn('Could not check MongoDB schema:', (error as Error).message);
    }

    // Similar checks would be implemented for PostgreSQL and MySQL
    // For brevity, marking as initialized if we can connect
    try {
      const healthCheck = await this.databaseHealthService.performHealthCheck();
      if (healthCheck.databases.postgresql.connected) {
        schemas.postgresql.initialized = true;
      }
      if (healthCheck.databases.mysql.connected) {
        schemas.mysql.initialized = true;
      }
      if (healthCheck.databases.redis.connected) {
        schemas.redis.initialized = true;
      }
    } catch (error) {
      console.warn('Could not check database schemas:', (error as Error).message);
    }

    return schemas;
  }

  public async finalizeSetup(config: SetupConfiguration): Promise<any> {
    console.log('Starting setup finalization...');
    
    // Step 1: Verify all databases are healthy
    console.log('Verifying database health...');
    const healthCheck = await this.databaseHealthService.performHealthCheck();
    if (!healthCheck.overall.healthy) {
      throw new Error('Database health check failed. Ensure all databases are running and accessible.');
    }

    // Step 2: Save system configuration to database
    console.log('Saving system configuration...');
    await this.saveSystemConfiguration(config.systemConfig);
    
    // Step 3: Save integration configurations
    console.log('Saving integration configurations...');
    await this.saveIntegrationConfiguration(config.integrationConfig);

    // Step 4: Create initial data structures
    console.log('Initializing data structures...');
    await this.initializeDataStructures();

    // Step 5: Update setup completion status
    console.log('Updating setup completion status...');
    await this.markSetupComplete();

    // Step 6: Generate setup completion report
    const completionReport = await this.generateSetupReport(config);

    console.log('Setup finalization completed successfully!');
    
    return {
      success: true,
      timestamp: new Date(),
      configuration: config,
      report: completionReport
    };
  }

  private async saveSystemConfiguration(systemConfig: any): Promise<void> {
    const connection = mongoose.createConnection(process.env.MONGODB_URI!);
    
    try {
      await connection.db.collection('system_configuration').updateOne(
        { type: 'global' },
        {
          $set: {
            type: 'global',
            config: systemConfig,
            updated_at: new Date()
          },
          $setOnInsert: {
            created_at: new Date()
          }
        },
        { upsert: true }
      );
    } finally {
      await connection.close();
    }
  }

  private async saveIntegrationConfiguration(integrationConfig: any): Promise<void> {
    const connection = mongoose.createConnection(process.env.MONGODB_URI!);
    
    try {
      for (const [integration, config] of Object.entries(integrationConfig)) {
        if (config && (config as any).enabled) {
          await connection.db.collection('integrations').updateOne(
            { type: integration },
            {
              $set: {
                type: integration,
                config: config,
                enabled: true,
                updated_at: new Date()
              },
              $setOnInsert: {
                created_at: new Date()
              }
            },
            { upsert: true }
          );
        }
      }
    } finally {
      await connection.close();
    }
  }

  private async initializeDataStructures(): Promise<void> {
    const connection = mongoose.createConnection(process.env.MONGODB_URI!);
    
    try {
      // Create system health record
      await connection.db.collection('system_health').insertOne({
        timestamp: new Date(),
        component: 'setup_service',
        status: 'healthy',
        metrics: {
          setupCompleted: true,
          setupTimestamp: new Date()
        },
        message: 'Phantom Spire setup completed successfully'
      });

      // Initialize workflow templates if they don't exist
      const workflowCount = await connection.db.collection('workflows').countDocuments();
      if (workflowCount === 0) {
        await this.createDefaultWorkflows(connection);
      }

    } finally {
      await connection.close();
    }
  }

  private async createDefaultWorkflows(connection: mongoose.Connection): Promise<void> {
    const defaultWorkflows = [
      {
        id: 'threat-indicator-enrichment',
        name: 'Threat Indicator Enrichment',
        description: 'Automatically enrich threat indicators with external intelligence sources',
        definition: {
          steps: [
            { name: 'validate_indicator', type: 'validation' },
            { name: 'enrich_with_misp', type: 'enrichment' },
            { name: 'enrich_with_otx', type: 'enrichment' },
            { name: 'calculate_risk_score', type: 'scoring' },
            { name: 'update_database', type: 'persistence' }
          ],
          triggers: ['new_indicator', 'indicator_updated']
        },
        version: 1,
        is_active: true,
        created_at: new Date()
      },
      {
        id: 'evidence-processing',
        name: 'Digital Evidence Processing',
        description: 'Process and analyze digital evidence files',
        definition: {
          steps: [
            { name: 'validate_evidence', type: 'validation' },
            { name: 'calculate_hashes', type: 'forensics' },
            { name: 'extract_metadata', type: 'analysis' },
            { name: 'virus_scan', type: 'security' },
            { name: 'store_evidence', type: 'persistence' }
          ],
          triggers: ['evidence_uploaded']
        },
        version: 1,
        is_active: true,
        created_at: new Date()
      }
    ];

    await connection.db.collection('workflows').insertMany(defaultWorkflows);
    console.log(`Created ${defaultWorkflows.length} default workflows`);
  }

  private async markSetupComplete(): Promise<void> {
    // Update setup state
    await this.saveSetupState(
      ['system-check', 'database-connections', 'admin-user', 'system-config', 'integrations', 'finalization'],
      null
    );

    // Update environment (this would typically be handled by the calling code)
    // process.env.SETUP_MODE = 'false';
    // process.env.FIRST_RUN = 'false';
  }

  private async generateSetupReport(config: SetupConfiguration): Promise<string> {
    const healthCheck = await this.databaseHealthService.performHealthCheck();
    const systemCheck = await this.systemRequirementsService.performSystemCheck();
    
    let report = '# Phantom Spire CTI Platform - Setup Completion Report\n\n';
    report += `**Completion Time:** ${new Date().toISOString()}\n`;
    report += `**Setup Duration:** Complete\n`;
    report += `**Status:** ✅ SUCCESS\n\n`;
    
    report += '## System Configuration\n\n';
    report += `- **Threat Retention:** ${config.systemConfig.threatRetentionDays} days\n`;
    report += `- **Evidence Retention:** ${config.systemConfig.evidenceRetentionDays} days\n`;
    report += `- **Max Workflows:** ${config.systemConfig.maxConcurrentWorkflows}\n`;
    report += `- **Enabled Features:** ${config.systemConfig.enabledFeatures.join(', ')}\n\n`;
    
    report += '## Database Status\n\n';
    Object.entries(healthCheck.databases).forEach(([db, status]) => {
      const emoji = status.connected ? '✅' : '❌';
      report += `- **${db.toUpperCase()}:** ${emoji} ${status.message} (${status.responseTime}ms)\n`;
    });
    report += '\n';
    
    report += '## External Integrations\n\n';
    Object.entries(config.integrationConfig).forEach(([integration, config]) => {
      const enabled = config && (config as any).enabled;
      const emoji = enabled ? '✅' : '⚪';
      report += `- **${integration.toUpperCase()}:** ${emoji} ${enabled ? 'Enabled' : 'Disabled'}\n`;
    });
    report += '\n';
    
    report += '## Next Steps\n\n';
    report += '1. Access the dashboard at http://localhost:3000/dashboard\n';
    report += '2. Configure additional users and roles\n';
    report += '3. Import threat intelligence feeds\n';
    report += '4. Set up automated workflows\n';
    report += '5. Configure monitoring and alerting\n\n';
    
    report += '## Support\n\n';
    report += '- Documentation: /docs\n';
    report += '- API Documentation: /api/docs\n';
    report += '- Health Check: /health\n';
    
    return report;
  }
}