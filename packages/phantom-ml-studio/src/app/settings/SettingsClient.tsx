'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  TextField,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Divider,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from '@mui/material';
import {
  Save,
  Add,
  Delete,
  Edit,
  Security,
  Notifications,
  Settings as SettingsIcon,
  Storage,
  Api
} from '@mui/icons-material';

interface SettingsData {
  general: {
    organizationName: string;
    defaultProject: string;
    autoSave: boolean;
    darkMode: boolean;
    language: string;
    timezone: string;
  };
  security: {
    enableTwoFactor: boolean;
    sessionTimeout: number;
    ipWhitelist: string[];
    encryptAtRest: boolean;
    auditLogging: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    slackNotifications: boolean;
    modelCompletionAlerts: boolean;
    errorAlerts: boolean;
    weeklyReports: boolean;
  };
  compute: {
    defaultInstanceType: string;
    maxConcurrentJobs: number;
    autoScaling: boolean;
    spotInstances: boolean;
    gpuEnabled: boolean;
  };
  storage: {
    dataRetention: number;
    autoBackup: boolean;
    backupFrequency: string;
    compressionEnabled: boolean;
    cloudStorage: string;
  };
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed: string;
  permissions: string[];
}

export default function SettingsClient() {
  const [activeTab, setActiveTab] = useState(0);
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const [newApiKey, setNewApiKey] = useState({ name: '', permissions: [] as string[] });

  useEffect(() => {
    fetchSettings();
    fetchApiKeys();
  }, []);

  const fetchSettings = async () => {
    try {
      // Mock data - replace with actual API calls
      const mockSettings: SettingsData = {
        general: {
          organizationName: 'Phantom Security Inc.',
          defaultProject: 'phantom-ml-core',
          autoSave: true,
          darkMode: false,
          language: 'English',
          timezone: 'UTC'
        },
        security: {
          enableTwoFactor: true,
          sessionTimeout: 60,
          ipWhitelist: ['192.168.1.0/24', '10.0.0.0/8'],
          encryptAtRest: true,
          auditLogging: true
        },
        notifications: {
          emailNotifications: true,
          slackNotifications: false,
          modelCompletionAlerts: true,
          errorAlerts: true,
          weeklyReports: true
        },
        compute: {
          defaultInstanceType: 'standard',
          maxConcurrentJobs: 5,
          autoScaling: true,
          spotInstances: false,
          gpuEnabled: true
        },
        storage: {
          dataRetention: 90,
          autoBackup: true,
          backupFrequency: 'daily',
          compressionEnabled: true,
          cloudStorage: 'aws-s3'
        }
      };

      setSettings(mockSettings);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch settings');
      setLoading(false);
    }
  };

  const fetchApiKeys = async () => {
    try {
      const mockApiKeys: ApiKey[] = [
        {
          id: '1',
          name: 'Production API Key',
          key: 'pk_live_****1234',
          created: '2024-01-15',
          lastUsed: '2 hours ago',
          permissions: ['read', 'write']
        },
        {
          id: '2',
          name: 'Development API Key',
          key: 'pk_test_****5678',
          created: '2024-01-10',
          lastUsed: '1 day ago',
          permissions: ['read']
        },
        {
          id: '3',
          name: 'Analytics API Key',
          key: 'pk_analytics_****9012',
          created: '2024-01-05',
          lastUsed: 'Never',
          permissions: ['read']
        }
      ];

      setApiKeys(mockApiKeys);
    } catch (err) {
      console.error('Failed to fetch API keys:', err);
    }
  };

  const handleSaveSettings = async () => {
    setSaveLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess('Settings saved successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to save settings');
    }
    setSaveLoading(false);
  };

  const handleCreateApiKey = async () => {
    try {
      const newKey: ApiKey = {
        id: Date.now().toString(),
        name: newApiKey.name,
        key: `pk_${Math.random().toString(36).substring(2, 15)}`,
        created: new Date().toLocaleDateString(),
        lastUsed: 'Never',
        permissions: newApiKey.permissions
      };

      setApiKeys([...apiKeys, newKey]);
      setApiKeyDialogOpen(false);
      setNewApiKey({ name: '', permissions: [] });
    } catch (err) {
      setError('Failed to create API key');
    }
  };

  const handleDeleteApiKey = (keyId: string) => {
    setApiKeys(apiKeys.filter(key => key.id !== keyId));
  };

  const updateSettings = (section: keyof SettingsData, field: string, value: any) => {
    if (!settings) return;
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [field]: value
      }
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Settings
        </Typography>
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={handleSaveSettings}
          disabled={saveLoading}
        >
          {saveLoading ? <CircularProgress size={20} /> : 'Save Changes'}
        </Button>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="General" icon={<SettingsIcon />} />
          <Tab label="Security" icon={<Security />} />
          <Tab label="Notifications" icon={<Notifications />} />
          <Tab label="Compute" icon={<SettingsIcon />} />
          <Tab label="Storage" icon={<Storage />} />
          <Tab label="API Keys" icon={<Api />} />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && settings && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>General Settings</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Organization Name"
                  value={settings.general.organizationName}
                  onChange={(e) => updateSettings('general', 'organizationName', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Default Project"
                  value={settings.general.defaultProject}
                  onChange={(e) => updateSettings('general', 'defaultProject', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={settings.general.language}
                    onChange={(e) => updateSettings('general', 'language', e.target.value)}
                  >
                    <MenuItem value="English">English</MenuItem>
                    <MenuItem value="Spanish">Spanish</MenuItem>
                    <MenuItem value="French">French</MenuItem>
                    <MenuItem value="German">German</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Timezone</InputLabel>
                  <Select
                    value={settings.general.timezone}
                    onChange={(e) => updateSettings('general', 'timezone', e.target.value)}
                  >
                    <MenuItem value="UTC">UTC</MenuItem>
                    <MenuItem value="America/New_York">Eastern Time</MenuItem>
                    <MenuItem value="America/Los_Angeles">Pacific Time</MenuItem>
                    <MenuItem value="Europe/London">London Time</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.general.autoSave}
                      onChange={(e) => updateSettings('general', 'autoSave', e.target.checked)}
                    />
                  }
                  label="Enable Auto-Save"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.general.darkMode}
                      onChange={(e) => updateSettings('general', 'darkMode', e.target.checked)}
                    />
                  }
                  label="Dark Mode"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {activeTab === 1 && settings && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Security Settings</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Session Timeout (minutes)"
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => updateSettings('security', 'sessionTimeout', parseInt(e.target.value))}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.security.enableTwoFactor}
                      onChange={(e) => updateSettings('security', 'enableTwoFactor', e.target.checked)}
                    />
                  }
                  label="Enable Two-Factor Authentication"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.security.encryptAtRest}
                      onChange={(e) => updateSettings('security', 'encryptAtRest', e.target.checked)}
                    />
                  }
                  label="Encrypt Data at Rest"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.security.auditLogging}
                      onChange={(e) => updateSettings('security', 'auditLogging', e.target.checked)}
                    />
                  }
                  label="Enable Audit Logging"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>IP Whitelist</Typography>
                {settings.security.ipWhitelist.map((ip, index) => (
                  <Chip
                    key={index}
                    label={ip}
                    onDelete={() => {
                      const newList = [...settings.security.ipWhitelist];
                      newList.splice(index, 1);
                      updateSettings('security', 'ipWhitelist', newList);
                    }}
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {activeTab === 5 && (
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">API Keys</Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setApiKeyDialogOpen(true)}
              >
                Create API Key
              </Button>
            </Box>
            <List>
              {apiKeys.map((apiKey) => (
                <ListItem key={apiKey.id} divider>
                  <ListItemText
                    primary={apiKey.name}
                    secondary={
                      <Box>
                        <Typography variant="body2">Key: {apiKey.key}</Typography>
                        <Typography variant="body2">Created: {apiKey.created}</Typography>
                        <Typography variant="body2">Last Used: {apiKey.lastUsed}</Typography>
                        <Box mt={1}>
                          {apiKey.permissions.map((permission) => (
                            <Chip key={permission} label={permission} size="small" sx={{ mr: 0.5 }} />
                          ))}
                        </Box>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton onClick={() => handleDeleteApiKey(apiKey.id)}>
                      <Delete />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Create API Key Dialog */}
      <Dialog open={apiKeyDialogOpen} onClose={() => setApiKeyDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New API Key</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="API Key Name"
              value={newApiKey.name}
              onChange={(e) => setNewApiKey({ ...newApiKey, name: e.target.value })}
              sx={{ mb: 3 }}
            />
            <Typography variant="subtitle2" gutterBottom>Permissions</Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={newApiKey.permissions.includes('read')}
                  onChange={(e) => {
                    const permissions = e.target.checked
                      ? [...newApiKey.permissions, 'read']
                      : newApiKey.permissions.filter(p => p !== 'read');
                    setNewApiKey({ ...newApiKey, permissions });
                  }}
                />
              }
              label="Read"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={newApiKey.permissions.includes('write')}
                  onChange={(e) => {
                    const permissions = e.target.checked
                      ? [...newApiKey.permissions, 'write']
                      : newApiKey.permissions.filter(p => p !== 'write');
                    setNewApiKey({ ...newApiKey, permissions });
                  }}
                />
              }
              label="Write"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApiKeyDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateApiKey}
            disabled={!newApiKey.name || newApiKey.permissions.length === 0}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}