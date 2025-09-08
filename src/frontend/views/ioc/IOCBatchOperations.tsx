/**
 * IOC Batch Operations - Comprehensive batch operations management
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import { BatchPrediction, Upload, CheckCircle,  Error as ErrorIcon, Warning } from '@mui/icons-material';

export const IOCBatchOperations: React.FC = () => {
  const [operationType, setOperationType] = useState('create');
  const [dryRun, setDryRun] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [batchResults, setBatchResults] = useState<any>(null);

  const operationTypes = [
    { value: 'create', label: 'Create IOCs' },
    { value: 'update', label: 'Update IOCs' },
    { value: 'delete', label: 'Delete IOCs' },
    { value: 'validate', label: 'Validate IOCs' },
    { value: 'enrich', label: 'Enrich IOCs' }
  ];

  const sampleOperations = [
    {
      index: 0,
      action: 'create',
      iocValue: '192.168.1.100',
      type: 'ip',
      status: 'success',
      errors: [],
      warnings: []
    },
    {
      index: 1,
      action: 'create',
      iocValue: 'malicious-domain.com',
      type: 'domain',
      status: 'success',
      errors: [],
      warnings: ['Low confidence value']
    },
    {
      index: 2,
      action: 'update',
      iocValue: 'existing-ioc.com',
      type: 'domain',
      status: 'error',
      errors: ['IOC not found'],
      warnings: []
    }
  ];

  const steps = [
    'Select Operation Type',
    'Upload/Define Data',
    'Validation & Preview',
    'Execute Operation',
    'Review Results'
  ];

  const handleExecuteBatch = async () => {
    setShowDialog(true);
    setActiveStep(0);
    
    // Simulate batch operation steps
    const stepDelay = 2000;
    
    setTimeout(() => setActiveStep(1), stepDelay);
    setTimeout(() => setActiveStep(2), stepDelay * 2);
    setTimeout(() => setActiveStep(3), stepDelay * 3);
    setTimeout(() => {
      setActiveStep(4);
      setBatchResults({
        batchId: `batch-${Date.now()}`,
        total: 100,
        successful: 87,
        failed: 13,
        warnings: 23
      });
    }, stepDelay * 4);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'success';
      case 'error': return 'error';
      case 'warning': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle color="success" />;
      case 'error': return <ErrorIcon color="error" />;
      case 'warning': return <Warning color="warning" />;
      default: return null;
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <BatchPrediction />
        IOC Batch Operations
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Perform bulk operations on IOCs including create, update, delete, validate, and enrich operations.
      </Typography>

      <Grid container spacing={3}>
        {/* Operation Configuration */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Operation Configuration
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Operation Type</InputLabel>
                    <Select 
                      value={operationType} 
                      onChange={(e) => setOperationType(e.target.value)}
                    >
                      {operationTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={dryRun}
                        onChange={(e) => setDryRun(e.target.checked)}
                      />
                    }
                    label="Dry Run (Validation Only)"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={6}
                    label="IOC Data (JSON/CSV)"
                    placeholder={`Example for ${operationType}:\n${JSON.stringify([
                      {
                        value: "192.168.1.100",
                        type: "ip",
                        confidence: 85,
                        severity: "high"
                      }
                    ], null, 2)}`}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    startIcon={<Upload />}
                    fullWidth
                    sx={{ mb: 2 }}
                  >
                    Upload File
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleExecuteBatch}
                  >
                    {dryRun ? 'Validate Operations' : 'Execute Batch Operation'}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Ready for Processing</Typography>
                  <Typography variant="h3" color="primary">156</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Operations queued
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Success Rate</Typography>
                  <Typography variant="h3" color="success.main">94%</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Last 24 hours
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Recent Batch Operations
                  </Typography>
                  {[
                    { id: 'batch-001', type: 'create', count: 250, status: 'completed', time: '2 hours ago' },
                    { id: 'batch-002', type: 'update', count: 150, status: 'running', time: '30 minutes ago' },
                    { id: 'batch-003', type: 'validate', count: 500, status: 'completed', time: '1 hour ago' }
                  ].map((batch, index) => (
                    <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">{batch.id}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {batch.type} - {batch.count} items - {batch.time}
                        </Typography>
                      </Box>
                      <Chip 
                        label={batch.status} 
                        color={batch.status === 'completed' ? 'success' : 'warning'}
                        size="small"
                      />
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Preview Results */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Operation Preview
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Showing preview of operations. Enable dry run to validate before execution.
              </Alert>
              
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Index</TableCell>
                      <TableCell>Action</TableCell>
                      <TableCell>IOC Value</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Issues</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sampleOperations.map((operation) => (
                      <TableRow key={operation.index}>
                        <TableCell>{operation.index + 1}</TableCell>
                        <TableCell>
                          <Chip label={operation.action.toUpperCase()} size="small" />
                        </TableCell>
                        <TableCell>{operation.iocValue}</TableCell>
                        <TableCell>{operation.type}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getStatusIcon(operation.status)}
                            <Chip 
                              label={operation.status.toUpperCase()} 
                              color={getStatusColor(operation.status) as any}
                              size="small"
                            />
                          </Box>
                        </TableCell>
                        <TableCell>
                          {operation.errors.map((error, i) => (
                            <Chip key={i} label={error} color="error" size="small" sx={{ mr: 0.5 }} />
                          ))}
                          {operation.warnings.map((warning, i) => (
                            <Chip key={i} label={warning} color="warning" size="small" sx={{ mr: 0.5 }} />
                          ))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Batch Operation Progress Dialog */}
      <Dialog open={showDialog} onClose={() => setShowDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Batch Operation Progress</DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((step, index) => (
              <Step key={step}>
                <StepLabel>{step}</StepLabel>
                <StepContent>
                  {index === activeStep && index < 4 && (
                    <Box sx={{ mt: 1, mb: 2 }}>
                      <LinearProgress />
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Processing {step.toLowerCase()}...
                      </Typography>
                    </Box>
                  )}
                  {index === 4 && batchResults && (
                    <Box sx={{ mt: 1 }}>
                      <Alert severity="success" sx={{ mb: 2 }}>
                        Batch operation completed successfully!
                      </Alert>
                      <Grid container spacing={2}>
                        <Grid item xs={3}>
                          <Typography variant="body2" color="textSecondary">Total</Typography>
                          <Typography variant="h6">{batchResults.total}</Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="body2" color="textSecondary">Successful</Typography>
                          <Typography variant="h6" color="success.main">{batchResults.successful}</Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="body2" color="textSecondary">Failed</Typography>
                          <Typography variant="h6" color="error.main">{batchResults.failed}</Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="body2" color="textSecondary">Warnings</Typography>
                          <Typography variant="h6" color="warning.main">{batchResults.warnings}</Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)}>
            {activeStep === 4 ? 'Close' : 'Cancel'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};