/**
 * Threat Actor Collaboration Hub Component
 * Team collaboration and knowledge sharing
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
  TextField,
  Badge,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';

import {
  Group,
  Chat,
  Share,
  Comment,
  Assignment,
  Person,
  Schedule,
  Notifications,
  Add,
  Edit,
  Delete,
  Reply,
  ThumbUp,
  Flag
} from '@mui/icons-material';

import { addUIUXEvaluation } from '../../../services/ui-ux-evaluation/hooks/useUIUXEvaluation';
import { useServicePage } from '../../../services/business-logic/hooks/useBusinessLogic';

interface CollaborationItem {
  id: string;
  type: 'analysis' | 'comment' | 'question' | 'update' | 'alert';
  title: string;
  content: string;
  author: string;
  authorAvatar: string;
  timestamp: Date;
  actorId: string;
  actorName: string;
  tags: string[];
  replies: number;
  likes: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  status: 'online' | 'away' | 'offline';
  expertise: string[];
  contributions: number;
}

const ThreatActorCollaborationHub: React.FC = () => {
  const theme = useTheme();
  
  const {
    businessLogic,
    realTimeData,
    notifications,
    addNotification,
    isFullyLoaded,
    hasErrors,
    refresh
  } = useServicePage('threat-intelligence-collaboration');

  const [collaborationItems, setCollaborationItems] = useState<CollaborationItem[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPostOpen, setNewPostOpen] = useState(false);

  const generateMockData = useCallback(() => {
    const mockItems: CollaborationItem[] = [
      {
        id: 'collab-1',
        type: 'analysis',
        title: 'APT29 Infrastructure Analysis',
        content: 'New C2 infrastructure discovered for APT29. Domain pattern suggests...',
        author: 'Sarah Chen',
        authorAvatar: '/avatars/sarah.jpg',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        actorId: 'apt29',
        actorName: 'APT29',
        tags: ['infrastructure', 'c2', 'analysis'],
        replies: 5,
        likes: 12,
        priority: 'high'
      },
      {
        id: 'collab-2',
        type: 'question',
        title: 'Lazarus Group Attribution Question',
        content: 'Has anyone seen similar TTPs in recent campaigns? The code overlap is significant...',
        author: 'Mike Rodriguez',
        authorAvatar: '/avatars/mike.jpg',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        actorId: 'lazarus',
        actorName: 'Lazarus Group',
        tags: ['attribution', 'ttps', 'question'],
        replies: 8,
        likes: 6,
        priority: 'medium'
      }
    ];

    const mockMembers: TeamMember[] = [
      {
        id: 'member-1',
        name: 'Sarah Chen',
        email: 'sarah.chen@company.com',
        role: 'Senior Threat Analyst',
        avatar: '/avatars/sarah.jpg',
        status: 'online',
        expertise: ['Malware Analysis', 'Attribution', 'APT Groups'],
        contributions: 156
      },
      {
        id: 'member-2',
        name: 'Mike Rodriguez',
        email: 'mike.rodriguez@company.com',
        role: 'Threat Intelligence Analyst',
        avatar: '/avatars/mike.jpg',
        status: 'away',
        expertise: ['OSINT', 'Infrastructure Analysis', 'Dark Web'],
        contributions: 89
      }
    ];

    setCollaborationItems(mockItems);
    setTeamMembers(mockMembers);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        generateMockData();
        addUIUXEvaluation('collaboration-hub-loaded', 'success', {
          loadTime: 1000
        });
      } catch (error) {
        console.error('Error loading collaboration data:', error);
        addNotification('error', 'Failed to load collaboration hub');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [generateMockData, addNotification]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'analysis': return <Assignment color="primary" />;
      case 'comment': return <Comment color="info" />;
      case 'question': return <Chat color="warning" />;
      case 'update': return <Notifications color="success" />;
      case 'alert': return <Flag color="error" />;
      default: return <Chat />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#4caf50';
      case 'away': return '#ff9800';
      case 'offline': return '#9e9e9e';
      default: return '#9e9e9e';
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
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Group color="primary" />
            Threat Actor Collaboration Hub
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Team collaboration and knowledge sharing platform
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setNewPostOpen(true)}
        >
          New Post
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Main Feed */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Activity Feed
              </Typography>
              <List>
                {collaborationItems.map(item => (
                  <ListItem
                    key={item.id}
                    sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 2, alignItems: 'flex-start' }}
                  >
                    <ListItemIcon sx={{ mt: 1 }}>
                      <Avatar
                        src={item.authorAvatar}
                        sx={{ width: 40, height: 40 }}
                      >
                        {item.author.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ mb: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            {getTypeIcon(item.type)}
                            <Typography variant="h6">{item.title}</Typography>
                            <Chip 
                              label={item.priority} 
                              size="small" 
                              color={getPriorityColor(item.priority)}
                            />
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography variant="body2" fontWeight="medium">
                              {item.author}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {item.timestamp.toLocaleString()}
                            </Typography>
                            <Chip label={item.actorName} size="small" variant="outlined" />
                          </Box>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" paragraph>
                            {item.content}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
                            {item.tags.map(tag => (
                              <Chip key={tag} label={tag} size="small" variant="outlined" />
                            ))}
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Button size="small" startIcon={<ThumbUp />}>
                              {item.likes}
                            </Button>
                            <Button size="small" startIcon={<Reply />}>
                              Reply ({item.replies})
                            </Button>
                            <Button size="small" startIcon={<Share />}>
                              Share
                            </Button>
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Team Sidebar */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Team Members ({teamMembers.length})
              </Typography>
              <List dense>
                {teamMembers.map(member => (
                  <ListItem key={member.id}>
                    <ListItemIcon>
                      <Badge
                        color="success"
                        variant="dot"
                        invisible={member.status !== 'online'}
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        sx={{
                          '& .MuiBadge-badge': {
                            bgcolor: getStatusColor(member.status),
                            color: getStatusColor(member.status)
                          }
                        }}
                      >
                        <Avatar src={member.avatar}>
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                      </Badge>
                    </ListItemIcon>
                    <ListItemText
                      primary={member.name}
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            {member.role}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {member.contributions} contributions
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Stats
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {collaborationItems.length}
                    </Typography>
                    <Typography variant="caption">Active Discussions</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="success">
                      {teamMembers.filter(m => m.status === 'online').length}
                    </Typography>
                    <Typography variant="caption">Online Now</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* New Post Dialog */}
      <Dialog
        open={newPostOpen}
        onClose={() => setNewPostOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Post</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                placeholder="Enter post title..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Content"
                placeholder="Share your analysis, ask a question, or provide an update..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tags"
                placeholder="Enter tags separated by commas..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewPostOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              setNewPostOpen(false);
              addNotification('success', 'Post created successfully');
            }}
          >
            Post
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ThreatActorCollaborationHub;