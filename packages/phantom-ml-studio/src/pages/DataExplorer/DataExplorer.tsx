import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
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
  Paper,
  IconButton,
  Tabs,
  Tab,
  Alert,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Visibility as PreviewIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterPlot, Scatter, Histogram } from 'recharts';

// Mock data for demonstration
const mockDatasets = [
  { id: 1, name: 'Security Logs 2024', rows: 50000, columns: 15, type: 'Security', uploaded: '2024-01-15' },
  { id: 2, name: 'Network Traffic Analysis', rows: 120000, columns: 22, type: 'Network', uploaded: '2024-01-10' },
  { id: 3, name: 'Threat Intelligence Feed', rows: 8500, columns: 8, type: 'Threat Intel', uploaded: '2024-01-08' },
];

const mockColumns = [
  { name: 'timestamp', type: 'datetime', missing: 0, unique: 50000 },
  { name: 'source_ip', type: 'string', missing: 12, unique: 2341 },
  { name: 'destination_ip', type: 'string', missing: 8, unique: 4521 },
  { name: 'port', type: 'numeric', missing: 0, unique: 156 },
  { name: 'protocol', type: 'categorical', missing: 0, unique: 5 },
  { name: 'bytes_sent', type: 'numeric', missing: 45, unique: 12341 },
  { name: 'is_threat', type: 'boolean', missing: 0, unique: 2 },
];

const mockSampleData = [
  { timestamp: '2024-01-15 10:30:15', source_ip: '192.168.1.100', destination_ip: '10.0.0.5', port: 443, protocol: 'HTTPS', bytes_sent: 1024, is_threat: false },
  { timestamp: '2024-01-15 10:30:16', source_ip: '192.168.1.101', destination_ip: '10.0.0.6', port: 80, protocol: 'HTTP', bytes_sent: 512, is_threat: true },
  { timestamp: '2024-01-15 10:30:17', source_ip: '192.168.1.102', destination_ip: '10.0.0.7', port: 22, protocol: 'SSH', bytes_sent: 256, is_threat: false },
  { timestamp: '2024-01-15 10:30:18', source_ip: '192.168.1.103', destination_ip: '10.0.0.8', port: 3389, protocol: 'RDP', bytes_sent: 2048, is_threat: true },
];

