/**
 * IOC Controller - Standardized Implementation
 * Follows BaseController pattern for enterprise-grade IOC management
 */

import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { IOC, IIOC } from '../models/IOC.js';
import {
  CreateIOCRequest,
  UpdateIOCRequest,
  IOCQuery,
  ApiResponse,
} from '../types/api.js';
import { IOCValidationService } from '../services/iocValidationService.js';
import { IOCAnalysisService } from '../services/iocAnalysisService.js';
import { IOCEnrichmentService } from '../services/iocEnrichmentService.js';
import { IOCStatisticsService } from '../services/iocStatisticsService.js';

/**
 * IOC Controller extending BaseController
 * Provides standardized IOC management with enterprise patterns
 */
export class IOCController extends BaseController {
  constructor(
    private iocValidationService: IOCValidationService,
    private iocAnalysisService: IOCAnalysisService,
    private iocEnrichmentService: IOCEnrichmentService,
    private iocStatisticsService: IOCStatisticsService
  ) {
    super();
  }

  /**
   * Get all IOCs with pagination and filtering
   */
  getIOCs = this.asyncHandler(async (req: Request, res: Response) => {
    const { page, pageSize, offset } = this.getPaginationParams(req);
    const filters = this.getFilterParams(req);
    
    try {
      // Build query from filters
      const query: any = {};
      
      if (filters.type) {
        query.type = filters.type;
      }
      
      if (filters.severity) {
        query.severity = filters.severity;
      }
      
      if (filters.status) {
        query.status = filters.status;
      }
      
      if (filters.search) {
        query.$or = [
          { value: { $regex: filters.search, $options: 'i' } },
          { description: { $regex: filters.search, $options: 'i' } },
          { source: { $regex: filters.search, $options: 'i' } }
        ];
      }

      // Get paginated results
      const [iocs, total] = await Promise.all([
        IOC.find(query)
          .skip(offset)
          .limit(pageSize)
          .sort({ createdAt: -1 }),
        IOC.countDocuments(query)
      ]);

      this.sendPaginated(
        res,
        iocs,
        total,
        page,
        pageSize,
        'IOCs retrieved successfully'
      );
    } catch (error) {
      this.sendError(res, error as Error, 500, 'IOC_FETCH_ERROR');
    }
  });

