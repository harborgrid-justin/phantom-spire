import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';

interface GeneralSettingsProps {
  settings: {
    organizationName: string;
    defaultProject: string;
    autoSave: boolean;
    darkMode: boolean;
    language: string;
    timezone: string;
  };
  onSettingChange: (section: string, key: string, value: any) => void;
}

const GeneralSettings: React.FC<GeneralSettingsProps> = ({ settings, onSettingChange }) => {
  return (
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
                onChange={(e) => onSettingChange('general', 'organizationName', e.target.value)}
              />
              <FormControl fullWidth>
                <InputLabel>Default Project</InputLabel>
                <Select
                  value={settings.defaultProject}
                  onChange={(e) => onSettingChange('general', 'defaultProject', e.target.value)}
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
                  onChange={(e) => onSettingChange('general', 'timezone', e.target.value)}
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
                    onChange={(e) => onSettingChange('general', 'autoSave', e.target.checked)}
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
                    onChange={(e) => onSettingChange('general', 'darkMode', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
            <Box sx={{ mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Language</InputLabel>
                <Select
                  value={settings.language}
                  onChange={(e) => onSettingChange('general', 'language', e.target.value)}
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
};

export default GeneralSettings;