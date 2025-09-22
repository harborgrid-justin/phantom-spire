/**
 * Threat Intelligence Marketplace Service Type Definitions
 */

import { BusinessLogicRequest, BusinessLogicResponse } from '../../../lib/core';

export interface ThreatModel {
  id: string;
  name: string;
  description: string;
  category: 'malware_detection' | 'network_intrusion' | 'anomaly_detection' | 'threat_hunting' | 'vulnerability_assessment';
  algorithm: string;
  accuracy: number;
  securityScore: number;
  threatTypes: string[];
  publisher: string;
  publisherType: 'phantom_official' | 'community' | 'enterprise_partner';
  rating: number;
  downloads: number;
  lastUpdated: string;
  version: string;
  size: string;
  price: number; // 0 for free
  verified: boolean;
  complianceFlags: string[];
  threatIntelSources: string[];
  performanceMetrics: {
    falsePositiveRate: number;
    falseNegativeRate: number;
    averageLatency: number;
    throughput: number;
  };
  deployment: {
    supportedPlatforms: string[];
    requirements: string[];
    scalability: 'low' | 'medium' | 'high';
  };
  preview?: {
    demo: boolean;
    sampleData: boolean;
    documentation: boolean;
  };
}

export type GetThreatModelsRequest = BusinessLogicRequest<null>;
export type GetThreatModelsResponse = BusinessLogicResponse<ThreatModel[]>;
