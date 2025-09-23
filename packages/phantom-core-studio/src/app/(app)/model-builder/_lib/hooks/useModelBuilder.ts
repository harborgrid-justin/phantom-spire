/**
 * Custom hook for managing Model Builder state and logic
 */

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { SelectChangeEvent } from '@mui/material';

import { modelBuilderService } from '@/features/model-builder/lib';
import { UploadedData, ModelConfig, AutoMLResult, AlgorithmType } from '@/features/model-builder/lib';
import { Dataset, AlgorithmInfo, ModelBuilderState } from '../../../../../lib/ml-core/types';
import { sampleColumns } from '../data/sampleData';

const availableAlgorithms: AlgorithmType[] = ['simple_linear_regression', 'random_forest_regression'];

export function useModelBuilder() {
  const [state, setState] = useState<ModelBuilderState>({
    activeStep: 0,
    selectedDataset: null,
    selectedFeatures: [],
    selectedTargetColumn: '',
    selectedAlgorithmCategory: '',
    selectedAlgorithms: [],
    selectedAlgorithm: null,
    showRecommendations: false,
    complexityFilter: '',
    showAlgorithmConfig: false,
    validationError: null,
  });

  const [uploadedData, setUploadedData] = useState<UploadedData | null>(null);
  const [modelConfig, setModelConfig] = useState<Partial<ModelConfig>>({
    taskType: 'regression',
    algorithms: ['simple_linear_regression'],
    featureEngineering: true,
    crossValidationFolds: 5,
    ensembleMethods: true,
  });
  const [trainingResult, setTrainingResult] = useState<AutoMLResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [trainingStatus, setTrainingStatus] = useState('');

  // Auto-clear errors after 10 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 10000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const updateState = useCallback((updates: Partial<ModelBuilderState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setIsLoading(true);
      setError(null);
      setUploadedData(null);
      setTrainingResult(null);
      updateState({ activeStep: 0 });

      try {
        const file = acceptedFiles[0];
        setTrainingStatus('Parsing uploaded file...');

        const response = await modelBuilderService.parseData({
          id: 'parse_req',
          type: 'parseData',
          data: { file }
        } as any, {
          requestId: `req-${Date.now()}`,
          startTime: new Date(),
          timeout: 30000,
          permissions: [],
          metadata: {},
          trace: {
            traceId: `trace-${Date.now()}`,
            spanId: `span-${Date.now()}`,
            sampled: true,
            baggage: {},
          }
        });

        if (response.success && response.data) {
          setUploadedData(response.data);
          setModelConfig(prev => ({
            ...prev,
            targetColumn: response.data?.headers[response.data.headers.length - 1] || ''
          }));
          updateState({ activeStep: 1 });
        } else {
          setError(response.error?.message || 'Failed to parse uploaded file.');
        }
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Failed to process file';
        setError(errorMessage);
        console.error('File upload error:', e);
      } finally {
        setIsLoading(false);
        setTrainingStatus('');
      }
    }
  }, [updateState]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB limit
  });

  const handleConfigChange = useCallback((event: SelectChangeEvent<any>) => {
    const { name, value } = event.target;
    setModelConfig(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleAlgorithmChange = useCallback((event: SelectChangeEvent<any>) => {
    const { target: { value } } = event;
    setModelConfig(prev => ({
      ...prev,
      algorithms: (typeof value === 'string' ? value.split(',') : value) as AlgorithmType[]
    }));
  }, []);

  const handleDatasetSelect = useCallback((dataset: Dataset) => {
    updateState({ selectedDataset: dataset });
  }, [updateState]);

  const handleTargetSelect = useCallback((columnName: string) => {
    updateState({ selectedTargetColumn: columnName });
  }, [updateState]);

  const handleFeaturesChange = useCallback((features: string[]) => {
    updateState({ selectedFeatures: features });
  }, [updateState]);

  const handleStepChange = useCallback((step: number) => {
    updateState({ activeStep: step });
  }, [updateState]);

  const handleStartTraining = useCallback(async () => {
    if (!uploadedData || !modelConfig.targetColumn) {
      setError('Please upload data and select a target column.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setTrainingResult(null);
    setProgress(0);
    updateState({ activeStep: 2 });

    try {
      const fullConfig: ModelConfig = {
        ...modelConfig,
        targetColumn: modelConfig.targetColumn,
        optimizationMetric: 'r2',
        timeBudget: 3600,
        maxModels: 10,
      } as ModelConfig;

      setTrainingStatus('Initializing training pipeline...');

      const progressCallback = (newProgress: number) => {
        setProgress(newProgress);
        if (newProgress < 25) {
          setTrainingStatus('Preprocessing data...');
        } else if (newProgress < 50) {
          setTrainingStatus('Training models...');
        } else if (newProgress < 75) {
          setTrainingStatus('Evaluating performance...');
        } else {
          setTrainingStatus('Finalizing results...');
        }
      };

      const response = await modelBuilderService.startTraining({
        id: 'train_req',
        type: 'startTraining',
        data: {
          config: fullConfig,
          columns: uploadedData.headers,
          data: uploadedData.data
        }
      } as any, {
        requestId: `req-${Date.now()}`,
        startTime: new Date(),
        timeout: 300000, // 5 minute timeout
        permissions: [],
        metadata: {},
        trace: {
          traceId: `trace-${Date.now()}`,
          spanId: `span-${Date.now()}`,
          sampled: true,
          baggage: {},
        }
      }, progressCallback);

      if (response.success && response.data) {
        setTrainingResult(response.data);
        setTrainingStatus('Training completed successfully!');
      } else {
        setError(response.error?.message || 'Training failed.');
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Training process failed';
      setError(errorMessage);
      console.error('Training error:', e);
    } finally {
      setIsLoading(false);
    }
  }, [uploadedData, modelConfig, updateState]);

  const handleMockDatasetSelect = useCallback((dataset: Dataset) => {
    if (dataset) {
      // Set mock uploaded data based on selected dataset
      const mockData: UploadedData = {
        headers: sampleColumns.map(col => col.name),
        data: [], // Empty for demo
        errors: []
      };
      setUploadedData(mockData);
      updateState({ 
        selectedTargetColumn: 'performance_score',
        activeStep: 2 
      });
    }
  }, [updateState]);

  return {
    // State
    ...state,
    uploadedData,
    modelConfig,
    trainingResult,
    isLoading,
    error,
    progress,
    trainingStatus,
    availableAlgorithms,

    // Actions
    updateState,
    handleConfigChange,
    handleAlgorithmChange,
    handleDatasetSelect,
    handleTargetSelect,
    handleFeaturesChange,
    handleStepChange,
    handleStartTraining,
    handleMockDatasetSelect,
    setError,

    // Dropzone
    getRootProps,
    getInputProps,
    isDragActive,
  };
}