  /**
   * Get IOC by ID
   */
  getIOC = this.asyncHandler(async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (!id) {
        return this.sendError(res, 'IOC ID is required', 400, 'INVALID_ID');
      }

      const ioc = await IOC.findById(id);
      
      if (!ioc) {
        return this.sendError(res, 'IOC not found', 404, 'IOC_NOT_FOUND');
      }

      this.sendSuccess(res, ioc, 'IOC retrieved successfully');
    } catch (error) {
      this.sendError(res, error as Error, 500, 'IOC_FETCH_ERROR');
    }
  });

  /**
   * Create new IOC
   */
  createIOC = this.asyncHandler(async (req: Request, res: Response) => {
    try {
      const missingFields = this.validateRequiredFields(req.body, [
        'type',
        'value',
        'severity'
      ]);
      
      if (missingFields.length > 0) {
        return this.handleValidationError(res, missingFields);
      }

      const createRequest: CreateIOCRequest = req.body;
      
      // Validate IOC data
      const validationResult = await this.iocValidationService.validateIOC(createRequest);
      if (!validationResult.isValid) {
        return this.sendError(
          res,
          `Validation failed: ${validationResult.errors.join(', ')}`,
          400,
          'VALIDATION_ERROR'
        );
      }

      // Check for duplicates
      const existingIOC = await IOC.findOne({
        type: createRequest.type,
        value: createRequest.value
      });
      
      if (existingIOC) {
        return this.sendError(
          res,
          'IOC with this type and value already exists',
          409,
          'DUPLICATE_IOC'
        );
      }

      // Create IOC
      const ioc = new IOC({
        ...createRequest,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: (req as any).user?.id
      });

      const savedIOC = await ioc.save();

      // Trigger analysis and enrichment (async)
      this.triggerIOCProcessing(savedIOC);

      this.sendSuccess(res, savedIOC, 'IOC created successfully', {
        id: savedIOC._id
      });
    } catch (error) {
      this.sendError(res, error as Error, 500, 'IOC_CREATE_ERROR');
    }
  });

  /**
   * Update IOC
   */
  updateIOC = this.asyncHandler(async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (!id) {
        return this.sendError(res, 'IOC ID is required', 400, 'INVALID_ID');
      }

      const updateRequest: UpdateIOCRequest = req.body;
      
      const ioc = await IOC.findById(id);
      if (!ioc) {
        return this.sendError(res, 'IOC not found', 404, 'IOC_NOT_FOUND');
      }

      // Update fields
      Object.assign(ioc, updateRequest, {
        updatedAt: new Date(),
        updatedBy: (req as any).user?.id
      });

      const updatedIOC = await ioc.save();

      this.sendSuccess(res, updatedIOC, 'IOC updated successfully');
    } catch (error) {
      this.sendError(res, error as Error, 500, 'IOC_UPDATE_ERROR');
    }
  });

  /**
   * Delete IOC
   */
  deleteIOC = this.asyncHandler(async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (!id) {
        return this.sendError(res, 'IOC ID is required', 400, 'INVALID_ID');
      }

      const ioc = await IOC.findById(id);
      if (!ioc) {
        return this.sendError(res, 'IOC not found', 404, 'IOC_NOT_FOUND');
      }

      await IOC.findByIdAndDelete(id);

      this.sendSuccess(res, null, 'IOC deleted successfully');
    } catch (error) {
      this.sendError(res, error as Error, 500, 'IOC_DELETE_ERROR');
    }
  });

  /**
   * Search IOCs
   */
  searchIOCs = this.asyncHandler(async (req: Request, res: Response) => {
    try {
      const { query, filters = {} } = req.body;
      const { page, pageSize, offset } = this.getPaginationParams(req);
      
      if (!query || query.trim().length === 0) {
        return this.sendError(res, 'Search query is required', 400, 'INVALID_QUERY');
      }

      const searchQuery = {
        $and: [
          {
            $or: [
              { value: { $regex: query, $options: 'i' } },
              { description: { $regex: query, $options: 'i' } },
              { source: { $regex: query, $options: 'i' } },
              { 'tags': { $regex: query, $options: 'i' } }
            ]
          },
          ...(filters.type ? [{ type: filters.type }] : []),
          ...(filters.severity ? [{ severity: filters.severity }] : []),
          ...(filters.status ? [{ status: filters.status }] : [])
        ]
      };

      const [iocs, total] = await Promise.all([
        IOC.find(searchQuery)
          .skip(offset)
          .limit(pageSize)
          .sort({ createdAt: -1 }),
        IOC.countDocuments(searchQuery)
      ]);

      this.sendPaginated(
        res,
        iocs,
        total,
        page,
        pageSize,
        'IOC search completed successfully'
      );
    } catch (error) {
      this.sendError(res, error as Error, 500, 'IOC_SEARCH_ERROR');
    }
  });

  /**
   * Analyze IOC
   */
  analyzeIOC = this.asyncHandler(async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (!id) {
        return this.sendError(res, 'IOC ID is required', 400, 'INVALID_ID');
      }

      const ioc = await IOC.findById(id);
      if (!ioc) {
        return this.sendError(res, 'IOC not found', 404, 'IOC_NOT_FOUND');
      }

      const analysisResult = await this.iocAnalysisService.analyzeIOC(ioc);
      
      this.sendSuccess(res, analysisResult, 'IOC analysis completed successfully');
    } catch (error) {
      this.sendError(res, error as Error, 500, 'IOC_ANALYSIS_ERROR');
    }
  });

  /**
   * Enrich IOC with external data
   */
  enrichIOC = this.asyncHandler(async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (!id) {
        return this.sendError(res, 'IOC ID is required', 400, 'INVALID_ID');
      }

      const ioc = await IOC.findById(id);
      if (!ioc) {
        return this.sendError(res, 'IOC not found', 404, 'IOC_NOT_FOUND');
      }

      const enrichmentResult = await this.iocEnrichmentService.enrichIOC(ioc);
      
      // Update IOC with enrichment data
      Object.assign(ioc, {
        enrichmentData: enrichmentResult,
        lastEnriched: new Date(),
        updatedAt: new Date()
      });
      
      await ioc.save();

      this.sendSuccess(res, enrichmentResult, 'IOC enrichment completed successfully');
    } catch (error) {
      this.sendError(res, error as Error, 500, 'IOC_ENRICHMENT_ERROR');
    }
  });

  /**
   * Get IOC statistics
   */
  getIOCStatistics = this.asyncHandler(async (req: Request, res: Response) => {
    try {
      const statistics = await this.iocStatisticsService.getStatistics();
      
      this.sendSuccess(res, statistics, 'IOC statistics retrieved successfully');
    } catch (error) {
      this.sendError(res, error as Error, 500, 'IOC_STATS_ERROR');
    }
  });

  /**
   * Bulk create IOCs
   */
  bulkCreateIOCs = this.asyncHandler(async (req: Request, res: Response) => {
    try {
      const { iocs } = req.body;
      
      if (!Array.isArray(iocs) || iocs.length === 0) {
        return this.sendError(res, 'IOCs array is required', 400, 'INVALID_INPUT');
      }

      if (iocs.length > 100) {
        return this.sendError(res, 'Maximum 100 IOCs allowed per bulk operation', 400, 'BULK_LIMIT_EXCEEDED');
      }

      const results = [];
      const errors = [];

      for (const iocData of iocs) {
        try {
          // Validate each IOC
          const validationResult = await this.iocValidationService.validateIOC(iocData);
          if (!validationResult.isValid) {
            errors.push({
              data: iocData,
              error: `Validation failed: ${validationResult.errors.join(', ')}`
            });
            continue;
          }

          // Check for duplicates
          const existingIOC = await IOC.findOne({
            type: iocData.type,
            value: iocData.value
          });
          
          if (existingIOC) {
            errors.push({
              data: iocData,
              error: 'IOC with this type and value already exists'
            });
            continue;
          }

          // Create IOC
          const ioc = new IOC({
            ...iocData,
            createdAt: new Date(),
            updatedAt: new Date(),
            userId: (req as any).user?.id
          });

          const savedIOC = await ioc.save();
          results.push(savedIOC);

          // Trigger processing (async)
          this.triggerIOCProcessing(savedIOC);
        } catch (error) {
          errors.push({
            data: iocData,
            error: (error as Error).message
          });
        }
      }

      this.sendSuccess(res, {
        created: results,
        errors: errors,
        summary: {
          total: iocs.length,
          created: results.length,
          failed: errors.length
        }
      }, 'Bulk IOC creation completed');
    } catch (error) {
      this.sendError(res, error as Error, 500, 'BULK_CREATE_ERROR');
    }
  });

  /**
   * Trigger asynchronous IOC processing
   */
  private async triggerIOCProcessing(ioc: IIOC): Promise<void> {
    try {
      // Trigger analysis and enrichment in background
      Promise.all([
        this.iocAnalysisService.analyzeIOC(ioc),
        this.iocEnrichmentService.enrichIOC(ioc)
      ]).catch(error => {
        console.error('IOC processing failed:', error);
      });
    } catch (error) {
      console.error('Failed to trigger IOC processing:', error);
    }
  }
}

