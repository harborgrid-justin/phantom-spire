'use client'

import React, { useMemo } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress
} from '@mui/material'
import Grid from '@mui/material/Grid2'
import {
  TrendingUp as TrendingIcon,
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  Storage as StorageIcon
} from '@mui/icons-material'
import { TimeAgo } from '../common/TimeAgo'
import { useDashboardData } from '../../hooks/useMLCore'

interface MetricCardProps {
  title: string
  value: number
  max: number
  unit: string
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  icon: React.ReactNode
}

const MetricCard = React.memo(function MetricCard({ title, value, max, unit, color, icon }: MetricCardProps) {
  const percentage = (value / max) * 100
  const safePercentage = Math.min(percentage, 100)
  const usageLevel = percentage > 80 ? 'High' : percentage > 50 ? 'Medium' : 'Low'

  const titleId = `metric-${title.replace(/\s+/g, '-').toLowerCase()}-title`
  const progressId = `metric-${title.replace(/\s+/g, '-').toLowerCase()}-progress`

  return (
    <Card
      className="ml-card"
      component="article"
      role="region"
      aria-labelledby={titleId}
    >
      <CardContent>
        <Box className="flex items-center justify-between mb-3">
          <Typography
            id={titleId}
            variant="h6"
            className="font-semibold"
            component="h3"
          >
            {title}
          </Typography>
          <Box
            className="p-2 rounded-lg bg-gray-100"
            role="img"
            aria-label={`${title} metric icon`}
          >
            {React.cloneElement(icon as React.ReactElement, {
              'aria-hidden': true
            })}
          </Box>
        </Box>

        <Typography
          variant="h4"
          className="font-bold mb-2"
          aria-describedby={progressId}
        >
          {value.toFixed(1)} {unit}
        </Typography>

        <LinearProgress
          id={progressId}
          variant="determinate"
          value={safePercentage}
          color={color}
          className="mb-2"
          sx={{ height: 8, borderRadius: 4 }}
          aria-label={`${title} usage: ${percentage.toFixed(1)}% of capacity`}
        />

        <Box className="flex items-center justify-between">
          <Typography variant="body2" color="text.secondary">
            {percentage.toFixed(1)}% of capacity
          </Typography>
          <Chip
            size="small"
            label={usageLevel}
            color={percentage > 80 ? 'warning' : percentage > 50 ? 'info' : 'success'}
            variant="outlined"
            aria-label={`Usage level: ${usageLevel}`}
          />
        </Box>
      </CardContent>
    </Card>
  )
})

export function PerformanceOverview() {
  const { performance, models, isLoading, hasError } = useDashboardData({
    refetchInterval: 15000 // 15 seconds
  })

  const performanceStats = performance.data
  const modelsData = models.data || []
  const error = hasError

  // Define memos before any early returns to avoid React hooks rule violations
  const metrics = useMemo(() => [
    {
      title: 'CPU Usage',
      value: Math.random() * 80, // Mock CPU usage
      max: 100,
      unit: '%',
      color: 'primary' as const,
      icon: <TrendingIcon />
    },
    {
      title: 'Memory',
      value: performanceStats?.peak_memory_usage_mb || 0,
      max: 1024, // 1GB max for demo
      unit: 'MB',
      color: 'secondary' as const,
      icon: <MemoryIcon />
    },
    {
      title: 'Avg Latency',
      value: performanceStats?.average_inference_time_ms || 0,
      max: 100, // 100ms max for good performance
      unit: 'ms',
      color: 'warning' as const,
      icon: <SpeedIcon />
    },
    {
      title: 'Disk I/O',
      value: Math.random() * 50, // Mock disk usage
      max: 100,
      unit: 'MB/s',
      color: 'success' as const,
      icon: <StorageIcon />
    }
  ], [performanceStats])

  const modelPerformanceData = useMemo(() => modelsData.map((model) => ({
    name: model.name,
    accuracy: model.accuracy || 0,
    predictions: Math.floor(Math.random() * 1000) + 100,
    avgLatency: (Math.random() * 10) + 1,
    lastUsed: new Date(Date.now() - Math.random() * 86400000).toISOString()
  })), [modelsData])

  if (isLoading) {
    return (
      <Box>
        <Typography variant="h5" className="font-bold text-gray-900 mb-6">
          Performance Monitoring
        </Typography>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </Box>
    )
  }

  if (error) {
    return (
      <Box>
        <Typography variant="h5" className="font-bold text-gray-900 mb-6">
          Performance Monitoring
        </Typography>
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="error" gutterBottom>
            Error Loading Performance Data
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {error}
          </Typography>
        </Box>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h5" className="font-bold text-gray-900 mb-6">
        Performance Monitoring
      </Typography>

      {/* System Metrics */}
      <Grid
        container
        spacing={3}
        className="mb-8"
        role="group"
        aria-label="System performance metrics"
      >
        {metrics.map((metric, index) => (
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={metric.title}>
            <Box
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <MetricCard {...metric} />
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Model Performance Table */}
      <Card className="ml-card">
        <CardContent>
          <Typography variant="h6" className="font-semibold mb-4">
            Model Performance
          </Typography>

          {modelPerformanceData.length > 0 ? (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Model Name</TableCell>
                    <TableCell align="right">Accuracy</TableCell>
                    <TableCell align="right">Predictions</TableCell>
                    <TableCell align="right">Avg Latency</TableCell>
                    <TableCell align="right">Last Used</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {modelPerformanceData.map((model) => (
                    <TableRow key={model.name} hover>
                      <TableCell component="th" scope="row">
                        <Typography variant="body2" className="font-medium">
                          {model.name}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={`${(model.accuracy * 100).toFixed(1)}%`}
                          size="small"
                          color={model.accuracy > 0.9 ? 'success' : model.accuracy > 0.8 ? 'warning' : 'error'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {model.predictions.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {model.avgLatency.toFixed(1)}ms
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="text.secondary">
                          <TimeAgo timestamp={model.lastUsed} />
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box className="text-center py-8">
              <Typography variant="body1" color="text.secondary">
                No models available for performance monitoring
              </Typography>
              <Typography variant="body2" color="text.secondary" className="mt-2">
                Train your first model to see performance metrics
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* System Health Summary */}
      <Card className="ml-card mt-6">
        <CardContent>
          <Typography variant="h6" className="font-semibold mb-4">
            System Health Summary
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box className="text-center p-4 bg-green-50 rounded-lg">
                <Typography variant="h3" className="font-bold text-green-600 mb-2">
                  {performanceStats.total_operations}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Operations
                </Typography>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Box className="text-center p-4 bg-blue-50 rounded-lg">
                <Typography variant="h3" className="font-bold text-blue-600 mb-2">
                  {performanceStats.active_models}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Models
                </Typography>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Box className="text-center p-4 bg-purple-50 rounded-lg">
                <Typography variant="h3" className="font-bold text-purple-600 mb-2">
                  {Math.floor(performanceStats.uptime_seconds / 3600)}h
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Uptime
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  )
}