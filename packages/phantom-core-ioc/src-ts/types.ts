// TypeScript implementation of IOC Core types

export enum IOCType {
  IPAddress = 'ip',
  Domain = 'domain',
  URL = 'url',
  Hash = 'hash',
  Email = 'email',
  FilePath = 'file-path',
  Custom = 'custom'
}

export enum Severity {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
  Critical = 'critical'
}

export interface IOCContext {
  description?: string;
  metadata: Record<string, string>;
}

export interface IOC {
  id: string;
  indicator_type: IOCType;
  value: string;
  confidence: number;
  severity: Severity;
  source: string;
  timestamp: Date;
  tags: string[];
  context: IOCContext;
}

export interface ImpactAssessment {
  business_impact: number;
  technical_impact: number;
  operational_impact: number;
  overall_risk: number;
}

export interface AnalysisResult {
  threat_actors: string[];
  campaigns: string[];
  malware_families: string[];
  attack_vectors: string[];
  impact_assessment: ImpactAssessment;
  recommendations: string[];
}

export interface IOCResult {
  ioc: IOC;
  analysis: AnalysisResult;
  processing_timestamp: Date;
}
