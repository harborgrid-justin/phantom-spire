import { Request, Response } from 'express';
import { SchemaValidationErrorManagerBusinessLogic } from '../../services/business-logic/modules/data-error-recovery/SchemaValidationErrorManagerBusinessLogic';

export class SchemaValidationErrorManagerController {
  private schemaValidationErrorManagerBusinessLogic: SchemaValidationErrorManagerBusinessLogic;

  constructor() {
    this.schemaValidationErrorManagerBusinessLogic = new SchemaValidationErrorManagerBusinessLogic();
  }

  public async getAll(req: Request, res: Response): Promise<void> {
    try {
      const items = await this.schemaValidationErrorManagerBusinessLogic.getItems();
      const analytics = await this.schemaValidationErrorManagerBusinessLogic.generateAnalytics({});

      res.status(200).json({
        success: true,
        data: items,
        analytics,
        total: items.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${SchemaValidationErrorManagerController.name}.getAll:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch schema validation error manager items',
        code: 'GET_ALL_ERROR'
      });
    }
  }

  public async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const item = await this.schemaValidationErrorManagerBusinessLogic.getItem(id);
      
      if (!item) {
        res.status(404).json({
          success: false,
          error: 'Schema Validation Error Manager item not found',
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
      console.error(`Error in ${SchemaValidationErrorManagerController.name}.getById:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch schema validation error manager item',
        code: 'GET_BY_ID_ERROR'
      });
    }
  }

  public async create(req: Request, res: Response): Promise<void> {
    try {
      // Process business rules before creation
      const processedData = await this.schemaValidationErrorManagerBusinessLogic.processBusinessRules(req.body);
      
      const newItem = await this.schemaValidationErrorManagerBusinessLogic.createItem(processedData);

      res.status(201).json({
        success: true,
        data: newItem,
        message: 'Schema Validation Error Manager item created successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${SchemaValidationErrorManagerController.name}.create:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to create schema validation error manager item',
        code: 'CREATE_ERROR',
        details: error.message
      });
    }
  }

  public async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Process business rules before update
      const processedData = await this.schemaValidationErrorManagerBusinessLogic.processBusinessRules(req.body);
      
      const updatedItem = await this.schemaValidationErrorManagerBusinessLogic.updateItem(id, processedData);
      
      if (!updatedItem) {
        res.status(404).json({
          success: false,
          error: 'Schema Validation Error Manager item not found',
          code: 'ITEM_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedItem,
        message: 'Schema Validation Error Manager item updated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${SchemaValidationErrorManagerController.name}.update:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to update schema validation error manager item',
        code: 'UPDATE_ERROR',
        details: error.message
      });
    }
  }

  public async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.schemaValidationErrorManagerBusinessLogic.deleteItem(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Schema Validation Error Manager item not found',
          code: 'ITEM_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Schema Validation Error Manager item deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${SchemaValidationErrorManagerController.name}.delete:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete schema validation error manager item',
        code: 'DELETE_ERROR'
      });
    }
  }

  public async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const isHealthy = await this.schemaValidationErrorManagerBusinessLogic.healthCheck();
      
      res.status(isHealthy ? 200 : 503).json({
        success: isHealthy,
        service: 'schema-validation-error-manager',
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${SchemaValidationErrorManagerController.name}.healthCheck:`, error);
      res.status(503).json({
        success: false,
        service: 'schema-validation-error-manager',
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

export const schemaValidationErrorManagerController = new SchemaValidationErrorManagerController();