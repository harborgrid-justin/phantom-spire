/**
 * Custom Hook for Data Explorer State Management
 * Manages data explorer state, data fetching, and dataset operations
 */

import { useState, useEffect, useCallback } from 'react';
import { dataExplorerService } from '@/features/data-explorer/lib';
import { Dataset, Column, SampleData } from '@/features/data-explorer/lib';
import { ServiceContext } from '@/lib/core-logic/types/service.types';

export const useDataExplorerState = () => {
  // State
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

  // Service context creation
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

  // Data fetching function
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

  // Event handlers
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

  const handleTabChange = useCallback((newTab: number) => {
    setSelectedTab(newTab);
  }, []);

  const handleErrorDismiss = useCallback(() => {
    setError(null);
  }, []);

  // Load data on mount and when selectedDatasetId changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Computed values
  const selectedDataset = datasets.find(d => d.id === selectedDatasetId);

  return {
    // State
    loading,
    refreshing,
    datasets,
    columns,
    sampleData,
    selectedDatasetId,
    selectedTab,
    error,
    lastUpdated,
    uploadedFile,
    uploadSuccess,
    selectedDataset,
    
    // Actions
    handleDatasetChange,
    handleRefresh,
    handleDatasetUploaded,
    handleTabChange,
    handleErrorDismiss,
    fetchData,
    
    // Setters (for advanced use cases)
    setLoading,
    setRefreshing,
    setDatasets,
    setColumns,
    setSampleData,
    setSelectedDatasetId,
    setSelectedTab,
    setError,
    setLastUpdated,
    setUploadedFile,
    setUploadSuccess
  };
};
