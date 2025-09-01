/**
 * Revolutionary Event Triggers Implementation
 * Zero-configuration event-driven automation
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

export interface IEventTrigger {
  id: string;
  name: string;
  eventPattern: string | RegExp;
  condition?: (eventData: any) => boolean;
  action: (eventData: any) => Promise<void> | void;
  enabled: boolean;
  priority: number;
  maxExecutions?: number;
  executionCount: number;
  cooldownMs?: number;
  lastExecuted?: number;
  metadata: Record<string, any>;
}

export class EventTriggers extends EventEmitter {
  private triggers: Map<string, IEventTrigger> = new Map();
  private eventHistory: Array<{ event: string; data: any; timestamp: number }> = [];
  private linkedModules: Map<string, any> = new Map();

  constructor(private config: any = {}) {
    super();
    this.config = {
      autoCreateTriggers: config.autoCreateTriggers !== false,
      maxHistorySize: config.maxHistorySize || 10000,
      autoLink: config.autoLink !== false,
      ...config
    };

    this.setupAutoConfiguration();
    
    if (this.config.autoCreateTriggers) {
      this.createCommonTriggers();
    }
  }

  createTrigger(trigger: Omit<IEventTrigger, 'id' | 'executionCount'>): string {
    const id = uuidv4();
    this.triggers.set(id, {
      id,
      executionCount: 0,
      enabled: true,
      priority: 1,
      ...trigger
    });

    this.emit('trigger-created', id);
    console.info(`⚡ Event trigger created: ${trigger.name} (${id})`);
    
    return id;
  }

  removeTrigger(triggerId: string): void {
    this.triggers.delete(triggerId);
    this.emit('trigger-removed', triggerId);
  }

  async fireEvent(eventName: string, eventData: any = {}): Promise<void> {
    const timestamp = Date.now();
    
    // Record event in history
    this.eventHistory.push({ event: eventName, data: eventData, timestamp });
    if (this.eventHistory.length > this.config.maxHistorySize) {
      this.eventHistory = this.eventHistory.slice(-this.config.maxHistorySize / 2);
    }

    // Find matching triggers
    const matchingTriggers = Array.from(this.triggers.values())
      .filter(trigger => this.matchesTrigger(trigger, eventName, eventData))
      .sort((a, b) => b.priority - a.priority);

    this.emit('event-fired', eventName, eventData, matchingTriggers.length);

    // Execute matching triggers
    for (const trigger of matchingTriggers) {
      await this.executeTrigger(trigger, eventName, eventData);
    }
  }

  linkWith(moduleType: string, instance: any): void {
    this.linkedModules.set(moduleType, instance);
    
    // Auto-create module-specific triggers
    this.createModuleTriggers(moduleType, instance);
    
    console.info(`🔗 Event triggers linked with ${moduleType} module`);
  }

  private matchesTrigger(trigger: IEventTrigger, eventName: string, eventData: any): boolean {
    if (!trigger.enabled) return false;

    // Check max executions
    if (trigger.maxExecutions && trigger.executionCount >= trigger.maxExecutions) return false;

    // Check cooldown
    if (trigger.cooldownMs && trigger.lastExecuted) {
      if (Date.now() - trigger.lastExecuted < trigger.cooldownMs) return false;
    }

    // Match event pattern
    let patternMatch = false;
    if (typeof trigger.eventPattern === 'string') {
      patternMatch = eventName === trigger.eventPattern || 
                    eventName.includes(trigger.eventPattern) ||
                    trigger.eventPattern === '*';
    } else {
      patternMatch = trigger.eventPattern.test(eventName);
    }

    if (!patternMatch) return false;

    // Check custom condition
    if (trigger.condition) {
      return trigger.condition(eventData);
    }

    return true;
  }

  private async executeTrigger(trigger: IEventTrigger, eventName: string, eventData: any): Promise<void> {
    try {
      this.emit('trigger-executing', trigger.id, eventName);
      
      await trigger.action(eventData);
      
      trigger.executionCount++;
      trigger.lastExecuted = Date.now();
      
      this.emit('trigger-executed', trigger.id, eventName, eventData);
      console.debug(`✅ Trigger executed: ${trigger.name} for event ${eventName}`);
      
    } catch (error) {
      this.emit('trigger-failed', trigger.id, eventName, error);
      console.error(`❌ Trigger failed: ${trigger.name}`, error);
    }
  }

  private setupAutoConfiguration(): void {
    // Auto-create system event listeners
    process.on('uncaughtException', (error) => {
      this.fireEvent('system:error', { type: 'uncaughtException', error });
    });

    process.on('unhandledRejection', (reason) => {
      this.fireEvent('system:error', { type: 'unhandledRejection', reason });
    });

    // Monitor system resources
    if (this.config.monitorSystem) {
      setInterval(() => {
        const usage = process.memoryUsage();
        this.fireEvent('system:memory', usage);
        
        if (usage.heapUsed > usage.heapTotal * 0.8) {
          this.fireEvent('system:high-memory', usage);
        }
      }, 30000);
    }
  }

  private createCommonTriggers(): void {
    // Error handling trigger
    this.createTrigger({
      name: 'Error Handler',
      eventPattern: /error|fail|exception/i,
      enabled: true,
      priority: 10,
      action: (data) => {
        console.error('🚨 Auto error handler triggered:', data);
        // Could integrate with logging, monitoring, or alerting systems
      },
      metadata: { autoCreated: true, type: 'error-handling' }
    });

    // Health check trigger  
    this.createTrigger({
      name: 'Health Monitor',
      eventPattern: 'health-check',
      enabled: true,
      priority: 5,
      cooldownMs: 60000, // 1 minute cooldown
      action: async (data) => {
        console.info('💊 Health check triggered:', data);
        // Could perform health checks on linked modules
        await this.performHealthChecks();
      },
      metadata: { autoCreated: true, type: 'health-monitoring' }
    });

    // Performance monitor
    this.createTrigger({
      name: 'Performance Monitor',
      eventPattern: /performance|slow|timeout/i,
      enabled: true,
      priority: 8,
      condition: (data) => data.responseTime > 5000,
      action: (data) => {
        console.warn('🐌 Performance issue detected:', data);
        // Could trigger performance optimization
      },
      metadata: { autoCreated: true, type: 'performance-monitoring' }
    });

    console.info('⚡ Common event triggers auto-created');
  }

  private createModuleTriggers(moduleType: string, instance: any): void {
    switch (moduleType) {
      case 'circuit-breaker':
        this.createTrigger({
          name: `Circuit Breaker Monitor (${moduleType})`,
          eventPattern: 'circuit-opened',
          enabled: true,
          priority: 9,
          action: (data) => {
            console.warn('🔴 Circuit breaker opened, triggering fallback procedures');
            this.fireEvent('system:circuit-breaker:opened', data);
          },
          metadata: { linkedModule: moduleType }
        });
        break;
        
      case 'message-queue':
        this.createTrigger({
          name: `Queue Monitor (${moduleType})`,
          eventPattern: 'queue-full',
          enabled: true,
          priority: 7,
          action: (data) => {
            console.warn('📦 Message queue full, scaling up processing');
            this.fireEvent('system:scale-up', { component: 'message-processing', reason: 'queue-full' });
          },
          metadata: { linkedModule: moduleType }
        });
        break;
        
      case 'service-registry':
        this.createTrigger({
          name: `Service Monitor (${moduleType})`,
          eventPattern: 'service-unhealthy',
          enabled: true,
          priority: 6,
          action: (data) => {
            console.warn('🏥 Service unhealthy, triggering recovery procedures');
            this.fireEvent('system:service:recovery', data);
          },
          metadata: { linkedModule: moduleType }
        });
        break;
    }
  }

  private async performHealthChecks(): Promise<void> {
    for (const [moduleType, instance] of this.linkedModules) {
      try {
        if (instance.getHealth) {
          const health = await instance.getHealth();
          this.fireEvent(`${moduleType}:health-status`, health);
          
          if (!health.healthy) {
            this.fireEvent(`${moduleType}:unhealthy`, health);
          }
        }
      } catch (error) {
        this.fireEvent(`${moduleType}:health-check-failed`, { error });
      }
    }
  }

  getMetrics() {
    const totalTriggers = this.triggers.size;
    const enabledTriggers = Array.from(this.triggers.values()).filter(t => t.enabled).length;
    const totalExecutions = Array.from(this.triggers.values()).reduce((sum, t) => sum + t.executionCount, 0);
    const totalEvents = this.eventHistory.length;

    return {
      totalTriggers,
      enabledTriggers,
      totalExecutions,
      totalEvents,
      linkedModules: this.linkedModules.size,
      recentEvents: this.eventHistory.slice(-10)
    };
  }
}