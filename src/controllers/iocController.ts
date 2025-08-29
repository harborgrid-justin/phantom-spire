import { Response } from 'express';
import { IOC, IIOC } from '../models/IOC';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler, createError } from '../middleware/errorHandler';
import {
  CreateIOCRequest,
  UpdateIOCRequest,
  IOCQuery,
  ApiResponse,
} from '../types/api';
import { logger } from '../utils/logger';
import { IOCValidationService } from '../services/iocValidationService';
import { IOCAnalysisService } from '../services/iocAnalysisService';
import { IOCEnrichmentService } from '../services/iocEnrichmentService';
import { IOCStatisticsService } from '../services/iocStatisticsService';

/**
 * @swagger
 * /iocs:
 *   get:
 *     summary: Get all IOCs with pagination and filtering
 *     tags: [IOCs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [ip, domain, url, hash, email]
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [low, medium, high, critical]
 *     responses:
 *       200:
 *         description: List of IOCs
 */
export const getIOCs = asyncHandler(async (req: AuthRequest, res: Response) => {
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
});

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
      logger.warn(`IOC type mismatch detected: ${iocData.type} vs ${detectedType} for ${iocValue}`);
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
          }).catch(err => logger.error('Failed to update IOC with enrichment data', err));
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

    const validationResults = await IOCValidationService.batchValidateIOCs(iocs);

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