// Export standardized controller instance factory
export const createIOCController = (
  validationService: IOCValidationService,
  analysisService: IOCAnalysisService,
  enrichmentService: IOCEnrichmentService,
  statisticsService: IOCStatisticsService
) => {
  return new IOCController(
    validationService,
    analysisService,
    enrichmentService,
    statisticsService
  );
};

/**
 * Get all IOCs with filtering, pagination, and search
 */
export const getIOCs = async (req: Request, res: Response) => {
  const {
    page = '1',
    limit = '10',
    type,
    severity,
    confidence_min,
    confidence_max,
    tags,
    isActive = 'true',
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query as IOCQuery;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Build filter query
  const filter: any = {};

  if (type) filter.type = type;
  if (severity) filter.severity = severity;
  if (isActive) filter.isActive = isActive === 'true';

  if (confidence_min || confidence_max) {
    filter.confidence = {};
    if (confidence_min) filter.confidence.$gte = parseInt(confidence_min);
    if (confidence_max) filter.confidence.$lte = parseInt(confidence_max);
  }

  if (tags) {
    filter.tags = { $in: tags.split(',') };
  }

  if (search) {
    filter.$or = [
      { value: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { source: { $regex: search, $options: 'i' } },
    ];
  }

  // Build sort query
  const sort: any = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  const [iocs, total] = await Promise.all([
    IOC.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .sort(sort)
      .skip(skip)
      .limit(limitNum),
    IOC.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: iocs,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  } as ApiResponse);
};

/**
 * @swagger
 * /iocs/{id}:
 *   get:
 *     summary: Get IOC by ID
 *     tags: [IOCs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: IOC details
 *       404:
 *         description: IOC not found
 */
export const getIOCById = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const ioc = await IOC.findById(req.params.id).populate(
      'createdBy',
      'firstName lastName email'
    );

    if (!ioc) {
      throw createError('IOC not found', 404);
    }

    res.json({
      success: true,
      data: ioc,
    } as ApiResponse);
  }
);

/**
 * @swagger
 * /iocs:
 *   post:
 *     summary: Create a new IOC
 *     tags: [IOCs]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/IOC'
 *     responses:
 *       201:
 *         description: IOC created successfully
 *       400:
 *         description: Validation error
 */
export const createIOC = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const iocData: CreateIOCRequest = req.body;

    // Validate IOC with business logic
    const validationResult = await IOCValidationService.validateIOC(iocData);

    if (!validationResult.isValid) {
      res.status(400).json({
        success: false,
        error: 'IOC validation failed',
        details: {
          errors: validationResult.errors,
          warnings: validationResult.warnings,
        },
      } as ApiResponse);
      return;
    }

    // Use normalized value if available
    const iocValue = validationResult.normalizedValue || iocData.value;

    // Auto-detect IOC type if not specified correctly
    const detectedType = IOCValidationService.detectIOCType(iocValue);
    if (detectedType !== 'unknown' && detectedType !== iocData.type) {
      logger.warn(
        `IOC type mismatch detected: ${iocData.type} vs ${detectedType} for ${iocValue}`
      );
    }

    const ioc: IIOC = new IOC({
      ...iocData,
      value: iocValue,
      createdBy: req.user!.id,
      metadata: {
        ...iocData.metadata,
        ...validationResult.metadata,
        validation: {
          warnings: validationResult.warnings,
          detectedType,
          validatedAt: new Date(),
        },
      },
    });

    await ioc.save();
    await ioc.populate('createdBy', 'firstName lastName email');

    // Perform asynchronous enrichment (don't wait for completion)
    IOCEnrichmentService.enrichIOC(ioc)
      .then(enrichmentResult => {
        if (enrichmentResult.success) {
          // Update IOC with enrichment data
          IOC.findByIdAndUpdate(ioc._id, {
            $set: {
              'metadata.enrichment': enrichmentResult.metadata,
              'metadata.enrichmentSources': enrichmentResult.sources,
              'metadata.enrichedAt': enrichmentResult.enrichedAt,
            },
          }).catch(err =>
            logger.error('Failed to update IOC with enrichment data', err)
          );
        }
      })
      .catch(err => logger.error('IOC enrichment failed', err));

    logger.info(`IOC created: ${ioc.value} by ${req.user!.email}`, {
      type: ioc.type,
      severity: ioc.severity,
      confidence: ioc.confidence,
      hasWarnings: validationResult.warnings.length > 0,
    });

    res.status(201).json({
      success: true,
      data: ioc,
      message: 'IOC created successfully',
      validation: {
        warnings: validationResult.warnings,
        detectedType: detectedType !== iocData.type ? detectedType : undefined,
      },
    } as ApiResponse);
  }
);

/**
 * @swagger
 * /iocs/{id}:
 *   put:
 *     summary: Update IOC by ID
 *     tags: [IOCs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: IOC updated successfully
 *       404:
 *         description: IOC not found
 */
export const updateIOC = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const updateData: UpdateIOCRequest = req.body;

    const ioc = await IOC.findByIdAndUpdate(
      req.params.id,
      { ...updateData, lastSeen: new Date() },
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName email');

    if (!ioc) {
      throw createError('IOC not found', 404);
    }

    logger.info(`IOC updated: ${ioc.value} by ${req.user!.email}`);

    res.json({
      success: true,
      data: ioc,
      message: 'IOC updated successfully',
    } as ApiResponse);
  }
);

/**
 * @swagger
 * /iocs/{id}:
 *   delete:
 *     summary: Delete IOC by ID
 *     tags: [IOCs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: IOC deleted successfully
 *       404:
 *         description: IOC not found
 */
