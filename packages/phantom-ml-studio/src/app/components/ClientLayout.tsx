/**
 * CLIENT LAYOUT - CLIENT COMPONENT
 *
 * This is a Next.js Client Component that handles:
 * - Interactive sidebar state management
 * - Mobile responsive drawer toggle
 * - Layout composition with sidebar and top bar
 *
 * IMPORTANT: This component runs on the client and can use React hooks,
 * event handlers, and browser APIs. Marked with 'use client' directive.
 */
'use client';

import React from 'react';
import { Box } from '@mui/material';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

const DRAWER_WIDTH = 280;

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sidebar 
        drawerWidth={DRAWER_WIDTH}
        mobileOpen={mobileOpen}
        onDrawerToggle={handleDrawerToggle}
      />
      
      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
        }}
      >
        {/* Top navigation bar */}
        <TopBar drawerWidth={DRAWER_WIDTH} onDrawerToggle={handleDrawerToggle} />
        
        {/* Page content */}
        <Box
          component="div"
          sx={{
            flexGrow: 1,
            p: 3,
            backgroundColor: 'background.default',
            minHeight: 'calc(100vh - 64px)',
            marginTop: '64px', // Height of AppBar
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}