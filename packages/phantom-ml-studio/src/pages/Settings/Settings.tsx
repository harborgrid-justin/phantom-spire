import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Paper,
  Tabs,
  Tab,
  Chip,
} from '@mui/material';
import {
  Save as SaveIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Key as KeyIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Storage as StorageIcon,
  Palette as ThemeIcon,
  Language as LanguageIcon,
} from '@mui/icons-material';

const Settings: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [apiKeyDialog, setApiKeyDialog] = useState(false);
  const [newApiKey, setNewApiKey] = useState('');
  const [settings, setSettings] = useState({
    // General
    organizationName: 'Phantom Security Inc.',
    defaultProject: 'phantom-ml-core',
    autoSave: true,
    darkMode: false,
    language: 'English',
    timezone: 'UTC',
    
    // Security
    enableTwoFactor: true,
    sessionTimeout: 60,
    ipWhitelist: ['192.168.1.0/24', '10.0.0.0/8'],
    encryptAtRest: true,
    auditLogging: true,
    
    // Notifications
    emailNotifications: true,
    slackNotifications: false,
    modelCompletionAlerts: true,
    errorAlerts: true,
    weeklyReports: true,
    
    // Compute
    defaultInstanceType: 'standard',
    maxConcurrentJobs: 5,
    autoScaling: true,
    spotInstances: false,
    gpuEnabled: true,
    
    // Storage
    dataRetention: 90,
    autoBackup: true,
    backupFrequency: 'daily',
    compressionEnabled: true,
    cloudStorage: 'aws-s3',
  });

  const mockApiKeys = [
    { id: 1, name: 'Production API Key', key: 'pk_live_****1234', created: '2024-01-15', lastUsed: '2 hours ago', permissions: ['read', 'write'] },
    { id: 2, name: 'Development API Key', key: 'pk_test_****5678', created: '2024-01-10', lastUsed: '1 day ago', permissions: ['read'] },
    { id: 3, name: 'Analytics API Key', key: 'pk_analytics_****9012', created: '2024-01-05', lastUsed: 'Never', permissions: ['read'] },
  ];

  const handleSettingChange = (section: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = () => {
    // Save settings logic here
    console.log('Saving settings:', settings);
  };

  const renderGeneralSettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Organization
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Organization Name"
                value={settings.organizationName}
                onChange={(e) => handleSettingChange('general', 'organizationName', e.target.value)}
              />
              <FormControl fullWidth>
                <InputLabel>Default Project</InputLabel>
                <Select
                  value={settings.defaultProject}
                  onChange={(e) => handleSettingChange('general', 'defaultProject', e.target.value)}
                >
                  <MenuItem value="phantom-ml-core">phantom-ml-core</MenuItem>
                  <MenuItem value="phantom-threat-intel">phantom-threat-intel</MenuItem>
                  <MenuItem value="phantom-forensics">phantom-forensics</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Timezone</InputLabel>
                <Select
                  value={settings.timezone}
                  onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
                >
                  <MenuItem value="UTC">UTC</MenuItem>
                  <MenuItem value="America/New_York">Eastern Time</MenuItem>
                  <MenuItem value="America/Los_Angeles">Pacific Time</MenuItem>
                  <MenuItem value="Europe/London">London Time</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Preferences
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Auto Save"
                  secondary="Automatically save changes to models and experiments"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.autoSave}
                    onChange={(e) => handleSettingChange('general', 'autoSave', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Dark Mode"
                  secondary="Use dark theme for the interface"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.darkMode}
                    onChange={(e) => handleSettingChange('general', 'darkMode', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
            <Box sx={{ mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Language</InputLabel>
                <Select
                  value={settings.language}
                  onChange={(e) => handleSettingChange('general', 'language', e.target.value)}
                >
                  <MenuItem value="English">English</MenuItem>
                  <MenuItem value="Spanish">Español</MenuItem>
                  <MenuItem value="French">Français</MenuItem>
                  <MenuItem value="German">Deutsch</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderSecuritySettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Authentication & Access
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Two-Factor Authentication"
                  secondary="Add an extra layer of security to your account"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.enableTwoFactor}
                    onChange={(e) => handleSettingChange('security', 'enableTwoFactor', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Encrypt Data at Rest"
                  secondary="Encrypt stored data using AES-256"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.encryptAtRest}
                    onChange={(e) => handleSettingChange('security', 'encryptAtRest', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Audit Logging"
                  secondary="Log all user actions and system events"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.auditLogging}
                    onChange={(e) => handleSettingChange('security', 'auditLogging', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Session Timeout (minutes)"
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <KeyIcon />
              API Keys
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Manage API keys for programmatic access to your models
            </Typography>
            
            <List>
              {mockApiKeys.map((key) => (
                <ListItem key={key.id}>
                  <ListItemText
                    primary={key.name}
                    secondary={
                      <Box>
                        <Typography variant="caption" display="block">
                          {key.key} • Created: {key.created}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Last used: {key.lastUsed}
                        </Typography>
                        <Box sx={{ mt: 0.5 }}>
                          {key.permissions.map(permission => (
                            <Chip
                              key={permission}
                              label={permission}
                              size="small"
                              variant="outlined"
                              sx={{ mr: 0.5, fontSize: '0.6rem', height: 16 }}
                            />
                          ))}
                        </Box>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
            
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setApiKeyDialog(true)}
              sx={{ mt: 1 }}
            >
              Create API Key
            </Button>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              IP Whitelist
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Only allow API access from these IP addresses or ranges
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {settings.ipWhitelist.map((ip, index) => (
                <Chip
                  key={index}
                  label={ip}
                  onDelete={() => {
                    const newList = settings.ipWhitelist.filter((_, i) => i !== index);
                    handleSettingChange('security', 'ipWhitelist', newList);
                  }}
                />
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                placeholder="Enter IP address or range"
                sx={{ flexGrow: 1 }}
              />
              <Button variant="outlined" startIcon={<AddIcon />}>
                Add
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderNotificationSettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Email Notifications
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Enable Email Notifications"
                  secondary="Receive notifications via email"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.emailNotifications}
                    onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Model Completion Alerts"
                  secondary="Notify when model training completes"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.modelCompletionAlerts}
                    onChange={(e) => handleSettingChange('notifications', 'modelCompletionAlerts', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Error Alerts"
                  secondary="Notify when errors occur during training"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.errorAlerts}
                    onChange={(e) => handleSettingChange('notifications', 'errorAlerts', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Weekly Reports"
                  secondary="Receive weekly performance summaries"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.weeklyReports}
                    onChange={(e) => handleSettingChange('notifications', 'weeklyReports', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Integration Settings
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Slack Notifications"
                  secondary="Send notifications to Slack workspace"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.slackNotifications}
                    onChange={(e) => handleSettingChange('notifications', 'slackNotifications', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
            
            {settings.slackNotifications && (
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Slack Webhook URL"
                  placeholder="https://hooks.slack.com/services/..."
                  size="small"
                />
                <TextField
                  fullWidth
                  label="Default Channel"
                  placeholder="#ml-notifications"
                  size="small"
                  sx={{ mt: 1 }}
                />
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderComputeSettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Compute Resources
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Default Instance Type</InputLabel>
                <Select
                  value={settings.defaultInstanceType}
                  onChange={(e) => handleSettingChange('compute', 'defaultInstanceType', e.target.value)}
                >
                  <MenuItem value="small">Small (1 CPU, 2GB RAM)</MenuItem>
                  <MenuItem value="standard">Standard (2 CPU, 4GB RAM)</MenuItem>
                  <MenuItem value="large">Large (4 CPU, 8GB RAM)</MenuItem>
                  <MenuItem value="xlarge">X-Large (8 CPU, 16GB RAM)</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                label="Max Concurrent Jobs"
                type="number"
                value={settings.maxConcurrentJobs}
                onChange={(e) => handleSettingChange('compute', 'maxConcurrentJobs', parseInt(e.target.value))}
              />
            </Box>

            <List sx={{ mt: 2 }}>
              <ListItem>
                <ListItemText
                  primary="Auto Scaling"
                  secondary="Automatically adjust compute resources based on demand"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.autoScaling}
                    onChange={(e) => handleSettingChange('compute', 'autoScaling', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="GPU Acceleration"
                  secondary="Enable GPU support for deep learning models"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.gpuEnabled}
                    onChange={(e) => handleSettingChange('compute', 'gpuEnabled', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Spot Instances"
                  secondary="Use spot instances to reduce costs (may be interrupted)"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.spotInstances}
                    onChange={(e) => handleSettingChange('compute', 'spotInstances', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Storage Configuration
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Data Retention (days)"
                type="number"
                value={settings.dataRetention}
                onChange={(e) => handleSettingChange('storage', 'dataRetention', parseInt(e.target.value))}
              />
              
              <FormControl fullWidth>
                <InputLabel>Cloud Storage Provider</InputLabel>
                <Select
                  value={settings.cloudStorage}
                  onChange={(e) => handleSettingChange('storage', 'cloudStorage', e.target.value)}
                >
                  <MenuItem value="aws-s3">Amazon S3</MenuItem>
                  <MenuItem value="gcp-storage">Google Cloud Storage</MenuItem>
                  <MenuItem value="azure-blob">Azure Blob Storage</MenuItem>
                  <MenuItem value="local">Local Storage</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth>
                <InputLabel>Backup Frequency</InputLabel>
                <Select
                  value={settings.backupFrequency}
                  onChange={(e) => handleSettingChange('storage', 'backupFrequency', e.target.value)}
                >
                  <MenuItem value="hourly">Hourly</MenuItem>
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <List sx={{ mt: 2 }}>
              <ListItem>
                <ListItemText
                  primary="Auto Backup"
                  secondary="Automatically backup models and data"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.autoBackup}
                    onChange={(e) => handleSettingChange('storage', 'autoBackup', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Data Compression"
                  secondary="Compress stored data to save space"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.compressionEnabled}
                    onChange={(e) => handleSettingChange('storage', 'compressionEnabled', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Settings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Configure your ML Studio preferences and integrations
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSaveSettings}
        >
          Save Changes
        </Button>
      </Box>

      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ pb: 1 }}>
          <Tabs value={selectedTab} onChange={(_, newValue) => setSelectedTab(newValue)}>
            <Tab label="General" icon={<LanguageIcon />} iconPosition="start" />
            <Tab label="Security" icon={<SecurityIcon />} iconPosition="start" />
            <Tab label="Notifications" icon={<NotificationsIcon />} iconPosition="start" />
            <Tab label="Compute & Storage" icon={<StorageIcon />} iconPosition="start" />
          </Tabs>
        </CardContent>
      </Card>

      <Box sx={{ mt: 3 }}>
        {selectedTab === 0 && renderGeneralSettings()}
        {selectedTab === 1 && renderSecuritySettings()}
        {selectedTab === 2 && renderNotificationSettings()}
        {selectedTab === 3 && renderComputeSettings()}
      </Box>

      {/* API Key Creation Dialog */}
      <Dialog
        open={apiKeyDialog}
        onClose={() => setApiKeyDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New API Key</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This key will be shown only once. Make sure to copy and store it securely.
          </Alert>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Key Name"
              placeholder="e.g., Production API Key"
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Permissions</InputLabel>
              <Select value="read">
                <MenuItem value="read">Read Only</MenuItem>
                <MenuItem value="write">Read & Write</MenuItem>
                <MenuItem value="admin">Full Access</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Expiry Date (Optional)"
              type="date"
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApiKeyDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setNewApiKey('pk_live_' + Math.random().toString(36).substring(2, 15));
              setApiKeyDialog(false);
            }}
          >
            Create Key
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success message for saved settings */}
      {/* This would typically be handled by a snackbar or toast notification */}
    </Box>
  );
};

export default Settings;