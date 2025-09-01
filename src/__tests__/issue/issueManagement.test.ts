/**
 * Issue Management Service Tests
 * Test suite for the Fortune 100-Grade Issue & Ticket Tracker
 */

import { IssueManagementService } from '../../services/issue/IssueManagementService.js';
import { Issue } from '../../models/Issue.js';
import {
  ICreateIssueRequest,
  IUpdateIssueRequest,
  IIssueContext,
  IIssueSearchQuery,
  IAddCommentRequest,
} from '../../services/issue/interfaces/IIssueManager.js';

// Mock the Issue model
jest.mock('../../models/Issue');

describe('IssueManagementService', () => {
  let service: IssueManagementService;
  let mockContext: IIssueContext;

  beforeEach(() => {
    service = new IssueManagementService();
    mockContext = {
      userId: 'test-user-123',
      userRole: 'analyst',
      permissions: ['create_issues', 'edit_issues', 'resolve_issues'],
      organizationId: 'org-123',
    };

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('createIssue', () => {
    it('should create a new issue successfully', async () => {
      const createRequest: ICreateIssueRequest = {
        title: 'Test Security Incident',
        description: 'A test security incident for unit testing',
        issueType: 'incident',
        priority: 'high',
        severity: 'major',
        threatLevel: 'high',
        affectedSystems: ['server-01', 'workstation-05'],
        relatedIOCs: ['ioc-123', 'ioc-456'],
        labels: ['security', 'incident-response'],
        tags: ['urgent', 'malware'],
        reporter: mockContext.userId,
        securityClassification: 'confidential',
      };

      const mockIssue = {
        _id: 'issue-123',
        ticketId: 'ISS-2024-000001',
        ...createRequest,
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date(),
        save: jest.fn().mockResolvedValue({
          _id: 'issue-123',
          ticketId: 'ISS-2024-000001',
          ...createRequest,
        }),
      };

      (Issue as any).mockImplementation(() => mockIssue);
      (Issue as any).countDocuments = jest.fn().mockResolvedValue(0);

      const result = await service.createIssue(createRequest, mockContext);

      expect(result).toBeDefined();
      expect(mockIssue.save).toHaveBeenCalled();
    });

    it('should handle invalid issue type', async () => {
      const createRequest = {
        title: 'Test Issue',
        description: 'Test description',
        issueType: 'invalid-type' as any,
        reporter: mockContext.userId,
      };

      // This would be caught by validation middleware in real implementation
      // Here we're just testing the service layer
      const mockIssue = {
        save: jest.fn().mockRejectedValue(new Error('Invalid issue type')),
      };

      (Issue as any).mockImplementation(() => mockIssue);

      await expect(service.createIssue(createRequest, mockContext))
        .rejects.toThrow('Invalid issue type');
    });
  });

  describe('getIssue', () => {
    it('should retrieve an issue successfully', async () => {
      const mockIssue = {
        _id: 'issue-123',
        ticketId: 'ISS-2024-000001',
        title: 'Test Issue',
        securityClassification: 'internal',
        reporter: mockContext.userId,
      };

      (Issue.findById as jest.Mock) = jest.fn().mockResolvedValue(mockIssue);

      const result = await service.getIssue('issue-123', mockContext);

      expect(result).toEqual(mockIssue);
      expect(Issue.findById).toHaveBeenCalledWith('issue-123');
    });

    it('should return null for non-existent issue', async () => {
      (Issue.findById as jest.Mock) = jest.fn().mockResolvedValue(null);

      const result = await service.getIssue('non-existent', mockContext);

      expect(result).toBeNull();
    });

    it('should throw error for access denied', async () => {
      const mockIssue = {
        _id: 'issue-123',
        securityClassification: 'restricted',
        reporter: 'other-user',
      };

      (Issue.findById as jest.Mock) = jest.fn().mockResolvedValue(mockIssue);

      // User with analyst role shouldn't access restricted issues
      await expect(service.getIssue('issue-123', mockContext))
        .rejects.toThrow('Access denied to this issue');
    });
  });

  describe('updateIssue', () => {
    it('should update an issue successfully', async () => {
      const updates: IUpdateIssueRequest = {
        title: 'Updated Title',
        priority: 'critical',
        status: 'in_progress',
      };

      const mockIssue = {
        _id: 'issue-123',
        title: 'Original Title',
        priority: 'high',
        status: 'open',
        reporter: mockContext.userId,
        securityClassification: 'internal',
        auditTrail: [],
        save: jest.fn().mockResolvedValue({
          _id: 'issue-123',
          ...updates,
        }),
      };

      (Issue.findById as jest.Mock) = jest.fn().mockResolvedValue(mockIssue);

      const result = await service.updateIssue('issue-123', updates, mockContext);

      expect(result).toBeDefined();
      expect(mockIssue.save).toHaveBeenCalled();
      expect(mockIssue.auditTrail).toHaveLength(1);
      expect(mockIssue.auditTrail[0].action).toBe('updated');
    });

    it('should throw error for non-existent issue', async () => {
      (Issue.findById as jest.Mock) = jest.fn().mockResolvedValue(null);

      await expect(service.updateIssue('non-existent', {}, mockContext))
        .rejects.toThrow('Issue not found');
    });

    it('should throw error for insufficient permissions', async () => {
      const mockIssue = {
        _id: 'issue-123',
        reporter: 'other-user',
        assignee: 'another-user',
        securityClassification: 'internal',
      };

      const contextWithoutPermission = {
        ...mockContext,
        permissions: [], // No edit permissions
      };

      (Issue.findById as jest.Mock) = jest.fn().mockResolvedValue(mockIssue);

      await expect(service.updateIssue('issue-123', {}, contextWithoutPermission))
        .rejects.toThrow('Permission denied to update this issue');
    });
  });

  describe('searchIssues', () => {
    it('should search issues with filters', async () => {
      const searchQuery: IIssueSearchQuery = {
        query: 'security incident',
        filters: {
          status: ['open', 'in_progress'],
          priority: ['high', 'critical'],
          issueType: ['incident'],
        },
        sortBy: 'createdAt',
        sortOrder: 'desc',
        page: 1,
        limit: 10,
      };

      const mockIssues = [
        { _id: 'issue-1', title: 'Security Incident 1' },
        { _id: 'issue-2', title: 'Security Incident 2' },
      ];

      (Issue.find as jest.Mock) = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(mockIssues),
          }),
        }),
      });

      (Issue.countDocuments as jest.Mock) = jest.fn().mockResolvedValue(2);

      const result = await service.searchIssues(searchQuery, mockContext);

      expect(result.issues).toEqual(mockIssues);
      expect(result.totalCount).toBe(2);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('should handle empty search results', async () => {
      (Issue.find as jest.Mock) = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      (Issue.countDocuments as jest.Mock) = jest.fn().mockResolvedValue(0);

      const result = await service.searchIssues({}, mockContext);

      expect(result.issues).toHaveLength(0);
      expect(result.totalCount).toBe(0);
    });
  });

  describe('transitionIssueStatus', () => {
    it('should transition status successfully', async () => {
      const mockIssue = {
        _id: 'issue-123',
        status: 'open',
        workflowState: { 
          currentStage: 'open',
          stageHistory: [] 
        },
        auditTrail: [],
        save: jest.fn().mockResolvedValue({
          _id: 'issue-123',
          status: 'in_progress',
        }),
      };

      (Issue.findById as jest.Mock) = jest.fn().mockResolvedValue(mockIssue);

      const result = await service.transitionIssueStatus(
        'issue-123', 
        'in_progress', 
        mockContext,
        'Starting work on this issue'
      );

      expect(result).toBeDefined();
      expect(mockIssue.save).toHaveBeenCalled();
      expect(mockIssue.status).toBe('in_progress');
      expect(mockIssue.workflowState.stageHistory).toHaveLength(1);
      expect(mockIssue.auditTrail).toHaveLength(1);
    });

    it('should reject invalid status transition', async () => {
      const mockIssue = {
        status: 'closed',
      };

      (Issue.findById as jest.Mock) = jest.fn().mockResolvedValue(mockIssue);

      await expect(
        service.transitionIssueStatus('issue-123', 'open', mockContext)
      ).rejects.toThrow('Invalid status transition from closed to open');
    });

    it('should check permissions for restricted transitions', async () => {
      const mockIssue = {
        status: 'open',
      };

      const contextWithoutPermissions = {
        ...mockContext,
        permissions: [], // No resolve permissions
      };

      (Issue.findById as jest.Mock) = jest.fn().mockResolvedValue(mockIssue);

      await expect(
        service.transitionIssueStatus('issue-123', 'resolved', contextWithoutPermissions)
      ).rejects.toThrow('Insufficient permissions for this status transition');
    });
  });

  describe('addComment', () => {
    it('should add comment successfully', async () => {
      const commentRequest: IAddCommentRequest = {
        issueId: 'issue-123',
        userId: mockContext.userId,
        content: 'This is a test comment',
        isInternal: false,
      };

      const mockIssue = {
        _id: 'issue-123',
        comments: [],
        auditTrail: [],
        save: jest.fn().mockResolvedValue({
          _id: 'issue-123',
          comments: [{ content: 'This is a test comment' }],
        }),
      };

      (Issue.findById as jest.Mock) = jest.fn().mockResolvedValue(mockIssue);

      const result = await service.addComment(commentRequest, mockContext);

      expect(result).toBeDefined();
      expect(mockIssue.save).toHaveBeenCalled();
      expect(mockIssue.comments).toHaveLength(1);
      expect(mockIssue.auditTrail).toHaveLength(1);
    });

    it('should throw error for non-existent issue', async () => {
      (Issue.findById as jest.Mock) = jest.fn().mockResolvedValue(null);

      const commentRequest: IAddCommentRequest = {
        issueId: 'non-existent',
        userId: mockContext.userId,
        content: 'Test comment',
      };

      await expect(service.addComment(commentRequest, mockContext))
        .rejects.toThrow('Issue not found');
    });
  });

  describe('assignIssue', () => {
    it('should assign issue successfully', async () => {
      const mockIssue = {
        _id: 'issue-123',
        assignee: null,
        auditTrail: [],
        save: jest.fn().mockResolvedValue({
          _id: 'issue-123',
          assignee: 'new-assignee',
        }),
      };

      (Issue.findById as jest.Mock) = jest.fn().mockResolvedValue(mockIssue);

      const result = await service.assignIssue('issue-123', 'new-assignee', mockContext);

      expect(result).toBeDefined();
      expect(mockIssue.save).toHaveBeenCalled();
      expect(mockIssue.assignee).toBe('new-assignee');
      expect(mockIssue.auditTrail).toHaveLength(1);
      expect(mockIssue.auditTrail[0].action).toBe('assigned');
    });
  });

  describe('escalateIssue', () => {
    it('should escalate issue successfully', async () => {
      const mockIssue = {
        _id: 'issue-123',
        status: 'in_progress',
        auditTrail: [],
        save: jest.fn().mockResolvedValue({
          _id: 'issue-123',
          status: 'escalated',
        }),
      };

      (Issue.findById as jest.Mock) = jest.fn().mockResolvedValue(mockIssue);

      const result = await service.escalateIssue(
        'issue-123', 
        'Issue requires management attention', 
        mockContext
      );

      expect(result).toBeDefined();
      expect(mockIssue.save).toHaveBeenCalled();
      expect(mockIssue.status).toBe('escalated');
      expect(mockIssue.auditTrail).toHaveLength(1);
      expect(mockIssue.auditTrail[0].action).toBe('escalated');
    });
  });

  describe('resolveIssue', () => {
    it('should resolve issue successfully', async () => {
      const mockIssue = {
        _id: 'issue-123',
        status: 'in_progress',
        resolution: undefined,
        auditTrail: [],
        save: jest.fn().mockResolvedValue({
          _id: 'issue-123',
          status: 'resolved',
        }),
      };

      (Issue.findById as jest.Mock) = jest.fn().mockResolvedValue(mockIssue);

      const resolution = {
        type: 'fixed' as const,
        description: 'Issue has been resolved by applying security patch',
      };

      const result = await service.resolveIssue('issue-123', resolution, mockContext);

      expect(result).toBeDefined();
      expect(mockIssue.save).toHaveBeenCalled();
      expect(mockIssue.status).toBe('resolved');
      expect(mockIssue.resolution).toBeDefined();
      expect(mockIssue.resolution!.type).toBe('fixed');
      expect(mockIssue.auditTrail).toHaveLength(1);
      expect(mockIssue.auditTrail[0].action).toBe('resolved');
    });
  });

  describe('logTime', () => {
    it('should log time spent successfully', async () => {
      const mockIssue = {
        _id: 'issue-123',
        timeSpent: [],
        actualHours: 0,
        save: jest.fn().mockResolvedValue({
          _id: 'issue-123',
          timeSpent: [{ userId: mockContext.userId, hours: 2 }],
          actualHours: 2,
        }),
      };

      (Issue.findById as jest.Mock) = jest.fn().mockResolvedValue(mockIssue);

      const result = await service.logTime(
        'issue-123', 
        2, 
        'Investigated security logs', 
        mockContext
      );

      expect(result).toBeDefined();
      expect(mockIssue.save).toHaveBeenCalled();
      expect(mockIssue.timeSpent).toHaveLength(1);
      expect(mockIssue.actualHours).toBe(2);
    });
  });

  describe('getIssueMetrics', () => {
    it('should return issue metrics', async () => {
      // Mock aggregation results
      (Issue.countDocuments as jest.Mock) = jest.fn()
        .mockResolvedValueOnce(100) // totalIssues
        .mockResolvedValueOnce(30)  // openIssues
        .mockResolvedValueOnce(60)  // resolvedIssues
        .mockResolvedValueOnce(5);  // overdueIssues

      (Issue.aggregate as jest.Mock) = jest.fn()
        .mockResolvedValueOnce([
          { _id: 'high', count: 20 },
          { _id: 'medium', count: 50 },
          { _id: 'low', count: 30 }
        ])
        .mockResolvedValueOnce([
          { _id: 'open', count: 30 },
          { _id: 'resolved', count: 60 },
          { _id: 'closed', count: 10 }
        ])
        .mockResolvedValueOnce([
          { _id: 'incident', count: 40 },
          { _id: 'bug', count: 35 },
          { _id: 'feature', count: 25 }
        ]);

      const result = await service.getIssueMetrics();

      expect(result).toBeDefined();
      expect(result.totalIssues).toBe(100);
      expect(result.openIssues).toBe(30);
      expect(result.resolvedIssues).toBe(60);
      expect(result.overdueIssues).toBe(5);
      expect(result.issuesByPriority).toHaveProperty('high', 20);
      expect(result.issuesByStatus).toHaveProperty('open', 30);
      expect(result.issuesByType).toHaveProperty('incident', 40);
    });
  });
});