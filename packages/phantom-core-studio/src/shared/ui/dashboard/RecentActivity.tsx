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
import { TimeAgo } from '../common/TimeAgo'

interface ActivityItem {
  id: string
  type: 'training' | 'prediction' | 'upload' | 'analysis' | 'deployment'
  title: string
  description: string
  timestamp: string
  status: 'success' | 'error' | 'warning' | 'info'
  details?: Record<string, string | number | boolean>
}

async function getRecentActivity(): Promise<ActivityItem[]> {
  // In a real app, this would fetch from a full URL
  // For this example, we're calling the internal API route
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ml-core/activity`, {
    cache: 'no-store' // Fetch fresh data on every request
  })

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch activity data')
  }

  const data = await res.json()
  return data.data || []
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

export async function RecentActivity() {
  const activities = await getRecentActivity()

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
                            <TimeAgo timestamp={activity.timestamp} />
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