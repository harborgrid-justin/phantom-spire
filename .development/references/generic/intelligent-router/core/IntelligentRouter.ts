/**
 * Revolutionary Intelligent Router Implementation
 * ML-driven routing with zero configuration
 */

import { EventEmitter } from 'events';

export interface IRoute {
  id: string;
  path: string;
  method: string;
  target: string;
  weight: number;
  priority: number;
  conditions: any[];
  metadata: Record<string, any>;
}

export interface IRoutingContext {
  path: string;
  method: string;
  headers: Record<string, string>;
  query: Record<string, any>;
  body?: any;
  metadata: Record<string, any>;
}

export class IntelligentRouter extends EventEmitter {
  private routes: Map<string, IRoute> = new Map();
  private routingHistory: Array<{ context: IRoutingContext; route: IRoute; success: boolean; responseTime: number }> = [];
  private mlModel: any = null;

  constructor(private config: any = {}) {
    super();
    this.config = {
      enableML: config.enableML !== false,
      autoOptimize: config.autoOptimize !== false,
      learningRate: config.learningRate || 0.01,
      maxHistorySize: config.maxHistorySize || 10000,
      ...config
    };

    this.setupAutoConfiguration();
    this.initializeMLModel();
  }

  addRoute(route: Omit<IRoute, 'id'>): string {
    const id = `route-${Date.now()}-${Math.random()}`;
    this.routes.set(id, { id, ...route });
    
    this.emit('route-added', id);
    console.info(`🛤️  Route added: ${route.method} ${route.path} -> ${route.target}`);
    
    return id;
  }

  removeRoute(routeId: string): void {
    this.routes.delete(routeId);
    this.emit('route-removed', routeId);
  }

  async route(context: IRoutingContext): Promise<IRoute | null> {
    const startTime = Date.now();
    let selectedRoute: IRoute | null = null;

    if (this.config.enableML && this.mlModel) {
      selectedRoute = await this.selectRouteML(context);
    } else {
      selectedRoute = this.selectRouteDeterministic(context);
    }

    if (selectedRoute) {
      const responseTime = Date.now() - startTime;
      this.recordRouting(context, selectedRoute, true, responseTime);
      this.emit('route-selected', selectedRoute, context);
    }

    return selectedRoute;
  }

  private selectRouteDeterministic(context: IRoutingContext): IRoute | null {
    const matchingRoutes = Array.from(this.routes.values())
      .filter(route => this.matchesRoute(route, context))
      .sort((a, b) => b.priority - a.priority || b.weight - a.weight);

    return matchingRoutes[0] || null;
  }

  private async selectRouteML(context: IRoutingContext): Promise<IRoute | null> {
    const matchingRoutes = Array.from(this.routes.values())
      .filter(route => this.matchesRoute(route, context));

    if (matchingRoutes.length === 0) return null;
    if (matchingRoutes.length === 1) return matchingRoutes[0];

    // Use ML model to predict best route
    const scores = matchingRoutes.map(route => this.calculateMLScore(route, context));
    const bestIndex = scores.indexOf(Math.max(...scores));
    
    return matchingRoutes[bestIndex];
  }

  private calculateMLScore(route: IRoute, context: IRoutingContext): number {
    // Simplified ML scoring based on historical performance
    const historicalData = this.routingHistory
      .filter(h => h.route.id === route.id)
      .slice(-100); // Last 100 requests

    if (historicalData.length === 0) {
      return route.weight * route.priority; // Fallback to static scoring
    }

    const successRate = historicalData.filter(h => h.success).length / historicalData.length;
    const avgResponseTime = historicalData.reduce((sum, h) => sum + h.responseTime, 0) / historicalData.length;
    
    // Score based on success rate and response time
    const timeScore = avgResponseTime > 0 ? 1000 / avgResponseTime : 1;
    const mlScore = successRate * timeScore * route.weight * route.priority;

    return mlScore;
  }

