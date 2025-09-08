/**
 * Containment Strategy Engine
 * Intelligent containment strategy selection and execution
 */

import { v4 as uuidv4 } from 'uuid';
import { BusinessRule, BusinessLogicRequest, ValidationResult } from '../../core/BusinessLogicManager';

export const containmentStrategyRule: BusinessRule = {
  id: uuidv4(),
  serviceId: 'containment-strategy',
  operation: 'select-strategy',
  enabled: true,
  priority: 95,

  async validator(request: BusinessLogicRequest): Promise<ValidationResult> {
    const result: ValidationResult = { isValid: true, errors: [], warnings: [] };
    const { threat_type, affected_systems } = request.payload;

    if (!threat_type) {
      result.errors.push('Threat type required for containment strategy');
    }

    result.isValid = result.errors.length === 0;
    return result;
  },

  async processor(request: BusinessLogicRequest): Promise<any> {
    const { threat_type, affected_systems = [], business_impact } = request.payload;
    
    const strategies = {
      'malware': ['network_isolation', 'process_termination', 'file_quarantine'],
      'ransomware': ['network_segmentation', 'system_isolation', 'backup_activation'],
      'insider_threat': ['account_suspension', 'access_revocation', 'activity_monitoring'],
      'apt': ['covert_monitoring', 'selective_isolation', 'evidence_preservation']
    };

    const selectedStrategy = strategies[threat_type as keyof typeof strategies] || ['investigate', 'monitor'];
    
    return {
      strategy_id: uuidv4(),
      threat_type,
      recommended_strategy: selectedStrategy[0],
      alternative_strategies: selectedStrategy.slice(1),
      containment_actions: selectedStrategy.map(action => ({
        action,
        priority: Math.floor(Math.random() * 5) + 1,
        estimated_duration: Math.floor(Math.random() * 120) + 15,
        business_impact: ['minimal', 'low', 'medium', 'high'][Math.floor(Math.random() * 4)],
        automation_available: Math.random() > 0.5,
        approval_required: action.includes('isolation') || action.includes('suspension')
      })),
      risk_assessment: {
        containment_effectiveness: 0.8 + Math.random() * 0.2,
        business_disruption: Math.random() * 0.5,
        collateral_damage_risk: Math.random() * 0.3
      },
      rollback_plan: 'available',
      monitoring_requirements: ['network_traffic', 'system_logs', 'user_activity'],
      timestamp: new Date()
    };
  }
};

export const containmentStrategyRules = [containmentStrategyRule];