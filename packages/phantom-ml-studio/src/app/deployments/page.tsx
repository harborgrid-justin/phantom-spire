// src/app/deployments/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, CircularProgress, Alert, Box, Chip, Link } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { deploymentsService } from '../../services/deploymentsService';
import { Deployment } from '../../services/deployment.types';

export default function DeploymentsPage() {
    const [deployments, setDeployments] = useState<Deployment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDeployments = async () => {
            try {
                const response = await deploymentsService.getDeployments({ id: 'get_deps_req', type: 'getDeployments' } as any, {});
                if (response.success && response.data) {
                    setDeployments(response.data.deployments);
                } else {
                    setError(response.error?.message || 'Failed to fetch deployments.');
                }
            } catch (e) {
                setError((e as Error).message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDeployments();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'success';
            case 'inactive': return 'default';
            case 'error': return 'error';
            default: return 'warning';
        }
    };

    const columns: GridColDef[] = [
        { field: 'deploymentId', headerName: 'Deployment ID', width: 200 },
        { field: 'modelId', headerName: 'Model ID', width: 200, valueGetter: (params) => params.row.config.modelId },
        { field: 'status', headerName: 'Status', width: 120, renderCell: (params) => <Chip label={params.value} color={getStatusColor(params.value)} /> },
        { field: 'environment', headerName: 'Environment', width: 150, valueGetter: (params) => params.row.config.environment },
        { field: 'instanceType', headerName: 'Instance Type', width: 150, valueGetter: (params) => params.row.config.instanceType },
        { field: 'endpointUrl', headerName: 'Endpoint', width: 350, renderCell: (params) => <Link href={params.value} target="_blank" rel="noopener">{params.value}</Link> },
        { field: 'createdAt', headerName: 'Created At', width: 200, valueFormatter: (params) => new Date(params.value).toLocaleString() },
    ];

    if (isLoading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
    }

    if (error) {
        return <Container maxWidth="lg" sx={{ py: 4 }}><Alert severity="error">{error}</Alert></Container>;
    }

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>Deployments</Typography>
            <Paper sx={{ height: 600, width: '100%' }}>
                <DataGrid
                    rows={deployments.map(d => ({ ...d, id: d.deploymentId }))}
                    columns={columns}
                />
            </Paper>
        </Container>
    );
}
