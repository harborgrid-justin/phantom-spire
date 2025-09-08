import { Request, Response } from 'express';
import { DatabaseConnectionErrorManagerBusinessLogic } from '../../services/business-logic/modules/system-error-management/DatabaseConnectionErrorManagerBusinessLogic';

export class DatabaseConnectionErrorManagerController {
  private databaseConnectionErrorManagerBusinessLogic: DatabaseConnectionErrorManagerBusinessLogic;

  constructor() {
    this.databaseConnectionErrorManagerBusinessLogic = new DatabaseConnectionErrorManagerBusinessLogic();
  }

  public async getAll(req: Request, res: Response): Promise<void> {
    try {
      const items = await this.databaseConnectionErrorManagerBusinessLogic.getItems();
      const analytics = await this.databaseConnectionErrorManagerBusinessLogic.generateAnalytics({});

      res.status(200).json({
        success: true,
        data: items,
        analytics,
        total: items.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${DatabaseConnectionErrorManagerController.name}.getAll:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch database connection error manager items',
        code: 'GET_ALL_ERROR'
      });
    }
  }

  public async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const item = await this.databaseConnectionErrorManagerBusinessLogic.getItem(id);
      
      if (!item) {
        res.status(404).json({
          success: false,
          error: 'Database Connection Error Manager item not found',
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
      console.error(`Error in ${DatabaseConnectionErrorManagerController.name}.getById:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch database connection error manager item',
        code: 'GET_BY_ID_ERROR'
      });
    }
  }

  public async create(req: Request, res: Response): Promise<void> {
    try {
      // Process business rules before creation
      const processedData = await this.databaseConnectionErrorManagerBusinessLogic.processBusinessRules(req.body);
      
      const newItem = await this.databaseConnectionErrorManagerBusinessLogic.createItem(processedData);

      res.status(201).json({
        success: true,
        data: newItem,
        message: 'Database Connection Error Manager item created successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${DatabaseConnectionErrorManagerController.name}.create:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to create database connection error manager item',
        code: 'CREATE_ERROR',
        details: error.message
      });
    }
  }

  public async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Process business rules before update
      const processedData = await this.databaseConnectionErrorManagerBusinessLogic.processBusinessRules(req.body);
      
      const updatedItem = await this.databaseConnectionErrorManagerBusinessLogic.updateItem(id, processedData);
      
      if (!updatedItem) {
        res.status(404).json({
          success: false,
          error: 'Database Connection Error Manager item not found',
          code: 'ITEM_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedItem,
        message: 'Database Connection Error Manager item updated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${DatabaseConnectionErrorManagerController.name}.update:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to update database connection error manager item',
        code: 'UPDATE_ERROR',
        details: error.message
      });
    }
  }

  public async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.databaseConnectionErrorManagerBusinessLogic.deleteItem(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Database Connection Error Manager item not found',
          code: 'ITEM_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Database Connection Error Manager item deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${DatabaseConnectionErrorManagerController.name}.delete:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete database connection error manager item',
        code: 'DELETE_ERROR'
      });
    }
  }

  public async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const isHealthy = await this.databaseConnectionErrorManagerBusinessLogic.healthCheck();
      
      res.status(isHealthy ? 200 : 503).json({
        success: isHealthy,
        service: 'database-connection-error-manager',
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${DatabaseConnectionErrorManagerController.name}.healthCheck:`, error);
      res.status(503).json({
        success: false,
        service: 'database-connection-error-manager',
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

export const databaseConnectionErrorManagerController = new DatabaseConnectionErrorManagerController();