import { Request, Response } from 'express';
import { DataCorruptionRecoveryEngineBusinessLogic } from '../../services/business-logic/modules/data-error-recovery/DataCorruptionRecoveryEngineBusinessLogic';

export class DataCorruptionRecoveryEngineController {
  private dataCorruptionRecoveryEngineBusinessLogic: DataCorruptionRecoveryEngineBusinessLogic;

  constructor() {
    this.dataCorruptionRecoveryEngineBusinessLogic = new DataCorruptionRecoveryEngineBusinessLogic();
  }

  public async getAll(req: Request, res: Response): Promise<void> {
    try {
      const items = await this.dataCorruptionRecoveryEngineBusinessLogic.getItems();
      const analytics = await this.dataCorruptionRecoveryEngineBusinessLogic.generateAnalytics({});

      res.status(200).json({
        success: true,
        data: items,
        analytics,
        total: items.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${DataCorruptionRecoveryEngineController.name}.getAll:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch data corruption recovery engine items',
        code: 'GET_ALL_ERROR'
      });
    }
  }

  public async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const item = await this.dataCorruptionRecoveryEngineBusinessLogic.getItem(id);
      
      if (!item) {
        res.status(404).json({
          success: false,
          error: 'Data Corruption Recovery Engine item not found',
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
      console.error(`Error in ${DataCorruptionRecoveryEngineController.name}.getById:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch data corruption recovery engine item',
        code: 'GET_BY_ID_ERROR'
      });
    }
  }

  public async create(req: Request, res: Response): Promise<void> {
    try {
      // Process business rules before creation
      const processedData = await this.dataCorruptionRecoveryEngineBusinessLogic.processBusinessRules(req.body);
      
      const newItem = await this.dataCorruptionRecoveryEngineBusinessLogic.createItem(processedData);

      res.status(201).json({
        success: true,
        data: newItem,
        message: 'Data Corruption Recovery Engine item created successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${DataCorruptionRecoveryEngineController.name}.create:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to create data corruption recovery engine item',
        code: 'CREATE_ERROR',
        details: error.message
      });
    }
  }

  public async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Process business rules before update
      const processedData = await this.dataCorruptionRecoveryEngineBusinessLogic.processBusinessRules(req.body);
      
      const updatedItem = await this.dataCorruptionRecoveryEngineBusinessLogic.updateItem(id, processedData);
      
      if (!updatedItem) {
        res.status(404).json({
          success: false,
          error: 'Data Corruption Recovery Engine item not found',
          code: 'ITEM_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedItem,
        message: 'Data Corruption Recovery Engine item updated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${DataCorruptionRecoveryEngineController.name}.update:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to update data corruption recovery engine item',
        code: 'UPDATE_ERROR',
        details: error.message
      });
    }
  }

  public async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.dataCorruptionRecoveryEngineBusinessLogic.deleteItem(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Data Corruption Recovery Engine item not found',
          code: 'ITEM_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Data Corruption Recovery Engine item deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${DataCorruptionRecoveryEngineController.name}.delete:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete data corruption recovery engine item',
        code: 'DELETE_ERROR'
      });
    }
  }

  public async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const isHealthy = await this.dataCorruptionRecoveryEngineBusinessLogic.healthCheck();
      
      res.status(isHealthy ? 200 : 503).json({
        success: isHealthy,
        service: 'data-corruption-recovery-engine',
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${DataCorruptionRecoveryEngineController.name}.healthCheck:`, error);
      res.status(503).json({
        success: false,
        service: 'data-corruption-recovery-engine',
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

export const dataCorruptionRecoveryEngineController = new DataCorruptionRecoveryEngineController();