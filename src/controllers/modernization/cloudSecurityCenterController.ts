/**
 * Cloud Security Center Controller
 * Cloud security posture management and compliance
 */

import { Request, Response } from 'express';
import { CloudSecurityCenterBusinessLogic } from '../../services/business-logic/modules/modernization/CloudSecurityCenterBusinessLogic';

export class CloudSecurityCenterController {
  private businessLogic: CloudSecurityCenterBusinessLogic;

  constructor() {
    this.businessLogic = new CloudSecurityCenterBusinessLogic();
  }

  /**
   * Get cloud-security-center data
   */
  public getCloudSecurityCenter = async (req: Request, res: Response): Promise<void> => {
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
      console.error(`Error in getCloudSecurityCenter:`, error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        timestamp: new Date()
      });
    }
  };

  /**
   * Create new cloud-security-center item
   */
  public createCloudSecurityCenterItem = async (req: Request, res: Response): Promise<void> => {
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
        message: 'Cloud Security Center item created successfully',
        timestamp: new Date()
      });
    } catch (error) {
      console.error(`Error in createCloudSecurityCenterItem:`, error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        timestamp: new Date()
      });
    }
  };

  /**
   * Update cloud-security-center item
   */
  public updateCloudSecurityCenterItem = async (req: Request, res: Response): Promise<void> => {
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
        message: 'Cloud Security Center item updated successfully',
        timestamp: new Date()
      });
    } catch (error) {
      console.error(`Error in updateCloudSecurityCenterItem:`, error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        timestamp: new Date()
      });
    }
  };

  /**
   * Delete cloud-security-center item
   */
  public deleteCloudSecurityCenterItem = async (req: Request, res: Response): Promise<void> => {
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
        message: 'Cloud Security Center item deleted successfully',
        timestamp: new Date()
      });
    } catch (error) {
      console.error(`Error in deleteCloudSecurityCenterItem:`, error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        timestamp: new Date()
      });
    }
  };

  /**
   * Get cloud-security-center analytics
   */
  public getCloudSecurityCenterAnalytics = async (req: Request, res: Response): Promise<void> => {
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
      console.error(`Error in getCloudSecurityCenterAnalytics:`, error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        timestamp: new Date()
      });
    }
  };

  /**
   * Health check for cloud-security-center service
   */
  public healthCheck = async (req: Request, res: Response): Promise<void> => {
    try {
      const health = await this.businessLogic.healthCheck();
      res.json({
        success: true,
        health,
        service: 'cloud-security-center',
        timestamp: new Date()
      });
    } catch (error) {
      console.error(`Error in cloud-security-center health check:`, error);
      res.status(503).json({
        success: false,
        error: 'Service unhealthy',
        timestamp: new Date()
      });
    }
  };
}

export default CloudSecurityCenterController;