import { Request, Response } from 'express';
import { DependencyErrorTrackerBusinessLogic } from '../../services/business-logic/modules/system-error-management/DependencyErrorTrackerBusinessLogic';

export class DependencyErrorTrackerController {
  private dependencyErrorTrackerBusinessLogic: DependencyErrorTrackerBusinessLogic;

  constructor() {
    this.dependencyErrorTrackerBusinessLogic = new DependencyErrorTrackerBusinessLogic();
  }

  public async getAll(req: Request, res: Response): Promise<void> {
    try {
      const items = await this.dependencyErrorTrackerBusinessLogic.getItems();
      const analytics = await this.dependencyErrorTrackerBusinessLogic.generateAnalytics({});

      res.status(200).json({
        success: true,
        data: items,
        analytics,
        total: items.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${DependencyErrorTrackerController.name}.getAll:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch dependency error tracker items',
        code: 'GET_ALL_ERROR'
      });
    }
  }

  public async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const item = await this.dependencyErrorTrackerBusinessLogic.getItem(id);
      
      if (!item) {
        res.status(404).json({
          success: false,
          error: 'Dependency Error Tracker item not found',
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
      console.error(`Error in ${DependencyErrorTrackerController.name}.getById:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch dependency error tracker item',
        code: 'GET_BY_ID_ERROR'
      });
    }
  }

  public async create(req: Request, res: Response): Promise<void> {
    try {
      // Process business rules before creation
      const processedData = await this.dependencyErrorTrackerBusinessLogic.processBusinessRules(req.body);
      
      const newItem = await this.dependencyErrorTrackerBusinessLogic.createItem(processedData);

      res.status(201).json({
        success: true,
        data: newItem,
        message: 'Dependency Error Tracker item created successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${DependencyErrorTrackerController.name}.create:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to create dependency error tracker item',
        code: 'CREATE_ERROR',
        details: error.message
      });
    }
  }

  public async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Process business rules before update
      const processedData = await this.dependencyErrorTrackerBusinessLogic.processBusinessRules(req.body);
      
      const updatedItem = await this.dependencyErrorTrackerBusinessLogic.updateItem(id, processedData);
      
      if (!updatedItem) {
        res.status(404).json({
          success: false,
          error: 'Dependency Error Tracker item not found',
          code: 'ITEM_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedItem,
        message: 'Dependency Error Tracker item updated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${DependencyErrorTrackerController.name}.update:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to update dependency error tracker item',
        code: 'UPDATE_ERROR',
        details: error.message
      });
    }
  }

  public async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.dependencyErrorTrackerBusinessLogic.deleteItem(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Dependency Error Tracker item not found',
          code: 'ITEM_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Dependency Error Tracker item deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${DependencyErrorTrackerController.name}.delete:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete dependency error tracker item',
        code: 'DELETE_ERROR'
      });
    }
  }

  public async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const isHealthy = await this.dependencyErrorTrackerBusinessLogic.healthCheck();
      
      res.status(isHealthy ? 200 : 503).json({
        success: isHealthy,
        service: 'dependency-error-tracker',
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${DependencyErrorTrackerController.name}.healthCheck:`, error);
      res.status(503).json({
        success: false,
        service: 'dependency-error-tracker',
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

export const dependencyErrorTrackerController = new DependencyErrorTrackerController();