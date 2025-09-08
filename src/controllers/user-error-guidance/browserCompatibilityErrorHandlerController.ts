import { Request, Response } from 'express';
import { BrowserCompatibilityErrorHandlerBusinessLogic } from '../../services/business-logic/modules/user-error-guidance/BrowserCompatibilityErrorHandlerBusinessLogic';

export class BrowserCompatibilityErrorHandlerController {
  private browserCompatibilityErrorHandlerBusinessLogic: BrowserCompatibilityErrorHandlerBusinessLogic;

  constructor() {
    this.browserCompatibilityErrorHandlerBusinessLogic = new BrowserCompatibilityErrorHandlerBusinessLogic();
  }

  public async getAll(req: Request, res: Response): Promise<void> {
    try {
      const items = await this.browserCompatibilityErrorHandlerBusinessLogic.getItems();
      const analytics = await this.browserCompatibilityErrorHandlerBusinessLogic.generateAnalytics({});

      res.status(200).json({
        success: true,
        data: items,
        analytics,
        total: items.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${BrowserCompatibilityErrorHandlerController.name}.getAll:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch browser compatibility error handler items',
        code: 'GET_ALL_ERROR'
      });
    }
  }

  public async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const item = await this.browserCompatibilityErrorHandlerBusinessLogic.getItem(id);
      
      if (!item) {
        res.status(404).json({
          success: false,
          error: 'Browser Compatibility Error Handler item not found',
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
      console.error(`Error in ${BrowserCompatibilityErrorHandlerController.name}.getById:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch browser compatibility error handler item',
        code: 'GET_BY_ID_ERROR'
      });
    }
  }

  public async create(req: Request, res: Response): Promise<void> {
    try {
      // Process business rules before creation
      const processedData = await this.browserCompatibilityErrorHandlerBusinessLogic.processBusinessRules(req.body);
      
      const newItem = await this.browserCompatibilityErrorHandlerBusinessLogic.createItem(processedData);

      res.status(201).json({
        success: true,
        data: newItem,
        message: 'Browser Compatibility Error Handler item created successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${BrowserCompatibilityErrorHandlerController.name}.create:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to create browser compatibility error handler item',
        code: 'CREATE_ERROR',
        details: error.message
      });
    }
  }

  public async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Process business rules before update
      const processedData = await this.browserCompatibilityErrorHandlerBusinessLogic.processBusinessRules(req.body);
      
      const updatedItem = await this.browserCompatibilityErrorHandlerBusinessLogic.updateItem(id, processedData);
      
      if (!updatedItem) {
        res.status(404).json({
          success: false,
          error: 'Browser Compatibility Error Handler item not found',
          code: 'ITEM_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedItem,
        message: 'Browser Compatibility Error Handler item updated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${BrowserCompatibilityErrorHandlerController.name}.update:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to update browser compatibility error handler item',
        code: 'UPDATE_ERROR',
        details: error.message
      });
    }
  }

  public async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.browserCompatibilityErrorHandlerBusinessLogic.deleteItem(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Browser Compatibility Error Handler item not found',
          code: 'ITEM_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Browser Compatibility Error Handler item deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${BrowserCompatibilityErrorHandlerController.name}.delete:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete browser compatibility error handler item',
        code: 'DELETE_ERROR'
      });
    }
  }

  public async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const isHealthy = await this.browserCompatibilityErrorHandlerBusinessLogic.healthCheck();
      
      res.status(isHealthy ? 200 : 503).json({
        success: isHealthy,
        service: 'browser-compatibility-error-handler',
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${BrowserCompatibilityErrorHandlerController.name}.healthCheck:`, error);
      res.status(503).json({
        success: false,
        service: 'browser-compatibility-error-handler',
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

export const browserCompatibilityErrorHandlerController = new BrowserCompatibilityErrorHandlerController();