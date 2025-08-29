import { IOC, IIOC } from '../models/IOC';
import { logger } from '../utils/logger';

export interface RiskAssessment {
  overallRisk: number; // 0-100
  riskCategory: 'low' | 'medium' | 'high' | 'critical';
  contributingFactors: string[];
  recommendations: string[];
  confidence: number;
  analysis: {
    typeRisk: number;
    contextualRisk: number;
    temporalRisk: number;
    sourceReliability: number;
  };
}

export interface IOCPriority {
  priority: number; // 1-10 (10 highest)
  urgency: 'low' | 'medium' | 'high' | 'critical';
  reasoning: string[];
  suggestedActions: string[];
}

export interface IOCCorrelation {
  relatedIOCs: IIOC[];
  relationshipType: 'duplicate' | 'similar' | 'campaign' | 'infrastructure' | 'behavioral';
  confidenceScore: number;
  evidence: string[];
}

/**
 * IOC Analysis Service - Advanced business logic for risk assessment and prioritization
 */
export class IOCAnalysisService {
  /**
   * Comprehensive risk assessment for an IOC
   */
  static async assessRisk(ioc: IIOC): Promise<RiskAssessment> {
    const assessment: RiskAssessment = {
      overallRisk: 0,
      riskCategory: 'low',
      contributingFactors: [],
      recommendations: [],
      confidence: ioc.confidence,
      analysis: {
        typeRisk: 0,
        contextualRisk: 0,
        temporalRisk: 0,
        sourceReliability: 0,
      },
    };

    // Calculate risk components
    assessment.analysis.typeRisk = this.calculateTypeBasedRisk(ioc);
    assessment.analysis.contextualRisk = await this.calculateContextualRisk(ioc);
    assessment.analysis.temporalRisk = this.calculateTemporalRisk(ioc);
    assessment.analysis.sourceReliability = this.calculateSourceReliability(ioc);

    // Calculate overall risk (weighted average)
    assessment.overallRisk = Math.round(
      (assessment.analysis.typeRisk * 0.3 +
        assessment.analysis.contextualRisk * 0.4 +
        assessment.analysis.temporalRisk * 0.2 +
        assessment.analysis.sourceReliability * 0.1)
    );

    // Determine risk category
    assessment.riskCategory = this.determineRiskCategory(assessment.overallRisk);

    // Generate contributing factors and recommendations
    this.generateRiskAnalysis(ioc, assessment);

    logger.info(`Risk assessment completed for IOC: ${ioc.value}`, {
      overallRisk: assessment.overallRisk,
      riskCategory: assessment.riskCategory,
    });

    return assessment;
  }

  /**
   * Calculate priority for IOC handling
   */
  static async calculatePriority(ioc: IIOC): Promise<IOCPriority> {
    const riskAssessment = await this.assessRisk(ioc);
    
    const priority: IOCPriority = {
      priority: 1,
      urgency: 'low',
      reasoning: [],
      suggestedActions: [],
    };

    // Base priority on risk assessment
    if (riskAssessment.overallRisk >= 80) {
      priority.priority = 10;
      priority.urgency = 'critical';
      priority.reasoning.push('Critical risk level detected');
    } else if (riskAssessment.overallRisk >= 60) {
      priority.priority = 7;
      priority.urgency = 'high';
      priority.reasoning.push('High risk level detected');
    } else if (riskAssessment.overallRisk >= 40) {
      priority.priority = 5;
      priority.urgency = 'medium';
      priority.reasoning.push('Medium risk level detected');
    } else {
      priority.priority = 3;
      priority.urgency = 'low';
      priority.reasoning.push('Low risk level detected');
    }

    // Adjust priority based on additional factors
    this.adjustPriorityFactors(ioc, priority);

    // Generate suggested actions
    this.generateSuggestedActions(ioc, riskAssessment, priority);

    logger.info(`Priority calculated for IOC: ${ioc.value}`, {
      priority: priority.priority,
      urgency: priority.urgency,
    });

    return priority;
  }

