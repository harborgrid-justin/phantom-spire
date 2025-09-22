/**
 * Explainable AI Visualizer Service Type Definitions
 */

import { BusinessLogicRequest, BusinessLogicResponse } from '..\..\..\lib\core';

export interface FeatureImportance {
  feature: string;
  importance: number;
  category: 'behavioral' | 'network' | 'temporal' | 'threat_intel' | 'contextual';
  securityRelevance: number;
  description: string;
  impactDirection: 'positive' | 'negative';
}

export interface SHAPExplanation {
  feature: string;
  shapValue: number;
  baseValue: number;
  featureValue: string | number;
  category: string;
  confidence: number;
  threatContext?: string;
}

export interface ModelExplanation {
  modelId: string;
  modelName: string;
  predictionId: string;
  prediction: string;
  confidence: number;
  threatType: string;
  securityScore: number;
  timestamp: string;
  globalExplanations: {
    featureImportance: FeatureImportance[];
    modelBehavior: string;
    threatPatterns: string[];
  };
  localExplanations: {
    shapValues: SHAPExplanation[];
    decisionPath: string[];
    alternativeOutcomes: Array<{ outcome: string; probability: number; requiredChanges: string[] }>;
  };
  securityContext: {
    threatIntelligenceUsed: string[];
    complianceImplications: string[];
    riskAssessment: 'low' | 'medium' | 'high' | 'critical';
    biasAnalysis: {
      detected: boolean;
      areas: string[];
      mitigation: string[];
    };
  };
}

export type GetModelExplanationRequest = BusinessLogicRequest<{ modelId: string }>;
export type GetModelExplanationResponse = BusinessLogicResponse<ModelExplanation>;
