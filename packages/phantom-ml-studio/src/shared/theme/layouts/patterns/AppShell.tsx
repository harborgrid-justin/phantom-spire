/**
 * APP SHELL LAYOUT PATTERN
 * 
 * Enterprise-grade application shell with header, sidebar, footer, and aside panels
 * Supports responsive behavior, collapsible sidebar, and sticky positioning
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { Box, useMediaQuery, Drawer, AppBar, Toolbar } from '@mui/material';
import { AppShellPatternProps } from './types';
import { useLayout, useBreakpoint } from '../hooks';

const AppShellRoot = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  backgroundColor: theme.palette.background.default,
}));

const AppShellHeader = styled(AppBar)<{ stickyHeader?: boolean; headerHeight?: number }>(
  ({ theme, stickyHeader, headerHeight }) => ({
    position: stickyHeader ? 'sticky' : 'static',
    top: 0,
    zIndex: theme.zIndex.appBar,
    height: headerHeight || 64,
    ...(stickyHeader && {
      boxShadow: theme.shadows[2],
    }),
  })
);

const AppShellBody = styled(Box)<{ hasHeader?: boolean; hasFooter?: boolean }>(
  ({ theme, hasHeader, hasFooter }) => ({
    display: 'flex',
    flex: '1 1 auto',
    minHeight: 0, // Prevents flex items from overflowing
    ...(hasHeader && {
      paddingTop: 0,
    }),
    ...(hasFooter && {
      paddingBottom: 0,
    }),
  })
);

const AppShellSidebar = styled(Box)<{ 
  sidebarWidth?: number; 
  collapsed?: boolean;
  variant?: 'permanent' | 'temporary' | 'persistent';
}>(({ theme, sidebarWidth = 240, collapsed, variant }) => ({
  width: variant === 'permanent' ? (collapsed ? 64 : sidebarWidth) : sidebarWidth,
  flexShrink: 0,
  transition: theme.transitions.create(['width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(variant === 'permanent' && {
    '& .MuiDrawer-paper': {
      width: collapsed ? 64 : sidebarWidth,
      transition: theme.transitions.create(['width'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      boxSizing: 'border-box',
      borderRight: `1px solid ${theme.palette.divider}`,
      backgroundColor: theme.palette.background.paper,
    },
  }),
}));

const AppShellMain = styled(Box)<{ 
  contentPadding?: number;
  hasSidebar?: boolean;
  hasAside?: boolean;
}>(({ theme, contentPadding = 24, hasSidebar, hasAside }) => ({
  flexGrow: 1,
  padding: theme.spacing(contentPadding / 8),
  backgroundColor: theme.palette.background.default,
  minHeight: 0,
  overflow: 'auto',
  ...(hasSidebar && {
    [theme.breakpoints.down('md')]: {
      marginLeft: 0,
    },
  }),
  ...(hasAside && {
    [theme.breakpoints.down('lg')]: {
      marginRight: 0,
    },
  }),
}));

const AppShellAside = styled(Box)<{ asideWidth?: number }>(
  ({ theme, asideWidth = 280 }) => ({
    width: asideWidth,
    flexShrink: 0,
    borderLeft: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    [theme.breakpoints.down('lg')]: {
      display: 'none',
    },
  })
);

const AppShellFooter = styled(Box)<{ 
  stickyFooter?: boolean; 
  footerHeight?: number;
}>(({ theme, stickyFooter, footerHeight }) => ({
  backgroundColor: theme.palette.background.paper,
  borderTop: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(2),
  minHeight: footerHeight || 'auto',
  ...(stickyFooter && {
    position: 'sticky',
    bottom: 0,
    zIndex: theme.zIndex.appBar - 1,
  }),
}));

export const AppShell: React.FC<AppShellPatternProps> = ({
  children,
  header,
  sidebar,
  footer,
  aside,
  sidebarWidth = 240,
  headerHeight = 64,
  footerHeight,
  asideWidth = 280,
  sidebarCollapsible = true,
  sidebarDefaultOpen = true,
  stickyHeader = true,
  stickyFooter = false,
  contentPadding = 24,
  variant = 'default',
  responsive = true,
  className,
  ...props
}) => {
  const theme = useTheme();
  const { isMobile, isTablet } = useBreakpoint();
  const [sidebarOpen, setSidebarOpen] = useState(sidebarDefaultOpen);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Auto-close sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else if (!isMobile && sidebarDefaultOpen) {
      setSidebarOpen(true);
    }
  }, [isMobile, sidebarDefaultOpen]);

  const handleSidebarToggle = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const handleSidebarCollapse = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  // Determine sidebar variant based on screen size
  const getSidebarVariant = () => {
    if (isMobile) return 'temporary';
    if (isTablet) return 'persistent';
    return 'permanent';
  };

  const sidebarVariant = getSidebarVariant();

  // Get responsive values
  const getResponsiveValue = (value: any) => {
    if (typeof value === 'object' && value !== null) {
      if (isMobile && value.xs) return value.xs;
      if (isTablet && value.md) return value.md;
      if (value.lg) return value.lg;
    }
    return value;
  };

  const responsiveSidebarWidth = getResponsiveValue(sidebarWidth);
  const responsiveHeaderHeight = getResponsiveValue(headerHeight);
  const responsiveAsideWidth = getResponsiveValue(asideWidth);
  const responsiveContentPadding = getResponsiveValue(contentPadding);

  return (
    <AppShellRoot className={className} {...props}>
      {/* Header */}
      {header && (
        <AppShellHeader 
          position={stickyHeader ? 'sticky' : 'static'}
          stickyHeader={stickyHeader}
          headerHeight={responsiveHeaderHeight}
          elevation={stickyHeader ? 2 : 0}
        >
          <Toolbar sx={{ height: '100%' }}>
            {header}
          </Toolbar>
        </AppShellHeader>
      )}

      {/* Body with Sidebar, Main Content, and Aside */}
      <AppShellBody hasHeader={!!header} hasFooter={!!footer}>
        {/* Sidebar */}
        {sidebar && (
          <AppShellSidebar
            sidebarWidth={responsiveSidebarWidth}
            collapsed={sidebarCollapsed}
            variant={sidebarVariant}
          >
            {sidebarVariant === 'temporary' ? (
              <Drawer
                variant="temporary"
                open={sidebarOpen}
                onClose={handleSidebarToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                  '& .MuiDrawer-paper': {
                    width: responsiveSidebarWidth,
                    boxSizing: 'border-box',
                  },
                }}
              >
                {sidebar}
              </Drawer>
            ) : (
              <Drawer
                variant={sidebarVariant}
                open={sidebarOpen}
                sx={{
                  width: sidebarCollapsed ? 64 : responsiveSidebarWidth,
                  '& .MuiDrawer-paper': {
                    width: sidebarCollapsed ? 64 : responsiveSidebarWidth,
                    position: 'relative',
                    height: '100%',
                    transition: theme.transitions.create(['width'], {
                      easing: theme.transitions.easing.sharp,
                      duration: theme.transitions.duration.leavingScreen,
                    }),
                  },
                }}
              >
                {sidebar}
              </Drawer>
            )}
          </AppShellSidebar>
        )}

        {/* Main Content Area */}
        <AppShellMain
          component="main"
          contentPadding={responsiveContentPadding}
          hasSidebar={!!sidebar}
          hasAside={!!aside}
        >
          {children}
        </AppShellMain>

        {/* Aside Panel */}
        {aside && !isMobile && (
          <AppShellAside asideWidth={responsiveAsideWidth}>
            {aside}
          </AppShellAside>
        )}
      </AppShellBody>

      {/* Footer */}
      {footer && (
        <AppShellFooter 
          component="footer"
          stickyFooter={stickyFooter}
          footerHeight={footerHeight}
        >
          {footer}
        </AppShellFooter>
      )}
    </AppShellRoot>
  );
};

AppShell.displayName = 'AppShell';

// Enhanced variants
export const DashboardShell: React.FC<Omit<AppShellPatternProps, 'variant'>> = (props) => (
  <AppShell variant="compact" sidebarWidth={200} contentPadding={16} {...props} />
);

export const AdminShell: React.FC<Omit<AppShellPatternProps, 'variant'>> = (props) => (
  <AppShell variant="comfortable" sidebarWidth={280} contentPadding={32} {...props} />
);

export const MinimalShell: React.FC<Omit<AppShellPatternProps, 'variant' | 'sidebar'>> = (props) => (
  <AppShell variant="spacious" contentPadding={40} {...props} />
);

// Hook for controlling app shell state
export const useAppShell = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isMobile } = useBreakpoint();

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const collapseSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  const openSidebar = useCallback(() => {
    setSidebarOpen(true);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  return {
    sidebarOpen,
    sidebarCollapsed,
    toggleSidebar,
    collapseSidebar,
    openSidebar,
    closeSidebar,
    isMobile,
  };
};

export default AppShell;