  /**
   * Find correlated IOCs
   */
  static async findCorrelatedIOCs(ioc: IIOC): Promise<IOCCorrelation[]> {
    const correlations: IOCCorrelation[] = [];

    try {
      // Find duplicate IOCs (same value, different metadata)
      const duplicates = await this.findDuplicateIOCs(ioc);
      if (duplicates.length > 0) {
        correlations.push({
          relatedIOCs: duplicates,
          relationshipType: 'duplicate',
          confidenceScore: 100,
          evidence: ['Exact value match'],
        });
      }

      // Find similar IOCs (same type, similar characteristics)
      const similar = await this.findSimilarIOCs(ioc);
      if (similar.length > 0) {
        correlations.push({
          relatedIOCs: similar,
          relationshipType: 'similar',
          confidenceScore: 75,
          evidence: ['Similar characteristics and patterns'],
        });
      }

      // Find campaign-related IOCs (shared tags, timeframe)
      const campaignRelated = await this.findCampaignRelatedIOCs(ioc);
      if (campaignRelated.length > 0) {
        correlations.push({
          relatedIOCs: campaignRelated,
          relationshipType: 'campaign',
          confidenceScore: 80,
          evidence: ['Shared tags and temporal proximity'],
        });
      }

      // Find infrastructure-related IOCs (domains, IPs in same network)
      const infrastructureRelated = await this.findInfrastructureRelatedIOCs(ioc);
      if (infrastructureRelated.length > 0) {
        correlations.push({
          relatedIOCs: infrastructureRelated,
          relationshipType: 'infrastructure',
          confidenceScore: 70,
          evidence: ['Infrastructure relationships detected'],
        });
      }

      logger.info(`Correlation analysis completed for IOC: ${ioc.value}`, {
        correlationCount: correlations.length,
        totalRelatedIOCs: correlations.reduce((sum, c) => sum + c.relatedIOCs.length, 0),
      });

    } catch (error) {
      logger.error(`Error during correlation analysis for IOC: ${ioc.value}`, error);
    }

    return correlations;
  }

  /**
   * Calculate type-based risk score
   */
  private static calculateTypeBasedRisk(ioc: IIOC): number {
    const typeRiskMap = {
      ip: 70, // IPs can be easily changed but indicate direct infrastructure
      domain: 80, // Domains are more persistent and indicate infrastructure
      url: 85, // URLs are specific attack vectors
      hash: 90, // File hashes are definitive malware indicators
      email: 75, // Email addresses indicate phishing or spam
    };

    let baseRisk = typeRiskMap[ioc.type] || 50;

    // Adjust based on metadata
    if (ioc.metadata?.isPrivateRange) {
      baseRisk -= 20; // Private IPs are less threatening
    }

    if (ioc.metadata?.hashType === 'MD5' || ioc.metadata?.hashType === 'SHA1') {
      baseRisk -= 10; // Weaker hash algorithms
    }

    return Math.max(0, Math.min(100, baseRisk));
  }

  /**
   * Calculate contextual risk based on tags and description
   */
  private static async calculateContextualRisk(ioc: IIOC): Promise<number> {
    let contextRisk = 50; // Base contextual risk

    // High-risk tags increase the score
    const highRiskTags = ['malware', 'ransomware', 'apt', 'c2', 'botnet', 'phishing', 'exploit'];
    const mediumRiskTags = ['suspicious', 'trojan', 'backdoor', 'rat', 'keylogger'];
    const lowRiskTags = ['tracking', 'advertising', 'pup', 'greyware'];

    if (ioc.tags) {
      for (const tag of ioc.tags) {
        const lowerTag = tag.toLowerCase();
        if (highRiskTags.some(t => lowerTag.includes(t))) {
          contextRisk += 20;
        } else if (mediumRiskTags.some(t => lowerTag.includes(t))) {
          contextRisk += 10;
        } else if (lowRiskTags.some(t => lowerTag.includes(t))) {
          contextRisk -= 10;
        }
      }
    }

    // Analyze description for risk keywords
    if (ioc.description) {
      const description = ioc.description.toLowerCase();
      const criticalKeywords = ['zero-day', 'rce', 'privilege escalation', 'data exfiltration'];
      const highKeywords = ['exploit', 'vulnerability', 'backdoor', 'command and control'];
      
      for (const keyword of criticalKeywords) {
        if (description.includes(keyword)) {
          contextRisk += 25;
        }
      }
      
      for (const keyword of highKeywords) {
        if (description.includes(keyword)) {
          contextRisk += 15;
        }
      }
    }

    return Math.max(0, Math.min(100, contextRisk));
  }

