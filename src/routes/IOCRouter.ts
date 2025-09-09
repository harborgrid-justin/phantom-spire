/**
 * IOC Router - Standardized Implementation
 * Follows BaseRouter pattern for enterprise-grade IOC route management
 */

import { body, query, param } from 'express-validator';
import { BaseRouter } from './BaseRouter';
import { IOCController } from '../controllers/iocController';

/**
 * IOC Router extending BaseRouter
 * Provides standardized IOC routes with enterprise patterns
 */
export class IOCRouter extends BaseRouter {
  constructor(controller: IOCController) {
    super('/api/v1/iocs', controller);
  }

  protected initializeRoutes(): void {
    // Register standard CRUD routes
    this.registerCrudRoutes(
      'IOC',
      {
        read: ['ioc:read'],
        create: ['ioc:create'],
        update: ['ioc:update'],
        delete: ['ioc:delete']
      },
      {
        create: this.createIOCValidation(),
        update: this.updateIOCValidation(),
        query: this.queryIOCValidation()
      }
    );

    // Register custom IOC routes
    this.registerRoute({
      path: '/search',
      method: 'post',
      handler: (this.controller as IOCController).searchIOCs,
      permissions: ['ioc:search'],
      validation: this.searchIOCValidation(),
      rateLimit: { windowMs: 60000, max: 60 } // 60 requests per minute
    });

    this.registerRoute({
      path: '/:id/analyze',
      method: 'post',
      handler: (this.controller as IOCController).analyzeIOC,
      permissions: ['ioc:analyze'],
      validation: this.idValidation(),
      rateLimit: { windowMs: 60000, max: 20 } // 20 analyses per minute
    });

    this.registerRoute({
      path: '/:id/enrich',
      method: 'post',
      handler: (this.controller as IOCController).enrichIOC,
      permissions: ['ioc:enrich'],
      validation: this.idValidation(),
      rateLimit: { windowMs: 60000, max: 10 } // 10 enrichments per minute
    });

    // Bulk operations
    this.registerRoute({
      path: '/bulk',
      method: 'post',
      handler: (this.controller as IOCController).bulkCreateIOCs,
      permissions: ['ioc:create', 'ioc:bulk'],
      validation: this.bulkCreateValidation(),
      rateLimit: { windowMs: 300000, max: 5 } // 5 bulk operations per 5 minutes
    });

    // Statistics and analytics
    this.registerRoute({
      path: '/statistics',
      method: 'get',
      handler: (this.controller as IOCController).getIOCStatistics,
      permissions: ['ioc:analytics', 'ioc:read']
    });

    // Register health check and metrics
    this.registerHealthCheck();
    this.registerMetrics();
  }

  /**
   * Validation schema for creating IOCs
   */
  private createIOCValidation() {
    return [
      body('type')
        .notEmpty()
        .withMessage('IOC type is required')
        .isIn(['ip', 'domain', 'url', 'hash', 'email'])
        .withMessage('Invalid IOC type'),
      
      body('value')
        .notEmpty()
        .withMessage('IOC value is required')
        .isLength({ min: 1, max: 2000 })
        .withMessage('IOC value must be between 1 and 2000 characters'),
      
      body('severity')
        .notEmpty()
        .withMessage('Severity is required')
        .isIn(['low', 'medium', 'high', 'critical'])
        .withMessage('Invalid severity level'),
      
      body('description')
        .optional()
        .isString()
        .isLength({ max: 5000 })
        .withMessage('Description must be less than 5000 characters'),
      
      body('source')
        .optional()
        .isString()
        .isLength({ max: 200 })
        .withMessage('Source must be less than 200 characters'),
      
      body('confidence')
        .optional()
        .isInt({ min: 0, max: 100 })
        .withMessage('Confidence must be between 0 and 100'),
      
      body('tags')
        .optional()
        .isArray()
        .withMessage('Tags must be an array'),
      
      body('tags.*')
        .optional()
        .isString()
        .isLength({ min: 1, max: 50 })
        .withMessage('Each tag must be between 1 and 50 characters'),
      
      body('expiresAt')
        .optional()
        .isISO8601()
        .withMessage('Expiration date must be a valid ISO 8601 date'),
      
      body('metadata')
        .optional()
        .isObject()
        .withMessage('Metadata must be an object')
    ];
  }

