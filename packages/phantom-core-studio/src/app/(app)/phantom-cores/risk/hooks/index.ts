// Risk Management Hooks
// Custom hooks for risk assessment and management functionality

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchRiskStatus, performRiskAssessment, analyzeTrends, generateMitigation, performGovernanceReview } from '../api';
import type { RiskAssessment, RiskColor, RiskLevel, AssessmentType } from '../types';

// Hook for fetching risk status with automatic refresh
export const useRiskStatus = () => {
  return useQuery({
    queryKey: ['risk-status'],
    queryFn: fetchRiskStatus,
    refetchInterval: 30000,
  });
};

// Hook for risk assessment operations
export const useRiskAssessment = () => {
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null);
  const [loading, setLoading] = useState(false);
  const [assessmentType, setAssessmentType] = useState<AssessmentType>('comprehensive');
  const [organization, setOrganization] = useState('Enterprise Organization');

  const assessmentTypes: AssessmentType[] = [
    'comprehensive', 'operational', 'financial', 'cybersecurity', 'compliance'
  ];

  const runRiskAssessment = async () => {
    setLoading(true);
    try {
      const result = await performRiskAssessment({
        organization: organization,
        assessment_type: assessmentType,
        scope: 'enterprise_wide',
        risk_appetite: 'moderate',
        assessment_framework: 'ISO 31000'
      });
      setAssessment(result.data);
    } catch (error) {
      console.error('Risk assessment failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    assessment,
    loading,
    assessmentType,
    setAssessmentType,
    organization,
    setOrganization,
    assessmentTypes,
    runRiskAssessment
  };
};

// Hook for risk operations
export const useRiskOperations = () => {
  const [activeOperation, setActiveOperation] = useState<string | null>(null);
  const [operationResult, setOperationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runOperation = async (operationId: string, action: () => Promise<any>) => {
    setLoading(true);
    setActiveOperation(operationId);
    try {
      const result = await action();
      setOperationResult(result);
    } catch (error) {
      console.error(`Operation ${operationId} failed:`, error);
    } finally {
      setLoading(false);
    }
  };

  const runTrendAnalysis = () => runOperation('trends', async () => {
    const result = await analyzeTrends({
      analysis_period: '12_months',
      trend_categories: ['operational', 'financial', 'cybersecurity'],
      prediction_horizon: '6_months'
    });
    return result.data;
  });

  const runMitigationGeneration = () => runOperation('mitigation', async () => {
    const result = await generateMitigation({
      risk_tolerance: 'moderate',
      budget_constraints: 'standard',
      timeline: '12_months',
      priority_areas: ['cybersecurity', 'operational', 'compliance']
    });
    return result.data;
  });

  const runGovernanceReview = () => runOperation('governance', async () => {
    const result = await performGovernanceReview({
      operation: 'governance-review',
      frameworks: ['ISO 31000', 'COSO ERM', 'Basel III'],
      scope: 'enterprise_wide'
    });
    return result.data;
  });

  return {
    activeOperation,
    operationResult,
    loading,
    runTrendAnalysis,
    runMitigationGeneration,
    runGovernanceReview
  };
};

// Utility hooks for risk calculations
export const useRiskUtils = () => {
  const getRiskColor = (score: number): RiskColor => {
    if (score <= 30) return 'success';
    if (score <= 60) return 'warning';
    return 'error';
  };

  const getRiskLevel = (score: number): RiskLevel => {
    if (score <= 30) return 'Low Risk';
    if (score <= 60) return 'Medium Risk';
    return 'High Risk';
  };

  return {
    getRiskColor,
    getRiskLevel
  };
};
