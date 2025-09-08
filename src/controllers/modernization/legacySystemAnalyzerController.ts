/**
 * Legacy System Analyzer Controller
 * Legacy system assessment and modernization planning
 */

import { Request, Response } from 'express';
import { LegacySystemAnalyzerBusinessLogic } from '../../services/business-logic/modules/modernization/LegacySystemAnalyzerBusinessLogic';

export class LegacySystemAnalyzerController {
  private businessLogic: LegacySystemAnalyzerBusinessLogic;

  constructor() {
    this.businessLogic = new LegacySystemAnalyzerBusinessLogic();
  }

  /**
   * Get legacy-system-analyzer data
   */
  public getLegacySystemAnalyzer = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.businessLogic.processBusinessRules({
        operation: 'get-data',
        payload: req.query,
        context: {
          userId: req.user?.id,
          timestamp: new Date(),
          requestId: `${Date.now()}-get-${req.params.id || 'all'}`
        }
      });

      res.json({
        success: true,
        data: result.data,
        metrics: result.metrics,
        timestamp: new Date()
      });
    } catch (error) {
      console.error(`Error in getLegacySystemAnalyzer:`, error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        timestamp: new Date()
      });
    }
  };

  /**
   * Create new legacy-system-analyzer item
   */
  public createLegacySystemAnalyzerItem = async (req: Request, res: Response): Promise<void> => {
    try {
      const validationResult = await this.businessLogic.validateData(req.body);
      if (!validationResult.isValid) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validationResult.errors,
          timestamp: new Date()
        });
        return;
      }

      const result = await this.businessLogic.processBusinessRules({
        operation: 'create-item',
        payload: req.body,
        context: {
          userId: req.user?.id,
          timestamp: new Date(),
          requestId: `${Date.now()}-create`
        }
      });

      res.status(201).json({
        success: true,
        data: result.data,
        message: 'Legacy System Analyzer item created successfully',
        timestamp: new Date()
      });
    } catch (error) {
      console.error(`Error in createLegacySystemAnalyzerItem:`, error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        timestamp: new Date()
      });
    }
  };

  /**
   * Update legacy-system-analyzer item
   */
  public updateLegacySystemAnalyzerItem = async (req: Request, res: Response): Promise<void> => {
    try {
      const itemId = req.params.id;
      if (!itemId) {
        res.status(400).json({
          success: false,
          error: 'Item ID is required',
          timestamp: new Date()
        });
        return;
      }

      const validationResult = await this.businessLogic.validateData(req.body);
      if (!validationResult.isValid) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validationResult.errors,
          timestamp: new Date()
        });
        return;
      }

      const result = await this.businessLogic.processBusinessRules({
        operation: 'update-item',
        payload: { ...req.body, id: itemId },
        context: {
          userId: req.user?.id,
          timestamp: new Date(),
          requestId: `${Date.now()}-update-${itemId}`
        }
      });

      res.json({
        success: true,
        data: result.data,
        message: 'Legacy System Analyzer item updated successfully',
        timestamp: new Date()
      });
    } catch (error) {
      console.error(`Error in updateLegacySystemAnalyzerItem:`, error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        timestamp: new Date()
      });
    }
  };

  /**
   * Delete legacy-system-analyzer item
   */
  public deleteLegacySystemAnalyzerItem = async (req: Request, res: Response): Promise<void> => {
    try {
      const itemId = req.params.id;
      if (!itemId) {
        res.status(400).json({
          success: false,
          error: 'Item ID is required',
          timestamp: new Date()
        });
        return;
      }

      const result = await this.businessLogic.processBusinessRules({
        operation: 'delete-item',
        payload: { id: itemId },
        context: {
          userId: req.user?.id,
          timestamp: new Date(),
          requestId: `${Date.now()}-delete-${itemId}`
        }
      });

      res.json({
        success: true,
        message: 'Legacy System Analyzer item deleted successfully',
        timestamp: new Date()
      });
    } catch (error) {
      console.error(`Error in deleteLegacySystemAnalyzerItem:`, error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        timestamp: new Date()
      });
    }
  };

  /**
   * Get legacy-system-analyzer analytics
   */
  public getLegacySystemAnalyzerAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.businessLogic.generateAnalytics({
        timeRange: req.query.timeRange || '30d',
        metrics: req.query.metrics || 'all',
        context: {
          userId: req.user?.id,
          timestamp: new Date(),
          requestId: `${Date.now()}-analytics`
        }
      });

      res.json({
        success: true,
        analytics: result,
        timestamp: new Date()
      });
    } catch (error) {
      console.error(`Error in getLegacySystemAnalyzerAnalytics:`, error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        timestamp: new Date()
      });
    }
  };

  /**
   * Health check for legacy-system-analyzer service
   */
  public healthCheck = async (req: Request, res: Response): Promise<void> => {
    try {
      const health = await this.businessLogic.healthCheck();
      res.json({
        success: true,
        health,
        service: 'legacy-system-analyzer',
        timestamp: new Date()
      });
    } catch (error) {
      console.error(`Error in legacy-system-analyzer health check:`, error);
      res.status(503).json({
        success: false,
        error: 'Service unhealthy',
        timestamp: new Date()
      });
    }
  };
}

export default LegacySystemAnalyzerController;