/**
 * Message Queue System Demo
 * Demonstrates Fortune 100-grade message queue architecture for threat intelligence
 */

import { logger } from '../utils/logger';
import {
  MessageQueueServiceFactory,
  IOCMessageProducer,
  ThreatAnalysisMessageProducer,
  AlertMessageProducer,
  MESSAGE_PRIORITIES,
  MESSAGE_TYPES,
} from '../message-queue';
import { IIOC } from '../models/IOC';

/**
 * Demonstration of the Enterprise Message Queue System
 */
export class MessageQueueDemo {
  private messageQueueFactory: MessageQueueServiceFactory;

  constructor() {
    this.messageQueueFactory = MessageQueueServiceFactory.getInstance();
  }

  /**
   * Run complete message queue demonstration
   */
  public async runDemo(): Promise<void> {
    try {
      logger.info('🚀 Starting Fortune 100-Grade Message Queue Demo');

      // Initialize the message queue system
      await this.initializeMessageQueueSystem();

      // Demonstrate IOC processing
      await this.demonstrateIOCProcessing();

      // Demonstrate threat analysis
      await this.demonstrateThreatAnalysis();

      // Demonstrate real-time alerts
      await this.demonstrateRealTimeAlerts();

      // Show system metrics
      await this.showSystemMetrics();

      logger.info('✅ Message Queue Demo completed successfully');
    } catch (error) {
      logger.error('❌ Message Queue Demo failed', error);
      throw error;
    }
  }

  /**
   * Initialize the enterprise message queue system
   */
  private async initializeMessageQueueSystem(): Promise<void> {
    logger.info('📡 Initializing Enterprise Message Queue System...');

    // Initialize with production-grade configuration
    const messageQueueManager = await this.messageQueueFactory.initialize({
      redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        keyPrefix: 'phantom-spire:demo',
        maxConnections: 5,
        commandTimeout: 5000,
      },
      security: {
        enableEncryption: false, // Disabled for demo
        allowedOrigins: ['localhost'],
      },
      monitoring: {
        metricsInterval: 10000, // 10 seconds for demo
        healthCheckInterval: 15000, // 15 seconds for demo
        enableTracing: true,
      },
    });