const DataExplorer: React.FC = () => {
  const [selectedDataset, setSelectedDataset] = useState<number>(1);
  const [selectedTab, setSelectedTab] = useState(0);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const handleDatasetChange = (datasetId: number) => {
    setSelectedDataset(datasetId);
  };

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
              <Typography variant="body1">Security Logs 2024</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Rows</Typography>
              <Typography variant="body1">50,000</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Columns</Typography>
              <Typography variant="body1">15</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">File Size</Typography>
              <Typography variant="body1">12.5 MB</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Data Quality Score</Typography>
              <Typography variant="body1" color="success.main">92% (Excellent)</Typography>
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
                <BarChart data={[
                  { type: 'Numeric', count: 6 },
                  { type: 'Categorical', count: 4 },
                  { type: 'Text', count: 3 },
                  { type: 'DateTime', count: 2 },
                ]}>
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

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Data Quality Assessment
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                  <Typography variant="h4" color="success.main">98.2%</Typography>
                  <Typography variant="body2">Completeness</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                  <Typography variant="h4" color="info.main">94.7%</Typography>
                  <Typography variant="body2">Consistency</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                  <Typography variant="h4" color="warning.main">87.1%</Typography>
                  <Typography variant="body2">Validity</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                  <Typography variant="h4" color="success.main">99.8%</Typography>
                  <Typography variant="body2">Uniqueness</Typography>
                </Box>
              </Grid>
            </Grid>
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
            {mockColumns.map((column) => (
              <TableRow key={column.name}>
                <TableCell>{column.name}</TableCell>
                <TableCell>
                  <Chip 
                    label={column.type} 
                    size="small" 
                    color={
                      column.type === 'numeric' ? 'primary' :
                      column.type === 'categorical' ? 'secondary' :
                      column.type === 'datetime' ? 'success' : 'default'
                    }
                  />
                </TableCell>
                <TableCell>
                  <span style={{ color: column.missing > 0 ? '#f5576c' : '#4caf50' }}>
                    {column.missing} ({((column.missing / 50000) * 100).toFixed(1)}%)
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
          Sample Data (First 5 Rows)
        </Typography>
        <Box sx={{ overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>Source IP</TableCell>
                <TableCell>Destination IP</TableCell>
                <TableCell>Port</TableCell>
                <TableCell>Protocol</TableCell>
                <TableCell>Bytes Sent</TableCell>
                <TableCell>Is Threat</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockSampleData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.timestamp}</TableCell>
                  <TableCell>{row.source_ip}</TableCell>
                  <TableCell>{row.destination_ip}</TableCell>
                  <TableCell>{row.port}</TableCell>
                  <TableCell>{row.protocol}</TableCell>
                  <TableCell>{row.bytes_sent}</TableCell>
                  <TableCell>
                    <Chip 
                      label={row.is_threat ? 'True' : 'False'} 
                      size="small"
                      color={row.is_threat ? 'error' : 'success'}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </CardContent>
    </Card>
  );

  const renderInsights = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Alert severity="info" sx={{ mb: 3 }}>
          <strong>AI-Generated Insights:</strong> Based on analysis of your security log data, we've identified several patterns and recommendations.
        </Alert>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Key Findings
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                <strong>Threat Detection Rate:</strong> 12.4% of network events are classified as threats
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                <strong>Peak Activity:</strong> Highest threat activity occurs between 2-4 AM
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                <strong>Source Analysis:</strong> 87% of threats originate from 5 IP ranges
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                <strong>Protocol Distribution:</strong> HTTPS traffic shows 15% higher threat rate
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recommendations
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                Consider additional features: geolocation, user behavior patterns
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                Feature engineering: time-based features show strong predictive power
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                Model suggestion: XGBoost or Random Forest for classification
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                Data quality: Address missing values in 'bytes_sent' column
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Automated Feature Suggestions
            </Typography>
            <Grid container spacing={1}>
              <Grid item>
                <Chip label="Hour of Day" color="primary" variant="outlined" />
              </Grid>
              <Grid item>
                <Chip label="Day of Week" color="primary" variant="outlined" />
              </Grid>
              <Grid item>
                <Chip label="IP Reputation Score" color="primary" variant="outlined" />
              </Grid>
              <Grid item>
                <Chip label="Request Frequency" color="primary" variant="outlined" />
              </Grid>
              <Grid item>
                <Chip label="Payload Entropy" color="primary" variant="outlined" />
              </Grid>
              <Grid item>
                <Chip label="Protocol Anomaly Score" color="primary" variant="outlined" />
              </Grid>
            </Grid>
            <Box sx={{ mt: 2 }}>
              <Button variant="outlined" startIcon={<AnalyticsIcon />}>
                Generate Features
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
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
          onClick={() => setUploadDialogOpen(true)}
        >
          Upload Dataset
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Select Dataset</InputLabel>
            <Select
              value={selectedDataset}
              onChange={(e) => handleDatasetChange(e.target.value as number)}
            >
              {mockDatasets.map((dataset) => (
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
              onClick={() => {/* Refresh dataset */}}
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => {/* Download dataset */}}
            >
              Download
            </Button>
          </Box>
        </Grid>
      </Grid>

      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ pb: 1 }}>
          <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)}>
            <Tab label="Overview" />
            <Tab label="Columns" />
            <Tab label="Sample Data" />
            <Tab label="AI Insights" />
          </Tabs>
        </CardContent>
      </Card>

      <Box sx={{ mt: 3 }}>
        {selectedTab === 0 && renderOverview()}
        {selectedTab === 1 && renderColumns()}
        {selectedTab === 2 && renderSampleData()}
        {selectedTab === 3 && renderInsights()}
      </Box>
    </Box>
  );
};

export default DataExplorer;