import { Request, Response } from 'express';

/**
 * Code Quality Analyzer Controller
 * Advanced code quality metrics and analysis engine
 */

const mockData = [
  {
    id: '1',
    name: 'Production Code Quality Analyzer',
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

export const getAllCodeQualityAnalyzer = async (req: Request, res: Response) => {
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
    console.error('Error in getAllCodeQualityAnalyzer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCodeQualityAnalyzerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const item = mockData.find(item => item.id === id);
    
    if (!item) {
      return res.status(404).json({ error: 'Code Quality Analyzer not found' });
    }
    
    res.json({ data: item });
  } catch (error) {
    console.error('Error in getCodeQualityAnalyzerById:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createCodeQualityAnalyzer = async (req: Request, res: Response) => {
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
      message: 'Code Quality Analyzer created successfully'
    });
  } catch (error) {
    console.error('Error in createCodeQualityAnalyzer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateCodeQualityAnalyzer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const itemIndex = mockData.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Code Quality Analyzer not found' });
    }

    const updatedItem = {
      ...mockData[itemIndex],
      ...req.body,
      updated: new Date().toISOString()
    };
    
    mockData[itemIndex] = updatedItem;
    
    res.json({ 
      data: updatedItem,
      message: 'Code Quality Analyzer updated successfully'
    });
  } catch (error) {
    console.error('Error in updateCodeQualityAnalyzer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteCodeQualityAnalyzer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const itemIndex = mockData.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Code Quality Analyzer not found' });
    }

    mockData.splice(itemIndex, 1);
    
    res.json({ message: 'Code Quality Analyzer deleted successfully' });
  } catch (error) {
    console.error('Error in deleteCodeQualityAnalyzer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCodeQualityAnalyzerAnalytics = async (req: Request, res: Response) => {
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
    console.error('Error in getCodeQualityAnalyzerAnalytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
