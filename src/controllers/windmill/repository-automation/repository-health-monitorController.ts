import { Request, Response } from 'express';

/**
 * Repository Health Monitor Controller
 * Continuous repository health monitoring and optimization
 */

const mockData = [
  {
    id: '1',
    name: 'Production Repository Health Monitor',
    status: 'active',
    type: 'windmill-feature',
    category: 'repository-automation',
    created: new Date('2024-01-01').toISOString(),
    updated: new Date().toISOString(),
    metadata: {
      version: '1.0.0',
      tags: ['windmill', 'automation', 'repository-automation'],
      priority: 'high'
    }
  }
];

export const getAllRepositoryHealthMonitor = async (req: Request, res: Response) => {
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
    console.error('Error in getAllRepositoryHealthMonitor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getRepositoryHealthMonitorById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const item = mockData.find(item => item.id === id);
    
    if (!item) {
      return res.status(404).json({ error: 'Repository Health Monitor not found' });
    }
    
    res.json({ data: item });
  } catch (error) {
    console.error('Error in getRepositoryHealthMonitorById:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createRepositoryHealthMonitor = async (req: Request, res: Response) => {
  try {
    const newItem = {
      id: String(mockData.length + 1),
      type: 'windmill-feature',
      category: 'repository-automation',
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      ...req.body
    };
    
    mockData.push(newItem);
    
    res.status(201).json({ 
      data: newItem,
      message: 'Repository Health Monitor created successfully'
    });
  } catch (error) {
    console.error('Error in createRepositoryHealthMonitor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateRepositoryHealthMonitor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const itemIndex = mockData.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Repository Health Monitor not found' });
    }

    const updatedItem = {
      ...mockData[itemIndex],
      ...req.body,
      updated: new Date().toISOString()
    };
    
    mockData[itemIndex] = updatedItem;
    
    res.json({ 
      data: updatedItem,
      message: 'Repository Health Monitor updated successfully'
    });
  } catch (error) {
    console.error('Error in updateRepositoryHealthMonitor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteRepositoryHealthMonitor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const itemIndex = mockData.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Repository Health Monitor not found' });
    }

    mockData.splice(itemIndex, 1);
    
    res.json({ message: 'Repository Health Monitor deleted successfully' });
  } catch (error) {
    console.error('Error in deleteRepositoryHealthMonitor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getRepositoryHealthMonitorAnalytics = async (req: Request, res: Response) => {
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
    console.error('Error in getRepositoryHealthMonitorAnalytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
