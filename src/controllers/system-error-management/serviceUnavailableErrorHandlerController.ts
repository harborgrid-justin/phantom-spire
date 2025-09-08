import { Request, Response } from 'express';
import { ServiceUnavailableErrorHandlerBusinessLogic } from '../../services/business-logic/modules/system-error-management/ServiceUnavailableErrorHandlerBusinessLogic';

export class ServiceUnavailableErrorHandlerController {
  private serviceUnavailableErrorHandlerBusinessLogic: ServiceUnavailableErrorHandlerBusinessLogic;

  constructor() {
    this.serviceUnavailableErrorHandlerBusinessLogic = new ServiceUnavailableErrorHandlerBusinessLogic();
  }

  public async getAll(req: Request, res: Response): Promise<void> {
    try {
      const items = await this.serviceUnavailableErrorHandlerBusinessLogic.getItems();
      const analytics = await this.serviceUnavailableErrorHandlerBusinessLogic.generateAnalytics({});

      res.status(200).json({
        success: true,
        data: items,
        analytics,
        total: items.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${ServiceUnavailableErrorHandlerController.name}.getAll:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch service unavailable error handler items',
        code: 'GET_ALL_ERROR'
      });
    }
  }

  public async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const item = await this.serviceUnavailableErrorHandlerBusinessLogic.getItem(id);
      
      if (!item) {
        res.status(404).json({
          success: false,
          error: 'Service Unavailable Error Handler item not found',
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
      console.error(`Error in ${ServiceUnavailableErrorHandlerController.name}.getById:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch service unavailable error handler item',
        code: 'GET_BY_ID_ERROR'
      });
    }
  }

  public async create(req: Request, res: Response): Promise<void> {
    try {
      // Process business rules before creation
      const processedData = await this.serviceUnavailableErrorHandlerBusinessLogic.processBusinessRules(req.body);
      
      const newItem = await this.serviceUnavailableErrorHandlerBusinessLogic.createItem(processedData);

      res.status(201).json({
        success: true,
        data: newItem,
        message: 'Service Unavailable Error Handler item created successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${ServiceUnavailableErrorHandlerController.name}.create:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to create service unavailable error handler item',
        code: 'CREATE_ERROR',
        details: error.message
      });
    }
  }

  public async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Process business rules before update
      const processedData = await this.serviceUnavailableErrorHandlerBusinessLogic.processBusinessRules(req.body);
      
      const updatedItem = await this.serviceUnavailableErrorHandlerBusinessLogic.updateItem(id, processedData);
      
      if (!updatedItem) {
        res.status(404).json({
          success: false,
          error: 'Service Unavailable Error Handler item not found',
          code: 'ITEM_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedItem,
        message: 'Service Unavailable Error Handler item updated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${ServiceUnavailableErrorHandlerController.name}.update:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to update service unavailable error handler item',
        code: 'UPDATE_ERROR',
        details: error.message
      });
    }
  }

  public async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.serviceUnavailableErrorHandlerBusinessLogic.deleteItem(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Service Unavailable Error Handler item not found',
          code: 'ITEM_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Service Unavailable Error Handler item deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${ServiceUnavailableErrorHandlerController.name}.delete:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete service unavailable error handler item',
        code: 'DELETE_ERROR'
      });
    }
  }

  public async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const isHealthy = await this.serviceUnavailableErrorHandlerBusinessLogic.healthCheck();
      
      res.status(isHealthy ? 200 : 503).json({
        success: isHealthy,
        service: 'service-unavailable-error-handler',
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${ServiceUnavailableErrorHandlerController.name}.healthCheck:`, error);
      res.status(503).json({
        success: false,
        service: 'service-unavailable-error-handler',
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

export const serviceUnavailableErrorHandlerController = new ServiceUnavailableErrorHandlerController();