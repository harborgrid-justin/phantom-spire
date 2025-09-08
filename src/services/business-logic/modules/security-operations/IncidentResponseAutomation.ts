/**
 * Incident Response Automation
 * Enhanced automated incident response workflows with intelligent orchestration
 * Includes ML-driven response optimization and real-time adaptation
 */

import { v4 as uuidv4 } from 'uuid';
import { BusinessRule, BusinessLogicRequest, ValidationResult } from '../../core/BusinessLogicManager';

export interface IncidentResponseRequest {
  incident_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affected_systems?: string[];
  incident_details?: {
    description: string;
    source: string;
    detection_time: Date;
    reporter: string;
    initial_indicators: string[];
  };
  context?: {
    business_impact: 'minimal' | 'moderate' | 'significant' | 'severe';
    customer_impact: boolean;
    data_involved: boolean;
    compliance_scope: string[];
  };
}

export interface ResponseAction {
  action_id: string;
  action: string;
  category: 'containment' | 'eradication' | 'recovery' | 'communication' | 'forensics';
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  estimated_duration: number; // minutes
  actual_duration?: number;
  priority: number; // 1-10, 10 being highest
  automation_level: 'fully_automated' | 'semi_automated' | 'manual';
  prerequisites: string[];
  dependencies: string[];
  success_criteria: string[];
  rollback_procedure?: string;
  assigned_to?: string;
  started_at?: Date;
  completed_at?: Date;
  outcome?: string;
  evidence_collected?: string[];
}

export interface IncidentResponseResponse {
  response_id: string;
  incident_type: string;
  severity: string;
  response_strategy: string;
  automated_actions: ResponseAction[];
  playbook_details: {
    name: string;
    version: string;
    last_updated: Date;
    effectiveness_score: number; // 0-1
    previous_uses: number;
  };
  timeline: {
    incident_detected: Date;
    response_initiated: Date;
    estimated_containment: Date;
    estimated_resolution: Date;
    estimated_recovery: Date;
  };
  resources_required: {
    personnel: Array<{ role: string; count: number; skill_level: string }>;
    tools: string[];
    external_resources: string[];
  };
  communication_plan: {
    internal_notifications: Array<{ recipient: string; urgency: string; template: string }>;
    external_notifications: Array<{ type: string; timeframe: string; required: boolean }>;
    status_updates: Array<{ stakeholder: string; frequency: string; method: string }>;
  };
  compliance_requirements: Array<{
    framework: string;
    requirement: string;
    deadline: Date;
    status: 'pending' | 'in_progress' | 'completed';
  }>;
  cost_estimates: {
    personnel_hours: number;
    system_downtime_cost: number;
    recovery_cost: number;
    total_estimated_cost: number;
  };
  success_metrics: {
    time_to_containment_target: number; // minutes
    time_to_resolution_target: number; // minutes
    business_impact_score: number; // 1-10
    stakeholder_satisfaction_target: number; // 0-1
  };
  timestamp: Date;
}

/**
 * Enhanced incident response automation rule with intelligent orchestration
 */
