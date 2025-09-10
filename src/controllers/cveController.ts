/**
 * CVE Controller
 * Enterprise-grade CVE management controller with comprehensive functionality
 */

import { Request, Response, NextFunction } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import {
  CVE,
  CVESearchRequest,
  CVESearchResponse,
  CVEStats,
  CVEFeed,
  CVENotification,
  CVEReport,
  CVEIntegration,
} from '../types/cve.js';
import { CVEDataService, CVEDataServiceConfig, CVEQueryContext } from '../data-layer/services/CVEDataService.js';
import { logger } from '../utils/logger.js';

// Multi-database CVE data service instance
let cveDataService: CVEDataService | null = null;

// Initialize CVE Data Service with environment configuration
export const initializeCVEDataService = (config: CVEDataServiceConfig): void => {
  cveDataService = new CVEDataService(config);
  logger.info('CVE Data Service initialized for phantom-cve-core plugin');
};

// Fallback stores for when data service is not available
const feedStore: Map<string, CVEFeed> = new Map();
const notificationStore: Map<string, CVENotification> = new Map();
const reportStore: Map<string, CVEReport> = new Map();
const integrationStore: Map<string, CVEIntegration> = new Map();

// Helper function to create query context from request
const createQueryContext = (req: any): CVEQueryContext => ({
  userId: req.user?.id || 'anonymous',
  organizationId: req.user?.organizationId || 'default',
  permissions: req.user?.permissions || [],
  preferences: {
    preferredDataSources: req.user?.preferences?.preferredDataSources,
    cacheStrategy: req.user?.preferences?.cacheStrategy || 'cache-first',
    realTimeUpdates: req.user?.preferences?.realTimeUpdates || false,
  },
});

/**
 * CVE Data Management Controller
 */
export class CVEDataController {
  // Get all CVEs with advanced filtering and pagination
  static async getCVEs(req: Request, res: Response, next: NextFunction) {
    try {
      if (!cveDataService) {
        return res.status(503).json({ 
          error: 'CVE Data Service not initialized. Please configure multi-database support.' 
        });
      }

      const { page = 1, limit = 20, sort, filters } = req.query;
      const searchRequest: CVESearchRequest = {
        filters: filters ? JSON.parse(filters as string) : {},
        sort: sort
          ? JSON.parse(sort as string)
          : { field: 'publishedDate', order: 'desc' },
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
        },
      };

      const context = createQueryContext(req);
      const result = await cveDataService.searchCVEs(searchRequest, context);

      logger.info('CVEs retrieved via multi-database service', {
        total: result.total,
        page: result.page,
        userId: context.userId,
        dataSources: await cveDataService.getHealthStatus().then(h => Object.keys(h.sources)),
      });

      res.json(result);
    } catch (error) {
      logger.error('Failed to get CVEs from multi-database service', error);
      next(error);
    }
  }

  // Get CVE by ID
  static async getCVEById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!cveDataService) {
        return res.status(503).json({ 
          error: 'CVE Data Service not initialized. Please configure multi-database support.' 
        });
      }

      const { id } = req.params;
      const context = createQueryContext(req);
      
      const cve = await cveDataService.getCVE(id, context);

      if (!cve) {
        return res.status(404).json({ error: 'CVE not found' });
      }

      logger.info('CVE retrieved by ID via multi-database service', {
        cveId: id,
        userId: context.userId,
      });

      res.json(cve);
    } catch (error) {
      logger.error('Failed to get CVE by ID from multi-database service', error);
      next(error);
    }
  }

  // Create new CVE
  static async createCVE(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (!cveDataService) {
        return res.status(503).json({ 
          error: 'CVE Data Service not initialized. Please configure multi-database support.' 
        });
      }

      const cveData: Partial<CVE> = req.body;
      const context = createQueryContext(req);

      const cve = await cveDataService.createCVE(cveData, context);

      logger.info('CVE created via multi-database service', {
        cveId: cve.cveId,
        userId: context.userId,
        writeStrategy: 'multi-database',
      });

      res.status(201).json(cve);
    } catch (error) {
      logger.error('Failed to create CVE via multi-database service', error);
      next(error);
    }
  }

  // Update CVE
  static async updateCVE(req: Request, res: Response, next: NextFunction) {
    try {
      if (!cveDataService) {
        return res.status(503).json({ 
          error: 'CVE Data Service not initialized. Please configure multi-database support.' 
        });
      }

      const { id } = req.params;
      const updates: Partial<CVE> = req.body;
      const context = createQueryContext(req);

      const updatedCVE = await cveDataService.updateCVE(id, updates, context);

      logger.info('CVE updated via multi-database service', {
        cveId: id,
        userId: context.userId,
        updatedFields: Object.keys(updates),
      });

      res.json(updatedCVE);
    } catch (error) {
      if ((error as Error).message.includes('not found')) {
        return res.status(404).json({ error: 'CVE not found' });
      }
      logger.error('Failed to update CVE via multi-database service', error);
      next(error);
    }
  }

  // Delete CVE
  static async deleteCVE(req: Request, res: Response, next: NextFunction) {
    try {
      if (!cveDataService) {
        return res.status(503).json({ 
          error: 'CVE Data Service not initialized. Please configure multi-database support.' 
        });
      }

      const { id } = req.params;
      const context = createQueryContext(req);

      const deleted = await cveDataService.deleteCVE(id, context);

      if (!deleted) {
        return res.status(404).json({ error: 'CVE not found' });
      }

      logger.info('CVE deleted via multi-database service', {
        cveId: id,
        userId: context.userId,
      });

      res.status(204).send();
    } catch (error) {
      logger.error('Failed to delete CVE via multi-database service', error);
      next(error);
    }
  }

  // Search CVEs
  static async searchCVEs(req: Request, res: Response, next: NextFunction) {
    try {
      if (!cveDataService) {
        return res.status(503).json({ 
          error: 'CVE Data Service not initialized. Please configure multi-database support.' 
        });
      }

      const { q, ...filters } = req.query;
      const context = createQueryContext(req);

      const searchRequest: CVESearchRequest = {
        query: q as string,
        filters: filters,
        pagination: {
          page: parseInt((req.query.page as string) || '1'),
          limit: parseInt((req.query.limit as string) || '20'),
        },
      };

      const result = await cveDataService.searchCVEs(searchRequest, context);

      logger.info('CVE search completed via multi-database service', {
        query: q,
        total: result.total,
        userId: context.userId,
        searchEngine: 'multi-database',
      });

      res.json({
        results: result.cves,
        total: result.total,
        query: q,
        page: result.page,
        totalPages: result.totalPages,
      });
    } catch (error) {
      logger.error('CVE search failed via multi-database service', error);
      next(error);
    }
  }
}

