import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Stepper, 
  Step, 
  StepLabel, 
  StepContent,
  Button, 
  Typography, 
  Paper,
  Alert,
  CircularProgress,
  LinearProgress,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  TextField,
  Switch,
  FormControlLabel,
  FormGroup
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Storage as StorageIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  PlayArrow as PlayArrowIcon,
  DataObject as DataObjectIcon,
  CloudSync as CloudSyncIcon,
  Dashboard as DashboardIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';

interface SetupState {
  currentStep: number;
  isLoading: boolean;
  error: string | null;
  databaseStatuses: {
    mongodb: 'pending' | 'checking' | 'connected' | 'error';
    postgresql: 'pending' | 'checking' | 'connected' | 'error';
    mysql: 'pending' | 'checking' | 'connected' | 'error';
    redis: 'pending' | 'checking' | 'connected' | 'error';
  };
  setupProgress: number;
  adminConfig: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    organization: string;
  };
  systemConfig: {
    threatRetentionDays: number;
    evidenceRetentionDays: number;
    maxConcurrentWorkflows: number;
    enabledFeatures: string[];
  };
  integrationConfig: {
    misp: { enabled: boolean; url: string; authKey: string };
    otx: { enabled: boolean; apiKey: string };
    virustotal: { enabled: boolean; apiKey: string };
  };
}

