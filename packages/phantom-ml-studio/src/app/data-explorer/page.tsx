'use client';
import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Visibility as PreviewIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { dataExplorerService } from '../../services/dataExplorerService';
import { Dataset, Column, SampleData } from '../../services/dataExplorer.types';
import { ServiceContext } from '../../services/core';

const DataExplorerPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [sampleData, setSampleData] = useState<SampleData[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<number>(1);
  const [selectedTab, setSelectedTab] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const context: ServiceContext = {
        requestId: `req-${Date.now()}`,
        startTime: new Date(),
        timeout: 5000,
        permissions: [],
        metadata: {},
        trace: {
            traceId: `trace-${Date.now()}`,
            spanId: `span-${Date.now()}`,
            sampled: true,
            baggage: {},
        }
      };

      const datasetsResponse = await dataExplorerService.getDatasets({
        id: `req-datasets-${Date.now()}`,
        type: 'getDatasets',
        data: null,
        metadata: { category: 'data-explorer', module: 'data-explorer-page', version: '1.0.0' },
        context: { environment: 'development' },
        timestamp: new Date(),
      }, context);
      if (datasetsResponse.success && datasetsResponse.data) {
        setDatasets(datasetsResponse.data);
      }

      const columnsResponse = await dataExplorerService.getColumns({
        id: `req-columns-${Date.now()}`,
        type: 'getColumns',
        data: { datasetId: selectedDatasetId },
        metadata: { category: 'data-explorer', module: 'data-explorer-page', version: '1.0.0' },
        context: { environment: 'development' },
        timestamp: new Date(),
      }, context);
      if (columnsResponse.success && columnsResponse.data) {
        setColumns(columnsResponse.data);
      }

      const sampleDataResponse = await dataExplorerService.getSampleData({
        id: `req-sample-${Date.now()}`,
        type: 'getSampleData',
        data: { datasetId: selectedDatasetId },
        metadata: { category: 'data-explorer', module: 'data-explorer-page', version: '1.0.0' },
        context: { environment: 'development' },
        timestamp: new Date(),
      }, context);
      if (sampleDataResponse.success && sampleDataResponse.data) {
        setSampleData(sampleDataResponse.data);
      }

      setLoading(false);
    };

    fetchData();
  }, [selectedDatasetId]);

  const selectedDataset = datasets.find(d => d.id === selectedDatasetId);

  const renderOverview = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Dataset Information
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Dataset Name</Typography>
              <Typography variant="body1">{selectedDataset?.name}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Rows</Typography>
              <Typography variant="body1">{selectedDataset?.rows.toLocaleString()}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Columns</Typography>
              <Typography variant="body1">{selectedDataset?.columns}</Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Column Types Distribution
            </Typography>
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
                  <Tooltip />
                  <Bar dataKey="count" fill="#667eea" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderColumns = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Column Analysis
        </Typography>
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
              <TableRow key={column.name}>
                <TableCell>{column.name}</TableCell>
                <TableCell>
                  <Chip
                    label={column.type}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <span style={{ color: column.missing > 0 ? '#f5576c' : '#4caf50' }}>
                    {column.missing} ({selectedDataset ? ((column.missing / selectedDataset.rows) * 100).toFixed(1) : 0}%)
                  </span>
                </TableCell>
                <TableCell>{column.unique.toLocaleString()}</TableCell>
                <TableCell>
                  <IconButton size="small">
                    <AnalyticsIcon />
                  </IconButton>
                  <IconButton size="small">
                    <PreviewIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const renderSampleData = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Sample Data
        </Typography>
        <Box sx={{ overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                {columns.map(col => <TableCell key={col.name}>{col.name}</TableCell>)}
              </TableRow>
            </TableHead>
            <TableBody>
              {sampleData.map((row, index) => (
                <TableRow key={index}>
                  {columns.map(col => <TableCell key={col.name}>{String(row[col.name])}</TableCell>)}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Data Explorer
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Explore, analyze, and understand your datasets before training models
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<UploadIcon />}
          disabled
        >
          Upload Dataset (Coming Soon)
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Select Dataset</InputLabel>
            <Select
              value={selectedDatasetId}
              onChange={(e) => setSelectedDatasetId(e.target.value as number)}
            >
              {datasets.map((dataset) => (
                <MenuItem key={dataset.id} value={dataset.id}>
                  {dataset.name} ({dataset.rows.toLocaleString()} rows)
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
            >
              Download
            </Button>
          </Box>
        </Grid>
      </Grid>

      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ pb: 1 }}>
          <Tabs value={selectedTab} onChange={(_, newValue) => setSelectedTab(newValue)}>
            <Tab label="Overview" />
            <Tab label="Columns" />
            <Tab label="Sample Data" />
          </Tabs>
        </CardContent>
      </Card>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ mt: 3 }}>
          {selectedTab === 0 && renderOverview()}
          {selectedTab === 1 && renderColumns()}
          {selectedTab === 2 && renderSampleData()}
        </Box>
      )}
    </Box>
  );
};

export default DataExplorerPage;