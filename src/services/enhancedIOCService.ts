/**
 * Enhanced IOC Service - Integrates with the modular data layer
 * Provides Palantir-like IOC intelligence capabilities
 */

import { IIOC, IOC } from '../models/IOC';
import { logger } from '../utils/logger';
import { DataLayerOrchestrator } from '../data-layer/DataLayerOrchestrator';
import { IFederatedQuery, IFederatedResult } from '../data-layer/core/DataFederationEngine';
import { IQueryContext, IDataRecord } from '../data-layer/interfaces/IDataSource';
import { IAnalyticsResult } from '../data-layer/analytics/AdvancedAnalyticsEngine';

export interface IEnhancedIOCQuery {
  filters?: Record<string, any>;
  timeRange?: {
    start: Date;
    end: Date;
  };
  includeRelationships?: boolean;
  includeAnalytics?: boolean;
  includePredictions?: boolean;
  sources?: string[];
}

export interface IEnhancedIOCResult {
  iocs: IIOC[];
  relationships?: Array<{
    source: IIOC;
    target: IIOC;
    type: string;
    confidence: number;
    metadata?: Record<string, any>;
  }>;
  analytics?: IAnalyticsResult;
  crossSourceLinks?: Array<{
    localIOC: IIOC;
    externalData: IDataRecord;
    similarity: number;
    linkType: string;
  }>;
  metadata: {
    total: number;
    sources: string[];
    executionTime: number;
    confidence: number;
  };
}

export interface IIOCEnrichmentResult {
  ioc: IIOC;
  enrichments: Array<{
    source: string;
    type: 'reputation' | 'geolocation' | 'malware' | 'attribution' | 'context';
    data: Record<string, any>;
    confidence: number;
    timestamp: Date;
  }>;
  riskScore: {
    overall: number;
    categories: Record<string, number>;
    factors: Array<{
      factor: string;
      impact: number;
      description: string;
    }>;
  };
}

export class EnhancedIOCService {
  private dataLayer: DataLayerOrchestrator;

  constructor(dataLayer: DataLayerOrchestrator) {
    this.dataLayer = dataLayer;
  }

  /**
   * Perform comprehensive IOC intelligence query across all sources
   */
  public async intelligenceQuery(
    query: IEnhancedIOCQuery,
    context: IQueryContext
  ): Promise<IEnhancedIOCResult> {
    const startTime = Date.now();

    try {
      logger.info('Executing enhanced IOC intelligence query', {
        filters: query.filters,
        sources: query.sources,
        includeAnalytics: query.includeAnalytics
      });

      // Build federated query
      const federatedQuery: IFederatedQuery = {
        type: 'select',
        entity: 'iocs',
        filters: {
          ...query.filters,
          ...(query.timeRange && {
            timestamp: {
              $gte: query.timeRange.start,
              $lte: query.timeRange.end
            }
          })
        },
        sources: query.sources || [],
        fusion: 'union'
      };

      // Execute query across all data sources
      const federatedResult = await this.dataLayer.query(federatedQuery, context);

      // Convert data records to IOCs
      const iocs = await this.convertToIOCs(federatedResult.data);

      // Build result
      const result: IEnhancedIOCResult = {
        iocs,
        metadata: {
          total: federatedResult.metadata.total,
          sources: Object.keys(federatedResult.sourceBreakdown || {}),
          executionTime: Date.now() - startTime,
          confidence: this.calculateQueryConfidence(federatedResult)
        }
      };

      // Add relationships if requested
      if (query.includeRelationships) {
        result.relationships = await this.findIOCRelationships(iocs, context);
        
        // Add cross-source relationship discovery
        const crossSourceRelationships = await this.dataLayer.discoverRelationships(
          iocs.map(ioc => ioc._id?.toString() || ioc.value),
          context,
          { similarityThreshold: 0.7 }
        );

        result.crossSourceLinks = this.mapCrossSourceLinks(iocs, crossSourceRelationships.crossSourceLinks);
      }

      // Add analytics if requested
      if (query.includeAnalytics) {
        result.analytics = await this.dataLayer.analyzeThreats(
          federatedQuery,
          context,
          {
            includeAnomalies: true,
            includePredictions: query.includePredictions || false
          }
        );
      }

      logger.info('Enhanced IOC intelligence query completed', {
        iocsFound: result.iocs.length,
        relationships: result.relationships?.length || 0,
        crossSourceLinks: result.crossSourceLinks?.length || 0,
        executionTime: result.metadata.executionTime
      });

      return result;
    } catch (error) {
      logger.error('Enhanced IOC intelligence query failed', error);
      throw error;
    }
  }

