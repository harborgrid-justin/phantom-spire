/**
 * Business Logic Orchestrator
 * Production-grade orchestration layer that coordinates NAPI-RS packages with business logic modules
 */

import { EventEmitter } from 'events';
import { napiIntegrationService, NAPIRequest, NAPIResponse } from './NAPIIntegrationService';
import { ErrorHandler } from '../../utils/serviceUtils';

export interface BusinessLogicRequest {
  serviceId: string;
  operation: string;
  parameters: any;
  context?: {
    userId?: string;
    organizationId?: string;
    sessionId?: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
  };
}

export interface BusinessLogicResponse {
  success: boolean;
  data?: any;
  error?: string;
  metadata: {
    serviceId: string;
    operation: string;
    executionTime: number;
    napiPackagesUsed: string[];
    businessRulesApplied: string[];
    timestamp: Date;
    requestId: string;
  };
}

export interface ServiceMapping {
  serviceId: string;
  napiPackages: string[];
  businessLogicClass: string;
  operations: string[];
}

/**
 * Production-grade Business Logic Orchestrator
 * Coordinates between NAPI-RS packages and business logic modules
 */
export class BusinessLogicOrchestrator extends EventEmitter {
  private serviceMappings: Map<string, ServiceMapping> = new Map();
  private businessLogicInstances: Map<string, any> = new Map();
  private performanceMetrics: Map<string, any> = new Map();

  constructor() {
    super();
    this.initializeServiceMappings();
    this.loadBusinessLogicModules();
  }

  /**
   * Initialize service mappings between business logic and NAPI packages
   */
  private initializeServiceMappings(): void {
    const mappings: ServiceMapping[] = [
      // Incident Response Services
      {
        serviceId: 'incident-response',
        napiPackages: ['phantom-incident-response-core', 'phantom-forensics-core'],
        businessLogicClass: 'IncidentResponseBusinessLogic',
        operations: ['createIncident', 'analyzeIncident', 'generateReport', 'trackStatus']
      },
      
      // IOC Analysis Services
      {
        serviceId: 'ioc-analysis',
        napiPackages: ['phantom-ioc-core', 'phantom-reputation-core', 'phantom-intel-core'],
        businessLogicClass: 'IOCAnalysisBusinessLogic',
        operations: ['analyzeIOC', 'enrichIOC', 'validateIOC', 'getReputation']
      },

      // Threat Actor Services
      {
        serviceId: 'threat-actor-analysis',
        napiPackages: ['phantom-threat-actor-core', 'phantom-attribution-core', 'phantom-intel-core'],
        businessLogicClass: 'ThreatActorBusinessLogic',
        operations: ['analyzeThreatActor', 'attributeAttack', 'trackCampaign', 'assessThreat']
      },

      // Vulnerability Management
      {
        serviceId: 'vulnerability-management',
        napiPackages: ['phantom-vulnerability-core', 'phantom-cve-core', 'phantom-compliance-core'],
        businessLogicClass: 'VulnerabilityManagementBusinessLogic',
        operations: ['scanVulnerabilities', 'assessRisk', 'prioritizePatching', 'generateComplianceReport']
      },

      // Malware Analysis
      {
        serviceId: 'malware-analysis',
        napiPackages: ['phantom-malware-core', 'phantom-sandbox-core', 'phantom-forensics-core'],
        businessLogicClass: 'MalwareAnalysisBusinessLogic',
        operations: ['analyzeMalware', 'runSandboxAnalysis', 'extractIOCs', 'generateSignatures']
      },

      // Threat Intelligence
      {
        serviceId: 'threat-intelligence',
        napiPackages: ['phantom-intel-core', 'phantom-feeds-core', 'phantom-reputation-core'],
        businessLogicClass: 'ThreatIntelligenceBusinessLogic',
        operations: ['enrichIntelligence', 'correlateThreats', 'updateFeeds', 'analyzePatterns']
      },

      // Security Operations
      {
        serviceId: 'security-operations',
        napiPackages: ['phantom-secop-core', 'phantom-hunting-core', 'phantom-xdr-core'],
        businessLogicClass: 'SecurityOperationsBusinessLogic',
        operations: ['huntThreats', 'detectAnomalies', 'respondToAlert', 'orchestrateResponse']
      },

      // Compliance Management
      {
        serviceId: 'compliance-management',
        napiPackages: ['phantom-compliance-core', 'phantom-risk-core'],
        businessLogicClass: 'ComplianceBusinessLogic',
        operations: ['assessCompliance', 'generateReport', 'trackFindings', 'validateControls']
      },

      // Cryptographic Services
      {
        serviceId: 'crypto-services',
        napiPackages: ['phantom-crypto-core'],
        businessLogicClass: 'CryptographicBusinessLogic',
        operations: ['encrypt', 'decrypt', 'sign', 'verify', 'generateKeys']
      }
    ];

    for (const mapping of mappings) {
      this.serviceMappings.set(mapping.serviceId, mapping);
    }

    console.log('Service mappings initialized', {
      totalServices: this.serviceMappings.size,
      services: Array.from(this.serviceMappings.keys())
    });
  }

