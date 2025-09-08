/**
 * Digital Culture Builder Controller
 * Digital culture development and employee engagement
 */

import { Request, Response } from 'express';
import { DigitalCultureBuilderBusinessLogic } from '../../services/business-logic/modules/modernization/DigitalCultureBuilderBusinessLogic';

export class DigitalCultureBuilderController {
  private businessLogic: DigitalCultureBuilderBusinessLogic;

  constructor() {
    this.businessLogic = new DigitalCultureBuilderBusinessLogic();
  }

  /**
   * Get digital-culture-builder data
   */
  public getDigitalCultureBuilder = async (req: Request, res: Response): Promise<void> => {
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
      console.error(`Error in getDigitalCultureBuilder:`, error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        timestamp: new Date()
      });
    }
  };

  /**
   * Create new digital-culture-builder item
   */
  public createDigitalCultureBuilderItem = async (req: Request, res: Response): Promise<void> => {
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
        message: 'Digital Culture Builder item created successfully',
        timestamp: new Date()
      });
    } catch (error) {
      console.error(`Error in createDigitalCultureBuilderItem:`, error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        timestamp: new Date()
      });
    }
  };

  /**
   * Update digital-culture-builder item
   */
  public updateDigitalCultureBuilderItem = async (req: Request, res: Response): Promise<void> => {
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
        message: 'Digital Culture Builder item updated successfully',
        timestamp: new Date()
      });
    } catch (error) {
      console.error(`Error in updateDigitalCultureBuilderItem:`, error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        timestamp: new Date()
      });
    }
  };

  /**
   * Delete digital-culture-builder item
   */
  public deleteDigitalCultureBuilderItem = async (req: Request, res: Response): Promise<void> => {
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
        message: 'Digital Culture Builder item deleted successfully',
        timestamp: new Date()
      });
    } catch (error) {
      console.error(`Error in deleteDigitalCultureBuilderItem:`, error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        timestamp: new Date()
      });
    }
  };

  /**
   * Get digital-culture-builder analytics
   */
  public getDigitalCultureBuilderAnalytics = async (req: Request, res: Response): Promise<void> => {
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
      console.error(`Error in getDigitalCultureBuilderAnalytics:`, error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        timestamp: new Date()
      });
    }
  };

  /**
   * Health check for digital-culture-builder service
   */
  public healthCheck = async (req: Request, res: Response): Promise<void> => {
    try {
      const health = await this.businessLogic.healthCheck();
      res.json({
        success: true,
        health,
        service: 'digital-culture-builder',
        timestamp: new Date()
      });
    } catch (error) {
      console.error(`Error in digital-culture-builder health check:`, error);
      res.status(503).json({
        success: false,
        error: 'Service unhealthy',
        timestamp: new Date()
      });
    }
  };
}

export default DigitalCultureBuilderController;