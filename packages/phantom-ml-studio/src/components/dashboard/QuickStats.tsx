'use client'

import React, { useMemo } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  
  Chip,
  Alert,
  CircularProgress
} from '@mui/material'
import Grid from '@mui/material/Grid2'
import {
  ModelTraining as ModelIcon,
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  TrendingUp as TrendingIcon
} from '@mui/icons-material'
import { useDashboardData } from '../../hooks/useMLCore'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  color: string
  trend?: {
    value: number
    direction: 'up' | 'down' | 'neutral'
  }
}

const StatCard = React.memo(function StatCard({ title, value, subtitle, icon, color, trend }: StatCardProps) {
  const trendAriaLabel = trend
    ? `Trend: ${trend.direction} ${Math.abs(trend.value)}% compared to last hour`
    : undefined

  return (
    <Card
      className="ml-card h-full"
      component="article"
      role="region"
      aria-labelledby={`stat-${title.replace(/\s+/g, '-').toLowerCase()}-title`}
    >
      <CardContent className="p-6">
        <Box className="flex items-start justify-between">
          <Box className="flex-1">
            <Typography
              id={`stat-${title.replace(/\s+/g, '-').toLowerCase()}-title`}
              variant="body2"
              color="text.secondary"
              className="mb-2"
              component="h3"
            >
              {title}
            </Typography>
            <Typography
              variant="h4"
              className="font-bold mb-1"
              style={{ color }}
              aria-describedby={subtitle ? `stat-${title.replace(/\s+/g, '-').toLowerCase()}-subtitle` : undefined}
            >
              {value}
            </Typography>
            {subtitle && (
              <Typography
                id={`stat-${title.replace(/\s+/g, '-').toLowerCase()}-subtitle`}
                variant="body2"
                color="text.secondary"
              >
                {subtitle}
              </Typography>
            )}
            {trend && (
              <Box className="flex items-center gap-1 mt-2" aria-label={trendAriaLabel}>
                <Chip
                  size="small"
                  label={`${trend.direction === 'up' ? '+' : trend.direction === 'down' ? '-' : ''}${Math.abs(trend.value)}%`}
                  color={trend.direction === 'up' ? 'success' : trend.direction === 'down' ? 'error' : 'default'}
                  variant="outlined"
                  aria-label={`${Math.abs(trend.value)}% ${trend.direction} trend`}
                />
                <Typography variant="caption" color="text.secondary">
                  vs last hour
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            className="p-3 rounded-lg"
            style={{ backgroundColor: `${color}20` }}
            role="img"
            aria-label={`${title} icon`}
          >
            {React.cloneElement(icon as React.ReactElement, {
              style: { color, fontSize: 28 },
              'aria-hidden': true
            })}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
})

export function QuickStats() {
  const { performance, models, isLoading, hasError } = useDashboardData({
    refetchInterval: 30000 // 30 seconds
  })

  const performanceStats = performance.data
  const modelsData = models.data || []
  const error = hasError

  const formatDuration = React.useCallback((seconds: number): string => {
    if (seconds < 60) return `${seconds}s`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
  }, [])

  const formatLatency = React.useCallback((ms: number): string => {
    if (ms < 1) return `${(ms * 1000).toFixed(0)}μs`
    if (ms < 1000) return `${ms.toFixed(1)}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }, [])

  const formatMemory = React.useCallback((mb: number): string => {
    if (mb < 1024) return `${mb.toFixed(1)} MB`
    return `${(mb / 1024).toFixed(1)} GB`
  }, [])

  const { trainedModels, deployedModels } = useMemo(() => {
    const filteredModels = modelsData || []
    return {
      trainedModels: filteredModels.filter(m => m.status === 'trained').length,
      deployedModels: filteredModels.filter(m => m.status === 'deployed').length
    }
  }, [modelsData])

  const stats = useMemo(() => [
    {
      title: 'Active Models',
      value: modelsData.length,
      subtitle: `${trainedModels} trained, ${deployedModels} deployed`,
      icon: <ModelIcon />,
      color: '#6366f1',
      trend: {
        value: 12,
        direction: 'up' as const
      }
    },
    {
      title: 'Total Operations',
      value: performanceStats?.total_operations || 0,
      subtitle: 'Lifetime predictions',
      icon: <TrendingIcon />,
      color: '#14b8a6',
      trend: {
        value: 8,
        direction: 'up' as const
      }
    },
    {
      title: 'Avg Latency',
      value: performanceStats ? formatLatency(performanceStats.average_inference_time_ms) : '0ms',
      subtitle: 'Per prediction',
      icon: <SpeedIcon />,
      color: '#f59e0b',
      trend: {
        value: 5,
        direction: 'down' as const
      }
    },
    {
      title: 'Memory Usage',
      value: performanceStats ? formatMemory(performanceStats.peak_memory_usage_mb) : '0 MB',
      subtitle: 'Peak usage',
      icon: <MemoryIcon />,
      color: '#8b5cf6',
      trend: {
        value: 2,
        direction: 'neutral' as const
      }
    }
  ], [modelsData.length, trainedModels, deployedModels, performanceStats, formatLatency, formatMemory])

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress size={40} />
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h5" className="font-bold text-gray-900 mb-6">
        Performance Overview
      </Typography>

      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      <Grid container spacing={3} role="group" aria-label="Performance statistics">
        {stats.map((stat, index) => (
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={stat.title}>
            <Box
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <StatCard {...stat} />
            </Box>
          </Grid>
        ))}
      </Grid>

      {performanceStats && !error && (
        <Box className="mt-6 p-4 bg-blue-50 rounded-lg">
          <Typography variant="body2" className="font-medium mb-2">
            System Uptime
          </Typography>
          <Typography variant="h6" color="primary">
            {formatDuration(performanceStats.uptime_seconds)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Since last restart
          </Typography>
        </Box>
      )}

      {performanceStats && !error && (
        <Box className="mt-4 p-4 bg-gray-50 rounded-lg">
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Active Models
              </Typography>
              <Typography variant="h6" color="primary">
                {performanceStats.active_models}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Total Operations
              </Typography>
              <Typography variant="h6" color="primary">
                {performanceStats.total_operations.toLocaleString()}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Avg Inference Time
              </Typography>
              <Typography variant="h6" color="primary">
                {formatLatency(performanceStats.average_inference_time_ms)}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Peak Memory
              </Typography>
              <Typography variant="h6" color="primary">
                {formatMemory(performanceStats.peak_memory_usage_mb)}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  )
}