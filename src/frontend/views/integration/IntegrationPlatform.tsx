/**
 * Integration Platform
 * External system integrations and API connectors
 */

import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  LinearProgress,
  Alert
} from '@mui/material';
import { 
  Extension, 
  Api, 
  CloudSync, 
  CheckCircle, 
  Error, 
  Settings,
  Security,
  Storage,
  Webhook
} from '@mui/icons-material';
import { addUIUXEvaluation } from '../../services/ui-ux-evaluation/hooks/useUIUXEvaluation';

export const IntegrationPlatform: React.FC = () => {
  useEffect(() => {
    const evaluationController = addUIUXEvaluation('integration-platform', {
      continuous: true,
      position: 'bottom-left',
      minimized: true,
      interval: 180000
    });

    return () => evaluationController.remove();
  }, []);

  const integrations = [
    { 
      id: 'splunk', 
      name: 'Splunk SIEM', 
      type: 'SIEM', 
      status: 'connected', 
      lastSync: '5 minutes ago',
      description: 'Log analysis and security monitoring'
    },
    { 
      id: 'misp', 
      name: 'MISP Platform', 
      type: 'Threat Intelligence', 
      status: 'connected', 
      lastSync: '10 minutes ago',
      description: 'Malware Information Sharing Platform'
    },
    { 
      id: 'virustotal', 
      name: 'VirusTotal', 
      type: 'Malware Analysis', 
      status: 'connected', 
      lastSync: '2 minutes ago',
      description: 'File and URL analysis service'
    },
    { 
      id: 'slack', 
      name: 'Slack Notifications', 
      type: 'Communication', 
      status: 'error', 
      lastSync: '1 hour ago',
      description: 'Team communication and alerting'
    }
  ];

  const apiConnectors = [
    { name: 'REST API', endpoints: 45, status: 'healthy' },
    { name: 'GraphQL API', endpoints: 12, status: 'healthy' },
    { name: 'Webhook Endpoints', endpoints: 8, status: 'degraded' },
    { name: 'STIX/TAXII', endpoints: 3, status: 'healthy' }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        🔌 Integration Platform
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Manage external integrations, APIs, and data connectors for the threat intelligence platform.
      </Typography>
      
      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Notice:</strong> Slack integration experiencing connectivity issues. Admin intervention required.
        </Typography>
      </Alert>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Active Integrations
              </Typography>
              <Button variant="contained" startIcon={<Extension />}>
                Add Integration
              </Button>
            </Box>
            
            <List>
              {integrations.map((integration) => (
                <ListItem key={integration.id} divider>
                  <ListItemIcon>
                    {integration.type === 'SIEM' && <Security />}
                    {integration.type === 'Threat Intelligence' && <Extension />}
                    {integration.type === 'Malware Analysis' && <Storage />}
                    {integration.type === 'Communication' && <Api />}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1">{integration.name}</Typography>
                        <Chip size="small" label={integration.type} variant="outlined" />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          {integration.description}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Last sync: {integration.lastSync}
                        </Typography>
                      </Box>
                    }
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {integration.status === 'connected' ? (
                      <CheckCircle color="success" />
                    ) : (
                      <Error color="error" />
                    )}
                    <Chip
                      size="small"
                      label={integration.status}
                      color={integration.status === 'connected' ? 'success' : 'error'}
                    />
                    <Switch checked={integration.status === 'connected'} />
                  </Box>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              API Health Status
            </Typography>
            
            {apiConnectors.map((connector) => (
              <Box key={connector.name} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2">{connector.name}</Typography>
                  <Chip
                    size="small"
                    label={connector.status}
                    color={
                      connector.status === 'healthy' ? 'success' :
                      connector.status === 'degraded' ? 'warning' : 'error'
                    }
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" color="textSecondary">
                    {connector.endpoints} endpoints
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {connector.status === 'healthy' ? '99.9%' : '85.2%'} uptime
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={connector.status === 'healthy' ? 100 : 85}
                  color={connector.status === 'healthy' ? 'success' : 'warning'}
                  sx={{ height: 4, borderRadius: 2 }}
                />
              </Box>
            ))}
          </Paper>
          
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button variant="outlined" startIcon={<Settings />} size="small">
                  Configure APIs
                </Button>
                <Button variant="outlined" startIcon={<Webhook />} size="small">
                  Manage Webhooks
                </Button>
                <Button variant="outlined" startIcon={<CloudSync />} size="small">
                  Sync All Feeds
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};