import { Request, Response } from 'express';
import { ProxyErrorManagerBusinessLogic } from '../../services/business-logic/modules/network-error-handling/ProxyErrorManagerBusinessLogic';

export class ProxyErrorManagerController {
  private proxyErrorManagerBusinessLogic: ProxyErrorManagerBusinessLogic;

  constructor() {
    this.proxyErrorManagerBusinessLogic = new ProxyErrorManagerBusinessLogic();
  }

  public async getAll(req: Request, res: Response): Promise<void> {
    try {
      const items = await this.proxyErrorManagerBusinessLogic.getItems();
      const analytics = await this.proxyErrorManagerBusinessLogic.generateAnalytics({});

      res.status(200).json({
        success: true,
        data: items,
        analytics,
        total: items.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${ProxyErrorManagerController.name}.getAll:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch proxy error manager items',
        code: 'GET_ALL_ERROR'
      });
    }
  }

  public async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const item = await this.proxyErrorManagerBusinessLogic.getItem(id);
      
      if (!item) {
        res.status(404).json({
          success: false,
          error: 'Proxy Error Manager item not found',
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
      console.error(`Error in ${ProxyErrorManagerController.name}.getById:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch proxy error manager item',
        code: 'GET_BY_ID_ERROR'
      });
    }
  }

  public async create(req: Request, res: Response): Promise<void> {
    try {
      // Process business rules before creation
      const processedData = await this.proxyErrorManagerBusinessLogic.processBusinessRules(req.body);
      
      const newItem = await this.proxyErrorManagerBusinessLogic.createItem(processedData);

      res.status(201).json({
        success: true,
        data: newItem,
        message: 'Proxy Error Manager item created successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${ProxyErrorManagerController.name}.create:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to create proxy error manager item',
        code: 'CREATE_ERROR',
        details: error.message
      });
    }
  }

  public async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Process business rules before update
      const processedData = await this.proxyErrorManagerBusinessLogic.processBusinessRules(req.body);
      
      const updatedItem = await this.proxyErrorManagerBusinessLogic.updateItem(id, processedData);
      
      if (!updatedItem) {
        res.status(404).json({
          success: false,
          error: 'Proxy Error Manager item not found',
          code: 'ITEM_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedItem,
        message: 'Proxy Error Manager item updated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${ProxyErrorManagerController.name}.update:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to update proxy error manager item',
        code: 'UPDATE_ERROR',
        details: error.message
      });
    }
  }

  public async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.proxyErrorManagerBusinessLogic.deleteItem(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Proxy Error Manager item not found',
          code: 'ITEM_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Proxy Error Manager item deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${ProxyErrorManagerController.name}.delete:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete proxy error manager item',
        code: 'DELETE_ERROR'
      });
    }
  }

  public async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const isHealthy = await this.proxyErrorManagerBusinessLogic.healthCheck();
      
      res.status(isHealthy ? 200 : 503).json({
        success: isHealthy,
        service: 'proxy-error-manager',
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${ProxyErrorManagerController.name}.healthCheck:`, error);
      res.status(503).json({
        success: false,
        service: 'proxy-error-manager',
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

export const proxyErrorManagerController = new ProxyErrorManagerController();