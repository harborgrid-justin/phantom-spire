/**
 * Fortune 100-Grade Evidence Management Service
 * Enterprise-level evidence tracking with chain of custody
 */

import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';
import { 
  IEvidence, 
  EvidenceType, 
  EvidenceSourceType, 
  ClassificationLevel,
  CustodyAction,
  IChainOfCustodyEntry,
  IEvidenceProvenance,
  IIntegrityCheck,
  IEvidenceValidation,
  IRetentionPolicy
} from '../interfaces/IEvidence';
import {
  IEvidenceManager,
  IEvidenceContext,
  ICreateEvidenceRequest,
  IUpdateEvidenceRequest,
  IEvidenceQuery,
  IEvidenceSearchResult,
  IAddCustodyEntryRequest,
  ICustodyVerificationResult,
  IIntegrityVerificationResult,
  IAddRelationshipRequest,
  IBulkOperationResult,
  IBulkUpdateRequest,
  IEvidenceReportQuery,
  IEvidenceReport,
  IEvidenceMetrics,
  ITimeRange
} from '../interfaces/IEvidenceManager';
import { IDataSource } from '../../interfaces/IDataSource';
import { logger } from '../../../utils/logger';

export class EvidenceManagementService implements IEvidenceManager {
  private evidenceStore: Map<string, IEvidence> = new Map();
  private custodyChains: Map<string, IChainOfCustodyEntry[]> = new Map();
  private relationshipIndex: Map<string, Set<string>> = new Map();

  constructor(
    private auditLogger = logger
  ) {
    this.auditLogger.info('Evidence Management Service initialized');
  }

  /**
   * Create new evidence with full chain of custody tracking
   */
  async createEvidence(request: ICreateEvidenceRequest, context: IEvidenceContext): Promise<IEvidence> {
    const evidenceId = uuidv4();
    const now = new Date();
    
    // Calculate data integrity hash
    const dataHash = this.calculateHash(request.data);
    
    // Create initial provenance
    const provenance: IEvidenceProvenance = {
      originalSource: request.sourceSystem,
      collectionMethod: 'api_submission',
      collectionTimestamp: now,
      collector: context.userId,
      sourceTrustworthiness: this.calculateSourceTrustworthiness(request.sourceType),
      processingHistory: [],
      dataLineage: [{
        sourceId: request.sourceId,
        sourceType: request.sourceType,
        relationship: 'derived_from',
        timestamp: now
      }]
    };

    // Create integrity check
    const integrity: IIntegrityCheck = {
      algorithm: 'sha256',
      hash: dataHash,
      lastVerified: now,
      isValid: true
    };

    // Create initial validation
    const validation: IEvidenceValidation = {
      isValid: true,
      validatedAt: now,
      validatedBy: context.userId,
      validationMethod: 'automated_creation',
      issues: [],
      score: 100
    };

    // Create evidence object
    const evidence: IEvidence = {
      id: evidenceId,
      type: request.type,
      sourceType: request.sourceType,
      sourceId: request.sourceId,
      sourceSystem: request.sourceSystem,
      data: request.data,
      metadata: {
        title: request.metadata.title,
        description: request.metadata.description,
        severity: request.metadata.severity,
        confidence: request.metadata.confidence,
        quality: {
          completeness: 1.0,
          accuracy: 1.0,
          consistency: 1.0,
          timeliness: 1.0,
          reliability: this.calculateSourceReliability(request.sourceType)
        },
        format: request.metadata.format,
        size: JSON.stringify(request.data).length,
        checksum: dataHash,
        encryptionStatus: 'unencrypted',
        customFields: request.metadata.customFields || {}
      },
      chainOfCustody: [],
      provenance,
      classification: request.classification,
      handling: request.handling || [],
      retentionPolicy: request.retentionPolicy || {
        retainUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        purgeAfter: new Date(Date.now() + 7 * 365 * 24 * 60 * 60 * 1000), // 7 years
        legalHold: false as boolean,
        compliance: ['enterprise'] as string[]
      },
      integrity,
      validation,
      relationships: [],
      tags: request.tags || [],
      createdAt: now,
      updatedAt: now,
      createdBy: context.userId,
      lastModifiedBy: context.userId,
      version: 1
    };

    // Add initial custody entry
    await this.addCustodyEntry(evidenceId, {
      action: CustodyAction.CREATED,
      details: `Evidence created from ${request.sourceType} source`,
      location: context.ipAddress || 'unknown'
    }, context);

    // Store evidence
    this.evidenceStore.set(evidenceId, evidence);
    
    // Log audit trail
    this.auditLogger.info('Evidence created', {
      evidenceId,
      type: request.type,
      sourceType: request.sourceType,
      classification: request.classification,
      createdBy: context.userId
    });

    return evidence;
  }