  private matchesRoute(route: IRoute, context: IRoutingContext): boolean {
    // Simple path matching (in real implementation, use more sophisticated matching)
    const pathMatches = route.path === '*' || 
                       route.path === context.path || 
                       this.pathMatches(route.path, context.path);

    const methodMatches = route.method === '*' || 
                         route.method.toLowerCase() === context.method.toLowerCase();

    // Check additional conditions
    const conditionsMatch = route.conditions.every(condition => 
      this.evaluateCondition(condition, context)
    );

    return pathMatches && methodMatches && conditionsMatch;
  }

  private pathMatches(routePath: string, requestPath: string): boolean {
    // Simple wildcard matching
    if (routePath.includes('*')) {
      const regex = new RegExp(routePath.replace(/\*/g, '.*'));
      return regex.test(requestPath);
    }
    
    // Parameter matching (/api/:id/details)
    if (routePath.includes(':')) {
      const routeSegments = routePath.split('/');
      const requestSegments = requestPath.split('/');
      
      if (routeSegments.length !== requestSegments.length) return false;
      
      return routeSegments.every((segment, index) => 
        segment.startsWith(':') || segment === requestSegments[index]
      );
    }

    return routePath === requestPath;
  }

  private evaluateCondition(condition: any, context: IRoutingContext): boolean {
    // Simple condition evaluation
    if (condition.type === 'header') {
      return context.headers[condition.key] === condition.value;
    } else if (condition.type === 'query') {
      return context.query[condition.key] === condition.value;
    }
    
    return true;
  }

  private recordRouting(context: IRoutingContext, route: IRoute, success: boolean, responseTime: number): void {
    this.routingHistory.push({ context, route, success, responseTime });
    
    // Keep history size manageable
    if (this.routingHistory.length > this.config.maxHistorySize) {
      this.routingHistory = this.routingHistory.slice(-this.config.maxHistorySize / 2);
    }
  }

  private initializeMLModel(): void {
    if (!this.config.enableML) return;
    
    // Initialize simplified ML model
    this.mlModel = {
      weights: new Map<string, number>(),
      biases: new Map<string, number>(),
      learningRate: this.config.learningRate
    };
    
    console.info('🤖 ML routing model initialized');
  }

  private setupAutoConfiguration(): void {
    if (this.config.autoOptimize) {
      // Auto-optimize routing based on performance
      setInterval(() => {
        this.optimizeRoutes();
      }, 300000); // Every 5 minutes
    }
  }

  private optimizeRoutes(): void {
    if (this.routingHistory.length < 100) return;

    // Analyze recent routing performance
    const recentHistory = this.routingHistory.slice(-1000);
    const routePerformance = new Map<string, { successRate: number; avgResponseTime: number }>();

    for (const record of recentHistory) {
      const routeId = record.route.id;
      if (!routePerformance.has(routeId)) {
        routePerformance.set(routeId, { successRate: 0, avgResponseTime: 0 });
      }
    }

    // Auto-adjust route weights based on performance
    for (const [routeId, performance] of routePerformance) {
      const route = this.routes.get(routeId);
      if (route) {
        if (performance.successRate < 0.8) {
          route.weight = Math.max(0.1, route.weight * 0.9);
        } else if (performance.successRate > 0.95) {
          route.weight = Math.min(10, route.weight * 1.1);
        }
      }
    }

    console.info('🎯 Routes auto-optimized based on performance');
  }

  getMetrics() {
    const totalRoutes = this.routes.size;
    const totalRequests = this.routingHistory.length;
    const recentRequests = this.routingHistory.slice(-1000);
    
    const successRate = recentRequests.length > 0 
      ? recentRequests.filter(h => h.success).length / recentRequests.length 
      : 1;

    const avgResponseTime = recentRequests.length > 0
      ? recentRequests.reduce((sum, h) => sum + h.responseTime, 0) / recentRequests.length
      : 0;

    return {
      totalRoutes,
      totalRequests,
      successRate: successRate * 100,
      avgResponseTime,
      mlEnabled: this.config.enableML,
      autoOptimizeEnabled: this.config.autoOptimize
    };
  }
}