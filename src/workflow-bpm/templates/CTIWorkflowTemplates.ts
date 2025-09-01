/**
 * Fortune 100-Grade CTI Workflow Templates
 * Pre-built workflow templates for cyber threat intelligence operations
 */

import { 
  IWorkflowDefinition, 
  WorkflowStatus,
  WorkflowPriority, 
  StepType,
  TriggerType 
} from '../interfaces/IWorkflowEngine';
import { EXTENDED_CTI_WORKFLOWS } from './ExtendedCTIWorkflows';

export const CTI_WORKFLOW_TEMPLATES: Record<string, IWorkflowDefinition> = {
  
  // Advanced Persistent Threat (APT) Response Workflow
  APT_RESPONSE: {
    id: 'apt-response-workflow',
    name: 'Advanced Persistent Threat Response Workflow',
    version: '2.0',
    status: WorkflowStatus.ACTIVE,
    priority: WorkflowPriority.CRITICAL,
    description: 'Comprehensive workflow for responding to APT indicators and campaigns',
    category: 'incident-response',
    tags: ['apt', 'incident-response', 'critical', 'automated'],
    
    metadata: {
      author: 'CTI Team',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15')
    },
    
    triggers: [
      {
        id: 'apt-indicators-detected',
        type: TriggerType.EVENT,
        name: 'APT Indicators Detected',
        description: 'Triggered when APT indicators are detected in the environment',
        enabled: true,
        configuration: {
          eventType: 'apt-indicators-detected',
          source: 'threat-detection-system',
          minConfidence: 80
        },
        conditions: [
          {
            expression: 'event.confidence >= 80 && event.severity === "critical"',
            description: 'High confidence critical APT indicators'
          }
        ]
      }
    ],
    
    steps: [
      // Initial Triage (Parallel)
      {
        id: 'initial-triage',
        name: 'Initial Triage',
        type: StepType.PARALLEL,
        description: 'Parallel initial assessment of APT indicators',
        position: { x: 100, y: 100 },
        configuration: {
          parallelSteps: ['validate-indicators', 'assess-threat-level', 'identify-affected-systems']
        },
        inputs: {
          indicators: 'parameters.indicators',
          event: 'parameters.event'
        },
        outputs: {
          triageResults: 'triageResults'
        },
        nextSteps: ['containment-decision'],
        errorHandling: {
          strategy: 'fail',
          maxRetries: 2
        }
      },
      
      // Validate Indicators
      {
        id: 'validate-indicators',
        name: 'Validate Indicators',
        type: StepType.TASK,
        description: 'Validate APT indicators against threat intelligence sources',
        position: { x: 50, y: 200 },
        configuration: {
          taskType: 'ioc-validation',
          sources: ['virustotal', 'misp', 'internal-ti']
        },
        inputs: {
          indicators: 'parameters.indicators'
        },
        outputs: {
          validationResults: 'validationResults'
        },
        nextSteps: [],
        errorHandling: {
          strategy: 'retry',
          maxRetries: 3,
          retryDelay: '30s'
        }
      },
      
      // Assess Threat Level
      {
        id: 'assess-threat-level',
        name: 'Assess Threat Level',
        type: StepType.TASK,
        description: 'Assess the threat level and potential impact',
        position: { x: 150, y: 200 },
        configuration: {
          taskType: 'threat-assessment',
          assessmentCriteria: ['impact', 'likelihood', 'confidence']
        },
        inputs: {
          indicators: 'parameters.indicators',
          context: 'parameters.context'
        },
        outputs: {
          threatLevel: 'threatLevel',
          riskScore: 'riskScore'
        },
        nextSteps: [],
        errorHandling: {
          strategy: 'retry',
          maxRetries: 2
        }
      },
      
      // Identify Affected Systems
      {
        id: 'identify-affected-systems',
        name: 'Identify Affected Systems',
        type: StepType.TASK,
        description: 'Identify systems that may be affected by the APT campaign',
        position: { x: 250, y: 200 },
        configuration: {
          taskType: 'asset-identification',
          scope: 'enterprise'
        },
        inputs: {
          indicators: 'parameters.indicators'
        },
        outputs: {
          affectedSystems: 'affectedSystems'
        },
        nextSteps: [],
        errorHandling: {
          strategy: 'retry',
          maxRetries: 2
        }
      },
      
      // Containment Decision
      {
        id: 'containment-decision',
        name: 'Containment Decision',
        type: StepType.DECISION,
        description: 'Decide if immediate containment is required',
        position: { x: 150, y: 300 },
        configuration: {
          decisionLogic: 'threat-level-based'
        },
        inputs: {
          threatLevel: 'variables.threatLevel',
          riskScore: 'variables.riskScore'
        },
        outputs: {
          containmentRequired: 'containmentRequired'
        },
        nextSteps: ['immediate-containment', 'investigation-phase'],
        conditions: [
          {
            expression: 'variables.threatLevel === "critical" || variables.riskScore > 8',
            description: 'High threat level or risk score requires immediate containment'
          }
        ],
        errorHandling: {
          strategy: 'fail'
        }
      },
      
      // Immediate Containment (Conditional)
      {
        id: 'immediate-containment',
        name: 'Immediate Containment',
        type: StepType.PARALLEL,
        description: 'Execute immediate containment measures',
        position: { x: 100, y: 400 },
        configuration: {
          parallelSteps: ['isolate-systems', 'block-indicators', 'notify-stakeholders']
        },
        inputs: {
          affectedSystems: 'variables.affectedSystems',
          indicators: 'parameters.indicators'
        },
        outputs: {
          containmentResults: 'containmentResults'
        },
        nextSteps: ['investigation-phase'],
        conditions: [
          {
            expression: 'variables.containmentRequired === true',
            description: 'Execute only if containment is required'
          }
        ],
        errorHandling: {
          strategy: 'fail'
        }
      },
      
      // Isolate Systems
      {
        id: 'isolate-systems',
        name: 'Isolate Affected Systems',
        type: StepType.TASK,
        description: 'Isolate systems identified as affected',
        position: { x: 50, y: 500 },
        configuration: {
          taskType: 'system-isolation',
          isolationType: 'network-quarantine'
        },
        inputs: {
          systems: 'variables.affectedSystems'
        },
        outputs: {
          isolationResults: 'isolationResults'
        },
        nextSteps: [],
        errorHandling: {
          strategy: 'fail'
        },
        timeout: '10m'
      },
      
      // Block Indicators
      {
        id: 'block-indicators',
        name: 'Block Malicious Indicators',
        type: StepType.TASK,
        description: 'Block identified malicious indicators across security controls',
        position: { x: 150, y: 500 },
        configuration: {
          taskType: 'indicator-blocking',
          targets: ['firewall', 'proxy', 'dns', 'endpoint']
        },
        inputs: {
          indicators: 'parameters.indicators'
        },
        outputs: {
          blockingResults: 'blockingResults'
        },
        nextSteps: [],
        errorHandling: {
          strategy: 'retry',
          maxRetries: 3
        }
      },
      
      // Notify Stakeholders
      {
        id: 'notify-stakeholders',
        name: 'Notify Stakeholders',
        type: StepType.MESSAGE,
        description: 'Notify relevant stakeholders of the APT incident',
        position: { x: 250, y: 500 },
        configuration: {
          messageType: 'incident-notification',
          recipients: ['security-team', 'management', 'it-operations'],
          priority: 'critical'
        },
        inputs: {
          incidentDetails: 'parameters',
          containmentResults: 'variables.containmentResults'
        },
        outputs: {
          notificationResults: 'notificationResults'
        },
        nextSteps: [],
        errorHandling: {
          strategy: 'skip'
        }
      },
      
      // Investigation Phase
      {
        id: 'investigation-phase',
        name: 'Investigation Phase',
        type: StepType.SEQUENTIAL,
        description: 'Conduct detailed investigation of the APT campaign',
        position: { x: 200, y: 600 },
        configuration: {
          sequentialSteps: ['collect-evidence', 'analyze-attack-patterns', 'attribute-threat-actor']
        },
        inputs: {
          indicators: 'parameters.indicators',
          affectedSystems: 'variables.affectedSystems'
        },
        outputs: {
          investigationResults: 'investigationResults'
        },
        nextSteps: ['eradication-recovery'],
        errorHandling: {
          strategy: 'fail'
        }
      },
      
      // Collect Forensic Evidence
      {
        id: 'collect-evidence',
        name: 'Collect Forensic Evidence',
        type: StepType.TASK,
        description: 'Collect forensic evidence from affected systems',
        position: { x: 150, y: 700 },
        configuration: {
          taskType: 'evidence-collection',
          evidenceTypes: ['memory-dump', 'disk-image', 'network-capture', 'logs']
        },
        inputs: {
          systems: 'variables.affectedSystems'
        },
        outputs: {
          evidenceCollection: 'evidenceCollection'
        },
        nextSteps: [],
        errorHandling: {
          strategy: 'fail'
        }
      },
      
      // Analyze Attack Patterns
      {
        id: 'analyze-attack-patterns',
        name: 'Analyze Attack Patterns',
        type: StepType.TASK,
        description: 'Analyze attack patterns and TTPs',
        position: { x: 250, y: 700 },
        configuration: {
          taskType: 'pattern-analysis',
          frameworks: ['mitre-attack', 'kill-chain']
        },
        inputs: {
          evidence: 'variables.evidenceCollection',
          indicators: 'parameters.indicators'
        },
        outputs: {
          attackPatterns: 'attackPatterns',
          ttps: 'ttps'
        },
        nextSteps: [],
        errorHandling: {
          strategy: 'retry',
          maxRetries: 2
        }
      },
      
      // Threat Actor Attribution
      {
        id: 'attribute-threat-actor',
        name: 'Attribute Threat Actor',
        type: StepType.TASK,
        description: 'Attempt to attribute the attack to known threat actors',
        position: { x: 350, y: 700 },
        configuration: {
          taskType: 'threat-attribution',
          sources: ['mitre-groups', 'internal-intelligence', 'commercial-feeds']
        },
        inputs: {
          attackPatterns: 'variables.attackPatterns',
          ttps: 'variables.ttps'
        },
        outputs: {
          attribution: 'attribution',
          confidence: 'attributionConfidence'
        },
        nextSteps: [],
        errorHandling: {
          strategy: 'skip'
        }
      },
      
      // Eradication and Recovery
      {
        id: 'eradication-recovery',
        name: 'Eradication and Recovery',
        type: StepType.PARALLEL,
        description: 'Remove threats and restore affected systems',
        position: { x: 200, y: 800 },
        configuration: {
          parallelSteps: ['remove-threats', 'patch-vulnerabilities', 'restore-systems']
        },
        inputs: {
          affectedSystems: 'variables.affectedSystems',
          investigationResults: 'variables.investigationResults'
        },
        outputs: {
          recoveryResults: 'recoveryResults'
        },
        nextSteps: ['post-incident'],
        errorHandling: {
          strategy: 'fail'
        }
      },
      
      // Post-Incident Activities
      {
        id: 'post-incident',
        name: 'Post-Incident Activities',
        type: StepType.SEQUENTIAL,
        description: 'Complete post-incident activities',
        position: { x: 200, y: 900 },
        configuration: {
          sequentialSteps: ['lessons-learned', 'update-defenses', 'share-intelligence']
        },
        inputs: {
          investigationResults: 'variables.investigationResults',
          recoveryResults: 'variables.recoveryResults'
        },
        outputs: {
          postIncidentResults: 'postIncidentResults'
        },
        nextSteps: [],
        errorHandling: {
          strategy: 'skip'
        }
      }
    ],
    
    parameters: {
      indicators: {
        type: 'array',
        displayName: 'APT Indicators',
        category: 'Input',
        order: 1,
        description: 'List of APT indicators to process',
        required: true,
        defaultValue: []
      },
      event: {
        type: 'object',
        displayName: 'Detection Event',
        category: 'Input',
        order: 2,
        description: 'Original detection event data',
        required: true,
        defaultValue: {}
      }
    },
    
    sla: {
      responseTime: '30m',
      resolutionTime: '24h',
      maxExecutionTime: '48h',
      availabilityTarget: 99.9
    },
    
    security: {
      classification: 'confidential',
      requiredRoles: ['security-analyst', 'incident-responder'],
      requiredPermissions: ['incident-response', 'system-isolation'],
      dataEncryption: true,
      auditLevel: 'comprehensive'
    },
    
    integrations: {
      taskManagement: {
        enabled: true,
        createTasks: true,
        updateTaskStatus: true,
        taskPriority: WorkflowPriority.CRITICAL
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
            condition: 'duration > 24h',
            action: 'escalate-to-manager'
          }
        ]
      }
    },
    
    monitoring: {
      enabled: true,
      collectMetrics: true,
      alerting: {
        enabled: true,
        channels: ['email', 'slack', 'sms'],
        conditions: [
          {
            metric: 'execution_time',
            operator: '>',
            value: '2h',
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

  // Malware Analysis Workflow
  MALWARE_ANALYSIS: {
    id: 'malware-analysis-workflow',
    name: 'Automated Malware Analysis Workflow',
    version: '3.1',
    status: WorkflowStatus.ACTIVE,
    priority: WorkflowPriority.HIGH,
    description: 'Comprehensive automated malware analysis and intelligence generation',
    category: 'malware-analysis',
    tags: ['malware', 'analysis', 'sandbox', 'intelligence'],
    
    metadata: {
      author: 'Malware Analysis Team',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-02-01')
    },
    
    triggers: [
      {
        id: 'malware-sample-received',
        type: TriggerType.EVENT,
        name: 'Malware Sample Received',
        description: 'Triggered when a malware sample is submitted for analysis',
        enabled: true,
        configuration: {
          eventType: 'malware-sample-received',
          source: 'sample-submission-system'
        }
      }
    ],
    
    steps: [
      {
        id: 'initial-processing',
        name: 'Initial Processing',
        type: StepType.SEQUENTIAL,
        description: 'Initial malware sample processing',
        position: { x: 100, y: 100 },
        configuration: {
          sequentialSteps: ['extract-metadata', 'calculate-hashes', 'reputation-check']
        },
        inputs: {
          sample: 'parameters.sample'
        },
        outputs: {
          basicAnalysis: 'basicAnalysis'
        },
        nextSteps: ['static-analysis'],
        errorHandling: {
          strategy: 'fail'
        }
      },
      
      {
        id: 'static-analysis',
        name: 'Static Analysis',
        type: StepType.PARALLEL,
        description: 'Comprehensive static analysis of malware sample',
        position: { x: 100, y: 300 },
        configuration: {
          parallelSteps: ['disassemble-binary', 'extract-strings', 'analyze-pe-structure']
        },
        inputs: {
          sample: 'parameters.sample',
          basicAnalysis: 'variables.basicAnalysis'
        },
        outputs: {
          staticResults: 'staticResults'
        },
        nextSteps: ['dynamic-analysis-decision'],
        errorHandling: {
          strategy: 'fail'
        }
      },
      
      {
        id: 'dynamic-analysis-decision',
        name: 'Dynamic Analysis Decision',
        type: StepType.DECISION,
        description: 'Decide if dynamic analysis is needed based on static results',
        position: { x: 100, y: 500 },
        configuration: {},
        inputs: {
          staticResults: 'variables.staticResults'
        },
        outputs: {
          requiresDynamicAnalysis: 'requiresDynamicAnalysis'
        },
        nextSteps: ['dynamic-analysis', 'intelligence-generation'],
        conditions: [
          {
            expression: 'variables.staticResults.suspicious === true || variables.staticResults.unknownSample === true',
            description: 'Suspicious or unknown samples require dynamic analysis'
          }
        ],
        errorHandling: {
          strategy: 'skip'
        }
      },
      
      {
        id: 'dynamic-analysis',
        name: 'Dynamic Analysis',
        type: StepType.TASK,
        description: 'Execute sample in sandbox environment',
        position: { x: 100, y: 700 },
        configuration: {
          taskType: 'sandbox-analysis',
          sandboxEnvironments: ['windows-10', 'windows-11', 'linux'],
          analysisTimeout: '30m'
        },
        inputs: {
          sample: 'parameters.sample',
          staticResults: 'variables.staticResults'
        },
        outputs: {
          dynamicResults: 'dynamicResults'
        },
        nextSteps: ['intelligence-generation'],
        conditions: [
          {
            expression: 'variables.requiresDynamicAnalysis === true',
            description: 'Execute only if dynamic analysis is required'
          }
        ],
        errorHandling: {
          strategy: 'fail'
        },
        timeout: '45m'
      },
      
      {
        id: 'intelligence-generation',
        name: 'Intelligence Generation',
        type: StepType.TASK,
        description: 'Generate threat intelligence from analysis results',
        position: { x: 100, y: 900 },
        configuration: {
          taskType: 'intelligence-generation',
          outputs: ['iocs', 'yara-rules', 'signatures']
        },
        inputs: {
          staticResults: 'variables.staticResults',
          dynamicResults: 'variables.dynamicResults'
        },
        outputs: {
          intelligence: 'intelligence'
        },
        nextSteps: [],
        errorHandling: {
          strategy: 'skip'
        }
      }
    ],
    
    parameters: {
      sample: {
        type: 'object',
        displayName: 'Malware Sample',
        category: 'Input',
        order: 1,
        description: 'Malware sample to analyze',
        required: true,
        defaultValue: {}
      }
    },
    
    sla: {
      responseTime: '5m',
      resolutionTime: '2h',
      maxExecutionTime: '4h'
    },
    
    security: {
      classification: 'internal',
      requiredRoles: ['malware-analyst'],
      requiredPermissions: ['malware-analysis'],
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
        subscribeToEvents: false,
        deadLetterQueue: true
      },
      evidence: {
        enabled: true,
        collectEvidence: true,
        preserveChainOfCustody: true,
        evidenceRetention: '1y'
      },
      issues: {
        enabled: false,
        createIssues: false,
        linkToIssues: false,
        escalationRules: []
      }
    },
    
    monitoring: {
      enabled: true,
      collectMetrics: true,
      alerting: {
        enabled: false,
        channels: [],
        conditions: []
      },
      logging: {
        level: 'info',
        includeStepDetails: true,
        includeVariables: false
      }
    }
  }
};

// Export individual templates
export const APT_RESPONSE_WORKFLOW = CTI_WORKFLOW_TEMPLATES.APT_RESPONSE;
export const MALWARE_ANALYSIS_WORKFLOW = CTI_WORKFLOW_TEMPLATES.MALWARE_ANALYSIS;

// Merge with extended workflows
Object.assign(CTI_WORKFLOW_TEMPLATES, EXTENDED_CTI_WORKFLOWS);

// Export additional individual templates
export const VULNERABILITY_MANAGEMENT_WORKFLOW = CTI_WORKFLOW_TEMPLATES.VULNERABILITY_MANAGEMENT;
export const THREAT_HUNT_CAMPAIGN_WORKFLOW = CTI_WORKFLOW_TEMPLATES.THREAT_HUNT_CAMPAIGN;
export const COMPLIANCE_AUDIT_WORKFLOW = CTI_WORKFLOW_TEMPLATES.COMPLIANCE_AUDIT;

export default CTI_WORKFLOW_TEMPLATES;