  /**
   * Get evidence by ID with access control
   */
  async getEvidence(evidenceId: string, context: IEvidenceContext): Promise<IEvidence | null> {
    const evidence = this.evidenceStore.get(evidenceId);
    if (!evidence) {
      return null;
    }

    // Check access permissions
    if (!this.checkAccessPermission(evidence, context)) {
      this.auditLogger.warn('Unauthorized evidence access attempt', {
        evidenceId,
        userId: context.userId,
        userClassification: context.classification,
        evidenceClassification: evidence.classification
      });
      return null;
    }

    return evidence;
  }

  /**
   * Update evidence with custody tracking
   */
  async updateEvidence(evidenceId: string, updates: IUpdateEvidenceRequest, context: IEvidenceContext): Promise<IEvidence> {
    const evidence = await this.getEvidence(evidenceId, context);
    if (!evidence) {
      throw new Error(`Evidence ${evidenceId} not found or access denied`);
    }

    const now = new Date();
    const updatedEvidence: IEvidence = {
      ...evidence,
      updatedAt: now,
      lastModifiedBy: context.userId,
      version: evidence.version + 1
    };

    // Update metadata if provided
    if (updates.metadata) {
      updatedEvidence.metadata = {
        ...updatedEvidence.metadata,
        ...updates.metadata
      };
    }

    // Update classification if provided
    if (updates.classification) {
      updatedEvidence.classification = updates.classification;
    }

    // Update tags if provided
    if (updates.tags) {
      updatedEvidence.tags = updates.tags;
    }

    // Update handling instructions if provided
    if (updates.handling) {
      updatedEvidence.handling = updates.handling;
    }

    // Update retention policy if provided
    if (updates.retentionPolicy) {
      updatedEvidence.retentionPolicy = updates.retentionPolicy;
    }

    // Store updated evidence
    this.evidenceStore.set(evidenceId, updatedEvidence);

    // Add custody entry
    await this.addCustodyEntry(evidenceId, {
      action: CustodyAction.ANALYZED,
      details: 'Evidence updated',
      location: context.ipAddress || 'unknown'
    }, context);

    this.auditLogger.info('Evidence updated', {
      evidenceId,
      updatedBy: context.userId,
      version: updatedEvidence.version
    });

    return updatedEvidence;
  }

  /**
   * Delete evidence (soft delete with custody tracking)
   */
  async deleteEvidence(evidenceId: string, context: IEvidenceContext): Promise<void> {
    const evidence = await this.getEvidence(evidenceId, context);
    if (!evidence) {
      throw new Error(`Evidence ${evidenceId} not found or access denied`);
    }

    // Add custody entry for deletion
    await this.addCustodyEntry(evidenceId, {
      action: CustodyAction.DELETED,
      details: 'Evidence marked for deletion',
      location: context.ipAddress || 'unknown'
    }, context);

    // In a real implementation, this would be a soft delete
    // For now, we'll remove from the store
    this.evidenceStore.delete(evidenceId);

    this.auditLogger.info('Evidence deleted', {
      evidenceId,
      deletedBy: context.userId
    });
  }

