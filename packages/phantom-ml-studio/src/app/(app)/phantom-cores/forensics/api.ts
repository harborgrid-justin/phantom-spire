// Forensics API Functions

import {
  ForensicsStatus,
  ForensicsAnalysis,
  ForensicsApiResponse,
  EvidenceAnalysisRequest,
  TimelineReconstructionRequest,
  ArtifactExtractionRequest,
  ForensicsReportRequest
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

// Fetch forensics system status
export const fetchForensicsStatus = async (): Promise<ForensicsStatus> => {
  return phantomCoresClient.get('/api/phantom-cores/forensics?operation=status');
};

// Analyze evidence
export const analyzeEvidence = async (
  analysisData: EvidenceAnalysisRequest
): Promise<ForensicsApiResponse<ForensicsAnalysis>> => {
  return phantomCoresClient.post('/api/phantom-cores/forensics', {
    operation: 'analyze-evidence',
    analysisData
  });
};

// Reconstruct timeline
export const reconstructTimeline = async (
  timelineData: TimelineReconstructionRequest
): Promise<ForensicsApiResponse<any>> => {
  return phantomCoresClient.post('/api/phantom-cores/forensics', {
    operation: 'reconstruct-timeline',
    timelineData
  });
};

// Extract artifacts
export const extractArtifacts = async (
  artifactData: ArtifactExtractionRequest
): Promise<ForensicsApiResponse<any>> => {
  return phantomCoresClient.post('/api/phantom-cores/forensics', {
    operation: 'extract-artifacts',
    artifactData
  });
};

// Generate forensics report
export const generateForensicsReport = async (
  reportData: ForensicsReportRequest
): Promise<ForensicsApiResponse<any>> => {
  return phantomCoresClient.post('/api/phantom-cores/forensics', {
    operation: 'generate-report',
    reportData
  });
};

// Initialize forensics core
export const initializeForensicsCore = async (): Promise<ForensicsApiResponse<any>> => {
  return phantomCoresClient.post('/api/phantom-cores/forensics', {
    operation: 'initialize'
  });
};

// Validate evidence integrity
export const validateEvidenceIntegrity = async (evidenceId: string): Promise<ForensicsApiResponse<any>> => {
  return phantomCoresClient.post('/api/phantom-cores/forensics', {
    operation: 'validate-integrity',
    evidenceId
  });
};

// Search evidence database
export const searchEvidenceDatabase = async (query: {
  keywords?: string;
  date_range?: { start: string; end: string };
  evidence_types?: string[];
  case_ids?: string[];
}): Promise<ForensicsApiResponse<any>> => {
  return phantomCoresClient.post('/api/phantom-cores/forensics', {
    operation: 'search-evidence',
    query
  });
};

// Export case data
export const exportCaseData = async (caseId: string, format: 'json' | 'xml' | 'pdf'): Promise<ForensicsApiResponse<any>> => {
  return phantomCoresClient.post('/api/phantom-cores/forensics', {
    operation: 'export-case',
    caseId,
    format
  });
};
