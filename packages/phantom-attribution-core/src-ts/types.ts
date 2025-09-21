/**
 * Additional TypeScript type definitions for Phantom Attribution Core
 */

// Import base types
import type { ThreatIndicator } from './index';

// Campaign-related types
export interface AttributionCampaign {
  id: string;
  name: string;
  description: string;
  actors: string[];
  start_date: string;
  end_date?: string;
  targets: string[];
  ttps: string[];
  indicators: ThreatIndicator[];
  confidence: number;
}

// Analysis configuration types  
export interface AttributionConfig {
  min_confidence_threshold: number;
  max_results: number;
  include_historical: boolean;
  time_window_days: number;
  weight_factors: {
    temporal: number;
    behavioral: number;
    infrastructure: number;
    malware: number;
  };
}

// Extended indicator types
export interface EnrichedThreatIndicator extends ThreatIndicator {
  malware_families?: string[];
  attack_techniques?: string[];
  geographical_data?: {
    country: string;
    region: string;
    asn: number;
  };
  reputation_score?: number;
}

// Attribution analysis context
export interface AttributionContext {
  analysis_id: string;
  timestamp: string;
  analyst: string;
  confidence_level: 'low' | 'medium' | 'high' | 'very_high';
  sources: string[];
  methodology: string;
}

// Relationship mapping types
export interface ActorRelationship {
  source_actor: string;
  target_actor: string;
  relationship_type: 'collaborates' | 'competes' | 'shares_infrastructure' | 'shares_malware';
  confidence: number;
  evidence: string[];
}

// Re-export main types from index
export type { 
  ThreatIndicator,
  ActorMatch,
  AttributionResult,
  ThreatActor,
  HealthStatus
} from './index';