  /**
   * Enrich an IOC with data from multiple sources
   */
  public async enrichIOC(
    ioc: IIOC,
    context: IQueryContext,
    options: {
      sources?: string[];
      enrichmentTypes?: string[];
      includeReputation?: boolean;
      includeGeolocation?: boolean;
      includeMalwareAnalysis?: boolean;
    } = {}
  ): Promise<IIOCEnrichmentResult> {
    const startTime = Date.now();

    try {
      logger.info(`Enriching IOC: ${ioc.value}`, {
        type: ioc.type,
        sources: options.sources
      });

      const enrichments: IIOCEnrichmentResult['enrichments'] = [];

      // Query related data across all sources
      const enrichmentQuery: IFederatedQuery = {
        type: 'search',
        searchTerm: ioc.value,
        sources: options.sources || [],
        fusion: 'union'
      };

      const enrichmentData = await this.dataLayer.query(enrichmentQuery, context);

      // Process enrichment data
      for (const record of enrichmentData.data) {
        const enrichment = this.processEnrichmentRecord(record, ioc);
        if (enrichment) {
          enrichments.push(enrichment);
        }
      }

      // Calculate risk score based on enrichments
      const riskScore = this.calculateRiskScore(ioc, enrichments);

      // Add specific enrichments based on IOC type
      if (options.includeReputation !== false) {
        const reputationEnrichment = await this.getReputationData(ioc, context);
        if (reputationEnrichment) {
          enrichments.push(reputationEnrichment);
        }
      }

      if (options.includeGeolocation && ioc.type === 'ip') {
        const geoEnrichment = await this.getGeolocationData(ioc, context);
        if (geoEnrichment) {
          enrichments.push(geoEnrichment);
        }
      }

      if (options.includeMalwareAnalysis && ioc.type === 'hash') {
        const malwareEnrichment = await this.getMalwareAnalysisData(ioc, context);
        if (malwareEnrichment) {
          enrichments.push(malwareEnrichment);
        }
      }

      const result: IIOCEnrichmentResult = {
        ioc,
        enrichments: enrichments.sort((a, b) => b.confidence - a.confidence),
        riskScore
      };

      logger.info(`IOC enrichment completed for ${ioc.value}`, {
        enrichments: enrichments.length,
        overallRisk: riskScore.overall,
        executionTime: Date.now() - startTime
      });

      return result;
    } catch (error) {
      logger.error(`IOC enrichment failed for ${ioc.value}`, error);
      throw error;
    }
  }

