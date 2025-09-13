const express = require('express');
const cors = require('cors');

const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: 'http://localhost:4000', // Frontend URL
  credentials: true
}));

app.use(express.json());

// Mock data
const mockIOCs = [
  {
    id: '1',
    type: 'ip',
    value: '192.168.1.100',
    description: 'Suspicious IP address detected in network traffic',
    severity: 'high',
    tags: ['malware', 'network'],
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    type: 'domain',
    value: 'malicious-site.com',
    description: 'Known malicious domain hosting phishing content',
    severity: 'critical',
    tags: ['phishing', 'domain'],
    createdAt: '2024-01-14T15:45:00Z',
    updatedAt: '2024-01-14T15:45:00Z'
  },
  {
    id: '3',
    type: 'hash',
    value: 'a1b2c3d4e5f6789012345678901234567890abcd',
    description: 'Malware file hash detected',
    severity: 'medium',
    tags: ['malware', 'file'],
    createdAt: '2024-01-13T09:15:00Z',
    updatedAt: '2024-01-13T09:15:00Z'
  }
];

const mockIssues = [
  {
    id: '1',
    title: 'Suspicious Network Activity Detected',
    description: 'Multiple failed login attempts from external IP addresses',
    status: 'open',
    priority: 'high',
    assignedTo: 'security-team@company.com',
    createdBy: 'system',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
    tags: ['network', 'authentication']
  },
  {
    id: '2',
    title: 'Malware Detection Alert',
    description: 'Potential malware detected on endpoint devices',
    status: 'in-progress',
    priority: 'critical',
    assignedTo: 'incident-response@company.com',
    createdBy: 'antivirus-system',
    createdAt: '2024-01-14T14:30:00Z',
    updatedAt: '2024-01-15T09:15:00Z',
    tags: ['malware', 'endpoint']
  },
  {
    id: '3',
    title: 'Phishing Email Campaign',
    description: 'Users reporting suspicious emails with malicious attachments',
    status: 'resolved',
    priority: 'medium',
    assignedTo: 'email-security@company.com',
    createdBy: 'user-reports',
    createdAt: '2024-01-12T11:20:00Z',
    updatedAt: '2024-01-13T16:45:00Z',
    tags: ['phishing', 'email']
  }
];

const mockOrganizations = [
  {
    id: '1',
    name: 'Acme Corporation',
    description: 'Technology company specializing in cybersecurity solutions',
    type: 'enterprise',
    contactEmail: 'security@acme.com',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-10T12:00:00Z'
  },
  {
    id: '2',
    name: 'Global Security Partners',
    description: 'International security consulting firm',
    type: 'partner',
    contactEmail: 'info@globalsec.com',
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-12T15:30:00Z'
  },
  {
    id: '3',
    name: 'TechStart Inc',
    description: 'Startup company in the fintech sector',
    type: 'client',
    contactEmail: 'contact@techstart.com',
    createdAt: '2024-01-08T00:00:00Z',
    updatedAt: '2024-01-14T10:20:00Z'
  }
];

const mockMITRETechniques = [
  {
    id: '1',
    techniqueId: 'T1566.001',
    name: 'Spearphishing Attachment',
    description: 'Adversaries may send spearphishing emails with a malicious attachment',
    tactics: ['Initial Access'],
    platforms: ['Linux', 'macOS', 'Windows'],
    dataSource: ['Email Gateway', 'File Monitoring']
  },
  {
    id: '2',
    techniqueId: 'T1059.001',
    name: 'PowerShell',
    description: 'Adversaries may abuse PowerShell commands and scripts for execution',
    tactics: ['Execution'],
    platforms: ['Windows'],
    dataSource: ['PowerShell Logs', 'Process Monitoring']
  }
];

const mockMITRETactics = [
  {
    id: '1',
    tacticId: 'TA0001',
    name: 'Initial Access',
    description: 'The adversary is trying to get into your network',
    techniques: ['T1566.001', 'T1190', 'T1133']
  },
  {
    id: '2',
    tacticId: 'TA0002',
    name: 'Execution',
    description: 'The adversary is trying to run malicious code',
    techniques: ['T1059.001', 'T1059.003', 'T1053']
  }
];

const mockMITREGroups = [
  {
    id: '1',
    groupId: 'G0016',
    name: 'APT29',
    description: 'APT29 is threat group that has been attributed to Russia',
    aliases: ['Cozy Bear', 'The Dukes'],
    techniques: ['T1566.001', 'T1059.001']
  },
  {
    id: '2',
    groupId: 'G0007',
    name: 'APT28',
    description: 'APT28 is a threat group that has been attributed to Russia',
    aliases: ['Fancy Bear', 'Pawn Storm'],
    techniques: ['T1566.001', 'T1190']
  }
];

// API Info endpoint
app.get('/api/v1/', (req, res) => {
  res.json({
    message: 'Phantom Spire CTI Platform API',
    version: '1.0.0',
    status: 'active',
    endpoints: {
      auth: '/api/v1/auth',
      iocs: '/api/v1/iocs',
      mitre: '/api/v1/mitre',
      evidence: '/api/v1/evidence',
      issues: '/api/v1/issues',
      organizations: '/api/v1/organizations',
      tasks: '/api/v1/tasks',
      docs: '/api-docs',
      health: '/health',
    },
    features: {
      organizationManagement: true,
      taskManagement: true,
      evidenceManagement: true,
      threatIntelligence: true,
      issueTracking: true,
    },
  });
});

// IOC endpoints
app.get('/api/v1/iocs', (req, res) => {
  res.json(mockIOCs);
});