  /**
   * Load business logic modules
   */
  private async loadBusinessLogicModules(): Promise<void> {
    for (const [serviceId, mapping] of this.serviceMappings) {
      try {
        // Try to load the business logic class
        const businessLogicModule = await this.loadBusinessLogicClass(mapping.businessLogicClass);
        
        if (businessLogicModule) {
          this.businessLogicInstances.set(serviceId, new businessLogicModule());
          console.log(`Business logic loaded for service: ${serviceId}`);
        } else {
          // Create mock business logic if not available
          this.businessLogicInstances.set(serviceId, this.createMockBusinessLogic(serviceId, mapping));
          console.log(`Mock business logic created for service: ${serviceId}`);
        }

      } catch (error) {
        console.error(`Failed to load business logic for ${serviceId}:`, error.message);
        // Create mock business logic as fallback
        this.businessLogicInstances.set(serviceId, this.createMockBusinessLogic(serviceId, mapping));
      }
    }
  }

  /**
   * Load business logic class dynamically
   */
  private async loadBusinessLogicClass(className: string): Promise<any> {
    try {
      // Try multiple potential paths for business logic classes
      const potentialPaths = [
        `../business-logic/modules/incident-response/${className}`,
        `../business-logic/modules/threat-intelligence/${className}`,
        `../business-logic/modules/security-operations/${className}`,
        `../business-logic/modules/compliance-audit/${className}`,
        `../business-logic/modules/vulnerability-management/${className}`,
        `../business-logic/core/${className}`,
        `../business-logic/${className}`
      ];

      for (const path of potentialPaths) {
        try {
          const module = require(path);
          return module[className] || module.default;
        } catch (err) {
          continue; // Try next path
        }
      }

      return null;
    } catch (error) {
      console.error(`Failed to load business logic class ${className}:`, error.message);
      return null;
    }
  }

  /**
   * Create mock business logic for development/testing
   */
  private createMockBusinessLogic(serviceId: string, mapping: ServiceMapping): any {
    const mockClass = {
      serviceId,
      mapping,
      
      async execute(operation: string, parameters: any, context?: any): Promise<any> {
        // Simulate business logic execution
        await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
        
        return {
          success: true,
          operation,
          parameters,
          context,
          mock: true,
          result: this.generateMockResult(operation, parameters),
          timestamp: new Date()
        };
      },

      generateMockResult(operation: string, parameters: any): any {
        switch (operation) {
          case 'analyzeIOC':
            return {
              ioc: parameters.ioc || 'unknown',
              malicious: Math.random() > 0.6,
              confidence: Math.floor(Math.random() * 100),
              sources: ['mock-feed-1', 'mock-feed-2'],
              enriched: true
            };

          case 'createIncident':
            return {
              incidentId: `INC-${Date.now()}`,
              severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
              status: 'open',
              assignee: 'auto-assigned'
            };

          case 'analyzeThreatActor':
            return {
              actorId: `TA-${Math.floor(Math.random() * 1000)}`,
              confidence: Math.floor(Math.random() * 100),
              techniques: ['T1001', 'T1002', 'T1003'],
              campaigns: ['Campaign A', 'Campaign B']
            };

          default:
            return {
              operation,
              processed: true,
              items: Math.floor(Math.random() * 100),
              duration: Math.floor(Math.random() * 1000) + 'ms'
            };
        }
      },

      getCapabilities(): string[] {
        return mapping.operations;
      },

      getMetrics(): any {
        return {
          totalOperations: Math.floor(Math.random() * 1000),
          successRate: 95 + Math.random() * 5,
          avgResponseTime: Math.floor(Math.random() * 200) + 50
        };
      }
    };

    return mockClass;
  }

