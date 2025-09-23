// MITRE API Functions

import {
  MitreStatus,
  MitreAnalysis,
  MitreApiResponse,
  TTPAnalysisRequest,
  TechniqueMappingRequest,
  CoverageAssessmentRequest,
  MitreReportRequest
} from './types';

// Base API client for Phantom Cores
const phantomCoresClient = {
  post: async (endpoint: string, data: any) => {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },
  get: async (endpoint: string) => {
    const response = await fetch(endpoint);
    return response.json();
  }
};

// Fetch MITRE system status
export const fetchMitreStatus = async (): Promise<MitreStatus> => {
  return phantomCoresClient.get('/api/phantom-cores/mitre?operation=status');
};

// Analyze TTP (Tactics, Techniques, and Procedures)
export const analyzeTTP = async (
  ttpData: TTPAnalysisRequest
): Promise<MitreApiResponse<MitreAnalysis>> => {
  return phantomCoresClient.post('/api/phantom-cores/mitre', {
    operation: 'analyze-ttp',
    ttpData
  });
};

// Map techniques to MITRE framework
export const mapTechniques = async (
  mappingData: TechniqueMappingRequest
): Promise<MitreApiResponse<any>> => {
  return phantomCoresClient.post('/api/phantom-cores/mitre', {
    operation: 'map-techniques',
    mappingData
  });
};

// Assess coverage against MITRE framework
export const assessCoverage = async (
  coverageData: CoverageAssessmentRequest
): Promise<MitreApiResponse<any>> => {
  return phantomCoresClient.post('/api/phantom-cores/mitre', {
    operation: 'assess-coverage',
    coverageData
  });
};

// Generate MITRE report
export const generateMitreReport = async (
  reportData: MitreReportRequest
): Promise<MitreApiResponse<any>> => {
  return phantomCoresClient.post('/api/phantom-cores/mitre', {
    operation: 'generate-mitre-report',
    reportData
  });
};

// Initialize MITRE core
export const initializeMitreCore = async (): Promise<MitreApiResponse<any>> => {
  return phantomCoresClient.post('/api/phantom-cores/mitre', {
    operation: 'initialize'
  });
};

// Get technique details
export const getTechniqueDetails = async (techniqueId: string): Promise<MitreApiResponse<any>> => {
  return phantomCoresClient.post('/api/phantom-cores/mitre', {
    operation: 'get-technique',
    techniqueId
  });
};

// Search MITRE techniques
export const searchTechniques = async (query: {
  keywords?: string;
  tactics?: string[];
  platforms?: string[];
  data_sources?: string[];
}): Promise<MitreApiResponse<any>> => {
  return phantomCoresClient.post('/api/phantom-cores/mitre', {
    operation: 'search-techniques',
    query
  });
};

// Get heat map data
export const getHeatMapData = async (filters?: {
  tactics?: string[];
  timeframe?: string;
  threat_actors?: string[];
}): Promise<MitreApiResponse<any>> => {
  return phantomCoresClient.post('/api/phantom-cores/mitre', {
    operation: 'get-heatmap',
    filters
  });
};

// Update framework version
export const updateFrameworkVersion = async (version: string): Promise<MitreApiResponse<any>> => {
  return phantomCoresClient.post('/api/phantom-cores/mitre', {
    operation: 'update-framework',
    version
  });
};

// Export MITRE data
export const exportMitreData = async (format: 'json' | 'xml' | 'csv'): Promise<MitreApiResponse<any>> => {
  return phantomCoresClient.post('/api/phantom-cores/mitre', {
    operation: 'export-data',
    format
  });
};
