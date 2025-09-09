import { Request, Response } from 'express';

/**
 * Knowledge Base Manager Controller
 * Centralized knowledge management and documentation system
 */

const mockData = [
  {
    id: '1',
    name: 'Production Knowledge Base Manager',
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

export const getAllKnowledgeBaseManager = async (req: Request, res: Response) => {
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
    console.error('Error in getAllKnowledgeBaseManager:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getKnowledgeBaseManagerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const item = mockData.find(item => item.id === id);
    
    if (!item) {
      return res.status(404).json({ error: 'Knowledge Base Manager not found' });
    }
    
    res.json({ data: item });
  } catch (error) {
    console.error('Error in getKnowledgeBaseManagerById:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createKnowledgeBaseManager = async (req: Request, res: Response) => {
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
      message: 'Knowledge Base Manager created successfully'
    });
  } catch (error) {
    console.error('Error in createKnowledgeBaseManager:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateKnowledgeBaseManager = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const itemIndex = mockData.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Knowledge Base Manager not found' });
    }

    const updatedItem = {
      ...mockData[itemIndex],
      ...req.body,
      updated: new Date().toISOString()
    };
    
    mockData[itemIndex] = updatedItem;
    
    res.json({ 
      data: updatedItem,
      message: 'Knowledge Base Manager updated successfully'
    });
  } catch (error) {
    console.error('Error in updateKnowledgeBaseManager:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteKnowledgeBaseManager = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const itemIndex = mockData.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Knowledge Base Manager not found' });
    }

    mockData.splice(itemIndex, 1);
    
    res.json({ message: 'Knowledge Base Manager deleted successfully' });
  } catch (error) {
    console.error('Error in deleteKnowledgeBaseManager:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getKnowledgeBaseManagerAnalytics = async (req: Request, res: Response) => {
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
    console.error('Error in getKnowledgeBaseManagerAnalytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
