/**
 * Fortune 100-Grade Evidence Management System
 * Main export file for evidence management components
 */

// Core interfaces
export * from './interfaces/IEvidence.js';
export * from './interfaces/IEvidenceManager.js';

// Services
export { EvidenceManagementService } from './services/EvidenceManagementService.js';
export { EvidenceAnalyticsEngine } from './services/EvidenceAnalyticsEngine.js';

// Re-export commonly used types
export type {
  IEvidence,
  EvidenceType,
  EvidenceSourceType,
  ClassificationLevel,
  IChainOfCustodyEntry,
  CustodyAction,
  EvidenceRelationshipType
} from './interfaces/IEvidence.js';

export type {
  IEvidenceManager,
  IEvidenceContext,
  ICreateEvidenceRequest,
  IEvidenceQuery,
  IEvidenceSearchResult,
  IEvidenceMetrics
} from './interfaces/IEvidenceManager.js';