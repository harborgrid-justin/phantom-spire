/**
 * Investigation Controller
 * Handles investigation case operations
 */

import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.js';
import { asyncHandler } from '../../middleware/errorHandler.js';

export class InvestigationController {
  /**
   * Get all investigation cases
   */
  getCases = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { status, priority, assignedTo } = req.query;
    
    // Mock data for demonstration
    const mockCases = [
      {
        id: '1',
        caseNumber: 'INV-2024-001',
        title: 'APT29 Infrastructure Analysis',
        description: 'Investigation into suspected APT29 command and control infrastructure discovered in network logs',
        status: 'under-investigation',
        priority: 'critical',
        assignedInvestigator: 'Sarah Chen',
        leadInvestigator: 'Mike Johnson',
        category: 'Advanced Persistent Threat',
        tags: ['APT29', 'C2', 'Network Analysis'],
        createdAt: new Date(Date.now() - 432000000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString(),
        dueDate: new Date(Date.now() + 604800000).toISOString(),
        evidenceCount: 23,
        tasksCount: 8,
        notesCount: 15
      },
      {
        id: '2',
        caseNumber: 'INV-2024-002',
        title: 'Phishing Campaign Investigation',
        description: 'Analysis of widespread phishing campaign targeting financial sector employees',
        status: 'open',
        priority: 'high',
        assignedInvestigator: 'Alex Rodriguez',
        leadInvestigator: 'Sarah Chen',
        category: 'Phishing',
        tags: ['Phishing', 'Financial', 'Email Security'],
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 7200000).toISOString(),
        dueDate: new Date(Date.now() + 1209600000).toISOString(),
        evidenceCount: 45,
        tasksCount: 12,
        notesCount: 28
      }
    ];

    let filteredCases = mockCases;

    if (status) {
      filteredCases = filteredCases.filter(c => c.status === status);
    }

    if (priority) {
      filteredCases = filteredCases.filter(c => c.priority === priority);
    }

    if (assignedTo) {
      filteredCases = filteredCases.filter(c => 
        c.assignedInvestigator.toLowerCase().includes(assignedTo.toString().toLowerCase()) ||
        c.leadInvestigator.toLowerCase().includes(assignedTo.toString().toLowerCase())
      );
    }

    res.json({
      success: true,
      data: filteredCases,
      total: filteredCases.length
    });
  });

  /**
   * Create a new investigation case
   */
  createCase = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const caseData = req.body;
    
    // Generate case number
    const caseNumber = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`;
    
    // Mock creation
    const newCase = {
      id: Date.now().toString(),
      caseNumber,
      ...caseData,
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      evidenceCount: 0,
      tasksCount: 0,
      notesCount: 0
    };

    res.status(201).json({
      success: true,
      data: newCase,
      message: 'Investigation case created successfully'
    });
  });

  /**
   * Get a specific investigation case
   */
  getCase = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    
    // Mock data
    const mockCase = {
      id,
      caseNumber: 'INV-2024-001',
      title: 'APT29 Infrastructure Analysis',
      description: 'Investigation into suspected APT29 command and control infrastructure discovered in network logs',
      status: 'under-investigation',
      priority: 'critical',
      assignedInvestigator: 'Sarah Chen',
      leadInvestigator: 'Mike Johnson',
      category: 'Advanced Persistent Threat',
      tags: ['APT29', 'C2', 'Network Analysis'],
      createdAt: new Date(Date.now() - 432000000).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
      dueDate: new Date(Date.now() + 604800000).toISOString(),
      evidenceCount: 23,
      tasksCount: 8,
      notesCount: 15
    };

    res.json({
      success: true,
      data: mockCase
    });
  });

  /**
   * Update an investigation case
   */
  updateCase = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const updateData = req.body;
    
    // Mock update
    const updatedCase = {
      id,
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      data: updatedCase,
      message: 'Case updated successfully'
    });
  });

  /**
   * Get case timeline
   */
  getCaseTimeline = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    
    // Mock timeline data
    const mockTimeline = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 432000000).toISOString(),
        type: 'case_created',
        description: 'Investigation case opened',
        user: 'Mike Johnson',
        details: { status: 'open' }
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 345600000).toISOString(),
        type: 'evidence_added',
        description: 'Network logs evidence added',
        user: 'Sarah Chen',
        details: { evidenceId: 'ev-001', type: 'network_logs' }
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 259200000).toISOString(),
        type: 'status_changed',
        description: 'Case status changed to under investigation',
        user: 'Sarah Chen',
        details: { from: 'open', to: 'under-investigation' }
      }
    ];

    res.json({
      success: true,
      data: mockTimeline
    });
  });

  /**
   * Get case evidence
   */
  getCaseEvidence = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    
    // Mock evidence data
    const mockEvidence = [
      {
        id: 'ev-001',
        type: 'network_logs',
        name: 'Suspicious Network Traffic',
        description: 'Network logs showing communication with known C2 servers',
        addedBy: 'Sarah Chen',
        addedAt: new Date(Date.now() - 345600000).toISOString(),
        fileSize: '2.5 MB',
        hash: 'sha256:abc123...'
      },
      {
        id: 'ev-002',
        type: 'malware_sample',
        name: 'Potential APT29 Backdoor',
        description: 'Executable file suspected to be APT29 backdoor',
        addedBy: 'Alex Rodriguez',
        addedAt: new Date(Date.now() - 172800000).toISOString(),
        fileSize: '1.2 MB',
        hash: 'sha256:def456...'
      }
    ];

    res.json({
      success: true,
      data: mockEvidence
    });
  });

  /**
   * Get case notes
   */
  getCaseNotes = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    
    // Mock notes data
    const mockNotes = [
      {
        id: 'note-001',
        type: 'analysis',
        content: 'Initial analysis shows strong indicators of APT29 activity. C2 domains match known infrastructure.',
        author: 'Sarah Chen',
        createdAt: new Date(Date.now() - 259200000).toISOString(),
        updatedAt: new Date(Date.now() - 259200000).toISOString()
      },
      {
        id: 'note-002',
        type: 'evidence',
        content: 'Network logs show persistent beaconing to 185.243.112.45 every 30 minutes starting 2024-01-15.',
        author: 'Alex Rodriguez',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 172800000).toISOString()
      }
    ];

    res.json({
      success: true,
      data: mockNotes
    });
  });

  /**
   * Add a note to a case
   */
  addCaseNote = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { content, type } = req.body;
    
    // Mock note creation
    const newNote = {
      id: `note-${Date.now()}`,
      type,
      content,
      author: req.user?.username || req.user?.email || 'Unknown',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    res.status(201).json({
      success: true,
      data: newNote,
      message: 'Note added successfully'
    });
  });
}