/**
 * CVE Correlation and Threat Intelligence Fusion Service
 * Advanced service for correlating CVEs with threat intelligence from multiple phantom-*-core modules
 */

import { EventEmitter } from 'events';
import { logger } from '../../utils/logger.js';
import { CVE } from '../../types/cve.js';
import { PhantomCoreIntegrator } from '../../packages/phantom-ml-studio/src/services/phantom-core-integrator.js';
import { UnifiedDataRecord, DataRelationship } from '../data-layer/unified/UnifiedDataStore.js';

export interface ICVECorrelationConfig {
  // Correlation Settings
  enableMitreMapping: boolean;
  enableIOCCorrelation: boolean;
  enableThreatActorMapping: boolean;
  enableVulnerabilityCorrelation: boolean;
  enableMalwareCorrelation: boolean;
  
  // Intelligence Sources
  threatIntelSources: string[];
  mitreTechniques: boolean;
  iocFeeds: boolean;
  threatActorProfiles: boolean;
  
  // Correlation Thresholds
  confidenceThreshold: number; // 0-100
  temporalWindowHours: number;
  geographicCorrelation: boolean;
  
  // Performance
  maxConcurrentCorrelations: number;
  correlationTimeoutMs: number;
  cacheResultsHours: number;
}

export interface ICVECorrelationResult {
  cve: CVE;
  correlations: {
    mitreTechniques: IMitreTechniqueCorrelation[];
    iocCorrelations: IIOCCorrelation[];
    threatActors: IThreatActorCorrelation[];
    vulnerabilityChains: IVulnerabilityChainCorrelation[];
    malwareFamilies: IMalwareCorrelation[];
    campaignLinks: ICampaignCorrelation[];
  };
  riskEnhancement: {
    originalRiskScore: number;
    enhancedRiskScore: number;
    riskFactors: string[];
    confidenceLevel: number;
  };
  recommendedActions: IRecommendedAction[];
  timestamp: Date;
}

export interface IMitreTechniqueCorrelation {
  techniqueId: string;
  techniqueName: string;
  tactics: string[];
  confidence: number;
  reasoning: string;
  subtechniques?: string[];
  procedureExamples?: string[];
}

export interface IIOCCorrelation {
  iocType: 'ip' | 'domain' | 'hash' | 'url' | 'email';
  iocValue: string;
  confidence: number;
  firstSeen: Date;
  lastSeen: Date;
  threatType: string;
  sources: string[];
  context: string;
}

export interface IThreatActorCorrelation {
  actorName: string;
  actorAliases: string[];
  confidence: number;
  motivation: string[];
  sophistication: 'low' | 'medium' | 'high' | 'advanced';
  targetSectors: string[];
  geographicFocus: string[];
  ttps: string[];
  campaigns: string[];
}

export interface IVulnerabilityChainCorrelation {
  chainId: string;
  relatedCVEs: string[];
  exploitPath: string[];
  chainSeverity: 'low' | 'medium' | 'high' | 'critical';
  attackComplexity: 'low' | 'medium' | 'high';
  confidence: number;
}

export interface IMalwareCorrelation {
  malwareFamily: string;
  malwareVariants: string[];
  exploitsCVE: boolean;
  confidence: number;
  firstObserved: Date;
  capabilities: string[];
  targetPlatforms: string[];
}

export interface ICampaignCorrelation {
  campaignName: string;
  campaignId: string;
  isActive: boolean;
  confidence: number;
  timeframe: {
    start: Date;
    end?: Date;
  };
  targetSectors: string[];
  geographicTargets: string[];
  attributedActors: string[];
}

export interface IRecommendedAction {
  type: 'patch' | 'mitigate' | 'monitor' | 'investigate' | 'isolate';
  priority: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  timeframe: string;
  reasoning: string;
  dependencies?: string[];
  resources?: string[];
}

export interface IThreatIntelligenceContext {
  cve: CVE;
  relatedEntities: UnifiedDataRecord[];
  relationships: DataRelationship[];
  temporalContext: {
    publishedDate: Date;
    exploitTimeframe?: Date;
    patchAvailability?: Date;
  };
}