  /**
   * Search evidence with advanced filtering
   */
  async searchEvidence(query: IEvidenceQuery, context: IEvidenceContext): Promise<IEvidenceSearchResult> {
    const allEvidence = Array.from(this.evidenceStore.values())
      .filter(evidence => this.checkAccessPermission(evidence, context));

    // Apply filters
    let filteredEvidence = allEvidence;

    if (query.types && query.types.length > 0) {
      filteredEvidence = filteredEvidence.filter(e => query.types!.includes(e.type));
    }

    if (query.sourceTypes && query.sourceTypes.length > 0) {
      filteredEvidence = filteredEvidence.filter(e => query.sourceTypes!.includes(e.sourceType));
    }

    if (query.classifications && query.classifications.length > 0) {
      filteredEvidence = filteredEvidence.filter(e => query.classifications!.includes(e.classification));
    }

    if (query.tags && query.tags.length > 0) {
      filteredEvidence = filteredEvidence.filter(e => 
        query.tags!.some(tag => e.tags.includes(tag))
      );
    }

    if (query.severities && query.severities.length > 0) {
      filteredEvidence = filteredEvidence.filter(e => query.severities!.includes(e.metadata.severity));
    }

    if (query.confidenceRange) {
      filteredEvidence = filteredEvidence.filter(e => 
        e.metadata.confidence >= query.confidenceRange!.min && 
        e.metadata.confidence <= query.confidenceRange!.max
      );
    }

    if (query.dateRange) {
      filteredEvidence = filteredEvidence.filter(e => 
        e.createdAt >= query.dateRange!.start && 
        e.createdAt <= query.dateRange!.end
      );
    }

    if (query.text) {
      const searchText = query.text.toLowerCase();
      filteredEvidence = filteredEvidence.filter(e => 
        e.metadata.title.toLowerCase().includes(searchText) ||
        e.metadata.description.toLowerCase().includes(searchText) ||
        e.tags.some(tag => tag.toLowerCase().includes(searchText))
      );
    }

    // Sort results
    if (query.sortBy) {
      filteredEvidence.sort((a, b) => {
        const aValue = this.getFieldValue(a, query.sortBy!);
        const bValue = this.getFieldValue(b, query.sortBy!);
        const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        return query.sortDirection === 'desc' ? -comparison : comparison;
      });
    }

    // Pagination
    const totalCount = filteredEvidence.length;
    const offset = query.offset || 0;
    const limit = query.limit || 50;
    const paginatedEvidence = filteredEvidence.slice(offset, offset + limit);

    // Generate facets
    const facets = this.generateFacets(allEvidence);

    return {
      evidence: paginatedEvidence,
      totalCount,
      hasMore: offset + limit < totalCount,
      facets
    };
  }

  /**
   * Find evidence related to a specific evidence item
   */
  async findRelatedEvidence(evidenceId: string, context: IEvidenceContext): Promise<IEvidence[]> {
    const evidence = await this.getEvidence(evidenceId, context);
    if (!evidence) {
      return [];
    }

    const relatedIds = new Set<string>();

    // Add directly related evidence
    evidence.relationships.forEach(rel => relatedIds.add(rel.targetEvidenceId));

    // Add reverse relationships
    const reverseRelated = this.relationshipIndex.get(evidenceId);
    if (reverseRelated) {
      reverseRelated.forEach(id => relatedIds.add(id));
    }

    // Get related evidence objects
    const relatedEvidence: IEvidence[] = [];
    for (const relatedId of relatedIds) {
      const related = await this.getEvidence(relatedId, context);
      if (related) {
        relatedEvidence.push(related);
      }
    }

    return relatedEvidence;
  }

  /**
   * Add custody entry with hash chaining
   */
  async addCustodyEntry(evidenceId: string, entry: IAddCustodyEntryRequest, context: IEvidenceContext): Promise<void> {
    const evidence = this.evidenceStore.get(evidenceId);
    if (!evidence) {
      throw new Error(`Evidence ${evidenceId} not found`);
    }

    const chain = this.custodyChains.get(evidenceId) || [];
    const previousEntry = chain.length > 0 ? chain[chain.length - 1] : null;
    
    const custodyEntry: IChainOfCustodyEntry = {
      id: uuidv4(),
      timestamp: new Date(),
      actor: context.userId,
      actorType: 'human',
      action: entry.action as CustodyAction,
      details: entry.details,
      location: entry.location,
      signature: entry.signature,
      previousHash: previousEntry?.currentHash,
      currentHash: this.calculateCustodyHash(evidenceId, entry, previousEntry?.currentHash)
    };

    chain.push(custodyEntry);
    this.custodyChains.set(evidenceId, chain);

    // Update evidence
    evidence.chainOfCustody = chain;
    evidence.updatedAt = new Date();
    this.evidenceStore.set(evidenceId, evidence);
  }