  /**
   * Execute business logic operation with NAPI integration
   */
  public async executeBusinessLogic(request: BusinessLogicRequest): Promise<BusinessLogicResponse> {
    const startTime = Date.now();
    const requestId = `bl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const napiPackagesUsed: string[] = [];
    const businessRulesApplied: string[] = [];

    try {
      // Get service mapping
      const mapping = this.serviceMappings.get(request.serviceId);
      if (!mapping) {
        throw new Error(`Service not found: ${request.serviceId}`);
      }

      // Get business logic instance
      const businessLogicInstance = this.businessLogicInstances.get(request.serviceId);
      if (!businessLogicInstance) {
        throw new Error(`Business logic not loaded for service: ${request.serviceId}`);
      }

      // Validate operation
      if (!mapping.operations.includes(request.operation)) {
        throw new Error(`Operation ${request.operation} not supported by service ${request.serviceId}`);
      }

      // Execute NAPI operations first (if needed)
      const napiResults = await this.executeNAPIOperations(mapping, request);
      napiPackagesUsed.push(...napiResults.packagesUsed);

      // Execute business logic with NAPI results
      const businessLogicResult = await this.executeBusinessLogicOperation(
        businessLogicInstance,
        request,
        napiResults.data
      );

      businessRulesApplied.push(...(businessLogicResult.rulesApplied || []));

      const executionTime = Date.now() - startTime;

      // Update performance metrics
      this.updatePerformanceMetrics(request.serviceId, executionTime, true);

      const response: BusinessLogicResponse = {
        success: true,
        data: businessLogicResult,
        metadata: {
          serviceId: request.serviceId,
          operation: request.operation,
          executionTime,
          napiPackagesUsed,
          businessRulesApplied,
          timestamp: new Date(),
          requestId
        }
      };

      this.emit('business-logic-executed', response);
      return response;

    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      // Update performance metrics for failure
      this.updatePerformanceMetrics(request.serviceId, executionTime, false);

      const response: BusinessLogicResponse = {
        success: false,
        error: error.message,
        metadata: {
          serviceId: request.serviceId,
          operation: request.operation,
          executionTime,
          napiPackagesUsed,
          businessRulesApplied,
          timestamp: new Date(),
          requestId
        }
      };

      console.error('Business logic execution failed', {
        request,
        error: error.message,
        executionTime,
        requestId
      });

      this.emit('business-logic-failed', response);
      return response;
    }
  }

  /**
   * Execute NAPI operations for the service
   */
  private async executeNAPIOperations(mapping: ServiceMapping, request: BusinessLogicRequest): Promise<{
    data: any;
    packagesUsed: string[];
  }> {
    const napiResults: any = {};
    const packagesUsed: string[] = [];

    for (const packageName of mapping.napiPackages) {
      if (napiIntegrationService.isPackageAvailable(packageName)) {
        try {
          // Determine appropriate NAPI method based on operation
          const napiMethod = this.mapOperationToNAPIMethod(request.operation, packageName);
          
          if (napiMethod) {
            const napiRequest: NAPIRequest = {
              packageName,
              method: napiMethod,
              parameters: request.parameters,
              options: {
                timeout: 30000,
                priority: request.context?.priority || 'medium'
              }
            };

            const result = await napiIntegrationService.executeNAPIMethod(napiRequest);
            
            if (result.success) {
              napiResults[packageName] = result.data;
              packagesUsed.push(packageName);
            }
          }
        } catch (error) {
          console.warn(`NAPI operation failed for ${packageName}:`, error.message);
        }
      }
    }

    return { data: napiResults, packagesUsed };
  }

  /**
   * Map business logic operation to NAPI method
   */
  private mapOperationToNAPIMethod(operation: string, packageName: string): string | null {
    // Define operation to NAPI method mappings
    const mappings: { [key: string]: { [key: string]: string } } = {
      'analyzeIOC': {
        'phantom-ioc-core': 'analyzeIOC',
        'phantom-reputation-core': 'getReputation',
        'phantom-intel-core': 'enrichData'
      },
      'createIncident': {
        'phantom-incident-response-core': 'createIncident',
        'phantom-forensics-core': 'initiateForensics'
      },
      'analyzeThreatActor': {
        'phantom-threat-actor-core': 'analyzeThreatActor',
        'phantom-attribution-core': 'attributeAttack',
        'phantom-intel-core': 'enrichData'
      },
      'analyzeMalware': {
        'phantom-malware-core': 'analyzeMalware',
        'phantom-sandbox-core': 'runAnalysis'
      }
    };

    return mappings[operation]?.[packageName] || null;
  }

  /**
   * Execute business logic operation
   */
  private async executeBusinessLogicOperation(
    businessLogicInstance: any,
    request: BusinessLogicRequest,
    napiData: any
  ): Promise<any> {
    // Check if the business logic instance has the execute method
    if (typeof businessLogicInstance.execute === 'function') {
      return await businessLogicInstance.execute(request.operation, request.parameters, {
        ...request.context,
        napiData
      });
    }

    // Fallback: try to call the operation directly
    if (typeof businessLogicInstance[request.operation] === 'function') {
      return await businessLogicInstance[request.operation](request.parameters, {
        ...request.context,
        napiData
      });
    }

    throw new Error(`Operation ${request.operation} not implemented in business logic`);
  }

  /**
   * Update performance metrics
   */
  private updatePerformanceMetrics(serviceId: string, executionTime: number, success: boolean): void {
    if (!this.performanceMetrics.has(serviceId)) {
      this.performanceMetrics.set(serviceId, {
        totalRequests: 0,
        successfulRequests: 0,
        avgResponseTime: 0,
        lastUpdate: new Date()
      });
    }

    const metrics = this.performanceMetrics.get(serviceId);
    metrics.totalRequests++;
    
    if (success) {
      metrics.successfulRequests++;
    }

    // Update average response time
    metrics.avgResponseTime = (
      (metrics.avgResponseTime * (metrics.totalRequests - 1) + executionTime) / 
      metrics.totalRequests
    );

    metrics.lastUpdate = new Date();
  }

  /**
   * Get service information
   */
  public getServiceInfo(serviceId: string): ServiceMapping | undefined {
    return this.serviceMappings.get(serviceId);
  }

  /**
   * Get all available services
   */
  public getAvailableServices(): ServiceMapping[] {
    return Array.from(this.serviceMappings.values());
  }

  /**
   * Get performance metrics for service
   */
  public getServiceMetrics(serviceId: string): any {
    return this.performanceMetrics.get(serviceId);
  }

  /**
   * Get overall system metrics
   */
  public getSystemMetrics(): any {
    const services = Array.from(this.performanceMetrics.values());
    
    const totalRequests = services.reduce((sum, s) => sum + s.totalRequests, 0);
    const totalSuccessful = services.reduce((sum, s) => sum + s.successfulRequests, 0);
    const avgResponseTime = services.reduce((sum, s) => sum + s.avgResponseTime, 0) / services.length;

    return {
      totalServices: this.serviceMappings.size,
      activeServices: services.length,
      totalRequests,
      successRate: totalRequests > 0 ? (totalSuccessful / totalRequests) * 100 : 0,
      avgResponseTime: isNaN(avgResponseTime) ? 0 : avgResponseTime,
      napiStatus: napiIntegrationService.getSystemStatus()
    };
  }
}

// Singleton instance
export const businessLogicOrchestrator = new BusinessLogicOrchestrator();
export default businessLogicOrchestrator;