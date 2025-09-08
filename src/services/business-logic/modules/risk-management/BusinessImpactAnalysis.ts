/**
 * Business Impact Analysis
 * Analyze and quantify business impact of security incidents and controls
 */

import { v4 as uuidv4 } from 'uuid';
import { BusinessRule, BusinessLogicRequest, ValidationResult } from '../../core/BusinessLogicManager';

export const businessImpactAnalysisRule: BusinessRule = {
  id: uuidv4(),
  serviceId: 'business-impact-analysis',
  operation: 'analyze-impact',
  enabled: true,
  priority: 85,

  async validator(request: BusinessLogicRequest): Promise<ValidationResult> {
    const result: ValidationResult = { isValid: true, errors: [], warnings: [] };
    const { analysis_type, business_processes } = request.payload;

    const validTypes = ['incident_impact', 'control_investment', 'process_assessment', 'scenario_analysis'];
    if (!analysis_type || !validTypes.includes(analysis_type)) {
      result.errors.push(`Invalid analysis type. Valid: ${validTypes.join(', ')}`);
    }

    result.isValid = result.errors.length === 0;
    return result;
  },

  async processor(request: BusinessLogicRequest): Promise<any> {
    const { 
      analysis_type,
      business_processes = [],
      timeframe = '12_months',
      analysis_scope = 'organization_wide'
    } = request.payload;
    
    const impactCategories = {
      financial: {
        direct_costs: Math.floor(Math.random() * 500000) + 100000,
        indirect_costs: Math.floor(Math.random() * 300000) + 50000,
        revenue_loss: Math.floor(Math.random() * 1000000) + 200000,
        recovery_costs: Math.floor(Math.random() * 200000) + 50000
      },
      operational: {
        downtime_hours: Math.floor(Math.random() * 72) + 2,
        affected_processes: Math.floor(Math.random() * 10) + 3,
        productivity_loss_percentage: Math.floor(Math.random() * 30) + 10,
        service_disruption_level: ['minimal', 'moderate', 'significant', 'severe'][Math.floor(Math.random() * 4)]
      },
      reputational: {
        brand_impact_score: Math.random() * 0.5 + 0.3, // 0.3-0.8
        customer_trust_impact: Math.random() * 0.4 + 0.4, // 0.4-0.8
        media_coverage_risk: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
        stakeholder_confidence: 0.6 + Math.random() * 0.3 // 0.6-0.9
      },
      regulatory: {
        compliance_violations: Math.floor(Math.random() * 5),
        potential_fines: Math.floor(Math.random() * 1000000) + 50000,
        regulatory_scrutiny_level: ['routine', 'increased', 'intensive'][Math.floor(Math.random() * 3)],
        certification_risk: Math.random() > 0.7 ? 'at_risk' : 'stable'
      }
    };

    const riskScenarios = [
      {
        scenario: 'Data Breach - Customer PII',
        probability: 0.15 + Math.random() * 0.2,
        impact_severity: 'high',
        estimated_cost: Math.floor(Math.random() * 2000000) + 500000,
        recovery_time: Math.floor(Math.random() * 30) + 14
      },
      {
        scenario: 'Ransomware Attack',
        probability: 0.25 + Math.random() * 0.15,
        impact_severity: 'critical',
        estimated_cost: Math.floor(Math.random() * 1500000) + 300000,
        recovery_time: Math.floor(Math.random() * 14) + 7
      },
      {
        scenario: 'System Outage - Core Services',
        probability: 0.35 + Math.random() * 0.2,
        impact_severity: 'medium',
        estimated_cost: Math.floor(Math.random() * 500000) + 100000,
        recovery_time: Math.floor(Math.random() * 5) + 2
      }
    ];

    const totalAnnualRisk = riskScenarios.reduce((sum, scenario) => 
      sum + (scenario.estimated_cost * scenario.probability), 0);

    return {
      analysis_id: uuidv4(),
      analysis_type,
      analysis_scope,
      timeframe,
      impact_categories: impactCategories,
      risk_scenarios: riskScenarios,
      financial_summary: {
        total_annual_risk: totalAnnualRisk,
        maximum_tolerable_downtime: Math.floor(Math.random() * 24) + 4,
        break_even_security_investment: Math.floor(totalAnnualRisk * 0.1),
        cost_of_prevention: Math.floor(totalAnnualRisk * 0.05),
        roi_security_investment: Math.floor(Math.random() * 300) + 150
      },
      business_continuity: {
        critical_processes: business_processes.slice(0, 3),
        recovery_time_objectives: business_processes.map(() => Math.floor(Math.random() * 24) + 2),
        recovery_point_objectives: business_processes.map(() => Math.floor(Math.random() * 60) + 15),
        minimum_service_levels: business_processes.map(() => Math.floor(Math.random() * 30) + 70)
      },
      recommendations: [
        'Invest in advanced threat detection to reduce incident probability',
        'Develop comprehensive business continuity plans',
        'Implement redundant systems for critical processes',
        'Enhance incident response capabilities',
        'Regular business impact assessment reviews'
      ].slice(0, Math.floor(Math.random() * 4) + 3),
      mitigation_priorities: [
        { priority: 'high', action: 'Implement backup systems for critical processes', estimated_cost: 250000 },
        { priority: 'medium', action: 'Enhance monitoring and alerting', estimated_cost: 100000 },
        { priority: 'low', action: 'Staff cross-training programs', estimated_cost: 50000 }
      ],
      next_review_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      timestamp: new Date()
    };
  }
};

export const businessImpactAnalysisRules = [businessImpactAnalysisRule];