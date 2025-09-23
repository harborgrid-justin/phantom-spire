/**
 * Data Explorer Client Component
 * 
 * Main data exploration interface providing:
 * - Dataset selection and management
 * - Data preview and visualization
 * - Column analysis and sample data views
 * - Upload functionality for new datasets
 *
 * REFACTORED: Now uses modular components and custom hooks for better maintainability:
 * - useDataExplorerState: Manages all data explorer state and operations
 * - DataExplorerHeader: Header with title and action buttons
 * - DatasetSelector: Dataset selection and refresh controls
 * - DataExplorerTabs: Navigation tabs for different views
 * - Existing components: DataUpload, DataPreview, DataVisualization
 */

'use client';

import React from 'react';
import {
  Box,
  CircularProgress,
  Alert,
  Container
} from '@mui/material';

// Custom hooks
import { useDataExplorerState } from './_hooks/useDataExplorerState';

// Components
import {
  DataExplorerErrorBoundary,
  DataExplorerHeader,
  DatasetSelector,
  DataExplorerTabs,
  DataUpload,
  DataPreview,
  DataVisualization
} from './_components';

const DataExplorerClient: React.FC = () => {
  // Use the custom hook for state management
  const {
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
    handleDatasetChange,
    handleRefresh,
    handleDatasetUploaded,
    handleTabChange,
    handleErrorDismiss
  } = useDataExplorerState();

  // Loading state
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
        <DataExplorerHeader lastUpdated={lastUpdated} />

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={handleErrorDismiss}>
            {error}
          </Alert>
        )}

        {/* Refresh Indicator */}
        {refreshing && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Refreshing data...
          </Alert>
        )}

        {/* Upload Area - Show when no datasets or empty datasets */}
        {(!datasets.length || datasets.length === 0) && (
          <DataUpload onDatasetUploaded={handleDatasetUploaded} />
        )}

        {/* Dataset Preview - Show when file is uploaded */}
        {uploadedFile && (
          <DataPreview uploadedFile={uploadedFile} uploadSuccess={uploadSuccess} />
        )}

        {/* Dataset Selection and Actions - Show when datasets exist */}
        {datasets.length > 0 && (
          <DatasetSelector
            datasets={datasets}
            selectedDatasetId={selectedDatasetId}
            refreshing={refreshing}
            onDatasetChange={handleDatasetChange}
            onRefresh={handleRefresh}
          />
        )}

        {/* Navigation Tabs - Show when datasets exist */}
        {datasets.length > 0 && (
          <DataExplorerTabs
            selectedTab={selectedTab}
            onTabChange={handleTabChange}
          />
        )}

        {/* Content - Show when datasets exist */}
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