  /**
   * Validation schema for updating IOCs
   */
  private updateIOCValidation() {
    return [
      param('id')
        .notEmpty()
        .withMessage('IOC ID is required')
        .isMongoId()
        .withMessage('Invalid IOC ID format'),
      
      body('type')
        .optional()
        .isIn(['ip', 'domain', 'url', 'hash', 'email'])
        .withMessage('Invalid IOC type'),
      
      body('value')
        .optional()
        .isLength({ min: 1, max: 2000 })
        .withMessage('IOC value must be between 1 and 2000 characters'),
      
      body('severity')
        .optional()
        .isIn(['low', 'medium', 'high', 'critical'])
        .withMessage('Invalid severity level'),
      
      body('status')
        .optional()
        .isIn(['active', 'inactive', 'expired', 'false_positive'])
        .withMessage('Invalid status'),
      
      body('description')
        .optional()
        .isString()
        .isLength({ max: 5000 })
        .withMessage('Description must be less than 5000 characters'),
      
      body('confidence')
        .optional()
        .isInt({ min: 0, max: 100 })
        .withMessage('Confidence must be between 0 and 100'),
      
      body('tags')
        .optional()
        .isArray()
        .withMessage('Tags must be an array'),
      
      body('tags.*')
        .optional()
        .isString()
        .isLength({ min: 1, max: 50 })
        .withMessage('Each tag must be between 1 and 50 characters')
    ];
  }

  /**
   * Validation schema for querying IOCs
   */
  private queryIOCValidation() {
    return [
      query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
      
      query('pageSize')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Page size must be between 1 and 100'),
      
      query('type')
        .optional()
        .isIn(['ip', 'domain', 'url', 'hash', 'email'])
        .withMessage('Invalid IOC type'),
      
      query('severity')
        .optional()
        .isIn(['low', 'medium', 'high', 'critical'])
        .withMessage('Invalid severity level'),
      
      query('status')
        .optional()
        .isIn(['active', 'inactive', 'expired', 'false_positive'])
        .withMessage('Invalid status'),
      
      query('search')
        .optional()
        .isString()
        .isLength({ min: 1, max: 100 })
        .withMessage('Search query must be between 1 and 100 characters'),
      
      query('tags')
        .optional()
        .isString()
        .withMessage('Tags filter must be a string'),
      
      query('dateFrom')
        .optional()
        .isISO8601()
        .withMessage('Date from must be a valid ISO 8601 date'),
      
      query('dateTo')
        .optional()
        .isISO8601()
        .withMessage('Date to must be a valid ISO 8601 date'),
      
      query('sort')
        .optional()
        .isIn(['createdAt', 'updatedAt', 'severity', 'confidence', 'type'])
        .withMessage('Invalid sort field'),
      
      query('order')
        .optional()
        .isIn(['asc', 'desc'])
        .withMessage('Order must be asc or desc')
    ];
  }

  /**
   * Validation schema for searching IOCs
   */
  private searchIOCValidation() {
    return [
      body('query')
        .notEmpty()
        .withMessage('Search query is required')
        .isString()
        .isLength({ min: 1, max: 100 })
        .withMessage('Search query must be between 1 and 100 characters'),
      
      body('filters')
        .optional()
        .isObject()
        .withMessage('Filters must be an object'),
      
      body('filters.type')
        .optional()
        .isIn(['ip', 'domain', 'url', 'hash', 'email'])
        .withMessage('Invalid IOC type filter'),
      
      body('filters.severity')
        .optional()
        .isIn(['low', 'medium', 'high', 'critical'])
        .withMessage('Invalid severity filter'),
      
      body('filters.status')
        .optional()
        .isIn(['active', 'inactive', 'expired', 'false_positive'])
        .withMessage('Invalid status filter'),
      
      body('filters.dateFrom')
        .optional()
        .isISO8601()
        .withMessage('Date from filter must be a valid ISO 8601 date'),
      
      body('filters.dateTo')
        .optional()
        .isISO8601()
        .withMessage('Date to filter must be a valid ISO 8601 date')
    ];
  }

  /**
   * Validation schema for bulk operations
   */
  private bulkCreateValidation() {
    return [
      body('iocs')
        .isArray({ min: 1, max: 100 })
        .withMessage('IOCs must be an array with 1-100 items'),
      
      body('iocs.*.type')
        .notEmpty()
        .withMessage('Each IOC must have a type')
        .isIn(['ip', 'domain', 'url', 'hash', 'email'])
        .withMessage('Invalid IOC type'),
      
      body('iocs.*.value')
        .notEmpty()
        .withMessage('Each IOC must have a value')
        .isLength({ min: 1, max: 2000 })
        .withMessage('IOC value must be between 1 and 2000 characters'),
      
      body('iocs.*.severity')
        .notEmpty()
        .withMessage('Each IOC must have a severity')
        .isIn(['low', 'medium', 'high', 'critical'])
        .withMessage('Invalid severity level'),
      
      body('iocs.*.description')
        .optional()
        .isString()
        .isLength({ max: 5000 })
        .withMessage('Description must be less than 5000 characters'),
      
      body('iocs.*.confidence')
        .optional()
        .isInt({ min: 0, max: 100 })
        .withMessage('Confidence must be between 0 and 100')
    ];
  }

  /**
   * Validation schema for ID parameter
   */
  private idValidation() {
    return [
      param('id')
        .notEmpty()
        .withMessage('IOC ID is required')
        .isMongoId()
        .withMessage('Invalid IOC ID format')
    ];
  }
}

/**
 * Export router factory function
 */
export const createIOCRouter = (controller: IOCController) => {
  return new IOCRouter(controller);
};