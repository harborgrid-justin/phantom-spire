import { Request, Response } from 'express';
import { DataIntegrityMonitorBusinessLogic } from '../../services/business-logic/modules/data-error-recovery/DataIntegrityMonitorBusinessLogic';

export class DataIntegrityMonitorController {
  private dataIntegrityMonitorBusinessLogic: DataIntegrityMonitorBusinessLogic;

  constructor() {
    this.dataIntegrityMonitorBusinessLogic = new DataIntegrityMonitorBusinessLogic();
  }

  public async getAll(req: Request, res: Response): Promise<void> {
    try {
      const items = await this.dataIntegrityMonitorBusinessLogic.getItems();
      const analytics = await this.dataIntegrityMonitorBusinessLogic.generateAnalytics({});

      res.status(200).json({
        success: true,
        data: items,
        analytics,
        total: items.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${DataIntegrityMonitorController.name}.getAll:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch data integrity monitor items',
        code: 'GET_ALL_ERROR'
      });
    }
  }

  public async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const item = await this.dataIntegrityMonitorBusinessLogic.getItem(id);
      
      if (!item) {
        res.status(404).json({
          success: false,
          error: 'Data Integrity Monitor item not found',
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
      console.error(`Error in ${DataIntegrityMonitorController.name}.getById:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch data integrity monitor item',
        code: 'GET_BY_ID_ERROR'
      });
    }
  }

  public async create(req: Request, res: Response): Promise<void> {
    try {
      // Process business rules before creation
      const processedData = await this.dataIntegrityMonitorBusinessLogic.processBusinessRules(req.body);
      
      const newItem = await this.dataIntegrityMonitorBusinessLogic.createItem(processedData);

      res.status(201).json({
        success: true,
        data: newItem,
        message: 'Data Integrity Monitor item created successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${DataIntegrityMonitorController.name}.create:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to create data integrity monitor item',
        code: 'CREATE_ERROR',
        details: error.message
      });
    }
  }

  public async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Process business rules before update
      const processedData = await this.dataIntegrityMonitorBusinessLogic.processBusinessRules(req.body);
      
      const updatedItem = await this.dataIntegrityMonitorBusinessLogic.updateItem(id, processedData);
      
      if (!updatedItem) {
        res.status(404).json({
          success: false,
          error: 'Data Integrity Monitor item not found',
          code: 'ITEM_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedItem,
        message: 'Data Integrity Monitor item updated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${DataIntegrityMonitorController.name}.update:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to update data integrity monitor item',
        code: 'UPDATE_ERROR',
        details: error.message
      });
    }
  }

  public async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.dataIntegrityMonitorBusinessLogic.deleteItem(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Data Integrity Monitor item not found',
          code: 'ITEM_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Data Integrity Monitor item deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${DataIntegrityMonitorController.name}.delete:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete data integrity monitor item',
        code: 'DELETE_ERROR'
      });
    }
  }

  public async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const isHealthy = await this.dataIntegrityMonitorBusinessLogic.healthCheck();
      
      res.status(isHealthy ? 200 : 503).json({
        success: isHealthy,
        service: 'data-integrity-monitor',
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${DataIntegrityMonitorController.name}.healthCheck:`, error);
      res.status(503).json({
        success: false,
        service: 'data-integrity-monitor',
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

export const dataIntegrityMonitorController = new DataIntegrityMonitorController();