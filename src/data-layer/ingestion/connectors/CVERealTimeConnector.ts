/**
 * CVE Real-Time Data Connector
 * Enterprise-grade connector for real-time CVE data ingestion from multiple sources
 */

import { EventEmitter } from 'events';
import { logger } from '../../../utils/logger.js';
import { IDataConnector, IDataPipeline } from '../../interfaces/IDataConnector.js';
import { CVE } from '../../../types/cve.js';
import axios, { AxiosInstance } from 'axios';

export interface ICVERealTimeConfig {
  // Source Configuration
  nvdApiUrl: string;
  nvdApiKey?: string;
  mitreApiUrl: string;
  cisaKevUrl: string;
  
  // Real-time Settings
  pollingIntervalMs: number;
  enableWebHooks: boolean;
  webhookEndpoint?: string;
  
  // Performance & Reliability
  maxRetries: number;
  retryBackoffMs: number;
  connectionTimeoutMs: number;
  enableRateLimiting: boolean;
  requestsPerMinute: number;
  
  // Data Processing
  enableFiltering: boolean;
  severityFilter?: ('critical' | 'high' | 'medium' | 'low')[];
  dateFilter?: {
    startDate?: string;
    endDate?: string;
  };
  
  // Caching
  enableCaching: boolean;
  cacheTtlSeconds: number;
}

export interface ICVEFeedData {
  source: 'nvd' | 'mitre' | 'cisa-kev';
  cve: CVE;
  timestamp: Date;
  metadata: {
    feedVersion?: string;
    lastModified?: Date;
    syncId?: string;
  };
}

export class CVERealTimeConnector extends EventEmitter implements IDataConnector {
  public readonly id: string;
  public readonly name: string;
  public readonly type = 'cve-realtime';
  
  private config: ICVERealTimeConfig;
  private httpClient: AxiosInstance;
  private isConnected = false;
  private pollingInterval?: NodeJS.Timeout;
  private lastSyncTimestamp: Map<string, Date> = new Map();
  private rateLimitTokens: number;
  private rateLimitLastRefill: Date;

  constructor(config: ICVERealTimeConfig) {
    super();
    this.id = 'cve-realtime-connector';
    this.name = 'CVE Real-Time Connector';
    this.config = config;
    
    // Initialize HTTP client with timeout and retry logic
    this.httpClient = axios.create({
      timeout: config.connectionTimeoutMs,
      headers: {
        'User-Agent': 'phantom-spire-cve-connector/1.0.0',
        'Accept': 'application/json',
        ...(config.nvdApiKey && { 'Authorization': `Bearer ${config.nvdApiKey}` })
      }
    });
    
    // Initialize rate limiting
    this.rateLimitTokens = config.requestsPerMinute;
    this.rateLimitLastRefill = new Date();
    
    this.setupHttpInterceptors();
    
    logger.info('CVE Real-Time Connector initialized', {
      pollingInterval: config.pollingIntervalMs,
      enableWebHooks: config.enableWebHooks,
      enableFiltering: config.enableFiltering,
    });
  }

