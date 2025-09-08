import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security middleware - disable CSP for frontend pages
app.use((req, res, next) => {
  if (req.path.startsWith('/frontend')) {
    // Disable CSP for frontend pages
    helmet({
      contentSecurityPolicy: false
    })(req, res, next);
  } else {
    // Use normal CSP for other pages
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com", "https://fonts.googleapis.com"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"]
        }
      }
    })(req, res, next);
  }
});
app.use(cors());

// Body parsing middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from setup directory (in src, not dist)
const srcDir = path.join(__dirname, '..', 'src');
app.use('/setup/static', express.static(path.join(srcDir, 'setup/static')));

// Setup page route
app.get('/setup', (_req, res) => {
  res.sendFile(path.join(srcDir, 'setup/static/index.html'));
});

// Dashboard page route
app.get('/dashboard', (_req, res) => {
  res.sendFile(path.join(srcDir, 'setup/static/dashboard.html'));
});

// Frontend React application route
app.get('/frontend', (_req, res) => {
  res.sendFile(path.join(srcDir, 'setup/static/frontend.html'));
});

// Views demo route
app.get('/views', (_req, res) => {
  res.sendFile(path.join(srcDir, 'setup/static/views-demo.html'));
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// In-memory data stores for demo purposes
let iocs: any[] = [
  { id: '1', type: 'ip', value: '192.168.1.100', severity: 'high', description: 'Suspicious IP address' },
  { id: '2', type: 'domain', value: 'malicious.example.com', severity: 'critical', description: 'Known malware C&C domain' },
];

let issues: any[] = [
  { id: '1', title: 'Security breach detected', severity: 'high', status: 'open', description: 'Potential data exfiltration attempt' },
  { id: '2', title: 'Malware alert', severity: 'medium', status: 'investigating', description: 'Suspicious file detected on endpoint' },
];

let organizations: any[] = [
  { id: '1', name: 'ACME Corp', code: 'ACME', domain: 'acme.com', industry: 'technology' },
  { id: '2', name: 'Beta Industries', code: 'BETA', domain: 'beta.com', industry: 'manufacturing' },
];

// CVE and Vulnerability Management Demo Data
let cveData: any[] = [
  {
    id: 'CVE-2024-0001',
    title: 'Remote Code Execution in Web Framework',
    description: 'A critical vulnerability allows remote code execution',
    severity: 'critical',
    cvssScore: 9.8,
    publishedDate: '2024-01-15T00:00:00Z',
    affectedProducts: [
      { vendor: 'WebFramework Inc', product: 'WebFW', versions: ['1.0', '1.1', '1.2'] }
    ],
    status: 'open'
  },
  {
    id: 'CVE-2024-0002',
    title: 'SQL Injection in Database Component',
    description: 'SQL injection vulnerability in custom database interface',
    severity: 'high',
    cvssScore: 8.8,
    publishedDate: '2024-01-14T00:00:00Z',
    affectedProducts: [
      { vendor: 'DataCorp', product: 'CustomDB', versions: ['2.0', '2.1'] }
    ],
    status: 'patched'
  }
];

let assetData: any[] = [
  {
    id: 'AST-001',
    name: 'Web Server Cluster',
    type: 'server',
    category: 'infrastructure',
    criticality: 'high',
    owner: 'IT Operations',
    location: 'Data Center A',
    ip: '10.0.1.100',
    os: 'Ubuntu 20.04 LTS',
    lastScan: '2024-01-15T10:30:00Z',
    vulnerabilityCount: 12,
    riskScore: 85,
    status: 'active',
    tags: ['production', 'web', 'customer-facing']
  },
  {
    id: 'AST-002',
    name: 'Database Primary',
    type: 'database',
    category: 'data',
    criticality: 'critical',
    owner: 'Database Team',
    location: 'Data Center A',
    ip: '10.0.2.50',
    os: 'RHEL 8.5',
    lastScan: '2024-01-15T09:45:00Z',
    vulnerabilityCount: 3,
    riskScore: 45,
    status: 'active',
    tags: ['production', 'database', 'pci-scope']
  }
];

// Vulnerability Management Mock Data
const vulnerabilityManagementData = {
  assets: {
    inventory: {
      assets: assetData,
      pagination: { page: 1, limit: 50, total: 247, pages: 5 },
      summary: {
        totalAssets: 247,
        criticalAssets: 45,
        highRiskAssets: 67,
        vulnerableAssets: 123,
        lastUpdate: '2024-01-15T11:00:00Z'
      }
    },
    assessment: {
      assetId: 'AST-001',
      lastAssessment: '2024-01-15T10:30:00Z',
      nextScheduled: '2024-01-22T10:30:00Z',
      vulnerabilities: cveData,
      riskMetrics: {
        totalVulnerabilities: 12,
        critical: 2,
        high: 4,
        medium: 5,
        low: 1,
        averageCvss: 6.4,
        riskTrend: 'improving'
      }
    }
  },
  threatIntelligence: {
    feeds: {
      feeds: [
        {
          id: 'FEED-001',
          name: 'CISA Known Exploited Vulnerabilities',
          provider: 'CISA',
          status: 'active',
          lastUpdate: '2024-01-15T10:00:00Z',
          recordsProcessed: 1247
        }
      ]
    }
  },
  compliance: {
    dashboard: {
      overview: {
        overallScore: 87.5,
        totalControls: 1247,
        compliantControls: 1089,
        nonCompliantControls: 158
      }
    }
  },
  analytics: {
    securityMetrics: {
      vulnerabilityMetrics: {
        totalVulnerabilities: 1247,
        openVulnerabilities: 234,
        criticalOpen: 15,
        highOpen: 45,
        meanTimeToRemediation: '4.2 days'
      },
      remediationMetrics: {
        patchSuccessRate: 94.7,
        averagePatchTime: '3.2 hours'
      },
      complianceMetrics: {
        overallCompliance: 87.5
      }
    }
  }
};

const mitreData = {
  techniques: [
    { id: 'T1003', name: 'OS Credential Dumping', description: 'Adversaries may attempt to dump credentials' },
    { id: 'T1071', name: 'Application Layer Protocol', description: 'Adversaries may communicate using application layer protocols' },
  ],
  tactics: [
    { id: 'TA0006', name: 'Credential Access', description: 'The adversary is trying to steal account names and passwords' },
    { id: 'TA0011', name: 'Command and Control', description: 'The adversary is trying to communicate with compromised systems' },
  ],
  groups: [
    { id: 'G0016', name: 'APT29', description: 'APT29 is threat group that has been attributed to Russias Foreign Intelligence Service' },
    { id: 'G0007', name: 'APT1', description: 'APT1 is a Chinese threat group that has been attributed to the 2nd Bureau of the PLAs General Staff Department 3rd Department' },
  ]
};

// API v1 Routes
app.get('/api/v1/', (_req, res) => {
  res.status(200).json({
    name: 'Phantom Spire CTI Platform API',
    version: '1.0.0',
    description: 'Enterprise-grade Cyber Threat Intelligence Platform API',
    status: 'operational',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      iocs: '/api/v1/iocs',
      issues: '/api/v1/issues',
      organizations: '/api/v1/organizations',
      mitre: '/api/v1/mitre',
      vulnerabilityManagement: '/api/v1/vulnerability-management',
    },
    features: {
      crud_operations: true,
      real_time_updates: true,
      mitre_integration: true,
      threat_intelligence: true,
    },
  });
});

// IOC endpoints
app.get('/api/v1/iocs', (_req, res) => {
  res.json({ data: iocs });
});

app.get('/api/v1/iocs/:id', (req, res) => {
  const ioc = iocs.find(i => i.id === req.params.id);
  if (!ioc) {
    return res.status(404).json({ error: 'IOC not found' });
  }
  res.json({ data: ioc });
});

app.post('/api/v1/iocs', (req, res) => {
  const newIOC = {
    id: String(Date.now()),
    ...req.body,
    createdAt: new Date().toISOString(),
  };
  iocs.push(newIOC);
  res.status(201).json({ data: newIOC, message: 'IOC created successfully' });
});

app.delete('/api/v1/iocs/:id', (req, res) => {
  const index = iocs.findIndex(i => i.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'IOC not found' });
  }
  iocs.splice(index, 1);
  res.json({ message: 'IOC deleted successfully' });
});

