import { Request, Response } from 'express';
import { IntrusionDetectionErrorManagerBusinessLogic } from '../../services/business-logic/modules/security-error-response/IntrusionDetectionErrorManagerBusinessLogic';

export class IntrusionDetectionErrorManagerController {
  private intrusionDetectionErrorManagerBusinessLogic: IntrusionDetectionErrorManagerBusinessLogic;

  constructor() {
    this.intrusionDetectionErrorManagerBusinessLogic = new IntrusionDetectionErrorManagerBusinessLogic();
  }

  public async getAll(req: Request, res: Response): Promise<void> {
    try {
      const items = await this.intrusionDetectionErrorManagerBusinessLogic.getItems();
      const analytics = await this.intrusionDetectionErrorManagerBusinessLogic.generateAnalytics({});

      res.status(200).json({
        success: true,
        data: items,
        analytics,
        total: items.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${IntrusionDetectionErrorManagerController.name}.getAll:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch intrusion detection error manager items',
        code: 'GET_ALL_ERROR'
      });
    }
  }

  public async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const item = await this.intrusionDetectionErrorManagerBusinessLogic.getItem(id);
      
      if (!item) {
        res.status(404).json({
          success: false,
          error: 'Intrusion Detection Error Manager item not found',
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
      console.error(`Error in ${IntrusionDetectionErrorManagerController.name}.getById:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch intrusion detection error manager item',
        code: 'GET_BY_ID_ERROR'
      });
    }
  }

  public async create(req: Request, res: Response): Promise<void> {
    try {
      // Process business rules before creation
      const processedData = await this.intrusionDetectionErrorManagerBusinessLogic.processBusinessRules(req.body);
      
      const newItem = await this.intrusionDetectionErrorManagerBusinessLogic.createItem(processedData);

      res.status(201).json({
        success: true,
        data: newItem,
        message: 'Intrusion Detection Error Manager item created successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${IntrusionDetectionErrorManagerController.name}.create:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to create intrusion detection error manager item',
        code: 'CREATE_ERROR',
        details: error.message
      });
    }
  }

  public async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Process business rules before update
      const processedData = await this.intrusionDetectionErrorManagerBusinessLogic.processBusinessRules(req.body);
      
      const updatedItem = await this.intrusionDetectionErrorManagerBusinessLogic.updateItem(id, processedData);
      
      if (!updatedItem) {
        res.status(404).json({
          success: false,
          error: 'Intrusion Detection Error Manager item not found',
          code: 'ITEM_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedItem,
        message: 'Intrusion Detection Error Manager item updated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${IntrusionDetectionErrorManagerController.name}.update:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to update intrusion detection error manager item',
        code: 'UPDATE_ERROR',
        details: error.message
      });
    }
  }

  public async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.intrusionDetectionErrorManagerBusinessLogic.deleteItem(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Intrusion Detection Error Manager item not found',
          code: 'ITEM_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Intrusion Detection Error Manager item deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${IntrusionDetectionErrorManagerController.name}.delete:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete intrusion detection error manager item',
        code: 'DELETE_ERROR'
      });
    }
  }

  public async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const isHealthy = await this.intrusionDetectionErrorManagerBusinessLogic.healthCheck();
      
      res.status(isHealthy ? 200 : 503).json({
        success: isHealthy,
        service: 'intrusion-detection-error-manager',
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${IntrusionDetectionErrorManagerController.name}.healthCheck:`, error);
      res.status(503).json({
        success: false,
        service: 'intrusion-detection-error-manager',
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

export const intrusionDetectionErrorManagerController = new IntrusionDetectionErrorManagerController();