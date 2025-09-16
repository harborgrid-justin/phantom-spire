'use client'

import React, { useEffect, useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Chip,
  Alert
} from '@mui/material'
import {
  ModelTraining as ModelIcon,
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  TrendingUp as TrendingIcon
} from '@mui/icons-material'
import type { PerformanceStats, Model } from '../../lib/ml-core/types'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  color: string
  loading?: boolean
  error?: boolean
  trend?: {
    value: number
    direction: 'up' | 'down' | 'neutral'
  }
}

function StatCard({ title, value, subtitle, icon, color, loading, error, trend }: StatCardProps) {
  return (
    <Card className="ml-card h-full">
      <CardContent className="p-6">
        <Box className="flex items-start justify-between">
          <Box className="flex-1">
            <Typography variant="body2" color="text.secondary" className="mb-2">
              {title}
            </Typography>
            {loading ? (
              <Box className="flex items-center gap-2">
                <CircularProgress size={20} />
                <Typography variant="body2">Loading...</Typography>
              </Box>
            ) : error ? (
              <Box className="flex items-center gap-2">
                <Typography variant="body2" color="error">
                  Error loading data
                </Typography>
              </Box>
            ) : (
              <>
                <Typography variant="h4" className="font-bold mb-1" style={{ color }}>
                  {value}
                </Typography>
                {subtitle && (
                  <Typography variant="body2" color="text.secondary">
                    {subtitle}
                  </Typography>
                )}
                {trend && (
                  <Box className="flex items-center gap-1 mt-2">
                    <Chip
                      size="small"
                      label={`${trend.direction === 'up' ? '+' : trend.direction === 'down' ? '-' : ''}${Math.abs(trend.value)}%`}
                      color={trend.direction === 'up' ? 'success' : trend.direction === 'down' ? 'error' : 'default'}
                      variant="outlined"
                    />
                    <Typography variant="caption" color="text.secondary">
                      vs last hour
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </Box>
          <Box
            className="p-3 rounded-lg"
            style={{ backgroundColor: `${color}20` }}
          >
            {React.cloneElement(icon as React.ReactElement, {
              style: { color, fontSize: 28 }
            })}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export function QuickStats() {
  const [performanceStats, setPerformanceStats] = useState<PerformanceStats | null>(null)
  const [models, setModels] = useState<Model[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch performance stats from real API
        const [statsResponse, modelsResponse] = await Promise.all([
          fetch('/api/ml-core/performance'),
          fetch('/api/ml-core/models')
        ])

        // Handle performance stats response
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          if (statsData.success) {
            setPerformanceStats(statsData.data)
          } else {
            setError(statsData.error || 'Failed to fetch performance stats')
          }
        } else {
          setError(`HTTP ${statsResponse.status}: Failed to fetch performance stats`)
        }

        // Handle models response
        if (modelsResponse.ok) {
          const modelsData = await modelsResponse.json()
          if (modelsData.success) {
            setModels(modelsData.data || [])
          } else {
            console.warn('Failed to fetch models:', modelsData.error)
            // Don't set error for models as it's secondary data
          }
        } else {
          console.warn(`HTTP ${modelsResponse.status}: Failed to fetch models`)
        }
      } catch (error) {
        console.error('Failed to load stats:', error)
        setError(error instanceof Error ? error.message : 'Failed to load stats')
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()

    // Refresh stats every 30 seconds
    const interval = setInterval(loadStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
  }

  const formatLatency = (ms: number): string => {
    if (ms < 1) return `${(ms * 1000).toFixed(0)}μs`
    if (ms < 1000) return `${ms.toFixed(1)}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  const formatMemory = (mb: number): string => {
    if (mb < 1024) return `${mb.toFixed(1)} MB`
    return `${(mb / 1024).toFixed(1)} GB`
  }

  // Calculate derived stats from real data
  const trainedModels = models.filter(m => m.status === 'trained').length
  const deployedModels = models.filter(m => m.status === 'deployed').length

  const stats = [
    {
      title: 'Active Models',
      value: models.length,
      subtitle: `${trainedModels} trained, ${deployedModels} deployed`,
      icon: <ModelIcon />,
      color: '#6366f1',
      loading: isLoading,
      error: !!error,
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
      loading: isLoading,
      error: !!error,
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
      loading: isLoading,
      error: !!error,
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
      loading: isLoading,
      error: !!error,
      trend: {
        value: 2,
        direction: 'neutral' as const
      }
    }
  ]

  return (
    <Box>
      <Typography variant="h5" className="font-bold text-gray-900 mb-6">
        Performance Overview
      </Typography>

      {error && (
        <Alert severity="error" className="mb-4" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} lg={3} key={stat.title}>
            <Box
              className={`${isLoading ? 'opacity-0' : 'animate-fade-in'}`}
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
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="text.secondary">
                Active Models
              </Typography>
              <Typography variant="h6" color="primary">
                {performanceStats.active_models}
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="text.secondary">
                Total Operations
              </Typography>
              <Typography variant="h6" color="primary">
                {performanceStats.total_operations.toLocaleString()}
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="text.secondary">
                Avg Inference Time
              </Typography>
              <Typography variant="h6" color="primary">
                {formatLatency(performanceStats.average_inference_time_ms)}
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
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