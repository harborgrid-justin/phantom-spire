'use client'

import React from 'react'
import {
  BarChart as RechartsBarChart,
  Bar,
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

interface BarChartProps {
  data: DataPoint[]
  bars: Array<{
    dataKey: string
    fill?: string
    name?: string
  }>
  title?: string
  height?: number
  showGrid?: boolean
  showLegend?: boolean
  orientation?: 'horizontal' | 'vertical'
}

export function BarChart({
  data,
  bars,
  title,
  height = 300,
  showGrid = true,
  showLegend = true,
  orientation = 'vertical'
}: BarChartProps) {
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
    <Card className="ml-card" data-cy="chart-bar-card">
      <CardContent>
        {title && (
          <Typography variant="h6" gutterBottom className="font-semibold" data-cy="chart-title">
            {title}
          </Typography>
        )}
        <Box sx={{ width: '100%', height }} data-cy="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
              layout={orientation === 'horizontal' ? 'horizontal' : 'vertical'}
              data-cy="chart-bar"
            >
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} data-cy="chart-grid" />}
              <XAxis
                type={orientation === 'horizontal' ? 'number' : 'category'}
                dataKey={orientation === 'horizontal' ? undefined : 'name'}
                tick={{ fontSize: 12 }}
                stroke={theme.palette.text.secondary}
                data-cy="chart-x-axis"
              />
              <YAxis
                type={orientation === 'horizontal' ? 'category' : 'number'}
                dataKey={orientation === 'horizontal' ? 'name' : undefined}
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
              {bars.map((bar, index) => (
                <Bar
                  key={bar.dataKey}
                  dataKey={bar.dataKey}
                  fill={bar.fill || defaultColors[index % defaultColors.length]}
                  name={bar.name || bar.dataKey}
                  radius={[2, 2, 0, 0]}
                  data-cy={`chart-bar-${bar.dataKey}`}
                />
              ))}
            </RechartsBarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  )
}