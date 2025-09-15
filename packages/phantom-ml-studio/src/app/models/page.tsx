// src/app/models/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, CircularProgress, Alert, Box, Chip } from '@mui/material';
import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import { modelsService } from '../../services/modelsService';
import { RegisteredModel, ModelVersion } from '../../services/models.types';

export default function ModelsPage() {
    const [models, setModels] = useState<RegisteredModel[]>([]);
    const [selectedModel, setSelectedModel] = useState<RegisteredModel | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchModels = async () => {
            try {
                const response = await modelsService.getModels({ id: 'get_models_req', type: 'getModels' } as any, {});
                if (response.success && response.data) {
                    setModels(response.data.models || []); // Ensure models is always an array
                } else {
                    setError(response.error?.message || 'Failed to fetch models.');
                    setModels([]); // Explicitly set to empty array on error
                }
            } catch (e) {
                setError((e as Error).message);
                setModels([]); // Explicitly set to empty array on error
            } finally {
                setIsLoading(false);
            }
        };
        fetchModels();
    }, []);

    const handleRowSelection = (selectionModel: GridRowSelectionModel) => {
        const selectedId = selectionModel[0];
        const model = models.find(m => m.modelId === selectedId) || null;
        setSelectedModel(model);
    };

    const modelCols: GridColDef[] = [
        { field: 'name', headerName: 'Name', width: 250 },
        { field: 'description', headerName: 'Description', width: 350 },
        { field: 'latestVersion', headerName: 'Latest Version', width: 150 },
        { field: 'updatedAt', headerName: 'Last Updated', width: 200, valueFormatter: (params) => new Date(params.value).toLocaleString() },
        { field: 'tags', headerName: 'Tags', width: 200, renderCell: (params) => (
            <Box>{(params.value || []).map((tag: string) => <Chip key={tag} label={tag} size="small" sx={{ mr: 1 }} />)}</Box>
        )},
    ];

    const versionCols: GridColDef[] = [
        { field: 'versionNumber', headerName: 'Version', width: 100 },
        { field: 'status', headerName: 'Status', width: 150, renderCell: (params) => <Chip label={params.value} color={params.value === 'production' ? 'success' : 'default'} /> },
        { field: 'description', headerName: 'Description', width: 300 },
        { field: 'createdAt', headerName: 'Created At', width: 200, valueFormatter: (params) => new Date(params.value).toLocaleString() },
        { field: 'score', headerName: 'Score', width: 120, valueGetter: (params) => params.row.trainingResults?.bestScore?.toFixed(4) || 'N/A' },
    ];

    if (isLoading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
    }

    if (error) {
        return <Container maxWidth="lg" sx={{ py: 4 }}><Alert severity="error">{error}</Alert></Container>;
    }

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>Model Registry</Typography>
            <Paper sx={{ height: 350, width: '100%', mb: 3 }}>
                <DataGrid
                    rows={models.filter(Boolean).map(m => ({ ...m, id: m.modelId }))}
                    columns={modelCols}
                    onRowSelectionModelChange={handleRowSelection}
                    rowSelectionModel={selectedModel ? [selectedModel.modelId] : []}
                />
            </Paper>

            {selectedModel && (
                <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>Versions for {selectedModel.name}</Typography>
                    <Box sx={{ height: 400, width: '100%' }}>
                        <DataGrid
                            rows={(selectedModel.versions || []).filter(Boolean).map(v => ({ ...v, id: v.versionId }))}
                            columns={versionCols}
                        />
                    </Box>
                </Paper>
            )}
        </Container>
    );
}