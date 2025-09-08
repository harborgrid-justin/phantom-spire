import { Request, Response } from 'express';
import { ConnectionTimeoutManagerBusinessLogic } from '../../services/business-logic/modules/network-error-handling/ConnectionTimeoutManagerBusinessLogic';

export class ConnectionTimeoutManagerController {
  private connectionTimeoutManagerBusinessLogic: ConnectionTimeoutManagerBusinessLogic;

  constructor() {
    this.connectionTimeoutManagerBusinessLogic = new ConnectionTimeoutManagerBusinessLogic();
  }

  public async getAll(req: Request, res: Response): Promise<void> {
    try {
      const items = await this.connectionTimeoutManagerBusinessLogic.getItems();
      const analytics = await this.connectionTimeoutManagerBusinessLogic.generateAnalytics({});

      res.status(200).json({
        success: true,
        data: items,
        analytics,
        total: items.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${ConnectionTimeoutManagerController.name}.getAll:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch connection timeout manager items',
        code: 'GET_ALL_ERROR'
      });
    }
  }

  public async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const item = await this.connectionTimeoutManagerBusinessLogic.getItem(id);
      
      if (!item) {
        res.status(404).json({
          success: false,
          error: 'Connection Timeout Manager item not found',
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
      console.error(`Error in ${ConnectionTimeoutManagerController.name}.getById:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch connection timeout manager item',
        code: 'GET_BY_ID_ERROR'
      });
    }
  }

  public async create(req: Request, res: Response): Promise<void> {
    try {
      // Process business rules before creation
      const processedData = await this.connectionTimeoutManagerBusinessLogic.processBusinessRules(req.body);
      
      const newItem = await this.connectionTimeoutManagerBusinessLogic.createItem(processedData);

      res.status(201).json({
        success: true,
        data: newItem,
        message: 'Connection Timeout Manager item created successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${ConnectionTimeoutManagerController.name}.create:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to create connection timeout manager item',
        code: 'CREATE_ERROR',
        details: error.message
      });
    }
  }

  public async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Process business rules before update
      const processedData = await this.connectionTimeoutManagerBusinessLogic.processBusinessRules(req.body);
      
      const updatedItem = await this.connectionTimeoutManagerBusinessLogic.updateItem(id, processedData);
      
      if (!updatedItem) {
        res.status(404).json({
          success: false,
          error: 'Connection Timeout Manager item not found',
          code: 'ITEM_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedItem,
        message: 'Connection Timeout Manager item updated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${ConnectionTimeoutManagerController.name}.update:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to update connection timeout manager item',
        code: 'UPDATE_ERROR',
        details: error.message
      });
    }
  }

  public async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.connectionTimeoutManagerBusinessLogic.deleteItem(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Connection Timeout Manager item not found',
          code: 'ITEM_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Connection Timeout Manager item deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${ConnectionTimeoutManagerController.name}.delete:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete connection timeout manager item',
        code: 'DELETE_ERROR'
      });
    }
  }

  public async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const isHealthy = await this.connectionTimeoutManagerBusinessLogic.healthCheck();
      
      res.status(isHealthy ? 200 : 503).json({
        success: isHealthy,
        service: 'connection-timeout-manager',
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${ConnectionTimeoutManagerController.name}.healthCheck:`, error);
      res.status(503).json({
        success: false,
        service: 'connection-timeout-manager',
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

export const connectionTimeoutManagerController = new ConnectionTimeoutManagerController();