  /**
   * Discover IOC patterns and campaigns across sources
   */
  public async discoverCampaigns(
    context: IQueryContext,
    options: {
      timeRange?: { start: Date; end: Date };
      minIOCs?: number;
      similarityThreshold?: number;
      includeAttribution?: boolean;
    } = {}
  ): Promise<Array<{
    campaignId: string;
    name: string;
    iocs: IIOC[];
    confidence: number;
    attribution?: {
      actor: string;
      confidence: number;
      evidence: string[];
    };
    timeline: Array<{
      date: Date;
      activity: string;
      iocs: string[];
    }>;
    techniques: string[];
    infrastructure: Array<{
      type: string;
      value: string;
      role: string;
      confidence: number;
    }>;
  }>> {
    logger.info('Discovering IOC campaigns and patterns');

    try {
      // Get all IOCs in the time range
      const iocQuery: IFederatedQuery = {
        type: 'select',
        entity: 'iocs',
        filters: {
          ...(options.timeRange && {
            timestamp: {
              $gte: options.timeRange.start,
              $lte: options.timeRange.end
            }
          })
        }
      };

      const iocResult = await this.dataLayer.query(iocQuery, context);
      const iocs = await this.convertToIOCs(iocResult.data);

      // Use analytics engine to discover patterns
      const analytics = await this.dataLayer.analyzeThreats(
        iocQuery,
        context,
        {
          patterns: ['apt-campaign', 'botnet-activity', 'data-exfiltration'],
          includeAnomalies: false
        }
      );

      // Convert analytics findings to campaign structure
      const campaigns = this.extractCampaigns(analytics, iocs, options);

      logger.info(`Discovered ${campaigns.length} potential campaigns`);

      return campaigns;
    } catch (error) {
      logger.error('Campaign discovery failed', error);
      throw error;
    }
  }

  /**
   * Stream real-time IOC intelligence updates
   */
  public async *streamIOCIntelligence(
    query: IEnhancedIOCQuery,
    context: IQueryContext
  ): AsyncIterable<{
    type: 'new_ioc' | 'ioc_update' | 'relationship' | 'threat_pattern';
    data: any;
    timestamp: Date;
  }> {
    const federatedQuery: IFederatedQuery = {
      type: 'select',
      entity: 'iocs',
      filters: query.filters || {},
      sources: query.sources || []
    };

    for await (const record of this.dataLayer.stream(federatedQuery, context)) {
      // Convert to IOC if possible
      const ioc = await this.convertSingleRecordToIOC(record);
      
      if (ioc) {
        yield {
          type: 'new_ioc',
          data: ioc,
          timestamp: new Date()
        };

        // If relationships are requested, check for new relationships
        if (query.includeRelationships) {
          const relationships = await this.findIOCRelationships([ioc], context);
          
          for (const relationship of relationships) {
            yield {
              type: 'relationship',
              data: relationship,
              timestamp: new Date()
            };
          }
        }
      }
    }
  }

  /**
   * Get IOC threat hunting recommendations
   */
  public async getThreatHuntingRecommendations(
    ioc: IIOC,
    context: IQueryContext
  ): Promise<Array<{
    technique: string;
    description: string;
    queries: Array<{
      source: string;
      query: string;
      description: string;
    }>;
    indicators: string[];
    priority: 'low' | 'medium' | 'high' | 'critical';
  }>> {
    logger.info(`Generating threat hunting recommendations for ${ioc.value}`);

    try {
      // Get related IOCs and patterns
      const relatedQuery: IFederatedQuery = {
        type: 'graph',
        traversal: {
          startNodes: [ioc._id?.toString() || ioc.value],
          maxDepth: 2,
          direction: 'both'
        },
        sources: []
      };

      const relatedResult = await this.dataLayer.query(relatedQuery, context);

      // Analyze patterns to generate hunting recommendations
      const analytics = await this.dataLayer.analyzeThreats(
        relatedQuery,
        context,
        { patterns: ['apt-campaign', 'botnet-activity', 'data-exfiltration'] }
      );

      // Convert analytics findings to hunting recommendations
      const recommendations = this.generateHuntingRecommendations(ioc, analytics, relatedResult);

      logger.info(`Generated ${recommendations.length} hunting recommendations for ${ioc.value}`);

      return recommendations;
    } catch (error) {
      logger.error(`Failed to generate hunting recommendations for ${ioc.value}`, error);
      throw error;
    }
  }

  // Private helper methods

