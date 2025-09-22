'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Container,
  Tooltip,
  IconButton,
  Button
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { dataExplorerService } from '@/features/data-explorer/lib';
import { Dataset, Column, SampleData } from '@/features/data-explorer/lib';
import { ServiceContext } from '@/lib/core-logic/types/service.types';

// Import components
import DataExplorerErrorBoundary from './_components/components/DataExplorerErrorBoundary';
import DataUpload from './_components/components/DataUpload';
import DataPreview from './_components/components/DataPreview';
import DataVisualization from './_components/components/DataVisualization';

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
  
  // Upload states
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

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

  const handleDatasetChange = useCallback((newDatasetId: number) => {
    setSelectedDatasetId(newDatasetId);
    setSelectedTab(0); // Reset to overview tab
  }, []);

  const handleRefresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  const handleDatasetUploaded = useCallback((newDataset: Dataset) => {
    setDatasets(prev => [...prev, newDataset]);
    setUploadSuccess(true);
    // Simulate setting uploadedFile for preview
    if (uploadedFile) {
      setUploadedFile(uploadedFile);
    }
  }, [uploadedFile]);

  const selectedDataset = datasets.find(d => d.id === selectedDatasetId);

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

        {/* Upload Area */}
        {(!datasets.length || datasets.length === 0) && (
          <DataUpload onDatasetUploaded={handleDatasetUploaded} />
        )}

        {/* Dataset Preview */}
        {uploadedFile && (
          <DataPreview uploadedFile={uploadedFile} uploadSuccess={uploadSuccess} />
        )}

        {/* Dataset Selection and Actions */}
        {datasets.length > 0 && (
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
        )}

        {/* Navigation Tabs */}
        {datasets.length > 0 && (
          <Card sx={{ mb: 4 }} elevation={1}>
            <CardContent sx={{ pb: 1 }}>
              <Tabs value={selectedTab} onChange={(_, newValue) => setSelectedTab(newValue)}>
                <Tab label="Overview" />
                <Tab label="Columns" />
                <Tab label="Sample Data" />
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Content */}
        {datasets.length > 0 && (
          <DataVisualization
            selectedDataset={selectedDataset}
            columns={columns}
            sampleData={sampleData}
            selectedTab={selectedTab}
          />
        )}
      </Container>
    </DataExplorerErrorBoundary>
  );
};

export default DataExplorerClient;
