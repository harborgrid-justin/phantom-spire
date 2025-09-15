'use client';

import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Badge,
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
  Security as SecurityIcon,
  TrendingUp as MonitoringIcon,
  AccountTree as PipelineIcon,
  Store as MarketplaceIcon,
  Visibility as ExplainableIcon,
  Assessment as ABTestingIcon,
  Business as ComplianceIcon,
  Shield as ShieldIcon,
  Engineering as EngineeringIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  isNew?: boolean;
  section?: string;
}

interface SidebarProps {
  drawerWidth: number;
  mobileOpen: boolean;
  onDrawerToggle: () => void;
}

const menuItems: MenuItem[] = [
  // Core Features
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/', section: 'core' },
  { text: 'Data Explorer', icon: <DataIcon />, path: '/data-explorer', section: 'core' },
  { text: 'AutoML Builder', icon: <AutoMLIcon />, path: '/model-builder', section: 'core' },
  { text: 'Experiments', icon: <ExperimentIcon />, path: '/experiments', section: 'core' },
  { text: 'Models', icon: <ModelIcon />, path: '/models', section: 'core' },
  { text: 'Deployments', icon: <DeployIcon />, path: '/deployments', section: 'core' },
  
  // Advanced Features
  { text: 'Real-time Monitoring', icon: <MonitoringIcon />, path: '/real-time-monitoring', isNew: true, section: 'advanced' },
  { text: 'AutoML Pipeline', icon: <PipelineIcon />, path: '/automl-pipeline-visualizer', isNew: true, section: 'advanced' },
  { text: 'Feature Engineering', icon: <EngineeringIcon />, path: '/interactive-feature-engineering', isNew: true, section: 'advanced' },
  { text: 'Model Comparison', icon: <CompareIcon />, path: '/model-comparison', section: 'advanced' },
  { text: 'A/B Testing', icon: <ABTestingIcon />, path: '/multi-model-ab-testing', isNew: true, section: 'advanced' },
  { text: 'Explainable AI', icon: <ExplainableIcon />, path: '/explainable-ai-visualizer', isNew: true, section: 'advanced' },
  
  // Security & Compliance
  { text: 'Bias Detection', icon: <ShieldIcon />, path: '/bias-detection-engine', isNew: true, section: 'security' },
  { text: 'Threat Intelligence', icon: <MarketplaceIcon />, path: '/threat-intelligence-marketplace', isNew: true, section: 'security' },
  { text: 'Enterprise Compliance', icon: <ComplianceIcon />, path: '/enterprise-security-compliance', isNew: true, section: 'security' },
  
  // System
  { text: 'Analytics', icon: <AnalyticsIcon />, path: '/h2o-comparison', section: 'system' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings', section: 'system' },
];

const sectionTitles = {
  core: 'Core Platform',
  advanced: 'Advanced ML',
  security: 'Security & Compliance',
  system: 'System',
};

export function Sidebar({ drawerWidth, mobileOpen, onDrawerToggle }: SidebarProps) {
  const pathname = usePathname();

  const renderMenuItems = () => {
    const sections = ['core', 'advanced', 'security', 'system'];
    
    return sections.map((section) => {
      const sectionItems = menuItems.filter(item => item.section === section);
      
      return (
        <Box key={section}>
          <Typography
            variant="overline"
            sx={{
              px: 2,
              py: 1,
              display: 'block',
              color: 'text.secondary',
              fontWeight: 600,
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            {sectionTitles[section as keyof typeof sectionTitles]}
          </Typography>
          <List dense>
            {sectionItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <Link href={item.path} passHref style={{ textDecoration: 'none', width: '100%' }}>
                  <ListItemButton
                    selected={pathname === item.path}
                    sx={{
                      mx: 1,
                      borderRadius: 2,
                      '&.Mui-selected': {
                        backgroundColor: 'primary.main',
                        color: 'primary.contrastText',
                        '& .MuiListItemIcon-root': {
                          color: 'primary.contrastText',
                        },
                        '&:hover': {
                          backgroundColor: 'primary.dark',
                        },
                      },
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 40,
                        color: pathname === item.path ? 'inherit' : 'text.secondary',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.text}
                      primaryTypographyProps={{
                        fontSize: '0.875rem',
                        fontWeight: pathname === item.path ? 600 : 400,
                      }}
                    />
                    {item.isNew && (
                      <Badge
                        badgeContent="NEW"
                        color="secondary"
                        sx={{
                          '& .MuiBadge-badge': {
                            fontSize: '0.6rem',
                            height: 18,
                            minWidth: 32,
                            borderRadius: 1,
                            fontWeight: 600,
                          },
                        }}
                      />
                    )}
                  </ListItemButton>
                </Link>
              </ListItem>
            ))}
          </List>
          {section !== 'system' && <Divider sx={{ my: 1, mx: 2 }} />}
        </Box>
      );
    });
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <SecurityIcon sx={{ color: 'primary.main', fontSize: 32 }} />
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            Phantom ML
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1 }}>
            Studio
          </Typography>
        </Box>
      </Box>
      
      <Divider />
      
      {/* Navigation */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', py: 1 }}>
        {renderMenuItems()}
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      aria-label="main navigation"
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            backgroundColor: 'background.paper',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        {drawer}
      </Drawer>
      
      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            backgroundColor: 'background.paper',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
}