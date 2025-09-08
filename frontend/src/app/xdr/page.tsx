'use client';

import React from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Button,
  Chip,
  LinearProgress
} from '@mui/material';
import { 
  Security, 
  Visibility, 
  Assignment, 
  Assessment,
  Settings,
  Timeline,
  NetworkCheck,
  CloudSecurity,
  Shield
} from '@mui/icons-material';

const XDRDashboard = () => {
  const xdrModules = [
    // Core Detection & Response (1-10)
    { 
      id: 1, 
      name: 'Detection Engine', 
      description: 'Advanced threat detection and analysis', 
      icon: <Security />, 
      status: 'active',
      path: '/xdr/detection-engine'
    },
    { 
      id: 2, 
      name: 'Incident Response', 
      description: 'Automated incident response workflows', 
      icon: <Assignment />, 
      status: 'active',
      path: '/xdr/incident-response'
    },
    { 
      id: 3, 
      name: 'Threat Hunting', 
      description: 'Proactive threat hunting capabilities', 
      icon: <Visibility />, 
      status: 'active',
      path: '/xdr/threat-hunting'
    },
    { 
      id: 4, 
      name: 'Analytics Dashboard', 
      description: 'Real-time security analytics and metrics', 
      icon: <Assessment />, 
      status: 'active',
      path: '/xdr/analytics'
    },
    { 
      id: 5, 
      name: 'Configuration', 
      description: 'XDR system configuration and settings', 
      icon: <Settings />, 
      status: 'active',
      path: '/xdr/configuration'
    },
    { 
      id: 6, 
      name: 'Real-time Monitoring', 
      description: 'Live security event monitoring', 
      icon: <Timeline />, 
      status: 'active',
      path: '/xdr/monitoring'
    },
    { 
      id: 7, 
      name: 'Alert Management', 
      description: 'Centralized alert management system', 
      icon: <Security />, 
      status: 'active',
      path: '/xdr/alerts'
    },
    { 
      id: 8, 
      name: 'Asset Discovery', 
      description: 'Automated asset discovery and inventory', 
      icon: <NetworkCheck />, 
      status: 'active',
      path: '/xdr/assets'
    },
    { 
      id: 9, 
      name: 'Behavioral Analytics', 
      description: 'User and entity behavior analysis', 
      icon: <Assessment />, 
      status: 'active',
      path: '/xdr/behavior'
    },
    { 
      id: 10, 
      name: 'Compliance Monitoring', 
      description: 'Regulatory compliance tracking', 
      icon: <Shield />, 
      status: 'active',
      path: '/xdr/compliance'
    },
    
    // Extended Security (11-25)
    { id: 11, name: 'Data Loss Prevention', description: 'Prevent sensitive data exfiltration', icon: <Security />, status: 'active', path: '/xdr/dlp' },
    { id: 12, name: 'Email Security', description: 'Advanced email threat protection', icon: <Security />, status: 'active', path: '/xdr/email-security' },
    { id: 13, name: 'Endpoint Protection', description: 'Comprehensive endpoint security', icon: <Security />, status: 'active', path: '/xdr/endpoints' },
    { id: 14, name: 'Forensic Analysis', description: 'Digital forensics and investigation', icon: <Visibility />, status: 'active', path: '/xdr/forensics' },
    { id: 15, name: 'Identity Protection', description: 'Identity and access security', icon: <Security />, status: 'active', path: '/xdr/identity' },
    { id: 16, name: 'ML Detection', description: 'Machine learning threat detection', icon: <Assessment />, status: 'active', path: '/xdr/ml-detection' },
    { id: 17, name: 'Network Security', description: 'Network threat protection', icon: <NetworkCheck />, status: 'active', path: '/xdr/network' },
    { id: 18, name: 'Orchestration Engine', description: 'Security orchestration platform', icon: <Settings />, status: 'active', path: '/xdr/orchestration' },
    { id: 19, name: 'Patch Management', description: 'Automated patch deployment', icon: <Settings />, status: 'active', path: '/xdr/patches' },
    { id: 20, name: 'Quarantine Management', description: 'Threat containment system', icon: <Security />, status: 'active', path: '/xdr/quarantine' },
    { id: 21, name: 'Risk Assessment', description: 'Comprehensive risk analysis', icon: <Assessment />, status: 'active', path: '/xdr/risk' },
    { id: 22, name: 'Sandbox Analysis', description: 'Malware analysis sandbox', icon: <Visibility />, status: 'active', path: '/xdr/sandbox' },
    { id: 23, name: 'Threat Intelligence', description: 'Global threat intelligence feeds', icon: <Visibility />, status: 'active', path: '/xdr/threat-intel' },
    { id: 24, name: 'User Behavior Analytics', description: 'Advanced user behavior monitoring', icon: <Assessment />, status: 'active', path: '/xdr/uba' },
    { id: 25, name: 'Vulnerability Management', description: 'Vulnerability assessment and management', icon: <Security />, status: 'active', path: '/xdr/vulnerabilities' },
    
    // Advanced Operations (26-49)
    { id: 26, name: 'Workflow Automation', description: 'Automated security workflows', icon: <Settings />, status: 'active', path: '/xdr/workflow' },
    { id: 27, name: 'Zero Trust Enforcement', description: 'Zero trust security model', icon: <Shield />, status: 'active', path: '/xdr/zero-trust' },
    { id: 28, name: 'API Security', description: 'API threat protection', icon: <NetworkCheck />, status: 'active', path: '/xdr/api-security' },
    { id: 29, name: 'Backup Security', description: 'Backup integrity monitoring', icon: <Security />, status: 'active', path: '/xdr/backup-security' },
    { id: 30, name: 'Cloud Security', description: 'Multi-cloud security posture', icon: <CloudSecurity />, status: 'active', path: '/xdr/cloud-security' },
    { id: 31, name: 'Device Control', description: 'Device access management', icon: <Security />, status: 'active', path: '/xdr/device-control' },
    { id: 32, name: 'Export/Import', description: 'Data export and import tools', icon: <Settings />, status: 'active', path: '/xdr/export-import' },
    { id: 33, name: 'File Integrity', description: 'File integrity monitoring', icon: <Security />, status: 'active', path: '/xdr/file-integrity' },
    { id: 34, name: 'Geo-Location', description: 'Geographic threat tracking', icon: <Visibility />, status: 'active', path: '/xdr/geo-location' },
    { id: 35, name: 'Honeypot', description: 'Deception technology platform', icon: <Security />, status: 'active', path: '/xdr/honeypot' },
    { id: 36, name: 'Incident Timeline', description: 'Incident timeline visualization', icon: <Timeline />, status: 'active', path: '/xdr/timeline' },
    { id: 37, name: 'JIRA Integration', description: 'Ticketing system integration', icon: <Assignment />, status: 'active', path: '/xdr/jira' },
    { id: 38, name: 'Knowledge Base', description: 'Security knowledge management', icon: <Assessment />, status: 'active', path: '/xdr/knowledge' },
    { id: 39, name: 'Log Analysis', description: 'Advanced log analytics', icon: <Visibility />, status: 'active', path: '/xdr/logs' },
    { id: 40, name: 'Mobile Security', description: 'Mobile device protection', icon: <Security />, status: 'active', path: '/xdr/mobile' },
    { id: 41, name: 'Notification Center', description: 'Alert notification system', icon: <Assignment />, status: 'active', path: '/xdr/notifications' },
    { id: 42, name: 'Offline Analysis', description: 'Offline threat analysis', icon: <Visibility />, status: 'active', path: '/xdr/offline' },
    { id: 43, name: 'Policy Management', description: 'Security policy framework', icon: <Settings />, status: 'active', path: '/xdr/policies' },
    { id: 44, name: 'Query Builder', description: 'Advanced query interface', icon: <Assessment />, status: 'active', path: '/xdr/query' },
    { id: 45, name: 'Report Generator', description: 'Automated report generation', icon: <Assessment />, status: 'active', path: '/xdr/reports' },
    { id: 46, name: 'Scheduler', description: 'Task scheduling system', icon: <Settings />, status: 'active', path: '/xdr/scheduler' },
    { id: 47, name: 'Threat Feed', description: 'Threat intelligence feeds', icon: <Visibility />, status: 'active', path: '/xdr/feeds' },
    { id: 48, name: 'User Management', description: 'XDR user administration', icon: <Settings />, status: 'active', path: '/xdr/users' },
    { id: 49, name: 'Visualization', description: 'Security data visualization', icon: <Assessment />, status: 'active', path: '/xdr/visualization' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        XDR (Extended Detection and Response) Platform
      </Typography>
      
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Comprehensive security platform with 49 integrated modules for enterprise threat detection and response
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>Platform Status</Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Chip label={`${xdrModules.length} Total Modules`} color="primary" />
          <Chip label={`${xdrModules.filter(m => m.status === 'active').length} Active`} color="success" />
          <Chip label="All Systems Operational" color="success" />
        </Box>
        <LinearProgress variant="determinate" value={100} color="success" />
      </Box>

      <Grid container spacing={3}>
        {xdrModules.map((module) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={module.id}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ mr: 2, color: 'primary.main' }}>
                    {module.icon}
                  </Box>
                  <Chip 
                    label={module.status} 
                    size="small" 
                    color={getStatusColor(module.status) as any}
                  />
                </Box>
                <Typography variant="h6" component="h2" gutterBottom>
                  {module.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {module.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  variant="contained"
                  onClick={() => window.location.href = module.path}
                  fullWidth
                >
                  Access Module
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          XDR Platform Overview
        </Typography>
        <Typography variant="body2" color="text.secondary">
          The Extended Detection and Response (XDR) platform provides comprehensive security coverage across 
          endpoints, networks, cloud environments, and applications. With 49 integrated modules, it delivers 
          unified threat detection, investigation, and automated response capabilities for enterprise security operations.
        </Typography>
      </Box>
    </Box>
  );
};

export default XDRDashboard;