/**
 * CVE Analytics and Stats Controller
 */
export class CVEAnalyticsController {
  // Get CVE statistics
  static async getCVEStats(req: Request, res: Response, next: NextFunction) {
    try {
      if (!cveDataService) {
        return res.status(503).json({ 
          error: 'CVE Data Service not initialized. Please configure multi-database support.' 
        });
      }

      const context = createQueryContext(req);
      const stats = await cveDataService.getCVEStatistics(context);

      logger.info('CVE statistics retrieved via multi-database service', {
        total: stats.total,
        userId: context.userId,
        cached: req.query.cached === 'true',
      });

      res.json(stats);
    } catch (error) {
      logger.error('Failed to get CVE statistics from multi-database service', error);
      next(error);
    }
  }

  // Get risk assessment analytics
  static async getRiskAnalytics(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!cveDataService) {
        return res.status(503).json({ 
          error: 'CVE Data Service not initialized. Please configure multi-database support.' 
        });
      }

      const context = createQueryContext(req);
      
      // Get comprehensive statistics which include risk data
      const stats = await cveDataService.getCVEStatistics(context);
      
      // Calculate risk analytics from the statistics
      const riskDistribution = {
        critical: stats.bySeverity.critical,
        high: stats.bySeverity.high,
        medium: stats.bySeverity.medium,
        low: stats.bySeverity.low,
      };

      const totalCVEs = stats.total;
      const avgRiskScore = totalCVEs > 0 
        ? (stats.bySeverity.critical * 10 + stats.bySeverity.high * 7 + 
           stats.bySeverity.medium * 5 + stats.bySeverity.low * 2) / totalCVEs
        : 0;

      // Top risks would require more detailed query - placeholder implementation
      const topRisks = []; // This would be populated from detailed risk analysis

      const riskAnalytics = {
        riskDistribution,
        avgRiskScore,
        topRisks,
        totalFinancialImpact: 0, // Would be calculated from detailed risk assessments
      };

      logger.info('Risk analytics computed via multi-database service', {
        avgRiskScore,
        userId: context.userId,
      });