  private async convertToIOCs(dataRecords: IDataRecord[]): Promise<IIOC[]> {
    const iocs: IIOC[] = [];
    
    for (const record of dataRecords) {
      const ioc = await this.convertSingleRecordToIOC(record);
      if (ioc) {
        iocs.push(ioc);
      }
    }
    
    return iocs;
  }

  private async convertSingleRecordToIOC(record: IDataRecord): Promise<IIOC | null> {
    try {
      // If record is already an IOC from MongoDB
      if (record.source === 'MongoDB' && record.type === 'ioc') {
        return record.data as IIOC;
      }

      // Convert external data to IOC format
      const iocData = {
        value: record.data.value || record.data.indicator || record.id,
        type: this.mapIOCType(record.data.type || record.type),
        confidence: record.data.confidence || 50,
        severity: this.mapSeverity(record.data.severity || record.data.risk),
        source: record.source,
        description: record.data.description || '',
        tags: record.data.tags || [],
        firstSeen: record.data.firstSeen || record.timestamp,
        lastSeen: record.data.lastSeen || record.timestamp,
        isActive: record.data.isActive !== false,
        metadata: {
          ...record.metadata,
          originalSource: record.source,
          provenance: record.provenance
        },
        createdBy: record.data.createdBy || 'system' // Would map to actual user
      };

      // Create IOC in database if it's new
      const existingIOC = await IOC.findOne({
        value: iocData.value,
        type: iocData.type
      });

      if (existingIOC) {
        // Update with new information
        return await IOC.findByIdAndUpdate(
          existingIOC._id,
          {
            $set: {
              lastSeen: iocData.lastSeen,
              isActive: iocData.isActive,
              metadata: {
                ...existingIOC.metadata,
                ...iocData.metadata
              }
            }
          },
          { new: true }
        ) as IIOC;
      } else {
        // Create new IOC
        return await IOC.create(iocData) as IIOC;
      }
    } catch (error) {
      logger.error('Failed to convert record to IOC', { record, error });
      return null;
    }
  }

  private mapIOCType(type: string): 'ip' | 'domain' | 'url' | 'hash' | 'email' {
    const lowerType = type.toLowerCase();
    
    if (lowerType.includes('ip') || lowerType === 'ipv4' || lowerType === 'ipv6') {
      return 'ip';
    } else if (lowerType.includes('domain') || lowerType === 'fqdn') {
      return 'domain';
    } else if (lowerType.includes('url') || lowerType === 'uri') {
      return 'url';
    } else if (lowerType.includes('hash') || lowerType.includes('md5') || 
               lowerType.includes('sha') || lowerType === 'file') {
      return 'hash';
    } else if (lowerType.includes('email') || lowerType.includes('mail')) {
      return 'email';
    }
    
    return 'hash'; // Default fallback
  }

  private mapSeverity(severity: string): 'low' | 'medium' | 'high' | 'critical' {
    if (!severity) return 'medium';
    
    const lowerSeverity = severity.toLowerCase();
    
    if (lowerSeverity.includes('critical') || lowerSeverity.includes('very high')) {
      return 'critical';
    } else if (lowerSeverity.includes('high')) {
      return 'high';
    } else if (lowerSeverity.includes('low')) {
      return 'low';
    }
    
    return 'medium';
  }

  private async findIOCRelationships(
    iocs: IIOC[],
    _context: IQueryContext
  ): Promise<Array<{
    source: IIOC;
    target: IIOC;
    type: string;
    confidence: number;
    metadata?: Record<string, any>;
  }>> {
    const relationships: Array<{
      source: IIOC;
      target: IIOC;
      type: string;
      confidence: number;
      metadata?: Record<string, any>;
    }> = [];

    // Find relationships based on common attributes
    for (let i = 0; i < iocs.length; i++) {
      for (let j = i + 1; j < iocs.length; j++) {
        const ioc1 = iocs[i];
        const ioc2 = iocs[j];
        
        if (ioc1 && ioc2) {
          const relationship = this.findRelationshipBetweenIOCs(ioc1, ioc2);
          if (relationship) {
            relationships.push(relationship);
          }
        }
      }
    }

    return relationships;
  }

