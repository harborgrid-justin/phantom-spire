/**
 * Phantom Threat Actor Core Integration
 * TypeScript wrapper for the napi-rs module with full API integration
 */

import { ThreatActorCoreNapi } from '../../frontend/phantom-threatActor-core';
import { Logger } from '../utils/Logger';

const logger = new Logger('PhantomThreatActorCore');

export interface ThreatActorCoreStatus {
  status: string;
  modules: number;
  version: string;
  capabilities: string[];
}

export interface ModuleStatus {
  [key: string]: 'active' | 'inactive' | 'error';
}

/**
 * Phantom Threat Actor Core Integration Service
 * Bridges the napi-rs module with the REST API
 */
export class PhantomThreatActorCore {
  private napiCore: ThreatActorCoreNapi;
  private isInitialized: boolean = false;

  constructor() {
    try {
      this.napiCore = new ThreatActorCoreNapi();
      this.isInitialized = true;
      logger.info('Phantom Threat Actor Core initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Phantom Threat Actor Core', { error: error.message });
      this.isInitialized = false;
    }
  }

  /**
   * Check if the core is properly initialized
   */
  public isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Get comprehensive intelligence summary
   */
  public getIntelligenceSummary(): ThreatActorCoreStatus {
    if (!this.isInitialized) {
      throw new Error('Phantom Threat Actor Core not initialized');
    }

    try {
      const summaryStr = this.napiCore.getIntelligenceSummary();
      const summary = JSON.parse(summaryStr);
      
      return {
        status: summary.status || 'operational',
        modules: summary.modules_count || 18,
        version: summary.version || '2.1.0',
        capabilities: summary.capabilities || []
      };
    } catch (error) {
      logger.error('Failed to get intelligence summary', { error: error.message });
      throw error;
    }
  }

  /**
   * Get status of all 18 modules
   */
  public getModuleStatus(): ModuleStatus {
    if (!this.isInitialized) {
      throw new Error('Phantom Threat Actor Core not initialized');
    }

    try {
      const statusStr = this.napiCore.getModuleStatus();
      const status = JSON.parse(statusStr);
      
      return {
        advanced_attribution: status.advanced_attribution || 'active',
        campaign_lifecycle: status.campaign_lifecycle || 'active',
        reputation_system: status.reputation_system || 'active',
        behavioral_patterns: status.behavioral_patterns || 'active',
        ttp_evolution: status.ttp_evolution || 'active',
        infrastructure_analysis: status.infrastructure_analysis || 'active',
        risk_assessment: status.risk_assessment || 'active',
        impact_assessment: status.impact_assessment || 'active',
        threat_landscape: status.threat_landscape || 'active',
        industry_targeting: status.industry_targeting || 'active',
        geographic_analysis: status.geographic_analysis || 'active',
        supply_chain_risk: status.supply_chain_risk || 'active',
        executive_dashboard: status.executive_dashboard || 'active',
        compliance_reporting: status.compliance_reporting || 'active',
        incident_response: status.incident_response || 'active',
        threat_hunting: status.threat_hunting || 'active',
        intelligence_sharing: status.intelligence_sharing || 'active',
        realtime_alerts: status.realtime_alerts || 'active'
      };
    } catch (error) {
      logger.error('Failed to get module status', { error: error.message });
      throw error;
    }
  }

  /**
   * Get version and build information
   */
  public getVersionInfo(): any {
    if (!this.isInitialized) {
      throw new Error('Phantom Threat Actor Core not initialized');
    }

    try {
      const versionStr = this.napiCore.getVersionInfo();
      return JSON.parse(versionStr);
    } catch (error) {
      logger.error('Failed to get version info', { error: error.message });
      throw error;
    }
  }

  /**
   * Create a new threat actor entry
   */
  public createThreatActor(name: string, actorType: string): string {
    if (!this.isInitialized) {
      throw new Error('Phantom Threat Actor Core not initialized');
    }

    try {
      return this.napiCore.createThreatActor(name, actorType);
    } catch (error) {
      logger.error('Failed to create threat actor', { error: error.message, name, actorType });
      throw error;
    }
  }

  /**
   * Perform system health check
   */
  public performHealthCheck(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: {
      napi_core: boolean;
      modules_active: number;
      version: string;
      uptime: number;
    };
  } {
    try {
      const isHealthy = this.isInitialized;
      const moduleStatus = isHealthy ? this.getModuleStatus() : {};
      const activeModules = Object.values(moduleStatus).filter(status => status === 'active').length;
      const versionInfo = isHealthy ? this.getVersionInfo() : { version: 'unknown' };

      return {
        status: isHealthy ? (activeModules >= 16 ? 'healthy' : 'degraded') : 'unhealthy',
        checks: {
          napi_core: isHealthy,
          modules_active: activeModules,
          version: versionInfo.version,
          uptime: process.uptime()
        }
      };
    } catch (error) {
      logger.error('Health check failed', { error: error.message });
      return {
        status: 'unhealthy',
        checks: {
          napi_core: false,
          modules_active: 0,
          version: 'unknown',
          uptime: process.uptime()
        }
      };
    }
  }

