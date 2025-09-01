import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  Badge,
  Tooltip,
  useTheme,
  styled,
  alpha,
  Slide,
  Fade,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Notifications,
  Warning,
  Error,
  Info,
  CheckCircle,
  Security,
  Speed,
  BugReport,
  Schedule,
  Person,
  Settings,
  Clear,
  FilterList,
  Refresh,
  VolumeOff,
  VolumeUp
} from '@mui/icons-material';

// UI/UX Evaluation System Integration
import { addUIUXEvaluation } from '../services/ui-ux-evaluation';

// Advanced Notification System with Fortune 100 enterprise features
const EnterpriseNotificationCenter: React.FC = () => {
  const theme = useTheme();
  const [notifications, setNotifications] = useState(generateMockNotifications());
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [isMuted, setIsMuted] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // Initialize UI/UX Evaluation System
  useEffect(() => {
    const evaluationController = addUIUXEvaluation('enterprise-notification-center', {
      continuous: true,
      position: 'bottom-left', // Different position to avoid conflicts
      minimized: false,
      interval: 30000 // Evaluate every 30 seconds for notification system
    });

    // Cleanup on unmount
    return () => {
      evaluationController.remove();
    };
  }, []);

  // Styled components with enterprise-grade design
  const NotificationPanel = styled(Card)(({ theme }) => ({
    position: 'fixed',
    top: 20,
    right: 20,
    width: 420,
    maxHeight: '80vh',
    overflowY: 'auto',
    zIndex: 1300,
    background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)}, ${alpha(theme.palette.background.default, 0.9)})`,
    backdropFilter: 'blur(20px)',
    border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
    boxShadow: theme.shadows[24]
  }));

  const NotificationItem = styled(ListItem)(({ theme, severity = 'info' }) => {
    const severityColors = {
      critical: theme.palette.error.main,
      warning: theme.palette.warning.main,
      success: theme.palette.success.main,
      info: theme.palette.info.main
    };

    return {
      borderLeft: `4px solid ${severityColors[severity]}`,
      marginBottom: theme.spacing(1),
      borderRadius: theme.shape.borderRadius,
      background: `linear-gradient(135deg, ${alpha(severityColors[severity], 0.05)}, ${alpha(theme.palette.background.paper, 0.8)})`,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
      '&:hover': {
        transform: 'translateX(8px)',
        boxShadow: theme.shadows[4],
        background: `linear-gradient(135deg, ${alpha(severityColors[severity], 0.1)}, ${alpha(theme.palette.background.paper, 0.9)})`
      }
    };
  });

  const FloatingNotificationButton = styled(IconButton)(({ theme, hasUnread }) => ({
    position: 'fixed',
    bottom: 32,
    right: 32,
    width: 64,
    height: 64,
    backgroundColor: hasUnread ? theme.palette.error.main : theme.palette.primary.main,
    color: theme.palette.common.white,
    boxShadow: theme.shadows[8],
    zIndex: 1200,
    animation: hasUnread ? 'pulse 2s infinite' : 'none',
    '&:hover': {
      backgroundColor: hasUnread ? theme.palette.error.dark : theme.palette.primary.dark,
      transform: 'scale(1.1)',
      boxShadow: theme.shadows[12]
    },
    '&::before': hasUnread ? {
      content: '""',
      position: 'absolute',
      top: -2,
      left: -2,
      right: -2,
      bottom: -2,
      borderRadius: '50%',
      background: `conic-gradient(${theme.palette.error.main}, ${theme.palette.warning.main}, ${theme.palette.error.main})`,
      animation: 'rotate 3s linear infinite',
      zIndex: -1
    } : {}
  }));

  // Mock notification generator
  function generateMockNotifications() {
    const types = ['critical', 'warning', 'success', 'info'];
    const sources = ['Workflow Engine', 'Threat Intelligence', 'Security Monitor', 'Performance Monitor', 'Compliance System'];
    const messages = {
      critical: [
        'Critical security threat detected - APT29 indicators found',
        'Workflow execution failure - Database connection lost',
        'System resource critically low - CPU at 98%',
        'Authentication breach attempt blocked'
      ],
      warning: [
        'High memory usage detected - 85% utilization',
        'Unusual network traffic pattern identified',
        'Performance degradation in workflow engine',
        'Certificate expiring in 7 days'
      ],
      success: [
        'Threat mitigation successful - 150 IOCs blocked',
        'Workflow optimization completed - 25% improvement',
        'Security scan completed - No vulnerabilities found',
        'Backup completed successfully'
      ],
      info: [
        'New threat intelligence feed available',
        'System update scheduled for maintenance window',
        'Weekly security report generated',
        'User training session reminder'
      ]
    };

    return Array.from({ length: 15 }, (_, i) => {
      const severity = types[Math.floor(Math.random() * types.length)];
      const source = sources[Math.floor(Math.random() * sources.length)];
      const message = messages[severity][Math.floor(Math.random() * messages[severity].length)];
      
      return {
        id: `notification-${i}`,
        severity,
        source,
        message,
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
        read: Math.random() > 0.6,
        priority: severity === 'critical' ? 'high' : severity === 'warning' ? 'medium' : 'low',
        category: ['security', 'performance', 'system', 'compliance'][Math.floor(Math.random() * 4)],
        details: {
          affectedSystems: ['Workflow Engine', 'Database Cluster', 'Message Queue'],
          recommendedActions: ['Investigate immediately', 'Review logs', 'Check system resources'],
          escalationLevel: severity === 'critical' ? 'L1' : 'L2',
          incidentId: `INC-${Date.now()}-${i}`
        }
      };
    }).sort((a, b) => b.timestamp - a.timestamp);
  }

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    if (filter === 'all') return notifications;
    return notifications.filter(n => n.severity === filter);
  }, [notifications, filter]);

  // Unread count
  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  // Auto-refresh notifications
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate new notifications
      if (Math.random() > 0.7) {
        const newNotification = generateMockNotifications()[0];
        newNotification.id = `notification-${Date.now()}`;
        newNotification.timestamp = new Date();
        newNotification.read = false;
        
        setNotifications(prev => [newNotification, ...prev.slice(0, 19)]);
        
        // Play notification sound (simulation)
        if (!isMuted) {
          console.log('🔔 New notification sound would play');
        }
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [isMuted]);

  // Handlers
  const handleNotificationClick = useCallback((notification) => {
    setSelectedNotification(notification);
    setIsDetailDialogOpen(true);
    
    // Mark as read
    setNotifications(prev => 
      prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
    );
  }, []);

  const handleMarkAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const handleClearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const getSeverityIcon = (severity: string) => {
    const icons = {
      critical: <Error />,
      warning: <Warning />,
      success: <CheckCircle />,
      info: <Info />
    };
    return icons[severity] || <Info />;
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      critical: theme.palette.error.main,
      warning: theme.palette.warning.main,
      success: theme.palette.success.main,
      info: theme.palette.info.main
    };
    return colors[severity] || theme.palette.info.main;
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <>
      {/* Floating Notification Button */}
      <Badge 
        badgeContent={unreadCount} 
        color="error" 
        max={99}
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          zIndex: 1200
        }}
      >
        <FloatingNotificationButton
          hasUnread={unreadCount > 0}
          onClick={() => setIsOpen(!isOpen)}
        >
          <Notifications fontSize="large" />
        </FloatingNotificationButton>
      </Badge>

      {/* Notification Panel */}
      {isOpen && (
        <Slide direction="left" in={isOpen} timeout={300}>
          <NotificationPanel elevation={24}>
            <CardContent sx={{ p: 0 }}>
              {/* Header */}
              <Box sx={{ p: 2, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold">
                    🔔 Notification Center
                  </Typography>
                  <IconButton onClick={() => setIsOpen(false)} size="small">
                    <Clear />
                  </IconButton>
                </Box>

                {/* Controls */}
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                  <FormControl size="small" sx={{ minWidth: 100 }}>
                    <Select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      displayEmpty
                    >
                      <MenuItem value="all">All</MenuItem>
                      <MenuItem value="critical">Critical</MenuItem>
                      <MenuItem value="warning">Warning</MenuItem>
                      <MenuItem value="success">Success</MenuItem>
                      <MenuItem value="info">Info</MenuItem>
                    </Select>
                  </FormControl>

                  <Tooltip title={isMuted ? 'Unmute notifications' : 'Mute notifications'}>
                    <IconButton 
                      onClick={() => setIsMuted(!isMuted)}
                      color={isMuted ? 'error' : 'default'}
                      size="small"
                    >
                      {isMuted ? <VolumeOff /> : <VolumeUp />}
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Mark all as read">
                    <IconButton onClick={handleMarkAllRead} size="small">
                      <CheckCircle />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Clear all">
                    <IconButton onClick={handleClearNotifications} size="small">
                      <Clear />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {/* Notification List */}
              <Box sx={{ maxHeight: '60vh', overflowY: 'auto' }}>
                {filteredNotifications.length === 0 ? (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="body2" color="textSecondary">
                      No notifications to display
                    </Typography>
                  </Box>
                ) : (
                  <List sx={{ p: 1 }}>
                    {filteredNotifications.map((notification, index) => (
                      <Fade in key={notification.id} timeout={200 * (index + 1)}>
                        <NotificationItem
                          severity={notification.severity}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <ListItemAvatar>
                            <Avatar
                              sx={{
                                backgroundColor: alpha(getSeverityColor(notification.severity), 0.1),
                                color: getSeverityColor(notification.severity)
                              }}
                            >
                              {getSeverityIcon(notification.severity)}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="subtitle2" fontWeight="bold">
                                  {notification.source}
                                </Typography>
                                {!notification.read && (
                                  <Box
                                    sx={{
                                      width: 8,
                                      height: 8,
                                      backgroundColor: theme.palette.primary.main,
                                      borderRadius: '50%'
                                    }}
                                  />
                                )}
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" sx={{ mb: 0.5 }}>
                                  {notification.message}
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Chip 
                                    label={notification.category}
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontSize: '0.7rem' }}
                                  />
                                  <Typography variant="caption" color="textSecondary">
                                    {formatTimestamp(notification.timestamp)}
                                  </Typography>
                                </Box>
                              </Box>
                            }
                          />
                        </NotificationItem>
                      </Fade>
                    ))}
                  </List>
                )}
              </Box>
            </CardContent>
          </NotificationPanel>
        </Slide>
      )}

      {/* Notification Detail Dialog */}
      <Dialog
        open={isDetailDialogOpen}
        onClose={() => setIsDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)}, ${alpha(theme.palette.background.default, 0.9)})`,
            backdropFilter: 'blur(20px)'
          }
        }}
      >
        {selectedNotification && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  sx={{
                    backgroundColor: alpha(getSeverityColor(selectedNotification.severity), 0.1),
                    color: getSeverityColor(selectedNotification.severity)
                  }}
                >
                  {getSeverityIcon(selectedNotification.severity)}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {selectedNotification.source}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {selectedNotification.details.incidentId} • {formatTimestamp(selectedNotification.timestamp)}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" gutterBottom>
                  {selectedNotification.message}
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  🎯 Affected Systems:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {selectedNotification.details.affectedSystems.map(system => (
                    <Chip key={system} label={system} size="small" variant="outlined" />
                  ))}
                </Box>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  🔧 Recommended Actions:
                </Typography>
                <List dense>
                  {selectedNotification.details.recommendedActions.map((action, index) => (
                    <ListItem key={index} sx={{ py: 0.5 }}>
                      <ListItemText primary={`• ${action}`} />
                    </ListItem>
                  ))}
                </List>
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Chip 
                  label={`Priority: ${selectedNotification.priority.toUpperCase()}`}
                  color={selectedNotification.priority === 'high' ? 'error' : 'primary'}
                />
                <Chip 
                  label={`Escalation: ${selectedNotification.details.escalationLevel}`}
                  variant="outlined"
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setIsDetailDialogOpen(false)}>
                Close
              </Button>
              <Button variant="contained" color="primary">
                Create Incident
              </Button>
              <Button variant="contained" color="success">
                Mark Resolved
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Global styles */}
      <style jsx global>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default EnterpriseNotificationCenter;