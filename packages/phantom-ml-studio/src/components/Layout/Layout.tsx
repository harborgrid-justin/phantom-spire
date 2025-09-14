import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Badge,
  Avatar,
  Divider,
  useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  DataObject as DataIcon,
  AutoAwesome as AutoMLIcon,
  Science as ExperimentIcon,
  ModelTraining as ModelIcon,
  CompareArrows as CompareIcon,
  Analytics as AnalyticsIcon,
  Rocket as DeployIcon,
  Settings as SettingsIcon,
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Timeline as TimelineIcon,
  Engineering as EngineeringIcon,
  Shield as ShieldIcon,
  TrendingUp as MonitoringIcon,
  AccountTree as PipelineIcon,
  Store as MarketplaceIcon,
  Visibility as ExplainableIcon,
  Assessment as ABTestingIcon,
  Business as ComplianceIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 240;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Data Explorer', icon: <DataIcon />, path: '/data' },
    { text: 'AutoML Builder', icon: <AutoMLIcon />, path: '/build' },
    { text: 'Experiments', icon: <ExperimentIcon />, path: '/experiments' },
    { text: 'Models', icon: <ModelIcon />, path: '/models' },
    { text: 'Model Compare', icon: <CompareIcon />, path: '/compare' },
    { text: 'H2O.ai Analysis', icon: <AnalyticsIcon />, path: '/h2o-comparison' },
    { text: 'Deployments', icon: <DeployIcon />, path: '/deploy' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
    // 8 New Advanced Competitive Features
    { text: '🚀 Live Monitoring', icon: <MonitoringIcon />, path: '/realtime-monitoring', isNew: true },
    { text: '🔬 Pipeline Studio', icon: <PipelineIcon />, path: '/pipeline-visualizer', isNew: true },
    { text: '🛡️ Bias Detection', icon: <ShieldIcon />, path: '/bias-detection', isNew: true },
    { text: '🔧 Feature Engine', icon: <EngineeringIcon />, path: '/feature-engineering', isNew: true },
    { text: '🏪 Threat Models', icon: <MarketplaceIcon />, path: '/threat-marketplace', isNew: true },
    { text: '🔍 Explainable AI', icon: <ExplainableIcon />, path: '/explainable-ai', isNew: true },
    { text: '⚖️ A/B Testing', icon: <ABTestingIcon />, path: '/ab-testing', isNew: true },
    { text: '🏢 Compliance', icon: <ComplianceIcon />, path: '/enterprise-compliance', isNew: true },
  ];

  const drawer = (
    <Box>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SecurityIcon sx={{ color: theme.palette.primary.main, fontSize: 32 }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Phantom ML
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                mx: 1,
                borderRadius: 1,
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.main,
                  color: 'white',
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  },
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
              {(item as any).isNew && (
                <Badge
                  badgeContent="NEW"
                  color="secondary"
                  sx={{
                    '& .MuiBadge-badge': {
                      fontSize: '0.5rem',
                      height: 16,
                      minWidth: 16,
                    },
                  }}
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: theme.palette.text.primary }}>
            {menuItems.find(item => item.path === location.pathname)?.text || 'Dashboard'}
          </Typography>
          <IconButton color="inherit">
            <Badge badgeContent={3} color="error">
              <NotificationsIcon sx={{ color: theme.palette.text.primary }} />
            </Badge>
          </IconButton>
          <Avatar
            sx={{ 
              ml: 2, 
              bgcolor: theme.palette.primary.main,
              width: 32,
              height: 32,
            }}
          >
            U
          </Avatar>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: '64px',
          backgroundColor: theme.palette.background.default,
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;