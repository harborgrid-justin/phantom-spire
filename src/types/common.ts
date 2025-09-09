/**
 * Standardized Type Definitions for Phantom Spire Platform
 * This file contains common types used across frontend components
 */

// Common status types
export type Status = 'active' | 'pending' | 'completed' | 'archived';
export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type Severity = 'low' | 'medium' | 'high' | 'critical';

// Base interfaces for common data structures
export interface BaseMetadata {
  category: string;
  tags: string[];
  priority: Priority;
}

export interface BaseEntity {
  id: string;
  title: string;
  description: string;
  status: Status;
  createdAt: string;
  updatedAt: string;
  metadata?: BaseMetadata;
}

// Form data interface for components
export interface StandardFormData {
  title: string;
  description: string;
  status: Status;
  metadata: BaseMetadata;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Error types
export interface ApiError {
  message: string;
  code: string;
  details?: any;
}

// Component props interfaces
export interface BaseComponentProps<T> {
  data: T[];
  loading?: boolean;
  error?: string | null;
  onEdit?: (item: T) => void;
  onDelete?: (id: string) => void;
  onCreate?: () => void;
  onRefresh?: () => void;
}

// Hook return types
export interface UseDataTableReturn<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  filters: any;
  updateFilters: (filters: any) => void;
  setCurrentPage: (page: number) => void;
  refresh: () => void;
}

// Authentication types
export interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
  permissions: string[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

// Notification types
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

// Theme and UI types
export interface ThemeConfig {
  mode: 'light' | 'dark';
  primaryColor: string;
  secondaryColor: string;
}

// Data Grid types (for MUI DataGrid compatibility)
export interface GridColumn {
  field: string;
  headerName: string;
  width?: number;
  sortable?: boolean;
  filterable?: boolean;
  renderCell?: (params: any) => React.ReactNode;
}

export interface GridPaginationModel {
  page: number;
  pageSize: number;
}

// Specific entity types based on the platform modules

// Advanced Analytics
export interface AnalyticsData extends BaseEntity {
  metrics?: any;
  charts?: any;
  filters?: any;
}

// Business Intelligence
export interface BusinessIntelligenceData extends BaseEntity {
  kpis?: any;
  reports?: any;
  dashboards?: any;
}

// Compliance & Audit
export interface ComplianceData extends BaseEntity {
  framework?: string;
  controls?: any;
  assessments?: any;
}

// Digital Forensics
export interface ForensicsData extends BaseEntity {
  evidence?: any;
  analysis?: any;
  findings?: any;
}

// Network Management
export interface NetworkData extends BaseEntity {
  devices?: any;
  topology?: any;
  monitoring?: any;
}

// Operational Efficiency
export interface OperationalData extends BaseEntity {
  processes?: any;
  metrics?: any;
  optimization?: any;
}

// Security Intelligence
export interface SecurityData extends BaseEntity {
  threats?: any;
  indicators?: any;
  analysis?: any;
}

// Workflow Management
export interface WorkflowData extends BaseEntity {
  steps?: any;
  conditions?: any;
  automation?: any;
}

// Event and WebSocket types
export interface WebSocketMessage {
  type: string;
  channel: string;
  data: any;
  timestamp: string;
}

export interface EventPayload {
  eventType: string;
  entityType: string;
  entityId: string;
  data: any;
  timestamp: string;
  userId?: string;
}

// Configuration types
export interface AppConfig {
  apiBaseUrl: string;
  wsBaseUrl: string;
  enableRealtime: boolean;
  cacheTimeout: number;
  pageSize: number;
  theme: ThemeConfig;
}

// Query and filter types
export interface QueryFilters {
  search?: string;
  status?: Status;
  priority?: Priority;
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
  category?: string;
  [key: string]: any;
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Export commonly used type guards
export const isValidStatus = (status: string): status is Status => {
  return ['active', 'pending', 'completed', 'archived'].includes(status);
};

export const isValidPriority = (priority: string): priority is Priority => {
  return ['low', 'medium', 'high', 'critical'].includes(priority);
};

export const isValidSeverity = (severity: string): severity is Severity => {
  return ['low', 'medium', 'high', 'critical'].includes(severity);
};

// Default values for common objects
export const defaultMetadata: BaseMetadata = {
  category: 'general',
  tags: [],
  priority: 'medium'
};

export const defaultFormData: StandardFormData = {
  title: '',
  description: '',
  status: 'active',
  metadata: defaultMetadata
};

// Utility functions for working with types
export const createFormData = (overrides: Partial<StandardFormData> = {}): StandardFormData => {
  return {
    ...defaultFormData,
    ...overrides,
    metadata: {
      ...defaultMetadata,
      ...overrides.metadata
    }
  };
};

export const createApiResponse = <T>(
  data: T,
  success: boolean = true,
  error?: string
): ApiResponse<T> => {
  return {
    success,
    data: success ? data : undefined,
    error: error,
    timestamp: new Date().toISOString()
  };
};