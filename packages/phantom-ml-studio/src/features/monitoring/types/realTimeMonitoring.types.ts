/**
 * Real-Time Monitoring Service Type Definitions
 */

import { BusinessLogicRequest, BusinessLogicResponse } from '../../../lib/core';

export interface ModelMetrics {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  accuracy: number;
  latency: number;
  throughput: number;
  errorRate: number;
  securityScore: number;
  lastUpdated: string;
}

export interface RealTimeEvent {
  id: string;
  timestamp: string;
  type: 'prediction' | 'alert' | 'drift' | 'security';
  model: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, unknown>;
}

export interface PerformanceDataPoint {
  time: string;
  accuracy: number;
  throughput: number;
  latency: number;
}

export type GetModelMetricsRequest = BusinessLogicRequest<null>;
export type GetModelMetricsResponse = BusinessLogicResponse<ModelMetrics[]>;

export type GetRealTimeEventsRequest = BusinessLogicRequest<null>;
export type GetRealTimeEventsResponse = BusinessLogicResponse<RealTimeEvent[]>;

export type GetPerformanceDataRequest = BusinessLogicRequest<null>;
export type GetPerformanceDataResponse = BusinessLogicResponse<PerformanceDataPoint[]>;
