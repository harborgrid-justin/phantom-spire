/**
 * Phantom Attribution Core TypeScript Interface
 * 
 * This file re-exports the NAPI-RS generated bindings with additional TypeScript types
 * for enhanced developer experience and type safety.
 */

import { AttributionCoreNapi } from '../index';

// Re-export the main class
export { AttributionCoreNapi } from '../index';
export default AttributionCoreNapi;

// Additional TypeScript types for better DX
export interface ThreatIndicator {
  id: string;
  type: 'ip' | 'domain' | 'hash' | 'url' | 'email' | 'filename';
  value: string;
  confidence: number;
  source: string;
  first_seen?: string;
  last_seen?: string;
  tags?: string[];
}

export interface ActorMatch {
  actor_id: string;
  match_score: number;
  matching_indicators: string[];
}

export interface AttributionResult {
  indicator: string;
  actor_matches: ActorMatch[];
  confidence_score: number;
  analysis_date: string;
}

export interface ThreatActor {
  id: string;
  name: string;
  aliases: string[];
  origin: string;
  motivation: string[];
  capabilities: string[];
  ttps: string[];
  confidence: number;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  actor_count: number;
  note?: string;
}

/**
 * Enhanced AttributionCore class with TypeScript-friendly methods
 */
export class AttributionCore {
  private core: AttributionCoreNapi;

  constructor() {
    this.core = new AttributionCoreNapi();
  }

  /**
   * Analyzes threat indicators for attribution patterns
   */
  analyzeAttribution(indicators: string[]): AttributionResult {
    return this.core.analyze_attribution(indicators);
  }

  /**
   * Analyzes threat indicators and returns JSON string
   */
  analyzeAttributionJson(indicators: string[]): string {
    const result = this.analyzeAttribution(indicators);
    return JSON.stringify(result);
  }

  /**
   * Gets all known threat actors
   */
  getThreatActors(): ThreatActor[] {
    return this.core.get_threat_actors();
  }

  /**
   * Gets the health status of the attribution core
   */
  getHealthStatus(): HealthStatus {
    const statusString = this.core.get_health_status();
    return JSON.parse(statusString);
  }

  /**
   * Gets the health status as JSON string
   */
  getHealthStatusJson(): string {
    return this.core.get_health_status();
  }
}