import { Request, Response } from 'express';

/**
 * Security Scanning Hub Controller
 * Comprehensive security vulnerability scanning and analysis
 */

const mockData = [
  {
    id: '1',
    name: 'Production Security Scanning Hub',
    status: 'active',
    type: 'windmill-feature',
    category: 'code-quality-security',
    created: new Date('2024-01-01').toISOString(),
    updated: new Date().toISOString(),
    metadata: {
      version: '1.0.0',
      tags: ['windmill', 'automation', 'code-quality-security'],
      priority: 'high'
    }
  }
];

export const getAllSecurityScanningHub = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    let filteredData = mockData;
    if (status) {
      filteredData = mockData.filter(item => item.status === status);
    }

    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedData = filteredData.slice(startIndex, endIndex);

    res.json({
      data: paginatedData,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: filteredData.length,
        pages: Math.ceil(filteredData.length / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error in getAllSecurityScanningHub:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSecurityScanningHubById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const item = mockData.find(item => item.id === id);
    
    if (!item) {
      return res.status(404).json({ error: 'Security Scanning Hub not found' });
    }
    
    res.json({ data: item });
  } catch (error) {
    console.error('Error in getSecurityScanningHubById:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createSecurityScanningHub = async (req: Request, res: Response) => {
  try {
    const newItem = {
      id: String(mockData.length + 1),
      type: 'windmill-feature',
      category: 'code-quality-security',
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      ...req.body
    };
    
    mockData.push(newItem);
    
    res.status(201).json({ 
      data: newItem,
      message: 'Security Scanning Hub created successfully'
    });
  } catch (error) {
    console.error('Error in createSecurityScanningHub:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateSecurityScanningHub = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const itemIndex = mockData.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Security Scanning Hub not found' });
    }

    const updatedItem = {
      ...mockData[itemIndex],
      ...req.body,
      updated: new Date().toISOString()
    };
    
    mockData[itemIndex] = updatedItem;
    
    res.json({ 
      data: updatedItem,
      message: 'Security Scanning Hub updated successfully'
    });
  } catch (error) {
    console.error('Error in updateSecurityScanningHub:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteSecurityScanningHub = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const itemIndex = mockData.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Security Scanning Hub not found' });
    }

    mockData.splice(itemIndex, 1);
    
    res.json({ message: 'Security Scanning Hub deleted successfully' });
  } catch (error) {
    console.error('Error in deleteSecurityScanningHub:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSecurityScanningHubAnalytics = async (req: Request, res: Response) => {
  try {
    const analytics = {
      total: mockData.length,
      byStatus: mockData.reduce((acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      }, {}),
      recentActivity: mockData.slice(-5)
    };
    
    res.json({ data: analytics });
  } catch (error) {
    console.error('Error in getSecurityScanningHubAnalytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
