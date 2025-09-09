/**
 * Example implementation of standardized architecture patterns
 * Threat Intelligence Controller demonstrating enterprise-grade patterns
 */

import { Request, Response } from 'express';
import { BaseController } from './BaseController.js';
import { ThreatIntelService } from '../services/ThreatIntelService.js';

/**
 * Threat Intelligence Data Interface
 */
export interface ThreatData {
  id: string;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'pending' | 'completed' | 'archived';
  indicators: ThreatIndicator[];
  metadata: {
    source: string;
    confidence: number;
    tags: string[];
    category: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ThreatIndicator {
  id: string;
  type: 'ip' | 'domain' | 'hash' | 'url' | 'email';
  value: string;
  confidence: number;
  firstSeen: Date;
  lastSeen: Date;
}

export interface CreateThreatRequest {
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  indicators: Omit<ThreatIndicator, 'id' | 'firstSeen' | 'lastSeen'>[];
  metadata: {
    source: string;
    confidence: number;
    tags: string[];
    category: string;
  };
}

/**
 * Threat Intelligence Controller
 * Implements standardized enterprise patterns
 */
export class ThreatIntelController extends BaseController {
  constructor(private threatService: ThreatIntelService) {
    super();
  }

  /**
   * Get all threats with filtering and pagination
   */
  getThreats = this.asyncHandler(async (req: Request, res: Response) => {
    const { page, pageSize, offset } = this.getPaginationParams(req);
    const filters = this.getFilterParams(req);
    
    // Additional threat-specific filters
    const threatFilters = {
      ...filters,
      severity: req.query.severity as string,
      source: req.query.source as string,
      category: req.query.category as string
    };

    const result = await this.threatService.getThreats(threatFilters, { offset, limit: pageSize });
    
    if (!result.success) {
      return this.sendError(res, result.error!, 400, result.code);
    }

    this.sendPaginated(
      res, 
      result.data!.items, 
      result.data!.total, 
      page, 
      pageSize,
      'Threats retrieved successfully'
    );
  });

  /**
   * Get threat by ID
   */
  getThreat = this.asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    if (!id) {
      return this.sendError(res, 'Threat ID is required', 400, 'INVALID_ID');
    }

    const result = await this.threatService.getThreatById(id);
    
    if (!result.success) {
      return this.sendError(res, result.error!, 404, result.code);
    }

    this.sendSuccess(res, result.data, 'Threat retrieved successfully');
  });

  /**
   * Create new threat
   */
  createThreat = this.asyncHandler(async (req: Request, res: Response) => {
    const requiredFields = ['name', 'description', 'severity', 'indicators', 'metadata'];
    const missingFields = this.validateRequiredFields(req.body, requiredFields);
    
    if (missingFields.length > 0) {
      return this.handleValidationError(res, missingFields);
    }

    // Additional validation for nested objects
    if (!req.body.metadata.source) {
      return this.sendError(res, 'Metadata source is required', 400, 'VALIDATION_ERROR');
    }

    if (!Array.isArray(req.body.indicators) || req.body.indicators.length === 0) {
      return this.sendError(res, 'At least one indicator is required', 400, 'VALIDATION_ERROR');
    }

    const result = await this.threatService.createThreat(req.body as CreateThreatRequest);
    
    if (!result.success) {
      return this.sendError(res, result.error!, 400, result.code);
    }

    this.sendSuccess(res, result.data, 'Threat created successfully');
  });

  /**
   * Update threat
   */
  updateThreat = this.asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    if (!id) {
      return this.sendError(res, 'Threat ID is required', 400, 'INVALID_ID');
    }

    const result = await this.threatService.updateThreat(id, req.body);
    
    if (!result.success) {
      return this.sendError(res, result.error!, 400, result.code);
    }

    this.sendSuccess(res, result.data, 'Threat updated successfully');
  });

  /**
   * Delete threat
   */
  deleteThreat = this.asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    if (!id) {
      return this.sendError(res, 'Threat ID is required', 400, 'INVALID_ID');
    }

    const result = await this.threatService.deleteThreat(id);
    
    if (!result.success) {
      return this.sendError(res, result.error!, 400, result.code);
    }

    this.sendSuccess(res, null, 'Threat deleted successfully');
  });

  /**
   * Search threats with advanced filtering
   */
  searchThreats = this.asyncHandler(async (req: Request, res: Response) => {
    const { query, filters, options } = req.body;
    
    if (!query) {
      return this.sendError(res, 'Search query is required', 400, 'VALIDATION_ERROR');
    }

    const result = await this.threatService.searchThreats(query, filters, options);
    
    if (!result.success) {
      return this.sendError(res, result.error!, 400, result.code);
    }

    this.sendSuccess(res, result.data, 'Search completed successfully');
  });

  /**
   * Get threat analytics
   */
  getThreatAnalytics = this.asyncHandler(async (req: Request, res: Response) => {
    const { timeframe, groupBy } = req.query;
    
    const result = await this.threatService.getThreatAnalytics({
      timeframe: timeframe as string,
      groupBy: groupBy as string
    });
    
    if (!result.success) {
      return this.sendError(res, result.error!, 400, result.code);
    }

    this.sendSuccess(res, result.data, 'Analytics retrieved successfully');
  });

  /**
   * Export threats to various formats
   */
  exportThreats = this.asyncHandler(async (req: Request, res: Response) => {
    const { format, filters } = req.body;
    
    if (!format || !['csv', 'json', 'xml', 'stix'].includes(format)) {
      return this.sendError(res, 'Valid export format is required (csv, json, xml, stix)', 400, 'VALIDATION_ERROR');
    }

    const result = await this.threatService.exportThreats(format, filters);
    
    if (!result.success) {
      return this.sendError(res, result.error!, 400, result.code);
    }

    // Set appropriate headers for file download
    res.setHeader('Content-Type', this.getContentType(format));
    res.setHeader('Content-Disposition', `attachment; filename="threats.${format}"`);
    
    res.send(result.data);
  });

  /**
   * Bulk operations for threats
   */
  bulkUpdateThreats = this.asyncHandler(async (req: Request, res: Response) => {
    const { ids, updates } = req.body;
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return this.sendError(res, 'Array of threat IDs is required', 400, 'VALIDATION_ERROR');
    }

    if (!updates || Object.keys(updates).length === 0) {
      return this.sendError(res, 'Update data is required', 400, 'VALIDATION_ERROR');
    }

    const result = await this.threatService.bulkUpdateThreats(ids, updates);
    
    if (!result.success) {
      return this.sendError(res, result.error!, 400, result.code);
    }

    this.sendSuccess(res, result.data, `${result.data.updated} threats updated successfully`);
  });

  /**
   * Get threat relationships and correlations
   */
  getThreatRelationships = this.asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { depth, types } = req.query;
    
    if (!id) {
      return this.sendError(res, 'Threat ID is required', 400, 'INVALID_ID');
    }

    const result = await this.threatService.getThreatRelationships(id, {
      depth: parseInt(depth as string) || 1,
      types: types ? (types as string).split(',') : undefined
    });
    
    if (!result.success) {
      return this.sendError(res, result.error!, 400, result.code);
    }

    this.sendSuccess(res, result.data, 'Threat relationships retrieved successfully');
  });

  /**
   * Helper method to get content type for export formats
   */
  private getContentType(format: string): string {
    switch (format) {
      case 'csv': return 'text/csv';
      case 'json': return 'application/json';
      case 'xml': return 'application/xml';
      case 'stix': return 'application/json';
      default: return 'application/octet-stream';
    }
  }
}