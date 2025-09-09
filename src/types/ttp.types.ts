/**
 * TTP (Tactics, Techniques, Procedures) Type Definitions
 * Based on MITRE ATT&CK Framework
 */

export interface TTPData {
  id: string;
  name: string;
  description?: string;
  mitreId?: string;
  category: string;
  status: 'active' | 'monitoring' | 'mitigated' | 'archived';
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence: number;
  tactics?: string[];
  techniques?: string[];
  procedures?: string[];
  actors?: string[];
  detectionCoverage?: number;
  lastSeen?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  metadata?: {
    platform?: string[];
    killchain?: string;
    references?: string[];
    mitigations?: string[];
    dataSource?: string;
    [key: string]: any;
  };
}

export interface TTPCreateInput {
  name: string;
  description?: string;
  mitreId?: string;
  status?: 'active' | 'monitoring' | 'mitigated' | 'archived';
  severity?: 'critical' | 'high' | 'medium' | 'low';
  confidence?: number;
  tactics?: string[];
  techniques?: string[];
  procedures?: string[];
  actors?: string[];
  detectionCoverage?: number;
  metadata?: {
    platform?: string[];
    killchain?: string;
    references?: string[];
    mitigations?: string[];
    dataSource?: string;
    [key: string]: any;
  };
}

export interface TTPUpdateInput {
  name?: string;
  description?: string;
  mitreId?: string;
  status?: 'active' | 'monitoring' | 'mitigated' | 'archived';
  severity?: 'critical' | 'high' | 'medium' | 'low';
  confidence?: number;
  tactics?: string[];
  techniques?: string[];
  procedures?: string[];
  actors?: string[];
  detectionCoverage?: number;
  metadata?: {
    platform?: string[];
    killchain?: string;
    references?: string[];
    mitigations?: string[];
    dataSource?: string;
    [key: string]: any;
  };
}

export interface TTPQueryOptions {
  page?: number;
  limit?: number;
  status?: string[];
  severity?: string[];
  tactics?: string[];
  techniques?: string[];
  actors?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface TTPAnalytics {
  totalCount: number;
  statusCounts: Record<string, number>;
  severityCounts: Record<string, number>;
  coverageStats: {
    avgDetectionCoverage: number;
    avgConfidence: number;
    topTactics: string[];
    topTechniques: string[];
  };
  recentActivity: any[];
}

export interface MITREAttackTactic {
  id: string;
  name: string;
  description: string;
  techniques: string[];
}

export interface MITREAttackTechnique {
  id: string;
  name: string;
  description: string;
  tactics: string[];
  platforms: string[];
  dataSources: string[];
  defenses: string[];
  subTechniques?: string[];
}

export interface TTPMapping {
  ttpId: string;
  mitreId: string;
  mappingType: 'exact' | 'partial' | 'related';
  confidence: number;
  notes?: string;
}