      res.json(riskAnalytics);
    } catch (error) {
      logger.error('Failed to get risk analytics from multi-database service', error);
      next(error);
    }
  }

  // Get multi-database service health and metrics
  static async getServiceHealth(req: Request, res: Response, next: NextFunction) {
    try {
      if (!cveDataService) {
        return res.status(503).json({ 
          error: 'CVE Data Service not initialized',
          suggestion: 'Configure multi-database support with Redis, PostgreSQL, MongoDB, and Elasticsearch'
        });
      }

      const [healthStatus, metrics] = await Promise.all([
        cveDataService.getHealthStatus(),
        Promise.resolve(cveDataService.getMetrics()),
      ]);

      const serviceInfo = {
        service: 'phantom-cve-core-multi-database',
        version: '1.0.0',
        description: 'Multi-database CVE management service with Redis, PostgreSQL, MongoDB, and Elasticsearch',
        health: healthStatus,
        metrics,
        capabilities: [
          'multi-database-storage',
          'intelligent-caching',
          'advanced-search',
          'real-time-analytics',
          'business-saas-ready',
        ],
        dataSources: {
          mongodb: { role: 'primary-document-store', status: healthStatus.sources.mongodb?.status || 'not-configured' },
          redis: { role: 'cache-and-realtime', status: healthStatus.sources.redis?.status || 'not-configured' },
          postgresql: { role: 'relational-analytics', status: healthStatus.sources.postgresql?.status || 'not-configured' },
          elasticsearch: { role: 'search-and-ml', status: healthStatus.sources.elasticsearch?.status || 'not-configured' },
        },
      };

      res.json(serviceInfo);
    } catch (error) {
      logger.error('Failed to get service health', error);
      next(error);
    }
  }
}

/**
 * CVE Feed Management Controller
 */
export class CVEFeedController {
  // Get all feeds
  static async getFeeds(req: Request, res: Response, next: NextFunction) {
    try {
      const feeds = Array.from(feedStore.values());
      res.json(feeds);
    } catch (error) {
      next(error);
    }
  }

  // Create new feed
  static async createFeed(req: Request, res: Response, next: NextFunction) {
    try {
      const feedData: Partial<CVEFeed> = req.body;
      const feed: CVEFeed = {
        id: `feed-${Date.now()}`,
        lastSync: new Date().toISOString(),
        syncStatus: 'active',
        itemsProcessed: 0,
        enabled: true,
        ...feedData,
      } as CVEFeed;

      feedStore.set(feed.id, feed);
      res.status(201).json(feed);
    } catch (error) {
      next(error);
    }
  }

  // Sync feed
  static async syncFeed(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const feed = feedStore.get(id);

      if (!feed) {
        return res.status(404).json({ error: 'Feed not found' });
      }

      // Simulate feed sync
      feed.lastSync = new Date().toISOString();
      feed.syncStatus = 'active';
      feed.itemsProcessed += Math.floor(Math.random() * 50);

      feedStore.set(id, feed);
      res.json({ message: 'Feed sync initiated', feed });
    } catch (error) {
      next(error);
    }
  }
}

/**
 * CVE Notification Controller
 */
export class CVENotificationController {
  // Get notifications
  static async getNotifications(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const notifications = Array.from(notificationStore.values());
      res.json(notifications);
    } catch (error) {
      next(error);
    }
  }

  // Create notification
  static async createNotification(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const notificationData: Partial<CVENotification> = req.body;
      const notification: CVENotification = {
        id: `notification-${Date.now()}`,
        status: 'pending',
        createdAt: new Date().toISOString(),
        ...notificationData,
      } as CVENotification;

      notificationStore.set(notification.id, notification);
      res.status(201).json(notification);
    } catch (error) {
      next(error);
    }
  }
}

/**
 * CVE Reporting Controller
 */
export class CVEReportController {
  // Generate report
  static async generateReport(req: Request, res: Response, next: NextFunction) {
    try {
      const reportData: Partial<CVEReport> = req.body;
      const report: CVEReport = {
        id: `report-${Date.now()}`,
        status: 'generating',
        generatedAt: new Date().toISOString(),
        ...reportData,
      } as CVEReport;

      reportStore.set(report.id, report);

      // Simulate report generation
      setTimeout(() => {
        report.status = 'completed';
        report.filePath = `/reports/${report.id}.${report.format}`;
        reportStore.set(report.id, report);
      }, 2000);

      res.status(201).json(report);
    } catch (error) {
      next(error);
    }
  }

  // Get reports
  static async getReports(req: Request, res: Response, next: NextFunction) {
    try {
      const reports = Array.from(reportStore.values());
      res.json(reports);
    } catch (error) {
      next(error);
    }
  }
}

// Validation middleware
export const cveValidation = [
  body('cveId').notEmpty().withMessage('CVE ID is required'),
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('scoring.severity')
    .isIn(['critical', 'high', 'medium', 'low', 'info'])
    .withMessage('Invalid severity'),
];

export const searchValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];
