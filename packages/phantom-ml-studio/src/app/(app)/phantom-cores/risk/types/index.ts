// Risk Management Types
// Comprehensive type definitions for risk assessment and management

export interface RiskStatus {
  success: boolean;
  data?: {
    status: string;
    components: Record<string, any>;
    metrics: {
      uptime: string;
      active_assessments: number;
      overall_risk_score: number;
      critical_risks: number;
    };
  };
}

export interface RiskAssessment {
  assessment_id: string;
  risk_profile: {
    organization: string;
    overall_risk_score: number;
    risk_level: string;
    assessment_date: string;
  };
  risk_categories: {
    operational: number;
    financial: number;
    reputational: number;
    compliance: number;
    technical: number;
  };
  critical_risks: any[];
  recommendations: string[];
  mitigation_strategies: string[];
}

export interface RiskAssessmentData {
  organization: string;
  assessment_type: string;
  scope: string;
  risk_appetite: string;
  assessment_framework: string;
}

export interface TrendAnalysisData {
  analysis_period: string;
  trend_categories: string[];
  prediction_horizon: string;
}

export interface MitigationData {
  risk_tolerance: string;
  budget_constraints: string;
  timeline: string;
  priority_areas: string[];
}

export interface GovernanceReviewData {
  operation: string;
  frameworks: string[];
  scope: string;
}

export interface RiskOperation {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => Promise<any>;
}

export type AssessmentType = 'comprehensive' | 'operational' | 'financial' | 'cybersecurity' | 'compliance';

export type RiskLevel = 'Low Risk' | 'Medium Risk' | 'High Risk';

export type RiskColor = 'success' | 'warning' | 'error';
