# Frontend-Backend Integration Documentation

## Overview

This document outlines the standardized integration patterns between the frontend React application and the backend services in the Phantom Spire platform.

## Integration Architecture

### API Layer Structure
```
Frontend (React) ↔ API Gateway ↔ Backend Services ↔ Data Layer
```

## API Integration Patterns

### 1. RESTful API Integration

#### Standard Request/Response Pattern
```typescript
// Frontend Service
export class ThreatIntelligenceService {
  private baseURL = '/api/v1/threat-intelligence';
  
  async getThreats(filters: ThreatFilters): Promise<ApiResponse<Threat[]>> {
    const response = await fetch(`${this.baseURL}/threats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`
      },
      body: JSON.stringify(filters)
    });
    
    return await response.json();
  }
  
  async createThreat(threat: CreateThreatRequest): Promise<ApiResponse<Threat>> {
    const response = await fetch(`${this.baseURL}/threats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`
      },
      body: JSON.stringify(threat)
    });
    
    return await response.json();
  }
}
```

#### Backend Controller Pattern
```typescript
// Backend Controller
export class ThreatIntelligenceController {
  constructor(private threatService: ThreatIntelligenceService) {}
  
  async getThreats(req: Request, res: Response): Promise<void> {
    try {
      const filters = this.validateFilters(req.body);
      const threats = await this.threatService.getThreats(filters);
      
      res.json({
        success: true,
        data: threats,
        metadata: {
          total: threats.length,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        code: 'THREAT_FETCH_ERROR'
      });
    }
  }
}
```

### 2. WebSocket Integration

#### Real-time Updates Pattern
```typescript
// Frontend WebSocket Client
export class RealtimeService {
  private ws: WebSocket | null = null;
  private listeners: Map<string, Function[]> = new Map();
  
  connect(): void {
    this.ws = new WebSocket(`ws://localhost:3000/ws`);
    
    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleMessage(message);
    };
  }
  
  subscribe(channel: string, callback: Function): void {
    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, []);
    }
    this.listeners.get(channel)!.push(callback);
    
    // Subscribe to channel
    this.send({
      type: 'subscribe',
      channel: channel
    });
  }
  
  private handleMessage(message: WebSocketMessage): void {
    const listeners = this.listeners.get(message.channel) || [];
    listeners.forEach(callback => callback(message.data));
  }
}
```

#### Backend WebSocket Handler
```typescript
// Backend WebSocket Handler
export class WebSocketHandler {
  private clients: Map<string, WebSocket> = new Map();
  
  handleConnection(ws: WebSocket, userId: string): void {
    this.clients.set(userId, ws);
    
    ws.on('message', (data) => {
      const message = JSON.parse(data.toString());
      this.handleMessage(userId, message);
    });
    
    ws.on('close', () => {
      this.clients.delete(userId);
    });
  }
  
  broadcast(channel: string, data: any): void {
    const message = {
      channel,
      data,
      timestamp: new Date().toISOString()
    };
    
    this.clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    });
  }
}
```

## Data Flow Patterns

### 1. Component Data Fetching
```typescript
// Frontend Component
export const ThreatDashboard: React.FC = () => {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const threatService = new ThreatIntelligenceService();
  
  useEffect(() => {
    const fetchThreats = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await threatService.getThreats({});
        if (response.success) {
          setThreats(response.data);
        } else {
          setError(response.error);
        }
      } catch (err) {
        setError('Failed to fetch threats');
      } finally {
        setLoading(false);
      }
    };
    
    fetchThreats();
  }, []);
  
  // Component render logic
};
```

### 2. Form Submission Pattern
```typescript
// Frontend Form Component
export const ThreatForm: React.FC<ThreatFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<CreateThreatRequest>({
    name: '',
    severity: 'medium',
    indicators: []
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await threatService.createThreat(formData);
      if (response.success) {
        onSubmit(response.data);
        // Reset form
        setFormData({ name: '', severity: 'medium', indicators: [] });
      } else {
        // Handle error
        console.error(response.error);
      }
    } catch (error) {
      console.error('Failed to create threat:', error);
    }
  };
  
  // Form render logic
};
```

## Error Handling Patterns

### 1. Standardized Error Responses
```typescript
// Standard API Error Response
interface ApiErrorResponse {
  success: false;
  error: string;
  code: string;
  details?: any;
  timestamp: string;
}

// Frontend Error Handler
export class ApiErrorHandler {
  static handle(error: ApiErrorResponse): void {
    switch (error.code) {
      case 'UNAUTHORIZED':
        // Redirect to login
        window.location.href = '/login';
        break;
      case 'VALIDATION_ERROR':
        // Show validation errors
        this.showValidationErrors(error.details);
        break;
      case 'SERVER_ERROR':
        // Show generic error message
        this.showErrorMessage('An unexpected error occurred');
        break;
      default:
        this.showErrorMessage(error.error);
    }
  }
}
```

### 2. Network Error Handling
```typescript
// Network Error Handler
export class NetworkErrorHandler {
  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: Error;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (i < maxRetries - 1) {
          await this.delay(Math.pow(2, i) * 1000); // Exponential backoff
        }
      }
    }
    
    throw lastError!;
  }
  
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

