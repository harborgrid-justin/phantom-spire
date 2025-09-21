'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  LinearProgress,
  Tooltip
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  Assessment as StatisticsIcon,
  Visibility as PreviewIcon
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Dataset, Column, SampleData } from '@/services/data-explorer';

interface DataVisualizationProps {
  selectedDataset: Dataset | undefined;
  columns: Column[];
  sampleData: SampleData[];
  selectedTab: number;
}

const DataVisualization: React.FC<DataVisualizationProps> = ({ 
  selectedDataset, 
  columns, 
  sampleData, 
  selectedTab 
}) => {
  const renderOverview = () => (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
      <Card elevation={2}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <StatisticsIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">
              Dataset Information
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">Dataset Name</Typography>
            <Typography variant="body1" fontWeight="medium">{selectedDataset?.name}</Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">Rows</Typography>
            <Typography variant="h5" color="primary.main">
              {selectedDataset?.rows.toLocaleString()}
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">Columns</Typography>
            <Typography variant="h5" color="secondary.main">
              {selectedDataset?.columns}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">Data Quality Score</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <LinearProgress
                variant="determinate"
                value={85}
                sx={{ flexGrow: 1, mr: 2, height: 8, borderRadius: 4 }}
              />
              <Typography variant="body2" fontWeight="medium">85%</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card elevation={2}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <AnalyticsIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">
              Column Types Distribution
            </Typography>
          </Box>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={columns.reduce((acc, col) => {
                const type = acc.find(t => t.type === col.type);
                if (type) {
                  type.count++;
                } else {
                  acc.push({ type: col.type, count: 1 });
                }
                return acc;
              }, [] as { type: string, count: number }[])}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="count" fill="#667eea" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );

  const renderColumns = () => (
    <Card elevation={2}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Column Analysis
        </Typography>
        <Box sx={{ overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Column Name</TableCell>
                <TableCell>Data Type</TableCell>
                <TableCell>Missing Values</TableCell>
                <TableCell>Unique Values</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {columns.map((column) => (
                <TableRow key={column.name} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {column.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={column.type}
                      size="small"
                      color={column.type === 'number' ? 'primary' : 'default'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography
                        variant="body2"
                        sx={{ color: column.missing > 0 ? 'error.main' : 'success.main' }}
                      >
                        {column.missing}
                      </Typography>
                      <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                        ({selectedDataset ? ((column.missing / selectedDataset.rows) * 100).toFixed(1) : 0}%)
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {column.unique.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View statistics">
                      <IconButton size="small" color="primary">
                        <AnalyticsIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Preview values">
                      <IconButton size="small" color="secondary">
                        <PreviewIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </CardContent>
    </Card>
  );

  const renderSampleData = () => (
    <Card elevation={2}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Sample Data
        </Typography>
        <Box sx={{ overflowX: 'auto', maxHeight: 500 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {columns.map(col => (
                  <TableCell key={col.name} sx={{ fontWeight: 'bold' }}>
                    {col.name}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sampleData.map((row, index) => (
                <TableRow key={index} hover>
                  {columns.map(col => (
                    <TableCell key={col.name}>
                      <Typography variant="body2">
                        {String(row[col.name]) || '—'}
                      </Typography>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ mt: 3 }}>
      {selectedTab === 0 && renderOverview()}
      {selectedTab === 1 && renderColumns()}
      {selectedTab === 2 && renderSampleData()}
    </Box>
  );
};

export default DataVisualization;
