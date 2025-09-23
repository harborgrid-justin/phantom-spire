'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Download as DownloadIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { prefetchAnalytics, type PrefetchMetrics } from '@/shared/utils/prefetchAnalytics';

/**
 * Development-only component for monitoring prefetch performance
 * Only renders in development mode
 */
export function PrefetchAnalyticsDashboard(): JSX.Element | null {
  const [metrics, setMetrics] = useState<PrefetchMetrics | null>(null);
  const [expanded, setExpanded] = useState(false);

  // Only render in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  useEffect(() => {
    const updateMetrics = () => {
      setMetrics(prefetchAnalytics.getMetrics());
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleExport = () => {
    const data = prefetchAnalytics.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prefetch-analytics-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    prefetchAnalytics.clearData();
    setMetrics(prefetchAnalytics.getMetrics());
  };

  const handleRefresh = () => {
    setMetrics(prefetchAnalytics.getMetrics());
  };

  if (!metrics) {
    return null;
  }

  const cacheHitRate = metrics.totalPrefetches > 0
    ? ((metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses)) * 100).toFixed(1)
    : '0';

  const successRate = metrics.totalPrefetches > 0
    ? ((metrics.successfulPrefetches / metrics.totalPrefetches) * 100).toFixed(1)
    : '0';

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 9999,
        maxWidth: expanded ? 600 : 300,
        transition: 'all 0.3s ease',
      }}
    >
      <Card elevation={8}>
        <CardContent sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Prefetch Analytics
            </Typography>
            <Box>
              <IconButton size="small" onClick={handleRefresh}>
                <RefreshIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={handleExport}>
                <DownloadIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={handleClear}>
                <ClearIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => setExpanded(!expanded)}
                sx={{
                  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease',
                }}
              >
                <ExpandMoreIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {/* Summary Metrics */}
          <Grid container spacing={1} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Cache Hits
              </Typography>
              <Typography variant="h6" color="success.main">
                {cacheHitRate}%
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Success Rate
              </Typography>
              <Typography variant="h6" color="primary.main">
                {successRate}%
              </Typography>
            </Grid>
          </Grid>

          <Collapse in={expanded}>
            <Box sx={{ mt: 2 }}>
              {/* Detailed Metrics */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6">{metrics.totalPrefetches}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total Prefetches
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6">{metrics.cacheHits}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Cache Hits
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6">
                      {Math.round(metrics.totalPayloadSize / 1024)}KB
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total Payload
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Connection Types */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Connection Types
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {Object.entries(metrics.connectionTypes).map(([type, count]) => (
                    <Chip
                      key={type}
                      label={`${type}: ${count}`}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>

              {/* Top Prefetched Routes */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Top Prefetched Routes
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Route</TableCell>
                        <TableCell align="right">Count</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {metrics.topPrefetchedRoutes.slice(0, 5).map((route) => (
                        <TableRow key={route.url}>
                          <TableCell component="th" scope="row">
                            <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                              {route.url}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">{route.count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Box>
          </Collapse>
        </CardContent>
      </Card>
    </Box>
  );
}