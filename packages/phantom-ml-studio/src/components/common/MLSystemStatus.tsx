'use client'

import React from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  Tooltip
} from '@mui/material'
import {
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material'
import { useMLCoreStatus, useSystemInfo } from '../providers/MLCoreProvider'

export function MLSystemStatus() {
  const { isInitialized, isLoading, error } = useMLCoreStatus()
  const { systemInfo } = useSystemInfo()

  const getStatusInfo = () => {
    if (isLoading) {
      return {
        status: 'loading',
        message: 'Initializing ML Core...',
        color: 'warning' as const,
        icon: <CircularProgress size={20} />
      }
    }

    if (error) {
      return {
        status: 'error',
        message: `ML Core Error: ${error}`,
        color: 'error' as const,
        icon: <ErrorIcon />
      }
    }

    if (isInitialized) {
      return {
        status: 'ready',
        message: 'ML Core is ready and operational',
        color: 'success' as const,
        icon: <CheckIcon />
      }
    }

    return {
      status: 'offline',
      message: 'ML Core is not initialized',
      color: 'default' as const,
      icon: <WarningIcon />
    }
  }

  const statusInfo = getStatusInfo()

  return (
    <Card className="ml-card">
      <CardContent>
        <Box className="flex items-center justify-between mb-4">
          <Typography variant="h6" className="font-semibold">
            ML System Status
          </Typography>
          <Chip
            label={statusInfo.status.toUpperCase()}
            color={statusInfo.color}
            icon={statusInfo.icon}
            variant="outlined"
          />
        </Box>

        {error && (
          <Alert severity="error" className="mb-4">
            <Typography variant="body2">
              <strong>Error:</strong> {error}
            </Typography>
            <Typography variant="caption" className="block mt-1 opacity-70">
              The system is running in fallback mode with mock data.
            </Typography>
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Box className="p-3 bg-gray-50 rounded-lg">
              <Typography variant="body2" color="text.secondary" className="mb-1">
                Core Version
              </Typography>
              <Typography variant="body1" className="font-medium">
                {systemInfo?.version || 'Unknown'}
                {error && (
                  <Tooltip title="Running in mock mode">
                    <Chip size="small" label="Mock" color="warning" className="ml-2" />
                  </Tooltip>
                )}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box className="p-3 bg-gray-50 rounded-lg">
              <Typography variant="body2" color="text.secondary" className="mb-1">
                Platform
              </Typography>
              <Typography variant="body1" className="font-medium">
                {systemInfo?.platform || 'Unknown'} {systemInfo?.arch || ''}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box className="p-3 bg-gray-50 rounded-lg">
              <Typography variant="body2" color="text.secondary" className="mb-1">
                Target
              </Typography>
              <Typography variant="body1" className="font-medium">
                {systemInfo?.target || 'Unknown'}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box className="p-3 bg-gray-50 rounded-lg">
              <Typography variant="body2" color="text.secondary" className="mb-1">
                Features
              </Typography>
              <Box className="flex flex-wrap gap-1 mt-1">
                {systemInfo?.features?.map((feature) => (
                  <Chip
                    key={feature}
                    label={feature}
                    size="small"
                    variant="outlined"
                    color="primary"
                  />
                )) || (
                  <Typography variant="body2" color="text.secondary">
                    Loading...
                  </Typography>
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Box className="mt-4 p-3 bg-blue-50 rounded-lg">
          <Box className="flex items-center gap-2 mb-2">
            <InfoIcon color="info" fontSize="small" />
            <Typography variant="body2" className="font-medium">
              System Status
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {statusInfo.message}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}