  private findRelationshipBetweenIOCs(
    ioc1: IIOC,
    ioc2: IIOC
  ): { source: IIOC; target: IIOC; type: string; confidence: number; metadata?: Record<string, any> } | null {
    // Same source relationship
    if (ioc1.source === ioc2.source && ioc1.source !== 'internal') {
      return {
        source: ioc1,
        target: ioc2,
        type: 'same_source',
        confidence: 0.7,
        metadata: { commonSource: ioc1.source }
      };
    }

    // Common tags relationship
    const commonTags = ioc1.tags.filter(tag => ioc2.tags.includes(tag));
    if (commonTags.length > 0) {
      return {
        source: ioc1,
        target: ioc2,
        type: 'common_tags',
        confidence: Math.min(0.9, 0.3 + (commonTags.length * 0.2)),
        metadata: { commonTags }
      };
    }

    // Temporal relationship (seen around the same time)
    const timeDiff = Math.abs(ioc1.firstSeen.getTime() - ioc2.firstSeen.getTime());
    if (timeDiff < 86400000) { // 24 hours
      return {
        source: ioc1,
        target: ioc2,
        type: 'temporal',
        confidence: 0.5,
        metadata: { timeDifferenceMs: timeDiff }
      };
    }

    // Infrastructure relationship (IP and domain)
    if ((ioc1.type === 'ip' && ioc2.type === 'domain') ||
        (ioc1.type === 'domain' && ioc2.type === 'ip')) {
      return {
        source: ioc1,
        target: ioc2,
        type: 'infrastructure',
        confidence: 0.8,
        metadata: { relationship: 'ip_domain' }
      };
    }

    return null;
  }

  private processEnrichmentRecord(
    record: IDataRecord,
    ioc: IIOC
  ): IIOCEnrichmentResult['enrichments'][0] | null {
    // Determine enrichment type based on record content
    let enrichmentType: 'reputation' | 'geolocation' | 'malware' | 'attribution' | 'context' = 'context';
    
    if (record.data.reputation || record.data.score) {
      enrichmentType = 'reputation';
    } else if (record.data.country || record.data.latitude || record.data.longitude) {
      enrichmentType = 'geolocation';
    } else if (record.data.malware || record.data.family || record.data.detection) {
      enrichmentType = 'malware';
    } else if (record.data.actor || record.data.attribution || record.data.campaign) {
      enrichmentType = 'attribution';
    }

    return {
      source: record.source,
      type: enrichmentType,
      data: record.data,
      confidence: this.calculateEnrichmentConfidence(record, ioc),
      timestamp: record.timestamp
    };
  }

  private calculateEnrichmentConfidence(record: IDataRecord, ioc: IIOC): number {
    let confidence = 0.5; // Base confidence

    // Higher confidence for exact matches
    if (record.data.value === ioc.value || record.data.indicator === ioc.value) {
      confidence += 0.3;
    }

    // Higher confidence for recent data
    const age = Date.now() - record.timestamp.getTime();
    const ageDays = age / (1000 * 60 * 60 * 24);
    if (ageDays < 7) {
      confidence += 0.2;
    } else if (ageDays < 30) {
      confidence += 0.1;
    }

    // Higher confidence for authoritative sources
    const authoritativeSources = ['virustotal', 'mandiant', 'crowdstrike', 'microsoft'];
    if (authoritativeSources.includes(record.source.toLowerCase())) {
      confidence += 0.2;
    }

    return Math.min(1.0, confidence);
  }

