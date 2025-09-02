/**
 * Top Application Bar Component
 * Enterprise-grade header with search, notifications, and user controls
 */

import React, { useState, useMemo } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  IconButton,
  InputBase,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  Chip,
  Button,
  alpha,
  useTheme,
  Tooltip,
  ListItemIcon,
  ListItemText,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Search,
  Notifications,
  Settings,
  AccountCircle,
  Logout,
  DarkMode,
  LightMode,
  Menu as MenuIcon,
  Security,
  Speed,
  Warning,
  CheckCircle,
  Error,
  Info,
  Refresh,
  FullscreenExit,
  Fullscreen
} from '@mui/icons-material';
import { User, SystemStatus } from '../../types/common';
import { useAuth } from '../../context/AuthenticationContext';
import { useNotification } from '../../context/NotificationContext';
import { useSecurity } from '../../context/SecurityContext';
import { useTheme as useAppTheme } from '../../context/ThemeContext';

interface TopAppBarProps {
  onSidebarToggle: () => void;
  user: User;
  onLogout: () => void;
  systemStatus: SystemStatus;
}

interface GlobalSearchResult {
  id: string;
  type: 'ioc' | 'incident' | 'campaign' | 'actor' | 'technique';
  title: string;
  subtitle: string;
  path: string;
  severity?: string;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  onSidebarToggle,
  user,
  onLogout,
  systemStatus
}) => {
  const theme = useTheme();
  const { logout } = useAuth();
  const { state: notificationState } = useNotification();
  const { state: securityState } = useSecurity();
  const { state: themeState, setThemeMode } = useAppTheme();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GlobalSearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [notificationMenuAnchor, setNotificationMenuAnchor] = useState<null | HTMLElement>(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [securityMenuAnchor, setSecurityMenuAnchor] = useState<null | HTMLElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // System status configuration
  const systemStatusConfig = {
    operational: { color: theme.palette.success.main, icon: <CheckCircle />, label: 'Operational' },
    degraded: { color: theme.palette.warning.main, icon: <Warning />, label: 'Degraded Performance' },
    maintenance: { color: theme.palette.info.main, icon: <Info />, label: 'Maintenance Mode' },
    error: { color: theme.palette.error.main, icon: <Error />, label: 'System Error' },
    initializing: { color: theme.palette.grey[500], icon: <Refresh />, label: 'Initializing' }
  };

  // Mock search functionality
  const handleSearch = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    // Simulate API search
    setTimeout(() => {
      const mockResults: GlobalSearchResult[] = [
        {
          id: '1',
          type: 'ioc',
          title: `IP Address: 192.168.1.${query}`,
          subtitle: 'Suspicious network activity detected',
          path: '/ioc/details/1',
          severity: 'high'
        },
        {
          id: '2',
          type: 'incident',
          title: `INC-2024-${query}`,
          subtitle: 'Active malware incident',
          path: '/incidents/2',
          severity: 'critical'
        },
        {
          id: '3',
          type: 'campaign',
          title: `Campaign ${query}`,
          subtitle: 'Advanced Persistent Threat',
          path: '/repository/campaigns/3'
        }
      ];
      setSearchResults(mockResults);
      setShowSearchResults(true);
    }, 300);
  };

  const handleNotificationMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationMenuAnchor(event.currentTarget);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleSecurityMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setSecurityMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setNotificationMenuAnchor(null);
    setUserMenuAnchor(null);
    setSecurityMenuAnchor(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await logout();
    onLogout();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const toggleThemeMode = () => {
    const newMode = themeState.actualMode === 'dark' ? 'light' : 'dark';
    setThemeMode(newMode);
  };

  // Recent notifications for dropdown
  const recentNotifications = useMemo(() => {
    return notificationState.notifications.slice(0, 5);
  }, [notificationState.notifications]);

  return (
    <AppBar 
      position="static" 
      elevation={1}
      sx={{ 
        backgroundColor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
        color: theme.palette.text.primary
      }}
    >
      <Toolbar>
        {/* Menu Toggle */}
        <IconButton
          edge="start"
          color="inherit"
          onClick={onSidebarToggle}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        {/* Global Search */}
        <Box 
          sx={{ 
            position: 'relative',
            borderRadius: 1,
            backgroundColor: alpha(theme.palette.common.black, 0.05),
            '&:hover': {
              backgroundColor: alpha(theme.palette.common.black, 0.08),
            },
            marginLeft: 0,
            marginRight: 2,
            width: '100%',
            maxWidth: 400,
          }}
        >
          <Box
            sx={{
              padding: theme.spacing(0, 2),
              height: '100%',
              position: 'absolute',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Search />
          </Box>
          <InputBase
            placeholder="Global search across all threat intelligence data..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              handleSearch(e.target.value);
            }}
            sx={{
              color: 'inherit',
              '& .MuiInputBase-input': {
                padding: theme.spacing(1, 1, 1, 0),
                paddingLeft: `calc(1em + ${theme.spacing(4)})`,
                transition: theme.transitions.create('width'),
                width: '100%'
              },
            }}
          />
          
          {/* Search Results Dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <Box
              sx={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: theme.palette.background.paper,
                boxShadow: theme.shadows[8],
                borderRadius: 1,
                mt: 1,
                zIndex: 1300,
                maxHeight: 300,
                overflow: 'auto'
              }}
            >
              {searchResults.map((result) => (
                <MenuItem
                  key={result.id}
                  onClick={() => {
                    setShowSearchResults(false);
                    setSearchQuery('');
                    // Navigate to result
                  }}
                >
                  <ListItemIcon>
                    <Security />
                  </ListItemIcon>
                  <ListItemText
                    primary={result.title}
                    secondary={result.subtitle}
                  />
                  {result.severity && (
                    <Chip 
                      size="small" 
                      label={result.severity}
                      color={result.severity === 'critical' ? 'error' : 
                             result.severity === 'high' ? 'warning' : 'default'}
                    />
                  )}
                </MenuItem>
              ))}
            </Box>
          )}
        </Box>

        {/* System Status Indicator */}
        <Tooltip title={`System Status: ${systemStatusConfig[systemStatus].label}`}>
          <Chip
            icon={systemStatusConfig[systemStatus].icon}
            label={systemStatusConfig[systemStatus].label}
            variant="outlined"
            size="small"
            sx={{
              mr: 2,
              borderColor: systemStatusConfig[systemStatus].color,
              color: systemStatusConfig[systemStatus].color
            }}
          />
        </Tooltip>

        <Box sx={{ flexGrow: 1 }} />

        {/* Right side controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          
          {/* Security Status */}
          <Tooltip title={`Security Status: Threat Level ${securityState.threatLevel.toUpperCase()}`}>
            <IconButton 
              color="inherit" 
              onClick={handleSecurityMenuOpen}
              sx={{
                color: securityState.threatLevel === 'critical' ? theme.palette.error.main :
                       securityState.threatLevel === 'high' ? theme.palette.warning.main :
                       securityState.threatLevel === 'medium' ? theme.palette.info.main :
                       theme.palette.success.main
              }}
            >
              <Badge
                badgeContent={securityState.events.filter(e => e.severity === 'critical').length}
                color="error"
              >
                <Security />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Theme Toggle */}
          <Tooltip title="Toggle Dark Mode">
            <IconButton color="inherit" onClick={toggleThemeMode}>
              {themeState.actualMode === 'dark' ? <LightMode /> : <DarkMode />}
            </IconButton>
          </Tooltip>

          {/* Fullscreen Toggle */}
          <Tooltip title="Toggle Fullscreen">
            <IconButton color="inherit" onClick={toggleFullscreen}>
              {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
            </IconButton>
          </Tooltip>

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton color="inherit" onClick={handleNotificationMenuOpen}>
              <Badge badgeContent={notificationState.unreadCount} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* User Menu */}
          <Tooltip title="User Menu">
            <IconButton color="inherit" onClick={handleUserMenuOpen}>
              <Avatar 
                src={user.avatar}
                sx={{ 
                  width: 32, 
                  height: 32,
                  bgcolor: theme.palette.primary.main
                }}
              >
                {user.name.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>

      {/* Security Menu */}
      <Menu
        anchorEl={securityMenuAnchor}
        open={Boolean(securityMenuAnchor)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { width: 320, maxHeight: 400 }
        }}
      >
        <MenuItem disabled>
          <ListItemIcon>
            <Security />
          </ListItemIcon>
          <ListItemText 
            primary="Security Status"
            secondary={`Threat Level: ${securityState.threatLevel.toUpperCase()}`}
          />
        </MenuItem>
        <Divider />
        <MenuItem>
          <ListItemText 
            primary="Security Score"
            secondary={`${securityState.securityScore}/100`}
          />
        </MenuItem>
        <MenuItem>
          <ListItemText 
            primary="Active Policies"
            secondary={`${securityState.policies.filter(p => p.enabled).length} policies`}
          />
        </MenuItem>
        <MenuItem>
          <ListItemText 
            primary="Recent Events"
            secondary={`${securityState.events.length} events logged`}
          />
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationMenuAnchor}
        open={Boolean(notificationMenuAnchor)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { width: 400, maxHeight: 500 }
        }}
      >
        <MenuItem disabled>
          <ListItemIcon>
            <Notifications />
          </ListItemIcon>
          <ListItemText primary="Recent Notifications" />
          <Typography variant="caption" color="textSecondary">
            {notificationState.unreadCount} unread
          </Typography>
        </MenuItem>
        <Divider />
        
        {recentNotifications.length === 0 ? (
          <MenuItem disabled>
            <ListItemText primary="No notifications" />
          </MenuItem>
        ) : (
          recentNotifications.map((notification) => (
            <MenuItem key={notification.id}>
              <ListItemIcon>
                {notification.level === 'error' ? <Error color="error" /> :
                 notification.level === 'warning' ? <Warning color="warning" /> :
                 notification.level === 'success' ? <CheckCircle color="success" /> :
                 <Info color="info" />}
              </ListItemIcon>
              <ListItemText
                primary={notification.title}
                secondary={notification.message}
                primaryTypographyProps={{
                  variant: 'body2',
                  fontWeight: notification.read ? 'normal' : 'bold'
                }}
              />
            </MenuItem>
          ))
        )}
        
        <Divider />
        <MenuItem>
          <Button fullWidth variant="text" size="small">
            View All Notifications
          </Button>
        </MenuItem>
      </Menu>

      {/* User Menu */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { width: 280 }
        }}
      >
        <MenuItem disabled>
          <ListItemIcon>
            <Avatar 
              src={user.avatar}
              sx={{ width: 24, height: 24, bgcolor: theme.palette.primary.main }}
            >
              {user.name.charAt(0).toUpperCase()}
            </Avatar>
          </ListItemIcon>
          <ListItemText 
            primary={user.name}
            secondary={`${user.role} • ${user.organization}`}
          />
        </MenuItem>
        <Divider />
        
        <MenuItem>
          <ListItemIcon>
            <AccountCircle />
          </ListItemIcon>
          <ListItemText primary="Profile Settings" />
        </MenuItem>
        
        <MenuItem>
          <ListItemIcon>
            <Settings />
          </ListItemIcon>
          <ListItemText primary="Preferences" />
        </MenuItem>
        
        <MenuItem>
          <FormControlLabel
            control={
              <Switch 
                checked={themeState.actualMode === 'dark'}
                onChange={toggleThemeMode}
                size="small"
              />
            }
            label="Dark Mode"
            sx={{ ml: 0 }}
          />
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout />
          </ListItemIcon>
          <ListItemText primary="Sign Out" />
        </MenuItem>
      </Menu>
    </AppBar>
  );
};