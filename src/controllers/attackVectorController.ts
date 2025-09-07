/**
 * Attack Vector Controllers
 * Controllers for attack vector analysis endpoints
 */

import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';

// Attack Vector Interfaces
interface AttackVector {
  id: string;
  name: string;
  category: 'initial_access' | 'execution' | 'persistence' | 'privilege_escalation' | 'defense_evasion' | 'credential_access' | 'discovery' | 'lateral_movement' | 'collection' | 'command_control' | 'exfiltration' | 'impact';
  subcategory: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  techniques: string[];
  platforms: string[];
  tactics: string[];
  mitre_mappings: string[];
  indicators: string[];
  mitigations: string[];
  references: string[];
  created_at: Date;
  updated_at: Date;
}

interface AttackCampaign {
  id: string;
  name: string;
  actor_group: string;
  start_date: Date;
  end_date?: Date;
  vectors_used: string[];
  targets: string[];
  success_rate: number;
  attribution_confidence: 'low' | 'medium' | 'high' | 'very_high';
}

// Simulated data store (in production, use proper database)
let attackVectors: AttackVector[] = [];
let attackCampaigns: AttackCampaign[] = [];

// Initialize with sample data
const initializeAttackVectorData = () => {
  attackVectors = [
    {
      id: 'av-1',
      name: 'Phishing Email Attack Vector',
      category: 'initial_access',
      subcategory: 'phishing',
      severity: 'high',
      description: 'Email-based phishing attack targeting user credentials',
      techniques: ['T1566.001', 'T1566.002'],
      platforms: ['Windows', 'macOS', 'Linux'],
      tactics: ['Initial Access'],
      mitre_mappings: ['T1566'],
      indicators: ['suspicious-email@evil.com', 'malicious-link.com'],
      mitigations: ['User training', 'Email security gateway'],
      references: ['https://attack.mitre.org/techniques/T1566/'],
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 'av-2',
      name: 'PowerShell Command Execution',
      category: 'execution',
      subcategory: 'powershell',
      severity: 'critical',
      description: 'Malicious PowerShell command execution with AMSI bypass',
      techniques: ['T1059.001'],
      platforms: ['Windows'],
      tactics: ['Execution'],
      mitre_mappings: ['T1059.001'],
      indicators: ['powershell.exe', 'encoded commands'],
      mitigations: ['PowerShell logging', 'Constrained language mode'],
      references: ['https://attack.mitre.org/techniques/T1059/001/'],
      created_at: new Date(),
      updated_at: new Date()
    }
  ];

  attackCampaigns = [
    {
      id: 'camp-1',
      name: 'Operation Phishing Storm',
      actor_group: 'APT-29',
      start_date: new Date('2024-01-01'),
      end_date: new Date('2024-06-30'),
      vectors_used: ['av-1'],
      targets: ['Finance', 'Government'],
      success_rate: 35,
      attribution_confidence: 'high'
    }
  ];
};

// Initialize data
initializeAttackVectorData();

/**
 * Get all attack vectors
 */
