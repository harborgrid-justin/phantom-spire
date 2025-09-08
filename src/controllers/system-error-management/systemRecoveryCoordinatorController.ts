import { Request, Response } from 'express';
import { SystemRecoveryCoordinatorBusinessLogic } from '../../services/business-logic/modules/system-error-management/SystemRecoveryCoordinatorBusinessLogic';

export class SystemRecoveryCoordinatorController {
  private systemRecoveryCoordinatorBusinessLogic: SystemRecoveryCoordinatorBusinessLogic;

  constructor() {
    this.systemRecoveryCoordinatorBusinessLogic = new SystemRecoveryCoordinatorBusinessLogic();
  }

  public async getAll(req: Request, res: Response): Promise<void> {
    try {
      const items = await this.systemRecoveryCoordinatorBusinessLogic.getItems();
      const analytics = await this.systemRecoveryCoordinatorBusinessLogic.generateAnalytics({});

      res.status(200).json({
        success: true,
        data: items,
        analytics,
        total: items.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${SystemRecoveryCoordinatorController.name}.getAll:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch system recovery coordinator items',
        code: 'GET_ALL_ERROR'
      });
    }
  }

  public async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const item = await this.systemRecoveryCoordinatorBusinessLogic.getItem(id);
      
      if (!item) {
        res.status(404).json({
          success: false,
          error: 'System Recovery Coordinator item not found',
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
      console.error(`Error in ${SystemRecoveryCoordinatorController.name}.getById:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch system recovery coordinator item',
        code: 'GET_BY_ID_ERROR'
      });
    }
  }

  public async create(req: Request, res: Response): Promise<void> {
    try {
      // Process business rules before creation
      const processedData = await this.systemRecoveryCoordinatorBusinessLogic.processBusinessRules(req.body);
      
      const newItem = await this.systemRecoveryCoordinatorBusinessLogic.createItem(processedData);

      res.status(201).json({
        success: true,
        data: newItem,
        message: 'System Recovery Coordinator item created successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${SystemRecoveryCoordinatorController.name}.create:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to create system recovery coordinator item',
        code: 'CREATE_ERROR',
        details: error.message
      });
    }
  }

  public async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Process business rules before update
      const processedData = await this.systemRecoveryCoordinatorBusinessLogic.processBusinessRules(req.body);
      
      const updatedItem = await this.systemRecoveryCoordinatorBusinessLogic.updateItem(id, processedData);
      
      if (!updatedItem) {
        res.status(404).json({
          success: false,
          error: 'System Recovery Coordinator item not found',
          code: 'ITEM_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedItem,
        message: 'System Recovery Coordinator item updated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${SystemRecoveryCoordinatorController.name}.update:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to update system recovery coordinator item',
        code: 'UPDATE_ERROR',
        details: error.message
      });
    }
  }

  public async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.systemRecoveryCoordinatorBusinessLogic.deleteItem(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'System Recovery Coordinator item not found',
          code: 'ITEM_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'System Recovery Coordinator item deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${SystemRecoveryCoordinatorController.name}.delete:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete system recovery coordinator item',
        code: 'DELETE_ERROR'
      });
    }
  }

  public async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const isHealthy = await this.systemRecoveryCoordinatorBusinessLogic.healthCheck();
      
      res.status(isHealthy ? 200 : 503).json({
        success: isHealthy,
        service: 'system-recovery-coordinator',
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${SystemRecoveryCoordinatorController.name}.healthCheck:`, error);
      res.status(503).json({
        success: false,
        service: 'system-recovery-coordinator',
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

export const systemRecoveryCoordinatorController = new SystemRecoveryCoordinatorController();