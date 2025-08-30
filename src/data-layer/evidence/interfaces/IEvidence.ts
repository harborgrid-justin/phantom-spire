/**
 * Fortune 100-Grade Evidence Management Interfaces
 * Core interfaces for enterprise-grade evidence tracking and chain of custody
 */

export interface IEvidence {
  id: string;
  type: EvidenceType;
  sourceType: EvidenceSourceType;
  sourceId: string;
  sourceSystem: string;
  
  // Evidence content and metadata
  data: Record<string, any>;
  metadata: IEvidenceMetadata;
  
  // Chain of custody
  chainOfCustody: IChainOfCustodyEntry[];
  provenance: IEvidenceProvenance;
  
  // Classification and handling
  classification: ClassificationLevel;
  handling: HandlingInstruction[];
  retentionPolicy: IRetentionPolicy;
  
  // Integrity and validation
  integrity: IIntegrityCheck;
  validation: IEvidenceValidation;
  
  // Relationships
  relationships: IEvidenceRelationship[];
  tags: string[];
  
  // Audit trail
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy: string;
  version: number;
}

export enum EvidenceType {
  IOC_EVIDENCE = 'ioc_evidence',
  THREAT_INTELLIGENCE = 'threat_intelligence',
  NETWORK_TRAFFIC = 'network_traffic',
  MALWARE_SAMPLE = 'malware_sample',
  FORENSIC_ARTIFACT = 'forensic_artifact',
  ATTACK_PATTERN = 'attack_pattern',
  VULNERABILITY = 'vulnerability',
  CAMPAIGN_EVIDENCE = 'campaign_evidence',
  ATTRIBUTION_EVIDENCE = 'attribution_evidence',
  CORRELATION_EVIDENCE = 'correlation_evidence'
}

export enum EvidenceSourceType {
  HUMAN_ANALYSIS = 'human_analysis',
  AUTOMATED_ANALYSIS = 'automated_analysis',
  THREAT_FEED = 'threat_feed',
  SENSOR_DATA = 'sensor_data',
  THIRD_PARTY_INTEL = 'third_party_intel',
  INTERNAL_DETECTION = 'internal_detection',
  EXTERNAL_REPORT = 'external_report',
  HONEYPOT = 'honeypot',
  SANDBOX = 'sandbox',
  OSINT = 'osint'
}

export enum ClassificationLevel {
  UNCLASSIFIED = 'unclassified',
  CONFIDENTIAL = 'confidential',
  SECRET = 'secret',
  TOP_SECRET = 'top_secret',
  TLP_WHITE = 'tlp_white',
  TLP_GREEN = 'tlp_green',
  TLP_AMBER = 'tlp_amber',
  TLP_RED = 'tlp_red'
}

export interface IEvidenceMetadata {
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-100
  quality: IDataQuality;
  format: string;
  size: number;
  checksum: string;
  encryptionStatus: 'encrypted' | 'unencrypted';
  customFields: Record<string, any>;
}

export interface IChainOfCustodyEntry {
  id: string;
  timestamp: Date;
  actor: string;
  actorType: 'human' | 'system' | 'service';
  action: CustodyAction;
  details: string;
  location: string;
  signature?: string;
  previousHash?: string;
  currentHash: string;
}

export enum CustodyAction {
  CREATED = 'created',
  COLLECTED = 'collected',
  TRANSFERRED = 'transferred',
  ANALYZED = 'analyzed',
  ENRICHED = 'enriched',
  VALIDATED = 'validated',
  TAGGED = 'tagged',
  CLASSIFIED = 'classified',
  ARCHIVED = 'archived',
  EXPORTED = 'exported',
  DELETED = 'deleted',
  RESTORED = 'restored'
}

export interface IEvidenceProvenance {
  originalSource: string;
  collectionMethod: string;
  collectionTimestamp: Date;
  collector: string;
  sourceTrustworthiness: number; // 0-100
  processingHistory: IProcessingStep[];
  dataLineage: IDataLineage[];
}

export interface IProcessingStep {
  stepId: string;
  processor: string;
  processorType: 'human' | 'automated';
  timestamp: Date;
  operation: string;
  parameters: Record<string, any>;
  inputHash: string;
  outputHash: string;
}

export interface IDataLineage {
  sourceId: string;
  sourceType: string;
  relationship: 'derived_from' | 'aggregated_from' | 'enriched_by' | 'validated_by';
  timestamp: Date;
}

export interface HandlingInstruction {
  type: 'retention' | 'sharing' | 'processing' | 'access';
  instruction: string;
  expiresAt?: Date;
  authority: string;
}

export interface IRetentionPolicy {
  retainUntil: Date;
  purgeAfter: Date;
  archiveAfter?: Date;
  legalHold: boolean;
  compliance: string[];
}

export interface IIntegrityCheck {
  algorithm: 'sha256' | 'sha512' | 'md5';
  hash: string;
  lastVerified: Date;
  isValid: boolean;
  digitalSignature?: string;
  signatureValid?: boolean;
}

export interface IEvidenceValidation {
  isValid: boolean;
  validatedAt: Date;
  validatedBy: string;
  validationMethod: string;
  issues: IValidationIssue[];
  score: number; // 0-100
}

export interface IValidationIssue {
  type: 'error' | 'warning' | 'info';
  code: string;
  message: string;
  field?: string;
  severity: 'low' | 'medium' | 'high';
}

export interface IEvidenceRelationship {
  id: string;
  targetEvidenceId: string;
  relationshipType: EvidenceRelationshipType;
  confidence: number; // 0-100
  description: string;
  evidence: string[];
  createdAt: Date;
  createdBy: string;
}

export enum EvidenceRelationshipType {
  SUPPORTS = 'supports',
  CONTRADICTS = 'contradicts',
  CORRELATES_WITH = 'correlates_with',
  DERIVED_FROM = 'derived_from',
  PART_OF = 'part_of',
  SIMILAR_TO = 'similar_to',
  PRECEDES = 'precedes',
  FOLLOWS = 'follows',
  ATTRIBUTED_TO = 'attributed_to',
  VALIDATES = 'validates'
}

export interface IDataQuality {
  completeness: number; // 0-1
  accuracy: number; // 0-1
  consistency: number; // 0-1
  timeliness: number; // 0-1
  reliability: number; // 0-1
}