/**
 * Modernization Platform Navigation Index
 * Comprehensive navigation for all 49 modernization pages
 */

export interface ModernizationPage {
  id: string;
  title: string;
  description: string;
  path: string;
  category: string;
  icon: string;
  endpoints: string[];
}

export const modernizationNavigation: ModernizationPage[] = [
  // Digital Transformation (10 pages)
  {
    id: 'digital-transformation-dashboard',
    title: '🚀 Digital Transformation Dashboard',
    description: 'Comprehensive digital transformation strategy and progress tracking',
    path: '/modernization/digital-transformation/digital-transformation-dashboard',
    category: 'digital-transformation',
    icon: '🚀',
    endpoints: ['/api/v1/modernization/digital-transformation/digital-transformation-dashboard']
  },
  {
    id: 'transformation-roadmap-planner',
    title: '🗺️ Transformation Roadmap Planner',
    description: 'Strategic roadmap planning and milestone management',
    path: '/modernization/digital-transformation/transformation-roadmap-planner',
    category: 'digital-transformation',
    icon: '🗺️',
    endpoints: ['/api/v1/modernization/digital-transformation/transformation-roadmap-planner']
  },
  {
    id: 'digital-maturity-assessor',
    title: '📊 Digital Maturity Assessor',
    description: 'Digital maturity assessment and scoring framework',
    path: '/modernization/digital-transformation/digital-maturity-assessor',
    category: 'digital-transformation',
    icon: '📊',
    endpoints: ['/api/v1/modernization/digital-transformation/digital-maturity-assessor']
  },
  {
    id: 'transformation-business-case',
    title: '💼 Transformation Business Case',
    description: 'Business case development and ROI analysis tools',
    path: '/modernization/digital-transformation/transformation-business-case',
    category: 'digital-transformation',
    icon: '💼',
    endpoints: ['/api/v1/modernization/digital-transformation/transformation-business-case']
  },
  {
    id: 'change-management-portal',
    title: '🔄 Change Management Portal',
    description: 'Organizational change management and adoption tracking',
    path: '/modernization/digital-transformation/change-management-portal',
    category: 'digital-transformation',
    icon: '🔄',
    endpoints: ['/api/v1/modernization/digital-transformation/change-management-portal']
  },
  {
    id: 'stakeholder-engagement-hub',
    title: '👥 Stakeholder Engagement Hub',
    description: 'Stakeholder communication and engagement platform',
    path: '/modernization/digital-transformation/stakeholder-engagement-hub',
    category: 'digital-transformation',
    icon: '👥',
    endpoints: ['/api/v1/modernization/digital-transformation/stakeholder-engagement-hub']
  },
  {
    id: 'transformation-metrics-center',
    title: '📈 Transformation Metrics Center',
    description: 'KPI tracking and transformation success metrics',
    path: '/modernization/digital-transformation/transformation-metrics-center',
    category: 'digital-transformation',
    icon: '📈',
    endpoints: ['/api/v1/modernization/digital-transformation/transformation-metrics-center']
  },
  {
    id: 'digital-culture-builder',
    title: '🏛️ Digital Culture Builder',
    description: 'Digital culture development and employee engagement',
    path: '/modernization/digital-transformation/digital-culture-builder',
    category: 'digital-transformation',
    icon: '🏛️',
    endpoints: ['/api/v1/modernization/digital-transformation/digital-culture-builder']
  },
  {
    id: 'innovation-lab-manager',
    title: '🧪 Innovation Lab Manager',
    description: 'Innovation laboratory and experimentation platform',
    path: '/modernization/digital-transformation/innovation-lab-manager',
    category: 'digital-transformation',
    icon: '🧪',
    endpoints: ['/api/v1/modernization/digital-transformation/innovation-lab-manager']
  },
  {
    id: 'transformation-risk-monitor',
    title: '⚠️ Transformation Risk Monitor',
    description: 'Risk assessment and mitigation for transformation initiatives',
    path: '/modernization/digital-transformation/transformation-risk-monitor',
    category: 'digital-transformation',
    icon: '⚠️',
    endpoints: ['/api/v1/modernization/digital-transformation/transformation-risk-monitor']
  },

  // Cloud Migration (10 pages)
  {
    id: 'cloud-migration-dashboard',
    title: '☁️ Cloud Migration Dashboard',
    description: 'Centralized cloud migration planning and tracking',
    path: '/modernization/cloud-migration/cloud-migration-dashboard',
    category: 'cloud-migration',
    icon: '☁️',
    endpoints: ['/api/v1/modernization/cloud-migration/cloud-migration-dashboard']
  },
  {
    id: 'cloud-readiness-assessor',
    title: '🔍 Cloud Readiness Assessor',
    description: 'Application and infrastructure cloud readiness evaluation',
    path: '/modernization/cloud-migration/cloud-readiness-assessor',
    category: 'cloud-migration',
    icon: '🔍',
    endpoints: ['/api/v1/modernization/cloud-migration/cloud-readiness-assessor']
  },
  {
    id: 'migration-strategy-planner',
    title: '📋 Migration Strategy Planner',
    description: 'Multi-cloud migration strategy and planning tools',
    path: '/modernization/cloud-migration/migration-strategy-planner',
    category: 'cloud-migration',
    icon: '📋',
    endpoints: ['/api/v1/modernization/cloud-migration/migration-strategy-planner']
  },
  {
    id: 'cloud-cost-optimizer',
    title: '💰 Cloud Cost Optimizer',
    description: 'Cloud cost optimization and FinOps management',
    path: '/modernization/cloud-migration/cloud-cost-optimizer',
    category: 'cloud-migration',
    icon: '💰',
    endpoints: ['/api/v1/modernization/cloud-migration/cloud-cost-optimizer']
  },
  {
    id: 'hybrid-cloud-manager',
    title: '🌐 Hybrid Cloud Manager',
    description: 'Hybrid and multi-cloud environment management',
    path: '/modernization/cloud-migration/hybrid-cloud-manager',
    category: 'cloud-migration',
    icon: '🌐',
    endpoints: ['/api/v1/modernization/cloud-migration/hybrid-cloud-manager']
  },
  {
    id: 'cloud-security-center',
    title: '🔒 Cloud Security Center',
    description: 'Cloud security posture management and compliance',
    path: '/modernization/cloud-migration/cloud-security-center',
    category: 'cloud-migration',
    icon: '🔒',
    endpoints: ['/api/v1/modernization/cloud-migration/cloud-security-center']
  },
  {
    id: 'containerization-hub',
    title: '📦 Containerization Hub',
    description: 'Application containerization and orchestration platform',
    path: '/modernization/cloud-migration/containerization-hub',
    category: 'cloud-migration',
    icon: '📦',
    endpoints: ['/api/v1/modernization/cloud-migration/containerization-hub']
  },
  {
    id: 'cloud-native-architect',
    title: '🏗️ Cloud Native Architect',
    description: 'Cloud-native architecture design and best practices',
    path: '/modernization/cloud-migration/cloud-native-architect',
    category: 'cloud-migration',
    icon: '🏗️',
    endpoints: ['/api/v1/modernization/cloud-migration/cloud-native-architect']
  },
  {
    id: 'migration-automation-engine',
    title: '⚡ Migration Automation Engine',
    description: 'Automated migration tools and workflow orchestration',
    path: '/modernization/cloud-migration/migration-automation-engine',
    category: 'cloud-migration',
    icon: '⚡',
    endpoints: ['/api/v1/modernization/cloud-migration/migration-automation-engine']
  },
  {
    id: 'cloud-governance-portal',
    title: '🏛️ Cloud Governance Portal',
    description: 'Cloud governance policies and compliance management',
    path: '/modernization/cloud-migration/cloud-governance-portal',
    category: 'cloud-migration',
    icon: '🏛️',
    endpoints: ['/api/v1/modernization/cloud-migration/cloud-governance-portal']
  },

  // Legacy Modernization (8 pages)
  {
    id: 'legacy-system-analyzer',
    title: '🔍 Legacy System Analyzer',
    description: 'Legacy system assessment and modernization planning',
    path: '/modernization/legacy-modernization/legacy-system-analyzer',
    category: 'legacy-modernization',
    icon: '🔍',
    endpoints: ['/api/v1/modernization/legacy-modernization/legacy-system-analyzer']
  },
  {
    id: 'application-portfolio-manager',
    title: '📱 Application Portfolio Manager',
    description: 'Application portfolio analysis and rationalization',
    path: '/modernization/legacy-modernization/application-portfolio-manager',
    category: 'legacy-modernization',
    icon: '📱',
    endpoints: ['/api/v1/modernization/legacy-modernization/application-portfolio-manager']
  },
  {
    id: 'modernization-pathway-advisor',
    title: '🧭 Modernization Pathway Advisor',
    description: 'Intelligent modernization pathway recommendations',
    path: '/modernization/legacy-modernization/modernization-pathway-advisor',
    category: 'legacy-modernization',
    icon: '🧭',
    endpoints: ['/api/v1/modernization/legacy-modernization/modernization-pathway-advisor']
  },
  {
    id: 'api-modernization-suite',
    title: '🔌 API Modernization Suite',
    description: 'Legacy API modernization and integration platform',
    path: '/modernization/legacy-modernization/api-modernization-suite',
    category: 'legacy-modernization',
    icon: '🔌',
    endpoints: ['/api/v1/modernization/legacy-modernization/api-modernization-suite']
  },
  {
    id: 'data-modernization-hub',
    title: '🗄️ Data Modernization Hub',
    description: 'Database and data architecture modernization tools',
    path: '/modernization/legacy-modernization/data-modernization-hub',
    category: 'legacy-modernization',
    icon: '🗄️',
    endpoints: ['/api/v1/modernization/legacy-modernization/data-modernization-hub']
  },
  {
    id: 'mainframe-migration-center',
    title: '🖥️ Mainframe Migration Center',
    description: 'Mainframe modernization and migration platform',
    path: '/modernization/legacy-modernization/mainframe-migration-center',
    category: 'legacy-modernization',
    icon: '🖥️',
    endpoints: ['/api/v1/modernization/legacy-modernization/mainframe-migration-center']
  },
  {
    id: 'legacy-integration-bridge',
    title: '🌉 Legacy Integration Bridge',
    description: 'Legacy system integration and interoperability tools',
    path: '/modernization/legacy-modernization/legacy-integration-bridge',
    category: 'legacy-modernization',
    icon: '🌉',
    endpoints: ['/api/v1/modernization/legacy-modernization/legacy-integration-bridge']
  },
  {
    id: 'modernization-testing-lab',
    title: '🧪 Modernization Testing Lab',
    description: 'Comprehensive testing framework for modernized systems',
    path: '/modernization/legacy-modernization/modernization-testing-lab',
    category: 'legacy-modernization',
    icon: '🧪',
    endpoints: ['/api/v1/modernization/legacy-modernization/modernization-testing-lab']
  },

  // Technology Stack (8 pages)
  {
    id: 'tech-stack-analyzer',
    title: '⚙️ Technology Stack Analyzer',
    description: 'Technology stack assessment and optimization platform',
    path: '/modernization/tech-stack/tech-stack-analyzer',
    category: 'tech-stack',
    icon: '⚙️',
    endpoints: ['/api/v1/modernization/tech-stack/tech-stack-analyzer']
  },
  {
    id: 'framework-migration-advisor',
    title: '🔄 Framework Migration Advisor',
    description: 'Framework and technology migration guidance system',
    path: '/modernization/tech-stack/framework-migration-advisor',
    category: 'tech-stack',
    icon: '🔄',
    endpoints: ['/api/v1/modernization/tech-stack/framework-migration-advisor']
  },
  {
    id: 'microservices-architect',
    title: '🏗️ Microservices Architect',
    description: 'Microservices architecture design and decomposition tools',
    path: '/modernization/tech-stack/microservices-architect',
    category: 'tech-stack',
    icon: '🏗️',
    endpoints: ['/api/v1/modernization/tech-stack/microservices-architect']
  },
  {
    id: 'devops-transformation-center',
    title: '🔧 DevOps Transformation Center',
    description: 'DevOps practices implementation and CI/CD pipeline optimization',
    path: '/modernization/tech-stack/devops-transformation-center',
    category: 'tech-stack',
    icon: '🔧',
    endpoints: ['/api/v1/modernization/tech-stack/devops-transformation-center']
  },
  {
    id: 'api-first-design-studio',
    title: '🎨 API-First Design Studio',
    description: 'API-first architecture design and development platform',
    path: '/modernization/tech-stack/api-first-design-studio',
    category: 'tech-stack',
    icon: '🎨',
    endpoints: ['/api/v1/modernization/tech-stack/api-first-design-studio']
  },
  {
    id: 'cloud-native-platform',
    title: '☁️ Cloud Native Platform',
    description: 'Cloud-native technology adoption and implementation',
    path: '/modernization/tech-stack/cloud-native-platform',
    category: 'tech-stack',
    icon: '☁️',
    endpoints: ['/api/v1/modernization/tech-stack/cloud-native-platform']
  },
  {
    id: 'infrastructure-as-code-hub',
    title: '📋 Infrastructure as Code Hub',
    description: 'IaC implementation and infrastructure automation',
    path: '/modernization/tech-stack/infrastructure-as-code-hub',
    category: 'tech-stack',
    icon: '📋',
    endpoints: ['/api/v1/modernization/tech-stack/infrastructure-as-code-hub']
  },
  {
    id: 'observability-platform',
    title: '👁️ Observability Platform',
    description: 'Modern observability and monitoring stack implementation',
    path: '/modernization/tech-stack/observability-platform',
    category: 'tech-stack',
    icon: '👁️',
    endpoints: ['/api/v1/modernization/tech-stack/observability-platform']
  },

  // Process Modernization (8 pages)
  {
    id: 'process-automation-center',
    title: '🤖 Process Automation Center',
    description: 'Business process automation and RPA implementation',
    path: '/modernization/process-modernization/process-automation-center',
    category: 'process-modernization',
    icon: '🤖',
    endpoints: ['/api/v1/modernization/process-modernization/process-automation-center']
  },
  {
    id: 'workflow-digitization-studio',
    title: '📄 Workflow Digitization Studio',
    description: 'Manual workflow digitization and optimization',
    path: '/modernization/process-modernization/workflow-digitization-studio',
    category: 'process-modernization',
    icon: '📄',
    endpoints: ['/api/v1/modernization/process-modernization/workflow-digitization-studio']
  },
  {
    id: 'intelligent-document-processor',
    title: '📝 Intelligent Document Processor',
    description: 'AI-powered document processing and automation',
    path: '/modernization/process-modernization/intelligent-document-processor',
    category: 'process-modernization',
    icon: '📝',
    endpoints: ['/api/v1/modernization/process-modernization/intelligent-document-processor']
  },
  {
    id: 'customer-journey-optimizer',
    title: '🛤️ Customer Journey Optimizer',
    description: 'Customer experience optimization and journey mapping',
    path: '/modernization/process-modernization/customer-journey-optimizer',
    category: 'process-modernization',
    icon: '🛤️',
    endpoints: ['/api/v1/modernization/process-modernization/customer-journey-optimizer']
  },
  {
    id: 'decision-automation-engine',
    title: '⚖️ Decision Automation Engine',
    description: 'Business decision automation and rules engine',
    path: '/modernization/process-modernization/decision-automation-engine',
    category: 'process-modernization',
    icon: '⚖️',
    endpoints: ['/api/v1/modernization/process-modernization/decision-automation-engine']
  },
  {
    id: 'agile-transformation-hub',
    title: '🏃 Agile Transformation Hub',
    description: 'Agile methodology adoption and team transformation',
    path: '/modernization/process-modernization/agile-transformation-hub',
    category: 'process-modernization',
    icon: '🏃',
    endpoints: ['/api/v1/modernization/process-modernization/agile-transformation-hub']
  },
  {
    id: 'digital-workplace-platform',
    title: '💼 Digital Workplace Platform',
    description: 'Modern digital workplace tools and collaboration',
    path: '/modernization/process-modernization/digital-workplace-platform',
    category: 'process-modernization',
    icon: '💼',
    endpoints: ['/api/v1/modernization/process-modernization/digital-workplace-platform']
  },
  {
    id: 'process-mining-analyzer',
    title: '⛏️ Process Mining Analyzer',
    description: 'Process discovery and optimization through data mining',
    path: '/modernization/process-modernization/process-mining-analyzer',
    category: 'process-modernization',
    icon: '⛏️',
    endpoints: ['/api/v1/modernization/process-modernization/process-mining-analyzer']
  },

  // Data Modernization (5 pages)
  {
    id: 'data-platform-modernizer',
    title: '🏢 Data Platform Modernizer',
    description: 'Modern data platform architecture and implementation',
    path: '/modernization/data-modernization/data-platform-modernizer',
    category: 'data-modernization',
    icon: '🏢',
    endpoints: ['/api/v1/modernization/data-modernization/data-platform-modernizer']
  },
  {
    id: 'analytics-transformation-center',
    title: '📊 Analytics Transformation Center',
    description: 'Advanced analytics and AI/ML platform deployment',
    path: '/modernization/data-modernization/analytics-transformation-center',
    category: 'data-modernization',
    icon: '📊',
    endpoints: ['/api/v1/modernization/data-modernization/analytics-transformation-center']
  },
  {
    id: 'realtime-data-pipeline',
    title: '⚡ Real-time Data Pipeline',
    description: 'Real-time data processing and streaming analytics',
    path: '/modernization/data-modernization/realtime-data-pipeline',
    category: 'data-modernization',
    icon: '⚡',
    endpoints: ['/api/v1/modernization/data-modernization/realtime-data-pipeline']
  },
  {
    id: 'data-governance-modernizer',
    title: '🛡️ Data Governance Modernizer',
    description: 'Modern data governance and compliance framework',
    path: '/modernization/data-modernization/data-governance-modernizer',
    category: 'data-modernization',
    icon: '🛡️',
    endpoints: ['/api/v1/modernization/data-modernization/data-governance-modernizer']
  },
  {
    id: 'self-service-analytics-platform',
    title: '🔧 Self-Service Analytics Platform',
    description: 'Self-service business intelligence and analytics tools',
    path: '/modernization/data-modernization/self-service-analytics-platform',
    category: 'data-modernization',
    icon: '🔧',
    endpoints: ['/api/v1/modernization/data-modernization/self-service-analytics-platform']
  }
];

