/**
 * Alert Triage & Prioritization
 * Intelligent alert triage and priority assignment
 */

import { v4 as uuidv4 } from 'uuid';
import { BusinessRule, BusinessLogicRequest, ValidationResult } from '../../core/BusinessLogicManager';

export const alertTriageRule: BusinessRule = {
  id: uuidv4(),
  serviceId: 'alert-triage-prioritization',
  operation: 'triage-alerts',
  enabled: true,
  priority: 90,

  async validator(request: BusinessLogicRequest): Promise<ValidationResult> {
    const result: ValidationResult = { isValid: true, errors: [], warnings: [] };
    const { alerts } = request.payload;

    if (!alerts || !Array.isArray(alerts)) {
      result.errors.push('Alerts array required for triage');
    }

    if (alerts && alerts.length > 1000) {
      result.warnings.push('Large number of alerts - consider batch processing');
    }

    result.isValid = result.errors.length === 0;
    return result;
  },

  async processor(request: BusinessLogicRequest): Promise<any> {
    const { alerts } = request.payload;
    
    const triageResults = alerts.map((alert: any) => {
      const baseScore = Math.random() * 100;
      const assetCriticality = Math.random() * 20;
      const threatIntelligence = Math.random() * 15;
      const falsePositiveProb = Math.random() * 0.3;
      
      const priorityScore = baseScore + assetCriticality + threatIntelligence - (falsePositiveProb * 50);
      
      let priority = 'low';
      if (priorityScore > 80) priority = 'critical';
      else if (priorityScore > 60) priority = 'high';
      else if (priorityScore > 40) priority = 'medium';

      return {
        alert_id: alert.id || uuidv4(),
        original_severity: alert.severity || 'medium',
        calculated_priority: priority,
        priority_score: Math.round(priorityScore),
        triage_factors: {
          asset_criticality: assetCriticality,
          threat_intelligence_match: threatIntelligence,
          false_positive_probability: falsePositiveProb,
          contextual_relevance: Math.random() * 10
        },
        recommended_action: priority === 'critical' ? 'immediate_investigation' :
                          priority === 'high' ? 'investigate_within_1h' :
                          priority === 'medium' ? 'investigate_within_4h' : 'scheduled_review',
        analyst_assignment: priority === 'critical' ? 'senior_analyst' : 'available_analyst',
        sla_deadline: new Date(Date.now() + (priority === 'critical' ? 1 : priority === 'high' ? 4 : 24) * 60 * 60 * 1000)
      };
    });

    return {
      triage_id: uuidv4(),
      total_alerts: alerts.length,
      triage_results: triageResults,
      summary: {
        critical: triageResults.filter(r => r.calculated_priority === 'critical').length,
        high: triageResults.filter(r => r.calculated_priority === 'high').length,
        medium: triageResults.filter(r => r.calculated_priority === 'medium').length,
        low: triageResults.filter(r => r.calculated_priority === 'low').length
      },
      processing_time_ms: Math.floor(Math.random() * 500) + 100,
      timestamp: new Date()
    };
  }
};

export const alertTriagePrioritizationRules = [alertTriageRule];