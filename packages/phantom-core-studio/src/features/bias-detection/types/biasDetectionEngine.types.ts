/**
 * Bias Detection Engine Service Type Definitions
 */

import { BusinessLogicRequest, BusinessLogicResponse } from '../../../lib/core';

export interface BiasMetric {
  category: string;
  metric: string;
  value: number;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendation: string;
  complianceImpact: string;
}

export interface ModelBiasAnalysis {
  modelId: string;
  modelName: string;
  algorithm: string;
  overallBiasScore: number;
  complianceStatus: 'compliant' | 'warning' | 'non-compliant';
  biasMetrics: BiasMetric[];
  protectedAttributes: string[];
  securityImpact: string;
  lastAnalyzed: string;
}

export type GetModelBiasAnalysisRequest = BusinessLogicRequest<{ modelId: string }>;
export type GetModelBiasAnalysisResponse = BusinessLogicResponse<ModelBiasAnalysis[]>;
