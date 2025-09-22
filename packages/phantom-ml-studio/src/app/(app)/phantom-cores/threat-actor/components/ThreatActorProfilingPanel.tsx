import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Person as ThreatActorIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { ThreatActorProfile } from '../types';
import { profileThreatActor } from '../api';

export const ThreatActorProfilingPanel: React.FC = () => {
  const [profile, setProfile] = useState<ThreatActorProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [actorType, setActorType] = useState('apt_group');
  const [targetSector, setTargetSector] = useState('government');

  const actorTypes = [
    'apt_group',
    'cybercriminal_group',
    'nation_state',
    'hacktivist',
    'insider_threat'
  ];

  const targetSectors = [
    'government',
    'financial',
    'healthcare',
    'technology',
    'energy',
    'defense'
  ];

  const runProfiling = async () => {
    setLoading(true);
    try {
      const result = await profileThreatActor({
        actor_type: actorType,
        target_sector: targetSector,
        analysis_depth: 'comprehensive',
        attribution_methods: ['behavioral', 'technical', 'infrastructure'],
        data_sources: ['osint', 'malware_analysis', 'infrastructure_analysis']
      });
      setProfile(result.data);
    } catch (error) {
      console.error('Threat actor profiling failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6">Threat Actor Profiling</Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Actor Type</InputLabel>
              <Select
                value={actorType}
                onChange={(e) => setActorType(e.target.value)}
                label="Actor Type"
              >
                {actorTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.replace('_', ' ').replace(//b/w/g, l => l.toUpperCase())}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Target Sector</InputLabel>
              <Select
                value={targetSector}
                onChange={(e) => setTargetSector(e.target.value)}
                label="Target Sector"
              >
                {targetSectors.map((sector) => (
                  <MenuItem key={sector} value={sector}>
                    {sector.charAt(0).toUpperCase() + sector.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<ThreatActorIcon />}
              onClick={runProfiling}
              disabled={loading}
            >
              Profile
            </Button>
          </Box>
        </Box>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {profile && (
          <Box>
            <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
              <Box flex="1 1 400px" minWidth="400px">
                <Paper sx={{ p: 2 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}>
                      <ThreatActorIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1">{profile.actor_profile.name}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {profile.actor_profile.type.replace('_', ' ').replace(//b/w/g, l => l.toUpperCase())}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="body2" mb={1}>
                    <strong>Aliases:</strong> {profile.actor_profile.aliases.join(', ')}
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Sophistication:</strong> {profile.actor_profile.sophistication_level}
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Motivation:</strong> {profile.actor_profile.motivation}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Origin:</strong> {profile.actor_profile.origin_country}
                  </Typography>
                </Paper>
              </Box>

              <Box flex="1 1 400px" minWidth="400px">
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>Threat Assessment</Typography>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Typography variant="body2" sx={{ mr: 2 }}>Threat Level:</Typography>
                    <Chip
                      label={profile.threat_level}
                      color={profile.threat_level === 'critical' ? 'error' :
                             profile.threat_level === 'high' ? 'warning' : 'info'}
                    />
                  </Box>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Typography variant="body2" sx={{ mr: 2 }}>Confidence Score:</Typography>
                    <Typography variant="h6" color="primary">
                      {profile.confidence_score.toFixed(1)}%
                    </Typography>
                  </Box>
                  <Typography variant="body2" mb={1}>
                    <strong>Technical Skills:</strong> {profile.capabilities.technical_skills}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Resource Level:</strong> {profile.capabilities.resource_level}
                  </Typography>
                </Paper>
              </Box>
            </Box>

            <Box display="flex" flexWrap="wrap" gap={2}>
              <Box flex="1 1 400px" minWidth="400px">
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>Target Sectors</Typography>
                  <Box display="flex" flexWrap="wrap" gap={0.5}>
                    {profile.capabilities.target_sectors.map((sector, index) => (
                      <Chip key={index} label={sector} size="small" />
                    ))}
                  </Box>
                </Paper>
              </Box>

              <Box flex="1 1 400px" minWidth="400px">
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>Attack Vectors</Typography>
                  <List dense>
                    {profile.capabilities.attack_vectors.slice(0, 3).map((vector, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <SecurityIcon color="error" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={vector}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Box>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