export const deleteIOC = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const ioc = await IOC.findByIdAndDelete(req.params.id);

    if (!ioc) {
      throw createError('IOC not found', 404);
    }

    logger.info(`IOC deleted: ${ioc.value} by ${req.user!.email}`);

    res.json({
      success: true,
      message: 'IOC deleted successfully',
    } as ApiResponse);
  }
);

/**
 * @swagger
 * /iocs/{id}/analyze:
 *   post:
 *     summary: Perform risk analysis on an IOC
 *     tags: [IOCs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Risk analysis completed
 *       404:
 *         description: IOC not found
 */
export const analyzeIOC = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const ioc = await IOC.findById(req.params.id);

    if (!ioc) {
      throw createError('IOC not found', 404);
    }

    const [riskAssessment, priority, correlations] = await Promise.all([
      IOCAnalysisService.assessRisk(ioc),
      IOCAnalysisService.calculatePriority(ioc),
      IOCAnalysisService.findCorrelatedIOCs(ioc),
    ]);

    // Store analysis results in metadata
    await IOC.findByIdAndUpdate(ioc._id, {
      $set: {
        'metadata.analysis': {
          riskAssessment,
          priority,
          correlationCount: correlations.length,
          analyzedAt: new Date(),
          analyzedBy: req.user!.id,
        },
      },
    });

    logger.info(`IOC analysis completed for: ${ioc.value}`, {
      overallRisk: riskAssessment.overallRisk,
      priority: priority.priority,
      correlationCount: correlations.length,
    });

    res.json({
      success: true,
      data: {
        ioc: {
          id: ioc._id,
          value: ioc.value,
          type: ioc.type,
        },
        analysis: {
          riskAssessment,
          priority,
          correlations,
        },
      },
      message: 'IOC analysis completed',
    } as ApiResponse);
  }
);

/**
 * @swagger
 * /iocs/{id}/enrich:
 *   post:
 *     summary: Enrich IOC with additional metadata
 *     tags: [IOCs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: IOC enrichment completed
 *       404:
 *         description: IOC not found
 */
export const enrichIOC = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const ioc = await IOC.findById(req.params.id);

    if (!ioc) {
      throw createError('IOC not found', 404);
    }

    const enrichmentResult = await IOCEnrichmentService.enrichIOC(ioc);

    // Update IOC with enrichment data
    const updatedIOC = await IOC.findByIdAndUpdate(
      ioc._id,
      {
        $set: {
          'metadata.enrichment': enrichmentResult.metadata,
          'metadata.enrichmentSources': enrichmentResult.sources,
          'metadata.enrichedAt': enrichmentResult.enrichedAt,
          'metadata.enrichmentConfidence': enrichmentResult.confidence,
        },
      },
      { new: true }
    ).populate('createdBy', 'firstName lastName email');

    logger.info(`IOC enrichment completed for: ${ioc.value}`, {
      success: enrichmentResult.success,
      sourcesCount: enrichmentResult.sources.length,
      confidence: enrichmentResult.confidence,
    });

    res.json({
      success: true,
      data: {
        ioc: updatedIOC,
        enrichment: enrichmentResult,
      },
      message: 'IOC enrichment completed',
    } as ApiResponse);
  }
);

/**
 * @swagger
 * /iocs/batch/validate:
 *   post:
 *     summary: Batch validate multiple IOCs
 *     tags: [IOCs]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               iocs:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/IOC'
 *     responses:
 *       200:
 *         description: Batch validation completed
 */
export const batchValidateIOCs = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { iocs } = req.body;

    if (!Array.isArray(iocs) || iocs.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Invalid request: iocs array is required',
      } as ApiResponse);
      return;
    }

    if (iocs.length > 100) {
      res.status(400).json({
        success: false,
        error: 'Batch size cannot exceed 100 IOCs',
      } as ApiResponse);
      return;
    }

    const validationResults =
      await IOCValidationService.batchValidateIOCs(iocs);

    const summary = {
      total: validationResults.length,
      valid: validationResults.filter(r => r.isValid).length,
      invalid: validationResults.filter(r => !r.isValid).length,
      warnings: validationResults.filter(r => r.warnings.length > 0).length,
    };

    logger.info(`Batch validation completed for ${iocs.length} IOCs`, summary);

    res.json({
      success: true,
      data: {
        results: validationResults,
        summary,
      },
      message: 'Batch validation completed',
    } as ApiResponse);
  }
);

/**
 * @swagger
 * /iocs/statistics:
 *   get:
 *     summary: Get comprehensive IOC statistics
 *     tags: [IOCs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: useCache
 *         schema:
 *           type: boolean
 *           default: true
 *     responses:
 *       200:
 *         description: IOC statistics
 */
export const getIOCStatistics = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { startDate, endDate, useCache = 'true' } = req.query;

    let dateRange: { start: Date; end: Date } | undefined;

    if (startDate && endDate) {
      dateRange = {
        start: new Date(startDate as string),
        end: new Date(endDate as string),
      };

      if (isNaN(dateRange.start.getTime()) || isNaN(dateRange.end.getTime())) {
        res.status(400).json({
          success: false,
          error: 'Invalid date format. Use YYYY-MM-DD format.',
        } as ApiResponse);
        return;
      }
    }

    const statistics = await IOCStatisticsService.generateStatistics(
      dateRange,
      useCache === 'true'
    );

    res.json({
      success: true,
      data: statistics,
      message: 'IOC statistics generated',
    } as ApiResponse);
  }
);

