import { Request, Response } from 'express';
import { PerformanceDegradationHandlerBusinessLogic } from '../../services/business-logic/modules/system-error-management/PerformanceDegradationHandlerBusinessLogic';

export class PerformanceDegradationHandlerController {
  private performanceDegradationHandlerBusinessLogic: PerformanceDegradationHandlerBusinessLogic;

  constructor() {
    this.performanceDegradationHandlerBusinessLogic = new PerformanceDegradationHandlerBusinessLogic();
  }

  public async getAll(req: Request, res: Response): Promise<void> {
    try {
      const items = await this.performanceDegradationHandlerBusinessLogic.getItems();
      const analytics = await this.performanceDegradationHandlerBusinessLogic.generateAnalytics({});

      res.status(200).json({
        success: true,
        data: items,
        analytics,
        total: items.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${PerformanceDegradationHandlerController.name}.getAll:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch performance degradation handler items',
        code: 'GET_ALL_ERROR'
      });
    }
  }

  public async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const item = await this.performanceDegradationHandlerBusinessLogic.getItem(id);
      
      if (!item) {
        res.status(404).json({
          success: false,
          error: 'Performance Degradation Handler item not found',
          code: 'ITEM_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: item,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${PerformanceDegradationHandlerController.name}.getById:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch performance degradation handler item',
        code: 'GET_BY_ID_ERROR'
      });
    }
  }

  public async create(req: Request, res: Response): Promise<void> {
    try {
      // Process business rules before creation
      const processedData = await this.performanceDegradationHandlerBusinessLogic.processBusinessRules(req.body);
      
      const newItem = await this.performanceDegradationHandlerBusinessLogic.createItem(processedData);

      res.status(201).json({
        success: true,
        data: newItem,
        message: 'Performance Degradation Handler item created successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${PerformanceDegradationHandlerController.name}.create:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to create performance degradation handler item',
        code: 'CREATE_ERROR',
        details: error.message
      });
    }
  }

  public async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Process business rules before update
      const processedData = await this.performanceDegradationHandlerBusinessLogic.processBusinessRules(req.body);
      
      const updatedItem = await this.performanceDegradationHandlerBusinessLogic.updateItem(id, processedData);
      
      if (!updatedItem) {
        res.status(404).json({
          success: false,
          error: 'Performance Degradation Handler item not found',
          code: 'ITEM_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedItem,
        message: 'Performance Degradation Handler item updated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${PerformanceDegradationHandlerController.name}.update:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to update performance degradation handler item',
        code: 'UPDATE_ERROR',
        details: error.message
      });
    }
  }

  public async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.performanceDegradationHandlerBusinessLogic.deleteItem(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Performance Degradation Handler item not found',
          code: 'ITEM_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Performance Degradation Handler item deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${PerformanceDegradationHandlerController.name}.delete:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete performance degradation handler item',
        code: 'DELETE_ERROR'
      });
    }
  }

  public async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const isHealthy = await this.performanceDegradationHandlerBusinessLogic.healthCheck();
      
      res.status(isHealthy ? 200 : 503).json({
        success: isHealthy,
        service: 'performance-degradation-handler',
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${PerformanceDegradationHandlerController.name}.healthCheck:`, error);
      res.status(503).json({
        success: false,
        service: 'performance-degradation-handler',
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

export const performanceDegradationHandlerController = new PerformanceDegradationHandlerController();