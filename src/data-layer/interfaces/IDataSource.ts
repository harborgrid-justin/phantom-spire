/**
 * Core Data Layer Interfaces - Foundation for Palantir-like capabilities
 */

export interface IDataRecord {
  id: string;
  type: string;
  source: string;
  timestamp: Date;
  data: Record<string, any>;
  metadata?: Record<string, any>;
  relationships?: IRelationship[];
  provenance?: IProvenance;
}

export interface IRelationship {
  id: string;
  type: string;
  sourceId: string;
  targetId: string;
  weight?: number;
  confidence?: number;
  properties?: Record<string, any>;
  createdAt: Date;
}

export interface IProvenance {
  sourceSystem: string;
  sourceUrl?: string;
  collectedAt: Date;
  transformations: ITransformation[];
  quality: IDataQuality;
}

export interface ITransformation {
  name: string;
  version: string;
  appliedAt: Date;
  parameters?: Record<string, any>;
}

export interface IDataQuality {
  completeness: number; // 0-1
  accuracy: number; // 0-1
  consistency: number; // 0-1
  timeliness: number; // 0-1
  issues?: string[];
}

export interface IQueryContext {
  userId: string;
  permissions: string[];
  filters?: Record<string, any>;
  timeRange?: {
    start: Date;
    end: Date;
  };
}

export interface IDataSource {
  readonly name: string;
  readonly type: string;
  readonly capabilities: string[];

  connect(): Promise<void>;
  disconnect(): Promise<void>;
  query(query: IQuery, context: IQueryContext): Promise<IQueryResult>;
  stream(query: IQuery, context: IQueryContext): AsyncIterable<IDataRecord>;
  healthCheck(): Promise<IHealthStatus>;
}

export interface IQuery {
  type: 'select' | 'aggregate' | 'graph' | 'search';
  entity?: string;
  filters?: Record<string, any>;
  projection?: string[];
  sort?: Record<string, 1 | -1>;
  limit?: number;
  offset?: number;
  // Graph-specific
  traversal?: IGraphTraversal;
  // Full-text search
  searchTerm?: string;
  searchFields?: string[];
}

export interface IGraphTraversal {
  startNodes: string[];
  relationships?: string[];
  maxDepth?: number;
  direction?: 'incoming' | 'outgoing' | 'both';
  filters?: Record<string, any>;
}

export interface IQueryResult {
  data: IDataRecord[];
  metadata: {
    total: number;
    page?: number;
    hasMore: boolean;
    executionTime: number;
    source: string;
  };
  relationships?: IRelationship[];
  aggregations?: Record<string, any>;
}

export interface IHealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: Date;
  responseTime: number;
  message?: string;
  metrics?: Record<string, number>;
}
