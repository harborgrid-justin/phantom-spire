/**
 * IOC Geolocation Mapping - Interactive geolocation visualization for IP-based IOCs
 */

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import { Map, LocationOn, Public, Analytics } from '@mui/icons-material';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export const IOCGeolocationMapping: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [clustering, setClustering] = useState(true);
  const [heatMap, setHeatMap] = useState(false);
  const [timeRange, setTimeRange] = useState('7d');
  const [geoData, setGeoData] = useState<any>(null);

  useEffect(() => {
    loadGeoData();
  }, [timeRange, clustering, heatMap]);

  const loadGeoData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/iocs/visualization/geolocation?time_range=${timeRange}&clustering=${clustering}&heat_map=${heatMap}`);
      const data = await response.json();
      setGeoData(data.data);
    } catch (error) {
      console.error('Failed to load geolocation data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock geolocation data
  const locations = [
    { country: 'United States', lat: 39.8283, lng: -98.5795, count: 234, severity: 'low', code: 'US' },
    { country: 'China', lat: 35.8617, lng: 104.1954, count: 189, severity: 'medium', code: 'CN' },
    { country: 'Russia', lat: 61.5240, lng: 105.3188, count: 145, severity: 'high', code: 'RU' },
    { country: 'Germany', lat: 51.1657, lng: 10.4515, count: 89, severity: 'low', code: 'DE' },
    { country: 'United Kingdom', lat: 55.3781, lng: -3.4360, count: 67, severity: 'medium', code: 'GB' }
  ];

  const clusters = [
    { region: 'Eastern Europe', count: 145, riskLevel: 'high', color: '#f44336' },
    { region: 'East Asia', count: 89, riskLevel: 'medium', color: '#ff9800' },
    { region: 'North America', count: 234, riskLevel: 'low', color: '#4caf50' },
    { region: 'Western Europe', count: 67, riskLevel: 'low', color: '#4caf50' }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#9e9e9e';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Map />
        IOC Geolocation Mapping
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Interactive geolocation visualization for IP-based indicators of compromise.
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Time Range</InputLabel>
            <Select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
              <MenuItem value="1d">Last 24 Hours</MenuItem>
              <MenuItem value="7d">Last 7 Days</MenuItem>
              <MenuItem value="30d">Last 30 Days</MenuItem>
              <MenuItem value="90d">Last 90 Days</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControlLabel
            control={
              <Switch
                checked={clustering}
                onChange={(e) => setClustering(e.target.checked)}
              />
            }
            label="Enable Clustering"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControlLabel
            control={
              <Switch
                checked={heatMap}
                onChange={(e) => setHeatMap(e.target.checked)}
              />
            }
            label="Heat Map View"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Main Map Visualization */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Public />
                Global IOC Distribution
              </Typography>
              <Box sx={{ height: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <ResponsiveContainer width="100%" height={400}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      type="number" 
                      dataKey="lng" 
                      name="Longitude" 
                      domain={[-180, 180]}
                      tickFormatter={(value) => `${value}°`}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="lat" 
                      name="Latitude" 
                      domain={[-90, 90]}
                      tickFormatter={(value) => `${value}°`}
                    />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      formatter={(value, name) => {
                        if (name === 'count') return [value, 'IOC Count'];
                        return [value, name];
                      }}
                      labelFormatter={(label, payload) => {
                        if (payload && payload[0]) {
                          return payload[0].payload.country;
                        }
                        return label;
                      }}
                    />
                    <Scatter 
                      data={locations} 
                      fill="#2196f3"
                    >
                      {locations.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getSeverityColor(entry.severity)} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </Box>
              <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                * Interactive map view with clustering and heat map options (requires map service integration)
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Geographic Statistics */}
        <Grid item xs={12} lg={4}>
          <Grid container spacing={2}>
            {/* Top Countries */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOn />
                    Top Countries
                  </Typography>
                  <List dense>
                    {locations.slice(0, 5).map((location, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              bgcolor: getSeverityColor(location.severity)
                            }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={location.country}
                          secondary={`${location.count} IOCs`}
                        />
                        <Chip
                          label={location.severity.toUpperCase()}
                          color={location.severity === 'high' ? 'error' : location.severity === 'medium' ? 'warning' : 'success'}
                          size="small"
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Cluster Analysis */}
            {clustering && (
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Analytics />
                      Regional Clusters
                    </Typography>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={clusters}
                          cx="50%"
                          cy="50%"
                          outerRadius={70}
                          dataKey="count"
                          label={({ region, percent }) => `${region} ${(percent * 100).toFixed(0)}%`}
                        >
                          {clusters.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Summary Stats */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Geographic Summary
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Total Countries:</Typography>
                      <Typography variant="body2" fontWeight="bold">45</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">High-Risk Regions:</Typography>
                      <Typography variant="body2" fontWeight="bold">3</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Most Active:</Typography>
                      <Typography variant="body2" fontWeight="bold">United States</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Coverage:</Typography>
                      <Typography variant="body2" fontWeight="bold">Global</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};