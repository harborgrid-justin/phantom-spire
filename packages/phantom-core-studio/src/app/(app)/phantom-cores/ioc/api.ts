// API functions for IOC Management

import { phantomCoresClient } from '../../../../lib/api/phantom-cores-client';
import {
  IOCStatus,
  IOCAnalysisRequest,
  IOCEnrichmentRequest,
  IOCCorrelationRequest,
  IOCReportRequest
} from './types';

export const fetchIOCStatus = async (): Promise<IOCStatus> => {
  const response = await phantomCoresClient.get('/api/phantom-cores/ioc?operation=status');
  return response.json();
};

export const analyzeIOC = async (iocData: IOCAnalysisRequest) => {
  const response = await phantomCoresClient.post('/api/phantom-cores/ioc', {
    operation: 'analyze-ioc',
    iocData
  });
  return response.json();
};

export const enrichIOC = async (enrichmentData: IOCEnrichmentRequest) => {
  const response = await phantomCoresClient.post('/api/phantom-cores/ioc', {
    operation: 'enrich-ioc',
    enrichmentData
  });
  return response.json();
};

export const correlateIOCs = async (correlationData: IOCCorrelationRequest) => {
  const response = await phantomCoresClient.post('/api/phantom-cores/ioc', {
    operation: 'correlate-iocs',
    correlationData
  });
  return response.json();
};

export const generateIOCReport = async (reportData: IOCReportRequest) => {
  const response = await phantomCoresClient.post('/api/phantom-cores/ioc', {
    operation: 'generate-ioc-report',
    reportData
  });
  return response.json();
};
