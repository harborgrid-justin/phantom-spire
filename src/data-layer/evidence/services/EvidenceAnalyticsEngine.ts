/**
 * Evidence Analytics Engine
 * Advanced analytics capabilities for evidence management and correlation
 */

import { 
  IEvidence, 
  EvidenceType, 
  EvidenceSourceType, 
  EvidenceRelationshipType,
  IEvidenceRelationship 
} from '../interfaces/IEvidence.js';
import { IEvidenceManager, IEvidenceContext } from '../interfaces/IEvidenceManager.js';
import { IDataRecord, IRelationship } from '../../interfaces/IDataSource.js';
import { AdvancedAnalyticsEngine } from '../../analytics/AdvancedAnalyticsEngine.js';
import { logger } from '../../../utils/logger.js';

export interface IEvidenceAnalyticsResult {
  analysisId: string;
  timestamp: Date;
  evidenceAnalyzed: number;
  findings: IEvidenceFinding[];
  correlations: IEvidenceCorrelation[];
  patterns: IEvidencePattern[];
  riskAssessment: IEvidenceRiskAssessment;
  recommendations: IEvidenceRecommendation[];
  quality: IAnalysisQuality;
}

export interface IEvidenceFinding {
  id: string;
  type: 'anomaly' | 'pattern' | 'correlation' | 'quality_issue' | 'integrity_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-100
  title: string;
  description: string;
  evidence: string[]; // Evidence IDs
  supporting_data: Record<string, any>;
  created_at: Date;
}

export interface IEvidenceCorrelation {
  id: string;
  primary_evidence: string;
  related_evidence: string[];
  correlation_type: 'temporal' | 'spatial' | 'behavioral' | 'attribution' | 'technical';
  strength: number; // 0-100
  confidence: number; // 0-100
  description: string;
  evidence_links: Array<{
    source: string;
    target: string;
    relationship: EvidenceRelationshipType;
    weight: number;
  }>;
}

export interface IEvidencePattern {
  id: string;
  name: string;
  type: 'threat_campaign' | 'attack_chain' | 'source_pattern' | 'quality_pattern';
  evidence_count: number;
  confidence: number; // 0-100
  description: string;
  pattern_elements: Array<{
    element_type: string;
    values: string[];
    frequency: number;
  }>;
  timeline?: {
    start: Date;
    end: Date;
    duration_hours: number;
  };
}

export interface IEvidenceRiskAssessment {
  overall_risk: 'low' | 'medium' | 'high' | 'critical';
  risk_score: number; // 0-100
  risk_factors: Array<{
    factor: string;
    impact: number; // 0-100
    description: string;
  }>;
  data_integrity_risk: number; // 0-100
  source_reliability_risk: number; // 0-100
  classification_risk: number; // 0-100
}

export interface IEvidenceRecommendation {
  id: string;
  type: 'investigation' | 'validation' | 'enrichment' | 'escalation' | 'retention';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  evidence: string[];
  suggested_actions: string[];
  estimated_effort: 'low' | 'medium' | 'high';
}

export interface IAnalysisQuality {
  completeness: number; // 0-100
  coverage: number; // 0-100
  depth: number; // 0-100
  timeliness: number; // 0-100
}

export interface IEvidenceAnalyticsOptions {
  include_correlations?: boolean;
  include_patterns?: boolean;
  include_risk_assessment?: boolean;
  include_recommendations?: boolean;
  analysis_depth?: 'basic' | 'standard' | 'comprehensive';
  time_range?: {
    start: Date;
    end: Date;
  };
  evidence_types?: EvidenceType[];
  min_confidence?: number;
}

export class EvidenceAnalyticsEngine {
  private analyticsEngine: AdvancedAnalyticsEngine;

  constructor(
    private evidenceManager: IEvidenceManager,
    private auditLogger = logger
  ) {
    this.analyticsEngine = new AdvancedAnalyticsEngine();
    this.auditLogger.info('Evidence Analytics Engine initialized');
  }

