import { Request, Response } from 'express';

/**
 * Workflow Templates Controller
 * Reusable workflow templates and process automation
 */

const mockData = [
  {
    id: '1',
    name: 'Production Workflow Templates',
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

export const getAllWorkflowTemplates = async (req: Request, res: Response) => {
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
    console.error('Error in getAllWorkflowTemplates:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getWorkflowTemplatesById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const item = mockData.find(item => item.id === id);
    
    if (!item) {
      return res.status(404).json({ error: 'Workflow Templates not found' });
    }
    
    res.json({ data: item });
  } catch (error) {
    console.error('Error in getWorkflowTemplatesById:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createWorkflowTemplates = async (req: Request, res: Response) => {
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
      message: 'Workflow Templates created successfully'
    });
  } catch (error) {
    console.error('Error in createWorkflowTemplates:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateWorkflowTemplates = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const itemIndex = mockData.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Workflow Templates not found' });
    }

    const updatedItem = {
      ...mockData[itemIndex],
      ...req.body,
      updated: new Date().toISOString()
    };
    
    mockData[itemIndex] = updatedItem;
    
    res.json({ 
      data: updatedItem,
      message: 'Workflow Templates updated successfully'
    });
  } catch (error) {
    console.error('Error in updateWorkflowTemplates:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteWorkflowTemplates = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const itemIndex = mockData.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Workflow Templates not found' });
    }

    mockData.splice(itemIndex, 1);
    
    res.json({ message: 'Workflow Templates deleted successfully' });
  } catch (error) {
    console.error('Error in deleteWorkflowTemplates:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getWorkflowTemplatesAnalytics = async (req: Request, res: Response) => {
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
    console.error('Error in getWorkflowTemplatesAnalytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
