/**
 * CVE Real-Time Notification Service
 * WebSocket-based real-time CVE notifications and streaming updates
 */

import { Server as HTTPServer } from 'http';
import { Server as WebSocketServer, Socket } from 'socket.io';
import { EventEmitter } from 'events';
import { logger } from '../../utils/logger.js';
import { CVE } from '../../types/cve.js';
import { ICVEFeedData } from '../data-layer/ingestion/connectors/CVERealTimeConnector.js';

export interface ICVENotificationConfig {
  // WebSocket Configuration
  port?: number;
  path: string;
  cors: {
    origin: string | string[];
    methods: string[];
  };
  
  // Real-time Features
  enableBroadcast: boolean;
  enableRoomBasedNotifications: boolean;
  enablePrivateNotifications: boolean;
  
  // Filtering & Routing
  enableSeverityRouting: boolean;
  enableTagBasedRouting: boolean;
  enableUserPreferences: boolean;
  
  // Performance
  maxConnections: number;
  messageBufferSize: number;
  broadcastThrottleMs: number;
  
  // Security
  requireAuth: boolean;
  tokenValidation?: (token: string) => Promise<{ valid: boolean; userId?: string; permissions?: string[] }>;
}

export interface ICVENotificationData {
  type: 'new-cve' | 'cve-updated' | 'cve-alert' | 'severity-change' | 'exploit-available' | 'patch-available';
  cve: CVE;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  message: string;
  timestamp: Date;
  source: string;
  metadata?: {
    changeType?: string;
    previousSeverity?: string;
    affectedSystems?: string[];
    recommendation?: string;
  };
}

export interface IClientSubscription {
  userId?: string;
  socketId: string;
  subscriptions: {
    severityFilter: ('critical' | 'high' | 'medium' | 'low')[];
    tagFilter: string[];
    cveIdFilter: string[];
    sourceFilter: string[];
  };
  rooms: string[];
  lastActivity: Date;
}

export class CVERealTimeNotificationService extends EventEmitter {
  private config: ICVENotificationConfig;
  private io: WebSocketServer;
  private httpServer?: HTTPServer;
  private clients: Map<string, IClientSubscription> = new Map();
  private messageBuffer: ICVENotificationData[] = [];
  private broadcastThrottle?: NodeJS.Timeout;
  private isRunning = false;

  constructor(config: ICVENotificationConfig, httpServer?: HTTPServer) {
    super();
    this.config = config;
    this.httpServer = httpServer;
    
    // Initialize WebSocket server
    this.io = new WebSocketServer(httpServer || config.port || 3001, {
      path: config.path,
      cors: config.cors,
      maxHttpBufferSize: 1e6, // 1MB
      pingTimeout: 60000,
      pingInterval: 25000,
    });
    
    this.setupWebSocketHandlers();
    
    logger.info('CVE Real-Time Notification Service initialized', {
      path: config.path,
      maxConnections: config.maxConnections,
      requireAuth: config.requireAuth,
    });
  }