  /**
   * Perform comprehensive evidence analysis
   */
  async analyzeEvidence(
    evidenceIds: string[], 
    context: IEvidenceContext,
    options: IEvidenceAnalyticsOptions = {}
  ): Promise<IEvidenceAnalyticsResult> {
    const analysisId = this.generateAnalysisId();
    const timestamp = new Date();
    
    this.auditLogger.info('Starting evidence analysis', {
      analysisId,
      evidenceCount: evidenceIds.length,
      userId: context.userId,
      options
    });

    // Retrieve evidence objects
    const evidence = await this.retrieveEvidence(evidenceIds, context);
    
    const result: IEvidenceAnalyticsResult = {
      analysisId,
      timestamp,
      evidenceAnalyzed: evidence.length,
      findings: [],
      correlations: [],
      patterns: [],
      riskAssessment: {
        overall_risk: 'low',
        risk_score: 0,
        risk_factors: [],
        data_integrity_risk: 0,
        source_reliability_risk: 0,
        classification_risk: 0
      },
      recommendations: [],
      quality: {
        completeness: 100,
        coverage: 100,
        depth: 100,
        timeliness: 100
      }
    };

    try {
      // Convert evidence to data records for analytics engine
      const dataRecords = this.convertEvidenceToDataRecords(evidence);
      const relationships = this.extractRelationships(evidence);

      // Analyze data integrity issues
      result.findings.push(...await this.analyzeDataIntegrity(evidence));

      // Analyze custody chain issues
      result.findings.push(...await this.analyzeCustodyChains(evidence, context));

      // Analyze source quality and reliability
      result.findings.push(...await this.analyzeSourceQuality(evidence));

      // Find correlations if requested
      if (options.include_correlations !== false) {
        result.correlations = await this.findEvidenceCorrelations(evidence, dataRecords, relationships);
      }

      // Detect patterns if requested
      if (options.include_patterns !== false) {
        result.patterns = await this.detectEvidencePatterns(evidence, dataRecords);
      }

      // Perform risk assessment if requested
      if (options.include_risk_assessment !== false) {
        result.riskAssessment = await this.assessEvidenceRisk(evidence, result.findings);
      }

      // Generate recommendations if requested
      if (options.include_recommendations !== false) {
        result.recommendations = await this.generateRecommendations(
          evidence, result.findings, result.correlations, result.patterns
        );
      }

      // Calculate analysis quality
      result.quality = this.calculateAnalysisQuality(evidence, options);

      this.auditLogger.info('Evidence analysis completed', {
        analysisId,
        evidenceAnalyzed: result.evidenceAnalyzed,
        findingsCount: result.findings.length,
        correlationsCount: result.correlations.length,
        patternsCount: result.patterns.length,
        overallRisk: result.riskAssessment.overall_risk
      });

    } catch (error) {
      this.auditLogger.error('Evidence analysis failed', {
        analysisId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }

    return result;
  }

  /**
   * Analyze single evidence item for anomalies
   */
  async analyzeSingleEvidence(
    evidenceId: string, 
    context: IEvidenceContext
  ): Promise<IEvidenceFinding[]> {
    const evidence = await this.evidenceManager.getEvidence(evidenceId, context);
    if (!evidence) {
      throw new Error(`Evidence ${evidenceId} not found or access denied`);
    }

    const findings: IEvidenceFinding[] = [];

    // Check data integrity
    const integrityResult = await this.evidenceManager.verifyIntegrity(evidenceId, context);
    if (!integrityResult.isValid) {
      findings.push({
        id: this.generateFindingId(),
        type: 'integrity_violation',
        severity: 'high',
        confidence: 95,
        title: 'Data Integrity Violation',
        description: 'Evidence data hash does not match expected value',
        evidence: [evidenceId],
        supporting_data: {
          expected_hash: integrityResult.expectedHash,
          actual_hash: integrityResult.currentHash,
          algorithm: integrityResult.algorithm
        },
        created_at: new Date()
      });
    }

    // Check custody chain
    const custodyResult = await this.evidenceManager.verifyCustodyChain(evidenceId, context);
    if (!custodyResult.isValid) {
      findings.push({
        id: this.generateFindingId(),
        type: 'integrity_violation',
        severity: 'high',
        confidence: 90,
        title: 'Custody Chain Violation',
        description: 'Evidence custody chain has integrity issues',
        evidence: [evidenceId],
        supporting_data: {
          chain_length: custodyResult.chainLength,
          issues: custodyResult.issues
        },
        created_at: new Date()
      });
    }

    // Check data quality
    const qualityIssues = this.assessDataQuality(evidence);
    findings.push(...qualityIssues);

    return findings;
  }

  /**
   * Find temporal correlations between evidence items
   */
  async findTemporalCorrelations(
    evidenceIds: string[],
    context: IEvidenceContext,
    timeWindow: number = 3600000 // 1 hour in milliseconds
  ): Promise<IEvidenceCorrelation[]> {
    const evidence = await this.retrieveEvidence(evidenceIds, context);
    const correlations: IEvidenceCorrelation[] = [];

    // Group evidence by time windows
    const timeGroups = new Map<number, IEvidence[]>();
    
    for (const e of evidence) {
      const timeSlot = Math.floor(e.createdAt.getTime() / timeWindow) * timeWindow;
      if (!timeGroups.has(timeSlot)) {
        timeGroups.set(timeSlot, []);
      }
      timeGroups.get(timeSlot)!.push(e);
    }

    // Find correlations within time groups
    for (const [timeSlot, groupEvidence] of timeGroups) {
      if (groupEvidence.length < 2) continue;

      for (let i = 0; i < groupEvidence.length; i++) {
        for (let j = i + 1; j < groupEvidence.length; j++) {
          const correlation = this.calculateTemporalCorrelation(
            groupEvidence[i], 
            groupEvidence[j]
          );
          
          if (correlation.strength > 50) { // Only include strong correlations
            correlations.push(correlation);
          }
        }
      }
    }

    return correlations;
  }

  // Private helper methods

  private async retrieveEvidence(
    evidenceIds: string[], 
    context: IEvidenceContext
  ): Promise<IEvidence[]> {
    const evidence: IEvidence[] = [];
    
    for (const id of evidenceIds) {
      const e = await this.evidenceManager.getEvidence(id, context);
      if (e) {
        evidence.push(e);
      }
    }
    
    return evidence;
  }

  private convertEvidenceToDataRecords(evidence: IEvidence[]): IDataRecord[] {
    return evidence.map(e => ({
      id: e.id,
      type: e.type,
      source: e.sourceSystem,
      timestamp: e.createdAt,
      data: {
        ...e.data,
        metadata: e.metadata,
        classification: e.classification,
        sourceType: e.sourceType
      },
      metadata: {
        confidence: e.metadata.confidence,
        severity: e.metadata.severity,
        quality: e.metadata.quality
      },
      relationships: e.relationships.map(rel => ({
        id: rel.id,
        type: rel.relationshipType,
        sourceId: e.id,
        targetId: rel.targetEvidenceId,
        weight: rel.confidence / 100,
        confidence: rel.confidence / 100,
        createdAt: rel.createdAt
      }))
    }));
  }

  private extractRelationships(evidence: IEvidence[]): IRelationship[] {
    const relationships: IRelationship[] = [];
    
    for (const e of evidence) {
      for (const rel of e.relationships) {
        relationships.push({
          id: rel.id,
          type: rel.relationshipType,
          sourceId: e.id,
          targetId: rel.targetEvidenceId,
          weight: rel.confidence / 100,
          confidence: rel.confidence / 100,
          createdAt: rel.createdAt
        });
      }
    }
    
    return relationships;
  }

  private async analyzeDataIntegrity(evidence: IEvidence[]): Promise<IEvidenceFinding[]> {
    const findings: IEvidenceFinding[] = [];
    
    for (const e of evidence) {
      // Check if integrity validation is recent
      const timeSinceValidation = Date.now() - e.integrity.lastVerified.getTime();
      const daysSince = timeSinceValidation / (24 * 60 * 60 * 1000);
      
      if (daysSince > 30) { // Flag if not validated in 30 days
        findings.push({
          id: this.generateFindingId(),
          type: 'quality_issue',
          severity: 'medium',
          confidence: 80,
          title: 'Stale Integrity Validation',
          description: `Evidence integrity not validated in ${Math.round(daysSince)} days`,
          evidence: [e.id],
          supporting_data: {
            last_validated: e.integrity.lastVerified,
            days_since_validation: Math.round(daysSince)
          },
          created_at: new Date()
        });
      }
      
      if (!e.integrity.isValid) {
        findings.push({
          id: this.generateFindingId(),
          type: 'integrity_violation',
          severity: 'critical',
          confidence: 95,
          title: 'Data Integrity Failure',
          description: 'Evidence data integrity check failed',
          evidence: [e.id],
          supporting_data: {
            hash_algorithm: e.integrity.algorithm,
            hash_value: e.integrity.hash
          },
          created_at: new Date()
        });
      }
    }
    
    return findings;
  }

  private async analyzeCustodyChains(
    evidence: IEvidence[], 
    context: IEvidenceContext
  ): Promise<IEvidenceFinding[]> {
    const findings: IEvidenceFinding[] = [];
    
    for (const e of evidence) {
      // Check for gaps in custody chain
      const chainEntries = e.chainOfCustody;
      
      for (let i = 1; i < chainEntries.length; i++) {
        const timeDiff = chainEntries[i].timestamp.getTime() - chainEntries[i-1].timestamp.getTime();
        const hoursDiff = timeDiff / (60 * 60 * 1000);
        
        // Flag gaps longer than 24 hours
        if (hoursDiff > 24) {
          findings.push({
            id: this.generateFindingId(),
            type: 'quality_issue',
            severity: 'medium',
            confidence: 75,
            title: 'Custody Chain Gap',
            description: `Gap of ${Math.round(hoursDiff)} hours in custody chain`,
            evidence: [e.id],
            supporting_data: {
              gap_hours: Math.round(hoursDiff),
              previous_entry: chainEntries[i-1],
              current_entry: chainEntries[i]
            },
            created_at: new Date()
          });
        }
      }
      
      // Check for minimum custody entries
      if (chainEntries.length < 2) {
        findings.push({
          id: this.generateFindingId(),
          type: 'quality_issue',
          severity: 'low',
          confidence: 60,
          title: 'Minimal Custody Chain',
          description: 'Evidence has very short custody chain',
          evidence: [e.id],
          supporting_data: {
            chain_length: chainEntries.length
          },
          created_at: new Date()
        });
      }
    }
    
    return findings;
  }

  private async analyzeSourceQuality(evidence: IEvidence[]): Promise<IEvidenceFinding[]> {
    const findings: IEvidenceFinding[] = [];
    
    // Analyze source reliability patterns
    const sourceReliability = new Map<string, { total: number, count: number, evidence: string[] }>();
    
    for (const e of evidence) {
      const reliability = e.metadata.quality.reliability;
      if (!sourceReliability.has(e.sourceSystem)) {
        sourceReliability.set(e.sourceSystem, { total: 0, count: 0, evidence: [] });
      }
      
      const stats = sourceReliability.get(e.sourceSystem)!;
      stats.total += reliability;
      stats.count++;
      stats.evidence.push(e.id);
    }
    
    // Flag sources with consistently low reliability
    for (const [sourceSystem, stats] of sourceReliability) {
      const avgReliability = stats.total / stats.count;
      
      if (avgReliability < 0.5 && stats.count > 2) {
        findings.push({
          id: this.generateFindingId(),
          type: 'quality_issue',
          severity: 'medium',
          confidence: 80,
          title: 'Unreliable Evidence Source',
          description: `Source system ${sourceSystem} has consistently low reliability`,
          evidence: stats.evidence,
          supporting_data: {
            source_system: sourceSystem,
            average_reliability: avgReliability,
            evidence_count: stats.count
          },
          created_at: new Date()
        });
      }
    }
    
    return findings;
  }

  private async findEvidenceCorrelations(
    evidence: IEvidence[],
    dataRecords: IDataRecord[],
    relationships: IRelationship[]
  ): Promise<IEvidenceCorrelation[]> {
    const correlations: IEvidenceCorrelation[] = [];
    
    // Use the advanced analytics engine to find patterns
    try {
      const analyticsResult = await this.analyticsEngine.analyzeThreats(
        dataRecords,
        relationships,
        { includeAnomalies: false }
      );
      
      // Convert analytics findings to evidence correlations
      for (const finding of analyticsResult.findings) {
        if (finding.pattern === 'network-analysis' || finding.pattern === 'correlation') {
          correlations.push({
            id: this.generateCorrelationId(),
            primary_evidence: finding.evidence[0]?.id || '',
            related_evidence: finding.evidence.slice(1).map(e => e.id),
            correlation_type: 'behavioral',
            strength: finding.score,
            confidence: finding.score,
            description: finding.description,
            evidence_links: []
          });
        }
      }
    } catch (error) {
      this.auditLogger.warn('Analytics engine correlation failed', error);
    }
    
    return correlations;
  }

  private async detectEvidencePatterns(
    evidence: IEvidence[],
    dataRecords: IDataRecord[]
  ): Promise<IEvidencePattern[]> {
    const patterns: IEvidencePattern[] = [];
    
    // Detect temporal patterns
    patterns.push(...this.detectTemporalPatterns(evidence));
    
    // Detect source patterns
    patterns.push(...this.detectSourcePatterns(evidence));
    
    // Detect classification patterns
    patterns.push(...this.detectClassificationPatterns(evidence));
    
    return patterns;
  }

  private detectTemporalPatterns(evidence: IEvidence[]): IEvidencePattern[] {
    const patterns: IEvidencePattern[] = [];
    
    // Group evidence by hour of day
    const hourlyDistribution = new Array(24).fill(0);
    for (const e of evidence) {
      const hour = e.createdAt.getHours();
      hourlyDistribution[hour]++;
    }
    
    // Find peak hours (more than 2 standard deviations above mean)
    const mean = hourlyDistribution.reduce((sum, count) => sum + count, 0) / 24;
    const variance = hourlyDistribution.reduce((sum, count) => sum + Math.pow(count - mean, 2), 0) / 24;
    const stdDev = Math.sqrt(variance);
    
    const peakHours = [];
    for (let hour = 0; hour < 24; hour++) {
      if (hourlyDistribution[hour] > mean + 2 * stdDev) {
        peakHours.push(hour);
      }
    }
    
    if (peakHours.length > 0) {
      patterns.push({
        id: this.generatePatternId(),
        name: 'Evidence Collection Peak Hours',
        type: 'source_pattern',
        evidence_count: evidence.length,
        confidence: 75,
        description: `Evidence collection peaks during hours: ${peakHours.join(', ')}`,
        pattern_elements: [{
          element_type: 'hour_of_day',
          values: peakHours.map(h => h.toString()),
          frequency: Math.max(...peakHours.map(h => hourlyDistribution[h]))
        }]
      });
    }
    
    return patterns;
  }

  private detectSourcePatterns(evidence: IEvidence[]): IEvidencePattern[] {
    const patterns: IEvidencePattern[] = [];
    
    // Analyze source type distribution
    const sourceTypeCount = new Map<EvidenceSourceType, number>();
    for (const e of evidence) {
      sourceTypeCount.set(e.sourceType, (sourceTypeCount.get(e.sourceType) || 0) + 1);
    }
    
    // Find dominant source types (more than 50% of evidence)
    const totalEvidence = evidence.length;
    for (const [sourceType, count] of sourceTypeCount) {
      if (count / totalEvidence > 0.5) {
        patterns.push({
          id: this.generatePatternId(),
          name: 'Dominant Source Type',
          type: 'source_pattern',
          evidence_count: count,
          confidence: 80,
          description: `Evidence heavily skewed towards ${sourceType} sources`,
          pattern_elements: [{
            element_type: 'source_type',
            values: [sourceType],
            frequency: count
          }]
        });
      }
    }
    
    return patterns;
  }

  private detectClassificationPatterns(evidence: IEvidence[]): IEvidencePattern[] {
    const patterns: IEvidencePattern[] = [];
    
    // Look for classification escalation patterns
    const classificationTimeline = evidence
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map(e => ({ time: e.createdAt, classification: e.classification }));
    
    // Simple escalation detection (more sophisticated analysis could be added)
    let escalationCount = 0;
    for (let i = 1; i < classificationTimeline.length; i++) {
      const prev = classificationTimeline[i-1];
      const curr = classificationTimeline[i];
      
      if (this.isClassificationEscalation(prev.classification, curr.classification)) {
        escalationCount++;
      }
    }
    
    if (escalationCount > evidence.length * 0.3) { // More than 30% escalations
      patterns.push({
        id: this.generatePatternId(),
        name: 'Classification Escalation Pattern',
        type: 'threat_campaign',
        evidence_count: evidence.length,
        confidence: 70,
        description: 'Evidence shows pattern of classification escalation over time',
        pattern_elements: [{
          element_type: 'classification_trend',
          values: ['escalating'],
          frequency: escalationCount
        }],
        timeline: {
          start: evidence[0].createdAt,
          end: evidence[evidence.length - 1].createdAt,
          duration_hours: (evidence[evidence.length - 1].createdAt.getTime() - evidence[0].createdAt.getTime()) / (60 * 60 * 1000)
        }
      });
    }
    
    return patterns;
  }

  private async assessEvidenceRisk(
    evidence: IEvidence[],
    findings: IEvidenceFinding[]
  ): Promise<IEvidenceRiskAssessment> {
    // Calculate individual risk components
    const integrityRisk = this.calculateIntegrityRisk(evidence, findings);
    const reliabilityRisk = this.calculateReliabilityRisk(evidence);
    const classificationRisk = this.calculateClassificationRisk(evidence);
    
    // Calculate overall risk score
    const overallScore = Math.max(integrityRisk, reliabilityRisk, classificationRisk);
    
    const riskFactors = [];
    
    if (integrityRisk > 50) {
      riskFactors.push({
        factor: 'Data Integrity',
        impact: integrityRisk,
        description: 'High risk due to integrity violations or stale validations'
      });
    }
    
    if (reliabilityRisk > 50) {
      riskFactors.push({
        factor: 'Source Reliability',
        impact: reliabilityRisk,
        description: 'High risk due to unreliable evidence sources'
      });
    }
    
    if (classificationRisk > 50) {
      riskFactors.push({
        factor: 'Classification Handling',
        impact: classificationRisk,
        description: 'High risk due to sensitive classification levels'
      });
    }
    
    return {
      overall_risk: overallScore > 75 ? 'critical' : overallScore > 50 ? 'high' : overallScore > 25 ? 'medium' : 'low',
      risk_score: overallScore,
      risk_factors: riskFactors,
      data_integrity_risk: integrityRisk,
      source_reliability_risk: reliabilityRisk,
      classification_risk: classificationRisk
    };
  }

  private async generateRecommendations(
    evidence: IEvidence[],
    findings: IEvidenceFinding[],
    correlations: IEvidenceCorrelation[],
    patterns: IEvidencePattern[]
  ): Promise<IEvidenceRecommendation[]> {
    const recommendations: IEvidenceRecommendation[] = [];
    
    // Recommendations based on findings
    const integrityViolations = findings.filter(f => f.type === 'integrity_violation');
    if (integrityViolations.length > 0) {
      recommendations.push({
        id: this.generateRecommendationId(),
        type: 'validation',
        priority: 'high',
        title: 'Validate Evidence Integrity',
        description: 'Multiple evidence items have integrity issues requiring immediate validation',
        evidence: integrityViolations.flatMap(f => f.evidence),
        suggested_actions: [
          'Recalculate data hashes',
          'Verify source data',
          'Review custody chain',
          'Contact original collectors'
        ],
        estimated_effort: 'medium'
      });
    }
    
    // Recommendations based on patterns
    const campaignPatterns = patterns.filter(p => p.type === 'threat_campaign');
    if (campaignPatterns.length > 0) {
      recommendations.push({
        id: this.generateRecommendationId(),
        type: 'investigation',
        priority: 'medium',
        title: 'Investigate Threat Campaign',
        description: 'Evidence patterns suggest coordinated threat activity',
        evidence: evidence.map(e => e.id),
        suggested_actions: [
          'Correlate with external intelligence',
          'Expand collection timeframe',
          'Identify additional indicators',
          'Brief threat intelligence team'
        ],
        estimated_effort: 'high'
      });
    }
    
    // Recommendations based on correlations
    if (correlations.length > 5) {
      recommendations.push({
        id: this.generateRecommendationId(),
        type: 'enrichment',
        priority: 'low',
        title: 'Enrich Highly Correlated Evidence',
        description: 'Multiple correlations found - consider enrichment opportunities',
        evidence: correlations.flatMap(c => [c.primary_evidence, ...c.related_evidence]),
        suggested_actions: [
          'Cross-reference with additional sources',
          'Validate correlation confidence',
          'Document relationships',
          'Update evidence metadata'
        ],
        estimated_effort: 'low'
      });
    }
    
    return recommendations;
  }

  // Helper methods for risk calculations and utilities

  private calculateIntegrityRisk(evidence: IEvidence[], findings: IEvidenceFinding[]): number {
    const integrityViolations = findings.filter(f => f.type === 'integrity_violation').length;
    const totalEvidence = evidence.length;
    
    if (totalEvidence === 0) return 0;
    
    const violationRatio = integrityViolations / totalEvidence;
    return Math.min(violationRatio * 100, 100);
  }

  private calculateReliabilityRisk(evidence: IEvidence[]): number {
    const avgReliability = evidence.reduce((sum, e) => sum + e.metadata.quality.reliability, 0) / evidence.length;
    return (1 - avgReliability) * 100;
  }

  private calculateClassificationRisk(evidence: IEvidence[]): number {
    const highClassification = evidence.filter(e => 
      [e.classification].includes('secret' as any) || 
      [e.classification].includes('top_secret' as any)
    ).length;
    
    return (highClassification / evidence.length) * 60; // Max 60% risk from classification
  }

  private calculateTemporalCorrelation(e1: IEvidence, e2: IEvidence): IEvidenceCorrelation {
    const timeDiff = Math.abs(e1.createdAt.getTime() - e2.createdAt.getTime());
    const hoursDiff = timeDiff / (60 * 60 * 1000);
    
    // Stronger correlation for closer timestamps
    const strength = Math.max(0, 100 - (hoursDiff / 24) * 10); // Decreases by 10 per day
    
    return {
      id: this.generateCorrelationId(),
      primary_evidence: e1.id,
      related_evidence: [e2.id],
      correlation_type: 'temporal',
      strength: Math.round(strength),
      confidence: Math.round(strength * 0.8), // Slightly lower confidence than strength
      description: `Evidence items created within ${Math.round(hoursDiff)} hours of each other`,
      evidence_links: [{
        source: e1.id,
        target: e2.id,
        relationship: EvidenceRelationshipType.CORRELATES_WITH,
        weight: strength / 100
      }]
    };
  }

  private assessDataQuality(evidence: IEvidence): IEvidenceFinding[] {
    const findings: IEvidenceFinding[] = [];
    
    // Check confidence levels
    if (evidence.metadata.confidence < 50) {
      findings.push({
        id: this.generateFindingId(),
        type: 'quality_issue',
        severity: 'medium',
        confidence: 70,
        title: 'Low Confidence Evidence',
        description: 'Evidence has low confidence rating',
        evidence: [evidence.id],
        supporting_data: {
          confidence: evidence.metadata.confidence
        },
        created_at: new Date()
      });
    }
    
    // Check data completeness
    if (evidence.metadata.quality.completeness < 0.7) {
      findings.push({
        id: this.generateFindingId(),
        type: 'quality_issue',
        severity: 'low',
        confidence: 60,
        title: 'Incomplete Evidence Data',
        description: 'Evidence data appears to be incomplete',
        evidence: [evidence.id],
        supporting_data: {
          completeness: evidence.metadata.quality.completeness
        },
        created_at: new Date()
      });
    }
    
    return findings;
  }

  private isClassificationEscalation(prev: any, curr: any): boolean {
    const hierarchy = [
      'unclassified', 'tlp_white', 'tlp_green', 'tlp_amber', 'tlp_red',
      'confidential', 'secret', 'top_secret'
    ];
    
    const prevLevel = hierarchy.indexOf(prev);
    const currLevel = hierarchy.indexOf(curr);
    
    return currLevel > prevLevel;
  }

  private calculateAnalysisQuality(
    evidence: IEvidence[], 
    options: IEvidenceAnalyticsOptions
  ): IAnalysisQuality {
    const depth = options.analysis_depth || 'standard';
    const depthScore = depth === 'comprehensive' ? 100 : depth === 'standard' ? 75 : 50;
    
    return {
      completeness: 100, // All requested evidence was analyzed
      coverage: Math.min((evidence.length / 10) * 100, 100), // Better coverage with more evidence
      depth: depthScore,
      timeliness: 100 // Analysis completed immediately
    };
  }

  private generateAnalysisId(): string {
    return `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateFindingId(): string {
    return `finding_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateCorrelationId(): string {
    return `correlation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generatePatternId(): string {
    return `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRecommendationId(): string {
    return `recommendation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}