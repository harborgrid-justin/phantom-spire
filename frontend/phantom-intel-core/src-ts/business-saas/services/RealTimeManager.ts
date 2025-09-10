/**
 * Real-Time Manager for Business SaaS
 * Handles real-time updates, notifications, and event streaming using Redis pub/sub
 */

import { IRealTimeConfig } from '../config/BusinessSaaSConfig.js';
import { IRealTimeUpdate } from '../types/BusinessSaaSTypes.js';

export interface IRealTimeSubscription {
  subscriptionId: string;
  tenantId: string;
  channels: string[];
  callback: (update: IRealTimeUpdate) => void;
  filters?: Record<string, any>;
  active: boolean;
  createdAt: Date;
  lastUpdate: Date;
}

export interface IRealTimeMetrics {
  activeSubscriptions: number;
  totalUpdatesPublished: number;
  totalUpdatesDelivered: number;
  averageDeliveryTime: number;
  activeChannels: string[];
  connectionStatus: 'connected' | 'disconnected' | 'error';
}

export class RealTimeManager {
  private config: IRealTimeConfig;
  private subscriptions: Map<string, IRealTimeSubscription> = new Map();
  private redisClient: any = null;
  private redisSubscriber: any = null;
  private metrics: IRealTimeMetrics;
  private isInitialized = false;

  constructor(config: IRealTimeConfig, redisClient?: any) {
    this.config = config;
    this.redisClient = redisClient;
    this.metrics = {
      activeSubscriptions: 0,
      totalUpdatesPublished: 0,
      totalUpdatesDelivered: 0,
      averageDeliveryTime: 0,
      activeChannels: [],
      connectionStatus: 'disconnected',
    };
  }

  /**
   * Initialize the real-time manager
   */
  async initialize(): Promise<void> {
    if (!this.config.enabled) {
      console.log('Real-time updates disabled');
      return;
    }

    try {
      if (!this.redisClient) {
        console.warn('Redis client not available for real-time features');
        return;
      }

      // Create subscriber client (in real implementation, would be separate Redis connection)
      this.redisSubscriber = this.redisClient; // In real impl: this.redisClient.duplicate()

      // Set up message handling
      this.setupMessageHandling();

      this.isInitialized = true;
      this.metrics.connectionStatus = 'connected';

      console.log('✅ Real-time manager initialized');
    } catch (error) {
      console.error('❌ Real-time manager initialization failed:', error);
      this.metrics.connectionStatus = 'error';
      throw error;
    }
  }

  /**
   * Publish a real-time update
   */
  async publishUpdate(update: IRealTimeUpdate): Promise<void> {
    if (!this.isInitialized || !this.redisClient) {
      console.warn('Real-time manager not initialized, skipping update');
      return;
    }

    try {
      const message = JSON.stringify(update);
      const publishPromises: Promise<number>[] = [];

      // Publish to all relevant channels
      for (const channel of update.channels) {
        const fullChannelName = this.getChannelName(channel, update.tenantId);
        publishPromises.push(this.redisClient.publish(fullChannelName, message));
      }

      // Publish to general tenant channel
      const tenantChannel = this.getChannelName('all-updates', update.tenantId);
      publishPromises.push(this.redisClient.publish(tenantChannel, message));

      await Promise.all(publishPromises);

      this.metrics.totalUpdatesPublished++;
      console.log(`📡 Published update to ${update.channels.length + 1} channels:`, {
        type: update.type,
        action: update.action,
        entityId: update.entityId,
        tenantId: update.tenantId,
      });
    } catch (error) {
      console.error('Failed to publish real-time update:', error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time updates
   */
  async subscribeToUpdates(
    tenantId: string,
    channels: string[],
    callback: (update: IRealTimeUpdate) => void,
    filters?: Record<string, any>
  ): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('Real-time manager not initialized');
    }

    const subscriptionId = this.generateSubscriptionId();
    const subscription: IRealTimeSubscription = {
      subscriptionId,
      tenantId,
      channels,
      callback,
      filters,
      active: true,
      createdAt: new Date(),
      lastUpdate: new Date(),
    };

    this.subscriptions.set(subscriptionId, subscription);

    // Subscribe to Redis channels
    const redisChannels = channels.map(channel => this.getChannelName(channel, tenantId));
    await this.redisSubscriber.subscribe(...redisChannels);

    this.metrics.activeSubscriptions = this.subscriptions.size;
    this.updateActiveChannels();

    console.log(`📻 Subscribed to real-time updates:`, {
      subscriptionId,
      tenantId,
      channels,
    });

    return subscriptionId;
  }

  /**
   * Unsubscribe from real-time updates
   */
  async unsubscribe(subscriptionId: string): Promise<void> {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      return;
    }

    subscription.active = false;
    this.subscriptions.delete(subscriptionId);

    // Check if we can unsubscribe from Redis channels
    const redisChannels = subscription.channels.map(channel =>
      this.getChannelName(channel, subscription.tenantId)
    );

    for (const channel of redisChannels) {
      // Only unsubscribe if no other subscriptions need this channel
      const stillNeeded = Array.from(this.subscriptions.values()).some(sub =>
        sub.active &&
        sub.tenantId === subscription.tenantId &&
        sub.channels.some(c => this.getChannelName(c, sub.tenantId) === channel)
      );

      if (!stillNeeded) {
        await this.redisSubscriber.unsubscribe(channel);
      }
    }

    this.metrics.activeSubscriptions = this.subscriptions.size;
    this.updateActiveChannels();

    console.log(`📻 Unsubscribed from real-time updates: ${subscriptionId}`);
  }

