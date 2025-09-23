// API functions for Intel Management

import { phantomCoresClient } from '../../../../lib/api/phantom-cores-client';
import {
  IntelStatus,
  IntelAnalysisRequest,
  IntelGatheringRequest,
  SourceValidationRequest,
  IntelReportRequest
} from './types';

export const fetchIntelStatus = async (): Promise<IntelStatus> => {
  const response = await phantomCoresClient.get('/api/phantom-cores/intel?operation=status');
  return response.json();
};

export const gatherIntelligence = async (intelData: IntelGatheringRequest) => {
  const response = await phantomCoresClient.post('/api/phantom-cores/intel', {
    operation: 'gather-intelligence',
    intelData
  });
  return response.json();
};

export const analyzeIntelligence = async (analysisData: IntelAnalysisRequest) => {
  const response = await phantomCoresClient.post('/api/phantom-cores/intel', {
    operation: 'analyze-intelligence',
    analysisData
  });
  return response.json();
};

export const validateSources = async (sourceData: SourceValidationRequest) => {
  const response = await phantomCoresClient.post('/api/phantom-cores/intel', {
    operation: 'validate-sources',
    sourceData
  });
  return response.json();
};

export const generateIntelReport = async (reportData: IntelReportRequest) => {
  const response = await phantomCoresClient.post('/api/phantom-cores/intel', {
    operation: 'generate-intel-report',
    reportData
  });
  return response.json();
};