  private calculateRiskScore(
    ioc: IIOC,
    enrichments: IIOCEnrichmentResult['enrichments']
  ): IIOCEnrichmentResult['riskScore'] {
    const categories = {
      reputation: 0,
      malware: 0,
      attribution: 0,
      context: 0
    };

    const factors: Array<{
      factor: string;
      impact: number;
      description: string;
    }> = [];

    // Base score from IOC properties
    let baseScore = 0;
    switch (ioc.severity) {
      case 'critical':
        baseScore = 80;
        break;
      case 'high':
        baseScore = 60;
        break;
      case 'medium':
        baseScore = 40;
        break;
      case 'low':
        baseScore = 20;
        break;
    }

    factors.push({
      factor: 'base_severity',
      impact: baseScore,
      description: `Base severity: ${ioc.severity}`
    });

    // Process enrichments
    for (const enrichment of enrichments) {
      const enrichmentScore = enrichment.confidence * 100;
      
      switch (enrichment.type) {
        case 'reputation':
          const repScore = enrichment.data.reputation || enrichment.data.score || 0;
          categories.reputation = Math.max(categories.reputation, repScore * enrichment.confidence);
          factors.push({
            factor: 'reputation',
            impact: repScore * enrichment.confidence,
            description: `Reputation data from ${enrichment.source}`
          });
          break;
          
        case 'malware':
          categories.malware = Math.max(categories.malware, enrichmentScore);
          factors.push({
            factor: 'malware_association',
            impact: enrichmentScore,
            description: `Malware association from ${enrichment.source}`
          });
          break;
          
        case 'attribution':
          categories.attribution = Math.max(categories.attribution, enrichmentScore);
          factors.push({
            factor: 'threat_attribution',
            impact: enrichmentScore,
            description: `Threat actor attribution from ${enrichment.source}`
          });
          break;
          
        case 'context':
          categories.context = Math.max(categories.context, enrichmentScore * 0.5);
          factors.push({
            factor: 'contextual_data',
            impact: enrichmentScore * 0.5,
            description: `Contextual information from ${enrichment.source}`
          });
          break;
      }
    }

    // Calculate overall risk score
    const categoryScores = Object.values(categories);
    const maxCategoryScore = Math.max(...categoryScores);
    const avgCategoryScore = categoryScores.reduce((sum, score) => sum + score, 0) / categoryScores.length;
    
    const overall = Math.round(Math.max(baseScore, (maxCategoryScore * 0.6 + avgCategoryScore * 0.4)));

    return {
      overall: Math.min(100, overall),
      categories,
      factors: factors.sort((a, b) => b.impact - a.impact)
    };
  }

  private calculateQueryConfidence(result: IFederatedResult): number {
    const sourceCount = Object.keys(result.sourceBreakdown || {}).length;
    const baseConfidence = Math.min(0.9, 0.3 + (sourceCount * 0.15));
    
    // Factor in execution success
    const errorSources = Object.values(result.sourceBreakdown || {}).filter(
      source => source.errors && source.errors.length > 0
    ).length;
    
    const errorPenalty = errorSources * 0.1;
    
    return Math.max(0.1, baseConfidence - errorPenalty);
  }

  private async getReputationData(ioc: IIOC, _context: IQueryContext): Promise<IIOCEnrichmentResult['enrichments'][0] | null> {
    // Mock reputation enrichment - in production would call real APIs
    return {
      source: 'reputation-service',
      type: 'reputation',
      data: {
        reputation: ioc.severity === 'critical' ? 100 : 
                   ioc.severity === 'high' ? 75 :
                   ioc.severity === 'medium' ? 50 : 25,
        categories: ['malware', 'botnet'],
        firstSeen: ioc.firstSeen,
        lastSeen: ioc.lastSeen
      },
      confidence: 0.8,
      timestamp: new Date()
    };
  }

