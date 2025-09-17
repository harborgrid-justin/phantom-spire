'use client'

import React from 'react'
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  LinearProgress,
  Skeleton,
  Typography,
  
  Stack,
  Fade,
  useTheme
} from '@mui/material'
import Grid from '@mui/material/Grid2'
import { keyframes } from '@mui/system'

// Shimmer animation for skeleton loading
const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`

interface LoadingSpinnerProps {
  size?: number
  message?: string
  fullScreen?: boolean
}

export function LoadingSpinner({
  size = 40,
  message = 'Loading...',
  fullScreen = false
}: LoadingSpinnerProps) {
  const content = (
    <Stack
      direction="column"
      alignItems="center"
      justifyContent="center"
      spacing={2}
      sx={{ py: fullScreen ? 8 : 4 }}
    >
      <CircularProgress size={size} />
      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </Stack>
  )

  if (fullScreen) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        width="100%"
      >
        {content}
      </Box>
    )
  }

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      width="100%"
      minHeight="200px"
    >
      {content}
    </Box>
  )
}

interface LoadingProgressProps {
  value?: number
  message?: string
  variant?: 'determinate' | 'indeterminate'
}

export function LoadingProgress({
  value,
  message = 'Processing...',
  variant = 'indeterminate'
}: LoadingProgressProps) {
  return (
    <Box sx={{ width: '100%', py: 2 }}>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {message}
      </Typography>
      <LinearProgress
        variant={variant}
        value={value}
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: 'grey.200',
          '& .MuiLinearProgress-bar': {
            borderRadius: 4,
          },
        }}
      />
      {variant === 'determinate' && value !== undefined && (
        <Box display="flex" justifyContent="flex-end" mt={1}>
          <Typography variant="caption" color="text.secondary">
            {Math.round(value)}%
          </Typography>
        </Box>
      )}
    </Box>
  )
}

interface SkeletonCardProps {
  lines?: number
  hasAvatar?: boolean
  hasActions?: boolean
  height?: number
}

export function SkeletonCard({
  lines = 3,
  hasAvatar = false,
  hasActions = false,
  height = 140
}: SkeletonCardProps) {
  const theme = useTheme()

  return (
    <Card
      sx={{
        height,
        background: `linear-gradient(90deg, ${theme.palette.grey[50]} 0px, ${theme.palette.grey[100]} 40px, ${theme.palette.grey[50]} 80px)`,
        backgroundSize: '400px',
        animation: `${shimmer} 1.5s ease-in-out infinite`,
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="flex-start" gap={2}>
          {hasAvatar && (
            <Skeleton variant="circular" width={40} height={40} />
          )}
          <Box flex={1}>
            <Skeleton variant="text" width="60%" height={24} />
            {Array.from({ length: lines }).map((_, index) => (
              <Skeleton
                key={index}
                variant="text"
                width={index === lines - 1 ? '40%' : '90%'}
                height={20}
                sx={{ mt: 0.5 }}
              />
            ))}
            {hasActions && (
              <Box display="flex" gap={1} mt={2}>
                <Skeleton variant="rectangular" width={80} height={32} />
                <Skeleton variant="rectangular" width={80} height={32} />
              </Box>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

interface SkeletonTableProps {
  rows?: number
  columns?: number
}

export function SkeletonTable({ rows = 5, columns = 6 }: SkeletonTableProps) {
  return (
    <Box>
      {/* Table Header */}
      <Grid container spacing={1} sx={{ mb: 2, px: 2 }}>
        {Array.from({ length: columns }).map((_, index) => (
          <Grid xs key={index}>
            <Skeleton variant="text" width="80%" height={20} />
          </Grid>
        ))}
      </Grid>

      {/* Table Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <Grid container spacing={1} key={rowIndex} sx={{ mb: 1, px: 2 }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Grid xs key={colIndex}>
              <Skeleton
                variant="text"
                width={colIndex === 0 ? '60%' : '90%'}
                height={16}
              />
            </Grid>
          ))}
        </Grid>
      ))}
    </Box>
  )
}

interface LoadingOverlayProps {
  loading: boolean
  message?: string
  children: React.ReactNode
  opacity?: number
}

export function LoadingOverlay({
  loading,
  message = 'Loading...',
  children,
  opacity = 0.7
}: LoadingOverlayProps) {
  return (
    <Box position="relative">
      {children}

      <Fade in={loading}>
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          display="flex"
          alignItems="center"
          justifyContent="center"
          bgcolor={`rgba(255, 255, 255, ${opacity})`}
          zIndex={10}
          sx={{
            backdropFilter: 'blur(2px)',
          }}
        >
          <Stack alignItems="center" spacing={2}>
            <CircularProgress size={32} />
            <Typography variant="body2" color="text.secondary">
              {message}
            </Typography>
          </Stack>
        </Box>
      </Fade>
    </Box>
  )
}

// Specialized loading components for ML Studio

export function ModelLoadingSkeleton() {
  return (
    <Grid container spacing={3}>
      {Array.from({ length: 8 }).map((_, index) => (
        <Grid xs={12} sm={6} md={4} lg={3} key={index}>
          <SkeletonCard
            lines={2}
            hasAvatar={true}
            hasActions={true}
            height={180}
          />
        </Grid>
      ))}
    </Grid>
  )
}

export function DashboardLoadingSkeleton() {
  return (
    <Stack spacing={4}>
      {/* Stats Cards */}
      <Grid container spacing={3}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Grid xs={12} sm={6} lg={3} key={index}>
            <SkeletonCard lines={1} height={100} />
          </Grid>
        ))}
      </Grid>

      {/* Chart Area */}
      <Card>
        <CardContent>
          <Skeleton variant="text" width="30%" height={28} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" width="100%" height={300} />
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent>
          <Skeleton variant="text" width="25%" height={28} sx={{ mb: 2 }} />
          <SkeletonTable rows={6} columns={5} />
        </CardContent>
      </Card>
    </Stack>
  )
}

export function ChartLoadingSkeleton({ height = 300 }: { height?: number }) {
  return (
    <Box>
      <Skeleton variant="text" width="40%" height={24} sx={{ mb: 2 }} />
      <Skeleton variant="rectangular" width="100%" height={height} />
      <Box display="flex" justifyContent="space-between" mt={1}>
        <Skeleton variant="text" width="15%" height={16} />
        <Skeleton variant="text" width="15%" height={16} />
        <Skeleton variant="text" width="15%" height={16} />
      </Box>
    </Box>
  )
}

// Error state component
interface ErrorStateProps {
  message: string
  retry?: () => void
  icon?: React.ReactNode
}

export function ErrorState({ message, retry, icon }: ErrorStateProps) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="200px"
      textAlign="center"
      py={4}
    >
      {icon && (
        <Box color="error.main" sx={{ fontSize: 48, mb: 2 }}>
          {icon}
        </Box>
      )}

      <Typography variant="h6" color="error" gutterBottom>
        Something went wrong
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {message}
      </Typography>

      {retry && (
        <Box>
          <button
            onClick={retry}
            style={{
              padding: '8px 16px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
        </Box>
      )}
    </Box>
  )
}