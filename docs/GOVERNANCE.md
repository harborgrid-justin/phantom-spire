# Architecture Governance Guidelines

## Overview

This document establishes the architecture governance framework for the Phantom Spire platform, ensuring consistent adherence to enterprise-grade standards and patterns.

## Governance Framework

### Architecture Review Board (ARB)

#### Composition
- **Chief Architect**: Platform architecture oversight
- **Lead Backend Engineer**: Backend systems expertise  
- **Lead Frontend Engineer**: Frontend systems expertise
- **Security Architect**: Security compliance and standards
- **DevOps Lead**: Infrastructure and deployment expertise
- **Quality Assurance Lead**: Testing and validation standards
- **Product Owner**: Business requirements alignment

#### Responsibilities
- Review and approve architectural changes
- Ensure compliance with established patterns
- Maintain architectural standards documentation
- Conduct quarterly architecture health assessments
- Approve technology stack changes
- Monitor compliance metrics and KPIs
- Establish architectural roadmap and evolution strategy

### Architecture Standards Enforcement

#### Automated Compliance Checks
- **Code Quality Gates**: ESLint, TSC, Prettier validation
- **Architecture Tests**: Automated pattern compliance validation  
- **Security Scans**: Vulnerability and dependency checks
- **Performance Tests**: Load testing and performance benchmarks
- **Documentation**: API documentation completeness checks

#### Manual Review Requirements
- All new components must pass architecture review
- Significant changes require ARB approval
- Security-sensitive changes require security architect sign-off
- Performance-critical changes require performance review
- Integration changes require integration testing validation

### Review Process

#### 1. Architecture Decision Records (ADRs)
All significant architectural decisions must be documented using ADRs:

```markdown
# ADR-001: API Gateway Implementation

## Status
Proposed | Accepted | Rejected | Superseded

## Context
Description of the problem that needs to be solved...

## Decision
The specific architectural decision being made...

## Consequences
Positive and negative impacts of this decision...

## Alternatives Considered
Other options that were evaluated...
```

#### 2. Design Review Process
```
Developer → Technical Lead → Architecture Review → Implementation
```

**Review Triggers:**
- New service creation
- Technology stack changes
- Integration pattern modifications
- Security model changes
- Performance architecture changes

## Design Patterns Standards

### 1. Backend Patterns

#### Repository Pattern
```typescript
// Standard Repository Interface
export interface IRepository<T> {
  findById(id: string): Promise<T | null>;
  findMany(filters: any): Promise<T[]>;
  create(entity: Omit<T, 'id'>): Promise<T>;
  update(id: string, updates: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

// Implementation Example
export class ThreatRepository implements IRepository<Threat> {
  constructor(private dataLayer: DataLayer) {}
  
  async findById(id: string): Promise<Threat | null> {
    return this.dataLayer.threats.findUnique({ where: { id } });
  }
  
  // Additional methods...
}
```

#### Service Layer Pattern
```typescript
// Standard Service Interface
export interface IThreatIntelligenceService {
  getThreats(filters: ThreatFilters): Promise<Threat[]>;
  createThreat(data: CreateThreatRequest): Promise<Threat>;
  updateThreat(id: string, data: UpdateThreatRequest): Promise<Threat>;
  deleteThreat(id: string): Promise<void>;
}

// Implementation with Business Logic
export class ThreatIntelligenceService implements IThreatIntelligenceService {
  constructor(
    private threatRepo: IThreatRepository,
    private eventBus: IEventBus,
    private cache: ICacheService
  ) {}
  
  async createThreat(data: CreateThreatRequest): Promise<Threat> {
    // Validate business rules
    await this.validateThreatData(data);
    
    // Create threat
    const threat = await this.threatRepo.create(data);
    
    // Publish event
    await this.eventBus.publish('threat.created', threat);
    
    // Invalidate cache
    await this.cache.invalidate('threats:*');
    
    return threat;
  }
}
```

#### Controller Pattern
```typescript
// Standard Controller Pattern
export class BaseController {
  protected handleResponse<T>(
    res: Response,
    data: T,
    message?: string
  ): void {
    res.json({
      success: true,
      data,
      message,
      timestamp: new Date().toISOString()
    });
  }
  
  protected handleError(
    res: Response,
    error: Error,
    statusCode: number = 500
  ): void {
    res.status(statusCode).json({
      success: false,
      error: error.message,
      code: error.name,
      timestamp: new Date().toISOString()
    });
  }
}

export class ThreatController extends BaseController {
  constructor(private threatService: IThreatIntelligenceService) {
    super();
  }
  
  async getThreats(req: Request, res: Response): Promise<void> {
    try {
      const filters = this.validateFilters(req.query);
      const threats = await this.threatService.getThreats(filters);
      this.handleResponse(res, threats);
    } catch (error) {
      this.handleError(res, error);
    }
  }
}
```