  private async getGeolocationData(ioc: IIOC, _context: IQueryContext): Promise<IIOCEnrichmentResult['enrichments'][0] | null> {
    if (ioc.type !== 'ip') return null;

    // Mock geolocation enrichment
    return {
      source: 'geolocation-service',
      type: 'geolocation',
      data: {
        country: 'Unknown',
        countryCode: 'XX',
        region: 'Unknown',
        city: 'Unknown',
        latitude: 0,
        longitude: 0,
        asn: 'AS0000',
        organization: 'Unknown'
      },
      confidence: 0.9,
      timestamp: new Date()
    };
  }

  private async getMalwareAnalysisData(ioc: IIOC, _context: IQueryContext): Promise<IIOCEnrichmentResult['enrichments'][0] | null> {
    if (ioc.type !== 'hash') return null;

    // Mock malware analysis enrichment
    return {
      source: 'malware-analysis-service',
      type: 'malware',
      data: {
        family: 'Unknown',
        detectionRatio: '0/67',
        firstSubmission: ioc.firstSeen,
        lastAnalysis: new Date(),
        signatures: [],
        behaviors: []
      },
      confidence: 0.7,
      timestamp: new Date()
    };
  }

  private mapCrossSourceLinks(
    iocs: IIOC[],
    crossSourceLinks: Array<{
      sourceEntity: IDataRecord;
      targetEntity: IDataRecord;
      similarity: number;
      linkType: string;
    }>
  ): Array<{
    localIOC: IIOC;
    externalData: IDataRecord;
    similarity: number;
    linkType: string;
  }> {
    const mappedLinks: Array<{
      localIOC: IIOC;
      externalData: IDataRecord;
      similarity: number;
      linkType: string;
    }> = [];

    for (const link of crossSourceLinks) {
      const localIOC = iocs.find(ioc => 
        ioc._id?.toString() === link.sourceEntity.id ||
        ioc.value === link.sourceEntity.data.value
      );

      if (localIOC) {
        mappedLinks.push({
          localIOC,
          externalData: link.targetEntity,
          similarity: link.similarity,
          linkType: link.linkType
        });
      }
    }

    return mappedLinks;
  }

