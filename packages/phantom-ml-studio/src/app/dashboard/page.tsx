// src/app/dashboard/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Paper, CircularProgress, Alert, Card, CardContent, Box, List, ListItem, ListItemText, Divider } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';

import { dashboardService } from '../../services/dashboardService';
import { DashboardData } from '../../services/dashboard.types';

export default function DashboardPage() {
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await dashboardService.getDashboardData({ id: 'dash_req', type: 'getDashboardData' } as any, {});
                if (response.success && response.data) {
                    setDashboardData(response.data);
                } else {
                    setError(response.error?.message || 'Failed to fetch dashboard data.');
                }
            } catch (e) {
                setError((e as Error).message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    if (isLoading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
    }

    if (error) {
        return <Container maxWidth="lg" sx={{ py: 4 }}><Alert severity="error">{error}</Alert></Container>;
    }

    if (!dashboardData) {
        return <Container maxWidth="lg" sx={{ py: 4 }}><Typography>No dashboard data available.</Typography></Container>;
    }

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>Dashboard</Typography>
            
            {/* Key Metrics */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Models in Production</Typography>
                            <Typography variant="h3">{dashboardData.modelsInProduction}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Active Experiments</Typography>
                            <Typography variant="h3">{dashboardData.activeExperiments}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                {dashboardData.performanceMetrics.map(metric => (
                     <Grid item xs={12} sm={6} md={2} key={metric.name}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">{metric.name}</Typography>
                                <Typography variant="h4">{metric.value}{metric.name === 'Model Accuracy' ? '%' : 'ms'}</Typography>
                                <Typography color={metric.change > 0 ? 'success.main' : 'error.main'}>
                                    {metric.change > 0 ? '▲' : '▼'} {Math.abs(metric.change)}%
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={3}>
                {/* Resource Utilization */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>Resource Utilization</Typography>
                        <Box sx={{ height: 300 }}>
                            <BarChart
                                dataset={dashboardData.resourceUtilization}
                                xAxis={[{ scaleType: 'band', dataKey: 'name' }]}
                                series={[{ dataKey: 'usage', label: 'Usage (%)' }]}
                            />
                        </Box>
                    </Paper>
                </Grid>

                {/* Recent Activity */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>Recent Activity</Typography>
                        <List>
                            {dashboardData.recentActivity.map((activity, index) => (
                                <React.Fragment key={activity.id}>
                                    <ListItem>
                                        <ListItemText
                                            primary={activity.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            secondary={activity.description}
                                        />
                                        <Typography variant="caption">{new Date(activity.timestamp).toLocaleTimeString()}</Typography>
                                    </ListItem>
                                    {index < dashboardData.recentActivity.length - 1 && <Divider />}
                                </React.Fragment>
                            ))}
                        </List>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
}