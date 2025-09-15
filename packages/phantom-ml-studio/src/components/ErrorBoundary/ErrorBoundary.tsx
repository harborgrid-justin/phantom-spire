import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Alert, Stack } from '@mui/material';
import { RefreshRounded, BugReportRounded } from '@mui/icons-material';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true,
      error 
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI or use the provided one
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="60vh"
          padding={3}
          textAlign="center"
        >
          <Stack spacing={3} alignItems="center" maxWidth="600px">
            <BugReportRounded sx={{ fontSize: 64, color: 'error.main' }} />
            
            <Typography variant="h4" color="error" gutterBottom>
              Something went wrong
            </Typography>
            
            <Alert severity="error" sx={{ width: '100%' }}>
              <Typography variant="body1">
                The application encountered an unexpected error. This might be due to:
              </Typography>
              <ul style={{ textAlign: 'left', marginTop: '8px' }}>
                <li>React component loading issues</li>
                <li>Hook call violations</li>
                <li>Network connectivity problems</li>
                <li>Browser compatibility issues</li>
              </ul>
            </Alert>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Alert severity="warning" sx={{ width: '100%' }}>
                <Typography variant="body2" component="pre" sx={{ 
                  fontSize: '0.8rem',
                  maxHeight: '200px',
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap'
                }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </Typography>
              </Alert>
            )}

            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={this.handleReset}
                startIcon={<RefreshRounded />}
              >
                Try Again
              </Button>
              
              <Button
                variant="outlined"
                color="primary"
                onClick={this.handleReload}
                startIcon={<RefreshRounded />}
              >
                Reload Page
              </Button>
            </Stack>

            <Typography variant="body2" color="text.secondary">
              If this problem persists, try clearing your browser cache or contact support.
            </Typography>
          </Stack>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