/**
 * @swagger
 * /iocs/dashboard:
 *   get:
 *     summary: Get dashboard statistics for IOCs
 *     tags: [IOCs]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 */
export const getDashboardStats = asyncHandler(
  async (_req: AuthRequest, res: Response) => {
    const stats = await IOCStatisticsService.getDashboardStats();

    res.json({
      success: true,
      data: stats,
      message: 'Dashboard statistics retrieved',
    } as ApiResponse);
  }
);

/**
 * @swagger
 * /iocs/trends:
 *   get:
 *     summary: Get IOC trend analysis
 *     tags: [IOCs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *           default: daily
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *     responses:
 *       200:
 *         description: Trend analysis
 */
export const getTrendAnalysis = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { period = 'daily', days = '30' } = req.query;

    const periodValue = period as 'daily' | 'weekly' | 'monthly';
    const daysValue = parseInt(days as string, 10);

    if (isNaN(daysValue) || daysValue < 1 || daysValue > 365) {
      res.status(400).json({
        success: false,
        error: 'Days parameter must be between 1 and 365',
      } as ApiResponse);
      return;
    }

    const trendAnalysis = await IOCStatisticsService.generateTrendAnalysis(
      periodValue,
      daysValue
    );

    res.json({
      success: true,
      data: trendAnalysis,
      message: 'Trend analysis generated',
    } as ApiResponse);
  }
);

/**
 * @swagger
 * /iocs/quality-report:
 *   get:
 *     summary: Get IOC quality report
 *     tags: [IOCs]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Quality report
 */
export const getQualityReport = asyncHandler(
  async (_req: AuthRequest, res: Response) => {
    const qualityReport = await IOCStatisticsService.generateQualityReport();

    res.json({
      success: true,
      data: qualityReport,
      message: 'Quality report generated',
    } as ApiResponse);
  }
);

// ============================================================================
// EXTENDED IOC ENDPOINTS - 32 Additional Business-Ready Pages
// ============================================================================

/**
 * IOC Analytics & Reporting (4 endpoints)
 */

/**
 * @swagger
 * /iocs/analytics/trends:
 *   get:
 *     summary: Advanced IOC trend analysis with predictive insights
 *     tags: [IOC Analytics]
 *     security:
 *       - BearerAuth: []
 */
export const getIOCTrendAnalytics = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { timeframe = '30d', categories, predictive = false } = req.query;

    const analytics = await IOCStatisticsService.generateAdvancedTrends({
      timeframe: timeframe as string,
      categories: categories ? (categories as string).split(',') : undefined,
      includePredictive: predictive === 'true',
    });

    res.json({
      success: true,
      data: analytics,
      message: 'IOC trend analytics generated',
    } as ApiResponse);
  }
);

/**
 * @swagger
 * /iocs/analytics/risk-assessment:
 *   get:
 *     summary: Comprehensive IOC risk assessment dashboard
 *     tags: [IOC Analytics]
 */
export const getIOCRiskAssessment = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { severity, confidence_threshold } = req.query;

    const riskData = await IOCAnalysisService.generateRiskAssessmentReport({
      severityFilter: severity as string,
      confidenceThreshold: confidence_threshold
        ? parseInt(confidence_threshold as string)
        : 70,
    });

    res.json({
      success: true,
      data: riskData,
      message: 'IOC risk assessment completed',
    } as ApiResponse);
  }
);

/**
 * @swagger
 * /iocs/analytics/performance:
 *   get:
 *     summary: IOC detection performance metrics
 *     tags: [IOC Analytics]
 */
export const getIOCPerformanceMetrics = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { start_date, end_date, granularity = 'daily' } = req.query;

    const metrics = await IOCStatisticsService.generatePerformanceMetrics({
      startDate: start_date ? new Date(start_date as string) : undefined,
      endDate: end_date ? new Date(end_date as string) : undefined,
      granularity: granularity as 'hourly' | 'daily' | 'weekly',
    });

    res.json({
      success: true,
      data: metrics,
      message: 'Performance metrics generated',
    } as ApiResponse);
  }
);

/**
 * @swagger
 * /iocs/analytics/compliance:
 *   get:
 *     summary: IOC compliance and regulatory reporting
 *     tags: [IOC Analytics]
 */
export const getIOCComplianceReport = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { framework = 'all', export_format = 'json' } = req.query;

    const complianceData = await IOCStatisticsService.generateComplianceReport({
      framework: framework as string,
      exportFormat: export_format as 'json' | 'pdf' | 'csv',
    });

    res.json({
      success: true,
      data: complianceData,
      message: 'Compliance report generated',
    } as ApiResponse);
  }
);

/**
 * IOC Intelligence & Enrichment (4 endpoints)
 */

/**
 * @swagger
 * /iocs/intelligence/attribution:
 *   get:
 *     summary: Threat actor attribution analysis for IOCs
 *     tags: [IOC Intelligence]
 */
export const getIOCThreatAttribution = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { ioc_id, confidence_min = 50 } = req.query;

    const attribution = await IOCAnalysisService.generateThreatAttribution({
      iocId: ioc_id as string,
      minConfidence: parseInt(confidence_min as string),
    });

    res.json({
      success: true,
      data: attribution,
      message: 'Threat attribution analysis completed',
    } as ApiResponse);
  }
);

/**
 * @swagger
 * /iocs/intelligence/osint:
 *   get:
 *     summary: OSINT enrichment for IOCs from multiple sources
 *     tags: [IOC Intelligence]
 */
export const getIOCOSINTEnrichment = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { ioc_value, sources = 'all', real_time = false } = req.query;

    const osintData = await IOCEnrichmentService.performOSINTEnrichment({
      iocValue: ioc_value as string,
      sources: sources === 'all' ? [] : (sources as string).split(','),
      realTime: real_time === 'true',
    });

    res.json({
      success: true,
      data: osintData,
      message: 'OSINT enrichment completed',
    } as ApiResponse);
  }
);