## Authentication & Authorization

### 1. JWT Token Management
```typescript
// Frontend Auth Service
export class AuthService {
  private static TOKEN_KEY = 'phantom_spire_token';
  
  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }
  
  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
  
  static removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }
  
  static isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  }
}
```

### 2. Protected Route Pattern
```typescript
// Frontend Protected Route Component
export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);
  
  if (!AuthService.isAuthenticated()) {
    return <div>Redirecting to login...</div>;
  }
  
  return <>{children}</>;
};
```

## State Management Integration

### 1. Global State Pattern
```typescript
// Frontend Global State
interface AppState {
  user: User | null;
  threats: Threat[];
  notifications: Notification[];
  loading: boolean;
}

export const useAppState = () => {
  const [state, setState] = useState<AppState>({
    user: null,
    threats: [],
    notifications: [],
    loading: false
  });
  
  const updateThreats = useCallback((threats: Threat[]) => {
    setState(prev => ({ ...prev, threats }));
  }, []);
  
  const addNotification = useCallback((notification: Notification) => {
    setState(prev => ({
      ...prev,
      notifications: [...prev.notifications, notification]
    }));
  }, []);
  
  return {
    state,
    updateThreats,
    addNotification
  };
};
```

### 2. Cache Management
```typescript
// Frontend Cache Service
export class CacheService {
  private static cache: Map<string, { data: any; expiry: number }> = new Map();
  
  static set(key: string, data: any, ttl: number = 300000): void { // 5 minutes default
    const expiry = Date.now() + ttl;
    this.cache.set(key, { data, expiry });
  }
  
  static get(key: string): any | null {
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }
  
  static invalidate(pattern: string): void {
    const keys = Array.from(this.cache.keys());
    keys.forEach(key => {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    });
  }
}
```

## Performance Optimization

### 1. Request Optimization
```typescript
// Frontend Request Debouncing
export const useDebouncedSearch = (
  searchFn: (query: string) => Promise<any[]>,
  delay: number = 300
) => {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      
      setLoading(true);
      try {
        const data = await searchFn(query);
        setResults(data);
      } finally {
        setLoading(false);
      }
    }, delay),
    [searchFn, delay]
  );
  
  return { results, loading, search: debouncedSearch };
};
```

### 2. Data Pagination
```typescript
// Frontend Pagination Hook
export const usePagination = <T>(
  fetchFn: (page: number, size: number) => Promise<PaginatedResponse<T>>,
  pageSize: number = 20
) => {
  const [data, setData] = useState<T[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const loadPage = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const response = await fetchFn(page, pageSize);
      setData(response.data);
      setTotalPages(response.totalPages);
      setCurrentPage(page);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, pageSize]);
  
  return {
    data,
    currentPage,
    totalPages,
    loading,
    loadPage,
    nextPage: () => currentPage < totalPages && loadPage(currentPage + 1),
    prevPage: () => currentPage > 1 && loadPage(currentPage - 1)
  };
};
```

## API Documentation Standards

### OpenAPI Specification
```yaml
# Example API Endpoint Documentation
/api/v1/threats:
  get:
    summary: Get threats
    parameters:
      - name: page
        in: query
        schema:
          type: integer
          default: 1
      - name: limit
        in: query
        schema:
          type: integer
          default: 20
      - name: severity
        in: query
        schema:
          type: string
          enum: [low, medium, high, critical]
    responses:
      200:
        description: Successful response
        content:
          application/json:
            schema:
              type: object
              properties:
                success:
                  type: boolean
                data:
                  type: array
                  items:
                    $ref: '#/components/schemas/Threat'
                metadata:
                  $ref: '#/components/schemas/PaginationMetadata'
```

## Testing Integration

### 1. Frontend API Testing
```typescript
// Frontend API Service Tests
describe('ThreatIntelligenceService', () => {
  let service: ThreatIntelligenceService;
  
  beforeEach(() => {
    service = new ThreatIntelligenceService();
    // Mock fetch
    global.fetch = jest.fn();
  });
  
  it('should fetch threats successfully', async () => {
    const mockResponse = {
      success: true,
      data: [{ id: '1', name: 'Test Threat' }]
    };
    
    (fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve(mockResponse)
    });
    
    const result = await service.getThreats({});
    
    expect(result).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledWith('/api/v1/threats', {
      method: 'GET',
      headers: expect.objectContaining({
        'Content-Type': 'application/json'
      })
    });
  });
});
```

### 2. Backend Integration Testing
```typescript
// Backend Integration Tests
describe('Threat Intelligence API', () => {
  let app: express.Application;
  
  beforeAll(async () => {
    app = await createTestApp();
  });
  
  it('should return threats', async () => {
    const response = await request(app)
      .get('/api/v1/threats')
      .set('Authorization', 'Bearer test-token')
      .expect(200);
      
    expect(response.body).toMatchObject({
      success: true,
      data: expect.any(Array),
      metadata: expect.objectContaining({
        total: expect.any(Number)
      })
    });
  });
});
```

---

*This integration documentation provides standardized patterns for frontend-backend communication in the Phantom Spire platform. All integration points should follow these patterns for consistency and maintainability.*