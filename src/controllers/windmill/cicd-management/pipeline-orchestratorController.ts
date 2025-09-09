import { Request, Response } from 'express';

/**
 * Pipeline Orchestrator Controller
 * Advanced CI/CD pipeline management and orchestration
 */

const mockData = [
  {
    id: '1',
    name: 'Production Pipeline Orchestrator',
    status: 'active',
    type: 'windmill-feature',
    category: 'cicd-management',
    created: new Date('2024-01-01').toISOString(),
    updated: new Date().toISOString(),
    metadata: {
      version: '1.0.0',
      tags: ['windmill', 'automation', 'cicd-management'],
      priority: 'high'
    }
  }
];

export const getAllPipelineOrchestrator = async (req: Request, res: Response) => {
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
    console.error('Error in getAllPipelineOrchestrator:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPipelineOrchestratorById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const item = mockData.find(item => item.id === id);
    
    if (!item) {
      return res.status(404).json({ error: 'Pipeline Orchestrator not found' });
    }
    
    res.json({ data: item });
  } catch (error) {
    console.error('Error in getPipelineOrchestratorById:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createPipelineOrchestrator = async (req: Request, res: Response) => {
  try {
    const newItem = {
      id: String(mockData.length + 1),
      type: 'windmill-feature',
      category: 'cicd-management',
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      ...req.body
    };
    
    mockData.push(newItem);
    
    res.status(201).json({ 
      data: newItem,
      message: 'Pipeline Orchestrator created successfully'
    });
  } catch (error) {
    console.error('Error in createPipelineOrchestrator:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updatePipelineOrchestrator = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const itemIndex = mockData.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Pipeline Orchestrator not found' });
    }

    const updatedItem = {
      ...mockData[itemIndex],
      ...req.body,
      updated: new Date().toISOString()
    };
    
    mockData[itemIndex] = updatedItem;
    
    res.json({ 
      data: updatedItem,
      message: 'Pipeline Orchestrator updated successfully'
    });
  } catch (error) {
    console.error('Error in updatePipelineOrchestrator:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deletePipelineOrchestrator = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const itemIndex = mockData.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Pipeline Orchestrator not found' });
    }

    mockData.splice(itemIndex, 1);
    
    res.json({ message: 'Pipeline Orchestrator deleted successfully' });
  } catch (error) {
    console.error('Error in deletePipelineOrchestrator:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPipelineOrchestratorAnalytics = async (req: Request, res: Response) => {
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
    console.error('Error in getPipelineOrchestratorAnalytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
