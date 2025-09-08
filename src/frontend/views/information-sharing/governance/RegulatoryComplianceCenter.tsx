/**
 * Regulatory Compliance Center
 * Comprehensive compliance management for information sharing regulations
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
  Alert,
  Snackbar,
  Tabs,
  Tab,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { 
  Gavel, 
  Assessment, 
  CheckCircle, 
  Warning,
  Schedule,
  Assignment,
  Security,
  Business
} from '@mui/icons-material';
import { addUIUXEvaluation } from '../../../../services/ui-ux-evaluation/hooks/useUIUXEvaluation';
import { useServicePage } from '../../../../services/business-logic/hooks/useBusinessLogic';

export const RegulatoryComplianceCenter: React.FC = () => {
  const {
    businessLogic,
    realTimeData,
    notifications,
    addNotification,
    removeNotification,
    isFullyLoaded,
    hasErrors,
    refresh
  } = useServicePage('regulatory-compliance');

  const [currentTab, setCurrentTab] = useState(0);

  const complianceFrameworks = [
    {
      id: 'gdpr',
      name: 'GDPR',
      status: 'compliant',
      score: 96.2,
      lastAudit: '2024-01-01',
      nextReview: '2024-04-01',
      requirements: 12,
      implemented: 11
    },
    {
      id: 'nist',
      name: 'NIST Cybersecurity Framework',
      status: 'compliant',
      score: 94.8,
      lastAudit: '2023-12-15',
      nextReview: '2024-03-15',
      requirements: 23,
      implemented: 22
    },
    {
      id: 'iso27001',
      name: 'ISO 27001',
      status: 'in-progress',
      score: 87.5,
      lastAudit: '2024-01-10',
      nextReview: '2024-02-10',
      requirements: 18,
      implemented: 16
    }
  ];

  useEffect(() => {
    const evaluationController = addUIUXEvaluation('regulatory-compliance', {
      continuous: true,
      position: 'bottom-left',
      minimized: true,
      interval: 180000
    });

    return () => evaluationController.remove();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'success';
      case 'in-progress': return 'warning';
      case 'non-compliant': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Gavel color="primary" />
        ⚖️ Regulatory Compliance Center
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Comprehensive compliance management for information sharing regulations and frameworks.
      </Typography>

      <Alert severity="success" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Compliance Status:</strong> 94.2% overall compliance • 3 frameworks monitored • Next audit in 45 days
        </Typography>
      </Alert>

      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange} indicatorColor="primary">
          <Tab label="Framework Overview" />
          <Tab label="Compliance Reports" />
          <Tab label="Audit Schedule" />
          <Tab label="Risk Assessment" />
        </Tabs>
      </Paper>

      {currentTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Compliance Framework Status
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Framework</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Compliance Score</TableCell>
                      <TableCell>Requirements</TableCell>
                      <TableCell>Last Audit</TableCell>
                      <TableCell>Next Review</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {complianceFrameworks.map((framework) => (
                      <TableRow key={framework.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Security color="primary" />
                            <Typography variant="subtitle1">{framework.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={framework.status} 
                            color={getStatusColor(framework.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={framework.score} 
                              sx={{ width: 100, height: 6 }}
                              color={framework.score > 90 ? 'success' : 'warning'}
                            />
                            <Typography variant="body2">{framework.score}%</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {framework.implemented}/{framework.requirements}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(framework.lastAudit).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(framework.nextReview).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Button variant="outlined" size="small">
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Overall Score</Typography>
              <Typography variant="h3" color="success.main">94.2%</Typography>
              <Typography variant="body2" color="textSecondary">Compliance Level</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom">Active Frameworks</Typography>
              <Typography variant="h3" color="primary">3</Typography>
              <Typography variant="body2" color="textSecondary">Monitored</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom">Next Audit</Typography>
              <Typography variant="h3" color="warning.main">45</Typography>
              <Typography variant="body2" color="textSecondary">Days</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open={true}
          autoHideDuration={6000}
          onClose={() => removeNotification(notification.id)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            severity={notification.type}
            onClose={() => removeNotification(notification.id)}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </Box>
  );
};