// Issues endpoints
app.get('/api/v1/issues', (_req, res) => {
  res.json({ data: issues });
});

app.get('/api/v1/issues/:id', (req, res) => {
  const issue = issues.find(i => i.id === req.params.id);
  if (!issue) {
    return res.status(404).json({ error: 'Issue not found' });
  }
  res.json({ data: issue });
});

app.post('/api/v1/issues', (req, res) => {
  const newIssue = {
    id: String(Date.now()),
    ...req.body,
    createdAt: new Date().toISOString(),
    status: req.body.status || 'open',
  };
  issues.push(newIssue);
  res.status(201).json({ data: newIssue, message: 'Issue created successfully' });
});

// Organizations endpoints
app.get('/api/v1/organizations', (_req, res) => {
  res.json({ data: organizations });
});

app.get('/api/v1/organizations/:id', (req, res) => {
  const org = organizations.find(o => o.id === req.params.id);
  if (!org) {
    return res.status(404).json({ error: 'Organization not found' });
  }
  res.json({ data: org });
});

// MITRE endpoints
app.get('/api/v1/mitre/techniques', (_req, res) => {
  res.json({ data: mitreData.techniques });
});

app.get('/api/v1/mitre/tactics', (_req, res) => {
  res.json({ data: mitreData.tactics });
});

