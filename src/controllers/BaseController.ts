/**
 * Base Controller Pattern
 * Standardized controller implementation for enterprise-grade applications
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Standard API Response Interface
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  message?: string;
  timestamp: string;
  metadata?: {
    total?: number;
    page?: number;
    pageSize?: number;
    [key: string]: any;
  };
}

/**
 * Base Controller Class
 * Provides standardized response handling and error management
 */
export abstract class BaseController {
  /**
   * Send successful response
   */
  protected sendSuccess<T>(
    res: Response,
    data: T,
    message?: string,
    metadata?: any
  ): void {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
      metadata
    };

    res.json(response);
  }

  /**
   * Send error response
   */
  protected sendError(
    res: Response,
    error: string | Error,
    statusCode: number = 500,
    code?: string
  ): void {
    const errorMessage = error instanceof Error ? error.message : error;
    const errorCode = code || (error instanceof Error ? error.name : 'UNKNOWN_ERROR');

    const response: ApiResponse = {
      success: false,
      error: errorMessage,
      code: errorCode,
      timestamp: new Date().toISOString()
    };

    // Log error for monitoring
    logger.error('Controller error:', {
      error: errorMessage,
      code: errorCode,
      statusCode,
      stack: error instanceof Error ? error.stack : undefined
    });

    res.status(statusCode).json(response);
  }

  /**
   * Send paginated response
   */
  protected sendPaginated<T>(
    res: Response,
    data: T[],
    total: number,
    page: number,
    pageSize: number,
    message?: string
  ): void {
    const totalPages = Math.ceil(total / pageSize);
    
    this.sendSuccess(res, data, message, {
      total,
      page,
      pageSize,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    });
  }

  /**
   * Validate request parameters
   */
  protected validateRequiredFields(
    data: any,
    requiredFields: string[]
  ): string[] {
    const missingFields: string[] = [];
    
    for (const field of requiredFields) {
      if (!data[field] && data[field] !== 0 && data[field] !== false) {
        missingFields.push(field);
      }
    }
    
    return missingFields;
  }

  /**
   * Handle validation errors
   */
  protected handleValidationError(
    res: Response,
    missingFields: string[]
  ): void {
    this.sendError(
      res,
      `Missing required fields: ${missingFields.join(', ')}`,
      400,
      'VALIDATION_ERROR'
    );
  }

  /**
   * Async error handler wrapper
   */
  protected asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  };

  /**
   * Extract pagination parameters from request
   */
  protected getPaginationParams(req: Request): {
    page: number;
    pageSize: number;
    offset: number;
  } {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = Math.min(
      parseInt(req.query.pageSize as string) || 20,
      100 // Max page size
    );
    const offset = (page - 1) * pageSize;

    return { page, pageSize, offset };
  }

  /**
   * Extract filter parameters from request
   */
  protected getFilterParams(req: Request): Record<string, any> {
    const filters: Record<string, any> = {};
    
    // Common filter parameters
    if (req.query.search) {
      filters.search = req.query.search as string;
    }
    
    if (req.query.status) {
      filters.status = req.query.status as string;
    }
    
    if (req.query.priority) {
      filters.priority = req.query.priority as string;
    }
    
    if (req.query.dateFrom) {
      filters.dateFrom = new Date(req.query.dateFrom as string);
    }
    
    if (req.query.dateTo) {
      filters.dateTo = new Date(req.query.dateTo as string);
    }
    
    if (req.query.tags) {
      filters.tags = Array.isArray(req.query.tags) 
        ? req.query.tags 
        : (req.query.tags as string).split(',');
    }

    return filters;
  }
}

/**
 * Example implementation of standardized controller
 */
export class ExampleController extends BaseController {
  async getItems(req: Request, res: Response): Promise<void> {
    try {
      const { page, pageSize, offset } = this.getPaginationParams(req);
      const filters = this.getFilterParams(req);
      
      // Example service call
      // const { items, total } = await this.itemService.getItems(filters, offset, pageSize);
      
      // Mock data for example
      const items = [
        { id: '1', name: 'Example Item', status: 'active' }
      ];
      const total = 1;
      
      this.sendPaginated(res, items, total, page, pageSize, 'Items retrieved successfully');
    } catch (error) {
      this.sendError(res, error as Error);
    }
  }

  async createItem(req: Request, res: Response): Promise<void> {
    try {
      const requiredFields = ['name', 'status'];
      const missingFields = this.validateRequiredFields(req.body, requiredFields);
      
      if (missingFields.length > 0) {
        this.handleValidationError(res, missingFields);
        return;
      }
      
      // Example service call
      // const item = await this.itemService.createItem(req.body);
      
      // Mock response
      const item = { id: '1', ...req.body };
      
      this.sendSuccess(res, item, 'Item created successfully');
    } catch (error) {
      this.sendError(res, error as Error);
    }
  }

  async updateItem(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        this.sendError(res, 'Item ID is required', 400, 'INVALID_ID');
        return;
      }
      
      // Example service call
      // const item = await this.itemService.updateItem(id, req.body);
      
      // Mock response
      const item = { id, ...req.body };
      
      this.sendSuccess(res, item, 'Item updated successfully');
    } catch (error) {
      this.sendError(res, error as Error);
    }
  }

  async deleteItem(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        this.sendError(res, 'Item ID is required', 400, 'INVALID_ID');
        return;
      }
      
      // Example service call
      // await this.itemService.deleteItem(id);
      
      this.sendSuccess(res, null, 'Item deleted successfully');
    } catch (error) {
      this.sendError(res, error as Error);
    }
  }
}