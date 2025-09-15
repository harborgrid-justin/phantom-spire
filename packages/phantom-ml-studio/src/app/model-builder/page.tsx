// src/app/model-builder/page.tsx
'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Container, Typography, Paper, Grid, Button, CircularProgress, Box, Alert, Select, MenuItem, FormControl, InputLabel, Checkbox, ListItemText, OutlinedInput, SelectChangeEvent } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { BarChart } from '@mui/x-charts/BarChart';

import { modelBuilderService } from '../../services/modelBuilderService';
import { UploadedData, ModelConfig, AutoMLResult, AlgorithmType, DataRow } from '../../services/modelBuilder.types';

const availableAlgorithms: AlgorithmType[] = ['simple_linear_regression', 'random_forest_regression'];

export default function ModelBuilderPage() {
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

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setIsLoading(true);
            setError(null);
            setUploadedData(null);
            setTrainingResult(null);
            try {
                const file = acceptedFiles[0];
                const response = await modelBuilderService.parseData({ id: 'parse_req', type: 'parseData', data: { file } } as any, {});
                if (response.success && response.data) {
                    setUploadedData(response.data);
                    setModelConfig(prev => ({ ...prev, targetColumn: response.data?.headers[response.data.headers.length - 1] }));
                } else {
                    setError(response.error?.message || 'Failed to parse data.');
                }
            } catch (e) {
                setError((e as Error).message);
            } finally {
                setIsLoading(false);
            }
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'text/csv': ['.csv'] } });

    const handleConfigChange = (event: SelectChangeEvent<any>) => {
        const { name, value } = event.target;
        setModelConfig(prev => ({ ...prev, [name]: value }));
    };
    
    const handleAlgorithmChange = (event: SelectChangeEvent<typeof modelConfig.algorithms>) => {
        const { target: { value } } = event;
        setModelConfig(prev => ({ ...prev, algorithms: typeof value === 'string' ? value.split(',') : value as AlgorithmType[] }));
    };

    const handleStartTraining = async () => {
        if (!uploadedData || !modelConfig.targetColumn) {
            setError('Please upload data and select a target column.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setTrainingResult(null);
        setProgress(0);

        try {
            const fullConfig: ModelConfig = {
                ...modelConfig,
                targetColumn: modelConfig.targetColumn,
                optimizationMetric: 'r2',
                timeBudget: 3600,
                maxModels: 10,
            } as ModelConfig;

            // We need to pass the actual data to the service now
            const response = await modelBuilderService.startTraining({
                id: 'train_req',
                type: 'startTraining',
                data: { config: fullConfig, columns: uploadedData.headers, data: uploadedData.data }
            } as any, {}, setProgress);

            if (response.success && response.data) {
                setTrainingResult(response.data);
            } else {
                setError(response.error?.message || 'Training failed.');
            }
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    const dataGridCols: GridColDef[] = uploadedData ? uploadedData.headers.map(h => ({ field: h, headerName: h, width: 150 })) : [];
    const dataGridRows = uploadedData ? uploadedData.data.map((row, i) => ({ id: i, ...row })) : [];

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>AutoML Model Builder</Typography>
            
            <Grid container spacing={3}>
                {/* Step 1: Upload Data */}
                <Grid item xs={12}>
                    <Paper {...getRootProps()} sx={{ p: 4, border: '2px dashed grey', textAlign: 'center', cursor: 'pointer', backgroundColor: isDragActive ? '#f0f0f0' : 'inherit' }}>
                        <input {...getInputProps()} />
                        <Typography>Drag 'n' drop a CSV file here, or click to select one.</Typography>
                    </Paper>
                </Grid>

                {isLoading && !trainingResult && <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Grid>}
                {error && <Grid item xs={12}><Alert severity="error">{error}</Alert></Grid>}

                {/* Step 2: Configure & Preview */}
                {uploadedData && (
                    <Grid item xs={12}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>Configure Training</Typography>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} md={4}>
                                    <FormControl fullWidth>
                                        <InputLabel>Target Column</InputLabel>
                                        <Select name="targetColumn" value={modelConfig.targetColumn || ''} onChange={handleConfigChange}>
                                            {uploadedData.headers.map(h => <MenuItem key={h} value={h}>{h}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <FormControl fullWidth>
                                        <InputLabel>Algorithms</InputLabel>
                                        <Select
                                            name="algorithms"
                                            multiple
                                            value={modelConfig.algorithms || []}
                                            onChange={handleAlgorithmChange}
                                            input={<OutlinedInput label="Algorithms" />}
                                            renderValue={(selected) => (selected as string[]).join(', ')}
                                        >
                                            {availableAlgorithms.map((alg) => (
                                                <MenuItem key={alg} value={alg}>
                                                    <Checkbox checked={(modelConfig.algorithms || []).indexOf(alg) > -1} />
                                                    <ListItemText primary={alg} />
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Button variant="contained" color="primary" onClick={handleStartTraining} disabled={isLoading} fullWidth size="large">
                                        Start Training
                                    </Button>
                                </Grid>
                            </Grid>
                            <Box sx={{ height: 400, width: '100%', mt: 3 }}>
                                <DataGrid rows={dataGridRows} columns={dataGridCols} pageSizeOptions={[5]} />
                            </Box>
                        </Paper>
                    </Grid>
                )}

                {/* Step 3: Training Progress & Results */}
                {isLoading && progress > 0 && (
                    <Grid item xs={12}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6">Training in Progress...</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                                <Box sx={{ width: '100%', mr: 1 }}>
                                    <CircularProgress variant="determinate" value={progress} />
                                </Box>
                                <Box sx={{ minWidth: 35 }}>
                                    <Typography variant="body2" color="text.secondary">{`${Math.round(progress)}%`}</Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>
                )}

                {trainingResult && (
                    <Grid item xs={12}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h5" gutterBottom>Training Complete</Typography>
                            <Alert severity="success" sx={{ mb: 2 }}>
                                Best Model: <strong>{trainingResult.bestAlgorithm}</strong> with a score of <strong>{trainingResult.bestScore.toFixed(4)}</strong>
                            </Alert>
                            <Typography variant="h6" gutterBottom>Model Leaderboard</Typography>
                            <Box sx={{ height: 400, width: '100%', mb: 3 }}>
                                <DataGrid
                                    rows={trainingResult.leaderboard.map(r => ({ ...r, id: r.modelId }))}
                                    columns={[
                                        { field: 'algorithm', headerName: 'Algorithm', width: 200 },
                                        { field: 'score', headerName: 'Score', width: 150, valueFormatter: (params) => params.value.toFixed(4) },
                                        { field: 'trainingTime', headerName: 'Training Time (s)', width: 150 },
                                        { field: 'hyperparameters', headerName: 'Hyperparameters', width: 300, valueFormatter: (params) => JSON.stringify(params.value) },
                                    ]}
                                />
                            </Box>
                            <Typography variant="h6" gutterBottom>Feature Importance</Typography>
                            <Box sx={{ height: 400 }}>
                                <BarChart
                                    dataset={trainingResult.featureImportance}
                                    yAxis={[{ scaleType: 'band', dataKey: 'featureName' }]}
                                    series={[{ dataKey: 'importance', label: 'Importance' }]}
                                    layout="horizontal"
                                />
                            </Box>
                        </Paper>
                    </Grid>
                )}
            </Grid>
        </Container>
    );
}
