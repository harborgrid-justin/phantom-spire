/**
 * Threat Intelligence Navigation Index
 * Comprehensive navigation for all 48 threat intelligence pages
 */

export interface ThreatIntelligencePage {
  id: string;
  title: string;
  description: string;
  path: string;
  category: string;
  icon: string;
  endpoints: string[];
}

export const threatIntelligenceNavigation: ThreatIntelligencePage[] = [
  // Advanced Analytics & Intelligence (8 pages)
  {
    id: 'threat-analytics',
    title: '📊 Advanced Threat Analytics',
    description: 'Advanced analytics and machine learning for threat detection',
    path: '/threat-intelligence/advanced-analytics/threat-analytics',
    category: 'advanced-analytics',
    icon: '📊',
    endpoints: ['/api/v1/threat-intelligence/advanced-analytics/threat-analytics']
  },
  {
    id: 'intelligence-dashboard',
    title: '🎯 Threat Intelligence Dashboard',
    description: 'Comprehensive threat intelligence overview and metrics',
    path: '/threat-intelligence/advanced-analytics/intelligence-dashboard',
    category: 'advanced-analytics',
    icon: '🎯',
    endpoints: ['/api/v1/threat-intelligence/advanced-analytics/intelligence-dashboard']
  },
  {
    id: 'ioc-correlation',
    title: '🔗 IOC Correlation Engine',
    description: 'Advanced correlation analysis for indicators of compromise',
    path: '/threat-intelligence/advanced-analytics/ioc-correlation',
    category: 'advanced-analytics',
    icon: '🔗',
    endpoints: ['/api/v1/threat-intelligence/advanced-analytics/ioc-correlation']
  },
  {
    id: 'actor-attribution',
    title: '👤 Threat Actor Attribution',
    description: 'Attribution analysis and threat actor identification',
    path: '/threat-intelligence/advanced-analytics/actor-attribution',
    category: 'advanced-analytics',
    icon: '👤',
    endpoints: ['/api/v1/threat-intelligence/advanced-analytics/actor-attribution']
  },
  {
    id: 'campaign-analysis',
    title: '🎪 Campaign Analysis Engine',
    description: 'Advanced analysis of threat campaigns and TTPs',
    path: '/threat-intelligence/advanced-analytics/campaign-analysis',
    category: 'advanced-analytics',
    icon: '🎪',
    endpoints: ['/api/v1/threat-intelligence/advanced-analytics/campaign-analysis']
  },
  {
    id: 'landscape-assessment',
    title: '🌍 Threat Landscape Assessment',
    description: 'Global threat landscape monitoring and assessment',
    path: '/threat-intelligence/advanced-analytics/landscape-assessment',
    category: 'advanced-analytics',
    icon: '🌍',
    endpoints: ['/api/v1/threat-intelligence/advanced-analytics/landscape-assessment']
  },
  {
    id: 'vulnerability-mapping',
    title: '🗺️ Vulnerability-Threat Mapping',
    description: 'Mapping vulnerabilities to active threat campaigns',
    path: '/threat-intelligence/advanced-analytics/vulnerability-mapping',
    category: 'advanced-analytics',
    icon: '🗺️',
    endpoints: ['/api/v1/threat-intelligence/advanced-analytics/vulnerability-mapping']
  },
  {
    id: 'predictive-modeling',
    title: '🔮 Predictive Threat Modeling',
    description: 'AI-powered predictive threat modeling and forecasting',
    path: '/threat-intelligence/advanced-analytics/predictive-modeling',
    category: 'advanced-analytics',
    icon: '🔮',
    endpoints: ['/api/v1/threat-intelligence/advanced-analytics/predictive-modeling']
  },

  // IOC & Indicators Management (8 pages)
  {
    id: 'lifecycle-management',
    title: '🔄 IOC Lifecycle Management',
    description: 'Complete lifecycle management for indicators of compromise',
    path: '/threat-intelligence/ioc-management/lifecycle-management',
    category: 'ioc-management',
    icon: '🔄',
    endpoints: ['/api/v1/threat-intelligence/ioc-management/lifecycle-management']
  },
  {
    id: 'enrichment-service',
    title: '💎 IOC Enrichment Service',
    description: 'Automated enrichment and contextualization of IOCs',
    path: '/threat-intelligence/ioc-management/enrichment-service',
    category: 'ioc-management',
    icon: '💎',
    endpoints: ['/api/v1/threat-intelligence/ioc-management/enrichment-service']
  },
  {
    id: 'validation-system',
    title: '✅ IOC Validation System',
    description: 'Comprehensive validation and verification of indicators',
    path: '/threat-intelligence/ioc-management/validation-system',
    category: 'ioc-management',
    icon: '✅',
    endpoints: ['/api/v1/threat-intelligence/ioc-management/validation-system']
  },
  {
    id: 'investigation-tools',
    title: '🔍 IOC Investigation Tools',
    description: 'Advanced tools for IOC investigation and analysis',
    path: '/threat-intelligence/ioc-management/investigation-tools',
    category: 'ioc-management',
    icon: '🔍',
    endpoints: ['/api/v1/threat-intelligence/ioc-management/investigation-tools']
  },
  {
    id: 'reputation-scoring',
    title: '⭐ IOC Reputation Scoring',
    description: 'Dynamic reputation scoring for indicators of compromise',
    path: '/threat-intelligence/ioc-management/reputation-scoring',
    category: 'ioc-management',
    icon: '⭐',
    endpoints: ['/api/v1/threat-intelligence/ioc-management/reputation-scoring']
  },
  {
    id: 'relationship-mapping',
    title: '🕸️ IOC Relationship Mapping',
    description: 'Visualization and analysis of IOC relationships',
    path: '/threat-intelligence/ioc-management/relationship-mapping',
    category: 'ioc-management',
    icon: '🕸️',
    endpoints: ['/api/v1/threat-intelligence/ioc-management/relationship-mapping']
  },
  {
    id: 'source-management',
    title: '📡 IOC Source Management',
    description: 'Management of IOC sources and feed integration',
    path: '/threat-intelligence/ioc-management/source-management',
    category: 'ioc-management',
    icon: '📡',
    endpoints: ['/api/v1/threat-intelligence/ioc-management/source-management']
  },
  {
    id: 'export-import-hub',
    title: '🔄 IOC Export/Import Hub',
    description: 'Centralized hub for IOC data exchange and integration',
    path: '/threat-intelligence/ioc-management/export-import-hub',
    category: 'ioc-management',
    icon: '🔄',
    endpoints: ['/api/v1/threat-intelligence/ioc-management/export-import-hub']
  },

  // Threat Actor & Attribution (8 pages)
  {
    id: 'actor-profiles',
    title: '👥 Threat Actor Profiles',
    description: 'Comprehensive profiles and analysis of threat actors',
    path: '/threat-intelligence/threat-actors/actor-profiles',
    category: 'threat-actors',
    icon: '👥',
    endpoints: ['/api/v1/threat-intelligence/threat-actors/actor-profiles']
  },
  {
    id: 'attribution-analytics',
    title: '🎯 Attribution Analytics',
    description: 'Advanced analytics for threat attribution and analysis',
    path: '/threat-intelligence/threat-actors/attribution-analytics',
    category: 'threat-actors',
    icon: '🎯',
    endpoints: ['/api/v1/threat-intelligence/threat-actors/attribution-analytics']
  },
  {
    id: 'actor-tracking',
    title: '🔎 Threat Actor Tracking',
    description: 'Real-time tracking and monitoring of threat actors',
    path: '/threat-intelligence/threat-actors/actor-tracking',
    category: 'threat-actors',
    icon: '🔎',
    endpoints: ['/api/v1/threat-intelligence/threat-actors/actor-tracking']
  },
  {
    id: 'capability-assessment',
    title: '⚡ Actor Capability Assessment',
    description: 'Assessment of threat actor capabilities and techniques',
    path: '/threat-intelligence/threat-actors/capability-assessment',
    category: 'threat-actors',
    icon: '⚡',
    endpoints: ['/api/v1/threat-intelligence/threat-actors/capability-assessment']
  },
  {
    id: 'confidence-scoring',
    title: '📈 Attribution Confidence Scoring',
    description: 'Statistical confidence scoring for threat attribution',
    path: '/threat-intelligence/threat-actors/confidence-scoring',
    category: 'threat-actors',
    icon: '📈',
    endpoints: ['/api/v1/threat-intelligence/threat-actors/confidence-scoring']
  },
  {
    id: 'collaboration-networks',
    title: '🤝 Actor Collaboration Networks',
    description: 'Analysis of threat actor collaboration and networks',
    path: '/threat-intelligence/threat-actors/collaboration-networks',
    category: 'threat-actors',
    icon: '🤝',
    endpoints: ['/api/v1/threat-intelligence/threat-actors/collaboration-networks']
  },
  {
    id: 'campaign-mapping',
    title: '🗺️ Actor Campaign Mapping',
    description: 'Mapping threat actors to their campaigns',
    path: '/threat-intelligence/threat-actors/campaign-mapping',
    category: 'threat-actors',
    icon: '🗺️',
    endpoints: ['/api/v1/threat-intelligence/threat-actors/campaign-mapping']
  },
  {
    id: 'intelligence-feeds',
    title: '📡 Actor Intelligence Feeds',
    description: 'Specialized intelligence feeds for threat actors',
    path: '/threat-intelligence/threat-actors/intelligence-feeds',
    category: 'threat-actors',
    icon: '📡',
    endpoints: ['/api/v1/threat-intelligence/threat-actors/intelligence-feeds']
  },

  // Intelligence Operations (8 pages)
  {
    id: 'intelligence-sharing',
    title: '🤝 Threat Intelligence Sharing',
    description: 'Secure sharing of threat intelligence with partners',
    path: '/threat-intelligence/intel-operations/intelligence-sharing',
    category: 'intel-operations',
    icon: '🤝',
    endpoints: ['/api/v1/threat-intelligence/intel-operations/intelligence-sharing']
  },
  {
    id: 'collection-management',
    title: '📥 Intelligence Collection Management',
    description: 'Management of intelligence collection requirements',
    path: '/threat-intelligence/intel-operations/collection-management',
    category: 'intel-operations',
    icon: '📥',
    endpoints: ['/api/v1/threat-intelligence/intel-operations/collection-management']
  },
  {
    id: 'automation-engine',
    title: '🤖 Threat Intelligence Automation',
    description: 'Automated threat intelligence processing and analysis',
    path: '/threat-intelligence/intel-operations/automation-engine',
    category: 'intel-operations',
    icon: '🤖',
    endpoints: ['/api/v1/threat-intelligence/intel-operations/automation-engine']
  },
  {
    id: 'realtime-monitoring',
    title: '📺 Real-time Threat Monitoring',
    description: 'Real-time monitoring of global threat activities',
    path: '/threat-intelligence/intel-operations/realtime-monitoring',
    category: 'intel-operations',
    icon: '📺',
    endpoints: ['/api/v1/threat-intelligence/intel-operations/realtime-monitoring']
  },
  {
    id: 'workflow-engine',
    title: '⚙️ Threat Intelligence Workflows',
    description: 'Automated workflows for intelligence processing',
    path: '/threat-intelligence/intel-operations/workflow-engine',
    category: 'intel-operations',
    icon: '⚙️',
    endpoints: ['/api/v1/threat-intelligence/intel-operations/workflow-engine']
  },
  {
    id: 'intel-source-management',
    title: '🔗 Intelligence Source Management',
    description: 'Management of external intelligence sources',
    path: '/threat-intelligence/intel-operations/source-management',
    category: 'intel-operations',
    icon: '🔗',
    endpoints: ['/api/v1/threat-intelligence/intel-operations/source-management']
  },
  {
    id: 'api-management',
    title: '🌐 Threat Intelligence APIs',
    description: 'API management for threat intelligence services',
    path: '/threat-intelligence/intel-operations/api-management',
    category: 'intel-operations',
    icon: '🌐',
    endpoints: ['/api/v1/threat-intelligence/intel-operations/api-management']
  },
  {
    id: 'training-center',
    title: '📚 Intelligence Training Center',
    description: 'Training and education for threat intelligence analysts',
    path: '/threat-intelligence/intel-operations/training-center',
    category: 'intel-operations',
    icon: '📚',
    endpoints: ['/api/v1/threat-intelligence/intel-operations/training-center']
  },

  // Cyber Threat Hunting & Response (8 pages)
  {
    id: 'proactive-hunting',
    title: '🎯 Proactive Threat Hunting',
    description: 'Advanced proactive threat hunting operations and methodologies',
    path: '/threat-intelligence/threat-hunting/proactive-hunting',
    category: 'threat-hunting',
    icon: '🎯',
    endpoints: ['/api/v1/threat-intelligence/threat-hunting/proactive-hunting']
  },
  {
    id: 'behavioral-analytics',
    title: '🧠 Behavioral Analytics Engine',
    description: 'AI-driven behavioral analysis for anomaly detection',
    path: '/threat-intelligence/threat-hunting/behavioral-analytics',
    category: 'threat-hunting',
    icon: '🧠',
    endpoints: ['/api/v1/threat-intelligence/threat-hunting/behavioral-analytics']
  },
  {
    id: 'hunting-playbooks',
    title: '📋 Threat Hunting Playbooks',
    description: 'Structured hunting methodologies and playbook management',
    path: '/threat-intelligence/threat-hunting/hunting-playbooks',
    category: 'threat-hunting',
    icon: '📋',
    endpoints: ['/api/v1/threat-intelligence/threat-hunting/hunting-playbooks']
  },
  {
    id: 'incident-response',
    title: '🚨 Rapid Incident Response',
    description: 'Real-time incident response and containment strategies',
    path: '/threat-intelligence/threat-hunting/incident-response',
    category: 'threat-hunting',
    icon: '🚨',
    endpoints: ['/api/v1/threat-intelligence/threat-hunting/incident-response']
  },
  {
    id: 'forensic-analysis',
    title: '🔬 Digital Forensics Analysis',
    description: 'Advanced digital forensics and evidence analysis',
    path: '/threat-intelligence/threat-hunting/forensic-analysis',
    category: 'threat-hunting',
    icon: '🔬',
    endpoints: ['/api/v1/threat-intelligence/threat-hunting/forensic-analysis']
  },
  {
    id: 'threat-simulation',
    title: '⚔️ Threat Simulation Engine',
    description: 'Red team simulation and attack scenario modeling',
    path: '/threat-intelligence/threat-hunting/threat-simulation',
    category: 'threat-hunting',
    icon: '⚔️',
    endpoints: ['/api/v1/threat-intelligence/threat-hunting/threat-simulation']
  },
  {
    id: 'compromise-assessment',
    title: '🔍 Compromise Assessment',
    description: 'Comprehensive compromise assessment and validation',
    path: '/threat-intelligence/threat-hunting/compromise-assessment',
    category: 'threat-hunting',
    icon: '🔍',
    endpoints: ['/api/v1/threat-intelligence/threat-hunting/compromise-assessment']
  },
  {
    id: 'response-automation',
    title: '🤖 Response Automation Hub',
    description: 'Automated response orchestration and playbook execution',
    path: '/threat-intelligence/threat-hunting/response-automation',
    category: 'threat-hunting',
    icon: '🤖',
    endpoints: ['/api/v1/threat-intelligence/threat-hunting/response-automation']
  },

  // Advanced Threat Detection & Prevention (8 pages)
  {
    id: 'ml-detection',
    title: '🧬 ML-Powered Detection',
    description: 'Machine learning threat detection and classification',
    path: '/threat-intelligence/threat-detection/ml-detection',
    category: 'threat-detection',
    icon: '🧬',
    endpoints: ['/api/v1/threat-intelligence/threat-detection/ml-detection']
  },
  {
    id: 'zero-day-protection',
    title: '🛡️ Zero-Day Protection',
    description: 'Advanced zero-day threat detection and mitigation',
    path: '/threat-intelligence/threat-detection/zero-day-protection',
    category: 'threat-detection',
    icon: '🛡️',
    endpoints: ['/api/v1/threat-intelligence/threat-detection/zero-day-protection']
  },
  {
    id: 'sandbox-analysis',
    title: '📦 Sandbox Analysis Center',
    description: 'Automated malware analysis and dynamic sandboxing',
    path: '/threat-intelligence/threat-detection/sandbox-analysis',
    category: 'threat-detection',
    icon: '📦',
    endpoints: ['/api/v1/threat-intelligence/threat-detection/sandbox-analysis']
  },
  {
    id: 'network-monitoring',
    title: '🌐 Network Threat Monitoring',
    description: 'Real-time network traffic analysis and threat detection',
    path: '/threat-intelligence/threat-detection/network-monitoring',
    category: 'threat-detection',
    icon: '🌐',
    endpoints: ['/api/v1/threat-intelligence/threat-detection/network-monitoring']
  },
  {
    id: 'endpoint-protection',
    title: '💻 Endpoint Protection Center',
    description: 'Advanced endpoint detection and response capabilities',
    path: '/threat-intelligence/threat-detection/endpoint-protection',
    category: 'threat-detection',
    icon: '💻',
    endpoints: ['/api/v1/threat-intelligence/threat-detection/endpoint-protection']
  },
  {
    id: 'threat-prevention',
    title: '🚫 Threat Prevention Engine',
    description: 'Proactive threat prevention and blocking mechanisms',
    path: '/threat-intelligence/threat-detection/threat-prevention',
    category: 'threat-detection',
    icon: '🚫',
    endpoints: ['/api/v1/threat-intelligence/threat-detection/threat-prevention']
  },
  {
    id: 'signature-engine',
    title: '🔖 Signature Detection Engine',
    description: 'Advanced signature-based detection and pattern matching',
    path: '/threat-intelligence/threat-detection/signature-engine',
    category: 'threat-detection',
    icon: '🔖',
    endpoints: ['/api/v1/threat-intelligence/threat-detection/signature-engine']
  },
  {
    id: 'threat-scoring',
    title: '📊 Threat Scoring Matrix',
    description: 'Intelligent threat scoring and risk assessment framework',
    path: '/threat-intelligence/threat-detection/threat-scoring',
    category: 'threat-detection',
    icon: '📊',
    endpoints: ['/api/v1/threat-intelligence/threat-detection/threat-scoring']
  }
];

// Category definitions for better organization
export const threatIntelligenceCategories = {
  'advanced-analytics': {
    name: 'Advanced Analytics & Intelligence',
    description: 'AI-powered analytics and intelligence operations',
    icon: '📊',
    color: 'blue'
  },
  'ioc-management': {
    name: 'IOC & Indicators Management',
    description: 'Comprehensive IOC lifecycle and management',
    icon: '🔄',
    color: 'green'
  },
  'threat-actors': {
    name: 'Threat Actor & Attribution',
    description: 'Threat actor analysis and attribution',
    icon: '👥',
    color: 'purple'
  },
  'intel-operations': {
    name: 'Intelligence Operations',
    description: 'Intelligence operations and workflow management',
    icon: '🤝',
    color: 'orange'
  },
  'threat-hunting': {
    name: 'Cyber Threat Hunting & Response',
    description: 'Proactive threat hunting and incident response',
    icon: '🎯',
    color: 'red'
  },
  'threat-detection': {
    name: 'Advanced Threat Detection & Prevention',
    description: 'AI-driven threat detection and prevention systems',
    icon: '🧬',
    color: 'cyan'
  }
};