/**
 * @swagger
 * /iocs/intelligence/context:
 *   get:
 *     summary: Contextual analysis for IOCs with campaign mapping
 *     tags: [IOC Intelligence]
 */
export const getIOCContextualAnalysis = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { ioc_id, include_campaigns = true, include_ttps = true } = req.query;

    const context = await IOCAnalysisService.generateContextualAnalysis({
      iocId: ioc_id as string,
      includeCampaigns: include_campaigns === 'true',
      includeTTPs: include_ttps === 'true',
    });

    res.json({
      success: true,
      data: context,
      message: 'Contextual analysis completed',
    } as ApiResponse);
  }
);

/**
 * @swagger
 * /iocs/intelligence/reputation:
 *   get:
 *     summary: Multi-source reputation scoring for IOCs
 *     tags: [IOC Intelligence]
 */
export const getIOCReputationScoring = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const {
      ioc_value,
      algorithm = 'weighted',
      include_history = false,
    } = req.query;

    const reputation = await IOCEnrichmentService.calculateReputationScore({
      iocValue: ioc_value as string,
      algorithm: algorithm as 'weighted' | 'bayesian' | 'consensus',
      includeHistory: include_history === 'true',
    });

    res.json({
      success: true,
      data: reputation,
      message: 'Reputation scoring completed',
    } as ApiResponse);
  }
);

/**
 * IOC Operations & Management (4 endpoints)
 */

/**
 * @swagger
 * /iocs/operations/batch:
 *   post:
 *     summary: Batch IOC operations (create, update, delete)
 *     tags: [IOC Operations]
 */
export const performIOCBatchOperations = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { operations, dry_run = false } = req.body;

    const results = await IOCValidationService.performBatchOperations({
      operations,
      dryRun: dry_run,
      userId: req.user?.id,
    });

    res.json({
      success: true,
      data: results,
      message: `Batch operations ${dry_run ? 'validated' : 'completed'}`,
    } as ApiResponse);
  }
);

/**
 * @swagger
 * /iocs/operations/lifecycle:
 *   get:
 *     summary: IOC lifecycle management and automation rules
 *     tags: [IOC Operations]
 */
export const getIOCLifecycleManagement = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { status, age_threshold, include_rules = true } = req.query;

    const lifecycle = await IOCAnalysisService.generateLifecycleReport({
      statusFilter: status as string,
      ageThreshold: age_threshold ? parseInt(age_threshold as string) : 90,
      includeAutomationRules: include_rules === 'true',
    });

    res.json({
      success: true,
      data: lifecycle,
      message: 'Lifecycle management data generated',
    } as ApiResponse);
  }
);

/**
 * @swagger
 * /iocs/operations/data-quality:
 *   get:
 *     summary: Advanced IOC data quality assessment
 *     tags: [IOC Operations]
 */
export const getIOCDataQuality = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { include_recommendations = true, severity_filter } = req.query;

    const quality = await IOCValidationService.generateQualityAssessment({
      includeRecommendations: include_recommendations === 'true',
      severityFilter: severity_filter as string,
    });

    res.json({
      success: true,
      data: quality,
      message: 'Data quality assessment completed',
    } as ApiResponse);
  }
);

/**
 * @swagger
 * /iocs/operations/archive:
 *   post:
 *     summary: IOC archival and retention management
 *     tags: [IOC Operations]
 */
export const manageIOCArchive = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { action, criteria, retention_policy } = req.body;

    const archiveResult = await IOCStatisticsService.manageArchival({
      action: action as 'archive' | 'restore' | 'purge',
      criteria,
      retentionPolicy: retention_policy,
      userId: req.user?.id,
    });

    res.json({
      success: true,
      data: archiveResult,
      message: `Archive ${action} completed`,
    } as ApiResponse);
  }
);

/**
 * IOC Integration & Feeds (4 endpoints)
 */

/**
 * @swagger
 * /iocs/feeds/sources:
 *   get:
 *     summary: External IOC feed source management
 *     tags: [IOC Feeds]
 */
export const getIOCFeedSources = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { status, type, include_stats = true } = req.query;

    const sources = await IOCEnrichmentService.getFeedSources({
      statusFilter: status as string,
      typeFilter: type as string,
      includeStatistics: include_stats === 'true',
    });

    res.json({
      success: true,
      data: sources,
      message: 'Feed sources retrieved',
    } as ApiResponse);
  }
);

/**
 * @swagger
 * /iocs/feeds/connectors:
 *   get:
 *     summary: API connector management for IOC feeds
 *     tags: [IOC Feeds]
 */
export const getIOCAPIConnectors = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { provider, health_check = false } = req.query;

    const connectors = await IOCEnrichmentService.getAPIConnectors({
      providerFilter: provider as string,
      performHealthCheck: health_check === 'true',
    });

    res.json({
      success: true,
      data: connectors,
      message: 'API connectors retrieved',
    } as ApiResponse);
  }
);

/**
 * @swagger
 * /iocs/feeds/management:
 *   get:
 *     summary: Comprehensive feed management dashboard
 *     tags: [IOC Feeds]
 */
export const getIOCFeedManagement = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { include_schedules = true, include_errors = true } = req.query;

    const management = await IOCStatisticsService.getFeedManagement({
      includeSchedules: include_schedules === 'true',
      includeErrors: include_errors === 'true',
    });

    res.json({
      success: true,
      data: management,
      message: 'Feed management data retrieved',
    } as ApiResponse);
  }
);

