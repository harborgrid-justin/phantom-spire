/**
 * Standardized Route Patterns
 * Enterprise-grade route organization and middleware patterns
 */

import { Router } from 'express';
import { BaseController } from '../controllers/BaseController.js';
import { authenticateToken, authorize } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { rateLimiter } from '../middleware/rateLimiter.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

/**
 * Route Configuration Interface
 */
export interface RouteConfig {
  path: string;
  method: 'get' | 'post' | 'put' | 'patch' | 'delete';
  handler: Function;
  middleware?: Function[];
  validation?: any;
  permissions?: string[];
  rateLimit?: {
    windowMs: number;
    max: number;
  };
}

/**
 * Base Router Class
 * Provides standardized route organization patterns
 */
export abstract class BaseRouter {
  protected router: Router;
  protected basePath: string;
  protected controller: BaseController;

  constructor(basePath: string, controller: BaseController) {
    this.router = Router();
    this.basePath = basePath;
    this.controller = controller;
    this.initializeRoutes();
  }

  /**
   * Initialize routes - to be implemented by subclasses
   */
  protected abstract initializeRoutes(): void;

  /**
   * Get the configured router
   */
  public getRouter(): Router {
    return this.router;
  }

  /**
   * Register a route with standardized middleware
   */
  protected registerRoute(config: RouteConfig): void {
    const middleware: Function[] = [];

    // Add rate limiting if specified
    if (config.rateLimit) {
      middleware.push(rateLimiter(config.rateLimit));
    }

    // Add authentication
    middleware.push(authenticateToken);

    // Add authorization if permissions specified
    if (config.permissions && config.permissions.length > 0) {
      middleware.push(authorize(config.permissions));
    }

    // Add validation if specified
    if (config.validation) {
      middleware.push(validateRequest(config.validation));
    }

    // Add custom middleware
    if (config.middleware) {
      middleware.push(...config.middleware);
    }

    // Add async error handling
    middleware.push(asyncHandler(config.handler.bind(this.controller)));

    // Register the route
    this.router[config.method](config.path, ...middleware);
  }

  /**
   * Register CRUD routes with standard patterns
   */
  protected registerCrudRoutes(
    entityName: string,
    permissions: {
      read?: string[];
      create?: string[];
      update?: string[];
      delete?: string[];
    } = {},
    validationSchemas: {
      create?: any;
      update?: any;
      query?: any;
    } = {}
  ): void {
    // GET /{entities} - List entities
    this.registerRoute({
      path: '/',
      method: 'get',
      handler: (this.controller as any)[`get${entityName}s`],
      permissions: permissions.read,
      validation: validationSchemas.query
    });

    // GET /{entities}/:id - Get entity by ID
    this.registerRoute({
      path: '/:id',
      method: 'get',
      handler: (this.controller as any)[`get${entityName}`],
      permissions: permissions.read
    });

    // POST /{entities} - Create entity
    this.registerRoute({
      path: '/',
      method: 'post',
      handler: (this.controller as any)[`create${entityName}`],
      permissions: permissions.create,
      validation: validationSchemas.create,
      rateLimit: { windowMs: 60000, max: 10 } // 10 requests per minute
    });

    // PUT /{entities}/:id - Update entity
    this.registerRoute({
      path: '/:id',
      method: 'put',
      handler: (this.controller as any)[`update${entityName}`],
      permissions: permissions.update,
      validation: validationSchemas.update
    });

    // DELETE /{entities}/:id - Delete entity
    this.registerRoute({
      path: '/:id',
      method: 'delete',
      handler: (this.controller as any)[`delete${entityName}`],
      permissions: permissions.delete,
      rateLimit: { windowMs: 60000, max: 5 } // 5 requests per minute
    });
  }

