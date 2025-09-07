/**
 * Task Template Controller
 * Handles task template CRUD operations
 */

import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.js';
import { asyncHandler } from '../../middleware/errorHandler.js';

export class TaskTemplateController {
  /**
   * Get all task templates
   */
  getTemplates = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { category, active } = req.query;
    
    // Mock data for demonstration
    const mockTemplates = [
      {
        id: '1',
        name: 'Malware Analysis Template',
        description: 'Standard template for analyzing malware samples',
        category: 'Analysis',
        steps: ['Initial triage', 'Static analysis', 'Dynamic analysis', 'Report generation'],
        estimatedDuration: 180,
        priority: 'high',
        requiredSkills: ['Malware Analysis', 'Reverse Engineering'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true
      },
      {
        id: '2',
        name: 'Incident Response Template',
        description: 'Template for handling security incidents',
        category: 'Incident Response',
        steps: ['Containment', 'Eradication', 'Recovery', 'Lessons learned'],
        estimatedDuration: 240,
        priority: 'critical',
        requiredSkills: ['Incident Response', 'Forensics'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true
      }
    ];

    let filteredTemplates = mockTemplates;

    if (category) {
      filteredTemplates = filteredTemplates.filter(t => t.category === category);
    }

    if (active !== undefined) {
      const isActive = active === 'true';
      filteredTemplates = filteredTemplates.filter(t => t.isActive === isActive);
    }

    res.json({
      success: true,
      data: filteredTemplates,
      total: filteredTemplates.length
    });
  });

  /**
   * Create a new task template
   */
  createTemplate = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const templateData = req.body;
    
    // Mock creation
    const newTemplate = {
      id: Date.now().toString(),
      ...templateData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    };

    res.status(201).json({
      success: true,
      data: newTemplate,
      message: 'Template created successfully'
    });
  });

  /**
   * Get a specific task template
   */
  getTemplate = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    
    // Mock data
    const mockTemplate = {
      id,
      name: 'Malware Analysis Template',
      description: 'Standard template for analyzing malware samples',
      category: 'Analysis',
      steps: ['Initial triage', 'Static analysis', 'Dynamic analysis', 'Report generation'],
      estimatedDuration: 180,
      priority: 'high',
      requiredSkills: ['Malware Analysis', 'Reverse Engineering'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    };

    res.json({
      success: true,
      data: mockTemplate
    });
  });

  /**
   * Update a task template
   */
  updateTemplate = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const updateData = req.body;
    
    // Mock update
    const updatedTemplate = {
      id,
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      data: updatedTemplate,
      message: 'Template updated successfully'
    });
  });

  /**
   * Delete a task template
   */
  deleteTemplate = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    
    // Mock deletion
    res.status(204).json({
      success: true,
      message: 'Template deleted successfully'
    });
  });
}