/**
 * Navigation categories for the modernization platform
 */
export const modernizationCategories = {
  'digital-transformation': {
    name: 'Digital Transformation',
    description: 'Strategic digital transformation and organizational change management',
    icon: '🚀',
    count: 10,
    color: '#1976d2'
  },
  'cloud-migration': {
    name: 'Cloud Migration & Adoption',
    description: 'Cloud migration strategies, hybrid cloud management, and cloud-native architecture',
    icon: '☁️',
    count: 10,
    color: '#2196f3'
  },
  'legacy-modernization': {
    name: 'Legacy System Modernization',
    description: 'Legacy system assessment, application portfolio management, and modernization pathways',
    icon: '🔄',
    count: 8,
    color: '#ff9800'
  },
  'tech-stack': {
    name: 'Technology Stack Modernization',
    description: 'Modern technology adoption, microservices architecture, and DevOps transformation',
    icon: '⚙️',
    count: 8,
    color: '#4caf50'
  },
  'process-modernization': {
    name: 'Process & Workflow Modernization',
    description: 'Business process automation, workflow digitization, and intelligent document processing',
    icon: '🤖',
    count: 8,
    color: '#9c27b0'
  },
  'data-modernization': {
    name: 'Data & Analytics Modernization',
    description: 'Modern data platforms, real-time analytics, and self-service business intelligence',
    icon: '📊',
    count: 5,
    color: '#f44336'
  }
};

/**
 * Get pages by category
 */
export function getPagesByCategory(category: string): ModernizationPage[] {
  return modernizationNavigation.filter(page => page.category === category);
}

/**
 * Get page by ID
 */
export function getPageById(id: string): ModernizationPage | undefined {
  return modernizationNavigation.find(page => page.id === id);
}

/**
 * Get all categories with their page counts
 */
export function getCategorySummary() {
  const categories = Object.keys(modernizationCategories);
  return categories.map(key => ({
    key,
    ...modernizationCategories[key],
    pages: getPagesByCategory(key)
  }));
}

/**
 * Search pages by title or description
 */
export function searchPages(query: string): ModernizationPage[] {
  const lowercaseQuery = query.toLowerCase();
  return modernizationNavigation.filter(page =>
    page.title.toLowerCase().includes(lowercaseQuery) ||
    page.description.toLowerCase().includes(lowercaseQuery)
  );
}

export default {
  navigation: modernizationNavigation,
  categories: modernizationCategories,
  getPagesByCategory,
  getPageById,
  getCategorySummary,
  searchPages
};