  /**
   * Register health check route
   */
  protected registerHealthCheck(): void {
    this.router.get('/health', (req, res) => {
      res.json({
        success: true,
        service: this.basePath,
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });
  }

  /**
   * Register metrics endpoint
   */
  protected registerMetrics(): void {
    this.registerRoute({
      path: '/metrics',
      method: 'get',
      handler: async (req: any, res: any) => {
        // Implement metrics collection
        res.json({
          success: true,
          metrics: {
            requests: 0, // Implement actual metrics
            errors: 0,
            responseTime: 0
          }
        });
      },
      permissions: ['admin:metrics']
    });
  }
}

/**
 * Example Router Implementation
 */
export class ExampleRouter extends BaseRouter {
  constructor(controller: BaseController) {
    super('/api/v1/examples', controller);
  }

  protected initializeRoutes(): void {
    // Register standard CRUD routes
    this.registerCrudRoutes(
      'Item',
      {
        read: ['item:read'],
        create: ['item:create'],
        update: ['item:update'],
        delete: ['item:delete']
      },
      {
        create: 'createItemSchema',
        update: 'updateItemSchema',
        query: 'queryItemSchema'
      }
    );

    // Register custom routes
    this.registerRoute({
      path: '/search',
      method: 'post',
      handler: (this.controller as any).searchItems,
      permissions: ['item:search'],
      validation: 'searchItemSchema'
    });

    this.registerRoute({
      path: '/:id/status',
      method: 'patch',
      handler: (this.controller as any).updateItemStatus,
      permissions: ['item:update'],
      validation: 'updateStatusSchema'
    });

    // Register bulk operations
    this.registerRoute({
      path: '/bulk',
      method: 'post',
      handler: (this.controller as any).bulkCreateItems,
      permissions: ['item:create', 'item:bulk'],
      validation: 'bulkCreateSchema',
      rateLimit: { windowMs: 300000, max: 3 } // 3 requests per 5 minutes
    });

    this.registerRoute({
      path: '/bulk/delete',
      method: 'post',
      handler: (this.controller as any).bulkDeleteItems,
      permissions: ['item:delete', 'item:bulk'],
      validation: 'bulkDeleteSchema',
      rateLimit: { windowMs: 300000, max: 2 } // 2 requests per 5 minutes
    });

    // Register analytics routes
    this.registerRoute({
      path: '/analytics/summary',
      method: 'get',
      handler: (this.controller as any).getAnalyticsSummary,
      permissions: ['item:analytics']
    });

    this.registerRoute({
      path: '/analytics/trends',
      method: 'get',
      handler: (this.controller as any).getTrends,
      permissions: ['item:analytics']
    });

    // Register export routes
    this.registerRoute({
      path: '/export/csv',
      method: 'post',
      handler: (this.controller as any).exportToCsv,
      permissions: ['item:export'],
      rateLimit: { windowMs: 300000, max: 5 } // 5 requests per 5 minutes
    });

    this.registerRoute({
      path: '/export/json',
      method: 'post',
      handler: (this.controller as any).exportToJson,
      permissions: ['item:export'],
      rateLimit: { windowMs: 300000, max: 5 } // 5 requests per 5 minutes
    });

    // Register health check and metrics
    this.registerHealthCheck();
    this.registerMetrics();
  }
}

/**
 * Route Factory
 * Factory for creating standardized routes
 */
export class RouteFactory {
  /**
   * Create a standard CRUD router
   */
  static createCrudRouter(
    basePath: string,
    controller: BaseController,
    entityName: string,
    permissions: any = {},
    validationSchemas: any = {}
  ): Router {
    class CrudRouter extends BaseRouter {
      protected initializeRoutes(): void {
        this.registerCrudRoutes(entityName, permissions, validationSchemas);
        this.registerHealthCheck();
      }
    }

    return new CrudRouter(basePath, controller).getRouter();
  }

  /**
   * Create a read-only router
   */
  static createReadOnlyRouter(
    basePath: string,
    controller: BaseController,
    entityName: string,
    permissions: string[] = []
  ): Router {
    class ReadOnlyRouter extends BaseRouter {
      protected initializeRoutes(): void {
        // Only register read operations
        this.registerRoute({
          path: '/',
          method: 'get',
          handler: (this.controller as any)[`get${entityName}s`],
          permissions
        });

        this.registerRoute({
          path: '/:id',
          method: 'get',
          handler: (this.controller as any)[`get${entityName}`],
          permissions
        });

        this.registerHealthCheck();
      }
    }

    return new ReadOnlyRouter(basePath, controller).getRouter();
  }

  /**
   * Create an analytics router
   */
  static createAnalyticsRouter(
    basePath: string,
    controller: BaseController,
    permissions: string[] = ['analytics:read']
  ): Router {
    class AnalyticsRouter extends BaseRouter {
      protected initializeRoutes(): void {
        this.registerRoute({
          path: '/summary',
          method: 'get',
          handler: (this.controller as any).getSummary,
          permissions
        });

        this.registerRoute({
          path: '/trends',
          method: 'get',
          handler: (this.controller as any).getTrends,
          permissions
        });

        this.registerRoute({
          path: '/metrics',
          method: 'get',
          handler: (this.controller as any).getMetrics,
          permissions
        });

        this.registerHealthCheck();
      }
    }

    return new AnalyticsRouter(basePath, controller).getRouter();
  }
}