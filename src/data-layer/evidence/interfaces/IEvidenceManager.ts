/**
 * Evidence Management Service Interfaces
 * Fortune 100-grade service layer for evidence operations
 */

import { IEvidence, EvidenceType, EvidenceSourceType, ClassificationLevel, IRetentionPolicy } from './IEvidence';
import { IQueryContext, IDataRecord } from '../../interfaces/IDataSource';

export interface IEvidenceManager {
  // Core evidence operations
  createEvidence(evidence: ICreateEvidenceRequest, context: IEvidenceContext): Promise<IEvidence>;
  getEvidence(evidenceId: string, context: IEvidenceContext): Promise<IEvidence | null>;
  updateEvidence(evidenceId: string, updates: IUpdateEvidenceRequest, context: IEvidenceContext): Promise<IEvidence>;
  deleteEvidence(evidenceId: string, context: IEvidenceContext): Promise<void>;
  
  // Evidence search and query
  searchEvidence(query: IEvidenceQuery, context: IEvidenceContext): Promise<IEvidenceSearchResult>;
  findRelatedEvidence(evidenceId: string, context: IEvidenceContext): Promise<IEvidence[]>;
  
  // Chain of custody operations
  addCustodyEntry(evidenceId: string, entry: IAddCustodyEntryRequest, context: IEvidenceContext): Promise<void>;
  getCustodyChain(evidenceId: string, context: IEvidenceContext): Promise<IChainOfCustodyEntry[]>;
  verifyCustodyChain(evidenceId: string, context: IEvidenceContext): Promise<ICustodyVerificationResult>;
  
  // Evidence integrity
  verifyIntegrity(evidenceId: string, context: IEvidenceContext): Promise<IIntegrityVerificationResult>;
  recalculateHash(evidenceId: string, context: IEvidenceContext): Promise<string>;
  
  // Evidence relationships
  addRelationship(sourceId: string, targetId: string, relationship: IAddRelationshipRequest, context: IEvidenceContext): Promise<void>;
  removeRelationship(relationshipId: string, context: IEvidenceContext): Promise<void>;
  
  // Bulk operations
  bulkCreateEvidence(evidenceList: ICreateEvidenceRequest[], context: IEvidenceContext): Promise<IBulkOperationResult>;
  bulkUpdateEvidence(updates: IBulkUpdateRequest[], context: IEvidenceContext): Promise<IBulkOperationResult>;
  
  // Analytics and reporting
  generateEvidenceReport(query: IEvidenceReportQuery, context: IEvidenceContext): Promise<IEvidenceReport>;
  getEvidenceMetrics(timeRange?: ITimeRange): Promise<IEvidenceMetrics>;
}

export interface IEvidenceContext {
  userId: string;
  userRole: string;
  permissions: string[];
  classification: ClassificationLevel;
  sessionId: string;
  ipAddress: string;
  userAgent?: string;
}

export interface ICreateEvidenceRequest {
  type: EvidenceType;
  sourceType: EvidenceSourceType;
  sourceId: string;
  sourceSystem: string;
  data: Record<string, any>;
  metadata: {
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
    format: string;
    customFields?: Record<string, any>;
    collectionTaskId?: string;
    incidentId?: string;
  };
  classification: ClassificationLevel;
  tags?: string[];
  handling?: Array<{
    type: 'retention' | 'sharing' | 'processing' | 'access';
    instruction: string;
    expiresAt?: Date;
    authority: string;
  }>;
  retentionPolicy?: {
    retainUntil: Date;
    purgeAfter: Date;
    archiveAfter?: Date;
    legalHold?: boolean;
    compliance?: string[];
  };
}

export interface IUpdateEvidenceRequest {
  metadata?: Partial<{
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
    customFields: Record<string, any>;
  }>;
  classification?: ClassificationLevel;
  tags?: string[];
  handling?: Array<{
    type: 'retention' | 'sharing' | 'processing' | 'access';
    instruction: string;
    expiresAt?: Date;
    authority: string;
  }>;
  retentionPolicy?: IRetentionPolicy;
}

export interface IEvidenceQuery {
  types?: EvidenceType[];
  sourceTypes?: EvidenceSourceType[];
  classifications?: ClassificationLevel[];
  tags?: string[];
  text?: string;
  severities?: Array<'low' | 'medium' | 'high' | 'critical'>;
  confidenceRange?: { min: number; max: number };
  dateRange?: ITimeRange;
  sourceSystem?: string;
  createdBy?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface ITimeRange {
  start: Date;
  end: Date;
}

export interface IEvidenceSearchResult {
  evidence: IEvidence[];
  totalCount: number;
  hasMore: boolean;
  facets: ISearchFacets;
}

export interface ISearchFacets {
  types: Array<{ value: EvidenceType; count: number }>;
  sourceTypes: Array<{ value: EvidenceSourceType; count: number }>;
  classifications: Array<{ value: ClassificationLevel; count: number }>;
  severities: Array<{ value: string; count: number }>;
  tags: Array<{ value: string; count: number }>;
  sourceSystems: Array<{ value: string; count: number }>;
}

export interface IAddCustodyEntryRequest {
  action: string;
  details: string;
  location: string;
  signature?: string;
}

export interface IChainOfCustodyEntry {
  id: string;
  timestamp: Date;
  actor: string;
  actorType: 'human' | 'system' | 'service';
  action: string;
  details: string;
  location: string;
  signature?: string;
  previousHash?: string;
  currentHash: string;
}

export interface ICustodyVerificationResult {
  isValid: boolean;
  chainLength: number;
  issues: Array<{
    entryId: string;
    issue: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  verificationTimestamp: Date;
}

export interface IIntegrityVerificationResult {
  isValid: boolean;
  currentHash: string;
  expectedHash: string;
  algorithm: string;
  verificationTimestamp: Date;
  digitalSignatureValid?: boolean;
}

export interface IAddRelationshipRequest {
  relationshipType: string;
  confidence: number;
  description: string;
  evidence: string[];
}

export interface IBulkOperationResult {
  successful: number;
  failed: number;
  errors: Array<{
    index: number;
    error: string;
    code?: string;
  }>;
}

export interface IBulkUpdateRequest {
  evidenceId: string;
  updates: IUpdateEvidenceRequest;
}

export interface IEvidenceReportQuery {
  title: string;
  filters: IEvidenceQuery;
  includeChainOfCustody?: boolean;
  includeRelationships?: boolean;
  includeMetrics?: boolean;
  format: 'json' | 'pdf' | 'csv' | 'xml';
}

export interface IEvidenceReport {
  title: string;
  generatedAt: Date;
  generatedBy: string;
  filters: IEvidenceQuery;
  evidence: IEvidence[];
  metrics: IEvidenceMetrics;
  summary: {
    totalEvidence: number;
    byType: Record<string, number>;
    byClassification: Record<string, number>;
    bySeverity: Record<string, number>;
  };
}

export interface IEvidenceMetrics {
  totalEvidence: number;
  evidenceByType: Record<EvidenceType, number>;
  evidenceByClassification: Record<ClassificationLevel, number>;
  evidenceBySourceType: Record<EvidenceSourceType, number>;
  evidenceBySeverity: Record<string, number>;
  averageConfidence: number;
  qualityMetrics: {
    averageCompleteness: number;
    averageAccuracy: number;
    averageConsistency: number;
    averageTimeliness: number;
    averageReliability: number;
  };
  custodyMetrics: {
    averageChainLength: number;
    integrityViolations: number;
    custodyTransfers: number;
  };
  timeRange?: ITimeRange;
}