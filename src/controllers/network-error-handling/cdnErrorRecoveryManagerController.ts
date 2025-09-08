import { Request, Response } from 'express';
import { CdnErrorRecoveryManagerBusinessLogic } from '../../services/business-logic/modules/network-error-handling/CdnErrorRecoveryManagerBusinessLogic';

export class CdnErrorRecoveryManagerController {
  private cdnErrorRecoveryManagerBusinessLogic: CdnErrorRecoveryManagerBusinessLogic;

  constructor() {
    this.cdnErrorRecoveryManagerBusinessLogic = new CdnErrorRecoveryManagerBusinessLogic();
  }

  public async getAll(req: Request, res: Response): Promise<void> {
    try {
      const items = await this.cdnErrorRecoveryManagerBusinessLogic.getItems();
      const analytics = await this.cdnErrorRecoveryManagerBusinessLogic.generateAnalytics({});

      res.status(200).json({
        success: true,
        data: items,
        analytics,
        total: items.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${CdnErrorRecoveryManagerController.name}.getAll:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch cdn error recovery manager items',
        code: 'GET_ALL_ERROR'
      });
    }
  }

  public async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const item = await this.cdnErrorRecoveryManagerBusinessLogic.getItem(id);
      
      if (!item) {
        res.status(404).json({
          success: false,
          error: 'Cdn Error Recovery Manager item not found',
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
      console.error(`Error in ${CdnErrorRecoveryManagerController.name}.getById:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch cdn error recovery manager item',
        code: 'GET_BY_ID_ERROR'
      });
    }
  }

  public async create(req: Request, res: Response): Promise<void> {
    try {
      // Process business rules before creation
      const processedData = await this.cdnErrorRecoveryManagerBusinessLogic.processBusinessRules(req.body);
      
      const newItem = await this.cdnErrorRecoveryManagerBusinessLogic.createItem(processedData);

      res.status(201).json({
        success: true,
        data: newItem,
        message: 'Cdn Error Recovery Manager item created successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${CdnErrorRecoveryManagerController.name}.create:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to create cdn error recovery manager item',
        code: 'CREATE_ERROR',
        details: error.message
      });
    }
  }

  public async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Process business rules before update
      const processedData = await this.cdnErrorRecoveryManagerBusinessLogic.processBusinessRules(req.body);
      
      const updatedItem = await this.cdnErrorRecoveryManagerBusinessLogic.updateItem(id, processedData);
      
      if (!updatedItem) {
        res.status(404).json({
          success: false,
          error: 'Cdn Error Recovery Manager item not found',
          code: 'ITEM_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedItem,
        message: 'Cdn Error Recovery Manager item updated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${CdnErrorRecoveryManagerController.name}.update:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to update cdn error recovery manager item',
        code: 'UPDATE_ERROR',
        details: error.message
      });
    }
  }

  public async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.cdnErrorRecoveryManagerBusinessLogic.deleteItem(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Cdn Error Recovery Manager item not found',
          code: 'ITEM_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Cdn Error Recovery Manager item deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${CdnErrorRecoveryManagerController.name}.delete:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete cdn error recovery manager item',
        code: 'DELETE_ERROR'
      });
    }
  }

  public async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const isHealthy = await this.cdnErrorRecoveryManagerBusinessLogic.healthCheck();
      
      res.status(isHealthy ? 200 : 503).json({
        success: isHealthy,
        service: 'cdn-error-recovery-manager',
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${CdnErrorRecoveryManagerController.name}.healthCheck:`, error);
      res.status(503).json({
        success: false,
        service: 'cdn-error-recovery-manager',
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

export const cdnErrorRecoveryManagerController = new CdnErrorRecoveryManagerController();