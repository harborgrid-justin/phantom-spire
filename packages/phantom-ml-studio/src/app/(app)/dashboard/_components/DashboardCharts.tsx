/**
 * Dashboard Charts Component
 * Contains resource utilization chart and recent activity list
 */

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { 
  ResourceUtilization, 
  RecentActivity 
} from '@/features/dashboard/types/dashboard.types';

interface DashboardChartsProps {
  resourceUtilization: ResourceUtilization[];
  recentActivity: RecentActivity[];
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  resourceUtilization,
  recentActivity
}) => {
  return (
    <Box 
      sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
        gap: 3 
      }} 
      data-cy="dashboard-charts-grid"
    >
      {/* Resource Utilization Chart */}
      <Paper elevation={2} sx={{ p: 3 }} data-cy="card-resource-utilization">
        <Typography variant="h6" gutterBottom data-cy="chart-title">
          Resource Utilization
        </Typography>
        <Box sx={{ height: 300 }} data-cy="chart-container">
          <BarChart
            dataset={resourceUtilization as any}
            xAxis={[{ scaleType: 'band', dataKey: 'name' }]}
            series={[{
              dataKey: 'usage',
              label: 'Usage (%)',
              color: '#667eea'
            }]}
            margin={{ left: 40, right: 40, top: 40, bottom: 40 }}
            data-cy="chart-resource-utilization"
          />
        </Box>
      </Paper>

      {/* Recent Activity */}
      <Paper elevation={2} sx={{ p: 3 }} data-cy="card-recent-activity">
        <Typography variant="h6" gutterBottom data-cy="activity-title">
          Recent Activity
        </Typography>
        <Box sx={{ maxHeight: 300, overflow: 'auto' }} data-cy="activity-container">
          <List data-cy="list-recent-activity">
            {recentActivity.map((activity, index) => (
              <React.Fragment key={activity.id}>
                <ListItem data-cy={`activity-item-${index}`}>
                  <ListItemText
                    primary={
                      <Typography variant="body1" fontWeight="medium" data-cy="activity-type">
                        {activity.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary" data-cy="activity-description">
                          {activity.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" data-cy="activity-timestamp">
                          {new Date(activity.timestamp).toLocaleString()}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < recentActivity.length - 1 && <Divider data-cy={`activity-divider-${index}`} />}
              </React.Fragment>
            ))}
          </List>
        </Box>
      </Paper>
    </Box>
  );
};

export default DashboardCharts;
