/**
 * Extended CTI Workflow Templates
 * Additional enterprise-grade workflow templates for comprehensive CTI operations
 */

import { 
  IWorkflowDefinition, 
  WorkflowPriority, 
  StepType,
  TriggerType 
} from '../interfaces/IWorkflowEngine';

export const EXTENDED_CTI_WORKFLOWS: Record<string, IWorkflowDefinition> = {
  
  // Vulnerability Management Workflow
  VULNERABILITY_MANAGEMENT: {
    id: 'vulnerability-management-workflow',
    name: 'Enterprise Vulnerability Management Workflow',
    version: '1.5',
    description: 'Comprehensive vulnerability assessment and remediation workflow',
    category: 'vulnerability-management',
    tags: ['vulnerability', 'patch-management', 'risk-assessment', 'compliance'],
    
    metadata: {
      author: 'Vulnerability Management Team',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-02-15')
    },
    
    triggers: [
      {
        id: 'new-vulnerability-discovered',
        type: TriggerType.EVENT,
        name: 'New Vulnerability Discovered',
        description: 'Triggered when a new vulnerability is identified',
        enabled: true,
        configuration: {
          eventType: 'vulnerability-discovered',
          source: 'vulnerability-scanners'
        }
      }
    ],
    
    steps: [
      {
        id: 'vulnerability-assessment',
        name: 'Vulnerability Assessment',
        type: StepType.PARALLEL,
        description: 'Comprehensive vulnerability assessment',
        position: { x: 100, y: 100 },
        configuration: {
          parallelSteps: ['analyze-vulnerability', 'assess-impact', 'check-exploitability']
        },
        inputs: {
          vulnerability: 'parameters.vulnerability'
        },
        outputs: {
          assessment: 'assessment'
        },
        nextSteps: ['risk-prioritization'],
        errorHandling: {
          strategy: 'fail'
        }
      },
      
      {
        id: 'risk-prioritization',
        name: 'Risk Prioritization',
        type: StepType.TASK,
        description: 'Calculate risk score and prioritize vulnerability',
        position: { x: 100, y: 300 },
        configuration: {
          taskType: 'risk-calculation',
          factors: ['cvss', 'business-impact', 'exploitability', 'asset-criticality']
        },
        inputs: {
          assessment: 'variables.assessment'
        },
        outputs: {
          priority: 'priority',
          riskScore: 'riskScore'
        },
        nextSteps: ['remediation-planning'],
        errorHandling: {
          strategy: 'fail'
        }
      },
      
      {
        id: 'remediation-planning',
        name: 'Remediation Planning',
        type: StepType.DECISION,
        description: 'Plan remediation approach based on priority',
        position: { x: 100, y: 500 },
        configuration: {},
        inputs: {
          priority: 'variables.priority',
          riskScore: 'variables.riskScore'
        },
        outputs: {
          remediationApproach: 'remediationApproach'
        },
        nextSteps: ['emergency-patch', 'scheduled-patch', 'accept-risk'],
        conditions: [
          {
            expression: 'variables.priority === "critical" || variables.riskScore >= 9',
            description: 'Critical vulnerabilities require emergency patching'
          }
        ],
        errorHandling: {
          strategy: 'fail'
        }
      },
      
      {
        id: 'patch-deployment',
        name: 'Patch Deployment',
        type: StepType.SEQUENTIAL,
        description: 'Deploy patches in controlled manner',
        position: { x: 100, y: 700 },
        configuration: {
          sequentialSteps: ['test-patches', 'deploy-staging', 'deploy-production']
        },
        inputs: {
          patches: 'variables.patches'
        },
        outputs: {
          deploymentResults: 'deploymentResults'
        },
        nextSteps: ['verification'],
        errorHandling: {
          strategy: 'fail'
        }
      },
      
      {
        id: 'verification',
        name: 'Remediation Verification',
        type: StepType.TASK,
        description: 'Verify vulnerability remediation',
        position: { x: 100, y: 900 },
        configuration: {
          taskType: 'vulnerability-verification',
          methods: ['rescan', 'penetration-test', 'compliance-check']
        },
        inputs: {
          vulnerability: 'parameters.vulnerability',
          deploymentResults: 'variables.deploymentResults'
        },
        outputs: {
          verificationResults: 'verificationResults'
        },
        nextSteps: [],
        errorHandling: {
          strategy: 'retry',
          maxRetries: 3
        }
      }
    ],
    
    variables: {
      vulnerability: {
        type: 'object',
        description: 'Vulnerability details',
        required: true,
        defaultValue: {}
      }
    },
    
    parameters: {
      vulnerability: {
        type: 'object',
        displayName: 'Vulnerability Information',
        category: 'Input',
        order: 1,
        description: 'Details of the discovered vulnerability',
        required: true,
        defaultValue: {}
      }
    },
    
    sla: {
      responseTime: '4h',
      resolutionTime: '72h',
      maxExecutionTime: '168h' // 1 week
    },
    
    security: {
      classification: 'internal',
      requiredRoles: ['vulnerability-analyst', 'system-admin'],
      requiredPermissions: ['vulnerability-management', 'patch-deployment'],
      dataEncryption: true,
      auditLevel: 'detailed'
    },
    
    integrations: {
      taskManagement: {
        enabled: true,
        createTasks: true,
        updateTaskStatus: true,
        taskPriority: WorkflowPriority.HIGH
      },
      messageQueue: {
        enabled: true,
        publishEvents: true,
        subscribeToEvents: true,
        deadLetterQueue: true
      },
      evidence: {
        enabled: true,
        collectEvidence: true,
        preserveChainOfCustody: true,
        evidenceRetention: '1y'
      },
      issues: {
        enabled: true,
        createIssues: true,
        linkToIssues: true,
        escalationRules: [
          {
            condition: 'priority === "critical" && duration > 24h',
            action: 'escalate-to-ciso'
          }
        ]
      }
    },
    
    monitoring: {
      enabled: true,
      collectMetrics: true,
      alerting: {
        enabled: true,
        channels: ['email', 'slack'],
        conditions: [
          {
            metric: 'sla_breach',
            operator: '==',
            value: true,
            action: 'alert-management'
          }
        ]
      },
      logging: {
        level: 'info',
        includeStepDetails: true,
        includeVariables: false
      }
    }
  },

  // Threat Hunt Campaign Workflow
  THREAT_HUNT_CAMPAIGN: {
    id: 'threat-hunt-campaign-workflow',
    name: 'Threat Hunt Campaign Workflow',
    version: '2.2',
    description: 'Systematic threat hunting campaign execution workflow',
    category: 'threat-hunting',
    tags: ['threat-hunting', 'investigation', 'proactive-defense', 'ttp-analysis'],
    
    metadata: {
      author: 'Threat Hunting Team',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-02-20')
    },
    
    triggers: [
      {
        id: 'scheduled-hunt',
        type: TriggerType.SCHEDULE,
        name: 'Scheduled Threat Hunt',
        description: 'Regular scheduled threat hunting activities',
        enabled: true,
        configuration: {
          schedule: '0 9 * * 1', // Every Monday at 9 AM
          timezone: 'UTC'
        }
      },
      {
        id: 'intelligence-driven-hunt',
        type: TriggerType.EVENT,
        name: 'Intelligence-Driven Hunt',
        description: 'Threat hunt triggered by new intelligence',
        enabled: true,
        configuration: {
          eventType: 'new-threat-intelligence',
          source: 'threat-intelligence-feeds'
        }
      }
    ],
    
    steps: [
      {
        id: 'hypothesis-development',
        name: 'Develop Hunt Hypothesis',
        type: StepType.HUMAN,
        description: 'Develop threat hunting hypothesis based on intelligence',
        position: { x: 100, y: 100 },
        configuration: {},
        inputs: {
          intelligence: 'parameters.intelligence',
          previousHunts: 'parameters.previousHunts'
        },
        outputs: {
          hypothesis: 'hypothesis',
          huntScope: 'huntScope'
        },
        nextSteps: ['data-collection-planning'],
        errorHandling: {
          strategy: 'fail'
        },
        humanTask: {
          assignee: 'threat-hunt-lead',
          priority: WorkflowPriority.HIGH,
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          form: {
            fields: [
              {
                id: 'hypothesis',
                name: 'hypothesis',
                type: 'text',
                label: 'Hunt Hypothesis',
                required: true
              },
              {
                id: 'scope',
                name: 'scope',
                type: 'multiselect',
                label: 'Hunt Scope',
                required: true,
                options: [
                  { value: 'endpoints', label: 'Endpoints' },
                  { value: 'network', label: 'Network Traffic' },
                  { value: 'cloud', label: 'Cloud Infrastructure' },
                  { value: 'email', label: 'Email Systems' }
                ]
              },
              {
                id: 'timeframe',
                name: 'timeframe',
                type: 'select',
                label: 'Time Frame',
                required: true,
                options: [
                  { value: '24h', label: 'Last 24 Hours' },
                  { value: '7d', label: 'Last 7 Days' },
                  { value: '30d', label: 'Last 30 Days' }
                ]
              }
            ],
            validation: {}
          }
        }
      },
      
      {
        id: 'data-collection-planning',
        name: 'Plan Data Collection',
        type: StepType.TASK,
        description: 'Plan data collection strategy for hunt',
        position: { x: 100, y: 300 },
        configuration: {
          taskType: 'data-collection-planning',
          sources: ['siem', 'edr', 'network-monitoring', 'cloud-logs']
        },
        inputs: {
          hypothesis: 'variables.hypothesis',
          huntScope: 'variables.huntScope'
        },
        outputs: {
          collectionPlan: 'collectionPlan',
          queries: 'queries'
        },
        nextSteps: ['data-collection'],
        errorHandling: {
          strategy: 'retry',
          maxRetries: 2
        }
      },
      
      {
        id: 'data-collection',
        name: 'Collect Hunt Data',
        type: StepType.PARALLEL,
        description: 'Execute data collection from multiple sources',
        position: { x: 100, y: 500 },
        configuration: {
          parallelSteps: ['collect-endpoint-data', 'collect-network-data', 'collect-cloud-data']
        },
        inputs: {
          collectionPlan: 'variables.collectionPlan',
          queries: 'variables.queries'
        },
        outputs: {
          collectedData: 'collectedData'
        },
        nextSteps: ['data-analysis'],
        errorHandling: {
          strategy: 'fail'
        }
      },
      
      {
        id: 'data-analysis',
        name: 'Analyze Hunt Data',
        type: StepType.TASK,
        description: 'Analyze collected data for threat indicators',
        position: { x: 100, y: 700 },
        configuration: {
          taskType: 'threat-data-analysis',
          techniques: ['statistical-analysis', 'pattern-recognition', 'anomaly-detection']
        },
        inputs: {
          collectedData: 'variables.collectedData',
          hypothesis: 'variables.hypothesis'
        },
        outputs: {
          analysisResults: 'analysisResults',
          findings: 'findings'
        },
        nextSteps: ['findings-validation'],
        errorHandling: {
          strategy: 'retry',
          maxRetries: 2
        }
      },
      
      {
        id: 'findings-validation',
        name: 'Validate Findings',
        type: StepType.HUMAN,
        description: 'Validate and interpret analysis findings',
        position: { x: 100, y: 900 },
        configuration: {},
        inputs: {
          analysisResults: 'variables.analysisResults',
          findings: 'variables.findings'
        },
        outputs: {
          validatedFindings: 'validatedFindings',
          falsePositives: 'falsePositives'
        },
        nextSteps: ['threat-response-decision'],
        errorHandling: {
          strategy: 'skip'
        },
        humanTask: {
          candidateGroups: ['threat-hunters', 'security-analysts'],
          priority: WorkflowPriority.HIGH,
          dueDate: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours
          form: {
            fields: [
              {
                id: 'findings_valid',
                name: 'findings_valid',
                type: 'boolean',
                label: 'Are the findings valid threats?',
                required: true
              },
              {
                id: 'threat_level',
                name: 'threat_level',
                type: 'select',
                label: 'Threat Level',
                required: true,
                options: [
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' },
                  { value: 'critical', label: 'Critical' }
                ]
              },
              {
                id: 'recommendations',
                name: 'recommendations',
                type: 'text',
                label: 'Recommendations',
                required: false
              }
            ],
            validation: {}
          }
        }
      },
      
      {
        id: 'threat-response-decision',
        name: 'Threat Response Decision',
        type: StepType.DECISION,
        description: 'Decide on threat response actions',
        position: { x: 100, y: 1100 },
        configuration: {},
        inputs: {
          validatedFindings: 'variables.validatedFindings',
          threatLevel: 'variables.threat_level'
        },
        outputs: {
          responseRequired: 'responseRequired'
        },
        nextSteps: ['initiate-incident-response', 'document-hunt-results'],
        conditions: [
          {
            expression: 'variables.findings_valid === true && (variables.threat_level === "high" || variables.threat_level === "critical")',
            description: 'High or critical validated findings require incident response'
          }
        ],
        errorHandling: {
          strategy: 'skip'
        }
      },
      
      {
        id: 'initiate-incident-response',
        name: 'Initiate Incident Response',
        type: StepType.TASK,
        description: 'Start incident response workflow for validated threats',
        position: { x: 50, y: 1300 },
        configuration: {
          taskType: 'workflow-trigger',
          targetWorkflow: 'incident-response-workflow'
        },
        inputs: {
          validatedFindings: 'variables.validatedFindings',
          huntContext: 'variables'
        },
        outputs: {
          incidentWorkflow: 'incidentWorkflow'
        },
        nextSteps: ['document-hunt-results'],
        conditions: [
          {
            expression: 'variables.responseRequired === true',
            description: 'Execute only if response is required'
          }
        ],
        errorHandling: {
          strategy: 'skip'
        }
      },
      
      {
        id: 'document-hunt-results',
        name: 'Document Hunt Results',
        type: StepType.TASK,
        description: 'Document hunt results and lessons learned',
        position: { x: 100, y: 1500 },
        configuration: {
          taskType: 'hunt-documentation',
          outputs: ['hunt-report', 'lessons-learned', 'iocs']
        },
        inputs: {
          hypothesis: 'variables.hypothesis',
          findings: 'variables.validatedFindings',
          huntScope: 'variables.huntScope'
        },
        outputs: {
          huntReport: 'huntReport',
          lessonsLearned: 'lessonsLearned'
        },
        nextSteps: [],
        errorHandling: {
          strategy: 'skip'
        }
      }
    ],
    
    variables: {
      intelligence: {
        type: 'object',
        description: 'Threat intelligence driving the hunt',
        required: false,
        defaultValue: {}
      },
      hypothesis: {
        type: 'string',
        description: 'Hunt hypothesis',
        required: true,
        defaultValue: ''
      }
    },
    
    parameters: {
      intelligence: {
        type: 'object',
        displayName: 'Threat Intelligence',
        category: 'Input',
        order: 1,
        description: 'Intelligence data driving the hunt',
        required: false,
        defaultValue: {}
      },
      huntType: {
        type: 'string',
        displayName: 'Hunt Type',
        category: 'Configuration',
        order: 2,
        description: 'Type of threat hunt campaign',
        required: true,
        defaultValue: 'scheduled'
      }
    },
    
    sla: {
      responseTime: '2h',
      resolutionTime: '7d',
      maxExecutionTime: '14d'
    },
    
    security: {
      classification: 'confidential',
      requiredRoles: ['threat-hunter', 'security-analyst'],
      requiredPermissions: ['threat-hunting', 'data-access'],
      dataEncryption: true,
      auditLevel: 'comprehensive'
    },
    
    integrations: {
      taskManagement: {
        enabled: true,
        createTasks: true,
        updateTaskStatus: true,
        taskPriority: WorkflowPriority.HIGH
      },
      messageQueue: {
        enabled: true,
        publishEvents: true,
        subscribeToEvents: true,
        deadLetterQueue: true
      },
      evidence: {
        enabled: true,
        collectEvidence: true,
        preserveChainOfCustody: true,
        evidenceRetention: '2y'
      },
      issues: {
        enabled: true,
        createIssues: true,
        linkToIssues: true,
        escalationRules: [
          {
            condition: 'threat_level === "critical"',
            action: 'immediate-escalation'
          }
        ]
      }
    },
    
    monitoring: {
      enabled: true,
      collectMetrics: true,
      alerting: {
        enabled: true,
        channels: ['email', 'slack'],
        conditions: [
          {
            metric: 'findings_count',
            operator: '>',
            value: 10,
            action: 'alert-management'
          }
        ]
      },
      logging: {
        level: 'info',
        includeStepDetails: true,
        includeVariables: false
      }
    }
  },

  // Compliance Audit Workflow
  COMPLIANCE_AUDIT: {
    id: 'compliance-audit-workflow',
    name: 'Cybersecurity Compliance Audit Workflow',
    version: '1.3',
    description: 'Automated compliance audit and reporting workflow',
    category: 'compliance',
    tags: ['compliance', 'audit', 'governance', 'reporting'],
    
    metadata: {
      author: 'Compliance Team',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-02-10')
    },
    
    triggers: [
      {
        id: 'scheduled-audit',
        type: TriggerType.SCHEDULE,
        name: 'Scheduled Compliance Audit',
        description: 'Regular compliance audit execution',
        enabled: true,
        configuration: {
          schedule: '0 6 1 * *', // First day of every month at 6 AM
          timezone: 'UTC'
        }
      }
    ],
    
    steps: [
      {
        id: 'audit-scope-definition',
        name: 'Define Audit Scope',
        type: StepType.TASK,
        description: 'Define scope and requirements for compliance audit',
        position: { x: 100, y: 100 },
        configuration: {
          taskType: 'compliance-scoping',
          frameworks: ['nist', 'iso27001', 'sox', 'pci-dss']
        },
        inputs: {
          auditType: 'parameters.auditType',
          framework: 'parameters.framework'
        },
        outputs: {
          auditScope: 'auditScope',
          requirements: 'requirements'
        },
        nextSteps: ['evidence-collection'],
        errorHandling: {
          strategy: 'fail'
        }
      },
      
      {
        id: 'evidence-collection',
        name: 'Collect Compliance Evidence',
        type: StepType.PARALLEL,
        description: 'Collect evidence for compliance requirements',
        position: { x: 100, y: 300 },
        configuration: {
          parallelSteps: ['collect-policies', 'collect-logs', 'collect-configurations', 'collect-access-records']
        },
        inputs: {
          auditScope: 'variables.auditScope',
          requirements: 'variables.requirements'
        },
        outputs: {
          evidence: 'evidence'
        },
        nextSteps: ['compliance-assessment'],
        errorHandling: {
          strategy: 'fail'
        }
      },
      
      {
        id: 'compliance-assessment',
        name: 'Assess Compliance Status',
        type: StepType.TASK,
        description: 'Assess current compliance status against requirements',
        position: { x: 100, y: 500 },
        configuration: {
          taskType: 'compliance-assessment',
          assessmentTools: ['automated-scanners', 'policy-checkers', 'configuration-analyzers']
        },
        inputs: {
          evidence: 'variables.evidence',
          requirements: 'variables.requirements'
        },
        outputs: {
          assessmentResults: 'assessmentResults',
          gaps: 'gaps'
        },
        nextSteps: ['gap-analysis'],
        errorHandling: {
          strategy: 'retry',
          maxRetries: 2
        }
      },
      
      {
        id: 'gap-analysis',
        name: 'Analyze Compliance Gaps',
        type: StepType.TASK,
        description: 'Analyze identified compliance gaps and prioritize remediation',
        position: { x: 100, y: 700 },
        configuration: {
          taskType: 'gap-analysis',
          prioritizationCriteria: ['risk-level', 'regulatory-impact', 'remediation-effort']
        },
        inputs: {
          gaps: 'variables.gaps',
          assessmentResults: 'variables.assessmentResults'
        },
        outputs: {
          prioritizedGaps: 'prioritizedGaps',
          remediationPlan: 'remediationPlan'
        },
        nextSteps: ['report-generation'],
        errorHandling: {
          strategy: 'fail'
        }
      },
      
      {
        id: 'report-generation',
        name: 'Generate Compliance Report',
        type: StepType.TASK,
        description: 'Generate comprehensive compliance audit report',
        position: { x: 100, y: 900 },
        configuration: {
          taskType: 'report-generation',
          reportFormats: ['pdf', 'html', 'excel'],
          includeExecutiveSummary: true
        },
        inputs: {
          assessmentResults: 'variables.assessmentResults',
          prioritizedGaps: 'variables.prioritizedGaps',
          remediationPlan: 'variables.remediationPlan'
        },
        outputs: {
          complianceReport: 'complianceReport',
          executiveSummary: 'executiveSummary'
        },
        nextSteps: ['report-distribution'],
        errorHandling: {
          strategy: 'retry',
          maxRetries: 2
        }
      },
      
      {
        id: 'report-distribution',
        name: 'Distribute Compliance Report',
        type: StepType.MESSAGE,
        description: 'Distribute compliance report to stakeholders',
        position: { x: 100, y: 1100 },
        configuration: {
          messageType: 'compliance-report',
          recipients: ['compliance-officer', 'security-manager', 'executives'],
          distributionChannels: ['email', 'secure-portal']
        },
        inputs: {
          complianceReport: 'variables.complianceReport',
          executiveSummary: 'variables.executiveSummary'
        },
        outputs: {
          distributionResults: 'distributionResults'
        },
        nextSteps: [],
        errorHandling: {
          strategy: 'retry',
          maxRetries: 3
        }
      }
    ],
    
    variables: {
      auditType: {
        type: 'string',
        description: 'Type of compliance audit',
        required: true,
        defaultValue: 'general'
      }
    },
    
    parameters: {
      auditType: {
        type: 'string',
        displayName: 'Audit Type',
        category: 'Configuration',
        order: 1,
        description: 'Type of compliance audit to perform',
        required: true,
        defaultValue: 'general'
      },
      framework: {
        type: 'string',
        displayName: 'Compliance Framework',
        category: 'Configuration',
        order: 2,
        description: 'Compliance framework to audit against',
        required: true,
        defaultValue: 'nist'
      }
    },
    
    sla: {
      responseTime: '1h',
      resolutionTime: '5d',
      maxExecutionTime: '7d'
    },
    
    security: {
      classification: 'confidential',
      requiredRoles: ['compliance-officer', 'auditor'],
      requiredPermissions: ['compliance-audit', 'report-generation'],
      dataEncryption: true,
      auditLevel: 'comprehensive'
    },
    
    integrations: {
      taskManagement: {
        enabled: true,
        createTasks: true,
        updateTaskStatus: true,
        taskPriority: WorkflowPriority.MEDIUM
      },
      messageQueue: {
        enabled: true,
        publishEvents: true,
        subscribeToEvents: false,
        deadLetterQueue: true
      },
      evidence: {
        enabled: true,
        collectEvidence: true,
        preserveChainOfCustody: true,
        evidenceRetention: '7y'
      },
      issues: {
        enabled: true,
        createIssues: true,
        linkToIssues: true,
        escalationRules: [
          {
            condition: 'high_risk_gaps > 0',
            action: 'create-remediation-issues'
          }
        ]
      }
    },
    
    monitoring: {
      enabled: true,
      collectMetrics: true,
      alerting: {
        enabled: true,
        channels: ['email'],
        conditions: [
          {
            metric: 'compliance_score',
            operator: '<',
            value: 80,
            action: 'alert-management'
          }
        ]
      },
      logging: {
        level: 'info',
        includeStepDetails: true,
        includeVariables: false
      }
    }
  }
};

// Merge with existing templates
export const ALL_CTI_WORKFLOWS = {
  ...EXTENDED_CTI_WORKFLOWS
};

export default EXTENDED_CTI_WORKFLOWS;