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
