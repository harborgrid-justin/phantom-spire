'use client';

import React, { ErrorInfo, ReactNode } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  AlertTitle,
  Collapse,
  IconButton,
  Stack,
  Chip,
  Divider
} from '@mui/material';
import {
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  BugReport as BugReportIcon,
  Home as HomeIcon,
  Support as SupportIcon
} from '@mui/icons-material';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId: string;
  showDetails: boolean;
  retryCount: number;
}

interface EnterpriseErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  maxRetries?: number;
  logError?: boolean;
}

/**
 * Enterprise-grade Error Boundary with comprehensive error handling,
 * logging, recovery options, and user-friendly error reporting
 */
export class EnterpriseErrorBoundary extends React.Component<
  EnterpriseErrorBoundaryProps,
  ErrorBoundaryState
> {
  private retryTimeouts: NodeJS.Timeout[] = [];

  constructor(props: EnterpriseErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      errorId: '',
      showDetails: false,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId,
      showDetails: false
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, logError = true } = this.props;
    
    this.setState({ errorInfo });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('EnterpriseErrorBoundary caught an error:', error, errorInfo);
    }

    // Send error to logging service in production
    if (logError && process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo);
    }

    // Call custom error handler
    if (onError) {
      onError(error, errorInfo);
    }

    // Auto-retry mechanism for transient errors
    this.scheduleAutoRetry(error);
  }

  private logErrorToService = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      const errorData = {
        errorId: this.state.errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: 'current-user-id', // Replace with actual user ID
        sessionId: 'current-session-id' // Replace with actual session ID
      };

      await fetch('/api/error-reporting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(errorData)
      });
    } catch (loggingError) {
      console.error('Failed to log error to service:', loggingError);
    }
  };

  private scheduleAutoRetry = (error: Error) => {
    const { maxRetries = 3 } = this.props;
    const { retryCount } = this.state;

    // Only auto-retry for specific error types
    const retryableErrors = [
      'ChunkLoadError',
      'NetworkError',
      'TimeoutError'
    ];

    const isRetryable = retryableErrors.some(type => 
      error.name.includes(type) || error.message.includes(type)
    );

    if (isRetryable && retryCount < maxRetries) {
      const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Exponential backoff
      
      const timeout = setTimeout(() => {
        this.handleRetry();
      }, retryDelay);

      this.retryTimeouts.push(timeout);
    }
  };

  private handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: prevState.retryCount + 1,
      showDetails: false
    }));
  };

  private handleManualRetry = () => {
    // Clear any scheduled auto-retries
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout));
    this.retryTimeouts = [];
    
    this.handleRetry();
  };

  private toggleDetails = () => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails
    }));
  };

  private handleReportBug = () => {
    const { error, errorInfo, errorId } = this.state;
    const bugReportData = {
      errorId,
      error: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };

    // Open bug report system or email client
    const subject = encodeURIComponent(`Bug Report: ${errorId}`);
    const body = encodeURIComponent(`Error Details:\n${JSON.stringify(bugReportData, null, 2)}`);
    window.open(`mailto:support@phantom-spire.com?subject=${subject}&body=${body}`);
  };

  componentWillUnmount() {
    // Clean up timeouts
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout));
  }

  render() {
    if (this.state.hasError) {
      const { fallback, maxRetries = 3 } = this.props;
      const { error, errorInfo, errorId, showDetails, retryCount } = this.state;

      if (fallback) {
        return fallback;
      }

      return (
        <Box p={3} display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <Paper 
            elevation={3} 
            sx={{ 
              maxWidth: 600, 
              width: '100%',
              p: 3,
              backgroundColor: '#fafafa'
            }}
          >
            <Stack spacing={3}>
              {/* Header */}
              <Box display="flex" alignItems="center" gap={2}>
                <ErrorIcon color="error" sx={{ fontSize: 48 }} />
                <Box>
                  <Typography variant="h5" color="error" gutterBottom>
                    Something Went Wrong
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Error ID: {errorId}
                  </Typography>
                </Box>
              </Box>

              {/* Error Summary */}
              <Alert severity="error">
                <AlertTitle>Application Error</AlertTitle>
                {error?.message || 'An unexpected error occurred in the application.'}
              </Alert>

              {/* Retry Information */}
              {retryCount > 0 && (
                <Alert severity="warning">
                  <AlertTitle>Retry Attempts</AlertTitle>
                  Attempted {retryCount} of {maxRetries} automatic retries.
                </Alert>
              )}

              {/* Action Buttons */}
              <Stack direction="row" spacing={2} justifyContent="center">
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<RefreshIcon />}
                  onClick={this.handleManualRetry}
                >
                  Try Again
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<HomeIcon />}
                  onClick={() => window.location.href = '/'}
                >
                  Go Home
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<BugReportIcon />}
                  onClick={this.handleReportBug}
                >
                  Report Bug
                </Button>
              </Stack>

              <Divider />

              {/* Technical Details Toggle */}
              <Box>
                <Button
                  startIcon={showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  onClick={this.toggleDetails}
                  size="small"
                  color="inherit"
                >
                  {showDetails ? 'Hide' : 'Show'} Technical Details
                </Button>

                <Collapse in={showDetails}>
                  <Box mt={2}>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="subtitle2" color="textSecondary">
                          Error Type:
                        </Typography>
                        <Chip
                          label={error?.name || 'Unknown'}
                          color="error"
                          variant="outlined"
                          size="small"
                        />
                      </Box>

                      <Box>
                        <Typography variant="subtitle2" color="textSecondary">
                          Error Message:
                        </Typography>
                        <Typography 
                          variant="body2" 
                          component="pre" 
                          sx={{ 
                            backgroundColor: '#f5f5f5',
                            p: 1,
                            borderRadius: 1,
                            fontSize: '0.8rem',
                            maxHeight: 100,
                            overflow: 'auto'
                          }}
                        >
                          {error?.message}
                        </Typography>
                      </Box>

                      {error?.stack && (
                        <Box>
                          <Typography variant="subtitle2" color="textSecondary">
                            Stack Trace:
                          </Typography>
                          <Typography 
                            variant="body2" 
                            component="pre" 
                            sx={{ 
                              backgroundColor: '#f5f5f5',
                              p: 1,
                              borderRadius: 1,
                              fontSize: '0.7rem',
                              maxHeight: 200,
                              overflow: 'auto'
                            }}
                          >
                            {error.stack}
                          </Typography>
                        </Box>
                      )}

                      {errorInfo?.componentStack && (
                        <Box>
                          <Typography variant="subtitle2" color="textSecondary">
                            Component Stack:
                          </Typography>
                          <Typography 
                            variant="body2" 
                            component="pre" 
                            sx={{ 
                              backgroundColor: '#f5f5f5',
                              p: 1,
                              borderRadius: 1,
                              fontSize: '0.7rem',
                              maxHeight: 200,
                              overflow: 'auto'
                            }}
                          >
                            {errorInfo.componentStack}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </Box>
                </Collapse>
              </Box>

              {/* Support Information */}
              <Alert severity="info">
                <AlertTitle>Need Help?</AlertTitle>
                <Typography variant="body2">
                  If this problem persists, please contact our support team at{' '}
                  <strong>support@phantom-spire.com</strong> and include the Error ID above.
                </Typography>
              </Alert>
            </Stack>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default EnterpriseErrorBoundary;