app.get('/api/v1/mitre/groups', (_req, res) => {
  res.json({ data: mitreData.groups });
});

// Evidence endpoints
app.get('/api/v1/evidence', (_req, res) => {
  res.json({ data: [] });
});

// Tasks endpoints
app.get('/api/v1/tasks', (_req, res) => {
  res.json({ data: [] });
});

// Vulnerability Management API endpoints
app.get('/api/v1/vulnerability-management/assets/inventory', (_req, res) => {
  res.json(vulnerabilityManagementData.assets.inventory);
});

app.get('/api/v1/vulnerability-management/assets/assessment/:assetId', (req, res) => {
  const assessment = { ...vulnerabilityManagementData.assets.assessment, assetId: req.params.assetId };
  res.json(assessment);
});

app.get('/api/v1/vulnerability-management/assets/groups', (_req, res) => {
  res.json({
    groups: [
      {
        id: 'GRP-001',
        name: 'Production Web Servers',
        description: 'All customer-facing web servers',
        assetCount: 15,
        highestRisk: 'critical',
        averageRiskScore: 72
      }
    ],
    summary: { totalGroups: 12, totalAssets: 247, ungroupedAssets: 23 }
  });
});

app.get('/api/v1/vulnerability-management/assets/risk-profiles', (_req, res) => {
  res.json({
    profiles: [
      {
        assetId: 'AST-001',
        riskScore: 85,
        riskLevel: 'high',
        factors: {
          vulnerabilityCount: 12,
          criticalVulnerabilities: 2,
          exploitability: 'high'
        }
      }
    ],
    riskDistribution: { critical: 15, high: 45, medium: 120, low: 67 }
  });
});

app.get('/api/v1/vulnerability-management/assets/compliance-status', (_req, res) => {
  res.json({
    overview: {
      totalAssets: 247,
      compliantAssets: 189,
      nonCompliantAssets: 45,
      complianceRate: 76.5
    },
    frameworks: {
      pci: { applicable: 78, compliant: 65, rate: 83.3 },
      sox: { applicable: 156, compliant: 145, rate: 92.9 }
    }
  });
});

