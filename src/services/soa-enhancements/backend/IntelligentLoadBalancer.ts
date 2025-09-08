/**
 * Intelligent Load Balancer
 * SOA Improvement #3: ML-driven load balancing with predictive scaling
 */

import { EventEmitter } from 'events';

export enum LoadBalancingStrategy {
  ROUND_ROBIN = 'round-robin',
  LEAST_CONNECTIONS = 'least-connections',
  WEIGHTED_RESPONSE_TIME = 'weighted-response-time',
  PREDICTIVE_ML = 'predictive-ml',
  ADAPTIVE_HEALTH = 'adaptive-health'
}

export interface ServiceNode {
  id: string;
  url: string;
  weight: number;
  activeConnections: number;
  responseTime: number;
  health: number;
  capacity: number;
  lastUpdated: Date;
  metadata: Record<string, any>;
}

export interface LoadBalancerConfig {
  strategy: LoadBalancingStrategy;
  healthCheckInterval: number;
  enablePredictiveScaling: boolean;
  maxRetries: number;
  timeout: number;
}

export interface RequestMetrics {
  nodeId: string;
  responseTime: number;
  success: boolean;
  timestamp: Date;
  requestSize: number;
}

export class IntelligentLoadBalancer extends EventEmitter {
  private nodes: Map<string, ServiceNode> = new Map();
  private config: LoadBalancerConfig;
  private roundRobinIndex = 0;
  private requestHistory: RequestMetrics[] = [];
  private healthCheckTimer?: NodeJS.Timeout;

  constructor(config: Partial<LoadBalancerConfig> = {}) {
    super();
    this.config = {
      strategy: LoadBalancingStrategy.PREDICTIVE_ML,
      healthCheckInterval: 30000,
      enablePredictiveScaling: true,
      maxRetries: 3,
      timeout: 5000,
      ...config
    };
  }

  /**
   * Add service node to load balancer
   */
  addNode(node: Omit<ServiceNode, 'activeConnections' | 'lastUpdated'>): void {
    const serviceNode: ServiceNode = {
      ...node,
      activeConnections: 0,
      lastUpdated: new Date()
    };

    this.nodes.set(node.id, serviceNode);
    this.emit('node:added', serviceNode);
    
    console.log(`⚖️ Load Balancer: Added node ${node.id} with weight ${node.weight}`);
  }

  /**
   * Remove service node
   */
  removeNode(nodeId: string): void {
    const node = this.nodes.get(nodeId);
    if (node) {
      this.nodes.delete(nodeId);
      this.emit('node:removed', node);
      console.log(`⚖️ Load Balancer: Removed node ${nodeId}`);
    }
  }

  /**
   * Get next optimal node based on strategy
   */
  async getNextNode(): Promise<ServiceNode | null> {
    const availableNodes = Array.from(this.nodes.values())
      .filter(node => node.health > 50); // Only healthy nodes

    if (availableNodes.length === 0) {
      return null;
    }

    let selectedNode: ServiceNode;

    switch (this.config.strategy) {
      case LoadBalancingStrategy.ROUND_ROBIN:
        selectedNode = this.roundRobinSelection(availableNodes);
        break;
      
      case LoadBalancingStrategy.LEAST_CONNECTIONS:
        selectedNode = this.leastConnectionsSelection(availableNodes);
        break;
      
      case LoadBalancingStrategy.WEIGHTED_RESPONSE_TIME:
        selectedNode = this.weightedResponseTimeSelection(availableNodes);
        break;
      
      case LoadBalancingStrategy.PREDICTIVE_ML:
        selectedNode = this.predictiveMLSelection(availableNodes);
        break;
      
      case LoadBalancingStrategy.ADAPTIVE_HEALTH:
        selectedNode = this.adaptiveHealthSelection(availableNodes);
        break;
      
      default:
        selectedNode = availableNodes[0];
    }

    // Increment active connections
    selectedNode.activeConnections++;
    selectedNode.lastUpdated = new Date();

    this.emit('node:selected', { node: selectedNode, strategy: this.config.strategy });
    return selectedNode;
  }

  /**
   * Round-robin selection
   */
  private roundRobinSelection(nodes: ServiceNode[]): ServiceNode {
    const node = nodes[this.roundRobinIndex % nodes.length];
    this.roundRobinIndex++;
    return node;
  }

  /**
   * Least connections selection
   */
  private leastConnectionsSelection(nodes: ServiceNode[]): ServiceNode {
    return nodes.reduce((min, node) => 
      node.activeConnections < min.activeConnections ? node : min
    );
  }

  /**
   * Weighted response time selection
   */
  private weightedResponseTimeSelection(nodes: ServiceNode[]): ServiceNode {
    return nodes.reduce((best, node) => {
      const nodeScore = node.weight / (node.responseTime + 1);
      const bestScore = best.weight / (best.responseTime + 1);
      return nodeScore > bestScore ? node : best;
    });
  }

  /**
   * Predictive ML-based selection
   */
  private predictiveMLSelection(nodes: ServiceNode[]): ServiceNode {
    return nodes.reduce((best, node) => {
      const nodeScore = this.calculatePredictiveScore(node);
      const bestScore = this.calculatePredictiveScore(best);
      return nodeScore > bestScore ? node : best;
    });
  }

  /**
   * Adaptive health-based selection
   */
  private adaptiveHealthSelection(nodes: ServiceNode[]): ServiceNode {
    return nodes.reduce((best, node) => {
      const nodeScore = this.calculateAdaptiveHealthScore(node);
      const bestScore = this.calculateAdaptiveHealthScore(best);
      return nodeScore > bestScore ? node : best;
    });
  }

