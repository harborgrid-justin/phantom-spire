import { Request, Response } from 'express';
import { SyncServiceErrorManagerBusinessLogic } from '../../services/business-logic/modules/integration-error-management/SyncServiceErrorManagerBusinessLogic';

export class SyncServiceErrorManagerController {
  private syncServiceErrorManagerBusinessLogic: SyncServiceErrorManagerBusinessLogic;

  constructor() {
    this.syncServiceErrorManagerBusinessLogic = new SyncServiceErrorManagerBusinessLogic();
  }

  public async getAll(req: Request, res: Response): Promise<void> {
    try {
      const items = await this.syncServiceErrorManagerBusinessLogic.getItems();
      const analytics = await this.syncServiceErrorManagerBusinessLogic.generateAnalytics({});

      res.status(200).json({
        success: true,
        data: items,
        analytics,
        total: items.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${SyncServiceErrorManagerController.name}.getAll:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch sync service error manager items',
        code: 'GET_ALL_ERROR'
      });
    }
  }

  public async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const item = await this.syncServiceErrorManagerBusinessLogic.getItem(id);
      
      if (!item) {
        res.status(404).json({
          success: false,
          error: 'Sync Service Error Manager item not found',
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
      console.error(`Error in ${SyncServiceErrorManagerController.name}.getById:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch sync service error manager item',
        code: 'GET_BY_ID_ERROR'
      });
    }
  }

  public async create(req: Request, res: Response): Promise<void> {
    try {
      // Process business rules before creation
      const processedData = await this.syncServiceErrorManagerBusinessLogic.processBusinessRules(req.body);
      
      const newItem = await this.syncServiceErrorManagerBusinessLogic.createItem(processedData);

      res.status(201).json({
        success: true,
        data: newItem,
        message: 'Sync Service Error Manager item created successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${SyncServiceErrorManagerController.name}.create:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to create sync service error manager item',
        code: 'CREATE_ERROR',
        details: error.message
      });
    }
  }

  public async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Process business rules before update
      const processedData = await this.syncServiceErrorManagerBusinessLogic.processBusinessRules(req.body);
      
      const updatedItem = await this.syncServiceErrorManagerBusinessLogic.updateItem(id, processedData);
      
      if (!updatedItem) {
        res.status(404).json({
          success: false,
          error: 'Sync Service Error Manager item not found',
          code: 'ITEM_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedItem,
        message: 'Sync Service Error Manager item updated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${SyncServiceErrorManagerController.name}.update:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to update sync service error manager item',
        code: 'UPDATE_ERROR',
        details: error.message
      });
    }
  }

  public async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.syncServiceErrorManagerBusinessLogic.deleteItem(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Sync Service Error Manager item not found',
          code: 'ITEM_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Sync Service Error Manager item deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${SyncServiceErrorManagerController.name}.delete:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete sync service error manager item',
        code: 'DELETE_ERROR'
      });
    }
  }

  public async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const isHealthy = await this.syncServiceErrorManagerBusinessLogic.healthCheck();
      
      res.status(isHealthy ? 200 : 503).json({
        success: isHealthy,
        service: 'sync-service-error-manager',
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${SyncServiceErrorManagerController.name}.healthCheck:`, error);
      res.status(503).json({
        success: false,
        service: 'sync-service-error-manager',
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

export const syncServiceErrorManagerController = new SyncServiceErrorManagerController();