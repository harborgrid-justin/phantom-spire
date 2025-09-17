'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Container,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Visibility as PreviewIcon,
  Analytics as AnalyticsIcon,
  Assessment as StatisticsIcon
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { dataExplorerService } from '@/services/data-explorer';
import { Dataset, Column, SampleData } from '@/services/data-explorer';
import { ServiceContext } from '@/services/core';

// Error boundary component
class DataExplorerErrorBoundary extends React.Component<
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
    console.error('Data Explorer Error:', error, errorInfo);
    // In production, send to error reporting service
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
            Something went wrong with the data explorer. Please try refreshing the page.
          </Alert>
        </Container>
      );
    }

    return this.props.children;
  }
}

const DataExplorerClient: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [sampleData, setSampleData] = useState<SampleData[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<number>(1);
  const [selectedTab, setSelectedTab] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const createServiceContext = useCallback((): ServiceContext => ({
    requestId: `req-${Date.now()}-${Math.random()}`,
    startTime: new Date(),
    timeout: 10000,
    permissions: [],
    metadata: {},
    trace: {
      traceId: `trace-${Date.now()}`,
      spanId: `span-${Date.now()}`,
      sampled: true,
      baggage: {},
    }
  }), []);

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const context = createServiceContext();

      // Fetch datasets
      const datasetsResponse = await dataExplorerService.getDatasets({
        id: `req-datasets-${Date.now()}`,
        type: 'getDatasets',
        data: null,
        metadata: { category: 'data-explorer', module: 'data-explorer-page', version: '1.0.0' },
        context: { environment: 'development' },
        timestamp: new Date(),
      }, context);

      if (datasetsResponse.success && datasetsResponse.data) {
        setDatasets(datasetsResponse.data);
      } else {
        throw new Error(datasetsResponse.error?.message || 'Failed to fetch datasets');
      }

      // Fetch columns for selected dataset
      const columnsResponse = await dataExplorerService.getColumns({
        id: `req-columns-${Date.now()}`,
        type: 'getColumns',
        data: { datasetId: selectedDatasetId },
        metadata: { category: 'data-explorer', module: 'data-explorer-page', version: '1.0.0' },
        context: { environment: 'development' },
        timestamp: new Date(),
      }, context);

      if (columnsResponse.success && columnsResponse.data) {
        setColumns(columnsResponse.data);
      } else {
        console.warn('Failed to fetch columns:', columnsResponse.error?.message);
      }

      // Fetch sample data for selected dataset
      const sampleDataResponse = await dataExplorerService.getSampleData({
        id: `req-sample-${Date.now()}`,
        type: 'getSampleData',
        data: { datasetId: selectedDatasetId },
        metadata: { category: 'data-explorer', module: 'data-explorer-page', version: '1.0.0' },
        context: { environment: 'development' },
        timestamp: new Date(),
      }, context);

      if (sampleDataResponse.success && sampleDataResponse.data) {
        setSampleData(sampleDataResponse.data);
      } else {
        console.warn('Failed to fetch sample data:', sampleDataResponse.error?.message);
      }

      setLastUpdated(new Date());
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Data Explorer fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedDatasetId, createServiceContext]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDatasetChange = useCallback((_newDatasetId: number) => {
    setSelectedDatasetId(newDatasetId);
    setSelectedTab(0); // Reset to overview tab
  }, []);

  const handleRefresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  const selectedDataset = datasets.find(d => d.id === selectedDatasetId);

  const renderOverview = () => (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
      <Card elevation={2}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <StatisticsIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">
              Dataset Information
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">Dataset Name</Typography>
            <Typography variant="body1" fontWeight="medium">{selectedDataset?.name}</Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">Rows</Typography>
            <Typography variant="h5" color="primary.main">
              {selectedDataset?.rows.toLocaleString()}
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">Columns</Typography>
            <Typography variant="h5" color="secondary.main">
              {selectedDataset?.columns}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">Data Quality Score</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <LinearProgress
                variant="determinate"
                value={85}
                sx={{ flexGrow: 1, mr: 2, height: 8, borderRadius: 4 }}
              />
              <Typography variant="body2" fontWeight="medium">85%</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card elevation={2}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <AnalyticsIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">
              Column Types Distribution
            </Typography>
          </Box>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={columns.reduce((acc, col) => {
                const type = acc.find(t => t.type === col.type);
                if (type) {
                  type.count++;
                } else {
                  acc.push({ type: col.type, count: 1 });
                }
                return acc;
              }, [] as { type: string, count: number }[])}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="count" fill="#667eea" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );

  const renderColumns = () => (
    <Card elevation={2}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Column Analysis
        </Typography>
        <Box sx={{ overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Column Name</TableCell>
                <TableCell>Data Type</TableCell>
                <TableCell>Missing Values</TableCell>
                <TableCell>Unique Values</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {columns.map((column) => (
                <TableRow key={column.name} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {column.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={column.type}
                      size="small"
                      color={column.type === 'number' ? 'primary' : 'default'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography
                        variant="body2"
                        sx={{ color: column.missing > 0 ? 'error.main' : 'success.main' }}
                      >
                        {column.missing}
                      </Typography>
                      <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                        ({selectedDataset ? ((column.missing / selectedDataset.rows) * 100).toFixed(1) : 0}%)
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {column.unique.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View statistics">
                      <IconButton size="small" color="primary">
                        <AnalyticsIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Preview values">
                      <IconButton size="small" color="secondary">
                        <PreviewIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </CardContent>
    </Card>
  );

  const renderSampleData = () => (
    <Card elevation={2}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Sample Data
        </Typography>
        <Box sx={{ overflowX: 'auto', maxHeight: 500 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {columns.map(col => (
                  <TableCell key={col.name} sx={{ fontWeight: 'bold' }}>
                    {col.name}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sampleData.map((row, index) => (
                <TableRow key={index} hover>
                  {columns.map(col => (
                    <TableCell key={col.name}>
                      <Typography variant="body2">
                        {String(row[col.name]) || '—'}
                      </Typography>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading && !datasets.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <DataExplorerErrorBoundary>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Data Explorer
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Explore, analyze, and understand your datasets before training models
            </Typography>
            {lastUpdated && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Last updated: {lastUpdated.toLocaleTimeString()}
              </Typography>
            )}
          </Box>
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            disabled
            sx={{ minWidth: 200 }}
          >
            Upload Dataset (Coming Soon)
          </Button>
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
            Refreshing data...
          </Alert>
        )}

        {/* Dataset Selection and Actions */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3, mb: 4 }}>
          <FormControl fullWidth>
            <InputLabel>Select Dataset</InputLabel>
            <Select
              value={selectedDatasetId}
              onChange={(e) => handleDatasetChange(e.target.value as number)}
              label="Select Dataset"
            >
              {datasets.map((dataset) => (
                <MenuItem key={dataset.id} value={dataset.id}>
                  <Box>
                    <Typography variant="body1">{dataset.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {dataset.rows.toLocaleString()} rows × {dataset.columns} columns
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Refresh data">
              <IconButton onClick={handleRefresh} disabled={refreshing}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              disabled
              sx={{ flex: 1 }}
            >
              Export
            </Button>
          </Box>
        </Box>

        {/* Navigation Tabs */}
        <Card sx={{ mb: 4 }} elevation={1}>
          <CardContent sx={{ pb: 1 }}>
            <Tabs value={selectedTab} onChange={(_, newValue) => setSelectedTab(newValue)}>
              <Tab label="Overview" />
              <Tab label="Columns" />
              <Tab label="Sample Data" />
            </Tabs>
          </CardContent>
        </Card>

        {/* Content */}
        <Box sx={{ mt: 3 }}>
          {selectedTab === 0 && renderOverview()}
          {selectedTab === 1 && renderColumns()}
          {selectedTab === 2 && renderSampleData()}
        </Box>
      </Container>
    </DataExplorerErrorBoundary>
  );
};

export default DataExplorerClient;