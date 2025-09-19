/**
 * Business Logic Base Class
 * Abstract base class for all business logic services following enterprise patterns
 * Extends BaseService with business-specific functionality
 */

import { BaseService } from './BaseService';
import {
  BusinessLogicRequest,
  BusinessLogicResponse,
  BusinessRule,
  ValidationResult,
  ProcessResult,
  RuleEnforcementResult,
  InsightResult,
  MetricResult,
  TrendPrediction,
  IntegrationResult,
  FeatureEngineeringResult,
  FeatureSelectionResult,
  EngineeredFeature
} from '../types/business-logic.types';
import { ServiceDefinition, ServiceContext } from '../types/service.types';

export abstract class BusinessLogicBase extends BaseService {
  protected businessRules: Map<string, BusinessRule> = new Map();
  protected validationCache: Map<string, ValidationResult> = new Map();
  protected readonly category: string;

  constructor(
    definition: ServiceDefinition,
    category: string
  ) {
    super(definition);
    this.category = category;
    
    // Set up business logic specific health checks
    this.setupBusinessLogicHealthChecks();
  }

  /**
   * Core Business Logic Interface
   * These methods define the contract that all business logic services must implement
   */
  
  // Data Operations
  abstract validateData(data: unknown, context?: ServiceContext): Promise<ValidationResult>;
  abstract processCreation(data: unknown, context: ServiceContext): Promise<ProcessResult>;
  abstract processUpdate(id: string, data: unknown, context: ServiceContext): Promise<ProcessResult>;
  abstract processDeletion(id: string, context: ServiceContext): Promise<ProcessResult>;
  
  // Business Rules
  abstract enforceBusinessRules(data: unknown, context?: ServiceContext): Promise<RuleEnforcementResult>;
  abstract validatePermissions(userId: string, operation: string, resource?: string): Promise<boolean>;
  abstract auditOperation(operation: string, data: unknown, userId: string): Promise<void>;
  
  // Analytics & Insights
  abstract generateInsights(timeframe?: string, filters?: Record<string, unknown>): Promise<InsightResult>;
  abstract calculateMetrics(filters?: Record<string, unknown>): Promise<MetricResult>;
  abstract predictTrends(data: unknown[]): Promise<TrendPrediction>;
  abstract performFeatureEngineering(data: unknown[], context?: ServiceContext): Promise<FeatureEngineeringResult>;
  abstract performFeatureSelection(features: EngineeredFeature[], context?: ServiceContext): Promise<FeatureSelectionResult>;
  
  // Integration & Workflow
  abstract triggerWorkflows(eventType: string, data: unknown): Promise<void>;
  abstract integrateWithExternalSystems(data: unknown): Promise<IntegrationResult>;
  abstract notifyStakeholders(event: string, data: unknown): Promise<void>;

  /**
   * Generic request processing with full context and error handling
   */
  async processBusinessLogicRequest(
    request: BusinessLogicRequest,
    context: ServiceContext
  ): Promise<BusinessLogicResponse> {
    return this.executeWithContext(context, 'processBusinessLogicRequest', async () => {
      const startTime = new Date();
      
      try {
        // Validate request
        const validation = await this.validateRequest(request, context);
        if (!validation.isValid) {
          return this.createErrorResponse(request, 'VALIDATION_FAILED', validation.errors.map(e => e.message).join(', '));
        }

        // Check permissions
        if (context.userId) {
          const hasPermission = await this.validatePermissions(
            context.userId, 
            request.type, 
            request.id
          );
          if (!hasPermission) {
            return this.createErrorResponse(request, 'PERMISSION_DENIED', 'Insufficient permissions');
          }
        }

        // Enforce business rules
        const ruleCheck = await this.enforceBusinessRules(request.data, context);
        if (!ruleCheck.passed) {
          const criticalViolations = ruleCheck.violations.filter(v => v.severity === 'critical');
          if (criticalViolations.length > 0) {
            return this.createErrorResponse(
              request, 
              'BUSINESS_RULE_VIOLATION', 
              criticalViolations.map(v => v.message).join(', ')
            );
          }
        }

        // Process the actual business logic
        const result = await this.processBusinessLogic(request, context);

        // Audit the operation
        if (context.userId) {
          await this.auditOperation(request.type, request.data, context.userId);
        }

        // Trigger any necessary workflows
        await this.triggerWorkflows(`${request.type}_completed`, result);

        return this.createSuccessResponse(request, result, startTime);

      } catch (error) {
        return this.createErrorResponse(
          request, 
          'PROCESSING_ERROR', 
          (error as Error).message,
          startTime
        );
      }
    });
  }

  /**
   * Business Rule Management
   */
  protected addBusinessRule(rule: BusinessRule): void {
    this.businessRules.set(rule.id, rule);
    this.emit('business-rule:added', { serviceId: this.id, ruleId: rule.id });
  }

  protected removeBusinessRule(ruleId: string): void {
    this.businessRules.delete(ruleId);
    this.emit('business-rule:removed', { serviceId: this.id, ruleId });
  }

  protected getBusinessRule(ruleId: string): BusinessRule | undefined {
    return this.businessRules.get(ruleId);
  }

  protected getAllBusinessRules(): BusinessRule[] {
    return Array.from(this.businessRules.values())
      .filter(rule => rule.enabled)
      .sort((a, b) => a.priority - b.priority);
  }

