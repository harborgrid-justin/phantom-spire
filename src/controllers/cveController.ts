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

// Mock data store - in real implementation, this would use databases
const cveStore: Map<string, CVE> = new Map();
const feedStore: Map<string, CVEFeed> = new Map();
const notificationStore: Map<string, CVENotification> = new Map();
const reportStore: Map<string, CVEReport> = new Map();
const integrationStore: Map<string, CVEIntegration> = new Map();

/**
 * CVE Data Management Controller
 */
export class CVEDataController {
  // Get all CVEs with advanced filtering and pagination
  static async getCVEs(req: Request, res: Response, next: NextFunction) {
    try {
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

      const cves = Array.from(cveStore.values());

      // Apply filters
      let filteredCVEs = cves;
      if (searchRequest.filters) {
        filteredCVEs = cves.filter(cve => {
          const filters = searchRequest.filters!;

          if (
            filters.severity &&
            !filters.severity.includes(cve.scoring.severity)
          )
            return false;
          if (filters.cvssScore) {
            const score =
              cve.scoring.cvssV3Score || cve.scoring.cvssV2Score || 0;
            if (filters.cvssScore.min && score < filters.cvssScore.min)
              return false;
            if (filters.cvssScore.max && score > filters.cvssScore.max)
              return false;
          }
          if (
            filters.exploitAvailable !== undefined &&
            cve.exploitInfo.exploitAvailable !== filters.exploitAvailable
          )
            return false;
          if (
            filters.patchAvailable !== undefined &&
            cve.patchInfo.patchAvailable !== filters.patchAvailable
          )
            return false;

          return true;
        });
      }

      // Apply sorting
      if (searchRequest.sort) {
        const { field, order } = searchRequest.sort;
        filteredCVEs.sort((a, b) => {
          let aVal: any, bVal: any;

          switch (field) {
            case 'cvssScore':
              aVal = a.scoring.cvssV3Score || a.scoring.cvssV2Score || 0;
              bVal = b.scoring.cvssV3Score || b.scoring.cvssV2Score || 0;
              break;
            case 'publishedDate':
              aVal = new Date(a.publishedDate);
              bVal = new Date(b.publishedDate);
              break;
            case 'riskScore':
              aVal = a.riskAssessment.riskScore;
              bVal = b.riskAssessment.riskScore;
              break;
            default:
              aVal = a[field as keyof CVE];
              bVal = b[field as keyof CVE];
          }

          if (order === 'desc') return bVal > aVal ? 1 : -1;
          return aVal > bVal ? 1 : -1;
        });
      }

      // Apply pagination
      const total = filteredCVEs.length;
      const startIndex =
        (searchRequest.pagination!.page - 1) * searchRequest.pagination!.limit;
      const paginatedCVEs = filteredCVEs.slice(
        startIndex,
        startIndex + searchRequest.pagination!.limit
      );

      const response: CVESearchResponse = {
        cves: paginatedCVEs,
        total,
        page: searchRequest.pagination!.page,
        limit: searchRequest.pagination!.limit,
        totalPages: Math.ceil(total / searchRequest.pagination!.limit),
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  // Get CVE by ID
  static async getCVEById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const cve = cveStore.get(id);

      if (!cve) {
        return res.status(404).json({ error: 'CVE not found' });
      }

      res.json(cve);
    } catch (error) {
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

      const cveData: Partial<CVE> = req.body;
      const cve: CVE = {
        id: `cve-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        organizationId: req.user?.organizationId || 'default',
        createdBy: req.user?.id || 'system',
        updatedBy: req.user?.id || 'system',
        source: 'manual',
        tags: [],
        ...cveData,
      } as CVE;

      cveStore.set(cve.id, cve);
      res.status(201).json(cve);
    } catch (error) {
      next(error);
    }
  }

  // Update CVE
  static async updateCVE(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const existingCVE = cveStore.get(id);

      if (!existingCVE) {
        return res.status(404).json({ error: 'CVE not found' });
      }

      const updatedCVE: CVE = {
        ...existingCVE,
        ...req.body,
        updatedAt: new Date().toISOString(),
        updatedBy: req.user?.id || 'system',
      };

      cveStore.set(id, updatedCVE);
      res.json(updatedCVE);
    } catch (error) {
      next(error);
    }
  }

  // Delete CVE
  static async deleteCVE(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (!cveStore.has(id)) {
        return res.status(404).json({ error: 'CVE not found' });
      }

      cveStore.delete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // Search CVEs
  static async searchCVEs(req: Request, res: Response, next: NextFunction) {
    try {
      const { q, ...filters } = req.query;
      const cves = Array.from(cveStore.values());

      let results = cves;

      // Text search
      if (q) {
        const query = (q as string).toLowerCase();
        results = results.filter(
          cve =>
            cve.cveId.toLowerCase().includes(query) ||
            cve.title.toLowerCase().includes(query) ||
            cve.description.toLowerCase().includes(query) ||
            cve.affectedProducts.some(
              p =>
                p.vendor.toLowerCase().includes(query) ||
                p.product.toLowerCase().includes(query)
            )
        );
      }

      res.json({
        results,
        total: results.length,
        query: q,
      });
    } catch (error) {
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
      const cves = Array.from(cveStore.values());

      const stats: CVEStats = {
        total: cves.length,
        bySeverity: {
          critical: cves.filter(c => c.scoring.severity === 'critical').length,
          high: cves.filter(c => c.scoring.severity === 'high').length,
          medium: cves.filter(c => c.scoring.severity === 'medium').length,
          low: cves.filter(c => c.scoring.severity === 'low').length,
          info: cves.filter(c => c.scoring.severity === 'info').length,
        },
        byStatus: {},
        withExploits: cves.filter(c => c.exploitInfo.exploitAvailable).length,
        withPatches: cves.filter(c => c.patchInfo.patchAvailable).length,
        pastDue: cves.filter(
          c => c.workflow.dueDate && new Date(c.workflow.dueDate) < new Date()
        ).length,
        trending: {
          period: 'last30days',
          newCVEs: cves.filter(c => {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return new Date(c.createdAt) > thirtyDaysAgo;
          }).length,
          patchedCVEs: cves.filter(c => c.workflow.status === 'closed').length,
          criticalNew: cves.filter(c => {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return (
              new Date(c.createdAt) > thirtyDaysAgo &&
              c.scoring.severity === 'critical'
            );
          }).length,
        },
        topVendors: [],
        topProducts: [],
      };

      // Calculate status distribution
      cves.forEach(cve => {
        stats.byStatus[cve.workflow.status] =
          (stats.byStatus[cve.workflow.status] || 0) + 1;
      });

      // Calculate top vendors and products
      const vendorCounts = new Map<string, number>();
      const productCounts = new Map<string, number>();

      cves.forEach(cve => {
        cve.affectedProducts.forEach(product => {
          vendorCounts.set(
            product.vendor,
            (vendorCounts.get(product.vendor) || 0) + 1
          );
          productCounts.set(
            product.product,
            (productCounts.get(product.product) || 0) + 1
          );
        });
      });

      stats.topVendors = Array.from(vendorCounts.entries())
        .map(([vendor, count]) => ({ vendor, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      stats.topProducts = Array.from(productCounts.entries())
        .map(([product, count]) => ({ product, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      res.json(stats);
    } catch (error) {
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
      const cves = Array.from(cveStore.values());

      const riskDistribution = {
        critical: cves.filter(c => c.riskAssessment.businessRisk === 'critical')
          .length,
        high: cves.filter(c => c.riskAssessment.businessRisk === 'high').length,
        medium: cves.filter(c => c.riskAssessment.businessRisk === 'medium')
          .length,
        low: cves.filter(c => c.riskAssessment.businessRisk === 'low').length,
      };

      const avgRiskScore =
        cves.reduce((sum, cve) => sum + cve.riskAssessment.riskScore, 0) /
        cves.length;

      const topRisks = cves
        .sort((a, b) => b.riskAssessment.riskScore - a.riskAssessment.riskScore)
        .slice(0, 10)
        .map(cve => ({
          cveId: cve.cveId,
          title: cve.title,
          riskScore: cve.riskAssessment.riskScore,
          businessRisk: cve.riskAssessment.businessRisk,
        }));

      res.json({
        riskDistribution,
        avgRiskScore,
        topRisks,
        totalFinancialImpact: cves.reduce(
          (sum, cve) => sum + cve.riskAssessment.financialImpact,
          0
        ),
      });
    } catch (error) {
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
