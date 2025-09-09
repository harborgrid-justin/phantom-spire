import { Request, Response } from 'express';

/**
 * Team Productivity Analytics Controller
 * Team performance metrics and productivity analytics
 */

const mockData = [
  {
    id: '1',
    name: 'Production Team Productivity Analytics',
    status: 'active',
    type: 'windmill-feature',
    category: 'collaboration-workflow',
    created: new Date('2024-01-01').toISOString(),
    updated: new Date().toISOString(),
    metadata: {
      version: '1.0.0',
      tags: ['windmill', 'automation', 'collaboration-workflow'],
      priority: 'high'
    }
  }
];

export const getAllTeamProductivityAnalytics = async (req: Request, res: Response) => {
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
    console.error('Error in getAllTeamProductivityAnalytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTeamProductivityAnalyticsById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const item = mockData.find(item => item.id === id);
    
    if (!item) {
      return res.status(404).json({ error: 'Team Productivity Analytics not found' });
    }
    
    res.json({ data: item });
  } catch (error) {
    console.error('Error in getTeamProductivityAnalyticsById:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createTeamProductivityAnalytics = async (req: Request, res: Response) => {
  try {
    const newItem = {
      id: String(mockData.length + 1),
      type: 'windmill-feature',
      category: 'collaboration-workflow',
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      ...req.body
    };
    
    mockData.push(newItem);
    
    res.status(201).json({ 
      data: newItem,
      message: 'Team Productivity Analytics created successfully'
    });
  } catch (error) {
    console.error('Error in createTeamProductivityAnalytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTeamProductivityAnalytics = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const itemIndex = mockData.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Team Productivity Analytics not found' });
    }

    const updatedItem = {
      ...mockData[itemIndex],
      ...req.body,
      updated: new Date().toISOString()
    };
    
    mockData[itemIndex] = updatedItem;
    
    res.json({ 
      data: updatedItem,
      message: 'Team Productivity Analytics updated successfully'
    });
  } catch (error) {
    console.error('Error in updateTeamProductivityAnalytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteTeamProductivityAnalytics = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const itemIndex = mockData.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Team Productivity Analytics not found' });
    }

    mockData.splice(itemIndex, 1);
    
    res.json({ message: 'Team Productivity Analytics deleted successfully' });
  } catch (error) {
    console.error('Error in deleteTeamProductivityAnalytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTeamProductivityAnalyticsAnalytics = async (req: Request, res: Response) => {
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
    console.error('Error in getTeamProductivityAnalyticsAnalytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
