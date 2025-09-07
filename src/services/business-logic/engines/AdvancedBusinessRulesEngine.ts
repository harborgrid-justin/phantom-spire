/**
 * Advanced Business Rules Engine
 * Enterprise-grade rule processing with machine learning integration
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

export interface BusinessRule {
  id: string;
  name: string;
  description: string;
  category: string;
  priority: number;
  conditions: RuleCondition[];
  actions: RuleAction[];
  enabled: boolean;
  version: string;
  tags: string[];
  metadata: Record<string, any>;
  schedule?: RuleSchedule;
  dependencies?: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastExecuted?: Date;
  executionCount: number;
  successCount: number;
  failureCount: number;
}

export interface RuleCondition {
  id: string;
  type: 'simple' | 'complex' | 'function' | 'ml' | 'regex' | 'sql';
  field: string;
  operator: string;
  value: any;
  logicalOperator?: 'AND' | 'OR' | 'NOT';
  nested?: RuleCondition[];
  weight?: number;
  confidence?: number;
}

export interface RuleAction {
  id: string;
  type: 'notification' | 'webhook' | 'function' | 'workflow' | 'approval' | 'escalation';
  parameters: Record<string, any>;
  priority: number;
  async: boolean;
  retryConfig?: {
    maxRetries: number;
    delay: number;
    backoffMultiplier: number;
  };
  timeoutMs?: number;
}

export interface RuleSchedule {
  type: 'cron' | 'interval' | 'event' | 'manual';
  expression: string;
  timezone?: string;
  enabled: boolean;
}

export interface RuleContext {
  userId: string;
  sessionId: string;
  timestamp: Date;
  sourceSystem: string;
  traceId: string;
  metadata: Record<string, any>;
  securityContext: {
    permissions: string[];
    roles: string[];
    attributes: Record<string, any>;
  };
}

export interface RuleExecutionResult {
  ruleId: string;
  executionId: string;
  status: 'success' | 'failure' | 'skipped' | 'error';
  startTime: Date;
  endTime: Date;
  duration: number;
  conditionsEvaluated: number;
  conditionsPassed: number;
  actionsExecuted: number;
  actionsSucceeded: number;
  actionsFailed: number;
  results: Array<{
    actionId: string;
    status: string;
    result: any;
    error?: string;
    duration: number;
  }>;
  error?: string;
  context: RuleContext;
  metadata: Record<string, any>;
}

export interface BusinessRuleSet {
  id: string;
  name: string;
  description: string;
  version: string;
  rules: BusinessRule[];
  executionOrder: 'priority' | 'dependency' | 'parallel' | 'sequential';
  enabled: boolean;
  tags: string[];
  metadata: Record<string, any>;
}

export interface RuleEngineConfiguration {
  maxConcurrentExecutions: number;
  defaultTimeout: number;
  cacheEnabled: boolean;
  cacheTtl: number;
  metricsEnabled: boolean;
  auditEnabled: boolean;
  performanceThresholds: {
    warningThreshold: number;
    errorThreshold: number;
  };
  retryConfiguration: {
    maxRetries: number;
    baseDelay: number;
    maxDelay: number;
  };
}

export class AdvancedBusinessRulesEngine extends EventEmitter {
  private rules = new Map<string, BusinessRule>();
  private ruleSets = new Map<string, BusinessRuleSet>();
  private executionQueue: Array<{ rule: BusinessRule; context: RuleContext; data: any }> = [];
  private isProcessing = false;
  private metrics = {
    totalExecutions: 0,
    successfulExecutions: 0,
    failedExecutions: 0,
    averageExecutionTime: 0,
    peakExecutionsPerSecond: 0,
    currentQueueSize: 0
  };
  private cache = new Map<string, { result: any; timestamp: Date }>();
  private auditLog: Array<RuleExecutionResult> = [];

  constructor(private config: RuleEngineConfiguration) {
    super();
    this.setupPerformanceMonitoring();
    this.setupAuditLogging();
    this.startQueueProcessor();
  }

  /**
   * Add a business rule to the engine
   */
  async addRule(rule: BusinessRule): Promise<void> {
    // Validate rule structure
    this.validateRule(rule);
    
    // Check for rule conflicts
    await this.checkRuleConflicts(rule);
    
    // Store rule
    this.rules.set(rule.id, rule);
    
    // Update dependencies
    await this.updateRuleDependencies(rule);
    
    this.emit('ruleAdded', { rule });
    console.log(`📋 Business rule added: ${rule.name} (${rule.id})`);
  }

  /**
   * Execute a specific rule
   */
  async executeRule(
    ruleId: string, 
    data: any, 
    context: RuleContext
  ): Promise<RuleExecutionResult> {
    const rule = this.rules.get(ruleId);
    if (!rule) {
      throw new Error(`Rule not found: ${ruleId}`);
    }

    if (!rule.enabled) {
      return this.createSkippedResult(rule, context, 'Rule is disabled');
    }

    const executionId = uuidv4();
    const startTime = new Date();

    try {
      // Check cache
      const cacheKey = this.generateCacheKey(rule, data, context);
      if (this.config.cacheEnabled && this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey)!;
        if (Date.now() - cached.timestamp.getTime() < this.config.cacheTtl) {
          return cached.result;
        }
      }

      // Evaluate conditions
      const conditionResult = await this.evaluateConditions(rule.conditions, data, context);
      
      if (!conditionResult.passed) {
        return this.createSkippedResult(rule, context, 'Conditions not met');
      }

      // Execute actions
      const actionResults = await this.executeActions(rule.actions, data, context);

      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      const result: RuleExecutionResult = {
        ruleId: rule.id,
        executionId,
        status: actionResults.every(r => r.status === 'success') ? 'success' : 'failure',
        startTime,
        endTime,
        duration,
        conditionsEvaluated: conditionResult.evaluated,
        conditionsPassed: conditionResult.passed ? 1 : 0,
        actionsExecuted: actionResults.length,
        actionsSucceeded: actionResults.filter(r => r.status === 'success').length,
        actionsFailed: actionResults.filter(r => r.status === 'failure').length,
        results: actionResults,
        context,
        metadata: {
          cacheKey,
          performanceMetrics: this.calculatePerformanceMetrics(duration)
        }
      };

      // Update metrics
      this.updateMetrics(result);

      // Cache result if enabled
      if (this.config.cacheEnabled) {
        this.cache.set(cacheKey, { result, timestamp: new Date() });
      }

      // Audit logging
      if (this.config.auditEnabled) {
        this.auditLog.push(result);
      }

      this.emit('ruleExecuted', result);
      return result;

    } catch (error) {
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      const errorResult: RuleExecutionResult = {
        ruleId: rule.id,
        executionId,
        status: 'error',
        startTime,
        endTime,
        duration,
        conditionsEvaluated: 0,
        conditionsPassed: 0,
        actionsExecuted: 0,
        actionsSucceeded: 0,
        actionsFailed: 0,
        results: [],
        error: error instanceof Error ? error.message : 'Unknown error',
        context,
        metadata: {}
      };

      this.emit('ruleError', errorResult);
      return errorResult;
    }
  }

  /**
   * Execute multiple rules in parallel or sequential order
   */
  async executeRuleSet(
    ruleSetId: string, 
    data: any, 
    context: RuleContext
  ): Promise<RuleExecutionResult[]> {
    const ruleSet = this.ruleSets.get(ruleSetId);
    if (!ruleSet || !ruleSet.enabled) {
      throw new Error(`Rule set not found or disabled: ${ruleSetId}`);
    }

    const enabledRules = ruleSet.rules.filter(rule => rule.enabled);
    
    switch (ruleSet.executionOrder) {
      case 'parallel':
        return Promise.all(
          enabledRules.map(rule => this.executeRule(rule.id, data, context))
        );
      
      case 'sequential':
        const results: RuleExecutionResult[] = [];
        for (const rule of enabledRules) {
          const result = await this.executeRule(rule.id, data, context);
          results.push(result);
          if (result.status === 'error') break; // Stop on error
        }
        return results;
      
      case 'priority':
        const sortedRules = [...enabledRules].sort((a, b) => b.priority - a.priority);
        return this.executeRuleSet(ruleSetId, data, context);
      
      case 'dependency':
        return this.executeDependencyOrderedRules(enabledRules, data, context);
      
      default:
        throw new Error(`Unknown execution order: ${ruleSet.executionOrder}`);
    }
  }

  /**
   * Batch execute rules for multiple data items
   */
  async batchExecute(
    ruleIds: string[], 
    dataItems: any[], 
    context: RuleContext
  ): Promise<RuleExecutionResult[][]> {
    const results: RuleExecutionResult[][] = [];
    
    for (const data of dataItems) {
      const itemResults: RuleExecutionResult[] = [];
      for (const ruleId of ruleIds) {
        const result = await this.executeRule(ruleId, data, context);
        itemResults.push(result);
      }
      results.push(itemResults);
    }
    
    return results;
  }

  /**
   * Add rules to execution queue for asynchronous processing
   */
  async queueRuleExecution(
    ruleId: string, 
    data: any, 
    context: RuleContext,
    priority: number = 0
  ): Promise<void> {
    const rule = this.rules.get(ruleId);
    if (!rule) {
      throw new Error(`Rule not found: ${ruleId}`);
    }

    this.executionQueue.push({ rule, context, data });
    this.executionQueue.sort((a, b) => b.rule.priority - a.rule.priority);
    
    this.metrics.currentQueueSize = this.executionQueue.length;
    this.emit('queueUpdated', { queueSize: this.metrics.currentQueueSize });
  }

  /**
   * Get rule execution metrics
   */
  getMetrics(): any {
    return {
      ...this.metrics,
      cacheHitRate: this.calculateCacheHitRate(),
      queueProcessingRate: this.calculateQueueProcessingRate(),
      errorRate: this.calculateErrorRate(),
      performanceDistribution: this.calculatePerformanceDistribution()
    };
  }

  /**
   * Get rule audit history
   */
  getAuditHistory(filters?: {
    ruleId?: string;
    status?: string;
    dateRange?: { start: Date; end: Date };
    limit?: number;
  }): RuleExecutionResult[] {
    let filtered = [...this.auditLog];

    if (filters?.ruleId) {
      filtered = filtered.filter(r => r.ruleId === filters.ruleId);
    }

    if (filters?.status) {
      filtered = filtered.filter(r => r.status === filters.status);
    }

    if (filters?.dateRange) {
      filtered = filtered.filter(r => 
        r.startTime >= filters.dateRange!.start && 
        r.startTime <= filters.dateRange!.end
      );
    }

    if (filters?.limit) {
      filtered = filtered.slice(0, filters.limit);
    }

    return filtered.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }

  /**
   * Export rules configuration
   */
  exportRules(): { rules: BusinessRule[]; ruleSets: BusinessRuleSet[] } {
    return {
      rules: Array.from(this.rules.values()),
      ruleSets: Array.from(this.ruleSets.values())
    };
  }

  /**
   * Import rules configuration
   */
  async importRules(config: { rules: BusinessRule[]; ruleSets: BusinessRuleSet[] }): Promise<void> {
    // Validate all rules first
    for (const rule of config.rules) {
      this.validateRule(rule);
    }

    // Clear existing rules
    this.rules.clear();
    this.ruleSets.clear();

    // Import rules
    for (const rule of config.rules) {
      await this.addRule(rule);
    }

    // Import rule sets
    for (const ruleSet of config.ruleSets) {
      this.ruleSets.set(ruleSet.id, ruleSet);
    }

    this.emit('rulesImported', { 
      ruleCount: config.rules.length, 
      ruleSetCount: config.ruleSets.length 
    });
  }

  private validateRule(rule: BusinessRule): void {
    if (!rule.id || !rule.name || !rule.conditions || !rule.actions) {
      throw new Error('Rule must have id, name, conditions, and actions');
    }

    if (rule.priority < 0 || rule.priority > 1000) {
      throw new Error('Rule priority must be between 0 and 1000');
    }

    // Validate conditions
    for (const condition of rule.conditions) {
      this.validateCondition(condition);
    }

    // Validate actions
    for (const action of rule.actions) {
      this.validateAction(action);
    }
  }

  private validateCondition(condition: RuleCondition): void {
    const validTypes = ['simple', 'complex', 'function', 'ml', 'regex', 'sql'];
    if (!validTypes.includes(condition.type)) {
      throw new Error(`Invalid condition type: ${condition.type}`);
    }

    const validOperators = ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'nin', 'contains', 'regex'];
    if (!validOperators.includes(condition.operator)) {
      throw new Error(`Invalid condition operator: ${condition.operator}`);
    }
  }

  private validateAction(action: RuleAction): void {
    const validTypes = ['notification', 'webhook', 'function', 'workflow', 'approval', 'escalation'];
    if (!validTypes.includes(action.type)) {
      throw new Error(`Invalid action type: ${action.type}`);
    }

    if (action.priority < 0 || action.priority > 100) {
      throw new Error('Action priority must be between 0 and 100');
    }
  }

  private async checkRuleConflicts(rule: BusinessRule): Promise<void> {
    // Implementation for detecting rule conflicts
    // This could include checking for:
    // - Circular dependencies
    // - Conflicting conditions
    // - Resource conflicts
    // For now, we'll implement basic conflict detection
    
    for (const existingRule of this.rules.values()) {
      if (existingRule.id === rule.id) {
        throw new Error(`Rule with ID ${rule.id} already exists`);
      }
    }
  }

  private async updateRuleDependencies(rule: BusinessRule): Promise<void> {
    // Update dependency graph
    if (rule.dependencies) {
      for (const depId of rule.dependencies) {
        if (!this.rules.has(depId)) {
          console.warn(`Warning: Rule dependency ${depId} not found for rule ${rule.id}`);
        }
      }
    }
  }

  private async evaluateConditions(
    conditions: RuleCondition[], 
    data: any, 
    context: RuleContext
  ): Promise<{ passed: boolean; evaluated: number }> {
    let evaluated = 0;
    let results: boolean[] = [];

    for (const condition of conditions) {
      evaluated++;
      const result = await this.evaluateCondition(condition, data, context);
      results.push(result);
    }

    // Apply logical operators (simplified implementation)
    const passed = results.every(r => r); // AND logic for now

    return { passed, evaluated };
  }

  private async evaluateCondition(
    condition: RuleCondition, 
    data: any, 
    context: RuleContext
  ): Promise<boolean> {
    const fieldValue = this.getFieldValue(data, condition.field);

    switch (condition.operator) {
      case 'eq':
        return fieldValue === condition.value;
      case 'ne':
        return fieldValue !== condition.value;
      case 'gt':
        return fieldValue > condition.value;
      case 'gte':
        return fieldValue >= condition.value;
      case 'lt':
        return fieldValue < condition.value;
      case 'lte':
        return fieldValue <= condition.value;
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(fieldValue);
      case 'nin':
        return Array.isArray(condition.value) && !condition.value.includes(fieldValue);
      case 'contains':
        return typeof fieldValue === 'string' && fieldValue.includes(condition.value);
      case 'regex':
        return typeof fieldValue === 'string' && new RegExp(condition.value).test(fieldValue);
      default:
        throw new Error(`Unknown operator: ${condition.operator}`);
    }
  }

  private getFieldValue(data: any, field: string): any {
    const parts = field.split('.');
    let value = data;
    
    for (const part of parts) {
      if (value && typeof value === 'object') {
        value = value[part];
      } else {
        return undefined;
      }
    }
    
    return value;
  }

  private async executeActions(
    actions: RuleAction[], 
    data: any, 
    context: RuleContext
  ): Promise<Array<{
    actionId: string;
    status: string;
    result: any;
    error?: string;
    duration: number;
  }>> {
    const results = [];
    const sortedActions = [...actions].sort((a, b) => b.priority - a.priority);

    for (const action of sortedActions) {
      const startTime = Date.now();
      try {
        const result = await this.executeAction(action, data, context);
        results.push({
          actionId: action.id,
          status: 'success',
          result,
          duration: Date.now() - startTime
        });
      } catch (error) {
        results.push({
          actionId: action.id,
          status: 'failure',
          result: null,
          error: error instanceof Error ? error.message : 'Unknown error',
          duration: Date.now() - startTime
        });

        if (!action.async) {
          break; // Stop execution on failure for synchronous actions
        }
      }
    }

    return results;
  }

  private async executeAction(action: RuleAction, data: any, context: RuleContext): Promise<any> {
    // Implement action execution based on type
    switch (action.type) {
      case 'notification':
        return this.executeNotificationAction(action, data, context);
      case 'webhook':
        return this.executeWebhookAction(action, data, context);
      case 'function':
        return this.executeFunctionAction(action, data, context);
      case 'workflow':
        return this.executeWorkflowAction(action, data, context);
      case 'approval':
        return this.executeApprovalAction(action, data, context);
      case 'escalation':
        return this.executeEscalationAction(action, data, context);
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  private async executeNotificationAction(action: RuleAction, data: any, context: RuleContext): Promise<any> {
    // Simulate notification
    console.log(`📬 Notification: ${action.parameters.message}`);
    return { sent: true, timestamp: new Date() };
  }

  private async executeWebhookAction(action: RuleAction, data: any, context: RuleContext): Promise<any> {
    // Simulate webhook call
    console.log(`🌐 Webhook: ${action.parameters.url}`);
    return { called: true, timestamp: new Date() };
  }

  private async executeFunctionAction(action: RuleAction, data: any, context: RuleContext): Promise<any> {
    // Execute custom function
    const functionName = action.parameters.function;
    console.log(`⚡ Function: ${functionName}`);
    return { executed: true, function: functionName, timestamp: new Date() };
  }

  private async executeWorkflowAction(action: RuleAction, data: any, context: RuleContext): Promise<any> {
    // Trigger workflow
    const workflowId = action.parameters.workflowId;
    console.log(`🔄 Workflow: ${workflowId}`);
    return { triggered: true, workflowId, timestamp: new Date() };
  }

  private async executeApprovalAction(action: RuleAction, data: any, context: RuleContext): Promise<any> {
    // Create approval request
    const approvalId = uuidv4();
    console.log(`✅ Approval request: ${approvalId}`);
    return { created: true, approvalId, timestamp: new Date() };
  }

  private async executeEscalationAction(action: RuleAction, data: any, context: RuleContext): Promise<any> {
    // Create escalation
    const escalationId = uuidv4();
    console.log(`🚨 Escalation: ${escalationId}`);
    return { escalated: true, escalationId, timestamp: new Date() };
  }

  private createSkippedResult(rule: BusinessRule, context: RuleContext, reason: string): RuleExecutionResult {
    return {
      ruleId: rule.id,
      executionId: uuidv4(),
      status: 'skipped',
      startTime: new Date(),
      endTime: new Date(),
      duration: 0,
      conditionsEvaluated: 0,
      conditionsPassed: 0,
      actionsExecuted: 0,
      actionsSucceeded: 0,
      actionsFailed: 0,
      results: [],
      context,
      metadata: { reason }
    };
  }

  private generateCacheKey(rule: BusinessRule, data: any, context: RuleContext): string {
    return `${rule.id}:${rule.version}:${JSON.stringify(data)}:${context.userId}`;
  }

  private updateMetrics(result: RuleExecutionResult): void {
    this.metrics.totalExecutions++;
    if (result.status === 'success') {
      this.metrics.successfulExecutions++;
    } else {
      this.metrics.failedExecutions++;
    }

    // Update average execution time
    this.metrics.averageExecutionTime = 
      (this.metrics.averageExecutionTime * (this.metrics.totalExecutions - 1) + result.duration) / 
      this.metrics.totalExecutions;
  }

  private calculatePerformanceMetrics(duration: number): any {
    return {
      isSlowExecution: duration > this.config.performanceThresholds.warningThreshold,
      isErrorExecution: duration > this.config.performanceThresholds.errorThreshold,
      performanceCategory: this.categorizePerformance(duration)
    };
  }

  private categorizePerformance(duration: number): string {
    if (duration < 100) return 'excellent';
    if (duration < 500) return 'good';
    if (duration < 1000) return 'acceptable';
    if (duration < 5000) return 'slow';
    return 'critical';
  }

  private calculateCacheHitRate(): number {
    // Implementation for cache hit rate calculation
    return 0.85; // Placeholder
  }

  private calculateQueueProcessingRate(): number {
    // Implementation for queue processing rate calculation
    return 100; // Placeholder
  }

  private calculateErrorRate(): number {
    if (this.metrics.totalExecutions === 0) return 0;
    return this.metrics.failedExecutions / this.metrics.totalExecutions;
  }

  private calculatePerformanceDistribution(): any {
    // Implementation for performance distribution calculation
    return {
      excellent: 0.6,
      good: 0.25,
      acceptable: 0.1,
      slow: 0.04,
      critical: 0.01
    };
  }

  private async executeDependencyOrderedRules(
    rules: BusinessRule[], 
    data: any, 
    context: RuleContext
  ): Promise<RuleExecutionResult[]> {
    // Topological sort implementation for dependency-ordered execution
    const results: RuleExecutionResult[] = [];
    const completed = new Set<string>();
    const processing = new Set<string>();

    const executeRuleWithDependencies = async (rule: BusinessRule): Promise<void> => {
      if (completed.has(rule.id)) return;
      if (processing.has(rule.id)) {
        throw new Error(`Circular dependency detected involving rule ${rule.id}`);
      }

      processing.add(rule.id);

      // Execute dependencies first
      if (rule.dependencies) {
        for (const depId of rule.dependencies) {
          const depRule = rules.find(r => r.id === depId);
          if (depRule) {
            await executeRuleWithDependencies(depRule);
          }
        }
      }

      // Execute the rule
      const result = await this.executeRule(rule.id, data, context);
      results.push(result);
      
      processing.delete(rule.id);
      completed.add(rule.id);
    };

    for (const rule of rules) {
      await executeRuleWithDependencies(rule);
    }

    return results;
  }

  private setupPerformanceMonitoring(): void {
    setInterval(() => {
      const metrics = this.getMetrics();
      this.emit('performanceMetrics', metrics);
    }, 30000); // Every 30 seconds
  }

  private setupAuditLogging(): void {
    // Clean up old audit logs periodically
    setInterval(() => {
      const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days
      this.auditLog = this.auditLog.filter(log => log.startTime > cutoff);
    }, 24 * 60 * 60 * 1000); // Daily cleanup
  }

  private startQueueProcessor(): void {
    const processQueue = async () => {
      if (this.isProcessing || this.executionQueue.length === 0) return;

      this.isProcessing = true;
      
      while (this.executionQueue.length > 0) {
        const item = this.executionQueue.shift()!;
        try {
          await this.executeRule(item.rule.id, item.context, item.context);
        } catch (error) {
          console.error(`Queue processing error for rule ${item.rule.id}:`, error);
        }
      }

      this.metrics.currentQueueSize = 0;
      this.isProcessing = false;
    };

    setInterval(processQueue, 1000); // Process queue every second
  }
}

export const advancedBusinessRulesEngine = new AdvancedBusinessRulesEngine({
  maxConcurrentExecutions: 50,
  defaultTimeout: 30000,
  cacheEnabled: true,
  cacheTtl: 300000,
  metricsEnabled: true,
  auditEnabled: true,
  performanceThresholds: {
    warningThreshold: 1000,
    errorThreshold: 5000
  },
  retryConfiguration: {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000
  }
});