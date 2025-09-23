'use client';

import React from 'react';
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
  Assessment as RiskIcon,
  CheckCircle as CheckCircleIcon,
  Shield as ShieldIcon
} from '@mui/icons-material';
import { useRiskAssessment } from '../hooks';

export const RiskAssessmentPanel: React.FC = () => {
  const {
    assessment,
    loading,
    assessmentType,
    setAssessmentType,
    organization,
    setOrganization,
    assessmentTypes,
    runRiskAssessment
  } = useRiskAssessment();

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6">Risk Assessment</Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <TextField
              size="small"
              label="Organization"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              sx={{ minWidth: 200 }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Assessment Type</InputLabel>
              <Select
                value={assessmentType}
                onChange={(e) => setAssessmentType(e.target.value as any)}
                label="Assessment Type"
              >
                {assessmentTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<RiskIcon />}
              onClick={runRiskAssessment}
              disabled={loading}
            >
              Assess
            </Button>
          </Box>
        </Box>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {assessment && (
          <Box>
            <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
              <Box flex="1 1 400px" minWidth="400px">
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>Risk Profile</Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Organization:</strong> {assessment.risk_profile.organization}
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Overall Score:</strong> {assessment.risk_profile.overall_risk_score.toFixed(1)}
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Risk Level:</strong> {assessment.risk_profile.risk_level}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Assessment Date:</strong> {new Date(assessment.risk_profile.assessment_date).toLocaleDateString()}
                  </Typography>
                </Paper>
              </Box>

              <Box flex="1 1 400px" minWidth="400px">
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>Risk Categories</Typography>
                  <Box display="flex" flexDirection="column" gap={1}>
                    {Object.entries(assessment.risk_categories).map(([category, score]) => (
                      <Box display="flex" justifyContent="space-between" alignItems="center" key={category}>
                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                          {category}:
                        </Typography>
                        <Chip
                          label={`${score}/100`}
                          size="small"
                          color={score > 70 ? 'error' : score > 40 ? 'warning' : 'success'}
                        />
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </Box>
            </Box>

            <Box display="flex" flexWrap="wrap" gap={2}>
              <Box flex="1 1 400px" minWidth="400px">
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>Key Recommendations</Typography>
                  <List dense>
                    {assessment.recommendations?.slice(0, 4).map((recommendation, index) => (
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

              <Box flex="1 1 400px" minWidth="400px">
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>Mitigation Strategies</Typography>
                  <List dense>
                    {assessment.mitigation_strategies?.slice(0, 4).map((strategy, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <ShieldIcon color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={strategy}
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
