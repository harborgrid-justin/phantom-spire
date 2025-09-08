import { Request, Response } from 'express';
import { MissingDataValidatorBusinessLogic } from '../../services/business-logic/modules/data-error-recovery/MissingDataValidatorBusinessLogic';

export class MissingDataValidatorController {
  private missingDataValidatorBusinessLogic: MissingDataValidatorBusinessLogic;

  constructor() {
    this.missingDataValidatorBusinessLogic = new MissingDataValidatorBusinessLogic();
  }

  public async getAll(req: Request, res: Response): Promise<void> {
    try {
      const items = await this.missingDataValidatorBusinessLogic.getItems();
      const analytics = await this.missingDataValidatorBusinessLogic.generateAnalytics({});

      res.status(200).json({
        success: true,
        data: items,
        analytics,
        total: items.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${MissingDataValidatorController.name}.getAll:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch missing data validator items',
        code: 'GET_ALL_ERROR'
      });
    }
  }

  public async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const item = await this.missingDataValidatorBusinessLogic.getItem(id);
      
      if (!item) {
        res.status(404).json({
          success: false,
          error: 'Missing Data Validator item not found',
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
      console.error(`Error in ${MissingDataValidatorController.name}.getById:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch missing data validator item',
        code: 'GET_BY_ID_ERROR'
      });
    }
  }

  public async create(req: Request, res: Response): Promise<void> {
    try {
      // Process business rules before creation
      const processedData = await this.missingDataValidatorBusinessLogic.processBusinessRules(req.body);
      
      const newItem = await this.missingDataValidatorBusinessLogic.createItem(processedData);

      res.status(201).json({
        success: true,
        data: newItem,
        message: 'Missing Data Validator item created successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${MissingDataValidatorController.name}.create:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to create missing data validator item',
        code: 'CREATE_ERROR',
        details: error.message
      });
    }
  }

  public async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Process business rules before update
      const processedData = await this.missingDataValidatorBusinessLogic.processBusinessRules(req.body);
      
      const updatedItem = await this.missingDataValidatorBusinessLogic.updateItem(id, processedData);
      
      if (!updatedItem) {
        res.status(404).json({
          success: false,
          error: 'Missing Data Validator item not found',
          code: 'ITEM_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedItem,
        message: 'Missing Data Validator item updated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${MissingDataValidatorController.name}.update:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to update missing data validator item',
        code: 'UPDATE_ERROR',
        details: error.message
      });
    }
  }

  public async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.missingDataValidatorBusinessLogic.deleteItem(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Missing Data Validator item not found',
          code: 'ITEM_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Missing Data Validator item deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${MissingDataValidatorController.name}.delete:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete missing data validator item',
        code: 'DELETE_ERROR'
      });
    }
  }

  public async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const isHealthy = await this.missingDataValidatorBusinessLogic.healthCheck();
      
      res.status(isHealthy ? 200 : 503).json({
        success: isHealthy,
        service: 'missing-data-validator',
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${MissingDataValidatorController.name}.healthCheck:`, error);
      res.status(503).json({
        success: false,
        service: 'missing-data-validator',
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

export const missingDataValidatorController = new MissingDataValidatorController();