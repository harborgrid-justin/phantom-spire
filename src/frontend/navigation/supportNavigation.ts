/**
 * Support Navigation Configuration
 * Defines navigation structure for all 49 support pages
 */

import {
  Dashboard,
  Support,
  ContactSupport,
  Help,
  Assignment,
  Analytics,
  Settings,
  School,
  Forum,
  VideoLibrary,
  Article,
  Search,
  Feedback,
  Schedule,
  Phone,
  Chat,
  HealthAndSafety,
  Build,
  Security,
  Backup,
  NetworkCheck,
  Computer,
  BugReport,
  MonitorHeart,
  Description,
  AutoFixHigh,
  CheckCircle,
  History,
  Payment,
  Stars,
  Engineering,
  DesktopWindows,
  Quiz,
  Group,
  ManageSearch,
  Edit,
  Psychology,
  TrendingUp
} from '@mui/icons-material';

export interface SupportNavigationItem {
  id: string;
  title: string;
  description: string;
  icon: any;
  category: 'customer-support' | 'technical-support' | 'help-desk' | 'knowledge-management';
  path: string;
  component: string;
  permissions?: string[];
  featured?: boolean;
}

export const supportNavigation: SupportNavigationItem[] = [
  // Customer Support (12 pages)
  {
    id: 'customer-portal-dashboard',
    title: 'Customer Portal Dashboard',
    description: 'Comprehensive customer self-service portal',
    icon: Dashboard,
    category: 'customer-support',
    path: '/support/customer-support/customer-portal-dashboard',
    component: 'CustomerPortalDashboard',
    featured: true
  },
  {
    id: 'ticket-submission-wizard',
    title: 'Ticket Submission Wizard',
    description: 'Guided ticket creation with automated routing',
    icon: Assignment,
    category: 'customer-support',
    path: '/support/customer-support/ticket-submission-wizard',
    component: 'TicketSubmissionWizard',
    featured: true
  },
  {
    id: 'case-status-tracker',
    title: 'Case Status Tracker',
    description: 'Real-time case status and progress tracking',
    icon: TrendingUp,
    category: 'customer-support',
    path: '/support/customer-support/case-status-tracker',
    component: 'CaseStatusTracker'
  },
  {
    id: 'customer-communication-center',
    title: 'Customer Communication Center',
    description: 'Multi-channel customer communication hub',
    icon: ContactSupport,
    category: 'customer-support',
    path: '/support/customer-support/customer-communication-center',
    component: 'CustomerCommunicationCenter'
  },
  {
    id: 'service-level-agreement-monitor',
    title: 'SLA Monitor',
    description: 'Service level agreement tracking and compliance',
    icon: MonitorHeart,
    category: 'customer-support',
    path: '/support/customer-support/service-level-agreement-monitor',
    component: 'ServiceLevelAgreementMonitor'
  },
  {
    id: 'customer-satisfaction-feedback',
    title: 'Customer Satisfaction Feedback',
    description: 'Customer feedback collection and analysis',
    icon: Feedback,
    category: 'customer-support',
    path: '/support/customer-support/customer-satisfaction-feedback',
    component: 'CustomerSatisfactionFeedback'
  },
  {
    id: 'escalation-management-system',
    title: 'Escalation Management System',
    description: 'Automated escalation workflows and approvals',
    icon: TrendingUp,
    category: 'customer-support',
    path: '/support/customer-support/escalation-management-system',
    component: 'EscalationManagementSystem'
  },
  {
    id: 'customer-history-analytics',
    title: 'Customer History Analytics',
    description: 'Comprehensive customer interaction history',
    icon: History,
    category: 'customer-support',
    path: '/support/customer-support/customer-history-analytics',
    component: 'CustomerHistoryAnalytics'
  },
  {
    id: 'priority-queue-manager',
    title: 'Priority Queue Manager',
    description: 'Intelligent ticket prioritization and routing',
    icon: Psychology,
    category: 'customer-support',
    path: '/support/customer-support/priority-queue-manager',
    component: 'PriorityQueueManager'
  },
  {
    id: 'customer-onboarding-portal',
    title: 'Customer Onboarding Portal',
    description: 'Streamlined customer onboarding process',
    icon: School,
    category: 'customer-support',
    path: '/support/customer-support/customer-onboarding-portal',
    component: 'CustomerOnboardingPortal'
  },
  {
    id: 'billing-support-center',
    title: 'Billing Support Center',
    description: 'Billing inquiries and payment support',
    icon: Payment,
    category: 'customer-support',
    path: '/support/customer-support/billing-support-center',
    component: 'BillingSupportCenter'
  },
  {
    id: 'customer-loyalty-programs',
    title: 'Customer Loyalty Programs',
    description: 'Customer retention and loyalty management',
    icon: Stars,
    category: 'customer-support',
    path: '/support/customer-support/customer-loyalty-programs',
    component: 'CustomerLoyaltyPrograms'
  },

  // Technical Support (12 pages)
  {
    id: 'technical-diagnostics-center',
    title: 'Technical Diagnostics Center',
    description: 'Advanced technical issue diagnosis and resolution',
    icon: BugReport,
    category: 'technical-support',
    path: '/support/technical-support/technical-diagnostics-center',
    component: 'TechnicalDiagnosticsCenter',
    featured: true
  },
  {
    id: 'remote-support-platform',
    title: 'Remote Support Platform',
    description: 'Secure remote assistance and troubleshooting',
    icon: DesktopWindows,
    category: 'technical-support',
    path: '/support/technical-support/remote-support-platform',
    component: 'RemoteSupportPlatform',
    featured: true
  },
  {
    id: 'system-health-monitor',
    title: 'System Health Monitor',
    description: 'Real-time system health and performance monitoring',
    icon: HealthAndSafety,
    category: 'technical-support',
    path: '/support/technical-support/system-health-monitor',
    component: 'SystemHealthMonitor'
  },
  {
    id: 'patch-management-center',
    title: 'Patch Management Center',
    description: 'Automated patch deployment and tracking',
    icon: AutoFixHigh,
    category: 'technical-support',
    path: '/support/technical-support/patch-management-center',
    component: 'PatchManagementCenter'
  },
  {
    id: 'technical-documentation-hub',
    title: 'Technical Documentation Hub',
    description: 'Comprehensive technical documentation portal',
    icon: Description,
    category: 'technical-support',
    path: '/support/technical-support/technical-documentation-hub',
    component: 'TechnicalDocumentationHub'
  },
  {
    id: 'incident-response-toolkit',
    title: 'Incident Response Toolkit',
    description: 'Incident response tools and procedures',
    icon: Support,
    category: 'technical-support',
    path: '/support/technical-support/incident-response-toolkit',
    component: 'IncidentResponseToolkit'
  },
  {
    id: 'performance-optimization-suite',
    title: 'Performance Optimization Suite',
    description: 'System performance analysis and optimization',
    icon: TrendingUp,
    category: 'technical-support',
    path: '/support/technical-support/performance-optimization-suite',
    component: 'PerformanceOptimizationSuite'
  },
  {
    id: 'security-vulnerability-scanner',
    title: 'Security Vulnerability Scanner',
    description: 'Automated security scanning and assessment',
    icon: Security,
    category: 'technical-support',
    path: '/support/technical-support/security-vulnerability-scanner',
    component: 'SecurityVulnerabilityScanner'
  },
  {
    id: 'backup-recovery-manager',
    title: 'Backup Recovery Manager',
    description: 'Data backup and recovery operations',
    icon: Backup,
    category: 'technical-support',
    path: '/support/technical-support/backup-recovery-manager',
    component: 'BackupRecoveryManager'
  },
  {
    id: 'network-troubleshooting-tools',
    title: 'Network Troubleshooting Tools',
    description: 'Network diagnostics and troubleshooting',
    icon: NetworkCheck,
    category: 'technical-support',
    path: '/support/technical-support/network-troubleshooting-tools',
    component: 'NetworkTroubleshootingTools'
  },
  {
    id: 'software-compatibility-checker',
    title: 'Software Compatibility Checker',
    description: 'Software compatibility analysis and testing',
    icon: Computer,
    category: 'technical-support',
    path: '/support/technical-support/software-compatibility-checker',
    component: 'SoftwareCompatibilityChecker'
  },
  {
    id: 'technical-escalation-board',
    title: 'Technical Escalation Board',
    description: 'Technical issue escalation and expert assignment',
    icon: Engineering,
    category: 'technical-support',
    path: '/support/technical-support/technical-escalation-board',
    component: 'TechnicalEscalationBoard'
  },

  // Help Desk (12 pages)
  {
    id: 'help-desk-dashboard',
    title: 'Help Desk Dashboard',
    description: 'Centralized help desk operations dashboard',
    icon: Dashboard,
    category: 'help-desk',
    path: '/support/help-desk/help-desk-dashboard',
    component: 'HelpDeskDashboard',
    featured: true
  },
  {
    id: 'ticket-management-console',
    title: 'Ticket Management Console',
    description: 'Comprehensive ticket lifecycle management',
    icon: Assignment,
    category: 'help-desk',
    path: '/support/help-desk/ticket-management-console',
    component: 'TicketManagementConsole',
    featured: true
  },
  {
    id: 'agent-workbench',
    title: 'Agent Workbench',
    description: 'Unified agent workspace with integrated tools',
    icon: Build,
    category: 'help-desk',
    path: '/support/help-desk/agent-workbench',
    component: 'AgentWorkbench'
  },
  {
    id: 'chat-support-interface',
    title: 'Chat Support Interface',
    description: 'Real-time chat support with customers',
    icon: Chat,
    category: 'help-desk',
    path: '/support/help-desk/chat-support-interface',
    component: 'ChatSupportInterface'
  },
  {
    id: 'call-center-integration',
    title: 'Call Center Integration',
    description: 'Voice support integration and call management',
    icon: Phone,
    category: 'help-desk',
    path: '/support/help-desk/call-center-integration',
    component: 'CallCenterIntegration'
  },
  {
    id: 'queue-management-system',
    title: 'Queue Management System',
    description: 'Intelligent queue routing and load balancing',
    icon: Psychology,
    category: 'help-desk',
    path: '/support/help-desk/queue-management-system',
    component: 'QueueManagementSystem'
  },
  {
    id: 'agent-performance-analytics',
    title: 'Agent Performance Analytics',
    description: 'Agent productivity and performance metrics',
    icon: Analytics,
    category: 'help-desk',
    path: '/support/help-desk/agent-performance-analytics',
    component: 'AgentPerformanceAnalytics'
  },
  {
    id: 'first-contact-resolution-tracker',
    title: 'First Contact Resolution Tracker',
    description: 'FCR tracking and improvement analytics',
    icon: CheckCircle,
    category: 'help-desk',
    path: '/support/help-desk/first-contact-resolution-tracker',
    component: 'FirstContactResolutionTracker'
  },
  {
    id: 'multi-language-support-hub',
    title: 'Multi-Language Support Hub',
    description: 'International support with language localization',
    icon: Group,
    category: 'help-desk',
    path: '/support/help-desk/multi-language-support-hub',
    component: 'MultiLanguageSupportHub'
  },
  {
    id: 'shift-scheduling-system',
    title: 'Shift Scheduling System',
    description: 'Agent scheduling and shift management',
    icon: Schedule,
    category: 'help-desk',
    path: '/support/help-desk/shift-scheduling-system',
    component: 'ShiftSchedulingSystem'
  },
  {
    id: 'call-recording-analytics',
    title: 'Call Recording Analytics',
    description: 'Call recording, transcription, and analysis',
    icon: Analytics,
    category: 'help-desk',
    path: '/support/help-desk/call-recording-analytics',
    component: 'CallRecordingAnalytics'
  },
  {
    id: 'help-desk-reporting-suite',
    title: 'Help Desk Reporting Suite',
    description: 'Comprehensive help desk performance reports',
    icon: Analytics,
    category: 'help-desk',
    path: '/support/help-desk/help-desk-reporting-suite',
    component: 'HelpDeskReportingSuite'
  },

  // Knowledge Management (13 pages)
  {
    id: 'knowledge-base-portal',
    title: 'Knowledge Base Portal',
    description: 'Comprehensive knowledge base with search capabilities',
    icon: Help,
    category: 'knowledge-management',
    path: '/support/knowledge-management/knowledge-base-portal',
    component: 'KnowledgeBasePortal',
    featured: true
  },
  {
    id: 'article-authoring-system',
    title: 'Article Authoring System',
    description: 'Advanced article creation and editing tools',
    icon: Edit,
    category: 'knowledge-management',
    path: '/support/knowledge-management/article-authoring-system',
    component: 'ArticleAuthoringSystem',
    featured: true
  },
  {
    id: 'content-approval-workflow',
    title: 'Content Approval Workflow',
    description: 'Content review and approval processes',
    icon: CheckCircle,
    category: 'knowledge-management',
    path: '/support/knowledge-management/content-approval-workflow',
    component: 'ContentApprovalWorkflow'
  },
  {
    id: 'knowledge-analytics-dashboard',
    title: 'Knowledge Analytics Dashboard',
    description: 'Knowledge base usage and effectiveness analytics',
    icon: Analytics,
    category: 'knowledge-management',
    path: '/support/knowledge-management/knowledge-analytics-dashboard',
    component: 'KnowledgeAnalyticsDashboard'
  },
  {
    id: 'expert-collaboration-platform',
    title: 'Expert Collaboration Platform',
    description: 'Subject matter expert collaboration tools',
    icon: Group,
    category: 'knowledge-management',
    path: '/support/knowledge-management/expert-collaboration-platform',
    component: 'ExpertCollaborationPlatform'
  },
  {
    id: 'training-materials-manager',
    title: 'Training Materials Manager',
    description: 'Training content creation and distribution',
    icon: School,
    category: 'knowledge-management',
    path: '/support/knowledge-management/training-materials-manager',
    component: 'TrainingMaterialsManager'
  },
  {
    id: 'faq-management-system',
    title: 'FAQ Management System',
    description: 'Frequently asked questions management',
    icon: Quiz,
    category: 'knowledge-management',
    path: '/support/knowledge-management/faq-management-system',
    component: 'FaqManagementSystem'
  },
  {
    id: 'video-tutorial-platform',
    title: 'Video Tutorial Platform',
    description: 'Video-based training and support content',
    icon: VideoLibrary,
    category: 'knowledge-management',
    path: '/support/knowledge-management/video-tutorial-platform',
    component: 'VideoTutorialPlatform'
  },
  {
    id: 'knowledge-gap-analyzer',
    title: 'Knowledge Gap Analyzer',
    description: 'Identification of knowledge base gaps',
    icon: ManageSearch,
    category: 'knowledge-management',
    path: '/support/knowledge-management/knowledge-gap-analyzer',
    component: 'KnowledgeGapAnalyzer'
  },
  {
    id: 'content-versioning-system',
    title: 'Content Versioning System',
    description: 'Document version control and history',
    icon: Settings,
    category: 'knowledge-management',
    path: '/support/knowledge-management/content-versioning-system',
    component: 'ContentVersioningSystem'
  },
  {
    id: 'search-optimization-engine',
    title: 'Search Optimization Engine',
    description: 'AI-powered knowledge base search',
    icon: Search,
    category: 'knowledge-management',
    path: '/support/knowledge-management/search-optimization-engine',
    component: 'SearchOptimizationEngine'
  },
  {
    id: 'community-forums-platform',
    title: 'Community Forums Platform',
    description: 'User community discussion forums',
    icon: Forum,
    category: 'knowledge-management',
    path: '/support/knowledge-management/community-forums-platform',
    component: 'CommunityForumsPlatform'
  },
  {
    id: 'knowledge-certification-system',
    title: 'Knowledge Certification System',
    description: 'Expert certification and validation system',
    icon: CheckCircle,
    category: 'knowledge-management',
    path: '/support/knowledge-management/knowledge-certification-system',
    component: 'KnowledgeCertificationSystem'
  }
];

export const supportCategories = {
  'customer-support': {
    title: 'Customer Support',
    description: 'Customer-facing support tools and portals',
    icon: ContactSupport,
    color: '#1976d2'
  },
  'technical-support': {
    title: 'Technical Support',
    description: 'Technical issue resolution and diagnostics',
    icon: Engineering,
    color: '#d32f2f'
  },
  'help-desk': {
    title: 'Help Desk',
    description: 'Help desk operations and agent tools',
    icon: Support,
    color: '#388e3c'
  },
  'knowledge-management': {
    title: 'Knowledge Management',
    description: 'Knowledge base and documentation systems',
    icon: School,
    color: '#f57c00'
  }
};

export const getFeaturedSupportPages = () => {
  return supportNavigation.filter(item => item.featured);
};

export const getSupportPagesByCategory = (category: string) => {
  return supportNavigation.filter(item => item.category === category);
};

export const getSupportPageById = (id: string) => {
  return supportNavigation.find(item => item.id === id);
};