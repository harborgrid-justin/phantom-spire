/**
 * Components Index
 * Central export point for all Data Explorer components
 */

// New modular components
export { DataExplorerHeader } from './DataExplorerHeader';
export { DatasetSelector } from './DatasetSelector';
export { DataExplorerTabs } from './DataExplorerTabs';

// Existing components (re-export from components subfolder)
export { default as DataExplorerErrorBoundary } from './components/DataExplorerErrorBoundary';
export { default as DataUpload } from './components/DataUpload';
export { default as DataPreview } from './components/DataPreview';
export { default as DataVisualization } from './components/DataVisualization';

// Re-export types for convenience
export type {
  Dataset,
  Column,
  SampleData
} from '@/features/data-explorer/lib';
