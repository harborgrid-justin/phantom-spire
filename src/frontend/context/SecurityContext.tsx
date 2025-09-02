/**
 * Security Context Provider
 * Manages security policies, RBAC, and threat detection
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { ThreatSeverity } from '../types/common';

interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  rules: SecurityRule[];
  enabled: boolean;
  priority: number;
}

interface SecurityRule {
  id: string;
  name: string;
  type: 'access_control' | 'data_classification' | 'audit' | 'threat_detection';
  condition: string;
  action: SecurityAction;
  severity: ThreatSeverity;
}

interface SecurityAction {
  type: 'allow' | 'deny' | 'alert' | 'quarantine' | 'log';
  parameters?: Record<string, any>;
}

interface SecurityEvent {
  id: string;
  timestamp: Date;
  type: string;
  severity: ThreatSeverity;
  source: string;
  description: string;
  user?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

interface SecurityState {
  policies: SecurityPolicy[];
  events: SecurityEvent[];
  threatLevel: ThreatSeverity;
  isMonitoring: boolean;
  blockedActions: string[];
  securityScore: number;
  lastThreatAssessment: Date;
}

type SecurityAction_Type =
  | { type: 'LOAD_POLICIES'; payload: SecurityPolicy[] }
  | { type: 'ADD_EVENT'; payload: SecurityEvent }
  | { type: 'UPDATE_THREAT_LEVEL'; payload: ThreatSeverity }
  | { type: 'START_MONITORING' }
  | { type: 'STOP_MONITORING' }
  | { type: 'BLOCK_ACTION'; payload: string }
  | { type: 'UNBLOCK_ACTION'; payload: string }
  | { type: 'UPDATE_SECURITY_SCORE'; payload: number };

interface SecurityContextType {
  state: SecurityState;
  checkPermission: (resource: string, action: string) => Promise<boolean>;
  logSecurityEvent: (event: Omit<SecurityEvent, 'id' | 'timestamp'>) => void;
  assessThreatLevel: () => Promise<ThreatSeverity>;
  applySecurityPolicy: (policyId: string) => Promise<void>;
  getSecurityMetrics: () => SecurityMetrics;
  startThreatMonitoring: () => void;
  stopThreatMonitoring: () => void;
}

interface SecurityMetrics {
  totalEvents: number;
  criticalEvents: number;
  blockedActions: number;
  securityScore: number;
  threatLevel: ThreatSeverity;
  complianceScore: number;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

const securityReducer = (state: SecurityState, action: SecurityAction_Type): SecurityState => {
  switch (action.type) {
    case 'LOAD_POLICIES':
      return {
        ...state,
        policies: action.payload
      };
    case 'ADD_EVENT':
      return {
        ...state,
        events: [action.payload, ...state.events].slice(0, 1000) // Keep last 1000 events
      };
    case 'UPDATE_THREAT_LEVEL':
      return {
        ...state,
        threatLevel: action.payload,
        lastThreatAssessment: new Date()
      };
    case 'START_MONITORING':
      return {
        ...state,
        isMonitoring: true
      };
    case 'STOP_MONITORING':
      return {
        ...state,
        isMonitoring: false
      };
    case 'BLOCK_ACTION':
      return {
        ...state,
        blockedActions: [...state.blockedActions, action.payload]
      };
    case 'UNBLOCK_ACTION':
      return {
        ...state,
        blockedActions: state.blockedActions.filter(a => a !== action.payload)
      };
    case 'UPDATE_SECURITY_SCORE':
      return {
        ...state,
        securityScore: action.payload
      };
    default:
      return state;
  }
};

export const SecurityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(securityReducer, {
    policies: [],
    events: [],
    threatLevel: 'low',
    isMonitoring: false,
    blockedActions: [],
    securityScore: 85,
    lastThreatAssessment: new Date()
  });

  // Load security policies on initialization
  useEffect(() => {
    const loadSecurityPolicies = async () => {
      try {
        const defaultPolicies: SecurityPolicy[] = [
          {
            id: 'access-control-1',
            name: 'Role-Based Access Control',
            description: 'Enforce role-based access to resources',
            rules: [
              {
                id: 'rule-1',
                name: 'Admin Access',
                type: 'access_control',
                condition: 'role === "admin"',
                action: { type: 'allow' },
                severity: 'informational'
              }
            ],
            enabled: true,
            priority: 1
          },
          {
            id: 'data-classification-1',
            name: 'Data Classification Policy',
            description: 'Classify and protect sensitive data',
            rules: [
              {
                id: 'rule-2',
                name: 'TLP Red Restriction',
                type: 'data_classification',
                condition: 'tlpLevel === "red"',
                action: { type: 'deny' },
                severity: 'high'
              }
            ],
            enabled: true,
            priority: 2
          },
          {
            id: 'threat-detection-1',
            name: 'Anomaly Detection',
            description: 'Detect suspicious user behavior',
            rules: [
              {
                id: 'rule-3',
                name: 'Multiple Failed Logins',
                type: 'threat_detection',
                condition: 'failedLogins > 5',
                action: { type: 'alert' },
                severity: 'medium'
              }
            ],
            enabled: true,
            priority: 3
          }
        ];

        dispatch({ type: 'LOAD_POLICIES', payload: defaultPolicies });
      } catch (error) {
        console.error('Failed to load security policies:', error);
      }
    };

    loadSecurityPolicies();
  }, []);

  // Periodic threat assessment
  useEffect(() => {
    if (!state.isMonitoring) return;

    const assessmentInterval = setInterval(async () => {
      const threatLevel = await assessThreatLevel();
      dispatch({ type: 'UPDATE_THREAT_LEVEL', payload: threatLevel });
    }, 300000); // Every 5 minutes

    return () => clearInterval(assessmentInterval);
  }, [state.isMonitoring]);

  const checkPermission = async (resource: string, action: string): Promise<boolean> => {
    try {
      // Apply security policies
      for (const policy of state.policies) {
        if (!policy.enabled) continue;

        for (const rule of policy.rules) {
          if (rule.type === 'access_control') {
            // Evaluate rule condition (simplified)
            const allowed = evaluateSecurityRule(rule, { resource, action });
            if (!allowed) {
              logSecurityEvent({
                type: 'access_denied',
                severity: rule.severity,
                source: 'security_policy',
                description: `Access denied by rule: ${rule.name}`,
                metadata: { resource, action, rule: rule.id }
              });
              return false;
            }
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Permission check failed:', error);
      return false;
    }
  };

  const evaluateSecurityRule = (rule: SecurityRule, context: Record<string, any>): boolean => {
    // Simplified rule evaluation - in production, use a proper rule engine
    try {
      // For demo purposes, always allow unless explicitly blocked
      return !state.blockedActions.includes(`${context.resource}:${context.action}`);
    } catch (error) {
      console.error('Rule evaluation error:', error);
      return false;
    }
  };

  const logSecurityEvent = (event: Omit<SecurityEvent, 'id' | 'timestamp'>): void => {
    const securityEvent: SecurityEvent = {
      ...event,
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    dispatch({ type: 'ADD_EVENT', payload: securityEvent });

    // Send to security monitoring system
    if (securityEvent.severity === 'critical' || securityEvent.severity === 'high') {
      console.warn('Security Alert:', securityEvent);
      // In production, send to SIEM or security operations center
    }
  };

  const assessThreatLevel = async (): Promise<ThreatSeverity> => {
    try {
      // Analyze recent security events
      const recentEvents = state.events.filter(
        event => Date.now() - event.timestamp.getTime() < 3600000 // Last hour
      );

      const criticalEvents = recentEvents.filter(e => e.severity === 'critical').length;
      const highEvents = recentEvents.filter(e => e.severity === 'high').length;
      const totalEvents = recentEvents.length;

      let threatLevel: ThreatSeverity = 'low';

      if (criticalEvents > 0) {
        threatLevel = 'critical';
      } else if (highEvents > 3) {
        threatLevel = 'high';
      } else if (totalEvents > 10) {
        threatLevel = 'medium';
      } else {
        threatLevel = 'low';
      }

      return threatLevel;
    } catch (error) {
      console.error('Threat assessment failed:', error);
      return 'medium';
    }
  };

  const applySecurityPolicy = async (policyId: string): Promise<void> => {
    const policy = state.policies.find(p => p.id === policyId);
    if (!policy) {
      throw new Error(`Policy not found: ${policyId}`);
    }

    logSecurityEvent({
      type: 'policy_applied',
      severity: 'informational',
      source: 'security_manager',
      description: `Security policy applied: ${policy.name}`
    });
  };

  const getSecurityMetrics = (): SecurityMetrics => {
    const totalEvents = state.events.length;
    const criticalEvents = state.events.filter(e => e.severity === 'critical').length;
    const blockedActions = state.blockedActions.length;
    
    // Calculate compliance score based on policies and events
    const complianceScore = Math.max(0, 100 - (criticalEvents * 10) - (blockedActions * 5));

    return {
      totalEvents,
      criticalEvents,
      blockedActions,
      securityScore: state.securityScore,
      threatLevel: state.threatLevel,
      complianceScore
    };
  };

  const startThreatMonitoring = (): void => {
    dispatch({ type: 'START_MONITORING' });
    logSecurityEvent({
      type: 'monitoring_started',
      severity: 'informational',
      source: 'security_manager',
      description: 'Threat monitoring activated'
    });
  };

  const stopThreatMonitoring = (): void => {
    dispatch({ type: 'STOP_MONITORING' });
    logSecurityEvent({
      type: 'monitoring_stopped',
      severity: 'informational',
      source: 'security_manager',
      description: 'Threat monitoring deactivated'
    });
  };

  const contextValue: SecurityContextType = {
    state,
    checkPermission,
    logSecurityEvent,
    assessThreatLevel,
    applySecurityPolicy,
    getSecurityMetrics,
    startThreatMonitoring,
    stopThreatMonitoring
  };

  return (
    <SecurityContext.Provider value={contextValue}>
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = (): SecurityContextType => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};