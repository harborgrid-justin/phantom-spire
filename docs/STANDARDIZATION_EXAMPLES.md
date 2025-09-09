# Architecture Standardization Examples

## Overview

This document provides practical examples of applying architecture standardization patterns across the Phantom Spire platform. These examples demonstrate how to migrate existing components to comply with enterprise-grade standards.

## Backend Standardization Examples

### 1. Controller Standardization

#### Before (Non-standardized)
```typescript
// Old pattern - non-standardized controller
export class ThreatController {
  async getThreats(req: Request, res: Response) {
    try {
      const threats = await threatService.getAll();
      res.json({ data: threats });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
```

#### After (Standardized)
```typescript
// New pattern - extends BaseController
import { BaseController } from '../controllers/BaseController';
import { ThreatService } from '../services/ThreatService';

export class ThreatController extends BaseController {
  constructor(private threatService: ThreatService) {
    super();
  }

  getThreats = this.asyncHandler(async (req: Request, res: Response) => {
    const { page, pageSize, offset } = this.getPaginationParams(req);
    const filters = this.getFilterParams(req);
    
    const result = await this.threatService.getThreats(filters, { offset, limit: pageSize });
    
    if (!result.success) {
      return this.sendError(res, result.error!, 400, result.code);
    }

    this.sendPaginated(
      res, 
      result.data!.items, 
      result.data!.total, 
      page, 
      pageSize,
      'Threats retrieved successfully'
    );
  });

  createThreat = this.asyncHandler(async (req: Request, res: Response) => {
    const missingFields = this.validateRequiredFields(req.body, ['name', 'severity']);
    if (missingFields.length > 0) {
      return this.handleValidationError(res, missingFields);
    }

    const result = await this.threatService.createThreat(req.body);
    
    if (!result.success) {
      return this.sendError(res, result.error!, 400, result.code);
    }

    this.sendSuccess(res, result.data, 'Threat created successfully', { id: result.data!.id });
  });
}
```

### 2. Service Standardization

#### Before (Non-standardized)
```typescript
// Old pattern - non-standardized service
export class ThreatService {
  async getAll(): Promise<Threat[]> {
    return await ThreatModel.find();
  }

  async create(data: any): Promise<Threat> {
    const threat = new ThreatModel(data);
    return await threat.save();
  }
}
```

#### After (Standardized)
```typescript
// New pattern - extends BaseService
import { BaseService, ServiceResult, PaginatedResult } from '../services/BaseService';
import { Threat, CreateThreatRequest } from '../types/threat';

export class ThreatService extends BaseService {
  constructor() {
    super('ThreatService');
  }

  async getThreats(
    filters: ThreatFilters = {},
    pagination: { offset: number; limit: number }
  ): Promise<ServiceResult<PaginatedResult<Threat>>> {
    return this.executeOperation(async () => {
      // Apply filters
      const query = this.buildQuery(filters);
      
      // Get paginated results
      const [items, total] = await Promise.all([
        ThreatModel.find(query)
          .skip(pagination.offset)
          .limit(pagination.limit)
          .sort({ createdAt: -1 }),
        ThreatModel.countDocuments(query)
      ]);

      // Cache results
      const cacheKey = `threats:${JSON.stringify(filters)}:${pagination.offset}:${pagination.limit}`;
      await this.setCache(cacheKey, { items, total });

      // Emit event
      await this.emitEvent('threats.retrieved', { 
        count: items.length, 
        filters, 
        pagination 
      });

      return {
        items,
        total,
        page: Math.floor(pagination.offset / pagination.limit) + 1,
        pageSize: pagination.limit,
        totalPages: Math.ceil(total / pagination.limit)
      };
    }, 'getThreats');
  }

  async createThreat(data: CreateThreatRequest): Promise<ServiceResult<Threat>> {
    return this.executeOperation(async () => {
      // Validate business rules
      await this.validateThreatData(data);

      // Create threat
      const threat = new ThreatModel({
        ...data,
        id: this.generateId(),
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const savedThreat = await threat.save();

      // Emit event
      await this.emitEvent('threat.created', { threat: savedThreat });

      // Invalidate cache
      await this.invalidateCache('threats:*');

      return savedThreat;
    }, 'createThreat');
  }

  private async validateThreatData(data: CreateThreatRequest): Promise<void> {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Threat name is required');
    }

    if (!['low', 'medium', 'high', 'critical'].includes(data.severity)) {
      throw new Error('Invalid severity level');
    }

    // Check for duplicates
    const existing = await ThreatModel.findOne({ name: data.name });
    if (existing) {
      throw new Error('Threat with this name already exists');
    }
  }

  private buildQuery(filters: ThreatFilters): any {
    const query: any = {};

    if (filters.severity) {
      query.severity = filters.severity;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } }
      ];
    }

    if (filters.dateFrom || filters.dateTo) {
      query.createdAt = {};
      if (filters.dateFrom) query.createdAt.$gte = new Date(filters.dateFrom);
      if (filters.dateTo) query.createdAt.$lte = new Date(filters.dateTo);
    }

    return query;
  }
}
```

