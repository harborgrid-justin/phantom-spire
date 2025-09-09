import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import SecOpsNavigation from './components/SecOpsNavigation';
import SecOpsRouter from './SecOpsRouter';

// Create Material-UI theme for the SecOps platform
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
    },
    success: {
      main: '#2e7d32',
    },
    warning: {
      main: '#ed6c02',
    },
    error: {
      main: '#d32f2f',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 500,
    },
    subtitle2: {
      fontWeight: 500,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderRadius: 8,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 6,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 4,
        },
      },
    },
  },
});

/**
 * SecOps Platform Application
 * 
 * Main application component that provides:
 * - 49 business-ready and customer-ready security operations pages
 * - Complete frontend-backend integration
 * - Advanced navigation and routing
 * - Material-UI theme integration
 * - Responsive design
 */
const SecOpsPlatformApp: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
          {/* Navigation Sidebar */}
          <Box sx={{ flexShrink: 0 }}>
            <SecOpsNavigation />
          </Box>
          
          {/* Main Content Area */}
          <Box sx={{ 
            flexGrow: 1, 
            overflow: 'auto',
            backgroundColor: 'background.default'
          }}>
            <Routes>
              {/* SecOps Platform Routes */}
              <Route path="/secops/*" element={<SecOpsRouter />} />
              
              {/* Default redirect to SecOps platform */}
              <Route path="/" element={<Navigate to="/secops" replace />} />
              
              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/secops" replace />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
};

export default SecOpsPlatformApp;