app.get('/api/v1/vulnerability-management/assets/patch-status', (_req, res) => {
  res.json({
    summary: {
      totalAssets: 247,
      upToDate: 156,
      needsPatching: 67,
      patchingInProgress: 12,
      failed: 12
    },
    recentPatches: [
      {
        assetId: 'AST-001',
        patchId: 'KB-2024-001',
        title: 'Security Update for Web Framework',
        status: 'completed'
      }
    ]
  });
});

app.get('/api/v1/vulnerability-management/assets/security-baselines', (_req, res) => {
  res.json({
    baselines: [
      {
        id: 'BL-001',
        name: 'CIS Ubuntu 20.04 Baseline',
        version: '1.1.0',
        controls: 234,
        applicableAssets: 89,
        complianceRate: 87.5
      }
    ]
  });
});

app.get('/api/v1/vulnerability-management/assets/lifecycle', (_req, res) => {
  res.json({
    phases: {
      planning: 12,
      deployment: 15,
      operational: 189,
      retirement: 23
    },
    endOfLife: [
      {
        assetId: 'AST-045',
        name: 'Legacy Database Server',
        eolDate: '2024-06-30T00:00:00Z',
        daysRemaining: 167
      }
    ]
  });
});

// Threat Intelligence endpoints
app.get('/api/v1/vulnerability-management/threat-intelligence/feeds', (_req, res) => {
  res.json(vulnerabilityManagementData.threatIntelligence.feeds);
});

app.get('/api/v1/vulnerability-management/threat-intelligence/iocs', (_req, res) => {
  res.json({
    indicators: [
      {
        id: 'IOC-001',
        type: 'domain',
        value: 'malicious-domain.evil',
        confidence: 'high',
        severity: 'critical',
        source: 'commercial-threat-feed'
      }
    ],
    summary: { totalIOCs: 1567, activeIOCs: 234, highConfidence: 89 }
  });
});

app.get('/api/v1/vulnerability-management/threat-intelligence/actors', (_req, res) => {
  res.json({
    actors: [
      {
        id: 'ACTOR-001',
        name: 'APT28',
        aliases: ['Fancy Bear', 'Sofacy Group'],
        country: 'Russia',
        motivation: 'espionage',
        sophistication: 'high'
      }
    ],
    statistics: { totalActors: 156, activeActors: 23 }
  });
});

app.get('/api/v1/vulnerability-management/threat-intelligence/campaigns', (_req, res) => {
  res.json({
    campaigns: [
      {
        id: 'CAMP-001',
        name: 'Operation Cloud Hopper',
        actor: 'APT10',
        status: 'active',
        targetedAssets: 45
      }
    ],
    trends: { activeCampaigns: 8, newCampaigns: 2 }
  });
});

app.get('/api/v1/vulnerability-management/threat-intelligence/hunting', (_req, res) => {
  res.json({
    hunts: [
      {
        id: 'HUNT-001',
        name: 'CVE-2024-0001 Exploitation Hunt',
        status: 'completed',
        hunter: 'SOC Analyst 1',
        confidence: 'medium'
      }
    ],
    metrics: { totalHunts: 45, activeHunts: 3, completedHunts: 42 }
  });
});

app.get('/api/v1/vulnerability-management/threat-intelligence/early-warning', (_req, res) => {
  res.json({
    alerts: [
      {
        id: 'WARN-001',
        type: 'vulnerability_intelligence',
        severity: 'critical',
        title: 'New Zero-Day Exploitation Detected',
        status: 'active'
      }
    ],
    dashboard: { activeAlerts: 5, criticalAlerts: 2, highAlerts: 3 }
  });
});

// Compliance endpoints
app.get('/api/v1/vulnerability-management/compliance/dashboard', (_req, res) => {
  res.json(vulnerabilityManagementData.compliance.dashboard);
});