export const getAttackVectors = async (req: Request, res: Response) => {
  try {
    const { 
      category,
      severity,
      platform,
      page = 1,
      limit = 10,
      search
    } = req.query;

    let filteredVectors = [...attackVectors];

    // Apply filters
    if (category) {
      filteredVectors = filteredVectors.filter(v => v.category === category);
    }
    
    if (severity) {
      filteredVectors = filteredVectors.filter(v => v.severity === severity);
    }
    
    if (platform) {
      filteredVectors = filteredVectors.filter(v => 
        v.platforms.some(p => p.toLowerCase().includes((platform as string).toLowerCase()))
      );
    }
    
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      filteredVectors = filteredVectors.filter(v => 
        v.name.toLowerCase().includes(searchTerm) ||
        v.description.toLowerCase().includes(searchTerm)
      );
    }

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    
    const paginatedVectors = filteredVectors.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedVectors,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: filteredVectors.length,
        pages: Math.ceil(filteredVectors.length / limitNum)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving attack vectors',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get attack vector by ID
 */
export const getAttackVectorById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const vector = attackVectors.find(v => v.id === id);
    
    if (!vector) {
      return res.status(404).json({
        success: false,
        message: 'Attack vector not found'
      });
    }

    res.json({
      success: true,
      data: vector
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving attack vector',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Create new attack vector
 */
export const createAttackVector = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const vectorData = req.body;
    const newVector: AttackVector = {
      id: `av-${Date.now()}`,
      ...vectorData,
      created_at: new Date(),
      updated_at: new Date()
    };

    attackVectors.push(newVector);

    res.status(201).json({
      success: true,
      data: newVector,
      message: 'Attack vector created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating attack vector',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Update attack vector
 */
export const updateAttackVector = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const vectorIndex = attackVectors.findIndex(v => v.id === id);
    
    if (vectorIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Attack vector not found'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const updatedVector = {
      ...attackVectors[vectorIndex],
      ...req.body,
      updated_at: new Date()
    };

    attackVectors[vectorIndex] = updatedVector;

    res.json({
      success: true,
      data: updatedVector,
      message: 'Attack vector updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating attack vector',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Delete attack vector
 */
export const deleteAttackVector = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const vectorIndex = attackVectors.findIndex(v => v.id === id);
    
    if (vectorIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Attack vector not found'
      });
    }

    attackVectors.splice(vectorIndex, 1);

    res.json({
      success: true,
      message: 'Attack vector deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting attack vector',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get attack campaigns
 */
export const getAttackCampaigns = async (req: Request, res: Response) => {
  try {
    const { 
      actor,
      active_only,
      page = 1,
      limit = 10
    } = req.query;

    let filteredCampaigns = [...attackCampaigns];

    // Apply filters
    if (actor) {
      filteredCampaigns = filteredCampaigns.filter(c => 
        c.actor_group.toLowerCase().includes((actor as string).toLowerCase())
      );
    }
    
    if (active_only === 'true') {
      filteredCampaigns = filteredCampaigns.filter(c => !c.end_date);
    }

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    
    const paginatedCampaigns = filteredCampaigns.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedCampaigns,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: filteredCampaigns.length,
        pages: Math.ceil(filteredCampaigns.length / limitNum)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving attack campaigns',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get attack vector statistics
 */
export const getAttackVectorStats = async (req: Request, res: Response) => {
  try {
    const stats = {
      total_vectors: attackVectors.length,
      by_category: attackVectors.reduce((acc, vector) => {
        acc[vector.category] = (acc[vector.category] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number }),
      by_severity: attackVectors.reduce((acc, vector) => {
        acc[vector.severity] = (acc[vector.severity] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number }),
      active_campaigns: attackCampaigns.filter(c => !c.end_date).length,
      total_campaigns: attackCampaigns.length,
      most_targeted_platforms: attackVectors
        .flatMap(v => v.platforms)
        .reduce((acc, platform) => {
          acc[platform] = (acc[platform] || 0) + 1;
          return acc;
        }, {} as { [key: string]: number })
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving attack vector statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Search attack vectors
 */
export const searchAttackVectors = async (req: Request, res: Response) => {
  try {
    const { q, category, severity } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const searchTerm = (q as string).toLowerCase();
    let results = attackVectors.filter(vector => 
      vector.name.toLowerCase().includes(searchTerm) ||
      vector.description.toLowerCase().includes(searchTerm) ||
      vector.techniques.some(t => t.toLowerCase().includes(searchTerm)) ||
      vector.indicators.some(i => i.toLowerCase().includes(searchTerm))
    );

    // Apply additional filters
    if (category) {
      results = results.filter(v => v.category === category);
    }
    
    if (severity) {
      results = results.filter(v => v.severity === severity);
    }

    res.json({
      success: true,
      data: results,
      total: results.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching attack vectors',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Validation rules
export const attackVectorValidation = [
  body('name').isLength({ min: 1 }).withMessage('Name is required'),
  body('category').isIn(['initial_access', 'execution', 'persistence', 'privilege_escalation', 'defense_evasion', 'credential_access', 'discovery', 'lateral_movement', 'collection', 'command_control', 'exfiltration', 'impact']).withMessage('Invalid category'),
  body('severity').isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid severity'),
  body('description').isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('techniques').isArray().withMessage('Techniques must be an array'),
  body('platforms').isArray().withMessage('Platforms must be an array'),
];

export default {
  getAttackVectors,
  getAttackVectorById,
  createAttackVector,
  updateAttackVector,
  deleteAttackVector,
  getAttackCampaigns,
  getAttackVectorStats,
  searchAttackVectors,
  attackVectorValidation
};