import { Request, Response } from 'express';
import { PermissionDeniedErrorManagerBusinessLogic } from '../../services/business-logic/modules/user-error-guidance/PermissionDeniedErrorManagerBusinessLogic';

export class PermissionDeniedErrorManagerController {
  private permissionDeniedErrorManagerBusinessLogic: PermissionDeniedErrorManagerBusinessLogic;

  constructor() {
    this.permissionDeniedErrorManagerBusinessLogic = new PermissionDeniedErrorManagerBusinessLogic();
  }

  public async getAll(req: Request, res: Response): Promise<void> {
    try {
      const items = await this.permissionDeniedErrorManagerBusinessLogic.getItems();
      const analytics = await this.permissionDeniedErrorManagerBusinessLogic.generateAnalytics({});

      res.status(200).json({
        success: true,
        data: items,
        analytics,
        total: items.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${PermissionDeniedErrorManagerController.name}.getAll:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch permission denied error manager items',
        code: 'GET_ALL_ERROR'
      });
    }
  }

  public async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const item = await this.permissionDeniedErrorManagerBusinessLogic.getItem(id);
      
      if (!item) {
        res.status(404).json({
          success: false,
          error: 'Permission Denied Error Manager item not found',
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
      console.error(`Error in ${PermissionDeniedErrorManagerController.name}.getById:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch permission denied error manager item',
        code: 'GET_BY_ID_ERROR'
      });
    }
  }

  public async create(req: Request, res: Response): Promise<void> {
    try {
      // Process business rules before creation
      const processedData = await this.permissionDeniedErrorManagerBusinessLogic.processBusinessRules(req.body);
      
      const newItem = await this.permissionDeniedErrorManagerBusinessLogic.createItem(processedData);

      res.status(201).json({
        success: true,
        data: newItem,
        message: 'Permission Denied Error Manager item created successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${PermissionDeniedErrorManagerController.name}.create:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to create permission denied error manager item',
        code: 'CREATE_ERROR',
        details: error.message
      });
    }
  }

  public async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Process business rules before update
      const processedData = await this.permissionDeniedErrorManagerBusinessLogic.processBusinessRules(req.body);
      
      const updatedItem = await this.permissionDeniedErrorManagerBusinessLogic.updateItem(id, processedData);
      
      if (!updatedItem) {
        res.status(404).json({
          success: false,
          error: 'Permission Denied Error Manager item not found',
          code: 'ITEM_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedItem,
        message: 'Permission Denied Error Manager item updated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${PermissionDeniedErrorManagerController.name}.update:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to update permission denied error manager item',
        code: 'UPDATE_ERROR',
        details: error.message
      });
    }
  }

  public async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.permissionDeniedErrorManagerBusinessLogic.deleteItem(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Permission Denied Error Manager item not found',
          code: 'ITEM_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Permission Denied Error Manager item deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${PermissionDeniedErrorManagerController.name}.delete:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete permission denied error manager item',
        code: 'DELETE_ERROR'
      });
    }
  }

  public async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const isHealthy = await this.permissionDeniedErrorManagerBusinessLogic.healthCheck();
      
      res.status(isHealthy ? 200 : 503).json({
        success: isHealthy,
        service: 'permission-denied-error-manager',
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${PermissionDeniedErrorManagerController.name}.healthCheck:`, error);
      res.status(503).json({
        success: false,
        service: 'permission-denied-error-manager',
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

export const permissionDeniedErrorManagerController = new PermissionDeniedErrorManagerController();