app.get('/api/v1/vulnerability-management/compliance/framework-mapping', (_req, res) => {
  res.json({
    frameworks: [
      {
        id: 'FW-001',
        name: 'NIST Cybersecurity Framework',
        version: '1.1',
        mappedVulnerabilities: 234,
        coverage: 89.5
      }
    ]
  });
});

app.get('/api/v1/vulnerability-management/compliance/control-assessments', (_req, res) => {
  res.json({
    assessments: [
      {
        id: 'ASSESS-001',
        controlId: 'PR.AC-1',
        framework: 'NIST CSF',
        status: 'compliant',
        assessmentDate: '2024-01-10T14:00:00Z'
      }
    ],
    summary: { totalAssessments: 234, compliant: 189, nonCompliant: 45 }
  });
});

app.get('/api/v1/vulnerability-management/compliance/audit-trails', (_req, res) => {
  res.json({
    auditEvents: [
      {
        id: 'AUDIT-001',
        timestamp: '2024-01-15T10:30:00Z',
        user: 'admin@company.com',
        action: 'vulnerability_status_update',
        resource: 'CVE-2024-0001'
      }
    ]
  });
});

app.get('/api/v1/vulnerability-management/compliance/regulatory-reports', (_req, res) => {
  res.json({
    reports: [
      {
        id: 'RPT-001',
        title: 'SOX Quarterly Compliance Report Q1 2024',
        framework: 'SOX',
        status: 'completed',
        generatedDate: '2024-01-15T16:00:00Z'
      }
    ]
  });
});

app.get('/api/v1/vulnerability-management/compliance/policy-management', (_req, res) => {
  res.json({
    policies: [
      {
        id: 'POL-001',
        title: 'Vulnerability Management Policy',
        version: '2.1',
        status: 'active',
        owner: 'CISO'
      }
    ],
    governance: { totalPolicies: 15, activePolicies: 12 }
  });
});

// Remediation endpoints
app.get('/api/v1/vulnerability-management/remediation/patch-planning', (_req, res) => {
  res.json({
    plannedPatches: [
      {
        id: 'PATCH-001',
        title: 'Critical Security Update for Web Framework',
        severity: 'critical',
        affectedAssets: 15,
        plannedDate: '2024-01-20T02:00:00Z'
      }
    ],
    schedule: { thisWeek: 3, nextWeek: 5, criticalPending: 2 }
  });
});

app.get('/api/v1/vulnerability-management/remediation/patch-testing', (_req, res) => {
  res.json({
    testSuites: [
      {
        id: 'TEST-001',
        patchId: 'PATCH-001',
        environment: 'staging',
        status: 'completed',
        recommendation: 'approved_for_production'
      }
    ]
  });
});

app.get('/api/v1/vulnerability-management/remediation/patch-deployment', (_req, res) => {
  res.json({
    deployments: [
      {
        id: 'DEPLOY-001',
        patchId: 'PATCH-001',
        status: 'in_progress',
        progress: 65,
        affectedAssets: 15
      }
    ],
    metrics: { successRate: 94.7, averageDeploymentTime: '3.2 hours' }
  });
});

app.get('/api/v1/vulnerability-management/remediation/rollback-management', (_req, res) => {
  res.json({
    rollbacks: [
      {
        id: 'ROLLBACK-001',
        reason: 'Application compatibility issue',
        status: 'completed',
        affectedAssets: 8
      }
    ],
    statistics: { totalRollbacks: 12, successRate: 95.8 }
  });
});

app.get('/api/v1/vulnerability-management/remediation/emergency-response', (_req, res) => {
  res.json({
    emergencyPatches: [
      {
        id: 'EMRG-001',
        cveId: 'CVE-2024-0001',
        severity: 'critical',
        threat: 'active_exploitation',
        status: 'in_progress'
      }
    ],
    metrics: { averageResponseTime: '2.5 hours', mitigationSuccess: 96.7 }
  });
});

