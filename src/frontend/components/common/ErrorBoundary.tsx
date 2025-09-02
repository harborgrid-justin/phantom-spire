/**
 * Error Boundary Component
 * Catches and handles React errors gracefully
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  AlertTitle,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Stack,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Error as ErrorIcon,
  Refresh,
  BugReport,
  ExpandMore,
  ContentCopy,
  Home,
  Warning
} from '@mui/icons-material';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Send error to monitoring service
    this.reportError(error, errorInfo);
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    try {
      // In production, send to error monitoring service
      const errorReport = {
        errorId: this.state.errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: localStorage.getItem('user_id') || 'anonymous'
      };

      // Send to monitoring service (e.g., Sentry, LogRocket, etc.)
      console.log('Error Report:', errorReport);
      
      // You can also send to your backend
      // fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorReport)
      // });
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private copyErrorDetails = () => {
    const errorDetails = {
      errorId: this.state.errorId,
      message: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString()
    };

    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2))
      .then(() => {
        console.log('Error details copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy error details:', err);
      });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
            backgroundColor: 'background.default'
          }}
        >
          <Paper
            elevation={3}
            sx={{
              maxWidth: 600,
              width: '100%',
              p: 4,
              textAlign: 'center'
            }}
          >
            {/* Error Icon */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mb: 3
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  backgroundColor: 'error.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}
              >
                <ErrorIcon sx={{ fontSize: 40 }} />
              </Box>
            </Box>

            {/* Error Title */}
            <Typography variant="h4" gutterBottom color="error">
              Something went wrong
            </Typography>

            <Typography variant="body1" color="textSecondary" paragraph>
              We're sorry, but something unexpected happened. The error has been logged 
              and our team has been notified.
            </Typography>

            {/* Error ID */}
            <Box sx={{ mb: 3 }}>
              <Chip
                label={`Error ID: ${this.state.errorId}`}
                variant="outlined"
                size="small"
                icon={<BugReport />}
              />
            </Box>

            {/* Action Buttons */}
            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 3 }}>
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={this.handleRetry}
              >
                Try Again
              </Button>
              <Button
                variant="outlined"
                startIcon={<Home />}
                onClick={this.handleGoHome}
              >
                Go Home
              </Button>
              <Button
                variant="outlined"
                onClick={this.handleReload}
              >
                Reload Page
              </Button>
            </Stack>

            {/* Error Details (Expandable) */}
            {(this.state.error || this.state.errorInfo) && (
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  aria-controls="error-details-content"
                  id="error-details-header"
                >
                  <Typography variant="subtitle2">
                    <Warning sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Technical Details
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ textAlign: 'left' }}>
                    {/* Copy Button */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                      <Tooltip title="Copy error details">
                        <IconButton size="small" onClick={this.copyErrorDetails}>
                          <ContentCopy />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    {/* Error Message */}
                    {this.state.error && (
                      <Alert severity="error" sx={{ mb: 2 }}>
                        <AlertTitle>Error Message</AlertTitle>
                        <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                          {this.state.error.message}
                        </Typography>
                      </Alert>
                    )}

                    {/* Stack Trace */}
                    {this.state.error?.stack && (
                      <Alert severity="warning" sx={{ mb: 2 }}>
                        <AlertTitle>Stack Trace</AlertTitle>
                        <Typography 
                          variant="body2" 
                          component="pre" 
                          sx={{ 
                            whiteSpace: 'pre-wrap',
                            fontSize: '0.75rem',
                            maxHeight: 200,
                            overflow: 'auto'
                          }}
                        >
                          {this.state.error.stack}
                        </Typography>
                      </Alert>
                    )}

                    {/* Component Stack */}
                    {this.state.errorInfo?.componentStack && (
                      <Alert severity="info">
                        <AlertTitle>Component Stack</AlertTitle>
                        <Typography 
                          variant="body2" 
                          component="pre" 
                          sx={{ 
                            whiteSpace: 'pre-wrap',
                            fontSize: '0.75rem',
                            maxHeight: 200,
                            overflow: 'auto'
                          }}
                        >
                          {this.state.errorInfo.componentStack}
                        </Typography>
                      </Alert>
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>
            )}

            {/* Help Text */}
            <Typography variant="caption" color="textSecondary" sx={{ mt: 2, display: 'block' }}>
              If this problem persists, please contact support with the Error ID above.
            </Typography>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easier usage
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

// Hook for error reporting in functional components
export const useErrorHandler = () => {
  const reportError = (error: Error, context?: string) => {
    console.error(`Error in ${context || 'component'}:`, error);
    
    // You can integrate with error reporting service here
    const errorReport = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };
    
    console.log('Error Report:', errorReport);
  };

  return { reportError };
};
