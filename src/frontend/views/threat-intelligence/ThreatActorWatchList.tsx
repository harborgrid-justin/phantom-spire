/**
 * Threat Actor Watch List Component
 * High-priority actor monitoring and tracking
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  useTheme,
  alpha,
  Avatar,
  Badge,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  LinearProgress
} from '@mui/material';

import {
  Visibility,
  Warning,
  Security,
  TrendingUp,
  LocationOn,
  Schedule,
  Add,
  Edit,
  Delete,
  Notifications,
  Star,
  StarBorder,
  CheckCircle,
  Error
} from '@mui/icons-material';

import { addUIUXEvaluation } from '../../../services/ui-ux-evaluation/hooks/useUIUXEvaluation';
import { useServicePage } from '../../../services/business-logic/hooks/useBusinessLogic';
import { Status, Priority } from '../../types/index';

interface WatchListActor {
  id: string;
  name: string;
  aliases: string[];
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'active' | 'dormant' | 'disrupted';
  riskScore: number;
  lastActivity: Date;
  addedDate: Date;
  addedBy: string;
  reason: string;
  notifications: boolean;
  alerts: number;
  campaigns: number;
  geography: string;
  targeting: string[];
}

const ThreatActorWatchList: React.FC = () => {
  const theme = useTheme();
  
  const {
    businessLogic,
    realTimeData,
    notifications,
    addNotification,
    isFullyLoaded,
    hasErrors,
    refresh
  } = useServicePage('threat-intelligence-watchlist');

  const [watchedActors, setWatchedActors] = useState<WatchListActor[]>([]);
  const [loading, setLoading] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const generateMockWatchList = useCallback((): WatchListActor[] => {
    const actors: WatchListActor[] = [];
    const priorities: WatchListActor['priority'][] = ['critical', 'high', 'medium', 'low'];
    const statuses: WatchListActor['status'][] = ['active', 'dormant', 'disrupted'];
    const geographies = ['Global', 'Asia Pacific', 'Europe', 'North America', 'Middle East'];
    const sectors = ['Financial', 'Government', 'Healthcare', 'Technology', 'Energy'];

    for (let i = 1; i <= 25; i++) {
      actors.push({
        id: `watch-actor-${i}`,
        name: `WatchedActor-${i}`,
        aliases: [`WA-${i}`, `Group-${i}`],
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        riskScore: Math.floor(Math.random() * 40) + 60,
        lastActivity: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        addedDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
        addedBy: `analyst${Math.floor(Math.random() * 5) + 1}@company.com`,
        reason: `High-priority threat actor targeting ${sectors[Math.floor(Math.random() * sectors.length)]} sector`,
        notifications: Math.random() > 0.3,
        alerts: Math.floor(Math.random() * 20),
        campaigns: Math.floor(Math.random() * 8) + 1,
        geography: geographies[Math.floor(Math.random() * geographies.length)],
        targeting: sectors.slice(0, Math.floor(Math.random() * 3) + 1)
      });
    }

    return actors.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockWatchList = generateMockWatchList();
        setWatchedActors(mockWatchList);
        addUIUXEvaluation('watchlist-loaded', 'success', {
          actorCount: mockWatchList.length,
          loadTime: 1000
        });
      } catch (error) {
        console.error('Error loading watch list:', error);
        addNotification('error', 'Failed to load watch list');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [generateMockWatchList, addNotification]);

  const filteredActors = watchedActors.filter(actor => {
    if (priorityFilter !== 'all' && actor.priority !== priorityFilter) return false;
    if (statusFilter !== 'all' && actor.status !== statusFilter) return false;
    return true;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'error';
      case 'dormant': return 'warning';
      case 'disrupted': return 'success';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Visibility color="primary" />
          Threat Actor Watch List
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Monitor and track high-priority threat actors
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="error">
                {watchedActors.filter(a => a.priority === 'critical').length}
              </Typography>
              <Typography variant="caption">Critical Priority</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="warning">
                {watchedActors.filter(a => a.status === 'active').length}
              </Typography>
              <Typography variant="caption">Active Actors</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="info">
                {watchedActors.reduce((sum, a) => sum + a.alerts, 0)}
              </Typography>
              <Typography variant="caption">Total Alerts</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="success">
                {watchedActors.filter(a => a.notifications).length}
              </Typography>
              <Typography variant="caption">Monitored</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Priority</InputLabel>
              <Select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                label="Priority"
              >
                <MenuItem value="all">All Priorities</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="dormant">Dormant</MenuItem>
                <MenuItem value="disrupted">Disrupted</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button variant="contained" startIcon={<Add />}>
                Add Actor
              </Button>
              <Button variant="outlined" startIcon={<Notifications />}>
                Alert Settings
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Watch List */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Watched Actors ({filteredActors.length})
              </Typography>
              <List>
                {filteredActors.map(actor => (
                  <ListItem
                    key={actor.id}
                    sx={{ 
                      border: 1, 
                      borderColor: 'divider', 
                      borderRadius: 1, 
                      mb: 2,
                      bgcolor: actor.priority === 'critical' ? alpha(theme.palette.error.main, 0.05) : 'background.paper'
                    }}
                  >
                    <ListItemIcon>
                      <Badge
                        badgeContent={actor.alerts}
                        color="error"
                        max={99}
                      >
                        <Avatar sx={{ bgcolor: getPriorityColor(actor.priority) }}>
                          <Security />
                        </Avatar>
                      </Badge>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="h6">{actor.name}</Typography>
                          <Chip 
                            label={actor.priority} 
                            color={getPriorityColor(actor.priority)}
                            size="small"
                          />
                          <Chip 
                            label={actor.status} 
                            color={getStatusColor(actor.status)}
                            variant="outlined"
                            size="small"
                          />
                          {actor.notifications && <Notifications color="info" fontSize="small" />}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary" paragraph>
                            {actor.reason}
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={3}>
                              <Typography variant="caption" display="block">Risk Score</Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={actor.riskScore} 
                                  sx={{ flexGrow: 1, height: 6 }}
                                  color={actor.riskScore > 80 ? 'error' : actor.riskScore > 60 ? 'warning' : 'success'}
                                />
                                <Typography variant="caption">{actor.riskScore}/100</Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <Typography variant="caption" display="block">Last Activity</Typography>
                              <Typography variant="body2">{actor.lastActivity.toLocaleDateString()}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <Typography variant="caption" display="block">Geography</Typography>
                              <Typography variant="body2">{actor.geography}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <Typography variant="caption" display="block">Campaigns</Typography>
                              <Typography variant="body2">{actor.campaigns} active</Typography>
                            </Grid>
                          </Grid>
                          <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {actor.targeting.map((target, idx) => (
                              <Chip key={idx} label={target} size="small" variant="outlined" />
                            ))}
                          </Box>
                        </Box>
                      }
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={actor.notifications}
                            size="small"
                          />
                        }
                        label="Notify"
                        labelPlacement="start"
                      />
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton size="small">
                          <Edit />
                        </IconButton>
                        <IconButton size="small">
                          <Delete />
                        </IconButton>
                        <IconButton size="small">
                          {actor.priority === 'critical' ? <Star color="warning" /> : <StarBorder />}
                        </IconButton>
                      </Box>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ThreatActorWatchList;