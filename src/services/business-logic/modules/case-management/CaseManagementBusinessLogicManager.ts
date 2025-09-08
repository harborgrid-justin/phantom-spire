/**
 * Case Management Business Logic Integration
 * Integrates all case management business logic services with the main platform
 */

import { caseManagementBusinessLogicServices } from './case-management/index.js';

export class CaseManagementBusinessLogicManager {
  private services: Map<string, any> = new Map();
  private initialized = false;

  /**
   * Initialize all case management business logic services
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('Case Management Business Logic already initialized');
      return;
    }

    console.log('🚀 Initializing Case Management Business Logic Services...');

    for (const serviceConfig of caseManagementBusinessLogicServices) {
      try {
        const service = new serviceConfig.service();
        await service.initialize();
        this.services.set(serviceConfig.name, service);
        console.log(`✅ Initialized: ${serviceConfig.title}`);
      } catch (error) {
        console.error(`❌ Failed to initialize ${serviceConfig.title}:`, error);
      }
    }

    this.initialized = true;
    console.log(`✅ Case Management Business Logic initialized with ${this.services.size} services`);
  }

  /**
   * Process business logic for a specific service
   */
  async processBusinessLogic(serviceName: string, data: any): Promise<any> {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service not found: ${serviceName}`);
    }

    return await service.processBusinessRules(data);
  }

  /**
   * Get all available services
   */
  getAvailableServices(): string[] {
    return Array.from(this.services.keys());
  }

  /**
   * Get service by name
   */
  getService(serviceName: string): any {
    return this.services.get(serviceName);
  }

  /**
   * Get services by category
   */
  getServicesByCategory(category: string): any[] {
    return caseManagementBusinessLogicServices
      .filter(service => service.category === category)
      .map(service => this.services.get(service.name))
      .filter(service => service !== undefined);
  }

  /**
   * Get comprehensive status of all services
   */
  getServicesStatus(): any {
    const status = {
      initialized: this.initialized,
      totalServices: caseManagementBusinessLogicServices.length,
      activeServices: this.services.size,
      categories: {
        lifecycle: this.getServicesByCategory('lifecycle').length,
        evidence: this.getServicesByCategory('evidence').length,
        workflows: this.getServicesByCategory('workflows').length,
        analytics: this.getServicesByCategory('analytics').length,
        compliance: this.getServicesByCategory('compliance').length
      },
      services: caseManagementBusinessLogicServices.map(config => ({
        name: config.name,
        title: config.title,
        category: config.category,
        active: this.services.has(config.name)
      })),
      timestamp: new Date().toISOString()
    };

    return status;
  }
}

// Singleton instance
export const caseManagementBusinessLogicManager = new CaseManagementBusinessLogicManager();