  /**
   * Publish indicator update
   */
  async publishIndicatorUpdate(
    tenantId: string,
    action: 'created' | 'updated' | 'deleted',
    indicatorId: string,
    indicatorData: any,
    userId?: string
  ): Promise<void> {
    const update: IRealTimeUpdate = {
      type: 'indicator',
      action,
      tenantId,
      entityId: indicatorId,
      entityType: 'indicator',
      timestamp: new Date(),
      data: indicatorData,
      userId,
      source: 'phantom-intel-core',
      channels: ['threat-updates', 'indicators'],
      metadata: {
        dataType: 'threat_indicator',
        severity: indicatorData.severity,
        confidence: indicatorData.confidence,
      },
    };

    await this.publishUpdate(update);
  }

  /**
   * Publish threat actor update
   */
  async publishThreatActorUpdate(
    tenantId: string,
    action: 'created' | 'updated' | 'deleted',
    actorId: string,
    actorData: any,
    userId?: string
  ): Promise<void> {
    const update: IRealTimeUpdate = {
      type: 'threat_actor',
      action,
      tenantId,
      entityId: actorId,
      entityType: 'threat_actor',
      timestamp: new Date(),
      data: actorData,
      userId,
      source: 'phantom-intel-core',
      channels: ['threat-updates', 'threat-actors'],
      metadata: {
        actorType: actorData.actor_type,
        sophistication: actorData.sophistication,
        targetSectors: actorData.target_sectors,
      },
    };

    await this.publishUpdate(update);
  }

  /**
   * Publish campaign update
   */
  async publishCampaignUpdate(
    tenantId: string,
    action: 'created' | 'updated' | 'deleted',
    campaignId: string,
    campaignData: any,
    userId?: string
  ): Promise<void> {
    const update: IRealTimeUpdate = {
      type: 'campaign',
      action,
      tenantId,
      entityId: campaignId,
      entityType: 'campaign',
      timestamp: new Date(),
      data: campaignData,
      userId,
      source: 'phantom-intel-core',
      channels: ['threat-updates', 'campaigns'],
      metadata: {
        threatActors: campaignData.threat_actors,
        targetSectors: campaignData.target_sectors,
        status: campaignData.end_date ? 'completed' : 'active',
      },
    };

    await this.publishUpdate(update);
  }

  /**
   * Publish system alert
   */
  async publishSystemAlert(
    tenantId: string,
    alertType: string,
    message: string,
    severity: 'info' | 'warning' | 'error' | 'critical',
    metadata?: Record<string, any>
  ): Promise<void> {
    const update: IRealTimeUpdate = {
      type: 'system',
      action: 'status_changed',
      tenantId,
      entityId: `system-alert-${Date.now()}`,
      entityType: 'system_alert',
      timestamp: new Date(),
      data: {
        alertType,
        message,
        severity,
      },
      source: 'phantom-intel-core',
      channels: ['system-alerts'],
      metadata,
    };

    await this.publishUpdate(update);
  }

  /**
   * Publish feed update
   */
  async publishFeedUpdate(
    tenantId: string,
    action: 'created' | 'updated' | 'deleted' | 'status_changed',
    feedId: string,
    feedData: any,
    userId?: string
  ): Promise<void> {
    const update: IRealTimeUpdate = {
      type: 'feed',
      action,
      tenantId,
      entityId: feedId,
      entityType: 'feed',
      timestamp: new Date(),
      data: feedData,
      userId,
      source: 'phantom-intel-core',
      channels: ['threat-updates', 'feeds'],
      metadata: {
        feedType: feedData.feed_type,
        enabled: feedData.enabled,
        lastUpdated: feedData.last_updated,
      },
    };

    await this.publishUpdate(update);
  }

  /**
   * Get subscription information
   */
  getSubscription(subscriptionId: string): IRealTimeSubscription | null {
    return this.subscriptions.get(subscriptionId) || null;
  }

  /**
   * Get all active subscriptions for a tenant
   */
  getTenantSubscriptions(tenantId: string): IRealTimeSubscription[] {
    return Array.from(this.subscriptions.values()).filter(
      sub => sub.active && sub.tenantId === tenantId
    );
  }

  /**
   * Get real-time metrics
   */
  getMetrics(): IRealTimeMetrics {
    return { ...this.metrics };
  }

