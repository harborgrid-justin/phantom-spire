// MITRE Analysis Panel Component

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Chip,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  AccountTree as MitreIcon,
  Security as DefenseIcon,
  Shield as ShieldIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { MitreAnalysis, MitreTactic } from '../types';
import { analyzeTTP } from '../api';

const MitreAnalysisPanel: React.FC = () => {
  const [analysis, setAnalysis] = useState<MitreAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [techniqueId, setTechniqueId] = useState('T1566.001');
  const [tactic, setTactic] = useState<MitreTactic>('Initial Access');

  const tactics: MitreTactic[] = [
    'Reconnaissance', 'Resource Development', 'Initial Access', 'Execution',
    'Persistence', 'Privilege Escalation', 'Defense Evasion', 'Credential Access',
    'Discovery', 'Lateral Movement', 'Collection', 'Command and Control',
    'Exfiltration', 'Impact'
  ];

  const runMitreAnalysis = async () => {
    setLoading(true);
    try {
      const result = await analyzeTTP({
        technique_id: techniqueId,
        tactic: tactic,
        analysis_scope: 'comprehensive',
        include_detection_rules: true,
        include_mitigations: true,
        assess_coverage: true
      });
      setAnalysis(result.data);
    } catch (error) {
      console.error('MITRE analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6">MITRE ATT&CK Analysis</Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <TextField
              size="small"
              label="Technique ID"
              value={techniqueId}
              onChange={(e) => setTechniqueId(e.target.value)}
              sx={{ minWidth: 150 }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Tactic</InputLabel>
              <Select
                value={tactic}
                onChange={(e) => setTactic(e.target.value as MitreTactic)}
                label="Tactic"
              >
                {tactics.map((tacticItem) => (
                  <MenuItem key={tacticItem} value={tacticItem}>
                    {tacticItem}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<MitreIcon />}
              onClick={runMitreAnalysis}
              disabled={loading}
            >
              Analyze
            </Button>
          </Box>
        </Box>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {analysis && (
          <Box>
            <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
              <Box flex="1 1 400px" minWidth="400px">
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>TTP Profile</Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Technique ID:</strong> {analysis.ttp_profile.technique_id}
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Technique Name:</strong> {analysis.ttp_profile.technique_name}
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Tactic:</strong> {analysis.ttp_profile.tactic}
                  </Typography>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Typography variant="body2" mr={1}>
                      <strong>Coverage Score:</strong>
                    </Typography>
                    <Chip
                      label={`${(analysis.ttp_profile.coverage_score * 100).toFixed(1)}%`}
                      color={analysis.ttp_profile.coverage_score >= 0.8 ? 'success' :
                             analysis.ttp_profile.coverage_score >= 0.6 ? 'warning' : 'error'}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2">
                    <strong>Analysis ID:</strong> {analysis.analysis_id}
                  </Typography>
                </Paper>
              </Box>

              <Box flex="1 1 400px" minWidth="400px">
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>Detection & Mitigation</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <DefenseIcon color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Active detection rules deployed"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <ShieldIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Mitigation strategies implemented"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <TimelineIcon color="warning" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Historical attack patterns analyzed"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <TrendIcon color="info" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Trending in current threat landscape"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Box>
            </Box>

            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>MITRE Recommendations</Typography>
              <List dense>
                {analysis.recommendations?.map((recommendation, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckCircleIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={recommendation}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default MitreAnalysisPanel;