  /**
   * Start the notification service
   */
  public async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('CVE Notification Service already running');
      return;
    }

    try {
      // Start WebSocket server if not using existing HTTP server
      if (!this.httpServer && this.config.port) {
        await new Promise<void>((resolve, reject) => {
          const server = this.io.listen(this.config.port!, (err: any) => {
            if (err) reject(err);
            else resolve();
          });
        });
      }

      this.isRunning = true;
      this.emit('started');
      
      logger.info('CVE Real-Time Notification Service started', {
        port: this.config.port,
        path: this.config.path,
      });
    } catch (error) {
      const errorMessage = `Failed to start CVE Notification Service: ${error instanceof Error ? error.message : 'Unknown error'}`;
      logger.error(errorMessage, error);
      throw error;
    }
  }

  /**
   * Stop the notification service
   */
  public async stop(): Promise<void> {
    if (!this.isRunning) {
      logger.warn('CVE Notification Service not running');
      return;
    }

    try {
      // Clear throttle timer
      if (this.broadcastThrottle) {
        clearTimeout(this.broadcastThrottle);
        this.broadcastThrottle = undefined;
      }

      // Disconnect all clients
      this.io.disconnectSockets(true);
      
      // Close server
      this.io.close();
      
      this.isRunning = false;
      this.emit('stopped');
      
      logger.info('CVE Real-Time Notification Service stopped');
    } catch (error) {
      const errorMessage = `Error stopping CVE Notification Service: ${error instanceof Error ? error.message : 'Unknown error'}`;
      logger.error(errorMessage, error);
      throw error;
    }
  }

  /**
   * Notify about new CVE
   */
  public async notifyNewCVE(cveData: ICVEFeedData): Promise<void> {
    const notification: ICVENotificationData = {
      type: 'new-cve',
      cve: cveData.cve,
      severity: cveData.cve.scoring.severity,
      message: `New CVE detected: ${cveData.cve.cveId} - ${cveData.cve.title}`,
      timestamp: new Date(),
      source: cveData.source,
      metadata: {
        recommendation: this.generateRecommendation(cveData.cve),
      },
    };

    await this.processNotification(notification);
  }

  /**
   * Notify about CVE updates
   */
  public async notifyCVEUpdate(
    updatedCVE: CVE,
    previousData: Partial<CVE>,
    changeType: string
  ): Promise<void> {
    const notification: ICVENotificationData = {
      type: 'cve-updated',
      cve: updatedCVE,
      severity: updatedCVE.scoring.severity,
      message: `CVE updated: ${updatedCVE.cveId} - ${changeType}`,
      timestamp: new Date(),
      source: updatedCVE.source,
      metadata: {
        changeType,
        previousSeverity: previousData.scoring?.severity,
        recommendation: this.generateUpdateRecommendation(updatedCVE, changeType),
      },
    };

    await this.processNotification(notification);
  }

  /**
   * Send critical CVE alert
   */
  public async sendCriticalAlert(cve: CVE, alertMessage: string): Promise<void> {
    const notification: ICVENotificationData = {
      type: 'cve-alert',
      cve: cve,
      severity: 'critical',
      message: alertMessage,
      timestamp: new Date(),
      source: cve.source,
      metadata: {
        recommendation: 'URGENT: Immediate action required',
        affectedSystems: cve.assetImpacts.map(impact => impact.assetName),
      },
    };

    // Critical alerts bypass throttling
    await this.broadcastNotification(notification, { immediate: true });
  }

  /**
   * Get connected clients statistics
   */
  public getClientStats(): {
    totalConnections: number;
    authenticatedUsers: number;
    subscriptionBreakdown: Record<string, number>;
  } {
    const totalConnections = this.clients.size;
    const authenticatedUsers = Array.from(this.clients.values())
      .filter(client => client.userId).length;
    
    const subscriptionBreakdown: Record<string, number> = {};
    this.clients.forEach(client => {
      client.subscriptions.severityFilter.forEach(severity => {
        subscriptionBreakdown[severity] = (subscriptionBreakdown[severity] || 0) + 1;
      });
    });

    return {
      totalConnections,
      authenticatedUsers,
      subscriptionBreakdown,
    };
  }

  /**
   * Private methods
   */

  private setupWebSocketHandlers(): void {
    this.io.on('connection', async (socket: Socket) => {
      try {
        logger.info('New WebSocket connection', { socketId: socket.id });

        // Check connection limit
        if (this.clients.size >= this.config.maxConnections) {
          logger.warn('Connection limit reached, rejecting connection');
          socket.emit('error', { message: 'Connection limit reached' });
          socket.disconnect(true);
          return;
        }

        // Initialize client subscription
        const clientSubscription: IClientSubscription = {
          socketId: socket.id,
          subscriptions: {
            severityFilter: ['critical', 'high', 'medium'],
            tagFilter: [],
            cveIdFilter: [],
            sourceFilter: [],
          },
          rooms: [],
          lastActivity: new Date(),
        };

        // Handle authentication if required
        if (this.config.requireAuth) {
          socket.on('authenticate', async (data: { token: string }) => {
            if (this.config.tokenValidation) {
              const validation = await this.config.tokenValidation(data.token);
              if (validation.valid) {
                clientSubscription.userId = validation.userId;
                socket.emit('authenticated', { userId: validation.userId });
                logger.info('Client authenticated', { 
                  socketId: socket.id, 
                  userId: validation.userId 
                });
              } else {
                socket.emit('authentication_failed');
                socket.disconnect(true);
                return;
              }
            }
          });
        }

        // Handle subscription updates
        socket.on('subscribe', (data: {
          severityFilter?: string[];
          tagFilter?: string[];
          cveIdFilter?: string[];
          sourceFilter?: string[];
          rooms?: string[];
        }) => {
          if (data.severityFilter) {
            clientSubscription.subscriptions.severityFilter = data.severityFilter as any;
          }
          if (data.tagFilter) {
            clientSubscription.subscriptions.tagFilter = data.tagFilter;
          }
          if (data.cveIdFilter) {
            clientSubscription.subscriptions.cveIdFilter = data.cveIdFilter;
          }
          if (data.sourceFilter) {
            clientSubscription.subscriptions.sourceFilter = data.sourceFilter;
          }
          if (data.rooms) {
            // Join/leave rooms
            clientSubscription.rooms.forEach(room => socket.leave(room));
            data.rooms.forEach(room => socket.join(room));
            clientSubscription.rooms = data.rooms;
          }

          clientSubscription.lastActivity = new Date();
          socket.emit('subscription_updated', clientSubscription.subscriptions);
          
          logger.info('Client subscription updated', {
            socketId: socket.id,
            userId: clientSubscription.userId,
            subscriptions: clientSubscription.subscriptions,
          });
        });

        // Handle ping/pong for connection health
        socket.on('ping', () => {
          clientSubscription.lastActivity = new Date();
          socket.emit('pong');
        });

        // Handle disconnection
        socket.on('disconnect', (reason) => {
          this.clients.delete(socket.id);
          logger.info('Client disconnected', {
            socketId: socket.id,
            userId: clientSubscription.userId,
            reason,
          });
        });

        // Store client subscription
        this.clients.set(socket.id, clientSubscription);
        
        // Send welcome message
        socket.emit('connected', {
          message: 'Connected to CVE Real-Time Notifications',
          features: {
            enableBroadcast: this.config.enableBroadcast,
            enableRoomBasedNotifications: this.config.enableRoomBasedNotifications,
            enableSeverityRouting: this.config.enableSeverityRouting,
          },
        });

      } catch (error) {
        logger.error('Error handling WebSocket connection', error);
        socket.emit('error', { message: 'Connection setup failed' });
        socket.disconnect(true);
      }
    });
  }

  private async processNotification(notification: ICVENotificationData): Promise<void> {
    try {
      // Add to message buffer
      this.messageBuffer.push(notification);
      
      // Keep buffer size manageable
      if (this.messageBuffer.length > this.config.messageBufferSize) {
        this.messageBuffer.shift(); // Remove oldest message
      }

      // Handle immediate broadcasts for critical notifications
      if (notification.severity === 'critical' || notification.type === 'cve-alert') {
        await this.broadcastNotification(notification, { immediate: true });
      } else {
        // Use throttled broadcast for regular notifications
        this.scheduleThrottledBroadcast();
      }

      // Emit event for external listeners
      this.emit('notification', notification);

    } catch (error) {
      logger.error('Error processing notification', error);
    }
  }

  private scheduleThrottledBroadcast(): void {
    if (this.broadcastThrottle) {
      return; // Already scheduled
    }

    this.broadcastThrottle = setTimeout(async () => {
      try {
        // Process buffered messages
        const messages = [...this.messageBuffer];
        this.messageBuffer.length = 0; // Clear buffer
        
        for (const notification of messages) {
          if (notification.severity !== 'critical' && notification.type !== 'cve-alert') {
            await this.broadcastNotification(notification);
          }
        }
      } catch (error) {
        logger.error('Error in throttled broadcast', error);
      } finally {
        this.broadcastThrottle = undefined;
      }
    }, this.config.broadcastThrottleMs);
  }

  private async broadcastNotification(
    notification: ICVENotificationData,
    options: { immediate?: boolean } = {}
  ): Promise<void> {
    try {
      let targetClients = 0;

      // Iterate through all connected clients
      for (const [socketId, client] of this.clients.entries()) {
        if (this.shouldNotifyClient(client, notification)) {
          const socket = this.io.sockets.sockets.get(socketId);
          if (socket) {
            socket.emit('cve_notification', notification);
            targetClients++;
          }
        }
      }

      // Broadcast to rooms if enabled
      if (this.config.enableRoomBasedNotifications) {
        const roomName = `severity_${notification.severity}`;
        this.io.to(roomName).emit('cve_notification', notification);
      }

      logger.debug('CVE notification broadcast completed', {
        notificationType: notification.type,
        cveId: notification.cve.cveId,
        severity: notification.severity,
        targetClients,
        immediate: options.immediate,
      });

    } catch (error) {
      logger.error('Error broadcasting notification', error);
    }
  }

  private shouldNotifyClient(
    client: IClientSubscription,
    notification: ICVENotificationData
  ): boolean {
    // Check severity filter
    if (!client.subscriptions.severityFilter.includes(notification.severity)) {
      return false;
    }

    // Check source filter
    if (client.subscriptions.sourceFilter.length > 0 &&
        !client.subscriptions.sourceFilter.includes(notification.source)) {
      return false;
    }

    // Check CVE ID filter
    if (client.subscriptions.cveIdFilter.length > 0 &&
        !client.subscriptions.cveIdFilter.includes(notification.cve.cveId)) {
      return false;
    }

    // Check tag filter
    if (client.subscriptions.tagFilter.length > 0) {
      const hasMatchingTag = client.subscriptions.tagFilter.some(tag =>
        notification.cve.tags.includes(tag)
      );
      if (!hasMatchingTag) {
        return false;
      }
    }

    return true;
  }

  private generateRecommendation(cve: CVE): string {
    const severity = cve.scoring.severity;
    const hasExploit = cve.exploitInfo.exploitAvailable;
    const hasPatch = cve.patchInfo.patchAvailable;

    if (severity === 'critical' && hasExploit) {
      return 'URGENT: Critical vulnerability with active exploits - immediate patching required';
    } else if (severity === 'high' && hasExploit) {
      return 'HIGH PRIORITY: Exploited vulnerability - prioritize patching';
    } else if (hasPatch) {
      return `${severity.toUpperCase()} severity - patch available, schedule update`;
    } else {
      return `${severity.toUpperCase()} severity - monitor for patches and mitigations`;
    }
  }

  private generateUpdateRecommendation(cve: CVE, changeType: string): string {
    switch (changeType) {
      case 'severity_increased':
        return 'Severity increased - reassess risk and update remediation timeline';
      case 'exploit_added':
        return 'Exploit information added - escalate remediation priority';
      case 'patch_available':
        return 'Patch now available - schedule deployment';
      case 'asset_impact_updated':
        return 'Asset impact updated - review affected systems';
      default:
        return 'CVE information updated - review changes and adjust response';
    }
  }
}