  private extractCampaigns(
    analytics: IAnalyticsResult,
    iocs: IIOC[],
    options: any
  ): Array<any> {
    const campaigns: Array<any> = [];

    // Group findings by pattern type to identify campaigns
    const campaignFindings = analytics.findings.filter(finding =>
      finding.pattern.includes('campaign') || 
      finding.pattern.includes('apt') ||
      finding.pattern.includes('botnet')
    );

    for (const finding of campaignFindings) {
      const campaignIOCs = finding.evidence
        .map(evidence => iocs.find(ioc => ioc._id?.toString() === evidence.id))
        .filter(Boolean) as IIOC[];

      if (campaignIOCs.length >= (options.minIOCs || 3)) {
        campaigns.push({
          campaignId: `campaign-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          name: finding.pattern,
          iocs: campaignIOCs,
          confidence: finding.score / 100,
          timeline: this.buildCampaignTimeline(campaignIOCs),
          techniques: this.extractTechniques(finding),
          infrastructure: this.extractInfrastructure(campaignIOCs)
        });
      }
    }

    return campaigns;
  }

  private buildCampaignTimeline(iocs: IIOC[]): Array<{
    date: Date;
    activity: string;
    iocs: string[];
  }> {
    const timeline: Array<{
      date: Date;
      activity: string;
      iocs: string[];
    }> = [];

    // Group IOCs by date
    const dateGroups = new Map<string, IIOC[]>();
    
    for (const ioc of iocs) {
      const dateKey = ioc.firstSeen.toISOString().split('T')[0];
      if (dateKey && !dateGroups.has(dateKey)) {
        dateGroups.set(dateKey, []);
      }
      if (dateKey) {
        dateGroups.get(dateKey)!.push(ioc);
      }
    }

    // Create timeline entries
    for (const [dateKey, dateIOCs] of dateGroups.entries()) {
      timeline.push({
        date: new Date(dateKey),
        activity: `${dateIOCs.length} indicators observed`,
        iocs: dateIOCs.map(ioc => ioc.value)
      });
    }

    return timeline.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  private extractTechniques(finding: any): string[] {
    // Extract MITRE techniques from finding metadata
    const techniques = [];
    
    if (finding.metadata?.techniques) {
      techniques.push(...finding.metadata.techniques);
    }
    
    // Default techniques based on pattern
    switch (finding.pattern) {
      case 'apt-campaign':
        techniques.push('T1566', 'T1078', 'T1005');
        break;
      case 'botnet-activity':
        techniques.push('T1071', 'T1055', 'T1027');
        break;
      case 'data-exfiltration':
        techniques.push('T1041', 'T1020', 'T1002');
        break;
    }

    return Array.from(new Set(techniques));
  }

  private extractInfrastructure(iocs: IIOC[]): Array<{
    type: string;
    value: string;
    role: string;
    confidence: number;
  }> {
    const infrastructure: Array<{
      type: string;
      value: string;
      role: string;
      confidence: number;
    }> = [];

    for (const ioc of iocs) {
      let role = 'unknown';
      
      switch (ioc.type) {
        case 'ip':
          role = 'command_control';
          break;
        case 'domain':
          role = 'command_control';
          break;
        case 'url':
          role = 'payload_delivery';
          break;
        case 'hash':
          role = 'malware';
          break;
        case 'email':
          role = 'phishing';
          break;
      }

      infrastructure.push({
        type: ioc.type,
        value: ioc.value,
        role,
        confidence: ioc.confidence / 100
      });
    }

    return infrastructure;
  }

  private generateHuntingRecommendations(
    ioc: IIOC,
    _analytics: IAnalyticsResult,
    _relatedResult: IFederatedResult
  ): Array<{
    technique: string;
    description: string;
    queries: Array<{
      source: string;
      query: string;
      description: string;
    }>;
    indicators: string[];
    priority: 'low' | 'medium' | 'high' | 'critical';
  }> {
    const recommendations: Array<any> = [];

    // Generate recommendations based on IOC type
    switch (ioc.type) {
      case 'ip':
        recommendations.push({
          technique: 'network_connections',
          description: 'Hunt for network connections to this IP address',
          queries: [
            {
              source: 'network_logs',
              query: `dest_ip:"${ioc.value}"`,
              description: 'Search for outbound connections to the IP'
            },
            {
              source: 'proxy_logs',
              query: `server_ip:"${ioc.value}"`,
              description: 'Search proxy logs for connections'
            }
          ],
          indicators: [ioc.value],
          priority: ioc.severity as 'low' | 'medium' | 'high' | 'critical'
        });
        break;

      case 'domain':
        recommendations.push({
          technique: 'dns_queries',
          description: 'Hunt for DNS queries to this domain',
          queries: [
            {
              source: 'dns_logs',
              query: `query:"${ioc.value}"`,
              description: 'Search for DNS queries to the domain'
            },
            {
              source: 'web_logs',
              query: `host:"${ioc.value}"`,
              description: 'Search web logs for requests to domain'
            }
          ],
          indicators: [ioc.value],
          priority: ioc.severity as 'low' | 'medium' | 'high' | 'critical'
        });
        break;

      case 'hash':
        recommendations.push({
          technique: 'file_analysis',
          description: 'Hunt for files matching this hash',
          queries: [
            {
              source: 'file_logs',
              query: `file_hash:"${ioc.value}"`,
              description: 'Search for files with matching hash'
            },
            {
              source: 'process_logs',
              query: `process_hash:"${ioc.value}"`,
              description: 'Search for processes with matching hash'
            }
          ],
          indicators: [ioc.value],
          priority: ioc.severity as 'low' | 'medium' | 'high' | 'critical'
        });
        break;
    }

    return recommendations;
  }
}