'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  LinearProgress
} from '@mui/material';
import {
  Dashboard,
  TrendingUp,
  Assessment,
  CheckCircle,
  Warning,
  Error,
  Info,
  Refresh
} from '@mui/icons-material';

interface AnalyticsTransformationCenterData {
  id: string;
  name: string;
  status: 'active' | 'pending' | 'completed' | 'failed' | 'draft' | 'in-progress';
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
  createdAt: string;
  description?: string;
  category?: string;
  metrics?: {
    successRate: number;
    totalItems: number;
    completedItems: number;
    errorCount: number;
  };
}

interface ModernizationMetrics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  successRate: number;
  avgProgress: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export default function AnalyticsTransformationCenterPage() {
  const [data, setData] = useState<AnalyticsTransformationCenterData[]>([]);
  const [metrics, setMetrics] = useState<ModernizationMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setError(null);
      const response = await fetch('/api/v1/modernization/data-modernization/analytics-transformation-center');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setData(result.data || []);
      setMetrics(result.metrics || null);
    } catch (err) {
      console.error('Failed to fetch analytics-transformation-center data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  useEffect(() => {
    fetchData();
    // Set up polling for real-time updates
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'active': case 'in-progress': return 'primary';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle />;
      case 'active': case 'in-progress': return <TrendingUp />;
      case 'pending': return <Warning />;
      case 'failed': return <Error />;
      default: return <Info />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            📊 Analytics Transformation Center
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Advanced analytics and AI/ML platform deployment
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Metrics Cards */}
      {metrics && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Projects
                </Typography>
                <Typography variant="h4" component="div">
                  {metrics.totalProjects}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Active Projects
                </Typography>
                <Typography variant="h4" component="div">
                  {metrics.activeProjects}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Success Rate
                </Typography>
                <Typography variant="h4" component="div">
                  {metrics.successRate}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Average Progress
                </Typography>
                <Typography variant="h4" component="div">
                  {metrics.avgProgress}%
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={metrics.avgProgress} 
                  sx={{ mt: 1 }}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Data List */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Current Analytics Transformation Center Items
        </Typography>
        {data.length === 0 ? (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No data available. Start by creating your first analytics transformation center item.
          </Typography>
        ) : (
          <List>
            {data.map((item, index) => (
              <div key={item.id}>
                <ListItem>
                  <ListItemIcon>
                    {getStatusIcon(item.status)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1">{item.name}</Typography>
                        <Chip 
                          label={item.status} 
                          size="small" 
                          color={getStatusColor(item.status) as any}
                        />
                        <Chip 
                          label={item.priority} 
                          size="small" 
                          color={getPriorityColor(item.priority) as any}
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {item.description || 'No description available'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Created: {new Date(item.createdAt).toLocaleDateString()}
                        </Typography>
                        {item.progress !== undefined && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="caption">
                              Progress: {item.progress}%
                            </Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={item.progress} 
                              sx={{ mt: 0.5 }}
                            />
                          </Box>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                {index < data.length - 1 && <Divider />}
              </div>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
}