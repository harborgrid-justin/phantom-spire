import { Request, Response } from 'express';
import { PrivilegeEscalationErrorHandlerBusinessLogic } from '../../services/business-logic/modules/security-error-response/PrivilegeEscalationErrorHandlerBusinessLogic';

export class PrivilegeEscalationErrorHandlerController {
  private privilegeEscalationErrorHandlerBusinessLogic: PrivilegeEscalationErrorHandlerBusinessLogic;

  constructor() {
    this.privilegeEscalationErrorHandlerBusinessLogic = new PrivilegeEscalationErrorHandlerBusinessLogic();
  }

  public async getAll(req: Request, res: Response): Promise<void> {
    try {
      const items = await this.privilegeEscalationErrorHandlerBusinessLogic.getItems();
      const analytics = await this.privilegeEscalationErrorHandlerBusinessLogic.generateAnalytics({});

      res.status(200).json({
        success: true,
        data: items,
        analytics,
        total: items.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${PrivilegeEscalationErrorHandlerController.name}.getAll:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch privilege escalation error handler items',
        code: 'GET_ALL_ERROR'
      });
    }
  }

  public async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const item = await this.privilegeEscalationErrorHandlerBusinessLogic.getItem(id);
      
      if (!item) {
        res.status(404).json({
          success: false,
          error: 'Privilege Escalation Error Handler item not found',
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
      console.error(`Error in ${PrivilegeEscalationErrorHandlerController.name}.getById:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch privilege escalation error handler item',
        code: 'GET_BY_ID_ERROR'
      });
    }
  }

  public async create(req: Request, res: Response): Promise<void> {
    try {
      // Process business rules before creation
      const processedData = await this.privilegeEscalationErrorHandlerBusinessLogic.processBusinessRules(req.body);
      
      const newItem = await this.privilegeEscalationErrorHandlerBusinessLogic.createItem(processedData);

      res.status(201).json({
        success: true,
        data: newItem,
        message: 'Privilege Escalation Error Handler item created successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${PrivilegeEscalationErrorHandlerController.name}.create:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to create privilege escalation error handler item',
        code: 'CREATE_ERROR',
        details: error.message
      });
    }
  }

  public async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Process business rules before update
      const processedData = await this.privilegeEscalationErrorHandlerBusinessLogic.processBusinessRules(req.body);
      
      const updatedItem = await this.privilegeEscalationErrorHandlerBusinessLogic.updateItem(id, processedData);
      
      if (!updatedItem) {
        res.status(404).json({
          success: false,
          error: 'Privilege Escalation Error Handler item not found',
          code: 'ITEM_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedItem,
        message: 'Privilege Escalation Error Handler item updated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${PrivilegeEscalationErrorHandlerController.name}.update:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to update privilege escalation error handler item',
        code: 'UPDATE_ERROR',
        details: error.message
      });
    }
  }

  public async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.privilegeEscalationErrorHandlerBusinessLogic.deleteItem(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Privilege Escalation Error Handler item not found',
          code: 'ITEM_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Privilege Escalation Error Handler item deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${PrivilegeEscalationErrorHandlerController.name}.delete:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete privilege escalation error handler item',
        code: 'DELETE_ERROR'
      });
    }
  }

  public async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const isHealthy = await this.privilegeEscalationErrorHandlerBusinessLogic.healthCheck();
      
      res.status(isHealthy ? 200 : 503).json({
        success: isHealthy,
        service: 'privilege-escalation-error-handler',
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${PrivilegeEscalationErrorHandlerController.name}.healthCheck:`, error);
      res.status(503).json({
        success: false,
        service: 'privilege-escalation-error-handler',
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

export const privilegeEscalationErrorHandlerController = new PrivilegeEscalationErrorHandlerController();