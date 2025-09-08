/**
 * Phantom Spire CTI Platform - Main Application Shell
 * Enterprise-grade Cyber Threat Intelligence Platform Frontend
 * Competitive with Anomali and other Fortune 100 CTI solutions
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  CssBaseline,
  ThemeProvider,
  createTheme,
  useMediaQuery,
  Alert,
  Snackbar,
  GlobalStyles
} from '@mui/material';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

// Core Layout Components
import { NavigationSidebar } from './components/layout/NavigationSidebar';
import { TopAppBar } from './components/layout/TopAppBar';
import { LoadingOverlay } from './components/common/LoadingOverlay';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Main Dashboard Views
import { ThreatIntelligenceDashboard } from './views/dashboard/ThreatIntelligenceDashboard';
import { IOCRouter } from './views/ioc/IOCRouter';
import { IncidentResponseCenter } from './views/incident/IncidentResponseCenter';
import { ThreatHuntingWorkbench } from './views/hunting/ThreatHuntingWorkbench';
import { AnalyticsReporting } from './views/analytics/AnalyticsReporting';
import { FeedManagement } from './views/feeds/FeedManagement';
import { InvestigationTimeline } from './views/investigation/InvestigationTimeline';
import { UserSystemManagement } from './views/admin/UserSystemManagement';
import { RealTimeOperationsCenter } from './views/operations/RealTimeOperationsCenter';
import { ThreatIntelRepository } from './views/repository/ThreatIntelRepository';
import { IntegrationPlatform } from './views/integration/IntegrationPlatform';

// Authentication & Security
import { AuthenticationProvider } from './context/AuthenticationContext';
import { SecurityProvider } from './context/SecurityContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider as CustomThemeProvider } from './context/ThemeContext';

// UI/UX Evaluation Integration
import { addUIUXEvaluation } from '../services/ui-ux-evaluation/hooks/useUIUXEvaluation';

// Types
import { User, SystemStatus, NotificationLevel } from './types/common';

interface AppState {
  user: User | null;
  isLoading: boolean;
  systemStatus: SystemStatus;
  sidebarOpen: boolean;
  notifications: Array<{
    id: string;
    message: string;
    level: NotificationLevel;
    timestamp: Date;
  }>;
}

const PhantomSpireApp: React.FC = () => {
  // Application State
  const [appState, setAppState] = useState<AppState>({
    user: null,
    isLoading: true,
    systemStatus: 'initializing',
    sidebarOpen: true,
    notifications: []
  });

  // Theme Configuration
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const theme = useMemo(() => createTheme({
    palette: {
      mode: prefersDarkMode ? 'dark' : 'light',
      primary: {
        main: '#1976d2',
        dark: '#115293',
        light: '#42a5f5'
      },
      secondary: {
        main: '#dc004e',
        dark: '#9a0036',
        light: '#e5336d'
      },
      error: {
        main: '#d32f2f',
        dark: '#c62828',
        light: '#ef5350'
      },
      warning: {
        main: '#ed6c02',
        dark: '#e65100',
        light: '#ff9800'
      },
      info: {
        main: '#0288d1',
        dark: '#01579b',
        light: '#03a9f4'
      },
      success: {
        main: '#2e7d32',
        dark: '#1b5e20',
        light: '#4caf50'
      },
      background: {
        default: prefersDarkMode ? '#0a0e27' : '#f5f5f5',
        paper: prefersDarkMode ? '#1e1e2e' : '#ffffff'
      }
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 600,
        fontSize: '2.5rem'
      },
      h2: {
        fontWeight: 600,
        fontSize: '2rem'
      },
      h3: {
        fontWeight: 600,
        fontSize: '1.5rem'
      },
      h4: {
        fontWeight: 600,
        fontSize: '1.25rem'
      },
      h5: {
        fontWeight: 600,
        fontSize: '1.1rem'
      },
      h6: {
        fontWeight: 600,
        fontSize: '1rem'
      }
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarWidth: 'thin',
            '&::-webkit-scrollbar': {
              width: '8px',
              height: '8px'
            },
            '&::-webkit-scrollbar-track': {
              background: prefersDarkMode ? '#2e2e3e' : '#f1f1f1'
            },
            '&::-webkit-scrollbar-thumb': {
              background: prefersDarkMode ? '#555568' : '#c1c1c1',
              borderRadius: '4px'
            }
          }
        }
      }
    }
  }), [prefersDarkMode]);

  // Initialize UI/UX Evaluation System
  useEffect(() => {
    const evaluationController = addUIUXEvaluation('phantom-spire-main-app', {
      continuous: true,
      position: 'bottom-right',
      minimized: false,
      interval: 60000, // Evaluate every minute
      autoStart: true
    });

    return () => {
      evaluationController.remove();
    };
  }, []);

  // Application Initialization
  useEffect(() => {
    const initializeApplication = async () => {
      try {
        setAppState(prev => ({ ...prev, isLoading: true, systemStatus: 'initializing' }));
        
        // Initialize authentication
        await initializeAuth();
        
        // Initialize system services
        await initializeServices();
        
        // Load user preferences
        await loadUserPreferences();
        
        setAppState(prev => ({ 
          ...prev, 
          isLoading: false, 
          systemStatus: 'operational' 
        }));
        
        showNotification('Phantom Spire CTI Platform initialized successfully', 'success');
      } catch (error) {
        console.error('Application initialization failed:', error);
        setAppState(prev => ({ 
          ...prev, 
          isLoading: false, 
          systemStatus: 'error' 
        }));
        showNotification('Application initialization failed', 'error');
      }
    };

    initializeApplication();
  }, []);

  // Helper Functions
  const initializeAuth = async (): Promise<void> => {
    // Simulate authentication initialization
    await new Promise(resolve => setTimeout(resolve, 1000));
    setAppState(prev => ({
      ...prev,
      user: {
        id: 'user-1',
        name: 'CTI Analyst',
        email: 'analyst@phantom-spire.com',
        role: 'analyst',
        permissions: ['read', 'write', 'investigate'],
        organization: 'Phantom Spire Security'
      }
    }));
  };

  const initializeServices = async (): Promise<void> => {
    // Initialize core platform services
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  const loadUserPreferences = async (): Promise<void> => {
    // Load user preferences and settings
    await new Promise(resolve => setTimeout(resolve, 200));
  };

  const showNotification = useCallback((message: string, level: NotificationLevel = 'info') => {
    const notification = {
      id: `notification-${Date.now()}`,
      message,
      level,
      timestamp: new Date()
    };
    
    setAppState(prev => ({
      ...prev,
      notifications: [...prev.notifications, notification]
    }));

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setAppState(prev => ({
        ...prev,
        notifications: prev.notifications.filter(n => n.id !== notification.id)
      }));
    }, 5000);
  }, []);

  const handleSidebarToggle = useCallback(() => {
    setAppState(prev => ({ 
      ...prev, 
      sidebarOpen: !prev.sidebarOpen 
    }));
  }, []);

  const handleLogout = useCallback(async () => {
    setAppState(prev => ({ ...prev, user: null, isLoading: true }));
    // Simulate logout
    await new Promise(resolve => setTimeout(resolve, 1000));
    showNotification('Logged out successfully', 'info');
    setAppState(prev => ({ ...prev, isLoading: false }));
  }, [showNotification]);

  // Global Styles
  const globalStyles = (
    <GlobalStyles
      styles={{
        '*': {
          boxSizing: 'border-box',
        },
        html: {
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          height: '100%',
          width: '100%',
        },
        body: {
          height: '100%',
          width: '100%',
        },
        '#root': {
          height: '100%',
          width: '100%',
        },
        '.phantom-spire-app': {
          height: '100vh',
          width: '100vw',
          overflow: 'hidden',
        }
      }}
    />
  );

  // Loading Screen
  if (appState.isLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {globalStyles}
        <LoadingOverlay 
          message="Initializing Phantom Spire CTI Platform..." 
          systemStatus={appState.systemStatus}
        />
      </ThemeProvider>
    );
  }

  // Authentication Required
  if (!appState.user) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {globalStyles}
        <Box 
          className="phantom-spire-app"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
          }}
        >
          {/* Authentication component would go here */}
          <Alert severity="info">
            Authentication system loading...
          </Alert>
        </Box>
      </ThemeProvider>
    );
  }

  // Main Application Interface
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {globalStyles}
      <CustomThemeProvider>
        <AuthenticationProvider user={appState.user}>
          <SecurityProvider>
            <NotificationProvider>
              <ErrorBoundary>
                <Router>
                  <Box className="phantom-spire-app" sx={{ display: 'flex' }}>
                    <NavigationSidebar
                      open={appState.sidebarOpen}
                      onToggle={handleSidebarToggle}
                      user={appState.user}
                    />
                    
                    <Box
                      component="main"
                      sx={{
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        background: theme.palette.background.default
                      }}
                    >
                      <TopAppBar
                        onSidebarToggle={handleSidebarToggle}
                        user={appState.user}
                        onLogout={handleLogout}
                        systemStatus={appState.systemStatus}
                      />
                      
                      <Box
                        sx={{
                          flexGrow: 1,
                          overflow: 'auto',
                          p: 3,
                        }}
                      >
                        <Routes>
                          <Route path="/" element={<Navigate to="/dashboard" replace />} />
                          <Route path="/dashboard" element={<ThreatIntelligenceDashboard />} />
                          <Route path="/ioc/*" element={<IOCRouter />} />
                          <Route path="/incidents/*" element={<IncidentResponseCenter />} />
                          <Route path="/hunting/*" element={<ThreatHuntingWorkbench />} />
                          <Route path="/analytics/*" element={<AnalyticsReporting />} />
                          <Route path="/feeds/*" element={<FeedManagement />} />
                          <Route path="/investigation/*" element={<InvestigationTimeline />} />
                          <Route path="/admin/*" element={<UserSystemManagement />} />
                          <Route path="/operations" element={<RealTimeOperationsCenter />} />
                          <Route path="/repository/*" element={<ThreatIntelRepository />} />
                          <Route path="/integrations/*" element={<IntegrationPlatform />} />
                        </Routes>
                      </Box>
                    </Box>
                  </Box>
                </Router>
              </ErrorBoundary>
            </NotificationProvider>
          </SecurityProvider>
        </AuthenticationProvider>
      </CustomThemeProvider>

      {/* Global Notifications */}
      {appState.notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open={true}
          autoHideDuration={5000}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert severity={notification.level} variant="filled">
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </ThemeProvider>
  );
};

export default PhantomSpireApp;