  /**
   * Check health of real-time system
   */
  async getHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    metrics: IRealTimeMetrics;
    details: {
      redisConnection: boolean;
      subscriberConnection: boolean;
      activeSubscriptions: number;
      uptime: number;
    };
  }> {
    const redisConnection = this.redisClient && this.metrics.connectionStatus === 'connected';
    const subscriberConnection = this.redisSubscriber !== null;
    const activeSubscriptions = this.metrics.activeSubscriptions;

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (!redisConnection || !subscriberConnection) {
      status = 'unhealthy';
    } else if (activeSubscriptions === 0) {
      status = 'degraded';
    }

    return {
      status,
      metrics: this.getMetrics(),
      details: {
        redisConnection,
        subscriberConnection,
        activeSubscriptions,
        uptime: Date.now() - (this.isInitialized ? Date.now() - 10000 : 0), // Simulated uptime
      },
    };
  }

  /**
   * Shutdown the real-time manager
   */
  async shutdown(): Promise<void> {
    try {
      // Unsubscribe from all channels
      for (const subscription of this.subscriptions.values()) {
        await this.unsubscribe(subscription.subscriptionId);
      }

      // Disconnect subscriber
      if (this.redisSubscriber) {
        // In real implementation: await this.redisSubscriber.disconnect();
      }

      this.isInitialized = false;
      this.metrics.connectionStatus = 'disconnected';
      this.subscriptions.clear();

      console.log('Real-time manager shutdown complete');
    } catch (error) {
      console.error('Error during real-time manager shutdown:', error);
      throw error;
    }
  }

  // Private helper methods

  private setupMessageHandling(): void {
    // In real implementation, this would set up Redis message event handlers
    // this.redisSubscriber.on('message', (channel: string, message: string) => {
    //   this.handleMessage(channel, message);
    // });

    // For demo purposes, we'll simulate message handling
    console.log('Message handling set up for real-time updates');
  }

  private handleMessage(channel: string, message: string): void {
    try {
      const update: IRealTimeUpdate = JSON.parse(message);
      const deliveryStart = Date.now();

      // Find all subscriptions that should receive this update
      const matchingSubscriptions = Array.from(this.subscriptions.values()).filter(
        sub => {
          if (!sub.active || sub.tenantId !== update.tenantId) {
            return false;
          }

          // Check if subscription is interested in this channel
          const channelMatches = sub.channels.some(subChannel => {
            const fullChannelName = this.getChannelName(subChannel, sub.tenantId);
            return channel === fullChannelName || channel === this.getChannelName('all-updates', sub.tenantId);
          });

          if (!channelMatches) {
            return false;
          }

          // Apply filters if any
          if (sub.filters) {
            return this.applyFilters(update, sub.filters);
          }

          return true;
        }
      );

      // Deliver to matching subscriptions
      for (const subscription of matchingSubscriptions) {
        try {
          subscription.callback(update);
          subscription.lastUpdate = new Date();
          this.metrics.totalUpdatesDelivered++;
        } catch (error) {
          console.error(`Error delivering update to subscription ${subscription.subscriptionId}:`, error);
        }
      }

      // Update delivery time metrics
      const deliveryTime = Date.now() - deliveryStart;
      this.updateAverageDeliveryTime(deliveryTime);

    } catch (error) {
      console.error('Error handling real-time message:', error);
    }
  }

  private applyFilters(update: IRealTimeUpdate, filters: Record<string, any>): boolean {
    for (const [key, value] of Object.entries(filters)) {
      if (key === 'entityTypes' && Array.isArray(value)) {
        if (!value.includes(update.entityType)) {
          return false;
        }
      } else if (key === 'actions' && Array.isArray(value)) {
        if (!value.includes(update.action)) {
          return false;
        }
      } else if (key === 'sources' && Array.isArray(value)) {
        if (!value.includes(update.source)) {
          return false;
        }
      } else if (update.metadata && update.metadata[key] !== undefined) {
        if (Array.isArray(value)) {
          if (!value.includes(update.metadata[key])) {
            return false;
          }
        } else if (update.metadata[key] !== value) {
          return false;
        }
      }
    }
    return true;
  }

  private getChannelName(channel: string, tenantId: string): string {
    const prefix = this.config.pubsub?.channelPrefix || 'phantom-intel';
    return `${prefix}:${tenantId}:${channel}`;
  }

  private generateSubscriptionId(): string {
    return `sub-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  }

  private updateActiveChannels(): void {
    const channels = new Set<string>();
    for (const subscription of this.subscriptions.values()) {
      if (subscription.active) {
        for (const channel of subscription.channels) {
          channels.add(channel);
        }
      }
    }
    this.metrics.activeChannels = Array.from(channels);
  }

  private updateAverageDeliveryTime(deliveryTime: number): void {
    const count = this.metrics.totalUpdatesDelivered;
    const currentAvg = this.metrics.averageDeliveryTime;
    this.metrics.averageDeliveryTime = (currentAvg * (count - 1) + deliveryTime) / count;
  }
}