// API functions for CVE Management

import { phantomCoresClient } from '../../../../lib/api/phantom-cores-client';
import {
  CVEStatus,
  CVEAnalysisRequest,
  VulnerabilityTrackingRequest,
  CVEUpdateRequest,
  ReportGenerationRequest,
  CVECorrelationRequest,
  StreamAnalysisRequest,
  FeedStatusRequest,
  MLPrioritizationRequest,
  CrossModuleAnalysisRequest
} from './types';

export const fetchCVEStatus = async (): Promise<CVEStatus> => {
  const response = await phantomCoresClient.get('/api/phantom-cores/cve?operation=status');
  return response.json();
};

export const analyzeCVE = async (analysisData: CVEAnalysisRequest) => {
  const response = await phantomCoresClient.post('/api/phantom-cores/cve', {
    operation: 'analyze',
    ...analysisData
  });
  return response.json();
};

export const trackVulnerability = async (vulnData: VulnerabilityTrackingRequest) => {
  const response = await phantomCoresClient.post('/api/phantom-cores/cve', {
    operation: 'track-vulnerability',
    vulnData
  });
  return response.json();
};

export const updateCVEDatabase = async (updateData: CVEUpdateRequest) => {
  const response = await phantomCoresClient.post('/api/phantom-cores/cve', {
    operation: 'update-database',
    updateData
  });
  return response.json();
};

export const generateVulnerabilityReport = async (reportData: ReportGenerationRequest) => {
  const response = await phantomCoresClient.post('/api/phantom-cores/cve', {
    operation: 'generate-report',
    reportData
  });
  return response.json();
};

// Real-time CVE API functions
export const correlateCVE = async (correlationData: CVECorrelationRequest) => {
  const response = await phantomCoresClient.post('/api/phantom-cores/cve', {
    operation: 'correlate-cve',
    ...correlationData
  });
  return response.json();
};

export const analyzeRealtimeStream = async (streamData: StreamAnalysisRequest) => {
  const response = await phantomCoresClient.post('/api/phantom-cores/cve', {
    operation: 'stream-analysis',
    ...streamData
  });
  return response.json();
};

export const checkRealtimeFeed = async (feedData: FeedStatusRequest) => {
  const response = await phantomCoresClient.post('/api/phantom-cores/cve', {
    operation: 'real-time-feed',
    ...feedData
  });
  return response.json();
};

export const mlPrioritizeCVEs = async (priorityData: MLPrioritizationRequest) => {
  const response = await phantomCoresClient.post('/api/phantom-cores/cve', {
    operation: 'ml-prioritization',
    ...priorityData
  });
  return response.json();
};

export const crossModuleAnalysis = async (analysisData: CrossModuleAnalysisRequest) => {
  const response = await phantomCoresClient.post('/api/phantom-cores/cve', {
    operation: 'cross-module-analysis',
    ...analysisData
  });
  return response.json();
};
