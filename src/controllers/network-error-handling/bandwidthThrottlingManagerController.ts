import { Request, Response } from 'express';
import { BandwidthThrottlingManagerBusinessLogic } from '../../services/business-logic/modules/network-error-handling/BandwidthThrottlingManagerBusinessLogic';

export class BandwidthThrottlingManagerController {
  private bandwidthThrottlingManagerBusinessLogic: BandwidthThrottlingManagerBusinessLogic;

  constructor() {
    this.bandwidthThrottlingManagerBusinessLogic = new BandwidthThrottlingManagerBusinessLogic();
  }

  public async getAll(req: Request, res: Response): Promise<void> {
    try {
      const items = await this.bandwidthThrottlingManagerBusinessLogic.getItems();
      const analytics = await this.bandwidthThrottlingManagerBusinessLogic.generateAnalytics({});

      res.status(200).json({
        success: true,
        data: items,
        analytics,
        total: items.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${BandwidthThrottlingManagerController.name}.getAll:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch bandwidth throttling manager items',
        code: 'GET_ALL_ERROR'
      });
    }
  }

  public async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const item = await this.bandwidthThrottlingManagerBusinessLogic.getItem(id);
      
      if (!item) {
        res.status(404).json({
          success: false,
          error: 'Bandwidth Throttling Manager item not found',
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
      console.error(`Error in ${BandwidthThrottlingManagerController.name}.getById:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch bandwidth throttling manager item',
        code: 'GET_BY_ID_ERROR'
      });
    }
  }

  public async create(req: Request, res: Response): Promise<void> {
    try {
      // Process business rules before creation
      const processedData = await this.bandwidthThrottlingManagerBusinessLogic.processBusinessRules(req.body);
      
      const newItem = await this.bandwidthThrottlingManagerBusinessLogic.createItem(processedData);

      res.status(201).json({
        success: true,
        data: newItem,
        message: 'Bandwidth Throttling Manager item created successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${BandwidthThrottlingManagerController.name}.create:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to create bandwidth throttling manager item',
        code: 'CREATE_ERROR',
        details: error.message
      });
    }
  }

  public async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Process business rules before update
      const processedData = await this.bandwidthThrottlingManagerBusinessLogic.processBusinessRules(req.body);
      
      const updatedItem = await this.bandwidthThrottlingManagerBusinessLogic.updateItem(id, processedData);
      
      if (!updatedItem) {
        res.status(404).json({
          success: false,
          error: 'Bandwidth Throttling Manager item not found',
          code: 'ITEM_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedItem,
        message: 'Bandwidth Throttling Manager item updated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${BandwidthThrottlingManagerController.name}.update:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to update bandwidth throttling manager item',
        code: 'UPDATE_ERROR',
        details: error.message
      });
    }
  }

  public async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.bandwidthThrottlingManagerBusinessLogic.deleteItem(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Bandwidth Throttling Manager item not found',
          code: 'ITEM_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Bandwidth Throttling Manager item deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${BandwidthThrottlingManagerController.name}.delete:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete bandwidth throttling manager item',
        code: 'DELETE_ERROR'
      });
    }
  }

  public async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const isHealthy = await this.bandwidthThrottlingManagerBusinessLogic.healthCheck();
      
      res.status(isHealthy ? 200 : 503).json({
        success: isHealthy,
        service: 'bandwidth-throttling-manager',
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${BandwidthThrottlingManagerController.name}.healthCheck:`, error);
      res.status(503).json({
        success: false,
        service: 'bandwidth-throttling-manager',
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

export const bandwidthThrottlingManagerController = new BandwidthThrottlingManagerController();