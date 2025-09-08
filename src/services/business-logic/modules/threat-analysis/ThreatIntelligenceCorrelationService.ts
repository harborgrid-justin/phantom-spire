/**
 * Threat Intelligence Correlation Service
 * Cross-reference and correlate threat intelligence from multiple sources
 */

import { v4 as uuidv4 } from 'uuid';
import { BusinessRule, BusinessLogicRequest, ValidationResult } from '../../core/BusinessLogicManager';

export interface CorrelationRequest {
  indicators: string[];
  sources: string[];
  correlation_threshold?: number;
  time_window_hours?: number;
}

export interface CorrelationResponse {
  correlations: Array<{
    id: string;
    indicators: string[];
    sources: string[];
    confidence: number;
    threat_actor?: string;
    campaign?: string;
    techniques: string[];
    timeline: Array<{
      timestamp: Date;
      event: string;
      source: string;
    }>;
  }>;
  statistics: {
    total_correlations: number;
    high_confidence_count: number;
    sources_analyzed: number;
    processing_time_ms: number;
  };
}

/**
 * Multi-source correlation rule
 */
export const multiSourceCorrelationRule: BusinessRule = {
  id: uuidv4(),
  serviceId: 'threat-intelligence-correlation',
  operation: 'correlate-intelligence',
  enabled: true,
  priority: 95,

  async validator(request: BusinessLogicRequest): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    const { indicators, sources } = request.payload as CorrelationRequest;

    if (!indicators || !Array.isArray(indicators) || indicators.length === 0) {
      result.errors.push('At least one indicator is required for correlation');
    }

    if (!sources || !Array.isArray(sources) || sources.length === 0) {
      result.errors.push('At least one source is required for correlation');
    }

    if (indicators && indicators.length > 1000) {
      result.warnings.push('Large number of indicators - consider batch processing');
    }

    result.isValid = result.errors.length === 0;
    return result;
  },

  async processor(request: BusinessLogicRequest): Promise<CorrelationResponse> {
    const { 
      indicators, 
      sources, 
      correlation_threshold = 0.75,
      time_window_hours = 24 
    } = request.payload as CorrelationRequest;
    
    const startTime = Date.now();
    const correlations = [];

    // Simulate correlation analysis
    const correlationCount = Math.min(Math.floor(indicators.length * 0.3), 10);
    
    for (let i = 0; i < correlationCount; i++) {
      const confidence = correlation_threshold + Math.random() * (1 - correlation_threshold);
      const relatedIndicators = indicators.slice(i, i + Math.min(3, indicators.length - i));
      const relatedSources = sources.slice(0, Math.min(2, sources.length));

      correlations.push({
        id: uuidv4(),
        indicators: relatedIndicators,
        sources: relatedSources,
        confidence,
        threat_actor: confidence > 0.9 ? `APT-${Math.floor(Math.random() * 50) + 1}` : undefined,
        campaign: confidence > 0.85 ? `Campaign-${Date.now().toString(36)}` : undefined,
        techniques: [
          'T1566.001', // Spearphishing Attachment
          'T1078', // Valid Accounts
          'T1055' // Process Injection
        ].slice(0, Math.floor(Math.random() * 3) + 1),
        timeline: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, idx) => ({
          timestamp: new Date(Date.now() - idx * 3600000), // Hours ago
          event: `Event ${idx + 1}`,
          source: relatedSources[idx % relatedSources.length]
        }))
      });
    }

    const highConfidenceCount = correlations.filter(c => c.confidence > 0.9).length;

    return {
      correlations,
      statistics: {
        total_correlations: correlations.length,
        high_confidence_count: highConfidenceCount,
        sources_analyzed: sources.length,
        processing_time_ms: Date.now() - startTime
      }
    };
  }
};

/**
 * Threat actor attribution rule
 */
export const threatActorAttributionRule: BusinessRule = {
  id: uuidv4(),
  serviceId: 'threat-intelligence-correlation',
  operation: 'attribute-threat-actor',
  enabled: true,
  priority: 90,

  async validator(request: BusinessLogicRequest): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    const { techniques, infrastructure, malware } = request.payload;

    if (!techniques && !infrastructure && !malware) {
      result.errors.push('At least one attribution factor is required (techniques, infrastructure, or malware)');
    }

    result.isValid = result.errors.length === 0;
    return result;
  },

  async processor(request: BusinessLogicRequest): Promise<any> {
    const { techniques = [], infrastructure = [], malware = [] } = request.payload;
    
    // Simulate threat actor attribution
    const attributionScore = Math.random() * 0.4 + 0.6; // 0.6-1.0
    
    const threatActors = [
      'APT28', 'APT29', 'Lazarus Group', 'FIN7', 'Carbanak', 'APT1', 'Equation Group'
    ];
    
    const possibleActors = threatActors
      .map(actor => ({
        name: actor,
        confidence: Math.random() * 0.3 + 0.7,
        matching_techniques: techniques.slice(0, Math.floor(Math.random() * techniques.length) + 1),
        known_infrastructure: infrastructure.filter(() => Math.random() > 0.7),
        associated_malware: malware.filter(() => Math.random() > 0.6)
      }))
      .filter(actor => actor.confidence > 0.75)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);

    return {
      attribution_id: uuidv4(),
      primary_actor: possibleActors[0] || null,
      alternative_actors: possibleActors.slice(1),
      overall_confidence: attributionScore,
      attribution_factors: {
        technique_similarity: Math.random() * 0.3 + 0.7,
        infrastructure_overlap: Math.random() * 0.25 + 0.6,
        malware_signature: Math.random() * 0.35 + 0.65,
        temporal_correlation: Math.random() * 0.2 + 0.7
      },
      timestamp: new Date()
    };
  }
};

export const threatIntelligenceCorrelationRules = [
  multiSourceCorrelationRule,
  threatActorAttributionRule
];