### 2. Frontend Patterns

#### Component Structure Pattern
```typescript
// Standard Component Structure
interface ComponentProps {
  // Required props
  data: ComponentData[];
  
  // Optional props with defaults
  loading?: boolean;
  error?: string | null;
  
  // Event handlers
  onEdit?: (item: ComponentData) => void;
  onDelete?: (id: string) => void;
  onCreate?: (data: CreateComponentData) => void;
}

export const StandardComponent: React.FC<ComponentProps> = ({
  data,
  loading = false,
  error = null,
  onEdit,
  onDelete,
  onCreate
}) => {
  // Local state
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  // Effects
  useEffect(() => {
    // Component initialization
  }, []);
  
  // Event handlers
  const handleSelection = useCallback((id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  }, []);
  
  // Render conditions
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!data.length) return <EmptyState />;
  
  return (
    <Card>
      <CardHeader>
        <Typography variant="h6">Component Title</Typography>
        {onCreate && (
          <Button onClick={() => onCreate()} variant="contained">
            Add New
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {/* Component content */}
      </CardContent>
    </Card>
  );
};
```

#### Custom Hook Pattern
```typescript
// Standard Custom Hook Pattern
export interface UseDataTableOptions<T> {
  fetchFn: (filters: any) => Promise<T[]>;
  initialFilters?: any;
  pageSize?: number;
}

export const useDataTable = <T>({
  fetchFn,
  initialFilters = {},
  pageSize = 20
}: UseDataTableOptions<T>) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState(initialFilters);
  const [currentPage, setCurrentPage] = useState(1);
  
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchFn({
        ...filters,
        page: currentPage,
        limit: pageSize
      });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [fetchFn, filters, currentPage, pageSize]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const updateFilters = useCallback((newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);
  
  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);
  
  return {
    data,
    loading,
    error,
    filters,
    currentPage,
    updateFilters,
    setCurrentPage,
    refresh
  };
};
```

## Code Quality Standards

### 1. TypeScript Standards

#### Strict Type Checking
```json
// tsconfig.json requirements
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true
  }
}
```

#### Interface Design
```typescript
// Good: Explicit and comprehensive
interface ThreatData {
  readonly id: string;
  name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  indicators: Indicator[];
  metadata: {
    readonly createdAt: Date;
    readonly updatedAt: Date;
    tags: string[];
    source: string;
  };
}

// Bad: Loose typing
interface ThreatData {
  id: any;
  name: string;
  data: any;
}
```

### 2. Error Handling Standards

#### Backend Error Handling
```typescript
// Standard Error Classes
export abstract class AppError extends Error {
  abstract readonly statusCode: number;
  abstract readonly code: string;
  
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends AppError {
  readonly statusCode = 400;
  readonly code = 'VALIDATION_ERROR';
  
  constructor(field: string, message: string) {
    super(`Validation failed for ${field}: ${message}`);
  }
}

export class NotFoundError extends AppError {
  readonly statusCode = 404;
  readonly code = 'NOT_FOUND';
  
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`);
  }
}

// Error Handler Middleware
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      error: error.message,
      code: error.code
    });
  } else {
    // Log unexpected errors
    logger.error('Unexpected error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
};
```

#### Frontend Error Handling
```typescript
// Error Boundary Component
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Log error to monitoring service
    ErrorReportingService.reportError(error, {
      componentStack: errorInfo.componentStack,
      userId: AuthService.getCurrentUserId(),
      timestamp: new Date().toISOString()
    });
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <Alert severity="error">
          <AlertTitle>Application Error</AlertTitle>
          An unexpected error occurred. The development team has been notified.
          <Button onClick={() => window.location.reload()}>
            Reload Page
          </Button>
        </Alert>
      );
    }
    
    return this.props.children;
  }
}
```

## Security Standards

### 1. Authentication & Authorization
```typescript
// JWT Token Validation
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token required',
      code: 'MISSING_TOKEN'
    });
  }
  
  jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }
    
    req.user = user;
    next();
  });
};