  /**
   * Calculate temporal risk based on recency and activity
   */
  private static calculateTemporalRisk(ioc: IIOC): number {
    const now = new Date();
    const daysSinceFirst = (now.getTime() - ioc.firstSeen.getTime()) / (1000 * 60 * 60 * 24);
    const daysSinceLast = (now.getTime() - ioc.lastSeen.getTime()) / (1000 * 60 * 60 * 24);

    let temporalRisk = 50;

    // Recently seen IOCs are more dangerous
    if (daysSinceLast <= 1) {
      temporalRisk += 30; // Active in last 24 hours
    } else if (daysSinceLast <= 7) {
      temporalRisk += 20; // Active in last week
    } else if (daysSinceLast <= 30) {
      temporalRisk += 10; // Active in last month
    } else if (daysSinceLast > 365) {
      temporalRisk -= 20; // Very old IOCs are less relevant
    }

    // Persistent IOCs (long time between first and last seen) can be infrastructure
    const persistenceDays = Math.abs(daysSinceFirst - daysSinceLast);
    if (persistenceDays > 30) {
      temporalRisk += 15; // Persistent infrastructure
    }

    // Inactive IOCs lose relevance
    if (!ioc.isActive) {
      temporalRisk -= 25;
    }

    return Math.max(0, Math.min(100, temporalRisk));
  }

  /**
   * Calculate source reliability score
   */
  private static calculateSourceReliability(ioc: IIOC): number {
    const source = ioc.source.toLowerCase();
    
    // Known reliable sources get higher scores
    const reliableSources = ['virustotal', 'abuse.ch', 'malwaredomainlist', 'emergingthreats'];
    const moderatelyReliableSources = ['openphish', 'phishtank', 'urlvoid'];
    const internalSources = ['internal', 'analyst', 'honeypot', 'ids'];

    let reliabilityScore = 50; // Base reliability

    if (reliableSources.some(s => source.includes(s))) {
      reliabilityScore = 90;
    } else if (moderatelyReliableSources.some(s => source.includes(s))) {
      reliabilityScore = 75;
    } else if (internalSources.some(s => source.includes(s))) {
      reliabilityScore = 85; // Internal sources are generally reliable
    } else if (source.includes('automated') || source.includes('script')) {
      reliabilityScore = 60; // Automated sources need verification
    } else if (source.includes('unknown') || source.length < 5) {
      reliabilityScore = 30; // Unknown or vague sources
    }

    return reliabilityScore;
  }

  /**
   * Determine risk category from numeric score
   */
  private static determineRiskCategory(riskScore: number): 'low' | 'medium' | 'high' | 'critical' {
    if (riskScore >= 80) return 'critical';
    if (riskScore >= 60) return 'high';
    if (riskScore >= 40) return 'medium';
    return 'low';
  }

  /**
   * Generate risk analysis details
   */
  private static generateRiskAnalysis(ioc: IIOC, assessment: RiskAssessment): void {
    const { analysis } = assessment;

    // Type-based factors
    if (analysis.typeRisk > 80) {
      assessment.contributingFactors.push(`High-risk IOC type: ${ioc.type}`);
    }

    // Contextual factors
    if (analysis.contextualRisk > 70) {
      assessment.contributingFactors.push('High-risk contextual indicators detected');
    }

    // Temporal factors
    if (analysis.temporalRisk > 70) {
      assessment.contributingFactors.push('Recently active or persistent threat');
    }

    // Source reliability
    if (analysis.sourceReliability < 60) {
      assessment.contributingFactors.push('Source reliability concerns');
      assessment.recommendations.push('Verify IOC through additional sources');
    }

    // Generate recommendations based on risk level
    if (assessment.overallRisk >= 80) {
      assessment.recommendations.push('Immediate action required - block/quarantine');
      assessment.recommendations.push('Escalate to security team');
      assessment.recommendations.push('Check for related indicators');
    } else if (assessment.overallRisk >= 60) {
      assessment.recommendations.push('High priority monitoring required');
      assessment.recommendations.push('Consider preventive measures');
    } else if (assessment.overallRisk >= 40) {
      assessment.recommendations.push('Add to watchlist');
      assessment.recommendations.push('Monitor for increased activity');
    } else {
      assessment.recommendations.push('Archive for future reference');
    }
  }

