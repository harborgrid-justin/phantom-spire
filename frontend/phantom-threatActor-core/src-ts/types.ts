// TypeScript types for Phantom Threat Actor Core

export enum ActorType {
  NationState = 'NationState',
  CyberCriminal = 'CyberCriminal',
  Hacktivist = 'Hacktivist',
  Terrorist = 'Terrorist',
  InsiderThreat = 'InsiderThreat',
  ScriptKiddie = 'ScriptKiddie',
  APT = 'APT',
  Ransomware = 'Ransomware',
  Unknown = 'Unknown',
}

export enum SophisticationLevel {
  Novice = 'Novice',
  Intermediate = 'Intermediate',
  Advanced = 'Advanced',
  Expert = 'Expert',
  Elite = 'Elite',
}

export enum Motivation {
  Financial = 'Financial',
  Espionage = 'Espionage',
  Sabotage = 'Sabotage',
  Ideology = 'Ideology',
  Revenge = 'Revenge',
  Fame = 'Fame',
  Challenge = 'Challenge',
  Unknown = 'Unknown',
}

export enum ActorStatus {
  Active = 'Active',
  Dormant = 'Dormant',
  Disbanded = 'Disbanded',
  Merged = 'Merged',
  Unknown = 'Unknown',
}

export enum InfrastructureType {
  Dedicated = 'Dedicated',
  Shared = 'Shared',
  Compromised = 'Compromised',
  Bulletproof = 'Bulletproof',
  CloudBased = 'CloudBased',
  Unknown = 'Unknown',
}

export enum OrganizationSize {
  Small = 'Small',
  Medium = 'Medium',
  Large = 'Large',
  Enterprise = 'Enterprise',
  Government = 'Government',
  Unknown = 'Unknown',
}

export enum RelationshipType {
  Alias = 'Alias',
  Subgroup = 'Subgroup',
  Collaboration = 'Collaboration',
  Competition = 'Competition',
  Successor = 'Successor',
  Predecessor = 'Predecessor',
  Unknown = 'Unknown',
}

export enum CampaignStatus {
  Active = 'Active',
  Completed = 'Completed',
  Suspended = 'Suspended',
  Failed = 'Failed',
  Unknown = 'Unknown',
}

export enum ReputationImpact {
  None = 'None',
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Severe = 'Severe',
}

export enum EvidenceType {
  TechnicalIndicator = 'TechnicalIndicator',
  BehavioralPattern = 'BehavioralPattern',
  InfrastructureOverlap = 'InfrastructureOverlap',
  ToolReuse = 'ToolReuse',
  TimingCorrelation = 'TimingCorrelation',
  LinguisticAnalysis = 'LinguisticAnalysis',
  GeopoliticalContext = 'GeopoliticalContext',
  SourceIntelligence = 'SourceIntelligence',
}

export enum ChangeType {
  Acquired = 'Acquired',
  Improved = 'Improved',
  Abandoned = 'Abandoned',
  Modified = 'Modified',
}

export interface Capability {
  category: string;
  description: string;
  proficiency: number;
  evidence: string[];
}

export interface Infrastructure {
  domains: string[];
  ip_addresses: string[];
  hosting_providers: string[];
  registrars: string[];
  certificates: string[];
  infrastructure_type: InfrastructureType;
}

export interface Target {
  sector: string;
  geography: string[];
  organization_size: OrganizationSize;
  targeting_frequency: number;
}

export interface ActorRelationship {
  related_actor_id: string;
  relationship_type: RelationshipType;
  confidence: number;
  evidence: string[];
}

export interface ThreatActor {
  id: string;
  name: string;
  aliases: string[];
  actor_type: ActorType;
  sophistication_level: SophisticationLevel;
  motivation: Motivation[];
  origin_country?: string;
  first_observed: Date;
  last_activity: Date;
  status: ActorStatus;
  confidence_score: number;
  attribution_confidence: number;
  capabilities: Capability[];
  infrastructure: Infrastructure;
  tactics: string[];
  techniques: string[];
  procedures: string[];
  targets: Target[];
  campaigns: string[];
  associated_malware: string[];
  iocs: string[];
  relationships: ActorRelationship[];
  metadata: Record<string, string>;
}

export interface ImpactAssessment {
  financial_impact?: number;
  data_compromised?: number;
  systems_affected?: number;
  downtime_hours?: number;
  reputation_impact: ReputationImpact;
}

export interface Campaign {
  id: string;
  name: string;
  actor_id: string;
  start_date: Date;
  end_date?: Date;
  status: CampaignStatus;
  objectives: string[];
  targets: Target[];
  ttps: string[];
  malware_families: string[];
  iocs: string[];
  impact_assessment: ImpactAssessment;
}

export interface Evidence {
  evidence_type: EvidenceType;
  description: string;
  weight: number;
  source: string;
  timestamp: Date;
}

export interface AttributionCandidate {
  actor_id: string;
  confidence: number;
  supporting_evidence: Evidence[];
  contradicting_evidence: Evidence[];
}

export interface AttributionAnalysis {
  primary_attribution?: string;
  alternative_attributions: AttributionCandidate[];
  confidence_score: number;
  evidence_summary: Evidence[];
  analysis_timestamp: Date;
}

export interface BehavioralPattern {
  pattern_type: string;
  description: string;
  frequency: number;
  consistency: number;
  examples: string[];
}

export interface OperationalPattern {
  phase: string;
  typical_duration?: number;
  common_techniques: string[];
  success_rate: number;
}

export interface CapabilityChange {
  capability: string;
  change_type: ChangeType;
  timestamp: Date;
  impact: number;
}

export interface TacticChange {
  tactic: string;
  change_description: string;
  timestamp: Date;
}

export interface InfrastructureChange {
  infrastructure_element: string;
  change_type: ChangeType;
  timestamp: Date;
}

export interface TargetChange {
  target_sector: string;
  change_type: ChangeType;
  timestamp: Date;
}

export interface EvolutionAnalysis {
  capability_progression: CapabilityChange[];
  tactic_evolution: TacticChange[];
  infrastructure_evolution: InfrastructureChange[];
  target_evolution: TargetChange[];
}

export interface PredictiveIndicator {
  indicator_type: string;
  description: string;
  probability: number;
  timeframe: string;
}

export interface BehavioralAnalysis {
  actor_id: string;
  behavioral_patterns: BehavioralPattern[];
  operational_patterns: OperationalPattern[];
  evolution_analysis: EvolutionAnalysis;
  predictive_indicators: PredictiveIndicator[];
}

export interface ThreatActorSearchCriteria {
  actor_type?: ActorType;
  sophistication_level?: SophisticationLevel;
  motivation?: Motivation;
  origin_country?: string;
  status?: ActorStatus;
  min_confidence?: number;
  active_since?: Date;
  targets_sector?: string;
  associated_malware?: string;
  campaign_name?: string;
}

export interface ThreatActorAnalysisResult {
  actor: ThreatActor;
  attribution_analysis?: AttributionAnalysis;
  behavioral_analysis?: BehavioralAnalysis;
  related_campaigns: Campaign[];
  analysis_timestamp: Date;
}