// Role-based Authorization
export const authorize = (permissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userPermissions = req.user?.permissions || [];
    
    const hasPermission = permissions.some(permission =>
      userPermissions.includes(permission)
    );
    
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }
    
    next();
  };
};
```

### 2. Input Validation
```typescript
// Validation Schema Standards
import Joi from 'joi';

export const threatSchema = Joi.object({
  name: Joi.string().min(3).max(255).required(),
  severity: Joi.string().valid('low', 'medium', 'high', 'critical').required(),
  indicators: Joi.array().items(
    Joi.object({
      type: Joi.string().required(),
      value: Joi.string().required(),
      confidence: Joi.number().min(0).max(100)
    })
  ).min(1).required(),
  metadata: Joi.object({
    tags: Joi.array().items(Joi.string()),
    source: Joi.string().required()
  }).required()
});

// Validation Middleware
export const validateBody = (schema: Joi.Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    
    req.body = value;
    next();
  };
};
```

## Performance Standards

### 1. Database Query Optimization
```typescript
// Query Builder Pattern
export class QueryBuilder<T> {
  private query: any = {};
  
  where(field: string, value: any): this {
    this.query.where = { ...this.query.where, [field]: value };
    return this;
  }
  
  include(relations: string[]): this {
    this.query.include = relations.reduce((acc, rel) => {
      acc[rel] = true;
      return acc;
    }, {});
    return this;
  }
  
  orderBy(field: string, direction: 'asc' | 'desc' = 'asc'): this {
    this.query.orderBy = { [field]: direction };
    return this;
  }
  
  limit(count: number): this {
    this.query.take = count;
    return this;
  }
  
  offset(count: number): this {
    this.query.skip = count;
    return this;
  }
  
  build(): any {
    return this.query;
  }
}

// Usage
const query = new QueryBuilder<Threat>()
  .where('severity', 'high')
  .include(['indicators', 'metadata'])
  .orderBy('createdAt', 'desc')
  .limit(20)
  .build();
```

### 2. Caching Strategy
```typescript
// Multi-layer Cache Implementation
export class CacheManager {
  constructor(
    private memoryCache: Map<string, any>,
    private redisClient: Redis
  ) {}
  
  async get(key: string): Promise<any> {
    // Check memory cache first
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key);
    }
    
    // Check Redis cache
    const redisValue = await this.redisClient.get(key);
    if (redisValue) {
      const parsed = JSON.parse(redisValue);
      // Store in memory cache for faster access
      this.memoryCache.set(key, parsed);
      return parsed;
    }
    
    return null;
  }
  
  async set(key: string, value: any, ttl: number = 300): Promise<void> {
    // Store in both caches
    this.memoryCache.set(key, value);
    await this.redisClient.setex(key, ttl, JSON.stringify(value));
  }
  
  async invalidate(pattern: string): Promise<void> {
    // Clear memory cache
    for (const key of this.memoryCache.keys()) {
      if (key.includes(pattern)) {
        this.memoryCache.delete(key);
      }
    }
    
    // Clear Redis cache
    const keys = await this.redisClient.keys(`*${pattern}*`);
    if (keys.length > 0) {
      await this.redisClient.del(...keys);
    }
  }
}
```

## Testing Standards

### 1. Unit Testing Requirements
- **Coverage**: Minimum 80% code coverage
- **Test Structure**: Arrange-Act-Assert pattern
- **Mocking**: Proper isolation of dependencies

```typescript
// Example Unit Test
describe('ThreatIntelligenceService', () => {
  let service: ThreatIntelligenceService;
  let mockRepository: jest.Mocked<IThreatRepository>;
  let mockEventBus: jest.Mocked<IEventBus>;
  
  beforeEach(() => {
    mockRepository = createMockRepository();
    mockEventBus = createMockEventBus();
    service = new ThreatIntelligenceService(mockRepository, mockEventBus);
  });
  
  describe('createThreat', () => {
    it('should create threat and publish event', async () => {
      // Arrange
      const threatData = { name: 'Test Threat', severity: 'high' };
      const expectedThreat = { id: '1', ...threatData };
      mockRepository.create.mockResolvedValue(expectedThreat);
      
      // Act
      const result = await service.createThreat(threatData);
      
      // Assert
      expect(result).toEqual(expectedThreat);
      expect(mockRepository.create).toHaveBeenCalledWith(threatData);
      expect(mockEventBus.publish).toHaveBeenCalledWith('threat.created', expectedThreat);
    });
  });
});
```

### 2. Integration Testing Requirements
- **API Testing**: Test complete request-response cycles
- **Database Testing**: Test with real database instances
- **End-to-End Testing**: Test critical user journeys

## Monitoring & Observability

### 1. Logging Standards
```typescript
// Structured Logging
export class Logger {
  static info(message: string, metadata?: any): void {
    console.log(JSON.stringify({
      level: 'info',
      message,
      metadata,
      timestamp: new Date().toISOString(),
      service: 'phantom-spire'
    }));
  }
  