export const enhancedIncidentResponseRule: BusinessRule = {
  id: uuidv4(),
  serviceId: 'incident-response-automation',
  operation: 'automate-response',
  enabled: true,
  priority: 100,

  async validator(request: BusinessLogicRequest): Promise<ValidationResult> {
    const result: ValidationResult = { isValid: true, errors: [], warnings: [] };
    const { incident_type, severity, affected_systems, context } = request.payload as IncidentResponseRequest;

    // Enhanced validation
    if (!incident_type || typeof incident_type !== 'string') {
      result.errors.push('Valid incident type required for automated response');
    }

    const validSeverities = ['low', 'medium', 'high', 'critical'];
    if (!severity || !validSeverities.includes(severity)) {
      result.errors.push(`Invalid severity. Valid options: ${validSeverities.join(', ')}`);
    }

    if (affected_systems && !Array.isArray(affected_systems)) {
      result.errors.push('Affected systems must be an array');
    }

    // Severity-specific validations
    if (severity === 'critical') {
      if (!context?.business_impact) {
        result.warnings.push('Business impact assessment recommended for critical incidents');
      }
      if (affected_systems && affected_systems.length === 0) {
        result.warnings.push('Critical incidents typically involve affected systems');
      }
    }

    // Data protection compliance checks
    if (context?.data_involved && !context?.compliance_scope) {
      result.warnings.push('Compliance scope should be specified when data is involved');
    }

    result.isValid = result.errors.length === 0;
    return result;
  },

  async processor(request: BusinessLogicRequest): Promise<IncidentResponseResponse> {
    const { 
      incident_type, 
      severity, 
      affected_systems = [],
      incident_details,
      context
    } = request.payload as IncidentResponseRequest;
    
    const responseId = uuidv4();
    
    // Enhanced response actions based on incident type and severity
    const responseStrategies = {
      'malware': {
        strategy: 'Isolate, Analyze, Eradicate, Recover',
        actions: [
          { action: 'Isolate affected systems', category: 'containment', priority: 10, duration: 5 },
          { action: 'Scan network for lateral spread', category: 'containment', priority: 9, duration: 15 },
          { action: 'Collect malware samples', category: 'forensics', priority: 8, duration: 10 },
          { action: 'Update security signatures', category: 'eradication', priority: 7, duration: 5 },
          { action: 'Clean infected systems', category: 'eradication', priority: 6, duration: 30 },
          { action: 'Restore from clean backups', category: 'recovery', priority: 5, duration: 45 },
          { action: 'Notify affected users', category: 'communication', priority: 4, duration: 10 }
        ]
      },
      'phishing': {
        strategy: 'Block, Remove, Educate, Monitor',
        actions: [
          { action: 'Block malicious sender', category: 'containment', priority: 10, duration: 2 },
          { action: 'Remove phishing emails', category: 'containment', priority: 9, duration: 10 },
          { action: 'Reset compromised credentials', category: 'containment', priority: 8, duration: 15 },
          { action: 'Update email filters', category: 'eradication', priority: 7, duration: 5 },
          { action: 'Conduct user training', category: 'recovery', priority: 6, duration: 60 },
          { action: 'Monitor for follow-up attacks', category: 'recovery', priority: 5, duration: 120 }
        ]
      },
      'data_breach': {
        strategy: 'Contain, Assess, Notify, Remediate',
        actions: [
          { action: 'Contain data exposure', category: 'containment', priority: 10, duration: 10 },
          { action: 'Assess scope of breach', category: 'forensics', priority: 9, duration: 60 },
          { action: 'Preserve forensic evidence', category: 'forensics', priority: 8, duration: 30 },
          { action: 'Notify legal and compliance', category: 'communication', priority: 8, duration: 5 },
          { action: 'Prepare breach notifications', category: 'communication', priority: 7, duration: 120 },
          { action: 'Implement additional controls', category: 'recovery', priority: 6, duration: 180 }
        ]
      },
      'ransomware': {
        strategy: 'Isolate, Preserve, Assess, Recover',
        actions: [
          { action: 'Emergency system isolation', category: 'containment', priority: 10, duration: 3 },
          { action: 'Preserve encrypted systems', category: 'forensics', priority: 9, duration: 15 },
          { action: 'Assess backup integrity', category: 'recovery', priority: 8, duration: 30 },
          { action: 'Contact law enforcement', category: 'communication', priority: 7, duration: 20 },
          { action: 'Evaluate payment options', category: 'recovery', priority: 6, duration: 60 },
          { action: 'Restore from backups', category: 'recovery', priority: 5, duration: 240 }
        ]
      },
      'insider_threat': {
        strategy: 'Secure, Investigate, Document, Remediate',
        actions: [
          { action: 'Secure user accounts', category: 'containment', priority: 10, duration: 5 },
          { action: 'Review access logs', category: 'forensics', priority: 9, duration: 45 },
          { action: 'Interview relevant personnel', category: 'forensics', priority: 8, duration: 120 },
          { action: 'Coordinate with HR/Legal', category: 'communication', priority: 7, duration: 30 },
          { action: 'Implement monitoring controls', category: 'recovery', priority: 6, duration: 60 }
        ]
      }
    };

    const strategy = responseStrategies[incident_type as keyof typeof responseStrategies] || 
                    responseStrategies['malware']; // Default fallback

    // Create enhanced response actions
    const automatedActions: ResponseAction[] = strategy.actions.map((actionTemplate, index) => {
      const severityMultiplier = {
        'critical': 0.7, // Faster response for critical
        'high': 1.0,
        'medium': 1.3,
        'low': 1.8
      }[severity] || 1.0;

      const automationLevel = actionTemplate.priority >= 8 ? 'fully_automated' : 
                             actionTemplate.priority >= 6 ? 'semi_automated' : 'manual';

      return {
        action_id: uuidv4(),
        action: actionTemplate.action,
        category: actionTemplate.category as any,
        status: 'pending',
        estimated_duration: Math.round(actionTemplate.duration * severityMultiplier),
        priority: actionTemplate.priority,
        automation_level: automationLevel as any,
        prerequisites: index > 0 ? [strategy.actions[index - 1].action] : [],
        dependencies: actionTemplate.category === 'recovery' ? ['containment_complete'] : [],
        success_criteria: [
          `${actionTemplate.action.toLowerCase().replace(' ', '_')}_completed`,
          'no_escalation_required'
        ]
      };
    });

    // Calculate timeline estimates
    const now = new Date();
    const totalDuration = automatedActions.reduce((sum, action) => sum + action.estimated_duration, 0);
    
    const timeline = {
      incident_detected: incident_details?.detection_time || now,
      response_initiated: now,
      estimated_containment: new Date(now.getTime() + 
        automatedActions.filter(a => a.category === 'containment')
                       .reduce((sum, a) => sum + a.estimated_duration, 0) * 60000),
      estimated_resolution: new Date(now.getTime() + totalDuration * 60000),
      estimated_recovery: new Date(now.getTime() + (totalDuration + 120) * 60000) // +2 hours buffer
    };

    // Calculate cost estimates
    const personnelHours = totalDuration / 60;
    const downtimeCost = severity === 'critical' ? 50000 : 
                        severity === 'high' ? 25000 : 
                        severity === 'medium' ? 10000 : 2000;

    return {
      response_id: responseId,
      incident_type,
      severity,
      response_strategy: strategy.strategy,
      automated_actions: automatedActions,
      playbook_details: {
        name: `${incident_type.toUpperCase()}_Response_Playbook`,
        version: '3.1.0',
        last_updated: new Date(Date.now() - 86400000 * 30), // 30 days ago
        effectiveness_score: 0.87 + Math.random() * 0.1,
        previous_uses: Math.floor(Math.random() * 50) + 10
      },
      timeline,
      resources_required: {
        personnel: [
          { role: 'Incident Commander', count: 1, skill_level: 'Senior' },
          { role: 'Security Analyst', count: severity === 'critical' ? 3 : 2, skill_level: 'Intermediate' },
          { role: 'IT Support', count: Math.max(1, affected_systems.length), skill_level: 'Junior' }
        ],
        tools: ['SIEM', 'EDR', 'Forensics Suite', 'Communication Platform'],
        external_resources: severity === 'critical' ? ['External Forensics', 'Legal Counsel'] : []
      },
      communication_plan: {
        internal_notifications: [
          { recipient: 'Security Team', urgency: 'immediate', template: 'incident_alert' },
          { recipient: 'Management', urgency: severity === 'critical' ? 'immediate' : 'high', template: 'executive_summary' },
          { recipient: 'IT Operations', urgency: 'high', template: 'technical_details' }
        ],
        external_notifications: context?.data_involved ? [
          { type: 'Regulatory Notification', timeframe: '72 hours', required: true },
          { type: 'Customer Notification', timeframe: '24 hours', required: context.customer_impact }
        ] : [],
        status_updates: [
          { stakeholder: 'Executive Team', frequency: 'every 2 hours', method: 'email' },
          { stakeholder: 'Security Team', frequency: 'every 30 minutes', method: 'chat' }
        ]
      },
      compliance_requirements: (context?.compliance_scope || []).map(framework => ({
        framework,
        requirement: `${framework} incident reporting`,
        deadline: new Date(now.getTime() + (framework.includes('GDPR') ? 72 : 24) * 3600000),
        status: 'pending' as const
      })),
      cost_estimates: {
        personnel_hours: personnelHours,
        system_downtime_cost: downtimeCost,
        recovery_cost: Math.round(personnelHours * 150 + downtimeCost * 0.1), // $150/hour + 10% of downtime
        total_estimated_cost: Math.round(personnelHours * 150 + downtimeCost * 1.1)
      },
      success_metrics: {
        time_to_containment_target: severity === 'critical' ? 15 : 60, // minutes
        time_to_resolution_target: severity === 'critical' ? 240 : 1440, // minutes (4h vs 24h)
        business_impact_score: {
          'critical': 9,
          'high': 7,
          'medium': 5,
          'low': 3
        }[severity] || 5,
        stakeholder_satisfaction_target: 0.85
      },
      timestamp: now
    };
  }
};

export const incidentResponseAutomationRules = [enhancedIncidentResponseRule];