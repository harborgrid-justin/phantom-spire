'use client'

import React from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Avatar,
  Divider
} from '@mui/material'
import {
  ModelTraining as TrainingIcon,
  Psychology as PredictionIcon,
  CloudUpload as UploadIcon,
  Assessment as AnalysisIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon
} from '@mui/icons-material'

interface ActivityItem {
  id: string
  type: 'training' | 'prediction' | 'upload' | 'analysis' | 'deployment'
  title: string
  description: string
  timestamp: string
  status: 'success' | 'error' | 'warning' | 'info'
  details?: Record<string, any>
}

// Mock activity data - in real app this would come from an API
const generateMockActivity = (): ActivityItem[] => {
  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'training',
      title: 'Security Classification Model Trained',
      description: 'Random Forest model trained with 95.2% accuracy',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 min ago
      status: 'success',
      details: { accuracy: 0.952, duration: '2m 34s' }
    },
    {
      id: '2',
      type: 'prediction',
      title: 'Batch Predictions Completed',
      description: '1,250 threat predictions processed successfully',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 min ago
      status: 'success',
      details: { count: 1250, avgLatency: '12ms' }
    },
    {
      id: '3',
      type: 'upload',
      title: 'New Dataset Uploaded',
      description: 'Security logs dataset (2.3GB, 450k records)',
      timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(), // 90 min ago
      status: 'info',
      details: { size: '2.3GB', records: 450000 }
    },
    {
      id: '4',
      type: 'analysis',
      title: 'Model Drift Detection',
      description: 'Anomaly detection model showing 5.2% drift',
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
      status: 'warning',
      details: { drift: 0.052, threshold: 0.1 }
    },
    {
      id: '5',
      type: 'training',
      title: 'Regression Model Training Failed',
      description: 'Insufficient training data for regression model',
      timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
      status: 'error',
      details: { error: 'Insufficient data', samples: 45 }
    },
    {
      id: '6',
      type: 'prediction',
      title: 'Real-time Inference Started',
      description: 'Live threat detection pipeline activated',
      timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(), // 4 hours ago
      status: 'success',
      details: { pipeline: 'threat-detection-v2' }
    }
  ]

  return activities
}

const getActivityIcon = (type: ActivityItem['type']) => {
  const iconMap = {
    training: <TrainingIcon />,
    prediction: <PredictionIcon />,
    upload: <UploadIcon />,
    analysis: <AnalysisIcon />,
    deployment: <AnalysisIcon />
  }
  return iconMap[type]
}

const getStatusIcon = (status: ActivityItem['status']) => {
  const iconMap = {
    success: <SuccessIcon color="success" />,
    error: <ErrorIcon color="error" />,
    warning: <WarningIcon color="warning" />,
    info: <PredictionIcon color="info" />
  }
  return iconMap[status]
}

const getStatusColor = (status: ActivityItem['status']) => {
  const colorMap = {
    success: 'success' as const,
    error: 'error' as const,
    warning: 'warning' as const,
    info: 'info' as const
  }
  return colorMap[status]
}

const formatTimeAgo = (timestamp: string): string => {
  const now = new Date()
  const time = new Date(timestamp)
  const diffMs = now.getTime() - time.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
  return `${Math.floor(diffMins / 1440)}d ago`
}

export function RecentActivity() {
  const activities = generateMockActivity()

  return (
    <Card className="ml-card">
      <CardContent>
        <Box className="flex items-center justify-between mb-4">
          <Typography variant="h6" className="font-semibold">
            Recent Activity
          </Typography>
          <Chip
            label={`${activities.length} events`}
            size="small"
            variant="outlined"
            color="primary"
          />
        </Box>

        <List className="p-0">
          {activities.map((activity, index) => (
            <React.Fragment key={activity.id}>
              <ListItem className="px-0 py-3">
                <ListItemIcon className="min-w-12">
                  <Avatar
                    className="w-10 h-10"
                    sx={{
                      bgcolor: 'transparent',
                      border: 1,
                      borderColor: `${getStatusColor(activity.status)}.main`
                    }}
                  >
                    {getActivityIcon(activity.type)}
                  </Avatar>
                </ListItemIcon>

                <ListItemText
                  primary={
                    <Box className="flex items-start justify-between">
                      <Box className="flex-1">
                        <Typography variant="body1" className="font-medium mb-1">
                          {activity.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" className="mb-2">
                          {activity.description}
                        </Typography>
                        <Box className="flex items-center gap-2">
                          <Typography variant="caption" color="text.secondary">
                            {formatTimeAgo(activity.timestamp)}
                          </Typography>
                          {activity.details && Object.keys(activity.details).length > 0 && (
                            <Box className="flex gap-1">
                              {Object.entries(activity.details).slice(0, 2).map(([key, value]) => (
                                <Chip
                                  key={key}
                                  label={`${key}: ${value}`}
                                  size="small"
                                  variant="outlined"
                                  className="text-xs"
                                />
                              ))}
                            </Box>
                          )}
                        </Box>
                      </Box>
                      <Box className="ml-4">
                        {getStatusIcon(activity.status)}
                      </Box>
                    </Box>
                  }
                />
              </ListItem>

              {index < activities.length - 1 && (
                <Divider variant="inset" component="li" className="ml-12" />
              )}
            </React.Fragment>
          ))}
        </List>

        {activities.length === 0 && (
          <Box className="text-center py-8">
            <Typography variant="body1" color="text.secondary">
              No recent activity
            </Typography>
            <Typography variant="body2" color="text.secondary" className="mt-2">
              Start training models or making predictions to see activity
            </Typography>
          </Box>
        )}

        <Box className="mt-4 pt-4 border-t border-gray-200">
          <Typography
            variant="body2"
            color="primary"
            className="cursor-pointer hover:underline text-center"
          >
            View All Activity
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}