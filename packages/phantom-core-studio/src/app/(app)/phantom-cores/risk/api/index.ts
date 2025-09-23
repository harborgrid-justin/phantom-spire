// Risk Management API Functions
// API layer for risk assessment and management operations

import type {
  RiskStatus,
  RiskAssessmentData,
  TrendAnalysisData,
  MitigationData,
  GovernanceReviewData
} from '../types';

export const fetchRiskStatus = async (): Promise<RiskStatus> => {
  const response = await fetch('/api/phantom-cores/risk?operation=status');
  return response.json();
};

export const performRiskAssessment = async (assessmentData: RiskAssessmentData) => {
  const response = await fetch('/api/phantom-cores/risk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'assess-risks',
      assessmentData
    })
  });
  return response.json();
};

export const analyzeTrends = async (analysisData: TrendAnalysisData) => {
  const response = await fetch('/api/phantom-cores/risk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'analyze-trends',
      analysisData
    })
  });
  return response.json();
};

export const generateMitigation = async (mitigationData: MitigationData) => {
  const response = await fetch('/api/phantom-cores/risk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'generate-mitigation',
      mitigationData
    })
  });
  return response.json();
};

export const performGovernanceReview = async (reviewData: GovernanceReviewData) => {
  const response = await fetch('/api/phantom-cores/risk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reviewData)
  });
  return response.json();
};
