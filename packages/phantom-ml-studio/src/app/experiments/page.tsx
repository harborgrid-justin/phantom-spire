// src/app/experiments/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, CircularProgress, Alert, Box, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { experimentsService } from '../../services/experimentsService';
import { Experiment, ExperimentRun } from '../../services/experiments.types';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

export default function ExperimentsPage() {
    const [experiments, setExperiments] = useState<Experiment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchExperiments = async () => {
            try {
                const response = await experimentsService.getExperiments({ id: 'get_exps_req', type: 'getExperiments' } as any, {});
                if (response.success && response.data) {
                    setExperiments(response.data.experiments);
                } else {
                    setError(response.error?.message || 'Failed to fetch experiments.');
                }
            } catch (e) {
                setError((e as Error).message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchExperiments();
    }, []);

    const runCols: GridColDef[] = [
        { field: 'runId', headerName: 'Run ID', width: 200 },
        { field: 'status', headerName: 'Status', width: 120 },
        {
            field: 'bestScore',
            headerName: 'Best Score',
            width: 150,
            valueGetter: (params) => {
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
            valueGetter: (params) => {
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
            valueFormatter: (params) => {
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
            valueFormatter: (params) => {
                if (!params || !params.value) {
                    return 'N/A';
                }
                return new Date(params.value).toLocaleString();
            }
        },
    ];

    if (isLoading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
    }

    if (error) {
        return <Container maxWidth="lg" sx={{ py: 4 }}><Alert severity="error">{error}</Alert></Container>;
    }

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>Experiments</Typography>
            {experiments.map(exp => (
                <Accordion key={exp.experimentId} defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">{exp.name}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{exp.description}</Typography>
                        <Paper sx={{ height: 400, width: '100%' }}>
                            <DataGrid
                                rows={exp.runs.map(r => ({ ...r, id: r.runId }))}
                                columns={runCols}
                            />
                        </Paper>
                    </AccordionDetails>
                </Accordion>
            ))}
        </Container>
    );
}