  /**
   * Adjust priority based on additional factors
   */
  private static adjustPriorityFactors(ioc: IIOC, priority: IOCPriority): void {
    // High confidence IOCs get priority boost
    if (ioc.confidence >= 90) {
      priority.priority = Math.min(10, priority.priority + 2);
      priority.reasoning.push('High confidence rating');
    }

    // Critical severity gets maximum priority
    if (ioc.severity === 'critical') {
      priority.priority = 10;
      priority.urgency = 'critical';
      priority.reasoning.push('Critical severity designation');
    }

    // Recently created IOCs might need immediate attention
    const hoursSinceCreated = (new Date().getTime() - ioc.createdAt.getTime()) / (1000 * 60 * 60);
    if (hoursSinceCreated <= 2) {
      priority.priority = Math.min(10, priority.priority + 1);
      priority.reasoning.push('Recently discovered threat');
    }

    // Active IOCs get priority over inactive ones
    if (!ioc.isActive) {
      priority.priority = Math.max(1, priority.priority - 2);
      priority.reasoning.push('IOC marked as inactive');
    }
  }

  /**
   * Generate suggested actions based on analysis
   */
  private static generateSuggestedActions(
    ioc: IIOC, 
    _riskAssessment: RiskAssessment, 
    priority: IOCPriority
  ): void {
    // High priority actions
    if (priority.priority >= 8) {
      priority.suggestedActions.push('Block IOC in security tools immediately');
      priority.suggestedActions.push('Search for IOC in environment');
      priority.suggestedActions.push('Alert security team');
    }

    // Medium priority actions  
    if (priority.priority >= 5) {
      priority.suggestedActions.push('Add IOC to monitoring systems');
      priority.suggestedActions.push('Review related alerts');
      priority.suggestedActions.push('Update threat hunting queries');
    }

    // Type-specific actions
    switch (ioc.type) {
      case 'ip':
        priority.suggestedActions.push('Check firewall logs for connections');
        priority.suggestedActions.push('Review proxy logs');
        break;
      case 'domain':
        priority.suggestedActions.push('Check DNS logs');
        priority.suggestedActions.push('Add to DNS blacklist');
        break;
      case 'url':
        priority.suggestedActions.push('Block URL in web proxy');
        priority.suggestedActions.push('Check web access logs');
        break;
      case 'hash':
        priority.suggestedActions.push('Search for file in environment');
        priority.suggestedActions.push('Update antivirus signatures');
        break;
      case 'email':
        priority.suggestedActions.push('Block sender in email system');
        priority.suggestedActions.push('Search for similar emails');
        break;
    }

    // Low confidence IOCs need verification
    if (ioc.confidence < 60) {
      priority.suggestedActions.push('Verify IOC through additional sources');
      priority.suggestedActions.push('Conduct manual analysis');
    }
  }

  /**
   * Find duplicate IOCs
   */
  private static async findDuplicateIOCs(ioc: IIOC): Promise<IIOC[]> {
    return await IOC.find({
      _id: { $ne: ioc._id },
      value: ioc.value,
      type: ioc.type,
    }).limit(10);
  }

  /**
   * Find similar IOCs based on characteristics
   */
  private static async findSimilarIOCs(ioc: IIOC): Promise<IIOC[]> {
    const query: any = {
      _id: { $ne: ioc._id },
      type: ioc.type,
      $or: [],
    };

    // Similar based on tags
    if (ioc.tags && ioc.tags.length > 0) {
      query.$or.push({ tags: { $in: ioc.tags } });
    }

    // Similar based on source
    query.$or.push({ source: ioc.source });

    // Similar based on severity
    query.$or.push({ severity: ioc.severity });

    if (query.$or.length === 0) {
      return [];
    }

    return await IOC.find(query).limit(10);
  }