### 3. Router Standardization

#### Before (Non-standardized)
```typescript
// Old pattern - non-standardized routes
import express from 'express';

const router = express.Router();

router.get('/threats', threatController.getThreats);
router.post('/threats', threatController.createThreat);
router.put('/threats/:id', threatController.updateThreat);
router.delete('/threats/:id', threatController.deleteThreat);

export default router;
```

#### After (Standardized)
```typescript
// New pattern - extends BaseRouter
import { BaseRouter } from '../routes/BaseRouter';
import { ThreatController } from '../controllers/ThreatController';

export class ThreatRouter extends BaseRouter {
  constructor(controller: ThreatController) {
    super('/api/v1/threats', controller);
  }

  protected initializeRoutes(): void {
    // Register standard CRUD routes with proper permissions and validation
    this.registerCrudRoutes(
      'Threat',
      {
        read: ['threat:read'],
        create: ['threat:create'],
        update: ['threat:update'],
        delete: ['threat:delete']
      },
      {
        create: this.createThreatValidation(),
        update: this.updateThreatValidation(),
        query: this.queryThreatValidation()
      }
    );

    // Register custom routes
    this.registerRoute({
      path: '/search',
      method: 'post',
      handler: (this.controller as ThreatController).searchThreats,
      permissions: ['threat:search'],
      validation: this.searchValidation(),
      rateLimit: { windowMs: 60000, max: 30 }
    });

    this.registerRoute({
      path: '/:id/analyze',
      method: 'post',
      handler: (this.controller as ThreatController).analyzeThreat,
      permissions: ['threat:analyze'],
      rateLimit: { windowMs: 60000, max: 10 }
    });

    // Register analytics routes
    this.registerRoute({
      path: '/analytics/summary',
      method: 'get',
      handler: (this.controller as ThreatController).getThreatSummary,
      permissions: ['threat:analytics']
    });

    // Register health check and metrics
    this.registerHealthCheck();
    this.registerMetrics();
  }

  private createThreatValidation() {
    return [
      body('name').notEmpty().withMessage('Name is required'),
      body('severity').isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid severity'),
      body('description').optional().isString(),
      body('indicators').optional().isArray()
    ];
  }

  private updateThreatValidation() {
    return [
      body('name').optional().notEmpty(),
      body('severity').optional().isIn(['low', 'medium', 'high', 'critical']),
      body('status').optional().isIn(['active', 'inactive', 'archived'])
    ];
  }

  private queryThreatValidation() {
    return [
      query('page').optional().isInt({ min: 1 }),
      query('pageSize').optional().isInt({ min: 1, max: 100 }),
      query('severity').optional().isIn(['low', 'medium', 'high', 'critical']),
      query('status').optional().isIn(['active', 'inactive', 'archived'])
    ];
  }

  private searchValidation() {
    return [
      body('query').notEmpty().withMessage('Search query is required'),
      body('filters').optional().isObject()
    ];
  }
}
```

## Frontend Standardization Examples

### 1. Component Standardization

