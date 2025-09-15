/**
 * Interactive Feature Engineering Service Type Definitions
 */

import { BusinessLogicRequest, BusinessLogicResponse } from '../core';

export interface Feature {
  id: string;
  name: string;
  type: 'numerical' | 'categorical' | 'temporal' | 'text' | 'security' | 'derived';
  source: string;
  transformation?: string;
  securityRelevance: number;
  importance?: number;
  description: string;
  threatIntelligence?: boolean;
  biasRisk: 'low' | 'medium' | 'high';
  complianceFlags?: string[];
}

export interface FeatureTransformation {
  id: string;
  name: string;
  type: 'aggregation' | 'encoding' | 'scaling' | 'extraction' | 'security_enrichment';
  inputFeatures: string[];
  outputFeature: string;
  configuration: any;
  securityImpact: string;
  code: string;
  validation: {
    passed: boolean;
    issues: string[];
  };
}

export interface FeatureEngineeringPipeline {
  id: string;
  name: string;
  features: Feature[];
  transformations: FeatureTransformation[];
  securityScore: number;
  complianceScore: number;
  status: 'draft' | 'validated' | 'deployed';
}

export type GetFeatureEngineeringPipelineRequest = BusinessLogicRequest<{ pipelineId: string }>;
export type GetFeatureEngineeringPipelineResponse = BusinessLogicResponse<FeatureEngineeringPipeline>;