  /**
   * Find campaign-related IOCs
   */
  private static async findCampaignRelatedIOCs(ioc: IIOC): Promise<IIOC[]> {
    if (!ioc.tags || ioc.tags.length === 0) {
      return [];
    }

    // Find IOCs with shared tags within time window
    const timeWindow = 30 * 24 * 60 * 60 * 1000; // 30 days
    const startTime = new Date(ioc.firstSeen.getTime() - timeWindow);
    const endTime = new Date(ioc.firstSeen.getTime() + timeWindow);

    return await IOC.find({
      _id: { $ne: ioc._id },
      tags: { $in: ioc.tags },
      firstSeen: { $gte: startTime, $lte: endTime },
    }).limit(10);
  }

  /**
   * Find infrastructure-related IOCs
   */
  private static async findInfrastructureRelatedIOCs(ioc: IIOC): Promise<IIOC[]> {
    const relatedIOCs: IIOC[] = [];

    try {
      if (ioc.type === 'domain') {
        // Find related domains (same TLD or similar)
        const domain = ioc.value;
        const parts = domain.split('.');
        if (parts.length >= 2) {
          const baseDomain = parts.slice(-2).join('.');
          const domainPattern = new RegExp(baseDomain.replace('.', '\\.'), 'i');
          
          const related = await IOC.find({
            _id: { $ne: ioc._id },
            type: 'domain',
            value: { $regex: domainPattern },
          }).limit(5);
          
          relatedIOCs.push(...related);
        }
      }

      if (ioc.type === 'ip') {
        // Find IPs in same subnet (/24)
        const ip = ioc.value;
        if (ip.includes('.')) {
          const parts = ip.split('.');
          if (parts.length === 4) {
            const subnet = `${parts[0]}.${parts[1]}.${parts[2]}.`;
            const subnetPattern = new RegExp(`^${subnet.replace(/\./g, '\\.')}`);
            
            const related = await IOC.find({
              _id: { $ne: ioc._id },
              type: 'ip',
              value: { $regex: subnetPattern },
            }).limit(10);
            
            relatedIOCs.push(...related);
          }
        }
      }

    } catch (error) {
      logger.error('Error finding infrastructure-related IOCs', error);
    }

    return relatedIOCs;
  }

  /**
   * Generate IOC analytics and statistics
   */
  static async generateAnalytics(dateRange?: { start: Date; end: Date }) {
    const filter: any = {};
    
    if (dateRange) {
      filter.createdAt = { 
        $gte: dateRange.start, 
        $lte: dateRange.end 
      };
    }

    const [
      totalIOCs,
      typeDistribution,
      severityDistribution,
      riskDistribution,
      topSources,
      recentActivity
    ] = await Promise.all([
      IOC.countDocuments(filter),
      
      IOC.aggregate([
        { $match: filter },
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      IOC.aggregate([
        { $match: filter },
        { $group: { _id: '$severity', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      IOC.aggregate([
        { $match: filter },
        { $bucket: {
          groupBy: '$confidence',
          boundaries: [0, 25, 50, 75, 100],
          default: 'other',
          output: { count: { $sum: 1 } }
        }}
      ]),
      
      IOC.aggregate([
        { $match: filter },
        { $group: { _id: '$source', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      
      IOC.aggregate([
        { $match: { 
          ...filter,
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }},
        { $group: { 
          _id: { 
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          }, 
          count: { $sum: 1 } 
        }},
        { $sort: { _id: 1 } }
      ])
    ]);

    return {
      summary: {
        totalIOCs,
        activeIOCs: await IOC.countDocuments({ ...filter, isActive: true }),
        inactiveIOCs: await IOC.countDocuments({ ...filter, isActive: false }),
      },
      distributions: {
        byType: typeDistribution,
        bySeverity: severityDistribution,
        byConfidence: riskDistribution,
      },
      sources: topSources,
      activity: recentActivity,
      generatedAt: new Date(),
    };
  }
}