/**
 * @swagger
 * /iocs/feeds/synchronization:
 *   post:
 *     summary: IOC data synchronization across systems
 *     tags: [IOC Feeds]
 */
export const performIOCDataSync = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const {
      target_systems,
      sync_type = 'incremental',
      dry_run = false,
    } = req.body;

    const syncResult = await IOCEnrichmentService.performDataSync({
      targetSystems: target_systems,
      syncType: sync_type as 'full' | 'incremental' | 'delta',
      dryRun: dry_run,
      userId: req.user?.id,
    });

    res.json({
      success: true,
      data: syncResult,
      message: `Data synchronization ${dry_run ? 'validated' : 'completed'}`,
    } as ApiResponse);
  }
);

/**
 * Additional Advanced IOC Endpoints (16 more specialized endpoints)
 */

/**
 * @swagger
 * /iocs/visualization/geolocation:
 *   get:
 *     summary: Geolocation mapping for IP-based IOCs
 *     tags: [IOC Visualization]
 */
export const getIOCGeolocation = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { time_range, clustering = true, heat_map = false } = req.query;

    const geoData = await IOCAnalysisService.generateGeolocationData({
      timeRange: time_range as string,
      enableClustering: clustering === 'true',
      generateHeatMap: heat_map === 'true',
    });

    res.json({
      success: true,
      data: geoData,
      message: 'Geolocation data generated',
    } as ApiResponse);
  }
);

/**
 * @swagger
 * /iocs/visualization/relationships:
 *   get:
 *     summary: IOC relationship network visualization
 *     tags: [IOC Visualization]
 */
export const getIOCRelationshipNetwork = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { center_ioc, depth = 2, relationship_types } = req.query;

    const network = await IOCAnalysisService.generateRelationshipNetwork({
      centerIOC: center_ioc as string,
      depth: parseInt(depth as string),
      relationshipTypes: relationship_types
        ? (relationship_types as string).split(',')
        : undefined,
    });

    res.json({
      success: true,
      data: network,
      message: 'Relationship network generated',
    } as ApiResponse);
  }
);

/**
 * @swagger
 * /iocs/visualization/timeline:
 *   get:
 *     summary: IOC activity timeline visualization
 *     tags: [IOC Visualization]
 */
export const getIOCTimeline = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { ioc_id, granularity = 'daily', include_context = true } = req.query;

    const timeline = await IOCAnalysisService.generateActivityTimeline({
      iocId: ioc_id as string,
      granularity: granularity as 'hourly' | 'daily' | 'weekly',
      includeContext: include_context === 'true',
    });

    res.json({
      success: true,
      data: timeline,
      message: 'Activity timeline generated',
    } as ApiResponse);
  }
);

/**
 * @swagger
 * /iocs/visualization/dashboard:
 *   get:
 *     summary: Interactive IOC dashboard with real-time updates
 *     tags: [IOC Visualization]
 */
export const getIOCInteractiveDashboard = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { widgets, refresh_interval = 30 } = req.query;

    const dashboard = await IOCStatisticsService.generateInteractiveDashboard({
      selectedWidgets: widgets ? (widgets as string).split(',') : undefined,
      refreshInterval: parseInt(refresh_interval as string),
    });

    res.json({
      success: true,
      data: dashboard,
      message: 'Interactive dashboard generated',
    } as ApiResponse);
  }
);

/**
 * @swagger
 * /iocs/workflows/playbooks:
 *   get:
 *     summary: IOC-triggered security playbook management
 *     tags: [IOC Workflows]
 */
export const getIOCPlaybooks = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { ioc_type, severity, status } = req.query;

    const playbooks = await IOCAnalysisService.getSecurityPlaybooks({
      iocType: ioc_type as string,
      severityFilter: severity as string,
      statusFilter: status as string,
    });

    res.json({
      success: true,
      data: playbooks,
      message: 'Security playbooks retrieved',
    } as ApiResponse);
  }
);

/**
 * @swagger
 * /iocs/workflows/automation:
 *   get:
 *     summary: Automated IOC response and mitigation workflows
 *     tags: [IOC Workflows]
 */
export const getIOCAutomationWorkflows = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const {
      trigger_type,
      execution_status,
      include_metrics = true,
    } = req.query;

    const workflows = await IOCAnalysisService.getAutomationWorkflows({
      triggerType: trigger_type as string,
      executionStatus: execution_status as string,
      includeMetrics: include_metrics === 'true',
    });

    res.json({
      success: true,
      data: workflows,
      message: 'Automation workflows retrieved',
    } as ApiResponse);
  }
);

/**
 * @swagger
 * /iocs/workflows/cases:
 *   get:
 *     summary: IOC-related case management and tracking
 *     tags: [IOC Workflows]
 */
export const getIOCCaseManagement = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { status, assignee, priority, include_timeline = true } = req.query;

    const cases = await IOCAnalysisService.getCaseManagement({
      statusFilter: status as string,
      assigneeFilter: assignee as string,
      priorityFilter: priority as string,
      includeTimeline: include_timeline === 'true',
    });

    res.json({
      success: true,
      data: cases,
      message: 'Case management data retrieved',
    } as ApiResponse);
  }
);

/**
 * @swagger
 * /iocs/workflows/investigation:
 *   get:
 *     summary: Digital forensic investigation tools for IOCs
 *     tags: [IOC Workflows]
 */
export const getIOCInvestigationTools = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { ioc_id, investigation_type, include_artifacts = true } = req.query;

    const investigation = await IOCAnalysisService.getInvestigationTools({
      iocId: ioc_id as string,
      investigationType: investigation_type as string,
      includeArtifacts: include_artifacts === 'true',
    });

    res.json({
      success: true,
      data: investigation,
      message: 'Investigation tools data retrieved',
    } as ApiResponse);
  }
);

