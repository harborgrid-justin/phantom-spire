/**
 * Multi-Model A/B Testing Service Type Definitions
 */

import { BusinessLogicRequest, BusinessLogicResponse } from '../../../lib/core';

export interface ModelVariant {
  id: string;
  name: string;
  version: string;
  algorithm: string;
  trafficAllocation: number;
  status: 'active' | 'paused' | 'stopped' | 'failed';
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    falsePositiveRate: number;
    latency: number;
    throughput: number;
    securityScore: number;
  };
  securityMetrics: {
    threatDetectionRate: number;
    adversarialRobustness: number;
    biasScore: number;
    complianceScore: number;
  };
  businessMetrics: {
    costPerPrediction: number;
    resourceUtilization: number;
    userSatisfaction: number;
  };
}

export interface ABTest {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'completed' | 'failed' | 'paused';
  startDate: string;
  endDate?: string;
  duration: number; // days
  testType: 'accuracy' | 'security' | 'performance' | 'comprehensive';
  variants: ModelVariant[];
  trafficSplit: { [variantId: string]: number };
  hypothesis: string;
  successCriteria: {
    primaryMetric: string;
    minimumImprovement: number;
    statisticalSignificance: number;
    minimumSampleSize: number;
  };
  currentResults: {
    samplesCollected: number;
    statisticalPower: number;
    confidenceLevel: number;
    currentWinner?: string;
    significanceReached: boolean;
  };
  securityAnalysis: {
    threatCoverage: number;
    vulnerabilityExposure: number;
    complianceRisk: string;
    biasAssessment: string;
  };
}

export type GetABTestsRequest = BusinessLogicRequest<null>;
export type GetABTestsResponse = BusinessLogicResponse<ABTest[]>;
