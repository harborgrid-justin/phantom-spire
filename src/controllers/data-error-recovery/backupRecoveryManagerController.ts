import { Request, Response } from 'express';
import { BackupRecoveryManagerBusinessLogic } from '../../services/business-logic/modules/data-error-recovery/BackupRecoveryManagerBusinessLogic';

export class BackupRecoveryManagerController {
  private backupRecoveryManagerBusinessLogic: BackupRecoveryManagerBusinessLogic;

  constructor() {
    this.backupRecoveryManagerBusinessLogic = new BackupRecoveryManagerBusinessLogic();
  }

  public async getAll(req: Request, res: Response): Promise<void> {
    try {
      const items = await this.backupRecoveryManagerBusinessLogic.getItems();
      const analytics = await this.backupRecoveryManagerBusinessLogic.generateAnalytics({});

      res.status(200).json({
        success: true,
        data: items,
        analytics,
        total: items.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${BackupRecoveryManagerController.name}.getAll:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch backup recovery manager items',
        code: 'GET_ALL_ERROR'
      });
    }
  }

  public async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const item = await this.backupRecoveryManagerBusinessLogic.getItem(id);
      
      if (!item) {
        res.status(404).json({
          success: false,
          error: 'Backup Recovery Manager item not found',
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
      console.error(`Error in ${BackupRecoveryManagerController.name}.getById:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch backup recovery manager item',
        code: 'GET_BY_ID_ERROR'
      });
    }
  }

  public async create(req: Request, res: Response): Promise<void> {
    try {
      // Process business rules before creation
      const processedData = await this.backupRecoveryManagerBusinessLogic.processBusinessRules(req.body);
      
      const newItem = await this.backupRecoveryManagerBusinessLogic.createItem(processedData);

      res.status(201).json({
        success: true,
        data: newItem,
        message: 'Backup Recovery Manager item created successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${BackupRecoveryManagerController.name}.create:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to create backup recovery manager item',
        code: 'CREATE_ERROR',
        details: error.message
      });
    }
  }

  public async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Process business rules before update
      const processedData = await this.backupRecoveryManagerBusinessLogic.processBusinessRules(req.body);
      
      const updatedItem = await this.backupRecoveryManagerBusinessLogic.updateItem(id, processedData);
      
      if (!updatedItem) {
        res.status(404).json({
          success: false,
          error: 'Backup Recovery Manager item not found',
          code: 'ITEM_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedItem,
        message: 'Backup Recovery Manager item updated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${BackupRecoveryManagerController.name}.update:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to update backup recovery manager item',
        code: 'UPDATE_ERROR',
        details: error.message
      });
    }
  }

  public async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.backupRecoveryManagerBusinessLogic.deleteItem(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Backup Recovery Manager item not found',
          code: 'ITEM_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Backup Recovery Manager item deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${BackupRecoveryManagerController.name}.delete:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete backup recovery manager item',
        code: 'DELETE_ERROR'
      });
    }
  }

  public async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const isHealthy = await this.backupRecoveryManagerBusinessLogic.healthCheck();
      
      res.status(isHealthy ? 200 : 503).json({
        success: isHealthy,
        service: 'backup-recovery-manager',
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${BackupRecoveryManagerController.name}.healthCheck:`, error);
      res.status(503).json({
        success: false,
        service: 'backup-recovery-manager',
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

export const backupRecoveryManagerController = new BackupRecoveryManagerController();