/**
 * @swagger
 * /iocs/collaboration/workspaces:
 *   get:
 *     summary: Team collaboration workspaces for IOC analysis
 *     tags: [IOC Collaboration]
 */
export const getIOCCollaborationWorkspaces = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { team_id, project_status, include_activity = true } = req.query;

    const workspaces = await IOCAnalysisService.getCollaborationWorkspaces({
      teamId: team_id as string,
      projectStatus: project_status as string,
      includeActivity: include_activity === 'true',
      userId: req.user?.id,
    });

    res.json({
      success: true,
      data: workspaces,
      message: 'Collaboration workspaces retrieved',
    } as ApiResponse);
  }
);

/**
 * @swagger
 * /iocs/collaboration/sharing:
 *   post:
 *     summary: External IOC sharing and community intelligence
 *     tags: [IOC Collaboration]
 */
export const manageIOCSharing = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const {
      ioc_ids,
      sharing_level,
      target_organizations,
      include_metadata = true,
    } = req.body;

    const sharingResult = await IOCEnrichmentService.manageExternalSharing({
      iocIds: ioc_ids,
      sharingLevel: sharing_level as 'public' | 'community' | 'trusted',
      targetOrganizations: target_organizations,
      includeMetadata: include_metadata,
      userId: req.user?.id,
    });

    res.json({
      success: true,
      data: sharingResult,
      message: 'IOC sharing configured',
    } as ApiResponse);
  }
);

/**
 * @swagger
 * /iocs/collaboration/community:
 *   get:
 *     summary: Community intelligence and crowd-sourced IOC validation
 *     tags: [IOC Collaboration]
 */
export const getIOCCommunityIntelligence = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const {
      source_filter,
      confidence_min = 50,
      include_votes = true,
    } = req.query;

    const community = await IOCEnrichmentService.getCommunityIntelligence({
      sourceFilter: source_filter as string,
      minConfidence: parseInt(confidence_min as string),
      includeVotes: include_votes === 'true',
    });

    res.json({
      success: true,
      data: community,
      message: 'Community intelligence retrieved',
    } as ApiResponse);
  }
);

/**
 * @swagger
 * /iocs/collaboration/reviews:
 *   get:
 *     summary: Peer review system for IOC validation
 *     tags: [IOC Collaboration]
 */
export const getIOCPeerReviews = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { review_status, reviewer_id, include_metrics = true } = req.query;

    const reviews = await IOCValidationService.getPeerReviews({
      reviewStatus: review_status as string,
      reviewerId: reviewer_id as string,
      includeMetrics: include_metrics === 'true',
      userId: req.user?.id,
    });

    res.json({
      success: true,
      data: reviews,
      message: 'Peer reviews retrieved',
    } as ApiResponse);
  }
);

/**
 * @swagger
 * /iocs/advanced/ml-detection:
 *   get:
 *     summary: Machine learning-powered IOC detection and classification
 *     tags: [IOC Advanced]
 */
export const getIOCMLDetection = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const {
      model_type = 'ensemble',
      confidence_threshold = 0.8,
      include_explanations = true,
    } = req.query;

    const mlResults = await IOCAnalysisService.performMLDetection({
      modelType: model_type as string,
      confidenceThreshold: parseFloat(confidence_threshold as string),
      includeExplanations: include_explanations === 'true',
    });

    res.json({
      success: true,
      data: mlResults,
      message: 'ML detection analysis completed',
    } as ApiResponse);
  }
);

/**
 * @swagger
 * /iocs/advanced/behavioral:
 *   get:
 *     summary: Behavioral analysis and anomaly detection for IOCs
 *     tags: [IOC Advanced]
 */
export const getIOCBehavioralAnalysis = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const {
      analysis_window = '7d',
      anomaly_sensitivity = 'medium',
      include_patterns = true,
    } = req.query;

    const behavioral = await IOCAnalysisService.performBehavioralAnalysis({
      analysisWindow: analysis_window as string,
      anomalySensitivity: anomaly_sensitivity as 'low' | 'medium' | 'high',
      includePatterns: include_patterns === 'true',
    });

    res.json({
      success: true,
      data: behavioral,
      message: 'Behavioral analysis completed',
    } as ApiResponse);
  }
);

/**
 * @swagger
 * /iocs/advanced/predictive:
 *   get:
 *     summary: Predictive intelligence and threat forecasting
 *     tags: [IOC Advanced]
 */
export const getIOCPredictiveIntelligence = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const {
      forecast_horizon = '30d',
      prediction_type = 'emergence',
      include_confidence = true,
    } = req.query;

    const predictive = await IOCAnalysisService.generatePredictiveIntelligence({
      forecastHorizon: forecast_horizon as string,
      predictionType: prediction_type as string,
      includeConfidence: include_confidence === 'true',
    });

    res.json({
      success: true,
      data: predictive,
      message: 'Predictive intelligence generated',
    } as ApiResponse);
  }
);

/**
 * @swagger
 * /iocs/advanced/custom-rules:
 *   get:
 *     summary: Custom rule engine for IOC detection and alerts
 *     tags: [IOC Advanced]
 */
export const getIOCCustomRules = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { rule_type, status, include_performance = true } = req.query;

    const rules = await IOCValidationService.getCustomRules({
      ruleType: rule_type as string,
      statusFilter: status as string,
      includePerformance: include_performance === 'true',
      userId: req.user?.id,
    });

    res.json({
      success: true,
      data: rules,
      message: 'Custom rules retrieved',
    } as ApiResponse);
  }
);