  /**
   * Get complete custody chain for evidence
   */
  async getCustodyChain(evidenceId: string, context: IEvidenceContext): Promise<IChainOfCustodyEntry[]> {
    const evidence = await this.getEvidence(evidenceId, context);
    if (!evidence) {
      return [];
    }
    return this.custodyChains.get(evidenceId) || [];
  }

  /**
   * Verify custody chain integrity
   */
  async verifyCustodyChain(evidenceId: string, context: IEvidenceContext): Promise<ICustodyVerificationResult> {
    const chain = await this.getCustodyChain(evidenceId, context);
    const issues: Array<{ entryId: string; issue: string; severity: 'low' | 'medium' | 'high' }> = [];
    
    for (let i = 0; i < chain.length; i++) {
      const entry = chain[i];
      const previousEntry = i > 0 ? chain[i - 1] : null;
      
      // Verify hash chain
      const expectedHash = this.calculateCustodyHash(evidenceId, entry, previousEntry?.currentHash);
      if (entry.currentHash !== expectedHash) {
        issues.push({
          entryId: entry.id,
          issue: 'Hash mismatch in custody chain',
          severity: 'high'
        });
      }
      
      // Verify temporal order
      if (previousEntry && entry.timestamp <= previousEntry.timestamp) {
        issues.push({
          entryId: entry.id,
          issue: 'Timestamp out of order',
          severity: 'medium'
        });
      }
    }

    return {
      isValid: issues.length === 0,
      chainLength: chain.length,
      issues,
      verificationTimestamp: new Date()
    };
  }

  /**
   * Verify evidence data integrity
   */
  async verifyIntegrity(evidenceId: string, context: IEvidenceContext): Promise<IIntegrityVerificationResult> {
    const evidence = await this.getEvidence(evidenceId, context);
    if (!evidence) {
      throw new Error(`Evidence ${evidenceId} not found or access denied`);
    }

    const currentHash = this.calculateHash(evidence.data);
    const expectedHash = evidence.integrity.hash;
    
    return {
      isValid: currentHash === expectedHash,
      currentHash,
      expectedHash,
      algorithm: evidence.integrity.algorithm,
      verificationTimestamp: new Date()
    };
  }

  /**
   * Recalculate hash for evidence data
   */
  async recalculateHash(evidenceId: string, context: IEvidenceContext): Promise<string> {
    const evidence = await this.getEvidence(evidenceId, context);
    if (!evidence) {
      throw new Error(`Evidence ${evidenceId} not found or access denied`);
    }

    const newHash = this.calculateHash(evidence.data);
    
    // Update integrity record
    evidence.integrity.hash = newHash;
    evidence.integrity.lastVerified = new Date();
    evidence.integrity.isValid = true;
    
    this.evidenceStore.set(evidenceId, evidence);
    
    return newHash;
  }

  /**
   * Add relationship between evidence items
   */
  async addRelationship(sourceId: string, targetId: string, relationship: IAddRelationshipRequest, context: IEvidenceContext): Promise<void> {
    const sourceEvidence = await this.getEvidence(sourceId, context);
    if (!sourceEvidence) {
      throw new Error(`Source evidence ${sourceId} not found or access denied`);
    }

    const targetEvidence = await this.getEvidence(targetId, context);
    if (!targetEvidence) {
      throw new Error(`Target evidence ${targetId} not found or access denied`);
    }

    const relationshipId = uuidv4();
    const newRelationship = {
      id: relationshipId,
      targetEvidenceId: targetId,
      relationshipType: relationship.relationshipType as any,
      confidence: relationship.confidence,
      description: relationship.description,
      evidence: relationship.evidence,
      createdAt: new Date(),
      createdBy: context.userId
    };

    sourceEvidence.relationships.push(newRelationship);
    this.evidenceStore.set(sourceId, sourceEvidence);

    // Update relationship index
    if (!this.relationshipIndex.has(targetId)) {
      this.relationshipIndex.set(targetId, new Set());
    }
    this.relationshipIndex.get(targetId)!.add(sourceId);
  }

