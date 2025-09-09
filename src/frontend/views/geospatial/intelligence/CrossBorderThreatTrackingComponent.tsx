import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Chip,
  Divider
} from '@mui/material';
import {
  LocationOn,
  Map,
  TravelExplore,
  Analytics,
  Security,
  Visibility
} from '@mui/icons-material';

interface CrossBorderThreatTrackingComponentProps {
  onNavigate?: (path: string) => void;
}

interface GeospatialData {
  id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  type: string;
  status: 'active' | 'inactive' | 'monitoring';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  lastUpdated: string;
  metadata: {
    category: string;
    tags: string[];
    priority: 'low' | 'medium' | 'high' | 'critical';
  };
}

const CrossBorderThreatTrackingComponent: React.FC<CrossBorderThreatTrackingComponentProps> = ({ onNavigate }) => {
  const [geospatialData, setGeospatialData] = useState<GeospatialData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  useEffect(() => {
    loadGeospatialData();
  }, []);

  const loadGeospatialData = async () => {
    try {
      setLoading(true);
      // Simulate API call for geospatial data
      const mockData: GeospatialData[] = [
        {
          id: '1',
          name: 'Primary Data Center',
          location: {
            latitude: 37.7749,
            longitude: -122.4194,
            address: 'San Francisco, CA'
          },
          type: 'infrastructure',
          status: 'active',
          riskLevel: 'low',
          lastUpdated: new Date().toISOString(),
          metadata: {
            category: 'intelligence',
            tags: ['critical', 'infrastructure'],
            priority: 'high'
          }
        }
      ];
      
      setGeospatialData(mockData);
    } catch (err) {
      setError('Failed to load geospatial data');
      console.error('Error loading geospatial data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'monitoring': return 'warning';
      default: return 'default';
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  const filteredData = geospatialData.filter(item => 
    selectedFilter === 'all' || item.type === selectedFilter
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <Map sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h4" component="h1">
            🚁 Cross-Border Threat Tracking
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" paragraph>
          International threat movement and correlation
        </Typography>
        
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>Quick Actions</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button variant="outlined" startIcon={<Map />}>
              View Map
            </Button>
            <Button variant="outlined" startIcon={<Analytics />}>
              Generate Report
            </Button>
            <Button variant="outlined" startIcon={<Security />}>
              Security Analysis
            </Button>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Geospatial Data Overview
              </Typography>
              
              <Box mb={2}>
                <Button
                  variant={selectedFilter === 'all' ? 'contained' : 'outlined'}
                  onClick={() => setSelectedFilter('all')}
                  sx={{ mr: 1, mb: 1 }}
                >
                  All
                </Button>
              </Box>

              <List>
                {filteredData.map((item, index) => (
                  <React.Fragment key={item.id}>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Typography variant="subtitle1">{item.name}</Typography>
                            <Box>
                              <Chip
                                label={item.status}
                                color={getStatusColor(item.status) as any}
                                size="small"
                                sx={{ mr: 1 }}
                              />
                              <Chip
                                label={item.riskLevel}
                                color={getRiskColor(item.riskLevel) as any}
                                size="small"
                              />
                            </Box>
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              <LocationOn fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                              {item.location.address}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Last updated: {new Date(item.lastUpdated).toLocaleString()}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < filteredData.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Statistics
              </Typography>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total Locations: {geospatialData.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active: {geospatialData.filter(item => item.status === 'active').length}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CrossBorderThreatTrackingComponent;