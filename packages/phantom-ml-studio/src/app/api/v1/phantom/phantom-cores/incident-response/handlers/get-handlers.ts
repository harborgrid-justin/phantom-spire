// GET request handlers for Incident Response API

import { createApiResponse, getRandomItem, ANALYSTS, AFFECTED_ASSETS } from '../utils';
import { IncidentResponseStatus, Incident, TimelineEvent, Playbook, ResponseMetrics, ApiResponse } from '../types';

/**
 * Handle status operation
 */
export function handleStatus(): ApiResponse<IncidentResponseStatus> {
  const data: IncidentResponseStatus = {
    status: 'operational',
    metrics: {
      uptime: '99.8%',
      active_incidents: 15,
      response_time_avg: '45 min',
      resolution_rate: 0.94,
      team_readiness: 0.85
    },
    components: {
      incident_metrics: {
        open: 15,
        investigating: 8,
        contained: 4,
        resolved: 1219,
        false_positives: 9
      },
      response_performance: {
        mean_time_to_detection: '12.5 minutes',
        mean_time_to_response: '45 minutes',
        mean_time_to_containment: '2.3 hours',
        mean_time_to_recovery: '8.7 hours',
        sla_compliance: 0.94
      },
      severity_distribution: {
        critical: 3,
        high: 5,
        medium: 7,
        low: 0,
        informational: 0
      },
      team_status: {
        analysts_available: 12,
        analysts_busy: 8,
        escalation_queue: 3,
        on_call_engineers: 4
      }
    }
  };

  return createApiResponse(true, data);
}

/**
 * Handle incidents operation
 */
export function handleIncidents(): ApiResponse<{ total_incidents: number; incidents: Incident[] }> {
  const incidents: Incident[] = [
    {
      id: 'INC-2024-001',
      title: 'Suspected APT Activity on Executive Workstation',
      severity: 'CRITICAL',
      status: 'investigating',
      created: '2024-01-15T08:30:00Z',
      assigned_to: 'John Smith',
      affected_assets: ['WS-EXEC-001'],
      indicators: 12,
      timeline_entries: 8
    },
    {
      id: 'INC-2024-002',
      title: 'Ransomware Detection on File Server',
      severity: 'HIGH',
      status: 'contained',
      created: '2024-01-15T06:15:00Z',
      assigned_to: 'Jane Doe',
      affected_assets: ['SRV-FILE-003', 'SRV-FILE-004'],
      indicators: 23,
      timeline_entries: 15
    },
    {
      id: 'INC-2024-003',
      title: 'Phishing Campaign Targeting Finance Department',
      severity: 'MEDIUM',
      status: 'investigating',
      created: '2024-01-15T07:45:00Z',
      assigned_to: 'Mike Johnson',
      affected_assets: ['Multiple Users'],
      indicators: 8,
      timeline_entries: 5
    }
  ];

  const data = {
    total_incidents: incidents.length,
    incidents
  };

  return createApiResponse(true, data);
}

/**
 * Handle timeline operation
 */
export function handleTimeline(incidentId?: string): ApiResponse<{ incident_id: string; timeline: TimelineEvent[] }> {
  const timeline: TimelineEvent[] = [
    {
      timestamp: '2024-01-15T08:30:00Z',
      event: 'Incident Created',
      severity: 'INFO',
      description: 'Initial alert from EDR system',
      analyst: 'System',
      artifacts: []
    },
    {
      timestamp: '2024-01-15T08:35:00Z',
      event: 'Initial Triage',
      severity: 'INFO',
      description: 'Assigned to Tier 1 analyst for initial assessment',
      analyst: 'John Smith',
      artifacts: ['edr-alert-001.json']
    },
    {
      timestamp: '2024-01-15T08:45:00Z',
      event: 'Escalation',
      severity: 'MEDIUM',
      description: 'Escalated to Tier 2 due to suspicious process behavior',
      analyst: 'John Smith',
      artifacts: ['process-analysis.txt']
    },
    {
      timestamp: '2024-01-15T09:15:00Z',
      event: 'IOC Identification',
      severity: 'HIGH',
      description: 'Identified suspicious network communication to known C2',
      analyst: 'Sarah Wilson',
      artifacts: ['network-capture.pcap', 'ioc-list.csv']
    },
    {
      timestamp: '2024-01-15T09:30:00Z',
      event: 'Containment Action',
      severity: 'HIGH',
      description: 'Isolated affected workstation from network',
      analyst: 'Mike Johnson',
      artifacts: ['containment-log.txt']
    }
  ];

  const data = {
    incident_id: incidentId || 'INC-2024-001',
    timeline
  };

  return createApiResponse(true, data);
}

/**
 * Handle playbooks operation
 */
export function handlePlaybooks(): ApiResponse<{ total_playbooks: number; playbooks: Playbook[] }> {
  const playbooks: Playbook[] = [
    {
      id: 'pb-001',
      name: 'Malware Investigation',
      description: 'Standard procedures for malware incident response',
      triggers: ['malware_detected', 'suspicious_file'],
      steps: 12,
      automation_level: 'Semi-Automated',
      last_used: '2024-01-15T09:30:00Z'
    },
    {
      id: 'pb-002',
      name: 'Data Breach Response',
      description: 'Comprehensive data breach incident handling',
      triggers: ['data_exfiltration', 'unauthorized_access'],
      steps: 18,
      automation_level: 'Manual',
      last_used: '2024-01-14T16:20:00Z'
    },
    {
      id: 'pb-003',
      name: 'Phishing Response',
      description: 'Rapid response to phishing campaigns',
      triggers: ['phishing_email', 'credential_harvesting'],
      steps: 8,
      automation_level: 'Automated',
      last_used: '2024-01-15T07:45:00Z'
    }
  ];

  const data = {
    total_playbooks: 27,
    playbooks
  };

  return createApiResponse(true, data);
}

/**
 * Handle metrics operation
 */
export function handleMetrics(): ApiResponse<ResponseMetrics> {
  const data: ResponseMetrics = {
    response_times: {
      detection_time: {
        average: 12.5,
        median: 8.2,
        p95: 45.7,
        unit: 'minutes'
      },
      response_time: {
        average: 45,
        median: 32,
        p95: 120,
        unit: 'minutes'
      },
      containment_time: {
        average: 2.3,
        median: 1.8,
        p95: 6.2,
        unit: 'hours'
      }
    },
    incident_trends: {
      daily_incidents: [5, 7, 3, 8, 6, 4, 9, 2, 6, 5],
      monthly_resolved: 156,
      false_positive_rate: 0.078,
      escalation_rate: 0.234
    },
    team_performance: {
      analyst_workload: 3.2,
      sla_compliance: 94.3,
      customer_satisfaction: 4.6,
      knowledge_base_usage: 0.87
    }
  };

  return createApiResponse(true, data);
}
