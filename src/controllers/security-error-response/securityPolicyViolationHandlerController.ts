import { Request, Response } from 'express';
import { SecurityPolicyViolationHandlerBusinessLogic } from '../../services/business-logic/modules/security-error-response/SecurityPolicyViolationHandlerBusinessLogic';

export class SecurityPolicyViolationHandlerController {
  private securityPolicyViolationHandlerBusinessLogic: SecurityPolicyViolationHandlerBusinessLogic;

  constructor() {
    this.securityPolicyViolationHandlerBusinessLogic = new SecurityPolicyViolationHandlerBusinessLogic();
  }

  public async getAll(req: Request, res: Response): Promise<void> {
    try {
      const items = await this.securityPolicyViolationHandlerBusinessLogic.getItems();
      const analytics = await this.securityPolicyViolationHandlerBusinessLogic.generateAnalytics({});

      res.status(200).json({
        success: true,
        data: items,
        analytics,
        total: items.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${SecurityPolicyViolationHandlerController.name}.getAll:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch security policy violation handler items',
        code: 'GET_ALL_ERROR'
      });
    }
  }

  public async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const item = await this.securityPolicyViolationHandlerBusinessLogic.getItem(id);
      
      if (!item) {
        res.status(404).json({
          success: false,
          error: 'Security Policy Violation Handler item not found',
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
      console.error(`Error in ${SecurityPolicyViolationHandlerController.name}.getById:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch security policy violation handler item',
        code: 'GET_BY_ID_ERROR'
      });
    }
  }

  public async create(req: Request, res: Response): Promise<void> {
    try {
      // Process business rules before creation
      const processedData = await this.securityPolicyViolationHandlerBusinessLogic.processBusinessRules(req.body);
      
      const newItem = await this.securityPolicyViolationHandlerBusinessLogic.createItem(processedData);

      res.status(201).json({
        success: true,
        data: newItem,
        message: 'Security Policy Violation Handler item created successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${SecurityPolicyViolationHandlerController.name}.create:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to create security policy violation handler item',
        code: 'CREATE_ERROR',
        details: error.message
      });
    }
  }

  public async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Process business rules before update
      const processedData = await this.securityPolicyViolationHandlerBusinessLogic.processBusinessRules(req.body);
      
      const updatedItem = await this.securityPolicyViolationHandlerBusinessLogic.updateItem(id, processedData);
      
      if (!updatedItem) {
        res.status(404).json({
          success: false,
          error: 'Security Policy Violation Handler item not found',
          code: 'ITEM_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedItem,
        message: 'Security Policy Violation Handler item updated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${SecurityPolicyViolationHandlerController.name}.update:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to update security policy violation handler item',
        code: 'UPDATE_ERROR',
        details: error.message
      });
    }
  }

  public async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.securityPolicyViolationHandlerBusinessLogic.deleteItem(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Security Policy Violation Handler item not found',
          code: 'ITEM_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Security Policy Violation Handler item deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${SecurityPolicyViolationHandlerController.name}.delete:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete security policy violation handler item',
        code: 'DELETE_ERROR'
      });
    }
  }

  public async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const isHealthy = await this.securityPolicyViolationHandlerBusinessLogic.healthCheck();
      
      res.status(isHealthy ? 200 : 503).json({
        success: isHealthy,
        service: 'security-policy-violation-handler',
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${SecurityPolicyViolationHandlerController.name}.healthCheck:`, error);
      res.status(503).json({
        success: false,
        service: 'security-policy-violation-handler',
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

export const securityPolicyViolationHandlerController = new SecurityPolicyViolationHandlerController();