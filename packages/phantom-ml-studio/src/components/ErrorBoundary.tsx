'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertTitle, Button, Card, CardContent, Typography, Box, Collapse, IconButton, Stack } from '@mui/material';
import { ExpandMore as ExpandMoreIcon, Refresh as RefreshIcon, Home as HomeIcon, BugReport as BugReportIcon } from '@mui/icons-material';
import { performanceMonitor } from '@/lib/performance-monitor';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
  showDetails: boolean;
  isRecovering: boolean;
  recoveryAttempts: number;
  errorHistory: Array<{
    error: Error;
    errorInfo: ErrorInfo;
    timestamp: Date;
  }>;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  enableAutoRecovery?: boolean;
  maxRecoveryAttempts?: number;
  recoveryDelay?: number;
  showErrorDetails?: boolean;
  componentName?: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null;
  private errorReportedAt: number = 0;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
      showDetails: false,
      isRecovering: false,
      recoveryAttempts: 0,
      errorHistory: [],
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { onError, componentName = 'Unknown' } = this.props;

    // Track error in performance monitor
    performanceMonitor.addMetric({
      name: `Error:${componentName}`,
      value: 1,
      unit: 'count',
      timestamp: Date.now(),
      category: 'custom',
      metadata: {
        type: 'error-boundary',
        component: componentName,
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      },
    });

    // Update state with error details
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1,
      errorHistory: [
        ...prevState.errorHistory.slice(-4), // Keep last 5 errors
        { error, errorInfo, timestamp: new Date() },
      ],
    }));

    // Call custom error handler
    if (onError) {
      onError(error, errorInfo);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by ErrorBoundary:', error, errorInfo);
    }

    // Report to error tracking service
    this.reportError(error, errorInfo);

    // Attempt auto-recovery if enabled
    if (this.props.enableAutoRecovery) {
      this.attemptRecovery();
    }
  }

  componentWillUnmount(): void {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  private reportError(error: Error, errorInfo: ErrorInfo): void {
    const now = Date.now();

    // Prevent error spam (report once per minute max)
    if (now - this.errorReportedAt < 60000) {
      return;
    }

    this.errorReportedAt = now;

    // Send to error reporting service
    if (process.env.NEXT_PUBLIC_ERROR_REPORTING_ENDPOINT) {
      fetch(process.env.NEXT_PUBLIC_ERROR_REPORTING_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          componentName: this.props.componentName,
          url: typeof window !== 'undefined' ? window.location.href : 'server',
          userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server',
          timestamp: new Date().toISOString(),
          errorCount: this.state.errorCount,
          recoveryAttempts: this.state.recoveryAttempts,
        }),
      }).catch(err => {
        console.error('Failed to report error:', err);
      });
    }
  }

  private attemptRecovery = (): void => {
    const { maxRecoveryAttempts = 3, recoveryDelay = 2000 } = this.props;

    if (this.state.recoveryAttempts >= maxRecoveryAttempts) {
      console.warn('Max recovery attempts reached');
      return;
    }

    this.setState({ isRecovering: true });

    this.retryTimeoutId = setTimeout(() => {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        isRecovering: false,
        recoveryAttempts: prevState.recoveryAttempts + 1,
      }));
    }, recoveryDelay);
  };

  private handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
      showDetails: false,
      isRecovering: false,
      recoveryAttempts: 0,
      errorHistory: [],
    });
  };

  private handleReload = (): void => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  private handleGoHome = (): void => {
    if (typeof window !== 'undefined') {
      window.location.href = '/dashboard';
    }
  };

  private toggleDetails = (): void => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails,
    }));
  };

  private renderErrorDetails(): ReactNode {
    const { error, errorInfo, errorHistory } = this.state;
    const { showErrorDetails = true } = this.props;

    if (!showErrorDetails || !error || !errorInfo) {
      return null;
    }

    return (
      <Collapse in={this.state.showDetails}>
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Error Details
          </Typography>

          <Card variant="outlined" sx={{ mb: 2, bgcolor: 'grey.50' }}>
            <CardContent>
              <Typography variant="subtitle2" color="error" gutterBottom>
                Error Message:
              </Typography>
              <Typography
                variant="body2"
                component="pre"
                sx={{
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {error.message}
              </Typography>
            </CardContent>
          </Card>

          {process.env.NODE_ENV === 'development' && (
            <>
              <Card variant="outlined" sx={{ mb: 2, bgcolor: 'grey.50' }}>
                <CardContent>
                  <Typography variant="subtitle2" color="error" gutterBottom>
                    Stack Trace:
                  </Typography>
                  <Typography
                    variant="body2"
                    component="pre"
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      maxHeight: 200,
                      overflow: 'auto',
                    }}
                  >
                    {error.stack}
                  </Typography>
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ bgcolor: 'grey.50' }}>
                <CardContent>
                  <Typography variant="subtitle2" color="error" gutterBottom>
                    Component Stack:
                  </Typography>
                  <Typography
                    variant="body2"
                    component="pre"
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      maxHeight: 200,
                      overflow: 'auto',
                    }}
                  >
                    {errorInfo.componentStack}
                  </Typography>
                </CardContent>
              </Card>
            </>
          )}

          {errorHistory.length > 1 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Error History ({errorHistory.length} errors)
              </Typography>
              {errorHistory.map((item, index) => (
                <Typography key={index} variant="caption" display="block">
                  {item.timestamp.toLocaleTimeString()}: {item.error.message}
                </Typography>
              ))}
            </Box>
          )}
        </Box>
      </Collapse>
    );
  }

  render(): ReactNode {
    const { hasError, error, isRecovering, errorCount, recoveryAttempts } = this.state;
    const { children, fallback, showErrorDetails = true, maxRecoveryAttempts = 3 } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            p: 3,
          }}
        >
          <Alert
            severity="error"
            sx={{
              width: '100%',
              maxWidth: 600,
              '& .MuiAlert-message': {
                width: '100%',
              },
            }}
            action={
              showErrorDetails && (
                <IconButton
                  aria-label="toggle details"
                  onClick={this.toggleDetails}
                  size="small"
                >
                  <ExpandMoreIcon
                    sx={{
                      transform: this.state.showDetails ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                    }}
                  />
                </IconButton>
              )
            }
          >
            <AlertTitle>Something went wrong</AlertTitle>
            <Typography variant="body2" gutterBottom>
              {isRecovering
                ? 'Attempting to recover...'
                : error?.message || 'An unexpected error occurred'}
            </Typography>

            {errorCount > 1 && (
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                This error has occurred {errorCount} times
              </Typography>
            )}

            {recoveryAttempts > 0 && (
              <Typography variant="caption" display="block">
                Recovery attempts: {recoveryAttempts}/{maxRecoveryAttempts}
              </Typography>
            )}

            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Button
                size="small"
                startIcon={<RefreshIcon />}
                onClick={this.handleReset}
                disabled={isRecovering}
              >
                Try Again
              </Button>
              <Button
                size="small"
                startIcon={<RefreshIcon />}
                onClick={this.handleReload}
                disabled={isRecovering}
              >
                Reload Page
              </Button>
              <Button
                size="small"
                startIcon={<HomeIcon />}
                onClick={this.handleGoHome}
                disabled={isRecovering}
              >
                Go Home
              </Button>
              {process.env.NODE_ENV === 'development' && (
                <Button
                  size="small"
                  startIcon={<BugReportIcon />}
                  href={`https://github.com/your-org/your-repo/issues/new?title=${encodeURIComponent(
                    error?.message || 'Unknown error'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Report
                </Button>
              )}
            </Stack>
          </Alert>

          {this.renderErrorDetails()}
        </Box>
      );
    }

    return children;
  }
}

// Async error boundary for handling async errors
export function AsyncErrorBoundary({
  children,
  ...props
}: ErrorBoundaryProps) {
  return (
    <ErrorBoundary {...props} enableAutoRecovery={true} maxRecoveryAttempts={3}>
      {children}
    </ErrorBoundary>
  );
}

// Page-level error boundary with enhanced recovery
export function PageErrorBoundary({
  children,
  pageName,
  ...props
}: ErrorBoundaryProps & { pageName: string }) {
  return (
    <ErrorBoundary
      componentName={`Page:${pageName}`}
      showErrorDetails={process.env.NODE_ENV === 'development'}
      enableAutoRecovery={true}
      maxRecoveryAttempts={2}
      recoveryDelay={3000}
      {...props}
    >
      {children}
    </ErrorBoundary>
  );
}

// Component-level error boundary with minimal UI
export function ComponentErrorBoundary({
  children,
  componentName,
  fallback,
  ...props
}: ErrorBoundaryProps) {
  return (
    <ErrorBoundary
      componentName={componentName}
      fallback={
        fallback || (
          <Alert severity="warning" sx={{ m: 2 }}>
            <AlertTitle>Component Error</AlertTitle>
            This component encountered an error and couldn't be displayed.
          </Alert>
        )
      }
      showErrorDetails={false}
      enableAutoRecovery={true}
      maxRecoveryAttempts={1}
      {...props}
    >
      {children}
    </ErrorBoundary>
  );
}