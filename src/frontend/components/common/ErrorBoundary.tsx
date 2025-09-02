/**
 * Error Boundary Component
 * Enterprise-grade error handling and recovery
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  Divider,
  Collapse,
  IconButton,
  Chip
} from '@mui/material';
import {
  Error,
  Refresh,
  BugReport,
  ExpandMore,
  ExpandLess,
  Security
} from '@mui/icons-material';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  showDetails: boolean;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'page' | 'component' | 'critical';
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      showDetails: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to error reporting service
    this.logErrorToService(error, errorInfo);
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // In a real application, this would send to an error reporting service
    const errorReport = {
      errorId: this.state.errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      level: this.props.level || 'component'
    };

    // Simulate API call to error reporting service
    console.log('Error reported to service:', errorReport);
    
    // Store in localStorage for debugging
    const existingErrors = JSON.parse(localStorage.getItem('phantom-spire-errors') || '[]');
    existingErrors.push(errorReport);
    // Keep only last 10 errors
    if (existingErrors.length > 10) {
      existingErrors.splice(0, existingErrors.length - 10);
    }
    localStorage.setItem('phantom-spire-errors', JSON.stringify(existingErrors));
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      showDetails: false
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private toggleDetails = () => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails
    }));
  };

  private renderErrorDetails = () => {
    const { error, errorInfo, errorId } = this.state;
    
    if (!error || !errorInfo) return null;

    return (
      <Box sx={{ mt: 2 }}>
        <Collapse in={this.state.showDetails}>
          <Paper variant="outlined" sx={{ p: 2, backgroundColor: 'grey.50' }}>
            <Typography variant="subtitle2" gutterBottom>
              Error Details
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Chip 
                label={`Error ID: ${errorId}`}
                size="small"
                variant="outlined"
                sx={{ mb: 1 }}
              />
            </Box>

            <Typography variant="body2" component="div" sx={{ mb: 2 }}>
              <strong>Message:</strong>
              <Box component="pre" sx={{ 
                whiteSpace: 'pre-wrap', 
                fontSize: '0.8rem',
                backgroundColor: 'white',
                p: 1,
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
                mt: 0.5
              }}>
                {error.message}
              </Box>
            </Typography>

            <Typography variant="body2" component="div" sx={{ mb: 2 }}>
              <strong>Stack Trace:</strong>
              <Box component="pre" sx={{ 
                whiteSpace: 'pre-wrap', 
                fontSize: '0.7rem',
                backgroundColor: 'white',
                p: 1,
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
                mt: 0.5,
                maxHeight: 200,
                overflow: 'auto'
              }}>
                {error.stack}
              </Box>
            </Typography>

            <Typography variant="body2" component="div">
              <strong>Component Stack:</strong>
              <Box component="pre" sx={{ 
                whiteSpace: 'pre-wrap', 
                fontSize: '0.7rem',
                backgroundColor: 'white',
                p: 1,
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
                mt: 0.5,
                maxHeight: 200,
                overflow: 'auto'
              }}>
                {errorInfo.componentStack}
              </Box>
            </Typography>
          </Paper>
        </Collapse>
      </Box>
    );
  };

  private renderErrorUI = () => {
    const { level = 'component' } = this.props;
    const { errorId } = this.state;

    const severityConfig = {
      critical: {
        color: 'error' as const,
        icon: <Error />,
        title: 'Critical System Error',
        description: 'A critical error has occurred that requires immediate attention.'
      },
      page: {
        color: 'warning' as const,
        icon: <BugReport />,
        title: 'Page Error',
        description: 'This page encountered an error and cannot be displayed.'
      },
      component: {
        color: 'info' as const,
        icon: <BugReport />,
        title: 'Component Error',
        description: 'A component error occurred. Some functionality may be limited.'
      }
    };

    const config = severityConfig[level];

    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: level === 'critical' ? '100vh' : level === 'page' ? '50vh' : '200px',
          p: 3,
          textAlign: 'center'
        }}
      >
        <Paper 
          elevation={3}
          sx={{ 
            p: 4, 
            maxWidth: 600, 
            width: '100%',
            backgroundColor: 'background.paper'
          }}
        >
          {/* Header */}
          <Box sx={{ mb: 3 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: 2,
                backgroundColor: level === 'critical' ? 'error.main' : 'warning.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                mx: 'auto',
                mb: 2
              }}
            >
              {level === 'critical' ? (
                <Security sx={{ fontSize: 32 }} />
              ) : (
                React.cloneElement(config.icon, { sx: { fontSize: 32 } })
              )}
            </Box>

            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {config.title}
            </Typography>
            
            <Typography variant="body1" color="textSecondary" paragraph>
              {config.description}
            </Typography>
          </Box>

          {/* Error Information */}
          <Alert severity={config.color} sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Error ID:</strong> {errorId}
            </Typography>
            <Typography variant="body2">
              <strong>Time:</strong> {new Date().toLocaleString()}
            </Typography>
          </Alert>

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Refresh />}
              onClick={this.handleRetry}
            >
              Try Again
            </Button>
            
            {level === 'critical' && (
              <Button
                variant="outlined"
                color="primary"
                onClick={this.handleReload}
              >
                Reload Application
              </Button>
            )}
          </Box>

          {/* Error Details Toggle */}
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              size="small"
              color="inherit"
              startIcon={this.state.showDetails ? <ExpandLess /> : <ExpandMore />}
              onClick={this.toggleDetails}
            >
              {this.state.showDetails ? 'Hide Details' : 'Show Technical Details'}
            </Button>
          </Box>

          {this.renderErrorDetails()}

          {/* Help Information */}
          <Divider sx={{ my: 2 }} />
          <Typography variant="body2" color="textSecondary">
            If this error persists, please contact your system administrator or 
            report this issue to the support team with the Error ID provided above.
          </Typography>
        </Paper>
      </Box>
    );
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return this.renderErrorUI();
    }

    return this.props.children;
  }
}

// Functional component wrapper for hooks
export const ErrorBoundaryWrapper: React.FC<{
  children: ReactNode;
  level?: 'page' | 'component' | 'critical';
}> = ({ children, level = 'component' }) => {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }

    // In production, send to monitoring service
    // Example: Sentry, LogRocket, etc.
  };

  return (
    <ErrorBoundary level={level} onError={handleError}>
      {children}
    </ErrorBoundary>
  );
};