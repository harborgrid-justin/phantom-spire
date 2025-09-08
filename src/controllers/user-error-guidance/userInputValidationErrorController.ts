import { Request, Response } from 'express';
import { UserInputValidationErrorBusinessLogic } from '../../services/business-logic/modules/user-error-guidance/UserInputValidationErrorBusinessLogic';

export class UserInputValidationErrorController {
  private userInputValidationErrorBusinessLogic: UserInputValidationErrorBusinessLogic;

  constructor() {
    this.userInputValidationErrorBusinessLogic = new UserInputValidationErrorBusinessLogic();
  }

  public async getAll(req: Request, res: Response): Promise<void> {
    try {
      const items = await this.userInputValidationErrorBusinessLogic.getItems();
      const analytics = await this.userInputValidationErrorBusinessLogic.generateAnalytics({});

      res.status(200).json({
        success: true,
        data: items,
        analytics,
        total: items.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${UserInputValidationErrorController.name}.getAll:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user input validation error items',
        code: 'GET_ALL_ERROR'
      });
    }
  }

  public async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const item = await this.userInputValidationErrorBusinessLogic.getItem(id);
      
      if (!item) {
        res.status(404).json({
          success: false,
          error: 'User Input Validation Error item not found',
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
      console.error(`Error in ${UserInputValidationErrorController.name}.getById:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user input validation error item',
        code: 'GET_BY_ID_ERROR'
      });
    }
  }

  public async create(req: Request, res: Response): Promise<void> {
    try {
      // Process business rules before creation
      const processedData = await this.userInputValidationErrorBusinessLogic.processBusinessRules(req.body);
      
      const newItem = await this.userInputValidationErrorBusinessLogic.createItem(processedData);

      res.status(201).json({
        success: true,
        data: newItem,
        message: 'User Input Validation Error item created successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${UserInputValidationErrorController.name}.create:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to create user input validation error item',
        code: 'CREATE_ERROR',
        details: error.message
      });
    }
  }

  public async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Process business rules before update
      const processedData = await this.userInputValidationErrorBusinessLogic.processBusinessRules(req.body);
      
      const updatedItem = await this.userInputValidationErrorBusinessLogic.updateItem(id, processedData);
      
      if (!updatedItem) {
        res.status(404).json({
          success: false,
          error: 'User Input Validation Error item not found',
          code: 'ITEM_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedItem,
        message: 'User Input Validation Error item updated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${UserInputValidationErrorController.name}.update:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to update user input validation error item',
        code: 'UPDATE_ERROR',
        details: error.message
      });
    }
  }

  public async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.userInputValidationErrorBusinessLogic.deleteItem(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'User Input Validation Error item not found',
          code: 'ITEM_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'User Input Validation Error item deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${UserInputValidationErrorController.name}.delete:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete user input validation error item',
        code: 'DELETE_ERROR'
      });
    }
  }

  public async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const isHealthy = await this.userInputValidationErrorBusinessLogic.healthCheck();
      
      res.status(isHealthy ? 200 : 503).json({
        success: isHealthy,
        service: 'user-input-validation-error',
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${UserInputValidationErrorController.name}.healthCheck:`, error);
      res.status(503).json({
        success: false,
        service: 'user-input-validation-error',
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

export const userInputValidationErrorController = new UserInputValidationErrorController();