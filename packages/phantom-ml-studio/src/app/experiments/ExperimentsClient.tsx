'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  PlayArrow as RunIcon
} from '@mui/icons-material';
import { experimentsService } from '@/services/experiments';
import { Experiment } from '@/services/experiments';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

// Error boundary component
class ExperimentsErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Experiments Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
            }
          >
            Something went wrong with experiments. Please try refreshing the page.
          </Alert>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default function ExperimentsClient() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchExperiments = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const response = await experimentsService.getExperiments(
        { id: 'get_exps_req', type: 'getExperiments' } as any,
        {}
      );

      if (response.success && response.data) {
        setExperiments(response.data.experiments);
        setLastUpdated(new Date());
      } else {
        setError(response.error?.message || 'Failed to fetch experiments.');
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Experiments fetch error:', e);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchExperiments();

    // Auto-refresh every 60 seconds
    const interval = setInterval(() => fetchExperiments(true), 60000);
    return () => clearInterval(interval);
  }, [fetchExperiments]);

  const handleRefresh = useCallback(() => {
    fetchExperiments(true);
  }, [fetchExperiments]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'running': return 'primary';
      case 'failed': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const runCols: GridColDef[] = [
    { field: 'runId', headerName: 'Run ID', width: 200 },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getStatusColor(params.value)}
          size="small"
          variant="outlined"
        />
      )
    },
    {
      field: 'bestScore',
      headerName: 'Best Score',
      width: 150,
      valueGetter: (params: any) => {
        if (!params || !params.row || !params.row.results) {
          return 'N/A';
        }
        const score = params.row.results.bestScore;
        return typeof score === 'number' ? score.toFixed(4) : 'N/A';
      }
    },
    {
      field: 'bestAlgorithm',
      headerName: 'Best Algorithm',
      width: 200,
      valueGetter: (params: any) => {
        if (!params || !params.row || !params.row.results) {
          return 'N/A';
        }
        return params.row.results.bestAlgorithm || 'N/A';
      }
    },
    {
      field: 'startTime',
      headerName: 'Start Time',
      width: 200,
      valueFormatter: (params: { value: any }) => {
        if (!params || !params.value) {
          return 'N/A';
        }
        return new Date(params.value).toLocaleString();
      }
    },
    {
      field: 'endTime',
      headerName: 'End Time',
      width: 200,
      valueFormatter: (params: { value: any }) => {
        if (!params || !params.value) {
          return 'Running...';
        }
        return new Date(params.value).toLocaleString();
      }
    },
  ];

  if (isLoading && !experiments.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <ExperimentsErrorBoundary>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Experiments
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Track and manage your machine learning experiments
            </Typography>
            {lastUpdated && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Last updated: {lastUpdated.toLocaleTimeString()}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Refresh experiments">
              <IconButton onClick={handleRefresh} disabled={refreshing}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              disabled
            >
              New Experiment (Coming Soon)
            </Button>
          </Box>
        </Box>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Refresh Indicator */}
        {refreshing && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Refreshing experiments...
          </Alert>
        )}

        {/* Experiments List */}
        {experiments.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No experiments found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create your first experiment to start tracking ML model performance
            </Typography>
          </Paper>
        ) : (
          <Box sx={{ space: 2 }}>
            {experiments.map((exp, index) => (
              <Accordion key={exp.experimentId} defaultExpanded={index === 0}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mr: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6">{exp.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {exp.experimentId} • {exp.runs.length} run{exp.runs.length !== 1 ? 's' : ''}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip
                        label={`${exp.runs.filter(r => r.status === 'completed').length} completed`}
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                      <Chip
                        label={`${exp.runs.filter(r => r.status === 'running').length} running`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {exp.description}
                  </Typography>

                  {exp.runs.length > 0 ? (
                    <Paper sx={{ height: 400, width: '100%' }}>
                      <DataGrid
                        rows={exp.runs.map(r => ({ ...r, id: r.runId }))}
                        columns={runCols}
                        pageSizeOptions={[5, 10, 25]}
                        initialState={{
                          pagination: { paginationModel: { pageSize: 10 } }
                        }}
                        density="compact"
                      />
                    </Paper>
                  ) : (
                    <Alert severity="info">
                      No runs found for this experiment
                    </Alert>
                  )}

                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      startIcon={<RunIcon />}
                      size="small"
                      disabled
                    >
                      New Run (Coming Soon)
                    </Button>
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )}
      </Container>
    </ExperimentsErrorBoundary>
  );
}