#### Before (Non-standardized)
```typescript
// Old pattern - non-standardized component
import React, { useState, useEffect } from 'react';

export const ThreatList: React.FC = () => {
  const [threats, setThreats] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchThreats();
  }, []);

  const fetchThreats = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/threats');
      const data = await response.json();
      setThreats(data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <ul>
          {threats.map(threat => (
            <li key={threat.id}>{threat.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
};
```

#### After (Standardized)
```typescript
// New pattern - follows StandardizedComponent pattern
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Pagination,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { 
  Threat, 
  ThreatFilters, 
  Status, 
  Priority,
  ApiResponse,
  PaginatedResponse 
} from '../../types/common';

interface ThreatListProps {
  title?: string;
  subtitle?: string;
  onEdit?: (threat: Threat) => void;
  onDelete?: (id: string) => void;
  onCreate?: () => void;
  initialFilters?: ThreatFilters;
}

// Custom hook for threat data management
const useThreatData = (initialFilters: ThreatFilters = {}) => {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ThreatFilters>(initialFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const fetchThreats = useCallback(async (page: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        pageSize: '20',
        ...filters
      });

      const response = await fetch(`/api/v1/threats?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: ApiResponse<PaginatedResponse<Threat>> = await response.json();

      if (data.success) {
        setThreats(data.data!.data);
        setTotalPages(data.data!.totalPages);
        setTotalCount(data.data!.total);
        setCurrentPage(page);
      } else {
        setError(data.error || 'Failed to fetch threats');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchThreats(1);
  }, [fetchThreats]);

  return {
    threats,
    loading,
    error,
    filters,
    setFilters,
    currentPage,
    totalPages,
    totalCount,
    fetchThreats,
    refetch: () => fetchThreats(currentPage)
  };
};

