import { Request, Response } from 'express';
import { EncryptionErrorHandlerBusinessLogic } from '../../services/business-logic/modules/security-error-response/EncryptionErrorHandlerBusinessLogic';

export class EncryptionErrorHandlerController {
  private encryptionErrorHandlerBusinessLogic: EncryptionErrorHandlerBusinessLogic;

  constructor() {
    this.encryptionErrorHandlerBusinessLogic = new EncryptionErrorHandlerBusinessLogic();
  }

  public async getAll(req: Request, res: Response): Promise<void> {
    try {
      const items = await this.encryptionErrorHandlerBusinessLogic.getItems();
      const analytics = await this.encryptionErrorHandlerBusinessLogic.generateAnalytics({});

      res.status(200).json({
        success: true,
        data: items,
        analytics,
        total: items.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${EncryptionErrorHandlerController.name}.getAll:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch encryption error handler items',
        code: 'GET_ALL_ERROR'
      });
    }
  }

  public async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const item = await this.encryptionErrorHandlerBusinessLogic.getItem(id);
      
      if (!item) {
        res.status(404).json({
          success: false,
          error: 'Encryption Error Handler item not found',
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
      console.error(`Error in ${EncryptionErrorHandlerController.name}.getById:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch encryption error handler item',
        code: 'GET_BY_ID_ERROR'
      });
    }
  }

  public async create(req: Request, res: Response): Promise<void> {
    try {
      // Process business rules before creation
      const processedData = await this.encryptionErrorHandlerBusinessLogic.processBusinessRules(req.body);
      
      const newItem = await this.encryptionErrorHandlerBusinessLogic.createItem(processedData);

      res.status(201).json({
        success: true,
        data: newItem,
        message: 'Encryption Error Handler item created successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${EncryptionErrorHandlerController.name}.create:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to create encryption error handler item',
        code: 'CREATE_ERROR',
        details: error.message
      });
    }
  }

  public async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Process business rules before update
      const processedData = await this.encryptionErrorHandlerBusinessLogic.processBusinessRules(req.body);
      
      const updatedItem = await this.encryptionErrorHandlerBusinessLogic.updateItem(id, processedData);
      
      if (!updatedItem) {
        res.status(404).json({
          success: false,
          error: 'Encryption Error Handler item not found',
          code: 'ITEM_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedItem,
        message: 'Encryption Error Handler item updated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${EncryptionErrorHandlerController.name}.update:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to update encryption error handler item',
        code: 'UPDATE_ERROR',
        details: error.message
      });
    }
  }

  public async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.encryptionErrorHandlerBusinessLogic.deleteItem(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Encryption Error Handler item not found',
          code: 'ITEM_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Encryption Error Handler item deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${EncryptionErrorHandlerController.name}.delete:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete encryption error handler item',
        code: 'DELETE_ERROR'
      });
    }
  }

  public async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const isHealthy = await this.encryptionErrorHandlerBusinessLogic.healthCheck();
      
      res.status(isHealthy ? 200 : 503).json({
        success: isHealthy,
        service: 'encryption-error-handler',
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${EncryptionErrorHandlerController.name}.healthCheck:`, error);
      res.status(503).json({
        success: false,
        service: 'encryption-error-handler',
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

export const encryptionErrorHandlerController = new EncryptionErrorHandlerController();