    logger.info('✅ Message Queue System initialized', {
      queues: Object.keys(messageQueueManager.getManagerMetrics()),
      monitoring: 'enabled',
      tracing: 'enabled',
    });
  }

  /**
   * Demonstrate IOC processing with message queues
   */
  private async demonstrateIOCProcessing(): Promise<void> {
    logger.info('🔍 Demonstrating IOC Processing Pipeline...');

    const messageQueueManager =
      this.messageQueueFactory.getMessageQueueManager();
    const iocProducer = new IOCMessageProducer(messageQueueManager);

    // Create sample IOCs for processing
    const sampleIOCs: IIOC[] = [
      {
        _id: 'demo-ioc-1',
        value: '192.168.1.100',
        type: 'ip',
        source: 'demo-feed',
        tags: ['malware', 'c2'],
        confidence: 0.95,
        severity: 'high',
        firstSeen: new Date(),
        lastSeen: new Date(),
        metadata: { demo: true },
      },
      {
        _id: 'demo-ioc-2',
        value: 'malicious-domain.com',
        type: 'domain',
        source: 'demo-feed',
        tags: ['phishing', 'campaign-xyz'],
        confidence: 0.87,
        severity: 'medium',
        firstSeen: new Date(),
        lastSeen: new Date(),
        metadata: { demo: true },
      },
    ];

    // Publish IOC enrichment requests
    for (const ioc of sampleIOCs) {
      const messageId = await iocProducer.publishIOCEnrichmentRequest(
        ioc,
        {
          includeReputation: true,
          includeGeolocation: true,
          includeMalwareAnalysis: true,
          includeRelationships: true,
        },
        {
          userId: 'demo-user',
          permissions: ['read', 'write'],
        },
        MESSAGE_PRIORITIES.HIGH
      );

      logger.info('📤 Published IOC enrichment request', {
        messageId,
        iocType: ioc.type,
        iocValue: ioc.value,
        priority: 'HIGH',
      });
    }

    logger.info('✅ IOC Processing demonstration completed');
  }

  /**
   * Demonstrate threat analysis workflows
   */
  private async demonstrateThreatAnalysis(): Promise<void> {
    logger.info('🧠 Demonstrating Threat Analysis Pipeline...');

    const messageQueueManager =
      this.messageQueueFactory.getMessageQueueManager();
    const threatAnalysisProducer = new ThreatAnalysisMessageProducer(
      messageQueueManager
    );

    // Create sample IOCs for analysis
    const analysisIOCs: IIOC[] = [
      {
        _id: 'analysis-ioc-1',
        value: '10.0.0.50',
        type: 'ip',
        source: 'threat-feed',
        tags: ['apt', 'lateral-movement'],
        confidence: 0.92,
        severity: 'high',
        firstSeen: new Date(Date.now() - 86400000), // 24 hours ago
        lastSeen: new Date(),
        metadata: { campaign: 'Operation Stealth' },
      },
    ];

    // Publish campaign analysis request
    const campaignMessageId =
      await threatAnalysisProducer.publishThreatAnalysisRequest(
        analysisIOCs,
        'campaign',
        {
          includePredictions: true,
          includeAnomalies: true,
          timeWindow: {
            start: new Date(Date.now() - 86400000 * 7), // 7 days ago
            end: new Date(),
          },
        },
        {
          userId: 'threat-analyst',
          permissions: ['read', 'analyze'],
        },
        MESSAGE_PRIORITIES.CRITICAL
      );

    logger.info('📤 Published threat analysis request', {
      messageId: campaignMessageId,
      analysisType: 'campaign',
      iocCount: analysisIOCs.length,
      priority: 'CRITICAL',
    });

    // Publish attribution analysis request
    const attributionMessageId =
      await threatAnalysisProducer.publishThreatAnalysisRequest(
        analysisIOCs,
        'attribution',
        {
          includePredictions: false,
          includeAnomalies: true,
          timeWindow: {
            start: new Date(Date.now() - 86400000 * 30), // 30 days ago
            end: new Date(),
          },
        },
        {
          userId: 'threat-analyst',
          permissions: ['read', 'analyze'],
        },
        MESSAGE_PRIORITIES.HIGH
      );

    logger.info('📤 Published attribution analysis request', {
      messageId: attributionMessageId,
      analysisType: 'attribution',
      iocCount: analysisIOCs.length,
      priority: 'HIGH',
    });

    logger.info('✅ Threat Analysis demonstration completed');
  }

  /**
   * Demonstrate real-time threat alerts
   */
  private async demonstrateRealTimeAlerts(): Promise<void> {
    logger.info('🚨 Demonstrating Real-Time Threat Alerts...');

    const messageQueueManager =
      this.messageQueueFactory.getMessageQueueManager();
    const alertProducer = new AlertMessageProducer(messageQueueManager);

    // Create sample threat alert
    const alertIOCs: IIOC[] = [
      {
        _id: 'alert-ioc-1',
        value: 'zero-day-exploit.exe',
        type: 'hash',
        source: 'honeypot',
        tags: ['zero-day', 'exploit', 'critical'],
        confidence: 0.99,
        severity: 'critical',
        firstSeen: new Date(),
        lastSeen: new Date(),
        metadata: {
          exploitType: 'buffer-overflow',
          targetSoftware: 'Adobe Reader',
        },
      },
    ];

    // Publish critical threat alert
    const criticalAlertId = await alertProducer.publishThreatAlert(
      'critical',
      'Zero-Day Exploit Detected',
      'A new zero-day exploit targeting Adobe Reader has been detected in the environment. Immediate action required.',
      'malware',
      alertIOCs,
      [
        {
          action: 'block-hash',
          priority: 1,
          description: 'Block the malicious file hash across all endpoints',
          automated: true,
        },
        {
          action: 'isolate-systems',
          priority: 2,
          description: 'Isolate affected systems from the network',
          automated: false,
        },
        {
          action: 'patch-software',
          priority: 3,
          description: 'Update Adobe Reader to the latest version',
          automated: false,
        },
      ],
      ['workstation-01', 'workstation-15'],
      ['zero-day', 'high-priority', 'immediate-action'],
      new Date(Date.now() + 3600000) // Expires in 1 hour
    );

    logger.info('📤 Published critical threat alert', {
      alertId: criticalAlertId,
      severity: 'CRITICAL',
      threatType: 'malware',
      affectedSystems: 2,
      automatedActions: 1,
    });

    // Publish medium-severity alert
    const mediumAlertId = await alertProducer.publishThreatAlert(
      'medium',
      'Suspicious Network Activity Detected',
      'Unusual outbound connections detected from internal systems to known suspicious domains.',
      'network-anomaly',
      [],
      [
        {
          action: 'monitor-traffic',
          priority: 1,
          description: 'Increase monitoring for affected network segments',
          automated: true,
        },
        {
          action: 'investigate-connections',
          priority: 2,
          description:
            'Investigate the source and nature of suspicious connections',
          automated: false,
        },
      ],
      [],
      ['network-anomaly', 'investigation-required']
    );

    logger.info('📤 Published medium threat alert', {
      alertId: mediumAlertId,
      severity: 'MEDIUM',
      threatType: 'network-anomaly',
      recommendedActions: 2,
    });

    logger.info('✅ Real-Time Alerts demonstration completed');
  }

  /**
   * Display system metrics and health status
   */
  private async showSystemMetrics(): Promise<void> {
    logger.info('📊 Displaying System Metrics...');

    const messageQueueManager =
      this.messageQueueFactory.getMessageQueueManager();

    // Get manager-level metrics
    const managerMetrics = messageQueueManager.getManagerMetrics();

    logger.info('📈 Message Queue Manager Metrics', {
      totalQueues: managerMetrics.totalQueues,
      totalSubscriptions: managerMetrics.totalSubscriptions,
      totalMessagesPublished: managerMetrics.totalMessagesPublished,
      totalMessagesConsumed: managerMetrics.totalMessagesConsumed,
      totalErrors: managerMetrics.totalErrors,
      uptime: `${Math.round(managerMetrics.uptime / 1000)}s`,
    });

    // Get health status for all queues
    try {
      const healthStatus = await messageQueueManager.getHealthStatus();

      for (const [queueName, health] of Object.entries(healthStatus)) {
        logger.info(`🏥 Queue Health: ${queueName}`, {
          status: health.status,
          uptime: `${Math.round(health.uptime / 1000)}s`,
          connectivity: health.connectivity,
          memoryUsage: `${Math.round(health.memoryUsage / 1024 / 1024)}MB`,
          issues: health.issues.length,
        });
      }
    } catch (error) {
      logger.warn('Unable to fetch health status (Redis may not be running)', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    // Get queue-specific metrics
    try {
      const queueMetrics = await messageQueueManager.getMetrics();

      for (const [queueName, metrics] of Object.entries(queueMetrics)) {
        logger.info(`📋 Queue Metrics: ${queueName}`, {
          messagesPublished: metrics.messagesPublished,
          messagesConsumed: metrics.messagesConsumed,
          messagesPending: metrics.messagesPending,
          averageProcessingTime: `${metrics.averageProcessingTime}ms`,
          errorRate: `${(metrics.errorRate * 100).toFixed(2)}%`,
          subscriptionCount: metrics.subscriptionCount,
        });
      }
    } catch (error) {
      logger.warn('Unable to fetch queue metrics (Redis may not be running)', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    logger.info('✅ System Metrics display completed');
  }

  /**
   * Clean up resources
   */
  public async cleanup(): Promise<void> {
    try {
      await this.messageQueueFactory.shutdown();
      logger.info('🧹 Message Queue Demo cleanup completed');
    } catch (error) {
      logger.error('Error during cleanup', error);
    }
  }
}

/**
 * Run the message queue demonstration
 */
export async function runMessageQueueDemo(): Promise<void> {
  const demo = new MessageQueueDemo();

  try {
    await demo.runDemo();
  } finally {
    await demo.cleanup();
  }
}

// Export for use in other demos or tests
export default MessageQueueDemo;