app.get('/api/v1/vulnerability-management/remediation/maintenance-windows', (_req, res) => {
  res.json({
    windows: [
      {
        id: 'MW-001',
        name: 'Monthly Production Maintenance',
        type: 'scheduled',
        startTime: '2024-01-20T02:00:00Z',
        endTime: '2024-01-20T06:00:00Z'
      }
    ],
    calendar: { thisMonth: 4, nextMonth: 3, emergency: 1 }
  });
});

// Analytics endpoints
app.get('/api/v1/vulnerability-management/analytics/security-metrics', (_req, res) => {
  res.json(vulnerabilityManagementData.analytics.securityMetrics);
});

app.get('/api/v1/vulnerability-management/analytics/trend-analysis', (_req, res) => {
  res.json({
    vulnerabilityTrends: {
      monthly: [
        { month: '2024-01', discovered: 89, remediated: 67, open: 22 },
        { month: '2023-12', discovered: 76, remediated: 72, open: 4 }
      ],
      categories: {
        'web-application': { trend: 'increasing', change: 12.5 },
        'operating-system': { trend: 'stable', change: -2.1 }
      }
    }
  });
});

app.get('/api/v1/vulnerability-management/analytics/performance-kpis', (_req, res) => {
  res.json({
    operationalKPIs: {
      meanTimeToDetection: { current: '2.3 hours', target: '2 hours', trend: 'improving' },
      meanTimeToRemediation: { current: '4.2 days', target: '3 days', trend: 'improving' }
    },
    securityKPIs: {
      riskScore: { current: 72.5, target: 70, trend: 'improving' }
    }
  });
});

app.get('/api/v1/vulnerability-management/analytics/executive-dashboard', (_req, res) => {
  res.json({
    summary: {
      securityPosture: 'Good',
      riskLevel: 'Medium',
      complianceStatus: 'Compliant',
      emergencyActions: 2
    },
    keyMetrics: {
      vulnerabilityReduction: { value: '15.3%', trend: 'positive' },
      meanTimeToRemediation: { value: '4.2 days', trend: 'improving' }
    }
  });
});

app.get('/api/v1/vulnerability-management/analytics/risk-heatmaps', (_req, res) => {
  res.json({
    assetRiskHeatmap: {
      dimensions: { x: 'Asset Criticality', y: 'Vulnerability Severity' },
      data: [
        { x: 'Critical', y: 'Critical', value: 15, risk: 'extreme' },
        { x: 'High', y: 'High', value: 34, risk: 'medium' }
      ]
    }
  });
});

app.get('/api/v1/vulnerability-management/analytics/predictive-analytics', (_req, res) => {
  res.json({
    vulnerabilityPredictions: {
      nextMonth: { expectedVulnerabilities: 95, confidence: 0.87 },
      nextQuarter: { expectedVulnerabilities: 285, confidence: 0.72 }
    },
    riskForecasting: {
      breachProbability: { next30Days: 0.03, next90Days: 0.08 }
    }
  });
});

// Root endpoint - main entry point
app.get('/', (_req, res) => {
  res.status(200).json({
    name: 'Phantom Spire CTI Platform',
    version: '1.0.0',
    description: 'Enterprise-grade Cyber Threat Intelligence Platform',
    status: 'operational',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      setup: '/setup',
      dashboard: '/dashboard',
      api: '/api/v1',
      vulnerabilityManagement: '/api/v1/vulnerability-management',
    },
    ui: {
      setup: 'http://localhost:3000/setup',
      dashboard: 'http://localhost:3000/dashboard',
    },
    features: {
      crud_operations: true,
      real_time_updates: true,
      mitre_integration: true,
      threat_intelligence: true,
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The requested route ${req.originalUrl} was not found on this server.`,
  });
});

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Phantom Spire CTI Platform started on port ${PORT}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log(`🌐 Main Entry Point: http://localhost:${PORT}/`);
  console.log(`⚙️ Setup Interface: http://localhost:${PORT}/setup`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
});

// Handle server errors
server.on('error', (error: any) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
  } else {
    console.error('Server error:', error);
  }
  process.exit(1);
});

export { app };