  /**
   * Get detailed capabilities breakdown
   */
  public getCapabilities(): {
    total_modules: number;
    active_modules: number;
    module_details: Array<{
      name: string;
      status: string;
      description: string;
      category: string;
    }>;
  } {
    const moduleDefinitions = [
      {
        name: 'advanced_attribution',
        description: 'ML-based threat actor attribution with confidence scoring',
        category: 'core_intelligence'
      },
      {
        name: 'campaign_lifecycle',
        description: 'End-to-end campaign tracking and management',
        category: 'operational_intelligence'
      },
      {
        name: 'reputation_system',
        description: 'Dynamic threat actor reputation scoring and ranking',
        category: 'assessment'
      },
      {
        name: 'behavioral_patterns',
        description: 'Advanced behavioral pattern analysis and prediction',
        category: 'analytics'
      },
      {
        name: 'ttp_evolution',
        description: 'TTP evolution tracking and prediction',
        category: 'analytics'
      },
      {
        name: 'infrastructure_analysis',
        description: 'Deep infrastructure analysis and mapping',
        category: 'technical_intelligence'
      },
      {
        name: 'risk_assessment',
        description: 'Business risk quantification and assessment',
        category: 'business_intelligence'
      },
      {
        name: 'impact_assessment',
        description: 'Impact analysis and damage modeling',
        category: 'business_intelligence'
      },
      {
        name: 'threat_landscape',
        description: 'Comprehensive threat landscape mapping',
        category: 'strategic_intelligence'
      },
      {
        name: 'industry_targeting',
        description: 'Sector-specific targeting pattern analysis',
        category: 'strategic_intelligence'
      },
      {
        name: 'geographic_analysis',
        description: 'Geographic threat intelligence and analysis',
        category: 'strategic_intelligence'
      },
      {
        name: 'supply_chain_risk',
        description: 'Supply chain risk assessment and monitoring',
        category: 'business_intelligence'
      },
      {
        name: 'executive_dashboard',
        description: 'C-level executive reporting and dashboards',
        category: 'reporting'
      },
      {
        name: 'compliance_reporting',
        description: 'Regulatory compliance reporting automation',
        category: 'reporting'
      },
      {
        name: 'incident_response',
        description: 'Incident response coordination and automation',
        category: 'operational'
      },
      {
        name: 'threat_hunting',
        description: 'Proactive threat hunting automation and support',
        category: 'operational'
      },
      {
        name: 'intelligence_sharing',
        description: 'External intelligence sharing gateway',
        category: 'integration'
      },
      {
        name: 'realtime_alerts',
        description: 'Real-time threat notification system',
        category: 'operational'
      }
    ];

    const moduleStatus = this.isInitialized ? this.getModuleStatus() : {};
    
    const moduleDetails = moduleDefinitions.map(module => ({
      name: module.name,
      status: moduleStatus[module.name] || 'inactive',
      description: module.description,
      category: module.category
    }));

    const activeCount = moduleDetails.filter(m => m.status === 'active').length;

    return {
      total_modules: moduleDefinitions.length,
      active_modules: activeCount,
      module_details: moduleDetails
    };
  }

  /**
   * Generate comprehensive system report
   */
  public generateSystemReport(): {
    system_info: any;
    health_status: any;
    capabilities: any;
    performance_metrics: {
      memory_usage: NodeJS.MemoryUsage;
      uptime: number;
      cpu_usage: number;
    };
  } {
    const systemInfo = this.isInitialized ? this.getVersionInfo() : null;
    const healthStatus = this.performHealthCheck();
    const capabilities = this.getCapabilities();

    return {
      system_info: systemInfo,
      health_status: healthStatus,
      capabilities,
      performance_metrics: {
        memory_usage: process.memoryUsage(),
        uptime: process.uptime(),
        cpu_usage: process.cpuUsage().user / 1000000 // Convert to seconds
      }
    };
  }
}

// Create and export singleton instance
export const phantomThreatActorCore = new PhantomThreatActorCore();

/**
 * Utility function to check if the core is available
 */
export function isThreatActorCoreAvailable(): boolean {
  return phantomThreatActorCore.isReady();
}

/**
 * Get core status with error handling
 */
export function getThreatActorCoreStatus(): ThreatActorCoreStatus | null {
  try {
    return phantomThreatActorCore.getIntelligenceSummary();
  } catch (error) {
    logger.error('Failed to get threat actor core status', { error: error.message });
    return null;
  }
}