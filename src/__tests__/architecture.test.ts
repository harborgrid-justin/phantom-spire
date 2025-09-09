/**
 * Architecture Validation Tests
 * Validates that all standardized patterns work correctly
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { BaseController } from '../controllers/BaseController';
import { BaseService } from '../services/BaseService';
import { Request, Response } from 'express';

// Mock implementations for testing
class TestController extends BaseController {
  async testMethod(req: Request, res: Response): Promise<void> {
    const { page, pageSize } = this.getPaginationParams(req);
    const filters = this.getFilterParams(req);
    
    const mockData = [
      { id: '1', name: 'Test Item 1', status: 'active' },
      { id: '2', name: 'Test Item 2', status: 'pending' }
    ];
    
    this.sendPaginated(res, mockData, 2, page, pageSize, 'Test successful');
  }
}

class TestService extends BaseService {
  constructor() {
    super('TestService');
  }
  
  async testOperation(): Promise<any> {
    return this.executeOperation(async () => {
      return { message: 'Service operation successful' };
    }, 'testOperation');
  }
}

// Mock Express request and response objects
const createMockRequest = (query: any = {}, body: any = {}) => ({
  query,
  body,
  params: {},
  headers: {}
} as any);

const createMockResponse = () => {
  const res: any = {
    json: jest.fn().mockReturnThis(),
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis()
  };
  return res;
};

describe('Architecture Standardization Tests', () => {
  let testController: TestController;
  let testService: TestService;

  beforeEach(() => {
    testController = new TestController();
    testService = new TestService();
    jest.clearAllMocks();
  });

  describe('BaseController', () => {
    it('should handle pagination parameters correctly', () => {
      const req = createMockRequest({ page: '2', pageSize: '10' });
      const { page, pageSize, offset } = (testController as any).getPaginationParams(req);
      
      expect(page).toBe(2);
      expect(pageSize).toBe(10);
      expect(offset).toBe(10);
    });

    it('should apply default pagination when not provided', () => {
      const req = createMockRequest({});
      const { page, pageSize, offset } = (testController as any).getPaginationParams(req);
      
      expect(page).toBe(1);
      expect(pageSize).toBe(20);
      expect(offset).toBe(0);
    });

    it('should extract filter parameters correctly', () => {
      const req = createMockRequest({
        search: 'test',
        status: 'active',
        priority: 'high',
        tags: 'tag1,tag2'
      });
      
      const filters = (testController as any).getFilterParams(req);
      
      expect(filters.search).toBe('test');
      expect(filters.status).toBe('active');
      expect(filters.priority).toBe('high');
      expect(filters.tags).toEqual(['tag1', 'tag2']);
    });

    it('should validate required fields correctly', () => {
      const data = { name: 'Test', status: 'active' };
      const requiredFields = ['name', 'status', 'description'];
      
      const missingFields = (testController as any).validateRequiredFields(data, requiredFields);
      
      expect(missingFields).toEqual(['description']);
    });

    it('should send successful response with correct format', async () => {
      const req = createMockRequest();
      const res = createMockResponse();
      
      await testController.testMethod(req, res);
      
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Array),
        message: 'Test successful',
        timestamp: expect.any(String),
        metadata: expect.objectContaining({
          total: 2,
          page: 1,
          pageSize: 20,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false
        })
      });
    });
  });

  describe('BaseService', () => {
    it('should execute operations with proper error handling', async () => {
      const result = await testService.testOperation();
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ message: 'Service operation successful' });
    });

    it('should handle service errors correctly', async () => {
      const errorService = new (class extends BaseService {
        constructor() {
          super('ErrorService');
        }
        
        async failingOperation() {
          return this.executeOperation(async () => {
            throw new Error('Test error');
          }, 'failingOperation');
        }
      })();
      
      const result = await errorService.failingOperation();
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Test error');
      expect(result.code).toBe('Error');
    });

    it('should validate entities correctly', () => {
      const data = { name: 'Test', status: 'active' };
      const requiredFields = ['name', 'status', 'description'];
      
      const missingFields = (testService as any).validateEntity(data, requiredFields);
      
      expect(missingFields).toEqual(['description']);
    });

    it('should apply filters to queries', () => {
      const baseQuery = { where: {} };
      const filters = {
        search: 'test',
        status: 'active',
        priority: 'high'
      };
      
      const filteredQuery = (testService as any).applyFilters(baseQuery, filters);
      
      expect(filteredQuery.where.status).toBe('active');
      expect(filteredQuery.where.OR).toBeDefined();
    });

    it('should apply pagination to queries', () => {
      const baseQuery = {};
      const pagination = {
        offset: 20,
        limit: 10,
        orderBy: 'createdAt',
        orderDirection: 'desc' as const
      };
      
      const paginatedQuery = (testService as any).applyPagination(baseQuery, pagination);
      
      expect(paginatedQuery.skip).toBe(20);
      expect(paginatedQuery.take).toBe(10);
      expect(paginatedQuery.orderBy).toEqual({ createdAt: 'desc' });
    });
  });

  describe('Type System', () => {
    it('should provide consistent type definitions', () => {
      // Import types to verify they exist and are properly exported
      const types = require('../types/common');
      
      expect(types.isValidStatus('active')).toBe(true);
      expect(types.isValidStatus('invalid')).toBe(false);
      expect(types.isValidPriority('high')).toBe(true);
      expect(types.isValidPriority('invalid')).toBe(false);
    });

    it('should create form data with correct defaults', () => {
      const types = require('../types/common');
      const formData = types.createFormData();
      
      expect(formData.title).toBe('');
      expect(formData.description).toBe('');
      expect(formData.status).toBe('active');
      expect(formData.metadata.priority).toBe('medium');
    });

    it('should create API responses with correct structure', () => {
      const types = require('../types/common');
      const response = types.createApiResponse({ id: '1', name: 'Test' });
      
      expect(response.success).toBe(true);
      expect(response.data).toEqual({ id: '1', name: 'Test' });
      expect(response.timestamp).toBeDefined();
    });
  });

  describe('Integration Patterns', () => {
    it('should maintain consistent error response format', () => {
      const req = createMockRequest();
      const res = createMockResponse();
      
      (testController as any).sendError(res, 'Test error', 400, 'TEST_ERROR');
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Test error',
        code: 'TEST_ERROR',
        timestamp: expect.any(String)
      });
    });

    it('should maintain consistent success response format', () => {
      const res = createMockResponse();
      const testData = { id: '1', name: 'Test' };
      
      (testController as any).sendSuccess(res, testData, 'Success message');
      
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: testData,
        message: 'Success message',
        timestamp: expect.any(String)
      });
    });
  });
});

export default describe;