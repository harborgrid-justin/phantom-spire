// Phantom MITRE Core API Route
// Provides REST endpoints for MITRE ATT&CK framework integration and TTP analysis

import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/phantom-cores/mitre - Get MITRE system status and ATT&CK data
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
              uptime: '99.9%',
              techniques_mapped: 193,
              coverage_percentage: 0.807,
              detection_rules: 1247,
              framework_version: 'v14.1'
            },
            components: {
              framework_coverage: {
                tactics: 14,
                techniques: 193,
                sub_techniques: 401,
                procedures: 2847,
                mitigations: 42,
                groups: 142
              },
              detection_coverage: {
                techniques_covered: 156,
                coverage_percentage: 80.7,
                high_priority_gaps: 12,
                detection_rules: 1247
              },
              mapping_statistics: {
                alerts_mapped: 5623,
                incidents_analyzed: 234,
                campaigns_profiled: 45,
                threat_actors_tracked: 89
              },
              intelligence_integration: {
                active_campaigns: 23,
                recent_mappings: 156,
                threat_landscape_updates: 34
              }
            }
          },
          source: 'phantom-mitre-core',
          timestamp: new Date().toISOString()
        });

      case 'analysis':
        return NextResponse.json({
          success: true,
          data: {
            analysis_id: 'mitre-analysis-' + Date.now(),
            attack_pattern: {
              technique_id: 'T1566.001',
              technique_name: 'Spearphishing Attachment',
              tactic: 'Initial Access',
              description: 'Adversaries may send spearphishing emails with a malicious attachment',
              detection_methods: [
                'Email security solutions',
                'Endpoint detection and response',
                'Network traffic analysis',
                'User behavior analytics'
              ]
            },
            threat_context: {
              prevalence: 'HIGH',
              difficulty: 'LOW',
              impact_score: 8.5,
              detection_difficulty: 'MEDIUM',
              commonly_used_by: ['APT29', 'APT28', 'FIN7', 'Lazarus Group']
            },
            related_techniques: [
              { id: 'T1566.002', name: 'Spearphishing Link', relationship: 'similar' },
              { id: 'T1547.001', name: 'Registry Run Keys', relationship: 'follows' },
              { id: 'T1071.001', name: 'Web Protocols', relationship: 'enables' }
            ],
            mitigations: [
              {
                id: 'M1049',
                name: 'Antivirus/Antimalware',
                description: 'Use signatures to detect malicious attachments'
              },
              {
                id: 'M1021',
                name: 'Restrict Web-Based Content',
                description: 'Block suspicious file types in email'
              },
              {
                id: 'M1017',
                name: 'User Training',
                description: 'Train users to identify suspicious emails'
              }
            ],
            detection_analytics: [
              'Monitor email gateway logs for suspicious attachments',
              'Analyze process execution from Office applications',
              'Detect unusual network connections from user workstations',
              'Monitor for file writes to startup locations'
            ]
          },
          source: 'phantom-mitre-core',
          timestamp: new Date().toISOString()
        });

      case 'tactics':
        return NextResponse.json({
          success: true,
          data: {
            total_tactics: 14,
            tactics: [
              {
                id: 'TA0001',
                name: 'Initial Access',
                description: 'Adversaries try to get into your network',
                techniques: 9,
                coverage: 0.89,
                recent_activity: 45
              },
              {
                id: 'TA0002', 
                name: 'Execution',
                description: 'Adversaries try to run malicious code',
                techniques: 13,
                coverage: 0.92,
                recent_activity: 67
              },
              {
                id: 'TA0003',
                name: 'Persistence',
                description: 'Adversaries try to maintain their foothold',
                techniques: 19,
                coverage: 0.84,
                recent_activity: 23
              },
              {
                id: 'TA0004',
                name: 'Privilege Escalation',
                description: 'Adversaries try to gain higher-level permissions',
                techniques: 13,
                coverage: 0.77,
                recent_activity: 34
              }
            ]
          },
          source: 'phantom-mitre-core',
          timestamp: new Date().toISOString()
        });

      case 'techniques':
        return NextResponse.json({
          success: true,
          data: {
            total_techniques: 193,
            high_priority: 45,
            techniques: [
              {
                id: 'T1566.001',
                name: 'Spearphishing Attachment',
                tactic: 'Initial Access',
                prevalence: 'HIGH',
                detection_coverage: true,
                recent_detections: 15,
                threat_groups: ['APT29', 'APT28', 'FIN7']
              },
              {
                id: 'T1547.001',
                name: 'Registry Run Keys / Startup Folder',
                tactic: 'Persistence',
                prevalence: 'MEDIUM',
                detection_coverage: true,
                recent_detections: 8,
                threat_groups: ['APT29', 'Lazarus']
              },
              {
                id: 'T1071.001',
                name: 'Web Protocols',
                tactic: 'Command and Control',
                prevalence: 'HIGH',
                detection_coverage: false,
                recent_detections: 23,
                threat_groups: ['APT29', 'FIN7', 'Carbanak']
              }
            ]
          },
          source: 'phantom-mitre-core',
          timestamp: new Date().toISOString()
        });

      case 'groups':
        return NextResponse.json({
          success: true,
          data: {
            total_groups: 142,
            active_groups: 89,
            groups: [
              {
                id: 'G0016',
                name: 'APT29',
                aliases: ['Cozy Bear', 'The Dukes'],
                origin: 'Russian Federation',
                first_seen: '2008',
                techniques_used: 47,
                recent_activity: true,
                sophistication: 'Advanced'
              },
              {
                id: 'G0007',
                name: 'APT28',
                aliases: ['Fancy Bear', 'Sofacy'],
                origin: 'Russian Federation', 
                first_seen: '2004',
                techniques_used: 52,
                recent_activity: true,
                sophistication: 'Advanced'
              },
              {
                id: 'G0046',
                name: 'FIN7',
                aliases: ['Carbanak Group'],
                origin: 'Unknown',
                first_seen: '2013',
                techniques_used: 38,
                recent_activity: false,
                sophistication: 'Intermediate'
              }
            ]
          },
          source: 'phantom-mitre-core',
          timestamp: new Date().toISOString()
        });

      case 'coverage':
        return NextResponse.json({
          success: true,
          data: {
            overall_coverage: 80.7,
            coverage_by_tactic: {
              'Initial Access': 89.0,
              'Execution': 92.3,
              'Persistence': 84.2,
              'Privilege Escalation': 76.9,
              'Defense Evasion': 71.4,
              'Credential Access': 83.3,
              'Discovery': 88.9,
              'Lateral Movement': 79.2,
              'Collection': 85.7,
              'Command and Control': 74.1,
              'Exfiltration': 81.8,
              'Impact': 77.8
            },
            gaps: [
              { technique: 'T1071.001', name: 'Web Protocols', priority: 'HIGH' },
              { technique: 'T1055', name: 'Process Injection', priority: 'HIGH' },
              { technique: 'T1027', name: 'Obfuscated Files', priority: 'MEDIUM' }
            ],
            recommendations: [
              'Implement detection for T1071.001 Web Protocols',
              'Enhance monitoring for process injection techniques',
              'Deploy additional behavioral analytics'
            ]
          },
          source: 'phantom-mitre-core',
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
    console.error('MITRE API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * POST /api/phantom-cores/mitre - Map incidents to MITRE or perform TTP analysis
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation, ...params } = body;

    // Debug logging
    console.log('MITRE API - Received operation:', operation);
    console.log('MITRE API - Full body:', JSON.stringify(body, null, 2));

    switch (operation) {
      case 'analyze-ttp':
        // Mock TTP analysis
        return NextResponse.json({
          success: true,
          data: {
            analysis_id: 'mitre-analysis-' + Date.now(),
            ttp_profile: {
              technique_id: params.ttpData?.technique_id || 'T1566.001',
              technique_name: 'Spearphishing Attachment',
              tactic: params.ttpData?.tactic || 'Initial Access',
              coverage_score: Math.random() * 0.4 + 0.6 // 0.6 to 1.0
            },
            mapping_results: {
              threat_score: Math.floor(Math.random() * 50) + 50,
              prevalence: Math.random() > 0.5 ? 'HIGH' : 'MEDIUM',
              detection_difficulty: Math.random() > 0.6 ? 'MEDIUM' : 'LOW',
              business_impact: Math.random() > 0.7 ? 'HIGH' : 'MEDIUM'
            },
            detection_coverage: {
              rules_count: Math.floor(Math.random() * 20) + 5,
              coverage_percentage: Math.random() * 0.4 + 0.6,
              gaps: ['Network monitoring', 'Endpoint detection']
            },
            recommendations: [
              'Implement specific detection rules for ' + (params.ttpData?.technique_id || 'T1566.001'),
              'Enhance monitoring for ' + (params.ttpData?.tactic || 'Initial Access') + ' tactics',
              'Update security controls based on threat landscape',
              'Conduct tabletop exercises for this technique'
            ]
          },
          source: 'phantom-mitre-core',
          timestamp: new Date().toISOString()
        });

      case 'map-techniques':
        // Mock technique mapping
        return NextResponse.json({
          success: true,
          data: {
            mapping_id: 'mapping-' + Date.now(),
            techniques_mapped: Math.floor(Math.random() * 50) + 20,
            coverage_analysis: {
              total_techniques: 193,
              covered_techniques: Math.floor(Math.random() * 50) + 120,
              coverage_percentage: Math.random() * 0.3 + 0.7
            },
            gap_analysis: [
              { technique: 'T1071.001', name: 'Web Protocols', priority: 'HIGH' },
              { technique: 'T1055', name: 'Process Injection', priority: 'HIGH' },
              { technique: 'T1027', name: 'Obfuscated Files', priority: 'MEDIUM' }
            ],
            recommendations: [
              'Focus on high-priority gaps in detection coverage',
              'Implement behavioral analytics for process injection',
              'Enhance network monitoring capabilities',
              'Review and update detection rules quarterly'
            ]
          },
          source: 'phantom-mitre-core',
          timestamp: new Date().toISOString()
        });

      case 'assess-coverage':
        // Mock coverage assessment
        return NextResponse.json({
          success: true,
          data: {
            assessment_id: 'assessment-' + Date.now(),
            overall_coverage: Math.random() * 0.3 + 0.7, // 70-100%
            coverage_by_tactic: {
              'Initial Access': Math.random() * 0.2 + 0.8,
              'Execution': Math.random() * 0.2 + 0.8,
              'Persistence': Math.random() * 0.3 + 0.7,
              'Privilege Escalation': Math.random() * 0.3 + 0.7,
              'Defense Evasion': Math.random() * 0.4 + 0.6,
              'Credential Access': Math.random() * 0.2 + 0.8,
              'Discovery': Math.random() * 0.2 + 0.8,
              'Lateral Movement': Math.random() * 0.3 + 0.7,
              'Collection': Math.random() * 0.2 + 0.8,
              'Command and Control': Math.random() * 0.4 + 0.6,
              'Exfiltration': Math.random() * 0.3 + 0.7,
              'Impact': Math.random() * 0.3 + 0.7
            },
            critical_gaps: [
              'T1071.001 - Web Protocols',
              'T1055 - Process Injection',
              'T1027 - Obfuscated Files or Information'
            ],
            recommendations: [
              'Prioritize detection rules for critical gaps',
              'Implement network-based detection for C2 communications',
              'Enhance behavioral analysis capabilities',
              'Schedule regular coverage assessment reviews'
            ]
          },
          source: 'phantom-mitre-core',
          timestamp: new Date().toISOString()
        });

      case 'generate-mitre-report':
        // Mock MITRE report generation
        return NextResponse.json({
          success: true,
          data: {
            report_id: 'mitre-report-' + Date.now(),
            report_type: params.reportData?.report_type || 'MITRE ATT&CK Coverage Report',
            generated_at: new Date().toISOString(),
            summary: {
              total_techniques_analyzed: 193,
              coverage_percentage: Math.random() * 0.3 + 0.7,
              critical_gaps: Math.floor(Math.random() * 10) + 5,
              recommendations_count: Math.floor(Math.random() * 15) + 10
            },
            sections: [
              'Executive Summary',
              'Coverage Analysis',
              'Gap Assessment', 
              'Threat Landscape Overview',
              'Recommendations',
              'Implementation Roadmap'
            ],
            download_url: '/api/reports/mitre-coverage-' + Date.now() + '.pdf',
            recommendations: [
              'Implement high-priority detection rules identified in gap analysis',
              'Enhance monitoring for under-covered tactics',
              'Conduct regular threat hunting exercises',
              'Update incident response playbooks based on MITRE framework',
              'Schedule quarterly coverage assessments'
            ]
          },
          source: 'phantom-mitre-core',
          timestamp: new Date().toISOString()
        });

      case 'map_incident':
        // Mock incident to MITRE mapping (legacy support)
        return NextResponse.json({
          success: true,
          data: {
            incident_id: params.incident_id || 'inc-unknown',
            mapping_results: [
              { technique: 'T1566.001', confidence: 0.95, evidence: 'Email attachment detected' },
              { technique: 'T1547.001', confidence: 0.87, evidence: 'Registry modification observed' },
              { technique: 'T1071.001', confidence: 0.72, evidence: 'HTTP C2 communication' }
            ],
            attack_path: [
              { step: 1, tactic: 'Initial Access', technique: 'T1566.001' },
              { step: 2, tactic: 'Persistence', technique: 'T1547.001' },
              { step: 3, tactic: 'Command and Control', technique: 'T1071.001' }
            ],
            threat_assessment: {
              sophistication: 'Intermediate',
              likely_groups: ['FIN7', 'Carbanak'],
              campaign_type: 'Financial'
            }
          },
          source: 'phantom-mitre-core',
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
    console.error('MITRE API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
