import { Request, Response } from 'express';
import { FeatureUnavailableHandlerBusinessLogic } from '../../services/business-logic/modules/user-error-guidance/FeatureUnavailableHandlerBusinessLogic';

export class FeatureUnavailableHandlerController {
  private featureUnavailableHandlerBusinessLogic: FeatureUnavailableHandlerBusinessLogic;

  constructor() {
    this.featureUnavailableHandlerBusinessLogic = new FeatureUnavailableHandlerBusinessLogic();
  }

  public async getAll(req: Request, res: Response): Promise<void> {
    try {
      const items = await this.featureUnavailableHandlerBusinessLogic.getItems();
      const analytics = await this.featureUnavailableHandlerBusinessLogic.generateAnalytics({});

      res.status(200).json({
        success: true,
        data: items,
        analytics,
        total: items.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${FeatureUnavailableHandlerController.name}.getAll:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch feature unavailable handler items',
        code: 'GET_ALL_ERROR'
      });
    }
  }

  public async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const item = await this.featureUnavailableHandlerBusinessLogic.getItem(id);
      
      if (!item) {
        res.status(404).json({
          success: false,
          error: 'Feature Unavailable Handler item not found',
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
      console.error(`Error in ${FeatureUnavailableHandlerController.name}.getById:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch feature unavailable handler item',
        code: 'GET_BY_ID_ERROR'
      });
    }
  }

  public async create(req: Request, res: Response): Promise<void> {
    try {
      // Process business rules before creation
      const processedData = await this.featureUnavailableHandlerBusinessLogic.processBusinessRules(req.body);
      
      const newItem = await this.featureUnavailableHandlerBusinessLogic.createItem(processedData);

      res.status(201).json({
        success: true,
        data: newItem,
        message: 'Feature Unavailable Handler item created successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${FeatureUnavailableHandlerController.name}.create:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to create feature unavailable handler item',
        code: 'CREATE_ERROR',
        details: error.message
      });
    }
  }

  public async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Process business rules before update
      const processedData = await this.featureUnavailableHandlerBusinessLogic.processBusinessRules(req.body);
      
      const updatedItem = await this.featureUnavailableHandlerBusinessLogic.updateItem(id, processedData);
      
      if (!updatedItem) {
        res.status(404).json({
          success: false,
          error: 'Feature Unavailable Handler item not found',
          code: 'ITEM_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedItem,
        message: 'Feature Unavailable Handler item updated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${FeatureUnavailableHandlerController.name}.update:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to update feature unavailable handler item',
        code: 'UPDATE_ERROR',
        details: error.message
      });
    }
  }

  public async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.featureUnavailableHandlerBusinessLogic.deleteItem(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Feature Unavailable Handler item not found',
          code: 'ITEM_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Feature Unavailable Handler item deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${FeatureUnavailableHandlerController.name}.delete:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete feature unavailable handler item',
        code: 'DELETE_ERROR'
      });
    }
  }

  public async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const isHealthy = await this.featureUnavailableHandlerBusinessLogic.healthCheck();
      
      res.status(isHealthy ? 200 : 503).json({
        success: isHealthy,
        service: 'feature-unavailable-handler',
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${FeatureUnavailableHandlerController.name}.healthCheck:`, error);
      res.status(503).json({
        success: false,
        service: 'feature-unavailable-handler',
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

export const featureUnavailableHandlerController = new FeatureUnavailableHandlerController();