  /**
   * Validation Caching
   */
  protected getCachedValidation(key: string): ValidationResult | undefined {
    return this.validationCache.get(key);
  }

  protected setCachedValidation(key: string, result: ValidationResult): void {
    this.validationCache.set(key, result);
    
    // Simple TTL implementation - clear after 5 minutes
    setTimeout(() => {
      this.validationCache.delete(key);
    }, 5 * 60 * 1000);
  }

  /**
   * Generic business logic processing - to be overridden by specific implementations
   */
  protected abstract processBusinessLogic(
    request: BusinessLogicRequest,
    context: ServiceContext
  ): Promise<unknown>;

  /**
   * Request validation template method
   */
  protected async validateRequest(
    request: BusinessLogicRequest,
    context: ServiceContext
  ): Promise<ValidationResult> {
    const errors = [];

    // Basic structure validation
    if (!request.id) errors.push({ field: 'id', code: 'REQUIRED', message: 'Request ID is required', severity: 'error' as const });
    if (!request.type) errors.push({ field: 'type', code: 'REQUIRED', message: 'Request type is required', severity: 'error' as const });
    if (!request.data) errors.push({ field: 'data', code: 'REQUIRED', message: 'Request data is required', severity: 'error' as const });

    // Category-specific validation
    const categoryValidation = await this.validateCategory(request, context);
    errors.push(...categoryValidation.errors);

    return {
      isValid: errors.length === 0,
      errors,
      warnings: categoryValidation.warnings
    };
  }

  /**
   * Category-specific validation - to be overridden by concrete implementations
   */
  protected async validateCategory(
    _request: BusinessLogicRequest,
    _context: ServiceContext
  ): Promise<ValidationResult> {
    // Default implementation - no additional validation
    return { isValid: true, errors: [] };
  }

  /**
   * Response creation helpers
   */
  protected createSuccessResponse(
    request: BusinessLogicRequest,
    data: unknown,
    startTime: Date = new Date()
  ): BusinessLogicResponse<Record<string, unknown>> {
    return {
      id: request.id,
      success: true,
      data: data as Record<string, unknown>,
      metadata: {
        ...request.metadata,
        category: this.category,
        module: this.id
      },
      performance: {
        executionTime: Date.now() - startTime.getTime()
      },
      timestamp: new Date()
    };
  }

  protected createErrorResponse(
    request: BusinessLogicRequest,
    errorCode: string,
    errorMessage: string,
    startTime: Date = new Date()
  ): BusinessLogicResponse {
    return {
      id: request.id,
      success: false,
      error: {
        code: errorCode,
        message: errorMessage,
        type: 'business_rule',
        severity: 'high'
      },
      metadata: {
        ...request.metadata,
        category: this.category,
        module: this.id
      },
      performance: {
        executionTime: Date.now() - startTime.getTime()
      },
      timestamp: new Date()
    };
  }

  /**
   * Business Logic Specific Health Checks
   */
  private setupBusinessLogicHealthChecks(): void {
    // Business rules health check
    this.addHealthCheck('business-rules', async () => {
      try {
        const rules = this.getAllBusinessRules();
        return rules.length > 0; // At least one rule should be configured
      } catch {
        return false;
      }
    });

    // Validation cache health check
    this.addHealthCheck('validation-cache', async () => {
      try {
        return this.validationCache.size < 1000; // Prevent cache from growing too large
      } catch {
        return false;
      }
    });
  }

  /**
   * Lifecycle Implementation
   */
  protected async onInitialize(): Promise<void> {
    // Load business rules from configuration
    await this.loadBusinessRules();
    
    // Initialize validation cache
    this.validationCache.clear();
    
    // Set up category-specific initialization
    await this.onBusinessLogicInitialize();
  }

  protected async onStart(): Promise<void> {
    // Validate business rules
    await this.validateBusinessRules();
    
    // Start any background processes
    await this.onBusinessLogicStart();
  }

  protected async onStop(): Promise<void> {
    // Clean up resources
    await this.onBusinessLogicStop();
    
    // Clear caches
    this.validationCache.clear();
  }

  protected async onDestroy(): Promise<void> {
    // Final cleanup
    await this.onBusinessLogicDestroy();
    
    // Clear all maps
    this.businessRules.clear();
    this.validationCache.clear();
  }

  /**
   * Extension points for concrete implementations
   */
  protected async loadBusinessRules(): Promise<void> {
    // Default implementation - no rules loaded
  }

  protected async validateBusinessRules(): Promise<void> {
    // Validate that all required business rules are properly configured
    for (const rule of Array.from(this.businessRules.values())) {
      if (!rule.condition) {
        throw new Error(`Business rule ${rule.id} is missing condition`);
      }
      if (!rule.actions || rule.actions.length === 0) {
        throw new Error(`Business rule ${rule.id} is missing actions`);
      }
    }
  }

  protected async onBusinessLogicInitialize(): Promise<void> {
    // Override in concrete implementations
  }

  protected async onBusinessLogicStart(): Promise<void> {
    // Override in concrete implementations
  }

  protected async onBusinessLogicStop(): Promise<void> {
    // Override in concrete implementations
  }

  protected async onBusinessLogicDestroy(): Promise<void> {
    // Override in concrete implementations
  }
}
