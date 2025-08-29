import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { MitreTactic } from '../models/MitreTactic';
import { MitreTechnique } from '../models/MitreTechnique';
import { MitreGroup } from '../models/MitreGroup';
import { MitreSoftware } from '../models/MitreSoftware';
import { MitreMitigation } from '../models/MitreMitigation';
import { MitreDataSource } from '../models/MitreDataSource';
import { MitreService } from '../services/mitreService';
import { logger } from '../utils/logger';

/**
 * Sync MITRE ATT&CK data from official source
 */
export const syncMitreData = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  // Only admin users can sync data
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ message: 'Admin access required' });
    return;
  }

  try {
    const mitreService = new MitreService(req.user.id);
    const results = await mitreService.syncMitreData();
    
    logger.info(`MITRE ATT&CK data sync completed by user ${req.user.id}`, results);
    
    res.json({
      message: 'MITRE ATT&CK data sync completed successfully',
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('MITRE ATT&CK data sync failed:', error);
    res.status(500).json({ 
      message: 'Failed to sync MITRE ATT&CK data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get MITRE ATT&CK statistics
 */
export const getMitreStats = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  try {
    const mitreService = new MitreService(req.user.id);
    const stats = await mitreService.getStats();
    
    res.json(stats);
  } catch (error) {
    logger.error('Failed to get MITRE ATT&CK stats:', error);
    res.status(500).json({ 
      message: 'Failed to get MITRE ATT&CK statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get all MITRE tactics
 */
export const getTactics = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
  const skip = (page - 1) * limit;

  const tactics = await MitreTactic.find({})
    .sort({ mitreId: 1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await MitreTactic.countDocuments();

  res.json({
    tactics,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

/**
 * Get a specific MITRE tactic by ID
 */
export const getTactic = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { mitreId } = req.params;
  
  const tactic = await MitreTactic.findOne({ mitreId }).lean();
  
  if (!tactic) {
    res.status(404).json({ message: 'MITRE tactic not found' });
    return;
  }

  res.json(tactic);
});

/**
 * Get all MITRE techniques
 */
export const getTechniques = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
  const skip = (page - 1) * limit;
  
  // Build query filters
  const query: any = {};
  
  if (req.query.tactic) {
    query.tactics = req.query.tactic;
  }
  
  if (req.query.platform) {
    query.platforms = req.query.platform;
  }
  
  if (req.query.isSubTechnique !== undefined) {
    query.isSubTechnique = req.query.isSubTechnique === 'true';
  }

  if (req.query.search) {
    query.$or = [
      { name: new RegExp(req.query.search as string, 'i') },
      { description: new RegExp(req.query.search as string, 'i') },
      { mitreId: new RegExp(req.query.search as string, 'i') },
    ];
  }

  const techniques = await MitreTechnique.find(query)
    .sort({ mitreId: 1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await MitreTechnique.countDocuments(query);

  res.json({
    techniques,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

/**
 * Get a specific MITRE technique by ID
 */
export const getTechnique = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { mitreId } = req.params;
  
  const technique = await MitreTechnique.findOne({ mitreId })
    .populate('mitigations')
    .lean();
  
  if (!technique) {
    res.status(404).json({ message: 'MITRE technique not found' });
    return;
  }

  // Get sub-techniques if this is a parent technique
  let subTechniques: any[] = [];
  if (!technique.isSubTechnique) {
    subTechniques = await MitreTechnique.find({ 
      parentTechnique: mitreId,
      isSubTechnique: true 
    }).lean();
  }

  res.json({
    ...technique,
    subTechniques,
  });
});

/**
 * Get all MITRE groups
 */
export const getGroups = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
  const skip = (page - 1) * limit;

  // Build query filters
  const query: any = {};
  
  if (req.query.search) {
    query.$or = [
      { name: new RegExp(req.query.search as string, 'i') },
      { description: new RegExp(req.query.search as string, 'i') },
      { aliases: new RegExp(req.query.search as string, 'i') },
      { mitreId: new RegExp(req.query.search as string, 'i') },
    ];
  }

  const groups = await MitreGroup.find(query)
    .sort({ name: 1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await MitreGroup.countDocuments(query);

  res.json({
    groups,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

/**
 * Get a specific MITRE group by ID
 */
export const getGroup = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { mitreId } = req.params;
  
  const group = await MitreGroup.findOne({ mitreId }).lean();
  
  if (!group) {
    res.status(404).json({ message: 'MITRE group not found' });
    return;
  }

  res.json(group);
});

/**
 * Get all MITRE software
 */
export const getSoftware = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
  const skip = (page - 1) * limit;

  // Build query filters
  const query: any = {};
  
  if (req.query.platform) {
    query.platforms = req.query.platform;
  }
  
  if (req.query.label) {
    query.labels = req.query.label;
  }

  if (req.query.search) {
    query.$or = [
      { name: new RegExp(req.query.search as string, 'i') },
      { description: new RegExp(req.query.search as string, 'i') },
      { aliases: new RegExp(req.query.search as string, 'i') },
      { mitreId: new RegExp(req.query.search as string, 'i') },
    ];
  }

  const software = await MitreSoftware.find(query)
    .sort({ name: 1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await MitreSoftware.countDocuments(query);

  res.json({
    software,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

/**
 * Get a specific MITRE software by ID
 */
export const getSoftwareById = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { mitreId } = req.params;
  
  const software = await MitreSoftware.findOne({ mitreId }).lean();
  
  if (!software) {
    res.status(404).json({ message: 'MITRE software not found' });
    return;
  }

  res.json(software);
});

/**
 * Get all MITRE mitigations
 */
export const getMitigations = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
  const skip = (page - 1) * limit;

  // Build query filters
  const query: any = {};

  if (req.query.search) {
    query.$or = [
      { name: new RegExp(req.query.search as string, 'i') },
      { description: new RegExp(req.query.search as string, 'i') },
      { mitreId: new RegExp(req.query.search as string, 'i') },
    ];
  }

  const mitigations = await MitreMitigation.find(query)
    .sort({ name: 1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await MitreMitigation.countDocuments(query);

  res.json({
    mitigations,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

/**
 * Get a specific MITRE mitigation by ID
 */
export const getMitigation = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { mitreId } = req.params;
  
  const mitigation = await MitreMitigation.findOne({ mitreId }).lean();
  
  if (!mitigation) {
    res.status(404).json({ message: 'MITRE mitigation not found' });
    return;
  }

  res.json(mitigation);
});

/**
 * Get all MITRE data sources
 */
export const getDataSources = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
  const skip = (page - 1) * limit;

  // Build query filters
  const query: any = {};
  
  if (req.query.platform) {
    query.platforms = req.query.platform;
  }

  if (req.query.search) {
    query.$or = [
      { name: new RegExp(req.query.search as string, 'i') },
      { description: new RegExp(req.query.search as string, 'i') },
      { mitreId: new RegExp(req.query.search as string, 'i') },
    ];
  }

  const dataSources = await MitreDataSource.find(query)
    .sort({ name: 1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await MitreDataSource.countDocuments(query);

  res.json({
    dataSources,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

/**
 * Get a specific MITRE data source by ID
 */
export const getDataSource = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { mitreId } = req.params;
  
  const dataSource = await MitreDataSource.findOne({ mitreId }).lean();
  
  if (!dataSource) {
    res.status(404).json({ message: 'MITRE data source not found' });
    return;
  }

  res.json(dataSource);
});