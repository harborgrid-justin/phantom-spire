import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Error as ErrorIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Code as ApiIcon,
  Security as SecurityIcon,
  ExpandMore as ExpandMoreIcon,
  PlayArrow as RunTestIcon
} from '@mui/icons-material';
import { useMutation } from '@tanstack/react-query';
import { VerificationResult } from '../types';
import { testSpecificApi } from '../api';

interface CoreDetailsProps {
  coreName: string;
  result: VerificationResult;
}

export const CoreDetails: React.FC<CoreDetailsProps> = ({ coreName, result }) => {
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [selectedApi, setSelectedApi] = useState('');
  const [testParameters, setTestParameters] = useState('{}');

  const testApiMutation = useMutation({
    mutationFn: testSpecificApi,
    onSuccess: (data) => {
      console.log('API test result:', data);
    }
  });

  const handleTestApi = () => {
    if (selectedApi) {
      try {
        const parameters = JSON.parse(testParameters);
        testApiMutation.mutate({
          coreName,
          apiName: selectedApi,
          parameters
        });
      } catch (error) {
        console.error('Invalid JSON parameters:', error);
      }
    }
  };

  // Add null checks for arrays
  const availableApis = result.availableApis || [];
  const enterpriseFeatures = result.enterpriseFeatures || [];
  const testResults = result.testResults || { totalTests: 0, passed: 0, failed: 0, tests: [] };
  const tests = testResults.tests || [];

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box display="flex" alignItems="center" width="100%">
          <Box display="flex" alignItems="center" flex={1}>
            <Chip
              icon={result.status === 'accessible' ? <CheckCircleIcon /> :
                    result.status === 'error' ? <ErrorIcon /> : <WarningIcon />}
              label={result.status}
              color={result.status === 'accessible' ? 'success' :
                     result.status === 'error' ? 'error' : 'warning'}
              size="small"
              sx={{ mr: 2 }}
            />
            <Typography variant="subtitle1">
              {coreName}
            </Typography>
          </Box>
          <Typography variant="body2" color="textSecondary">
            APIs: {availableApis.length} | Coverage: {(result.apiCoverage || 0).toFixed(1)}%
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Box display="flex" flexWrap="wrap" gap={2}>
          {/* Package Information */}
          <Box flex="1 1 400px" minWidth="400px">
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Package Information</Typography>
              <Typography variant="body2" mb={1}>
                <strong>Package:</strong> {result.packageName || 'Unknown'}
              </Typography>
              <Typography variant="body2" mb={1}>
                <strong>Status:</strong> {result.status}
              </Typography>
              <Typography variant="body2" mb={1}>
                <strong>Core Instance:</strong> {result.coreInstance ? 'Available' : 'Not Available'}
              </Typography>
              <Typography variant="body2" mb={1}>
                <strong>API Coverage:</strong> {(result.apiCoverage || 0).toFixed(1)}%
              </Typography>
              {result.importError && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  Import Error: {result.importError}
                </Alert>
              )}
            </Paper>
          </Box>

          {/* Enterprise Features */}
          <Box flex="1 1 400px" minWidth="400px">
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Enterprise Features</Typography>
              {enterpriseFeatures.length > 0 ? (
                <List dense>
                  {enterpriseFeatures.map((feature, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <SecurityIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={feature}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No enterprise features available
                </Typography>
              )}
            </Paper>
          </Box>

          {/* Available APIs */}
          <Box flex="1 1 400px" minWidth="400px">
            <Paper sx={{ p: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="subtitle1">Available APIs</Typography>
                <Button
                  size="small"
                  startIcon={<RunTestIcon />}
                  onClick={() => setTestDialogOpen(true)}
                  disabled={availableApis.length === 0}
                >
                  Test API
                </Button>
              </Box>
              {availableApis.length > 0 ? (
                <List dense>
                  {availableApis.map((api, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <ApiIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={api}
                        primaryTypographyProps={{ variant: 'body2', fontFamily: 'monospace' }}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No APIs available
                </Typography>
              )}
            </Paper>
          </Box>

          {/* Test Results */}
          <Box flex="1 1 400px" minWidth="400px">
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Test Results</Typography>
              <Typography variant="body2" color="textSecondary" mb={1}>
                Total: {testResults.totalTests || 0} |
                Passed: {testResults.passed || 0} |
                Failed: {testResults.failed || 0}
              </Typography>
              {tests.length > 0 ? (
                <List dense>
                  {tests.slice(0, 5).map((test, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Chip
                          size="small"
                          label={test.status}
                          color={test.status === 'passed' ? 'success' :
                                 test.status === 'failed' ? 'error' : 'warning'}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={test.api}
                        secondary={test.result || test.error || test.reason}
                        primaryTypographyProps={{ variant: 'body2', fontFamily: 'monospace' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No test results available
                </Typography>
              )}
            </Paper>
          </Box>
        </Box>

        {/* API Test Dialog */}
        <Dialog open={testDialogOpen} onClose={() => setTestDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Test API - {coreName}</DialogTitle>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={2} sx={{ mt: 1 }}>
              <FormControl fullWidth>
                <InputLabel>Select API</InputLabel>
                <Select
                  value={selectedApi}
                  onChange={(e) => setSelectedApi(e.target.value)}
                  label="Select API"
                >
                  {availableApis.map((api) => (
                    <MenuItem key={api} value={api}>{api}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Test Parameters (JSON)"
                value={testParameters}
                onChange={(e) => setTestParameters(e.target.value)}
                placeholder='{"test": true, "parameter": "value"}'
              />
              
              {testApiMutation.data && (
                <Alert severity={testApiMutation.data.success ? 'success' : 'error'}>
                  <pre style={{ fontSize: '12px', overflow: 'auto' }}>
                    {JSON.stringify(testApiMutation.data, null, 2)}
                  </pre>
                </Alert>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTestDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleTestApi}
              variant="contained"
              disabled={!selectedApi || testApiMutation.isPending}
            >
              {testApiMutation.isPending ? 'Testing...' : 'Test API'}
            </Button>
          </DialogActions>
        </Dialog>
      </AccordionDetails>
    </Accordion>
  );
};
