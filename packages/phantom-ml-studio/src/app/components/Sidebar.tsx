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
import DashboardIcon from '@mui/icons-material/Dashboard';
import DataIcon from '@mui/icons-material/DataObject';
import AutoMLIcon from '@mui/icons-material/AutoAwesome';
import ExperimentIcon from '@mui/icons-material/Biotech';
import ModelIcon from '@mui/icons-material/Psychology';
import CompareIcon from '@mui/icons-material/CompareArrows';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import DeployIcon from '@mui/icons-material/CloudUpload';
import SettingsIcon from '@mui/icons-material/Settings';
import SecurityIcon from '@mui/icons-material/Lock';
import MonitoringIcon from '@mui/icons-material/TrendingUp';
import PipelineIcon from '@mui/icons-material/AccountTree';
import MarketplaceIcon from '@mui/icons-material/Store';
import ExplainableIcon from '@mui/icons-material/Visibility';
import ABTestingIcon from '@mui/icons-material/Assessment';
import ComplianceIcon from '@mui/icons-material/Business';
import ShieldIcon from '@mui/icons-material/Shield';
import EngineeringIcon from '@mui/icons-material/Build';
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
        <Box key={section} data-cy={`nav-section-${section}`}>
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
            data-cy={`nav-section-title-${section}`}
          >
            {sectionTitles[section as keyof typeof sectionTitles]}
          </Typography>
          <List dense>
            {sectionItems.map((item) => (
              <ListItem key={item.text} disablePadding data-cy={`nav-item-${item.text.toLowerCase().replace(/\s+/g, '-')}`}>
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
                    data-cy={`nav-link-${item.text.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 40,
                        color: pathname === item.path ? 'inherit' : 'text.secondary',
                      }}
                      data-cy={`nav-icon-${item.text.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontSize: '0.875rem',
                        fontWeight: pathname === item.path ? 600 : 400,
                      }}
                      data-cy={`nav-text-${item.text.toLowerCase().replace(/\s+/g, '-')}`}
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
                        data-cy={`nav-badge-new-${item.text.toLowerCase().replace(/\s+/g, '-')}`}
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
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }} data-cy="nav-header">
        <SecurityIcon sx={{ color: 'primary.main', fontSize: 32 }} data-cy="nav-logo-icon" />
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }} data-cy="nav-title">
            Phantom ML
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1 }} data-cy="nav-subtitle">
            Studio
          </Typography>
        </Box>
      </Box>
      
      <Divider />
      
      {/* Navigation */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', py: 1 }} data-cy="nav-menu-container">
        {renderMenuItems()}
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      aria-label="main navigation"
      data-cy="nav-sidebar"
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
        data-cy="nav-drawer-mobile"
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
        data-cy="nav-drawer-desktop"
      >
        {drawer}
      </Drawer>
    </Box>
  );
}