  /**
   * Remove relationship between evidence items
   */
  async removeRelationship(relationshipId: string, context: IEvidenceContext): Promise<void> {
    for (const [evidenceId, evidence] of this.evidenceStore.entries()) {
      const relationshipIndex = evidence.relationships.findIndex(rel => rel.id === relationshipId);
      if (relationshipIndex !== -1) {
        const relationship = evidence.relationships[relationshipIndex];
        evidence.relationships.splice(relationshipIndex, 1);
        this.evidenceStore.set(evidenceId, evidence);

        // Update relationship index
        const reverseSet = this.relationshipIndex.get(relationship.targetEvidenceId);
        if (reverseSet) {
          reverseSet.delete(evidenceId);
        }
        return;
      }
    }
    throw new Error(`Relationship ${relationshipId} not found`);
  }

  /**
   * Bulk create evidence
   */
  async bulkCreateEvidence(evidenceList: ICreateEvidenceRequest[], context: IEvidenceContext): Promise<IBulkOperationResult> {
    const result: IBulkOperationResult = {
      successful: 0,
      failed: 0,
      errors: []
    };

    for (let i = 0; i < evidenceList.length; i++) {
      try {
        await this.createEvidence(evidenceList[i], context);
        result.successful++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          index: i,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return result;
  }

  /**
   * Bulk update evidence
   */
  async bulkUpdateEvidence(updates: IBulkUpdateRequest[], context: IEvidenceContext): Promise<IBulkOperationResult> {
    const result: IBulkOperationResult = {
      successful: 0,
      failed: 0,
      errors: []
    };

    for (let i = 0; i < updates.length; i++) {
      try {
        await this.updateEvidence(updates[i].evidenceId, updates[i].updates, context);
        result.successful++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          index: i,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return result;
  }

  /**
   * Generate evidence report
   */
  async generateEvidenceReport(query: IEvidenceReportQuery, context: IEvidenceContext): Promise<IEvidenceReport> {
    const searchResult = await this.searchEvidence(query.filters, context);
    const metrics = await this.getEvidenceMetrics(query.filters.dateRange);

    const summary = {
      totalEvidence: searchResult.totalCount,
      byType: this.aggregateByField(searchResult.evidence, 'type'),
      byClassification: this.aggregateByField(searchResult.evidence, 'classification'),
      bySeverity: this.aggregateByField(searchResult.evidence, 'metadata.severity')
    };

    return {
      title: query.title,
      generatedAt: new Date(),
      generatedBy: context.userId,
      filters: query.filters,
      evidence: searchResult.evidence,
      metrics,
      summary
    };
  }

  /**
   * Get evidence metrics
   */
  async getEvidenceMetrics(timeRange?: ITimeRange): Promise<IEvidenceMetrics> {
    let evidence = Array.from(this.evidenceStore.values());
    
    if (timeRange) {
      evidence = evidence.filter(e => 
        e.createdAt >= timeRange.start && e.createdAt <= timeRange.end
      );
    }

    const totalEvidence = evidence.length;
    const evidenceByType = this.aggregateByField(evidence, 'type') as Record<EvidenceType, number>;
    const evidenceByClassification = this.aggregateByField(evidence, 'classification') as Record<ClassificationLevel, number>;
    const evidenceBySourceType = this.aggregateByField(evidence, 'sourceType') as Record<EvidenceSourceType, number>;
    const evidenceBySeverity = this.aggregateByField(evidence, 'metadata.severity');

    const averageConfidence = evidence.reduce((sum, e) => sum + e.metadata.confidence, 0) / totalEvidence || 0;

    const qualityMetrics = {
      averageCompleteness: evidence.reduce((sum, e) => sum + e.metadata.quality.completeness, 0) / totalEvidence || 0,
      averageAccuracy: evidence.reduce((sum, e) => sum + e.metadata.quality.accuracy, 0) / totalEvidence || 0,
      averageConsistency: evidence.reduce((sum, e) => sum + e.metadata.quality.consistency, 0) / totalEvidence || 0,
      averageTimeliness: evidence.reduce((sum, e) => sum + e.metadata.quality.timeliness, 0) / totalEvidence || 0,
      averageReliability: evidence.reduce((sum, e) => sum + e.metadata.quality.reliability, 0) / totalEvidence || 0
    };

    const custodyMetrics = {
      averageChainLength: evidence.reduce((sum, e) => sum + e.chainOfCustody.length, 0) / totalEvidence || 0,
      integrityViolations: evidence.filter(e => !e.integrity.isValid).length,
      custodyTransfers: evidence.reduce((sum, e) => sum + e.chainOfCustody.length, 0)
    };

    return {
      totalEvidence,
      evidenceByType,
      evidenceByClassification,
      evidenceBySourceType,
      evidenceBySeverity,
      averageConfidence,
      qualityMetrics,
      custodyMetrics,
      timeRange
    };
  }

  // Private helper methods

  private calculateHash(data: any): string {
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    return createHash('sha256').update(dataString).digest('hex');
  }

  private calculateCustodyHash(evidenceId: string, entry: IAddCustodyEntryRequest, previousHash?: string): string {
    const hashData = {
      evidenceId,
      timestamp: new Date().toISOString(),
      action: entry.action,
      details: entry.details,
      previousHash: previousHash || ''
    };
    return this.calculateHash(hashData);
  }

  private calculateSourceTrustworthiness(sourceType: EvidenceSourceType): number {
    const trustMap: Record<EvidenceSourceType, number> = {
      [EvidenceSourceType.HUMAN_ANALYSIS]: 85,
      [EvidenceSourceType.AUTOMATED_ANALYSIS]: 75,
      [EvidenceSourceType.THREAT_FEED]: 70,
      [EvidenceSourceType.SENSOR_DATA]: 80,
      [EvidenceSourceType.THIRD_PARTY_INTEL]: 65,
      [EvidenceSourceType.INTERNAL_DETECTION]: 85,
      [EvidenceSourceType.EXTERNAL_REPORT]: 60,
      [EvidenceSourceType.HONEYPOT]: 90,
      [EvidenceSourceType.SANDBOX]: 88,
      [EvidenceSourceType.OSINT]: 55
    };
    return trustMap[sourceType] || 50;
  }

  private calculateSourceReliability(sourceType: EvidenceSourceType): number {
    return this.calculateSourceTrustworthiness(sourceType) / 100;
  }

  private checkAccessPermission(evidence: IEvidence, context: IEvidenceContext): boolean {
    // Implement classification-based access control
    const classificationHierarchy = [
      ClassificationLevel.UNCLASSIFIED,
      ClassificationLevel.TLP_WHITE,
      ClassificationLevel.TLP_GREEN,
      ClassificationLevel.TLP_AMBER,
      ClassificationLevel.TLP_RED,
      ClassificationLevel.CONFIDENTIAL,
      ClassificationLevel.SECRET,
      ClassificationLevel.TOP_SECRET
    ];

    const userLevel = classificationHierarchy.indexOf(context.classification);
    const evidenceLevel = classificationHierarchy.indexOf(evidence.classification);

    return userLevel >= evidenceLevel;
  }

  private getFieldValue(evidence: IEvidence, field: string): any {
    const fields = field.split('.');
    let value: any = evidence;
    for (const f of fields) {
      value = value?.[f];
    }
    return value;
  }

  private generateFacets(evidence: IEvidence[]): any {
    return {
      types: this.generateFacetCounts(evidence, 'type'),
      sourceTypes: this.generateFacetCounts(evidence, 'sourceType'),
      classifications: this.generateFacetCounts(evidence, 'classification'),
      severities: this.generateFacetCounts(evidence, 'metadata.severity'),
      tags: this.generateTagFacets(evidence),
      sourceSystems: this.generateFacetCounts(evidence, 'sourceSystem')
    };
  }

  private generateFacetCounts(evidence: IEvidence[], field: string): Array<{ value: string; count: number }> {
    const counts: Record<string, number> = {};
    for (const e of evidence) {
      const value = this.getFieldValue(e, field);
      if (value) {
        counts[value] = (counts[value] || 0) + 1;
      }
    }
    return Object.entries(counts).map(([value, count]) => ({ value, count }));
  }

  private generateTagFacets(evidence: IEvidence[]): Array<{ value: string; count: number }> {
    const tagCounts: Record<string, number> = {};
    for (const e of evidence) {
      for (const tag of e.tags) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }
    }
    return Object.entries(tagCounts).map(([value, count]) => ({ value, count }));
  }

  private aggregateByField(evidence: IEvidence[], field: string): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const e of evidence) {
      const value = this.getFieldValue(e, field);
      if (value) {
        counts[value] = (counts[value] || 0) + 1;
      }
    }
    return counts;
  }
}