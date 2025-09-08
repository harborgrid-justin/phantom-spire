import { Request, Response } from 'express';
import { UserWorkflowErrorGuidanceBusinessLogic } from '../../services/business-logic/modules/user-error-guidance/UserWorkflowErrorGuidanceBusinessLogic';

export class UserWorkflowErrorGuidanceController {
  private userWorkflowErrorGuidanceBusinessLogic: UserWorkflowErrorGuidanceBusinessLogic;

  constructor() {
    this.userWorkflowErrorGuidanceBusinessLogic = new UserWorkflowErrorGuidanceBusinessLogic();
  }

  public async getAll(req: Request, res: Response): Promise<void> {
    try {
      const items = await this.userWorkflowErrorGuidanceBusinessLogic.getItems();
      const analytics = await this.userWorkflowErrorGuidanceBusinessLogic.generateAnalytics({});

      res.status(200).json({
        success: true,
        data: items,
        analytics,
        total: items.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${UserWorkflowErrorGuidanceController.name}.getAll:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user workflow error guidance items',
        code: 'GET_ALL_ERROR'
      });
    }
  }

  public async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const item = await this.userWorkflowErrorGuidanceBusinessLogic.getItem(id);
      
      if (!item) {
        res.status(404).json({
          success: false,
          error: 'User Workflow Error Guidance item not found',
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
      console.error(`Error in ${UserWorkflowErrorGuidanceController.name}.getById:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user workflow error guidance item',
        code: 'GET_BY_ID_ERROR'
      });
    }
  }

  public async create(req: Request, res: Response): Promise<void> {
    try {
      // Process business rules before creation
      const processedData = await this.userWorkflowErrorGuidanceBusinessLogic.processBusinessRules(req.body);
      
      const newItem = await this.userWorkflowErrorGuidanceBusinessLogic.createItem(processedData);

      res.status(201).json({
        success: true,
        data: newItem,
        message: 'User Workflow Error Guidance item created successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${UserWorkflowErrorGuidanceController.name}.create:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to create user workflow error guidance item',
        code: 'CREATE_ERROR',
        details: error.message
      });
    }
  }

  public async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Process business rules before update
      const processedData = await this.userWorkflowErrorGuidanceBusinessLogic.processBusinessRules(req.body);
      
      const updatedItem = await this.userWorkflowErrorGuidanceBusinessLogic.updateItem(id, processedData);
      
      if (!updatedItem) {
        res.status(404).json({
          success: false,
          error: 'User Workflow Error Guidance item not found',
          code: 'ITEM_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedItem,
        message: 'User Workflow Error Guidance item updated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${UserWorkflowErrorGuidanceController.name}.update:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to update user workflow error guidance item',
        code: 'UPDATE_ERROR',
        details: error.message
      });
    }
  }

  public async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.userWorkflowErrorGuidanceBusinessLogic.deleteItem(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'User Workflow Error Guidance item not found',
          code: 'ITEM_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'User Workflow Error Guidance item deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${UserWorkflowErrorGuidanceController.name}.delete:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete user workflow error guidance item',
        code: 'DELETE_ERROR'
      });
    }
  }

  public async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const isHealthy = await this.userWorkflowErrorGuidanceBusinessLogic.healthCheck();
      
      res.status(isHealthy ? 200 : 503).json({
        success: isHealthy,
        service: 'user-workflow-error-guidance',
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${UserWorkflowErrorGuidanceController.name}.healthCheck:`, error);
      res.status(503).json({
        success: false,
        service: 'user-workflow-error-guidance',
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

export const userWorkflowErrorGuidanceController = new UserWorkflowErrorGuidanceController();