export class CVECorrelationService extends EventEmitter {
  private config: ICVECorrelationConfig;
  private phantomIntegrator: PhantomCoreIntegrator;
  private correlationCache: Map<string, ICVECorrelationResult> = new Map();
  private processingQueue: CVE[] = [];
  private isProcessing = false;

  constructor(
    config: ICVECorrelationConfig,
    phantomIntegrator: PhantomCoreIntegrator
  ) {
    super();
    this.config = config;
    this.phantomIntegrator = phantomIntegrator;
    
    logger.info('CVE Correlation Service initialized', {
      enableMitreMapping: config.enableMitreMapping,
      enableIOCCorrelation: config.enableIOCCorrelation,
      confidenceThreshold: config.confidenceThreshold,
    });
  }

  /**
   * Correlate CVE with threat intelligence from all phantom-*-core modules
   */
  public async correlateCVE(cve: CVE): Promise<ICVECorrelationResult> {
    try {
      logger.info('Starting CVE correlation', { cveId: cve.cveId });

      // Check cache first
      const cacheKey = this.generateCacheKey(cve);
      if (this.correlationCache.has(cacheKey)) {
        const cached = this.correlationCache.get(cacheKey)!;
        if (this.isCacheValid(cached)) {
          logger.debug('Returning cached correlation result', { cveId: cve.cveId });
          return cached;
        }
      }

      // Build threat intelligence context
      const context = await this.buildThreatIntelContext(cve);
      
      // Perform correlations
      const correlations = await this.performCorrelations(context);
      
      // Enhance risk assessment
      const riskEnhancement = await this.enhanceRiskAssessment(cve, correlations);
      
      // Generate recommended actions
      const recommendedActions = await this.generateRecommendedActions(cve, correlations, riskEnhancement);

      const result: ICVECorrelationResult = {
        cve,
        correlations,
        riskEnhancement,
        recommendedActions,
        timestamp: new Date(),
      };

      // Cache result
      this.correlationCache.set(cacheKey, result);
      
      // Emit correlation event
      this.emit('cve-correlated', result);

      logger.info('CVE correlation completed', {
        cveId: cve.cveId,
        correlationsFound: this.countCorrelations(correlations),
        enhancedRiskScore: riskEnhancement.enhancedRiskScore,
      });

      return result;

    } catch (error) {
      const errorMessage = `CVE correlation failed for ${cve.cveId}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      logger.error(errorMessage, error);
      throw error;
    }
  }

  /**
   * Bulk correlate multiple CVEs
   */
  public async correlateBulkCVEs(cves: CVE[]): Promise<ICVECorrelationResult[]> {
    const results: ICVECorrelationResult[] = [];
    const batchSize = this.config.maxConcurrentCorrelations;
    
    for (let i = 0; i < cves.length; i += batchSize) {
      const batch = cves.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(cve => this.correlateCVE(cve).catch(error => {
          logger.error(`Failed to correlate CVE ${cve.cveId}`, error);
          return null;
        }))
      );
      
      results.push(...batchResults.filter(result => result !== null) as ICVECorrelationResult[]);
    }
    
    return results;
  }

  /**
   * Get trending correlations
   */
  public async getTrendingCorrelations(
    timeRange: { start: Date; end: Date },
    limit: number = 50
  ): Promise<{
    topMitreTechniques: { techniqueId: string; count: number; avgConfidence: number }[];
    topThreatActors: { actorName: string; count: number; avgConfidence: number }[];
    emergingThreats: { pattern: string; count: number; confidence: number }[];
  }> {
    try {
      // Analyze cached correlations within time range
      const relevantResults = Array.from(this.correlationCache.values())
        .filter(result => 
          result.timestamp >= timeRange.start && 
          result.timestamp <= timeRange.end
        );

      // Aggregate MITRE techniques
      const mitreCount = new Map<string, { count: number; confidenceSum: number }>();
      relevantResults.forEach(result => {
        result.correlations.mitreTechniques.forEach(technique => {
          const key = technique.techniqueId;
          const existing = mitreCount.get(key) || { count: 0, confidenceSum: 0 };
          mitreCount.set(key, {
            count: existing.count + 1,
            confidenceSum: existing.confidenceSum + technique.confidence,
          });
        });
      });

      const topMitreTechniques = Array.from(mitreCount.entries())
        .map(([techniqueId, data]) => ({
          techniqueId,
          count: data.count,
          avgConfidence: data.confidenceSum / data.count,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);

      // Aggregate threat actors
      const actorCount = new Map<string, { count: number; confidenceSum: number }>();
      relevantResults.forEach(result => {
        result.correlations.threatActors.forEach(actor => {
          const key = actor.actorName;
          const existing = actorCount.get(key) || { count: 0, confidenceSum: 0 };
          actorCount.set(key, {
            count: existing.count + 1,
            confidenceSum: existing.confidenceSum + actor.confidence,
          });
        });
      });

      const topThreatActors = Array.from(actorCount.entries())
        .map(([actorName, data]) => ({
          actorName,
          count: data.count,
          avgConfidence: data.confidenceSum / data.count,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);

      // Identify emerging patterns
      const emergingThreats = await this.identifyEmergingThreats(relevantResults);

      return {
        topMitreTechniques,
        topThreatActors,
        emergingThreats,
      };

    } catch (error) {
      logger.error('Failed to get trending correlations', error);
      throw error;
    }
  }

  /**
   * Private methods
   */

  private async buildThreatIntelContext(cve: CVE): Promise<IThreatIntelligenceContext> {
    try {
      // Get related entities from unified data store
      const relatedEntities = await this.findRelatedEntities(cve);
      
      // Get relationships
      const relationships = await this.findRelationships(cve, relatedEntities);

      return {
        cve,
        relatedEntities,
        relationships,
        temporalContext: {
          publishedDate: new Date(cve.publishedDate),
          exploitTimeframe: cve.exploitInfo.exploitAvailable ? 
            new Date(cve.publishedDate) : undefined,
          patchAvailability: cve.patchInfo.patchAvailable ? 
            cve.patchInfo.patchDate ? new Date(cve.patchInfo.patchDate) : undefined : undefined,
        },
      };

    } catch (error) {
      logger.error('Failed to build threat intel context', error);
      throw error;
    }
  }

  private async performCorrelations(
    context: IThreatIntelligenceContext
  ): Promise<ICVECorrelationResult['correlations']> {
    const correlations: ICVECorrelationResult['correlations'] = {
      mitreTechniques: [],
      iocCorrelations: [],
      threatActors: [],
      vulnerabilityChains: [],
      malwareFamilies: [],
      campaignLinks: [],
    };

    // MITRE ATT&CK correlation
    if (this.config.enableMitreMapping && this.phantomIntegrator.cores.mitre) {
      correlations.mitreTechniques = await this.correlateMitreTechniques(context);
    }

    // IOC correlation
    if (this.config.enableIOCCorrelation && this.phantomIntegrator.cores.ioc) {
      correlations.iocCorrelations = await this.correlateIOCs(context);
    }

    // Threat actor correlation
    if (this.config.enableThreatActorMapping && this.phantomIntegrator.cores.threatActor) {
      correlations.threatActors = await this.correlateThreatActors(context);
    }

    // Vulnerability chain analysis
    if (this.config.enableVulnerabilityCorrelation && this.phantomIntegrator.cores.vulnerability) {
      correlations.vulnerabilityChains = await this.correlateVulnerabilityChains(context);
    }

    // Malware correlation
    if (this.config.enableMalwareCorrelation && this.phantomIntegrator.cores.malware) {
      correlations.malwareFamilies = await this.correlateMalware(context);
    }

    // Campaign correlation
    correlations.campaignLinks = await this.correlateCampaigns(context);

    return correlations;
  }

  private async correlateMitreTechniques(
    context: IThreatIntelligenceContext
  ): Promise<IMitreTechniqueCorrelation[]> {
    try {
      const techniques: IMitreTechniqueCorrelation[] = [];
      
      // Use phantom-mitre-core for technique mapping
      if (this.phantomIntegrator.cores.mitre) {
        const mitreMapping = await this.phantomIntegrator.cores.mitre.mapVulnerabilityToTechniques({
          cveId: context.cve.cveId,
          description: context.cve.description,
          affectedProducts: context.cve.affectedProducts,
          weaknesses: context.cve.weaknesses,
        });

        if (mitreMapping && mitreMapping.techniques) {
          techniques.push(...mitreMapping.techniques.map((tech: any) => ({
            techniqueId: tech.techniqueId,
            techniqueName: tech.name,
            tactics: tech.tactics || [],
            confidence: tech.confidence || 70,
            reasoning: tech.reasoning || 'Automated CVE-to-technique mapping',
            subtechniques: tech.subtechniques || [],
            procedureExamples: tech.procedures || [],
          })));
        }
      }

      // Filter by confidence threshold
      return techniques.filter(tech => tech.confidence >= this.config.confidenceThreshold);

    } catch (error) {
      logger.error('MITRE technique correlation failed', error);
      return [];
    }
  }

  private async correlateIOCs(
    context: IThreatIntelligenceContext
  ): Promise<IIOCCorrelation[]> {
    try {
      const iocCorrelations: IIOCCorrelation[] = [];
      
      if (this.phantomIntegrator.cores.ioc) {
        // Search for IOCs related to this CVE
        const relatedIOCs = await this.phantomIntegrator.cores.ioc.searchRelatedIOCs({
          cveId: context.cve.cveId,
          timeWindow: this.config.temporalWindowHours,
          confidence: this.config.confidenceThreshold,
        });

        if (relatedIOCs) {
          iocCorrelations.push(...relatedIOCs.map((ioc: any) => ({
            iocType: ioc.type,
            iocValue: ioc.value,
            confidence: ioc.confidence,
            firstSeen: new Date(ioc.firstSeen),
            lastSeen: new Date(ioc.lastSeen),
            threatType: ioc.threatType,
            sources: ioc.sources,
            context: ioc.context,
          })));
        }
      }

      return iocCorrelations.filter(ioc => ioc.confidence >= this.config.confidenceThreshold);

    } catch (error) {
      logger.error('IOC correlation failed', error);
      return [];
    }
  }

  private async correlateThreatActors(
    context: IThreatIntelligenceContext
  ): Promise<IThreatActorCorrelation[]> {
    try {
      const threatActors: IThreatActorCorrelation[] = [];
      
      if (this.phantomIntegrator.cores.threatActor) {
        // Search for threat actors using this CVE
        const relatedActors = await this.phantomIntegrator.cores.threatActor.findActorsByCVE({
          cveId: context.cve.cveId,
          timeWindow: this.config.temporalWindowHours,
        });

        if (relatedActors) {
          threatActors.push(...relatedActors.map((actor: any) => ({
            actorName: actor.name,
            actorAliases: actor.aliases || [],
            confidence: actor.confidence || 60,
            motivation: actor.motivation || [],
            sophistication: actor.sophistication || 'medium',
            targetSectors: actor.targetSectors || [],
            geographicFocus: actor.geographicFocus || [],
            ttps: actor.ttps || [],
            campaigns: actor.campaigns || [],
          })));
        }
      }

      return threatActors.filter(actor => actor.confidence >= this.config.confidenceThreshold);

    } catch (error) {
      logger.error('Threat actor correlation failed', error);
      return [];
    }
  }

  private async correlateVulnerabilityChains(
    context: IThreatIntelligenceContext
  ): Promise<IVulnerabilityChainCorrelation[]> {
    try {
      const chains: IVulnerabilityChainCorrelation[] = [];
      
      if (this.phantomIntegrator.cores.vulnerability) {
        // Find vulnerability exploitation chains
        const vulnChains = await this.phantomIntegrator.cores.vulnerability.findExploitChains({
          cveId: context.cve.cveId,
          maxChainLength: 5,
        });

        if (vulnChains) {
          chains.push(...vulnChains.map((chain: any) => ({
            chainId: chain.id,
            relatedCVEs: chain.cves,
            exploitPath: chain.path,
            chainSeverity: chain.severity,
            attackComplexity: chain.complexity,
            confidence: chain.confidence,
          })));
        }
      }

      return chains.filter(chain => chain.confidence >= this.config.confidenceThreshold);

    } catch (error) {
      logger.error('Vulnerability chain correlation failed', error);
      return [];
    }
  }

  private async correlateMalware(
    context: IThreatIntelligenceContext
  ): Promise<IMalwareCorrelation[]> {
    try {
      const malware: IMalwareCorrelation[] = [];
      
      if (this.phantomIntegrator.cores.malware) {
        // Find malware exploiting this CVE
        const relatedMalware = await this.phantomIntegrator.cores.malware.findMalwareExploitingCVE({
          cveId: context.cve.cveId,
        });

        if (relatedMalware) {
          malware.push(...relatedMalware.map((mal: any) => ({
            malwareFamily: mal.family,
            malwareVariants: mal.variants || [],
            exploitsCVE: true,
            confidence: mal.confidence || 80,
            firstObserved: new Date(mal.firstObserved),
            capabilities: mal.capabilities || [],
            targetPlatforms: mal.platforms || [],
          })));
        }
      }

      return malware.filter(mal => mal.confidence >= this.config.confidenceThreshold);

    } catch (error) {
      logger.error('Malware correlation failed', error);
      return [];
    }
  }

  private async correlateCampaigns(
    context: IThreatIntelligenceContext
  ): Promise<ICampaignCorrelation[]> {
    try {
      const campaigns: ICampaignCorrelation[] = [];
      
      // This would integrate with campaign intelligence from various sources
      // For now, return empty array
      
      return campaigns;

    } catch (error) {
      logger.error('Campaign correlation failed', error);
      return [];
    }
  }

  private async enhanceRiskAssessment(
    cve: CVE,
    correlations: ICVECorrelationResult['correlations']
  ): Promise<ICVECorrelationResult['riskEnhancement']> {
    const originalRiskScore = cve.riskAssessment.riskScore;
    let enhancedRiskScore = originalRiskScore;
    const riskFactors: string[] = [];

    // Enhance based on threat actor involvement
    if (correlations.threatActors.length > 0) {
      const sophisticatedActors = correlations.threatActors.filter(
        actor => actor.sophistication === 'advanced' || actor.sophistication === 'high'
      );
      if (sophisticatedActors.length > 0) {
        enhancedRiskScore += 15;
        riskFactors.push('Associated with sophisticated threat actors');
      }
    }

    // Enhance based on active exploitation
    if (correlations.iocCorrelations.length > 0) {
      enhancedRiskScore += 10;
      riskFactors.push('IOCs suggest active exploitation');
    }

    // Enhance based on MITRE technique criticality
    const criticalTechniques = correlations.mitreTechniques.filter(
      tech => tech.tactics.includes('initial-access') || tech.tactics.includes('persistence')
    );
    if (criticalTechniques.length > 0) {
      enhancedRiskScore += 10;
      riskFactors.push('Mapped to critical MITRE ATT&CK techniques');
    }

    // Enhance based on vulnerability chains
    if (correlations.vulnerabilityChains.length > 0) {
      enhancedRiskScore += 8;
      riskFactors.push('Part of vulnerability exploitation chains');
    }

    // Enhance based on malware usage
    if (correlations.malwareFamilies.length > 0) {
      enhancedRiskScore += 12;
      riskFactors.push('Actively exploited by malware families');
    }

    // Cap at 100
    enhancedRiskScore = Math.min(enhancedRiskScore, 100);

    // Calculate confidence level
    const totalCorrelations = this.countCorrelations(correlations);
    const confidenceLevel = Math.min(50 + (totalCorrelations * 5), 95);

    return {
      originalRiskScore,
      enhancedRiskScore,
      riskFactors,
      confidenceLevel,
    };
  }

  private async generateRecommendedActions(
    cve: CVE,
    correlations: ICVECorrelationResult['correlations'],
    riskEnhancement: ICVECorrelationResult['riskEnhancement']
  ): Promise<IRecommendedAction[]> {
    const actions: IRecommendedAction[] = [];

    // High-risk CVEs with threat actor involvement
    if (riskEnhancement.enhancedRiskScore >= 80 && correlations.threatActors.length > 0) {
      actions.push({
        type: 'patch',
        priority: 'critical',
        description: 'Immediate patching required due to threat actor targeting',
        timeframe: '24 hours',
        reasoning: 'CVE is being actively targeted by known threat actors',
      });
    }

    // CVEs with active IOCs
    if (correlations.iocCorrelations.length > 0) {
      actions.push({
        type: 'monitor',
        priority: 'high',
        description: 'Enhanced monitoring for associated IOCs',
        timeframe: 'Continuous',
        reasoning: 'IOCs suggest active exploitation in the wild',
        resources: correlations.iocCorrelations.map(ioc => `${ioc.iocType}: ${ioc.iocValue}`),
      });
    }

    // CVEs part of exploitation chains
    if (correlations.vulnerabilityChains.length > 0) {
      actions.push({
        type: 'investigate',
        priority: 'medium',
        description: 'Investigate for related vulnerabilities in exploitation chain',
        timeframe: '48 hours',
        reasoning: 'CVE is part of known vulnerability exploitation chains',
      });
    }

    // Default patching recommendation
    if (cve.patchInfo.patchAvailable) {
      actions.push({
        type: 'patch',
        priority: riskEnhancement.enhancedRiskScore >= 60 ? 'high' : 'medium',
        description: 'Apply available security patch',
        timeframe: riskEnhancement.enhancedRiskScore >= 60 ? '72 hours' : '30 days',
        reasoning: 'Security patch available from vendor',
      });
    }

    return actions;
  }

  private async findRelatedEntities(cve: CVE): Promise<UnifiedDataRecord[]> {
    // This would use the unified data store to find related entities
    return [];
  }

  private async findRelationships(
    cve: CVE,
    entities: UnifiedDataRecord[]
  ): Promise<DataRelationship[]> {
    // This would find relationships between the CVE and other entities
    return [];
  }

  private countCorrelations(correlations: ICVECorrelationResult['correlations']): number {
    return (
      correlations.mitreTechniques.length +
      correlations.iocCorrelations.length +
      correlations.threatActors.length +
      correlations.vulnerabilityChains.length +
      correlations.malwareFamilies.length +
      correlations.campaignLinks.length
    );
  }

  private generateCacheKey(cve: CVE): string {
    return `correlation_${cve.cveId}_${cve.lastModifiedDate}`;
  }

  private isCacheValid(result: ICVECorrelationResult): boolean {
    const ageHours = (Date.now() - result.timestamp.getTime()) / (1000 * 60 * 60);
    return ageHours < this.config.cacheResultsHours;
  }

  private async identifyEmergingThreats(
    results: ICVECorrelationResult[]
  ): Promise<{ pattern: string; count: number; confidence: number }[]> {
    // Analyze patterns in correlations to identify emerging threats
    // This is a simplified implementation
    const patterns: Map<string, { count: number; confidence: number }> = new Map();

    results.forEach(result => {
      // Look for patterns in threat actor targeting
      result.correlations.threatActors.forEach(actor => {
        actor.targetSectors.forEach(sector => {
          const pattern = `${actor.actorName} targeting ${sector}`;
          const existing = patterns.get(pattern) || { count: 0, confidence: 0 };
          patterns.set(pattern, {
            count: existing.count + 1,
            confidence: Math.max(existing.confidence, actor.confidence),
          });
        });
      });

      // Look for patterns in MITRE techniques
      const techniquePattern = result.correlations.mitreTechniques
        .map(t => t.techniqueId)
        .sort()
        .join(',');
      
      if (techniquePattern) {
        const existing = patterns.get(techniquePattern) || { count: 0, confidence: 0 };
        const avgConfidence = result.correlations.mitreTechniques.reduce(
          (sum, t) => sum + t.confidence, 0
        ) / result.correlations.mitreTechniques.length;
        
        patterns.set(techniquePattern, {
          count: existing.count + 1,
          confidence: Math.max(existing.confidence, avgConfidence),
        });
      }
    });

    return Array.from(patterns.entries())
      .map(([pattern, data]) => ({ pattern, ...data }))
      .filter(item => item.count >= 3) // Minimum occurrences for emerging threat
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }
}