'use client'

import React, { useEffect, useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Chip
} from '@mui/material'
import {
  ModelTraining as ModelIcon,
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  TrendingUp as TrendingIcon
} from '@mui/icons-material'
import { usePerformanceStats, useModels } from '../providers/MLCoreProvider'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  color: string
  loading?: boolean
  trend?: {
    value: number
    direction: 'up' | 'down' | 'neutral'
  }
}

function StatCard({ title, value, subtitle, icon, color, loading, trend }: StatCardProps) {
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
  const { performanceStats, refreshStats } = usePerformanceStats()
  const { models } = useModels()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true)
        await refreshStats()
      } catch (error) {
        console.error('Failed to load performance stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()

    // Refresh stats every 30 seconds
    const interval = setInterval(loadStats, 30000)
    return () => clearInterval(interval)
  }, [refreshStats])

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

  const stats = [
    {
      title: 'Active Models',
      value: models.length,
      subtitle: `${models.filter(m => m.status === 'trained').length} trained`,
      icon: <ModelIcon />,
      color: '#6366f1',
      loading: isLoading,
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

      {performanceStats && (
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
    </Box>
  )
}