app.get('/api/v1/iocs/:id', (req, res) => {
  const ioc = mockIOCs.find(i => i.id === req.params.id);
  if (ioc) {
    res.json(ioc);
  } else {
    res.status(404).json({ error: 'IOC not found' });
  }
});

app.post('/api/v1/iocs', (req, res) => {
  const newIOC = {
    id: String(mockIOCs.length + 1),
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  mockIOCs.push(newIOC);
  res.status(201).json(newIOC);
});

// Issues endpoints
app.get('/api/v1/issues', (req, res) => {
  res.json(mockIssues);
});

app.get('/api/v1/issues/:id', (req, res) => {
  const issue = mockIssues.find(i => i.id === req.params.id);
  if (issue) {
    res.json(issue);
  } else {
    res.status(404).json({ error: 'Issue not found' });
  }
});

app.post('/api/v1/issues', (req, res) => {
  const newIssue = {
    id: String(mockIssues.length + 1),
    ...req.body,
    status: 'open',
    createdBy: 'user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  mockIssues.push(newIssue);
  res.status(201).json(newIssue);
});

// Organizations endpoints
app.get('/api/v1/organizations', (req, res) => {
  res.json(mockOrganizations);
});

app.get('/api/v1/organizations/:id', (req, res) => {
  const org = mockOrganizations.find(o => o.id === req.params.id);
  if (org) {
    res.json(org);
  } else {
    res.status(404).json({ error: 'Organization not found' });
  }
});

// MITRE endpoints
app.get('/api/v1/mitre/techniques', (req, res) => {
  res.json(mockMITRETechniques);
});

app.get('/api/v1/mitre/tactics', (req, res) => {
  res.json(mockMITRETactics);
});

app.get('/api/v1/mitre/groups', (req, res) => {
  res.json(mockMITREGroups);
});

// Mock Evidence data
const mockEvidence = [
  {
    id: '1',
    type: 'image/png',
    description: 'Screenshot of suspicious network activity',
    filePath: '/uploads/network-activity.png',
    metadata: {
      fileName: 'network-activity.png',
      fileSize: 245760,
      fileType: 'image/png'
    },
    createdAt: '2024-01-15T14:30:00Z',
    updatedAt: '2024-01-15T14:30:00Z'
  },
  {
    id: '2',
    type: 'application/pdf',
    description: 'Incident response report for malware detection',
    filePath: '/uploads/incident-report.pdf',
    metadata: {
      fileName: 'incident-report.pdf',
      fileSize: 1048576,
      fileType: 'application/pdf'
    },
    createdAt: '2024-01-14T09:15:00Z',
    updatedAt: '2024-01-14T09:15:00Z'
  },
  {
    id: '3',
    type: 'text/plain',
    description: 'Log file from compromised system',
    filePath: '/uploads/system.log',
    metadata: {
      fileName: 'system.log',
      fileSize: 524288,
      fileType: 'text/plain'
    },
    createdAt: '2024-01-13T16:45:00Z',
    updatedAt: '2024-01-13T16:45:00Z'
  }
];

// Mock Tasks data
const mockTasks = [
  {
    id: '1',
    title: 'IOC Enrichment Scan',
    description: 'Automated scan to enrich IOC data with threat intelligence feeds',
    status: 'running',
    priority: 'high',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    title: 'Vulnerability Assessment',
    description: 'Weekly vulnerability scan of network infrastructure',
    status: 'completed',
    priority: 'medium',
    createdAt: '2024-01-14T08:00:00Z',
    updatedAt: '2024-01-14T12:00:00Z'
  },
  {
    id: '3',
    title: 'Threat Hunt Analysis',
    description: 'Proactive threat hunting using MITRE ATT&CK framework',
    status: 'pending',
    priority: 'high',
    createdAt: '2024-01-15T15:00:00Z',
    updatedAt: '2024-01-15T15:00:00Z'
  },
  {
    id: '4',
    title: 'Log Analysis',
    description: 'Automated analysis of security logs for anomalies',
    status: 'failed',
    priority: 'low',
    createdAt: '2024-01-13T20:00:00Z',
    updatedAt: '2024-01-13T21:30:00Z'
  }
];

// Evidence endpoints
app.get('/api/v1/evidence', (req, res) => {
  res.json(mockEvidence);
});

app.get('/api/v1/evidence/:id', (req, res) => {
  const evidence = mockEvidence.find(e => e.id === req.params.id);
  if (evidence) {
    res.json(evidence);
  } else {
    res.status(404).json({ error: 'Evidence not found' });
  }
});

// Tasks endpoints
app.get('/api/v1/tasks', (req, res) => {
  res.json(mockTasks);
});

app.get('/api/v1/tasks/:id', (req, res) => {
  const task = mockTasks.find(t => t.id === req.params.id);
  if (task) {
    res.json(task);
  } else {
    res.status(404).json({ error: 'Task not found' });
  }
});

app.post('/api/v1/tasks', (req, res) => {
  const newTask = {
    id: String(mockTasks.length + 1),
    ...req.body,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  mockTasks.push(newTask);
  res.status(201).json(newTask);
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: 'development'
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Test API Server running on http://localhost:${PORT}`);
  console.log(`📊 API Info: http://localhost:${PORT}/api/v1/`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log(`🔍 IOCs: http://localhost:${PORT}/api/v1/iocs`);
  console.log(`🚨 Issues: http://localhost:${PORT}/api/v1/issues`);
  console.log(`🏢 Organizations: http://localhost:${PORT}/api/v1/organizations`);
  console.log(`🎯 MITRE: http://localhost:${PORT}/api/v1/mitre/techniques`);
});
