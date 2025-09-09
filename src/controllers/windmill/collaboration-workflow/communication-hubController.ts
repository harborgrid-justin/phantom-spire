import { Request, Response } from 'express';

/**
 * Communication Hub Controller
 * Integrated team communication and collaboration platform
 */

const mockData = [
  {
    id: '1',
    name: 'Production Communication Hub',
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

export const getAllCommunicationHub = async (req: Request, res: Response) => {
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
    console.error('Error in getAllCommunicationHub:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCommunicationHubById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const item = mockData.find(item => item.id === id);
    
    if (!item) {
      return res.status(404).json({ error: 'Communication Hub not found' });
    }
    
    res.json({ data: item });
  } catch (error) {
    console.error('Error in getCommunicationHubById:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createCommunicationHub = async (req: Request, res: Response) => {
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
      message: 'Communication Hub created successfully'
    });
  } catch (error) {
    console.error('Error in createCommunicationHub:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateCommunicationHub = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const itemIndex = mockData.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Communication Hub not found' });
    }

    const updatedItem = {
      ...mockData[itemIndex],
      ...req.body,
      updated: new Date().toISOString()
    };
    
    mockData[itemIndex] = updatedItem;
    
    res.json({ 
      data: updatedItem,
      message: 'Communication Hub updated successfully'
    });
  } catch (error) {
    console.error('Error in updateCommunicationHub:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteCommunicationHub = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const itemIndex = mockData.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Communication Hub not found' });
    }

    mockData.splice(itemIndex, 1);
    
    res.json({ message: 'Communication Hub deleted successfully' });
  } catch (error) {
    console.error('Error in deleteCommunicationHub:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCommunicationHubAnalytics = async (req: Request, res: Response) => {
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
    console.error('Error in getCommunicationHubAnalytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
