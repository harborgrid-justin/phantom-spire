'use client'

import React from 'react'
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { useTheme } from '@mui/material/styles'
import { Box, Typography, Card, CardContent } from '@mui/material'

interface DataPoint {
  name: string
  [key: string]: string | number
}

interface LineChartProps {
  data: DataPoint[]
  lines: Array<{
    dataKey: string
    stroke?: string
    name?: string
  }>
  title?: string
  height?: number
  showGrid?: boolean
  showLegend?: boolean
}

export function LineChart({
  data,
  lines,
  title,
  height = 300,
  showGrid = true,
  showLegend = true
}: LineChartProps) {
  const theme = useTheme()

  const defaultColors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main
  ]

  return (
    <Card className="ml-card" data-cy="chart-line-card">
      <CardContent>
        {title && (
          <Typography variant="h6" gutterBottom className="font-semibold" data-cy="chart-title">
            {title}
          </Typography>
        )}
        <Box sx={{ width: '100%', height }} data-cy="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
              data-cy="chart-line"
            >
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} data-cy="chart-grid" />}
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                stroke={theme.palette.text.secondary}
                data-cy="chart-x-axis"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke={theme.palette.text.secondary}
                data-cy="chart-y-axis"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: theme.shape.borderRadius,
                  color: theme.palette.text.primary
                }}
                data-cy="chart-tooltip"
              />
              {showLegend && <Legend data-cy="chart-legend" />}
              {lines.map((line, index) => (
                <Line
                  key={line.dataKey}
                  type="monotone"
                  dataKey={line.dataKey}
                  stroke={line.stroke || defaultColors[index % defaultColors.length]}
                  strokeWidth={2}
                  dot={{ fill: line.stroke || defaultColors[index % defaultColors.length], strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                  name={line.name || line.dataKey}
                  data-cy={`chart-line-${line.dataKey}`}
                />
              ))}
            </RechartsLineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  )
}