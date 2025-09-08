/**
 * Observability Platform Controller
 * Modern observability and monitoring stack implementation
 */

import { Request, Response } from 'express';
import { ObservabilityPlatformBusinessLogic } from '../../services/business-logic/modules/modernization/ObservabilityPlatformBusinessLogic';

export class ObservabilityPlatformController {
  private businessLogic: ObservabilityPlatformBusinessLogic;

  constructor() {
    this.businessLogic = new ObservabilityPlatformBusinessLogic();
  }

  /**
   * Get observability-platform data
   */
  public getObservabilityPlatform = async (req: Request, res: Response): Promise<void> => {
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
      console.error(`Error in getObservabilityPlatform:`, error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        timestamp: new Date()
      });
    }
  };

  /**
   * Create new observability-platform item
   */
  public createObservabilityPlatformItem = async (req: Request, res: Response): Promise<void> => {
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
        message: 'Observability Platform item created successfully',
        timestamp: new Date()
      });
    } catch (error) {
      console.error(`Error in createObservabilityPlatformItem:`, error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        timestamp: new Date()
      });
    }
  };

  /**
   * Update observability-platform item
   */
  public updateObservabilityPlatformItem = async (req: Request, res: Response): Promise<void> => {
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
        message: 'Observability Platform item updated successfully',
        timestamp: new Date()
      });
    } catch (error) {
      console.error(`Error in updateObservabilityPlatformItem:`, error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        timestamp: new Date()
      });
    }
  };

  /**
   * Delete observability-platform item
   */
  public deleteObservabilityPlatformItem = async (req: Request, res: Response): Promise<void> => {
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
        message: 'Observability Platform item deleted successfully',
        timestamp: new Date()
      });
    } catch (error) {
      console.error(`Error in deleteObservabilityPlatformItem:`, error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        timestamp: new Date()
      });
    }
  };

  /**
   * Get observability-platform analytics
   */
  public getObservabilityPlatformAnalytics = async (req: Request, res: Response): Promise<void> => {
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
      console.error(`Error in getObservabilityPlatformAnalytics:`, error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        timestamp: new Date()
      });
    }
  };

  /**
   * Health check for observability-platform service
   */
  public healthCheck = async (req: Request, res: Response): Promise<void> => {
    try {
      const health = await this.businessLogic.healthCheck();
      res.json({
        success: true,
        health,
        service: 'observability-platform',
        timestamp: new Date()
      });
    } catch (error) {
      console.error(`Error in observability-platform health check:`, error);
      res.status(503).json({
        success: false,
        error: 'Service unhealthy',
        timestamp: new Date()
      });
    }
  };
}

export default ObservabilityPlatformController;