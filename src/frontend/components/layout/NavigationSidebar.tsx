/**
 * Navigation Sidebar Component
 * Enterprise-grade navigation for CTI platform
 */

import React, { useState, useMemo } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Avatar,
  IconButton,
  Collapse,
  Badge,
  Tooltip,
  useTheme,
  alpha
} from '@mui/material';
import {
  Dashboard,
  Security,
  BugReport,
  Search,
  Analytics,
  RssFeed,
  Timeline,
  AdminPanelSettings,
  Visibility,
  Storage,
  Extension,
  ExpandLess,
  ExpandMore,
  Settings,
  Help,
  Logout,
  ChevronLeft,
  ChevronRight,
  Notifications,
  Warning,
  CheckCircle,
  Router
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { User } from '../../types/common';
import { useAuth } from '../../context/AuthenticationContext';
import { useNotification } from '../../context/NotificationContext';

interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactElement;
  badge?: number;
  color?: string;
  children?: NavigationItem[];
  requiredPermissions?: string[];
  requiredRoles?: string[];
}

interface NavigationSidebarProps {
  open: boolean;
  onToggle: () => void;
  user: User;
}

const DRAWER_WIDTH = 280;
const DRAWER_COLLAPSED_WIDTH = 64;

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  open,
  onToggle,
  user
}) => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { hasPermission, hasRole } = useAuth();
  const { state: notificationState } = useNotification();
  
  const [expandedSections, setExpandedSections] = useState<string[]>(['main']);

  // Navigation structure
  const navigationItems: NavigationItem[] = useMemo(() => [
    {
      id: 'dashboard',
      label: 'Threat Intelligence Dashboard',
      path: '/dashboard',
      icon: <Dashboard />,
      color: theme.palette.primary.main
    },
    {
      id: 'ioc',
      label: 'IOC Management',
      path: '/ioc',
      icon: <Security />,
      children: [
        {
          id: 'ioc-search',
          label: 'IOC Search',
          path: '/ioc/search',
          icon: <Search />
        },
        {
          id: 'ioc-analysis',
          label: 'IOC Analysis',
          path: '/ioc/analysis',
          icon: <Analytics />
        },
        {
          id: 'ioc-enrichment',
          label: 'Enrichment',
          path: '/ioc/enrichment',
          icon: <Extension />
        }
      ]
    },
    {
      id: 'incidents',
      label: 'Incident Response',
      path: '/incidents',
      icon: <BugReport />,
      badge: 3, // Active incidents
      color: theme.palette.error.main,
      children: [
        {
          id: 'incidents-active',
          label: 'Active Incidents',
          path: '/incidents/active',
          icon: <Warning />,
          badge: 3
        },
        {
          id: 'incidents-resolved',
          label: 'Resolved',
          path: '/incidents/resolved',
          icon: <CheckCircle />
        },
        {
          id: 'incidents-create',
          label: 'Create Incident',
          path: '/incidents/create',
          icon: <BugReport />
        }
      ],
      requiredPermissions: ['investigate']
    },
    {
      id: 'hunting',
      label: 'Threat Hunting',
      path: '/hunting',
      icon: <Search />,
      children: [
        {
          id: 'hunting-workspace',
          label: 'Hunting Workspace',
          path: '/hunting/workspace',
          icon: <Search />
        },
        {
          id: 'hunting-queries',
          label: 'Saved Queries',
          path: '/hunting/queries',
          icon: <Storage />
        },
        {
          id: 'hunting-campaigns',
          label: 'Hunt Campaigns',
          path: '/hunting/campaigns',
          icon: <Timeline />
        }
      ],
      requiredPermissions: ['investigate']
    },
    {
      id: 'analytics',
      label: 'Analytics & Reporting',
      path: '/analytics',
      icon: <Analytics />,
      children: [
        {
          id: 'analytics-dashboard',
          label: 'Analytics Dashboard',
          path: '/analytics/dashboard',
          icon: <Dashboard />
        },
        {
          id: 'analytics-reports',
          label: 'Reports',
          path: '/analytics/reports',
          icon: <Analytics />
        },
        {
          id: 'analytics-trends',
          label: 'Threat Trends',
          path: '/analytics/trends',
          icon: <Timeline />
        }
      ]
    },
    {
      id: 'feeds',
      label: 'Feed Management',
      path: '/feeds',
      icon: <RssFeed />,
      children: [
        {
          id: 'feeds-active',
          label: 'Active Feeds',
          path: '/feeds/active',
          icon: <RssFeed />
        },
        {
          id: 'feeds-configure',
          label: 'Configure Feeds',
          path: '/feeds/configure',
          icon: <Settings />
        },
        {
          id: 'feeds-history',
          label: 'Feed History',
          path: '/feeds/history',
          icon: <Timeline />
        }
      ],
      requiredPermissions: ['manage_feeds']
    },
    {
      id: 'investigation',
      label: 'Investigation Timeline',
      path: '/investigation',
      icon: <Timeline />,
      requiredPermissions: ['investigate']
    },
    {
      id: 'operations',
      label: 'Operations Center',
      path: '/operations',
      icon: <Visibility />,
      color: theme.palette.secondary.main
    },
    {
      id: 'repository',
      label: 'Threat Intel Repository',
      path: '/repository',
      icon: <Storage />,
      children: [
        {
          id: 'repository-search',
          label: 'Knowledge Search',
          path: '/repository/search',
          icon: <Search />
        },
        {
          id: 'repository-campaigns',
          label: 'Campaigns',
          path: '/repository/campaigns',
          icon: <Timeline />
        },
        {
          id: 'repository-actors',
          label: 'Threat Actors',
          path: '/repository/actors',
          icon: <Security />
        }
      ]
    },
    {
      id: 'integrations',
      label: 'Integration Platform',
      path: '/integrations',
      icon: <Extension />,
      requiredPermissions: ['admin']
    },
    {
      id: 'network-management',
      label: 'Network Management',
      path: '/network-management',
      icon: <Router />,
      color: theme.palette.primary.main,
      children: [
        {
          id: 'network-infrastructure',
          label: 'Infrastructure',
          path: '/network-management/infrastructure',
          icon: <Router />
        },
        {
          id: 'network-monitoring',
          label: 'Monitoring',
          path: '/network-management/monitoring',
          icon: <Visibility />
        },
        {
          id: 'network-security',
          label: 'Security',
          path: '/network-management/security',
          icon: <Security />
        },
        {
          id: 'network-configuration',
          label: 'Configuration',
          path: '/network-management/configuration',
          icon: <Settings />
        },
        {
          id: 'network-optimization',
          label: 'Optimization',
          path: '/network-management/optimization',
          icon: <Analytics />
        },
        {
          id: 'network-compliance',
          label: 'Compliance',
          path: '/network-management/compliance',
          icon: <AdminPanelSettings />
        }
      ]
    },
    {
      id: 'admin',
      label: 'Administration',
      path: '/admin',
      icon: <AdminPanelSettings />,
      children: [
        {
          id: 'admin-users',
          label: 'User Management',
          path: '/admin/users',
          icon: <AdminPanelSettings />
        },
        {
          id: 'admin-system',
          label: 'System Settings',
          path: '/admin/system',
          icon: <Settings />
        },
        {
          id: 'admin-audit',
          label: 'Audit Logs',
          path: '/admin/audit',
          icon: <Timeline />
        }
      ],
      requiredRoles: ['admin']
    }
  ], [theme, notificationState]);

  // Filter navigation items based on permissions
  const filteredNavigationItems = useMemo(() => {
    return navigationItems.filter(item => {
      if (item.requiredPermissions) {
        return item.requiredPermissions.some(permission => hasPermission(permission));
      }
      if (item.requiredRoles) {
        return item.requiredRoles.some(role => hasRole(role));
      }
      return true;
    });
  }, [navigationItems, hasPermission, hasRole]);

  const handleSectionToggle = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const isActive = (path: string): boolean => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedSections.includes(item.id);
    const active = isActive(item.path);

    if (hasChildren && open) {
      return (
        <Box key={item.id}>
          <ListItemButton
            sx={{
              pl: 2 + level * 2,
              py: 1,
              borderRadius: 1,
              mx: 1,
              mb: 0.5,
              backgroundColor: active ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.05)
              }
            }}
            onClick={() => handleSectionToggle(item.id)}
          >
            <ListItemIcon sx={{ minWidth: 40, color: item.color || 'inherit' }}>
              {item.badge ? (
                <Badge badgeContent={item.badge} color="error">
                  {item.icon}
                </Badge>
              ) : (
                item.icon
              )}
            </ListItemIcon>
            <ListItemText 
              primary={item.label}
              primaryTypographyProps={{
                variant: 'body2',
                fontWeight: active ? 600 : 400
              }}
            />
            {isExpanded ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children?.map(child => renderNavigationItem(child, level + 1))}
            </List>
          </Collapse>
        </Box>
      );
    }

    return (
      <ListItem key={item.id} disablePadding sx={{ display: 'block' }}>
        <Tooltip title={!open ? item.label : ''} placement="right">
          <ListItemButton
            sx={{
              pl: open ? 2 + level * 2 : 1.5,
              py: 1,
              borderRadius: 1,
              mx: 1,
              mb: 0.5,
              justifyContent: open ? 'initial' : 'center',
              backgroundColor: active ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
              borderLeft: active ? `3px solid ${theme.palette.primary.main}` : 'none',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.05)
              }
            }}
            onClick={() => handleNavigate(item.path)}
          >
            <ListItemIcon 
              sx={{ 
                minWidth: 0,
                mr: open ? 2 : 'auto',
                justifyContent: 'center',
                color: active ? theme.palette.primary.main : (item.color || 'inherit')
              }}
            >
              {item.badge ? (
                <Badge badgeContent={item.badge} color="error">
                  {item.icon}
                </Badge>
              ) : (
                item.icon
              )}
            </ListItemIcon>
            <ListItemText 
              primary={item.label}
              sx={{ opacity: open ? 1 : 0 }}
              primaryTypographyProps={{
                variant: 'body2',
                fontWeight: active ? 600 : 400,
                color: active ? theme.palette.primary.main : 'inherit'
              }}
            />
          </ListItemButton>
        </Tooltip>
      </ListItem>
    );
  };

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Box 
        sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: open ? 'space-between' : 'center',
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        {open && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box 
              sx={{ 
                width: 32, 
                height: 32, 
                borderRadius: 1,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}
            >
              <Security />
            </Box>
            <Typography variant="h6" fontWeight="bold" color="primary">
              Phantom Spire
            </Typography>
          </Box>
        )}
        <IconButton onClick={onToggle} size="small">
          {open ? <ChevronLeft /> : <ChevronRight />}
        </IconButton>
      </Box>

      {/* User Profile */}
      {open && (
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar 
              src={user.avatar} 
              sx={{ 
                bgcolor: theme.palette.primary.main,
                width: 40,
                height: 40
              }}
            >
              {user.name.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" fontWeight="bold" noWrap>
                {user.name}
              </Typography>
              <Typography variant="caption" color="textSecondary" noWrap>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)} • {user.organization}
              </Typography>
            </Box>
            <Badge badgeContent={notificationState.unreadCount} color="error">
              <IconButton size="small">
                <Notifications />
              </IconButton>
            </Badge>
          </Box>
        </Box>
      )}

      {/* Navigation Items */}
      <Box sx={{ flex: 1, overflow: 'auto', py: 1 }}>
        <List>
          {filteredNavigationItems.map(item => renderNavigationItem(item))}
        </List>
      </Box>

      {/* Footer */}
      <Box sx={{ p: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
        <List>
          <ListItem disablePadding>
            <Tooltip title={!open ? 'Help & Support' : ''} placement="right">
              <ListItemButton
                sx={{
                  borderRadius: 1,
                  mx: 1,
                  justifyContent: open ? 'initial' : 'center'
                }}
              >
                <ListItemIcon sx={{ minWidth: 0, mr: open ? 2 : 'auto', justifyContent: 'center' }}>
                  <Help />
                </ListItemIcon>
                <ListItemText 
                  primary="Help & Support" 
                  sx={{ opacity: open ? 1 : 0 }}
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItemButton>
            </Tooltip>
          </ListItem>
        </List>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: open ? DRAWER_WIDTH : DRAWER_COLLAPSED_WIDTH,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        '& .MuiDrawer-paper': {
          width: open ? DRAWER_WIDTH : DRAWER_COLLAPSED_WIDTH,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflowX: 'hidden',
          backgroundColor: theme.palette.background.paper,
          borderRight: `1px solid ${theme.palette.divider}`
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};