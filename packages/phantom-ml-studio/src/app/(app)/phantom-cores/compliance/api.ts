// Compliance API Functions

import {
  ComplianceStatus,
  ComplianceAnalysis,
  ComplianceApiResponse,
  FrameworkAnalysisRequest,
  ComplianceAssessmentRequest,
  ComplianceAuditRequest,
  ComplianceReportRequest
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

// Fetch compliance system status
export const fetchComplianceStatus = async (): Promise<ComplianceStatus> => {
  return phantomCoresClient.get('/api/phantom-cores/compliance?operation=status');
};

// Analyze compliance framework
export const analyzeFramework = async (
  frameworkData: FrameworkAnalysisRequest
): Promise<ComplianceApiResponse<ComplianceAnalysis>> => {
  return phantomCoresClient.post('/api/phantom-cores/compliance', {
    operation: 'analyze-framework',
    frameworkData
  });
};

// Assess compliance status
export const assessCompliance = async (
  assessmentData: ComplianceAssessmentRequest
): Promise<ComplianceApiResponse<any>> => {
  return phantomCoresClient.post('/api/phantom-cores/compliance', {
    operation: 'assess-status',
    assessmentData
  });
};

// Conduct compliance audit
export const conductAudit = async (
  auditData: ComplianceAuditRequest
): Promise<ComplianceApiResponse<any>> => {
  return phantomCoresClient.post('/api/phantom-cores/compliance', {
    operation: 'conduct-audit',
    auditData
  });
};

// Generate compliance report
export const generateReport = async (
  reportData: ComplianceReportRequest
): Promise<ComplianceApiResponse<any>> => {
  return phantomCoresClient.post('/api/phantom-cores/compliance', {
    operation: 'generate-report',
    reportData
  });
};

// Initialize compliance core
export const initializeComplianceCore = async (): Promise<ComplianceApiResponse<any>> => {
  return phantomCoresClient.post('/api/phantom-cores/compliance', {
    operation: 'initialize'
  });
};

// Get compliance metrics
export const getComplianceMetrics = async (timeframe?: string): Promise<ComplianceApiResponse<any>> => {
  return phantomCoresClient.post('/api/phantom-cores/compliance', {
    operation: 'get-metrics',
    timeframe: timeframe || '30_days'
  });
};

// Update compliance control
export const updateComplianceControl = async (controlData: {
  control_id: string;
  status: string;
  evidence?: string[];
  notes?: string;
}): Promise<ComplianceApiResponse<any>> => {
  return phantomCoresClient.post('/api/phantom-cores/compliance', {
    operation: 'update-control',
    controlData
  });
};

// Create remediation plan
export const createRemediationPlan = async (planData: {
  framework_id: string;
  gaps: string[];
  priority: string;
  timeline: string;
}): Promise<ComplianceApiResponse<any>> => {
  return phantomCoresClient.post('/api/phantom-cores/compliance', {
    operation: 'create-remediation-plan',
    planData
  });
};

// Get compliance dashboard data
export const getComplianceDashboard = async (filters?: {
  frameworks?: string[];
  date_range?: string;
  include_trends?: boolean;
}): Promise<ComplianceApiResponse<any>> => {
  return phantomCoresClient.post('/api/phantom-cores/compliance', {
    operation: 'get-dashboard',
    filters
  });
};

// Schedule compliance assessment
export const scheduleAssessment = async (scheduleData: {
  framework_id: string;
  assessment_type: string;
  scheduled_date: string;
  assessor: string;
}): Promise<ComplianceApiResponse<any>> => {
  return phantomCoresClient.post('/api/phantom-cores/compliance', {
    operation: 'schedule-assessment',
    scheduleData
  });
};

// Export compliance data
export const exportComplianceData = async (exportData: {
  format: 'json' | 'csv' | 'pdf' | 'excel';
  data_type: 'controls' | 'assessments' | 'reports' | 'all';
  date_range?: string;
}): Promise<ComplianceApiResponse<any>> => {
  return phantomCoresClient.post('/api/phantom-cores/compliance', {
    operation: 'export-data',
    exportData
  });
};

// Get compliance history
export const getComplianceHistory = async (historyParams: {
  framework_id?: string;
  date_range: string;
  include_changes: boolean;
}): Promise<ComplianceApiResponse<any>> => {
  return phantomCoresClient.post('/api/phantom-cores/compliance', {
    operation: 'get-history',
    historyParams
  });
};
