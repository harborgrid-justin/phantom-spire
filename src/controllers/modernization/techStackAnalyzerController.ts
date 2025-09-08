/**
 * Technology Stack Analyzer Controller
 * Technology stack assessment and optimization platform
 */

import { Request, Response } from 'express';
import { TechStackAnalyzerBusinessLogic } from '../../services/business-logic/modules/modernization/TechStackAnalyzerBusinessLogic';

export class TechStackAnalyzerController {
  private businessLogic: TechStackAnalyzerBusinessLogic;

  constructor() {
    this.businessLogic = new TechStackAnalyzerBusinessLogic();
  }

  /**
   * Get tech-stack-analyzer data
   */
  public getTechStackAnalyzer = async (req: Request, res: Response): Promise<void> => {
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
      console.error(`Error in getTechStackAnalyzer:`, error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        timestamp: new Date()
      });
    }
  };

  /**
   * Create new tech-stack-analyzer item
   */
  public createTechStackAnalyzerItem = async (req: Request, res: Response): Promise<void> => {
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
        message: 'Technology Stack Analyzer item created successfully',
        timestamp: new Date()
      });
    } catch (error) {
      console.error(`Error in createTechStackAnalyzerItem:`, error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        timestamp: new Date()
      });
    }
  };

  /**
   * Update tech-stack-analyzer item
   */
  public updateTechStackAnalyzerItem = async (req: Request, res: Response): Promise<void> => {
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
        message: 'Technology Stack Analyzer item updated successfully',
        timestamp: new Date()
      });
    } catch (error) {
      console.error(`Error in updateTechStackAnalyzerItem:`, error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        timestamp: new Date()
      });
    }
  };

  /**
   * Delete tech-stack-analyzer item
   */
  public deleteTechStackAnalyzerItem = async (req: Request, res: Response): Promise<void> => {
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
        message: 'Technology Stack Analyzer item deleted successfully',
        timestamp: new Date()
      });
    } catch (error) {
      console.error(`Error in deleteTechStackAnalyzerItem:`, error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        timestamp: new Date()
      });
    }
  };

  /**
   * Get tech-stack-analyzer analytics
   */
  public getTechStackAnalyzerAnalytics = async (req: Request, res: Response): Promise<void> => {
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
      console.error(`Error in getTechStackAnalyzerAnalytics:`, error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        timestamp: new Date()
      });
    }
  };

  /**
   * Health check for tech-stack-analyzer service
   */
  public healthCheck = async (req: Request, res: Response): Promise<void> => {
    try {
      const health = await this.businessLogic.healthCheck();
      res.json({
        success: true,
        health,
        service: 'tech-stack-analyzer',
        timestamp: new Date()
      });
    } catch (error) {
      console.error(`Error in tech-stack-analyzer health check:`, error);
      res.status(503).json({
        success: false,
        error: 'Service unhealthy',
        timestamp: new Date()
      });
    }
  };
}

export default TechStackAnalyzerController;