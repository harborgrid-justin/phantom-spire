/**
 * Fortune 100-Grade Evidence Management System
 * Main export file for evidence management components
 */

// Core interfaces
export * from './interfaces/IEvidence';
export * from './interfaces/IEvidenceManager';

// Services
export { EvidenceManagementService } from './services/EvidenceManagementService';
export { EvidenceAnalyticsEngine } from './services/EvidenceAnalyticsEngine';

// Re-export commonly used types
export type {
  IEvidence,
  EvidenceType,
  EvidenceSourceType,
  ClassificationLevel,
  IChainOfCustodyEntry,
  CustodyAction,
  EvidenceRelationshipType
} from './interfaces/IEvidence';

export type {
  IEvidenceManager,
  IEvidenceContext,
  ICreateEvidenceRequest,
  IEvidenceQuery,
  IEvidenceSearchResult,
  IEvidenceMetrics
} from './interfaces/IEvidenceManager';