export const ThreatList: React.FC<ThreatListProps> = ({
  title = 'Threat Intelligence',
  subtitle = 'Manage and monitor security threats',
  onEdit,
  onDelete,
  onCreate,
  initialFilters = {}
}) => {
  const {
    threats,
    loading,
    error,
    filters,
    setFilters,
    currentPage,
    totalPages,
    totalCount,
    fetchThreats,
    refetch
  } = useThreatData(initialFilters);

  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>(filters.status || 'all');
  const [severityFilter, setSeverityFilter] = useState<Priority | 'all'>(filters.severity || 'all');

  const handleSearch = useCallback(() => {
    setFilters({
      ...filters,
      search: searchQuery || undefined,
      status: statusFilter === 'all' ? undefined : statusFilter,
      severity: severityFilter === 'all' ? undefined : severityFilter
    });
  }, [searchQuery, statusFilter, severityFilter, filters, setFilters]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    fetchThreats(page);
  };

  const getSeverityColor = (severity: Priority) => {
    const colors = {
      low: 'success',
      medium: 'warning', 
      high: 'error',
      critical: 'error'
    } as const;
    return colors[severity] || 'default';
  };

  const getStatusColor = (status: Status) => {
    const colors = {
      active: 'success',
      pending: 'warning',
      completed: 'info',
      archived: 'default'
    } as const;
    return colors[status] || 'default';
  };

  // Error boundary
  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert 
            severity="error" 
            action={
              <Button color="inherit" size="small" onClick={refetch}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title={title}
        subheader={subtitle}
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            {onCreate && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={onCreate}
              >
                Add Threat
              </Button>
            )}
            <Tooltip title="Refresh">
              <IconButton onClick={refetch}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        }
      />
      <CardContent>
        {/* Filters */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Search threats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            InputProps={{
              endAdornment: (
                <IconButton size="small" onClick={handleSearch}>
                  <SearchIcon />
                </IconButton>
              )
            }}
            sx={{ minWidth: 250 }}
          />
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as Status | 'all')}
              label="Status"
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="archived">Archived</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Severity</InputLabel>
            <Select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as Priority | 'all')}
              label="Severity"
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="critical">Critical</MenuItem>
            </Select>
          </FormControl>

          <Button variant="outlined" onClick={handleSearch}>
            Apply Filters
          </Button>
        </Box>

        {/* Loading state */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Data table */}
        {!loading && (
          <>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Severity</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {threats.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          No threats found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    threats.map((threat) => (
                      <TableRow key={threat.id} hover>
                        <TableCell>
                          <Typography variant="subtitle2">
                            {threat.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {threat.description}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={threat.metadata?.priority || 'medium'}
                            color={getSeverityColor(threat.metadata?.priority || 'medium')}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={threat.status}
                            color={getStatusColor(threat.status)}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(threat.createdAt).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            {onEdit && (
                              <Tooltip title="Edit">
                                <IconButton size="small" onClick={() => onEdit(threat)}>
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                            {onDelete && (
                              <Tooltip title="Delete">
                                <IconButton 
                                  size="small" 
                                  color="error"
                                  onClick={() => onDelete(threat.id)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}

            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Showing {threats.length} of {totalCount} threats
            </Typography>
          </>
        )}
      </CardContent>
    </Card>
  );
};
```

## Testing Standardization Examples

### Architecture Validation Tests

```typescript
import { describe, it, expect, beforeEach } from '@jest/globals';
import { ThreatController } from '../controllers/ThreatController';
import { ThreatService } from '../services/ThreatService';
import { ThreatRouter } from '../routes/ThreatRouter';

describe('Threat Module Architecture Compliance', () => {
  let threatController: ThreatController;
  let threatService: ThreatService;
  let threatRouter: ThreatRouter;

  beforeEach(() => {
    threatService = new ThreatService();
    threatController = new ThreatController(threatService);
    threatRouter = new ThreatRouter(threatController);
  });

  describe('Controller Compliance', () => {
    it('should extend BaseController', () => {
      expect(threatController).toBeInstanceOf(BaseController);
    });

    it('should have standardized response methods', () => {
      expect(typeof threatController.sendSuccess).toBe('function');
      expect(typeof threatController.sendError).toBe('function');
      expect(typeof threatController.sendPaginated).toBe('function');
    });

    it('should have standardized parameter extraction methods', () => {
      expect(typeof threatController.getPaginationParams).toBe('function');
      expect(typeof threatController.getFilterParams).toBe('function');
      expect(typeof threatController.validateRequiredFields).toBe('function');
    });
  });

  describe('Service Compliance', () => {
    it('should extend BaseService', () => {
      expect(threatService).toBeInstanceOf(BaseService);
    });

    it('should return ServiceResult objects', async () => {
      const result = await threatService.getThreats();
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('timestamp');
    });

    it('should handle errors consistently', async () => {
      // Mock a failing operation
      jest.spyOn(threatService as any, 'executeOperation').mockImplementation(() => {
        throw new Error('Test error');
      });

      const result = await threatService.getThreats();
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Router Compliance', () => {
    it('should extend BaseRouter', () => {
      expect(threatRouter).toBeInstanceOf(BaseRouter);
    });

    it('should have proper route registration', () => {
      const router = threatRouter.getRouter();
      expect(router).toBeDefined();
      expect(router.stack.length).toBeGreaterThan(0);
    });

    it('should include health check endpoint', () => {
      const router = threatRouter.getRouter();
      const healthRoute = router.stack.find(layer => 
        layer.route?.path === '/health'
      );
      expect(healthRoute).toBeDefined();
    });
  });

  describe('Integration Compliance', () => {
    it('should maintain consistent error response format', () => {
      const req = createMockRequest();
      const res = createMockResponse();
      
      threatController.sendError(res, 'Test error', 400, 'TEST_ERROR');
      
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
      const testData = { id: '1', name: 'Test Threat' };
      
      threatController.sendSuccess(res, testData, 'Success message');
      
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: testData,
        message: 'Success message',
        timestamp: expect.any(String)
      });
    });
  });
});
```

## Summary

These examples demonstrate the complete transformation from non-standardized to standardized patterns:

1. **Controllers**: Extend BaseController, use standardized response methods, implement proper error handling
2. **Services**: Extend BaseService, return ServiceResult objects, implement business logic patterns
3. **Routes**: Extend BaseRouter, use factory methods for CRUD operations, implement proper middleware
4. **Frontend**: Follow component patterns, use standardized hooks, implement proper error boundaries
5. **Testing**: Validate architecture compliance, test integration patterns

All components should follow these patterns to ensure enterprise-grade consistency and maintainability.