import { Request, Response } from 'express';
import { LoadBalancerErrorHandlerBusinessLogic } from '../../services/business-logic/modules/network-error-handling/LoadBalancerErrorHandlerBusinessLogic';

export class LoadBalancerErrorHandlerController {
  private loadBalancerErrorHandlerBusinessLogic: LoadBalancerErrorHandlerBusinessLogic;

  constructor() {
    this.loadBalancerErrorHandlerBusinessLogic = new LoadBalancerErrorHandlerBusinessLogic();
  }

  public async getAll(req: Request, res: Response): Promise<void> {
    try {
      const items = await this.loadBalancerErrorHandlerBusinessLogic.getItems();
      const analytics = await this.loadBalancerErrorHandlerBusinessLogic.generateAnalytics({});

      res.status(200).json({
        success: true,
        data: items,
        analytics,
        total: items.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${LoadBalancerErrorHandlerController.name}.getAll:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch load balancer error handler items',
        code: 'GET_ALL_ERROR'
      });
    }
  }

  public async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const item = await this.loadBalancerErrorHandlerBusinessLogic.getItem(id);
      
      if (!item) {
        res.status(404).json({
          success: false,
          error: 'Load Balancer Error Handler item not found',
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
      console.error(`Error in ${LoadBalancerErrorHandlerController.name}.getById:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch load balancer error handler item',
        code: 'GET_BY_ID_ERROR'
      });
    }
  }

  public async create(req: Request, res: Response): Promise<void> {
    try {
      // Process business rules before creation
      const processedData = await this.loadBalancerErrorHandlerBusinessLogic.processBusinessRules(req.body);
      
      const newItem = await this.loadBalancerErrorHandlerBusinessLogic.createItem(processedData);

      res.status(201).json({
        success: true,
        data: newItem,
        message: 'Load Balancer Error Handler item created successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${LoadBalancerErrorHandlerController.name}.create:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to create load balancer error handler item',
        code: 'CREATE_ERROR',
        details: error.message
      });
    }
  }

  public async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Process business rules before update
      const processedData = await this.loadBalancerErrorHandlerBusinessLogic.processBusinessRules(req.body);
      
      const updatedItem = await this.loadBalancerErrorHandlerBusinessLogic.updateItem(id, processedData);
      
      if (!updatedItem) {
        res.status(404).json({
          success: false,
          error: 'Load Balancer Error Handler item not found',
          code: 'ITEM_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedItem,
        message: 'Load Balancer Error Handler item updated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${LoadBalancerErrorHandlerController.name}.update:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to update load balancer error handler item',
        code: 'UPDATE_ERROR',
        details: error.message
      });
    }
  }

  public async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.loadBalancerErrorHandlerBusinessLogic.deleteItem(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Load Balancer Error Handler item not found',
          code: 'ITEM_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Load Balancer Error Handler item deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${LoadBalancerErrorHandlerController.name}.delete:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete load balancer error handler item',
        code: 'DELETE_ERROR'
      });
    }
  }

  public async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const isHealthy = await this.loadBalancerErrorHandlerBusinessLogic.healthCheck();
      
      res.status(isHealthy ? 200 : 503).json({
        success: isHealthy,
        service: 'load-balancer-error-handler',
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${LoadBalancerErrorHandlerController.name}.healthCheck:`, error);
      res.status(503).json({
        success: false,
        service: 'load-balancer-error-handler',
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

export const loadBalancerErrorHandlerController = new LoadBalancerErrorHandlerController();