  /**
   * Connect to CVE data sources
   */
  public async connect(): Promise<void> {
    try {
      if (this.isConnected) {
        logger.warn('CVE connector already connected');
        return;
      }

      // Test connectivity to all sources
      await this.testConnectivity();
      
      // Start polling for updates
      if (this.config.pollingIntervalMs > 0) {
        this.startPolling();
      }
      
      // Setup webhook listener if enabled
      if (this.config.enableWebHooks && this.config.webhookEndpoint) {
        await this.setupWebhooks();
      }
      
      this.isConnected = true;
      this.emit('connected');
      
      logger.info('CVE Real-Time Connector connected successfully');
    } catch (error) {
      const errorMessage = `Failed to connect CVE Real-Time Connector: ${error instanceof Error ? error.message : 'Unknown error'}`;
      logger.error(errorMessage, error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Disconnect from CVE data sources
   */
  public async disconnect(): Promise<void> {
    try {
      if (!this.isConnected) {
        logger.warn('CVE connector not connected');
        return;
      }

      // Stop polling
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
        this.pollingInterval = undefined;
      }
      
      this.isConnected = false;
      this.emit('disconnected');
      
      logger.info('CVE Real-Time Connector disconnected successfully');
    } catch (error) {
      const errorMessage = `Error during CVE connector disconnect: ${error instanceof Error ? error.message : 'Unknown error'}`;
      logger.error(errorMessage, error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Health check for all CVE data sources
   */
  public async healthCheck(): Promise<{ isHealthy: boolean; responseTime?: number; details: any }> {
    const startTime = Date.now();
    const healthDetails: any = {};

    try {
      // Check NVD API
      try {
        const nvdResponse = await this.httpClient.get(`${this.config.nvdApiUrl}/rest/json/cves/2.0`, {
          params: { resultsPerPage: 1 },
          timeout: 5000
        });
        healthDetails.nvd = { 
          status: 'healthy', 
          responseTime: Date.now() - startTime,
          statusCode: nvdResponse.status 
        };
      } catch (error) {
        healthDetails.nvd = { 
          status: 'unhealthy', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        };
      }

      // Check MITRE API
      try {
        const mitreResponse = await this.httpClient.get(`${this.config.mitreApiUrl}/api/cve/`, {
          timeout: 5000
        });
        healthDetails.mitre = { 
          status: 'healthy', 
          responseTime: Date.now() - startTime,
          statusCode: mitreResponse.status 
        };
      } catch (error) {
        healthDetails.mitre = { 
          status: 'unhealthy', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        };
      }

      // Check CISA KEV
      try {
        const cisaResponse = await this.httpClient.get(this.config.cisaKevUrl, {
          timeout: 5000
        });
        healthDetails.cisa = { 
          status: 'healthy', 
          responseTime: Date.now() - startTime,
          statusCode: cisaResponse.status 
        };
      } catch (error) {
        healthDetails.cisa = { 
          status: 'unhealthy', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        };
      }

      const isHealthy = Object.values(healthDetails).some((source: any) => source.status === 'healthy');
      const totalResponseTime = Date.now() - startTime;

      return {
        isHealthy,
        responseTime: totalResponseTime,
        details: healthDetails
      };

    } catch (error) {
      return {
        isHealthy: false,
        responseTime: Date.now() - startTime,
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          ...healthDetails
        }
      };
    }
  }

  /**
   * Execute data pipeline for CVE ingestion
   */
  public async executePipeline(pipeline: IDataPipeline): Promise<any> {
    try {
      logger.info('Executing CVE data pipeline', { 
        pipelineName: pipeline.name,
        pipelineId: pipeline.id 
      });

      const results: ICVEFeedData[] = [];
      
      // Fetch from NVD if enabled
      if (this.shouldFetchFromSource('nvd')) {
        const nvdData = await this.fetchNVDData();
        results.push(...nvdData);
      }
      
      // Fetch from MITRE if enabled  
      if (this.shouldFetchFromSource('mitre')) {
        const mitreData = await this.fetchMITREData();
        results.push(...mitreData);
      }
      
      // Fetch from CISA KEV if enabled
      if (this.shouldFetchFromSource('cisa')) {
        const cisaData = await this.fetchCISAData();
        results.push(...cisaData);
      }

      // Apply filtering if enabled
      const filteredResults = this.config.enableFiltering ? 
        this.applyFilters(results) : results;

      // Emit data events for real-time processing
      filteredResults.forEach(cveData => {
        this.emit('data', cveData);
      });

      logger.info('CVE pipeline execution completed', {
        totalRecords: filteredResults.length,
        nvdRecords: results.filter(r => r.source === 'nvd').length,
        mitreRecords: results.filter(r => r.source === 'mitre').length,
        cisaRecords: results.filter(r => r.source === 'cisa-kev').length,
      });

      return {
        success: true,
        recordsProcessed: filteredResults.length,
        results: filteredResults,
        timestamp: new Date(),
      };

    } catch (error) {
      const errorMessage = `CVE pipeline execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      logger.error(errorMessage, error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Private helper methods
   */

  private setupHttpInterceptors(): void {
    // Add request interceptor for rate limiting
    this.httpClient.interceptors.request.use(async (config) => {
      if (this.config.enableRateLimiting) {
        await this.waitForRateLimit();
      }
      return config;
    });

    // Add response interceptor for error handling and retries
    this.httpClient.interceptors.response.use(
      response => response,
      async error => {
        if (error.response?.status === 429) {
          logger.warn('Rate limit exceeded, waiting before retry');
          await this.sleep(this.config.retryBackoffMs);
        }
        return Promise.reject(error);
      }
    );
  }

  private async testConnectivity(): Promise<void> {
    const healthCheck = await this.healthCheck();
    if (!healthCheck.isHealthy) {
      throw new Error(`Connectivity test failed: ${JSON.stringify(healthCheck.details)}`);
    }
  }

  private startPolling(): void {
    this.pollingInterval = setInterval(async () => {
      try {
        await this.pollForUpdates();
      } catch (error) {
        logger.error('Error during CVE polling', error);
        this.emit('error', error);
      }
    }, this.config.pollingIntervalMs);
    
    logger.info('CVE polling started', { intervalMs: this.config.pollingIntervalMs });
  }

  private async pollForUpdates(): Promise<void> {
    logger.debug('Polling for CVE updates');
    
    // This will trigger the pipeline execution
    if (this.listeners('poll').length > 0) {
      this.emit('poll');
    }
  }

  private async setupWebhooks(): Promise<void> {
    // This would typically involve registering webhook endpoints with the CVE sources
    logger.info('Setting up CVE webhooks', { endpoint: this.config.webhookEndpoint });
    // Implementation would depend on the specific webhook APIs available
  }

  private shouldFetchFromSource(source: string): boolean {
    // Add logic to determine if we should fetch from a specific source
    // Could be based on configuration, last sync times, etc.
    return true;
  }

  private async fetchNVDData(): Promise<ICVEFeedData[]> {
    try {
      const response = await this.httpClient.get(`${this.config.nvdApiUrl}/rest/json/cves/2.0`, {
        params: {
          resultsPerPage: 100,
          ...(this.config.dateFilter?.startDate && { 
            modStartDate: this.config.dateFilter.startDate 
          })
        }
      });

      const cves = response.data.vulnerabilities || [];
      return cves.map((vuln: any) => this.transformNVDtoCVE(vuln));
    } catch (error) {
      logger.error('Failed to fetch NVD data', error);
      throw error;
    }
  }

  private async fetchMITREData(): Promise<ICVEFeedData[]> {
    try {
      const response = await this.httpClient.get(`${this.config.mitreApiUrl}/api/cve/`);
      const cves = response.data || [];
      return cves.map((cve: any) => this.transformMITREtoCVE(cve));
    } catch (error) {
      logger.error('Failed to fetch MITRE data', error);
      throw error;
    }
  }

  private async fetchCISAData(): Promise<ICVEFeedData[]> {
    try {
      const response = await this.httpClient.get(this.config.cisaKevUrl);
      const vulnerabilities = response.data.vulnerabilities || [];
      return vulnerabilities.map((vuln: any) => this.transformCISAtoCVE(vuln));
    } catch (error) {
      logger.error('Failed to fetch CISA KEV data', error);
      throw error;
    }
  }

  private transformNVDtoCVE(nvdData: any): ICVEFeedData {
    const cve = nvdData.cve;
    
    return {
      source: 'nvd',
      timestamp: new Date(),
      metadata: {
        lastModified: new Date(cve.lastModified || Date.now()),
        syncId: `nvd_${Date.now()}`,
      },
      cve: {
        // Map NVD data to CVE interface
        id: cve.id,
        cveId: cve.id,
        title: cve.descriptions?.[0]?.value || 'No title available',
        description: cve.descriptions?.[0]?.value || 'No description available',
        publishedDate: cve.published || new Date().toISOString(),
        lastModifiedDate: cve.lastModified || new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        
        // Scoring information
        scoring: {
          cvssV3Score: cve.metrics?.cvssMetricV31?.[0]?.cvssData?.baseScore,
          cvssV3Vector: cve.metrics?.cvssMetricV31?.[0]?.cvssData?.vectorString,
          severity: this.mapCVSStoSeverity(cve.metrics?.cvssMetricV31?.[0]?.cvssData?.baseScore),
        },
        
        // Initialize other required fields with defaults
        affectedProducts: [],
        references: cve.references?.map((ref: any) => ({
          url: ref.url,
          source: ref.source,
          type: 'analysis' as const,
          tags: ref.tags || [],
        })) || [],
        weaknesses: cve.weaknesses?.map((weakness: any) => ({
          cweId: weakness.description?.[0]?.value || 'Unknown',
          description: weakness.description?.[0]?.value || 'Unknown weakness',
        })) || [],
        
        exploitInfo: {
          exploitAvailable: false,
          exploitabilityLevel: 'none' as const,
          exploitInWild: false,
          publicExploits: 0,
          exploitSources: [],
        },
        
        patchInfo: {
          patchAvailable: false,
          patchComplexity: 'medium' as const,
          patchSources: [],
        },
        
        mitigations: [],
        assetImpacts: [],
        
        threatIntelligence: {
          threatActors: [],
          campaigns: [],
          malwareFamilies: [],
          attackPatterns: [],
          indicators: [],
        },
        
        compliance: {
          frameworks: [],
          requirements: [],
          regulatoryImpact: 'none' as const,
        },
        
        riskAssessment: {
          riskScore: 0,
          businessRisk: 'low' as const,
          technicalRisk: 'low' as const,
          reputationalRisk: 'low' as const,
          financialImpact: 0,
          likelihood: 0,
          riskFactors: [],
          riskJustification: 'Automated assessment needed',
        },
        
        workflow: {
          status: 'new' as const,
          priority: 'p3' as const,
          workflowSteps: [],
          sla: {
            responseTime: '24h',
            resolutionTime: '30d',
          },
        },
        
        source: 'NVD',
        tags: [],
        organizationId: 'default',
        createdBy: 'system',
        updatedBy: 'system',
      },
    };
  }

  private transformMITREtoCVE(mitreData: any): ICVEFeedData {
    // Similar transformation logic for MITRE data
    return {
      source: 'mitre',
      timestamp: new Date(),
      metadata: {
        syncId: `mitre_${Date.now()}`,
      },
      cve: {
        // Implement MITRE-specific transformation
        id: mitreData.CVE_data_meta?.ID || `mitre_${Date.now()}`,
        cveId: mitreData.CVE_data_meta?.ID || 'Unknown',
        title: mitreData.description?.description_data?.[0]?.value || 'No title',
        description: mitreData.description?.description_data?.[0]?.value || 'No description',
        publishedDate: new Date().toISOString(),
        lastModifiedDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        
        scoring: {
          severity: 'medium' as const,
        },
        
        // Initialize other required fields with defaults
        affectedProducts: [],
        references: [],
        weaknesses: [],
        exploitInfo: {
          exploitAvailable: false,
          exploitabilityLevel: 'none' as const,
          exploitInWild: false,
          publicExploits: 0,
          exploitSources: [],
        },
        patchInfo: {
          patchAvailable: false,
          patchComplexity: 'medium' as const,
          patchSources: [],
        },
        mitigations: [],
        assetImpacts: [],
        threatIntelligence: {
          threatActors: [],
          campaigns: [],
          malwareFamilies: [],
          attackPatterns: [],
          indicators: [],
        },
        compliance: {
          frameworks: [],
          requirements: [],
          regulatoryImpact: 'none' as const,
        },
        riskAssessment: {
          riskScore: 0,
          businessRisk: 'low' as const,
          technicalRisk: 'low' as const,
          reputationalRisk: 'low' as const,
          financialImpact: 0,
          likelihood: 0,
          riskFactors: [],
          riskJustification: 'Automated assessment needed',
        },
        workflow: {
          status: 'new' as const,
          priority: 'p3' as const,
          workflowSteps: [],
          sla: {
            responseTime: '24h',
            resolutionTime: '30d',
          },
        },
        source: 'MITRE',
        tags: [],
        organizationId: 'default',
        createdBy: 'system',
        updatedBy: 'system',
      },
    };
  }

  private transformCISAtoCVE(cisaData: any): ICVEFeedData {
    // Similar transformation logic for CISA KEV data
    return {
      source: 'cisa-kev',
      timestamp: new Date(),
      metadata: {
        syncId: `cisa_${Date.now()}`,
      },
      cve: {
        id: cisaData.cveID || `cisa_${Date.now()}`,
        cveId: cisaData.cveID || 'Unknown',
        title: cisaData.shortDescription || 'No title',
        description: cisaData.vulnerabilityName || 'No description',
        publishedDate: cisaData.dateAdded || new Date().toISOString(),
        lastModifiedDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        
        scoring: {
          severity: 'high' as const, // CISA KEV items are typically high priority
        },
        
        // Initialize required fields
        affectedProducts: [{
          vendor: cisaData.vendorProject || 'Unknown',
          product: cisaData.product || 'Unknown',
          versions: ['All'],
        }],
        references: [],
        weaknesses: [],
        exploitInfo: {
          exploitAvailable: true, // CISA KEV implies known exploitation
          exploitabilityLevel: 'functional' as const,
          exploitInWild: true,
          publicExploits: 1,
          exploitSources: ['CISA KEV'],
        },
        patchInfo: {
          patchAvailable: !!cisaData.dueDate,
          patchComplexity: 'medium' as const,
          patchSources: [],
        },
        mitigations: [{
          type: 'patch' as const,
          description: cisaData.requiredAction || 'Apply security update',
          effectiveness: 90,
          implementationCost: 'medium' as const,
        }],
        assetImpacts: [],
        threatIntelligence: {
          threatActors: [],
          campaigns: [],
          malwareFamilies: [],
          attackPatterns: [],
          indicators: [],
        },
        compliance: {
          frameworks: ['CISA'],
          requirements: [{
            framework: 'CISA',
            requirement: 'KEV Remediation',
            status: 'non-compliant' as const,
          }],
          regulatoryImpact: 'high' as const,
        },
        riskAssessment: {
          riskScore: 85,
          businessRisk: 'high' as const,
          technicalRisk: 'high' as const,
          reputationalRisk: 'high' as const,
          financialImpact: 100000,
          likelihood: 90,
          riskFactors: ['Known exploitation', 'Government mandate'],
          riskJustification: 'Listed in CISA Known Exploited Vulnerabilities catalog',
        },
        workflow: {
          status: 'new' as const,
          priority: 'p1' as const,
          workflowSteps: [],
          sla: {
            responseTime: '4h',
            resolutionTime: cisaData.dueDate || '30d',
          },
        },
        source: 'CISA-KEV',
        tags: ['kev', 'exploited'],
        organizationId: 'default',
        createdBy: 'system',
        updatedBy: 'system',
      },
    };
  }

  private applyFilters(data: ICVEFeedData[]): ICVEFeedData[] {
    let filtered = data;

    // Apply severity filter
    if (this.config.severityFilter && this.config.severityFilter.length > 0) {
      filtered = filtered.filter(item => 
        this.config.severityFilter!.includes(item.cve.scoring.severity)
      );
    }

    // Apply date filter
    if (this.config.dateFilter) {
      const { startDate, endDate } = this.config.dateFilter;
      
      if (startDate) {
        const start = new Date(startDate);
        filtered = filtered.filter(item => 
          new Date(item.cve.publishedDate) >= start
        );
      }
      
      if (endDate) {
        const end = new Date(endDate);
        filtered = filtered.filter(item => 
          new Date(item.cve.publishedDate) <= end
        );
      }
    }

    return filtered;
  }

  private mapCVSStoSeverity(score?: number): 'critical' | 'high' | 'medium' | 'low' | 'info' {
    if (!score) return 'info';
    if (score >= 9.0) return 'critical';
    if (score >= 7.0) return 'high';
    if (score >= 4.0) return 'medium';
    return 'low';
  }

  private async waitForRateLimit(): Promise<void> {
    const now = new Date();
    const timeSinceLastRefill = now.getTime() - this.rateLimitLastRefill.getTime();
    
    // Refill tokens based on time passed
    if (timeSinceLastRefill >= 60000) { // 1 minute
      this.rateLimitTokens = this.config.requestsPerMinute;
      this.rateLimitLastRefill = now;
    }
    
    // Wait if no tokens available
    if (this.rateLimitTokens <= 0) {
      const waitTime = 60000 - timeSinceLastRefill;
      await this.sleep(waitTime);
      this.rateLimitTokens = this.config.requestsPerMinute;
      this.rateLimitLastRefill = new Date();
    }
    
    this.rateLimitTokens--;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}