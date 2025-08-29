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

    const ioc: IIOC = new IOC({
      ...iocData,
      createdBy: req.user!.id,
    });

    await ioc.save();
    await ioc.populate('createdBy', 'firstName lastName email');

    logger.info(`IOC created: ${ioc.value} by ${req.user!.email}`);

    res.status(201).json({
      success: true,
      data: ioc,
      message: 'IOC created successfully',
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