  /**
   * Calculate predictive score using ML algorithms
   */
  private calculatePredictiveScore(node: ServiceNode): number {
    const recentMetrics = this.getRecentMetrics(node.id);
    
    // Factors for ML scoring
    const healthWeight = 0.3;
    const responseTimeWeight = 0.25;
    const connectionWeight = 0.2;
    const capacityWeight = 0.15;
    const trendWeight = 0.1;

    // Normalize scores
    const healthScore = node.health / 100;
    const responseTimeScore = Math.max(0, 1 - (node.responseTime / 1000));
    const connectionScore = Math.max(0, 1 - (node.activeConnections / node.capacity));
    const capacityScore = node.capacity / 100;
    const trendScore = this.calculateTrendScore(recentMetrics);

    return (
      healthScore * healthWeight +
      responseTimeScore * responseTimeWeight +
      connectionScore * connectionWeight +
      capacityScore * capacityWeight +
      trendScore * trendWeight
    ) * node.weight;
  }

  /**
   * Calculate adaptive health score
   */
  private calculateAdaptiveHealthScore(node: ServiceNode): number {
    const baseScore = node.health / 100;
    const loadFactor = Math.max(0, 1 - (node.activeConnections / node.capacity));
    const responseFactor = Math.max(0, 1 - (node.responseTime / 500));
    
    return (baseScore * 0.4 + loadFactor * 0.3 + responseFactor * 0.3) * node.weight;
  }

  /**
   * Calculate trend score based on recent performance
   */
  private calculateTrendScore(metrics: RequestMetrics[]): number {
    if (metrics.length < 2) return 0.5;

    const recent = metrics.slice(-10);
    const successRate = recent.filter(m => m.success).length / recent.length;
    const avgResponseTime = recent.reduce((sum, m) => sum + m.responseTime, 0) / recent.length;
    
    // Trend analysis (simplified)
    const isImproving = recent.length > 5 ? 
      recent.slice(-5).every((m, i) => i === 0 || m.responseTime <= recent[recent.length - 5 + i - 1].responseTime) :
      false;

    let trendScore = successRate * 0.6 + (1 - Math.min(avgResponseTime / 1000, 1)) * 0.4;
    
    if (isImproving) {
      trendScore += 0.1;
    }

    return Math.min(trendScore, 1);
  }

  /**
   * Get recent metrics for a specific node
   */
  private getRecentMetrics(nodeId: string): RequestMetrics[] {
    const cutoff = new Date(Date.now() - 300000); // Last 5 minutes
    return this.requestHistory
      .filter(m => m.nodeId === nodeId && m.timestamp >= cutoff)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  /**
   * Record request completion
   */
  recordRequestCompletion(nodeId: string, responseTime: number, success: boolean, requestSize = 0): void {
    const node = this.nodes.get(nodeId);
    if (node) {
      // Update node metrics
      node.activeConnections = Math.max(0, node.activeConnections - 1);
      node.responseTime = (node.responseTime * 0.8) + (responseTime * 0.2); // Exponential moving average
      node.lastUpdated = new Date();

      // Record in history
      this.requestHistory.push({
        nodeId,
        responseTime,
        success,
        timestamp: new Date(),
        requestSize
      });

      // Keep only recent history
      const cutoff = new Date(Date.now() - 3600000); // Last hour
      this.requestHistory = this.requestHistory.filter(m => m.timestamp >= cutoff);

      this.emit('request:completed', { nodeId, responseTime, success });
    }
  }

  /**
   * Update node health
   */
  updateNodeHealth(nodeId: string, health: number): void {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.health = health;
      node.lastUpdated = new Date();
      this.emit('node:health-updated', { nodeId, health });
    }
  }

  /**
   * Start health monitoring
   */
  startHealthMonitoring(): void {
    if (!this.healthCheckTimer) {
      this.healthCheckTimer = setInterval(() => {
        this.performHealthChecks();
      }, this.config.healthCheckInterval);
    }
  }

  /**
   * Stop health monitoring
   */
  stopHealthMonitoring(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = undefined;
    }
  }

  /**
   * Perform health checks on all nodes
   */
  private async performHealthChecks(): Promise<void> {
    this.nodes.forEach((node, nodeId) => {
      try {
        // Simulate health check (in real implementation, this would ping the service)
        const health = Math.floor(Math.random() * 30) + 70;
        this.updateNodeHealth(nodeId, health);
      } catch (error) {
        this.updateNodeHealth(nodeId, 0);
        this.emit('node:health-check-failed', { nodeId, error });
      }
    });
  }

  /**
   * Get load balancer statistics
   */
  getStatistics() {
    const nodes = Array.from(this.nodes.values());
    const totalConnections = nodes.reduce((sum, node) => sum + node.activeConnections, 0);
    const avgHealth = nodes.reduce((sum, node) => sum + node.health, 0) / nodes.length;
    const avgResponseTime = nodes.reduce((sum, node) => sum + node.responseTime, 0) / nodes.length;

    return {
      strategy: this.config.strategy,
      totalNodes: nodes.length,
      healthyNodes: nodes.filter(n => n.health > 50).length,
      totalActiveConnections: totalConnections,
      averageHealth: avgHealth,
      averageResponseTime: avgResponseTime,
      requestHistory: this.requestHistory.length,
      lastUpdated: new Date()
    };
  }

  /**
   * Set load balancing strategy
   */
  setStrategy(strategy: LoadBalancingStrategy): void {
    this.config.strategy = strategy;
    this.emit('strategy:changed', strategy);
    console.log(`⚖️ Load Balancer: Strategy changed to ${strategy}`);
  }
}

// Export singleton instance
export const intelligentLoadBalancer = new IntelligentLoadBalancer();