  static error(message: string, error?: Error, metadata?: any): void {
    console.error(JSON.stringify({
      level: 'error',
      message,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined,
      metadata,
      timestamp: new Date().toISOString(),
      service: 'phantom-spire'
    }));
  }
}
```

### 2. Metrics Collection
```typescript
// Performance Metrics
export class MetricsCollector {
  static recordApiCall(endpoint: string, duration: number, status: number): void {
    // Record API call metrics
    console.log(JSON.stringify({
      type: 'metric',
      name: 'api_call',
      endpoint,
      duration,
      status,
      timestamp: new Date().toISOString()
    }));
  }
  
  static recordDatabaseQuery(query: string, duration: number): void {
    // Record database query metrics
    console.log(JSON.stringify({
      type: 'metric',
      name: 'db_query',
      query: query.substring(0, 100), // Truncate for privacy
      duration,
      timestamp: new Date().toISOString()
    }));
  }
}
```

## Compliance Checklist

### Pre-Deployment Checklist

#### Code Quality Standards
- [ ] TypeScript strict mode enabled with zero errors
- [ ] ESLint rules passing with zero warnings
- [ ] Prettier formatting applied consistently
- [ ] Code coverage >= 80% for critical components
- [ ] All TODO/FIXME comments addressed or documented

#### Architecture Standards
- [ ] Components extend appropriate Base classes
- [ ] Standardized error handling implemented
- [ ] Input validation and sanitization complete
- [ ] Logging and monitoring configured
- [ ] Performance benchmarks met (sub-2s response times)

#### Security Standards
- [ ] Authentication/authorization implemented
- [ ] Input validation prevents injection attacks
- [ ] Sensitive data encrypted at rest and in transit
- [ ] OWASP Top 10 vulnerabilities addressed
- [ ] Dependency vulnerability scan passed

#### Documentation Standards
- [ ] API documentation updated (OpenAPI/Swagger)
- [ ] Component documentation complete
- [ ] Architecture decision records (ADRs) created
- [ ] Deployment guides updated
- [ ] User documentation reviewed

#### Testing Standards
- [ ] Unit tests >= 80% coverage
- [ ] Integration tests for all API endpoints
- [ ] End-to-end tests for critical user journeys
- [ ] Performance tests validate SLA requirements
- [ ] Security tests validate threat model

### Ongoing Compliance

#### Monthly Reviews
- [ ] Architecture health assessments
- [ ] Security posture reviews
- [ ] Performance metrics analysis
- [ ] Code quality metrics tracking
- [ ] Technical debt assessment

#### Quarterly Audits
- [ ] Comprehensive security audits
- [ ] Performance optimization reviews
- [ ] Dependency update and vulnerability assessment
- [ ] Documentation accuracy validation
- [ ] Compliance framework updates

#### Annual Assessments
- [ ] Technology stack evaluation
- [ ] Architecture evolution planning
- [ ] Security framework updates
- [ ] Performance baseline reassessment
- [ ] Governance process optimization

### Key Performance Indicators (KPIs)

#### Quality Metrics
- **Code Coverage**: Minimum 80%, Target 90%
- **Bug Density**: Maximum 1 critical bug per 1000 lines of code
- **Technical Debt Ratio**: Maximum 5% of development time
- **Documentation Coverage**: 100% for public APIs

#### Performance Metrics
- **API Response Time**: 95th percentile < 2 seconds
- **Page Load Time**: First Contentful Paint < 1 second
- **Availability**: 99.9% uptime SLA
- **Error Rate**: < 0.1% for critical operations

#### Security Metrics
- **Vulnerability Resolution**: Critical vulnerabilities fixed within 24 hours
- **Security Scan Coverage**: 100% of deployments scanned
- **Compliance Score**: 100% for security standards
- **Incident Response Time**: < 4 hours for security incidents

---

*This governance framework ensures that all architectural decisions and implementations align with enterprise-grade standards and maintain the platform's integrity, security, and performance.*