const SetupWizard: React.FC = () => {
  const [state, setState] = useState<SetupState>({
    currentStep: 0,
    isLoading: false,
    error: null,
    databaseStatuses: {
      mongodb: 'pending',
      postgresql: 'pending',
      mysql: 'pending',
      redis: 'pending'
    },
    setupProgress: 0,
    adminConfig: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      organization: 'Default Organization'
    },
    systemConfig: {
      threatRetentionDays: 365,
      evidenceRetentionDays: 2555,
      maxConcurrentWorkflows: 10,
      enabledFeatures: ['threat-intelligence', 'evidence-management', 'workflow-engine']
    },
    integrationConfig: {
      misp: { enabled: false, url: '', authKey: '' },
      otx: { enabled: false, apiKey: '' },
      virustotal: { enabled: false, apiKey: '' }
    }
  });

  const steps = [
    'Welcome & System Check',
    'Database Configuration',
    'Administrator Setup',
    'System Configuration',
    'External Integrations',
    'Final Setup & Launch'
  ];

  useEffect(() => {
    // Start system check on component mount
    if (state.currentStep === 0) {
      performSystemCheck();
    }
  }, []);

  const performSystemCheck = async () => {
    setState(prev => ({ ...prev, isLoading: true, setupProgress: 10 }));
    
    try {
      // Check system requirements
      const response = await fetch('/api/setup/system-check');
      const systemInfo = await response.json();
      
      if (systemInfo.status === 'ready') {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          setupProgress: 25,
          error: null 
        }));
      } else {
        setState(prev => ({ 
          ...prev, 
          isLoading: false,
          error: 'System requirements not met: ' + systemInfo.message 
        }));
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: 'Failed to perform system check: ' + (error as Error).message 
      }));
    }
  };

  const checkDatabaseConnections = async () => {
    setState(prev => ({ 
      ...prev, 
      isLoading: true,
      setupProgress: 40,
      databaseStatuses: {
        mongodb: 'checking',
        postgresql: 'checking', 
        mysql: 'checking',
        redis: 'checking'
      }
    }));

    const databases = ['mongodb', 'postgresql', 'mysql', 'redis'];
    
    for (const db of databases) {
      try {
        const response = await fetch(`/api/setup/database-check/${db}`);
        const result = await response.json();
        
        setState(prev => ({
          ...prev,
          databaseStatuses: {
            ...prev.databaseStatuses,
            [db]: result.connected ? 'connected' : 'error'
          }
        }));
        
        // Small delay for better UX
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        setState(prev => ({
          ...prev,
          databaseStatuses: {
            ...prev.databaseStatuses,
            [db]: 'error'
          }
        }));
      }
    }
    
    setState(prev => ({ ...prev, isLoading: false, setupProgress: 55 }));
  };

  const createAdminUser = async () => {
    setState(prev => ({ ...prev, isLoading: true, setupProgress: 70 }));
    
    try {
      const response = await fetch('/api/setup/admin-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state.adminConfig)
      });
      
      if (response.ok) {
        setState(prev => ({ ...prev, isLoading: false, setupProgress: 80 }));
      } else {
        const error = await response.json();
        setState(prev => ({ 
          ...prev, 
          isLoading: false,
          error: 'Failed to create admin user: ' + error.message 
        }));
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: 'Failed to create admin user: ' + (error as Error).message 
      }));
    }
  };

  const finalizeSetup = async () => {
    setState(prev => ({ ...prev, isLoading: true, setupProgress: 90 }));
    
    try {
      const response = await fetch('/api/setup/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemConfig: state.systemConfig,
          integrationConfig: state.integrationConfig
        })
      });
      
      if (response.ok) {
        setState(prev => ({ ...prev, isLoading: false, setupProgress: 100 }));
        // Redirect to main application after 3 seconds
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 3000);
      } else {
        const error = await response.json();
        setState(prev => ({ 
          ...prev, 
          isLoading: false,
          error: 'Setup finalization failed: ' + error.message 
        }));
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: 'Setup finalization failed: ' + (error as Error).message 
      }));
    }
  };

  const handleNext = () => {
    switch (state.currentStep) {
      case 1:
        checkDatabaseConnections();
        break;
      case 3:
        createAdminUser();
        break;
      case 5:
        finalizeSetup();
        break;
      default:
        setState(prev => ({ 
          ...prev, 
          currentStep: prev.currentStep + 1,
          setupProgress: Math.min(prev.setupProgress + 15, 90)
        }));
    }
  };

  const handleBack = () => {
    setState(prev => ({ 
      ...prev, 
      currentStep: Math.max(prev.currentStep - 1, 0) 
    }));
  };

  const renderWelcomeStep = () => (
    <Box>
      <Typography variant="h4" gutterBottom color="primary">
        🚀 Welcome to Phantom Spire CTI Platform
      </Typography>
      <Typography variant="body1" paragraph>
        This setup wizard will guide you through configuring your enterprise-grade 
        Cyber Threat Intelligence platform. We'll set up your databases, create your 
        administrator account, and configure integrations.
      </Typography>
      
      <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          <SettingsIcon sx={{ mr: 1 }} /> System Requirements Check
        </Typography>
        
        {state.isLoading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={24} />
            <Typography>Checking system requirements...</Typography>
          </Box>
        ) : state.error ? (
          <Alert severity="error">{state.error}</Alert>
        ) : (
          <Alert severity="success">
            <CheckCircleIcon sx={{ mr: 1 }} />
            System requirements verified successfully!
          </Alert>
        )}
      </Paper>
      
      <Paper elevation={1} sx={{ p: 3, mt: 3, bgcolor: 'background.paper' }}>
        <Typography variant="h6" gutterBottom>
          What you'll configure:
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <StorageIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="body2">Multi-database data layer</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AdminIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="body2">Administrator account</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <SecurityIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="body2">Security & access controls</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CloudSyncIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="body2">External integrations</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );

  const renderDatabaseStep = () => (
    <Box>
      <Typography variant="h5" gutterBottom>
        <StorageIcon sx={{ mr: 1 }} /> Database Configuration
      </Typography>
      <Typography variant="body1" paragraph>
        Phantom Spire uses a multi-database architecture optimized for different data types:
      </Typography>
      
      <Grid container spacing={3}>
        {Object.entries(state.databaseStatuses).map(([db, status]) => {
          const dbInfo = {
            mongodb: { name: 'MongoDB', description: 'Document store for flexible threat data' },
            postgresql: { name: 'PostgreSQL', description: 'Structured threat intelligence & relationships' },
            mysql: { name: 'MySQL', description: 'Analytics, reporting & performance metrics' },
            redis: { name: 'Redis', description: 'Caching, sessions & real-time data' }
          };
          
          const getStatusColor = (status: string) => {
            switch (status) {
              case 'connected': return 'success';
              case 'error': return 'error';
              case 'checking': return 'warning';
              default: return 'default';
            }
          };
          
          const getStatusIcon = (status: string) => {
            switch (status) {
              case 'connected': return <CheckCircleIcon />;
              case 'error': return <ErrorIcon />;
              case 'checking': return <CircularProgress size={20} />;
              default: return <WarningIcon />;
            }
          };
          
          return (
            <Grid item xs={12} sm={6} key={db}>
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">{dbInfo[db as keyof typeof dbInfo].name}</Typography>
                    <Chip 
                      icon={getStatusIcon(status)}
                      label={status}
                      color={getStatusColor(status)}
                      variant={status === 'connected' ? 'filled' : 'outlined'}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {dbInfo[db as keyof typeof dbInfo].description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
      
      {state.isLoading && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" gutterBottom>
            Testing database connections...
          </Typography>
          <LinearProgress />
        </Box>
      )}
      
      {state.error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {state.error}
        </Alert>
      )}
    </Box>
  );

  const renderAdminSetupStep = () => (
    <Box>
      <Typography variant="h5" gutterBottom>
        <AdminIcon sx={{ mr: 1 }} /> Administrator Setup
      </Typography>
      <Typography variant="body1" paragraph>
        Create your administrator account to manage the Phantom Spire platform.
      </Typography>
      
      <Paper elevation={2} sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Username"
              value={state.adminConfig.username}
              onChange={(e) => setState(prev => ({
                ...prev,
                adminConfig: { ...prev.adminConfig, username: e.target.value }
              }))}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={state.adminConfig.email}
              onChange={(e) => setState(prev => ({
                ...prev,
                adminConfig: { ...prev.adminConfig, email: e.target.value }
              }))}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={state.adminConfig.password}
              onChange={(e) => setState(prev => ({
                ...prev,
                adminConfig: { ...prev.adminConfig, password: e.target.value }
              }))}
              required
              helperText="Minimum 8 characters with mixed case, numbers and symbols"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              value={state.adminConfig.confirmPassword}
              onChange={(e) => setState(prev => ({
                ...prev,
                adminConfig: { ...prev.adminConfig, confirmPassword: e.target.value }
              }))}
              required
              error={state.adminConfig.password !== state.adminConfig.confirmPassword && state.adminConfig.confirmPassword !== ''}
              helperText={state.adminConfig.password !== state.adminConfig.confirmPassword && state.adminConfig.confirmPassword !== '' ? 'Passwords do not match' : ''}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Organization Name"
              value={state.adminConfig.organization}
              onChange={(e) => setState(prev => ({
                ...prev,
                adminConfig: { ...prev.adminConfig, organization: e.target.value }
              }))}
              required
            />
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );

  const renderSystemConfigStep = () => (
    <Box>
      <Typography variant="h5" gutterBottom>
        <SettingsIcon sx={{ mr: 1 }} /> System Configuration
      </Typography>
      <Typography variant="body1" paragraph>
        Configure system-wide settings and enable features for your organization.
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Data Retention</Typography>
            <TextField
              fullWidth
              label="Threat Data Retention (days)"
              type="number"
              value={state.systemConfig.threatRetentionDays}
              onChange={(e) => setState(prev => ({
                ...prev,
                systemConfig: { ...prev.systemConfig, threatRetentionDays: parseInt(e.target.value) }
              }))}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Evidence Retention (days)"
              type="number"
              value={state.systemConfig.evidenceRetentionDays}
              onChange={(e) => setState(prev => ({
                ...prev,
                systemConfig: { ...prev.systemConfig, evidenceRetentionDays: parseInt(e.target.value) }
              }))}
              helperText="Legal requirement: 7 years (2555 days) recommended"
            />
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Performance</Typography>
            <TextField
              fullWidth
              label="Max Concurrent Workflows"
              type="number"
              value={state.systemConfig.maxConcurrentWorkflows}
              onChange={(e) => setState(prev => ({
                ...prev,
                systemConfig: { ...prev.systemConfig, maxConcurrentWorkflows: parseInt(e.target.value) }
              }))}
              helperText="Based on system resources"
            />
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Enabled Features</Typography>
            <FormGroup row>
              {[
                { key: 'threat-intelligence', label: 'Threat Intelligence' },
                { key: 'evidence-management', label: 'Evidence Management' },
                { key: 'workflow-engine', label: 'Workflow Engine' },
                { key: 'analytics', label: 'Analytics & Reporting' },
                { key: 'api-access', label: 'External API Access' }
              ].map((feature) => (
                <FormControlLabel
                  key={feature.key}
                  control={
                    <Switch
                      checked={state.systemConfig.enabledFeatures.includes(feature.key)}
                      onChange={(e) => {
                        const features = e.target.checked
                          ? [...state.systemConfig.enabledFeatures, feature.key]
                          : state.systemConfig.enabledFeatures.filter(f => f !== feature.key);
                        setState(prev => ({
                          ...prev,
                          systemConfig: { ...prev.systemConfig, enabledFeatures: features }
                        }));
                      }}
                    />
                  }
                  label={feature.label}
                />
              ))}
            </FormGroup>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );

  const renderIntegrationsStep = () => (
    <Box>
      <Typography variant="h5" gutterBottom>
        <CloudSyncIcon sx={{ mr: 1 }} /> External Integrations
      </Typography>
      <Typography variant="body1" paragraph>
        Configure external threat intelligence sources and security tools.
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>MISP Integration</Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={state.integrationConfig.misp.enabled}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      integrationConfig: {
                        ...prev.integrationConfig,
                        misp: { ...prev.integrationConfig.misp, enabled: e.target.checked }
                      }
                    }))}
                  />
                }
                label="Enable MISP"
              />
              {state.integrationConfig.misp.enabled && (
                <Box sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    label="MISP URL"
                    value={state.integrationConfig.misp.url}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      integrationConfig: {
                        ...prev.integrationConfig,
                        misp: { ...prev.integrationConfig.misp, url: e.target.value }
                      }
                    }))}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Auth Key"
                    type="password"
                    value={state.integrationConfig.misp.authKey}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      integrationConfig: {
                        ...prev.integrationConfig,
                        misp: { ...prev.integrationConfig.misp, authKey: e.target.value }
                      }
                    }))}
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>AlienVault OTX</Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={state.integrationConfig.otx.enabled}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      integrationConfig: {
                        ...prev.integrationConfig,
                        otx: { ...prev.integrationConfig.otx, enabled: e.target.checked }
                      }
                    }))}
                  />
                }
                label="Enable OTX"
              />
              {state.integrationConfig.otx.enabled && (
                <TextField
                  fullWidth
                  label="API Key"
                  type="password"
                  value={state.integrationConfig.otx.apiKey}
                  onChange={(e) => setState(prev => ({
                    ...prev,
                    integrationConfig: {
                      ...prev.integrationConfig,
                      otx: { ...prev.integrationConfig.otx, apiKey: e.target.value }
                    }
                  }))}
                  sx={{ mt: 2 }}
                />
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>VirusTotal</Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={state.integrationConfig.virustotal.enabled}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      integrationConfig: {
                        ...prev.integrationConfig,
                        virustotal: { ...prev.integrationConfig.virustotal, enabled: e.target.checked }
                      }
                    }))}
                  />
                }
                label="Enable VirusTotal"
              />
              {state.integrationConfig.virustotal.enabled && (
                <TextField
                  fullWidth
                  label="API Key"
                  type="password"
                  value={state.integrationConfig.virustotal.apiKey}
                  onChange={(e) => setState(prev => ({
                    ...prev,
                    integrationConfig: {
                      ...prev.integrationConfig,
                      virustotal: { ...prev.integrationConfig.virustotal, apiKey: e.target.value }
                    }
                  }))}
                  sx={{ mt: 2 }}
                />
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderFinalStep = () => (
    <Box textAlign="center">
      <Typography variant="h4" gutterBottom color="primary">
        🎉 Setup Complete!
      </Typography>
      
      {state.setupProgress < 100 ? (
        <Box>
          <Typography variant="body1" paragraph>
            Finalizing your Phantom Spire CTI Platform setup...
          </Typography>
          <CircularProgress size={48} sx={{ mb: 2 }} />
          <LinearProgress variant="determinate" value={state.setupProgress} sx={{ mb: 2 }} />
          <Typography variant="body2">
            Progress: {state.setupProgress}%
          </Typography>
        </Box>
      ) : (
        <Box>
          <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Your platform is ready to use!
          </Typography>
          <Typography variant="body1" paragraph>
            You will be redirected to the dashboard in a few seconds.
          </Typography>
          
          <Paper elevation={2} sx={{ p: 3, mt: 3, textAlign: 'left' }}>
            <Typography variant="h6" gutterBottom>
              <DashboardIcon sx={{ mr: 1 }} /> What's Next?
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                <ListItemText primary="Access your dashboard at /dashboard" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                <ListItemText primary="Import threat intelligence feeds" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                <ListItemText primary="Configure additional users and roles" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                <ListItemText primary="Set up automated workflows" />
              </ListItem>
            </List>
          </Paper>
        </Box>
      )}
      
      {state.error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {state.error}
        </Alert>
      )}
    </Box>
  );

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0: return renderWelcomeStep();
      case 1: return renderDatabaseStep();
      case 2: return renderAdminSetupStep();
      case 3: return renderSystemConfigStep();
      case 4: return renderIntegrationsStep();
      case 5: return renderFinalStep();
      default: return null;
    }
  };

  const canProceed = () => {
    switch (state.currentStep) {
      case 0: return !state.isLoading && !state.error;
      case 1: return Object.values(state.databaseStatuses).every(status => status === 'connected');
      case 2: 
        return state.adminConfig.username && 
               state.adminConfig.email && 
               state.adminConfig.password && 
               state.adminConfig.password === state.adminConfig.confirmPassword &&
               state.adminConfig.organization;
      case 3: return true;
      case 4: return true;
      case 5: return state.setupProgress === 100;
      default: return true;
    }
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ mb: 4 }}>
          <LinearProgress 
            variant="determinate" 
            value={(state.currentStep / (steps.length - 1)) * 100} 
            sx={{ mb: 2, height: 8, borderRadius: 4 }}
          />
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Step {state.currentStep + 1} of {steps.length}
          </Typography>
        </Box>

        <Stepper activeStep={state.currentStep} orientation="vertical">
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
              <StepContent>
                {renderStepContent(index)}
                <Box sx={{ mt: 4 }}>
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={!canProceed() || state.isLoading}
                    startIcon={state.currentStep === steps.length - 1 ? <PlayArrowIcon /> : undefined}
                    sx={{ mr: 1 }}
                  >
                    {state.isLoading ? (
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                    ) : null}
                    {state.currentStep === steps.length - 1 ? 'Launch Platform' : 'Continue'}
                  </Button>
                  {state.currentStep > 0 && (
                    <Button onClick={handleBack} disabled={state.isLoading}>
                      Back
                    </Button>
                  )}
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Paper>
    </Box>
  );
};

export default SetupWizard;