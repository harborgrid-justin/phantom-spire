'use client';
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
  Engineering as EngineeringIcon,
  Shield as ShieldIcon,
  TrendingUp as MonitoringIcon,
  AccountTree as PipelineIcon,
  Store as MarketplaceIcon,
  Visibility as ExplainableIcon,
  Assessment as ABTestingIcon,
  Business as ComplianceIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const drawerWidth = 240;

interface LayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  isNew?: boolean;
}

const LayoutComponent: React.FC<LayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const muiTheme = useTheme();
  const pathname = usePathname();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems: MenuItem[] = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Data Explorer', icon: <DataIcon />, path: '/dataExplorer' },
    { text: 'AutoML Builder', icon: <AutoMLIcon />, path: '/modelBuilder' },
    { text: 'Experiments', icon: <ExperimentIcon />, path: '/experiments' },
    { text: 'Models', icon: <ModelIcon />, path: '/models' },
    { text: 'Deployments', icon: <DeployIcon />, path: '/deployments' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
    // Advanced Features
    { text: '🚀 Live Monitoring', icon: <MonitoringIcon />, path: '/monitoring', isNew: true },
    { text: '🔬 Pipeline Studio', icon: <PipelineIcon />, path: '/automlPipeline', isNew: true },
    { text: '🛡️ Bias Detection', icon: <ShieldIcon />, path: '/biasDetection', isNew: true },
    { text: '🔧 Feature Engine', icon: <EngineeringIcon />, path: '/featureEngineering', isNew: true },
    { text: '🏪 Threat Intelligence', icon: <MarketplaceIcon />, path: '/threatIntelligence', isNew: true },
    { text: '🔍 Explainable AI', icon: <ExplainableIcon />, path: '/explainableAi', isNew: true },
    { text: '⚖️ A/B Testing', icon: <ABTestingIcon />, path: '/abTesting', isNew: true },
    { text: '🏢 Compliance', icon: <ComplianceIcon />, path: '/compliance', isNew: true },
    { text: '🧪 Training', icon: <ExperimentIcon />, path: '/training' },
    { text: '🚀 NAPI Demo', icon: <EngineeringIcon />, path: '/napiDemo' },
  ];

  const drawer = (
    <Box>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SecurityIcon sx={{ color: muiTheme.palette.primary.main, fontSize: 32 }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Phantom ML
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <Link href={item.path} passHref style={{ textDecoration: 'none', color: 'inherit' }}>
              <ListItemButton
                selected={pathname === item.path}
                sx={{
                  mx: 1,
                  borderRadius: 1,
                  '&.Mui-selected': {
                    backgroundColor: muiTheme.palette.primary.main,
                    color: 'white',
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                    '&:hover': {
                      backgroundColor: muiTheme.palette.primary.dark,
                    },
                  },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
                {item.isNew && (
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
            </Link>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
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
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: muiTheme.palette.text.primary }}>
              {menuItems.find(item => item.path === pathname)?.text || 'Dashboard'}
            </Typography>
            <IconButton color="inherit">
              <Badge badgeContent={3} color="error">
                <NotificationsIcon sx={{ color: muiTheme.palette.text.primary }} />
              </Badge>
            </IconButton>
            <Avatar
              sx={{ 
                ml: 2, 
                bgcolor: muiTheme.palette.primary.main,
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
            backgroundColor: muiTheme.palette.background.default,
            minHeight: 'calc(100vh - 64px)',
          }}
        >
          {children}
        </Box>
      </Box>
    </>
  );
};

export default LayoutComponent;
