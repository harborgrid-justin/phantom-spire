// Phantom Incident Response Core API Route
// Provides REST endpoints for incident response management and coordination

import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/phantom-cores/incident-response - Get incident response system status and data
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const operation = url.searchParams.get('operation') || 'status';

    switch (operation) {
      case 'status':
        return NextResponse.json({
          success: true,
          data: {
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
          },
          source: 'phantom-incident-response-core',
          timestamp: new Date().toISOString()
        });

      case 'incidents':
        return NextResponse.json({
          success: true,
          data: {
            total_incidents: 15,
            incidents: [
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
            ]
          },
          source: 'phantom-incident-response-core',
          timestamp: new Date().toISOString()
        });

      case 'timeline':
        const incidentId = new URL(request.url).searchParams.get('incident_id');
        return NextResponse.json({
          success: true,
          data: {
            incident_id: incidentId || 'INC-2024-001',
            timeline: [
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
            ]
          },
          source: 'phantom-incident-response-core',
          timestamp: new Date().toISOString()
        });

      case 'playbooks':
        return NextResponse.json({
          success: true,
          data: {
            total_playbooks: 27,
            playbooks: [
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
            ]
          },
          source: 'phantom-incident-response-core',
          timestamp: new Date().toISOString()
        });

      case 'metrics':
        return NextResponse.json({
          success: true,
          data: {
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
          },
          source: 'phantom-incident-response-core',
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json({
          success: false,
          error: `Unknown operation: ${operation}`,
          timestamp: new Date().toISOString()
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Incident Response API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * POST /api/phantom-cores/incident-response - Create incidents or perform response actions
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation, ...params } = body;

    // Debug logging
    console.log('Incident Response API - Received operation:', operation);
    console.log('Incident Response API - Full body:', JSON.stringify(body, null, 2));

    switch (operation) {
      case 'analyze-incident':
        // Mock incident analysis
        return NextResponse.json({
          success: true,
          data: {
            analysis_id: 'incident-analysis-' + Date.now(),
            incident_profile: {
              incident_id: 'INC-2024-' + String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
              incident_type: params.incidentData?.incident_type || 'security_breach',
              severity_level: params.incidentData?.severity_level || 'HIGH',
              response_status: 'analysis_complete'
            },
            response_metrics: {
              time_to_detection: Math.floor(Math.random() * 30) + 5 + ' minutes',
              time_to_response: Math.floor(Math.random() * 60) + 15 + ' minutes',
              estimated_resolution: Math.floor(Math.random() * 8) + 2 + ' hours',
              confidence_score: Math.random() * 0.3 + 0.7
            },
            containment_actions: [
              'Immediate network isolation initiated',
              'Affected systems quarantined', 
              'User accounts secured',
              'Evidence preservation procedures activated'
            ],
            recommendations: [
              'Escalate to senior incident response team',
              'Initiate legal and compliance notification procedures',
              'Activate crisis communication plan',
              'Prepare forensic investigation resources',
              'Schedule executive briefing within 2 hours'
            ]
          },
          source: 'phantom-incident-response-core',
          timestamp: new Date().toISOString()
        });

      case 'initiate-response':
        // Mock response initiation
        return NextResponse.json({
          success: true,
          data: {
            response_id: 'response-' + Date.now(),
            activation_level: params.responseData?.response_level || 'full_activation',
            team_assembly_status: 'teams_assembling',
            estimated_full_activation: '15 minutes',
            activated_teams: [
              'Incident Response Team',
              'Security Operations Center',
              'IT Operations',
              'Legal & Compliance',
              'Communications Team'
            ],
            immediate_actions: [
              'War room established',
              'Communication channels activated',
              'Stakeholder notifications initiated',
              'Resource allocation in progress'
            ],
            next_milestones: [
              { action: 'Team assembly complete', eta: '15 minutes' },
              { action: 'Initial containment assessment', eta: '30 minutes' },
              { action: 'Executive briefing', eta: '1 hour' },
              { action: 'Public relations strategy', eta: '2 hours' }
            ]
          },
          source: 'phantom-incident-response-core',
          timestamp: new Date().toISOString()
        });

      case 'coordinate-team':
        // Mock team coordination
        return NextResponse.json({
          success: true,
          data: {
            coordination_id: 'coord-' + Date.now(),
            coordination_status: 'active',
            unified_command_established: true,
            active_teams: params.teamData?.teams || ['technical_response', 'communications', 'legal', 'management'],
            resource_allocation: {
              technical_analysts: 8,
              forensic_specialists: 3,
              communication_leads: 2,
              legal_advisors: 1,
              executive_liaisons: 2
            },
            coordination_channels: [
              'Primary: Incident Response Bridge',
              'Technical: SOC Secure Channel',
              'Executive: Leadership Crisis Line',
              'External: Vendor Support Bridge'
            ],
            status_reporting: {
              frequency: 'Every 30 minutes',
              next_update: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
              distribution_list: ['C-Suite', 'Legal', 'IT Leadership', 'HR']
            },
            current_priorities: [
              'Contain and assess scope of impact',
              'Preserve evidence and maintain chain of custody',
              'Prepare stakeholder communications',
              'Coordinate with external partners as needed'
            ]
          },
          source: 'phantom-incident-response-core',
          timestamp: new Date().toISOString()
        });

      case 'generate-incident-report':
        // Mock incident report generation
        return NextResponse.json({
          success: true,
          data: {
            report_id: 'incident-report-' + Date.now(),
            report_type: params.reportData?.report_type || 'Post-Incident Analysis Report',
            generated_at: new Date().toISOString(),
            incident_summary: {
              incident_id: 'INC-2024-' + String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
              duration: Math.floor(Math.random() * 12) + 2 + ' hours',
              severity: 'HIGH',
              business_impact: 'MEDIUM',
              systems_affected: Math.floor(Math.random() * 20) + 5
            },
            timeline_analysis: {
              detection_time: '8 minutes',
              response_time: '23 minutes', 
              containment_time: '1.5 hours',
              resolution_time: '4.2 hours',
              total_incident_duration: '6.1 hours'
            },
            key_findings: [
              'Initial compromise vector identified as spear-phishing email',
              'Lateral movement contained within 2 hours of detection',
              'No evidence of data exfiltration found',
              'Response procedures followed according to playbook',
              'Cross-team coordination was effective'
            ],
            lessons_learned: [
              'Enhance email security filtering for targeted attacks',
              'Improve network segmentation in affected department',
              'Update user training to include latest phishing techniques',
              'Consider additional monitoring tools for early detection'
            ],
            recommendations: [
              'Implement advanced email threat protection',
              'Conduct tabletop exercise within 30 days',
              'Review and update incident response procedures',
              'Schedule follow-up security awareness training',
              'Enhance monitoring for similar attack patterns'
            ],
            compliance_notes: params.reportData?.compliance_requirements?.length > 0 
              ? `Report addresses requirements for: ${params.reportData.compliance_requirements.join(', ')}`
              : 'Standard incident reporting compliance maintained',
            download_url: '/api/reports/incident-' + Date.now() + '.pdf'
          },
          source: 'phantom-incident-response-core',
          timestamp: new Date().toISOString()
        });

      case 'create':
        // Mock incident creation (legacy support)
        return NextResponse.json({
          success: true,
          data: {
            incident_id: 'INC-2024-' + String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
            title: params.title || 'New Security Incident',
            severity: params.severity || 'MEDIUM',
            status: 'open',
            created: new Date().toISOString(),
            assigned_to: 'Auto-Assignment Queue',
            estimated_response_time: '45 minutes',
            playbook_recommended: 'pb-001'
          },
          source: 'phantom-incident-response-core',
          timestamp: new Date().toISOString()
        });

      case 'update':
        // Mock incident update (legacy support)
        return NextResponse.json({
          success: true,
          data: {
            incident_id: params.incident_id || 'INC-2024-001',
            updated_fields: params.updates || {},
            previous_status: 'investigating',
            new_status: params.status || 'investigating',
            timeline_entry_added: true,
            notifications_sent: true
          },
          source: 'phantom-incident-response-core',
          timestamp: new Date().toISOString()
        });

      case 'escalate':
        // Mock incident escalation (legacy support)
        return NextResponse.json({
          success: true,
          data: {
            incident_id: params.incident_id || 'INC-2024-001',
            escalated_to: 'Tier 2 - Senior Analyst',
            escalation_reason: params.reason || 'Complexity requires senior review',
            estimated_response_time: '30 minutes',
            on_call_notified: true
          },
          source: 'phantom-incident-response-core',
          timestamp: new Date().toISOString()
        });

      case 'contain':
        // Mock containment action (legacy support)
        return NextResponse.json({
          success: true,
          data: {
            incident_id: params.incident_id || 'INC-2024-001',
            containment_actions: [
              'Network isolation applied',
              'User account disabled',
              'Malicious processes terminated'
            ],
            status_updated: 'contained',
            next_steps: [
              'Conduct forensic analysis',
              'Assess data impact',
              'Prepare recovery plan'
            ]
          },
          source: 'phantom-incident-response-core',
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json({
          success: false,
          error: `Unknown operation: ${operation}`,
          timestamp: new Date().toISOString()
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Incident Response API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
