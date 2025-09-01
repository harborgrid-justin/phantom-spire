/**
 * Graph Analysis and Relationship Interfaces
 */

import { IDataRecord, IRelationship } from './IDataSource.js';

export interface IGraphAnalyzer {
  readonly name: string;
  readonly algorithms: string[];
  
  findConnectedComponents(nodes: IGraphNode[], relationships: IRelationship[]): Promise<IConnectedComponent[]>;
  calculateCentrality(graph: IGraph, type: 'betweenness' | 'closeness' | 'degree' | 'eigenvector'): Promise<ICentralityResult>;
  detectCommunities(graph: IGraph, algorithm?: string): Promise<ICommunityResult>;
  findShortestPath(graph: IGraph, startId: string, endId: string): Promise<IPathResult>;
  analyzePatterns(graph: IGraph, patterns: IPattern[]): Promise<IPatternResult>;
  calculateSimilarity(node1: IGraphNode, node2: IGraphNode, method: 'jaccard' | 'cosine' | 'euclidean'): Promise<number>;
}

export interface IGraphNode {
  id: string;
  type: string;
  label: string;
  properties: Record<string, any>;
  relationships?: IRelationship[];
  metadata?: Record<string, any>;
}

export interface IGraph {
  nodes: IGraphNode[];
  relationships: IRelationship[];
  metadata?: {
    nodeCount: number;
    relationshipCount: number;
    density: number;
    diameter?: number;
    created: Date;
  };
}

export interface IConnectedComponent {
  id: string;
  nodes: string[];
  relationships: string[];
  size: number;
  density: number;
  properties?: Record<string, any>;
}

export interface ICentralityResult {
  algorithm: string;
  scores: Record<string, number>;
  topNodes: Array<{
    nodeId: string;
    score: number;
    rank: number;
  }>;
  statistics: {
    mean: number;
    median: number;
    std: number;
    min: number;
    max: number;
  };
}

export interface ICommunityResult {
  algorithm: string;
  communities: Array<{
    id: string;
    nodes: string[];
    modularity: number;
    size: number;
    properties?: Record<string, any>;
  }>;
  overallModularity: number;
  executionTime: number;
}

export interface IPathResult {
  path: string[];
  relationships: string[];
  distance: number;
  weight?: number;
  found: boolean;
}

export interface IPattern {
  name: string;
  type: 'structural' | 'temporal' | 'attribute';
  definition: Record<string, any>;
  parameters?: Record<string, any>;
}

export interface IPatternResult {
  pattern: IPattern;
  matches: Array<{
    nodes: string[];
    relationships: string[];
    confidence: number;
    properties?: Record<string, any>;
  }>;
  totalMatches: number;
  executionTime: number;
}

export interface IEntityResolver {
  readonly name: string;
  readonly strategies: string[];
  
  resolve(entities: IDataRecord[]): Promise<IResolutionResult>;
  deduplicate(entities: IDataRecord[]): Promise<IDeduplicationResult>;
  link(entity1: IDataRecord, entity2: IDataRecord): Promise<ILinkResult>;
  cluster(entities: IDataRecord[], threshold: number): Promise<IClusterResult>;
}

export interface IResolutionResult {
  resolvedEntities: Array<{
    canonical: IDataRecord;
    duplicates: IDataRecord[];
    confidence: number;
  }>;
  totalProcessed: number;
  totalResolved: number;
  executionTime: number;
}

export interface IDeduplicationResult {
  unique: IDataRecord[];
  duplicates: Array<{
    canonical: IDataRecord;
    duplicates: IDataRecord[];
    similarityScore: number;
  }>;
  totalProcessed: number;
  duplicatesFound: number;
  executionTime: number;
}

export interface ILinkResult {
  linked: boolean;
  confidence: number;
  reasons: string[];
  similarities: Record<string, number>;
}

export interface IClusterResult {
  clusters: Array<{
    id: string;
    members: IDataRecord[];
    centroid?: IDataRecord;
    cohesion: number;
  }>;
  outliers: IDataRecord[];
  totalClusters: number;
  silhouetteScore?: number;
  executionTime: number;
}