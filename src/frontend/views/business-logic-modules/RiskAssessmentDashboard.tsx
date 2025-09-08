/**
 * Risk Assessment Dashboard
 * Comprehensive risk assessment and scoring dashboard
 */

import React, { useEffect, useState } from 'react';
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
  LinearProgress,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar
} from '@mui/material';
import { 
  Assessment,
  Warning,
  CheckCircle,  Error as ErrorIcon,
  TrendingUp,
  Security,
  Business,
  BarChart,
  Timeline
} from '@mui/icons-material';
import { useServicePage } from '../../../services/business-logic/hooks/useBusinessLogic';

export const RiskAssessmentDashboard: React.FC = () => {
  const {
    businessLogic,
    realTimeData,
    notifications,
    addNotification,
    removeNotification,
    isFullyLoaded,
    hasErrors,
    refresh
  } = useServicePage('risk-assessment');

  const [riskAssessment, setRiskAssessment] = useState<any>(null);
  const [isAssessing, setIsAssessing] = useState(false);

  // Execute risk assessment
  const handleRiskAssessment = async () => {
    try {
      setIsAssessing(true);
      
      // Sample data for risk assessment
      const sampleAssets = Array.from({ length: 50 }, (_, i) => ({
        id: `asset_${i}`,
        name: `System ${i + 1}`,
        criticality: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
        type: ['server', 'database', 'application', 'network'][Math.floor(Math.random() * 4)]
      }));

      const sampleThreats = Array.from({ length: 20 }, (_, i) => ({
        id: `threat_${i}`,
        name: `Threat ${i + 1}`,
        likelihood: Math.random(),
        impact: Math.random()
      }));

      const sampleVulnerabilities = Array.from({ length: 30 }, (_, i) => ({
        id: `vuln_${i}`,
        cvss_score: Math.random() * 10,
        exploitability: Math.random()
      }));

      const response = await businessLogic.execute('assess-risk', {
        asset_inventory: sampleAssets,
        threat_landscape: sampleThreats,
        vulnerabilities: sampleVulnerabilities,
        assessment_scope: 'comprehensive'
      });

      setRiskAssessment(response);
      addNotification('success', `Risk assessment completed with overall risk level: ${response.data?.risk_level}`);
    } catch (error) {
      addNotification('error', `Risk assessment failed: ${error}`);
    } finally {
      setIsAssessing(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'critical': return <ErrorIcon color="error" />;
      case 'high': return <Warning color="warning" />;
      case 'medium': return <Assessment color="info" />;
      case 'low': return <CheckCircle color="success" />;
      default: return <Security />;
    }
  };

  if (!isFullyLoaded) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading Risk Assessment...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <Assessment sx={{ mr: 2, fontSize: 40 }} />
        Risk Assessment Dashboard
      </Typography>
      
      <Typography variant="body1" color="textSecondary" paragraph>
        Comprehensive risk assessment and scoring for cybersecurity threats across your organization.
      </Typography>

      {hasErrors && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Risk assessment services are experiencing issues. Some data may be incomplete.
          </Typography>
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Assessment Controls */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <BarChart sx={{ mr: 1 }} />
                Assessment Controls
              </Typography>
              
              <Button
                variant="contained"
                fullWidth
                onClick={handleRiskAssessment}
                disabled={isAssessing}
                startIcon={isAssessing ? <CircularProgress size={20} /> : <TrendingUp />}
                sx={{ mb: 2 }}
              >
                {isAssessing ? 'Assessing...' : 'Run Risk Assessment'}
              </Button>

              <Button
                variant="outlined"
                fullWidth
                onClick={refresh}
                startIcon={<Timeline />}
              >
                View Historical Trends
              </Button>

              {riskAssessment && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Last Assessment
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {new Date(riskAssessment.timestamp).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Scope: {riskAssessment.assessment_scope}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Risk Overview */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Risk Overview
              </Typography>
              
              {riskAssessment ? (
                <>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={6}>
                      <Paper sx={{ p: 3, textAlign: 'center' }}>
                        <Avatar sx={{ 
                          bgcolor: getRiskLevelColor(riskAssessment.risk_level) === 'error' ? 'error.main' :
                                  getRiskLevelColor(riskAssessment.risk_level) === 'warning' ? 'warning.main' :
                                  getRiskLevelColor(riskAssessment.risk_level) === 'info' ? 'info.main' : 'success.main',
                          width: 64,
                          height: 64,
                          mx: 'auto',
                          mb: 2
                        }}>
                          {getRiskIcon(riskAssessment.risk_level)}
                        </Avatar>
                        <Typography variant="h4" color="primary" gutterBottom>
                          {(riskAssessment.overall_risk_score * 100).toFixed(0)}
                        </Typography>
                        <Typography variant="body1">
                          Overall Risk Score
                        </Typography>
                        <Chip
                          label={riskAssessment.risk_level.toUpperCase()}
                          color={getRiskLevelColor(riskAssessment.risk_level)}
                          sx={{ mt: 1 }}
                        />
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Risk Factors
                      </Typography>
                      {Object.entries(riskAssessment.risk_factors).map(([factor, score], index) => (
                        <Box key={index} sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="body2">
                              {factor.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {((score as number) * 100).toFixed(0)}%
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={(score as number) * 100}
                            color={score as number > 0.8 ? 'error' : score as number > 0.6 ? 'warning' : 'success'}
                          />
                        </Box>
                      ))}
                    </Grid>
                  </Grid>

                  {/* Risk Areas */}
                  <Typography variant="h6" gutterBottom>
                    Risk Areas Analysis
                  </Typography>
                  <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Risk Area</TableCell>
                          <TableCell align="right">Score</TableCell>
                          <TableCell align="center">Priority</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {riskAssessment.risk_areas?.map((area: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell component="th" scope="row">
                              {area.area}
                            </TableCell>
                            <TableCell align="right">
                              {(area.score * 100).toFixed(1)}%
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={area.priority}
                                color={area.priority === 'high' ? 'error' : 
                                       area.priority === 'medium' ? 'warning' : 'info'}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              ) : (
                <Box textAlign="center" py={4}>
                  <Typography variant="body1" color="textSecondary">
                    No risk assessment data available. Run an assessment to see detailed risk analysis.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recommendations */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Security sx={{ mr: 1 }} />
                Risk Mitigation Recommendations
              </Typography>
              
              {riskAssessment?.recommendations ? (
                <List>
                  {riskAssessment.recommendations.map((recommendation: string, index: number) => (
                    <ListItem key={index} divider>
                      <ListItemIcon>
                        <CheckCircle color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={recommendation}
                        secondary={`Priority ${index + 1}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  Run a risk assessment to get personalized recommendations.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Mitigation Strategies */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Business sx={{ mr: 1 }} />
                Mitigation Strategies
              </Typography>
              
              {riskAssessment?.mitigation_strategies ? (
                <List>
                  {riskAssessment.mitigation_strategies.map((strategy: any, index: number) => (
                    <ListItem key={index} divider>
                      <ListItemIcon>
                        <TrendingUp color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary={strategy.strategy}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="textSecondary">
                              Cost: {strategy.estimated_cost} | Timeline: {strategy.timeline}
                            </Typography>
                            <Chip
                              label={strategy.priority}
                              color={strategy.priority === 'high' ? 'error' : 
                                     strategy.priority === 'medium' ? 'warning' : 'info'}
                              size="small"
                              sx={{ mt: 1 }}
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  Risk mitigation strategies will appear after assessment completion.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};