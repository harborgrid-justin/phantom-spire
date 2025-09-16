'use client'

import React from 'react'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip
} from 'recharts'
import { useTheme } from '@mui/material/styles'
import { Box, Typography, Card, CardContent, Grid, Paper } from '@mui/material'

interface MetricData {
  metric: string
  value: number
  fullMark: number
}

interface MetricsChartProps {
  data: MetricData[]
  title?: string
  height?: number
  color?: string
}

export function MetricsChart({
  data,
  title,
  height = 300,
  color
}: MetricsChartProps) {
  const theme = useTheme()
  const fillColor = color || theme.palette.primary.main

  return (
    <Card className="ml-card">
      <CardContent>
        {title && (
          <Typography variant="h6" gutterBottom className="font-semibold">
            {title}
          </Typography>
        )}
        <Box sx={{ width: '100%', height }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data}>
              <PolarGrid stroke={theme.palette.divider} />
              <PolarAngleAxis
                dataKey="metric"
                tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 1]}
                tick={{ fontSize: 10, fill: theme.palette.text.secondary }}
                tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
              />
              <Radar
                name="Score"
                dataKey="value"
                stroke={fillColor}
                fill={fillColor}
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: theme.shape.borderRadius,
                  color: theme.palette.text.primary
                }}
                formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, 'Score']}
              />
            </RadarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  )
}

interface ModelPerformanceProps {
  accuracy: number
  precision: number
  recall: number
  f1Score: number
  title?: string
}

export function ModelPerformanceChart({
  accuracy,
  precision,
  recall,
  f1Score,
  title = "Model Performance Metrics"
}: ModelPerformanceProps) {
  const data: MetricData[] = [
    { metric: 'Accuracy', value: accuracy, fullMark: 1 },
    { metric: 'Precision', value: precision, fullMark: 1 },
    { metric: 'Recall', value: recall, fullMark: 1 },
    { metric: 'F1 Score', value: f1Score, fullMark: 1 }
  ]

  const theme = useTheme()

  return (
    <Card className="ml-card">
      <CardContent>
        <Typography variant="h6" gutterBottom className="font-semibold">
          {title}
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
              <Typography variant="h5" fontWeight="bold">
                {(accuracy * 100).toFixed(1)}%
              </Typography>
              <Typography variant="caption">Accuracy</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'secondary.light', color: 'secondary.contrastText' }}>
              <Typography variant="h5" fontWeight="bold">
                {(precision * 100).toFixed(1)}%
              </Typography>
              <Typography variant="caption">Precision</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'success.contrastText' }}>
              <Typography variant="h5" fontWeight="bold">
                {(recall * 100).toFixed(1)}%
              </Typography>
              <Typography variant="caption">Recall</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light', color: 'warning.contrastText' }}>
              <Typography variant="h5" fontWeight="bold">
                {(f1Score * 100).toFixed(1)}%
              </Typography>
              <Typography variant="caption">F1 Score</Typography>
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ width: '100%', height: 250 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data}>
              <PolarGrid stroke={theme.palette.divider} />
              <PolarAngleAxis
                dataKey="metric"
                tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 1]}
                tick={{ fontSize: 10, fill: theme.palette.text.secondary }}
                tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
              />
              <Radar
                name="Score"
                dataKey="value"
                stroke={theme.palette.primary.main}
                fill={theme.palette.primary.main}
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: theme.shape.borderRadius,
                  color: theme.palette.text.primary
                }}
                formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, 'Score']}
              />
            </RadarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  )
}